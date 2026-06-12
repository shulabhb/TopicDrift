import type { DriftResult, DriftStatus } from '@/src/types/drift';

export interface DriftStateMachineInput {
  previousStatus: DriftStatus;
  score: number;
  lowScoreDurationSeconds: number;
  sustainedThresholdSeconds: number;
}

/**
 * Determines sustained drift from rolling scores rather than isolated dips.
 *
 * TODO: Integrate with rolling transcript window in a future task.
 */
export function transitionDriftStatus(input: DriftStateMachineInput): DriftStatus {
  const { previousStatus, score, lowScoreDurationSeconds, sustainedThresholdSeconds } =
    input;

  if (previousStatus === 'paused') {
    return 'paused';
  }

  if (score >= 0.7) {
    return 'aligned';
  }

  if (lowScoreDurationSeconds >= sustainedThresholdSeconds) {
    return 'sustained-drift';
  }

  if (lowScoreDurationSeconds > 0) {
    return score < 0.4 ? 'possible-drift' : 'diverging';
  }

  return previousStatus === 'initializing' ? 'initializing' : 'aligned';
}

export function createNeutralDriftResult(): DriftResult {
  return {
    status: 'initializing',
    score: 1,
    confidence: 0,
    durationSeconds: 0,
    objectiveTerms: [],
    recentTopicTerms: [],
    explanation: 'Awaiting transcript input.',
  };
}
