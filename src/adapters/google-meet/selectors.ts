/**
 * Centralized Google Meet DOM selectors.
 * All Meet-specific selectors must live in this file.
 *
 * TODO: Populate selectors when caption observation is implemented.
 */
export const GOOGLE_MEET_SELECTORS = {
  /** Container for live captions when enabled by the user in Meet. */
  captionContainer: '[data-caption-window], div[jsname="dsyhDe"]',
  /** Individual caption lines. */
  captionLine: '[data-caption-text]',
  /** Meeting stage indicator elements. */
  meetingRoot: '[data-meeting-title], div[role="main"]',
} as const;

export type GoogleMeetSelectorKey = keyof typeof GOOGLE_MEET_SELECTORS;
