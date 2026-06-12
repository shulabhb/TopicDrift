import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MESSAGE_TYPES } from '@/src/types/messages';
import type { MeetingStateObservation } from '@/src/types/meeting';
import type { MeetingSession } from '@/src/types/session';
import { isErr } from '@/src/utils/result';
import { isActiveOrPausedSession } from '@/src/types/session';
import { createLifecycleDetector } from '@/src/adapters/google-meet/lifecycle-detector';
import { TrackingOffer } from '@/src/components/TrackingOffer';
import { MeetingObjectiveForm } from '@/src/components/MeetingObjectiveForm';
import { TrackingWidget } from '@/src/components/TrackingWidget';
import { onExtensionMessage, sendMessage } from '@/src/services/messaging';
import {
  shouldEndSessionForPageState,
  shouldShowTrackingOffer,
  type ContentUiMode,
} from '@/src/services/offer-policy';
import { getUserSettings } from '@/src/services/storage';
import {
  getSessionForMeeting,
  isOfferSuppressed,
} from '@/src/services/session-storage';

interface MeetAppProps {
  tabId?: number;
}

export function MeetApp({ tabId }: MeetAppProps) {
  const [observation, setObservation] = useState<MeetingStateObservation | null>(null);
  const [session, setSession] = useState<MeetingSession | null>(null);
  const [forcedMode, setForcedMode] = useState<ContentUiMode | null>(null);
  const [widgetMinimized, setWidgetMinimized] = useState(false);
  const [autoOfferTracking, setAutoOfferTracking] = useState(true);
  const [offerSuppressed, setOfferSuppressed] = useState(false);
  const [inMeetingSince, setInMeetingSince] = useState<number | undefined>();
  const [objectiveDraft, setObjectiveDraft] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const previousMeetingKeyRef = useRef<string | undefined>(undefined);

  const meetingKey = observation?.meetingKey;
  const pageState = observation?.currentState ?? 'unknown';
  const hasActiveSession = isActiveOrPausedSession(session);

  const refreshSession = useCallback(async (key?: string) => {
    if (!key) {
      setSession(null);
      return;
    }

    setSession(await getSessionForMeeting(key));
  }, []);

  const publishMeetingState = useCallback(
    async (nextObservation: MeetingStateObservation) => {
      if (nextObservation.currentState === 'in-meeting') {
        setInMeetingSince((current) => current ?? Date.now());
      } else {
        setInMeetingSince(undefined);
      }

      if (nextObservation.meetingKey !== previousMeetingKeyRef.current) {
        previousMeetingKeyRef.current = nextObservation.meetingKey;
        if (nextObservation.meetingKey) {
          setOfferSuppressed(await isOfferSuppressed(nextObservation.meetingKey));
          await refreshSession(nextObservation.meetingKey);
        } else {
          setOfferSuppressed(false);
          setSession(null);
        }
      }

      if (
        nextObservation.meetingKey &&
        shouldEndSessionForPageState(nextObservation.currentState)
      ) {
        setForcedMode(null);
        await refreshSession(nextObservation.meetingKey);
      }

      setObservation(nextObservation);
      await sendMessage({
        type: MESSAGE_TYPES.MEETING_STATE_CHANGED,
        payload: { ...nextObservation, tabId },
      });
    },
    [refreshSession, tabId],
  );

  useEffect(() => {
    const dispose = createLifecycleDetector({
      onStateChange: (nextObservation) => {
        void publishMeetingState(nextObservation);
      },
    });

    return dispose;
  }, [publishMeetingState]);

  useEffect(() => {
    void getUserSettings().then((settings) =>
      setAutoOfferTracking(settings.autoOfferTracking),
    );
  }, []);

  useEffect(() => {
    const unsubscribe = onExtensionMessage(async (message) => {
      if (message.type === MESSAGE_TYPES.SESSION_STATE_CHANGED) {
        if (!meetingKey || message.payload.meetingKey === meetingKey) {
          setSession(message.payload.session);
        }
        return undefined;
      }

      if (message.type === MESSAGE_TYPES.START_OBJECTIVE_SETUP) {
        setForcedMode('objective');
        return {
          type: MESSAGE_TYPES.ACTION_RESULT,
          payload: { ok: true, value: undefined },
        };
      }

      if (message.type === MESSAGE_TYPES.OPEN_MEETING_CONTROLS) {
        setWidgetMinimized(false);
        setForcedMode('widget');
        return {
          type: MESSAGE_TYPES.ACTION_RESULT,
          payload: { ok: true, value: undefined },
        };
      }

      if (message.type === MESSAGE_TYPES.CONTENT_ACTION) {
        if (message.payload.action === 'start-objective-setup') {
          setForcedMode('objective');
        }
        if (message.payload.action === 'open-controls') {
          setWidgetMinimized(false);
          setForcedMode('widget');
        }
      }

      return undefined;
    });

    return unsubscribe;
  }, [meetingKey]);

  const derivedMode = useMemo<ContentUiMode>(() => {
    if (forcedMode) {
      return forcedMode;
    }

    if (hasActiveSession) {
      return widgetMinimized ? 'widget-minimized' : 'widget';
    }

    const showOffer = shouldShowTrackingOffer({
      pageState,
      meetingKey,
      autoOfferTracking,
      offerSuppressed,
      hasActiveSession,
      uiMode: 'hidden',
      inMeetingSince,
    });

    return showOffer ? 'offer' : 'hidden';
  }, [
    forcedMode,
    hasActiveSession,
    widgetMinimized,
    pageState,
    meetingKey,
    autoOfferTracking,
    offerSuppressed,
    inMeetingSince,
  ]);

  const handleDeclineOrDismiss = useCallback(
    async (reason: 'declined' | 'dismissed') => {
      if (!meetingKey) {
        return;
      }

      await sendMessage({
        type: MESSAGE_TYPES.SUPPRESS_OFFER,
        payload: { meetingKey, reason },
      });
      setOfferSuppressed(true);
      setForcedMode(null);
    },
    [meetingKey],
  );

  const handleCreateSession = useCallback(
    async (objective: string) => {
      if (!meetingKey) {
        return;
      }

      setIsSaving(true);
      setActionError(null);

      const response = await sendMessage({
        type: MESSAGE_TYPES.CREATE_SESSION,
        payload: { meetingKey, objective, tabId },
      });

      setIsSaving(false);

      if (response?.type !== MESSAGE_TYPES.ACTION_RESULT || !response.payload.ok) {
        setActionError(
          response?.type === MESSAGE_TYPES.ACTION_RESULT && isErr(response.payload)
            ? response.payload.error
            : 'storage-failed',
        );
        return;
      }

      setSession(response.payload.value as MeetingSession);
      setObjectiveDraft('');
      setForcedMode('widget');
    },
    [meetingKey, tabId],
  );

  const runSessionAction = useCallback(
    async (
      type:
        | typeof MESSAGE_TYPES.PAUSE_SESSION
        | typeof MESSAGE_TYPES.RESUME_SESSION
        | typeof MESSAGE_TYPES.STOP_SESSION,
    ) => {
      if (!meetingKey) {
        return;
      }

      const response = await sendMessage({ type, payload: { meetingKey } });
      if (response?.type === MESSAGE_TYPES.ACTION_RESULT && response.payload.ok) {
        setSession(response.payload.value as MeetingSession);
        if (type === MESSAGE_TYPES.STOP_SESSION) {
          setForcedMode(null);
        }
      }
    },
    [meetingKey],
  );

  const content = useMemo(() => {
    if (derivedMode === 'offer') {
      return (
        <TrackingOffer
          onAccept={() => setForcedMode('objective')}
          onDecline={() => void handleDeclineOrDismiss('declined')}
          onDismiss={() => void handleDeclineOrDismiss('dismissed')}
        />
      );
    }

    if (derivedMode === 'objective') {
      return (
        <MeetingObjectiveForm
          initialValue={objectiveDraft}
          disabled={isSaving}
          errorCode={actionError}
          onCancel={() => {
            setActionError(null);
            setForcedMode(hasActiveSession ? 'widget' : null);
          }}
          onSubmit={(objective) => {
            setObjectiveDraft(objective);
            void handleCreateSession(objective);
          }}
        />
      );
    }

    if ((derivedMode === 'widget' || derivedMode === 'widget-minimized') && session) {
      return (
        <TrackingWidget
          objective={session.objective}
          status={session.status}
          minimized={derivedMode === 'widget-minimized'}
          onToggleMinimize={() => {
            setWidgetMinimized((current) => !current);
            setForcedMode(null);
          }}
          onPause={() => void runSessionAction(MESSAGE_TYPES.PAUSE_SESSION)}
          onResume={() => void runSessionAction(MESSAGE_TYPES.RESUME_SESSION)}
          onEdit={() => {
            setObjectiveDraft(session.objective);
            setForcedMode('objective');
          }}
          onStop={() => void runSessionAction(MESSAGE_TYPES.STOP_SESSION)}
        />
      );
    }

    if (import.meta.env.DEV) {
      return (
        <div className="td-panel" role="status">
          <p className="td-meta">TopicDrift dev — state: {pageState}</p>
        </div>
      );
    }

    return null;
  }, [
    derivedMode,
    objectiveDraft,
    isSaving,
    actionError,
    session,
    pageState,
    hasActiveSession,
    handleDeclineOrDismiss,
    handleCreateSession,
    runSessionAction,
  ]);

  if (!content) {
    return null;
  }

  return <div className="td-widget-host">{content}</div>;
}
