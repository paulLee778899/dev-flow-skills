# Automation Management Reference

## Action Rules

| Action | Requirement |
|---|---|
| `create` | Require explicit user approval of schedule, target workspace/thread, prompt, model when relevant, and execution environment. Before creating, check for an existing automation with the same `target_scope` + `prompt_summary` combination. If a duplicate is found: do not create a second automation; present the existing automation to the user; ask whether to update the existing one or create a distinct new one. |
| `update` | Preserve existing fields unless the user explicitly changes them. |
| `view` | Read and summarize existing automation state without changing it. Inputs: `automation_id` (or list all if none provided). Single-automation output: `kind`, `schedule`, `status`, `last_run_summary`, `next_run_estimate`. List-all output: summary table with `automation_id`, `kind`, `schedule`, `status` per row. Side effects: none. Note the `last_sync_time` in the response; output may be stale if automation state changed externally since last sync. |
| `pause` | Set the automation inactive only after user confirmation. |
| `resume` | Set the automation active only after user confirmation. |
| `delete` | Delete only after user confirmation and include the automation id/name in the confirmation. |

## Cron Versus Heartbeat

| Kind | Use for | Avoid when |
|---|---|---|
| `cron` | Detached recurring workspace scans, daily/weekly monitors, repo health checks. | The user wants this current thread to wake up soon and continue. |
| `heartbeat` | Current-thread follow-ups or short interval reminders tied to this conversation. | The job should run independently against a repo/workspace. |

## Required Safety Checks

- Confirm target repo or workspace path.
- Confirm cadence, timezone, missed-run behavior, and max overlap from the loop envelope.
- Confirm prompt is read-only unless the user explicitly approves `write_loop_report`.
- Confirm the prompt forbids `/dev-flow`, `/dev-flow-cr`, code edits, Git side effects, PRs, merges, worktrees, external mutations, and paid services.
- Confirm output shape: Candidate Inbox, report summary, or notification.
- Confirm budget: max wall time, max agents, retry cap, and stop conditions.

## Read-Only Scan Prompt Shape

Use this shape for recurring triage scans:

```text
Run a read-only dev-flow-triage style scan for <repo>.

Check only available evidence: git status, diff summary, visible test/CI artifacts, OpenSpec/opsx artifacts, dev-flow artifacts, CR reports, issue/PR/log evidence explicitly available.

Do not modify files, do not run /dev-flow, do not run /dev-flow-cr, do not commit, push, open PRs, merge, create worktrees, mutate trackers, call production systems, or perform a full code review.

Output a Chinese Candidate Inbox with candidate, evidence, severity, confidence, recommended route, user-confirmation requirement, and review limits.
```

## Scheduled Run Failure Handling

### Failure Definition

A scheduled automation run is considered failed when:

- The agent run produces no output within `max_wall_time`.
- The run exits with an error before emitting any signal.
- The run emits a signal with `status: blocked` and no user is present to respond.

### Retry Policy

```
retry_cap: inherited from loop_envelope_ready (default 1)
retry_delay: fixed 5 minutes between retries
retry_scope: single run only (not the whole schedule)
```

### Consecutive Failure Escalation

```
after: 3 consecutive failed runs
action: pause the automation; notify user with failure summary
requires: manual user resume before automation continues
```

### Dead-letter Path

If a scheduled run fails and `retry_cap` is exhausted:

1. Set automation status to: `paused_on_failure`.
2. Persist a failure record with: `run_id`, `timestamp`, `error_summary`, `attempts_made`.
3. Present failure summary to user on next session open (if possible).
4. Do not auto-resume; require explicit user resume.

## Blockers

Set `status: blocked` when:

- The target repo/workspace is unclear.
- The schedule or timezone is unclear.
- The automation prompt could write code or start implementation/review flows automatically.
- The user has not explicitly approved create/update/pause/resume/delete.
- The requested action needs external credentials or production access.
