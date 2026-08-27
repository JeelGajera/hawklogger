import type { CaptureSettings, ExtensionMessage } from '../types';
import { HAWKLOGGER_SETTINGS_MESSAGE } from '../utils/bridgeMessages';

void chrome.runtime
  .sendMessage({ type: 'GET_CAPTURE_SETTINGS' } satisfies ExtensionMessage)
  .then((response: { settings: CaptureSettings } | undefined) => {
    if (response?.settings) relaySettingsToPage(response.settings);
  })
  .catch(() => {});

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  if (message.type === 'CAPTURE_SETTINGS_UPDATED') {
    relaySettingsToPage(message.settings);
  }
});

window.addEventListener('message', bridgeHawkLoggerMessage);

function relaySettingsToPage(settings: CaptureSettings): void {
  window.postMessage({ __DEVTOOL_SOURCE__: true, type: HAWKLOGGER_SETTINGS_MESSAGE, settings }, '*');
}

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
