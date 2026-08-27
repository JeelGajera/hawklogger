import { describe, expect, it } from 'vitest';
import type { NetworkLog } from '../types';
import { buildCurl } from './buildCurl';

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
  resHeaders: {},
  resBody: null,
  isError: true,
};

describe('buildCurl', () => {
  it('includes the URL', () => {
    expect(buildCurl(baseLog)).toContain(`curl 'https://api.example.com/users'`);
  });

  it('includes -X for non-GET methods but not GET', () => {
    expect(buildCurl(baseLog)).toContain('-X POST');
    expect(buildCurl({ ...baseLog, method: 'GET' })).not.toContain('-X GET');
  });

  it('redacts sensitive headers', () => {
    const curl = buildCurl(baseLog);
    expect(curl).toContain("authorization: [REDACTED]");
    expect(curl).not.toContain('Bearer secret');
  });

  it('includes non-sensitive headers verbatim', () => {
    expect(buildCurl(baseLog)).toContain('content-type: application/json');
  });

  it('includes a redacted request body', () => {
    const curl = buildCurl({
      ...baseLog,
      reqBody: { email: 'test@example.com', password: 'hunter2' },
    });
    expect(curl).toContain('--data-raw');
    expect(curl).toContain('test@example.com');
    expect(curl).toContain('[REDACTED]');
    expect(curl).not.toContain('hunter2');
  });

  it('omits --data-raw when there is no body', () => {
    expect(buildCurl({ ...baseLog, reqBody: null })).not.toContain('--data-raw');
  });

  it('escapes single quotes in the URL and body', () => {
    const curl = buildCurl({
      ...baseLog,
      url: `https://example.com/?q=it's`,
      reqBody: { note: `it's fine` },
    });
    expect(curl).toContain(`it'\\''s`);
  });
});
