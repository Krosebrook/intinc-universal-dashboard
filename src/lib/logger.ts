/**
 * Structured Logging Utility
 * Replaces console.log with severity-aware logging
 * 
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger';
 * 
 * // Log different severity levels
 * logger.debug('Debug info', { userId: '123' });
 * logger.info('User logged in', { userId: '123', method: 'oauth' });
 * logger.warn('Rate limit approaching', { remaining: 5 });
 * logger.error('Database connection failed', error, { query: 'SELECT...' });
 * 
 * // Log API requests
 * logger.apiRequest('POST', '/api/dashboards', { name: 'Sales' });
 * logger.apiResponse('POST', '/api/dashboards', 201, { id: '123' });
 * 
 * // Log user actions for audit
 * logger.userAction('dashboard_created', userId, { dashboardId: '123' });
 * ```
 * 
 * @public
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

  /**
   * Internal logging method that formats and outputs log entries
   * @private
   */
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

  /**
   * Log debug information (development only)
   * @param message - Debug message
   * @param context - Additional context data
   */
  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Log informational messages
   * @param message - Info message
   * @param context - Additional context data
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning messages
   * @param message - Warning message
   * @param context - Additional context data
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error messages
   * @param message - Error message
   * @param error - Error object (optional)
   * @param context - Additional context data
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  /**
   * Log API request for debugging
   * @param method - HTTP method (GET, POST, etc.)
   * @param url - Request URL
   * @param data - Request payload
   */
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, { data });
  }

  /**
   * Log API response for debugging
   * @param method - HTTP method (GET, POST, etc.)
   * @param url - Request URL
   * @param status - HTTP status code
   * @param data - Response data
   */
  apiResponse(method: string, url: string, status: number, data?: any): void {
    this.debug(`API Response: ${method} ${url} [${status}]`, { data });
  }

  /**
   * Log user actions for audit trail
   * @param action - Action identifier (e.g., 'dashboard_created')
   * @param userId - User ID performing the action
   * @param metadata - Additional action metadata
   */
  userAction(action: string, userId: string, metadata?: Record<string, any>): void {
    this.info(`User Action: ${action}`, { userId, ...metadata });
  }
}

// Export singleton instance
export const logger = new Logger();
