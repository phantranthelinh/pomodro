# Context Compaction

When context usage reaches 70% or more in a session, compact before continuing.

## How to compact

Run the `/compact` command to summarize the conversation and free up context space.

## When to check

Check context usage:
- Before dispatching a new sub-agent
- Before starting a new task in the execution loop
- Any time you notice responses slowing or context feeling heavy

## Why

Phases have 10–14 tasks each with multiple sub-agent dispatches (implementer, reviewer, fixer). Without compaction, context fills up mid-phase and the session dies — losing track of which tasks are done and leaving orphaned `in-progress` plan files.

Compact early rather than waiting for the session to hit its limit.
