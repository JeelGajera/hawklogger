import type { FilterState, HttpMethod } from '../../types';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const STATUS_CLASSES: Array<{
  value: FilterState['statusClass'];
  label: string;
}> = [
  { value: 'all', label: 'All' },
  { value: '2xx', label: '2xx' },
  { value: '3xx', label: '3xx' },
  { value: '4xx', label: '4xx' },
  { value: '5xx', label: '5xx' },
  { value: 'failed', label: 'Failed' },
];

interface FilterBarProps {
  selectedMethods: HttpMethod[];
  selectedStatusClass: FilterState['statusClass'];
  onMethodToggle: (method: HttpMethod) => void;
  onStatusClassChange: (statusClass: FilterState['statusClass']) => void;
}

export function FilterBar({
  selectedMethods,
  selectedStatusClass,
  onMethodToggle,
  onStatusClassChange,
}: FilterBarProps) {
  return (
    <div className="grid shrink-0 gap-1.5 border-b border-[#2a2a2a] bg-[#141414] px-3 py-2">
      <div className="flex flex-wrap gap-1">
        {METHODS.map((method) => {
          const active = selectedMethods.includes(method);
          return (
            <button
              key={method}
              onClick={() => onMethodToggle(method)}
              className={active ? methodActiveClass(method) : methodInactiveClass}
            >
              {method}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1">
        {STATUS_CLASSES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStatusClassChange(value)}
            className={
              selectedStatusClass === value
                ? 'rounded bg-[#5B4FCF] px-1.5 py-0.5 text-[10px] text-white transition-colors'
                : 'rounded bg-transparent px-1.5 py-0.5 text-[10px] text-[#555] transition-colors hover:text-[#888]'
            }
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const methodInactiveClass =
  'rounded bg-transparent px-1.5 py-0.5 font-mono text-[10px] text-[#555] transition-colors hover:text-[#888]';

function methodActiveClass(method: HttpMethod): string {
  const map: Record<HttpMethod, string> = {
    GET: 'rounded bg-[#10B981] px-1.5 py-0.5 font-mono text-[10px] text-[#0f0f0f] transition-colors',
    POST: 'rounded bg-[#3B82F6] px-1.5 py-0.5 font-mono text-[10px] text-white transition-colors',
    PUT: 'rounded bg-[#F59E0B] px-1.5 py-0.5 font-mono text-[10px] text-[#0f0f0f] transition-colors',
    PATCH: 'rounded bg-[#8B5CF6] px-1.5 py-0.5 font-mono text-[10px] text-white transition-colors',
    DELETE: 'rounded bg-[#E24B4A] px-1.5 py-0.5 font-mono text-[10px] text-white transition-colors',
    HEAD: 'rounded bg-[#888] px-1.5 py-0.5 font-mono text-[10px] text-white transition-colors',
    OPTIONS: 'rounded bg-[#888] px-1.5 py-0.5 font-mono text-[10px] text-white transition-colors',
  };
  return map[method];
}
