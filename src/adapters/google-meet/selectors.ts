/**
 * Centralized Google Meet DOM selectors and queries.
 * All Meet-specific selectors must live in this file.
 */

export const GOOGLE_MEET_SELECTORS = {
  /** Main application shell present on most Meet pages. */
  appRoot: '[data-meet-app], [data-meeting-app], div[role="main"]',
  /** Prejoin lobby often exposes a primary join action control. */
  prejoinJoinControl:
    '[data-prejoin-button], button[aria-label*="join" i], button[data-idom-class*="join"]',
  /** Preview video surface shown before entering a call. */
  prejoinPreview: '[data-preview], video[data-preview], div[data-self-preview]',
  /** Bottom call toolbar visible during active meetings. */
  callToolbar:
    '[data-call-toolbar], [role="toolbar"][aria-label*="call" i], footer[role="toolbar"]',
  /** Hang up / leave control cluster in active calls. */
  hangupControl:
    'button[aria-label*="leave" i], button[aria-label*="hang up" i], button[data-tooltip*="leave" i]',
  /** Participant media tiles typical once a call is active. */
  participantTiles:
    '[data-participant-id], [data-requested-participant-id], div[data-self-name]',
  /** Meeting timer or duration indicator shown during active calls. */
  meetingTimer:
    '[data-meeting-duration], [data-meeting-timer], [aria-label*="time" i][role="timer"]',
  /** Future caption observation selectors (not used in this phase). */
  captionContainer: '[data-caption-window]',
  captionLine: '[data-caption-text]',
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
