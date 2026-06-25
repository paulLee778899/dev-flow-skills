---
name: dev-flow-master
description: Use as the primary entrypoint for dev-flow development requests, including new features, debugging, UI/UX work, review, requirement changes, progress recovery, governed routing, planning gates, execution coordination, Git safety boundaries, and final acceptance decisions.
---

# dev-flow-master

Global dispatcher for dev-flow. Own entry, route selection, complexity, phase gates, signal checks, recovery routing, and final authorization.

## Boundary

- dev-flow-master is the primary entry point for all governed and lightweight dev-flow requests.
- Owns: complexity routing, phase gate enforcement, signal ledger maintenance, cross-skill orchestration, and delivery reporting.
- Does NOT: implement code changes, manage Git worktrees, write OpenSpec/opsx artifacts, or execute tasks directly.

## Language Policy

All user-facing replies in dev-flow are in Chinese.

## Core Contract

1. Load dev-flow-intent before routing every new request.
2. Enforce OpenSpec Baseline Gate and Phase 2 gates without bypass unless the request is a loop-authorized phase handoff with a confirmed loop baseline and envelope.
3. Never emit routing_decided without a complete intent_decided signal.
4. Never advance to the next stage without the required gating signal for the current stage.

## Load First

- Load `dev-flow-intent` for every new entry request before complexity classification, unless this is an explicit continuation inside an unambiguous active phase. A continuation qualifies as "unambiguous" only when ALL of the following are true: (1) `dev-flow-state.md` exists and records an active phase signal dated within the current session, (2) the user message contains no new requirement description, scope change, or bug description, AND (3) the existing `intent_decided` signal in `dev-flow-state.md` still accurately describes the current work. If ANY condition fails, re-invoke `dev-flow-intent` before proceeding.
- Before stage-specific work, load the owning focused skill: debugging, UI/UX, review, planning, execution, Git, or acceptance.
- Master emits `routing_decided`; other skills may recommend but must not finalize the route.

## Route Contract

1. Check for existing OpenSpec/change/spec context.
2. Obtain `intent_decided`.
3. Detect loop-authorized phase mode by verifying all five conditions in `references/routing-and-complexity.md §Loop-Authorized Phase Mode`; do not enter this mode on a subset of those conditions.
4. Classify implementation work as lightweight, medium, or heavyweight.
5. Route all implementation work to persisted OpenSpec/opsx artifacts, normally `/opsx:ff <change>`, `/opsx:apply <change>`, and `/opsx:verify <change>`.
6. Route medium/heavy work to `dev-flow-planning` for OpenSpec baseline refinement, independent checker review, DAG/test matrix, and Git safety. Keep formal implementation evidence in OpenSpec/opsx artifacts. In loop-authorized phase mode, planning consumes the confirmed loop baseline and writes phase-level OpenSpec/opsx plus phase task orchestration instead of recreating the full loop baseline.
7. Route review, debugging, UI/UX, status recovery, and questions to the focused owner while preserving dev-flow gates when implementation follows.

Read `references/routing-and-complexity.md` when selecting owners, resolving tie-breakers, classifying complexity, or applying the lightweight opsx/OpenSpec contract.

## Signals And Gates

Persisted evidence is mandatory. Chat memory never satisfies a governed signal or approval. Critical signals include `intent_decided`, `routing_decided`, `documentation_start_approved`, `openspec_artifact_ready`, `task_orchestration_ready`, `git_safe`, `execution_actor_decided`, `opsx_apply_complete`, `opsx_verify_complete`, `execution_settled`, and `acceptance_ready`.

Read `references/state-and-gates.md` before declaring any stage ready, presenting OpenSpec Baseline/Phase 2 gates, accepting lightweight work, or reporting `ready-to-report`.

## Stage Flow

OpenSpec Baseline Gate and Phase 2 require explicit user approval. After Phase 2, execution runs to completion unless a documented hard-stop applies. Focused route owners may execute or verify work only inside the opsx/OpenSpec artifact workflow, never instead of it.

In loop-authorized phase mode, the loop's confirmed baseline and envelope are the upstream approval. Do not ask the user to retype `/dev-flow` or reconfirm the same global requirements; ask only when the phase changes the baseline, side-effect boundary, Git mode, or acceptance criteria.

Any score, gate pass/fail, phase_eval, or readiness judgment that affects continuation must be checked by an independent checker subagent using raw artifacts, not the main agent's conclusion.

Read `references/flow-and-recovery.md` for stage order, continue-by-default behavior, progress queries, context recovery, and guardrails.

## References

- `references/routing-and-complexity.md`: owner selection, tie-breakers, complexity classification, lightweight opsx/OpenSpec contract.
- `references/state-and-gates.md`: signal schemas, gate rules, stage ownership matrix, phase gates, and completion gate.
- `references/flow-and-recovery.md`: stage order, continue-by-default behavior, progress queries, context recovery, and guardrails.

## Required Signal

Emits `routing_decided` at the start of every governed or lightweight flow. Full YAML schema is in `references/state-and-gates.md` § Signal Schemas.

## Hard Rules

- Do not force the old four-doc path; every implementation path uses OpenSpec/opsx artifacts as the documentation baseline.
- Do not carry or load loop baseline templates from `dev-flow-master`; four-document baseline templates belong only to `dev-flow-loop/assets/baseline-templates/`.
- Do not regenerate full loop requirements/design/test docs inside a phase-level dev-flow handoff; reference the loop baseline and create only the phase artifacts needed for implementation.
- Do not let code/config/test/user-visible changes end as chat-only output or a handwritten local note.
- If opsx/OpenSpec is unavailable, ask the user to initialize/install it or explicitly exit dev-flow; direct changes without artifacts are not a dev-flow delivery path.
- Do not advance OpenSpec Baseline Gate, Phase 2, execution, Git side effects, or final completion without the required owner skill and persisted evidence.
