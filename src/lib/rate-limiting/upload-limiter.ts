/**
 * Rate Limiting for File Uploads
 * Prevents abuse of CSV upload functionality
 */

import { RateLimiter } from './api-limiter';

// Upload rate limiter: 5 uploads per hour per user
export const uploadRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
});

/**
 * Validate file size before upload
 * @param file File to validate
 * @param maxSizeMB Maximum file size in MB
 * @returns true if file size is acceptable
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate file type
 * @param file File to validate
 * @param allowedTypes Array of allowed MIME types
 * @returns true if file type is allowed
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * CSV upload validation
 */
export function validateCsvUpload(file: File): { valid: boolean; error?: string } {
  if (!validateFileType(file, ['text/csv', 'application/vnd.ms-excel'])) {
    return { valid: false, error: 'Only CSV files are allowed' };
  }

  if (!validateFileSize(file, 10)) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  return { valid: true };
}
