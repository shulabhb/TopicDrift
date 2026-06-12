import { tokenize } from './text-normalizer';

export interface TfIdfDocument {
  id: string;
  tokens: string[];
}

/**
 * Lightweight TF-IDF utilities for local drift scoring.
 *
 * TODO: Expand with inverse document frequency across rolling windows.
 */
export function buildDocument(text: string, id: string): TfIdfDocument {
  return {
    id,
    tokens: tokenize(text),
  };
}

export function termFrequency(tokens: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return counts;
}
