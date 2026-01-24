import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkRateLimit,
  getClientIP,
  resetRateLimit,
  clearAllRateLimits,
} from '../rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    // Clear all rate limits before each test
    clearAllRateLimits();
    // Reset timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkRateLimit', () => {
    it('allows the first request from an IP', () => {
      const result = checkRateLimit('192.168.1.1');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9); // 10 - 1 = 9
    });

    it('decrements remaining count with each request', () => {
      const ip = '192.168.1.2';

      const result1 = checkRateLimit(ip);
      expect(result1.remaining).toBe(9);

      const result2 = checkRateLimit(ip);
      expect(result2.remaining).toBe(8);

      const result3 = checkRateLimit(ip);
      expect(result3.remaining).toBe(7);
    });

    it('blocks requests after limit is exceeded', () => {
      const ip = '192.168.1.3';

      // Make 10 allowed requests
      for (let i = 0; i < 10; i++) {
        const result = checkRateLimit(ip);
        expect(result.allowed).toBe(true);
      }

      // 11th request should be blocked
      const blockedResult = checkRateLimit(ip);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
    });

    it('tracks different IPs separately', () => {
      const ip1 = '10.0.0.1';
      const ip2 = '10.0.0.2';

      // Use up limit for ip1
      for (let i = 0; i < 10; i++) {
        checkRateLimit(ip1);
      }

      // ip1 should be blocked
      expect(checkRateLimit(ip1).allowed).toBe(false);

      // ip2 should still be allowed
      expect(checkRateLimit(ip2).allowed).toBe(true);
      expect(checkRateLimit(ip2).remaining).toBe(8);
    });

    it('resets limit after window expires', () => {
      const ip = '192.168.1.4';

      // Make 10 requests to hit the limit
      for (let i = 0; i < 10; i++) {
        checkRateLimit(ip);
      }

      // Should be blocked
      expect(checkRateLimit(ip).allowed).toBe(false);

      // Advance time by 15 minutes + 1ms
      vi.advanceTimersByTime(15 * 60 * 1000 + 1);

      // Should be allowed again
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('returns correct resetTime', () => {
      const ip = '192.168.1.5';
      const now = Date.now();

      const result = checkRateLimit(ip);

      // Reset time should be approximately 15 minutes from now
      const expectedResetTime = now + 15 * 60 * 1000;
      expect(result.resetTime).toBeGreaterThanOrEqual(expectedResetTime - 100);
      expect(result.resetTime).toBeLessThanOrEqual(expectedResetTime + 100);
    });
  });

  describe('getClientIP', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '203.0.113.195');

      expect(getClientIP(headers)).toBe('203.0.113.195');
    });

    it('extracts first IP from comma-separated x-forwarded-for', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '203.0.113.195, 70.41.3.18, 150.172.238.178');

      expect(getClientIP(headers)).toBe('203.0.113.195');
    });

    it('trims whitespace from x-forwarded-for IP', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '  203.0.113.195  , 70.41.3.18');

      expect(getClientIP(headers)).toBe('203.0.113.195');
    });

    it('extracts IP from x-real-ip header', () => {
      const headers = new Headers();
      headers.set('x-real-ip', '198.51.100.178');

      expect(getClientIP(headers)).toBe('198.51.100.178');
    });

    it('extracts IP from cf-connecting-ip header (Cloudflare)', () => {
      const headers = new Headers();
      headers.set('cf-connecting-ip', '198.51.100.100');

      expect(getClientIP(headers)).toBe('198.51.100.100');
    });

    it('prefers x-forwarded-for over x-real-ip', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '203.0.113.195');
      headers.set('x-real-ip', '198.51.100.178');

      expect(getClientIP(headers)).toBe('203.0.113.195');
    });

    it('prefers x-real-ip over cf-connecting-ip', () => {
      const headers = new Headers();
      headers.set('x-real-ip', '198.51.100.178');
      headers.set('cf-connecting-ip', '198.51.100.100');

      expect(getClientIP(headers)).toBe('198.51.100.178');
    });

    it('returns "unknown" when no IP headers are present', () => {
      const headers = new Headers();

      expect(getClientIP(headers)).toBe('unknown');
    });
  });

  describe('resetRateLimit', () => {
    it('resets rate limit for a specific IP', () => {
      const ip = '192.168.1.10';

      // Make some requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ip);
      }

      expect(checkRateLimit(ip).remaining).toBe(4);

      // Reset the IP
      resetRateLimit(ip);

      // Should have full limit again
      expect(checkRateLimit(ip).remaining).toBe(9);
    });

    it('does not affect other IPs', () => {
      const ip1 = '192.168.1.11';
      const ip2 = '192.168.1.12';

      // Make requests for both IPs
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ip1);
        checkRateLimit(ip2);
      }

      // Reset only ip1
      resetRateLimit(ip1);

      // ip1 should be reset
      expect(checkRateLimit(ip1).remaining).toBe(9);

      // ip2 should still have limited remaining
      expect(checkRateLimit(ip2).remaining).toBe(4);
    });
  });

  describe('clearAllRateLimits', () => {
    it('clears rate limits for all IPs', () => {
      const ips = ['10.0.0.1', '10.0.0.2', '10.0.0.3'];

      // Make requests for all IPs
      for (const ip of ips) {
        for (let i = 0; i < 5; i++) {
          checkRateLimit(ip);
        }
      }

      // Clear all
      clearAllRateLimits();

      // All IPs should have full limit again
      for (const ip of ips) {
        expect(checkRateLimit(ip).remaining).toBe(9);
      }
    });
  });
});
