# Phase 3: Atomic Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all reusable UI components: glassmorphism primitives, timer display/controls, audio mixer panel, and social widgets (stats, history chart, leaderboard table).

**Architecture:** Components are purely presentational + hook consumers. All business logic lives in hooks/stores (Phase 2). Components use Tailwind CSS + glassmorphism classes. lucide-react for icons.

**Tech Stack:** React, TypeScript, Tailwind CSS, lucide-react, clsx, tailwind-merge

**Prerequisite:** Phase 2 Core Logic must be complete (stores, hooks, tRPC routers all working).

---

## File Structure (Phase 3)

```
src/components/
├── ui/
│   ├── glass-card.tsx
│   ├── button.tsx
│   └── nav-bar.tsx
├── timer/
│   ├── timer-display.tsx
│   ├── timer-controls.tsx
│   └── preset-selector.tsx
├── audio/
│   ├── sound-toggle.tsx
│   ├── volume-slider.tsx
│   └── mixer-panel.tsx
└── social/
    ├── stats-card.tsx
    ├── history-chart.tsx
    └── leaderboard-table.tsx
```

---

### Task 1: Utility — cn() helper

**Files:**
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create cn utility**

Create `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/utils.ts
git commit -m "feat: create cn() utility for merging Tailwind classes"
```

---

### Task 2: GlassCard Component

**Files:**
- Create: `src/components/ui/glass-card.tsx`

- [ ] **Step 1: Create GlassCard**

Create `src/components/ui/glass-card.tsx`:

```tsx
import { cn } from '@/lib/utils';

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'strong';
};

export function GlassCard({ children, className, variant = 'default' }: GlassCardProps) {
  return (
    <div
      className={cn(
        variant === 'strong' ? 'glass-strong' : 'glass',
        'shadow-lg p-6',
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/glass-card.tsx
git commit -m "feat: create GlassCard component with default and strong variants"
```

---

### Task 3: Button Component

**Files:**
- Create: `src/components/ui/button.tsx`

- [ ] **Step 1: Create Button**

Create `src/components/ui/button.tsx`:

```tsx
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

const variants = {
  primary: 'bg-brand-dark text-brand-text hover:brightness-95 active:brightness-90',
  ghost: 'glass hover:bg-brand-light/30 text-brand-text',
  danger: 'bg-red-500/80 text-white hover:bg-red-500/90',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full font-medium transition-all duration-200 inline-flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "feat: create Button component with primary, ghost, danger variants"
```

---

### Task 4: NavBar Component

**Files:**
- Create: `src/components/ui/nav-bar.tsx`

- [ ] **Step 1: Create NavBar**

Create `src/components/ui/nav-bar.tsx`:

```tsx
'use client';

import { cn } from '@/lib/utils';
import { Timer, BarChart3, Trophy, LogIn, LogOut, User } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Timer', icon: <Timer size={20} /> },
  { href: '/dashboard', label: 'Stats', icon: <BarChart3 size={20} /> },
  { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
];

export function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="glass sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-brand-text">
        Pomodro
      </Link>

      <div className="flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all',
              pathname === item.href
                ? 'glass-strong text-brand-text font-medium'
                : 'text-brand-text/60 hover:text-brand-text hover:bg-brand-light/30'
            )}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {session?.user ? (
          <div className="flex items-center gap-2">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? ''}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User size={20} className="text-brand-text/60" />
            )}
            <button
              onClick={() => signOut()}
              className="text-brand-text/60 hover:text-brand-text transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-brand-text/60 hover:text-brand-text hover:bg-brand-light/30 transition-all"
          >
            <LogIn size={18} />
            <span className="hidden sm:inline">Sign in</span>
          </button>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/nav-bar.tsx
git commit -m "feat: create NavBar with navigation links, auth status, and glassmorphism"
```

---

### Task 5: TimerDisplay Component

**Files:**
- Create: `src/components/timer/timer-display.tsx`

