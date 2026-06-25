# Workflow Overview

Dev Flow Skills splits the development flow into focused skills.

Dev-flow owns routing, gates, persisted artifacts, and evidence. It directly reuses mature Superpowers workflows when available, and absorbs useful patterns from other installed skills without making them required dependencies.

Loop Engineering is an outer control plane around dev-flow. `/dev-flow-loop` can preserve a goal across multiple dev-flow rounds, own confirmed loop-only baseline artifacts, create a cross-phase Loop Phase DAG, run eval/repair decisions, and auto-continue inside an approved envelope. `/dev-flow-triage` only discovers candidates. `/dev-flow-scheduler` only manages approved cron/heartbeat automations.

## Phase 0: Master

`dev-flow-master` is the entry controller. It loads `dev-flow-intent`, selects the final route, checks gates, and determines which focused skill owns the next stage.

## Intent Routing

`dev-flow-intent` classifies the user's request as debugging, feature, change-adjustment, review, UI/UX, status-recovery, or question. It emits `intent_decided`; only `dev-flow-master` can turn that into `routing_decided`.

Focused routes:

- `dev-flow-debugging`: reproduce failures, collect evidence, identify root cause, and recommend fix/verification path.
- `dev-flow-ui-ux`: handle user-facing layout, interaction, responsive, accessibility, and browser-rendered verification concerns.
- `dev-flow-review`: inspect code or plans in read-first mode and report findings before any fixes.

## Phase 1: Planning

`dev-flow-planning` prevents premature design by requiring clarification before OpenSpec/opsx baseline artifacts are written or refreshed. It owns OpenSpec baseline refinement, independent checker review, task orchestration, task DAGs, and the executable test matrix.

When `/dev-flow-loop` owns the outer goal, the loop first discusses requirements, blockers, and design options with the user, then generates loop-only baseline artifacts: requirements, high-level design, detailed design, and test plan (`test-plan.md`). These are outer-loop control artifacts, not `/dev-flow` implementation documents. They are reviewed by an independent checker subagent and auto-revised until the score is at least 95 or a blocker is reached. The user approves the Baseline Docs Gate first; then the user approves the Execution Envelope Gate for the Loop Phase DAG, `auto_continue_scope`, `dev_flow_phase_handoff`, budgets, stop conditions, and side-effect boundaries before implementation starts.

Loop-owned artifacts live under `Docs/<topic>/loop/` or `docs/<topic>/loop/`. That directory contains baseline docs, `loop-phase-dag.md`, `loop-envelope.md`, `loop-state.md`, and a phase index such as `phase-artifacts.md` or `opsx-index.md`. OpenSpec/opsx originals stay in `openspec/changes/<change-id>/` or the project's standard OpenSpec/opsx location. Do not move or copy OpenSpec/opsx originals into the loop artifact directory; the loop index links to them.

Freezing the initial baseline, approving the Loop Phase DAG, and enabling `within_confirmed_baseline` require explicit user approval. Exceeding baseline, budget, retry, stop-condition, or side-effect boundaries requires stopping and asking the user.

Machine-checkable loop terms for implementations: `loop_baseline_ready`, `independent checker score`, `quality_threshold: 95`, `phase_eval threshold: 95`, `no P0/P1 finding`, `Baseline Docs Gate`, `Execution Envelope Gate`, `within_confirmed_baseline`, `auto-continue within baseline`, `TDD per task via superpowers`, and max phase repair rounds of 3.

## Lightweight path

All implementation work uses the active project's OpenSpec/opsx workflow, normally `/opsx:ff <change>` for artifacts, `/opsx:apply <change>` for implementation, and `/opsx:verify <change>` for evidence. Lightweight work uses the same artifact baseline with a smaller scope; medium/heavy work adds independent checker review, DAG, detailed test matrix, Git safety, and system-level checks. If OpenSpec/opsx is unavailable or uninitialized, the dev-flow path stops for user direction: initialize/install OpenSpec/opsx, or explicitly exit dev-flow.

