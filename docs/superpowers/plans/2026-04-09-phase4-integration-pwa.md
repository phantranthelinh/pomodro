# Phase 4: Integration & PWA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Assemble all components into working pages (timer, dashboard, leaderboard), configure PWA (manifest, service worker, offline, notifications), and optimize for mobile.

**Architecture:** Pages import hooks + components and wire them together. PWA via `@ducanh2912/next-pwa`. Service worker handles caching, background notifications, and offline queueing.

**Tech Stack:** Next.js App Router, @ducanh2912/next-pwa, Tailwind CSS

**Prerequisite:** Phase 3 Atomic Components must be complete (all components built and type-checking).

---

## File Structure (Phase 4)

```
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── sounds/
│       └── alert.mp3
├── src/
│   ├── app/
│   │   ├── layout.tsx          (modify: add NavBar)
│   │   ├── page.tsx            (rewrite: main timer page)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── leaderboard/
│   │       └── page.tsx
│   └── styles/
│       └── globals.css         (modify: add responsive utilities if needed)
├── next.config.ts              (modify: add PWA config)
└── package.json                (modify: add next-pwa)
```

---

### Task 1: Install PWA Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install next-pwa**

```bash
npm install @ducanh2912/next-pwa
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @ducanh2912/next-pwa"
```

---

### Task 2: Create PWA Manifest & Icons

**Files:**
- Create: `public/manifest.json`
- Create: `public/icons/icon-192.png` (placeholder)
- Create: `public/icons/icon-512.png` (placeholder)

- [ ] **Step 1: Create manifest.json**

Create `public/manifest.json`:

```json
{
  "name": "Pomodro",
  "short_name": "Pomodro",
  "description": "Focus timer with ambient audio mixer",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#D0FFD6",
  "theme_color": "#A8E6CF",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 2: Generate placeholder icons**

Create simple placeholder icons (192x192 and 512x512 PNG). You can use any tool or generate them later. For now, create minimal SVG-based placeholders:

```bash
# Use any image tool or online generator to create:
# public/icons/icon-192.png (192x192, green background with "P" letter)
# public/icons/icon-512.png (512x512, same design)
```

If no image tool is available, skip this step — the app will work without icons but won't show an install icon on mobile.

- [ ] **Step 3: Commit**

```bash
git add public/manifest.json public/icons/
git commit -m "feat: add PWA manifest with Pomodro branding"
```

---

### Task 3: Configure next-pwa in next.config.ts

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Update next.config.ts**

Replace `next.config.ts`:

```ts
import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https?.*\/sounds\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'sound-assets',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /^https?.*\/api\/trpc\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'trpc-api',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /^https?.*\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'image-assets',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {};

export default withPWA(nextConfig);
```

- [ ] **Step 2: Add SW generated files to .gitignore**

Append to `.gitignore`:

```
# PWA
public/sw.js
public/sw.js.map
public/workbox-*.js
public/workbox-*.js.map
public/swe-worker-*.js
```

- [ ] **Step 3: Commit**

```bash
git add next.config.ts .gitignore
git commit -m "feat: configure next-pwa with sound caching and API network-first strategy"
```

---

### Task 4: Main Timer Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build the main timer page**

Replace `src/app/page.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { TimerDisplay } from '@/components/timer/timer-display';
import { TimerControls } from '@/components/timer/timer-controls';
import { PresetSelector } from '@/components/timer/preset-selector';
import { MixerPanel } from '@/components/audio/mixer-panel';
import { StatsCard } from '@/components/social/stats-card';
import { useTimer } from '@/hooks/use-timer';
import { useNotification } from '@/hooks/use-notification';
import { trpc } from '@/lib/trpc-client';
import { useSession } from 'next-auth/react';

