import type { NetworkLog } from '../../types';
import { summarizeBody } from '../../utils/parseBody';
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
        log.isError ? 'border-b border-[#1e1e1e] bg-[#1a0f0f]' : 'border-b border-[#1e1e1e]'
      }
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#1a1a1a]"
      >
        <span className={getStatusDotClass(log.status)} title={`HTTP ${log.status}`} />
        <span className={getMethodClass(log.method)}>{log.method}</span>
        <span className={getStatusTextClass(log.status)}>
          {log.status === 0 ? 'ERR' : log.status}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[11px] text-[#aaa]">
            {shortenUrl(log.url)}
          </span>
          <span className="block truncate text-[10px] text-[#555]">{summary}</span>
        </span>
        <span className="ml-1 shrink-0 text-[10px] text-[#555]">{log.duration}ms</span>
        <span className="shrink-0 text-[10px] text-[#444]">{isExpanded ? '▲' : '▼'}</span>
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
  if (status === 0) return 'h-2 w-2 shrink-0 rounded-full bg-[#E24B4A]';
  if (status >= 500) return 'h-2 w-2 shrink-0 rounded-full bg-[#E24B4A]';
  if (status >= 400) return 'h-2 w-2 shrink-0 rounded-full bg-[#F59E0B]';
  if (status >= 300) return 'h-2 w-2 shrink-0 rounded-full bg-[#3B82F6]';
  return 'h-2 w-2 shrink-0 rounded-full bg-[#10B981]';
}

function getStatusTextClass(status: number): string {
  if (status === 0) return 'w-8 shrink-0 text-[11px] text-[#E24B4A]';
  if (status >= 500) return 'w-8 shrink-0 text-[11px] text-[#E24B4A]';
  if (status >= 400) return 'w-8 shrink-0 text-[11px] text-[#F59E0B]';
  if (status >= 300) return 'w-8 shrink-0 text-[11px] text-[#3B82F6]';
  return 'w-8 shrink-0 text-[11px] text-[#10B981]';
}

function getMethodClass(method: string): string {
  if (method === 'GET') return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[#10B981]';
  if (method === 'POST') return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[#3B82F6]';
  if (method === 'PUT') return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[#F59E0B]';
  if (method === 'PATCH') return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[#8B5CF6]';
  if (method === 'DELETE') return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[#E24B4A]';
  return 'w-12 shrink-0 font-mono text-[10px] font-bold text-[#888]';
}
