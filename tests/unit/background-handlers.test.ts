import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MESSAGE_TYPES } from '@/src/types/messages';
import { handleExtensionMessage } from '@/src/services/background-handlers';

describe('background messaging', () => {
  beforeEach(() => {
    vi.stubGlobal('browser', {
      tabs: {
        query: vi.fn(async () => [
          { id: 7, url: 'https://meet.google.com/abc-defg-hij' },
        ]),
        get: vi.fn(async () => ({
          id: 7,
          url: 'https://meet.google.com/abc-defg-hij',
        })),
        sendMessage: vi.fn(async () => undefined),
        onRemoved: { addListener: vi.fn() },
      },
      storage: {
        local: {
          get: vi.fn(async () => ({})),
          set: vi.fn(async () => undefined),
          remove: vi.fn(async () => undefined),
        },
      },
    });
  });

  it('returns popup state for active tab', async () => {
    const response = await handleExtensionMessage(
      { type: MESSAGE_TYPES.GET_POPUP_STATE },
      {} as Browser.runtime.MessageSender,
    );

    expect(response?.type).toBe(MESSAGE_TYPES.POPUP_STATE);
  });

  it('rejects invalid session creation payloads', async () => {
    const response = await handleExtensionMessage(
      {
        type: MESSAGE_TYPES.CREATE_SESSION,
        payload: { meetingKey: 'abc-defg-hij', objective: '   ' },
      },
      { tab: { id: 7 } } as Browser.runtime.MessageSender,
    );

    expect(response?.type).toBe(MESSAGE_TYPES.ACTION_RESULT);
    if (response?.type === MESSAGE_TYPES.ACTION_RESULT) {
      expect(response.payload.ok).toBe(false);
    }
  });
});
