import { TaskType } from "@prisma/client";
import { handleSummarize } from "./summarize";
import { handleTranslate } from "./translate";
import { handleImageGenerate } from "./image-gen";

type Handler = (payload: Record<string, unknown>) => Promise<Record<string, unknown>>;

export const handlers: Record<TaskType, Handler> = {
  summarize: handleSummarize,
  translate: handleTranslate,
  image_generate: handleImageGenerate,
};
