---
name: pomodro-router
description: Create a new tRPC v11 router for the Pomodro project. Trigger when user says "create router", "new router", "add [name] router", "add API endpoint", "add tRPC procedure", or mentions timer/sound/user/friend/leaderboard API. Also trigger when user needs server-side data fetching logic for any Pomodro feature. Generates router with protected procedures, Prisma queries, proper error handling, and registers it in root.ts.
---

# Pomodro: Create tRPC Router

You are creating a tRPC v11 router for the Pomodro app.

## Router Structure

```
src/server/
├── trpc.ts              ← base procedures (publicProcedure, protectedProcedure)
├── context.ts           ← session + prisma in ctx
├── routers/
│   ├── root.ts          ← merges all routers → appRouter
│   ├── timer.ts         ← timer session CRUD
│   ├── sound.ts         ← sound mix save/load
│   ├── user.ts          ← profile, stats
│   ├── friend.ts        ← friend requests
│   └── leaderboard.ts   ← weekly/monthly rankings
```

## Base Setup Reference

```ts
// src/server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { type Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, session: ctx.session, userId: ctx.session.user.id } });
});
```

```ts
// src/server/context.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createContext({ req }: FetchCreateContextFnOptions) {
  const session = await getServerSession(authOptions);
  return { session, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

## Router Template

```ts
// src/server/routers/[name].ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, publicProcedure } from '../trpc';

export const [name]Router = router({
  // list query
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.[model].findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // single item query
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.prisma.[model].findUnique({
        where: { id: input.id },
      });
      if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
      if (item.userId !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN' });
      return item;
    }),

  // create mutation
  create: protectedProcedure
    .input(z.object({
      // add fields here
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.[model].create({
        data: { ...input, userId: ctx.userId },
      });
    }),

  // delete mutation
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.[model].findUnique({ where: { id: input.id } });
      if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
      if (item.userId !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN' });
      await ctx.prisma.[model].delete({ where: { id: input.id } });
      return { success: true };
    }),
});
```

## After Creating the Router

Register it in `src/server/routers/root.ts`:

```ts
import { router } from '../trpc';
import { timerRouter } from './timer';
import { soundRouter } from './sound';
import { [name]Router } from './[name]';   // ← add import

export const appRouter = router({
  timer: timerRouter,
  sound: soundRouter,
  [name]: [name]Router,                    // ← add here
});

export type AppRouter = typeof appRouter;
```

## Pomodro-Specific Router Examples

### Timer Router
Key procedures:
- `timer.logSession` — save a completed focus session (focusMin, breakMin, rounds, totalFocusSec, preset)
- `timer.getHistory` — last N sessions for the user
- `timer.getStats` — aggregate (total sessions, total focus time, current streak)

Streak logic: count consecutive calendar days with at least one completed session.

### Sound Router
- `sound.saveMix` — upsert a SoundMix + replace all SoundChannels (transaction)
- `sound.loadMix` — get user's saved mix with channels
- Use Prisma `$transaction` for saveMix to keep mix + channels atomic

### Leaderboard Router
- `leaderboard.getWeekly` — sum totalFocusSec per user WHERE completedAt >= start of current week
- `leaderboard.getMonthly` / `getAllTime` — same pattern, different date range
- Join with User to get name + image
- Limit to top 20, include the current user's rank even if outside top 20

### Friend Router
- `friend.sendRequest` — create Friendship with status `pending`
- `friend.acceptRequest` — update status to `accepted`
- `friend.getFriends` — all accepted friendships (union of both directions)
- `friend.getPending` — pending requests where `friendId = ctx.userId`

## Zod Validation Patterns

```ts
// Common schemas
const presetSchema = z.enum(['pomodoro', 'deepWork', 'quick', 'custom']);

const sessionInputSchema = z.object({
  preset: presetSchema,
  focusMin: z.number().min(1).max(120),
  breakMin: z.number().min(1).max(60),
  rounds: z.number().min(1).max(20),
  totalFocusSec: z.number().min(0),
});

const channelSchema = z.object({
  name: z.string(),
  volume: z.number().min(0).max(1),
  isActive: z.boolean(),
});
```

## Error Handling

Only throw TRPCError — never throw plain Error in procedures:

| Situation | Code |
|-----------|------|
| Not logged in | `UNAUTHORIZED` |
| Resource not found | `NOT_FOUND` |
| User doesn't own resource | `FORBIDDEN` |
| Invalid input state | `BAD_REQUEST` |
| External service failed | `INTERNAL_SERVER_ERROR` |