- [ ] **Step 1: Create TimerDisplay**

Create `src/components/timer/timer-display.tsx`:

```tsx
'use client';

import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';

type TimerDisplayProps = {
  remainingSeconds: number;
  totalSeconds: number;
  mode: 'focus' | 'break' | 'longBreak' | 'idle';
  currentRound: number;
  maxRounds: number;
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const modeLabels: Record<string, string> = {
  focus: 'Focus',
  break: 'Break',
  longBreak: 'Long Break',
  idle: 'Ready',
};

const modeColors: Record<string, string> = {
  focus: 'text-brand-text',
  break: 'text-emerald-700',
  longBreak: 'text-blue-700',
  idle: 'text-brand-text/60',
};

export function TimerDisplay({
  remainingSeconds,
  totalSeconds,
  mode,
  currentRound,
  maxRounds,
}: TimerDisplayProps) {
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <GlassCard variant="strong" className="flex flex-col items-center py-8">
      <p className={cn('text-sm font-medium mb-4', modeColors[mode])}>
        {modeLabels[mode]}
      </p>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Progress ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 256 256">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="rgba(208, 255, 214, 0.3)"
            strokeWidth="6"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke={mode === 'focus' ? '#2D3436' : '#A8E6CF'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Time display */}
        <div className="text-center z-10">
          <span className={cn('text-5xl font-mono font-bold', modeColors[mode])}>
            {formatTime(remainingSeconds)}
          </span>
        </div>
      </div>

      {/* Round indicator */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: maxRounds }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-colors',
              i < currentRound ? 'bg-brand-dark' : 'bg-brand-dark/20'
            )}
          />
        ))}
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/timer/timer-display.tsx
git commit -m "feat: create TimerDisplay with circular progress ring and round indicators"
```

---

### Task 6: TimerControls Component

**Files:**
- Create: `src/components/timer/timer-controls.tsx`

- [ ] **Step 1: Create TimerControls**

Create `src/components/timer/timer-controls.tsx`:

```tsx
'use client';

import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TimerControlsProps = {
  isRunning: boolean;
  mode: 'focus' | 'break' | 'longBreak' | 'idle';
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
};

export function TimerControls({
  isRunning,
  mode,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {isRunning ? (
        <Button variant="primary" size="lg" onClick={onPause}>
          <Pause size={24} />
          Pause
        </Button>
      ) : (
        <Button variant="primary" size="lg" onClick={onStart}>
          <Play size={24} />
          {mode === 'idle' ? 'Start' : 'Resume'}
        </Button>
      )}

      <Button variant="ghost" size="lg" onClick={onReset}>
        <RotateCcw size={20} />
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/timer/timer-controls.tsx
git commit -m "feat: create TimerControls with play/pause/reset buttons"
```

---

### Task 7: PresetSelector Component

**Files:**
- Create: `src/components/timer/preset-selector.tsx`

- [ ] **Step 1: Create PresetSelector**

Create `src/components/timer/preset-selector.tsx`:

```tsx
'use client';

import { cn } from '@/lib/utils';
import { TIMER_PRESETS, PresetKey } from '@/lib/presets';

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
          {preset.name}
          <span className="ml-1 text-xs opacity-60">{preset.focusMin}m</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/timer/preset-selector.tsx
git commit -m "feat: create PresetSelector with pill buttons for timer modes"
```

---

### Task 8: SoundToggle Component

**Files:**
- Create: `src/components/audio/sound-toggle.tsx`

- [ ] **Step 1: Create SoundToggle**

Create `src/components/audio/sound-toggle.tsx`:

