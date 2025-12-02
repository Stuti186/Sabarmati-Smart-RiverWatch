/**
 * Logger Utility
 * Environment-aware logging that removes console.logs in production
 */

const isDevelopment = __DEV__;

type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (!isDevelopment) {
      // In production, only log errors
      return level === 'error';
    }
    return true;
  }

  log(...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log('[LOG]', ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: any[]): void {
    // Always log errors, even in production
    console.error('[ERROR]', ...args);
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  }
}

export const logger = new Logger();
export default logger;

