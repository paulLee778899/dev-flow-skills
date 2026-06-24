---
description: Run independent post-acceptance code review through dev-flow-cr.
---

# Dev Flow CR

Use this command as the Codex slash-command entrypoint for independent Dev Flow code review.

## Workflow

1. Use the `dev-flow-cr` skill as the owner.
2. Treat the argument after `/dev-flow-cr` as the review scope when provided.
3. If no scope is provided, inspect the current Git diff first, then branch diff, then nearby dev-flow/OpenSpec artifacts.
4. Review actual code state plus relevant persisted evidence.
5. Write a CR report artifact and emit `cr_report_ready`.

## Rules

- Run only because the user invoked this command or explicitly requested CR.
- Do not modify implementation files, tests, configs, generated assets, Git history, or dev-flow delivery artifacts.
- Do not run as an automatic `/dev-flow` stage.
- Do not depend on local/private external skills.
- If fixes are requested after CR, return to `dev-flow-master` for routing.

## User Request

Apply the independent CR workflow above to the user's current request and any arguments supplied after `/dev-flow-cr`.
