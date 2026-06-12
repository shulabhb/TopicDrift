import type { TranscriptSegment } from '@/src/types/transcript';

export interface RollingWindowOptions {
  windowSizeSeconds: number;
}

/**
 * Maintains a time-bounded transcript window for drift analysis.
 */
export class RollingWindow {
  private readonly windowSizeMs: number;
  private segments: TranscriptSegment[] = [];

  constructor(options: RollingWindowOptions) {
    this.windowSizeMs = options.windowSizeSeconds * 1000;
  }

  add(segment: TranscriptSegment): void {
    this.segments.push(segment);
    this.prune(segment.timestamp);
  }

  getSegments(): readonly TranscriptSegment[] {
    return this.segments;
  }

  private prune(currentTimestamp: number): void {
    const cutoff = currentTimestamp - this.windowSizeMs;
    this.segments = this.segments.filter((segment) => segment.timestamp >= cutoff);
  }
}
