export function parseBody(body: unknown): unknown {
  if (body === null || body === undefined) return null;
  if (typeof body !== 'string') return body;
  if (body.trim() === '') return null;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export function formatBody(body: unknown): string {
  if (body === null || body === undefined) return '(empty)';
  if (typeof body === 'string') return body;
  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return '[unserializable body]';
  }
}

export function truncate(str: string, maxLength = 80): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

export function summarizeBody(body: unknown): string {
  if (body === null || body === undefined) return '(empty)';
  if (typeof body === 'string') {
    return truncate(body);
  }
  if (Array.isArray(body)) {
    return `[${body.length} items]`;
  }
  if (typeof body === 'object') {
    const keys = Object.keys(body);
    const preview = keys.slice(0, 3).join(', ');
    return `{ ${preview}${keys.length > 3 ? ', ...' : ''} }`;
  }
  if (typeof body === 'number' || typeof body === 'boolean' || typeof body === 'bigint') {
    return body.toString();
  }
  return '[unserializable body]';
}
