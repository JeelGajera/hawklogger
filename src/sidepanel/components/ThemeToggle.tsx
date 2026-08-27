import type { ThemePreference } from '../hooks/useTheme';
import { MonitorIcon, MoonIcon, SunIcon } from './icons';

interface ThemeToggleProps {
  theme: ThemePreference;
  onChange: (theme: ThemePreference) => void;
}

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light theme', Icon: SunIcon },
  { value: 'system', label: 'Match system theme', Icon: MonitorIcon },
  { value: 'dark', label: 'Dark theme', Icon: MoonIcon },
];

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] p-0.5">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          title={label}
          aria-label={label}
          aria-pressed={theme === value}
          className={
            theme === value
              ? 'flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--on-accent)] transition-colors'
              : 'flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-tertiary)] transition-colors hover:text-[var(--text)]'
          }
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
