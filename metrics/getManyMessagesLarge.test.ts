import { rm } from "fs/promises";
import { executeMetrics } from "./utils/getManyMessages";

const FIVE_HOUR_TIMEOUT = 1000 * 60 * 60 * 5;

describe("getManyMessagesLarge", () => {
  beforeEach(
    async () => await rm("./data", { recursive: true, force: true }),
    FIVE_HOUR_TIMEOUT,
  );

  test(
    "measure time for getting many messages (large)",
    async () => await executeMetrics("large"),
    FIVE_HOUR_TIMEOUT,
  );
});
