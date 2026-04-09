# Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the Pomodro project with Next.js 15, Tailwind CSS (glassmorphism theme), Prisma + PostgreSQL, NextAuth.js (Google/GitHub OAuth), and tRPC.

**Architecture:** Next.js 15 App Router with `src/` directory. tRPC v11 for type-safe API via `fetchRequestHandler`. NextAuth v5 with Prisma adapter for database sessions. Zustand for client state (installed now, configured in Phase 2).

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth.js v5, tRPC v11, Zustand, Howler.js, lucide-react, clsx, tailwind-merge

---

## File Structure (Phase 1)

```
c:\sub_workspace\pomodro\
├── prisma/
│   └── schema.prisma
├── public/
│   ├── sounds/ambient/    (empty dirs, files added later)
│   └── sounds/lofi/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── api/
│   │   │   ├── trpc/[trpc]/route.ts
│   │   │   └── auth/[...nextauth]/route.ts
│   │   └── providers.tsx
│   ├── server/
│   │   ├── trpc.ts
│   │   ├── routers/
│   │   │   └── root.ts
│   │   └── context.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   └── trpc-client.ts
│   └── styles/
│       └── globals.css
├── .env.example
├── .env.local
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

### Task 1: Create Next.js Project

**Files:**
- Create: entire project scaffold via `create-next-app`

- [ ] **Step 1: Scaffold project**

```bash
cd c:\sub_workspace\pomodro
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"
```

Answer `Yes` to all prompts. This creates the base Next.js 15 project with TypeScript, Tailwind CSS, ESLint, App Router, `src/` directory, and Turbopack.

Expected: Project created with `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`.

- [ ] **Step 2: Verify project runs**

```bash
cd c:\sub_workspace\pomodro
npm run dev
```

Expected: Dev server starts at `http://localhost:3000`, default Next.js page loads.

- [ ] **Step 3: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 15 project with TypeScript and Tailwind"
```

---

### Task 2: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install production dependencies**

```bash
npm install @trpc/server@next @trpc/client@next @trpc/react-query@next @tanstack/react-query zustand howler lucide-react clsx tailwind-merge next-auth@beta @auth/prisma-adapter @prisma/client
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D prisma @types/howler
```

- [ ] **Step 3: Verify installation**

```bash
npm ls @trpc/server zustand howler next-auth @prisma/client
```

Expected: All packages listed without errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install tRPC, Zustand, Howler.js, NextAuth, Prisma dependencies"
```

---

### Task 3: Configure Tailwind Theme & Glassmorphism

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update tailwind.config.ts**

Replace the entire content of `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#D0FFD6",
          dark: "#A8E6CF",
          text: "#2D3436",
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Update globals.css with glassmorphism utilities**

Replace the entire content of `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-brand-light: #D0FFD6;
  --color-brand-dark: #A8E6CF;
  --color-brand-text: #2D3436;
}

