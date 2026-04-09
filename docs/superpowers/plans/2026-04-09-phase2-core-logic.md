# Phase 2: Core Logic — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Zustand stores (timer, audio, ui), custom hooks (useTimer, useAudioMixer, useNotification, useServiceWorker), and all tRPC routers (timer, sound, user, friend, leaderboard).

**Architecture:** Stores hold pure state + synchronous actions. Hooks wrap stores with side effects (setInterval, Howler.js, tRPC calls, browser APIs). tRPC routers use `protectedProcedure` and Prisma queries.

**Tech Stack:** Zustand v5, Howler.js, tRPC v11, Prisma, TypeScript

**Prerequisite:** Phase 1 Foundation must be complete (Next.js, Prisma, tRPC, NextAuth all working).

---

## File Structure (Phase 2)

```
src/
├── stores/
│   ├── timer-store.ts
│   ├── audio-store.ts
│   └── ui-store.ts
├── hooks/
│   ├── use-timer.ts
│   ├── use-audio-mixer.ts
│   ├── use-notification.ts
│   └── use-service-worker.ts
└── server/
    └── routers/
        ├── timer.ts
        ├── sound.ts
        ├── user.ts
        ├── friend.ts
        ├── leaderboard.ts
        └── root.ts         (modify: merge new routers)
```

---

### Task 1: Timer Store (Zustand)

**Files:**
- Create: `src/stores/timer-store.ts`

- [ ] **Step 1: Create timer store**

Create `src/stores/timer-store.ts`:

```ts
import { create } from 'zustand';
import { TIMER_PRESETS, PresetKey } from '@/lib/presets';

type TimerMode = 'focus' | 'break' | 'longBreak' | 'idle';

type TimerState = {
  mode: TimerMode;
  preset: PresetKey;
  totalSeconds: number;
  remainingSeconds: number;
  currentRound: number;
  maxRounds: number;
  isRunning: boolean;
  customConfig: {
    focusMin: number;
    breakMin: number;
    longBreakMin: number;
    rounds: number;
  };
};

type TimerActions = {
  setPreset: (preset: PresetKey) => void;
  setCustomConfig: (config: TimerState['customConfig']) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  switchToNextMode: () => void;
};

function getConfig(state: TimerState) {
  if (state.preset === 'custom') return state.customConfig;
  return TIMER_PRESETS[state.preset];
}

function getSecondsForMode(mode: TimerMode, config: { focusMin: number; breakMin: number; longBreakMin: number }) {
  switch (mode) {
    case 'focus': return config.focusMin * 60;
    case 'break': return config.breakMin * 60;
    case 'longBreak': return config.longBreakMin * 60;
    case 'idle': return 0;
  }
}

export const useTimerStore = create<TimerState & TimerActions>()((set, get) => ({
  mode: 'idle',
  preset: 'pomodoro',
  totalSeconds: TIMER_PRESETS.pomodoro.focusMin * 60,
  remainingSeconds: TIMER_PRESETS.pomodoro.focusMin * 60,
  currentRound: 1,
  maxRounds: TIMER_PRESETS.pomodoro.rounds,
  isRunning: false,
  customConfig: {
    focusMin: 25,
    breakMin: 5,
    longBreakMin: 15,
    rounds: 4,
  },

  setPreset: (preset) => {
    const config = preset === 'custom' ? get().customConfig : TIMER_PRESETS[preset];
    const seconds = config.focusMin * 60;
    set({
      preset,
      mode: 'idle',
      totalSeconds: seconds,
      remainingSeconds: seconds,
      currentRound: 1,
      maxRounds: config.rounds,
      isRunning: false,
    });
  },

  setCustomConfig: (config) => {
    const seconds = config.focusMin * 60;
    set({
      customConfig: config,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      maxRounds: config.rounds,
      mode: 'idle',
      currentRound: 1,
      isRunning: false,
    });
  },

  start: () => {
    const state = get();
    if (state.mode === 'idle') {
      const config = getConfig(state);
      const seconds = config.focusMin * 60;
      set({
        mode: 'focus',
        totalSeconds: seconds,
        remainingSeconds: seconds,
        isRunning: true,
      });
    } else {
      set({ isRunning: true });
    }
  },

  pause: () => set({ isRunning: false }),

  reset: () => {
    const state = get();
    const config = getConfig(state);
    const seconds = config.focusMin * 60;
    set({
      mode: 'idle',
      totalSeconds: seconds,
      remainingSeconds: seconds,
      currentRound: 1,
      isRunning: false,
    });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || state.remainingSeconds <= 0) return;

    const newRemaining = state.remainingSeconds - 1;
    if (newRemaining <= 0) {
      set({ remainingSeconds: 0, isRunning: false });
    } else {
      set({ remainingSeconds: newRemaining });
    }
  },

  switchToNextMode: () => {
    const state = get();
    const config = getConfig(state);
    let nextMode: TimerMode;
    let nextRound = state.currentRound;

    if (state.mode === 'focus') {
      if (state.currentRound >= state.maxRounds) {
        nextMode = 'longBreak';
      } else {
        nextMode = 'break';
      }
    } else if (state.mode === 'break') {
      nextMode = 'focus';
      nextRound = state.currentRound + 1;
    } else {
      nextMode = 'idle';
      nextRound = 1;
    }

    const seconds = getSecondsForMode(nextMode, config);
    set({
      mode: nextMode,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      currentRound: nextRound,
      isRunning: false,
    });
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/timer-store.ts
git commit -m "feat: create timer Zustand store with preset modes and countdown logic"
```

