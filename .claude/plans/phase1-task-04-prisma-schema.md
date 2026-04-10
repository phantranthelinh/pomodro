---
phase: 1
task: 4
status: done
---

# Task 4: Setup Prisma Schema

**Phase:** 1 — Foundation
**Status:** done

## Files

- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `.env.example`

## Steps

- [ ] Step 1: Initialize Prisma with `npx prisma init --datasource-provider postgresql`
- [ ] Step 2: Write full schema (User, Account, Session, VerificationToken, TimerSession, SoundMix, SoundChannel, Friendship)
- [ ] Step 3: Create Prisma client singleton at `src/lib/prisma.ts`
- [ ] Step 4: Create `.env.example`
- [ ] Step 5: Update .env with DATABASE_URL
- [ ] Step 6: Generate Prisma client and push schema
- [ ] Step 7: Verify with Prisma Studio
- [ ] Step 8: Add .env to .gitignore
- [ ] Step 9: Commit

## Commit

`feat: setup Prisma schema with User, TimerSession, SoundMix, Friendship models`