```tsx
'use client';

import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

type SoundToggleProps = {
  name: string;
  iconName: string;
  enabled: boolean;
  onToggle: () => void;
};

export function SoundToggle({ name, iconName, enabled, onToggle }: SoundToggleProps) {
  const Icon = (LucideIcons as any)[iconName] ?? LucideIcons.Music;

  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200',
        enabled
          ? 'glass-strong text-brand-text shadow-md'
          : 'text-gray-400 hover:text-brand-text/60 hover:bg-brand-light/20'
      )}
      title={`${enabled ? 'Disable' : 'Enable'} ${name}`}
    >
      <Icon size={24} />
      <span className="text-xs font-medium">{name}</span>
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/audio/sound-toggle.tsx
git commit -m "feat: create SoundToggle with dynamic lucide icon and active state"
```

---

### Task 9: VolumeSlider Component

**Files:**
- Create: `src/components/audio/volume-slider.tsx`

- [ ] **Step 1: Create VolumeSlider**

Create `src/components/audio/volume-slider.tsx`:

```tsx
'use client';

import { cn } from '@/lib/utils';
import { Volume2, VolumeX } from 'lucide-react';

type VolumeSliderProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
};

export function VolumeSlider({ value, onChange, disabled, label }: VolumeSliderProps) {
  return (
    <div className={cn('flex items-center gap-2 w-full', disabled && 'opacity-40')}>
      {value === 0 ? (
        <VolumeX size={16} className="text-gray-400 shrink-0" />
      ) : (
        <Volume2 size={16} className="text-brand-text/60 shrink-0" />
      )}

      {label && (
        <span className="text-xs text-brand-text/60 w-12 shrink-0">{label}</span>
      )}

      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        disabled={disabled}
        className={cn(
          'w-full h-1.5 rounded-full appearance-none cursor-pointer',
          'bg-brand-light',
          '[&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:w-4',
          '[&::-webkit-slider-thumb]:h-4',
          '[&::-webkit-slider-thumb]:rounded-full',
          '[&::-webkit-slider-thumb]:bg-brand-dark',
          '[&::-webkit-slider-thumb]:shadow-md',
          '[&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-moz-range-thumb]:w-4',
          '[&::-moz-range-thumb]:h-4',
          '[&::-moz-range-thumb]:rounded-full',
          '[&::-moz-range-thumb]:bg-brand-dark',
          '[&::-moz-range-thumb]:border-none',
          '[&::-moz-range-thumb]:cursor-pointer',
          'disabled:cursor-not-allowed'
        )}
      />

      <span className="text-xs text-brand-text/40 w-8 text-right shrink-0">
        {Math.round(value * 100)}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/audio/volume-slider.tsx
git commit -m "feat: create VolumeSlider with custom range input styling"
```

---

### Task 10: MixerPanel Component

**Files:**
- Create: `src/components/audio/mixer-panel.tsx`

- [ ] **Step 1: Create MixerPanel**

Create `src/components/audio/mixer-panel.tsx`:

