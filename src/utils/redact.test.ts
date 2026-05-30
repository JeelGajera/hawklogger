import { describe, expect, it } from 'vitest';
import { redact, redactHeaders } from './redact';

describe('redact', () => {
  it('redacts known sensitive keys', () => {
    const input = { username: 'alice', password: 'hunter2' };
    expect(redact(input)).toEqual({
      username: 'alice',
      password: '[REDACTED]',
    });
  });

  it('is case-insensitive on keys', () => {
    const input = { Authorization: 'Bearer abc123' };
    expect(redact(input)).toEqual({ Authorization: '[REDACTED]' });
  });

  it('recurses into nested objects', () => {
    const input = { user: { token: 'secret', name: 'bob' } };
    expect(redact(input)).toEqual({
      user: { token: '[REDACTED]', name: 'bob' },
    });
  });

  it('recurses into arrays', () => {
    const input = [{ password: 'x' }, { name: 'y' }];
    expect(redact(input)).toEqual([{ password: '[REDACTED]' }, { name: 'y' }]);
  });

  it('does not mutate the original object', () => {
    const input = { password: 'original' };
    redact(input);
    expect(input.password).toBe('original');
  });

  it('handles null and undefined', () => {
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
  });

  it('passes through non-sensitive primitive values', () => {
    expect(redact('hello')).toBe('hello');
    expect(redact(42)).toBe(42);
  });
});

describe('redactHeaders', () => {
  it('redacts authorization header', () => {
    const headers = {
      'content-type': 'application/json',
      authorization: 'Bearer token123',
    };
    const result = redactHeaders(headers);
    expect(result.authorization).toBe('[REDACTED]');
    expect(result['content-type']).toBe('application/json');
  });
});
