import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../entrypoints/options/App';
import { DEFAULT_USER_SETTINGS } from '@/src/types/settings';

describe('options App', () => {
  beforeEach(() => {
    vi.stubGlobal('browser', {
      runtime: {
        sendMessage: vi.fn(async (message: { type: string; payload?: unknown }) => {
          if (message.type === 'GET_SETTINGS') {
            return { type: 'SETTINGS', payload: DEFAULT_USER_SETTINGS };
          }

          if (message.type === 'UPDATE_SETTINGS') {
            return {
              type: 'SETTINGS_UPDATED',
              payload: {
                ...DEFAULT_USER_SETTINGS,
                ...(message.payload as object),
              },
            };
          }

          return undefined;
        }),
      },
      storage: {
        local: {
          get: vi.fn(async () => ({})),
          set: vi.fn(async () => undefined),
        },
      },
    });
  });

  it('loads and updates settings controls', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByText(/Settings saved locally/i)).toBeInTheDocument();

    const sensitivity = screen.getByLabelText(/Default sensitivity/i);
    await user.selectOptions(sensitivity, 'strict');

    expect(await screen.findByText(/Settings saved locally/i)).toBeInTheDocument();
    expect(sensitivity).toHaveValue('strict');
  });
});
