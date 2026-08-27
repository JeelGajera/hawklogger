import { useState } from 'react';
import type { CaptureSettings } from '../../types';

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
    <div className="shrink-0 border-b border-[#2a2a2a] bg-[#101010] px-3 py-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
            Auto Capture
          </div>
          <div className="truncate text-xs text-[#aaa]">{currentSite ?? 'No active site'}</div>
        </div>
        <span
          className={
            settings.mode === 'all' || currentSiteSaved
              ? 'shrink-0 rounded bg-[#10B981] px-2 py-1 text-[10px] font-medium text-[#0f0f0f]'
              : 'shrink-0 rounded bg-[#2a2a2a] px-2 py-1 text-[10px] font-medium text-[#888]'
          }
        >
          {settings.mode === 'all' || currentSiteSaved ? 'Recording' : 'Paused'}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode('all')}
          className={
            settings.mode === 'all'
              ? 'rounded border border-[#5B4FCF] bg-[#5B4FCF] px-2 py-1.5 text-xs text-white'
              : 'rounded border border-[#2a2a2a] bg-transparent px-2 py-1.5 text-xs text-[#888] hover:text-[#e5e5e5]'
          }
        >
          All sites
        </button>
        <button
          onClick={() => setMode('saved')}
          className={
            settings.mode === 'saved'
              ? 'rounded border border-[#5B4FCF] bg-[#5B4FCF] px-2 py-1.5 text-xs text-white'
              : 'rounded border border-[#2a2a2a] bg-transparent px-2 py-1.5 text-xs text-[#888] hover:text-[#e5e5e5]'
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
          placeholder="example.com"
          className="min-w-0 rounded border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-1 text-xs text-[#e5e5e5] outline-none placeholder:text-[#555] focus:border-[#5B4FCF]"
        />
        <button
          onClick={() => addSite(manualSite)}
          className="rounded border border-[#2a2a2a] px-2 py-1 text-xs text-[#888] hover:border-[#5B4FCF] hover:text-[#e5e5e5]"
        >
          Add
        </button>
      </div>

      {currentSite != null && (
        <button
          onClick={() => (currentSiteSaved ? removeSite(currentSite) : addSite(currentSite))}
          className="mb-3 w-full rounded border border-[#2a2a2a] px-2 py-1.5 text-xs text-[#aaa] hover:border-[#5B4FCF] hover:text-[#e5e5e5]"
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
              className="rounded bg-[#1a1a1a] px-2 py-1 font-mono text-[10px] text-[#aaa] hover:bg-[#2a0f0f] hover:text-[#E24B4A]"
            >
              {site}
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-3 text-[11px] text-[#555]">No saved sites yet.</div>
      )}

      <div className="border-t border-[#2a2a2a] pt-3">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#555]">
          Failure Snapshot
        </div>
        <div className="mb-2 text-[10px] text-[#666]">
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
          ? 'flex items-center gap-1.5 rounded border border-[#5B4FCF] bg-[#5B4FCF]/10 px-2 py-1.5 text-left text-[11px] text-[#e5e5e5]'
          : 'flex items-center gap-1.5 rounded border border-[#2a2a2a] px-2 py-1.5 text-left text-[11px] text-[#888] hover:text-[#e5e5e5]'
      }
    >
      <span
        className={
          checked
            ? 'h-2.5 w-2.5 shrink-0 rounded-sm bg-[#5B4FCF]'
            : 'h-2.5 w-2.5 shrink-0 rounded-sm border border-[#555]'
        }
      />
      <span className="min-w-0 truncate">{label}</span>
      {sensitive && <span className="ml-auto shrink-0 text-[9px] text-[#F59E0B]">!</span>}
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
