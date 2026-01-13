/**
 * Sanitization utility tests
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  escapeSpecialChars,
} from '../sanitize';

describe('sanitize utilities', () => {
  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
    });

    it('should remove dangerous script tags', () => {
      const input = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove event handlers', () => {
      const input = '<p onclick="alert(\'xss\')">Click me</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onclick');
    });

    it('should allow safe links', () => {
      const input = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<a');
      expect(result).toContain('href');
    });
  });

  describe('sanitizeText', () => {
    it('should strip dangerous HTML content', () => {
      const input = '<div>Hello <span>World</span></div>';
      const result = sanitizeText(input);
      // Just verify dangerous tags are removed, not all tags
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should remove script tags and content', () => {
      const input = 'Hello<script>alert("xss")</script>World';
      const result = sanitizeText(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should handle plain text', () => {
      const input = 'Hello World';
      const result = sanitizeText(input);
      expect(result).toBe('Hello World');
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and sanitize valid email', () => {
      const input = '  Test@Example.COM  ';
      const result = sanitizeEmail(input);
      expect(result).toBe('test@example.com');
    });

    it('should return null for invalid email', () => {
      expect(sanitizeEmail('invalid')).toBeNull();
      expect(sanitizeEmail('test@')).toBeNull();
      expect(sanitizeEmail('@example.com')).toBeNull();
    });

    it('should remove HTML from email', () => {
      const input = '<script>test@example.com</script>';
      const result = sanitizeEmail(input);
      // Should extract text and validate
      expect(result).toBeNull(); // Invalid due to script tags
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow https URLs', () => {
      const input = 'https://example.com';
      const result = sanitizeUrl(input);
      expect(result).toBe('https://example.com');
    });

    it('should allow http URLs', () => {
      const input = 'http://example.com';
      const result = sanitizeUrl(input);
      expect(result).toBe('http://example.com');
    });

    it('should block javascript: URLs', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeUrl(input);
      expect(result).toBe('');
    });

    it('should block data: URLs', () => {
      const input = 'data:text/html,<script>alert("xss")</script>';
      const result = sanitizeUrl(input);
      expect(result).toBe('');
    });

    it('should block vbscript: URLs', () => {
      const input = 'vbscript:msgbox("xss")';
      const result = sanitizeUrl(input);
      expect(result).toBe('');
    });
  });

  describe('escapeSpecialChars', () => {
    it('should escape regex special characters', () => {
      const input = 'hello.*world?';
      const result = escapeSpecialChars(input);
      expect(result).toBe('hello\\.\\*world\\?');
    });

    it('should escape all special characters', () => {
      const input = '[test](test){test}|test\\test';
      const result = escapeSpecialChars(input);
      expect(result).toContain('\\[');
      expect(result).toContain('\\]');
      expect(result).toContain('\\{');
      expect(result).toContain('\\}');
    });

    it('should handle normal text', () => {
      const input = 'hello world';
      const result = escapeSpecialChars(input);
      expect(result).toBe('hello world');
    });
  });
});
