# Debugging Evidence Reference

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
- Small, bounded root-cause fix: route as lightweight opsx/OpenSpec artifact execution with focused verification.
- Cross-module, unclear, contract, data, security, release, or UI-runtime impact: route back to `dev-flow-master` for medium/heavy governed handling.
- User-facing UI runtime bugs must carry `risk_flags: [ui_runtime]` and require `dev-flow-ui-ux` verification after the root-cause fix.
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
  risk_flags:
    - "ui_runtime" # include only when user-facing runtime verification is required
  regression_checks:
    - "..."
  required_followup:
    - "ui-ux" # include when UI runtime verification must follow the fix
  recommended_next_route: "dev-flow-master | dev-flow-master lightweight | ui-ux | change-adjustment"
```

Canonical values for `recommended_next_route`:
- `dev-flow-master`: standard governed path (master receives the report and decides whether to invoke governed planning)
- `dev-flow-master lightweight`: opsx-based lightweight fix; master validates that the fix scope qualifies
- `ui-ux`: bug is a UI rendering issue requiring `dev-flow-ui-ux` verification
- `change-adjustment`: user changed requirements during debugging

Note: `governed_planning` is not a valid value. Governed planning is triggered by `dev-flow-master` after it receives the `debugging_report`; the debugging skill routes to master, not directly to governed planning.

When `recommended_next_route` is `dev-flow-master lightweight`, always emit the full `debugging_report` signal before returning to master. Do not skip signal emission for lightweight routes — the signal carries `fix_scope` evidence that master needs to validate the lightweight path is appropriate.

If evidence is incomplete, say exactly what is missing and whether the next step is safe.

## Escalation Threshold

If reproduction fails after 3 distinct reproduction attempts, stop evidence gathering. Document each attempt with its setup conditions and observed result. Declare the bug `non-reproducible` in the debugging report and route back to dev-flow-master with recommendation: (a) gather more information from the user, (b) add instrumentation and re-trigger, or (c) accept as known intermittent issue with a monitoring ticket.

## Intermittent / Flaky Failures

If the bug reproduces in fewer than 3 out of 5 attempts, classify as intermittent. Record reproduction rate and environmental variables. Do not mark as `fix_confirmed` unless the fix causes 0 reproductions in 5 attempts under identical conditions.

## UI Bugs

If the bug is user-facing UI behavior, keep debugging primary until the root cause is known. After the fix, use `dev-flow-ui-ux` for browser, responsive, interaction, and console verification when visual/runtime evidence matters. When `debugging_report.risk_flags` includes `ui_runtime` or `required_followup` includes `ui-ux`, `ui_ux_report` is required before `acceptance_ready` can be true.
