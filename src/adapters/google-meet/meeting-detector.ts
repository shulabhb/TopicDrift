import type { MeetingContext } from '@/src/types/meeting';
import { classifyMeetingPageState } from './lifecycle-detector';

/**
 * Legacy adapter entry retained for compatibility.
 * Prefer lifecycle detector observations for UI orchestration.
 */
export function detectGoogleMeetMeeting(): MeetingContext | null {
  const state = classifyMeetingPageState(location.href, document);

  if (state !== 'in-meeting' && state !== 'prejoin') {
    return null;
  }

  return {
    platform: 'google-meet',
    meetingUrl: location.href,
    phase: state === 'in-meeting' ? 'detected' : 'offer-tracking',
    detectedAt: Date.now(),
  };
}
