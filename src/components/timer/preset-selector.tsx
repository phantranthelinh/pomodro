'use client';

import { cn } from '@/lib/utils';
import { TIMER_PRESETS } from '@/lib/presets';
import type { PresetKey } from '@/lib/presets';
import { useTimerStore } from '@/stores/timer-store';

type PresetSelectorProps = {
  activePreset: PresetKey;
  onSelect: (preset: PresetKey) => void;
  disabled?: boolean;
};

export function PresetSelector({ activePreset, onSelect, disabled }: PresetSelectorProps) {
  const presets = Object.values(TIMER_PRESETS);
  
  // Custom config states
  const customConfig = useTimerStore((s) => s.customConfig);
  const setCustomConfig = useTimerStore((s) => s.setCustomConfig);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {presets.map((preset) => {
        const isCustom = preset.key === 'custom';
        const isActive = activePreset === preset.key;
        const minutes = isCustom ? customConfig.focusMin : preset.focusMinutes;

        return (
          <div
            key={preset.key}
            onClick={() => {
              if (disabled) return;
              onSelect(preset.key);
            }}
            className={cn(
              'px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-2 cursor-pointer select-none flex items-center justify-center',
              disabled && 'opacity-50 cursor-not-allowed',
              isActive
                ? 'bg-black border-black text-white shadow-md scale-105'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-black'
            )}
          >
            <span>{preset.label}</span>
            
            {/* Show an input with custom stepper if it is the custom preset and it's active */}
            {isCustom && isActive ? (
              <div className="ml-2 flex items-center gap-1 bg-white/20 rounded-full px-1 py-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newMin = Math.max(1, customConfig.focusMin - 5);
                    setCustomConfig({ ...customConfig, focusMin: newMin });
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/30 text-white transition-colors"
                >
                  <span className="text-lg leading-none mb-[2px]">-</span>
                </button>
                
                <div className="flex items-center">
                  <input 
                    type="number"
                    min="1"
                    max="120"
                    disabled={disabled}
                    value={customConfig.focusMin}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const min = parseInt(e.target.value) || 1;
                      const clampedMin = Math.min(Math.max(1, min), 120);
                      setCustomConfig({ ...customConfig, focusMin: clampedMin });
                    }}
                    className={cn(
                      "w-8 bg-transparent outline-none text-center font-bold px-0 rounded-sm transition-colors tabular-nums",
                      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                      "text-white focus:bg-white/20"
                    )}
                  />
                  <span className="text-xs text-white/70">m</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newMin = Math.min(120, customConfig.focusMin + 5);
                    setCustomConfig({ ...customConfig, focusMin: newMin });
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/30 text-white transition-colors"
                >
                  <span className="text-lg leading-none mb-[2px]">+</span>
                </button>
              </div>
            ) : (
              <span className={cn("ml-1.5 text-xs font-semibold", isActive ? "text-white/70" : "text-slate-400")}>
                {minutes}m
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
