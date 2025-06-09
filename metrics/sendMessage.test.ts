import { saveMetrics, sleep } from "./utils/metrics";
import { rm } from "fs/promises";
import { randomUUID } from "crypto";
import { getNode } from "./utils/node";
import { appendFileSync, writeFileSync } from "fs";

const FIVE_MINUTES_TIMEOUT = 1000 * 60 * 5;
const FIVE_HOUR_TIMEOUT = 1000 * 60 * 60 * 5;

const NUMBER_OF_MESSAGES = 1000;
const SAMPLE_SIZE = 1000;
const CHAT_NAME = "test";
const METRICS_FILENAME = `send${SAMPLE_SIZE}MessagesOn${NUMBER_OF_MESSAGES}MessageChat`;

const NEW_ERROR_LOG_FILENAME = "./metrics-new.log";
const GET_ERROR_LOG_FILENAME = "./metrics-get.log";
writeFileSync(NEW_ERROR_LOG_FILENAME, "");
writeFileSync(GET_ERROR_LOG_FILENAME, "");

describe("Chat with many messages", () => {
  beforeEach(
    async () => await rm("./data", { recursive: true, force: true }),
    FIVE_MINUTES_TIMEOUT,
  );

  test(
    `measure time for sending messages in chat with ${NUMBER_OF_MESSAGES} messages`,
    async () => {
      const collaborator = await getNode("collaborator", 40001, true);
      collaborator.createChat(CHAT_NAME);
      const collaboratorAddresses = await collaborator.getNodeMultiaddrs();
      const user1 = await getNode("user1", 40002, false, collaboratorAddresses);

      let i = 0;
      while (i < NUMBER_OF_MESSAGES) {
        const message = `📧 ${i} ${randomUUID()}`;
        try {
          await collaborator.sendMessage(CHAT_NAME, message);
          i++;
        } catch (error) {
          console.error(error);
          appendFileSync(NEW_ERROR_LOG_FILENAME, JSON.stringify(error));
          await sleep(10000);
        }
      }

      const durations: number[] = [];
      i = 0;
      while (i < SAMPLE_SIZE) {
        const message = `📧🆕 ${i} ${randomUUID()}`;
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
          appendFileSync(NEW_ERROR_LOG_FILENAME, JSON.stringify(error));
          await sleep(10000);
        }
      }
      saveMetrics(durations, METRICS_FILENAME);
    },
    FIVE_HOUR_TIMEOUT,
  );
});
