'use client';

import { cn } from '@/lib/utils';
import { TIMER_PRESETS } from '@/lib/presets';
import type { PresetKey } from '@/lib/presets';

type PresetSelectorProps = {
  activePreset: PresetKey;
  onSelect: (preset: PresetKey) => void;
  disabled?: boolean;
};

export function PresetSelector({ activePreset, onSelect, disabled }: PresetSelectorProps) {
  const presets = Object.values(TIMER_PRESETS);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset.key}
          onClick={() => onSelect(preset.key)}
          disabled={disabled}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            activePreset === preset.key
              ? 'glass-strong text-brand-text shadow-md'
              : 'glass text-brand-text/60 hover:text-brand-text'
          )}
        >
          {preset.label}
          <span className="ml-1 text-xs opacity-60">{preset.focusMinutes}m</span>
        </button>
      ))}
    </div>
  );
}
