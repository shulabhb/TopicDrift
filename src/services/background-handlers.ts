import { MESSAGE_TYPES } from '@/src/types/messages';
import type { ExtensionMessage, ExtensionResponse } from '@/src/types/messages';
import {
  applyMeetingObservation,
  buildPopupState,
  getTabRuntimeState,
  removeTabRuntimeState,
  setTabRuntimeState,
} from '@/src/services/tab-state';
import {
  cleanupMeetingArtifacts,
  getSessionForMeeting,
  isOfferSuppressed,
  saveSession,
  suppressOfferForMeeting,
} from '@/src/services/session-storage';
import { getUserSettings, updateUserSettings } from '@/src/services/storage';
import {
  createSession,
  endSession,
  pauseSession,
  resumeSession,
  stopSession,
  updateSessionObjective,
} from '@/src/services/session-transitions';
import { shouldEndSessionForPageState } from '@/src/services/offer-policy';
import { getPageSupportState } from '@/src/types/meeting';
import { err, ok } from '@/src/utils/result';
import { logger } from '@/src/utils/logger';

async function getActiveTabId(): Promise<number | undefined> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.id;
}

async function sendToTab(tabId: number, message: ExtensionMessage): Promise<void> {
  try {
    await browser.tabs.sendMessage(tabId, message);
  } catch (error) {
    logger.debug('Unable to reach content script', {
      tabId,
      type: message.type,
      error,
    });
  }
}

async function broadcastSessionChange(meetingKey: string, tabId?: number) {
  const session = await getSessionForMeeting(meetingKey);
  const payload = {
    type: MESSAGE_TYPES.SESSION_STATE_CHANGED,
    payload: { meetingKey, tabId, session },
  } satisfies ExtensionMessage;

  if (tabId) {
    await sendToTab(tabId, payload);
  }
}

