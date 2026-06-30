# Changelog

## [Unreleased]

## [0.1.25] - 2026-06-29

### Fixed
- `dev-flow-loop`: fix stale `auto_continue_scope` drift in `loop-envelope.md`. Execution Envelope Gate approval must update the `auto_continue_scope` field inside `loop-envelope.md` itself (e.g. `disabled` -> `within_confirmed_baseline`), not only the persisted signal in `loop-state.md`; otherwise a resumed session reads the stale pre-approval value from the document and stops to ask after every phase even though the loop was approved for auto-continue. When `loop-state.md` and `loop-envelope.md` disagree, treat `loop-state.md` as authoritative and repair the document.

### Changed
- `dev-flow-loop`, `dev-flow-master`, `dev-flow-planning`: clarify that required checker subagents (planning, loop baseline, DAG/envelope, phase_eval) are preauthorized once their input artifacts exist — they must be spawned automatically without a separate user prompt, and the main agent must not substitute self-review for a checker score. User approval is still required for the gate decision itself and for side effects.

## [0.1.24] - 2026-06-29

### Removed
- Remove `tk8620-firmware-adapter` and `tk8620-firmware-workflow` skills and all associated reference files; TK8620 firmware support has been extracted from this package.

## [0.1.23] - 2026-06-29

### Changed
- Extend Language Policy in all 14 dev-flow skill SKILL.md files: generated artifact documents (requirements, design, specs, CLI specs, test plans, delivery reports, and other persisted Markdown files) must now be written in Chinese, not only user-facing chat replies.

## [0.1.22] - 2026-06-29

### Changed
- Mandate subagent-only implementation in Phase 3: main agent is coordinator only and must not directly edit code, test, or configuration files; all implementation tasks must be dispatched to sub-agents across all three execution modes (worktree-parallel, shared-working-tree serial, shared-worktree patch).
- Extend Per-Task Reviewer Protocol to all three execution modes including patch mode: after the main agent applies and verifies a patch, a reviewer sub-agent independently verifies the applied diff before settling the task. Previously patch mode was exempt.
- Reduce acceptance checker from 2 independent checker subagents to 1, unifying all gates (planning, loop-eval, acceptance, completion) to a single checker subagent with `checker_score >= 95`.
- Update `acceptance_ready` signal schema from `independent_checker_scores` array + `independent_checker_count` to single `checker_score` integer.
- Update Stage Ownership Matrix: acceptance and completion gate rows changed from "at least 2 checkers required" to "a checker required"; Phase 3 execution and Per-task review rows changed from Yes to Required.
- Simplify Ownership Rules: "all gates require 1 checker subagent" replaces the prior split between planning (1) and acceptance (2).
- Extend `planningStaleCheckerPhrasePatterns` forbidden list to acceptance skill so doctor catches natural-language regressions ("at least 2 independent checker subagents", "independent checker scores/count") in acceptance files.
- Add `independent_checker_scores:` and `independent_checker_count:` to `staleSingleCheckerScorePatterns` (globally forbidden YAML field names across all skills).

### Added
- Add `reviewer_blocked` as a new `blocker_type` in `final_blocked` for when 3 review-fix rounds are exhausted with critical or important findings remaining.
- Add Per-task review row to Stage Ownership Matrix in `state-and-gates.md` with Required sub-agent column.

## [0.1.21] - 2026-06-29

### Changed
- Reduce planning checker requirement from at least 2 independent subagents to 1 checker subagent; update all planning signal schemas (`openspec_artifact_ready`, `task_orchestration_ready`) and loop evaluation schemas (`phase_eval_result`, `loop_eval_result`) from `independent_checker_scores`/`independent_checker_count` arrays to single `checker_score` / `final_checker_score` integer.
- Update OpenSpec Baseline Gate rule in `state-and-gates.md` from `independent_checker_count >= 2` to `checker_score >= 95`.
- Update Stage Ownership Matrix planning rows from "at least 2 checkers required" to "a checker required".

