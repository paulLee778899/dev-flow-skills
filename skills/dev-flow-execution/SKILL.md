---
name: dev-flow-execution
description: Use when Phase 3 has started and the agent must execute continuously, dynamically replan tasks, verify results, handle sub-agent settlement, and maintain runtime orchestration state.
---

# dev-flow-execution

Owns Phase 3 run-to-completion execution after Phase 2 Gate is cleared, including dynamic replanning inside the approved baseline.

## Agent Cap

| Project size | Total tasks | Max concurrent agents per batch |
|---|---:|---:|
| Small | 1–5 | 2 |
| Medium | 6–15 | 4 |
| Large | 16+ | 6 |

If `branch-only serial mode` is selected by `dev-flow-git`, writer cap is 1 and all implementation writes run serially.

If `shared-working-tree serial agent mode` is selected by `dev-flow-git`, writer cap is 1, but the writing unit may be a task sub-agent directly modifying the current local checkout. The main agent coordinates, verifies, reconciles state, and dispatches the next writing agent only after the current task settles.

If `shared-worktree patch mode` is selected, analysis/patch-producing agents may run up to the normal agent cap, but shared working-tree writes still have writer cap 1. The main agent applies patch outputs serially.

## Default Execution Actor

After Phase 2 Gate is approved, execute with multi-agent/subagent dispatch by default. The main agent remains the coordinator: it dispatches tasks, enforces Git and side-effect boundaries, verifies done signals, reconciles progress, and integrates results.

**REQUIRED SUB-SKILL:** Use `superpowers:subagent-driven-development` when available for independent task execution in the current session. Use `superpowers:dispatching-parallel-agents` when available for independent sidecar analysis or verification. If those skills are unavailable, follow the fallback execution rules in this skill.

Use task batches, dependency order, agent cap, and the `git_safe` writer limit to decide whether tasks can run in parallel. If parallel writes are unsafe, automatically use serial subagent execution, shared-worktree patch mode, or main-agent serial execution. If the user explicitly requested main-agent-only serial work at Phase 2 Gate, follow that override.

If subagent dispatch is unavailable in the current platform, continue with main-agent serial execution using the same task/test contract and record the fallback in `progress.md` and the final delivery report.

## Runtime Orchestration State

During Phase 3, maintain an in-memory Runtime Orchestration State derived from:

1. `task-orchestration.md`
2. `test-plan.md`
3. `progress.md`
4. actual task results
5. actual Git / filesystem state

Track at least:

- current phase, batch, sub-wave
- pending / running / completed / failed / skipped / deferred / blocked tasks
- retry counts
- task dependency graph
- execution batches and sub-waves
- active Executable Test Matrix
- Git isolation and integration mode
- execution actor mode and any fallback
- fallback mode, if any
- last known artifact revision or update summary

`task-orchestration.md` is the canonical persisted plan, but Phase 3 dispatch is driven by Runtime Orchestration State. After any artifact change, rebuild or reconcile runtime state before dispatching more work. Never continue from a stale in-memory task list.

## Run-to-Completion Loop

Once Phase 3 begins, this is not an interactive step-by-step workflow.

Loop:

1. Select the next unresolved batch/sub-wave from Runtime Orchestration State.
2. Dispatch eligible tasks up to the agent cap.
3. Wait for dispatched tasks to settle.
4. Collect every final signal and verify required done signals.
5. If shared-worktree patch mode is active, apply settled patch outputs serially in the main working tree.
6. Run per-task and batch checks from the Executable Test Matrix.
7. Update `progress.md`, affected orchestration/test artifacts, and Runtime Orchestration State.
8. If the batch passes, immediately advance to the next batch/sub-wave without asking.
9. After all batches pass, invoke `dev-flow-acceptance`.

Do not stop after a task, batch, progress update, sub-agent success, fallback selection, patch-ready output, or automatic replan if execution can safely continue.

Hard-stop conditions are limited to:

- retry limit exhausted and a user recovery decision is required
- destructive Git operation or unsafe side effect requires explicit approval through `dev-flow-git`
- requirement-baseline or acceptance-baseline change requires Phase 1 or Phase 2 gate re-entry
- missing external dependency cannot be mocked, stubbed, skipped, deferred, or otherwise resolved under fallback rules
- repository/bookkeeping/runtime-state inconsistency would make next dispatch unsafe
- all batches are settled and control must move to `dev-flow-acceptance`

