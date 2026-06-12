import {
  MESSAGE_TYPES,
  type ExtensionMessage,
  type ExtensionResponse,
  isExtensionMessage,
} from '@/src/types/messages';
import { getPageSupportState } from '@/src/types/meeting';
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

export async function getActiveTabUrl(): Promise<string | undefined> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.url;
}

export async function fetchPageSupportState() {
  const url = await getActiveTabUrl();
  return getPageSupportState(url);
}

export async function fetchSettings() {
  const response = await sendMessage({
    type: MESSAGE_TYPES.GET_SETTINGS,
  });

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

export type MessageHandler = (
  message: ExtensionMessage,
  sender: Browser.runtime.MessageSender,
) => Promise<ExtensionResponse | undefined> | ExtensionResponse | undefined;

export function createMessageRouter(handlers: Partial<Record<string, MessageHandler>>) {
  browser.runtime.onMessage.addListener((rawMessage, sender, sendResponse) => {
    if (!isExtensionMessage(rawMessage)) {
      logger.warn('Ignoring invalid extension message');
      return false;
    }

    const handler = handlers[rawMessage.type];

    if (!handler) {
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
