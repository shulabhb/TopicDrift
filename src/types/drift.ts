export type DriftStatus =
  | 'initializing'
  | 'aligned'
  | 'diverging'
  | 'possible-drift'
  | 'sustained-drift'
  | 'returning'
  | 'paused';

export interface DriftResult {
  status: DriftStatus;
  score: number;
  confidence: number;
  durationSeconds: number;
  objectiveTerms: string[];
  recentTopicTerms: string[];
  explanation: string;
}

export interface DriftAnalysisInput {
  objective: string;
  segments: import('./transcript').TranscriptSegment[];
}

/**
 * Placeholder configuration for the future drift engine.
 * Sensitivity maps to score thresholds and window sizes.
 */
export interface DriftEngineConfig {
  sensitivity: import('./settings').SensitivityLevel;
  windowSizeSeconds: number;
  sustainedDriftThresholdSeconds: number;
}
