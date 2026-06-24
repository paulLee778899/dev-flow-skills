# CR Scope And Report Reference

## Scope Selection

Use this order when the user does not provide an explicit scope:

1. Current uncommitted Git diff.
2. Current branch diff against the upstream/default branch.
3. Active dev-flow/OpenSpec change detected from nearby artifacts.
4. Ask for scope only when no reviewable diff, branch, PR, or change can be determined.

When dev-flow artifacts exist, use them as context but review the actual code state. Chat memory is not review evidence.

## Read-Only Rule

Do not edit implementation, tests, configs, docs, generated assets, or Git history during CR. The only file this skill may create or update is the CR report artifact. If fixes are requested, stop CR and route to `dev-flow-master`.

## Report Location

- Governed dev-flow topic: `Docs/<topic>/cr-report.md` or the canonical topic folder already used by `dev-flow-state.md`.
- Lightweight OpenSpec/opsx change: the change directory when obvious, otherwise `.dev-flow/cr/<timestamp>-<change>.md`.
- Standalone diff/branch/PR: `.dev-flow/cr/<timestamp>-cr-report.md`.

Create parent directories only for the report path.

## Severity And Blocking

| Severity | Meaning | Blocking |
|---|---|---|
| `P0` | Data loss, security breach, production outage, destructive migration, or impossible rollback. | Blocks merge/release. |
| `P1` | Likely user-visible bug, broken build/test, contract break, serious regression, or missing critical test. | Blocks merge/release. |
| `P2` | Edge-case bug, maintainability risk, incomplete coverage, confusing behavior, moderate operational risk. | Fix or explicitly defer. |
| `P3` | Polish, small cleanup, naming, non-blocking documentation, optional improvement. | Non-blocking. |

CR is independent from `/dev-flow` delivery. A clean delivery can still receive blocking CR findings after user acceptance.

## Scoring

Start at 100 and subtract:

- P0: 30 each
- P1: 18 each
- P2: 8 each
- P3: 2 each
- Missing essential review evidence: 5-15 depending on risk

Floor the score at 0. A report with any P0 or P1 is `cr_blocked` even if the numeric score is high. A report with no P0/P1 and score >= 90 is `cr_passed`.

## Required Report Shape

Write the report in Chinese using this structure:

```text
# CR Report

## Scope
- Review target:
- Evidence reviewed:
- Review limits:

## Score
- Score: <0-100>
- Status: cr_passed | cr_blocked | cr_needs_defer_decision

## Findings
| Severity | 问题 | 影响 | 证据 | 建议 | 状态 |
|---|---|---|---|---|---|
| P1 | ... | ... | file:line / command / artifact | ... | blocking |

## Verification Notes
- Commands inspected or recommended:
- Tests missing or not run:

## Decision
- Blocking findings:
- P2 defer decision needed:
- Suggested next owner:
```

If no issues are found, keep the findings table with a single `无阻断问题` row and state residual review limits.

## Required Signal

Emit `cr_report_ready` with: report path, review scope, evidence reviewed, score, status, P0/P1/P2/P3 counts, blocking findings, defer-needed findings, commands inspected or recommended, review limits, and next recommended owner.
