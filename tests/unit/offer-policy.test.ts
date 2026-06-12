import { describe, expect, it } from 'vitest';
import { shouldShowTrackingOffer } from '@/src/services/offer-policy';

describe('offer policy', () => {
  const now = 10_000;

  it('waits for stable in-meeting state', () => {
    expect(
      shouldShowTrackingOffer({
        pageState: 'in-meeting',
        meetingKey: 'abc-defg-hij',
        autoOfferTracking: true,
        offerSuppressed: false,
        hasActiveSession: false,
        uiMode: 'hidden',
        inMeetingSince: now - 500,
        now,
      }),
    ).toBe(false);

    expect(
      shouldShowTrackingOffer({
        pageState: 'in-meeting',
        meetingKey: 'abc-defg-hij',
        autoOfferTracking: true,
        offerSuppressed: false,
        hasActiveSession: false,
        uiMode: 'hidden',
        inMeetingSince: now - 2500,
        now,
      }),
    ).toBe(true);
  });

  it('does not offer on landing or when auto-offer is disabled', () => {
    expect(
      shouldShowTrackingOffer({
        pageState: 'landing',
        meetingKey: 'abc-defg-hij',
        autoOfferTracking: true,
        offerSuppressed: false,
        hasActiveSession: false,
        uiMode: 'hidden',
        inMeetingSince: now - 3000,
        now,
      }),
    ).toBe(false);

    expect(
      shouldShowTrackingOffer({
        pageState: 'in-meeting',
        meetingKey: 'abc-defg-hij',
        autoOfferTracking: false,
        offerSuppressed: false,
        hasActiveSession: false,
        uiMode: 'hidden',
        inMeetingSince: now - 3000,
        now,
      }),
    ).toBe(false);
  });

  it('respects suppression and active sessions', () => {
    expect(
      shouldShowTrackingOffer({
        pageState: 'in-meeting',
        meetingKey: 'abc-defg-hij',
        autoOfferTracking: true,
        offerSuppressed: true,
        hasActiveSession: false,
        uiMode: 'hidden',
        inMeetingSince: now - 3000,
        now,
      }),
    ).toBe(false);

    expect(
      shouldShowTrackingOffer({
        pageState: 'in-meeting',
        meetingKey: 'abc-defg-hij',
        autoOfferTracking: true,
        offerSuppressed: false,
        hasActiveSession: true,
        uiMode: 'hidden',
        inMeetingSince: now - 3000,
        now,
      }),
    ).toBe(false);
  });
});