These are **not** hard-stops by themselves:

- ambiguity that can be resolved by reading existing artifacts or inspecting project state
- failing tests inside an active TDD loop
- dependency changes that can be handled by Dynamic Replanning
- missing test commands that can be added to the Executable Test Matrix without changing acceptance baseline
- Git capability gaps that can use `patch-ready mode`
- user refusal of worktrees when `shared-worktree patch mode` can safely preserve multi-agent analysis
- child-agent intermediate errors before final settlement

Forbidden stopping language:

- “下一步可以继续执行...”
- “是否继续下一个 batch？”
- “我已经完成 Batch 1，等待你的确认”
- “任务已完成，后续可以运行测试”
- “patch 已准备好，是否需要我继续？”

Correct behavior:

- “Batch 1 已通过，正在启动 Batch 2。”
- “T-03 patch-ready，验证已通过，继续执行同批剩余任务。”
- “所有任务已完成，正在运行最终 Executable Test Matrix。”

## Task Settlement and Final Signal Protocol

Sub-agents may report intermediate errors, failing tests, type errors, merge conflicts, or retry attempts while still working. These are in-progress telemetry, not final outcomes.

A task is settled only on one final signal:

- `final_success`: required done signal with changed files, diagnostics, tests, quality evidence, and Git/patch state
- `final_failed`: explicit report that task cannot complete under current plan, with context
- `final_blocked`: explicit blocker not resolvable by local fallback/retry
- `cancelled_by_master`: only under documented hard-stop/recovery rule

Never treat these as final failure by themselves:

- Red-phase failing tests
- failing tests before fix attempt is complete
- TypeScript/LSP/lint/build error still being addressed
- command error followed by alternate plan
- merge conflict still being resolved under `dev-flow-git`
- progress message containing “failed/error/blocked/retry” without final signal

Result collection:

- wait for every dispatched task in the sub-wave to settle before judging the sub-wave
- verify final done signal against `task-orchestration.md` and Executable Test Matrix
- if `final_success` has incomplete evidence, request evidence from the same task context if possible before marking failed
- if runner crashes/disappears without final signal, treat as infrastructure failure and resume/retry same task context when possible before counting task retry

Only settled `final_failed` or `final_blocked` can trigger Failure Handling.

## Shared-Worktree Patch Execution

When `dev-flow-git` selects `shared-worktree patch mode`, execution has two concurrency lanes:

- analysis/patch lane: multiple sub-agents may run in parallel up to the agent cap
- writer lane: only the main agent writes to the local working tree, one patch/task at a time

Sub-agent task prompt requirements in this mode:

- explicitly state that the sub-agent must not edit files
- request patch-ready output or precise edit instructions instead of direct modifications
- require expected changed files, patch content, tests/diagnostics to run, and risk/overlap notes
- require a final signal with `patch_ready` evidence, not `final_success` based on un-applied changes

Main-agent apply loop:

1. Collect settled patch-ready outputs from the current sub-wave.
2. Order them by dependency and file/symbol overlap risk.
3. Before each apply, re-read or inspect the actual target files as needed.
4. Apply exactly one patch/task to the shared working tree.
5. Run that task's required diagnostics/tests.
6. If the patch no longer applies cleanly, reconcile it against current state or ask the same task context for a refreshed patch; do not mark the task failed merely because earlier patches changed the file.
7. Update Runtime Orchestration State and `progress.md` after each applied patch.
8. Continue applying the next patch until the sub-wave is settled.

In this mode, a sub-agent's patch-ready output is an intermediate deliverable. The task is complete only after the main agent applies and verifies it in the shared working tree.

## Shared-Working-Tree Serial Agent Execution

When `dev-flow-git` selects `shared-working-tree serial agent mode`, task sub-agents may directly implement in the current local checkout without worktrees or task branches, but writing is strictly serial.

Execution rules:

