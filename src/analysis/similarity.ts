/**
 * Computes lexical similarity between objective and recent discussion terms.
 *
 * TODO: Replace placeholder with TF-IDF cosine similarity.
 */
export function computeSimilarity(
  objectiveTerms: readonly string[],
  recentTerms: readonly string[],
): number {
  if (objectiveTerms.length === 0 || recentTerms.length === 0) {
    return 0;
  }

  const objectiveSet = new Set(objectiveTerms.map((term) => term.toLowerCase()));
  const overlap = recentTerms.filter((term) => objectiveSet.has(term.toLowerCase()));

  return overlap.length / Math.max(objectiveTerms.length, 1);
}
