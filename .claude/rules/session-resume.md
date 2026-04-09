# Session Resume

When starting any session in this project, check `.claude/plans/` for orphaned tasks before doing anything else.

## Check for orphaned in-progress tasks

```bash
grep -rl "status: in-progress" c:\sub_workspace\pomodro\.claude\plans\
```

If any file has `status: in-progress`:

1. Read the file to identify the task (phase, task number, name)
2. Check git log to see if the task's commit landed:
   ```bash
   git log --oneline -5
   ```
3. **Commit exists** → mark task `done`, continue normally
4. **No commit** → inform the user before doing anything:

```
⚠️ Orphaned task detected: Task <N> "<task name>" was in-progress but has no commit.

Options:
  1. Re-implement from scratch (recommended — clean slate)
  2. Review current file state and continue from where it left off

Which would you like? (1 or 2)
```

Do NOT auto-resume or auto-discard. Always wait for the user's choice.

## Why

Sessions can die mid-task (network drop, timeout, manual stop). An `in-progress` task with no commit means the files may be in a partial or broken state. Silently continuing could commit broken code; silently discarding could lose real work.
