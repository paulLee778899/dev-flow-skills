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

Canonical location is `Docs/<topic>/` or `docs/<topic>/` beside the governed artifact set. If a legacy flat artifact set already exists, keep using that legacy location and record the chosen path in `dev-flow-state.md`.

`dev-flow-state.md` must record every signal below with: signal name, producer, timestamp or ordering marker, evidence paths, gate status, user approval text when the signal records a gate passage or an authorization event, and stale/repair notes. Chat memory is never sufficient evidence for a governed signal or user approval.

| Signal | Produced by | Required evidence |
|---|---|---|
| `intent_decided` | `dev-flow-intent` | task type, secondary types, confidence, evidence, risk flags, recommended route, required protocols |
| `routing_decided` | `dev-flow-master` | intent result, classification, key dimensions, chosen path, next owner, next stage |
| `documentation_start_approved` | `dev-flow-planning` | user confirmed OpenSpec/opsx artifact drafting or update should begin, clarification answers or accepted unknowns, review mode |
| `openspec_artifact_ready` | `dev-flow-planning` or focused route owner | OpenSpec change ID/path, schema, generated artifact list, requirement/design/task/test evidence, checker score, known risks |
| `task_orchestration_ready` | `dev-flow-planning` | `task-orchestration.md`, DAG/batches, detailed Executable Test Matrix, system-level checks, checker score, automation readiness result |
| `lightweight_artifact_ready` | `dev-flow-master` or focused route owner | alias for lightweight `openspec_artifact_ready`; OpenSpec change ID/path, schema, generated artifact list, required apply artifacts, and `/opsx:ff` or `/opsx:continue` status |
| `opsx_apply_complete` | focused route owner or main agent | applied tasks, implementation status, changed files, task checkbox state, and Git/patch state |
| `opsx_verify_complete` | focused route owner or main agent | `/opsx:verify <change>` output, skipped checks with reasons, unresolved risks, and readiness recommendation |
| `git_safe` | `dev-flow-git` | isolation mode, integration mode, permission/capability result, side-effect boundary |
| `execution_actor_decided` | `dev-flow-master` | proposed execution actor shown at Phase 2 Gate, user approval or override, and writer concurrency boundary |
| `ui_ux_report` | `dev-flow-ui-ux` | target surface, runtime/browser evidence or blocked reason, interaction/responsive/accessibility result |
| `review_evidence_ready` | `dev-flow-acceptance` | task local verification evidence, TDD evidence, system-level evidence, requirements/design/test coverage, and checker score; independent CR is separate `/dev-flow-cr` evidence. Note: dev-flow-execution may write task-level local verification and TDD artifacts; dev-flow-acceptance aggregates these into the canonical review_evidence_ready signal. Only dev-flow-acceptance may emit the final form. |
| `execution_settled` | `dev-flow-execution` | batch/task status, Runtime Orchestration State summary, replan history, test/diagnostic evidence, unresolved blockers |
| `acceptance_ready` | `dev-flow-acceptance` | final test results, quality evidence, delivery report path, Git/patch states, unresolved follow-ups |
| `cr_report_ready` | `dev-flow-cr` | cr report file path, overall score, highest severity finding, blocking status (cr_blocked \| cr_passed \| cr_needs_defer_decision), review scope description |
| `debugging_report` | `dev-flow-debugging` | bug_id, reproduction_confirmed, root_cause, fix_scope (contained \| moderate \| broad), recommended_next_route, evidence_paths |

### Signal Schemas

```yaml
routing_decided:
  producer: dev-flow-master
  timestamp: <ISO-8601>
  complexity: lightweight | medium | heavyweight
  primary_skill: <skill name>
  opsx_required: true | false
  risk_flags: [list]
  rationale: <one line>
```

```yaml
git_safe:
  producer: dev-flow-git
  timestamp: <ISO-8601>
  isolation_mode: worktree | branch_serial | shared_serial | patch
  integration_mode: pr | direct_commit | patch_ready | deferred
  writer_concurrency_limit: <integer>
  allowed_side_effects: [list]
  forbidden_side_effects: [list]
  capability_permission_check: passed | blocked
  rollback_constraints: <description or none>
  unresolved_git_blockers: [list or none]
  allowed_canonical_integration_states: [list]
```

