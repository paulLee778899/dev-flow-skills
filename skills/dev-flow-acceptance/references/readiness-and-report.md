# Readiness And Report Reference

## Table of Contents

- [Inputs](#inputs)
- [Final Acceptance Duties](#final-acceptance-duties)
- [Delivery Report Contents](#delivery-report-contents)
- [Independent Acceptance Checker](#independent-acceptance-checker)
- [Final Test Failure](#final-test-failure)
- [Acceptance Readiness](#acceptance-readiness)
- [Required Signal](#required-signal)

## Inputs

Read and reconcile:

- `dev-flow-state.md`
- `task-orchestration.md`
- OpenSpec/opsx requirements, design/spec, tasks, and test artifacts
- `test-plan.md` when present as a loop baseline or legacy artifact
- `progress.md`
- OpenSpec/opsx change directory and status for all implementation work
- actual Git/filesystem/task results
- Runtime Orchestration State from `dev-flow-execution`
- loop baseline / Loop Phase DAG / phase ID when invoked from a delivery loop

Do not rely on chat memory over files and actual state.

## Final Acceptance Duties

1. Run final commands listed in the Executable Test Matrix.
2. Run system-level checks that exercise the complete requested workflow or user/system journey.
3. Verify no regressions from previously passing tests.
4. Collect applicable quality evidence:
   - source/docs grounding
   - API contract
   - UI/browser runtime
   - security
   - performance
   - migration/deprecation
   - release/rollback
5. Verify every task has explicit integration state through `dev-flow-git`.
6. Verify task local verification evidence and TDD evidence exist for each integrated task.
7. Verify every OpenSpec requirement/design/test item is covered by implementation evidence and a passing or explicitly deferred check.
8. Run an independent acceptance checker subagent before readiness is declared.
9. Write `Docs/<topic>/delivery-report.md` or the canonical legacy path.
10. For loop-authorized phases, write phase acceptance evidence that the loop can use for `phase_eval` and next-phase or repair decisions.
11. Perform safe cleanup through `dev-flow-git` only where allowed.

## Delivery Report Contents

The report must include:

- completed tasks with task IDs and branch/PR/commit/patch references
- skipped/deferred tasks with reason, user/gate acceptance, and accepted risk
- test results: command, scope, pass/fail count or summary, coverage if available
- final Executable Test Matrix result, including commands run, commands not run, reasons, and acceptance impact
- system-level test results and workflow coverage
- requirements/design/test coverage map, including deferred items and accepted risks
- independent acceptance checker scores, checker count, findings, and raw evidence scope
- quality-gate evidence and evidence locations
- dynamic replanning decisions and old/new task mappings
- fallback modes used and why
- task local verification evidence by task
- TDD evidence by task: RED, GREEN, refactor verification, or approved exception
- phase-level OpenSpec/opsx evidence when invoked from a delivery loop
- unresolved failures, blockers, or accepted known risks
- scope changes since Phase 1/Phase 2 approval and whether gate re-entry occurred or was not required
- known issues and follow-up items
- Git integration/cleanup status

## Independent Acceptance Checker

Before emitting `acceptance_ready`, spawn at least 2 independent checker subagents concurrently with raw artifacts only:

- OpenSpec/opsx change artifacts
- `task-orchestration.md` and Executable Test Matrix
- implementation diff or changed-file list
- test/diagnostic/system-check output
- TDD evidence
- delivery report draft if already written

Do not pass the main agent's expected conclusion. The checker must verify:

- implementation satisfies all OpenSpec requirements and design/spec decisions
- every test-plan item maps to passing evidence or an explicit user-approved deferral
- system-level checks cover the complete requested workflow and major failure modes
- no task lacks TDD evidence unless the user approved an exception
- `/opsx:verify <change>` evidence exists and aligns with actual changed files
- unresolved risks are visible and not silently accepted

Readiness requires `independent_checker_count >= 2`, all checker scores >= 95, and no P0/P1 finding. If any score is lower, route back to execution, planning, or the user depending on whether the gap is implementation, artifact, or scope/baseline related.

## Final Test Failure

If final checks fail:

- identify likely source task; bisect if needed
- do not report acceptance complete
- create a fix/retry/replan path through `dev-flow-execution`
- ask for user recovery only when hard-stop conditions require it: destructive rollback, retry limit exhausted, missing non-fallback dependency, or changed requirement baseline

## Acceptance Readiness

For governed medium/heavy work, report `ready-to-report` only when:

1. required OpenSpec/opsx artifacts exist as persisted files
2. OpenSpec Baseline Gate and Phase 2 gates were explicitly cleared in `dev-flow-state.md`
3. `dev-flow-state.md`, `task-orchestration.md`, `progress.md`, and `delivery-report.md` exist for their defined creation triggers: `dev-flow-state.md` from first planning gate; `task-orchestration.md` from Phase 2; `progress.md` from Phase 2 Gate or earlier; `delivery-report.md` from acceptance.
4. all DAG tasks are completed, explicitly accepted as deferred by the user/gate, or replanned under governed rules
5. per-task, batch, and final Executable Test Matrix checks pass or are explicitly accepted as deferred scope by the user/gate
6. system-level checks pass or are explicitly blocked with user-approved deferral
7. requirements/design/test coverage map is complete
8. task local verification evidence and TDD evidence exist for integrated work; independent CR evidence is optional and only produced by `/dev-flow-cr`
9. independent acceptance checker count is at least 2 and all checker scores are >= 95 with no P0/P1 findings
10. every task has a canonical Git/patch integration state defined by `dev-flow-git`: `merged`, `committed`, `pr_opened`, `direct_commit_complete`, `patch_ready`, `shared_working_tree_applied` (= changes made directly in the shared working tree by a serial sub-agent), `applied_from_shared_worktree_patch` (= patch generated by a worktree-isolated sub-agent then applied to the shared working tree), or `deferred_accepted`
11. applicable quality gates are satisfied or marked N/A with reason, including `ui_ux_report` when `ui_runtime` risk applies
12. no unresolved blockers remain

For lightweight opsx/OpenSpec work, report `ready-to-report` only when:

1. `lightweight_artifact_ready`, `opsx_apply_complete`, `opsx_verify_complete`, and `acceptance_ready` are persisted in `dev-flow-state.md` or an equivalent OpenSpec/opsx status artifact
2. the OpenSpec change directory exists and contains the artifacts required by the active schema
3. implementation tasks are complete or explicitly accepted as deferred in the OpenSpec tasks artifact
4. `/opsx:verify <change>` evidence exists and records skipped checks, residual risks, and final recommendation
5. Git/patch state is explicit through `dev-flow-git` when side effects are involved
6. required focused-route reports exist, including `debugging_report` for debugging work and `ui_ux_report` for UI runtime risk
7. TDD evidence exists for implementation tasks or an approved exception is recorded
8. final and system-level checks appropriate to the change pass or are explicitly marked N/A with reason
9. independent acceptance checker count is at least 2 and all checker scores are >= 95 with no P0/P1 findings, unless the change is documentation-only with no behavior/config/test/user-visible impact
10. no unresolved blockers remain

If any item is missing, report `not-ready` or `ready-for-review` and continue the appropriate dev-flow stage rather than claiming completion.

## Required Signal

Emit and persist `acceptance_ready`:

```yaml
acceptance_ready:
  producer: dev-flow-acceptance
  timestamp: <ISO-8601>
  path: lightweight | governed
  checklist_passed: true
  delivery_report_path: <path>          # governed work only; omit for lightweight
  openspec_change_path: <path>          # lightweight work only; omit for governed
  git_integration_state: <canonical state name>
  quality_evidence_paths: [list of file paths]
  system_level_checks: [list of commands/evidence]
  requirements_design_test_coverage: complete | incomplete | deferred_with_user_approval
  independent_checker_scores: [<score-checker-1>, <score-checker-2>, ...]
  independent_checker_count: <integer, minimum 2>
  outstanding_deferred: [list of task ids or none]
```
