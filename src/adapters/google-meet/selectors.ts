/**
 * Centralized Google Meet DOM selectors and queries.
 * All Meet-specific selectors must live in this file.
 */

export const GOOGLE_MEET_SELECTORS = {
  /** Main application shell present on most Meet pages. */
  appRoot: '[data-meet-app], [data-meeting-app], div[role="main"]',
  /** Prejoin lobby often exposes a primary join action control. */
  prejoinJoinControl:
    '[data-prejoin-button], button[aria-label*="join" i], button[data-idom-class*="join"], button[aria-label*="ask to join" i]',
  /** Preview video surface shown before entering a call. */
  prejoinPreview:
    '[data-preview], video[data-preview], div[data-self-preview], div[data-precall-preview]',
  /** Bottom call toolbar visible during active meetings. */
  callToolbar:
    '[data-call-toolbar], [role="toolbar"][aria-label*="call" i], footer[role="toolbar"], div[role="toolbar"]',
  /** Hang up / leave control cluster in active calls. */
  hangupControl:
    'button[aria-label*="leave" i], button[aria-label*="hang up" i], button[data-tooltip*="leave" i], button[aria-label*="end call" i]',
  /** Participant media tiles typical once a call is active. */
  participantTiles:
    '[data-participant-id], [data-requested-participant-id], div[data-self-name], [data-allocation-index]',
  /** Meeting timer or duration indicator shown during active calls. */
  meetingTimer:
    '[data-meeting-duration], [data-meeting-timer], [aria-label*="time" i][role="timer"], [aria-label*="elapsed" i]',
  /** Active conference videos (exclude preview-only elements). */
  conferenceVideos: 'video:not([data-preview]):not([data-precall-preview])',
  /** Microphone/camera controls visible during active calls. */
  mediaControls:
    'button[aria-label*="microphone" i], button[aria-label*="camera" i], button[aria-label*="mute" i]',
  /** Live caption container region. */
  captionContainer:
    '[data-caption-window], [role="region"][aria-label*="caption" i], [aria-label*="Captions" i], div[jsname="dsyhDe"]',
  /** Individual caption text nodes. */
  captionLine:
    '[data-caption-text], [data-caption-line], [aria-live="polite"], [aria-live="assertive"]',
  /** Speaker label within a caption line when available. */
  captionSpeaker:
    '[data-caption-speaker], [data-speaker-name], span[aria-hidden="true"]',
} as const;

export type GoogleMeetSelectorKey = keyof typeof GOOGLE_MEET_SELECTORS;

export function queryFirst(
  selector: string,
  root: ParentNode = document,
): Element | null {
  return root.querySelector(selector);
}

export function queryAny(selector: string, root: ParentNode = document): boolean {
  return Boolean(root.querySelector(selector));
}

export function queryAll(selector: string, root: ParentNode = document): Element[] {
  return Array.from(root.querySelectorAll(selector));
}
