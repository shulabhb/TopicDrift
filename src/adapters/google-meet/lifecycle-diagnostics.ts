import type { MeetingPageState } from '@/src/types/meeting';
import { deriveMeetingKeyFromUrl } from './meeting-key';
import { classifyMeetingPageState } from './lifecycle-detector';
import { summarizeLifecycleSignals } from './lifecycle-signals';

export interface LifecycleDiagnostics {
  pageState: MeetingPageState;
  meetingKeyPresent: boolean;
  signals: ReturnType<typeof summarizeLifecycleSignals>;
  inMeetingConfidence: number;
}

export function collectLifecycleDiagnostics(
  url: string,
  root: ParentNode = document,
): LifecycleDiagnostics {
  const signals = summarizeLifecycleSignals(url, root);
  const pageState = classifyMeetingPageState(url, root);

  return {
    pageState,
    meetingKeyPresent: Boolean(deriveMeetingKeyFromUrl(url)),
    signals,
    inMeetingConfidence: signals.inMeetingMatchedCount,
  };
}

export {
  classifyMeetingPageState,
  createMeetingStateObservation,
  createLifecycleDetector,
} from './lifecycle-detector';
export type { LifecycleDetectorOptions } from './lifecycle-detector';
