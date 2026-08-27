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
    <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
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

      <div className="mx-0.5 h-4 w-px shrink-0 bg-[var(--border)]" />

      <div className="flex flex-wrap gap-1">
        {STATUS_CLASSES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStatusClassChange(value)}
            className={
              selectedStatusClass === value
                ? 'rounded-md bg-[var(--accent)] px-2 py-0.5 text-[10px] font-medium text-[var(--on-accent)] transition-colors'
                : 'rounded-md bg-transparent px-2 py-0.5 text-[10px] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]'
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
  'rounded-md bg-transparent px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]';

function methodActiveClass(method: HttpMethod): string {
  const map: Record<HttpMethod, string> = {
    GET: 'rounded-md bg-[var(--success)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white transition-colors',
    POST: 'rounded-md bg-[var(--info)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white transition-colors',
    PUT: 'rounded-md bg-[var(--warning)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white transition-colors',
    PATCH:
      'rounded-md bg-[var(--accent)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--on-accent)] transition-colors',
    DELETE:
      'rounded-md bg-[var(--danger)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white transition-colors',
    HEAD: 'rounded-md bg-[var(--text-tertiary)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white transition-colors',
    OPTIONS:
      'rounded-md bg-[var(--text-tertiary)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white transition-colors',
  };
  return map[method];
}
