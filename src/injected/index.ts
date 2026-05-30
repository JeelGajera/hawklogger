import type { ExtensionMessage, HttpMethod, NetworkLog } from '../types';

const MAX_BODY_SIZE = 1 * 1024 * 1024;
const BINARY_BODY_PLACEHOLDER = '[binary data - body not captured]';

let requestCounter = 0;
const windowWithState = window as Window &
  typeof globalThis & {
    __HAWKLOGGER_INSTALLED__?: boolean;
  };

if (!windowWithState.__HAWKLOGGER_INSTALLED__) {
  windowWithState.__HAWKLOGGER_INSTALLED__ = true;
  installFetchInterceptor();
  installXhrInterceptor();
}

function installFetchInterceptor(): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (...args: Parameters<typeof fetch>): Promise<Response> {
    const id = nextRequestId();
    const startTime = Date.now();
    const [resource, config] = args;
    const request = resource instanceof Request ? resource : null;
    const url =
      typeof resource === 'string'
        ? resource
        : resource instanceof URL
          ? resource.toString()
          : resource.url;
    const method = getFetchMethod(request, config);
    const reqHeaders = getFetchHeaders(request, config);
    const reqBody = config?.body != null ? parseBody(config.body) : null;

    let response: Response;
    try {
      response = await originalFetch(...args);
    } catch (networkError) {
      const log: NetworkLog = {
        id,
        url,
        method,
        status: 0,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        reqHeaders,
        reqBody,
        resHeaders: {},
        resBody: null,
        error: networkError instanceof Error ? networkError.message : String(networkError),
        isError: true,
      };
      sendLog(log);
      throw networkError;
    }

    const status = response.status;
    const resHeaders = Object.fromEntries(response.headers.entries());
    const contentType = response.headers.get('content-type');
    const contentLength = parseContentLength(response.headers.get('content-length'));
    const skippedBody = getBodySkipReason(contentType, contentLength);

    if (skippedBody != null) {
      const log: NetworkLog = {
        id,
        url,
        method,
        status,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        reqHeaders,
        reqBody,
        resHeaders,
        resBody: skippedBody,
        isError: status >= 400,
      };
      sendLog(log);
      return response;
    }

    const cloned = response.clone();

    cloned
      .text()
      .then((text) => {
        const log: NetworkLog = {
          id,
          url,
          method,
          status,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          reqHeaders,
          reqBody,
          resHeaders,
          resBody: parseBody(text),
          isError: status >= 400,
        };
        sendLog(log);
      })
      .catch(() => {
        const log: NetworkLog = {
          id,
          url,
          method,
          status,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          reqHeaders,
          reqBody,
          resHeaders,
          resBody: '[binary or streaming - body not captured]',
          isError: status >= 400,
        };
        sendLog(log);
      });

    return response;
  };
}

function installXhrInterceptor(): void {
  const OriginalXMLHttpRequest = window.XMLHttpRequest;

  const XMLHttpRequestInterceptor = function XMLHttpRequestInterceptor(): XMLHttpRequest {
    const xhr = new OriginalXMLHttpRequest();
    const id = nextRequestId();
    const reqHeaders: Record<string, string> = {};
    let method: HttpMethod = 'GET';
    let url = '';
    let startTime = 0;
    let reqBody: unknown | null = null;

    const originalOpen = xhr.open.bind(xhr);
    xhr.open = function open(
      rawMethod: string,
      rawUrl: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ): void {
      method = normalizeMethod(rawMethod);
      url = rawUrl.toString();
      originalOpen(rawMethod, rawUrl, async ?? true, username ?? undefined, password ?? undefined);
    };

    const originalSetRequestHeader = xhr.setRequestHeader.bind(xhr);
    xhr.setRequestHeader = function setRequestHeader(header: string, value: string): void {
      reqHeaders[header.toLowerCase()] = value;
      originalSetRequestHeader(header, value);
    };

    const originalSend = xhr.send.bind(xhr);
    xhr.send = function send(body?: Document | XMLHttpRequestBodyInit | null): void {
      startTime = Date.now();
      reqBody = body != null ? parseBody(body) : null;
      originalSend(body);
    };

    xhr.addEventListener('loadend', () => {
      const status = xhr.status === 0 ? 0 : xhr.status;
      const log: NetworkLog = {
        id,
        url,
        method,
        status,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        reqHeaders,
        reqBody,
        resHeaders: parseRawHeaders(xhr.getAllResponseHeaders()),
        resBody: readXhrBody(xhr),
        error: status === 0 ? 'XMLHttpRequest failed or was blocked' : undefined,
        isError: status === 0 || status >= 400,
      };
      sendLog(log);
    });

    return xhr;
  };

  XMLHttpRequestInterceptor.prototype = OriginalXMLHttpRequest.prototype;
  window.XMLHttpRequest = XMLHttpRequestInterceptor as unknown as typeof XMLHttpRequest;
}

