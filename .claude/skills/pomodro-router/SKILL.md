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

> See `.claude/skills/references/router-examples.md` for base setup (trpc.ts, context.ts), router template, Zod schemas, and domain-specific procedure notes (timer, sound, leaderboard, friend).

## After Creating the Router

Register it in `src/server/routers/root.ts`:

```ts
import { [name]Router } from './[name]';

export const appRouter = router({
  // existing routers...
  [name]: [name]Router,
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
