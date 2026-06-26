---
name: dev-flow-acceptance
description: Use when dev-flow execution batches are complete and the main agent must run final acceptance, collect quality evidence, write delivery report, and decide readiness.
---

# dev-flow-acceptance

## Boundary

This skill owns final readiness assessment, evidence collection, and delivery report generation.

Does NOT execute tasks, modify code, or re-enter earlier phases.

## Language Policy

All user-facing replies in dev-flow are in Chinese.

Own final acceptance after DAG batches or lightweight opsx/OpenSpec work are complete, deferred, or replanned. Acceptance decides readiness; it does not rely on chat memory or agent self-reporting.

Use `superpowers:verification-before-completion` when available before claiming complete, fixed, passing, or ready.

## Core Contract

- Reconcile persisted artifacts, actual Git/filesystem state, task results, and Runtime Orchestration State.
- Run final and system-level checks from the Executable Test Matrix, and verify all work against `/opsx:verify <change>` evidence.
- Use at least 2 independent checker subagents for final requirements/design/test coverage and readiness judgments; the main agent may collect evidence but must not be the only reviewer for pass/fail. Persist scores/count; readiness requires all checker scores ≥ 95 and no P0/P1 finding unless an allowed documentation-only exception applies.
- Confirm task local verification evidence, TDD evidence, phase-level OpenSpec/opsx evidence, and canonical Git/patch integration states. Independent CR is user-triggered through `/dev-flow-cr`; loop-authorized phases may feed acceptance evidence to `phase_eval`, which must not call `/dev-flow-cr` or emit `cr_report_ready`.
- Write `delivery-report.md` for governed work and record readiness evidence for lightweight opsx/OpenSpec work.
- Report `not-ready` or `ready-for-review` when required evidence is missing; do not claim completion.

Read `references/readiness-and-report.md` before final verification, delivery report writing, failure recovery, readiness decisions, or emitting `acceptance_ready`.

## References

Load `references/readiness-and-report.md` for readiness checklist, report template, and signal schema.

## Required Signal

Emits `acceptance_ready`. Full schema defined in `references/readiness-and-report.md`.
