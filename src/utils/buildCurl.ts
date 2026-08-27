import type { NetworkLog } from '../types';
import { formatBody } from './parseBody';
import { redact, redactHeaders } from './redact';

/**
 * Builds a copy-pasteable curl command for a request. Headers and body are
 * redacted the same way the Markdown export is - this is meant to be
 * pasted into a ticket or chat, not used to literally replay an
 * authenticated request.
 */
export function buildCurl(log: NetworkLog): string {
  const parts = [`curl '${escapeSingleQuotes(log.url)}'`];

  if (log.method !== 'GET') {
    parts.push(`-X ${log.method}`);
  }

  const headers = redactHeaders(log.reqHeaders);
  for (const [key, value] of Object.entries(headers)) {
    parts.push(`-H '${escapeSingleQuotes(`${key}: ${value}`)}'`);
  }

  if (log.reqBody != null) {
    const body = formatBody(redact(log.reqBody));
    parts.push(`--data-raw '${escapeSingleQuotes(body)}'`);
  }

  return parts.join(' \\\n  ');
}

function escapeSingleQuotes(value: string): string {
  return value.replace(/'/g, `'\\''`);
}
