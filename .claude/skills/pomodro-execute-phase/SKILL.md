---
name: pomodro-execute-phase
description: Execute a Pomodro implementation phase plan end-to-end with per-task commits. Use this skill whenever the user says "execute phase", "implement phase", "run phase", "start phase", or references any of the 4 phases (foundation, core logic, components, PWA). Also trigger when user says "let's implement" or "start building" in the Pomodro project context. Reads the phase plan file, creates individual task plan files in .claude/plans/, implements all tasks sequentially, reviews and fixes before each commit, and updates PROGRESS.md and CLAUDE.md after every task.
---

# Pomodro: Execute Phase

You are implementing a phase of the Pomodro Pomodoro Timer app — a Next.js 15 app with tRPC, Zustand, Howler.js, and Prisma.

## Phase Plans

| Phase | File | Tasks |
|-------|------|-------|
| 1 | `docs/superpowers/plans/2026-04-09-phase1-foundation.md` | 10 — Next.js scaffold, Tailwind, Prisma, tRPC, NextAuth |
| 2 | `docs/superpowers/plans/2026-04-09-phase2-core-logic.md` | 14 — Zustand stores, hooks, tRPC routers |
| 3 | `docs/superpowers/plans/2026-04-09-phase3-components.md` | 14 — UI components (glassmorphism, timer, audio, social) |
| 4 | `docs/superpowers/plans/2026-04-09-phase4-integration-pwa.md` | 10 — Pages, PWA config, offline, notifications |

---

## Before You Start

### 1. Read CLAUDE.md

Always read `CLAUDE.md` first — it overrides everything else.

### 2. Read the phase plan file fully

Read the entire phase plan before writing any code. Understand all tasks and their dependencies.

### 3. Determine resume point from `.claude/plans/`

Check `.claude/plans/` for existing task plan files for this phase:

- **No files exist** → fresh start, proceed to Phase Kickoff
- **All files are `done`** → phase already complete, report to user and stop
- **File count matches task count, some `done` rest `pending`** → skip done tasks, start from first `pending`
- **File count is less than task count** → Phase Kickoff was interrupted. Follow the **Incomplete Kickoff Protocol** below, then resume
- **Any file is `in-progress`** → orphaned session detected. Follow the **Orphaned Task Protocol** below before continuing

#### Incomplete Kickoff Protocol

When `.claude/plans/` has fewer files than the number of tasks in the phase plan:

1. Read all existing plan files — note which task numbers already exist
2. Read the phase plan file — identify all tasks and their numbers
3. Create plan files **only for the missing tasks** (do not overwrite existing ones)
4. After all files exist, proceed to resume from the first `pending` task

#### Orphaned Task Protocol

When a task file has `status: in-progress`, a previous session died mid-task. Before continuing:

1. Read the `in-progress` task plan file
2. Check git log: `git log --oneline -5` — did this task's commit land?
   - **Yes (commit exists)** → mark task `done`, continue to next `pending`
   - **No (no commit)** → ask the user:

```
Task <N> "<task name>" was in progress but has no commit.
Options:
  1. Re-implement from scratch (recommended)
  2. Review current file state and continue

Which would you like? (1 or 2)
```

Wait for the user's answer before proceeding.

---

## Phase Kickoff — Create Task Plan Files

**Only on fresh start** (no existing `.claude/plans/` files for this phase). Skip if resuming.

Create one plan file per task in `.claude/plans/` before writing any code.

### Directory

```
c:\sub_workspace\pomodro\.claude\plans\
```

Create if it does not exist.

### File naming

```
phase<N>-task-<TT>-<slug>.md
```

Examples: `phase1-task-01-scaffold-nextjs.md`, `phase2-task-03-timer-store.md`

Use zero-padded task numbers (`01`, `02`, ... `14`) so files sort correctly.

### Plan file format

```markdown
---
phase: <N>
task: <T>
status: pending
---

# Task <T>: <Task Name>

**Phase:** <N> — <Phase Name>
**Status:** pending

## Files

- Create: `path/to/file`
- Modify: `path/to/other`

## Steps

(copy steps verbatim from the phase plan)

## Commit

`<commit message from plan>`
```

### Status values

| Value | Meaning |
|-------|---------|
| `pending` | Not started |
| `in-progress` | Currently being implemented |
| `done` | Completed and committed |
| `blocked` | Waiting on research or manual fix |

---

## Create Feature Branch

After creating all task plan files, before writing any code:

```bash
cd c:\sub_workspace\pomodro
git checkout main
git pull origin main
git checkout -b feat/phase<N>-<slug>
# e.g. feat/phase1-foundation, feat/phase2-core-logic
```

**Never commit directly to main.** All work happens on the feature branch. Push and open a PR after the last task.

