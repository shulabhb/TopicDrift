import { deriveMeetingKeyFromUrl, isLandingPath } from './meeting-key';
import { GOOGLE_MEET_SELECTORS, queryAny } from './selectors';

/** URL-only signal: Meet home or marketing landing pages. */
export function signalLandingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'meet.google.com' && isLandingPath(parsed.pathname);
  } catch {
    return false;
  }
}

/** URL-only signal: path contains a normalized room code. */
export function signalRoomUrl(url: string): boolean {
  return Boolean(deriveMeetingKeyFromUrl(url));
}

/**
 * Prejoin lobby exposes preview media and a join affordance before entering.
 * Uses structural selectors instead of localized button copy.
 */
export function signalPrejoinSurface(root: ParentNode = document): boolean {
  const hasPreview = queryAny(GOOGLE_MEET_SELECTORS.prejoinPreview, root);
  const hasJoinControl = queryAny(GOOGLE_MEET_SELECTORS.prejoinJoinControl, root);
  const hasCallToolbar = queryAny(GOOGLE_MEET_SELECTORS.callToolbar, root);

  return (hasPreview || hasJoinControl) && !hasCallToolbar;
}

/**
 * Active calls expose persistent call controls such as hang up and participant tiles.
 * Requires multiple in-call signals to avoid false positives on landing pages.
 */
export function signalInMeetingSurface(root: ParentNode = document): boolean {
  const hasToolbar = queryAny(GOOGLE_MEET_SELECTORS.callToolbar, root);
  const hasHangup = queryAny(GOOGLE_MEET_SELECTORS.hangupControl, root);
  const hasParticipants = queryAny(GOOGLE_MEET_SELECTORS.participantTiles, root);
  const hasTimer = queryAny(GOOGLE_MEET_SELECTORS.meetingTimer, root);

  const inCallSignals = [hasToolbar, hasHangup, hasParticipants, hasTimer].filter(
    Boolean,
  ).length;

  return inCallSignals >= 2;
}

/** Meet shell present but lifecycle is not yet classifiable. */
export function signalMeetAppPresent(root: ParentNode = document): boolean {
  return queryAny(GOOGLE_MEET_SELECTORS.appRoot, root);
}

/**
 * Leaving state: room URL remains but in-call controls disappear while app shell persists.
 */
export function signalLeavingSurface(
  url: string,
  root: ParentNode = document,
): boolean {
  return (
    signalRoomUrl(url) && signalMeetAppPresent(root) && !signalInMeetingSurface(root)
  );
}
