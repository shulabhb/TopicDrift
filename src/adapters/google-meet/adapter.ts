import type { MeetingAdapter } from '@/src/adapters/meeting-adapter';
import { createCaptionObserver } from './caption-observer';
import { detectGoogleMeetMeeting } from './meeting-detector';
import { TranscriptIngest } from '@/src/services/transcript-ingest';

export function createGoogleMeetAdapter(): MeetingAdapter {
  let disposeCaptionObserver: (() => void) | null = null;

  return {
    platform: 'google-meet',

    detectMeeting() {
      return detectGoogleMeetMeeting();
    },

    startCaptionObservation(onCaption) {
      const ingest = new TranscriptIngest();
      disposeCaptionObserver?.();
      disposeCaptionObserver = createCaptionObserver({
        onCaptionUpdate: (update) => {
          const segment = ingest.ingest(update);
          if (!segment) {
            return;
          }

          onCaption({
            segments: [...ingest.getSegments()],
            observedAt: Date.now(),
          });
        },
        onAvailabilityChange: () => undefined,
      });

      return () => {
        disposeCaptionObserver?.();
        disposeCaptionObserver = null;
      };
    },

    dispose() {
      disposeCaptionObserver?.();
      disposeCaptionObserver = null;
    },
  };
}
