---
description: Create or manage approved read-only Dev Flow automations through dev-flow-scheduler.
---

# Dev Flow Scheduler

Use this command as the Codex slash-command entrypoint for creating, updating, viewing, pausing, resuming, or deleting approved Dev Flow automations.

## Workflow

1. Use the `dev-flow-scheduler` skill as the owner.
2. Treat the argument after `/dev-flow-scheduler` as the automation request.
3. Load `dev-flow-loop-envelope` first when objective, scope, schedule, permissions, budget, stop conditions, or output are not already approved.
4. Confirm the user has explicitly approved the automation action before applying create/update/pause/resume/delete.
5. For recurring repo scans, use read-only `/dev-flow-triage` style prompts that produce a Candidate Inbox.
6. Emit `scheduler_ready`.

## Rules

- Do not create, update, pause, resume, or delete automations without explicit user approval.
- Prefer cron for detached workspace scans and heartbeat only for current-thread follow-ups.
- Do not scan candidates directly.
- Do not run `/dev-flow` automatically.
- Do not run `/dev-flow-cr` automatically.
- Do not modify files, commit, push, open PRs, merge, create worktrees, mutate trackers, call production systems, or perform full code review.
- Keep scheduler state separate from `dev-flow-state.md`.

## User Request

Apply the scheduler workflow above to the user's current request and any arguments supplied after `/dev-flow-scheduler`.
