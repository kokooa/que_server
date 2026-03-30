import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "8000", 10),
  databaseUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  nodeEnv: process.env.NODE_ENV || "development",
} as const;
