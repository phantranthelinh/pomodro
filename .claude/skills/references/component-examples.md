# Component Examples

## Template

```tsx
// src/components/[feature]/[ComponentName].tsx

type [ComponentName]Props = {
  // explicit, minimal props
};

export function [ComponentName]({ ... }: [ComponentName]Props) {
  const { ... } = use[Feature]();

  return (
    <div className="glass rounded-2xl p-4">
      {/* content */}
    </div>
  );
}
```

## Simple Display (no interaction)

```tsx
// src/components/timer/TimerDisplay.tsx
type TimerDisplayProps = {
  timeLeft: number; // seconds
  mode: 'focus' | 'break' | 'longBreak';
};

export function TimerDisplay({ timeLeft, mode }: TimerDisplayProps) {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="glass-strong rounded-3xl p-8 text-center">
      <p className="text-white/60 text-sm uppercase tracking-widest mb-2">{mode}</p>
      <p className="text-7xl font-mono font-bold text-white">{minutes}:{seconds}</p>
    </div>
  );
}
```

## Interactive (toggle + volume slider)

```tsx
// src/components/audio/SoundChannel.tsx
import { Volume2, VolumeX } from 'lucide-react';

type SoundChannelProps = {
  name: string;
  emoji: string;
  isActive: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (v: number) => void;
};

export function SoundChannel({ name, emoji, isActive, volume, onToggle, onVolumeChange }: SoundChannelProps) {
  return (
    <div className={`glass rounded-xl p-3 transition-all ${isActive ? 'ring-1 ring-brand-light/50' : ''}`}>
      <button onClick={onToggle} className="flex items-center gap-2 w-full mb-2">
        <span className="text-xl">{emoji}</span>
        <span className="text-white/80 text-sm font-medium flex-1 text-left">{name}</span>
        {isActive
          ? <Volume2 size={14} className="text-brand-light" />
          : <VolumeX size={14} className="text-white/40" />}
      </button>
      {isActive && (
        <input
          type="range" min={0} max={1} step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full accent-brand-light"
        />
      )}
    </div>
  );
}
```
