import type { Result } from '@/src/utils/result';
import type { UserSettings } from './settings';
import type { PageSupportState } from './meeting';
import type { DriftResult } from './drift';
import type { MeetingSession, MeetingSessionStatus } from './session';
import type {
  MeetingPageState,
  MeetingStateObservation,
  PopupState,
  TabRuntimeState,
} from './meeting';

export const MESSAGE_TYPES = {
  PING: 'PING',
  PONG: 'PONG',
  GET_PAGE_SUPPORT_STATE: 'GET_PAGE_SUPPORT_STATE',
  PAGE_SUPPORT_STATE: 'PAGE_SUPPORT_STATE',
  GET_SETTINGS: 'GET_SETTINGS',
  SETTINGS: 'SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  CONTENT_SCRIPT_READY: 'CONTENT_SCRIPT_READY',
  DRIFT_RESULT: 'DRIFT_RESULT',
  GET_POPUP_STATE: 'GET_POPUP_STATE',
  POPUP_STATE: 'POPUP_STATE',
  MEETING_STATE_CHANGED: 'MEETING_STATE_CHANGED',
  SESSION_STATE_CHANGED: 'SESSION_STATE_CHANGED',
  GET_SESSION: 'GET_SESSION',
  SESSION: 'SESSION',
  CREATE_SESSION: 'CREATE_SESSION',
  UPDATE_SESSION_OBJECTIVE: 'UPDATE_SESSION_OBJECTIVE',
  PAUSE_SESSION: 'PAUSE_SESSION',
  RESUME_SESSION: 'RESUME_SESSION',
  STOP_SESSION: 'STOP_SESSION',
  SUPPRESS_OFFER: 'SUPPRESS_OFFER',
  START_OBJECTIVE_SETUP: 'START_OBJECTIVE_SETUP',
  OPEN_MEETING_CONTROLS: 'OPEN_MEETING_CONTROLS',
  CONTENT_ACTION: 'CONTENT_ACTION',
  ACTION_RESULT: 'ACTION_RESULT',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export interface BaseMessage {
  type: MessageType;
}

export interface PingMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.PING;
}

export interface PongMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.PONG;
}

export interface GetPageSupportStateMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.GET_PAGE_SUPPORT_STATE;
}

export interface PageSupportStateMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.PAGE_SUPPORT_STATE;
  payload: PageSupportState;
}

export interface GetSettingsMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.GET_SETTINGS;
}

export interface SettingsMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.SETTINGS;
  payload: UserSettings;
}

export interface UpdateSettingsMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.UPDATE_SETTINGS;
  payload: Partial<UserSettings>;
}

export interface SettingsUpdatedMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.SETTINGS_UPDATED;
  payload: UserSettings;
}

export interface ContentScriptReadyMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.CONTENT_SCRIPT_READY;
  payload: { tabId?: number };
}

export interface DriftResultMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.DRIFT_RESULT;
  payload: DriftResult;
}

export interface GetPopupStateMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.GET_POPUP_STATE;
}

export interface PopupStateMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.POPUP_STATE;
  payload: PopupState;
}

export interface MeetingStateChangedMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.MEETING_STATE_CHANGED;
  payload: MeetingStateObservation & { tabId?: number };
}

export interface SessionStateChangedMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.SESSION_STATE_CHANGED;
  payload: {
    meetingKey: string;
    tabId?: number;
    session: MeetingSession | null;
  };
}

export interface GetSessionMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.GET_SESSION;
  payload: { meetingKey: string };
}

export interface SessionMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.SESSION;
  payload: { session: MeetingSession | null };
}

export interface CreateSessionMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.CREATE_SESSION;
  payload: { meetingKey: string; objective: string; tabId?: number };
}

export interface UpdateSessionObjectiveMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.UPDATE_SESSION_OBJECTIVE;
  payload: { meetingKey: string; objective: string };
}

export interface PauseSessionMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.PAUSE_SESSION;
  payload: { meetingKey: string };
}

export interface ResumeSessionMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.RESUME_SESSION;
  payload: { meetingKey: string };
}

export interface StopSessionMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.STOP_SESSION;
  payload: { meetingKey: string };
}

export interface SuppressOfferMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.SUPPRESS_OFFER;
  payload: {
    meetingKey: string;
    reason: 'declined' | 'dismissed';
  };
}

export type ContentAction =
  | { action: 'start-objective-setup' }
  | { action: 'open-controls' }
  | { action: 'resume-session' };

export interface StartObjectiveSetupMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.START_OBJECTIVE_SETUP;
}

export interface OpenMeetingControlsMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.OPEN_MEETING_CONTROLS;
}

export interface ContentActionMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.CONTENT_ACTION;
  payload: ContentAction;
}

export interface ActionResultMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.ACTION_RESULT;
  payload: Result<unknown, string>;
}

export type ExtensionMessage =
  | PingMessage
  | PongMessage
  | GetPageSupportStateMessage
  | PageSupportStateMessage
  | GetSettingsMessage
  | SettingsMessage
  | UpdateSettingsMessage
  | SettingsUpdatedMessage
  | ContentScriptReadyMessage
  | DriftResultMessage
  | GetPopupStateMessage
  | PopupStateMessage
  | MeetingStateChangedMessage
  | SessionStateChangedMessage
  | GetSessionMessage
  | SessionMessage
  | CreateSessionMessage
  | UpdateSessionObjectiveMessage
  | PauseSessionMessage
  | ResumeSessionMessage
  | StopSessionMessage
  | SuppressOfferMessage
  | StartObjectiveSetupMessage
  | OpenMeetingControlsMessage
  | ContentActionMessage
  | ActionResultMessage;

export type ExtensionResponse =
  | PageSupportStateMessage
  | SettingsMessage
  | SettingsUpdatedMessage
  | PongMessage
  | PopupStateMessage
  | SessionMessage
  | ActionResultMessage;

export function isExtensionMessage(value: unknown): value is ExtensionMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof (value as BaseMessage).type === 'string'
  );
}

export type {
  MeetingPageState,
  MeetingStateObservation,
  PopupState,
  TabRuntimeState,
  MeetingSession,
  MeetingSessionStatus,
};
