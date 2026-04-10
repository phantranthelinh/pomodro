---
phase: 1
task: 6
status: done
---

# Task 6: Setup tRPC

**Phase:** 1 — Foundation
**Status:** done

## Files

- Create: `src/server/trpc.ts`
- Create: `src/server/context.ts`
- Create: `src/server/routers/root.ts`
- Create: `src/app/api/trpc/[trpc]/route.ts`
- Create: `src/lib/trpc-client.ts`
- Create: `src/app/providers.tsx`

## Steps

- Step 1: Create tRPC context (`src/server/context.ts`)
- Step 2: Create tRPC init with publicProcedure and protectedProcedure (`src/server/trpc.ts`)
- Step 3: Create root router (`src/server/routers/root.ts`)
- Step 4: Create tRPC API route handler (`src/app/api/trpc/[trpc]/route.ts`)
- Step 5: Create tRPC React client (`src/lib/trpc-client.ts`)
- Step 6: Create providers wrapper (`src/app/providers.tsx`)
- Step 7: Verify tRPC endpoint responds
- Step 8: Commit

## Commit

`feat: setup tRPC v11 with context, auth middleware, and React Query provider`
