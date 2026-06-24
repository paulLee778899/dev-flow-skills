---
name: dev-flow-review
description: Use when the user asks to review code, inspect a diff, evaluate implementation quality, assess risks, find bugs, check tests, review a plan, or provide feedback before making changes.
---

# dev-flow-review

Own read-first review behavior when the user asks for evaluation rather than implementation. All user-facing replies in dev-flow are Chinese.

## Boundary

Do not modify files unless the user explicitly asks to implement fixes after the review. If fixes are requested, return to `dev-flow-master` for routing because the fix may be debugging, feature work, change-adjustment, or UI/UX.

When reviewing dev-flow skills, plans, docs, or command entrypoints, recommend concrete contract changes but remain read-only until asked to apply them.

## Review Stance

Prioritize bugs, regressions, missing tests, broken contracts, security issues, and deployment risks. Findings come before summaries. Use concrete file/line evidence where possible.

Read `references/review-format.md` before conducting the review, assigning severity, or producing the findings-first output.
