# CLAUDE.md — Pomodro

## Project Overview

Pomodro — a Pomodoro Timer web app with multi-channel ambient audio mixer, Glassmorphism UI, and social features (stats, leaderboard). Built with Next.js App Router, tRPC, Zustand, Howler.js, Prisma + PostgreSQL, NextAuth.js, and Tailwind CSS.

## Hard Rules — "The Law"

> Rules are defined in `.claude/rules/`. Claude Code loads them automatically.

- [token-efficiency.md](.claude/rules/token-efficiency.md)
- [modularization.md](.claude/rules/modularization.md)
- [ux.md](.claude/rules/ux.md)
- [no-placeholders.md](.claude/rules/no-placeholders.md)
- [update-claude-md.md](.claude/rules/update-claude-md.md)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **API Layer**: tRPC (end-to-end type safety)
- **State**: Zustand (timer-store, audio-store, ui-store)
- **Audio**: Howler.js (multi-channel mixer with individual volume)
- **Auth**: NextAuth.js (Google/GitHub OAuth)
- **Database**: Prisma + PostgreSQL
- **Styling**: Tailwind CSS + Glassmorphism (`#D0FFD6`)
- **PWA**: next-pwa (installable, offline, background notifications)
- **Icons**: lucide-react
- **Utilities**: clsx, tailwind-merge

## Architecture

