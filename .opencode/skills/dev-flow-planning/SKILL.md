---
name: dev-flow-planning
description: Use when dev-flow work needs OpenSpec/opsx baseline artifacts, independent checker review, task orchestration, DAG batches, detailed test planning, Git safety preparation, or executable test matrix before execution.
---

# dev-flow-planning

Own governed planning before execution: pre-artifact clarification, OpenSpec/opsx baseline artifacts, independent checker review, and Phase 2 task orchestration. Produce and persist `documentation_start_approved`, `openspec_artifact_ready`, and `task_orchestration_ready` in `dev-flow-state.md`.

## Boundary

This skill owns OpenSpec/opsx baseline artifact preparation, the pre-artifact gate, phase-level planning, detailed test planning, DAG orchestration, and the Executable Test Matrix. Does NOT execute tasks or make runtime decisions.

## Language Policy

All user-facing replies in dev-flow are in Chinese.

## Core Contract

- Do not draft or update formal OpenSpec/opsx artifacts immediately after routing into governed planning. Clarify first and obtain explicit artifact-start approval.
- Keep `dev-flow-state.md` beside the planning artifacts from the first planning gate onward. Chat memory is not evidence for approvals.
- All implementation work requires persisted OpenSpec/opsx artifacts. Medium/heavy work requires richer OpenSpec requirements/design/tasks/spec evidence, not separate fixed dev-flow planning files.
- Any scoring, sufficiency review, gate pass/fail, or readiness decision must use an independent checker subagent that reviews raw artifacts and produces findings before the main agent revises.
- OpenSpec Baseline Gate and Phase 2 Gate are explicit user gates. Do not continue past them without approval.
- After OpenSpec Baseline Gate approval, write `task-orchestration.md` with DAG batches, parallel-safety fields, detailed test matrix, and system-level acceptance checks.
- In loop-authorized phase mode, treat the confirmed loop-only baseline artifacts as the upstream source of truth. Do not recreate the full loop baseline; create phase-level OpenSpec/opsx artifacts and the phase-internal `task-orchestration.md`. Before starting phase-level planning in loop-authorized mode, reload `loop-state.md` to confirm the loop baseline is still `user_confirmed` and the current phase is inside the Loop Phase DAG.

## References

- Read `references/pre-documentation-gate.md` before asking clarification questions, recording assumptions, or emitting `documentation_start_approved`.
- Read `references/phase-1-documents.md` before creating or revising OpenSpec/opsx baseline artifacts, running independent checker review, or presenting OpenSpec Baseline Gate.
- Read `references/task-orchestration.md` before creating DAG tasks, batches, detailed test matrix, automation readiness checks, or `task_orchestration_ready`.

## Required Signal

Emits `documentation_start_approved`, `openspec_artifact_ready`, and `task_orchestration_ready`. Full YAML schemas are in `references/state-and-gates.md § Signal Schemas`.

Persist paths, gate summaries, approvals, unresolved risks, and stale/repair notes in `dev-flow-state.md`. Never leave final governed planning artifacts only in chat.
