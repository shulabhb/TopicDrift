import type {
  MeetingPageState,
  MeetingStateObservation,
  PopupState,
  TabRuntimeState,
} from '@/src/types/meeting';
import { mapPageStateToPopupState } from '@/src/types/meeting';
import type { MeetingSession } from '@/src/types/session';

const tabStates = new Map<number, TabRuntimeState>();

export function setTabRuntimeState(
  tabId: number,
  partial: Partial<TabRuntimeState>,
): TabRuntimeState {
  const existing = tabStates.get(tabId);
  const next: TabRuntimeState = {
    tabId,
    platform: 'google-meet',
    pageState: partial.pageState ?? existing?.pageState ?? 'unknown',
    meetingKey: partial.meetingKey ?? existing?.meetingKey,
    contentScriptReady:
      partial.contentScriptReady ?? existing?.contentScriptReady ?? false,
    updatedAt: partial.updatedAt ?? Date.now(),
  };

  tabStates.set(tabId, next);
  return next;
}

export function getTabRuntimeState(tabId: number): TabRuntimeState | undefined {
  return tabStates.get(tabId);
}

export function removeTabRuntimeState(tabId: number): void {
  tabStates.delete(tabId);
}

export function applyMeetingObservation(
  tabId: number,
  observation: MeetingStateObservation,
): TabRuntimeState {
  return setTabRuntimeState(tabId, {
    pageState: observation.currentState,
    meetingKey: observation.meetingKey,
    updatedAt: observation.detectedAt,
  });
}

export function buildPopupState(
  tabState: TabRuntimeState | undefined,
  session: MeetingSession | null,
): PopupState {
  if (!tabState) {
    return {
      meetState: 'not-supported',
      contentScriptReady: false,
    };
  }

  const meetState = mapPageStateToPopupState(
    tabState.pageState,
    session,
    tabState.contentScriptReady,
  );

  return {
    meetState,
    meetingKey: tabState.meetingKey,
    objective: session?.objective,
    sessionStatus: session?.status,
    contentScriptReady: tabState.contentScriptReady,
  };
}

export function isMeetTabState(pageState: MeetingPageState): boolean {
  return pageState !== 'unsupported';
}
