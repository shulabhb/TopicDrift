import type { ParsedCaptionUpdate } from './caption-parser';
import {
  areCaptionsAvailable,
  collectCaptionUpdates,
  findCaptionContainer,
} from './caption-parser';

export type CaptionObserverState = 'idle' | 'watching' | 'observing' | 'stopped';

export interface CaptionObserverCallbacks {
  onCaptionUpdate: (update: ParsedCaptionUpdate) => void;
  onAvailabilityChange: (available: boolean) => void;
  onStateChange?: (state: CaptionObserverState) => void;
}

export interface CaptionObserverOptions extends CaptionObserverCallbacks {
  root?: ParentNode;
}

export function createCaptionObserver(options: CaptionObserverOptions): () => void {
  const root = options.root ?? document;
  let containerObserver: MutationObserver | null = null;
  let lineObserver: MutationObserver | null = null;
  let observedContainer: Element | null = null;
  let state: CaptionObserverState = 'idle';
  let availability = false;
  let scanTimer: ReturnType<typeof setTimeout> | null = null;
  const seenNodeText = new Map<string, string>();

  const setState = (next: CaptionObserverState) => {
    if (state === next) {
      return;
    }

    state = next;
    options.onStateChange?.(next);
  };

  const setAvailability = (next: boolean) => {
    if (availability === next) {
      return;
    }

    availability = next;
    options.onAvailabilityChange(next);
  };

  const emitUpdates = () => {
    const updates = collectCaptionUpdates(root);

    for (const update of updates) {
      const previous = seenNodeText.get(update.sourceId);

      if (previous === update.text) {
        continue;
      }

      seenNodeText.set(update.sourceId, update.text);
      options.onCaptionUpdate(update);
    }

    setAvailability(areCaptionsAvailable(root));
  };

  const scheduleScan = () => {
    if (scanTimer) {
      clearTimeout(scanTimer);
    }

    scanTimer = setTimeout(() => {
      scanTimer = null;
      emitUpdates();
    }, 80);
  };

  const detachLineObserver = () => {
    if (lineObserver) {
      lineObserver.disconnect();
      lineObserver = null;
    }

    observedContainer = null;
    seenNodeText.clear();
  };

  const attachLineObserver = (container: Element) => {
    if (observedContainer === container && lineObserver) {
      return;
    }

    detachLineObserver();
    observedContainer = container;
    setState('observing');

    lineObserver = new MutationObserver(() => {
      scheduleScan();
    });

    lineObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label', 'data-caption-text', 'data-caption-speaker'],
    });

    emitUpdates();
  };

  const evaluateContainer = () => {
    const container = findCaptionContainer(root);

    if (!container) {
      detachLineObserver();
      setState('watching');
      setAvailability(false);
      return;
    }

    attachLineObserver(container);
  };

  setState('watching');
  evaluateContainer();

  if (typeof MutationObserver !== 'undefined') {
    containerObserver = new MutationObserver(() => {
      evaluateContainer();
    });

    containerObserver.observe(root as Node, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-caption-window', 'aria-label', 'aria-live'],
    });
  }

  return () => {
    setState('stopped');

    if (containerObserver) {
      containerObserver.disconnect();
      containerObserver = null;
    }

    detachLineObserver();

    if (scanTimer) {
      clearTimeout(scanTimer);
      scanTimer = null;
    }
  };
}
