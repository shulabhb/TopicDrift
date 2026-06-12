export interface TranscriptSegment {
  id: string;
  timestamp: number;
  speaker?: string;
  text: string;
  normalizedText: string;
}

export interface TranscriptWindow {
  segments: TranscriptSegment[];
  startTimestamp: number;
  endTimestamp: number;
}
