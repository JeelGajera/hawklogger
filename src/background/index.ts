import type { CaptureSettings, ExtensionMessage, NetworkLog } from '../types';

const store = new Map<number, NetworkLog[]>();
const hydratedTabs = new Set<number>();
const tabWriteQueues = new Map<number, Promise<void>>();
const MAX_LOGS_PER_TAB = 150;
const DEFAULT_CAPTURE_SETTINGS: CaptureSettings = { mode: 'all', sites: [] };
const CAPTURE_SETTINGS_KEY = 'captureSettings';

let captureSettings = DEFAULT_CAPTURE_SETTINGS;

void hydrateCaptureSettings();

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage & { __DEVTOOL_SOURCE__?: boolean },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) => {
    switch (message.type) {
      case 'NEW_LOG': {
        const tabId = sender.tab?.id;
        if (tabId == null) break;
        if (!shouldCapture(sender.tab?.url)) break;

        enqueueAppendLog(tabId, message.payload);
        break;
      }

      case 'GET_LOGS': {
        getLogs(message.tabId)
          .then((logs) => sendResponse({ logs }))
          .catch(() => sendResponse({ logs: [] }));
        return true;
      }

      case 'CLEAR_LOGS': {
        clearLogs(message.tabId)
          .then(() => sendResponse({ success: true }))
          .catch(() => sendResponse({ success: false }));
        return true;
      }

      case 'GET_CAPTURE_SETTINGS': {
        hydrateCaptureSettings()
          .then((settings) => sendResponse({ settings }))
          .catch(() => sendResponse({ settings: DEFAULT_CAPTURE_SETTINGS }));
        return true;
      }

      case 'UPDATE_CAPTURE_SETTINGS': {
        setCaptureSettings(message.settings)
          .then((settings) => sendResponse({ settings }))
          .catch(() => sendResponse({ settings: captureSettings }));
        return true;
      }
    }
  },
);

chrome.tabs.onRemoved.addListener((tabId: number) => {
  store.delete(tabId);
  hydratedTabs.delete(tabId);
  tabWriteQueues.delete(tabId);
  chrome.storage.session.remove(tabStorageKey(tabId)).catch(console.error);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading' && changeInfo.url != null) {
    clearLogs(tabId).catch(console.error);
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  const changedSettings = changes[CAPTURE_SETTINGS_KEY]?.newValue;
  if (isCaptureSettings(changedSettings)) {
    captureSettings = normalizeCaptureSettings(changedSettings);
    broadcastCaptureSettings();
  }
});

function enqueueAppendLog(tabId: number, log: NetworkLog): void {
  const previousWrite = tabWriteQueues.get(tabId) ?? Promise.resolve();
  const nextWrite = previousWrite
    .catch(() => {})
    .then(() => appendLog(tabId, log))
    .catch(console.error);
  tabWriteQueues.set(tabId, nextWrite);
}

async function appendLog(tabId: number, log: NetworkLog): Promise<void> {
  const logs = await getLogs(tabId);
  logs.push(log);
  if (logs.length > MAX_LOGS_PER_TAB) {
    logs.shift();
  }
  store.set(tabId, logs);
  const persistedLogs = await persistLogs(tabId, logs);
  broadcastToPanel(tabId, persistedLogs);
}

async function persistLogs(tabId: number, logs: NetworkLog[]): Promise<NetworkLog[]> {
  try {
    await chrome.storage.session.set({ [tabStorageKey(tabId)]: logs });
    return logs;
  } catch {
    const trimmedLogs = logs.slice(-Math.ceil(MAX_LOGS_PER_TAB / 2));
    store.set(tabId, trimmedLogs);
    try {
      await chrome.storage.session.set({ [tabStorageKey(tabId)]: trimmedLogs });
    } catch {
      await chrome.storage.session.remove(tabStorageKey(tabId)).catch(() => {});
    }
    return trimmedLogs;
  }
}

async function getLogs(tabId: number): Promise<NetworkLog[]> {
  if (hydratedTabs.has(tabId)) {
    return store.get(tabId) ?? [];
  }

  const key = tabStorageKey(tabId);
  const result = await chrome.storage.session.get(key);
  const logs = Array.isArray(result[key]) ? (result[key] as NetworkLog[]) : [];
  store.set(tabId, logs);
  hydratedTabs.add(tabId);
  return logs;
}

async function clearLogs(tabId: number): Promise<void> {
  store.set(tabId, []);
  hydratedTabs.add(tabId);
  await chrome.storage.session.set({ [tabStorageKey(tabId)]: [] });
  broadcastToPanel(tabId, []);
}

async function hydrateCaptureSettings(): Promise<CaptureSettings> {
  const result = await chrome.storage.local.get(CAPTURE_SETTINGS_KEY);
  captureSettings = isCaptureSettings(result[CAPTURE_SETTINGS_KEY])
    ? normalizeCaptureSettings(result[CAPTURE_SETTINGS_KEY])
    : DEFAULT_CAPTURE_SETTINGS;
  return captureSettings;
}

async function setCaptureSettings(settings: CaptureSettings): Promise<CaptureSettings> {
  captureSettings = normalizeCaptureSettings(settings);
  await chrome.storage.local.set({ [CAPTURE_SETTINGS_KEY]: captureSettings });
  broadcastCaptureSettings();
  return captureSettings;
}

function shouldCapture(tabUrl?: string): boolean {
  if (captureSettings.mode === 'all') return true;
  if (tabUrl == null) return false;
  const site = hostnameFromUrl(tabUrl);
  if (site == null) return false;
  return captureSettings.sites.some((savedSite) => site === savedSite || site.endsWith(`.${savedSite}`));
}

function normalizeCaptureSettings(settings: CaptureSettings): CaptureSettings {
  const sites = [...new Set(settings.sites.map(normalizeSite).filter((site) => site !== null))];
  return {
    mode: settings.mode === 'saved' ? 'saved' : 'all',
    sites,
  };
}

function normalizeSite(site: string): string | null {
  const trimmed = site.trim().toLowerCase();
  if (trimmed === '') return null;
  return hostnameFromUrl(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
}

function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

function isCaptureSettings(value: unknown): value is CaptureSettings {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<CaptureSettings>;
  return (
    (candidate.mode === 'all' || candidate.mode === 'saved') &&
    Array.isArray(candidate.sites) &&
    candidate.sites.every((site) => typeof site === 'string')
  );
}

function tabStorageKey(tabId: number): string {
  return `logs:${tabId}`;
}

function broadcastToPanel(tabId: number, logs: NetworkLog[]): void {
  const message: ExtensionMessage = {
    type: 'LOGS_UPDATED',
    tabId,
    logs,
  };

  chrome.runtime.sendMessage(message).catch(() => {});
}

function broadcastCaptureSettings(): void {
  chrome.runtime
    .sendMessage({ type: 'CAPTURE_SETTINGS_UPDATED', settings: captureSettings } satisfies ExtensionMessage)
    .catch(() => {});
}