```yaml
execution_settled:
  producer: dev-flow-execution
  timestamp: <ISO-8601>
  all_tasks_final: true | false
  failed_tasks: [list of task ids or none]
  blocked_tasks: [list of task ids or none]
  replan_count: <integer>
  git_integration_state: <canonical state name>
  quality_evidence_paths: [list of file paths]
  unresolved_blockers: [list of task ids or none]
```

```yaml
acceptance_ready:
  producer: dev-flow-acceptance
  timestamp: <ISO-8601>
  path: lightweight | governed
  checklist_passed: true
  delivery_report_path: <path or none>
  openspec_change_path: <path or none>
  git_integration_state: <canonical state name>
  quality_evidence_paths: [list of file paths]
  system_level_checks: [list of commands/evidence]
  requirements_design_test_coverage: complete | incomplete | deferred_with_user_approval
  checker_score: <integer>
  outstanding_deferred: [list of task ids or none]
```

```yaml
execution_actor_decided:
  producer: dev-flow-master
  timestamp: <ISO-8601>
  execution_mode: worktree_parallel | shared_worktree_patch | shared_working_tree_serial
  writer_concurrency_limit: <integer>
  writer_concurrency_approved: true | false
  effective_fallback_rules: <description or none>
  git_safe_reference: <timestamp of the git_safe signal this decision is based on>
```

Gate rules:

- Do not enter governed planning without `routing_decided` choosing the governed path.
- Do not draft or update OpenSpec/opsx baseline artifacts without `documentation_start_approved`.
- Do not present OpenSpec Baseline Gate as ready without `openspec_artifact_ready` and `checker_score >= 95` for medium/heavy work. **Loop-authorized exception:** when all five loop-authorized phase mode conditions are met (see `references/routing-and-complexity.md § Loop-Authorized Phase Mode`), the Execution Envelope Gate approval covers user consent for phases inside the confirmed baseline. Do not re-prompt the user for a separate OpenSpec Baseline Gate approval; record `loop_authorized: true`, the `loop_id`, and the `loop_baseline_ready` + `loop_envelope_ready` signal paths in `dev-flow-state.md`, then proceed.
- Do not present Phase 2 Gate as ready without `task_orchestration_ready` and `git_safe`. **Loop-authorized exception:** same five conditions as above — do not re-prompt for a separate Phase 2 Gate approval; record the same `loop_authorized` fields in `dev-flow-state.md` and proceed.
- Do not execute code/config/test/user-visible changes until `openspec_artifact_ready` or `lightweight_artifact_ready` records the OpenSpec/opsx change context.
- Do not accept lightweight work until `opsx_apply_complete` and `opsx_verify_complete` are recorded.
- Do not enter Phase 3 until Phase 2 Gate has presented the proposed execution actor and recorded `execution_actor_decided`. **Loop-authorized exception:** same five conditions — record `execution_actor_decided` with `loop_authorized: true`, `loop_id`, and the envelope reference.
- Do not enter acceptance until execution reports all batches completed, user/gate-accepted as deferred, or replanned under `execution_settled`.
- Do not report `ready-to-report` without `acceptance_ready`.
- For `cr_report_ready`: if `cr_blocked` → do not merge/ship; else → proceed to delivery or defer. If `cr_needs_defer_decision`: present the deferred findings to the user with their severity scores and ask for an explicit accept/defer/fix decision before proceeding to merge or delivery.

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
| OpenSpec/opsx artifacts | Main agent | Yes for checker only | `dev-flow-planning`; must persist artifacts |
| OpenSpec Baseline Gate | Main agent + checker + user | Yes, a checker required | Mandatory explicit approval |
| Task orchestration | Main agent + checker | Yes, a checker required | `dev-flow-planning`; write DAG/test matrix |
| Phase 2 gate | Main agent + user | No | Mandatory explicit approval; resolve Git modes via `dev-flow-git` |
| Phase 3 execution | Main agent + task agents | Required | `dev-flow-execution`; main agent coordinates only; all implementation dispatched to task sub-agents |
| Per-task review | Main agent + reviewer sub-agent | Required | `dev-flow-execution`; reviewer dispatched after every implementing sub-agent in all three execution modes; see `task-settlement-and-modes.md § Per-Task Reviewer Protocol` |
| Git operations | Main agent / task agent within approved mode | Yes within task scope | `dev-flow-git`; no unauthorized side effects |
| Acceptance | Main agent + checker | Yes, a checker required | `dev-flow-acceptance` |
| Completion gate | Main agent + checker | Yes, a checker required | `dev-flow-acceptance` evidence + checker score + master final decision |

