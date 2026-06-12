import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_USER_SETTINGS,
  SETTINGS_STORAGE_KEY,
  normalizeUserSettings,
} from '@/src/types/settings';
import {
  getUserSettings,
  saveUserSettings,
  updateUserSettings,
} from '@/src/services/storage';

type StorageMap = Record<string, unknown>;

function createStorageMock() {
  let store: StorageMap = {};

  return {
    get: vi.fn(async (keys?: string | string[] | Record<string, unknown> | null) => {
      if (typeof keys === 'string') {
        return { [keys]: store[keys] };
      }

      if (Array.isArray(keys)) {
        return Object.fromEntries(keys.map((key) => [key, store[key]]));
      }

      return { ...store };
    }),
    set: vi.fn(async (items: StorageMap) => {
      store = { ...store, ...items };
    }),
    remove: vi.fn(async (keys: string | string[]) => {
      const keyList = Array.isArray(keys) ? keys : [keys];
      for (const key of keyList) {
        delete store[key];
      }
    }),
    clear: vi.fn(async () => {
      store = {};
    }),
    reset: () => {
      store = {};
    },
  };
}

describe('settings storage', () => {
  const storage = createStorageMock();

  beforeEach(() => {
    storage.reset();
    vi.stubGlobal('browser', {
      storage: {
        local: storage,
      },
    });
  });

  it('returns defaults when storage is empty', async () => {
    await expect(getUserSettings()).resolves.toEqual(DEFAULT_USER_SETTINGS);
  });

  it('round-trips normalized settings', async () => {
    const custom = normalizeUserSettings({
      autoOfferTracking: false,
      defaultSensitivity: 'strict',
    });

    const saveResult = await saveUserSettings(custom);
    expect(saveResult.ok).toBe(true);

    const stored = await getUserSettings();
    expect(stored).toEqual(custom);

    const raw = await browser.storage.local.get(SETTINGS_STORAGE_KEY);
    expect(raw[SETTINGS_STORAGE_KEY]).toEqual(custom);
  });

  it('merges partial updates', async () => {
    await saveUserSettings(DEFAULT_USER_SETTINGS);
    const result = await updateUserSettings({ defaultSensitivity: 'relaxed' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.defaultSensitivity).toBe('relaxed');
      expect(result.value.autoOfferTracking).toBe(true);
    }
  });
});