### Added
- Add Per-Task Reviewer Protocol to `dev-flow-execution`: after each implementing sub-agent reports `final_success` in worktree-parallel or shared-working-tree serial modes, dispatch a reviewer sub-agent to independently verify the task diff and evidence before the task is settled.
- Add `task_reviewer_verdict` signal schema with `spec_verdict`, `quality_verdict`, findings (critical / important / minor), and `cannot_verify_items`.
- Add `reviewer_blocked` as a new `blocker_type` in `final_blocked` when 3 review-fix rounds are exhausted with critical or important findings remaining.
- Add Per-task review row to Stage Ownership Matrix in `state-and-gates.md`.

## [0.1.20] - 2026-06-26

### Added
- Add checker review gate for Loop Phase DAG and Execution Envelope: spawn a checker subagent after producing the DAG and Envelope, score against the new §DAG and Envelope Quality Checklist (DAG-01..09, ENV-01..09), record `dag_envelope_checker_score` in `loop_control_ready`, and auto-revise until score ≥ 95 before Execution Envelope Gate.
- Add §DAG and Envelope Quality Checklist section to `control-plane.md` with 9 DAG criteria and 9 Envelope criteria.
- Add phase execution planning artifact pre-gate: before starting implementation, verify `openspec_artifact_ready.checker_score ≥ 95` and `task_orchestration_ready.checker_score ≥ 95` from dev-flow-planning; if either is absent or below threshold, halt and wait.
- Add two new -15 scoring deductions: skipping DAG/Envelope checker review or starting phase execution without verified planning artifact checker scores.
- Add `dag_envelope_checker_score`, `DAG and Envelope Quality Checklist`, `openspec_artifact_ready.checker_score`, `task_orchestration_ready.checker_score` to doctor required phrase lists for loop governance.

## [0.1.19] - 2026-06-26

### Changed
- Reduce loop baseline and phase_eval checker requirement from at least 2 independent subagents to 1 checker subagent; update all signal schemas (`loop_baseline_ready`, `phase_eval_result`, `loop_eval_result`, `loop_control_ready`) from `independent_checker_scores` array to single `checker_score` integer.
- Strengthen baseline document gate: writing any baseline artifact now requires explicit user confirmation in the current turn; prior discussion does not count as confirmation.
- Clarify `final_checker_score` in `loop_eval_result` as the minimum `checker_score` across all completed phases.
- Add scoring deduction (-15) when the checker subagent is the same agent instance that produced the artifacts under review.
- Fix "Who does what" table: `phase_eval`/`loop_eval` row now reads "checker quality checkpoint" instead of "independent checker quality checkpoint".

## [0.1.18] - 2026-06-26

### Added
- Add `test-cases.xlsx` as the loop-owned execution-level test case workbook, including per-category sheets, resource constraint tests, summary formulas, and separate not-run/skipped counts.
- Add doctor checks for stale single-checker score schemas so gate contracts require checker score arrays and checker counts.

### Changed
- Extend loop-only baseline artifacts from four Markdown documents to requirements, high-level design, detailed design, test plan, and `test-cases.xlsx`.
- Require at least two independent checker subagents for loop baseline review, phase evaluation, OpenSpec baseline review, task orchestration review, and acceptance readiness.
- Align `phase_eval_result`, `loop_eval_result`, `openspec_artifact_ready`, `task_orchestration_ready`, and `acceptance_ready` with `independent_checker_scores` plus `independent_checker_count`.
- Clarify that `test-plan.md` carries strategy, traceability, and representative examples while complete executable cases live in `test-cases.xlsx`.

## [0.1.17] - 2026-06-25

