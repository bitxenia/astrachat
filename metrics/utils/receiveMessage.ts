import { getMessage, Length } from "./message";
import { saveMetrics, sleep } from "./metrics";
import { getNode } from "./node";

const NUMBER_OF_MESSAGES = 500;
const CHAT_NAME = "test";

export async function executeMetrics(length: Length) {
  const collaborator = await getNode("collaborator", 40001, true);
  collaborator.createChat(CHAT_NAME);
  const collaboratorAddresses = await collaborator.getNodeMultiaddrs();
  const user1 = await getNode("user1", 40002, false, collaboratorAddresses);

  const starts: Map<number, number> = new Map();
  const ends: Map<number, number> = new Map();

  const messageResolves: Map<number, () => void> = new Map();
  const messagePromises: Map<number, Promise<void>> = new Map();

  await user1.getMessages(CHAT_NAME, (message) => {
    const end = performance.now();
    const id = parseInt(message.message.split(" ")[0], 10);
    ends.set(id, end);
    console.log(`✅ Message ${id} received.`);

    const resolve = messageResolves.get(id);
    if (resolve) {
      resolve();
      messageResolves.delete(id);
    }
  });

  const message = getMessage(length);
  const metricsFilename = `measure_time_between_send_and_recv_message_${length}`;

  let i = 0;
  while (i < NUMBER_OF_MESSAGES) {
    try {
      const messagePromise = new Promise<void>((resolve) => {
        messageResolves.set(i, resolve);
      });
      messagePromises.set(i, messagePromise);
      const start = performance.now();
      await collaborator.sendMessage(CHAT_NAME, `${i} ${message}`);
      starts.set(i, start);
      console.log(`👌 Message ${i} sent.`);
      await messagePromise;
      i++;
    } catch (error) {
      console.error(error);
      await sleep(10000);
    }
  }

  const durations: number[] = [];
  for (let i = 0; i < NUMBER_OF_MESSAGES; i++) {
    const duration = ends.get(i)! - starts.get(i)!;
    durations.push(duration);
  }

  saveMetrics(durations, metricsFilename);
}
