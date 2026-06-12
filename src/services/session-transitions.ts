import type { MeetingSession, MeetingSessionStatus } from '@/src/types/session';
import type { CaptionConsentStatus } from '@/src/types/caption';
import { validateObjective, normalizeObjectiveInput } from '@/src/types/session';
import { err, ok, type Result } from '@/src/utils/result';

export function createSessionId(now = Date.now()): string {
  return `session-${now}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createSession(
  meetingKey: string,
  objective: string,
  tabId?: number,
  now = Date.now(),
): Result<MeetingSession, string> {
  const validation = validateObjective(objective);
  if (!validation.ok) {
    return validation;
  }

  const normalizedObjective = normalizeObjectiveInput(objective);

  return ok({
    id: createSessionId(now),
    meetingKey,
    tabId,
    objective: normalizedObjective,
    status: 'active',
    startedAt: now,
    updatedAt: now,
    captionConsent: 'not-requested',
  });
}

export function pauseSession(
  session: MeetingSession,
  now = Date.now(),
): Result<MeetingSession, string> {
  if (session.status !== 'active') {
    return err('session-not-active');
  }

  return ok({
    ...session,
    status: 'paused',
    pausedAt: now,
    updatedAt: now,
  });
}

export function resumeSession(
  session: MeetingSession,
  now = Date.now(),
): Result<MeetingSession, string> {
  if (session.status !== 'paused') {
    return err('session-not-paused');
  }

  return ok({
    ...session,
    status: 'active',
    pausedAt: undefined,
    updatedAt: now,
  });
}

export function updateSessionObjective(
  session: MeetingSession,
  objective: string,
  now = Date.now(),
): Result<MeetingSession, string> {
  if (session.status === 'stopped' || session.status === 'ended') {
    return err('session-not-editable');
  }

  const validation = validateObjective(objective);
  if (!validation.ok) {
    return validation;
  }

  return ok({
    ...session,
    objective: normalizeObjectiveInput(objective),
    updatedAt: now,
  });
}

export function stopSession(session: MeetingSession, now = Date.now()): MeetingSession {
  return {
    ...session,
    status: 'stopped',
    endedAt: now,
    updatedAt: now,
    captionConsent:
      session.captionConsent === 'granted' ? 'revoked' : session.captionConsent,
  };
}

export function endSession(session: MeetingSession, now = Date.now()): MeetingSession {
  return {
    ...session,
    status: 'ended',
    endedAt: now,
    updatedAt: now,
  };
}

export function shouldReplaceSession(
  existing: MeetingSession | null,
  meetingKey: string,
): boolean {
  if (!existing) {
    return true;
  }

  if (existing.meetingKey !== meetingKey) {
    return true;
  }

  return existing.status === 'stopped' || existing.status === 'ended';
}

export function isEditableSessionStatus(status: MeetingSessionStatus): boolean {
  return status === 'setting-up' || status === 'active' || status === 'paused';
}

export function grantCaptionConsent(
  session: MeetingSession,
  now = Date.now(),
): Result<MeetingSession, string> {
  if (session.status !== 'active' && session.status !== 'paused') {
    return err('session-not-active');
  }

  return ok({
    ...session,
    captionConsent: 'granted' satisfies CaptionConsentStatus,
    updatedAt: now,
  });
}

export function declineCaptionConsent(
  session: MeetingSession,
  now = Date.now(),
): Result<MeetingSession, string> {
  if (session.status !== 'active' && session.status !== 'paused') {
    return err('session-not-active');
  }

  return ok({
    ...session,
    captionConsent: 'declined' satisfies CaptionConsentStatus,
    updatedAt: now,
  });
}

export function revokeCaptionConsent(
  session: MeetingSession,
  now = Date.now(),
): Result<MeetingSession, string> {
  if (session.status !== 'active' && session.status !== 'paused') {
    return err('session-not-active');
  }

  return ok({
    ...session,
    captionConsent: 'revoked' satisfies CaptionConsentStatus,
    updatedAt: now,
  });
}
