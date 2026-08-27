import type { RefObject } from 'react';
import type { ThemePreference } from '../hooks/useTheme';
import { AlertIcon, DownloadIcon, SearchIcon, SettingsIcon, TrashIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';

interface ToolbarProps {
  totalCount: number;
  filteredCount: number;
  errorCount: number;
  errorsOnly: boolean;
  onToggleErrorsOnly: () => void;
  onClear: () => void;
  settingsOpen: boolean;
  onToggleSettings: () => void;
  onExportAll: () => void;
  exporting: boolean;
  searchText: string;
  onSearchChange: (text: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

export function Toolbar({
  totalCount,
  filteredCount,
  errorCount,
  errorsOnly,
  onToggleErrorsOnly,
  onClear,
  settingsOpen,
  onToggleSettings,
  onExportAll,
  exporting,
  searchText,
  onSearchChange,
  searchInputRef,
  theme,
  onThemeChange,
}: ToolbarProps) {
  return (
    <div className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--accent)] text-[10px] font-bold text-[var(--on-accent)]">
            H
          </span>
          <span className="text-[13px] font-semibold tracking-tight text-[var(--text)]">HawkLogger</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle theme={theme} onChange={onThemeChange} />
          <IconButton
            onClick={onToggleSettings}
            title="Capture settings"
            active={settingsOpen}
            Icon={SettingsIcon}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-3 pb-2.5">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search URL or body... (press /)"
            value={searchText}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] py-1.5 pr-2 pl-7 text-xs text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
          />
        </div>
        <span
          title={`${totalCount} captured`}
          className="shrink-0 rounded-md bg-[var(--bg-inset)] px-1.5 py-1 text-[10px] font-medium text-[var(--text-secondary)] tabular-nums"
        >
          {filteredCount !== totalCount ? `${filteredCount}/${totalCount}` : totalCount}
        </span>
        <button
          onClick={onToggleErrorsOnly}
          title="Show errors only"
          className={
            errorsOnly
              ? 'flex shrink-0 items-center gap-1 rounded-lg border border-[var(--danger)] bg-[var(--danger)] px-2 py-1.5 text-xs font-medium text-white transition-colors'
              : 'flex shrink-0 items-center gap-1 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--danger)] hover:text-[var(--danger)]'
          }
        >
          <AlertIcon className="h-3.5 w-3.5" />
          {errorCount > 0 && <span className="tabular-nums">{errorCount}</span>}
        </button>
        <IconButton
          onClick={onExportAll}
          disabled={exporting || filteredCount === 0}
          title="Export visible logs as a single Markdown file"
          Icon={DownloadIcon}
          spin={exporting}
        />
        <IconButton onClick={onClear} title="Clear all logs" Icon={TrashIcon} />
      </div>
    </div>
  );
}

function IconButton({
  onClick,
  title,
  Icon,
  active,
  disabled,
  spin,
}: {
  onClick: () => void;
  title: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  active?: boolean;
  disabled?: boolean;
  spin?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={
        active
          ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent)] transition-colors'
          : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--border)] disabled:hover:text-[var(--text-secondary)]'
      }
    >
      <Icon className={spin ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
    </button>
  );
}
