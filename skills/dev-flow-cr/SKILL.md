---
name: dev-flow-cr
description: Use when the user explicitly asks for post-acceptance code review, runs /dev-flow-cr, wants a CR report for a diff/branch/PR/change, or needs merge-readiness findings after implementation is complete.
---

# dev-flow-cr

Independent code-review command skill for user-triggered CR after the user has accepted or inspected delivered work. All user-facing replies in dev-flow are Chinese.

## Boundary

- Run only when the user explicitly requests CR or invokes `/dev-flow-cr`; do not run automatically inside `/dev-flow`.
- Stay read-only for implementation files. Writing the CR report artifact is allowed.
- If the user asks to fix findings, return to `dev-flow-master` for implementation routing.
- Do not depend on private/local external skills. Use only this skill, project files, Git/OpenSpec/dev-flow artifacts, and available commands.

## Workflow

1. Establish review scope: user-supplied diff, branch, PR, OpenSpec change, dev-flow topic, or current Git diff.
2. Load relevant persisted context when present: `delivery-report.md`, `dev-flow-state.md`, `task-orchestration.md`, `test-plan.md`, OpenSpec change artifacts, and actual Git state.
3. Review correctness, regressions, tests, security, contracts, UI/runtime risk, maintainability, migration, and release/rollback impact.
4. Write a persisted CR report.
5. Emit `cr_report_ready` with report path, scope, score, blocking status, findings by severity, evidence reviewed, and unresolved review limits.

Read `references/cr-scope-and-report.md` before selecting scope, assigning severity, scoring, writing reports, or deciding whether findings block merge/release.
