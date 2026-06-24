# State And Gates Reference

## Table of Contents

- [State and Gate Signal Protocol](#state-and-gate-signal-protocol)
- [Stage Ownership Matrix](#stage-ownership-matrix)
- [Phase Gates](#phase-gates)
- [Completion Gate](#completion-gate)

## State and Gate Signal Protocol

Stage skills may perform stage-specific work, but the master is the only component allowed to declare a governed stage complete.

### Canonical State Files

Governed work must maintain persisted state from the first planning gate onward:

- `dev-flow-state.md`: canonical signal and gate ledger for the workflow.
- `progress.md`: execution progress and recovery ledger, created no later than Phase 2 approval and earlier when planning state must survive interruption.

Canonical location is `Docs/<topic>/` or `docs/<topic>/` beside the governed documents. If a legacy flat artifact set already exists, keep using that legacy location and record the chosen path in `dev-flow-state.md`.

`dev-flow-state.md` must record every signal below with: signal name, producer, timestamp or ordering marker, evidence paths, gate status, user approval text where applicable, and stale/repair notes. Chat memory is never sufficient evidence for a governed signal or user approval.

| Signal | Produced by | Required evidence |
|---|---|---|
| `intent_decided` | `dev-flow-intent` | task type, secondary types, confidence, evidence, risk flags, recommended route, required protocols |
| `routing_decided` | `dev-flow-master` | intent result, classification, key dimensions, chosen path, next owner, next stage |
| `documentation_start_approved` | `dev-flow-planning` | user confirmed document drafting should begin, clarification answers or accepted unknowns, review mode |
| `planning_docs_ready` | `dev-flow-planning` | four document paths, requirement variant, review mode, design sufficiency result, known risks |
| `task_orchestration_ready` | `dev-flow-planning` | `task-orchestration.md`, DAG/batches, Executable Test Matrix, automation readiness result |
| `lightweight_artifact_ready` | `dev-flow-master` or focused route owner | OpenSpec change ID/path, schema, generated artifact list, required apply artifacts, and `/opsx:ff` or `/opsx:continue` status |
| `opsx_apply_complete` | focused route owner or main agent | applied tasks, implementation status, changed files, task checkbox state, and Git/patch state |
| `opsx_verify_complete` | focused route owner or main agent | `/opsx:verify <change>` output, skipped checks with reasons, unresolved risks, and readiness recommendation |
| `git_safe` | `dev-flow-git` | isolation mode, integration mode, permission/capability result, side-effect boundary |
| `execution_actor_decided` | `dev-flow-master` | default multi-agent/subagent execution mode shown at Phase 2 Gate, plus any user override |
| `ui_ux_report` | `dev-flow-ui-ux` | target surface, runtime/browser evidence or blocked reason, interaction/responsive/accessibility result |
| `review_evidence_ready` | `dev-flow-execution` or `dev-flow-acceptance` | task self-review or code review evidence for integrated work |
| `execution_settled` | `dev-flow-execution` | batch/task status, Runtime Orchestration State summary, replan history, test/diagnostic evidence, unresolved blockers |
| `acceptance_ready` | `dev-flow-acceptance` | final test results, quality evidence, delivery report path, Git/patch states, unresolved follow-ups |

Gate rules:

- Do not enter governed planning without `routing_decided` choosing the governed path.
- Do not draft the four planning documents without `documentation_start_approved`.
- Do not present Phase 1 Gate as ready without `planning_docs_ready`.
- Do not present Phase 2 Gate as ready without `task_orchestration_ready` and `git_safe`.
- Do not execute lightweight code/config/test/user-visible changes until `lightweight_artifact_ready` records the OpenSpec/opsx change context.
- Do not accept lightweight work until `opsx_apply_complete` and `opsx_verify_complete` are recorded.
- Do not enter Phase 3 until Phase 2 Gate has presented the default execution actor and recorded `execution_actor_decided`.
- Do not enter acceptance until execution reports all batches completed, user/gate-accepted as deferred, or replanned under `execution_settled`.
- Do not report `ready-to-report` without `acceptance_ready`.

If a signal is missing, stale, or contradicted by actual Git/filesystem/task state, route back to the owning skill for repair before advancing. Chat memory is never sufficient evidence.

## Stage Ownership Matrix

| Stage / Activity | Primary owner | Sub-agent allowed? | Required skill / constraint |
|---|---|---|---|
| Existing change/spec check | Main agent | No | Routing judgment only |
| Intent classification | Main agent | No | Load `dev-flow-intent`; master emits final route |
| Complexity routing | Main agent | No | Master classification after `intent_decided` |
| Planning path selection | Main agent | No | Master internal routing |
| Review-mode decision | Main agent + user | No | `dev-flow-planning` |
| Brainstorming handoff | Main agent coordinating brainstorming | Yes, only through required brainstorming path | `dev-flow-planning` |
| Four Chinese docs | Main agent | No | `dev-flow-planning`; must persist local files |
| Phase 1 gate | Main agent + user | No | Mandatory explicit approval |
| Task orchestration | Main agent | No | `dev-flow-planning`; write DAG/test matrix |
| Phase 2 gate | Main agent + user | No | Mandatory explicit approval; resolve Git modes via `dev-flow-git` |
| Phase 3 execution | Main agent + task agents | Yes | `dev-flow-execution`; task agents implement only assigned scope |
| Git operations | Main agent / task agent within approved mode | Yes within task scope | `dev-flow-git`; no unauthorized side effects |
| Acceptance | Main agent | No | `dev-flow-acceptance` |
| Completion gate | Main agent | No | `dev-flow-acceptance` evidence + master final decision |

Ownership rules:

- If a stage is marked “Main agent,” do not delegate its governance decision to a task sub-agent.
- A task sub-agent may implement only its assigned task; it must not rewrite orchestration, alter gates, or change dependency status.
- Dynamic replanning is execution-internal and owned by `dev-flow-execution`; it is not a user-facing stage.

## Phase Gates

### Phase 1 Gate

After `dev-flow-planning` produces and persists the four planning documents, stop and present:

- generated document paths
- requirement variant: product or software
- review mode applied
- design sufficiency result
- accepted known risks
- next step: task orchestration

Do not enter task orchestration until the user explicitly approves with “同意”, “开始”, “继续”, “proceed”, “go ahead”, “实施”, or equivalent.

### Phase 2 Gate — Task Orchestration and Git Safety

After `dev-flow-planning` writes `task-orchestration.md` and `dev-flow-git` emits `git_safe`, stop and present:

- task count, batch count, execution order, key dependencies
- parallel-safety summary: file/symbol overlap risks and any forced-serial tasks
- max concurrent agent cap
- Git isolation mode, integration mode, and writer concurrency limit
- automation readiness status and blockers
- execution mode, presented in Chinese:
  - `执行方式：默认使用 multi-agent/subagent 执行；主 agent 负责任务调度、Git 边界、验证、进度同步和最终集成。若 Git 安全、文件冲突、平台能力或用户指令不允许并发写入，将自动降级为串行 subagent、shared-worktree patch mode 或主线程串行执行。若你希望主线程串行执行，请在确认 Phase 2 Gate 前说明。`

Before user approval, record the proposed execution actor in `dev-flow-state.md` as `execution_actor_proposed`. After explicit Phase 2 execution approval, emit `execution_actor_decided` with: default mode, effective fallback rules, user override if any, the approval text, and whether the approval accepted the shown execution mode.

Do not enter Phase 3 until the user explicitly says to start execution, for example “开始执行”, “执行”, “start”, “go”, or equivalent. That approval accepts the displayed execution mode unless the user explicitly overrides it.

## Completion Gate

The final state is one of:

- `not-ready`: earlier gate unresolved, artifact missing, blocker unresolved, or verification incomplete
- `ready-for-review`: artifacts/drafts exist but completion evidence is incomplete
- `ready-to-report`: acceptance evidence proves the governed workflow reached its final state

For governed medium/heavy work, the master may report `ready-to-report` only after `dev-flow-acceptance` confirms:

1. required planning docs exist as files
2. Phase 1 and Phase 2 gates were explicitly cleared and recorded in `dev-flow-state.md`
3. `dev-flow-state.md`, `task-orchestration.md`, `progress.md`, and `delivery-report.md` exist where applicable
4. all DAG tasks are completed, explicitly accepted as deferred by the user/gate, or dynamically replanned under execution rules
5. task, batch, and final Executable Test Matrix checks have passed or were explicitly accepted as deferred scope
6. every task uses one canonical Git integration state from `dev-flow-git`: `merged`, `committed`, `pr_opened`, `direct_commit_complete`, `patch_ready`, `shared_working_tree_applied`, `applied_from_shared_worktree_patch`, or `deferred_accepted`
7. review/self-review evidence exists for integrated work
8. applicable quality-gate evidence is recorded, including `ui_ux_report` when `ui_runtime` risk applies
9. no unresolved blocker remains

For lightweight work, the master may report `ready-to-report` only after `dev-flow-acceptance` confirms:

1. `lightweight_artifact_ready`, `opsx_apply_complete`, `opsx_verify_complete`, and `acceptance_ready` are recorded in `dev-flow-state.md` or an equivalent persisted OpenSpec/opsx status artifact
2. the OpenSpec change directory exists and contains the artifacts required by the active schema
3. implementation tasks are complete or explicitly accepted as deferred in the OpenSpec tasks artifact
4. `/opsx:verify <change>` evidence exists, with skipped checks and residual risks recorded
5. Git/patch state is explicit through `dev-flow-git` when side effects are involved
6. required focused-route evidence exists, including `debugging_report` for debugging work and `ui_ux_report` for UI runtime risk
7. no unresolved blocker remains

For avoidance of doubt: a document or plan that only appeared in chat does not satisfy a persisted artifact requirement.
