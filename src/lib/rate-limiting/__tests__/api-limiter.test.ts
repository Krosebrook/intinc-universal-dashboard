/**
 * Rate Limiter tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter, aiRateLimiter, apiRateLimiter } from '../api-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000,
    });
  });

  describe('check', () => {
    it('should allow requests within limit', () => {
      expect(limiter.check('user-1')).toBe(true);
      expect(limiter.check('user-1')).toBe(true);
      expect(limiter.check('user-1')).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      limiter.check('user-1');
      limiter.check('user-1');
      limiter.check('user-1');
      expect(limiter.check('user-1')).toBe(false);
    });

    it('should track different users separately', () => {
      limiter.check('user-1');
      limiter.check('user-1');
      limiter.check('user-1');
      
      // User 2 should still be able to make requests
      expect(limiter.check('user-2')).toBe(true);
    });

    it('should reset after time window', async () => {
      limiter.check('user-1');
      limiter.check('user-1');
      limiter.check('user-1');
      expect(limiter.check('user-1')).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(limiter.check('user-1')).toBe(true);
    });
  });

  describe('getRemaining', () => {
    it('should return correct remaining requests', () => {
      expect(limiter.getRemaining('user-1')).toBe(3);
      
      limiter.check('user-1');
      expect(limiter.getRemaining('user-1')).toBe(2);
      
      limiter.check('user-1');
      expect(limiter.getRemaining('user-1')).toBe(1);
      
      limiter.check('user-1');
      expect(limiter.getRemaining('user-1')).toBe(0);
    });
  });

  describe('getResetTime', () => {
    it('should return time until reset', () => {
      limiter.check('user-1');
      const resetTime = limiter.getResetTime('user-1');
      expect(resetTime).toBeGreaterThan(0);
      expect(resetTime).toBeLessThanOrEqual(1000);
    });

    it('should return 0 for users with no limits', () => {
      expect(limiter.getResetTime('user-1')).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear limits for specific user', () => {
      limiter.check('user-1');
      limiter.check('user-1');
      limiter.check('user-1');
      expect(limiter.check('user-1')).toBe(false);

      limiter.clear('user-1');
      expect(limiter.check('user-1')).toBe(true);
    });
  });

  describe('clearAll', () => {
    it('should clear all limits', () => {
      limiter.check('user-1');
      limiter.check('user-2');
      
      limiter.clearAll();
      
      expect(limiter.getRemaining('user-1')).toBe(3);
      expect(limiter.getRemaining('user-2')).toBe(3);
    });
  });
});

describe('pre-configured rate limiters', () => {
  it('should have aiRateLimiter configured', () => {
    expect(aiRateLimiter).toBeDefined();
    expect(aiRateLimiter.check('test-user')).toBe(true);
  });

  it('should have apiRateLimiter configured', () => {
    expect(apiRateLimiter).toBeDefined();
    expect(apiRateLimiter.check('test-user')).toBe(true);
  });
});
