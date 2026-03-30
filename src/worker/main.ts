import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient, TaskType } from "@prisma/client";
import { config } from "../config";
import { handlers } from "./handlers";

const prisma = new PrismaClient();
const connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });

const worker = new Worker(
  "ai-jobs",
  async (bullJob: Job<{ jobId: string }>) => {
    const { jobId } = bullJob.data;
    const taskType = bullJob.name as TaskType;

    console.log(`[Worker] Processing job ${jobId} (${taskType})`);

    await prisma.job.update({
      where: { id: jobId },
      data: { status: "processing", startedAt: new Date() },
    });

    const dbJob = await prisma.job.findUnique({ where: { id: jobId } });
    if (!dbJob) throw new Error(`Job ${jobId} not found in database`);

    // 10% chance of simulated failure for retry demonstration
    if (Math.random() < 0.1) {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: "failed",
          errorMessage: "Simulated random failure for demonstration",
          retryCount: { increment: 1 },
        },
      });
      throw new Error("Simulated random failure");
    }

    const handler = handlers[taskType];
    const result = await handler(dbJob.payload as Record<string, unknown>);

    await prisma.job.update({
      where: { id: jobId },
      data: { status: "completed", result: result as any, completedAt: new Date() },
    });

    console.log(`[Worker] Completed job ${jobId}`);
  },
  { connection, concurrency: 5 }
);

worker.on("failed", async (job, err) => {
  if (!job) return;
  const { jobId } = job.data;
  console.error(`[Worker] Job ${jobId} failed: ${err.message}`);

  if (job.attemptsMade >= (job.opts.attempts || 3)) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorMessage: err.message,
        retryCount: job.attemptsMade,
      },
    });
  }
});

console.log("[Worker] Started and waiting for jobs...");

process.on("SIGTERM", async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
