import { err, ok, type Result } from '@/src/utils/result';

import type { CaptionConsentStatus } from './caption';
import { isCaptionConsentStatus } from './caption';

export type MeetingSessionStatus =
  | 'setting-up'
  | 'active'
  | 'paused'
  | 'stopped'
  | 'ended';

export const MEETING_SESSION_STATUSES: readonly MeetingSessionStatus[] = [
  'setting-up',
  'active',
  'paused',
  'stopped',
  'ended',
] as const;

export const OBJECTIVE_MAX_LENGTH = 500;

export interface MeetingSession {
  id: string;
  meetingKey: string;
  tabId?: number;
  objective: string;
  status: MeetingSessionStatus;
  startedAt: number;
  updatedAt: number;
  pausedAt?: number;
  endedAt?: number;
  captionConsent?: CaptionConsentStatus;
}

export interface OfferSuppression {
  meetingKey: string;
  suppressedAt: number;
  reason: 'declined' | 'dismissed';
}

export const SESSIONS_STORAGE_KEY = 'meetingSessions';
export const OFFER_SUPPRESSION_STORAGE_KEY = 'offerSuppression';

export function isMeetingSessionStatus(value: unknown): value is MeetingSessionStatus {
  return (
    typeof value === 'string' &&
    (MEETING_SESSION_STATUSES as readonly string[]).includes(value)
  );
}

export function normalizeObjectiveInput(value: string): string {
  return value.trim();
}

export function validateObjective(value: string): Result<void, string> {
  const trimmed = normalizeObjectiveInput(value);

  if (!trimmed) {
    return err('objective-required');
  }

  if (trimmed.length > OBJECTIVE_MAX_LENGTH) {
    return err('objective-too-long');
  }

  return ok(undefined);
}

export function normalizeMeetingSession(
  input: Partial<MeetingSession> | null | undefined,
): MeetingSession | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const id = typeof input.id === 'string' ? input.id : '';
  const meetingKey = typeof input.meetingKey === 'string' ? input.meetingKey : '';
  const objective = typeof input.objective === 'string' ? input.objective : '';
  const status = isMeetingSessionStatus(input.status) ? input.status : 'ended';
  const startedAt = typeof input.startedAt === 'number' ? input.startedAt : 0;
  const updatedAt = typeof input.updatedAt === 'number' ? input.updatedAt : startedAt;

  if (!id || !meetingKey) {
    return null;
  }

  return {
    id,
    meetingKey,
    tabId: typeof input.tabId === 'number' ? input.tabId : undefined,
    objective,
    status,
    startedAt,
    updatedAt,
    pausedAt: typeof input.pausedAt === 'number' ? input.pausedAt : undefined,
    endedAt: typeof input.endedAt === 'number' ? input.endedAt : undefined,
    captionConsent: isCaptionConsentStatus(input.captionConsent)
      ? input.captionConsent
      : 'not-requested',
  };
}

export function isActiveOrPausedSession(session: MeetingSession | null): boolean {
  return session?.status === 'active' || session?.status === 'paused';
}