Ownership rules:

- If a stage is marked “Main agent,” do not delegate its governance decision to a task sub-agent. Use independent checker subagents only for review/eval; the main agent still owns coordination and user presentation.
- A task sub-agent may implement only its assigned task; it must not rewrite orchestration, alter gates, or change dependency status.
- Dynamic replanning is execution-internal and owned by `dev-flow-execution`; it is not a user-facing stage.
- Any gate-impacting score, pass/fail review, phase_eval, or readiness judgment must be checked by an independent checker subagent using raw artifacts, not the main agent's conclusion. All gates require 1 checker subagent.
- Required checker subagents are preauthorized read-only reviewers for their gate once the artifacts or evidence they review exist. Spawn them automatically; do not ask the user whether to run the checker and do not present gate readiness from main-agent self-review. User approval is still required for the gate decision itself and for side effects such as artifact writes, implementation, Git operations, worktrees, pushes, PRs, or paid/external actions.

## Phase Gates

### OpenSpec Baseline Gate

After `dev-flow-planning` produces or refreshes OpenSpec/opsx baseline artifacts and checker score, stop and present:

- OpenSpec change path and generated artifact list
- artifact variant and schema
- review mode applied
- checker score and findings
- accepted known risks
- next step: task orchestration

Do not enter task orchestration until the user explicitly approves with “同意”, “开始”, “继续”, “proceed”, “go ahead”, “实施”, or equivalent. **Loop-authorized exception:** when all five loop-authorized phase mode conditions are met (see `references/routing-and-complexity.md § Loop-Authorized Phase Mode`), record `loop_authorized: true`, `loop_id`, and the `loop_baseline_ready` + `loop_envelope_ready` signal paths in `dev-flow-state.md`, then proceed without a separate user prompt.

If the user rejects the artifacts at OpenSpec Baseline Gate, enter the Revision Loop in `phase-1-documents.md`. The rejection counts as one revision cycle toward the 3-cycle cap. Record the rejection reason in `dev-flow-state.md` under the `openspec_baseline_gate` entry. If the user provides no specific direction, ask what needs to change before proceeding.

### Phase 2 Gate — Task Orchestration and Git Safety

After `dev-flow-planning` writes `task-orchestration.md` and `dev-flow-git` emits `git_safe`, stop and present:

- task count, batch count, execution order, key dependencies
- parallel-safety summary: file/symbol overlap risks and any forced-serial tasks
- max concurrent agent cap
- Git isolation mode, integration mode, and writer concurrency limit
- automation readiness status and blockers
- detailed test matrix coverage summary, including system-level checks and unresolved test gaps
- orchestration checker score and findings
- execution mode, presented in Chinese:
  - `执行方式建议：基于当前 DAG、文件/符号重叠和 Git 安全边界，建议使用 <主线程串行 | 串行 subagent | patch-ready 并发分析 | 用户授权后的并发写入>。不会强制创建 worktree；如建议并发直接写入，需要你明确同意隔离方式。未授权时将使用串行写入或 shared-worktree patch mode。`

Before user approval, record the proposed execution actor in `dev-flow-state.md` as `execution_actor_proposed`:

```yaml
execution_actor_proposed:
  produced_by: dev-flow-master
  timestamp: <ISO-8601>
  proposed_execution_mode: worktree_parallel | shared_worktree_patch | shared_working_tree_serial
  proposed_writer_concurrency_limit: <integer>
  pending_gate_approval: true
```

After explicit Phase 2 execution approval, emit `execution_actor_decided` with: proposed mode, effective fallback rules, user override if any, the approval text, and whether any concurrent writing and worktree creation were explicitly approved.

