# tRPC Router Reference

## Base Setup

### src/server/trpc.ts

```ts
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

### src/server/context.ts

```ts
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
import { router, protectedProcedure } from '../trpc';

export const [name]Router = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.[model].findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.prisma.[model].findUnique({ where: { id: input.id } });
      if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
      if (item.userId !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN' });
      return item;
    }),

  create: protectedProcedure
    .input(z.object({ /* fields */ }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.[model].create({ data: { ...input, userId: ctx.userId } });
    }),

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

## Common Zod Schemas

```ts
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

## Router Registration (root.ts)

```ts
import { router } from '../trpc';
import { timerRouter } from './timer';
import { soundRouter } from './sound';
import { [name]Router } from './[name]';

export const appRouter = router({
  timer: timerRouter,
  sound: soundRouter,
  [name]: [name]Router,
});

export type AppRouter = typeof appRouter;
```

## Domain Notes

### Timer Router
- `logSession` — save completed session (focusMin, breakMin, rounds, totalFocusSec, preset)
- `getHistory` — last N sessions
- `getStats` — total sessions, total focus time, streak (consecutive calendar days with ≥1 session)

### Sound Router
- `saveMix` — upsert SoundMix + replace SoundChannels in `$transaction`
- `loadMix` — get saved mix with channels

### Leaderboard Router
- Sum `totalFocusSec` per user WHERE `completedAt >= start of period`
- Join User for name + image; limit top 20; always include current user's rank

### Friend Router
- `sendRequest` → Friendship `status: pending`
- `acceptRequest` → `status: accepted`
- `getFriends` — accepted friendships (union both directions)
- `getPending` — pending WHERE `friendId = ctx.userId`
