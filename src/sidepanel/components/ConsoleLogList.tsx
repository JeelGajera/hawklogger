import type { ConsoleLogEntry } from '../../types';

interface ConsoleLogListProps {
  entries: ConsoleLogEntry[];
}

export function ConsoleLogList({ entries }: ConsoleLogListProps) {
  return (
    <div className="max-h-48 overflow-y-auto rounded border border-[#1e1e1e] bg-[#0a0a0a]">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="flex gap-2 border-b border-[#161616] px-2 py-1 font-mono text-[11px] last:border-b-0"
        >
          <span className="shrink-0 text-[#444]">{formatTime(entry.timestamp)}</span>
          <span className={`shrink-0 font-bold ${levelClass(entry.level)}`}>
            {entry.level.toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 whitespace-pre-wrap break-all text-[#aaa]">
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
  if (level === 'error') return 'text-[#E24B4A]';
  if (level === 'warn') return 'text-[#F59E0B]';
  if (level === 'info') return 'text-[#3B82F6]';
  return 'text-[#666]';
}
