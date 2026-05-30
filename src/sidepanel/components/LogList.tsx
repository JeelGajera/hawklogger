import { useState } from 'react';
import type { NetworkLog } from '../../types';
import { LogRow } from './LogRow';

interface LogListProps {
  logs: NetworkLog[];
}

export function LogList({ logs }: LogListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (logs.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-xs text-[#444]">
        <div className="mb-2 text-2xl font-bold text-[#5B4FCF]">HL</div>
        <div>No requests captured yet.</div>
        <div className="mt-1 text-[10px]">Make a network request on this page.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {[...logs].reverse().map((log) => (
        <LogRow
          key={log.id}
          log={log}
          isExpanded={expandedId === log.id}
          onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
        />
      ))}
    </div>
  );
}
