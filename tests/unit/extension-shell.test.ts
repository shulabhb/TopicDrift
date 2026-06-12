import { describe, expect, it } from 'vitest';
import { getPageSupportState, isGoogleMeetUrl } from '@/src/types/meeting';
import { MESSAGE_TYPES } from '@/src/types/messages';

describe('extension shell contracts', () => {
  it('identifies supported Google Meet URLs', () => {
    expect(isGoogleMeetUrl('https://meet.google.com/abc-defg-hij')).toBe(true);
    expect(isGoogleMeetUrl('https://example.com/meeting')).toBe(false);
  });

  it('describes unsupported pages without claiming analysis', () => {
    expect(getPageSupportState('https://meet.google.com/xyz')).toEqual({
      supported: true,
      platform: 'google-meet',
      url: 'https://meet.google.com/xyz',
    });

    expect(getPageSupportState('https://zoom.us/j/123')).toEqual({
      supported: false,
      reason: 'unsupported-page',
    });
  });

  it('uses typed message contracts', () => {
    expect(MESSAGE_TYPES.GET_SETTINGS).toBe('GET_SETTINGS');
    expect(MESSAGE_TYPES.UPDATE_SETTINGS).toBe('UPDATE_SETTINGS');
  });
});
