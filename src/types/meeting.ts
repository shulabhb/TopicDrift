export type MeetingPageState =
  | 'unsupported'
  | 'landing'
  | 'prejoin'
  | 'in-meeting'
  | 'leaving'
  | 'ended'
  | 'unknown';

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

export interface MeetingStateObservation {
  currentState: MeetingPageState;
  previousState?: MeetingPageState;
  meetingKey?: string;
  detectedAt: number;
}

export type PopupMeetState =
  | 'not-supported'
  | 'content-unavailable'
  | 'landing'
  | 'prejoin'
  | 'in-meeting'
  | 'setup-available'
  | 'session-active'
  | 'session-paused'
  | 'session-stopped'
  | 'uncertain';

export interface TabRuntimeState {
  tabId: number;
  platform: MeetingPlatform;
  pageState: MeetingPageState;
  meetingKey?: string;
  contentScriptReady: boolean;
  updatedAt: number;
}

export interface PopupState {
  meetState: PopupMeetState;
  meetingKey?: string;
  objective?: string;
  sessionStatus?: import('./session').MeetingSessionStatus;
  contentScriptReady: boolean;
}

export function isGoogleMeetHostname(hostname: string): boolean {
  return hostname === 'meet.google.com';
}

export function mapPageStateToPopupState(
  pageState: MeetingPageState,
  session: import('./session').MeetingSession | null,
  contentScriptReady: boolean,
): PopupMeetState {
  if (!contentScriptReady && pageState === 'unknown') {
    return 'content-unavailable';
  }

  if (session?.status === 'active') {
    return 'session-active';
  }

  if (session?.status === 'paused') {
    return 'session-paused';
  }

  if (session?.status === 'stopped' || session?.status === 'ended') {
    return 'session-stopped';
  }

  switch (pageState) {
    case 'landing':
      return 'landing';
    case 'prejoin':
      return 'prejoin';
    case 'in-meeting':
      return session?.status === 'setting-up' ? 'setup-available' : 'setup-available';
    case 'leaving':
    case 'ended':
      return 'session-stopped';
    case 'unsupported':
      return 'not-supported';
    default:
      return 'uncertain';
  }
}

// Legacy helpers retained for compatibility
export type PageSupportState =
  | { supported: true; platform: MeetingPlatform; url: string }
  | { supported: false; reason: 'unsupported-page' | 'no-active-tab' };

export function isGoogleMeetUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    return isGoogleMeetHostname(new URL(url).hostname);
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
