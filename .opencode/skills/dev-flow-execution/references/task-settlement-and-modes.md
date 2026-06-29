# Task Settlement And Modes Reference

## Table of Contents

- [Task Settlement and Final Signal Protocol](#task-settlement-and-final-signal-protocol)
- [Shared-Worktree Patch Execution](#shared-worktree-patch-execution)
- [Worktree-Parallel Execution](#worktree-parallel-execution)
- [Shared-Working-Tree Serial Agent Execution](#shared-working-tree-serial-agent-execution)
- [Per-Task Rules](#per-task-rules)
- [Per-Task Reviewer Protocol](#per-task-reviewer-protocol)
- [Failure Handling](#failure-handling)

## Terminology

**Sub-wave**: A subset of tasks within a batch dispatched together for parallel execution (see sub-wave definition in runtime-and-dispatch.md).

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
- in worktree-parallel or shared-working-tree serial mode, `final_success` from the implementing sub-agent is preliminary — the task is not settled until the reviewer approves (see § Per-Task Reviewer Protocol); in patch mode, reviewer is dispatched after the main agent applies and verifies the patch (no `final_success` at that stage; trigger is post-apply verification)
- verify final done signal against `task-orchestration.md` and Executable Test Matrix
- verify changed files and symbols against the task's allowed scope and parallel-safety declaration
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
6. If the patch no longer applies cleanly, reconcile it against current state or ask the same task context for a refreshed patch; do not mark the task failed merely because earlier patches changed the file. Maximum reconciliation attempts: 2. If the patch still does not apply cleanly after 2 attempts, emit `final_failed` with reason `patch_reconciliation_failed` and stop retrying.
7. Update Runtime Orchestration State and `progress.md` after each applied patch.
8. Continue applying the next patch until the sub-wave is settled.

In this mode, a sub-agent's patch-ready output is an intermediate deliverable. After the main agent applies and verifies the patch in the shared working tree, dispatch a reviewer sub-agent to independently verify the applied diff before settling the task.

## Worktree-Parallel Execution

When `dev-flow-git` selects worktree-based parallel execution, each writing task agent receives an isolated worktree and may implement concurrently up to the agent cap.

Sub-agent task prompt requirements in this mode:

- Task ID and description
- Scope: declared file paths and symbols
- Worktree path assigned to this task
- Dependencies: list of task IDs that must be settled before this task begins
- Quality gate requirements: which diagnostics/tests must pass
- Final signal schema: must emit `final_success`, `final_failed`, or `final_blocked`
- Git scope boundary: the sub-agent must not push to, merge into, or write to any branch outside its assigned worktree. Any attempt to perform cross-worktree Git operations (push, force-push, merge, rebase on shared branches) must be treated as a task failure.

## Shared-Working-Tree Serial Agent Execution

When `dev-flow-git` selects `shared-working-tree serial agent mode`, task sub-agents may directly implement in the current local checkout without worktrees or task branches, but writing is strictly serial.

Sub-agent task prompt requirements in this mode:

- Task ID and description
- Scope: declared file paths and symbols
- Confirmation that the writer lane is free before starting (previous task settled)
- Dependencies: list of task IDs that must be settled before this task begins
- Quality gate requirements: which diagnostics/tests must pass
- Final signal schema: must emit `final_success`, `final_failed`, or `final_blocked`

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

All implementation tasks in Phase 3 must be dispatched to sub-agents. The main agent must not directly edit code, test, or configuration files during execution; its role is coordination, dispatch, verification, and progress tracking only.

Each executing agent must:

- use `superpowers:test-driven-development` when available; otherwise equivalent local TDD fallback. This applies to lightweight and medium/heavy implementation work.
- record TDD evidence for each behavior change: test name/path, RED command and expected failure, GREEN command and pass result, refactor verification, or explicit user-approved exception
- run required diagnostics from `task-orchestration.md`
- run required tests from the Executable Test Matrix
- run additionally discovered related tests and update evidence
- produce task local verification evidence: scope checked, risks checked, tests/diagnostics reviewed, and unresolved concerns; this is evidence for the independent acceptance checker, not a gate-impacting self-score
- verify official docs/source or existing project patterns for frameworks/libraries/protocols/third-party integrations
- verify UI/browser behavior in real browser or equivalent runtime where applicable, and produce `ui_ux_report` when the task or upstream debugging report carries `ui_runtime` risk
- include security checks for auth/authz/user input/secrets/external integration/persistence
- measure performance when performance acceptance criteria exist
- report completion only when required tests pass, diagnostics are clean, acceptance criteria are met, and done-signal evidence is complete

Before claiming a task, batch, or full workflow is complete, use `superpowers:verification-before-completion` when available. If unavailable, run the equivalent evidence-before-claim gate: identify the proving command or browser evidence, run it fresh, read the output, and report only what the evidence supports.

## Per-Task Reviewer Protocol

When tasks are dispatched to sub-agents (worktree-parallel or shared-working-tree serial mode), the main agent must dispatch a reviewer sub-agent after each implementing sub-agent reports `final_success`, before the task is considered settled.

**When to skip:** read-only exploration tasks; tasks with `reviewer: skip` and an accepted justification recorded in `task-orchestration.md`. The reviewer applies to all three execution modes including patch mode.

### Reviewer Dispatch

Dispatch the reviewer sub-agent with:

- the task spec from `task-orchestration.md`: scope, acceptance criteria, diagnostics, required tests
- the task diff (`git diff HEAD` in shared-working-tree serial mode; the worktree diff in worktree-parallel mode)
- TDD evidence and local verification evidence from `final_success`
- global constraints: cross-task dependency context, OpenSpec acceptance criteria, security and performance rules

Do not pass the implementing agent's self-assessment or expected score.

### Reviewer Verdict

The reviewer returns `task_reviewer_verdict`:

- `spec_verdict`: `passed` | `failed` | `cannot_verify`
- `quality_verdict`: `approved` | `has_findings`
- `findings`: list of `{severity: critical | important | minor, description, file_path, line_range}` or empty
- `cannot_verify_items`: list of items requiring main-agent cross-task resolution

### Resolution Rules

After receiving `task_reviewer_verdict`:

1. **`cannot_verify` items** — the main agent resolves using cross-task knowledge and documents resolution in `progress.md`. These do not block settlement unless the main agent judges them critical.
2. **Minor findings** — log to `progress.md` as deferred notes. Do not block settlement.
3. **Critical or Important findings** — dispatch a fix sub-agent (same task scope and worktree/checkout) addressing only the listed findings. After the fix sub-agent reports `final_success`, re-dispatch the reviewer (same protocol). Maximum 3 review-fix rounds total.
4. **3 rounds exhausted with critical or important findings remaining** — emit `final_blocked` with `blocker_type: reviewer_blocked`, list the unresolved findings, and wait for user decision: accept findings, skip task, or replan.
5. **Reviewer approves (`quality_verdict: approved`, no critical or important findings)** — task is settled as `final_success`.

Task settlement completes only after reviewer approval or an explicit user decision to accept outstanding findings.

## Failure Handling

If any task settled with `final_failed` or `final_blocked`:

- let other in-progress tasks in the batch finish
- after the batch settles, report failed/blocked tasks and retry count
- retry up to 3 times per task
- do not advance to next batch while current failed task is unresolved
- after 3 failed attempts, hard-stop for user recovery: retry, skip, rollback, or pause

Skipped tasks prevent final `ready-to-report` unless explicitly accepted as deferred scope by the user or an approved gate, downstream dependencies are resolved by redesign/stub/mock/follow-up, and `dev-flow-state.md` plus the delivery report list the deferral and accepted risk.

### final_success Return Schema

```yaml
final_success:
  task_id: <string>
  status: final_success
  changed_files: [list of paths]
  tdd_evidence:
    mode: superpowers:test-driven-development | local_equivalent | approved_exception
    red: <command and expected failure, or none with reason>
    green: <command and pass result>
    refactor: <verification after cleanup or "not needed">
  diagnostics: <output or "clean">
  tests_run: [list of test names or suites]
  local_verification: <scope/risk/test review evidence>
  quality_evidence: <description or path>
  git_state: <canonical integration state or "none — patch pending">
  patch_state: <patch file path or "none — direct write">
```

Note: `replan_count` is tracked by the coordinator in `dev-flow-state.md` and is included in the `execution_settled` signal, not in individual task `final_success` signals.

### final_failed Return Schema

```yaml
final_failed:
  task_id: <string>
  status: final_failed
  failure_reason: <one-line description>
  attempted_approaches: [list of what was tried]
  changed_files: [list or none — partial changes if any]
  diagnostics: <output or none>
  recommended_action: retry | skip | escalate | replan
```

### final_blocked Return Schema

```yaml
final_blocked:
  task_id: <string>
  status: final_blocked
  blocker_description: <one-line description>
  blocker_type: missing_dependency | permission_denied | scope_conflict | unresolvable_conflict | reviewer_blocked | other
  changed_files: none
  recommended_action: replan | escalate_to_user | skip
```

### task_reviewer_verdict Return Schema

```yaml
task_reviewer_verdict:
  task_id: <string>
  round: <integer; 1 = first review, 2+ = re-review after fix>
  spec_verdict: passed | failed | cannot_verify
  quality_verdict: approved | has_findings
  findings:
    - severity: critical | important | minor
      description: <one-line description>
      file_path: <path or none>
      line_range: <"start:end" or none>
  cannot_verify_items: [list or none]
```