```tsx
'use client';

import { ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { SoundToggle } from './sound-toggle';
import { VolumeSlider } from './volume-slider';
import { useAudioMixer } from '@/hooks/use-audio-mixer';
import { useUiStore } from '@/stores/ui-store';
import { SOUND_CATALOG } from '@/lib/sounds';

export function MixerPanel() {
  const {
    channels,
    masterVolume,
    isMuted,
    setVolume,
    toggleChannel,
    setMasterVolume,
    toggleMute,
  } = useAudioMixer();

  const { mixerOpen, toggleMixer } = useUiStore();

  const enabledCount = Object.values(channels).filter((ch) => ch.enabled).length;

  return (
    <GlassCard className="w-full">
      {/* Header — always visible */}
      <button
        onClick={toggleMixer}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Volume2 size={20} className="text-brand-text" />
          <span className="font-medium text-brand-text">Sound Mixer</span>
          {enabledCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-dark/30 text-brand-text">
              {enabledCount} active
            </span>
          )}
        </div>
        {mixerOpen ? (
          <ChevronUp size={20} className="text-brand-text/60" />
        ) : (
          <ChevronDown size={20} className="text-brand-text/60" />
        )}
      </button>

      {/* Expandable content */}
      {mixerOpen && (
        <div className="mt-4 space-y-4">
          {/* Master volume + mute */}
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="shrink-0">
              {isMuted ? (
                <VolumeX size={20} className="text-red-400" />
              ) : (
                <Volume2 size={20} className="text-brand-text" />
              )}
            </button>
            <VolumeSlider
              value={masterVolume}
              onChange={setMasterVolume}
              label="Master"
              disabled={isMuted}
            />
          </div>

          <hr className="border-brand-dark/20" />

          {/* Ambient sounds */}
          <div>
            <p className="text-xs text-brand-text/50 uppercase tracking-wider mb-2">Ambient</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {SOUND_CATALOG.filter((s) => s.category === 'ambient').map((sound) => (
                <SoundToggle
                  key={sound.key}
                  name={sound.name}
                  iconName={sound.icon}
                  enabled={channels[sound.key]?.enabled ?? false}
                  onToggle={() => toggleChannel(sound.key)}
                />
              ))}
            </div>
            {/* Individual volume sliders for enabled ambient */}
            {SOUND_CATALOG.filter(
              (s) => s.category === 'ambient' && channels[s.key]?.enabled
            ).map((sound) => (
              <div key={sound.key} className="mt-2">
                <VolumeSlider
                  value={channels[sound.key].volume}
                  onChange={(v) => setVolume(sound.key, v)}
                  label={sound.name}
                />
              </div>
            ))}
          </div>

          {/* Lo-fi sounds */}
          <div>
            <p className="text-xs text-brand-text/50 uppercase tracking-wider mb-2">Lo-fi</p>
            <div className="grid grid-cols-3 gap-2">
              {SOUND_CATALOG.filter((s) => s.category === 'lofi').map((sound) => (
                <SoundToggle
                  key={sound.key}
                  name={sound.name}
                  iconName={sound.icon}
                  enabled={channels[sound.key]?.enabled ?? false}
                  onToggle={() => toggleChannel(sound.key)}
                />
              ))}
            </div>
            {SOUND_CATALOG.filter(
              (s) => s.category === 'lofi' && channels[s.key]?.enabled
            ).map((sound) => (
              <div key={sound.key} className="mt-2">
                <VolumeSlider
                  value={channels[sound.key].volume}
                  onChange={(v) => setVolume(sound.key, v)}
                  label={sound.name}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/audio/mixer-panel.tsx
git commit -m "feat: create MixerPanel with expandable channels, toggles, and volume sliders"
```

---

### Task 11: StatsCard Component

**Files:**
- Create: `src/components/social/stats-card.tsx`

- [ ] **Step 1: Create StatsCard**

Create `src/components/social/stats-card.tsx`:

```tsx
import { GlassCard } from '@/components/ui/glass-card';
import { Timer, Flame, Target, Clock } from 'lucide-react';

type StatsCardProps = {
  todaySessions: number;
  todayFocusSec: number;
  streak: number;
  totalSessions: number;
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function StatsCard({ todaySessions, todayFocusSec, streak, totalSessions }: StatsCardProps) {
  const stats = [
    { icon: <Target size={20} />, label: 'Today', value: `${todaySessions} sessions` },
    { icon: <Clock size={20} />, label: 'Focus Time', value: formatDuration(todayFocusSec) },
    { icon: <Flame size={20} />, label: 'Streak', value: `${streak} days` },
    { icon: <Timer size={20} />, label: 'Total', value: `${totalSessions} sessions` },
  ];

  return (
    <GlassCard>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className="text-brand-dark">{stat.icon}</div>
            <div>
              <p className="text-xs text-brand-text/50">{stat.label}</p>
              <p className="text-sm font-semibold text-brand-text">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/social/stats-card.tsx
git commit -m "feat: create StatsCard with today/streak/total stats"
```

---

### Task 12: HistoryChart Component

**Files:**
- Create: `src/components/social/history-chart.tsx`

- [ ] **Step 1: Create HistoryChart**

Create `src/components/social/history-chart.tsx`:

