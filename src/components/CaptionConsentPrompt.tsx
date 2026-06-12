import './panel.css';

export interface CaptionConsentPromptProps {
  onEnable: () => void;
  onDecline: () => void;
  disabled?: boolean;
}

export function CaptionConsentPrompt({
  onEnable,
  onDecline,
  disabled = false,
}: CaptionConsentPromptProps) {
  return (
    <section className="td-caption-consent" aria-labelledby="td-caption-consent-title">
      <h3 id="td-caption-consent-title" className="td-panel__title">
        Enable meeting caption tracking?
      </h3>
      <p className="td-panel__body">
        TopicDrift reads visible Google Meet captions locally in your browser to detect
        topic changes. Caption text is not uploaded.
      </p>
      <div className="td-widget__toolbar">
        <button
          type="button"
          className="td-button td-button--primary"
          onClick={onEnable}
          disabled={disabled}
        >
          Enable caption tracking
        </button>
        <button
          type="button"
          className="td-button"
          onClick={onDecline}
          disabled={disabled}
        >
          Not now
        </button>
      </div>
    </section>
  );
}
