import { useEffect, useState } from 'react';
import {
  DEFAULT_USER_SETTINGS,
  SENSITIVITY_LEVELS,
  type SensitivityLevel,
  type UserSettings,
} from '@/src/types/settings';
import { fetchSettings, persistSettings } from '@/src/services/messaging';
import './App.css';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [status, setStatus] = useState<'loading' | 'ready' | 'saving' | 'error'>(
    'loading',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchSettings()
      .then((loaded) => {
        setSettings(loaded);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
        setErrorMessage('Unable to load settings.');
      });
  }, []);

  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => {
    setStatus('saving');
    setErrorMessage(null);

    try {
      const updated = await persistSettings({ [key]: value });
      setSettings(updated);
      setStatus('ready');
    } catch {
      setStatus('error');
      setErrorMessage('Unable to save settings.');
    }
  };

  return (
    <main className="options">
      <header className="options__header">
        <h1>TopicDrift settings</h1>
        <p>All settings are stored locally in your browser.</p>
      </header>

      <form className="options__form" aria-busy={status === 'saving'}>
        <label className="options__field">
          <input
            type="checkbox"
            checked={settings.autoOfferTracking}
            onChange={(event) =>
              void updateSetting('autoOfferTracking', event.target.checked)
            }
          />
          <span>Automatically offer tracking on supported meeting pages</span>
        </label>

        <label className="options__field" htmlFor="default-sensitivity">
          <span>Default sensitivity</span>
          <select
            id="default-sensitivity"
            value={settings.defaultSensitivity}
            onChange={(event) =>
              void updateSetting(
                'defaultSensitivity',
                event.target.value as SensitivityLevel,
              )
            }
          >
            {SENSITIVITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <label className="options__field">
          <input
            type="checkbox"
            checked={settings.saveMeetingSummaries}
            onChange={(event) =>
              void updateSetting('saveMeetingSummaries', event.target.checked)
            }
          />
          <span>Save meeting summaries locally</span>
        </label>

        <label className="options__field">
          <input
            type="checkbox"
            checked={settings.deleteTemporarySessionDataAfterMeeting}
            onChange={(event) =>
              void updateSetting(
                'deleteTemporarySessionDataAfterMeeting',
                event.target.checked,
              )
            }
          />
          <span>Delete temporary session information after a meeting</span>
        </label>
      </form>

      <p className="options__status" role="status" aria-live="polite">
        {status === 'loading' && 'Loading settings…'}
        {status === 'saving' && 'Saving…'}
        {status === 'ready' && 'Settings saved locally.'}
        {status === 'error' && (errorMessage ?? 'Something went wrong.')}
      </p>
    </main>
  );
}
