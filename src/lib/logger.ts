/**
 * Structured Logger
 *
 * Provides JSON-formatted logging for production observability.
 * Supports log levels, request context, and metadata.
 *
 * Usage:
 *   import { logger } from '@/src/lib/logger';
 *   logger.info('User submitted profile', { userId: '123' });
 *   logger.error('API call failed', new Error('timeout'), { endpoint: '/analyze' });
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  environment: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getMinLevel()];
}

function formatError(error: Error): LogEntry['error'] {
  return {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
  };
}

function createLogEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    ...meta,
  };

  if (error) {
    entry.error = formatError(error);
  }

  return entry;
}

function log(
  level: LogLevel,
  message: string,
  metaOrError?: Record<string, unknown> | Error,
  maybeError?: Error
): void {
  if (!shouldLog(level)) return;

  let meta: Record<string, unknown> | undefined;
  let error: Error | undefined;

  if (metaOrError instanceof Error) {
    error = metaOrError;
  } else {
    meta = metaOrError;
    error = maybeError;
  }

  const entry = createLogEntry(level, message, meta, error);
  const output = JSON.stringify(entry);

  switch (level) {
    case 'error':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) =>
    log('debug', message, meta),

  info: (message: string, meta?: Record<string, unknown>) =>
    log('info', message, meta),

  warn: (message: string, metaOrError?: Record<string, unknown> | Error, error?: Error) =>
    log('warn', message, metaOrError, error),

  error: (message: string, metaOrError?: Record<string, unknown> | Error, error?: Error) =>
    log('error', message, metaOrError, error),

  /**
   * Create a child logger with preset context
   * Useful for request-scoped logging
   */
  child: (context: Record<string, unknown>) => ({
    debug: (message: string, meta?: Record<string, unknown>) =>
      log('debug', message, { ...context, ...meta }),
    info: (message: string, meta?: Record<string, unknown>) =>
      log('info', message, { ...context, ...meta }),
    warn: (message: string, metaOrError?: Record<string, unknown> | Error, error?: Error) =>
      log('warn', message, metaOrError instanceof Error ? metaOrError : { ...context, ...metaOrError }, metaOrError instanceof Error ? undefined : error),
    error: (message: string, metaOrError?: Record<string, unknown> | Error, error?: Error) =>
      log('error', message, metaOrError instanceof Error ? metaOrError : { ...context, ...metaOrError }, metaOrError instanceof Error ? undefined : error),
  }),
};

export default logger;
