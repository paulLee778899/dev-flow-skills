# Replanning And Recovery Reference

## Table of Contents

- [Dynamic Replanning During Execution](#dynamic-replanning-during-execution)
- [Requirement Change During Execution](#requirement-change-during-execution)
- [Capability Fallback](#capability-fallback)
- [Progress File](#progress-file)
- [Execution Context Recovery](#execution-context-recovery)
- [Required Signal](#required-signal)

## Dynamic Replanning During Execution

Implementation may reveal missing subtasks, wrong boundaries, hidden dependencies, extra tests, or safer ordering. Treat these as orchestration maintenance, not a reason to stop, when inside the approved baseline.

Automatic replanning examples:

- split an oversized unresolved task
- merge unresolved tasks that must be implemented together
- add a prerequisite task: fixture, shared helper, migration wrapper, type definition, test utility, integration adapter
- add discovered test commands or regression scope to Executable Test Matrix
- reorder unresolved downstream batches due to dependency edge changes
- mark completed output `still valid` and redirect downstream tasks
- add stub/mock follow-up after an accepted skip/defer decision

Required artifact updates:

1. Update `task-orchestration.md`: task IDs, dependencies, batches, acceptance criteria, diagnostics, tests, quality gates, done signals.
2. Update `test-plan.md` when tests, fixtures, regression scope, or batch verification change.
3. Update `dev-flow-state.md` and `progress.md`: replan decision, old/new task mapping, affected batches, current execution pointer, gate impact, and accepted risks.
4. Update HLD/DDD if design details change without altering requirement baseline.
5. Rebuild/reconcile Runtime Orchestration State.
6. Recompute DAG and confirm no cycles.
7. Continue with next eligible batch/sub-wave.

Runtime synchronization after any replan:

1. Write artifact changes first.
2. Re-read/reconstruct DAG from `task-orchestration.md`.
3. Rebuild Executable Test Matrix from orchestration and test plan.
4. Recompute batches/sub-waves.
5. Reconcile runtime states:
   - running tasks remain running until settled
   - completed tasks become `still valid`, `needs adapter`, `superseded`, or `must rollback`
   - pending tasks are re-queued by new DAG
   - failed/skipped/deferred tasks keep recovery status unless explicitly superseded
   - blocked tasks are re-evaluated
6. Update current execution pointer.
7. Confirm next dispatch uses updated runtime state, not stale memory.

If runtime and persisted artifacts disagree, do not dispatch from memory. Reconcile using: actual Git/filesystem/task results → `dev-flow-state.md` → `task-orchestration.md` → `test-plan.md` → `progress.md` → chat memory. Rewrite `dev-flow-state.md` and `progress.md`, then continue automatically.

Do not ask the user before replanning when all are true:

- approved requirement baseline and acceptance baseline remain unchanged
- no destructive Git operation is required
- no external credential, paid service, production environment, or irreversible side effect is required
- change only affects unresolved tasks or preserves completed work as `still valid`
- updated Executable Test Matrix still has concrete pass/fail checks

Completed work classification:

- `still valid`: keep and update downstream dependencies
- `needs adapter`: keep and add adapter/integration test task
- `superseded`: keep history, do not count as satisfying new task
- `must rollback`: hard-stop if rollback is destructive or needs approval; otherwise follow `dev-flow-git` safe rollback rules

Every automatic adjustment must appear in `dev-flow-state.md`, `progress.md`, and final acceptance report with a short reason. Replanning must not become silent scope creep.

Requirement change gate rules:

- Re-enter Phase 1 Gate if requirement analysis changes materially: scope boundary, business goal, product/system requirement, or acceptance baseline.
- Re-enter Phase 2 Gate if requirement baseline is stable but design/task orchestration/Git execution plan changes materially.
- No gate re-entry for inside-baseline replans: task split/merge for unresolved work, prerequisite task, test command, fixture/stub/mock, dependency reorder, or local implementation detail that does not alter requirements, acceptance, Git mode, or user-owned risk.

## Requirement Change During Execution

A user-provided requirement or goal change during Phase 3 is not normal dynamic replanning. It is a governance event.

Treat the change as requirement/goal change if it affects any of:

- business goal or user value
- scope boundary or non-goals
- acceptance criteria / definition of done
- public API, protocol, data schema, permissions, UI behavior, integration contract
- technology stack, deployment target, rollout, rollback, migration, or compatibility
- task list, dependency graph, batch order, or Git execution mode in a way that changes approved orchestration

Mandatory handling:

1. Do not dispatch any new task based on stale documents or stale Runtime Orchestration State.
2. Let already-running task agents settle if stopping them would corrupt state; ignore their results for new-scope readiness until replanning is complete.
3. Mark affected pending/downstream tasks as `stale-pending` in Runtime Orchestration State.
4. Load `dev-flow-planning` before continuing implementation.
5. Update the affected planning artifacts first:
   - requirement analysis when scope/goal/acceptance changes
   - HLD/DDD when design assumptions, API/protocol/data/security/UI/technology choices change
   - test plan when verification scope or acceptance checks change
   - `task-orchestration.md` when task list, dependencies, batches, done signals, or Executable Test Matrix change
6. Rewrite `dev-flow-state.md` and `progress.md` with the requirement-change summary, affected artifacts, stale tasks, completed-work classification, and next required gate.
7. Re-enter the earliest required gate:
   - Phase 1 Gate for requirement baseline or acceptance baseline changes
   - Phase 2 Gate for orchestration/Git/test-matrix changes with stable requirement baseline
8. Wait for explicit user approval at that gate before dispatching any affected task.
9. After approval, rebuild Runtime Orchestration State from the updated artifacts and continue the run-to-completion loop.

Do not treat "the user changed the goal" as an automatic inside-baseline replan. Do not directly continue implementation after such a change, even if the code change looks small.

When gate re-entry is not required, update artifacts and progress, announce briefly at next batch-boundary update, and continue immediately.

## Capability Fallback

- If `superpowers:test-driven-development` is unavailable, run equivalent TDD: failing test first, minimal implementation, re-run tests, refactor after green.
- If sub-agent dispatch is unavailable, main agent may execute DAG serially with the same task/test contract, and must record the fallback.
- If PR/remotes/permissions are unavailable, only Git integration falls back through `dev-flow-git`; do not skip implementation, diagnostics, tests, review/self-check, or delivery reporting.

## Progress File

Update `Docs/<topic>/progress.md` or the canonical legacy path:

- when planning state needs recovery before Phase 2, at least as a pointer to `dev-flow-state.md`
- after Phase 2 Gate is cleared
- after each batch completes
- after retries, skips, rollbacks, pauses, fallbacks, or replans
- before resuming after interruption

Progress file is a recovery aid, not sole source of truth. Reconcile conflicts by: actual Git/filesystem/task results → `dev-flow-state.md` → `task-orchestration.md` → `test-plan.md` → `progress.md` → chat memory.

## Execution Context Recovery

When Phase 3 resumes after interruption, compaction, new session, tool crash, or suspected stale context, do not continue from the previous in-memory Runtime Orchestration State.

Before dispatching any task, rebuild Runtime Orchestration State from:

1. actual Git/filesystem/task results
2. `dev-flow-state.md`
3. `task-orchestration.md`
4. `test-plan.md`
5. `progress.md`
6. chat memory only as a last-resort hint

Mandatory recovery checks:

- If `dev-flow-state.md` or `progress.md` records requirement change, `stale-pending`, gate re-entry, failed/blocked task, rollback, skip/defer decision, or pause, resume that recovery path first.
- If a task is marked done but its changed files/tests/evidence are missing, treat it as not settled and re-verify before advancing.
- If a task is marked done but task self-review, required UI/UX evidence, or canonical Git integration state is missing, treat it as not settled for acceptance.
- If a task is marked running but no task agent is active, classify it as interrupted and either resume the same task context or retry without counting it as a task failure until a final signal exists.
- If documents changed after Runtime Orchestration State was last built, rebuild DAG, batches, Executable Test Matrix, and current execution pointer.
- Rewrite `dev-flow-state.md` and `progress.md` after reconciliation and before dispatching more work.

Never dispatch from stale memory after recovery. The first action after recovery must be state reconstruction or explicit gate handling.

## Required Signal

Emit `execution_settled` at batch boundaries and before acceptance with: Runtime Orchestration State summary, task states, final signals received, diagnostics/tests run, batch status, dynamic replans applied, fallbacks used, task self-review evidence status, and unresolved blockers. Emit and persist `review_evidence_ready` when integrated tasks have the required task self-review evidence.