---

### Task 2: Audio Store (Zustand)

**Files:**
- Create: `src/stores/audio-store.ts`

- [ ] **Step 1: Create audio store**

Create `src/stores/audio-store.ts`:

```ts
import { create } from 'zustand';
import { SOUND_CATALOG } from '@/lib/sounds';

type AudioChannel = {
  key: string;
  volume: number;
  enabled: boolean;
};

type AudioState = {
  channels: Record<string, AudioChannel>;
  masterVolume: number;
  isMuted: boolean;
};

type AudioActions = {
  setVolume: (key: string, volume: number) => void;
  toggleChannel: (key: string) => void;
  setMasterVolume: (volume: number) => void;
  toggleMute: () => void;
  loadMix: (channels: AudioChannel[]) => void;
  resetMix: () => void;
};

function createDefaultChannels(): Record<string, AudioChannel> {
  const channels: Record<string, AudioChannel> = {};
  for (const sound of SOUND_CATALOG) {
    channels[sound.key] = {
      key: sound.key,
      volume: 0.5,
      enabled: false,
    };
  }
  return channels;
}

export const useAudioStore = create<AudioState & AudioActions>()((set) => ({
  channels: createDefaultChannels(),
  masterVolume: 0.8,
  isMuted: false,

  setVolume: (key, volume) =>
    set((state) => ({
      channels: {
        ...state.channels,
        [key]: { ...state.channels[key], volume: Math.max(0, Math.min(1, volume)) },
      },
    })),

  toggleChannel: (key) =>
    set((state) => ({
      channels: {
        ...state.channels,
        [key]: { ...state.channels[key], enabled: !state.channels[key].enabled },
      },
    })),

  setMasterVolume: (volume) =>
    set({ masterVolume: Math.max(0, Math.min(1, volume)) }),

  toggleMute: () =>
    set((state) => ({ isMuted: !state.isMuted })),

  loadMix: (channels) =>
    set((state) => {
      const newChannels = { ...createDefaultChannels() };
      for (const ch of channels) {
        if (newChannels[ch.key]) {
          newChannels[ch.key] = ch;
        }
      }
      return { channels: newChannels };
    }),

  resetMix: () =>
    set({ channels: createDefaultChannels(), masterVolume: 0.8, isMuted: false }),
}));
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/audio-store.ts
git commit -m "feat: create audio Zustand store with multi-channel mixer state"
```