export default function TimerPage() {
  const {
    mode,
    preset,
    totalSeconds,
    remainingSeconds,
    currentRound,
    maxRounds,
    isRunning,
    start,
    pause,
    reset,
    setPreset,
  } = useTimer();

  const { requestPermission, notifyTimerComplete } = useNotification();
  const { data: session } = useSession();

  const statsQuery = trpc.timer.stats.useQuery(undefined, {
    enabled: !!session?.user,
  });

  // Request notification permission on first start
  const handleStart = () => {
    requestPermission();
    start();
  };

  // Notify on timer mode completion
  useEffect(() => {
    if (remainingSeconds === 0 && mode !== 'idle') {
      notifyTimerComplete(mode);
    }
  }, [remainingSeconds, mode, notifyTimerComplete]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Timer */}
        <div className="space-y-6">
          <TimerDisplay
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
            mode={mode}
            currentRound={currentRound}
            maxRounds={maxRounds}
          />

          <PresetSelector
            activePreset={preset}
            onSelect={setPreset}
            disabled={isRunning}
          />

          <TimerControls
            isRunning={isRunning}
            mode={mode}
            onStart={handleStart}
            onPause={pause}
            onReset={reset}
          />

          {/* Stats (only when logged in) */}
          {statsQuery.data && (
            <StatsCard
              todaySessions={statsQuery.data.today.sessions}
              todayFocusSec={statsQuery.data.today.totalSec}
              streak={statsQuery.data.streak}
              totalSessions={statsQuery.data.total.sessions}
            />
          )}
        </div>

        {/* Right column: Mixer (visible on desktop, expandable on mobile) */}
        <div className="space-y-6">
          <MixerPanel />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Run `npm run dev` and visit `http://localhost:3000`:
- Timer display shows "Ready" with 25:00
- Preset pills (Pomodoro, Deep Work, Quick, Custom)
- Start button
- Mixer panel (expandable)

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: assemble main timer page with timer, controls, presets, and mixer"
```

---

### Task 5: Dashboard Page

**Files:**
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard page**

Create `src/app/dashboard/page.tsx`:

```tsx
'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { StatsCard } from '@/components/social/stats-card';
import { HistoryChart } from '@/components/social/history-chart';
import { trpc } from '@/lib/trpc-client';
import { useSession } from 'next-auth/react';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <GlassCard className="py-12">
          <LogIn size={48} className="mx-auto text-brand-text/30 mb-4" />
          <h2 className="text-xl font-bold text-brand-text mb-2">Sign in to view stats</h2>
          <p className="text-brand-text/50 mb-6">Track your focus sessions and build streaks</p>
          <Button onClick={() => signIn()}>Sign in</Button>
        </GlassCard>
      </main>
    );
  }

  return <DashboardContent />;
}

function DashboardContent() {
  const statsQuery = trpc.timer.stats.useQuery();
  const historyQuery = trpc.timer.history.useQuery({ limit: 50 });

  // Build weekly chart data from history
  const weekData = buildWeekData(historyQuery.data?.items ?? []);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-brand-text">Dashboard</h1>

      {statsQuery.data && (
        <StatsCard
          todaySessions={statsQuery.data.today.sessions}
          todayFocusSec={statsQuery.data.today.totalSec}
          streak={statsQuery.data.streak}
          totalSessions={statsQuery.data.total.sessions}
        />
      )}

      <HistoryChart data={weekData} label="This Week" />

      {/* Session history list */}
      <GlassCard>
        <p className="text-sm font-medium text-brand-text mb-3">Recent Sessions</p>
        <div className="space-y-2">
          {historyQuery.data?.items.slice(0, 10).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <span className="capitalize text-brand-text">{session.preset}</span>
                <span className="text-brand-text/40 ml-2">
                  {session.rounds} round{session.rounds > 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-right">
                <span className="text-brand-text font-medium">
                  {Math.round(session.totalFocusSec / 60)}m
                </span>
                <span className="text-brand-text/30 ml-2 text-xs">
                  {new Date(session.completedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {historyQuery.data?.items.length === 0 && (
            <p className="text-brand-text/40 text-center py-4">
              No sessions yet. Start a timer to track your progress!
            </p>
          )}
        </div>
      </GlassCard>
    </main>
  );
}

type SessionItem = {
  id: string;
  completedAt: Date;
  totalFocusSec: number;
};

function buildWeekData(sessions: SessionItem[]) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      totalSec: 0,
    };
  });

  for (const session of sessions) {
    const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
    const day = days.find((d) => d.date === sessionDate);
    if (day) {
      day.totalSec += session.totalFocusSec;
    }
  }

  return days;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: create dashboard page with stats, weekly chart, and session history"
