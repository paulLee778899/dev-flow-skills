# Flow And Recovery Reference

## Table of Contents

- [When to Use](#when-to-use)
- [Flow Structure](#flow-structure)
- [Stage Order](#stage-order)
- [Existing Change / Spec Check](#existing-change--spec-check)
- [Progress Queries](#progress-queries)
- [Context Recovery Protocol](#context-recovery-protocol)
- [Guardrails](#guardrails)

## When to Use

以下触发场景仅供参考，不作为路由决策的规范来源。路由分类的权威定义在 `dev-flow-intent/references/classification-reference.md`。

Use this skill when the user asks for dev-flow or when a development request may need dev-flow routing, for example:

- “先按规范走一下”
- “先做需求分析/设计”
- “先别写代码，先把流程定下来”
- “按 OpenSpec 流程来”
- “先出文档再开发”
- “这次要不要走完整流程？”
- “看一下 dev flow / 按 dev flow 执行”
- “修一下这个报错 / 测试挂了”
- “帮我 review 一下”
- “这个页面/交互/布局调整一下”
- “刚才那个需求改成另一种”

Do not force the governed document path for a tiny one-file fix, a simple explanation request, or direct continuation of an already approved stage where a more specific skill applies. The master may still be used briefly to classify and route those requests.

## Flow Structure

```text
Entry
  dev-flow-master: existing context check + dev-flow-intent + route

Specialized routes
  dev-flow-debugging: root-cause-first debugging route
  dev-flow-ui-ux: user-facing UI/UX route with runtime verification expectations
  dev-flow-review: read-first findings route

Planning
  dev-flow-planning: pre-artifact clarification + user approval → OpenSpec/opsx artifacts + independent checker → [OpenSpec Baseline Gate] → task orchestration/test matrix
  dev-flow-git: Git mode proposal before Phase 2 Gate
  → [Phase 2 Gate]

Execution
  dev-flow-execution ↔ dev-flow-git
  continuous execution + dynamic replanning until hard-stop or completion

Acceptance
  dev-flow-acceptance: final checks + delivery report + readiness
```

A phase gate is never a soft stop. OpenSpec Baseline Gate and Phase 2 Gate require explicit user consent. After Phase 2 Gate is cleared, Phase 3 is run-to-completion except for hard-stop conditions defined in `dev-flow-execution` and `dev-flow-git`.

## Stage Order

1. Existing change/spec check
2. Intent classification — load `dev-flow-intent`
3. Route selection — master emits `routing_decided`
4. Complexity routing and path selection — master internal for routes that proceed to implementation
5. For all implementation work: route to the OpenSpec/opsx artifact path; focused route owners may execute or verify only inside that artifact workflow, never instead of it
6. If medium/heavyweight: load `dev-flow-planning`
7. Pre-artifact clarification and artifact-start approval — `dev-flow-planning`
8. OpenSpec/opsx baseline artifacts, independent checker review, and OpenSpec Baseline Gate — `dev-flow-planning`
9. Task orchestration, detailed Executable Test Matrix, system-level checks, and orchestration checker — `dev-flow-planning`
10. Git mode preparation — `dev-flow-git`
11. Phase 2 Gate — explicit user approval before execution
12. TDD execution and dynamic replanning — `dev-flow-execution`; Git decisions through `dev-flow-git`
13. Acceptance — `dev-flow-acceptance`
14. Completion gate — master checks acceptance evidence and reports final state

**Loop-authorized phase entry:** when dev-flow receives a confirmed loop-authorized phase handoff (all five conditions in `routing-and-complexity.md §Loop-Authorized Phase Mode` are verified), entry begins at step 6 with the loop context already established. Steps 1–5 are replaced by verifying the loop signals; steps 8 and 11 skip the interactive user gate (see loop-authorized exception in `state-and-gates.md`). Record the loop authorization in `dev-flow-state.md` before proceeding.

Continue-by-default rule:

- Stage completion is an internal control point, not a default user-facing stop point.
- If the next stage is executable without new user input, continue automatically.
- Exceptions: OpenSpec Baseline Gate and Phase 2 Gate always require explicit user approval, unless the loop-authorized exception applies.
- During Phase 3, never stop after a task, batch, progress update, patch-ready output, or automatic replan if execution can safely continue.

## Existing Change / Spec Check

Before opening a new governed flow, check for relevant existing OpenSpec/change/spec context:

- active change
- relevant proposal/design/tasks/spec
- signals that the request continues an existing thread

If relevant context exists, prefer continuing or updating it instead of blindly creating a new path.

## Progress Queries

When the user asks “进度怎么样 / 状态 / 到哪了 / 还剩多少”, read `dev-flow-state.md` and `progress.md` if they exist, reconcile them with actual state, and answer in Chinese. If the workflow is still before persisted state creation, summarize the current stage verbally and say that no governed state file exists yet.

## Context Recovery Protocol

When a dev-flow session resumes, context was compacted, a new session starts, or the agent is unsure whether memory is stale, do not continue from chat memory.

Before any new planning, execution, Git, or acceptance action, reload or re-read:

1. `dev-flow-master`
2. the current phase skill: `dev-flow-planning`, `dev-flow-execution`, `dev-flow-git`, or `dev-flow-acceptance`
3. canonical `dev-flow-state.md` if present
4. canonical `progress.md` if present
5. canonical `task-orchestration.md` if present
6. OpenSpec/opsx artifacts and canonical `test-plan.md` if present
7. relevant requirement/design artifacts if planning or requirement-change state is involved
8. actual Git/filesystem state
9. if `dev-flow-state.md` records `loop_authorized: true`: also load the loop artifact directory's `loop-state.md` and re-verify all of the following before continuing — `loop_baseline_ready` (baseline_status must still be `user_confirmed`), `loop_control_ready` (check `loop_id`, `auto_continue_scope`, `envelope_required`), `loop_envelope_ready` (check budget remaining, `dev_flow_phase_handoff`, `auto_continue_scope`), confirmed loop-only baseline artifact paths, and the current Loop Phase DAG node — do not treat the session as a fresh dev-flow entry

Recovery rules:

- If `dev-flow-state.md` records an unresolved gate, missing approval, stale signal, or required repair, resume that recovery point before planning, execution, Git, or acceptance.
- If `progress.md` says a requirement change, stale task, failed task, skipped task, rollback, pause, or gate re-entry is pending, resume at that recovery point instead of dispatching new work.
- If `dev-flow-state.md`, `task-orchestration.md`, and `progress.md` disagree, route to the current phase owner to reconcile before continuing. If the phase owner cannot reconcile the disagreement after one attempt, emit a hard-stop. Present the user with: (1) what each source (Git/fs vs persisted files) says, (2) which source is authoritative per the priority chain, and (3) a recommendation. Do not attempt recursive re-routing.
- If actual Git/filesystem state contradicts persisted artifacts, actual state is highest priority and must be reconciled into `progress.md` before continuing.
- Chat memory is lowest priority and must not override persisted artifacts or actual state.

## Guardrails

- Do not replace opsx, OpenSpec, or superpowers; route to them when they own the work.
- Do not force heavy orchestration for every request; use the classification matrix.
- Do not advance past OpenSpec Baseline Gate or Phase 2 Gate without explicit user approval.
- Do not let the main agent self-approve gate-impacting scores, phase_eval, or readiness. Use independent checker subagents with raw artifacts.
- Do not hide the Phase 3 execution mode; show the proposed execution actor and any concurrency/worktree approval needed before asking for Phase 2 approval.
- Do not dispatch execution agents before Phase 2 Gate is cleared.
- Do not claim completion before system-level checks, requirements/design/test coverage, independent acceptance checker evidence, and `dev-flow-acceptance` evidence satisfy the Completion Gate.
- Do not run `/dev-flow-cr` automatically; it is a separate user-triggered command after user acceptance.
- Do not perform external side effects, destructive Git actions, pushes, PRs, merges, production operations, or paid-service actions without the authorization rules in `dev-flow-git`.
