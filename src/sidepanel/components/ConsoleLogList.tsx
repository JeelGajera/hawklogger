import type { ConsoleLogEntry } from '../../types';

interface ConsoleLogListProps {
  entries: ConsoleLogEntry[];
}

export function ConsoleLogList({ entries }: ConsoleLogListProps) {
  return (
    <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-code)]">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="flex gap-2 border-b border-[var(--border-subtle)] px-2 py-1 font-mono text-[11px] last:border-b-0"
        >
          <span className="shrink-0 text-[var(--text-muted)]">{formatTime(entry.timestamp)}</span>
          <span className={`shrink-0 font-bold ${levelClass(entry.level)}`}>
            {entry.level.toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 text-[var(--text-secondary)] break-all whitespace-pre-wrap">
            {entry.message}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  return Number.isNaN(date.getTime()) ? isoTimestamp : date.toISOString().slice(11, 23);
}

function levelClass(level: ConsoleLogEntry['level']): string {
  if (level === 'error') return 'text-[var(--danger)]';
  if (level === 'warn') return 'text-[var(--warning)]';
  if (level === 'info') return 'text-[var(--info)]';
  return 'text-[var(--text-tertiary)]';
}
