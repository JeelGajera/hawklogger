import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FilterState, HttpMethod } from '../types';
import { CaptureSettingsPanel } from './components/CaptureSettingsPanel';
import { FilterBar } from './components/FilterBar';
import { LogList } from './components/LogList';
import { Toolbar } from './components/Toolbar';
import { useExportLogs } from './hooks/useExportLogs';
import { useLogs } from './hooks/useLogs';
import { useTheme } from './hooks/useTheme';

const DEFAULT_FILTER: FilterState = {
  methods: [],
  statusClass: 'all',
  searchText: '',
  errorsOnly: false,
};

export default function App() {
  const { logs, clearLogs, currentSite, captureSettings, updateCaptureSettings } = useLogs();
  const { exportLogs } = useExportLogs();
  const { theme, setTheme } = useTheme();
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filter.errorsOnly && !log.isError) return false;
      if (filter.methods.length > 0 && !filter.methods.includes(log.method)) return false;

      if (filter.statusClass !== 'all') {
        if (filter.statusClass === 'failed' && log.status !== 0) return false;
        if (filter.statusClass === '2xx' && (log.status < 200 || log.status >= 300)) {
          return false;
        }
        if (filter.statusClass === '3xx' && (log.status < 300 || log.status >= 400)) {
          return false;
        }
        if (filter.statusClass === '4xx' && (log.status < 400 || log.status >= 500)) {
          return false;
        }
        if (filter.statusClass === '5xx' && (log.status < 500 || log.status >= 600)) {
          return false;
        }
      }

      if (filter.searchText.trim() !== '') {
        const needle = filter.searchText.toLowerCase();
        const inUrl = log.url.toLowerCase().includes(needle);
        const inBody =
          typeof log.resBody === 'string'
            ? log.resBody.toLowerCase().includes(needle)
            : JSON.stringify(log.resBody ?? '')
                .toLowerCase()
                .includes(needle);
        if (!inUrl && !inBody) return false;
      }

      return true;
    });
  }, [filter, logs]);

  const stats = useMemo(() => {
    let errors = 0;
    for (const log of logs) if (log.isError) errors++;
    return { total: logs.length, errors };
  }, [logs]);

  const handleExportAll = useCallback(async () => {
    if (filteredLogs.length === 0 || exporting) return;
    setExporting(true);
    try {
      const markdown = await exportLogs(filteredLogs);
      downloadMarkdown(markdown);
    } catch (error) {
      console.error('HawkLogger export failed', error);
    } finally {
      setExporting(false);
    }
  }, [exportLogs, exporting, filteredLogs]);

  const updateMethod = (method: HttpMethod) => {
    setFilter((current) => ({
      ...current,
      methods: current.methods.includes(method)
        ? current.methods.filter((item) => item !== method)
        : [...current.methods, method],
    }));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping = target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(target.tagName);

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === 'Escape') {
        if (target instanceof HTMLInputElement && target === searchInputRef.current) {
          target.blur();
        } else {
          setSettingsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <Toolbar
        totalCount={stats.total}
        filteredCount={filteredLogs.length}
        errorCount={stats.errors}
        errorsOnly={filter.errorsOnly}
        onToggleErrorsOnly={() =>
          setFilter((current) => ({ ...current, errorsOnly: !current.errorsOnly }))
        }
        onClear={clearLogs}
        settingsOpen={settingsOpen}
        onToggleSettings={() => setSettingsOpen((open) => !open)}
        onExportAll={() => void handleExportAll()}
        exporting={exporting}
        searchText={filter.searchText}
        onSearchChange={(text) => setFilter((current) => ({ ...current, searchText: text }))}
        searchInputRef={searchInputRef}
        theme={theme}
        onThemeChange={setTheme}
      />
      {settingsOpen && (
        <CaptureSettingsPanel
          currentSite={currentSite}
          settings={captureSettings}
          onChange={updateCaptureSettings}
        />
      )}
      <FilterBar
        selectedMethods={filter.methods}
        selectedStatusClass={filter.statusClass}
        onMethodToggle={updateMethod}
        onStatusClassChange={(statusClass) => setFilter((current) => ({ ...current, statusClass }))}
      />
      <LogList logs={filteredLogs} />
    </div>
  );
}

function downloadMarkdown(markdown: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `hawklogger-export-${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}