```

---

### Task 6: Leaderboard Page

**Files:**
- Create: `src/app/leaderboard/page.tsx`

- [ ] **Step 1: Create leaderboard page**

Create `src/app/leaderboard/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { LeaderboardTable } from '@/components/social/leaderboard-table';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc-client';
import { useSession, signIn } from 'next-auth/react';
import { LogIn, UserPlus, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

type Period = 'weekly' | 'monthly' | 'allTime';

export default function LeaderboardPage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <GlassCard className="py-12">
          <LogIn size={48} className="mx-auto text-brand-text/30 mb-4" />
          <h2 className="text-xl font-bold text-brand-text mb-2">Sign in to view leaderboard</h2>
          <p className="text-brand-text/50 mb-6">Compete with friends and track your ranking</p>
          <Button onClick={() => signIn()}>Sign in</Button>
        </GlassCard>
      </main>
    );
  }

  return <LeaderboardContent userId={session.user.id!} />;
}

function LeaderboardContent({ userId }: { userId: string }) {
  const [period, setPeriod] = useState<Period>('weekly');
  const [friendEmail, setFriendEmail] = useState('');

  const weeklyQuery = trpc.leaderboard.weekly.useQuery(undefined, { enabled: period === 'weekly' });
  const monthlyQuery = trpc.leaderboard.monthly.useQuery(undefined, { enabled: period === 'monthly' });
  const allTimeQuery = trpc.leaderboard.allTime.useQuery(undefined, { enabled: period === 'allTime' });

  const sendRequest = trpc.friend.sendRequest.useMutation({
    onSuccess: () => setFriendEmail(''),
  });

  const pendingQuery = trpc.friend.pending.useQuery();

  const dataMap: Record<Period, any> = {
    weekly: weeklyQuery.data,
    monthly: monthlyQuery.data,
    allTime: allTimeQuery.data,
  };

  const entries = dataMap[period] ?? [];

  const periods: { key: Period; label: string }[] = [
    { key: 'weekly', label: 'Week' },
    { key: 'monthly', label: 'Month' },
    { key: 'allTime', label: 'All Time' },
  ];

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
          <Trophy size={24} /> Leaderboard
        </h1>

        {/* Period selector */}
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm transition-all',
                period === p.key
                  ? 'glass-strong text-brand-text font-medium'
                  : 'text-brand-text/50 hover:text-brand-text'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <LeaderboardTable entries={entries} currentUserId={userId} />

      {/* Add friend */}
      <GlassCard>
        <p className="text-sm font-medium text-brand-text mb-3 flex items-center gap-2">
          <UserPlus size={16} /> Add Friend
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (friendEmail.trim()) {
              sendRequest.mutate({ email: friendEmail.trim() });
            }
          }}
          className="flex gap-2"
        >
          <input
            type="email"
            placeholder="friend@email.com"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            className="flex-1 px-4 py-2 rounded-full glass text-brand-text placeholder:text-brand-text/30 text-sm outline-none focus:ring-2 focus:ring-brand-dark/30"
          />
          <Button
            type="submit"
            size="sm"
            disabled={sendRequest.isPending || !friendEmail.trim()}
          >
            {sendRequest.isPending ? 'Sending...' : 'Add'}
          </Button>
        </form>
        {sendRequest.error && (
          <p className="text-xs text-red-500 mt-2">{sendRequest.error.message}</p>
        )}
        {sendRequest.isSuccess && (
          <p className="text-xs text-emerald-600 mt-2">Friend request sent!</p>
        )}
      </GlassCard>

      {/* Pending friend requests */}
      {pendingQuery.data && pendingQuery.data.length > 0 && (
        <PendingRequests requests={pendingQuery.data} />
      )}
    </main>
  );
}

function PendingRequests({ requests }: { requests: any[] }) {
  const utils = trpc.useUtils();
  const respond = trpc.friend.respond.useMutation({
    onSuccess: () => {
      utils.friend.pending.invalidate();
      utils.leaderboard.weekly.invalidate();
    },
  });

  return (
    <GlassCard>
      <p className="text-sm font-medium text-brand-text mb-3">Pending Requests</p>
      <div className="space-y-2">
        {requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {req.user.image ? (
                <img src={req.user.image} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-dark/20" />
              )}
              <span className="text-sm text-brand-text">{req.user.name ?? req.user.email}</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => respond.mutate({ friendshipId: req.id, accept: true })}
                disabled={respond.isPending}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => respond.mutate({ friendshipId: req.id, accept: false })}
                disabled={respond.isPending}
              >
                Decline
              </Button>
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
git add src/app/leaderboard/page.tsx
git commit -m "feat: create leaderboard page with period selector, friend requests, and rankings"
```

---

### Task 7: Wire NavBar into Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add NavBar to layout**

In `src/app/layout.tsx`, add the NavBar import and component inside `<body>`:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { NavBar } from '@/components/ui/nav-bar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pomodro — Focus Timer with Ambient Sounds',
  description: 'A Pomodoro timer with multi-channel ambient audio mixer',
  manifest: '/manifest.json',
  themeColor: '#D0FFD6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-brand-light text-brand-text min-h-screen`}
        style={{
          background: 'linear-gradient(135deg, #D0FFD6 0%, #E8FFE8 50%, #D0FFD6 100%)',
        }}
      >
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify navigation works**

