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

  it('includes console logs when present', () => {
    const md = buildMarkdown({
      ...baseLog,
      consoleLogs: [{ level: 'error', message: 'stale cache', timestamp: '2024-01-15T10:29:59.500Z' }],
    });
    expect(md).toContain('### Console Logs');
    expect(md).toContain('ERROR: stale cache');
  });

  it('omits console logs section when empty or absent', () => {
    expect(buildMarkdown(baseLog)).not.toContain('### Console Logs');
    expect(buildMarkdown({ ...baseLog, consoleLogs: [] })).not.toContain('### Console Logs');
  });

  it('includes and redacts storage snapshot sections', () => {
    const md = buildMarkdown({
      ...baseLog,
      storageSnapshot: {
        cookies: { sessionid: 'abc123', theme: 'dark' },
        localStorage: { token: 'secret', lastPage: '/dashboard' },
      },
    });
    expect(md).toContain('### Cookies');
    expect(md).toContain('### Local Storage');
    expect(md).not.toContain('### Session Storage');
    expect(md).toContain('"theme": "dark"');
    expect(md).toContain('"lastPage": "/dashboard"');
    expect(md).not.toContain('abc123');
    expect(md).not.toContain('secret');
  });

  it('notes truncation when the snapshot was capped', () => {
    const md = buildMarkdown({
      ...baseLog,
      storageSnapshot: { cookies: { theme: 'dark' }, truncated: true },
    });
    expect(md).toContain('snapshot truncated');
  });
});
