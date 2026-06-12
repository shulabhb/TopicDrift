import { describe, expect, it } from 'vitest';
import { TranscriptIngest } from '@/src/services/transcript-ingest';
import { shouldObserveCaptions } from '@/src/services/caption-tracking';
import type { MeetingSession } from '@/src/types/session';

function activeSession(
  captionConsent: MeetingSession['captionConsent'] = 'not-requested',
): MeetingSession {
  return {
    id: 'session-1',
    meetingKey: 'abc-defg-hij',
    objective: 'Stay on roadmap',
    status: 'active',
    startedAt: 1,
    updatedAt: 1,
    captionConsent,
  };
}

describe('caption consent gating', () => {
  it('does not observe captions before explicit consent', () => {
    expect(
      shouldObserveCaptions({
        pageState: 'in-meeting',
        session: activeSession('not-requested'),
      }),
    ).toBe(false);
  });

  it('observes captions after consent is granted for active sessions', () => {
    expect(
      shouldObserveCaptions({
        pageState: 'in-meeting',
        session: activeSession('granted'),
      }),
    ).toBe(true);
  });

  it('does not observe captions when session is paused', () => {
    expect(
      shouldObserveCaptions({
        pageState: 'in-meeting',
        session: { ...activeSession('granted'), status: 'paused' },
      }),
    ).toBe(false);
  });

  it('does not observe captions when session is stopped', () => {
    expect(
      shouldObserveCaptions({
        pageState: 'in-meeting',
        session: { ...activeSession('granted'), status: 'stopped' },
      }),
    ).toBe(false);
  });
});

describe('transcript ingest pipeline', () => {
  it('normalizes whitespace', () => {
    const ingest = new TranscriptIngest();
    const segment = ingest.ingest({
      sourceId: 'line-1',
      text: '  hello   world  ',
    });

    expect(segment?.normalizedText).toBe('hello world');
  });

  it('deduplicates repeated text', () => {
    const ingest = new TranscriptIngest();
    ingest.ingest({ sourceId: 'line-1', text: 'Same sentence' });
    const duplicate = ingest.ingest({ sourceId: 'line-1', text: 'Same sentence' });

    expect(duplicate).toBeNull();
    expect(ingest.getStats().duplicateCount).toBe(1);
  });

  it('produces stable segment IDs for partial updates', () => {
    const ingest = new TranscriptIngest();
    const first = ingest.ingest({ sourceId: 'line-1', text: 'Hello' });
    const second = ingest.ingest({ sourceId: 'line-1', text: 'Hello team' });

    expect(first?.id).toBe(second?.id);
    expect(ingest.getStats().partialUpdateCount).toBe(1);
  });

  it('handles partial caption updates', () => {
    const ingest = new TranscriptIngest();
    ingest.ingest({ sourceId: 'line-1', text: 'Topic' });
    const updated = ingest.ingest({ sourceId: 'line-1', text: 'Topic drift' });

    expect(updated?.normalizedText).toBe('Topic drift');
    expect(ingest.getSegments()).toHaveLength(1);
  });

  it('keeps transcript in memory only', () => {
    const ingest = new TranscriptIngest();
    ingest.ingest({ sourceId: 'line-1', text: 'In memory only' });

    expect(ingest.getSegments()).toHaveLength(1);
    expect('localStorage' in globalThis).toBe(true);
    expect(localStorage.length).toBe(0);
  });
});
