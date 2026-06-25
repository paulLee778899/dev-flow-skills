# Changelog

## [Unreleased]

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
- Add progressive `references/` files for core dev-flow skills and the TK8620 firmware workflow.

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
