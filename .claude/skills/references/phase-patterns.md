# Phase Implementation Patterns

## Phase 1 — Scaffold & Install

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

npm install @trpc/server @trpc/client @trpc/next @trpc/react-query \
  @tanstack/react-query next-auth @auth/prisma-adapter \
  @prisma/client prisma zustand howler clsx tailwind-merge lucide-react

npm install -D @types/howler
```

## Phase 2 — Zustand Store Shape

```ts
// src/stores/timer-store.ts
import { create } from 'zustand';

type TimerState = { /* ... */ };
type TimerActions = { /* ... */ };

export const useTimerStore = create<TimerState & TimerActions>((set, get) => ({
  // state fields
  // action methods
}));
```

## Phase 2 — tRPC Protected Procedure

```ts
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, session: ctx.session } });
});
```

## Phase 3 — Glassmorphic Component

```tsx
type CardProps = { title: string; children: React.ReactNode };

export function Card({ title, children }: CardProps) {
  return (
    <div className="glass rounded-2xl p-4">
      <h2 className="text-brand-text font-semibold">{title}</h2>
      {children}
    </div>
  );
}
```