### Added
- Add delivery-loop semantics to `/dev-flow-loop`: loop-only baseline artifacts, Baseline Docs Gate, Execution Envelope Gate, Loop Phase DAG, and within-baseline auto-continue.
- Add loop baseline templates under `dev-flow-loop/assets/baseline-templates/` for requirements, high-level design, detailed design, and test plan.
- Add phase-level loop signals and evidence expectations, including `loop_baseline_ready`, `phase_eval_result`, `loop_eval_result`, independent checker scoring, phase artifact indexes, and loop-state persistence.
- Add stricter acceptance expectations for TDD evidence, system-level checks, requirements/design/test coverage, and independent checker review.

### Changed
- Route all implementation work through OpenSpec/opsx artifacts instead of the old dev-flow four-document implementation path.
- Keep OpenSpec/opsx originals in their canonical project locations and store only loop indexes under `Docs/<topic>/loop/`.
- Move four-document baseline templates out of `dev-flow-master` and into loop-owned assets.
- Clarify loop-authorized dev-flow handoff rules, including when user confirmation is already covered by the approved loop baseline and envelope.
- Strengthen doctor checks for command parity, loop template placement, OpenSpec/opsx wording, independent checker gates, and stale workflow terminology.
- Update README, workflow overview, install docs, commands, and OpenCode/Codex/Claude mirrors for the new loop delivery model.

## [0.1.16] - 2026-06-25

### Added
- Add read-only Loop Engineering commands `/dev-flow-loop` and `/dev-flow-triage`.
- Add `dev-flow-loop`, `dev-flow-loop-envelope`, and `dev-flow-loop-triage` skills for outer-loop control, budget/permission envelopes, and candidate inbox triage.
- Add `/dev-flow-scheduler` plus `dev-flow-scheduler` for approved cron/heartbeat automation management.
- Extend doctor checks to validate Loop Engineering command contracts, read-only boundaries, approved scheduler boundaries, handoff wording, and OpenCode core skill mirrors.

### Changed
- Clarify that loop and triage may ask a concrete handoff question and enter the equivalent owner flow after explicit candidate confirmation, without requiring the user to type another slash command.
- Keep automation creation/update/pause/resume/delete outside loop and triage; route it through `/dev-flow-scheduler`.

## [0.1.15] - 2026-06-24

### Changed
- Added YAML schemas for all five gating signals (routing_decided, git_safe, execution_settled, acceptance_ready, execution_actor_decided)
- Standardized SKILL.md structure across all 10 skills (Boundary / Language Policy / Core Contract / References / Required Signal)
- Added replan iteration cap (max 3) with hard-stop and user-decision protocol
- Added sub-agent prompt contracts for all three execution modes
- Added Git isolation mode YAML token reference table in modes-and-states.md
- Fixed language policy phrasing to canonical "All user-facing replies in dev-flow are in Chinese."
- Added phase gate failure signals (phase2_gate_failed, gate_paused) and Phase 1 rejection recovery path
- Added debugging protocol escalation threshold, intermittent failure classification, and non-reproducible declaration
- Added UI verification acceptance threshold, screenshot evidence rule, and deferral_reason field
- Added cr_needs_defer_decision trigger condition and cr_report_ready timestamp field
- Added dev-flow-cr post-delivery section to workflow-overview.md

## [0.1.14] - 2026-06-24

### Added

- Add independent `/dev-flow-cr` commands for OpenCode, Codex, and Claude Code, backed by the new `dev-flow-cr` skill and persisted CR reports.

### Changed

- Make CR user-triggered after acceptance instead of an automatic `/dev-flow` stage.
- Change Phase 2 execution from implicit agent dispatch to an explicit execution-actor proposal with user approval for direct concurrent writers and worktree creation.
- Remove forced worktree language; direct no-worktree writes remain serial, while no-worktree parallelism uses patch-ready outputs plus main-agent serial apply.

## [0.1.13] - 2026-06-24

### Added

