---
name: dev-flow-debugging
description: Use when a development request involves bugs, failing tests, build failures, runtime errors, regressions, broken interactions, unexpected behavior, logs, incidents, or any fix that needs root-cause investigation before code changes.
---

# dev-flow-debugging

`dev-flow-debugging` owns the debugging preflight and fix discipline for dev-flow. It is normally selected by `dev-flow-master` after `dev-flow-intent` emits `task_type: debugging`.

All user-facing replies in this dev-flow system must be written in Chinese. Command names, file paths, artifact IDs, and literal CLI commands may remain in their original language.

## Boundary

This skill diagnoses and guides fixes. It must not bypass `dev-flow-master` for complexity routing, gate decisions, Git side effects, or final completion. If the diagnosis reveals new feature work, requirement change, UI/UX work, or review-only work, return that recommendation to `dev-flow-master`.

**REQUIRED SUB-SKILL:** Use `superpowers:systematic-debugging` when available. Follow it for root-cause discipline before proposing or applying fixes, then adapt its findings into `debugging_report` and return route guidance to `dev-flow-master`.

If `superpowers:systematic-debugging` is unavailable, use the equivalent fallback below. If `debugging-and-error-recovery` is available, you may use its triage and recovery patterns as additional guidance, but do not make dev-flow depend on it.

## Iron Rule

Do not propose or implement a fix until the root cause has been investigated. A guessed patch is not a debugging result.

## Workflow

1. Reproduce or bound the failure.
- Run the failing command, open the broken workflow, inspect the failing test, or capture the exact logs.
- If the issue cannot be reproduced, record what was tried and what evidence is missing.

2. Gather evidence.
- Read error messages and stack traces carefully.
- Compare expected and actual behavior.
- Check recent changes, relevant diffs, config, dependencies, and environment.
- In multi-component flows, inspect the boundary where data, state, or control changes hands.

3. Identify root cause.
- State a concrete hypothesis and why the evidence supports it.
- Compare with a working example or nearby pattern when possible.
- Avoid bundling unrelated cleanup into the diagnosis.

4. Decide the route after diagnosis.
- Small, bounded root-cause fix: route as lightweight execution with focused verification.
- Cross-module, unclear, contract, data, security, release, or UI-runtime impact: route back to `dev-flow-master` for medium/heavy governed handling.
- User changed desired behavior while debugging: route as `change-adjustment`.

5. Fix and verify.
- Prefer a failing regression test or minimal reproduction before the fix.
- Implement the smallest root-cause fix.
- Run the original failing check and the relevant regression checks.
- If the fix fails, return to evidence gathering instead of stacking guesses.

## Required Evidence

Before handoff or completion, produce a compact `debugging_report`:

```yaml
debugging_report:
  symptom: "测试 X 失败 / 页面 Y 点击无效"
  reproduction:
    command_or_steps: "npm test -- ..."
    result: "fails with ..."
  evidence:
    - "stack trace points to ..."
    - "working path does ..."
  root_cause: "..."
  fix_scope: "one file / two modules / contract change / unknown"
  regression_checks:
    - "..."
  recommended_next_route: "lightweight_fix | governed_planning | ui_ux_verification | change_adjustment"
```

If evidence is incomplete, say exactly what is missing and whether the next step is safe.

## UI Bugs

If the bug is user-facing UI behavior, keep debugging primary until the root cause is known. After the fix, use `dev-flow-ui-ux` for browser, responsive, interaction, and console verification when visual/runtime evidence matters.
