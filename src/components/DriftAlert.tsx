import type { DriftResult } from '@/src/types/drift';

export interface DriftAlertProps {
  result: DriftResult;
  onDismiss?: () => void;
  onMarkDetour?: () => void;
  onUpdateObjective?: () => void;
  onPause?: () => void;
}

/**
 * TODO: Render discreet drift warnings isolated from host-page styles.
 */
export function DriftAlert(_props: DriftAlertProps) {
  return null;
}
