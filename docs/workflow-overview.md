# Workflow Overview

Dev Flow Skills splits the development flow into focused skills.

Dev-flow owns routing, gates, persisted artifacts, and evidence. It directly reuses mature Superpowers workflows when available, and absorbs useful patterns from other installed skills without making them required dependencies.

Loop Engineering is an outer control plane around dev-flow. `/dev-flow-triage` and `/dev-flow-loop` can inspect evidence, produce a Candidate Inbox, propose budgets/stop conditions, and recommend the next route. They do not start `/dev-flow`, run `/dev-flow-cr`, write code, create schedulers, or perform Git/external side effects automatically. `/dev-flow-scheduler` is the separate command for approved cron/heartbeat automation management.

## Phase 0: Master

`dev-flow-master` is the entry controller. It loads `dev-flow-intent`, selects the final route, checks gates, and determines which focused skill owns the next stage.

## Intent Routing

`dev-flow-intent` classifies the user's request as debugging, feature, change-adjustment, review, UI/UX, status-recovery, or question. It emits `intent_decided`; only `dev-flow-master` can turn that into `routing_decided`.

Focused routes:

- `dev-flow-debugging`: reproduce failures, collect evidence, identify root cause, and recommend fix/verification path.
- `dev-flow-ui-ux`: handle user-facing layout, interaction, responsive, accessibility, and browser-rendered verification concerns.
- `dev-flow-review`: inspect code or plans in read-first mode and report findings before any fixes.

## Phase 1: Planning

`dev-flow-planning` prevents premature design by requiring clarification before formal documents are written. It owns planning docs, task orchestration, task DAGs, and the executable test matrix.

## Lightweight path

Lightweight work skips the four dev-flow Chinese planning documents, but it does not skip persisted artifacts. It must use the active project's opsx/OpenSpec workflow, normally `/opsx:ff <change>` for artifacts, `/opsx:apply <change>` for implementation, and `/opsx:verify <change>` for evidence. If opsx/OpenSpec is unavailable or uninitialized, the dev-flow path stops for user direction: initialize/install opsx/OpenSpec, or reclassify into governed planning. Direct changes without artifacts require the user to explicitly exit dev-flow.

## Phase 2: Task orchestration and Git safety

`dev-flow-planning` turns approved docs into task orchestration, DAG batches, parallel-safety rules, and an executable test matrix. `dev-flow-git` chooses the correct isolation and side-effect model: worktree, branch, shared working tree, patch-ready mode, PR mode, rollback, or conflict handling.

At Phase 2 Gate, the master presents orchestration results, overlap risks, Git checks, and the proposed execution actor. Multi-agent execution is recommended only when task batches, agent cap, Git isolation, overlap risk, and writer limits support it; direct concurrent writers and worktree creation require explicit user approval.

## Phase 3: Execution

`dev-flow-execution` keeps implementation moving until all planned tasks settle. It owns runtime orchestration state, sub-agent settlement, dynamic replanning, and recovery.

## Phase 4: Acceptance

`dev-flow-acceptance` collects verification evidence and decides whether the change is ready. It verifies `dev-flow-state.md`, task progress, task self-review evidence, Git integration states, and applicable quality reports before producing the delivery report. Independent CR is separate: after user acceptance, run `/dev-flow-cr` to produce a CR report.

## Requirement changes during execution

If the user's requirement or goal changes during execution, the agent must return to planning before continuing implementation. The task orchestration and test matrix must be updated and confirmed before execution resumes.

## Post-Delivery: Code Review (`/dev-flow-cr`)

After `acceptance_ready` is emitted and the delivery report is complete, the team may run `/dev-flow-cr` to perform a scored code review. This is an independent command — it does not block delivery but provides a quantified quality signal. The skill emits `cr_report_ready` with an overall score, per-severity finding counts, and a blocking status (`cr_blocked` | `cr_passed` | `cr_needs_defer_decision`). If `cr_blocked`, do not merge or ship until P0/P1 findings are resolved.

## Outer Loop: Loop Engineering

Use `/dev-flow-triage` for read-only candidate discovery from repo state, CI/test evidence, diffs, OpenSpec/opsx artifacts, issues/PRs, and dev-flow reports. Use `/dev-flow-loop` to review loop design, automation envelopes, budgets, stop conditions, and safe handoff. Use `/dev-flow-scheduler` only after the user approves a concrete automation action.

If triage or loop recommends `/dev-flow` or `/dev-flow-cr`, ask a concrete handoff question such as `是否启动 dev-flow 处理 L-001？`. After the user explicitly confirms that specific candidate, enter the equivalent owner flow without requiring another slash command. Vague replies, silence, or unrelated text are not approval.

All three commands are outside the governed delivery ledger; they keep loop and scheduler state separate from `dev-flow-state.md`. Recurring repo scans should default to read-only Candidate Inbox output, not automatic fixes or full code review.
