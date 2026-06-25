# Budget And Safety Reference

## Required Envelope Fields

| Field | Requirement |
|---|---|
| Objective | One sentence describing why the loop exists. |
| Scope | Exact repo, branch, diff, OpenSpec change, dev-flow topic, or external source. |
| Trigger | `manual`, `heartbeat`, `scheduled`, `event_triggered`, or `background`. |
| Schedule kind | `manual`, `heartbeat`, `cron`, `interval`, `event`, or `none`; this describes a proposal only and does not create a scheduler. |
| Cron expression | Required only for cron proposals; include timezone and review it as untrusted user-supplied text. |
| Timezone | IANA timezone or `local`; required for cron or wall-clock schedules. |
| Max overlap | `0` means skip if a prior run is active; `1` means at most one active run. Never propose more than one writer. |
| Missed run policy | `skip`, `run_once`, or `ask_user` for delayed heartbeats or cron runs. |
| Jitter | Optional duration to spread repeated scans; keep `none` unless the user asks for load spreading. |
| Cadence | `manual`, `scheduled`, `event_triggered`, or `background`. |
| Allowed sources | Artifacts and tools the loop may read. |
| Allowed side effects | Default `read_only`; optionally `write_loop_report` when explicitly approved. |
| Forbidden side effects | Implementation changes, Git side effects, PRs, merges, tracker mutation, production actions, paid services. |
| Approval list | Actions that must return to the user before proceeding. |
| Budget | Structured summary required. Must include at minimum: `max_iterations` (numeric), `max_wall_time` (duration string, e.g. "30m", "2h"), `retry_cap` (numeric), and `cost_ceiling` (optional; use "unset" if not applicable). Free-text summaries are not accepted when trigger is not `manual`. |
| Trace requirements | Artifacts, commands, unavailable sources, candidates, scores, and side effects that must be recorded. |
| Eval checkpoint | Score threshold, candidate confidence, boundary review, or explicit user review required before route recommendation. |
| Stop conditions | Conditions that halt the loop without asking again. |
| Lock policy | Use `repo_writer_lock` whenever a future loop may hand off to writers. |

## Defaults

- `allowed_side_effects`: `read_only`
- `trigger`: `manual`
- `schedule_kind`: `none`
- `cron_expression`: `none`
- `timezone`: `local`
- `max_overlap`: 0
- `missed_run_policy`: `skip`
- `jitter`: `none`
- `max_iterations`: 1 for manual triage; 3 for approved repeated scans
- `max_agents`: 1 unless the user explicitly requests parallel review
- `retry_cap`: 1 for failed source reads
- `max_wall_time`:
  - default (manual): 30m
  - default (repeated/cron): 60m
  - note: Must be set explicitly or these defaults apply. No wall time = block.
- `trace_requirements`: sources checked, sources unavailable, candidates, recommended route, side effects performed
- `eval_checkpoint`: user review for route handoff; score threshold for persistent automation proposals
- `stop_conditions`: missing source, ambiguous scope, stale state conflict, budget exceeded, any requested write side effect

## Approval Rules

Require explicit user approval before:

- Starting `/dev-flow` from a candidate.
- Running `/dev-flow-cr`.
- Creating, updating, pausing, resuming, or deleting an automation through `dev-flow-scheduler`.
- Switching from a manual trigger to heartbeat, scheduled, event-triggered, or background cadence.
- Creating or approving cron/heartbeat schedules, including schedule expression, timezone, missed-run policy, and overlap policy.
- Writing loop reports, state files, or tracker issues.
- Creating worktrees, commits, pushes, PRs, merges, or tags.
- Calling external systems that mutate state or spend money.

## Blockers

Set `status: blocked` when:

- Objective or scope is unclear.
- Cadence is scheduled/background but no stop conditions exist.
- Trigger is heartbeat/scheduled/event/background but no approval scope or eval checkpoint exists.
- Schedule kind is heartbeat/cron/interval/event but schedule policy, timezone, missed-run policy, or overlap policy is absent.
- Any write side effect is requested without approval.
- A repo may receive concurrent writers and no lock policy exists.
- The loop would rely on chat memory as the primary source.
- `max_wall_time` is absent or zero when trigger is `scheduled`, `heartbeat`, `interval`, `event_triggered`, or `background`.
- `budget` field is absent or contains only free-text with no numeric `max_iterations` and no `max_wall_time` when trigger is not `manual`.

## Escalation Conditions

Escalation conditions are actions the agent must take (not just halt) when budget or safety limits are exceeded during a run:

| Condition | Escalation Action |
|---|---|
| `max_iterations` reached mid-run | Emit `loop_control_ready` with `status: blocked` and `unresolved_risks` noting iteration cap; notify user before stopping. |
| `max_wall_time` exceeded | Hard stop; emit `loop_control_ready` with `status: blocked`. |
| Any unexpected write side effect detected | Immediate halt; emit with `side_effects_performed` listing the violation. |
| `budget_exceeded` during a cron/scheduled run | Pause the automation and notify user. |
| 3+ consecutive scheduled run failures | Pause the automation and notify user; require manual resume. |
