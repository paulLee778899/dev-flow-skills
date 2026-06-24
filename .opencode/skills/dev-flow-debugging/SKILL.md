---
name: dev-flow-debugging
description: Use when a development request involves bugs, failing tests, build failures, runtime errors, regressions, broken interactions, unexpected behavior, logs, incidents, or any fix that needs root-cause investigation before code changes.
---

# dev-flow-debugging

Own root-cause-first debugging before any fix. Selected after `dev-flow-intent` emits `task_type: debugging`. All user-facing replies in dev-flow are Chinese.

## Boundary

Diagnose and guide fixes. Do not bypass `dev-flow-master` for complexity routing, gates, Git side effects, or final completion. If diagnosis reveals feature work, requirement change, UI/UX work, or review-only work, return that recommendation to master.

**REQUIRED SUB-SKILL:** Use `superpowers:systematic-debugging` when available. If unavailable, follow this skill's fallback.

## Iron Rule

Do not propose or implement a fix until the root cause has been investigated. A guessed patch is not a debugging result.

## Route Summary

Small bounded root-cause fixes route to lightweight opsx/OpenSpec artifact execution with focused verification. Cross-module, contract, data, security, release, or UI-runtime impact routes back to master for governed handling. UI runtime bugs require `ui_ux_report` before acceptance.

Read `references/debugging-evidence.md` before reproducing failures, gathering evidence, emitting `debugging_report`, or deciding UI follow-up.
