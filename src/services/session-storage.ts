import {
  OFFER_SUPPRESSION_STORAGE_KEY,
  SESSIONS_STORAGE_KEY,
  normalizeMeetingSession,
  type MeetingSession,
  type OfferSuppression,
} from '@/src/types/session';
import { getUserSettings } from '@/src/services/storage';
import { logger } from '@/src/utils/logger';
import { err, ok, type Result } from '@/src/utils/result';

type SessionStore = Record<string, MeetingSession>;
type SuppressionStore = Record<string, OfferSuppression>;

export async function readSessionStore(): Promise<SessionStore> {
  try {
    const stored = await browser.storage.local.get(SESSIONS_STORAGE_KEY);
    const raw = stored[SESSIONS_STORAGE_KEY];

    if (!raw || typeof raw !== 'object') {
      return {};
    }

    const normalized: SessionStore = {};

    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      const session = normalizeMeetingSession(value as Partial<MeetingSession>);
      if (session) {
        normalized[key] = session;
      }
    }

    return normalized;
  } catch (error) {
    logger.warn('Failed to read session store', { error });
    return {};
  }
}

export async function writeSessionStore(
  store: SessionStore,
): Promise<Result<void, string>> {
  try {
    await browser.storage.local.set({ [SESSIONS_STORAGE_KEY]: store });
    return ok(undefined);
  } catch (error) {
    logger.error('Failed to write session store', { error });
    return err('session-store-failed');
  }
}

export async function getSessionForMeeting(
  meetingKey: string,
): Promise<MeetingSession | null> {
  const store = await readSessionStore();
  return store[meetingKey] ?? null;
}

export async function saveSession(
  session: MeetingSession,
): Promise<Result<MeetingSession, string>> {
  const normalized = normalizeMeetingSession(session);
  if (!normalized) {
    return err('session-invalid');
  }

  const store = await readSessionStore();
  store[normalized.meetingKey] = normalized;
  const writeResult = await writeSessionStore(store);

  if (!writeResult.ok) {
    return writeResult;
  }

  return ok(normalized);
}

export async function removeSession(meetingKey: string): Promise<void> {
  const store = await readSessionStore();
  delete store[meetingKey];
  await writeSessionStore(store);
}

export async function readSuppressionStore(): Promise<SuppressionStore> {
  try {
    const stored = await browser.storage.local.get(OFFER_SUPPRESSION_STORAGE_KEY);
    const raw = stored[OFFER_SUPPRESSION_STORAGE_KEY];

    if (!raw || typeof raw !== 'object') {
      return {};
    }

    return raw as SuppressionStore;
  } catch (error) {
    logger.warn('Failed to read offer suppression store', { error });
    return {};
  }
}

export async function suppressOfferForMeeting(
  meetingKey: string,
  reason: OfferSuppression['reason'],
  now = Date.now(),
): Promise<Result<void, string>> {
  try {
    const store = await readSuppressionStore();
    store[meetingKey] = { meetingKey, suppressedAt: now, reason };
    await browser.storage.local.set({ [OFFER_SUPPRESSION_STORAGE_KEY]: store });
    return ok(undefined);
  } catch (error) {
    logger.error('Failed to suppress offer', { error });
    return err('offer-suppression-failed');
  }
}

export async function isOfferSuppressed(meetingKey: string): Promise<boolean> {
  const store = await readSuppressionStore();
  return Boolean(store[meetingKey]);
}

export async function clearSuppressionForMeeting(meetingKey: string): Promise<void> {
  const store = await readSuppressionStore();
  delete store[meetingKey];
  await browser.storage.local.set({ [OFFER_SUPPRESSION_STORAGE_KEY]: store });
}

export async function cleanupMeetingArtifacts(
  meetingKey: string,
  now = Date.now(),
): Promise<void> {
  const settings = await getUserSettings();

  if (settings.deleteTemporarySessionDataAfterMeeting) {
    await removeSession(meetingKey);
    await clearSuppressionForMeeting(meetingKey);
    return;
  }

  const session = await getSessionForMeeting(meetingKey);
  if (session && session.status !== 'ended' && session.status !== 'stopped') {
    await saveSession({ ...session, status: 'ended', endedAt: now, updatedAt: now });
  }
}

export async function clearAllTemporaryMeetingData(): Promise<void> {
  await browser.storage.local.remove([
    SESSIONS_STORAGE_KEY,
    OFFER_SUPPRESSION_STORAGE_KEY,
  ]);
}
