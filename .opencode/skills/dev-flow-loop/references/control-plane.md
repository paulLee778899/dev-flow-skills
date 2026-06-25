# Loop Control Plane Reference

## Scope Types

| Scope | Use for | Output |
|---|---|---|
| `workflow_design` | Designing a new outer loop, automation, or harness behavior. | Loop envelope proposal and risk list. |
| `repository_triage` | Scanning repo/CI/diff/issues/OpenSpec/dev-flow artifacts. | Candidate inbox and next-route recommendations. |
| `completed_run_review` | Reviewing a finished dev-flow run or delivery report. | Loop-quality score and improvement suggestions. |
| `automation_proposal` | Preparing a recurring/background loop for user approval. | Envelope, schedule proposal, and route to `dev-flow-scheduler`. |
| `dispatch_handoff` | Turning a candidate into a user-confirmed `/dev-flow` or `/dev-flow-cr` flow. | Handoff question and candidate summary. |

## Loop Primitives

| Primitive | Meaning | Requirement |
|---|---|---|
| `goal` | The single outcome the loop is trying to improve or detect. | Keep it one sentence and measurable enough to evaluate. |
| `trigger` | How the loop starts: manual request, heartbeat, schedule, external event, or background monitor. | Treat every non-manual trigger as envelope-required and approval-required. |
| `trace` | The evidence trail of what was inspected, what was recommended, and what was deliberately not done. | Record artifacts, commands, unavailable sources, and side effects. |
| `eval` | The checkpoint that decides whether the loop result is good enough. | Use score, candidate confidence, missing-evidence limits, and boundary checks. |
| `maker-checker` | Separate proposal from review. | Use one pass to produce candidates/envelope and a separate pass to check safety before handoff. |
| `handoff` | A user-readable next action for `/dev-flow`, `/dev-flow-cr`, `/dev-flow-scheduler`, manual action, or tracker work. | Ask a concrete confirmation question; after explicit candidate confirmation, enter the owner flow without requiring another slash command. |

## Evidence Order

Use actual artifacts before memory:

1. Git/filesystem state, including current diff and branch.
2. CI/test output when available.
3. OpenSpec/opsx change artifacts.
4. dev-flow artifacts: `dev-flow-state.md`, `progress.md`, `task-orchestration.md`, `delivery-report.md`, CR reports.
5. Loop artifacts when explicitly present: loop report, envelope, candidate inbox, trace log, eval notes.
6. Issue/PR/tracker data when explicitly available.
7. Chat memory as a hint only.

## Route Recommendations

| Recommended route | Meaning |
|---|---|
| `none` | No actionable loop item found. |
| `ask_user` | User decision is required before any workflow starts. |
| `/dev-flow` | Candidate should be handled by normal dev-flow execution after user confirmation. |
| `/dev-flow-cr` | Candidate is review-only and user should explicitly run CR. |
| `/dev-flow-scheduler` | User wants to create or manage an approved automation. |
| `manual_action` | Human action outside dev-flow is safer. |
| `external_tracker` | Record or update an external issue/task; do not do it unless authorized. |

## Handoff Confirmation

Valid handoff confirmation must name a specific candidate or route. Examples: `启动 L-001`, `处理第一个`, `用 dev-flow 做 L-002`, or `创建这个定时任务`. Do not treat silence, `随便`, `嗯`, or unrelated replies as approval.

## Scoring

Start at 100 and subtract:

- 25: loop proposal could write code, commit, push, open PR, or call external systems without explicit user approval.
- 20: loop is confused with `/dev-flow` stages or emits delivery-stage signals.
- 15: no envelope for recurring, scheduled, background, or persistent loops.
- 15: loop creates, updates, pauses, resumes, or deletes schedulers instead of routing to `dev-flow-scheduler`.
- 10: recommendations are not backed by artifacts.
- 10: no stop condition, retry limit, or budget boundary.
- 5: no trace/eval evidence for a loop recommendation.
- 5: no maker-checker review before recommending a handoff from automation proposal to execution.
- 5: no concrete handoff question for `/dev-flow`, `/dev-flow-cr`, or `/dev-flow-scheduler` recommendation.
- 5: report omits review limits or unresolved risks.

Scores below 95 require revision before recommending persistent automation.

## Report Shape

```text
## Loop Engineering Review
- Scope:
- Goal:
- Trigger:
- Evidence:
- Trace/eval evidence:
- Score:
- Side effects performed: none
- Handoff question:
- Recommended next route:
- Risks:
- Review limits:
```
