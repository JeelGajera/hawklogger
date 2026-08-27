import type { StorageSnapshot } from '../types';

const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'passwd',
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'secret',
  'api_key',
  'apikey',
  'x-api-key',
  'x-auth-token',
  'ssn',
  'social_security',
  'credit_card',
  'card_number',
  'cvv',
  'private_key',
  'client_secret',
  'session',
  'sessionid',
  'sid',
  'jwt',
  'csrf',
  'xsrf',
  'connect.sid',
]);

const REDACTED = '[REDACTED]';

export function redact(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(redact);
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? REDACTED : redact(val);
    }
    return result;
  }

  return value;
}

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    result[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? REDACTED : value;
  }
  return result;
}

/** Same rules as redactHeaders, applied to cookie names / storage keys. */
export function redactKeyedValues(values: Record<string, string>): Record<string, string> {
  return redactHeaders(values);
}

export function redactStorageSnapshot(snapshot: StorageSnapshot): StorageSnapshot {
  return {
    ...snapshot,
    ...(snapshot.cookies != null ? { cookies: redactKeyedValues(snapshot.cookies) } : {}),
    ...(snapshot.localStorage != null ? { localStorage: redactKeyedValues(snapshot.localStorage) } : {}),
    ...(snapshot.sessionStorage != null
      ? { sessionStorage: redactKeyedValues(snapshot.sessionStorage) }
      : {}),
  };
}
