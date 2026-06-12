import {
  MESSAGE_TYPES,
  type ExtensionMessage,
  type ExtensionResponse,
  isExtensionMessage,
} from '@/src/types/messages';
import { getUserSettings, updateUserSettings } from '@/src/services/storage';
import { logger } from '@/src/utils/logger';

export async function sendMessage<T extends ExtensionResponse>(
  message: ExtensionMessage,
): Promise<T | undefined> {
  try {
    return (await browser.runtime.sendMessage(message)) as T | undefined;
  } catch (error) {
    logger.debug('Message send failed', { type: message.type, error });
    return undefined;
  }
}

export async function getActiveTabId(): Promise<number | undefined> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.id;
}

export async function fetchPopupState() {
  const response = await sendMessage({ type: MESSAGE_TYPES.GET_POPUP_STATE });
  if (response?.type === MESSAGE_TYPES.POPUP_STATE) {
    return response.payload;
  }

  return {
    meetState: 'content-unavailable' as const,
    contentScriptReady: false,
  };
}

export async function fetchSettings() {
  const response = await sendMessage({ type: MESSAGE_TYPES.GET_SETTINGS });
  if (response?.type === MESSAGE_TYPES.SETTINGS) {
    return response.payload;
  }
  return getUserSettings();
}

export async function persistSettings(
  partial: Parameters<typeof updateUserSettings>[0],
) {
  const response = await sendMessage({
    type: MESSAGE_TYPES.UPDATE_SETTINGS,
    payload: partial,
  });

  if (response?.type === MESSAGE_TYPES.SETTINGS_UPDATED) {
    return response.payload;
  }

  const result = await updateUserSettings(partial);
  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.value;
}

export async function startObjectiveSetupFromPopup() {
  const response = await sendMessage({ type: MESSAGE_TYPES.START_OBJECTIVE_SETUP });
  return response?.type === MESSAGE_TYPES.ACTION_RESULT ? response.payload : undefined;
}

export async function openMeetingControlsFromPopup() {
  const response = await sendMessage({ type: MESSAGE_TYPES.OPEN_MEETING_CONTROLS });
  return response?.type === MESSAGE_TYPES.ACTION_RESULT ? response.payload : undefined;
}

export async function resumeSessionFromPopup(meetingKey: string) {
  const response = await sendMessage({
    type: MESSAGE_TYPES.RESUME_SESSION,
    payload: { meetingKey },
  });
  return response?.type === MESSAGE_TYPES.ACTION_RESULT ? response.payload : undefined;
}

export async function grantCaptionConsentFromPopup(meetingKey: string) {
  const response = await sendMessage({
    type: MESSAGE_TYPES.GRANT_CAPTION_CONSENT,
    payload: { meetingKey },
  });
  return response?.type === MESSAGE_TYPES.ACTION_RESULT ? response.payload : undefined;
}

export async function declineCaptionConsentFromPopup(meetingKey: string) {
  const response = await sendMessage({
    type: MESSAGE_TYPES.DECLINE_CAPTION_CONSENT,
    payload: { meetingKey },
  });
  return response?.type === MESSAGE_TYPES.ACTION_RESULT ? response.payload : undefined;
}

export type MessageHandler = (
  message: ExtensionMessage,
  sender: Browser.runtime.MessageSender,
) => Promise<ExtensionResponse | undefined> | ExtensionResponse | undefined;

export function createMessageRouter(handler: MessageHandler) {
  browser.runtime.onMessage.addListener((rawMessage, sender, sendResponse) => {
    if (!isExtensionMessage(rawMessage)) {
      logger.warn('Ignoring invalid extension message');
      return false;
    }

    Promise.resolve(handler(rawMessage, sender))
      .then((response) => {
        if (response) {
          sendResponse(response);
        }
      })
      .catch((error) => {
        logger.error('Message handler failed', { type: rawMessage.type, error });
      });

    return true;
  });
}

export function onExtensionMessage(handler: MessageHandler): () => void {
  const listener = (
    rawMessage: unknown,
    sender: Browser.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) => {
    if (!isExtensionMessage(rawMessage)) {
      return false;
    }

    Promise.resolve(handler(rawMessage, sender))
      .then((response) => {
        if (response) {
          sendResponse(response);
        }
      })
      .catch((error) => {
        logger.error('Content message handler failed', {
          type: rawMessage.type,
          error,
        });
      });

    return true;
  };

  browser.runtime.onMessage.addListener(listener);
  return () => browser.runtime.onMessage.removeListener(listener);
}
