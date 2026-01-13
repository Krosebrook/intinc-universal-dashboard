/**
 * Input Sanitization Utilities
 * Protects against XSS and injection attacks
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Used for user-generated content like comments, dashboard names, etc.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize plain text by stripping all HTML tags
 * Used for dashboard names, widget titles, etc.
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize and validate email addresses
 */
export function sanitizeEmail(email: string): string | null {
  const sanitized = sanitizeText(email.trim().toLowerCase());
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : null;
}

/**
 * Sanitize URLs to prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string): string {
  const sanitized = url.trim();
  // Block dangerous protocols
  if (
    sanitized.toLowerCase().startsWith('javascript:') ||
    sanitized.toLowerCase().startsWith('data:') ||
    sanitized.toLowerCase().startsWith('vbscript:')
  ) {
    return '';
  }
  return sanitized;
}

/**
 * Escape special characters for use in regex or SQL-like queries
 */
export function escapeSpecialChars(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
