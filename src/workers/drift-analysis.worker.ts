import { analyzeDrift, createDriftEngineConfig } from '@/src/analysis/drift-engine';
import type { DriftAnalysisInput } from '@/src/types/drift';
import type { SensitivityLevel } from '@/src/types/settings';

export interface DriftWorkerRequest {
  type: 'ANALYZE';
  payload: {
    input: DriftAnalysisInput;
    sensitivity: SensitivityLevel;
  };
}

export interface DriftWorkerResponse {
  type: 'ANALYSIS_RESULT';
  payload: ReturnType<typeof analyzeDrift>;
}

/**
 * Web worker entry for off-main-thread drift analysis.
 *
 * TODO: Wire content script to this worker when analysis is implemented.
 */
self.onmessage = (event: MessageEvent<DriftWorkerRequest>) => {
  if (event.data.type !== 'ANALYZE') {
    return;
  }

  const config = createDriftEngineConfig(event.data.payload.sensitivity);
  const result = analyzeDrift(event.data.payload.input, config);

  const response: DriftWorkerResponse = {
    type: 'ANALYSIS_RESULT',
    payload: result,
  };

  self.postMessage(response);
};

export {};
