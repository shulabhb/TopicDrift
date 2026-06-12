import type { MeetingContext } from '@/src/types/meeting';
import { GOOGLE_MEET_SELECTORS } from './selectors';

/**
 * Detects Google Meet meeting presence from the host page.
 *
 * TODO: Replace heuristic placeholder with reliable Meet lifecycle detection.
 */
export function detectGoogleMeetMeeting(): MeetingContext | null {
  if (!location.hostname.endsWith('meet.google.com')) {
    return null;
  }

  const hasMeetingSurface = Boolean(
    document.querySelector(GOOGLE_MEET_SELECTORS.meetingRoot),
  );

  if (!hasMeetingSurface) {
    return null;
  }

  return {
    platform: 'google-meet',
    meetingUrl: location.href,
    phase: 'detected',
    detectedAt: Date.now(),
  };
}
