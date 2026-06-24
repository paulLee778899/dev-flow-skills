---
description: Run independent post-acceptance code review through dev-flow-cr
---

Enter independent Dev Flow CR.

Use `dev-flow-cr` as the owner for post-acceptance code review after the user explicitly asks for CR or invokes `/dev-flow-cr`.

---

**Input**: The argument after `/dev-flow-cr` is the review scope, such as a diff, branch, PR, OpenSpec change, dev-flow topic, or free-form instruction.

Examples:

- `/dev-flow-cr`
- `/dev-flow-cr review current diff`
- `/dev-flow-cr 审查这个 OpenSpec change`

---

## What This Command Does

`/dev-flow-cr` is a thin independent CR command.

It should:

1. Enter the `dev-flow-cr` skill.
2. Determine review scope from the command argument or current Git/dev-flow/OpenSpec state.
3. Review actual code state and relevant persisted evidence.
4. Write a CR report artifact.
5. Emit `cr_report_ready`.

It should not:

- run automatically as part of `/dev-flow`
- Do not run as an automatic `/dev-flow` stage.
- modify implementation files or Git history
- depend on private/local external skills
- fix findings unless the user separately asks for implementation routing

---

## Expected Behavior

If no scope is supplied, inspect the current uncommitted Git diff first. If no diff exists, inspect branch diff and nearby dev-flow/OpenSpec artifacts. Ask for scope only when no reviewable target can be determined.

Write findings in Chinese with severity, issue, impact, evidence, recommendation, and status. Include a numeric score and whether the CR is `cr_passed`, `cr_blocked`, or `cr_needs_defer_decision`.
