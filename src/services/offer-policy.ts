import type { MeetingPageState } from '@/src/types/meeting';
import type { MeetingSession } from '@/src/types/session';
import { isActiveOrPausedSession } from '@/src/types/session';

export const IN_MEETING_STABILITY_MS = 2000;

export type ContentUiMode =
  | 'hidden'
  | 'offer'
  | 'objective'
  | 'widget'
  | 'widget-minimized';

export interface OfferDecisionInput {
  pageState: MeetingPageState;
  meetingKey?: string;
  autoOfferTracking: boolean;
  offerSuppressed: boolean;
  hasActiveSession: boolean;
  uiMode: ContentUiMode;
  inMeetingSince?: number;
  now?: number;
}

export function shouldShowTrackingOffer(input: OfferDecisionInput): boolean {
  const now = input.now ?? Date.now();

  if (input.pageState !== 'in-meeting' || !input.meetingKey) {
    return false;
  }

  if (!input.autoOfferTracking || input.offerSuppressed || input.hasActiveSession) {
    return false;
  }

  if (
    input.uiMode === 'offer' ||
    input.uiMode === 'objective' ||
    input.uiMode === 'widget'
  ) {
    return false;
  }

  if (!input.inMeetingSince) {
    return false;
  }

  return now - input.inMeetingSince >= IN_MEETING_STABILITY_MS;
}

export function resolveUiMode(params: {
  pageState: MeetingPageState;
  session: MeetingSession | null;
  explicitMode?: ContentUiMode;
  widgetMinimized?: boolean;
}): ContentUiMode {
  if (params.explicitMode && params.explicitMode !== 'hidden') {
    return params.explicitMode;
  }

  if (params.pageState !== 'in-meeting') {
    return 'hidden';
  }

  if (params.session && isActiveOrPausedSession(params.session)) {
    return params.widgetMinimized ? 'widget-minimized' : 'widget';
  }

  return 'hidden';
}

export function shouldEndSessionForPageState(pageState: MeetingPageState): boolean {
  return pageState === 'leaving' || pageState === 'ended' || pageState === 'landing';
}
