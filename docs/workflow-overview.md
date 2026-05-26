# Workflow Overview

Dev Flow Skills splits the development flow into focused skills.

Dev-flow owns routing, gates, persisted artifacts, and evidence. It directly reuses mature Superpowers workflows when available, and absorbs useful patterns from other installed skills without making them required dependencies.

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

## Phase 2: Git safety

`dev-flow-git` chooses the correct isolation and side-effect model: worktree, branch, shared working tree, patch-ready mode, PR mode, rollback, or conflict handling.

At Phase 2 Gate, the master presents orchestration results, Git checks, and the default execution mode. The default is multi-agent/subagent execution governed by task batches, agent cap, Git isolation, and writer limits; user approval accepts that mode unless they override it to main-agent serial execution.

## Phase 3: Execution

`dev-flow-execution` keeps implementation moving until all planned tasks settle. It owns runtime orchestration state, sub-agent settlement, dynamic replanning, and recovery.

## Phase 4: Acceptance

`dev-flow-acceptance` collects verification evidence and decides whether the change is ready. It produces the delivery report.

## Requirement changes during execution

If the user's requirement or goal changes during execution, the agent must return to planning before continuing implementation. The task orchestration and test matrix must be updated and confirmed before execution resumes.
