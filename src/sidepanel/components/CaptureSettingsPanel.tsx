import { useState } from 'react';
import type { CaptureSettings } from '../../types';
import { AlertIcon } from './icons';

interface CaptureSettingsPanelProps {
  currentSite: string | null;
  settings: CaptureSettings;
  onChange: (settings: CaptureSettings) => void;
}

export function CaptureSettingsPanel({
  currentSite,
  settings,
  onChange,
}: CaptureSettingsPanelProps) {
  const [manualSite, setManualSite] = useState('');
  const currentSiteSaved = currentSite != null && settings.sites.includes(currentSite);

  const setMode = (mode: CaptureSettings['mode']) => {
    onChange({ ...settings, mode });
  };

  const toggleSnapshot = (key: keyof CaptureSettings['snapshot']) => {
    onChange({ ...settings, snapshot: { ...settings.snapshot, [key]: !settings.snapshot[key] } });
  };

  const addSite = (site: string | null) => {
    const normalized = normalizeSite(site ?? '');
    if (normalized == null) return;
    onChange({
      ...settings,
      sites: [...new Set([...settings.sites, normalized])],
    });
    setManualSite('');
  };

  const removeSite = (site: string) => {
    onChange({
      ...settings,
      sites: settings.sites.filter((savedSite) => savedSite !== site),
    });
  };

  return (
    <div className="hl-animate-in shrink-0 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
            Auto Capture
          </div>
          <div className="truncate text-xs text-[var(--text-secondary)]">
            {currentSite ?? 'No active site'}
          </div>
        </div>
        <span
          className={
            settings.mode === 'all' || currentSiteSaved
              ? 'flex shrink-0 items-center gap-1 rounded-md bg-[var(--success-tint)] px-2 py-1 text-[10px] font-medium text-[var(--success)]'
              : 'shrink-0 rounded-md bg-[var(--bg-inset)] px-2 py-1 text-[10px] font-medium text-[var(--text-tertiary)]'
          }
        >
          <span
            className={
              settings.mode === 'all' || currentSiteSaved
                ? 'h-1.5 w-1.5 rounded-full bg-[var(--success)]'
                : 'h-1.5 w-1.5 rounded-full bg-[var(--text-tertiary)]'
            }
          />
          {settings.mode === 'all' || currentSiteSaved ? 'Recording' : 'Paused'}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode('all')}
          className={
            settings.mode === 'all'
              ? 'rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-2 py-1.5 text-xs font-medium text-[var(--on-accent)]'
              : 'rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]'
          }
        >
          All sites
        </button>
        <button
          onClick={() => setMode('saved')}
          className={
            settings.mode === 'saved'
              ? 'rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-2 py-1.5 text-xs font-medium text-[var(--on-accent)]'
              : 'rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]'
          }
        >
          Saved only
        </button>
      </div>

      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <input
          type="text"
          value={manualSite}
          onChange={(event) => setManualSite(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && addSite(manualSite)}
          placeholder="example.com"
          className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] px-2 py-1.5 text-xs text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
        />
        <button
          onClick={() => addSite(manualSite)}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
        >
          Add
        </button>
      </div>

      {currentSite != null && (
        <button
          onClick={() => (currentSiteSaved ? removeSite(currentSite) : addSite(currentSite))}
          className="mb-3 w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
        >
          {currentSiteSaved ? 'Remove current site' : 'Save current site'}
        </button>
      )}

      {settings.sites.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {settings.sites.map((site) => (
            <button
              key={site}
              onClick={() => removeSite(site)}
              title="Remove site"
              className="rounded-md bg-[var(--bg-inset)] px-2 py-1 font-mono text-[10px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--danger-tint)] hover:text-[var(--danger)]"
            >
              {site}
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-3 text-[11px] text-[var(--text-tertiary)]">No saved sites yet.</div>
      )}

      <div className="border-t border-[var(--border)] pt-3">
        <div className="mb-1 text-[10px] font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
          Failure Snapshot
        </div>
        <div className="mb-2 text-[10px] text-[var(--text-tertiary)]">
          Extra context auto-captured for failed requests only. Stored on-device only.
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <SnapshotToggle
            label="Console logs"
            checked={settings.snapshot.console}
            onClick={() => toggleSnapshot('console')}
          />
          <SnapshotToggle
            label="Cookies"
            sensitive
            checked={settings.snapshot.cookies}
            onClick={() => toggleSnapshot('cookies')}
          />
          <SnapshotToggle
            label="Local storage"
            sensitive
            checked={settings.snapshot.localStorage}
            onClick={() => toggleSnapshot('localStorage')}
          />
          <SnapshotToggle
            label="Session storage"
            sensitive
            checked={settings.snapshot.sessionStorage}
            onClick={() => toggleSnapshot('sessionStorage')}
          />
        </div>
      </div>
    </div>
  );
}

function SnapshotToggle({
  label,
  checked,
  onClick,
  sensitive,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  sensitive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={sensitive ? 'May contain sensitive data' : undefined}
      className={
        checked
          ? 'flex items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-[var(--accent-tint)] px-2 py-1.5 text-left text-[11px] text-[var(--text)] transition-colors'
          : 'flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2 py-1.5 text-left text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]'
      }
    >
      <span
        className={
          checked
            ? 'h-2.5 w-2.5 shrink-0 rounded-sm bg-[var(--accent)]'
            : 'h-2.5 w-2.5 shrink-0 rounded-sm border border-[var(--text-tertiary)]'
        }
      />
      <span className="min-w-0 truncate">{label}</span>
      {sensitive && <AlertIcon className="ml-auto h-3 w-3 shrink-0 text-[var(--warning)]" />}
    </button>
  );
}

function normalizeSite(site: string): string | null {
  const trimmed = site.trim().toLowerCase();
  if (trimmed === '') return null;
  try {
    return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).hostname.replace(
      /^www\./,
      '',
    );
  } catch {
    return null;
  }
}
