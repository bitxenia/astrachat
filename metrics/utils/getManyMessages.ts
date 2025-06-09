import { getMessage, Length } from "./message";
import { saveMetrics, sleep } from "./metrics";
import { getNode } from "./node";

const NUMBER_OF_MESSAGES = 1000;
const CHAT_NAME = "test";

export async function executeMetrics(length: Length) {
  const collaborator = await getNode(`collaborator_${length}`, 40001, true);
  collaborator.createChat(CHAT_NAME);
  const collaboratorAddresses = await collaborator.getNodeMultiaddrs();
  let user1 = await getNode(
    `user1_${length}`,
    40002,
    false,
    collaboratorAddresses,
  );
  user1.sendMessage(CHAT_NAME, "test");

  const message = getMessage(length);
  const metricsFilename = `measure_get_messages_with_many_messages_sent_${length}`;

  let i = 1;
  let errorInSend = false;
  let errorInGet = false;
  const durations: number[] = [];
  while (i <= NUMBER_OF_MESSAGES) {
    if (errorInGet) {
      errorInGet = false;
    } else {
      try {
        await collaborator.sendMessage(CHAT_NAME, message);
        errorInSend = false;
      } catch (error) {
        console.error(error);
        errorInSend = true;
      }
    }
    await sleep(2000);
    if (errorInSend) continue;
    try {
      const start = performance.now();
      const messages = await user1.getMessages(CHAT_NAME);
      const end = performance.now();
      const duration = end - start;
      expect(messages.length).toEqual(i + 2);
      durations.push(duration);
      console.log(`👌 Messages ${i} received. Amount: ${messages.length}`);
      i++;
    } catch (error) {
      console.error(error);
      errorInGet = true;
      await sleep(50000);
    }
  }

  saveMetrics(durations, metricsFilename);
}
