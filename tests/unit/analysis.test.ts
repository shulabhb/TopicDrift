import { describe, expect, it } from 'vitest';
import { normalizeText, tokenize } from '@/src/analysis/text-normalizer';
import { computeSimilarity } from '@/src/analysis/similarity';
import { transitionDriftStatus } from '@/src/analysis/drift-state-machine';

describe('analysis foundation', () => {
  it('normalizes caption-like text', () => {
    expect(normalizeText('  Hello, Team! ')).toBe('hello team');
    expect(tokenize('Planning the Q2 roadmap now')).toContain('planning');
  });

  it('computes overlap similarity', () => {
    const score = computeSimilarity(['roadmap', 'budget'], ['roadmap', 'staffing']);
    expect(score).toBeCloseTo(0.5);
  });

  it('requires sustained low scores before sustained drift', () => {
    expect(
      transitionDriftStatus({
        previousStatus: 'aligned',
        score: 0.2,
        lowScoreDurationSeconds: 10,
        sustainedThresholdSeconds: 45,
      }),
    ).toBe('possible-drift');

    expect(
      transitionDriftStatus({
        previousStatus: 'possible-drift',
        score: 0.1,
        lowScoreDurationSeconds: 60,
        sustainedThresholdSeconds: 45,
      }),
    ).toBe('sustained-drift');
  });
});