1. Dispatch at most one writing task agent at a time.
2. The writing task agent receives the same task contract as worktree mode: scope, acceptance criteria, diagnostics, tests, done signal, and Git/side-effect boundary.
3. The task agent may edit files directly in the current working tree.
4. The main agent must wait for the task agent to settle before dispatching another writing task.
5. After settlement, the main agent must verify the final done signal, inspect actual changed files, run or re-run required diagnostics/tests when needed, and update Runtime Orchestration State.
6. If the task changed files outside its allowed scope, treat it as a task failure or replan trigger before continuing.
7. If unrelated user changes exist in the working tree, preserve them and do not stage/commit them unless explicitly authorized.
8. Parallel sub-agents are allowed only for read-only exploration, review, or patch planning while the writer lane is active; they must not edit files.

This mode preserves the user's desire to avoid worktrees/branches while still allowing sub-agents to implement tasks. It does not allow concurrent writes to the same local checkout.

## Per-Task Rules

Each executing agent must:

- use `superpowers:test-driven-development` when available; otherwise equivalent local TDD fallback
- run required diagnostics from `task-orchestration.md`
- run required tests from the Executable Test Matrix
- run additionally discovered related tests and update evidence
- verify official docs/source or existing project patterns for frameworks/libraries/protocols/third-party integrations
- verify UI/browser behavior in real browser or equivalent runtime where applicable
- include security checks for auth/authz/user input/secrets/external integration/persistence
- measure performance when performance acceptance criteria exist
- report completion only when required tests pass, diagnostics are clean, acceptance criteria are met, and done-signal evidence is complete

Before claiming a task, batch, or full workflow is complete, use `superpowers:verification-before-completion` when available. If unavailable, run the equivalent evidence-before-claim gate: identify the proving command or browser evidence, run it fresh, read the output, and report only what the evidence supports.

## Failure Handling

If any task settled with `final_failed` or `final_blocked`:

- let other in-progress tasks in the batch finish
- after the batch settles, report failed/blocked tasks and retry count
- retry up to 3 times per task
- do not advance to next batch while current failed task is unresolved
- after 3 failed attempts, hard-stop for user recovery: retry, skip, rollback, or pause

Skipped tasks prevent final `ready-to-report` unless explicitly accepted as deferred scope, downstream dependencies are resolved by redesign/stub/mock/follow-up, and delivery report lists the deferral.

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
3. Update `progress.md`: replan decision, old/new task mapping, affected batches, current execution pointer.
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

If runtime and persisted artifacts disagree, do not dispatch from memory. Reconcile using: actual Git/filesystem/task results → `task-orchestration.md` → `test-plan.md` → `progress.md` → chat memory. Rewrite `progress.md`, then continue automatically.

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

Every automatic adjustment must appear in `progress.md` and final acceptance report with a short reason. Replanning must not become silent scope creep.

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
6. Rewrite `progress.md` with the requirement-change summary, affected artifacts, stale tasks, completed-work classification, and next required gate.
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

- after Phase 2 Gate is cleared
- after each batch completes
- after retries, skips, rollbacks, pauses, fallbacks, or replans
- before resuming after interruption

Progress file is a recovery aid, not sole source of truth. Reconcile conflicts by: actual Git/filesystem/task results → `task-orchestration.md` → `test-plan.md` → `progress.md` → chat memory.

## Execution Context Recovery

When Phase 3 resumes after interruption, compaction, new session, tool crash, or suspected stale context, do not continue from the previous in-memory Runtime Orchestration State.

Before dispatching any task, rebuild Runtime Orchestration State from:

1. actual Git/filesystem/task results
2. `task-orchestration.md`
3. `test-plan.md`
4. `progress.md`
5. chat memory only as a last-resort hint

Mandatory recovery checks:

- If `progress.md` records requirement change, `stale-pending`, gate re-entry, failed/blocked task, rollback, skip/defer decision, or pause, resume that recovery path first.
- If a task is marked done but its changed files/tests/evidence are missing, treat it as not settled and re-verify before advancing.
- If a task is marked running but no task agent is active, classify it as interrupted and either resume the same task context or retry without counting it as a task failure until a final signal exists.
- If documents changed after Runtime Orchestration State was last built, rebuild DAG, batches, Executable Test Matrix, and current execution pointer.
- Rewrite `progress.md` after reconciliation and before dispatching more work.

Never dispatch from stale memory after recovery. The first action after recovery must be state reconstruction or explicit gate handling.

## Required Signal

Emit `execution_settled` at batch boundaries and before acceptance with: Runtime Orchestration State summary, task states, final signals received, diagnostics/tests run, batch status, dynamic replans applied, fallbacks used, and unresolved blockers.
