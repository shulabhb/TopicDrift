export function normalizeTranscriptText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export function createSegmentId(counter: number, timestamp: number): string {
  return `seg-${timestamp}-${counter}`;
}
