import { useEffect, useState } from 'react';
import { fetchPageSupportState } from '@/src/services/messaging';
import type { PageSupportState } from '@/src/types/meeting';
import './App.css';

function formatSupportState(state: PageSupportState | null): string {
  if (!state) {
    return 'Checking current page…';
  }

  if (state.supported) {
    return `Supported: Google Meet`;
  }

  if (state.reason === 'no-active-tab') {
    return 'No active tab detected';
  }

  return 'Current page is not supported yet';
}

export default function App() {
  const [supportState, setSupportState] = useState<PageSupportState | null>(null);
  const version = browser.runtime.getManifest().version;

  useEffect(() => {
    void fetchPageSupportState().then(setSupportState);
  }, []);

  const openOptions = () => {
    void browser.runtime.openOptionsPage();
  };

  return (
    <main className="popup">
      <header className="popup__header">
        <h1 className="popup__title">TopicDrift</h1>
        <p className="popup__tagline">
          Private, local topic-alignment tracking for online meetings.
        </p>
      </header>

      <section className="popup__section" aria-labelledby="support-status-heading">
        <h2 id="support-status-heading" className="popup__section-title">
          Page support
        </h2>
        <p className="popup__status" role="status">
          {formatSupportState(supportState)}
        </p>
      </section>

      <section className="popup__section" aria-labelledby="tracking-heading">
        <h2 id="tracking-heading" className="popup__section-title">
          Tracking
        </h2>
        <button type="button" className="popup__button" disabled aria-disabled="true">
          Start tracking (not implemented)
        </button>
        <p className="popup__hint">
          Meeting analysis has not started. Future versions will ask for your consent
          before reading captions.
        </p>
      </section>

      <footer className="popup__footer">
        <button type="button" className="popup__link-button" onClick={openOptions}>
          Open options
        </button>
        <span className="popup__version" aria-label={`Version ${version}`}>
          v{version}
        </span>
      </footer>
    </main>
  );
}