export async function handleExtensionMessage(
  message: ExtensionMessage,
  sender: Browser.runtime.MessageSender,
): Promise<ExtensionResponse | undefined> {
  const senderTabId = sender.tab?.id;

  switch (message.type) {
    case MESSAGE_TYPES.PING:
      return { type: MESSAGE_TYPES.PONG };

    case MESSAGE_TYPES.GET_PAGE_SUPPORT_STATE: {
      const tabId = senderTabId ?? (await getActiveTabId());
      const tabs = tabId ? await browser.tabs.get(tabId).catch(() => null) : null;
      return {
        type: MESSAGE_TYPES.PAGE_SUPPORT_STATE,
        payload: getPageSupportState(tabs?.url),
      };
    }

    case MESSAGE_TYPES.GET_SETTINGS:
      return {
        type: MESSAGE_TYPES.SETTINGS,
        payload: await getUserSettings(),
      };

    case MESSAGE_TYPES.UPDATE_SETTINGS: {
      const result = await updateUserSettings(message.payload);
      if (!result.ok) {
        return undefined;
      }

      return {
        type: MESSAGE_TYPES.SETTINGS_UPDATED,
        payload: result.value,
      };
    }

    case MESSAGE_TYPES.CONTENT_SCRIPT_READY: {
      if (senderTabId) {
        setTabRuntimeState(senderTabId, { contentScriptReady: true });
      }

      logger.debug('Content script ready', { tabId: senderTabId });
      return undefined;
    }

    case MESSAGE_TYPES.MEETING_STATE_CHANGED: {
      const tabId = message.payload.tabId ?? senderTabId;
      if (!tabId) {
        return undefined;
      }

      applyMeetingObservation(tabId, message.payload);

      const meetingKey = message.payload.meetingKey;
      if (meetingKey && shouldEndSessionForPageState(message.payload.currentState)) {
        const session = await getSessionForMeeting(meetingKey);
        if (session && session.status !== 'ended' && session.status !== 'stopped') {
          const ended = endSession(session);
          await saveSession(ended);
          await cleanupMeetingArtifacts(meetingKey);
          await broadcastSessionChange(meetingKey, tabId);
        }
      }

      return undefined;
    }

    case MESSAGE_TYPES.GET_POPUP_STATE: {
      const tabId = await getActiveTabId();
      if (!tabId) {
        return {
          type: MESSAGE_TYPES.POPUP_STATE,
          payload: { meetState: 'not-supported', contentScriptReady: false },
        };
      }

      const tabState = getTabRuntimeState(tabId);
      const session = tabState?.meetingKey
        ? await getSessionForMeeting(tabState.meetingKey)
        : null;

      return {
        type: MESSAGE_TYPES.POPUP_STATE,
        payload: buildPopupState(tabState, session),
      };
    }

    case MESSAGE_TYPES.GET_SESSION:
      return {
        type: MESSAGE_TYPES.SESSION,
        payload: {
          session: await getSessionForMeeting(message.payload.meetingKey),
        },
      };

    case MESSAGE_TYPES.CREATE_SESSION: {
      const existing = await getSessionForMeeting(message.payload.meetingKey);
      if (existing && (existing.status === 'active' || existing.status === 'paused')) {
        return {
          type: MESSAGE_TYPES.ACTION_RESULT,
          payload: err('session-already-active'),
        };
      }

      const created = createSession(
        message.payload.meetingKey,
        message.payload.objective,
        message.payload.tabId ?? senderTabId,
      );

      if (!created.ok) {
        return {
          type: MESSAGE_TYPES.ACTION_RESULT,
          payload: created,
        };
      }

      const saved = await saveSession(created.value);
      if (!saved.ok) {
        return {
          type: MESSAGE_TYPES.ACTION_RESULT,
          payload: saved,
        };
      }

      await broadcastSessionChange(message.payload.meetingKey, senderTabId);
      return {
        type: MESSAGE_TYPES.ACTION_RESULT,
        payload: ok(saved.value),
      };
    }

    case MESSAGE_TYPES.UPDATE_SESSION_OBJECTIVE: {
      const session = await getSessionForMeeting(message.payload.meetingKey);
      if (!session) {
        return {
          type: MESSAGE_TYPES.ACTION_RESULT,
          payload: err('session-not-found'),
        };
      }

      const updated = updateSessionObjective(session, message.payload.objective);
      if (!updated.ok) {
        return { type: MESSAGE_TYPES.ACTION_RESULT, payload: updated };
      }

      const saved = await saveSession(updated.value);
      if (!saved.ok) {
        return { type: MESSAGE_TYPES.ACTION_RESULT, payload: saved };
      }

      await broadcastSessionChange(message.payload.meetingKey, senderTabId);
      return { type: MESSAGE_TYPES.ACTION_RESULT, payload: ok(saved.value) };
    }

    case MESSAGE_TYPES.PAUSE_SESSION: {
      const session = await getSessionForMeeting(message.payload.meetingKey);
      if (!session) {
        return { type: MESSAGE_TYPES.ACTION_RESULT, payload: err('session-not-found') };
      }

      const paused = pauseSession(session);
      if (!paused.ok) {
        return { type: MESSAGE_TYPES.ACTION_RESULT, payload: paused };
      }

      const saved = await saveSession(paused.value);
      if (!saved.ok) {
        return { type: MESSAGE_TYPES.ACTION_RESULT, payload: saved };
      }

      await broadcastSessionChange(message.payload.meetingKey, senderTabId);
      return { type: MESSAGE_TYPES.ACTION_RESULT, payload: ok(saved.value) };
    }

    case MESSAGE_TYPES.RESUME_SESSION: {
      const session = await getSessionForMeeting(message.payload.meetingKey);
      if (!session) {
        return { type: MESSAGE_TYPES.ACTION_RESULT, payload: err('session-not-found') };
      }

      const resumed = resumeSession(session);
      if (!resumed.ok) {
        return { type: MESSAGE_TYPES.ACTION_RESULT, payload: resumed };
      }

      const saved = await saveSession(resumed.value);
      if (!saved.ok) {
        return { type: MESSAGE_TYPES.ACTION_RESULT, payload: saved };
      }

      await broadcastSessionChange(message.payload.meetingKey, senderTabId);
      return { type: MESSAGE_TYPES.ACTION_RESULT, payload: ok(saved.value) };
    }

    case MESSAGE_TYPES.STOP_SESSION: {
      const session = await getSessionForMeeting(message.payload.meetingKey);
      if (!session) {
        return { type: MESSAGE_TYPES.ACTION_RESULT, payload: err('session-not-found') };
      }

      const stopped = stopSession(session);
      const saved = await saveSession(stopped);
      if (!saved.ok) {
        return { type: MESSAGE_TYPES.ACTION_RESULT, payload: saved };
      }

      await broadcastSessionChange(message.payload.meetingKey, senderTabId);
      return { type: MESSAGE_TYPES.ACTION_RESULT, payload: ok(saved.value) };
    }

    case MESSAGE_TYPES.SUPPRESS_OFFER: {
      const result = await suppressOfferForMeeting(
        message.payload.meetingKey,
        message.payload.reason,
      );

      return {
        type: MESSAGE_TYPES.ACTION_RESULT,
        payload: result.ok ? ok(undefined) : result,
      };
    }

    case MESSAGE_TYPES.START_OBJECTIVE_SETUP:
    case MESSAGE_TYPES.OPEN_MEETING_CONTROLS:
    case MESSAGE_TYPES.CONTENT_ACTION: {
      const tabId = await getActiveTabId();
      if (!tabId) {
        return {
          type: MESSAGE_TYPES.ACTION_RESULT,
          payload: err('content-script-unavailable'),
        };
      }

      await sendToTab(tabId, message);
      return { type: MESSAGE_TYPES.ACTION_RESULT, payload: ok(undefined) };
    }

    default:
      return undefined;
  }
}

export function registerBackgroundLifecycleHandlers() {
  browser.tabs.onRemoved.addListener((tabId) => {
    removeTabRuntimeState(tabId);
  });
}

export async function getOfferSuppressed(meetingKey: string): Promise<boolean> {
  return isOfferSuppressed(meetingKey);
}
