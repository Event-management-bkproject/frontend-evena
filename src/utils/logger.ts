/**
 * Logger utility for consistent logging across the application
 * Automatically disables debug logs in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Debug level logging - only shown in development
   */
  debug(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Info level logging
   */
  info(...args: unknown[]): void {
    console.info('[INFO]', ...args);
  }

  /**
   * Warning level logging
   */
  warn(...args: unknown[]): void {
    console.warn('[WARN]', ...args);
  }

  /**
   * Error level logging - always shown
   */
  error(...args: unknown[]): void {
    console.error('[ERROR]', ...args);
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, ...args: unknown[]): void {
    switch (level) {
      case 'debug':
        this.debug(...args);
        break;
      case 'info':
        this.info(...args);
        break;
      case 'warn':
        this.warn(...args);
        break;
      case 'error':
        this.error(...args);
        break;
    }
  }
}

export const logger = new Logger();
