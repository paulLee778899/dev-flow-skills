---
name: dev-flow-acceptance
description: Use when dev-flow execution batches are complete and the main agent must run final acceptance, collect quality evidence, write delivery report, and decide readiness.
---

# dev-flow-acceptance

Own final acceptance after DAG batches or lightweight opsx/OpenSpec work are complete, deferred, or replanned. Acceptance decides readiness; it does not rely on chat memory or agent self-reporting.

Use `superpowers:verification-before-completion` when available before claiming complete, fixed, passing, or ready.

## Core Contract

- Reconcile persisted artifacts, actual Git/filesystem state, task results, and Runtime Orchestration State.
- Run final checks from the Executable Test Matrix, or verify lightweight work against `/opsx:verify <change>` evidence.
- Confirm task self-review evidence and canonical Git/patch integration states. Independent CR is user-triggered through `/dev-flow-cr`, not automatic acceptance.
- Write `delivery-report.md` for governed work and record readiness evidence for lightweight opsx/OpenSpec work.
- Report `not-ready` or `ready-for-review` when required evidence is missing; do not claim completion.

Read `references/readiness-and-report.md` before final verification, delivery report writing, failure recovery, readiness decisions, or emitting `acceptance_ready`.
