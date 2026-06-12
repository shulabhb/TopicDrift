import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../entrypoints/popup/App';

describe('popup App', () => {
  beforeEach(() => {
    vi.stubGlobal('browser', {
      runtime: {
        getManifest: () => ({ version: '0.1.0' }),
        openOptionsPage: vi.fn(),
        sendMessage: vi.fn(async () => undefined),
      },
      tabs: {
        query: vi.fn(async () => [{ url: 'https://meet.google.com/abc-defg-hij' }]),
      },
    });
  });

  it('renders product identity and placeholder tracking state', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'TopicDrift' })).toBeInTheDocument();
    expect(
      screen.getByText(/Private, local topic-alignment tracking/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Start tracking \(not implemented\)/i }),
    ).toBeDisabled();
    expect(screen.getByLabelText('Version 0.1.0')).toBeInTheDocument();

    expect(await screen.findByText(/Supported: Google Meet/i)).toBeInTheDocument();
  });
});
