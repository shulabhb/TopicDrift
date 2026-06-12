export type CaptionConsentStatus = 'not-requested' | 'declined' | 'granted' | 'revoked';

export const CAPTION_CONSENT_STATUSES: readonly CaptionConsentStatus[] = [
  'not-requested',
  'declined',
  'granted',
  'revoked',
] as const;

export type CaptionTrackingState =
  | 'not-consented'
  | 'consent-declined'
  | 'waiting-for-captions'
  | 'captions-detected'
  | 'paused'
  | 'stopped';

export function isCaptionConsentStatus(value: unknown): value is CaptionConsentStatus {
  return (
    typeof value === 'string' &&
    (CAPTION_CONSENT_STATUSES as readonly string[]).includes(value)
  );
}
