import { describe, expect, it } from 'vitest';
import { parseUrl, safeDecode } from './parseUrl';

describe('parseUrl', () => {
  it('splits origin, pathname, search, and hash', () => {
    const result = parseUrl('https://api.example.com/v1/users/42?active=true&sort=name#profile');
    expect(result.valid).toBe(true);
    expect(result.origin).toBe('https://api.example.com');
    expect(result.pathname).toBe('/v1/users/42');
    expect(result.search).toBe('?active=true&sort=name');
    expect(result.hash).toBe('#profile');
  });

  it('extracts query params as a record', () => {
    const result = parseUrl('https://example.com/search?q=chrome+extension&page=2');
    expect(result.queryParams).toEqual({ q: 'chrome extension', page: '2' });
  });

  it('handles repeated keys by keeping the last value (URLSearchParams.forEach order)', () => {
    const result = parseUrl('https://example.com/?tag=a&tag=b');
    expect(result.queryParams.tag).toBe('b');
  });

  it('returns empty search/hash/queryParams when absent', () => {
    const result = parseUrl('https://example.com/health');
    expect(result.search).toBe('');
    expect(result.hash).toBe('');
    expect(result.queryParams).toEqual({});
  });

  it('falls back gracefully for an unparseable URL', () => {
    const result = parseUrl('not a url');
    expect(result.valid).toBe(false);
    expect(result.pathname).toBe('not a url');
  });
});

describe('safeDecode', () => {
  it('decodes percent-encoded characters', () => {
    expect(safeDecode('hello%20world')).toBe('hello world');
  });

  it('returns the original string when decoding fails', () => {
    expect(safeDecode('100% off')).toBe('100% off');
  });
});
