import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'uiTheme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>('system');

  useEffect(() => {
    chrome.storage.local
      .get(THEME_STORAGE_KEY)
      .then((result: Record<string, unknown>) => {
        const stored = result[THEME_STORAGE_KEY];
        if (stored === 'light' || stored === 'dark' || stored === 'system') setThemeState(stored);
      })
      .catch(() => {});

    const handleChanged = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName !== 'local') return;
      const next = changes[THEME_STORAGE_KEY]?.newValue;
      if (next === 'light' || next === 'dark' || next === 'system') setThemeState(next);
    };
    chrome.storage.onChanged.addListener(handleChanged);
    return () => chrome.storage.onChanged.removeListener(handleChanged);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    chrome.storage.local.set({ [THEME_STORAGE_KEY]: next }).catch(() => {});
  }, []);

  return { theme, setTheme };
}
