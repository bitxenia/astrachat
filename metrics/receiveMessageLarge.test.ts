import { rm } from "fs/promises";
import { executeMetrics } from "./utils/receiveMessage";

const FIVE_HOUR_TIMEOUT = 1000 * 60 * 60 * 5;

const METRICS_FILENAME = "measure_time_between_send_and_recv_message";

describe(`${METRICS_FILENAME}`, () => {
  beforeAll(
    async () => await rm("./data", { recursive: true, force: true }),
    FIVE_HOUR_TIMEOUT,
  );

  test(
    "measure time for sending and receiving messages (large)",
    async () => {
      await executeMetrics("large");
    },
    FIVE_HOUR_TIMEOUT,
  );
});