---

### Task 3: UI Store (Zustand)

**Files:**
- Create: `src/stores/ui-store.ts`

- [ ] **Step 1: Create UI store**

Create `src/stores/ui-store.ts`:

```ts
import { create } from 'zustand';

type UiState = {
  mixerOpen: boolean;
  activeTab: 'timer' | 'dashboard' | 'leaderboard';
  notificationPermission: NotificationPermission | 'default';
};

type UiActions = {
  toggleMixer: () => void;
  setMixerOpen: (open: boolean) => void;
  setActiveTab: (tab: UiState['activeTab']) => void;
  setNotificationPermission: (permission: NotificationPermission) => void;
};

export const useUiStore = create<UiState & UiActions>()((set) => ({
  mixerOpen: false,
  activeTab: 'timer',
  notificationPermission: 'default',

  toggleMixer: () =>
    set((state) => ({ mixerOpen: !state.mixerOpen })),

  setMixerOpen: (open) =>
    set({ mixerOpen: open }),

  setActiveTab: (tab) =>
    set({ activeTab: tab }),

  setNotificationPermission: (permission) =>
    set({ notificationPermission: permission }),
}));
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/ui-store.ts
git commit -m "feat: create UI Zustand store for mixer panel and notification state"
```

---

### Task 4: useTimer Hook

**Files:**
- Create: `src/hooks/use-timer.ts`

- [ ] **Step 1: Create useTimer hook**

Create `src/hooks/use-timer.ts`:

```ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import { trpc } from '@/lib/trpc-client';

export function useTimer() {
  const store = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeMutation = trpc.timer.complete.useMutation();

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Tick interval management
  useEffect(() => {
    if (store.isRunning) {
      intervalRef.current = setInterval(() => {
        useTimerStore.getState().tick();
      }, 1000);
    } else {
      clearTick();
    }

    return clearTick;
  }, [store.isRunning, clearTick]);

  // Detect timer completion (remainingSeconds hits 0)
  useEffect(() => {
    if (store.remainingSeconds === 0 && store.mode !== 'idle') {
      const state = useTimerStore.getState();

      // Save completed focus session to server
      if (state.mode === 'focus') {
        const config = state.preset === 'custom'
          ? state.customConfig
          : { focusMin: state.totalSeconds / 60, breakMin: 0, longBreakMin: 0, rounds: 0 };

        completeMutation.mutate({
          preset: state.preset,
          focusMin: Math.round(state.totalSeconds / 60),
          breakMin: config.breakMin,
          rounds: state.currentRound,
          totalFocusSec: state.totalSeconds,
        });
      }

      // Switch to next mode
      state.switchToNextMode();
    }
  }, [store.remainingSeconds, store.mode, completeMutation]);

  return {
    mode: store.mode,
    preset: store.preset,
    totalSeconds: store.totalSeconds,
    remainingSeconds: store.remainingSeconds,
    currentRound: store.currentRound,
    maxRounds: store.maxRounds,
    isRunning: store.isRunning,
    start: store.start,
    pause: store.pause,
    reset: store.reset,
    setPreset: store.setPreset,
    setCustomConfig: store.setCustomConfig,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-timer.ts
git commit -m "feat: create useTimer hook with interval tick, auto-switch, and session saving"
```

---

### Task 5: useAudioMixer Hook

**Files:**
- Create: `src/hooks/use-audio-mixer.ts`

- [ ] **Step 1: Create useAudioMixer hook**

Create `src/hooks/use-audio-mixer.ts`:

```ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { useAudioStore } from '@/stores/audio-store';
import { SOUND_CATALOG } from '@/lib/sounds';

type HowlMap = Record<string, Howl>;

export function useAudioMixer() {
  const store = useAudioStore();
  const howlsRef = useRef<HowlMap>({});

  const getOrCreateHowl = useCallback((key: string): Howl | null => {
    if (howlsRef.current[key]) return howlsRef.current[key];

    const sound = SOUND_CATALOG.find(s => s.key === key);
    if (!sound) return null;

    const howl = new Howl({
      src: [sound.path],
      html5: true,
      loop: true,
      preload: false,
      volume: 0,
    });

    howlsRef.current[key] = howl;
    return howl;
  }, []);

  const destroyHowl = useCallback((key: string) => {
    const howl = howlsRef.current[key];
    if (howl) {
      howl.stop();
      howl.unload();
      delete howlsRef.current[key];
    }
  }, []);

  // Sync store state → Howl instances
  useEffect(() => {
    const { channels, masterVolume, isMuted } = store;

    for (const [key, channel] of Object.entries(channels)) {
      if (channel.enabled && !isMuted) {
        const howl = getOrCreateHowl(key);
        if (!howl) continue;

        const effectiveVolume = channel.volume * masterVolume;
        howl.volume(effectiveVolume);

        if (!howl.playing()) {
          howl.play();
        }
      } else {
        const howl = howlsRef.current[key];
        if (howl && howl.playing()) {
          howl.pause();
        }

        // Destroy if disabled to free memory
        if (!channel.enabled && howlsRef.current[key]) {
          destroyHowl(key);
        }
      }
    }
  }, [store.channels, store.masterVolume, store.isMuted, getOrCreateHowl, destroyHowl]);

  // Cleanup all Howl instances on unmount
  useEffect(() => {
    return () => {
      for (const key of Object.keys(howlsRef.current)) {
        destroyHowl(key);
      }
    };
  }, [destroyHowl]);

  return {
    channels: store.channels,
    masterVolume: store.masterVolume,
    isMuted: store.isMuted,
    setVolume: store.setVolume,
    toggleChannel: store.toggleChannel,
    setMasterVolume: store.setMasterVolume,
    toggleMute: store.toggleMute,
    loadMix: store.loadMix,
    resetMix: store.resetMix,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-audio-mixer.ts
git commit -m "feat: create useAudioMixer hook with Howler.js multi-channel control"
```

---

### Task 6: useNotification Hook

**Files:**
- Create: `src/hooks/use-notification.ts`

- [ ] **Step 1: Create useNotification hook**

Create `src/hooks/use-notification.ts`:

```ts
'use client';

import { useCallback } from 'react';
import { Howl } from 'howler';
import { useUiStore } from '@/stores/ui-store';

const alertSound = typeof window !== 'undefined'
  ? new Howl({
      src: ['/sounds/alert.mp3'],
      volume: 0.7,
      html5: true,
    })
  : null;

export function useNotification() {
  const { notificationPermission, setNotificationPermission } = useUiStore();

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
    } else {
      setNotificationPermission(Notification.permission);
    }
  }, [setNotificationPermission]);

  const notify = useCallback((title: string, body: string, actions?: { label: string; action: string }[]) => {
    // Always play sound
    alertSound?.play();

    // Try browser notification
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body,
          actions,
        });
      } else {
        new Notification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          vibrate: [200, 100, 200],
        });
      }
    }
  }, []);

  const notifyTimerComplete = useCallback((mode: string) => {
    const messages: Record<string, { title: string; body: string }> = {
      focus: { title: 'Focus Complete!', body: 'Great work! Time for a break.' },
      break: { title: 'Break Over!', body: 'Ready to focus again?' },
      longBreak: { title: 'Long Break Over!', body: 'Session complete! Start a new one?' },
    };

    const msg = messages[mode] ?? { title: 'Timer Complete', body: 'Your timer has finished.' };

    notify(msg.title, msg.body, [
      { label: mode === 'focus' ? 'Start Break' : 'Start Focus', action: 'continue' },
      { label: 'Dismiss', action: 'dismiss' },
    ]);
  }, [notify]);

  return {
    notificationPermission,
    requestPermission,
    notify,
    notifyTimerComplete,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-notification.ts
git commit -m "feat: create useNotification hook with browser notification and sound alert"
```

