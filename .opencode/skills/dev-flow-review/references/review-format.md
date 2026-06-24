# Review Format Reference

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
