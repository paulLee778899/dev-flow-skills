---
name: dev-flow-execution
description: Use when Phase 3 has started and the agent must execute continuously, dynamically replan tasks, verify results, handle sub-agent settlement, and maintain runtime orchestration state.
---

# dev-flow-execution

## Boundary

This skill owns Phase 3 continuous execution: task dispatch, sub-agent coordination, settlement, replanning, and recovery.

Does NOT make architectural decisions, modify planning artifacts, or bypass OpenSpec Baseline / Phase 2 gates.

## Language Policy

All user-facing replies in dev-flow are in Chinese.

## Core Contract

Own Phase 3 run-to-completion execution after Phase 2 Gate is cleared. Maintain Runtime Orchestration State, dispatch tasks under Git/writer limits, verify done signals, update progress, and move to acceptance when settled.

Every implementation task, lightweight or heavyweight, must use `superpowers:test-driven-development` when available, or the local equivalent: failing test first, observed RED, minimal GREEN, refactor after green, and recorded evidence. This is a per-task execution rule, not a loop-layer responsibility.

## References

Load `references/runtime-and-dispatch.md` for the run-to-completion loop and agent cap rules. Load `references/task-settlement-and-modes.md` for execution mode rules and settlement protocol. Load `references/replanning-and-recovery.md` for replan and recovery rules.

- Execute continuously after Phase 2 approval; do not stop after a task, batch, progress update, patch-ready output, or automatic inside-baseline replan when safe to continue.
- The main agent remains coordinator for task dispatch, Git boundaries, verification, progress, and integration.
- Evaluate multi-agent/subagent execution after Phase 2 planning. Use concurrent writers only when the user approves the proposed execution actor and Git/writer limits allow it.
- Rebuild Runtime Orchestration State from persisted artifacts and actual Git/filesystem state after changes or recovery. Never dispatch from stale memory.

Read `references/runtime-and-dispatch.md` before selecting agent cap, sub-waves, runtime state, or run-to-completion behavior.

## Task Settlement

A task is settled only by a final signal: `final_success`, `final_failed`, `final_blocked`, or `cancelled_by_master`. Intermediate test failures, type errors, retries, or conflict telemetry are not final outcomes.

Read `references/task-settlement-and-modes.md` before judging task completion, using shared-worktree patch mode, using shared-working-tree serial agent mode, applying per-task rules, or handling failures.

## Replanning And Recovery

Inside-baseline replanning is allowed and should continue automatically after artifacts are updated. Requirement or acceptance-baseline changes are governance events and require returning to planning/gates.

Read `references/replanning-and-recovery.md` before changing orchestration, handling user requirement changes, recording fallbacks, updating `progress.md`, recovering after interruption, or emitting `execution_settled` / `review_evidence_ready`.

## Required Signal

Emits `execution_settled` when Phase 3 completes. Also produces `review_evidence_ready` (aggregated by dev-flow-acceptance). Full YAML schemas are in `dev-flow-master/references/state-and-gates.md` § Signal Schemas.