function nextRequestId(): string {
  return `req_${Date.now()}_${requestCounter++}`;
}

function getFetchMethod(request: Request | null, config?: RequestInit): HttpMethod {
  const rawMethod = config?.method ?? request?.method ?? 'GET';
  return normalizeMethod(rawMethod);
}

function normalizeMethod(method: string): HttpMethod {
  const upper = method.toUpperCase();
  if (
    upper === 'GET' ||
    upper === 'POST' ||
    upper === 'PUT' ||
    upper === 'PATCH' ||
    upper === 'DELETE' ||
    upper === 'HEAD' ||
    upper === 'OPTIONS'
  ) {
    return upper;
  }
  return 'GET';
}

function getFetchHeaders(request: Request | null, config?: RequestInit): Record<string, string> {
  const headers = new Headers(request?.headers);
  if (config?.headers != null) {
    new Headers(config.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return Object.fromEntries(headers.entries());
}

function parseRawHeaders(rawHeaders: string): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of rawHeaders.trim().split(/[\r\n]+/)) {
    const index = line.indexOf(':');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key !== '') headers[key.toLowerCase()] = value;
  }
  return headers;
}

function readXhrBody(xhr: XMLHttpRequest): unknown | null {
  if (xhr.responseType !== '' && xhr.responseType !== 'text') {
    return BINARY_BODY_PLACEHOLDER;
  }

  const contentType = xhr.getResponseHeader('content-type');
  const contentLength = parseContentLength(xhr.getResponseHeader('content-length'));
  const skippedBody = getBodySkipReason(contentType, contentLength);
  if (skippedBody != null) {
    return skippedBody;
  }

  try {
    return parseBody(xhr.responseText);
  } catch {
    return '[response body unavailable]';
  }
}

function parseBody(body: unknown): unknown {
  if (body == null) return null;
  if (typeof body === 'string') {
    if (body.length > MAX_BODY_SIZE) {
      return formatBodyTooLarge(body.length);
    }
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  if (body instanceof URLSearchParams) {
    return Object.fromEntries(body.entries());
  }
  if (body instanceof Document) {
    return '[document body - not captured]';
  }
  if (body instanceof FormData) {
    const obj: Record<string, string> = {};
    body.forEach((value, key) => {
      obj[key] = value instanceof File ? `[File: ${value.name}]` : value;
    });
    return obj;
  }
  return '[binary body - not captured]';
}

function getBodySkipReason(contentType: string | null, contentLength: number | null): string | null {
  if (!isTextLike(contentType)) {
    return BINARY_BODY_PLACEHOLDER;
  }

  if (contentLength != null && contentLength > MAX_BODY_SIZE) {
    return formatBodyTooLarge(contentLength);
  }

  return null;
}

function isTextLike(contentType: string | null): boolean {
  if (contentType == null) return false;
  const lower = contentType.toLowerCase();
  return (
    lower.includes('json') ||
    lower.includes('text/') ||
    lower.includes('xml') ||
    lower.includes('javascript') ||
    lower.includes('x-www-form-urlencoded')
  );
}

function parseContentLength(value: string | null): number | null {
  if (value == null) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function formatBodyTooLarge(sizeInBytes: number): string {
  return `[body too large to capture - ${(sizeInBytes / 1024 / 1024).toFixed(2)} MB]`;
}

function sendLog(log: NetworkLog): void {
  const message: ExtensionMessage & { __DEVTOOL_SOURCE__: true } = {
    __DEVTOOL_SOURCE__: true,
    type: 'NEW_LOG',
    payload: log,
  };
  window.postMessage(message, '*');
}