---

### Task 7: useServiceWorker Hook

**Files:**
- Create: `src/hooks/use-service-worker.ts`

- [ ] **Step 1: Create useServiceWorker hook**

Create `src/hooks/use-service-worker.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';

export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        setRegistration(reg);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setHasUpdate(true);
            }
          });
        });
      })
      .catch((err) => {
        console.error('SW registration failed:', err);
      });
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return {
    isOnline,
    hasUpdate,
    applyUpdate,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-service-worker.ts
git commit -m "feat: create useServiceWorker hook for offline detection and SW update"
```

---

### Task 8: tRPC Timer Router

**Files:**
- Create: `src/server/routers/timer.ts`

- [ ] **Step 1: Create timer router**

Create `src/server/routers/timer.ts`:

```ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const timerRouter = router({
  complete: protectedProcedure
    .input(
      z.object({
        preset: z.string(),
        focusMin: z.number().int().positive(),
        breakMin: z.number().int().nonnegative(),
        rounds: z.number().int().positive(),
        totalFocusSec: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.timerSession.create({
        data: {
          userId: ctx.user.id!,
          preset: input.preset,
          focusMin: input.focusMin,
          breakMin: input.breakMin,
          rounds: input.rounds,
          totalFocusSec: input.totalFocusSec,
        },
      });
    }),

  history: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.prisma.timerSession.findMany({
        where: { userId: ctx.user.id! },
        orderBy: { completedAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }

      return { items, nextCursor };
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id!;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [today, week, month, total] = await Promise.all([
      ctx.prisma.timerSession.aggregate({
        where: { userId, completedAt: { gte: startOfDay } },
        _sum: { totalFocusSec: true },
        _count: true,
      }),
      ctx.prisma.timerSession.aggregate({
        where: { userId, completedAt: { gte: startOfWeek } },
        _sum: { totalFocusSec: true },
        _count: true,
      }),
      ctx.prisma.timerSession.aggregate({
        where: { userId, completedAt: { gte: startOfMonth } },
        _sum: { totalFocusSec: true },
        _count: true,
      }),
      ctx.prisma.timerSession.aggregate({
        where: { userId },
        _sum: { totalFocusSec: true },
        _count: true,
      }),
    ]);

    // Streak calculation: count consecutive days with at least 1 session
    const recentSessions = await ctx.prisma.timerSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
      take: 365,
    });

    let streak = 0;
    const checkDate = new Date(startOfDay);

    while (true) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const hasSession = recentSessions.some(
        (s) => s.completedAt >= dayStart && s.completedAt < dayEnd
      );

      if (!hasSession) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      today: { sessions: today._count, totalSec: today._sum.totalFocusSec ?? 0 },
      week: { sessions: week._count, totalSec: week._sum.totalFocusSec ?? 0 },
      month: { sessions: month._count, totalSec: month._sum.totalFocusSec ?? 0 },
      total: { sessions: total._count, totalSec: total._sum.totalFocusSec ?? 0 },
      streak,
    };
  }),
});
```

- [ ] **Step 2: Install zod (tRPC input validation)**

```bash
npm install zod
```

- [ ] **Step 3: Commit**

```bash
git add src/server/routers/timer.ts package.json package-lock.json
git commit -m "feat: create tRPC timer router with complete, history, stats procedures"
```

---

### Task 9: tRPC Sound Router

**Files:**
- Create: `src/server/routers/sound.ts`

- [ ] **Step 1: Create sound router**

Create `src/server/routers/sound.ts`:

```ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const soundRouter = router({
  saveMix: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        channels: z.array(
          z.object({
            soundKey: z.string(),
            volume: z.number().min(0).max(1),
            enabled: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.soundMix.create({
        data: {
          userId: ctx.user.id!,
          name: input.name,
          channels: {
            create: input.channels.map((ch) => ({
              soundKey: ch.soundKey,
              volume: ch.volume,
              enabled: ch.enabled,
            })),
          },
        },
        include: { channels: true },
      });
    }),

  getMixes: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.soundMix.findMany({
      where: { userId: ctx.user.id! },
      include: { channels: true },
      orderBy: { createdAt: 'desc' },
    });
  }),

  deleteMix: protectedProcedure
    .input(z.object({ mixId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.soundMix.deleteMany({
        where: { id: input.mixId, userId: ctx.user.id! },
      });
    }),

  setDefault: protectedProcedure
    .input(z.object({ mixId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id!;

      await ctx.prisma.soundMix.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      return ctx.prisma.soundMix.update({
        where: { id: input.mixId },
        data: { isDefault: true },
        include: { channels: true },
      });
    }),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/server/routers/sound.ts
git commit -m "feat: create tRPC sound router with saveMix, getMixes, deleteMix, setDefault"
```

---

### Task 10: tRPC User Router

**Files:**
- Create: `src/server/routers/user.ts`

- [ ] **Step 1: Create user router**

Create `src/server/routers/user.ts`:

```ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const userRouter = router({
  profile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id!;

    const [user, sessionCount, totalFocus] = await Promise.all([
      ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, image: true, createdAt: true },
      }),
      ctx.prisma.timerSession.count({ where: { userId } }),
      ctx.prisma.timerSession.aggregate({
        where: { userId },
        _sum: { totalFocusSec: true },
      }),
    ]);

    return {
      ...user,
      stats: {
        totalSessions: sessionCount,
        totalFocusSec: totalFocus._sum.totalFocusSec ?? 0,
      },
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.user.id! },
        data: { name: input.name },
      });
    }),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/server/routers/user.ts
git commit -m "feat: create tRPC user router with profile and updateProfile"
```

---

### Task 11: tRPC Friend Router

**Files:**
- Create: `src/server/routers/friend.ts`

- [ ] **Step 1: Create friend router**

Create `src/server/routers/friend.ts`:

```ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';

export const friendRouter = router({
  sendRequest: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id!;

      const friend = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!friend) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      if (friend.id === userId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot add yourself' });
      }

      const existing = await ctx.prisma.friendship.findUnique({
        where: { userId_friendId: { userId, friendId: friend.id } },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Request already exists' });
      }

      return ctx.prisma.friendship.create({
        data: { userId, friendId: friend.id, status: 'pending' },
      });
    }),

  respond: protectedProcedure
    .input(
      z.object({
        friendshipId: z.string(),
        accept: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const friendship = await ctx.prisma.friendship.findUnique({
        where: { id: input.friendshipId },
      });

      if (!friendship || friendship.friendId !== ctx.user.id!) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (input.accept) {
        // Accept: update status + create reverse friendship
        await ctx.prisma.$transaction([
          ctx.prisma.friendship.update({
            where: { id: input.friendshipId },
            data: { status: 'accepted' },
          }),
          ctx.prisma.friendship.upsert({
            where: {
              userId_friendId: {
                userId: friendship.friendId,
                friendId: friendship.userId,
              },
            },
            update: { status: 'accepted' },
            create: {
              userId: friendship.friendId,
              friendId: friendship.userId,
              status: 'accepted',
            },
          }),
        ]);
      } else {
        await ctx.prisma.friendship.delete({
          where: { id: input.friendshipId },
        });
      }

      return { success: true };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const friendships = await ctx.prisma.friendship.findMany({
      where: { userId: ctx.user.id!, status: 'accepted' },
      include: { friend: { select: { id: true, name: true, email: true, image: true } } },
    });

    return friendships.map((f) => f.friend);
  }),

  pending: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.friendship.findMany({
      where: { friendId: ctx.user.id!, status: 'pending' },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });
  }),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/server/routers/friend.ts
git commit -m "feat: create tRPC friend router with request/respond/list/pending"
```

