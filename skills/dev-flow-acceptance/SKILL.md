---
name: dev-flow-acceptance
description: Use when dev-flow execution batches are complete and the main agent must run final acceptance, collect quality evidence, write delivery report, and decide readiness.
---

# dev-flow-acceptance

Owns final acceptance after all DAG batches are complete, deferred, or dynamically replanned.

Use `superpowers:verification-before-completion` when available before claiming the workflow is complete, fixed, passing, or ready. Dev-flow acceptance still owns the final delivery report and readiness decision.

## Inputs

Read and reconcile:

- `task-orchestration.md`
- `test-plan.md`
- `progress.md`
- actual Git/filesystem/task results
- Runtime Orchestration State from `dev-flow-execution`

Do not rely on chat memory over files and actual state.

## Final Acceptance Duties

1. Run final commands listed in the Executable Test Matrix.
2. Verify no regressions from previously passing tests.
3. Collect applicable quality evidence:
   - source/docs grounding
   - API contract
   - UI/browser runtime
   - security
   - performance
   - migration/deprecation
   - release/rollback
4. Verify every task has explicit integration state through `dev-flow-git`.
5. Write `Docs/<topic>/delivery-report.md` or the canonical legacy path.
6. Perform safe cleanup through `dev-flow-git` only where allowed.

## Delivery Report Contents

The report must include:

- completed tasks with task IDs and branch/PR/commit/patch references
- skipped/deferred tasks with reason and accepted risk
- test results: command, scope, pass/fail count or summary, coverage if available
- final Executable Test Matrix result, including commands run, commands not run, reasons, and acceptance impact
- quality-gate evidence and evidence locations
- dynamic replanning decisions and old/new task mappings
- fallback modes used and why
- unresolved failures, blockers, or accepted known risks
- scope changes since Phase 1/Phase 2 approval and whether gate re-entry occurred or was not required
- known issues and follow-up items
- Git integration/cleanup status

## Final Test Failure

If final checks fail:

- identify likely source task; bisect if needed
- do not report acceptance complete
- create a fix/retry/replan path through `dev-flow-execution`
- ask for user recovery only when hard-stop conditions require it: destructive rollback, retry limit exhausted, missing non-fallback dependency, or changed requirement baseline

## Acceptance Readiness

Report `ready-to-report` only when:

1. required planning docs exist as persisted files
2. Phase 1 and Phase 2 gates were explicitly cleared
3. `task-orchestration.md`, `progress.md`, and `delivery-report.md` exist where applicable
4. all DAG tasks are completed, explicitly accepted as deferred, or replanned under governed rules
5. per-task, batch, and final Executable Test Matrix checks pass or are explicitly accepted as deferred scope
6. code review/self-review evidence exists for integrated work
7. every task has explicit Git/patch integration state
8. applicable quality gates are satisfied or marked N/A with reason
9. no unresolved blockers remain

If any item is missing, report `not-ready` or `ready-for-review` and continue the appropriate dev-flow stage rather than claiming completion.

## Required Signal

Emit `acceptance_ready` with: final test results, final Executable Test Matrix result, quality evidence summary, delivery-report path, task integration states, deferred scope, unresolved failures/blockers/risks, scope-change summary, cleanup status, and final readiness state.
