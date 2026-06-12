export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = new Set([
  'text',
  'normalizedText',
  'transcript',
  'segments',
  'caption',
  'captions',
  'objective',
  'speaker',
  'url',
  'meetingUrl',
  'meetingKey',
]);

function sanitizeMeta(
  meta: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!meta) {
    return {};
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(key)) {
      sanitized[key] = '[redacted]';
      continue;
    }

    if (Array.isArray(value)) {
      sanitized[key] = `[array:${value.length}]`;
      continue;
    }

    if (typeof value === 'string' && value.length > 120) {
      sanitized[key] = `[string:${value.length}]`;
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

function shouldLog(level: LogLevel): boolean {
  if (import.meta.env.PROD && level === 'debug') {
    return false;
  }

  return true;
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) {
    return;
  }

  const payload = sanitizeMeta(meta);
  const prefix = `[TopicDrift:${level}]`;

  switch (level) {
    case 'debug':
      console.debug(prefix, message, payload);
      break;
    case 'info':
      console.info(prefix, message, payload);
      break;
    case 'warn':
      console.warn(prefix, message, payload);
      break;
    case 'error':
      console.error(prefix, message, payload);
      break;
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) =>
    write('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) =>
    write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) =>
    write('error', message, meta),
};
