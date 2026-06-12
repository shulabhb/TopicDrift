import type { MeetingPageState, MeetingStateObservation } from '@/src/types/meeting';
import { deriveMeetingKeyFromUrl } from './meeting-key';
import {
  signalInMeetingSurface,
  signalLandingUrl,
  signalLeavingSurface,
  signalMeetAppPresent,
  signalPrejoinSurface,
  signalRoomUrl,
} from './lifecycle-signals';

export interface LifecycleDetectorOptions {
  getUrl?: () => string;
  getRoot?: () => ParentNode;
  onStateChange: (observation: MeetingStateObservation) => void;
  observeMutations?: boolean;
}

export function classifyMeetingPageState(
  url: string,
  root: ParentNode = document,
): MeetingPageState {
  try {
    const parsed = new URL(url);

    if (parsed.hostname !== 'meet.google.com') {
      return 'unsupported';
    }

    if (signalLandingUrl(url)) {
      return 'landing';
    }

    if (signalInMeetingSurface(root)) {
      return 'in-meeting';
    }

    if (signalPrejoinSurface(root) && signalRoomUrl(url)) {
      return 'prejoin';
    }

    if (signalLeavingSurface(url, root)) {
      return 'leaving';
    }

    if (signalMeetAppPresent(root)) {
      return 'unknown';
    }

    return 'landing';
  } catch {
    return 'unsupported';
  }
}

export function createMeetingStateObservation(
  currentState: MeetingPageState,
  previousState: MeetingPageState | undefined,
  url: string,
  now = Date.now(),
): MeetingStateObservation {
  const meetingKey =
    currentState === 'in-meeting' ||
    currentState === 'prejoin' ||
    currentState === 'leaving'
      ? deriveMeetingKeyFromUrl(url)
      : undefined;

  return {
    currentState,
    previousState,
    meetingKey,
    detectedAt: now,
  };
}

export function createLifecycleDetector(options: LifecycleDetectorOptions): () => void {
  const getUrl = options.getUrl ?? (() => location.href);
  const getRoot = options.getRoot ?? (() => document);
  let previousState: MeetingPageState | undefined;
  let observer: MutationObserver | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const emitCurrentState = () => {
    const url = getUrl();
    const currentState = classifyMeetingPageState(url, getRoot());

    if (currentState === previousState) {
      return;
    }

    const observation = createMeetingStateObservation(currentState, previousState, url);
    previousState = currentState;
    options.onStateChange(observation);
  };

  const scheduleEvaluate = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      emitCurrentState();
    }, 150);
  };

  emitCurrentState();

  if (options.observeMutations !== false && typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(scheduleEvaluate);
    observer.observe(getRoot() as Node, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  const onPopState = () => scheduleEvaluate();
  window.addEventListener('popstate', onPopState);
  window.addEventListener('hashchange', onPopState);

  return () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    window.removeEventListener('popstate', onPopState);
    window.removeEventListener('hashchange', onPopState);
  };
}
