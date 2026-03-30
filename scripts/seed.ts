import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const jobs = [
    {
      taskType: "summarize" as const,
      payload: {
        text: "Artificial intelligence is transforming how we work and live. Machine learning models can now understand natural language, generate images, and even write code. These advances are driven by improvements in computing power, data availability, and algorithmic innovation. Companies around the world are investing heavily in AI research and development.",
        maxLength: 100,
      },
      priority: 8,
    },
    {
      taskType: "translate" as const,
      payload: { text: "Hello, how are you today?", targetLang: "ko" },
      priority: 5,
    },
    {
      taskType: "image_generate" as const,
      payload: { prompt: "A sunset over mountains", width: 1024, height: 768 },
      priority: 3,
    },
    {
      taskType: "summarize" as const,
      payload: {
        text: "Redis is an open-source, in-memory data structure store used as a database, cache, message broker, and streaming engine. Redis provides data structures such as strings, hashes, lists, sets, and sorted sets with range queries.",
        maxLength: 80,
      },
      priority: 6,
    },
    {
      taskType: "translate" as const,
      payload: { text: "The quick brown fox jumps over the lazy dog.", targetLang: "ja" },
      priority: 7,
    },
  ];

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }

  console.log(`Seeded ${jobs.length} jobs`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
