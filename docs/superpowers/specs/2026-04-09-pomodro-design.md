# Pomodro — Design Spec

**Date:** 2026-04-09
**Status:** Approved
**Approach:** Next.js App Router + tRPC + Zustand + Howler.js

---

## 1. Overview

Pomodro is a Pomodoro Timer web app with:
- Multi-channel ambient audio mixer (ambient nature sounds + lo-fi beats)
- Glassmorphism UI with brand color #D0FFD6
- Social features: stats, history, friend leaderboard
- Full PWA: installable, offline, background notifications

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| API | tRPC (end-to-end type safety) |
| State | Zustand (timer-store, audio-store, ui-store) |
| Audio | Howler.js (HTML5 mode, multi-channel) |
| Auth | NextAuth.js (Google/GitHub OAuth) |
| Database | Prisma + PostgreSQL |
| Styling | Tailwind CSS + Glassmorphism |
| PWA | @ducanh2912/next-pwa |
| Icons | lucide-react |
| Utilities | clsx, tailwind-merge |

## 3. Architecture & Folder Structure

```
c:\sub_workspace\pomodro\
├── prisma/
│   └── schema.prisma
├── public/
│   ├── sounds/
│   │   ├── ambient/               # rain.mp3, ocean.mp3, fire.mp3, birds.mp3, wind.mp3
│   │   └── lofi/                  # lofi-chill.mp3, lofi-jazz.mp3, lofi-piano.mp3
│   ├── icons/                     # PWA icons (192x192, 512x512)
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout: providers, fonts, PWA meta
│   │   ├── page.tsx               # Main timer page
│   │   ├── api/
│   │   │   ├── trpc/[trpc]/route.ts
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Stats, history, charts
│   │   └── leaderboard/
│   │       └── page.tsx
│   ├── server/
│   │   ├── trpc.ts                # tRPC init, context, middleware
│   │   ├── routers/
│   │   │   ├── timer.ts
│   │   │   ├── sound.ts
│   │   │   ├── user.ts
│   │   │   ├── friend.ts
│   │   │   └── leaderboard.ts
│   │   └── root.ts
│   ├── stores/
│   │   ├── timer-store.ts
│   │   ├── audio-store.ts
│   │   └── ui-store.ts
│   ├── hooks/
│   │   ├── use-timer.ts
│   │   ├── use-audio-mixer.ts
│   │   ├── use-notification.ts
│   │   └── use-service-worker.ts
│   ├── components/
│   │   ├── timer/
│   │   │   ├── timer-display.tsx
│   │   │   ├── timer-controls.tsx
│   │   │   └── preset-selector.tsx
│   │   ├── audio/
│   │   │   ├── sound-toggle.tsx
│   │   │   ├── volume-slider.tsx
│   │   │   └── mixer-panel.tsx
│   │   ├── social/
│   │   │   ├── stats-card.tsx
│   │   │   ├── history-chart.tsx
│   │   │   └── leaderboard-table.tsx
│   │   └── ui/
│   │       ├── glass-card.tsx
│   │       ├── button.tsx
│   │       └── nav-bar.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── trpc-client.ts
│   │   └── sounds.ts              # Sound catalog definition
│   └── styles/
│       └── globals.css
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

### Key Patterns
- `server/routers/` — tRPC routers split by domain
- `stores/` — 3 Zustand stores (timer, audio, ui) to avoid monolithic state
- `hooks/` — Custom hooks wrap stores + side effects (Howler, setInterval, tRPC, browser APIs)
- `components/ui/` — Reusable Glassmorphism primitives
- `type` over `interface` for all TypeScript definitions

## 4. Data Model (Prisma)

### User
Standard NextAuth user + relations to app data.

### TimerSession
| Field | Type | Description |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | FK → User |
| preset | String | "pomodoro" / "deepwork" / "quick" / "custom" |
| focusMin | Int | Focus duration in minutes |
| breakMin | Int | Break duration |
| rounds | Int | Rounds completed |
| totalFocusSec | Int | Total focus seconds (for stats aggregation) |
| completedAt | DateTime | When session finished |

### SoundMix → SoundChannel (1:N)
- Mix: name, isDefault flag
- Channel: soundKey, volume (0.0-1.0), enabled

### Friendship
- userId + friendId with `@@unique` constraint
- status: "pending" / "accepted"

### Leaderboard
No dedicated table — aggregated from TimerSession via tRPC queries.

## 5. tRPC API

All procedures use `protectedProcedure` (require auth).

### timer router
- `complete` (mutation) — save completed session
- `history` (query) — paginated session list (cursor-based)
- `stats` (query) — today/week/month/total counts + streak

### sound router
- `saveMix` (mutation) — create mix with channels
- `getMixes` (query) — all user mixes with channels
- `deleteMix` (mutation) — delete mix
- `setDefault` (mutation) — set default mix

### user router
- `profile` (query) — user + aggregate stats
- `updateProfile` (mutation) — update name/image

### friend router
- `sendRequest` (mutation) — send by email
- `respond` (mutation) — accept/reject
- `list` (query) — accepted friends
- `pending` (query) — pending requests

### leaderboard router
- `weekly` / `monthly` / `allTime` (queries) — ranked friends by totalFocusSec

## 6. Zustand Stores

### timer-store
- State: mode (focus/break/longBreak/idle), preset, totalSeconds, remainingSeconds, currentRound, maxRounds, isRunning, customConfig
- Actions: start, pause, reset, tick, switchMode, setPreset, setCustomConfig

### audio-store
- State: channels (Record<string, {key, volume, enabled}>), masterVolume, isMuted
- Actions: setVolume, toggleChannel, setMasterVolume, toggleMute, loadMix, resetMix

### ui-store
- State: mixerOpen, activeTab, notificationPermission
- Actions: toggleMixer, setActiveTab, setNotificationPermission

## 7. Custom Hooks

### use-timer
- Wraps timer-store + setInterval for countdown tick
- On complete → auto-switch mode (focus→break→longBreak) + call tRPC save
- Cleanup interval on unmount

### use-audio-mixer
- Lazy Howl instance creation per channel (only when enabled)
- Syncs audio-store state → Howl volume/play/pause
- Config: `html5: true`, `loop: true`, `preload: false`
- Destroys Howl instances on channel disable (memory cleanup)
- Never blocks main thread

### use-notification
- Request permission after first Start click
- On timer complete: browser notification + alert sound
- Fallback: sound-only if permission denied
- Service worker integration for background

### use-service-worker
- Register SW on mount (production only)
- Handle update prompt
- Offline detection → toast via ui-store

## 8. UI & Glassmorphism

### Tailwind Theme Config
```ts
colors: {
  brand: {
    light: "#D0FFD6",   // Primary background, glassmorphism base
    dark: "#A8E6CF",    // Darker contrast for hover, active states, accents
    text: "#2D3436",    // Primary text color
  }
}
```
Minimal token set — easy to extend later without breaking existing styles.

### Glassmorphism Classes
- `.glass` — `rgba(208,255,214,0.15)` + `blur(16px)` + `border: 1px solid rgba(208,255,214,0.25)`
- `.glass-strong` — `rgba(208,255,214,0.3)` + `blur(24px)` + `border: 1px solid rgba(208,255,214,0.4)`

### Layout
- **Mobile (default):** Single column — Timer → Presets → Controls → Mixer (expandable)
- **Desktop (md+):** 2 columns — Left: timer + controls + stats / Right: mixer panel
- Background: solid `brand-light` (#D0FFD6) + radial gradient overlay for depth

### Component Styles
- GlassCard: `.glass` + `shadow-lg` + `p-6`
- Button primary: `bg-brand-dark text-brand-text rounded-full hover:brightness-95`
- Button ghost: `glass hover:bg-brand-light/30`
- VolumeSlider: custom range, track=`brand-light`, thumb=`brand-dark`
- SoundToggle: lucide icon, active=`brand-dark`, off=`gray-400`
- PresetSelector: pill buttons, active=`glass-strong` + `text-brand-text`, inactive=`glass`

## 9. PWA & Offline

### Service Worker Caching
| Resource | Strategy |
|---|---|
| App shell | Precache |
| Sound files | Cache-first |
| API calls | Network-first, fallback to cache |
| Images, fonts | Stale-while-revalidate |

### Offline Behavior
- Timer works normally (pure client)
- Audio plays from cache
- Data mutations queue in IndexedDB, sync on reconnect (background sync)
- Toast: "Offline — sẽ sync khi có mạng"

### Notification Flow
- Foreground: alert sound + in-app toast
- Background: SW push notification + vibrate [200, 100, 200] + actions ["Start Break", "Dismiss"]
- Permission requested after first Start click, not on page load

### Media Session API
- Lock screen controls for ambient audio (play/pause)

## 10. Timer Presets

| Preset | Focus | Break | Long Break | Rounds |
|---|---|---|---|---|
| Pomodoro | 25 min | 5 min | 15 min | 4 |
| Deep Work | 50 min | 10 min | 20 min | 2 |
| Quick | 15 min | 3 min | 5 min | 4 |
| Custom | user-defined | user-defined | user-defined | user-defined |

## 11. Audio Channels

### Ambient
| Key | Name | File |
|---|---|---|
| rain | Rain | /sounds/ambient/rain.mp3 |
| ocean | Ocean Waves | /sounds/ambient/ocean.mp3 |
| fire | Fireplace | /sounds/ambient/fire.mp3 |
| birds | Birds | /sounds/ambient/birds.mp3 |
| wind | Wind | /sounds/ambient/wind.mp3 |

### Lo-fi
| Key | Name | File |
|---|---|---|
| lofi-chill | Lo-fi Chill | /sounds/lofi/lofi-chill.mp3 |
| lofi-jazz | Lo-fi Jazz | /sounds/lofi/lofi-jazz.mp3 |
| lofi-piano | Lo-fi Piano | /sounds/lofi/lofi-piano.mp3 |

Each channel: independent toggle + volume slider (0.0-1.0).

## 12. Master Plan — Execution Phases

### Phase 1: Foundation
- Setup Next.js 15, install all dependencies
- Configure tailwind.config.ts with brand palette
- Setup Prisma schema + PostgreSQL
- Setup tRPC + NextAuth.js

### Phase 2: Core Logic
- Zustand stores: timer-store, audio-store, ui-store
- Custom hooks: use-timer, use-audio-mixer
- tRPC routers: timer, sound, user, friend, leaderboard

### Phase 3: Atomic Components
- Timer: TimerDisplay, TimerControls, PresetSelector
- Audio: SoundToggle, VolumeSlider, MixerPanel
- UI: GlassCard, Button, NavBar
- Social: StatsCard, HistoryChart, LeaderboardTable

### Phase 4: Integration & PWA
- Assemble pages: main timer, dashboard, leaderboard
- Configure next-pwa (manifest, SW, offline, notifications)
- Media Session API for lock screen
- Performance optimization + mobile responsive polish
