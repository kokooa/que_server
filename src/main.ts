import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import { prisma } from "./db";
import { swaggerSpec } from "./swagger";
import jobsRouter from "./routes/jobs";
import healthRouter from "./routes/health";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/health", healthRouter);
app.use("/api/v1/jobs", jobsRouter);

app.listen(config.port, () => {
  console.log(`API server running on port ${config.port}`);
  console.log(`Swagger UI: http://localhost:${config.port}/docs`);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