### 3-Agent Model
- **Agent 1 (Architect)**: Folder structure, App Router, data consistency
- **Agent 2 (UI/UX)**: Tailwind CSS, Glassmorphism (#D0FFD6), Mobile-first
- **Agent 3 (Audio & Logic)**: Howler.js, React Hooks, multi-channel audio, Timer

### Key Patterns
- `src/server/routers/` — tRPC routers split by domain (timer, sound, user, friend, leaderboard)
- `src/stores/` — 3 Zustand stores: timer-store, audio-store, ui-store
- `src/hooks/` — Custom hooks wrapping stores + side effects
- `src/components/ui/` — Reusable Glassmorphism primitives (glass-card, button, etc.)
- `type` over `interface` for all TypeScript definitions

### Audio Channels
- **Ambient**: rain, ocean, fire, birds, wind
- **Lo-fi**: lofi-chill, lofi-jazz, lofi-piano
- Each channel has independent volume slider (mixer style)

### Timer Presets
- Pomodoro: 25min focus / 5min break / 15min long break (4 rounds)
- Deep Work: 50min focus / 10min break
- Quick: 15min focus / 3min break
- Custom: user-defined

### Persistence
- Backend: Next.js API Routes via tRPC + Prisma + PostgreSQL
- Auth: NextAuth.js (Google/GitHub OAuth)
- Synced data: timer presets, sound mixes, session history, friends, leaderboard

## Implementation Status

> **Update this section after each completed task.** New sessions read this to know what exists.

### Current Phase: Phase 3 — Atomic Components (Phase 2 complete)

### Completed Files
- `package.json` — Next.js 15, TypeScript, Tailwind CSS, ESLint, Turbopack
- `next.config.ts` — empty NextConfig
- `tsconfig.json` — strict TypeScript with `@/*` alias
- `src/app/layout.tsx` — root layout with Providers (tRPC + React Query + NextAuth SessionProvider), brand bg
- `src/app/providers.tsx` — client Providers component wrapping tRPC, QueryClient, SessionProvider
- `src/app/page.tsx` — glassmorphism verification page (will be replaced in Phase 3)
- `src/app/globals.css` — Tailwind v4 brand theme (@theme) + .glass/.glass-strong utilities
- `.gitignore` — standard Next.js ignores
- `public/sounds/ambient/` — placeholder dir for ambient audio files
- `public/sounds/lofi/` — placeholder dir for lo-fi audio files
- `public/icons/` — placeholder dir for PWA icons

- `prisma/schema.prisma` — full DB schema (User, Account, Session, VerificationToken, TimerSession, SoundMix, SoundChannel, Friendship)
- `prisma.config.ts` — Prisma 7 config (datasource URL via env, dotenv/config)
- `src/lib/prisma.ts` — Prisma singleton using PrismaPg driver adapter
- `.env.example` — env template (DATABASE_URL, AUTH_SECRET, OAuth credentials)

- `src/stores/timer-store.ts` — Zustand timer store (phase, secondsLeft, preset, session tracking)
- `src/stores/audio-store.ts` — Zustand audio store (channels map, global volume, playing state)
- `src/stores/ui-store.ts` — Zustand UI store (activePanel, modals, sidebar)
- `src/hooks/use-timer.ts` — useTimer hook (interval tick, auto-switch, session save via tRPC)
- `src/hooks/use-audio-mixer.ts` — useAudioMixer hook (Howler.js multi-channel, lazy init)
- `src/hooks/use-notification.ts` — useNotification hook (browser notifications + sound alert)
- `src/hooks/use-service-worker.ts` — useServiceWorker hook (SW registration, offline, update)
- `src/server/routers/timer.ts` — tRPC timer router (complete, history, stats)
- `src/server/routers/sound.ts` — tRPC sound router (saveMix, getMixes, deleteMix, setDefault)
- `src/server/routers/user.ts` — tRPC user router (profile, updateProfile)
- `src/server/routers/friend.ts` — tRPC friend router (sendRequest, respond, list, pending)
- `src/server/routers/leaderboard.ts` — tRPC leaderboard router (weekly+friendsOnly, monthly, allTime)
- `src/server/routers/root.ts` — appRouter merging all 5 routers
- `src/components/social/stats-card.tsx` — StatsCard (Server Component, props: todaySessions/todayFocusSec/streak/totalSessions)
- `src/components/social/history-chart.tsx` — HistoryChart (Server Component, CSS bar chart, props: data DayData[]/label)
- `src/components/social/leaderboard-table.tsx` — LeaderboardTable (Server Component, rank badges/avatars/focus hours, props: entries/currentUserId)
- `src/app/globals.css` — Added rank color tokens: `--color-rank-gold`, `--color-rank-silver`, `--color-rank-bronze` to @theme block

### Available Exports
- `prisma` from `@/lib/prisma` — Prisma client singleton
- `Providers` from `@/app/providers` — client provider wrapper
- `SOUND_CATALOG`, `AMBIENT_SOUNDS`, `LOFI_SOUNDS` from `@/lib/sounds`
- `TIMER_PRESETS` from `@/lib/presets` — Record keyed by PresetKey
- `useTimerStore` from `@/stores/timer-store`
- `useAudioStore` from `@/stores/audio-store`
- `useUIStore` from `@/stores/ui-store`
- `useTimer` from `@/hooks/use-timer`
- `useAudioMixer` from `@/hooks/use-audio-mixer`
- `useNotification` from `@/hooks/use-notification`
- `useServiceWorker` from `@/hooks/use-service-worker`
- `appRouter`, `AppRouter` from `@/server/routers/root`

### Key Types
- `SoundCategory` — `'ambient' | 'lofi'`
- `SoundDefinition` — `{ id, label, category, src }`
- `PresetKey` — `'pomodoro' | 'deepwork' | 'quick' | 'custom'`
- `TimerPreset` — `{ key, label, focusMinutes, shortBreakMinutes, longBreakMinutes, rounds }`
- `TimerPhase` — `'focus' | 'shortBreak' | 'longBreak'` (in timer-store)
- `AudioChannel` — `{ soundKey, volume, enabled }` (in audio-store)
- `LeaderboardEntry` — `{ rank, userId, name, image, totalSec, sessions }` (in leaderboard router)

### Prisma Notes
- `PrismaClient` from `@prisma/client` (schema uses `prisma-client-js` provider)
- Friendship model: `userId` (sender) + `friendId` (receiver) + `status: 'pending'|'accepted'`
- friend router maintains bidirectional accepted rows in a single `$transaction`
