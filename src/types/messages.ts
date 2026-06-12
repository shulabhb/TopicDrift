import type { UserSettings } from './settings';
import type { PageSupportState } from './meeting';
import type { DriftResult } from './drift';

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
  payload: { url: string };
}

export interface DriftResultMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.DRIFT_RESULT;
  payload: DriftResult;
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
  | DriftResultMessage;

export type ExtensionResponse =
  | PageSupportStateMessage
  | SettingsMessage
  | SettingsUpdatedMessage
  | PongMessage;

export function isExtensionMessage(value: unknown): value is ExtensionMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof (value as BaseMessage).type === 'string'
  );
}
