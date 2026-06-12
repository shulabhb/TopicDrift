import { describe, expect, it } from 'vitest';
import {
  DEFAULT_USER_SETTINGS,
  normalizeUserSettings,
  isSensitivityLevel,
} from '@/src/types/settings';

describe('settings', () => {
  it('exposes privacy-conscious defaults', () => {
    expect(DEFAULT_USER_SETTINGS).toEqual({
      autoOfferTracking: true,
      defaultSensitivity: 'balanced',
      saveMeetingSummaries: true,
      deleteTemporarySessionDataAfterMeeting: true,
    });
  });

  it('normalizes partial settings with safe fallbacks', () => {
    const normalized = normalizeUserSettings({
      autoOfferTracking: false,
      defaultSensitivity: 'not-a-level' as never,
    });

    expect(normalized.autoOfferTracking).toBe(false);
    expect(normalized.defaultSensitivity).toBe('balanced');
    expect(normalized.saveMeetingSummaries).toBe(true);
  });

  it('rejects invalid sensitivity levels', () => {
    expect(isSensitivityLevel('balanced')).toBe(true);
    expect(isSensitivityLevel('aggressive')).toBe(false);
  });
});
