---
name: dev-flow-master
description: Use as the primary entrypoint for dev-flow development requests, including new features, debugging, UI/UX work, review, requirement changes, progress recovery, governed routing, planning gates, execution coordination, Git safety boundaries, and final acceptance decisions.
---

# dev-flow-master

Global dispatcher for dev-flow. Own entry, route selection, complexity, phase gates, signal checks, recovery routing, and final authorization.

## Boundary

- dev-flow-master is the primary entry point for all governed and lightweight dev-flow requests.
- Owns: complexity routing, phase gate enforcement, signal ledger maintenance, cross-skill orchestration, and delivery reporting.
- Does NOT: implement code changes, manage Git worktrees, write planning documents, or execute tasks directly.

## Language Policy

All user-facing replies in dev-flow are in Chinese.

## Core Contract

1. Load dev-flow-intent before routing every new request.
2. Enforce Phase 1 and Phase 2 gates without bypass.
3. Never emit routing_decided without a complete intent_decided signal.
4. Never advance to the next stage without the required gating signal for the current stage.

See Load First, Route Contract, Signals And Gates, and Stage Flow for the full behavioral specification.

## Load First

- Load `dev-flow-intent` for every new entry request before complexity classification, unless this is an explicit continuation inside an unambiguous active phase. A continuation qualifies as "unambiguous" only when ALL of the following are true: (1) `dev-flow-state.md` exists and records an active phase signal dated within the current session, (2) the user message contains no new requirement description, scope change, or bug description, AND (3) the existing `intent_decided` signal in `dev-flow-state.md` still accurately describes the current work. If ANY condition fails, re-invoke `dev-flow-intent` before proceeding.
- Before stage-specific work, load the owning focused skill: debugging, UI/UX, review, planning, execution, Git, or acceptance.
- Master emits `routing_decided`; other skills may recommend but must not finalize the route.

## Route Contract

1. Check for existing OpenSpec/change/spec context.
2. Obtain `intent_decided`.
3. Classify implementation work as lightweight, medium, or heavyweight.
4. Route lightweight changes to persisted opsx/OpenSpec artifacts, normally `/opsx:ff <change>`, `/opsx:apply <change>`, and `/opsx:verify <change>`.
5. Route medium/heavy work to `dev-flow-planning` for the four governed Chinese docs and gates.
6. Route review, debugging, UI/UX, status recovery, and questions to the focused owner while preserving dev-flow gates when implementation follows.

Read `references/routing-and-complexity.md` when selecting owners, resolving tie-breakers, classifying complexity, or applying the lightweight opsx/OpenSpec contract.

## Signals And Gates

Persisted evidence is mandatory. Chat memory never satisfies a governed signal or approval. Critical signals include `intent_decided`, `routing_decided`, `documentation_start_approved`, `planning_docs_ready`, `task_orchestration_ready`, `lightweight_artifact_ready`, `opsx_apply_complete`, `opsx_verify_complete`, `git_safe`, `execution_actor_decided`, `execution_settled`, and `acceptance_ready`.

Read `references/state-and-gates.md` before declaring any stage ready, presenting Phase 1/2 gates, accepting lightweight work, or reporting `ready-to-report`.

## Stage Flow

Phase 1 and Phase 2 require explicit user approval. After Phase 2, execution runs to completion unless a documented hard-stop applies. Focused route owners may execute or verify lightweight work only inside the opsx/OpenSpec artifact workflow, never instead of it.

Read `references/flow-and-recovery.md` for stage order, continue-by-default behavior, progress queries, context recovery, and guardrails.

## References

- `references/routing-and-complexity.md`: owner selection, tie-breakers, complexity classification, lightweight opsx/OpenSpec contract.
- `references/state-and-gates.md`: signal schemas, gate rules, stage ownership matrix, phase gates, and completion gate.
- `references/flow-and-recovery.md`: stage order, continue-by-default behavior, progress queries, context recovery, and guardrails.
- `templates/product-requirement-analysis.md`: product requirement analysis template used during planning.
- `templates/software-requirement-analysis.md`: software requirement analysis template used during planning.

## Required Signal

Emits `routing_decided` at the start of every governed or lightweight flow. Full YAML schema is in `references/state-and-gates.md` § Signal Schemas.

## Hard Rules

- Do not force the four-doc path for every small request; use the matrix.
- Do not let lightweight code/config/test/user-visible changes end as chat-only output or a handwritten local note.
- If opsx/OpenSpec is unavailable, ask the user to initialize/install it or reclassify into governed four-document planning. Direct changes without artifacts are allowed only when the user explicitly exits dev-flow.
- Do not advance Phase 1, Phase 2, execution, Git side effects, or final completion without the required owner skill and persisted evidence.
