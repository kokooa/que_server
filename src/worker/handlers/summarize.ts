export async function handleSummarize(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const text = String(payload.text || "");
  const maxLength = Number(payload.maxLength || 100);

  // Simulate AI processing time
  const delay = 2000 + Math.random() * 3000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Mock: extract first sentences up to maxLength
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let summary = "";
  for (const sentence of sentences) {
    if (summary.length + sentence.length > maxLength) break;
    summary += sentence;
  }

  return {
    summary: summary || text.slice(0, maxLength),
    originalLength: text.length,
    summaryLength: summary.length,
    processingTimeMs: Math.round(delay),
  };
}
