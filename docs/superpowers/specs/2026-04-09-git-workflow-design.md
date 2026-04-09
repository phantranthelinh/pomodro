# Git Workflow Design — Pomodro

**Date:** 2026-04-09  
**Status:** Approved

## Overview

Add a GitHub Actions CI/CD pipeline to the Pomodro project. Uses Vercel CLI with GitHub Secrets for automated preview and production deployments.

## Approach

Vercel CLI in GitHub Actions + 1 workflow file. CI gate must pass before any deploy runs.

## Workflow File

**Path:** `.github/workflows/ci.yml`  
**Triggers:**
- `push` on any branch
- `pull_request` targeting `main`

## Jobs

```
lint → type-check → test → build → deploy-preview (PR only)
                                 → deploy-production (main only)
```

| Job | Tool | Command | Condition |
|---|---|---|---|
| `lint` | ESLint | `npm run lint` | always |
| `type-check` | TypeScript | `npx tsc --noEmit` | needs: lint |
| `test` | Jest/Vitest | `npm run test -- --passWithNoTests` | needs: type-check |
| `build` | Next.js | `npm run build` | needs: test |
| `deploy-preview` | Vercel CLI | `vercel --prebuilt` | needs: build, on PR |
| `deploy-production` | Vercel CLI | `vercel --prebuilt --prod` | needs: build, on main push |

## Configuration

**Node version:** 20.x (LTS)  
**Cache:** `node_modules` keyed on `package-lock.json`  
**Build reuse:** `vercel build` in the `build` job produces `.vercel/output/`; deploy jobs use `--prebuilt` to avoid rebuilding.

## GitHub Secrets Required

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Vercel API token from vercel.com/account/tokens |
| `VERCEL_ORG_ID` | From `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` after `vercel link` |

## Deploy Behavior

| Event | Job triggered | Result |
|---|---|---|
| Push to any branch | lint, type-check, test, build | CI check only |
| Open/update PR | + deploy-preview | Preview URL commented on PR |
| Merge to `main` | + deploy-production | Production deployment |

## Files to Create

- `.github/workflows/ci.yml` — the CI/CD pipeline
- `.vercel/` — added to `.gitignore` (contains local project link config)

## Out of Scope

- Branch protection rules (configured manually on GitHub)
- Environment variables for the app (configured in Vercel dashboard)
