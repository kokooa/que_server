export async function handleImageGenerate(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const prompt = String(payload.prompt || "");
  const width = Number(payload.width || 512);
  const height = Number(payload.height || 512);

  // Simulate AI processing time (image generation takes longer)
  const delay = 3000 + Math.random() * 5000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  return {
    imageUrl: `https://placehold.co/${width}x${height}/png?text=${encodeURIComponent(prompt.slice(0, 30))}`,
    prompt,
    width,
    height,
    processingTimeMs: Math.round(delay),
  };
}