Do not enter Phase 3 until the user explicitly says to start execution, for example “开始执行”, “执行”, “start”, “go”, or equivalent. That approval accepts only the displayed execution mode; direct concurrent writers and worktree creation require explicit approval when they are part of the proposal. **Loop-authorized exception:** when all five loop-authorized phase mode conditions are met (see `references/routing-and-complexity.md § Loop-Authorized Phase Mode`), record `loop_authorized: true`, `loop_id`, `loop_baseline_ready` path, `loop_envelope_ready` path, and `auto_continue_scope` in `dev-flow-state.md`, then enter Phase 3 without a separate user prompt.

If Phase 2 Gate fails (git_safe is blocked or task_orchestration_ready is insufficient), master must emit a `phase2_gate_failed` note into `dev-flow-state.md` with fields: `reason` (blocked_signal name), `blocking_detail` (what failed), and `recovery_options` (fix git config / reduce task scope / re-run planning). Do not silently stall.

## Completion Gate

The final state is one of:

- `not-ready`: earlier gate unresolved, artifact missing, blocker unresolved, or verification incomplete
- `ready-for-review`: artifacts/drafts exist but completion evidence is incomplete
- `ready-to-report`: acceptance evidence proves the governed workflow reached its final state

For governed medium/heavy work, the master may report `ready-to-report` only after `dev-flow-acceptance` confirms:

1. required OpenSpec/opsx artifacts exist as files
2. OpenSpec Baseline Gate and Phase 2 gates were explicitly cleared and recorded in `dev-flow-state.md`
3. `dev-flow-state.md` from first planning gate; `task-orchestration.md` from Phase 2; `progress.md` from Phase 2 Gate or earlier; `delivery-report.md` from acceptance
4. all DAG tasks are completed, explicitly accepted as deferred by the user/gate, or dynamically replanned under execution rules
5. task, batch, final, and system-level Executable Test Matrix checks have passed or were explicitly accepted as deferred scope
6. every task uses one canonical Git integration state from `dev-flow-git`: `merged`, `committed`, `pr_opened`, `direct_commit_complete`, `patch_ready`, `shared_working_tree_applied`, `applied_from_shared_worktree_patch`, or `deferred_accepted`
7. task local verification evidence and TDD evidence exist for integrated work; independent CR is optional and user-triggered through `/dev-flow-cr`
8. requirements/design/test coverage map is complete or explicitly deferred by the user
9. checker score >= 95 with no P0/P1 finding
10. applicable quality-gate evidence is recorded, including `ui_ux_report` when `ui_runtime` risk applies
11. no unresolved blocker remains

For lightweight work, the master may report `ready-to-report` only after `dev-flow-acceptance` confirms:

1. `lightweight_artifact_ready`, `opsx_apply_complete`, `opsx_verify_complete`, and `acceptance_ready` are recorded in `dev-flow-state.md` or an equivalent persisted OpenSpec/opsx status artifact
2. the OpenSpec change directory exists and contains the artifacts required by the active schema
3. implementation tasks are complete or explicitly accepted as deferred in the OpenSpec tasks artifact
4. `/opsx:verify <change>` evidence exists, with skipped checks and residual risks recorded
5. Git/patch state is explicit through `dev-flow-git` when side effects are involved
6. required focused-route evidence exists, including `debugging_report` for debugging work and `ui_ux_report` for UI runtime risk
7. TDD evidence exists for implementation tasks or an approved exception is recorded
8. final and system-level checks appropriate to the change pass or are explicitly marked N/A with reason
9. checker score >= 95 with no P0/P1 finding, unless the change is documentation-only with no behavior/config/test/user-visible impact
10. no unresolved blocker remains

After reporting `ready-to-report`, suggest that the user perform their own acceptance and then run `/dev-flow-cr` for independent post-acceptance code review when they want CR. Do not run CR automatically as part of `/dev-flow`.

## Loop Engineering Signals

Loop engineering signals operate at a separate layer from the dev-flow delivery workflow. They are produced by loop skills invoked directly via their slash commands and are **never written to `dev-flow-state.md`**. They are persisted to `loop-state.md` in the loop artifact directory (same directory as the loop-only baseline artifacts and loop report). They do not participate in phase gates and do not interact with the delivery signal registry above.

