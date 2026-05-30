import { describe, expect, it } from 'vitest';
import type { NetworkLog } from '../types';
import { buildMarkdown } from './buildMarkdown';

const baseLog: NetworkLog = {
  id: 'req_1_0',
  url: 'https://api.example.com/users',
  method: 'POST',
  status: 422,
  duration: 234,
  timestamp: '2024-01-15T10:30:00.000Z',
  reqHeaders: {
    'content-type': 'application/json',
    authorization: 'Bearer secret',
  },
  reqBody: { email: 'test@example.com' },
  resHeaders: { 'content-type': 'application/json' },
  resBody: { error: 'Validation failed', field: 'email' },
  isError: true,
};

describe('buildMarkdown', () => {
  it('includes method and URL in the header', () => {
    const md = buildMarkdown(baseLog);
    expect(md).toContain('## POST `https://api.example.com/users`');
  });

  it('shows status for 4xx', () => {
    const md = buildMarkdown(baseLog);
    expect(md).toContain('422');
  });

  it('shows network errors for status 0', () => {
    const md = buildMarkdown({
      ...baseLog,
      status: 0,
      error: 'Failed to fetch',
      isError: true,
    });
    expect(md).toContain('NETWORK ERROR');
  });

  it('redacts authorization header', () => {
    const md = buildMarkdown(baseLog);
    expect(md).toContain('[REDACTED]');
    expect(md).not.toContain('Bearer secret');
  });

  it('includes duration and timestamp', () => {
    const md = buildMarkdown(baseLog);
    expect(md).toContain('234ms');
    expect(md).toContain('2024-01-15T10:30:00.000Z');
  });

  it('includes response body', () => {
    const md = buildMarkdown(baseLog);
    expect(md).toContain('Validation failed');
  });

  it('handles null request body gracefully', () => {
    const md = buildMarkdown({ ...baseLog, reqBody: null });
    expect(md).not.toContain('### Request Body');
  });
});
