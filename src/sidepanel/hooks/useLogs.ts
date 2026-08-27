import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CaptureSettings, ExtensionMessage, NetworkLog } from '../../types';

const DEFAULT_CAPTURE_SETTINGS: CaptureSettings = {
  mode: 'all',
  sites: [],
  snapshot: { console: false, cookies: false, localStorage: false, sessionStorage: false },
};

interface ActiveTabState {
  tabId: number | null;
  url: string;
}

export function useLogs() {
  const [logs, setLogs] = useState<NetworkLog[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTabState>({ tabId: null, url: '' });
  const [captureSettings, setCaptureSettingsState] =
    useState<CaptureSettings>(DEFAULT_CAPTURE_SETTINGS);

  const refreshActiveTab = useCallback(() => {
    chrome.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        const tab = tabs[0];
        setActiveTab({
          tabId: tab?.id ?? null,
          url: tab?.url ?? '',
        });
        if (tab?.id == null) setLogs([]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    refreshActiveTab();

    const handleActivated = () => refreshActiveTab();
    const handleUpdated = (tabId: number, changeInfo: { url?: string; status?: string }) => {
      if (tabId === activeTab.tabId && (changeInfo.url != null || changeInfo.status === 'complete')) {
        refreshActiveTab();
      }
    };
    const handleFocusChanged = (windowId: number) => {
      if (windowId !== chrome.windows.WINDOW_ID_NONE) refreshActiveTab();
    };

    chrome.tabs.onActivated.addListener(handleActivated);
    chrome.tabs.onUpdated.addListener(handleUpdated);
    chrome.windows.onFocusChanged.addListener(handleFocusChanged);
    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
      chrome.windows.onFocusChanged.removeListener(handleFocusChanged);
    };
  }, [activeTab.tabId, refreshActiveTab]);

  useEffect(() => {
    const message: ExtensionMessage = { type: 'GET_CAPTURE_SETTINGS' };
    chrome.runtime.sendMessage(message, (response: { settings: CaptureSettings } | undefined) => {
      if (chrome.runtime.lastError) return;
      setCaptureSettingsState(response?.settings ?? DEFAULT_CAPTURE_SETTINGS);
    });
  }, []);

  useEffect(() => {
    if (activeTab.tabId == null) {
      return;
    }

    const message: ExtensionMessage = { type: 'GET_LOGS', tabId: activeTab.tabId };
    chrome.runtime.sendMessage(message, (response: { logs: NetworkLog[] } | undefined) => {
      if (chrome.runtime.lastError) return;
      setLogs(response?.logs ?? []);
    });
  }, [activeTab.tabId]);

  useEffect(() => {
    if (activeTab.tabId == null) return;

    const listener = (message: ExtensionMessage) => {
      if (message.type === 'LOGS_UPDATED' && message.tabId === activeTab.tabId) {
        setLogs(message.logs);
      }
      if (message.type === 'CAPTURE_SETTINGS_UPDATED') {
        setCaptureSettingsState(message.settings);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [activeTab.tabId]);

  const clearLogs = useCallback(() => {
    if (activeTab.tabId == null) return;
    const message: ExtensionMessage = { type: 'CLEAR_LOGS', tabId: activeTab.tabId };
    chrome.runtime.sendMessage(message).catch(console.error);
  }, [activeTab.tabId]);

  const updateCaptureSettings = useCallback((settings: CaptureSettings) => {
    // Apply optimistically so rapid successive toggles (e.g. several
    // Failure Snapshot checkboxes clicked back to back) each build on the
    // latest local state instead of racing the background round-trip and
    // clobbering one another.
    setCaptureSettingsState(settings);
    const message: ExtensionMessage = { type: 'UPDATE_CAPTURE_SETTINGS', settings };
    chrome.runtime.sendMessage(message, (response: { settings: CaptureSettings } | undefined) => {
      if (chrome.runtime.lastError) return;
      setCaptureSettingsState(response?.settings ?? settings);
    });
  }, []);

  const currentSite = useMemo(() => hostnameFromUrl(activeTab.url), [activeTab.url]);

  return {
    logs,
    clearLogs,
    tabId: activeTab.tabId,
    activeTabUrl: activeTab.url,
    currentSite,
    captureSettings,
    updateCaptureSettings,
  };
}

function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}