- Add `dev-flow-intent` as the master-loaded intent classifier for debugging, feature, change-adjustment, review, UI/UX, status-recovery, and question routes.
- Add focused route skills for `dev-flow-debugging`, `dev-flow-ui-ux`, and `dev-flow-review`.
- Add Claude Code installation support with `install-claude`, `update-claude`, `doctor-claude`, and a Claude `/dev-flow` command.
- Add trusted npm publishing workflow metadata for the `paulLee778899/dev-flow-skills` repository.
- Add routing eval prompts in `evals/evals.json`.
- Add progressive `references/` files for core dev-flow skills.

### Changed

- Update `dev-flow-master` to remain the entry controller while delegating intent classification to `dev-flow-intent`.
- Show the Phase 2 execution mode after orchestration and Git checks, with main-agent serial fallback/override.
- Clarify the skill reuse policy: call Superpowers workflows directly when available, and absorb optional marketplace/local skill patterns without hard dependencies.
- Update installer doctor checks, command docs, plugin metadata, and public docs for the new route skills.
- Keep core `SKILL.md` files short and move detailed governance into on-demand references.
- Strengthen doctor checks for OpenCode install-surface allowlists, core mirror consistency, skill size, reference TOCs, repository URL drift, and lightweight opsx/OpenSpec contracts.
- Restrict OpenCode install/update to command and core dev-flow skill assets so local `.opencode` dependency residue is not installed.

## [0.1.12] - skipped

## [0.1.11] - skipped

## [0.1.10] - skipped

- Note: versions 0.1.10–0.1.12 were not released. Version numbers were reserved but no changes were published.

## [0.1.9] - 2026-04-27

### Changed

- Rename the entry routing skill from `dev-flow-governor` to `dev-flow-master` across OpenCode and Codex installs.
- Update installer doctor checks, command entrypoints, planning template paths, and documentation for the new skill name.

## [0.1.8] - 2026-04-27

### Added

- Add Codex `/dev-flow` command support through a root `commands/dev-flow.md` file.
- Update `install-codex`, `update-codex`, and `doctor-codex` to manage both Codex skills and the Codex command symlink.

### Changed

- Document that Codex discovers commands from `commands/` / `~/.agents/commands`, not from a `.codex-plugin/plugin.json` `commands` field.

## [0.1.7] - 2026-04-27

### Changed

- Make the AI-agent installation prompt platform-neutral and move platform-specific routing into `install/agent-install.md`.

## [0.1.6] - 2026-04-27

### Changed

- Keep README command list platform-neutral and move platform-specific command details to platform guides.

## [0.1.5] - 2026-04-27

### Changed

- Make the README AI-agent installation section a directly copy-pasteable prompt.

## [0.1.4] - 2026-04-27

### Changed

- Move platform-specific installation detail out of README and into platform guides.
- Add a copy-paste AI agent prompt to `install/agent-install.md`.
- Expand OpenCode installation details in `install/opencode.md`.

## [0.1.3] - 2026-04-27

### Changed

- Improve README with badges, workflow diagram, copy-paste AI agent install prompt, and Codex CLI commands.

## [0.1.2] - 2026-04-27

### Added

- Add Codex plugin metadata in `.codex-plugin/plugin.json`.
- Add Codex native skill discovery instructions in `.codex/INSTALL.md`.
- Add top-level `skills/` directory for Codex-compatible skill discovery.
- Add `install-codex`, `update-codex`, and `doctor-codex` CLI commands.

## [0.1.1] - 2026-04-27

### Changed

- Mark npm installation as the recommended path now that the package is published.
- Add repository, bugs, and homepage metadata to `package.json`.

## [0.1.0] - 2026-04-27

### Added

- Initial Dev Flow Skills package structure.
- Global and project-local install model.
- `/dev-flow` OpenCode command entrypoint.
- Five focused skills: governor, planning, execution, git, and acceptance.
- CLI commands for install, update, doctor, uninstall, and version.
- Manifest checksum protection for safe updates.
- Manual, Agent, and OpenCode installation docs.
