import type { MeetingAdapter } from '@/src/adapters/meeting-adapter';
import { createCaptionObserver } from './caption-observer';
import { detectGoogleMeetMeeting } from './meeting-detector';

export function createGoogleMeetAdapter(): MeetingAdapter {
  let disposeCaptionObserver: (() => void) | null = null;

  return {
    platform: 'google-meet',

    detectMeeting() {
      return detectGoogleMeetMeeting();
    },

    startCaptionObservation(onCaption) {
      disposeCaptionObserver?.();
      disposeCaptionObserver = createCaptionObserver(onCaption);
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
