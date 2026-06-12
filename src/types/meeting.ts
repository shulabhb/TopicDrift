export type MeetingPlatform = 'google-meet' | 'unknown';

export type MeetingPhase =
  | 'not-detected'
  | 'detected'
  | 'offer-tracking'
  | 'awaiting-objective'
  | 'tracking'
  | 'paused'
  | 'ended';

export interface MeetingContext {
  platform: MeetingPlatform;
  meetingUrl: string;
  phase: MeetingPhase;
  detectedAt?: number;
}

export interface MeetingObjective {
  text: string;
  source: 'user-entered' | 'inferred';
  createdAt: number;
}

export type PageSupportState =
  | { supported: true; platform: MeetingPlatform; url: string }
  | { supported: false; reason: 'unsupported-page' | 'no-active-tab' };

export function isGoogleMeetUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname === 'meet.google.com';
  } catch {
    return false;
  }
}

export function getPageSupportState(url: string | undefined): PageSupportState {
  if (!url) {
    return { supported: false, reason: 'no-active-tab' };
  }

  if (isGoogleMeetUrl(url)) {
    return { supported: true, platform: 'google-meet', url };
  }

  return { supported: false, reason: 'unsupported-page' };
}
