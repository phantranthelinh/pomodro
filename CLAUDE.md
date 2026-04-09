# CLAUDE.md — Pomodro

## Project Overview

Pomodro — a Pomodoro Timer web app with multi-channel ambient audio mixer, Glassmorphism UI, and social features (stats, leaderboard). Built with Next.js App Router, tRPC, Zustand, Howler.js, Prisma + PostgreSQL, NextAuth.js, and Tailwind CSS.

## Hard Rules — "The Law"

### Rule 1: Token Efficiency
- Only read and write files relevant to the current task.
- Never output entire files when only a few lines changed — use diff format or minimal code blocks.

### Rule 2: Modularization
- Audio logic (`use-audio-mixer`) and timer logic (`use-timer`) must NEVER live in UI component files.
- All business logic must be in Custom Hooks (`src/hooks/`) or Zustand stores (`src/stores/`).
- Components are purely presentational + hook consumers.

### Rule 3: UX
- All audio interactions must be non-blocking (never block main thread).
- Use Howler.js HTML5 audio mode for smooth playback.
- Brand background color is always `#D0FFD6`. Glassmorphism style throughout.
- Mobile-first responsive design.

### Rule 4: No Placeholders
- Never write `// code here`, `// TODO`, or incomplete logic.
- Every function must have complete, working implementation.

### Rule 5: Update CLAUDE.md After Each Task
- After completing each task, update this file's "Implementation Status" section below.
- Add any new files created, exports available, key types/interfaces, and important patterns.
- This ensures subsequent tasks (even in new sessions) have full context of what exists.

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
