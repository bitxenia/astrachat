import { rm } from "fs/promises";
import { executeMetric } from "./utils/sendMessage";

const FIVE_MINUTES_TIMEOUT = 1000 * 60 * 5;
const FIVE_HOUR_TIMEOUT = 1000 * 60 * 60 * 5;

describe("Chat with many messages", () => {
  beforeEach(
    async () => await rm("./data", { recursive: true, force: true }),
    FIVE_MINUTES_TIMEOUT,
  );

  test(
    "measure time for sending messages (short)",
    async () => {
      await executeMetric("short");
    },
    FIVE_HOUR_TIMEOUT,
  );
});
