import { MESSAGE_TYPES } from '@/src/types/messages';
import { getPageSupportState } from '@/src/types/meeting';
import { createMessageRouter } from '@/src/services/messaging';
import { getUserSettings, updateUserSettings } from '@/src/services/storage';
import { logger } from '@/src/utils/logger';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener((details) => {
    logger.info('TopicDrift installed', { reason: details.reason });
  });

  createMessageRouter({
    [MESSAGE_TYPES.PING]: () => ({ type: MESSAGE_TYPES.PONG }),

    [MESSAGE_TYPES.GET_PAGE_SUPPORT_STATE]: async () => {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const url = tabs[0]?.url;
      return {
        type: MESSAGE_TYPES.PAGE_SUPPORT_STATE,
        payload: getPageSupportState(url),
      };
    },

    [MESSAGE_TYPES.GET_SETTINGS]: async () => ({
      type: MESSAGE_TYPES.SETTINGS,
      payload: await getUserSettings(),
    }),

    [MESSAGE_TYPES.UPDATE_SETTINGS]: async (message) => {
      if (message.type !== MESSAGE_TYPES.UPDATE_SETTINGS) {
        return undefined;
      }

      const result = await updateUserSettings(message.payload);

      if (!result.ok) {
        logger.warn('Settings update failed', { error: result.error });
        return undefined;
      }

      return {
        type: MESSAGE_TYPES.SETTINGS_UPDATED,
        payload: result.value,
      };
    },

    [MESSAGE_TYPES.CONTENT_SCRIPT_READY]: (message) => {
      if (message.type !== MESSAGE_TYPES.CONTENT_SCRIPT_READY) {
        return undefined;
      }

      logger.debug('Content script ready', { url: message.payload.url });
      return undefined;
    },
  });
});
