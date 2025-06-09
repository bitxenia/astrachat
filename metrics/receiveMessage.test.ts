import { saveMetrics, sleep } from "./utils/metrics";
import { rm } from "fs/promises";
import { randomUUID } from "crypto";
import { getNode } from "./utils/node";
import { appendFileSync, writeFileSync } from "fs";

const FIVE_MINUTES_TIMEOUT = 1000 * 60 * 5;
const FIVE_HOUR_TIMEOUT = 1000 * 60 * 60 * 5;

const NUMBER_OF_MESSAGES = 1000;
const CHAT_NAME = "test";
const METRICS_FILENAME = `sendAndReceive${NUMBER_OF_MESSAGES}Messages`;

const NEW_ERROR_LOG_FILENAME = "./metrics-new.log";
const GET_ERROR_LOG_FILENAME = "./metrics-get.log";
writeFileSync(NEW_ERROR_LOG_FILENAME, "");
writeFileSync(GET_ERROR_LOG_FILENAME, "");

describe(`${METRICS_FILENAME}`, () => {
  beforeAll(
    async () => await rm("./data", { recursive: true, force: true }),
    FIVE_MINUTES_TIMEOUT,
  );

  test(
    `measure time for getting ${NUMBER_OF_MESSAGES} messages`,
    async () => {
      const collaborator = await getNode("collaborator", 40001, true);
      collaborator.createChat(CHAT_NAME);
      const collaboratorAddresses = await collaborator.getNodeMultiaddrs();
      const user1 = await getNode("user1", 40002, false, collaboratorAddresses);

      const starts: Map<number, number> = new Map();
      const ends: Map<number, number> = new Map();

      await user1.getMessages(CHAT_NAME, (message) => {
        const end = performance.now();
        const id = parseInt(message.message.split(" ")[0], 10);
        ends.set(id, end);
        console.log(`👌 Message ${i} received.`);
      });
      let i = 0;
      while (i < NUMBER_OF_MESSAGES) {
        await sleep(2000);
        const message = `${i} ${randomUUID()}`;
        try {
          const start = performance.now();
          await collaborator.sendMessage(CHAT_NAME, message);
          starts.set(i, start);
          i++;
          console.log(`👌 Message ${i} sent.`);
        } catch (error) {
          console.error(error);
          appendFileSync(NEW_ERROR_LOG_FILENAME, JSON.stringify(error));
          await sleep(10000);
        }
      }

      while (ends.size < NUMBER_OF_MESSAGES) {
        await sleep(10000);
      }

      const durations: number[] = [];
      for (let i = 0; i < NUMBER_OF_MESSAGES; i++) {
        const duration = ends.get(i)! - starts.get(i)!;
        durations.push(duration);
      }

      saveMetrics(durations, METRICS_FILENAME);
    },
    FIVE_HOUR_TIMEOUT,
  );
});
