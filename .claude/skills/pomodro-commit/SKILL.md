---
name: pomodro-commit
description: Create git commits for the Pomodro project with conventional commit format. Use this skill whenever the user says "commit", "commit code", "tạo commit", "save changes", "push code", or wants to commit any changes in the Pomodro project. Handles staging, conventional commit message generation, and optional push to remote. Always trigger for any commit-related request in the Pomodro project context.
---

# Pomodro: Commit

You are creating a git commit for the Pomodro project — a Next.js 15 Pomodoro Timer app.

**Working directory:** `c:\sub_workspace\pomodro`

---

## Modes

This skill operates in two modes depending on who invokes it:

| Mode | Who | Behavior |
|------|-----|----------|
| **Interactive** | User directly | Infers commit message from diff, asks about push |
| **Agent** | execute-phase skill | Receives files + message as args, skips push prompt |

**Detect agent mode** when args contain `agent-mode`. In that case:
- Use the `files=` and `message=` values from args directly — do not infer from diff
- Skip Step 7 (push prompt) — execute-phase handles push at the end of the phase
- Skip showing the message for confirmation — just commit immediately

---

## Step 1 — Read current state

Run these in parallel:

```bash
cd c:/sub_workspace/pomodro && git status
cd c:/sub_workspace/pomodro && git diff HEAD
cd c:/sub_workspace/pomodro && git log --oneline -5
cd c:/sub_workspace/pomodro && git branch --show-current
```

---

## Step 2 — Safety check

**If on `main` branch:** Warn the user and stop.

```
⚠️  You are on the main branch.
Pomodro never commits directly to main.
Create a feature branch first: git checkout -b feat/<description>
```

Do not commit. Ask the user if they want to create a branch first.

**If working tree is clean:** Report and stop.

```
Nothing to commit — working tree is clean.
```

---

## Step 3 — Understand the changes

Read the diff carefully. Identify:

- What files changed and why
- What feature, fix, or chore they represent
- The scope (which part of the app: timer, audio, social, ui, api, db, etc.)

---

## Step 4 — Choose commit type

Use **Conventional Commits** format: `<type>(<scope>): <description>`

| Type | When to use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `chore` | Tooling, config, dependencies (no production code) |
| `ci` | CI/CD pipeline changes (`.github/workflows/`) |
| `docs` | Documentation only (`docs/`, `CLAUDE.md`, `PROGRESS.md`) |
| `refactor` | Code restructure with no behavior change |
| `style` | Formatting, CSS tweaks with no logic change |
| `test` | Adding or updating tests |

**Scope** — use the app area:

| Scope | Covers |
|-------|--------|
| `timer` | Timer logic, stores, presets |
| `audio` | Howler.js, audio stores, sound channels |
| `auth` | NextAuth, session, OAuth |
| `db` | Prisma schema, migrations |
| `api` | tRPC routers, procedures |
| `ui` | Shared UI components, glassmorphism |
| `social` | Leaderboard, friends, stats |
| `pwa` | Service worker, manifest, offline |
| `config` | Tailwind, Next.js, TypeScript config |
| `phase<N>` | Phase-wide task (used by execute-phase skill) |

**Description rules:**
- Lowercase, imperative tense ("add", "fix", "update" — not "added" or "fixes")
- Under 72 characters total
- No period at the end

**Examples:**
```
feat(timer): add deep work preset with 50min focus interval
fix(audio): prevent Howler instances from stacking on re-enable
chore(config): update tailwind preset with brand-light token
docs: mark Phase 1 complete and set Phase 2 as in progress
ci: add GitHub Actions CI/CD pipeline with Vercel deploy
refactor(api): split timer router into session and preset procedures
```

---

## Step 5 — Stage files

**Never use `git add .` or `git add -A`.**

Stage only the files that belong to this logical change:

```bash
git add <file1> <file2> ...
```

If there are unrelated changes mixed in, ask the user which files to include in this commit.

---

## Step 6 — Commit

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>
EOF
)"
```

Show the commit message to the user before running it if there is any ambiguity about what the commit should contain.

---

## Step 7 — Ask about push

After a successful commit, ask:

```
Committed: <commit message>

Push to origin/<branch>? (y/n)
```

If yes:

```bash
git push origin <current-branch>
```

If the branch has no upstream yet:

```bash
git push -u origin <current-branch>
```

---

## Hard Rules

- **Never commit to `main`** — always on a feature branch
- **Never `git add .` or `git add -A`** — stage specific files only
- **No `--no-verify`** — hooks must run
- **Conventional commits only** — always `type(scope): description` format
- **One logical change per commit** — if multiple unrelated changes exist, ask the user to split them
