import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Request Queue Server",
      version: "1.0.0",
      description: "비동기 AI 작업 처리 시스템 API",
    },
    servers: [{ url: "/" }],
    components: {
      schemas: {
        Job: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            taskType: { type: "string", enum: ["summarize", "translate", "image_generate"] },
            status: { type: "string", enum: ["pending", "processing", "completed", "failed", "cancelled"] },
            priority: { type: "integer", minimum: 1, maximum: 10 },
            payload: { type: "object" },
            result: { type: "object", nullable: true },
            errorMessage: { type: "string", nullable: true },
            retryCount: { type: "integer" },
            maxRetries: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            startedAt: { type: "string", format: "date-time", nullable: true },
            completedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        CreateJob: {
          type: "object",
          required: ["taskType", "payload"],
          properties: {
            taskType: {
              type: "string",
              enum: ["summarize", "translate", "image_generate"],
              description: "작업 유형",
            },
            payload: {
              type: "object",
              description: "작업별 입력 데이터",
            },
            priority: {
              type: "integer",
              minimum: 1,
              maximum: 10,
              default: 5,
              description: "우선순위 (1=낮음, 10=높음)",
            },
          },
        },
      },
    },
  },
  apis: [
    process.env.NODE_ENV === "production"
      ? "./dist/routes/*.js"
      : "./src/routes/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
