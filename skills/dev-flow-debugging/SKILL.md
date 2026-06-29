---
name: dev-flow-debugging
description: Use when a development request involves bugs, failing tests, build failures, runtime errors, regressions, broken interactions, unexpected behavior, logs, incidents, or any fix that needs root-cause investigation before code changes.
---

# dev-flow-debugging

Own root-cause-first debugging before any fix. Selected after `dev-flow-intent` emits `task_type: debugging`.

## Boundary

Diagnose and guide fixes. Do not bypass `dev-flow-master` for complexity routing, gates, Git side effects, or final completion. If diagnosis reveals feature work, requirement change, UI/UX work, or review-only work, return that recommendation to master.

**Optional helper skill:** Use `superpowers:systematic-debugging` when available. If unavailable, follow the systematic debugging protocol in `references/debugging-evidence.md`.

## Language Policy

All user-facing replies and all generated artifact documents (requirements, design, specs, CLI specs, test plans, delivery reports, and other persisted Markdown files) in dev-flow must be written in Chinese.

## Core Contract

1. Never prescribe a fix before reproducing the bug.
2. Gather structured evidence before returning to dev-flow-master.
3. Scope the fix (contained/moderate/broad) before routing.
4. Emit debugging_report regardless of whether the route is lightweight or governed.

## References

Load `references/debugging-evidence.md` when entering a debugging session. It contains the reproduction protocol, evidence schema, and escalation rules.

## Iron Rule

Do not propose or implement a fix until the root cause has been investigated. A guessed patch is not a debugging result.

## Route Summary

Small bounded root-cause fixes route to lightweight opsx/OpenSpec artifact execution with focused verification. Cross-module, contract, data, security, release, or UI-runtime impact routes back to master for governed handling. UI runtime bugs require `ui_ux_report` before acceptance.

Read `references/debugging-evidence.md` before reproducing failures, gathering evidence, emitting `debugging_report`, or deciding UI follow-up.

## Required Signal

```yaml
debugging_report:
  producer: dev-flow-debugging
  bug_id: <string>
  reproduction_confirmed: true | false | intermittent
  root_cause: <description>
  fix_scope: contained | moderate | broad
  recommended_next_route: dev-flow-master | dev-flow-master lightweight | ui-ux | change-adjustment
  evidence_paths: [list]
```
