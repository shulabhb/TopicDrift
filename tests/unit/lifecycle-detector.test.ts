import { describe, expect, it } from 'vitest';
import {
  deriveMeetingKeyFromUrl,
  isLandingPath,
} from '@/src/adapters/google-meet/meeting-key';
import {
  classifyMeetingPageState,
  createMeetingStateObservation,
} from '@/src/adapters/google-meet/lifecycle-detector';
import {
  FIXTURE_IN_MEETING,
  FIXTURE_LANDING,
  FIXTURE_PREJOIN,
} from '../fixtures/html/meet-dom-fixtures';

function mountFixture(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

describe('meeting key normalization', () => {
  it('derives room code without query parameters', () => {
    expect(deriveMeetingKeyFromUrl('https://meet.google.com/abc-defg-hij')).toBe(
      'abc-defg-hij',
    );
    expect(
      deriveMeetingKeyFromUrl('https://meet.google.com/abc-defg-hij?authuser=0'),
    ).toBe('abc-defg-hij');
  });

  it('rejects landing and malformed paths', () => {
    expect(deriveMeetingKeyFromUrl('https://meet.google.com/')).toBeUndefined();
    expect(deriveMeetingKeyFromUrl('https://meet.google.com/landing')).toBeUndefined();
    expect(isLandingPath('/')).toBe(true);
    expect(isLandingPath('/landing')).toBe(true);
  });
});

describe('lifecycle detector', () => {
  it('does not classify landing page as in-meeting', () => {
    const root = mountFixture(FIXTURE_LANDING);
    expect(classifyMeetingPageState('https://meet.google.com/landing', root)).toBe(
      'landing',
    );
    root.remove();
  });

  it('detects prejoin state', () => {
    const root = mountFixture(FIXTURE_PREJOIN);
    expect(classifyMeetingPageState('https://meet.google.com/abc-defg-hij', root)).toBe(
      'prejoin',
    );
    root.remove();
  });

  it('detects active meeting state from structural signals', () => {
    const root = mountFixture(FIXTURE_IN_MEETING);
    expect(classifyMeetingPageState('https://meet.google.com/abc-defg-hij', root)).toBe(
      'in-meeting',
    );
    root.remove();
  });

  it('emits observations with meeting keys only for room URLs', () => {
    const observation = createMeetingStateObservation(
      'in-meeting',
      'prejoin',
      'https://meet.google.com/abc-defg-hij',
      1000,
    );

    expect(observation.meetingKey).toBe('abc-defg-hij');
    expect(observation.previousState).toBe('prejoin');
  });
});
