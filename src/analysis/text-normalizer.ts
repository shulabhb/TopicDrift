/**
 * Normalizes caption text for local analysis.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) {
    return [];
  }

  return normalized.split(' ').filter((token) => token.length > 2);
}
