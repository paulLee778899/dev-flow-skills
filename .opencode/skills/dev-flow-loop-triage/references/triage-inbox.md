# Triage Inbox Reference

## Source Order

Check sources that are available in the current environment:

1. Current Git status, uncommitted diff, and branch diff.
2. Local test/CI output supplied by the user or visible in artifacts.
3. OpenSpec/opsx change directories and task status.
4. dev-flow reports: `progress.md`, `delivery-report.md`, CR reports, `dev-flow-state.md`.
5. Issues, PRs, logs, and monitoring alerts only when explicitly available through tools or user-provided content.

Do not claim a source was checked when no tool or artifact was available.

## Candidate Inbox

Use this table in Chinese and keep it traceable:

| ID | 候选事项 | 触发信号 | 证据 | 严重度 | 置信度 | 推荐入口 | 是否需要用户确认 |
|---|---|---|---|---|---|---|---|
| L-001 | ... | failing test / stale report / diff signal | file/command/artifact | P1 | high | `/dev-flow` | yes |

Severity:

- `P0`: security/data loss/outage/destructive side effect risk.
- `P1`: likely broken build/test/user-visible regression.
- `P2`: incomplete workflow evidence, deferred verification, stale artifact, moderate risk.
- `P3`: cleanup, documentation, optional improvement.

Confidence:

- `high`: direct artifact, failing command, or exact diff evidence.
- `medium`: multiple weak signals point to the same issue.
- `low`: hint only; ask before acting.

## Route Rules

- Recommend `/dev-flow` for implementation, debugging, feature, or fix candidates after user selection.
- Recommend `/dev-flow-cr` only for independent review of an accepted/delivered diff; never run it automatically.
- Recommend `manual_action` for credentials, account setup, production action, or ambiguous destructive work.
- Recommend `external_tracker` when a task should be filed, but do not create it without authorization.
- When recommending `/dev-flow` or `/dev-flow-cr`, ask a concrete handoff question such as `是否启动 dev-flow 处理 L-001？`; if the user clearly confirms that candidate, enter the owner flow without requiring another slash command.
- Do not treat vague replies like `嗯`, `随便`, silence, or unrelated text as handoff approval.

## Trace And Eval

- Trace every scan with sources checked, sources unavailable, commands inspected, and side effects performed.
- Treat missing CI, unavailable trackers, or absent OpenSpec/dev-flow artifacts as review limits, not as clean evidence.
- Mark confidence `high` only when the evidence would let a separate checker reproduce the candidate.
- If a candidate would hand off to `/dev-flow` or `/dev-flow-cr`, recommend user confirmation as the eval checkpoint.

## Review Limits

Always state missing sources, such as unavailable CI, no issue tracker access, no OpenSpec directory, or no current diff.