## Phase 2: Task orchestration and Git safety

`dev-flow-planning` turns approved docs into task orchestration, DAG batches, parallel-safety rules, and an executable test matrix. `dev-flow-git` chooses the correct isolation and side-effect model: worktree, branch, shared working tree, patch-ready mode, PR mode, rollback, or conflict handling.

At Phase 2 Gate, the master presents orchestration results, overlap risks, Git checks, and the proposed execution actor. Multi-agent execution is recommended only when task batches, agent cap, Git isolation, overlap risk, and writer limits support it; direct concurrent writers and worktree creation require explicit user approval.

For loop-authorized phase work, there are two DAG layers: the loop owns the cross-phase Loop Phase DAG, while dev-flow owns the phase-internal `task-orchestration.md`. A phase should create phase-level OpenSpec/opsx artifacts and task orchestration instead of rewriting the loop-only baseline artifacts.

The loop's `phase-artifacts.md` or `opsx-index.md` maps each phase to its OpenSpec/opsx change ID, canonical change path, status, verification evidence, `phase_eval_result`, and unresolved risks. It is an index only; the source artifacts remain in the OpenSpec/opsx change directory.

## Phase 3: Execution

`dev-flow-execution` keeps implementation moving until all planned tasks settle. It owns runtime orchestration state, sub-agent settlement, dynamic replanning, and recovery.

Implementation tasks use TDD per task through `superpowers:test-driven-development` when available, or an equivalent local fallback. Each task records RED/GREEN/refactor evidence before acceptance.

## Phase 4: Acceptance

`dev-flow-acceptance` collects verification evidence and decides whether the change is ready. It verifies `dev-flow-state.md`, task progress, task local verification evidence, TDD evidence, Git integration states, system-level checks, requirements/design/test coverage, and applicable quality reports before producing the delivery report. Independent CR is separate: after user acceptance, run `/dev-flow-cr` to produce a CR report.

## Requirement changes during execution

If the user's requirement or goal changes during execution, the agent must return to planning before continuing implementation. The task orchestration and test matrix must be updated and confirmed before execution resumes.

## Post-Delivery: Code Review (`/dev-flow-cr`)

After `acceptance_ready` is emitted and the delivery report is complete, the team may run `/dev-flow-cr` to perform a scored code review. This is an independent command — it does not block delivery but provides a quantified quality signal. The skill emits `cr_report_ready` with an overall score, per-severity finding counts, and a blocking status (`cr_blocked` | `cr_passed` | `cr_needs_defer_decision`). If `cr_blocked`, do not merge or ship until P0/P1 findings are resolved.

## Outer Loop: Loop Engineering

Use `/dev-flow-loop <goal>` when you want goal-preserving automation around dev-flow, not just one delivery pass. Typical examples:

- new project: agree on requirements/design/test baseline, create a phase DAG, then let the loop drive dev-flow phases until eval passes or a stop condition is reached
- existing project: inspect current artifacts, establish a baseline for the requested change, run phase-level dev-flow tasks, and repair issues found by eval
- recurring work: define the loop envelope, then use `/dev-flow-scheduler` to schedule the already-approved loop or triage prompt

Loop internal `phase_eval` is not `/dev-flow-cr` and must not emit `cr_report_ready`; independent CR remains user-triggered through `/dev-flow-cr`.

Use `/dev-flow-triage` for read-only candidate discovery from repo state, CI/test evidence, diffs, OpenSpec/opsx artifacts, issues/PRs, and dev-flow reports. If triage recommends `/dev-flow` or `/dev-flow-cr`, ask a concrete handoff question such as `是否启动 dev-flow 处理 L-001？`. After the user explicitly confirms that specific candidate, enter the equivalent owner flow without requiring another slash command. Vague replies, silence, or unrelated text are not approval.

Loop state stays separate from phase-level `dev-flow-state.md`, but phase artifacts should link back to the loop baseline and phase ID. Recurring repo scans should default to read-only Candidate Inbox output, not automatic fixes or full code review.
