import type { MeetingContext, MeetingPlatform } from '@/src/types/meeting';
import type { TranscriptSegment } from '@/src/types/transcript';

export interface CaptionObservation {
  segments: TranscriptSegment[];
  observedAt: number;
}

/**
 * Platform-specific adapter boundary.
 * Implementations may use browser DOM APIs; consumers must not.
 */
export interface MeetingAdapter {
  readonly platform: MeetingPlatform;

  /** Detect whether the current page represents an active meeting. */
  detectMeeting(): MeetingContext | null;

  /** Observe live captions after explicit user activation. */
  startCaptionObservation(
    onCaption: (observation: CaptionObservation) => void,
  ): () => void;

  /** Release observers and DOM listeners. */
  dispose(): void;
}

export function createUnsupportedAdapter(platform: MeetingPlatform): MeetingAdapter {
  return {
    platform,
    detectMeeting: () => null,
    startCaptionObservation: () => () => undefined,
    dispose: () => undefined,
  };
}
