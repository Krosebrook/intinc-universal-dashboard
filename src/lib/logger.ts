/**
 * Structured Logging Utility
 * Replaces console.log with severity-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || false;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    // In production, you would send logs to a logging service (e.g., Sentry, Datadog)
    // For now, we'll use console with structured format
    const logMethod = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn : 
                     console.log;

    if (this.isDevelopment) {
      // Pretty print in development
      logMethod(`[${entry.timestamp}] ${level.toUpperCase()}: ${message}`, context || '', error || '');
    } else {
      // JSON format in production for log aggregation
      logMethod(JSON.stringify(entry));
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  /**
   * Log API request/response for debugging
   */
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, { data });
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    this.debug(`API Response: ${method} ${url} [${status}]`, { data });
  }

  /**
   * Log user actions for audit trail
   */
  userAction(action: string, userId: string, metadata?: Record<string, any>): void {
    this.info(`User Action: ${action}`, { userId, ...metadata });
  }
}

// Export singleton instance
export const logger = new Logger();