Run `npm run dev`:
- NavBar visible at top with Pomodro logo, Timer/Stats/Leaderboard links
- Click Timer → `/`
- Click Stats → `/dashboard`
- Click Leaderboard → `/leaderboard`
- Sign in button shows when not logged in

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wire NavBar into root layout with gradient background"
```

---

### Task 8: Add Alert Sound File

**Files:**
- Create: `public/sounds/alert.mp3`

- [ ] **Step 1: Create or download alert sound**

Place a short notification sound (~1-2 seconds) at `public/sounds/alert.mp3`.

You can generate one using a free tool or download a royalty-free alert tone. The file must exist for `useNotification` to work.

If no audio file is available, create a placeholder:

```bash
# Download a free notification sound or use any short MP3
# The file must be at: public/sounds/alert.mp3
```

- [ ] **Step 2: Commit**

```bash
git add public/sounds/alert.mp3
git commit -m "feat: add timer completion alert sound"
```

---

### Task 9: Production Build & Verify

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: Build succeeds. Service worker files generated in `public/` (sw.js, workbox-*.js).

- [ ] **Step 2: Test production mode**

```bash
npm start
```

Visit `http://localhost:3000`:
- App loads with gradient background
- NavBar works
- Timer starts/pauses/resets correctly
- Mixer panel expands and shows sound channels
- Dashboard shows sign-in prompt (or stats if logged in)
- Leaderboard shows sign-in prompt (or rankings if logged in)

- [ ] **Step 3: Test PWA install prompt**

Open Chrome DevTools → Application → Manifest:
- Manifest loaded correctly
- Service Worker registered
- "Add to Home Screen" available

- [ ] **Step 4: Test offline**

DevTools → Network → Offline:
- App shell loads from cache
- Timer works normally
- Sound files play from cache (if previously loaded)

- [ ] **Step 5: Run lint**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Phase 4 complete — full PWA with offline support"
```

---

### Task 10: Final PROGRESS.md Update

- [ ] **Step 1: Update PROGRESS.md**

Replace `docs/PROGRESS.md`:

```markdown
# Pomodro — Progress Tracker

> Update this file after completing each task. New sessions should read this first.

## Current Status: COMPLETE (MVP)

## Completed
- [x] Design spec approved (docs/superpowers/specs/2026-04-09-pomodro-design.md)
- [x] CLAUDE.md created with Hard Rules
- [x] Tailwind theme decided: 3-token (brand-light, brand-dark, brand-text)
- [x] Implementation plans written (docs/superpowers/plans/)
- [x] Phase 1: Foundation
  - Next.js 15, TypeScript, Tailwind CSS, Prisma, NextAuth.js, tRPC
  - Glassmorphism CSS utilities, sound catalog, timer presets
- [x] Phase 2: Core Logic
  - Zustand stores (timer, audio, ui)
  - Hooks (useTimer, useAudioMixer, useNotification, useServiceWorker)
  - tRPC routers (timer, sound, user, friend, leaderboard)
- [x] Phase 3: Atomic Components
  - UI: GlassCard, Button, NavBar
  - Timer: TimerDisplay, TimerControls, PresetSelector
  - Audio: SoundToggle, VolumeSlider, MixerPanel
  - Social: StatsCard, HistoryChart, LeaderboardTable
- [x] Phase 4: Integration & PWA
  - Pages: Timer, Dashboard, Leaderboard
  - PWA: manifest, service worker, offline, caching
  - Notifications: browser notification + sound alert

## Post-MVP (Future)
- [ ] Add actual sound files (ambient + lo-fi MP3s)
- [ ] Custom timer configuration UI
- [ ] Save/load sound mix presets
- [ ] Media Session API for lock screen controls
- [ ] Background sync for offline session saving
- [ ] Deploy to Vercel
```

- [ ] **Step 2: Commit**

```bash
git add docs/PROGRESS.md
git commit -m "docs: mark all 4 phases complete — Pomodro MVP done"
```
