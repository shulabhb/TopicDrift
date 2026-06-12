import {
  DEFAULT_USER_SETTINGS,
  SETTINGS_STORAGE_KEY,
  normalizeUserSettings,
  type UserSettings,
} from '@/src/types/settings';
import { logger } from '@/src/utils/logger';
import { err, ok, type Result } from '@/src/utils/result';

export async function getUserSettings(): Promise<UserSettings> {
  try {
    const stored = await browser.storage.local.get(SETTINGS_STORAGE_KEY);
    const raw = stored[SETTINGS_STORAGE_KEY];
    return normalizeUserSettings(raw as Partial<UserSettings> | undefined);
  } catch (error) {
    logger.warn('Failed to read settings; using defaults', { error });
    return DEFAULT_USER_SETTINGS;
  }
}

export async function saveUserSettings(
  settings: UserSettings,
): Promise<Result<UserSettings, string>> {
  try {
    const normalized = normalizeUserSettings(settings);
    await browser.storage.local.set({ [SETTINGS_STORAGE_KEY]: normalized });
    return ok(normalized);
  } catch (error) {
    logger.error('Failed to save settings', { error });
    return err('settings-save-failed');
  }
}

export async function updateUserSettings(
  partial: Partial<UserSettings>,
): Promise<Result<UserSettings, string>> {
  const current = await getUserSettings();
  return saveUserSettings({ ...current, ...partial });
}

export async function clearUserSettings(): Promise<void> {
  await browser.storage.local.remove(SETTINGS_STORAGE_KEY);
}
