import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config } from "./config";

export const redisConnection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

export const jobQueue = new Queue("ai-jobs", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
});
