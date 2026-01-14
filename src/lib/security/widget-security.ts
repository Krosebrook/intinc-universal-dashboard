/**
 * Widget Security Utilities
 * Phase 6.3: Performance & Security Isolation
 * 
 * Provides security boundaries and sanitization for user-defined widgets
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize widget configuration to prevent XSS and injection attacks
 */
export function sanitizeWidgetConfig(config: any): any {
  if (typeof config !== 'object' || config === null) {
    return config;
  }

  if (Array.isArray(config)) {
    return config.map(item => sanitizeWidgetConfig(item));
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(config)) {
    // Skip dangerous keys
    if (key.startsWith('__') || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (typeof value === 'string') {
      // Sanitize HTML strings
      if (value.includes('<') || value.includes('>')) {
        sanitized[key] = DOMPurify.sanitize(value, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span'],
          ALLOWED_ATTR: ['class']
        });
      } else {
        sanitized[key] = value;
      }
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeWidgetConfig(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate widget data to ensure it meets expected schema
 */
export function validateWidgetData(data: any[], schema?: {
  requiredFields?: string[];
  maxItems?: number;
  allowedTypes?: Record<string, 'string' | 'number' | 'boolean' | 'date'>;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { valid: false, errors };
  }

  if (schema?.maxItems && data.length > schema.maxItems) {
    errors.push(`Data exceeds maximum allowed items (${schema.maxItems})`);
  }

  if (schema?.requiredFields && data.length > 0) {
    const firstItem = data[0];
    schema.requiredFields.forEach(field => {
      if (!(field in firstItem)) {
        errors.push(`Required field missing: ${field}`);
      }
    });
  }

  if (schema?.allowedTypes && data.length > 0) {
    const firstItem = data[0];
    Object.entries(schema.allowedTypes).forEach(([field, expectedType]) => {
      if (field in firstItem) {
        const actualType = typeof firstItem[field];
        if (expectedType === 'date') {
          const isValidDate = !isNaN(Date.parse(firstItem[field]));
          if (!isValidDate) {
            errors.push(`Field ${field} is not a valid date`);
          }
        } else if (actualType !== expectedType) {
          errors.push(`Field ${field} expected ${expectedType}, got ${actualType}`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sandbox execution context for custom widget code
 * Prevents access to dangerous globals and APIs
 */
export function createWidgetSandbox() {
  const allowedGlobals = new Set([
    'Math',
    'Date',
    'JSON',
    'Object',
    'Array',
    'String',
    'Number',
    'Boolean',
    'console',
    'parseInt',
    'parseFloat',
    'isNaN',
    'isFinite'
  ]);

  return {
    /**
     * Execute a safe transformation function on widget data
     * 
     * WARNING: This sandbox provides basic security but is not foolproof.
     * For production use with untrusted code, consider:
     * - Using Web Workers for complete isolation
     * - Using vm2 for server-side execution
     * - Implementing stricter code validation
     * - Running in a separate iframe with restricted permissions
     */
    executeTransform: (code: string, data: any[]) => {
      try {
        // Create a safe execution context
        const sandbox: any = {};
        
        allowedGlobals.forEach(globalName => {
          sandbox[globalName] = (window as any)[globalName];
        });

        // Prevent access to dangerous APIs
        sandbox.window = undefined;
        sandbox.document = undefined;
        sandbox.eval = undefined;
        sandbox.Function = undefined;
        sandbox.fetch = undefined;
        sandbox.XMLHttpRequest = undefined;

        // Create a function with limited scope
        const fn = new Function('data', 'sandbox', `
          'use strict';
          with (sandbox) {
            return (${code})(data);
          }
        `);

        return fn(data, sandbox);
      } catch (error) {
        console.error('Widget transform error:', error);
        throw new Error('Failed to execute widget transformation');
      }
    },

    /**
     * Validate that code doesn't contain dangerous patterns
     */
    validateCode: (code: string): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      // Check for dangerous patterns
      const dangerousPatterns = [
        /eval\s*\(/gi,
        /Function\s*\(/gi,
        /setTimeout\s*\(/gi,
        /setInterval\s*\(/gi,
        /import\s+/gi,
        /require\s*\(/gi,
        /fetch\s*\(/gi,
        /XMLHttpRequest/gi,
        /document\./gi,
        /window\./gi,
        /__proto__/gi,
        /constructor\s*\(/gi
      ];

      dangerousPatterns.forEach(pattern => {
        if (pattern.test(code)) {
          errors.push(`Dangerous pattern detected: ${pattern.source}`);
        }
      });

      return {
        valid: errors.length === 0,
        errors
      };
    }
  };
}

/**
 * Rate limiter for widget operations
 */
export class WidgetRateLimiter {
  private operations: Map<string, number[]> = new Map();
  private readonly maxOps: number;
  private readonly windowMs: number;

  constructor(maxOps: number = 100, windowMs: number = 60000) {
    this.maxOps = maxOps;
    this.windowMs = windowMs;
  }

  check(widgetId: string): boolean {
    const now = Date.now();
    const ops = this.operations.get(widgetId) || [];
    
    // Remove old operations outside the window
    const recentOps = ops.filter(time => now - time < this.windowMs);
    
    if (recentOps.length >= this.maxOps) {
      return false;
    }

    recentOps.push(now);
    this.operations.set(widgetId, recentOps);
    return true;
  }

  reset(widgetId: string) {
    this.operations.delete(widgetId);
  }

  getRemaining(widgetId: string): number {
    const ops = this.operations.get(widgetId) || [];
    return Math.max(0, this.maxOps - ops.length);
  }
}

/**
 * Memory limit checker for widget data
 */
export function checkMemoryLimit(data: any, maxSizeBytes: number = 5 * 1024 * 1024): {
  withinLimit: boolean;
  sizeBytes: number;
  maxSizeBytes: number;
} {
  const jsonString = JSON.stringify(data);
  const sizeBytes = new Blob([jsonString]).size;
  
  return {
    withinLimit: sizeBytes <= maxSizeBytes,
    sizeBytes,
    maxSizeBytes
  };
}

/**
 * Secure error boundary for widgets
 */
export function sanitizeWidgetError(error: any): {
  message: string;
  stack?: string;
  type: string;
} {
  // Never expose full stack traces or internal details to users
  const sanitized = {
    message: 'An error occurred in the widget',
    type: 'WidgetError'
  };

  if (error instanceof Error) {
    // Only include safe error messages
    const safeMessages = [
      'Network request failed',
      'Invalid data format',
      'Validation error',
      'Calculation error',
      'Render error'
    ];

    const isSafe = safeMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );

    if (isSafe) {
      sanitized.message = error.message;
    }

    // In development, include stack trace
    if (process.env.NODE_ENV === 'development') {
      return {
        ...sanitized,
        stack: error.stack
      };
    }
  }

  return sanitized;
}

/**
 * Content Security Policy for widget iframes
 */
export const widgetCSP = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'],
  connectSrc: ["'self'"],
  fontSrc: ["'self'", 'data:'],
  objectSrc: ["'none'"],
  mediaSrc: ["'none'"],
  frameSrc: ["'none'"]
};

/**
 * Generate CSP header string for widget iframes
 */
export function generateWidgetCSPHeader(): string {
  return Object.entries(widgetCSP)
    .map(([key, values]) => {
      const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}
