import type { NetworkLog } from '../../types';
import { summarizeBody } from '../../utils/parseBody';
import { ChevronIcon } from './icons';
import { LogDetail } from './LogDetail';

interface LogRowProps {
  log: NetworkLog;
  isExpanded: boolean;
  onToggle: () => void;
}

export function LogRow({ log, isExpanded, onToggle }: LogRowProps) {
  const summary = summarizeBody(log.resBody);

  return (
    <div
      className={
        log.isError
          ? 'border-b border-[var(--border-subtle)] bg-[var(--danger-tint)]'
          : 'border-b border-[var(--border-subtle)] transition-colors'
      }
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[var(--bg-hover)]"
      >
        <span className={getStatusDotClass(log.status)} title={`HTTP ${log.status}`} />
        <span className={getMethodClass(log.method)}>{log.method}</span>
        <span className={getStatusTextClass(log.status)}>
          {log.status === 0 ? 'ERR' : log.status}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[11px] text-[var(--text-secondary)]">
            {shortenUrl(log.url)}
          </span>
          <span className="block truncate text-[10px] text-[var(--text-tertiary)]">{summary}</span>
        </span>
        <span className="ml-1 shrink-0 text-[10px] text-[var(--text-tertiary)] tabular-nums">
          {log.duration}ms
        </span>
        <ChevronIcon className="h-3 w-3 shrink-0 text-[var(--text-tertiary)]" open={isExpanded} />
      </button>

      {isExpanded && <LogDetail log={log} />}
    </div>
  );
}

function shortenUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.pathname}${
      parsedUrl.search.length > 20 ? `${parsedUrl.search.slice(0, 20)}...` : parsedUrl.search
    }`;
  } catch {
    return url;
  }
}

function getStatusDotClass(status: number): string {
  if (status === 0 || status >= 500) return 'h-2 w-2 shrink-0 rounded-full bg-[var(--danger)]';
  if (status >= 400) return 'h-2 w-2 shrink-0 rounded-full bg-[var(--warning)]';
  if (status >= 300) return 'h-2 w-2 shrink-0 rounded-full bg-[var(--info)]';
  return 'h-2 w-2 shrink-0 rounded-full bg-[var(--success)]';
}

function getStatusTextClass(status: number): string {
  if (status === 0 || status >= 500) return 'w-8 shrink-0 text-[11px] font-medium text-[var(--danger)]';
  if (status >= 400) return 'w-8 shrink-0 text-[11px] font-medium text-[var(--warning)]';
  if (status >= 300) return 'w-8 shrink-0 text-[11px] font-medium text-[var(--info)]';
  return 'w-8 shrink-0 text-[11px] font-medium text-[var(--success)]';
}

function getMethodClass(method: string): string {
  if (method === 'GET') return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[var(--success)]';
  if (method === 'POST') return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[var(--info)]';
  if (method === 'PUT') return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[var(--warning)]';
  if (method === 'PATCH') return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[var(--accent)]';
  if (method === 'DELETE') return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[var(--danger)]';
  return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[var(--text-tertiary)]';
}