| Signal | Producer | Layer | Schema reference |
|---|---|---|---|
| `loop_baseline_ready` | `dev-flow-loop` | loop_engineering | see `skills/dev-flow-loop/SKILL.md#Required Signals` |
| `loop_control_ready` | `dev-flow-loop` | loop_engineering | see `skills/dev-flow-loop/SKILL.md#Required Signals` |
| `loop_triage_ready` | `dev-flow-loop-triage` | loop_engineering | see `skills/dev-flow-loop-triage/SKILL.md#Required Signal` |
| `loop_envelope_ready` | `dev-flow-loop-envelope` | loop_engineering | see `skills/dev-flow-loop-envelope/SKILL.md#Required Signal` |
| `scheduler_ready` | `dev-flow-scheduler` | loop_engineering | see `skills/dev-flow-scheduler/SKILL.md#Required Signal` |
| `phase_eval_result` | `dev-flow-loop` | loop_engineering | see schema below |
| `loop_eval_result` | `dev-flow-loop` | loop_engineering | see schema below |

```yaml
loop_baseline_ready:
  producer: dev-flow-loop
  layer: loop_engineering (written to loop-state.md, not dev-flow-state.md)
  schema: see skills/dev-flow-loop/SKILL.md#Required Signals

loop_control_ready:
  producer: dev-flow-loop
  layer: loop_engineering (written to loop-state.md, not dev-flow-state.md)
  schema: see skills/dev-flow-loop/SKILL.md#Required Signals

loop_triage_ready:
  producer: dev-flow-loop-triage
  layer: loop_engineering (written to loop-state.md, not dev-flow-state.md)
  schema: see skills/dev-flow-loop-triage/SKILL.md#Required Signal

loop_envelope_ready:
  producer: dev-flow-loop-envelope
  layer: loop_engineering (written to loop-state.md, not dev-flow-state.md)
  schema: see skills/dev-flow-loop-envelope/SKILL.md#Required Signal

scheduler_ready:
  producer: dev-flow-scheduler
  layer: loop_engineering (written to loop-state.md, not dev-flow-state.md)
  schema: see skills/dev-flow-scheduler/SKILL.md#Required Signal

phase_eval_result:
  producer: dev-flow-loop
  layer: loop_engineering (written to loop-state.md, not dev-flow-state.md)
  timestamp: <ISO-8601>
  loop_id: <matches loop_control_ready.loop_id>
  phase_id: <P-01 | P-02 | ...>
  round: <integer; 1 = first eval, 2+ = repair rounds>
  checker_score: <integer>
  quality_threshold: 95
  highest_finding_severity: P0 | P1 | P2 | none
  result: pass | repairable | stop
  blocking_findings: [list or none]
  repair_recommendation: <description or none>
  evidence_paths: [list of artifact paths checked]
  next_action: continue_next_phase | repair_round | stop_ask_user

loop_eval_result:
  producer: dev-flow-loop
  layer: loop_engineering (written to loop-state.md, not dev-flow-state.md)
  timestamp: <ISO-8601>
  loop_id: <matches loop_control_ready.loop_id>
  phases_completed: [list of phase_ids]
  phases_repaired: [list of phase_ids or none]
  phases_stopped: [list of phase_ids or none]
  final_checker_score: <integer>
  highest_finding_severity: P0 | P1 | P2 | none
  result: complete | partial | stopped
  residual_risks: [list or none]
  recommended_next_action: <description or none>
  loop_report_path: <path or none>
```

### Loop → Dev-Flow Handoff Traceability

When a loop triage candidate is confirmed and `/dev-flow` is entered to implement a fix or feature identified by the loop, the agent must note the `loop_triage_ready` signal path in the initial dev-flow intent description. When a delivery loop hands off a confirmed phase, the agent must also note the `loop_baseline_ready`, `loop_control_ready`, Loop Phase DAG node, and envelope evidence. This creates a traceable record that the work originated from a loop engineering cycle rather than a direct user request. The traceability note should include: the loop skill that produced the candidate or phase, the timestamp or artifact path of the loop signal, and a brief description of why this candidate or phase was selected.

For avoidance of doubt: a document or plan that only appeared in chat does not satisfy a persisted artifact requirement.
