export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

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
}

export type ExtensionMessage =
  | { type: 'NEW_LOG'; payload: NetworkLog }
  | { type: 'GET_LOGS'; tabId: number }
  | { type: 'LOGS_UPDATED'; tabId: number; logs: NetworkLog[] }
  | { type: 'CLEAR_LOGS'; tabId: number }
  | { type: 'GET_CAPTURE_SETTINGS' }
  | { type: 'UPDATE_CAPTURE_SETTINGS'; settings: CaptureSettings }
  | { type: 'CAPTURE_SETTINGS_UPDATED'; settings: CaptureSettings };