```tsx
'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

type DayData = {
  date: string;
  totalSec: number;
};

type HistoryChartProps = {
  data: DayData[];
  label?: string;
};

export function HistoryChart({ data, label = 'This Week' }: HistoryChartProps) {
  const maxSec = Math.max(...data.map((d) => d.totalSec), 1);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <GlassCard>
      <p className="text-sm font-medium text-brand-text mb-4">{label}</p>

      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((day, i) => {
          const height = (day.totalSec / maxSec) * 100;
          const hours = Math.round(day.totalSec / 3600 * 10) / 10;
          const dateObj = new Date(day.date);
          const dayName = dayNames[dateObj.getDay()] ?? '';

          return (
            <div key={day.date} className="flex flex-col items-center flex-1 gap-1">
              <span className="text-[10px] text-brand-text/40">
                {hours > 0 ? `${hours}h` : ''}
              </span>
              <div className="w-full flex justify-center">
                <div
                  className={cn(
                    'w-6 rounded-t-md transition-all duration-500',
                    day.totalSec > 0 ? 'bg-brand-dark' : 'bg-brand-dark/10'
                  )}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              </div>
              <span className="text-[10px] text-brand-text/50">{dayName}</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/social/history-chart.tsx
git commit -m "feat: create HistoryChart with bar chart for weekly focus data"
```

---

### Task 13: LeaderboardTable Component

**Files:**
- Create: `src/components/social/leaderboard-table.tsx`

- [ ] **Step 1: Create LeaderboardTable**

Create `src/components/social/leaderboard-table.tsx`:

```tsx
import { GlassCard } from '@/components/ui/glass-card';
import { Trophy, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

type LeaderboardEntry = {
  rank: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  totalFocusSec: number;
  sessions: number;
};

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
  currentUserId?: string;
};

function formatHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={18} className="text-yellow-500" />;
  if (rank === 2) return <Medal size={18} className="text-gray-400" />;
  if (rank === 3) return <Medal size={18} className="text-amber-600" />;
  return <span className="text-sm text-brand-text/40 w-[18px] text-center">{rank}</span>;
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <GlassCard>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.user.id}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              entry.user.id === currentUserId && 'bg-brand-dark/15'
            )}
          >
            <RankBadge rank={entry.rank} />

            {entry.user.image ? (
              <img
                src={entry.user.image}
                alt={entry.user.name ?? ''}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-dark/20 flex items-center justify-center text-xs text-brand-text/50">
                {entry.user.name?.charAt(0) ?? '?'}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-text truncate">
                {entry.user.name ?? 'Anonymous'}
                {entry.user.id === currentUserId && (
                  <span className="text-xs text-brand-text/40 ml-1">(you)</span>
                )}
              </p>
              <p className="text-xs text-brand-text/40">{entry.sessions} sessions</p>
            </div>

            <p className="text-sm font-semibold text-brand-text shrink-0">
              {formatHours(entry.totalFocusSec)}
            </p>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-sm text-brand-text/40 text-center py-4">
            No data yet. Add friends to see the leaderboard!
          </p>
        )}
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/social/leaderboard-table.tsx
git commit -m "feat: create LeaderboardTable with rank badges, avatars, and focus hours"
```

---

### Task 14: Final Verification & Phase 3 Complete

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Clean build, all components type-check.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 3: Update PROGRESS.md**

```markdown
## Current Status: PHASE 4 — INTEGRATION & PWA

## Completed
...previous items...
- [x] Phase 3: Atomic Components complete
  - UI primitives: GlassCard, Button, NavBar, cn() utility
  - Timer: TimerDisplay, TimerControls, PresetSelector
  - Audio: SoundToggle, VolumeSlider, MixerPanel
  - Social: StatsCard, HistoryChart, LeaderboardTable

## In Progress
- [ ] Phase 4: Integration & PWA
```

- [ ] **Step 4: Commit**

```bash
git add docs/PROGRESS.md
git commit -m "docs: mark Phase 3 Atomic Components complete"
```