.glass {
  background: rgba(208, 255, 214, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(208, 255, 214, 0.25);
  border-radius: 1rem;
}

.glass-strong {
  background: rgba(208, 255, 214, 0.3);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(208, 255, 214, 0.4);
  border-radius: 1rem;
}
```

- [ ] **Step 3: Verify Tailwind works**

Update `src/app/page.tsx` temporarily:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-brand-light flex items-center justify-center">
      <div className="glass p-8">
        <h1 className="text-3xl font-bold text-brand-text">Pomodro</h1>
        <p className="text-brand-text/70 mt-2">Focus timer with ambient sounds</p>
      </div>
    </main>
  );
}
```

Run `npm run dev` and verify:
- Background is `#D0FFD6`
- Card has glassmorphism blur effect
- Text is `#2D3436`

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css src/app/page.tsx
git commit -m "feat: configure Tailwind brand theme and glassmorphism utilities"
```

---

### Task 4: Setup Prisma Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `.env.example`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

Expected: Creates `prisma/schema.prisma` and `.env` with `DATABASE_URL`.

- [ ] **Step 2: Write the full schema**

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === NextAuth Required Models ===

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]

  timerSessions TimerSession[]
  soundMixes    SoundMix[]
  friendsOf     Friendship[]   @relation("friendOf")
  friendsWith   Friendship[]   @relation("friendsWith")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// === App Models ===

model TimerSession {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  preset        String
  focusMin      Int
  breakMin      Int
  rounds        Int
  totalFocusSec Int
  completedAt   DateTime @default(now())

  @@index([userId, completedAt])
}

model SoundMix {
  id        String         @id @default(cuid())
  userId    String
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  channels  SoundChannel[]
  isDefault Boolean        @default(false)
  createdAt DateTime       @default(now())

  @@index([userId])
}

model SoundChannel {
  id       String   @id @default(cuid())
  mixId    String
  mix      SoundMix @relation(fields: [mixId], references: [id], onDelete: Cascade)
  soundKey String
  volume   Float
  enabled  Boolean  @default(true)
}

model Friendship {
  id        String   @id @default(cuid())
  userId    String
  friendId  String
  user      User     @relation("friendOf", fields: [userId], references: [id], onDelete: Cascade)
  friend    User     @relation("friendsWith", fields: [friendId], references: [id], onDelete: Cascade)
  status    String   @default("pending")
  createdAt DateTime @default(now())

  @@unique([userId, friendId])
  @@index([friendId])
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `src/lib/prisma.ts`:

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 4: Create .env.example**

Create `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pomodro?schema=public"

# NextAuth
AUTH_SECRET="generate-with-npx-auth-secret"
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

- [ ] **Step 5: Update .env with DATABASE_URL**

Ensure `.env` (or `.env.local`) has a valid `DATABASE_URL` pointing to your local PostgreSQL.

- [ ] **Step 6: Generate Prisma client and push schema**

```bash
npx prisma generate
npx prisma db push
```

Expected: Prisma client generated, database tables created.

- [ ] **Step 7: Verify with Prisma Studio**

```bash
npx prisma studio
```

Expected: Opens at `http://localhost:5555` showing all tables (User, Account, Session, VerificationToken, TimerSession, SoundMix, SoundChannel, Friendship).

- [ ] **Step 8: Add .env to .gitignore**

Ensure `.gitignore` includes:
```
.env
.env.local
```

- [ ] **Step 9: Commit**

```bash
git add prisma/schema.prisma src/lib/prisma.ts .env.example .gitignore
git commit -m "feat: setup Prisma schema with User, TimerSession, SoundMix, Friendship models"
```

---

### Task 5: Setup NextAuth.js

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create auth config**

Create `src/lib/auth.ts`:

```ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub, Google],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
```

- [ ] **Step 2: Create API route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

- [ ] **Step 3: Generate AUTH_SECRET**

```bash
npx auth secret
```

Copy the generated secret to `.env.local` as `AUTH_SECRET`.

- [ ] **Step 4: Verify auth endpoint**

Run `npm run dev` and visit `http://localhost:3000/api/auth/providers`.

Expected: JSON response listing GitHub and Google providers (they'll show errors until OAuth credentials are configured, but the endpoint should respond).

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/
git commit -m "feat: setup NextAuth.js with GitHub/Google OAuth and Prisma adapter"
```

---

### Task 6: Setup tRPC

**Files:**
- Create: `src/server/trpc.ts`
- Create: `src/server/context.ts`
- Create: `src/server/routers/root.ts`
- Create: `src/app/api/trpc/[trpc]/route.ts`
- Create: `src/lib/trpc-client.ts`
- Create: `src/app/providers.tsx`

- [ ] **Step 1: Create tRPC context**

Create `src/server/context.ts`:

```ts
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function createTRPCContext(_opts: FetchCreateContextFnOptions) {
  const session = await auth();

  return {
    prisma,
    session,
    user: session?.user,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
```

- [ ] **Step 2: Create tRPC init with procedures**

Create `src/server/trpc.ts`:

```ts
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});
```

- [ ] **Step 3: Create root router**

Create `src/server/routers/root.ts`:

```ts
import { router } from '../trpc';

export const appRouter = router({});

export type AppRouter = typeof appRouter;
```

- [ ] **Step 4: Create tRPC API route handler**

Create `src/app/api/trpc/[trpc]/route.ts`:

```ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/root';
import { createTRPCContext } from '@/server/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

- [ ] **Step 5: Create tRPC React client**

Create `src/lib/trpc-client.ts`:

```ts
import { createTRPCReact } from '@trpc/react-query';
import { AppRouter } from '@/server/routers/root';

export const trpc = createTRPCReact<AppRouter>();
```

- [ ] **Step 6: Create providers wrapper**

Create `src/app/providers.tsx`:

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/lib/trpc-client';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

- [ ] **Step 7: Verify tRPC endpoint**

Run `npm run dev` and visit `http://localhost:3000/api/trpc`.

Expected: Response (even if error about missing procedure, the endpoint is alive).

- [ ] **Step 8: Commit**

```bash
git add src/server/ src/app/api/trpc/ src/lib/trpc-client.ts src/app/providers.tsx
git commit -m "feat: setup tRPC v11 with context, auth middleware, and React Query provider"
```

---

### Task 7: Wire Root Layout with Providers

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

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
      <body className={`${inter.className} bg-brand-light text-brand-text min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create sound directories**

```bash
mkdir -p public/sounds/ambient public/sounds/lofi public/icons
```

- [ ] **Step 3: Verify full stack**

Run `npm run dev`:
- Page loads with green background (#D0FFD6)
- No console errors about providers
- Network tab shows no failed requests

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wire root layout with tRPC, NextAuth, and React Query providers"
```

---

### Task 8: Create Sound Catalog Definition

**Files:**
- Create: `src/lib/sounds.ts`

- [ ] **Step 1: Define sound catalog**

Create `src/lib/sounds.ts`:

```ts
type SoundCategory = 'ambient' | 'lofi';

type SoundDefinition = {
  key: string;
  name: string;
  category: SoundCategory;
  path: string;
  icon: string; // lucide-react icon name
};

export const SOUND_CATALOG: SoundDefinition[] = [
  { key: 'rain', name: 'Rain', category: 'ambient', path: '/sounds/ambient/rain.mp3', icon: 'CloudRain' },
  { key: 'ocean', name: 'Ocean Waves', category: 'ambient', path: '/sounds/ambient/ocean.mp3', icon: 'Waves' },
  { key: 'fire', name: 'Fireplace', category: 'ambient', path: '/sounds/ambient/fire.mp3', icon: 'Flame' },
  { key: 'birds', name: 'Birds', category: 'ambient', path: '/sounds/ambient/birds.mp3', icon: 'Bird' },
  { key: 'wind', name: 'Wind', category: 'ambient', path: '/sounds/ambient/wind.mp3', icon: 'Wind' },
  { key: 'lofi-chill', name: 'Lo-fi Chill', category: 'lofi', path: '/sounds/lofi/lofi-chill.mp3', icon: 'Music' },
  { key: 'lofi-jazz', name: 'Lo-fi Jazz', category: 'lofi', path: '/sounds/lofi/lofi-jazz.mp3', icon: 'Music2' },
  { key: 'lofi-piano', name: 'Lo-fi Piano', category: 'lofi', path: '/sounds/lofi/lofi-piano.mp3', icon: 'Piano' },
];

export const AMBIENT_SOUNDS = SOUND_CATALOG.filter(s => s.category === 'ambient');
export const LOFI_SOUNDS = SOUND_CATALOG.filter(s => s.category === 'lofi');
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/sounds.ts
git commit -m "feat: define sound catalog with ambient and lo-fi channels"
```

---

### Task 9: Define Timer Presets

**Files:**
- Create: `src/lib/presets.ts`

- [ ] **Step 1: Define timer presets**

Create `src/lib/presets.ts`:

```ts
export type PresetKey = 'pomodoro' | 'deepwork' | 'quick' | 'custom';

type TimerPreset = {
  key: PresetKey;
  name: string;
  focusMin: number;
  breakMin: number;
  longBreakMin: number;
  rounds: number;
};

export const TIMER_PRESETS: Record<PresetKey, TimerPreset> = {
  pomodoro: {
    key: 'pomodoro',
    name: 'Pomodoro',
    focusMin: 25,
    breakMin: 5,
    longBreakMin: 15,
    rounds: 4,
  },
  deepwork: {
    key: 'deepwork',
    name: 'Deep Work',
    focusMin: 50,
    breakMin: 10,
    longBreakMin: 20,
    rounds: 2,
  },
  quick: {
    key: 'quick',
    name: 'Quick',
    focusMin: 15,
    breakMin: 3,
    longBreakMin: 5,
    rounds: 4,
  },
  custom: {
    key: 'custom',
    name: 'Custom',
    focusMin: 25,
    breakMin: 5,
    longBreakMin: 15,
    rounds: 4,
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/presets.ts
git commit -m "feat: define timer presets (Pomodoro, Deep Work, Quick, Custom)"
```

---

### Task 10: Final Verification & Phase 1 Complete

- [ ] **Step 1: Run build check**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 3: Update PROGRESS.md**

Update `docs/PROGRESS.md`:

```markdown
# Pomodro — Progress Tracker

> Update this file after completing each task. New sessions should read this first.

## Current Status: PHASE 2 — CORE LOGIC

## Completed
- [x] Design spec approved (docs/superpowers/specs/2026-04-09-pomodro-design.md)
- [x] CLAUDE.md created with Hard Rules
- [x] Tailwind theme decided: 3-token (brand-light, brand-dark, brand-text)
- [x] Implementation plans written (docs/superpowers/plans/)
- [x] Phase 1: Foundation complete
  - Next.js 15 scaffolded with TypeScript + Tailwind
  - Prisma schema with all models + PostgreSQL
  - NextAuth.js with GitHub/Google OAuth + Prisma adapter
  - tRPC v11 with context, auth middleware, React Query provider
  - Glassmorphism CSS utilities (.glass, .glass-strong)
  - Sound catalog + timer presets defined

## In Progress
- [ ] Phase 2: Core Logic (stores, hooks, tRPC routers)

## Not Started
- [ ] Phase 3: Atomic Components
- [ ] Phase 4: Integration & PWA
```

- [ ] **Step 4: Commit**

```bash
git add docs/PROGRESS.md
git commit -m "docs: mark Phase 1 Foundation complete"
```
