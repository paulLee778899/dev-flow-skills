---
name: dev-flow-review
description: Use when the user asks to review code, inspect a diff, evaluate implementation quality, assess risks, find bugs, check tests, review a plan, or provide feedback before making changes.
---

# dev-flow-review

Own read-first review behavior when the user asks for evaluation rather than implementation.

## Boundary

Do not modify files unless the user explicitly asks to implement fixes after the review. If fixes are requested, return to `dev-flow-master` for routing because the fix may be debugging, feature work, change-adjustment, or UI/UX.

When reviewing dev-flow skills, plans, docs, or command entrypoints, recommend concrete contract changes but remain read-only until asked to apply them.

### Mutual Exclusion: dev-flow-review vs dev-flow-cr

- `dev-flow-review`: invoked for pre-implementation evaluation, read-only assessment before changes are made, or when the user asks for feedback/opinion on code, a plan, or a diff WITHOUT having completed acceptance.
- `dev-flow-cr`: invoked ONLY after `acceptance_ready` has been emitted for the current work, or when the user explicitly runs `/dev-flow-cr`.
- Tiebreaker: if both could apply, check whether `acceptance_ready` signal exists in `dev-flow-state.md` for the current work — if yes, use `dev-flow-cr`; if no, use `dev-flow-review`.

## Language Policy

All user-facing replies and all generated artifact documents (requirements, design, specs, CLI specs, test plans, delivery reports, and other persisted Markdown files) in dev-flow must be written in Chinese.

## Core Contract

Prioritize bugs, regressions, missing tests, broken contracts, security issues, and deployment risks. Findings come before summaries. Use concrete file/line evidence where possible.

Read `references/review-format.md` before conducting the review, assigning severity, or producing the findings-first output.

## References

Load `references/review-format.md` for output format, severity taxonomy, and P0–P3 definitions.

## Required Signal

On completion, emit this signal inline in the review output for the requesting agent to consume. This signal is NOT registered in `dev-flow-state.md`.

```yaml
review_complete:
  producer: dev-flow-review
  timestamp: <ISO-8601>
  scope: <what was reviewed>
  p0_count: <integer>
  p1_count: <integer>
  p2_count: <integer>
  p3_count: <integer>
  open_questions: [list or none]
  recommendation: proceed | proceed_with_notes | block
```
