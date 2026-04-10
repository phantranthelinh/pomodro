---
phase: 1
task: 5
status: done
---

# Task 5: Setup NextAuth.js

**Phase:** 1 — Foundation
**Status:** done

## Files

- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

## Steps

- Step 1: Create auth config (`src/lib/auth.ts`) with GitHub + Google providers and Prisma adapter
- Step 2: Create API route handler (`src/app/api/auth/[...nextauth]/route.ts`)
- Step 3: Generate AUTH_SECRET and add to `.env.local`
- Step 4: Verify auth endpoint responds at `/api/auth/providers`
- Step 5: Commit

## Commit

`feat: setup NextAuth.js with GitHub/Google OAuth and Prisma adapter`
