import { afterEach, describe, expect, it } from 'vitest';
import { createLifecycleDetector } from '@/src/adapters/google-meet/lifecycle-detector';
import { collectLifecycleDiagnostics } from '@/src/adapters/google-meet/lifecycle-diagnostics';
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

describe('lifecycle diagnostics', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps landing as landing', () => {
    const root = mountFixture(FIXTURE_LANDING);
    const diagnostics = collectLifecycleDiagnostics('https://meet.google.com/', root);

    expect(diagnostics.pageState).toBe('landing');
    expect(diagnostics.meetingKeyPresent).toBe(false);
  });

  it('keeps prejoin as prejoin', () => {
    const root = mountFixture(FIXTURE_PREJOIN);
    const diagnostics = collectLifecycleDiagnostics(
      'https://meet.google.com/abc-defg-hij',
      root,
    );

    expect(diagnostics.pageState).toBe('prejoin');
    expect(diagnostics.signals.prejoin).toBe(true);
  });

  it('classifies active-call fixture as in-meeting', () => {
    const root = mountFixture(FIXTURE_IN_MEETING);
    const diagnostics = collectLifecycleDiagnostics(
      'https://meet.google.com/abc-defg-hij',
      root,
    );

    expect(diagnostics.pageState).toBe('in-meeting');
    expect(diagnostics.inMeetingConfidence).toBeGreaterThanOrEqual(2);
  });

  it('does not expose URLs or meeting codes in signal summary', () => {
    const root = mountFixture(FIXTURE_IN_MEETING);
    const diagnostics = collectLifecycleDiagnostics(
      'https://meet.google.com/abc-defg-hij?authuser=0',
      root,
    );
    const serialized = JSON.stringify(diagnostics);

    expect(serialized).not.toContain('abc-defg-hij');
    expect(serialized).not.toContain('authuser');
    expect(serialized).not.toContain('https://');
  });

  it('cleans up lifecycle observer', () => {
    const root = mountFixture(FIXTURE_LANDING);
    const states: string[] = [];

    const dispose = createLifecycleDetector({
      getUrl: () => 'https://meet.google.com/',
      getRoot: () => root,
      observeMutations: false,
      onStateChange: (observation) => {
        states.push(observation.currentState);
      },
    });

    expect(states).toContain('landing');
    dispose();
    states.length = 0;
    root.innerHTML = FIXTURE_IN_MEETING;
    expect(states).toHaveLength(0);
  });
});
