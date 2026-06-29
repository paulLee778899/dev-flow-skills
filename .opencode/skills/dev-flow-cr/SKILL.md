---
name: dev-flow-cr
description: Use when the user explicitly asks for post-acceptance code review, runs /dev-flow-cr, wants a CR report for a diff/branch/PR/change, or needs merge-readiness findings after implementation is complete.
---

# dev-flow-cr

Independent code-review command skill for user-triggered CR after the user has accepted or inspected delivered work.

## Boundary

- Run only when the user explicitly requests CR or invokes `/dev-flow-cr`; do not run automatically inside `/dev-flow`. In normal dev-flow delivery, use this after `acceptance_ready` and user acceptance/inspection.
- Stay read-only for implementation files. Writing the CR report artifact is allowed.
- Does NOT implement fixes — reports findings and routes back to dev-flow-master.
- Do not depend on private/local external skills. Use only this skill, project files, Git/OpenSpec/dev-flow artifacts, and available commands.

## Language Policy

All user-facing replies and all generated artifact documents (requirements, design, specs, CLI specs, test plans, delivery reports, and other persisted Markdown files) in dev-flow must be written in Chinese.

## Core Contract

1. Establish review scope: user-supplied diff, branch, PR, OpenSpec change, dev-flow topic, or current Git diff.
2. Load relevant persisted context when present: `delivery-report.md`, `dev-flow-state.md`, `task-orchestration.md`, `test-plan.md`, OpenSpec change artifacts, and actual Git state.
3. Review correctness, regressions, tests, security, contracts, UI/runtime risk, maintainability, migration, and release/rollback impact.
4. Write a persisted CR report.
5. Emit `cr_report_ready` with report path, scope, score, blocking status, findings by severity, evidence reviewed, and unresolved review limits.

## References

- `references/cr-scope-and-report.md`: Load before selecting scope, assigning severity, scoring, writing reports, or deciding whether findings block merge/release.

## Required Signal

```yaml
cr_report_ready:
  producer: dev-flow-cr
  report_path: <path to persisted CR report>
  review_scope: <diff | branch | PR | change | topic>
  evidence_reviewed: <list>
  score: <0-100>
  status: cr_passed | cr_blocked | cr_needs_defer_decision
  p0_count: <integer>
  p1_count: <integer>
  p2_count: <integer>
  p3_count: <integer>
  blocking_findings: [list or none]
  defer_needed_findings: [list or none]
  commands_inspected_or_recommended: [list or none]
  review_limits: [list or none]
  next_recommended_owner: <owner or none>
```
