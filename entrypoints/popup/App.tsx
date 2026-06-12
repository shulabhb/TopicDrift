import { useEffect, useState } from 'react';
import {
  declineCaptionConsentFromPopup,
  fetchPopupState,
  grantCaptionConsentFromPopup,
  openMeetingControlsFromPopup,
  resumeSessionFromPopup,
  startObjectiveSetupFromPopup,
} from '@/src/services/messaging';
import type { PopupState } from '@/src/types/meeting';
import './App.css';

function formatCaptionTrackingState(state: PopupState['captionTrackingState']): string {
  switch (state) {
    case 'not-consented':
    case 'consent-declined':
      return 'Caption permission needed';
    case 'waiting-for-captions':
      return 'Waiting for captions';
    case 'captions-detected':
      return 'Captions detected';
    case 'paused':
      return 'Caption tracking paused';
    case 'stopped':
      return 'Caption tracking stopped';
    default:
      return 'Caption tracking not started';
  }
}

function formatPopupStatus(state: PopupState | null): string {
  if (!state) {
    return 'Checking current page…';
  }

  switch (state.meetState) {
    case 'not-supported':
      return 'This page is not supported. v1 currently supports Google Meet in Chrome.';
    case 'content-unavailable':
      return 'Open a Google Meet tab to use TopicDrift.';
    case 'landing':
      return 'Google Meet home page';
    case 'prejoin':
      return 'Google Meet pre-join screen';
    case 'in-meeting':
    case 'setup-available':
      return 'Active Google Meet call';
    case 'session-active':
      return 'TopicDrift session active';
    case 'session-paused':
      return 'TopicDrift session paused';
    case 'session-stopped':
      return 'TopicDrift session stopped';
    case 'uncertain':
      return 'Meeting state uncertain';
    default:
      return 'Checking current page…';
  }
}

export default function App() {
  const [popupState, setPopupState] = useState<PopupState | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const version = browser.runtime.getManifest().version;

  useEffect(() => {
    void fetchPopupState().then(setPopupState);
  }, []);

  const openOptions = () => {
    void browser.runtime.openOptionsPage();
  };

  const showSetObjective =
    popupState?.meetState === 'setup-available' ||
    popupState?.meetState === 'in-meeting';

  const showResume =
    popupState?.meetState === 'session-paused' && popupState.meetingKey;
  const showOpenControls =
    popupState?.meetState === 'session-active' ||
    popupState?.meetState === 'session-paused';

  const showCaptionConsent =
    (popupState?.meetState === 'session-active' ||
      popupState?.meetState === 'session-paused') &&
    popupState.captionConsent !== 'granted';

  const showCaptionDecline =
    popupState?.captionConsent === 'not-requested' ||
    popupState?.captionConsent === 'declined';

  const runAction = async (action: () => Promise<unknown>, success: string) => {
    setActionMessage(null);
    const result = await action();

    if (
      result &&
      typeof result === 'object' &&
      'ok' in result &&
      (result as { ok: boolean }).ok === false
    ) {
      setActionMessage('Unable to complete that action on this tab.');
      return;
    }

    setActionMessage(success);
    const refreshed = await fetchPopupState();
    setPopupState(refreshed);
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
          Current tab
        </h2>
        <p className="popup__status" role="status">
          {formatPopupStatus(popupState)}
        </p>
        {popupState?.objective ? (
          <p className="popup__hint">Objective saved for this meeting.</p>
        ) : null}
        {popupState?.captionTrackingState ? (
          <p className="popup__hint" role="status">
            {formatCaptionTrackingState(popupState.captionTrackingState)}
          </p>
        ) : null}
      </section>

      <section className="popup__section" aria-labelledby="tracking-heading">
        <h2 id="tracking-heading" className="popup__section-title">
          Tracking
        </h2>

        {showSetObjective ? (
          <button
            type="button"
            className="popup__button popup__button--enabled"
            onClick={() =>
              void runAction(
                startObjectiveSetupFromPopup,
                'Objective setup opened in Meet.',
              )
            }
          >
            Set meeting objective
          </button>
        ) : null}

        {showResume && popupState.meetingKey ? (
          <button
            type="button"
            className="popup__button popup__button--enabled"
            onClick={() =>
              void runAction(
                () => resumeSessionFromPopup(popupState.meetingKey!),
                'Session resumed.',
              )
            }
          >
            Resume tracking
          </button>
        ) : null}

        {showOpenControls ? (
          <button
            type="button"
            className="popup__button popup__button--enabled"
            onClick={() =>
              void runAction(
                openMeetingControlsFromPopup,
                'Meeting controls opened in Meet.',
              )
            }
          >
            Open meeting controls
          </button>
        ) : null}

        {showCaptionConsent && showCaptionDecline && popupState.meetingKey ? (
          <>
            <button
              type="button"
              className="popup__button popup__button--enabled"
              onClick={() =>
                void runAction(
                  () => grantCaptionConsentFromPopup(popupState.meetingKey!),
                  'Caption tracking enabled.',
                )
              }
            >
              Enable caption tracking
            </button>
            <button
              type="button"
              className="popup__button"
              onClick={() =>
                void runAction(
                  () => declineCaptionConsentFromPopup(popupState.meetingKey!),
                  'Caption tracking declined for now.',
                )
              }
            >
              Not now
            </button>
          </>
        ) : null}

        {!showSetObjective &&
        !showResume &&
        !showOpenControls &&
        !showCaptionConsent ? (
          <p className="popup__hint">
            Conversation analysis is not active yet. Join a Google Meet call to set an
            objective.
          </p>
        ) : (
          <p className="popup__hint">
            Topic drift analysis is not active yet. Captions are processed locally in
            memory only.
          </p>
        )}

        {actionMessage ? (
          <p className="popup__status" role="status" aria-live="polite">
            {actionMessage}
          </p>
        ) : null}
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
