import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../entrypoints/popup/App';
import { MESSAGE_TYPES } from '@/src/types/messages';

describe('popup App', () => {
  beforeEach(() => {
    vi.stubGlobal('browser', {
      runtime: {
        getManifest: () => ({ version: '0.1.0' }),
        openOptionsPage: vi.fn(),
        sendMessage: vi.fn(async (message: { type: string }) => {
          if (message.type === MESSAGE_TYPES.GET_POPUP_STATE) {
            return {
              type: MESSAGE_TYPES.POPUP_STATE,
              payload: {
                meetState: 'setup-available',
                contentScriptReady: true,
                meetingKey: 'abc-defg-hij',
              },
            };
          }

          if (message.type === MESSAGE_TYPES.START_OBJECTIVE_SETUP) {
            return {
              type: MESSAGE_TYPES.ACTION_RESULT,
              payload: { ok: true, value: undefined },
            };
          }

          return undefined;
        }),
      },
      tabs: {
        query: vi.fn(async () => [
          { id: 1, url: 'https://meet.google.com/abc-defg-hij' },
        ]),
      },
    });
  });

  it('renders supported Meet call state and setup action', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'TopicDrift' })).toBeInTheDocument();
    expect(await screen.findByText(/Active Google Meet call/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Set meeting objective/i }),
    ).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /Set meeting objective/i }));
    expect(await screen.findByText(/Objective setup opened/i)).toBeInTheDocument();
  });
});
