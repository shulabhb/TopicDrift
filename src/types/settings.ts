export type SensitivityLevel = 'relaxed' | 'balanced' | 'strict';

export interface UserSettings {
  autoOfferTracking: boolean;
  defaultSensitivity: SensitivityLevel;
  saveMeetingSummaries: boolean;
  deleteTemporarySessionDataAfterMeeting: boolean;
}

export const SENSITIVITY_LEVELS: readonly SensitivityLevel[] = [
  'relaxed',
  'balanced',
  'strict',
] as const;

export const DEFAULT_USER_SETTINGS: UserSettings = {
  autoOfferTracking: true,
  defaultSensitivity: 'balanced',
  saveMeetingSummaries: true,
  deleteTemporarySessionDataAfterMeeting: true,
};

export const SETTINGS_STORAGE_KEY = 'userSettings';

/**
 * Validates and merges partial settings with defaults.
 * Unknown or invalid values fall back to safe defaults.
 */
export function normalizeUserSettings(
  input: Partial<UserSettings> | null | undefined,
): UserSettings {
  const source = input ?? {};

  return {
    autoOfferTracking:
      typeof source.autoOfferTracking === 'boolean'
        ? source.autoOfferTracking
        : DEFAULT_USER_SETTINGS.autoOfferTracking,
    defaultSensitivity: isSensitivityLevel(source.defaultSensitivity)
      ? source.defaultSensitivity
      : DEFAULT_USER_SETTINGS.defaultSensitivity,
    saveMeetingSummaries:
      typeof source.saveMeetingSummaries === 'boolean'
        ? source.saveMeetingSummaries
        : DEFAULT_USER_SETTINGS.saveMeetingSummaries,
    deleteTemporarySessionDataAfterMeeting:
      typeof source.deleteTemporarySessionDataAfterMeeting === 'boolean'
        ? source.deleteTemporarySessionDataAfterMeeting
        : DEFAULT_USER_SETTINGS.deleteTemporarySessionDataAfterMeeting,
  };
}

export function isSensitivityLevel(value: unknown): value is SensitivityLevel {
  return (
    typeof value === 'string' &&
    (SENSITIVITY_LEVELS as readonly string[]).includes(value)
  );
}
