import { Router, Request, Response } from "express";
import { createJobSchema, jobListQuerySchema } from "../schemas/job";
import * as jobService from "../services/job.service";

const router = Router();

/**
 * @swagger
 * /api/v1/jobs:
 *   post:
 *     summary: 새 작업 생성
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJob'
 *           examples:
 *             summarize:
 *               summary: 텍스트 요약
 *               value:
 *                 taskType: summarize
 *                 payload: { text: "AI is transforming how we work and live. Machine learning models can now understand natural language.", maxLength: 50 }
 *                 priority: 8
 *             translate:
 *               summary: 번역
 *               value:
 *                 taskType: translate
 *                 payload: { text: "Hello, how are you?", targetLang: "ko" }
 *                 priority: 5
 *             image_generate:
 *               summary: 이미지 생성
 *               value:
 *                 taskType: image_generate
 *                 payload: { prompt: "A sunset over mountains", width: 512, height: 512 }
 *                 priority: 3
 *     responses:
 *       202:
 *         description: 작업이 큐에 등록됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: 유효성 검증 실패
 */
router.post("/", async (req: Request, res: Response) => {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const job = await jobService.createJob(parsed.data);
  res.status(202).json(job);
});

/**
 * @swagger
 * /api/v1/jobs:
 *   get:
 *     summary: 작업 목록 조회
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled]
 *         description: 상태 필터
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 작업 목록
 */
router.get("/", async (req: Request, res: Response) => {
  const parsed = jobListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
    return;
  }

  const result = await jobService.listJobs(parsed.data);
  res.json(result);
});

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   get:
 *     summary: 작업 상태/결과 조회
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 작업 상세
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: 작업 없음
 */
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const job = await jobService.getJobById(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(job);
});

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   delete:
 *     summary: 작업 취소 (pending 상태만)
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 취소됨
 *       404:
 *         description: 작업 없음
 *       409:
 *         description: 취소 불가 (이미 처리 중/완료)
 */
router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const job = await jobService.cancelJob(req.params.id);
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(job);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(409).json({ error: message });
  }
});

export default router;
