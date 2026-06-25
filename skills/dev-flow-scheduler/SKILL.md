---
name: dev-flow-scheduler
description: Use when the user asks to create, update, view, pause, resume, or delete scheduled/recurring Codex automations, heartbeat follow-ups, cron scans, monitors, daily/weekly checks, or timed dev-flow-loop triage tasks.
---

# Dev Flow Scheduler

Automation management skill for Dev Flow. It turns an approved loop envelope into a Codex automation proposal or change; it does not decide the loop logic and does not run implementation.

## Boundary

- Manage automation records only after explicit user approval for schedule, target workspace, prompt, model, and execution environment.
- Do not scan candidates, implement fixes, run `/dev-flow`, run `/dev-flow-cr`, commit, push, open PRs, create worktrees, mutate trackers, or call production systems.
- Do not run `/dev-flow` automatically.
- Do not run `/dev-flow-cr` automatically.
- For recurring code-risk scans, default to read-only `/dev-flow-triage` style prompts and Candidate Inbox output.
- Use `dev-flow-loop-envelope` first when the user has not already approved objective, scope, schedule, permissions, budget, stop conditions, and output.

## Language Policy

All user-facing replies in dev-flow are in Chinese.

## Core Contract

1. Classify the scheduler action: create, update, view, pause, resume, or delete.
2. Confirm required inputs: target repo/workspace, cadence, timezone, prompt, execution environment, allowed side effects, and stop conditions.
3. Refuse automation that would automatically start `/dev-flow`, run `/dev-flow-cr`, modify code, perform Git side effects, create worktrees, mutate trackers, or spend money.
4. Use the automation tool only after user approval; prefer cron for detached workspace scans and heartbeat only for current-thread follow-ups.
5. Emit `scheduler_ready` with automation scope, schedule, approval evidence, side effects, and status.

## References

- `references/automation-management.md`: Load before creating, updating, pausing, resuming, deleting, or proposing a scheduled/heartbeat automation.

## Required Signal

```yaml
scheduler_ready:
  producer: dev-flow-scheduler
  timestamp: <ISO-8601>
  action: create | update | view | pause | resume | delete
  automation_kind: cron | heartbeat | interval | event | manual | none
  target_scope: <workspace | current_thread | none>
  schedule: <summary>
  timezone: <IANA timezone or local>
  prompt_summary: <one line>
  approved_by_user: true | false
  loop_control_score: <0-100 or none>
  allowed_side_effects: [read_only | write_loop_report]
  forbidden_side_effects: [implementation_changes, git_commit, git_push, pr_create, merge, worktree_create, run_dev_flow, run_dev_flow_cr, external_mutation, paid_service]
  status: ready | blocked | applied
  automation_id: <id or none>
  review_limits: [list or none]
```
