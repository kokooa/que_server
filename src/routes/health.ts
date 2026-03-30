import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { redisConnection } from "../queue";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: 헬스체크 (DB, Redis 상태)
 *     tags: [System]
 *     responses:
 *       200:
 *         description: 정상
 *       503:
 *         description: 일부 서비스 장애
 */
router.get("/", async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  try {
    const pong = await redisConnection.ping();
    checks.redis = pong === "PONG" ? "ok" : "error";
  } catch {
    checks.redis = "error";
  }

  const healthy = Object.values(checks).every((v) => v === "ok");
  res.status(healthy ? 200 : 503).json({ status: healthy ? "healthy" : "unhealthy", checks });
});

export default router;
