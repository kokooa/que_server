import { z } from "zod";

export const TaskType = z.enum(["summarize", "translate", "image_generate"]);
export type TaskType = z.infer<typeof TaskType>;

export const createJobSchema = z.object({
  taskType: TaskType,
  payload: z.record(z.unknown()),
  priority: z.number().int().min(1).max(10).default(5),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const jobListQuerySchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed", "cancelled"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type JobListQuery = z.infer<typeof jobListQuerySchema>;
