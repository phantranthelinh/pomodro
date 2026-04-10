# Common Fix Patterns

## `interface` → `type`

```ts
// Before
interface TimerState { ... }

// After
type TimerState = { ... }
```

## Missing `'use client'`

```tsx
// Add at very top, before any imports
'use client';

import { useState } from 'react';
```

## Route handler export

```ts
// Before (wrong — default export)
export default function handler(req, res) { ... }

// After (correct — named HTTP exports)
export async function GET(req: Request) { ... }
export async function POST(req: Request) { ... }
```

## Hardcoded color → Tailwind token

```tsx
// Before
<div style={{ color: '#2D3436' }}>

// After
<div className="text-brand-text">
```

## Business logic in component → hook

```tsx
// Before
export function TimerDisplay() {
  const [seconds, setSeconds] = useState(1500);
  useEffect(() => { setInterval(...) }, []);
}

// After
export function TimerDisplay() {
  const { seconds } = useTimer(); // logic lives in src/hooks/use-timer.ts
}
```

## Placeholder → complete implementation

```ts
// Before
function calculateProgress() {
  // TODO: implement
}

// After
function calculateProgress(elapsed: number, total: number): number {
  return Math.min((elapsed / total) * 100, 100);
}
```
