# Routing And Complexity Reference

## Table of Contents

- [Core Skill Boundaries](#core-skill-boundaries)
- [Loop-Authorized Phase Mode](#loop-authorized-phase-mode)
- [Intent Classification](#intent-classification)
- [Complexity Classification](#complexity-classification)
- [Lightweight OpenSpec / opsx Contract](#lightweight-openspec--opsx-contract)

## Core Skill Boundaries

Dev-flow owns routing, governance, persisted artifacts, handoffs, and evidence contracts. It should not duplicate mature external skill workflows when they are available.

Reuse policy:

- Superpowers workflow skills are stable process dependencies. When a stage lists a required Superpowers sub-skill, load and follow that skill first, then adapt the result into dev-flow's signals, reports, gates, and artifacts.
- Other installed or marketplace skills may be used when available, but dev-flow must not hard-depend on them unless they are part of the current environment. Copy or absorb their useful handling patterns into the focused dev-flow skill so the route still works when those skills are absent.

| Area | Skill | Owns |
|---|---|---|
| Global dispatch | `dev-flow-master` | entrypoint, final route selection, phase gates, signal checks, progress routing |
| Intent classification | `dev-flow-intent` | task type, secondary types, risk flags, recommended route, required protocols |
| Debugging | `dev-flow-debugging` | reproduction, evidence gathering, root-cause diagnosis, fix discipline, regression recommendation |
| UI/UX | `dev-flow-ui-ux` | user-facing UI route, browser/runtime verification expectations, responsive/interaction evidence |
| Review | `dev-flow-review` | read-first review stance, findings-first output, risk and test-gap reporting |
| Planning | `dev-flow-planning` | OpenSpec/opsx baseline artifacts, independent checker review, DAG, `task-orchestration.md`, detailed Executable Test Matrix |
| Execution | `dev-flow-execution` | Phase 3 run-to-completion, task settlement, Runtime Orchestration State, dynamic replanning, failure handling, progress updates |
| Git safety | `dev-flow-git` | worktree/branch modes, PR/direct/patch-ready modes, permissions, conflicts, rollback, cleanup |
| Acceptance | `dev-flow-acceptance` | final regression, quality evidence, delivery report, acceptance readiness |
| Code review | `dev-flow-cr` | Post-acceptance independent CR; user-triggered only via /dev-flow-cr; produces cr_report_ready signal |
| Loop engineering | `dev-flow-loop` | User asks for loop engineering, outer loop control, recurring/repeated agent workflow design, delivery loop baseline/DAG control, loop scope review, automation proposal governance, loop evidence review, or deciding how an outer loop should hand off phase execution to dev-flow | Phase implementation, scheduler mutations, Git/external side effects |
| Loop triage | `dev-flow-loop-triage` | User asks to scan, triage, or monitor repo/CI/diff/issues/dev-flow artifacts to build a candidate inbox without modifying files | Direct fixes, code changes, scheduler creation |
| Loop envelope | `dev-flow-loop-envelope` | User needs to define budget, permissions, cadence, stop conditions, or safety limits for a repeated/scheduled/background loop before it runs | Candidate scanning, implementation, scheduler mutations |
| Scheduler | `dev-flow-scheduler` | User asks to create, update, view, pause, resume, or delete scheduled/recurring automations, heartbeat follow-ups, cron scans, or timed triage tasks | Loop logic design, implementation, running dev-flow phases |

> **Loop engineering direct invocation note:** Loop engineering skills are invoked directly via `/dev-flow-loop`, `/dev-flow-loop-triage`, `/dev-flow-loop-envelope`, or `/dev-flow-scheduler`. They are not routed through `dev-flow-intent` classification while designing, triaging, or approving the loop. Read-only triage and automation proposal scopes do not enter dev-flow phase gates. A delivery loop may hand a confirmed Loop Phase DAG node to dev-flow after Baseline Docs Gate and Execution Envelope Gate are approved; the agent should preserve the loop signal path in the initial dev-flow intent description to keep the handoff traceable.

Required loading rule: before stage-specific work, load the skill that owns that stage. Every new entry request must load `dev-flow-intent` before complexity classification unless the request is an explicit continuation inside a known phase and the current phase owner is already unambiguous. If areas overlap, the owner in the table above is authoritative. In particular, Git side effects are owned by `dev-flow-git`; execution may reference Git mode but must not invent Git permissions.

## Loop-Authorized Phase Mode

This mode applies only when all evidence exists:

- `loop_baseline_ready.baseline_status: user_confirmed`
- confirmed requirements, high-level design, detailed design, and test plan (`test-plan.md`) paths
- Loop Phase DAG node for the current phase
- `loop_envelope_ready` allows `auto_continue_scope: within_confirmed_baseline` and `dev_flow_phase_handoff`
- the phase objective is inside the confirmed baseline

In this mode:

- dev-flow is the phase executor, not the loop controller.
- Preserve the loop ID, loop-only baseline artifact paths, phase ID, and envelope limits in `intent_decided` / `routing_decided`.
- Do not recreate the full loop-only baseline artifacts or ask the user to re-confirm the same global requirements.
- Use phase-level OpenSpec/opsx artifacts for phase requirements/tasks/spec deltas and implementation evidence.
- Use `dev-flow-planning` to create the phase-internal task DAG, detailed Executable Test Matrix, and system-level checks.
- Use `dev-flow-execution` to run TDD per task via `superpowers:test-driven-development` when available.
- Use `dev-flow-acceptance` to produce phase acceptance evidence for the loop eval.

Exit this mode and return to the loop/user when:

- the phase changes baseline requirements, acceptance, non-goals, API/protocol/data/security/release boundary, or test strategy
- the envelope budget or auto-continue scope is exhausted
- a side effect requires user approval
- `phase_eval` says the issue is not repairable inside baseline

## Intent Classification

Before forcing the governed path, load `dev-flow-intent` and obtain `intent_decided`.

`dev-flow-intent` may recommend these task types:

| Task type | Primary owner after master routing | Route behavior |
|---|---|---|
| `debugging` | `dev-flow-debugging` | Reproduce, gather evidence, find root cause, then route fix by complexity |
| `feature` | `dev-flow-master` -> planning/execution owners | Use the normal complexity matrix and governed/lightweight path mapping |
| `change-adjustment` | `dev-flow-master` + current phase owner | Recover context, classify baseline impact, re-enter OpenSpec Baseline Gate when the requirement baseline changes, or Phase 2 Gate when only orchestration or design changes |
| `review` | `dev-flow-review` | Read-first, findings-first; do not edit unless user asks for fixes |
| `ui-ux` | `dev-flow-ui-ux` | UI/UX-specific design and runtime verification, then normal gates if medium or heavyweight |
| `status-recovery` | `dev-flow-master` | Reload persisted progress/orchestration/test/Git state before answering or continuing |
| `question` | no governed owner by default | Answer directly or do read-only analysis unless user asks to enter dev-flow |
| `loop_engineering` | direct loop skill invocation | Bypass intent classification for loop design/triage/envelope/scheduler work. Do not enter dev-flow phases from unconfirmed triage. In loop-authorized phase mode, hand the confirmed phase to dev-flow planning/execution without redoing the global baseline. |

Tie-breaker rule:

- `loop_engineering` wins when the user invokes a loop slash command directly; skip `dev-flow-intent` classification entirely.
- `change-adjustment` wins when the user modifies an active or recently approved baseline.
- `review` wins when the user asks to evaluate rather than implement.
- `debugging` wins when the request is about broken behavior, even if the broken surface is UI.
- `ui-ux` wins when the main success criterion is user-facing presentation or interaction quality.
- `feature` is the default implementation route after more specific task types are excluded.

Master must convert `intent_decided` into `routing_decided`; no other skill may declare the route final.

## Complexity Classification

Classify before forcing a heavy path. Classification is an internal master decision, not a separate user gate.

| Dimension | Lightweight signal | Medium signal | Heavyweight signal |
|---|---|---|---|
| Files / modules | one known file or one narrow artifact | 2–5 files or 2–3 bounded modules | new module, cross-cutting module set, or unclear file spread |
| Behavior change | no externally visible behavior change, or tiny copy/config change | bounded feature or behavior change with clear acceptance criteria | new workflow, major behavior redesign, or multiple user/system journeys |
| Data / API / protocol | no schema/API/protocol contract change | small API/data shape change with limited consumers | database migration, public API/protocol, SDK, webhook, MQ, or compatibility impact |
| Security / permissions | none | localized validation or permission check | auth, authorization, secrets, external boundary, abuse prevention, or sensitive data |
| UI / runtime surface | none or tiny static text/style change | bounded UI flow or component behavior | multi-page flow, responsive/accessibility-critical UI, upload/download, browser runtime risk |
| Test surface | existing obvious related tests only | new unit/integration tests or limited E2E | multi-layer regression, performance/security/browser/API contract testing |
| Rollback / release risk | trivial revert | local rollback possible | migration, deployment, rollback, compatibility, or release sequencing required |

Routing rule:

- If every applicable dimension is lightweight, classify as **lightweight**.
- If any dimension is heavyweight, classify as **heavyweight** unless existing change/spec context proves the risk is already bounded.
- Otherwise classify as **medium**.
- If key information is unknown, inspect repo/spec context first. If still unknown and uncertainty affects safety, choose the higher-risk classification rather than under-governing.

**Risk flag upgrade rule**: If `intent_decided` carries any of the following risk flags — `security`, `api_contract`, `data_migration`, or `release_ops` — treat the complexity of the affected dimension as at least `medium`, regardless of file-count or line-count heuristics, unless existing context explicitly demonstrates the risk is already bounded (e.g., change is isolated behind a feature flag, or migration is a no-op rollback). This prevents security-sensitive small changes from being misclassified as lightweight.

Path mapping:

- **Lightweight** → OpenSpec/opsx artifact path with TDD, focused verification, `/opsx:apply`, `/opsx:verify`, and acceptance evidence.
- **Medium** → OpenSpec/opsx artifact path plus `dev-flow-planning` for independent checker review, DAG, detailed test matrix, Git safety, and system-level checks.
- **Heavyweight** → OpenSpec/opsx artifact path plus `dev-flow-planning` with explicit risk, rollback/release, integration-test, system-level test, quality-evidence, and independent checker treatment before execution.

### OpenSpec / opsx Contract

All implementation work must use persisted OpenSpec/opsx artifacts. It must not end as chat-only discussion or as an ad hoc local note when code, config, tests, or user-visible behavior changed.

Use this contract:

- owner: `dev-flow-master` routes; the focused route owner or main agent performs the change.
- artifact workflow: use the active project's OpenSpec/opsx change workflow, normally `/opsx:ff <change>` to create required artifacts, `/opsx:apply <change>` to implement, and `/opsx:verify <change>` to verify against artifacts. If a change already exists, use `/opsx:continue` when a change is already in-progress in OpenSpec, `/opsx:apply` to implement a finalized spec, or `/opsx:verify` to confirm an already-implemented change matches its spec.
- required artifact evidence: change directory, generated artifact list, task/proposal/spec/design evidence as produced by the active OpenSpec schema, implementation status, verification output, Git/patch state, and unresolved risks.
- TDD: every behavior-changing implementation task, including lightweight work, must record RED/GREEN/refactor evidence or an explicit user-approved exception.
- checker rule: any score, gate pass/fail, phase_eval, or readiness judgment must be reviewed by an independent checker subagent using raw artifacts.
- Git boundary: use `dev-flow-git` before staging, committing, pushing, opening PRs, merging, rollback, or destructive actions.
- verification: run the smallest command or manual/runtime check that proves the requested behavior; record skipped checks with reason.
- medium/heavy extras: create `task-orchestration.md`, detailed Executable Test Matrix, system-level acceptance checks, and Git safety evidence before execution.
- fallback: if OpenSpec/opsx support is absent, missing from the project, or not initialized, do not silently replace it with a handwritten local note. Report the blocker and ask the user to initialize/install OpenSpec/opsx or explicitly exit dev-flow. A direct change without OpenSpec/opsx artifacts is not a dev-flow delivery path.

Required routing output to the user:

```text
任务类型：<debugging|feature|change-adjustment|review|ui-ux|status-recovery|question>
复杂度：<轻量|中量|重量|不适用>
依据：<2-4 个关键维度或意图证据>
路径：<focused route | opsx/OpenSpec artifact | governed planning path | direct answer/read-only>
下一步：<具体阶段>
```

The routing summary block above is a required output whenever `routing_decided` is emitted. See `state-and-gates.md` for the full signal schema.
