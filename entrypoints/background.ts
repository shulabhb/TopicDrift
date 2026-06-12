import { createMessageRouter } from '@/src/services/messaging';
import {
  handleExtensionMessage,
  registerBackgroundLifecycleHandlers,
} from '@/src/services/background-handlers';
import { logger } from '@/src/utils/logger';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener((details) => {
    logger.info('TopicDrift installed', { reason: details.reason });
  });

  registerBackgroundLifecycleHandlers();

  createMessageRouter(async (message, sender) =>
    handleExtensionMessage(message, sender),
  );
});
