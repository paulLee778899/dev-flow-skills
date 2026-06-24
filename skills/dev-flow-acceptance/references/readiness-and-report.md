# Readiness And Report Reference

## Inputs

Read and reconcile:

- `dev-flow-state.md`
- `task-orchestration.md`
- `test-plan.md`
- `progress.md`
- OpenSpec/opsx change directory and status for lightweight work
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
5. Verify review/self-review evidence exists for each integrated task.
6. Write `Docs/<topic>/delivery-report.md` or the canonical legacy path.
7. Perform safe cleanup through `dev-flow-git` only where allowed.

## Delivery Report Contents

The report must include:

- completed tasks with task IDs and branch/PR/commit/patch references
- skipped/deferred tasks with reason, user/gate acceptance, and accepted risk
- test results: command, scope, pass/fail count or summary, coverage if available
- final Executable Test Matrix result, including commands run, commands not run, reasons, and acceptance impact
- quality-gate evidence and evidence locations
- dynamic replanning decisions and old/new task mappings
- fallback modes used and why
- review/self-review evidence by task
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

For governed medium/heavy work, report `ready-to-report` only when:

1. required planning docs exist as persisted files
2. Phase 1 and Phase 2 gates were explicitly cleared in `dev-flow-state.md`
3. `dev-flow-state.md`, `task-orchestration.md`, `progress.md`, and `delivery-report.md` exist where applicable
4. all DAG tasks are completed, explicitly accepted as deferred by the user/gate, or replanned under governed rules
5. per-task, batch, and final Executable Test Matrix checks pass or are explicitly accepted as deferred scope by the user/gate
6. code review/self-review evidence exists for integrated work
7. every task has a canonical Git/patch integration state defined by `dev-flow-git`: `merged`, `committed`, `pr_opened`, `direct_commit_complete`, `patch_ready`, `shared_working_tree_applied`, `applied_from_shared_worktree_patch`, or `deferred_accepted`
8. applicable quality gates are satisfied or marked N/A with reason, including `ui_ux_report` when `ui_runtime` risk applies
9. no unresolved blockers remain

For lightweight opsx/OpenSpec work, report `ready-to-report` only when:

1. `lightweight_artifact_ready`, `opsx_apply_complete`, `opsx_verify_complete`, and `acceptance_ready` are persisted in `dev-flow-state.md` or an equivalent OpenSpec/opsx status artifact
2. the OpenSpec change directory exists and contains the artifacts required by the active schema
3. implementation tasks are complete or explicitly accepted as deferred in the OpenSpec tasks artifact
4. `/opsx:verify <change>` evidence exists and records skipped checks, residual risks, and final recommendation
5. Git/patch state is explicit through `dev-flow-git` when side effects are involved
6. required focused-route reports exist, including `debugging_report` for debugging work and `ui_ux_report` for UI runtime risk
7. no unresolved blockers remain

If any item is missing, report `not-ready` or `ready-for-review` and continue the appropriate dev-flow stage rather than claiming completion.

## Required Signal

Emit and persist `acceptance_ready` with: route type, final test results, final Executable Test Matrix result or `/opsx:verify` result, quality evidence summary, review/self-review evidence summary, delivery-report path when applicable, OpenSpec change path when applicable, task integration states, deferred scope, unresolved failures/blockers/risks, scope-change summary, cleanup status, final readiness state, and the `dev-flow-state.md` or equivalent OpenSpec/opsx status path.
