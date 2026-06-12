import type { MeetingContext, MeetingObjective } from '@/src/types/meeting';
import type { DriftResult } from '@/src/types/drift';
import type { TranscriptSegment } from '@/src/types/transcript';

/**
 * Manages in-memory meeting session state.
 * Future implementation will coordinate lifecycle across content script and worker.
 */
export interface MeetingSession {
  id: string;
  context: MeetingContext;
  objective?: MeetingObjective;
  startedAt: number;
  lastDriftResult?: DriftResult;
}

export class SessionManager {
  private session: MeetingSession | null = null;

  getActiveSession(): MeetingSession | null {
    return this.session;
  }

  /**
   * TODO: Initialize a session when the user explicitly opts into tracking.
   */
  startSession(context: MeetingContext, objective: MeetingObjective): MeetingSession {
    this.session = {
      id: crypto.randomUUID(),
      context,
      objective,
      startedAt: Date.now(),
    };

    return this.session;
  }

  /**
   * TODO: Append transcript segments to the rolling analysis window.
   */
  appendSegments(_segments: TranscriptSegment[]): void {
    // Placeholder: segments are processed in-memory only in future implementation.
  }

  /**
   * TODO: End session and optionally persist summary based on user settings.
   */
  endSession(): void {
    this.session = null;
  }

  pauseSession(): void {
    if (this.session) {
      this.session.context.phase = 'paused';
    }
  }
}

export const sessionManager = new SessionManager();
