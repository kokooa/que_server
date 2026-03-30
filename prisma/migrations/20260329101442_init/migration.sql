-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('summarize', 'translate', 'image_generate');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "task_type" "TaskType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "payload" JSONB NOT NULL,
    "result" JSONB,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_status_priority_created_at_idx" ON "jobs"("status", "priority" DESC, "created_at" ASC);
