import { saveMetrics, sleep } from "./metrics";
import { getNode } from "./node";
import { Length, getMessage } from "./message";

const NUMBER_OF_MESSAGES = 1000;
const SAMPLE_SIZE = 1000;
const CHAT_NAME = "test";

export async function executeMetric(length: Length) {
  const collaborator = await getNode("collaborator", 40001, true);
  collaborator.createChat(CHAT_NAME);
  const collaboratorAddresses = await collaborator.getNodeMultiaddrs();
  const user1 = await getNode("user1", 40002, false, collaboratorAddresses);

  const message = getMessage(length);
  const metricsFilename = `measure_time_to_send_message_${length}`;

  let i = 0;
  while (i < NUMBER_OF_MESSAGES) {
    try {
      await collaborator.sendMessage(CHAT_NAME, message);
      i++;
    } catch (error) {
      console.error(error);
      await sleep(10000);
    }
  }

  const durations: number[] = [];
  i = 0;
  while (i < SAMPLE_SIZE) {
    try {
      const start = performance.now();
      await user1.sendMessage(CHAT_NAME, message);
      const end = performance.now();
      const duration = end - start;
      durations.push(duration);
      console.log(`👌 Message ${i} sent. Duration: ${duration}`);
      i++;
    } catch (error) {
      console.error(error);
      await sleep(10000);
    }
  }
  saveMetrics(durations, metricsFilename);
}
