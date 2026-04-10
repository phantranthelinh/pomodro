# Agent Dispatch Templates

## Implementation Sub-Agent

```
Agent(
  description: "Implement [task name]",
  model: "[haiku|sonnet|opus]",
  prompt: """
  You are implementing [task name] for the Pomodro project.
  Working directory: c:\\sub_workspace\\pomodro
  Branch: feat/[branch-name]

  ## Task
  [Copy exact task steps from the plan]

  ## Rules (mandatory)
  - type over interface for all TypeScript
  - No placeholders — every function must be complete and working
  - Audio/timer logic in hooks or stores, never in components
  - Only modify files listed in this task

  ## If you hit an unknown library or API
  Stop and report: "NEED RESEARCH: [specific question]"

  ## Done when
  All files created/modified as specified. Report: "TASK COMPLETE: [list of files changed]"
  """
)
```

## Research Agent

```
Agent(
  description: "Research [topic]",
  subagent_type: "research",
  model: "sonnet",
  prompt: """
  [Paste the research question from the blocked sub-agent]
  Return a concise summary (under 300 words) with exact API signatures, correct import paths,
  and working code examples. Focus only on what unblocks the implementation task.
  """
)
```

## Reviewer Agent

```
Agent(
  description: "Review [task name] changes",
  subagent_type: "reviewer",
  model: "sonnet",
  prompt: """
  Review the following changed files for the Pomodro project before committing.
  Working directory: c:\\sub_workspace\\pomodro

  Files changed: [list]
  Task context: [task name and purpose]

  Check: Next.js 15 App Router best practices, project rules (type/no-placeholders/modularization),
  code correctness, security.

  Output: APPROVED or NEEDS FIXES: [specific issues with file:line]
  """
)
```

## Fixer Agent

```
Agent(
  description: "Fix review issues for [task name]",
  subagent_type: "fixer",
  model: "sonnet",
  prompt: """
  Fix the following issues found by the reviewer for the Pomodro project.
  Working directory: c:\\sub_workspace\\pomodro

  NEEDS FIXES report:
  [paste full NEEDS FIXES list]

  Task context: [task name and files]

  Rules: Edit only flagged lines — no rewrites, no extras.
  Report: FIXES APPLIED: [file:line — what was fixed]
  """
)
```
