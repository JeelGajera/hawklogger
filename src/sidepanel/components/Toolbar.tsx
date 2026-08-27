interface ToolbarProps {
  totalCount: number;
  filteredCount: number;
  errorsOnly: boolean;
  onToggleErrorsOnly: () => void;
  onClear: () => void;
  onToggleSettings: () => void;
  onExportAll: () => void;
  exporting: boolean;
  searchText: string;
  onSearchChange: (text: string) => void;
}

export function Toolbar({
  totalCount,
  filteredCount,
  errorsOnly,
  onToggleErrorsOnly,
  onClear,
  onToggleSettings,
  onExportAll,
  exporting,
  searchText,
  onSearchChange,
}: ToolbarProps) {
  return (
    <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto_auto_auto_auto_auto] items-center gap-2 border-b border-[#2a2a2a] bg-[#141414] px-3 py-2">
      <span className="text-sm font-bold text-[#5B4FCF]">HL</span>
      <input
        type="text"
        placeholder="Search URL or body..."
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
        className="min-w-0 rounded border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-1 text-xs text-[#e5e5e5] outline-none transition-colors placeholder:text-[#555] focus:border-[#5B4FCF]"
      />
      <span className="shrink-0 text-xs text-[#555]">
        {filteredCount !== totalCount ? `${filteredCount}/` : ''}
        {totalCount}
      </span>
      <button
        onClick={onToggleErrorsOnly}
        title="Show errors only"
        className={
          errorsOnly
            ? 'shrink-0 rounded border border-[#E24B4A] bg-[#E24B4A] px-2 py-1 text-xs text-white transition-colors'
            : 'shrink-0 rounded border border-[#2a2a2a] bg-transparent px-2 py-1 text-xs text-[#888] transition-colors hover:border-[#E24B4A] hover:text-[#E24B4A]'
        }
      >
        Errors
      </button>
      <button
        onClick={onExportAll}
        disabled={exporting || filteredCount === 0}
        title="Export visible logs as a single Markdown file"
        className="shrink-0 rounded border border-[#2a2a2a] px-2 py-1 text-xs text-[#888] transition-colors hover:border-[#5B4FCF] hover:text-[#e5e5e5] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#2a2a2a] disabled:hover:text-[#888]"
      >
        {exporting ? 'Exporting...' : 'Export'}
      </button>
      <button
        onClick={onClear}
        title="Clear all logs"
        className="shrink-0 rounded border border-[#2a2a2a] px-2 py-1 text-xs text-[#888] transition-colors hover:border-[#555] hover:text-[#e5e5e5]"
      >
        Clear
      </button>
      <button
        onClick={onToggleSettings}
        title="Capture settings"
        className="shrink-0 rounded border border-[#2a2a2a] px-2 py-1 text-xs text-[#888] transition-colors hover:border-[#5B4FCF] hover:text-[#e5e5e5]"
      >
        Settings
      </button>
    </div>
  );
}
