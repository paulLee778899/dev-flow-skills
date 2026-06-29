---
name: dev-flow-loop
description: Use when the user asks for Loop Engineering, goal-preserving automation, repeated or multi-round dev-flow control, loop DAGs, task discovery inboxes, automation guardrails, loop review, or deciding how an outer loop should prepare loop-only baseline artifacts and drive phase-level dev-flow work.
---

# Dev Flow Loop

Loop Engineering is the outer control plane around dev-flow. It owns target retention, loop-only baseline artifacts, Loop Phase DAG, eval/repair decisions, and safe continuation; dev-flow owns phase execution.

## Boundary

- Default read-only for triage, review, workflow design, and automation proposal scopes.
- **Writing any baseline artifact requires explicit confirmation from the user in the current turn. Prior discussion, even extensive requirements brainstorming, is NOT sufficient. If the user has not confirmed in this turn, ask whether to proceed with writing the baseline documents and stop until confirmed.**
- Use the loop artifact directory, normally `Docs/<topic>/loop/`, only for loop baseline/state/DAG/envelope/index artifacts.
- Do not move or copy OpenSpec/opsx originals into the loop artifact directory; phase originals stay in `openspec/changes/<change-id>/` or the project's standard OpenSpec/opsx location.
- Implementation files and implementation specs change only through phase-level dev-flow OpenSpec/opsx.
- Do not run as a dev-flow stage, and do not emit `routing_decided`, `execution_settled`, `acceptance_ready`, or `cr_report_ready`.
- Do not start `/dev-flow` from unconfirmed triage candidates.
- Do not start `/dev-flow-cr` from unconfirmed triage candidates.
- After Baseline Docs Gate and Execution Envelope Gate are both approved, auto-continue within baseline by handing phases to dev-flow without asking the user to retype slash commands.
- Freezing the initial baseline, approving the Loop Phase DAG, and enabling `within_confirmed_baseline` require explicit user approval.
- Exceeding baseline, budget, retry, stop-condition, or side-effect boundaries requires stopping and asking the user.
- Do not create, update, pause, resume, or delete schedulers/automations; route those requests to `dev-flow-scheduler`.
- Do not start commits, pushes, PRs, merges, worktrees, or paid/external actions automatically.
- Keep loop state separate from `dev-flow-state.md`; phase-level dev-flow artifacts may reference loop IDs for traceability.

## Language Policy

All user-facing replies and all generated artifact documents (requirements, design, specs, CLI specs, test plans, delivery reports, and other persisted Markdown files) in dev-flow must be written in Chinese.

## Core Contract

1. Establish loop scope: workflow design, repository triage, completed-run review, automation proposal, dispatch handoff, or delivery loop.
2. For delivery loops, discuss requirements, blockers, and brainstorming options. **When discussion is complete, explicitly ask the user whether to proceed with writing the baseline documents — do not proceed to Step 3 until the user confirms in this turn.**
3. Produce loop-only baseline artifacts (not `/dev-flow` implementation documents); reuse `assets/baseline-templates/`:
   - `requirements.md`, `high-level-design.md`, `detailed-design.md`, `test-plan.md`, `test-cases.xlsx`
   - Every document must include all required Mermaid diagrams filled with real project-specific names; unfilled placeholders are a checker-gate blocker; see `references/control-plane.md §Delivery Loop Lifecycle step 3` for the mandatory diagram list
   - After producing the artifact set, spawn a checker subagent
   - The checker scores the full artifact set 0–100 against `references/control-plane.md §Baseline Document Quality Checklist`
   - Record the score in `loop_baseline_ready.checker_score`
   - Auto-revise against all findings until checker score ≥ 95 or a blocker is reached
   - Then get Baseline Docs Gate approval
4. Write the Loop Phase DAG and load `dev-flow-loop-envelope`:
   - Produce the Loop Phase DAG (phase nodes, dependencies, entry/exit criteria, repair policy) and the Execution Envelope (budget, stop conditions, side-effect boundaries, `auto_continue_scope`)
   - Spawn a checker subagent to score the DAG and Envelope 0–100 against `references/control-plane.md §DAG and Envelope Quality Checklist`
   - Record the score in `loop_control_ready.dag_envelope_checker_score`
   - Auto-revise against all findings until checker score ≥ 95 or a blocker is reached
   - Then get Execution Envelope Gate approval for the DAG, `auto_continue_scope`, and `dev_flow_phase_handoff`
5. Execute each phase by handing to dev-flow in loop-authorized phase mode:
   - **Before starting execution**, verify `openspec_artifact_ready.checker_score ≥ 95` and `task_orchestration_ready.checker_score ≥ 95` are recorded from dev-flow-planning; do not start implementation if either score is absent or below threshold
   - phase-level OpenSpec/opsx, phase-internal task DAG, detailed test matrix, TDD per task via superpowers, system-level acceptance evidence
6. Record phase OpenSpec/opsx paths and status in `phase-artifacts.md` or `opsx-index.md`; do not duplicate the OpenSpec change directory under loop artifacts.
7. Run a checker subagent for `phase_eval` after each phase or repair round; the checker scores phase artifacts from 0–100; record the score in `phase_eval_result.checker_score`; a phase passes only when checker score ≥ 95 with no P0/P1 finding; do not call `/dev-flow-cr` or emit `cr_report_ready` unless the user explicitly runs `/dev-flow-cr`.
8. Load `dev-flow-loop-triage` when observing repo/CI/diff/issues/OpenSpec/dev-flow artifacts to produce a candidate inbox.
9. Use maker-checker separation before freezing baseline, approving an envelope, or recommending handoff from triage.

## References

- `references/control-plane.md`: Load before reviewing loop design, preparing loop-only baseline artifacts, creating a Loop Phase DAG, proposing automation, writing loop artifacts, or emitting loop signals.
- `assets/baseline-templates/`: Reusable loop-only baseline templates for requirements, high-level design, detailed design, test plan, and the execution-level test case workbook. These assets belong to Loop Engineering, not `/dev-flow` implementation planning.

## Required Signals

Delivery-loop signals and user-approved persisted loop artifacts are written to `loop-state.md` in the loop artifact directory. Read-only triage or workflow design scopes emit signals in the reply unless the user asks to persist loop artifacts. Loop signals are never written to `dev-flow-state.md`.

- `loop_baseline_ready`
- `loop_control_ready`
- `phase_eval_result`
- `loop_eval_result`

Use `references/control-plane.md` for full fields, including `loop_artifact_dir`, `phase_artifact_index`, quality thresholds, evidence paths, and stop decisions.
