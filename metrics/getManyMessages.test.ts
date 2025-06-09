import { saveMetrics, sleep } from "./utils/metrics";
import { rm } from "fs/promises";
import { randomUUID } from "crypto";
import { getNode } from "./utils/node";
import { appendFileSync, writeFileSync } from "fs";

const FIVE_MINUTES_TIMEOUT = 1000 * 60 * 5;
const FIVE_HOUR_TIMEOUT = 1000 * 60 * 60 * 5;

const NUMBER_OF_MESSAGES = 1000;
const CHAT_NAME = "test";
const METRICS_FILENAME = `get${NUMBER_OF_MESSAGES}MessagesIncreasingly`;

describe(`${METRICS_FILENAME}`, () => {
  beforeAll(
    async () => await rm("./data", { recursive: true, force: true }),
    FIVE_MINUTES_TIMEOUT,
  );

  test(
    `measure time for getting many messages`,
    async () => {
      const collaborator = await getNode("collaborator", 40001, true);
      collaborator.createChat(CHAT_NAME);
      const collaboratorAddresses = await collaborator.getNodeMultiaddrs();
      let user1 = await getNode("user1", 40002, false, collaboratorAddresses);
      user1.sendMessage(CHAT_NAME, "test");

      let i = 1;
      let errorInSend = false;
      let errorInGet = false;
      const durations: number[] = [];
      while (i <= NUMBER_OF_MESSAGES) {
        const message = `📧 ${i} ${randomUUID()}`;
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
        await sleep(1000);
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
          await sleep(10000);
        }
      }

      saveMetrics(durations, METRICS_FILENAME);
    },
    FIVE_HOUR_TIMEOUT,
  );
});
