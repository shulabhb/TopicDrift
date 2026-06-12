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
  const hasMediaControls = queryAny(GOOGLE_MEET_SELECTORS.mediaControls, root);

  return (hasPreview || hasJoinControl) && !hasCallToolbar && !hasMediaControls;
}

export interface InMeetingSignalSummary {
  toolbar: boolean;
  hangup: boolean;
  participants: boolean;
  timer: boolean;
  conferenceVideos: boolean;
  mediaControls: boolean;
  inMeetingMatchedCount: number;
}

export function summarizeInMeetingSignals(
  root: ParentNode = document,
): InMeetingSignalSummary {
  const toolbar = queryAny(GOOGLE_MEET_SELECTORS.callToolbar, root);
  const hangup = queryAny(GOOGLE_MEET_SELECTORS.hangupControl, root);
  const participants = queryAny(GOOGLE_MEET_SELECTORS.participantTiles, root);
  const timer = queryAny(GOOGLE_MEET_SELECTORS.meetingTimer, root);
  const conferenceVideos = queryAny(GOOGLE_MEET_SELECTORS.conferenceVideos, root);
  const mediaControls = queryAny(GOOGLE_MEET_SELECTORS.mediaControls, root);

  const matched = [
    toolbar,
    hangup,
    participants,
    timer,
    conferenceVideos,
    mediaControls,
  ].filter(Boolean);

  return {
    toolbar,
    hangup,
    participants,
    timer,
    conferenceVideos,
    mediaControls,
    inMeetingMatchedCount: matched.length,
  };
}

/**
 * Active calls expose persistent call controls such as hang up and participant tiles.
 * Requires multiple in-call signals to avoid false positives on landing pages.
 */
export function signalInMeetingSurface(root: ParentNode = document): boolean {
  const summary = summarizeInMeetingSignals(root);

  // Require hangup or toolbar plus at least one additional in-call signal.
  const hasCoreControl = summary.hangup || summary.toolbar;
  const supportingSignals =
    summary.inMeetingMatchedCount - (summary.hangup || summary.toolbar ? 1 : 0);

  return hasCoreControl && supportingSignals >= 1 && summary.inMeetingMatchedCount >= 2;
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

export function summarizeLifecycleSignals(url: string, root: ParentNode = document) {
  const inMeeting = summarizeInMeetingSignals(root);

  return {
    roomUrl: signalRoomUrl(url),
    prejoin: signalPrejoinSurface(root),
    toolbar: inMeeting.toolbar,
    hangup: inMeeting.hangup,
    participants: inMeeting.participants,
    timer: inMeeting.timer,
    conferenceVideos: inMeeting.conferenceVideos,
    mediaControls: inMeeting.mediaControls,
    inMeetingMatchedCount: inMeeting.inMeetingMatchedCount,
  };
}
