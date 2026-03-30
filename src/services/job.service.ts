import { JobStatus, Prisma } from "@prisma/client";
import { prisma } from "../db";
import { jobQueue } from "../queue";
import { CreateJobInput } from "../schemas/job";

export async function createJob(input: CreateJobInput) {
  const job = await prisma.job.create({
    data: {
      taskType: input.taskType,
      payload: input.payload as Prisma.InputJsonValue,
      priority: input.priority,
    },
  });

  await jobQueue.add(job.taskType, { jobId: job.id }, { priority: 10 - job.priority });

  return job;
}

export async function getJobById(id: string) {
  return prisma.job.findUnique({ where: { id } });
}

export async function listJobs(params: {
  status?: JobStatus;
  page: number;
  limit: number;
}) {
  const where = params.status ? { status: params.status } : {};
  const skip = (params.page - 1) * params.limit;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      skip,
      take: params.limit,
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page: params.page, limit: params.limit };
}

export async function cancelJob(id: string) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return null;
  if (job.status !== "pending") {
    throw new Error(`Cannot cancel job with status: ${job.status}`);
  }

  return prisma.job.update({
    where: { id },
    data: { status: "cancelled", completedAt: new Date() },
  });
}