---

### Task 12: tRPC Leaderboard Router

**Files:**
- Create: `src/server/routers/leaderboard.ts`

- [ ] **Step 1: Create leaderboard router**

Create `src/server/routers/leaderboard.ts`:

```ts
import { router, protectedProcedure } from '../trpc';

async function getRankedFriends(
  prisma: any,
  userId: string,
  since?: Date
) {
  // Get accepted friend IDs
  const friendships = await prisma.friendship.findMany({
    where: { userId, status: 'accepted' },
    select: { friendId: true },
  });

  const userIds = [userId, ...friendships.map((f: any) => f.friendId)];

  const whereClause: any = { userId: { in: userIds } };
  if (since) {
    whereClause.completedAt = { gte: since };
  }

  // Aggregate sessions per user
  const results = await prisma.timerSession.groupBy({
    by: ['userId'],
    where: whereClause,
    _sum: { totalFocusSec: true },
    _count: true,
  });

  // Get user details
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });

  const userMap = new Map(users.map((u: any) => [u.id, u]));

  const ranked = results
    .map((r: any) => ({
      user: userMap.get(r.userId),
      totalFocusSec: r._sum.totalFocusSec ?? 0,
      sessions: r._count,
    }))
    .sort((a: any, b: any) => b.totalFocusSec - a.totalFocusSec)
    .map((entry: any, index: number) => ({
      ...entry,
      rank: index + 1,
    }));

  return ranked;
}

export const leaderboardRouter = router({
  weekly: protectedProcedure.query(async ({ ctx }) => {
    const since = new Date();
    since.setDate(since.getDate() - since.getDay());
    since.setHours(0, 0, 0, 0);
    return getRankedFriends(ctx.prisma, ctx.user.id!, since);
  }),

  monthly: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth(), 1);
    return getRankedFriends(ctx.prisma, ctx.user.id!, since);
  }),

  allTime: protectedProcedure.query(async ({ ctx }) => {
    return getRankedFriends(ctx.prisma, ctx.user.id!);
  }),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/server/routers/leaderboard.ts
git commit -m "feat: create tRPC leaderboard router with weekly/monthly/allTime rankings"
```

---

### Task 13: Merge All Routers into Root

**Files:**
- Modify: `src/server/routers/root.ts`

- [ ] **Step 1: Update root router**

Replace `src/server/routers/root.ts`:

```ts
import { router } from '../trpc';
import { timerRouter } from './timer';
import { soundRouter } from './sound';
import { userRouter } from './user';
import { friendRouter } from './friend';
import { leaderboardRouter } from './leaderboard';

export const appRouter = router({
  timer: timerRouter,
  sound: soundRouter,
  user: userRouter,
  friend: friendRouter,
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds. All routers type-check correctly.

- [ ] **Step 3: Commit**

```bash
git add src/server/routers/root.ts
git commit -m "feat: merge all tRPC routers (timer, sound, user, friend, leaderboard) into root"
```

---

### Task 14: Final Verification & Phase 2 Complete

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Clean build, no type errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 3: Update PROGRESS.md**

Update the "Current Status" and "Completed" sections in `docs/PROGRESS.md`:

```markdown
## Current Status: PHASE 3 — ATOMIC COMPONENTS

## Completed
...previous items...
- [x] Phase 2: Core Logic complete
  - Zustand stores: timer-store, audio-store, ui-store
  - Hooks: useTimer, useAudioMixer, useNotification, useServiceWorker
  - tRPC routers: timer, sound, user, friend, leaderboard (all merged into root)

## In Progress
- [ ] Phase 3: Atomic Components
```

- [ ] **Step 4: Commit**

```bash
git add docs/PROGRESS.md
git commit -m "docs: mark Phase 2 Core Logic complete"
```