After the last task completes:

```bash
git push origin feat/phase<N>-<slug>
```

Report to the user:
```
Branch feat/phase<N>-<slug> is ready.
Tasks completed: <N>
Open a PR from feat/phase<N>-<slug> → main to review.
```

---

## Execution Loop

For each task (in order, skipping `done` tasks):

### Step 1 — Set in-progress

Update the task's plan file: `status: pending` → `status: in-progress` in both the frontmatter and the **Status** line.

### Step 2 — Read the task

Understand exactly what files to create/modify. Do not skip or reorder steps.

### Step 3 — Implement

- Write complete, production-ready code — no `// TODO`, no placeholder strings
- `type` not `interface` for all TypeScript data shapes
- Logic in `src/hooks/` or `src/stores/` — never inside component files
- Glassmorphism: use `.glass` / `.glass-strong` CSS classes
- Colors: Tailwind tokens `brand-light` / `brand-dark` / `brand-text` — no hardcoded hex

### Step 4 — Reviewer Gate (mandatory, never skip)

After implementation, dispatch the reviewer agent:

```
Agent(
  description: "Review task <T>: <task name>",
  subagent_type: "reviewer",
  model: "sonnet",
  prompt: """
  Review the following changed files for the Pomodro project before committing.
  Working directory: c:\\sub_workspace\\pomodro

  Files changed: [list of files created/modified in this task]
  Task context: Task <T> — <task name and purpose>

  Check for:
  1. Next.js 15 App Router best practices (Vercel standards)
  2. Project rules: type over interface, no placeholders, no logic in components
  3. Code correctness and completeness
  4. Security issues

  Output: APPROVED or NEEDS FIXES: [specific issues with file:line]
  """
)
```

### Step 5 — Fixer Loop (if reviewer returned NEEDS FIXES)

If reviewer output is `NEEDS FIXES`:

1. Mark task plan file `status: blocked`
2. Dispatch fixer agent:

```
Agent(
  description: "Fix review issues for task <T>",
  subagent_type: "fixer",
  model: "sonnet",
  prompt: """
  Fix the following issues found by the reviewer for the Pomodro project.
  Working directory: c:\\sub_workspace\\pomodro

  NEEDS FIXES report:
  [paste full NEEDS FIXES list]

  Task context: [task name and files]

  Rules:
  - Edit, never rewrite — use targeted fixes only
  - Only fix what was flagged — do not touch other code
  - Report: FIXES APPLIED: [file:line — what was fixed]
  """
)
```

3. After fixer reports `FIXES APPLIED`, re-dispatch reviewer (Step 4)
4. Repeat until reviewer returns `APPROVED`
5. Once approved, set task plan file back to `status: in-progress`

### Step 6 — Commit (only after APPROVED)

Use the **pomodro-commit** skill to stage and commit. Pass the commit message from the task plan and the list of changed files. The skill runs in **agent mode** — no push prompt.

```
Skill("pomodro-commit", args: "agent-mode files=<file1>,<file2> message=<commit message from plan>")
```

If the Skill tool is unavailable in the current context, fall back to:

```bash
git add <specific files changed — never git add . or git add -A>
git commit -m "<commit message from plan>"
```

### Step 7 — Mark done + update CLAUDE.md

Do both before moving to the next task:

1. Check off `- [ ]` → `- [x]` in the phase plan file
2. Update the task's plan file: `status: in-progress` → `status: done`
3. Update `CLAUDE.md` Implementation Status — add new files, exports, types, patterns introduced by this task

### Step 8 — Loop

Continue to the next `pending` task immediately.

---

## After the Last Task

1. Update `docs/PROGRESS.md` — mark phase complete, set next phase as "In Progress"
2. Final commit: `docs: mark Phase N complete [pomodro]`

---

## Hard Rules (never break these)

- **No placeholders** — every file must be working, importable code
- **Reviewer gate is mandatory** — never commit without APPROVED
- **Fixer over rewrite** — fix only the flagged lines, never rewrite a whole file
- **No logic in components** — timer/audio/store mutations go in `src/hooks/` or `src/stores/`
- **Lazy audio** — only create Howler instances when a channel is first enabled; destroy on disable
- **Type over interface** — `type User = {...}` not `interface User {...}`
- **Commit per task** — never batch multiple tasks into one commit
- **`git add` specific files only** — never `git add .` or `git add -A`
- **Mobile-first** — base styles first, expand at `md:` breakpoint
- **CLAUDE.md after every task** — not just at end of phase

---

## Implementation Patterns

See `.claude/skills/references/phase-patterns.md` for scaffold commands (Phase 1), Zustand store shape and tRPC protected procedure (Phase 2), and glassmorphic component pattern (Phase 3).
