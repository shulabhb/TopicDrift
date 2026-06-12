import type { CaptionObservation } from '@/src/adapters/meeting-adapter';
import { GOOGLE_MEET_SELECTORS } from './selectors';

/**
 * Observes Google Meet live captions from the DOM.
 *
 * TODO: Implement MutationObserver-based caption extraction after user activation.
 * Must not start automatically.
 */
export function createCaptionObserver(
  _onCaption: (observation: CaptionObservation) => void,
): () => void {
  void GOOGLE_MEET_SELECTORS.captionContainer;

  return () => {
    // Placeholder dispose
  };
}
