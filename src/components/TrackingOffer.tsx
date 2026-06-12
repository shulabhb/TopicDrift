import './panel.css';

export interface TrackingOfferProps {
  onAccept: () => void;
  onDecline: () => void;
  onDismiss: () => void;
}

export function TrackingOffer({ onAccept, onDecline, onDismiss }: TrackingOfferProps) {
  return (
    <section className="td-panel" role="region" aria-labelledby="td-offer-title">
      <div className="td-widget__header">
        <h2 id="td-offer-title" className="td-panel__title">
          Keep this meeting on track?
        </h2>
        <button
          type="button"
          className="td-icon-button"
          aria-label="Dismiss tracking offer"
          onClick={onDismiss}
        >
          ×
        </button>
      </div>
      <p className="td-panel__body">
        TopicDrift can privately track your meeting objective. Conversation analysis is
        not active yet.
      </p>
      <div className="td-panel__actions">
        <button
          type="button"
          className="td-button td-button--primary"
          onClick={onAccept}
        >
          Set objective
        </button>
        <button type="button" className="td-button" onClick={onDecline}>
          Not now
        </button>
      </div>
    </section>
  );
}
