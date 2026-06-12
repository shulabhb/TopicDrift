import type { TranscriptSegment } from '@/src/types/transcript';
import { createSegmentId, normalizeTranscriptText } from './transcript-normalize';

export interface CaptionIngestInput {
  sourceId: string;
  text: string;
  speaker?: string;
}

export interface TranscriptIngestStats {
  segmentCount: number;
  duplicateCount: number;
  partialUpdateCount: number;
  lastSegmentTimestamp?: number;
  lastSpeakerDetected: boolean;
}

interface SourceState {
  normalizedText: string;
  segmentId: string;
}

export class TranscriptIngest {
  private segments: TranscriptSegment[] = [];
  private sourceState = new Map<string, SourceState>();
  private emittedFingerprints = new Set<string>();
  private duplicateCount = 0;
  private partialUpdateCount = 0;
  private segmentCounter = 0;

  ingest(input: CaptionIngestInput, now = Date.now()): TranscriptSegment | null {
    const normalizedText = normalizeTranscriptText(input.text);

    if (!normalizedText) {
      return null;
    }

    const fingerprint = `${input.speaker ?? ''}|${normalizedText}`;
    const previous = this.sourceState.get(input.sourceId);

    if (previous?.normalizedText === normalizedText) {
      this.duplicateCount += 1;
      return null;
    }

    if (
      previous &&
      normalizedText.startsWith(previous.normalizedText) &&
      normalizedText.length > previous.normalizedText.length
    ) {
      this.partialUpdateCount += 1;
      const updated: TranscriptSegment = {
        id: previous.segmentId,
        timestamp: now,
        speaker: input.speaker,
        text: input.text.trim(),
        normalizedText,
      };

      this.replaceSegment(previous.segmentId, updated);
      this.sourceState.set(input.sourceId, {
        normalizedText,
        segmentId: previous.segmentId,
      });
      return updated;
    }

    if (this.emittedFingerprints.has(fingerprint)) {
      this.duplicateCount += 1;
      return null;
    }

    this.segmentCounter += 1;
    const segment: TranscriptSegment = {
      id: createSegmentId(this.segmentCounter, now),
      timestamp: now,
      speaker: input.speaker,
      text: input.text.trim(),
      normalizedText,
    };

    this.segments.push(segment);
    this.emittedFingerprints.add(fingerprint);
    this.sourceState.set(input.sourceId, {
      normalizedText,
      segmentId: segment.id,
    });

    return segment;
  }

  getSegments(): readonly TranscriptSegment[] {
    return this.segments;
  }

  getStats(): TranscriptIngestStats {
    const last = this.segments.at(-1);

    return {
      segmentCount: this.segments.length,
      duplicateCount: this.duplicateCount,
      partialUpdateCount: this.partialUpdateCount,
      lastSegmentTimestamp: last?.timestamp,
      lastSpeakerDetected: Boolean(last?.speaker),
    };
  }

  reset(): void {
    this.segments = [];
    this.sourceState.clear();
    this.emittedFingerprints.clear();
    this.duplicateCount = 0;
    this.partialUpdateCount = 0;
    this.segmentCounter = 0;
  }

  private replaceSegment(segmentId: string, updated: TranscriptSegment): void {
    const index = this.segments.findIndex((segment) => segment.id === segmentId);

    if (index >= 0) {
      this.segments[index] = updated;
    }
  }
}
