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

### Current Phase: NOT STARTED — Ready for Phase 1

### Completed Files
_(none yet — update as tasks are completed)_

### Available Exports
_(none yet)_

### Key Types
_(none yet)_
