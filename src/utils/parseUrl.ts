export interface ParsedUrl {
  /** true if the URL parsed successfully. */
  valid: boolean;
  origin: string;
  pathname: string;
  /** Full "?a=1&b=2" search string, empty if none. */
  search: string;
  queryParams: Record<string, string>;
  /** Full "#section" hash, empty if none. */
  hash: string;
}

export function parseUrl(url: string): ParsedUrl {
  try {
    const parsed = new URL(url);
    const queryParams: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    return {
      valid: true,
      origin: parsed.origin,
      pathname: parsed.pathname,
      search: parsed.search,
      queryParams,
      hash: parsed.hash,
    };
  } catch {
    return { valid: false, origin: '', pathname: url, search: '', queryParams: {}, hash: '' };
  }
}

/** Best-effort human-readable form for search, safe against decode errors. */
export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
