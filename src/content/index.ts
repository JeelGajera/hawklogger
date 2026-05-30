window.addEventListener('message', bridgeHawkLoggerMessage);

function bridgeHawkLoggerMessage(event: MessageEvent): void {
  if (event.source !== window) return;
  if (!isHawkLoggerMessage(event.data)) return;
  if (event.data.type !== 'NEW_LOG') return;

  try {
    chrome.runtime.sendMessage(event.data).catch(() => {});
  } catch {
    window.removeEventListener('message', bridgeHawkLoggerMessage);
  }
}

function isHawkLoggerMessage(data: unknown): data is { __DEVTOOL_SOURCE__: true; type: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    '__DEVTOOL_SOURCE__' in data &&
    data.__DEVTOOL_SOURCE__ === true &&
    'type' in data
  );
}
