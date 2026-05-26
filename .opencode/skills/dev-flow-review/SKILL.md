---
name: dev-flow-review
description: Use when the user asks to review code, inspect a diff, evaluate implementation quality, assess risks, find bugs, check tests, review a plan, or provide feedback before making changes.
---

# dev-flow-review

`dev-flow-review` owns review-mode behavior for dev-flow. It is selected when the user asks for evaluation, not implementation.

All user-facing replies in this dev-flow system must be written in Chinese. Command names, file paths, artifact IDs, and literal CLI commands may remain in their original language.

## Boundary

Review is read-first and findings-first. Do not modify files unless the user explicitly asks to implement fixes after the review. If the user asks to fix review findings, return to `dev-flow-master` for routing because the fix may be debugging, feature work, change-adjustment, or UI/UX.

When available, reuse established review discipline:

- Use code-review stance for bugs, regressions, missing tests, security risks, and behavioral changes.
- Use `superpowers:receiving-code-review` when the task is to process external review feedback before implementing it.
- Use `superpowers:requesting-code-review` when execution has produced a major feature or a task boundary that needs an independent review before integration.
- If `code-review-and-quality` is available, absorb its multi-axis review style; do not require it for the route to function.

## Workflow

1. Establish review scope.
- Identify the diff, files, branch, PR, plan, or artifact being reviewed.
- If no scope is provided, inspect local Git status and ask only if multiple plausible scopes remain.

2. Read before judging.
- Review relevant code, tests, docs, generated artifacts, and changed behavior.
- Prefer concrete file/line evidence over general impressions.

3. Report findings first.
- Order by severity.
- Each finding should state the risk, the evidence, and the suggested direction.
- Prioritize bugs, regressions, missing tests, broken contracts, security issues, and deployment risks.

4. Keep summary secondary.
- After findings, include open questions or assumptions.
- Then include a short change summary or residual risk note.

## Output Format

Use this structure:

```text
发现：
- [P1] <问题标题> — <文件:行>。<风险和证据>。<建议方向>
- [P2] ...

开放问题：
- ...

摘要：
<1-3 句，说明整体状态和测试缺口>
```

If no issues are found, say that clearly and mention remaining test gaps or review limits.

## Severity

- `P0`: data loss, security breach, production outage, or impossible rollback.
- `P1`: likely user-visible bug, broken build/test, contract break, or serious regression.
- `P2`: maintainability, missing edge-case coverage, confusing behavior, or moderate risk.
- `P3`: polish, small cleanup, documentation, or non-blocking suggestion.
