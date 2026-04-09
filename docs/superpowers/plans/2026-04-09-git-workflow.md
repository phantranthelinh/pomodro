# Git Workflow (CI/CD) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Actions CI/CD pipeline that runs lint, type-check, test, build — and deploys to Vercel preview (on PR) or production (on push to main).

**Architecture:** One workflow file (`.github/workflows/ci.yml`) with 6 sequential jobs: lint → type-check → test → build → deploy-preview/deploy-production. Vercel CLI handles all deployments using 3 GitHub Secrets.

**Tech Stack:** GitHub Actions, Vercel CLI, Node 20, npm

---

### Task 1: Create `.github/workflows/ci.yml`

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/ci.yml` with the full content below:

```yaml
name: CI/CD

on:
  push:
    branches:
      - '**'
  pull_request:
    branches:
      - main

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  type-check:
    name: Type Check
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    name: Test
    needs: type-check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test -- --passWithNoTests

  build:
    name: Build
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build

  deploy-preview:
    name: Deploy Preview
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Pull Vercel Environment (Preview)
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build for Vercel
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Preview
        id: deploy
        run: echo "url=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})" >> $GITHUB_OUTPUT
      - name: Comment Preview URL on PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployed: ${{ steps.deploy.outputs.url }}`
            })

  deploy-production:
    name: Deploy Production
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Pull Vercel Environment (Production)
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build for Production
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy to Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

- [ ] **Step 2: Verify file was created**

```bash
cat .github/workflows/ci.yml
```

Expected: file contents printed without errors.

---

### Task 2: Update `.gitignore`

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Check if `.gitignore` exists**

```bash
cat .gitignore 2>/dev/null || echo "FILE_NOT_FOUND"
```

- [ ] **Step 2: Add `.vercel/` to `.gitignore`**

If `.gitignore` exists, append to it:
```
# Vercel local project link (contains orgId and projectId)
.vercel
```

If `.gitignore` does not exist, create it with:
```
# Vercel local project link (contains orgId and projectId)
.vercel

# Next.js
.next/
out/

# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env*.local

# Logs
npm-debug.log*

# OS
.DS_Store
```

---

### Task 3: Commit

**Files:** all changes above

- [ ] **Step 1: Stage files**

```bash
git add .github/workflows/ci.yml .gitignore
```

- [ ] **Step 2: Commit**

```bash
git commit -m "ci: add GitHub Actions CI/CD pipeline with Vercel deploy"
```

Expected output includes: `1 file changed` or `2 files changed`.

- [ ] **Step 3: Push to remote**

```bash
git push origin main
```

Then go to `https://github.com/phantranthelinh/pomodro/actions` to verify the workflow appears.

---

## Post-Setup Checklist

Before the first CI run succeeds, ensure these are done in GitHub:

1. Go to `https://github.com/phantranthelinh/pomodro/settings/secrets/actions`
2. Add 3 secrets:
   - `VERCEL_TOKEN` — from vercel.com/account/tokens
   - `VERCEL_ORG_ID` — from `.vercel/project.json` after running `vercel link`
   - `VERCEL_PROJECT_ID` — from `.vercel/project.json` after running `vercel link`

> **Note:** The `test` job uses `--passWithNoTests` (Jest flag). If the project uses Vitest, change this to `npx vitest run` which passes with no tests by default. This will be confirmed when Phase 1 foundation is set up.
