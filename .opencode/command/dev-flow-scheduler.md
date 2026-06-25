---
description: Create or manage approved read-only Dev Flow automations through dev-flow-scheduler
---

Enter Dev Flow Scheduler.

Use `dev-flow-scheduler` to create, update, view, pause, resume, or delete approved automations. This command manages scheduling only; it does not design loop logic or execute development work.

---

**Input**: The argument after `/dev-flow-scheduler` is the automation action, schedule, target, or management request.

Examples:

- `/dev-flow-scheduler create a daily read-only mesh risk scan`
- `/dev-flow-scheduler pause the daily dev-flow triage automation`
- `/dev-flow-scheduler show existing dev-flow automations`

---

## What This Command Does

It should:

1. Enter the `dev-flow-scheduler` skill.
2. Load `dev-flow-loop-envelope` first when objective, scope, schedule, permissions, budget, stop conditions, or output are not already approved.
3. Confirm explicit user approval before applying create/update/pause/resume/delete.
4. Use read-only `/dev-flow-triage` style prompts for recurring repo scans.
5. Emit `scheduler_ready`.

It should not:

- Do not create, update, pause, resume, or delete automations without explicit user approval
- scan candidates directly
- Do not run `/dev-flow` automatically
- Do not run `/dev-flow-cr` automatically
- Do not modify files, commit, push, open PRs, merge, create worktrees, mutate trackers, call production systems, or perform full code review

---

## Guardrails

- Keep scheduler state separate from `dev-flow-state.md`.
- Prefer cron for detached workspace scans and heartbeat only for current-thread follow-ups.
- Default recurring scan prompts to read-only Candidate Inbox output.
