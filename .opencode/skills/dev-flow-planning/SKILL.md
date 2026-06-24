---
name: dev-flow-planning
description: Use when governed dev-flow work needs planning documents, document review, task orchestration, DAG batches, or executable test matrix before execution.
---

# dev-flow-planning

Own governed planning before execution: pre-document clarification, Phase 1 four Chinese planning documents, and Phase 2 task orchestration. Produce and persist `documentation_start_approved`, `planning_docs_ready`, and `task_orchestration_ready` in `dev-flow-state.md`.

## Core Contract

- Do not draft formal documents immediately after routing into governed planning. Clarify first and obtain explicit document-start approval.
- Keep `dev-flow-state.md` beside the planning artifacts from the first planning gate onward. Chat memory is not evidence for approvals.
- Governed medium/heavy work requires four persisted local docs: requirement analysis, high-level design, detailed design, and test plan.
- Phase 1 Gate and Phase 2 Gate are explicit user gates. Do not continue past them without approval.
- After Phase 1 approval, write `task-orchestration.md` with DAG batches, parallel-safety fields, and an Executable Test Matrix.

## References

- Read `references/pre-documentation-gate.md` before asking clarification questions, recording assumptions, or emitting `documentation_start_approved`.
- Read `references/phase-1-documents.md` before creating or revising the four governed documents, choosing templates, selecting product/software requirement variant, or presenting Phase 1 Gate.
- Read `references/task-orchestration.md` before creating DAG tasks, batches, test matrix, automation readiness checks, or `task_orchestration_ready`.

## Required Output

Persist paths, gate summaries, approvals, unresolved risks, and stale/repair notes in `dev-flow-state.md`. Never leave final governed planning artifacts only in chat.
