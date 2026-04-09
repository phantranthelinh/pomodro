---
name: pomodro-component
description: Create a new Pomodro UI component following the glassmorphism design system. Trigger when user says "create component", "new component", "add [name] component", "build [name] UI", or asks to create any React component for the Pomodro project. Also trigger for "timer display", "audio mixer", "leaderboard card", "sound channel" or any named UI element. Generates production-ready TypeScript component with glass styling, mobile-first layout, and correct placement in src/components/.
---

# Pomodro: Create Component

You are creating a React component for the Pomodro Pomodoro Timer app.

## Before Writing Code

1. Ask (or infer from context): what does this component do and what data does it need?
2. Check if similar components already exist in `src/components/` to stay consistent
3. Determine placement: `src/components/ui/` (primitive) or `src/components/[feature]/` (feature-specific)

## Component Rules

### Structure
```
src/components/
├── ui/          ← reusable primitives (Button, Card, Modal, Badge)
├── timer/       ← TimerDisplay, TimerControls, PresetSelector
├── audio/       ← AudioMixer, SoundChannel, VolumeSlider
├── social/      ← Leaderboard, FriendList, StatsCard
└── layout/      ← Header, MobileNav, PageWrapper
```

### TypeScript
- Always use `type` for props — never `interface`
- Export the component as a named export (not default)
- Keep props minimal and explicit

```tsx
// Good
type SoundChannelProps = {
  name: string;
  isActive: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (v: number) => void;
};

// Bad — interface, prop drilling whole store
interface SoundChannelProps {
  store: AudioStore;
}
```

### No Logic in Components
Components are **display only**. All state mutations and side effects live in hooks/stores.

```tsx
// Good — component calls hook
export function TimerDisplay() {
  const { timeLeft, isRunning, mode } = useTimer();
  return <div className="glass rounded-3xl ...">...</div>;
}

// Bad — component runs setInterval
export function TimerDisplay() {
  const [time, setTime] = useState(1500);
  useEffect(() => { setInterval(...) }, []);
}
```

### Glassmorphism Design System

**CSS classes** (defined in `src/styles/globals.css`):
- `.glass` — standard surface (backdrop-blur, semi-transparent white, border)
- `.glass-strong` — prominent surface (modals, active cards)

**Brand tokens** (Tailwind):
- `text-brand-text` — primary text on dark backgrounds
- `bg-brand-light` — `#D0FFD6` accent
- `bg-brand-dark` — darker accent variant

**Standard patterns**:
```tsx
// Card surface
<div className="glass rounded-2xl p-4 md:p-6">

// Prominent modal / active state
<div className="glass-strong rounded-3xl p-6">

// Action button
<button className="bg-brand-light text-brand-text rounded-full px-6 py-2 font-semibold hover:opacity-90 transition-opacity">

// Muted / inactive
<button className="glass rounded-full px-4 py-2 text-white/60 hover:text-white/90">
```

**Icons**: use `lucide-react` — `Play`, `Pause`, `SkipForward`, `Volume2`, `VolumeX`, `Timer`, `Music`, etc.

### Mobile-First Layout
Default: single column, full-width. Expand at `md:` breakpoint.

```tsx
// Good
<div className="flex flex-col gap-4 md:flex-row md:gap-6">

// Grid
<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
```

## Component Template

```tsx
// src/components/[feature]/[ComponentName].tsx

type [ComponentName]Props = {
  // explicit, minimal props
};

export function [ComponentName]({ ... }: [ComponentName]Props) {
  // hooks only — no useState for business logic
  const { ... } = use[Feature]();

  return (
    <div className="glass rounded-2xl p-4">
      {/* content */}
    </div>
  );
}
```

## After Creating the Component

1. Export it from the feature barrel file if one exists (`src/components/[feature]/index.ts`)
2. If no barrel exists, just use direct imports — don't create barrels prematurely
3. No need to commit — let the user or execute-phase skill handle that

## Component Examples

### Simple display (no interaction)
```tsx
// src/components/timer/TimerDisplay.tsx
type TimerDisplayProps = {
  timeLeft: number;   // seconds
  mode: 'focus' | 'break' | 'longBreak';
};

export function TimerDisplay({ timeLeft, mode }: TimerDisplayProps) {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="glass-strong rounded-3xl p-8 text-center">
      <p className="text-white/60 text-sm uppercase tracking-widest mb-2">{mode}</p>
      <p className="text-7xl font-mono font-bold text-white">
        {minutes}:{seconds}
      </p>
    </div>
  );
}
```

### Interactive channel control
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
        {isActive ? <Volume2 size={14} className="text-brand-light" /> : <VolumeX size={14} className="text-white/40" />}
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
