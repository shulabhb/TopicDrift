import type {
  DriftAnalysisInput,
  DriftEngineConfig,
  DriftResult,
} from '@/src/types/drift';
import type { SensitivityLevel } from '@/src/types/settings';

const DEFAULT_WINDOW_SECONDS = 120;
const DEFAULT_SUSTAINED_THRESHOLD_SECONDS = 45;

/**
 * Maps user sensitivity preference to engine parameters.
 */
export function createDriftEngineConfig(
  sensitivity: SensitivityLevel,
): DriftEngineConfig {
  switch (sensitivity) {
    case 'relaxed':
      return {
        sensitivity,
        windowSizeSeconds: DEFAULT_WINDOW_SECONDS,
        sustainedDriftThresholdSeconds: DEFAULT_SUSTAINED_THRESHOLD_SECONDS + 30,
      };
    case 'strict':
      return {
        sensitivity,
        windowSizeSeconds: DEFAULT_WINDOW_SECONDS - 30,
        sustainedDriftThresholdSeconds: DEFAULT_SUSTAINED_THRESHOLD_SECONDS - 15,
      };
    case 'balanced':
    default:
      return {
        sensitivity,
        windowSizeSeconds: DEFAULT_WINDOW_SECONDS,
        sustainedDriftThresholdSeconds: DEFAULT_SUSTAINED_THRESHOLD_SECONDS,
      };
  }
}

/**
 * Local drift analysis engine entry point.
 *
 * TODO: Implement TF-IDF similarity and sustained drift state machine.
 * This module must remain free of Chrome APIs and DOM dependencies.
 */
export function analyzeDrift(
  _input: DriftAnalysisInput,
  _config: DriftEngineConfig,
): DriftResult {
  return {
    status: 'initializing',
    score: 0,
    confidence: 0,
    durationSeconds: 0,
    objectiveTerms: [],
    recentTopicTerms: [],
    explanation: 'Drift analysis is not implemented yet.',
  };
}
