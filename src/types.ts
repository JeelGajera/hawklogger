export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface ConsoleLogEntry {
  level: ConsoleLevel;
  message: string;
  timestamp: string;
}

export interface StorageSnapshot {
  cookies?: Record<string, string>;
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
  truncated?: boolean;
}

export interface NetworkLog {
  id: string;
  url: string;
  method: HttpMethod;
  status: number;
  duration: number;
  timestamp: string;
  reqHeaders: Record<string, string>;
  reqBody: unknown | null;
  resHeaders: Record<string, string>;
  resBody: unknown | null;
  error?: string;
  isError: boolean;
  consoleLogs?: ConsoleLogEntry[];
  storageSnapshot?: StorageSnapshot;
}

export interface FilterState {
  methods: HttpMethod[];
  statusClass: 'all' | '2xx' | '3xx' | '4xx' | '5xx' | 'failed';
  searchText: string;
  errorsOnly: boolean;
}

export interface CaptureSettings {
  mode: 'all' | 'saved';
  sites: string[];
  snapshot: SnapshotSettings;
}

/**
 * Controls the Failure Snapshot feature: extra context captured for failed
 * requests only (network errors, 4xx, 5xx). Each field is an independent
 * opt-in since cookies and storage can contain sensitive data.
 */
export interface SnapshotSettings {
  console: boolean;
  cookies: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
}

export type ExtensionMessage =
  | { type: 'NEW_LOG'; payload: NetworkLog }
  | { type: 'GET_LOGS'; tabId: number }
  | { type: 'LOGS_UPDATED'; tabId: number; logs: NetworkLog[] }
  | { type: 'CLEAR_LOGS'; tabId: number }
  | { type: 'GET_CAPTURE_SETTINGS' }
  | { type: 'UPDATE_CAPTURE_SETTINGS'; settings: CaptureSettings }
  | { type: 'CAPTURE_SETTINGS_UPDATED'; settings: CaptureSettings };
