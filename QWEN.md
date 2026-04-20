# QWEN.md — JeFocus

## Project Overview

**JeFocus** is a focus timer web application with a multi-channel ambient audio mixer. It implements the Pomodoro technique with customizable presets, a glassmorphism-styled UI, social features (friends, leaderboards), and PWA support for offline use.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| API | tRPC (client + server) |
| Database | PostgreSQL + Prisma ORM |
| State Management | Zustand |
| Audio | Howler.js |
| Authentication | NextAuth.js (Google/GitHub OAuth) |
| Styling | Tailwind CSS v4 (Glassmorphism design) |
| PWA | @ducanh2912/next-pwa |
| UI Components | lucide-react, shadcn, clsx, tailwind-merge, CVA |
| Language | TypeScript (strict mode) |

## Directory Structure

```
jefocus/
├── src/
│   ├── app/                    # Next.js App Router pages & layout
│   │   ├── api/                # API routes (auth, trpc)
│   │   ├── dashboard/          # Stats & history page
│   │   ├── leaderboard/        # Rankings & friends page
│   │   ├── layout.tsx          # Root layout + providers
│   │   ├── page.tsx            # Main timer page
│   │   ├── providers.tsx       # React Query, Session, Theme providers
│   │   └── globals.css         # Tailwind v4 theme + glassmorphism classes
│   ├── components/
│   │   ├── ui/                 # Glassmorphism UI primitives
│   │   ├── audio/              # Mixer panel & audio controls
│   │   ├── timer/              # Timer display, controls, preset selector
│   │   └── social/             # Stats card, history chart, leaderboard table
│   ├── hooks/                  # Custom hooks (use-timer, use-audio-mixer, etc.)
│   ├── lib/                    # Utilities, configs, and shared constants
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── presets.ts          # Timer preset definitions
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── sounds.ts           # Sound catalog definitions
│   │   ├── trpc-client.ts      # tRPC React client
│   │   └── utils.ts            # Shared utility functions
│   ├── server/
│   │   ├── routers/            # tRPC routers by domain
│   │   │   ├── root.ts         # Root router (merges all sub-routers)
│   │   │   ├── timer.ts        # Timer session CRUD + stats
│   │   │   ├── sound.ts        # Sound mix management
│   │   │   ├── user.ts         # User profile
│   │   │   ├── friend.ts       # Friend requests & management
│   │   │   └── leaderboard.ts  # Global rankings
│   │   ├── context.ts          # tRPC context (session, prisma)
│   │   └── trpc.ts             # tRPC server initialization
│   └── stores/                 # Zustand stores
│       ├── timer-store.ts      # Timer state machine
│       ├── audio-store.ts      # Audio mixer state
│       └── ui-store.ts         # UI state (modals, panels, etc.)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Prisma migrations
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # PWA icons
│   └── sounds/                 # Audio assets (ambient + lofi)
└── .claude/                    # AI assistant rules, agents, plans, skills
```

## Key Architecture Patterns

### Audio Channels
- **Ambient**: rain, ocean, fire, birds, wind (each independently mixable)
- **Lo-fi**: lofi-chill, lofi-jazz, lofi-piano (each with independent volume control)

### Timer Presets
| Preset | Focus | Short Break | Long Break | Rounds |
|---|---|---|---|---|
| Pomodoro | 25 min | 5 min | 15 min | 4 |
| Deep Work | 50 min | 10 min | 30 min | 2 |
| Quick | 15 min | 3 min | 10 min | 4 |
| Custom | 25 min | 5 min | 15 min | 4 |

### Key Types
- `SoundCategory` — `'ambient' | 'lofi'`
- `SoundDefinition` — `{ id, label, category, src }`
- `PresetKey` — `'pomodoro' | 'deepwork' | 'quick' | 'custom'`
- `TimerPreset` — `{ key, label, focusMinutes, shortBreakMinutes, longBreakMinutes, rounds }`
- `TimerPhase` — `'focus' | 'shortBreak' | 'longBreak'`
- `AudioChannel` — `{ soundKey, volume, enabled }`
- `LeaderboardEntry` — `{ rank, userId, name, image, totalSec, sessions }`

### Database Schema (Prisma)
- **User** — standard NextAuth user with timer sessions, sound mixes, friendships
- **TimerSession** — completed focus sessions (preset, focus time, rounds, total seconds)
- **SoundMix** — saved audio mixer configurations with nested SoundChannel entries
- **Friendship** — bidirectional friend requests (`status: 'pending' | 'accepted'`)

## Building and Running

### Prerequisites
- Node.js 20+
- PostgreSQL database
- `.env` file (copy from `.env.example`)

### Setup
```bash
# Install dependencies
npm install   # or yarn

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and OAuth credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### Development
```bash
npm run dev        # Start dev server with Turbopack
```

### Production
```bash
npm run build      # Prisma generate + Next.js build
npm run start      # Start production server
```

### Linting
```bash
npm run lint       # ESLint
```

### PWA Notes
- PWA is **disabled in development** (`disable: process.env.NODE_ENV === "development"`)
- Service worker caches: sound assets (CacheFirst), tRPC API (NetworkFirst), images (StaleWhileRevalidate)
- App is installable and supports offline mode

## Development Conventions

### Code Organization
- **Business logic** lives exclusively in `src/hooks/` (custom hooks) and `src/stores/` (Zustand stores)
- **Components** are purely presentational — they consume hooks/stores, never contain business logic
- Audio logic (`use-audio-mixer`) and timer logic (`use-timer`) must NEVER live in UI component files
- Use `type` over `interface` for all TypeScript definitions
- Path alias: `@/*` maps to `./src/*`

### UI Conventions
- Glassmorphism design language with `.glass` and `.glass-strong` CSS classes
- Primary accent color: `#D0FFD6` (green)
- Tailwind CSS v4 with `@theme` directive in `globals.css`
- Component styling via `clsx`, `tailwind-merge`, and `class-variance-authority`

### Project Status
**Phase 4 — Integration & PWA: COMPLETE (MVP done)**

All core features are implemented: timer page, dashboard, leaderboard, PWA, tRPC routers, Zustand stores, audio hooks, and social components.

## Available Exports

| Module | Export | Description |
|---|---|---|
| `@/lib/prisma` | `prisma` | Prisma client singleton |
| `@/app/providers` | `Providers` | App-level React providers |
| `@/lib/sounds` | `SOUND_CATALOG`, `AMBIENT_SOUNDS`, `LOFI_SOUNDS` | Sound definitions |
| `@/lib/presets` | `TIMER_PRESETS` | Timer preset configurations |
| `@/stores/*` | `useTimerStore`, `useAudioStore`, `useUIStore` | Zustand stores |
| `@/hooks/*` | `useTimer`, `useAudioMixer`, `useNotification`, `useServiceWorker` | Custom hooks |
| `@/server/routers/root` | `appRouter`, `AppRouter` | tRPC root router |
