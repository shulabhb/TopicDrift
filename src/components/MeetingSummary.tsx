export interface MeetingSummaryData {
  objective: string;
  driftEvents: number;
  durationMinutes: number;
}

export interface MeetingSummaryProps {
  summary: MeetingSummaryData;
}

/**
 * TODO: Display a local post-meeting summary without exposing raw transcripts.
 */
export function MeetingSummary(_props: MeetingSummaryProps) {
  return null;
}
