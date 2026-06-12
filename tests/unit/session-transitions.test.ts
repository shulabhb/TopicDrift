import { describe, expect, it } from 'vitest';
import {
  createSession,
  pauseSession,
  resumeSession,
  stopSession,
  updateSessionObjective,
} from '@/src/services/session-transitions';
import { normalizeMeetingSession } from '@/src/types/session';

const baseSession = {
  id: 'session-1',
  meetingKey: 'abc-defg-hij',
  objective: 'Ship the roadmap',
  status: 'active' as const,
  startedAt: 1000,
  updatedAt: 1000,
};

describe('session transitions', () => {
  it('rejects empty objectives', () => {
    const result = createSession('abc-defg-hij', '   ');
    expect(result.ok).toBe(false);
  });

  it('trims objectives on create', () => {
    const result = createSession('abc-defg-hij', '  Align on launch scope  ');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.objective).toBe('Align on launch scope');
    }
  });

  it('enforces objective maximum length', () => {
    const result = createSession('abc-defg-hij', 'x'.repeat(501));
    expect(result.ok).toBe(false);
  });

  it('pauses and resumes only valid states', () => {
    const paused = pauseSession(baseSession, 2000);
    expect(paused.ok).toBe(true);

    const resumed = resumeSession(
      (paused as { value: typeof baseSession }).value,
      3000,
    );
    expect(resumed.ok).toBe(true);

    const invalidPause = pauseSession({ ...baseSession, status: 'paused' }, 4000);
    expect(invalidPause.ok).toBe(false);
  });

  it('updates objective and stops sessions', () => {
    const updated = updateSessionObjective(baseSession, 'New objective', 5000);
    expect(updated.ok).toBe(true);

    const stopped = stopSession(baseSession, 6000);
    expect(stopped.status).toBe('stopped');
    expect(stopped.endedAt).toBe(6000);
  });

  it('discards malformed stored sessions', () => {
    expect(normalizeMeetingSession({ id: '', meetingKey: 'abc' })).toBeNull();
    expect(
      normalizeMeetingSession({ id: 'x', meetingKey: 'abc', status: 'active' }),
    ).not.toBeNull();
  });
});
