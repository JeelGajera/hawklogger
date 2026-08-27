import type { NetworkLog } from '../../types';
import { summarizeBody } from '../../utils/parseBody';
import { parseUrl } from '../../utils/parseUrl';
import { ChevronIcon } from './icons';
import { LogDetail } from './LogDetail';

interface LogRowProps {
  log: NetworkLog;
  isExpanded: boolean;
  onToggle: () => void;
}

export function LogRow({ log, isExpanded, onToggle }: LogRowProps) {
  const summary = summarizeBody(log.resBody);
  const { pathname, search, hash, queryParams } = parseUrl(log.url);
  const paramCount = Object.keys(queryParams).length;

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
        title={log.url}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[var(--bg-hover)]"
      >
        <span className={getStatusDotClass(log.status)} title={`HTTP ${log.status}`} />
        <span className={getMethodClass(log.method)}>{log.method}</span>
        <span className={getStatusTextClass(log.status)}>
          {log.status === 0 ? 'ERR' : log.status}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[11px] text-[var(--text-secondary)]">
            {pathname}
            {search && <span className="text-[var(--text-tertiary)]">{search}</span>}
            {hash && <span className="text-[var(--accent)]">{hash}</span>}
          </span>
          <span className="block truncate text-[10px] text-[var(--text-tertiary)]">{summary}</span>
        </span>
        {paramCount > 0 && (
          <span
            title={`${paramCount} query param${paramCount === 1 ? '' : 's'}`}
            className="shrink-0 rounded-full bg-[var(--bg-inset)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-tertiary)] tabular-nums"
          >
            ?{paramCount}
          </span>
        )}
        <span className="ml-1 shrink-0 text-[10px] text-[var(--text-tertiary)] tabular-nums">
          {log.duration}ms
        </span>
        <ChevronIcon className="h-3 w-3 shrink-0 text-[var(--text-tertiary)]" open={isExpanded} />
      </button>

      {isExpanded && <LogDetail log={log} />}
    </div>
  );
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
