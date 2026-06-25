# Loop Control Plane Reference

## Table of Contents

- [Scope Types](#scope-types)
- [Loop Versus Dev-Flow Boundary](#loop-versus-dev-flow-boundary)
- [Loop Artifact Directory](#loop-artifact-directory)
- [Delivery Loop Lifecycle](#delivery-loop-lifecycle)
- [Loop Phase DAG](#loop-phase-dag)
- [Auto-Continue Policy](#auto-continue-policy)
- [Loop Primitives](#loop-primitives)
- [Loop Signal Fields](#loop-signal-fields)
- [Evidence Order](#evidence-order)
- [Route Recommendations](#route-recommendations)
- [Handoff Confirmation](#handoff-confirmation)
- [Scoring](#scoring)
- [Report Shape](#report-shape)

## Scope Types

| Scope | Use for | Output |
|---|---|---|
| `workflow_design` | Designing a new outer loop, automation, or harness behavior. | Loop envelope proposal and risk list. |
| `repository_triage` | Scanning repo/CI/diff/issues/OpenSpec/dev-flow artifacts. | Candidate inbox and next-route recommendations. |
| `completed_run_review` | Reviewing a finished dev-flow run or delivery report. | Loop-quality score and improvement suggestions. |
| `automation_proposal` | Preparing a recurring/background loop for user approval. | Envelope, schedule proposal, and route to `dev-flow-scheduler`. |
| `dispatch_handoff` | Turning a candidate into a user-confirmed `/dev-flow` or `/dev-flow-cr` flow. | Handoff question and candidate summary. |
| `delivery_loop` | Driving a user-approved goal through multiple dev-flow phases and repair rounds. | Baseline docs, Loop Phase DAG, phase handoffs, eval decisions, final loop report. |

## Loop Versus Dev-Flow Boundary

| Layer | Owns | Must not own |
|---|---|---|
| `dev-flow-loop` | goal retention, user-confirmed baseline, Loop Phase DAG, envelope, phase_eval/loop_eval decisions, cross-phase trace | phase implementation, phase-local task settlement, commits/pushes/PRs |
| `dev-flow` | phase-level OpenSpec/opsx artifacts, phase task DAG, TDD implementation, acceptance evidence | redefining loop goal, replacing confirmed baseline, cross-phase stop policy |
| `phase_eval` / `loop_eval` | independent checker quality checkpoint per phase (`phase_eval_result`) or final loop summary (`loop_eval_result`); both persisted to `loop-state.md` | independent `/dev-flow-cr`, `cr_report_ready`, implementation fixes, baseline changes |
| `dev-flow-cr` | independent user-triggered CR after user request | automatic loop checkpoint, implementation fixes, baseline changes |
| `dev-flow-scheduler` | approved cron/heartbeat automation lifecycle | loop design, triage, implementation |
| `dev-flow-loop-triage` | candidate discovery and readable next-step recommendation | fixing candidates, running dev-flow, creating schedules |

The delivery loop is allowed to invoke dev-flow after the user confirms the loop baseline and envelope. This is not the same as auto-starting from a read-only triage item.

## Loop Artifact Directory

For delivery loops, create a loop artifact directory under the active topic directory, normally `Docs/<topic>/loop/` or `docs/<topic>/loop/`.

The loop artifact directory may contain only outer-loop control artifacts:

- `requirements.md`
- `high-level-design.md`
- `detailed-design.md`
- `test-plan.md`
- `loop-phase-dag.md`
- `loop-envelope.md`
- `loop-state.md`
- `phase-artifacts.md` or `opsx-index.md`

OpenSpec/opsx originals remain in the project's standard location, normally `openspec/changes/<change-id>/`. Do not move or copy OpenSpec originals into the loop directory. The loop directory records links, status, evidence paths, and phase mappings only.

Use `phase-artifacts.md` or `opsx-index.md` as the phase artifact index. Each row should record: phase ID, OpenSpec/opsx change ID, canonical change path, current status, related `task-orchestration.md`, verification evidence, `phase_eval_result`, and unresolved risks.

Example:

```text
Docs/mesh-risk-audit/
  loop/
    requirements.md
    high-level-design.md
    detailed-design.md
    test-plan.md
    loop-phase-dag.md
    loop-envelope.md
    loop-state.md
    phase-artifacts.md
openspec/
  changes/
    fix-broadcast-pdr/
      proposal.md
      tasks.md
      specs/
```

## Delivery Loop Lifecycle

1. Discuss the goal, requirements, blockers, non-goals, risks, and success evidence with the user.
2. Use brainstorming patterns when requirements or design direction are ambiguous; present options and get direction confirmation.
3. Generate loop-only baseline artifacts:
   - requirements
   - high-level design
   - detailed design
   - test plan (`test-plan.md`)
   These artifacts preserve the outer loop goal and are not `/dev-flow` implementation documents.
   When a concrete document shape is useful, reuse the templates in `assets/baseline-templates/`. The templates are loop-owned assets and must not be copied into `dev-flow-master` or treated as a `/dev-flow` planning requirement.
4. Run independent checker review:
   - spawn an independent checker subagent to score requirements/design/test sufficiency from 0-100
   - check contradictions, TBDs, missing tests, unclear acceptance, security/API/UI/performance/release gaps
   - auto-revise until score >= 95 or a blocker is found
5. Present final loop baseline artifacts and ask for Baseline Docs Gate approval. Do not execute implementation before this approval.
6. Write the Loop Phase DAG and envelope proposal.
7. Present the Loop Phase DAG, `auto_continue_scope`, `dev_flow_phase_handoff`, budgets, stop conditions, and side-effect boundaries for Execution Envelope Gate approval.
8. Freeze the baseline only after Baseline Docs Gate and Execution Envelope Gate are both approved.
9. For each ready phase, hand off to dev-flow in loop-authorized phase mode:
   - preserve the loop goal and baseline ID
   - create phase-level OpenSpec/opsx spec/tasks instead of rewriting the loop-only baseline artifacts
   - keep phase-level OpenSpec/opsx originals in `openspec/changes/<change-id>/` or the project's standard OpenSpec/opsx location
   - update `phase-artifacts.md` or `opsx-index.md` with the phase-to-change mapping and status
   - create the phase-internal task DAG and Executable Test Matrix
   - create detailed test coverage for normal, edge, failure, integration, and system-level checks
   - require TDD per implementation task via `superpowers:test-driven-development` when available
   - collect acceptance and system-level evidence
10. Run independent checker `phase_eval` after each phase or repair round. `phase_eval` is not `/dev-flow-cr`, must not emit `cr_report_ready`, and must not use the independent CR report schema.
11. Decide:
   - continue to next phase only when independent checker `phase_eval` score is >= 95, no P0/P1 finding exists, and dependencies are ready
   - run a repair round when issues are inside baseline and budget remains
   - stop and ask the user when a stop condition is met
12. Emit final loop report with phase outcomes, evidence, scores, residual risks, and recommended next action.

## Loop Phase DAG

The Loop Phase DAG is the cross-phase plan. It is separate from dev-flow's phase-internal `task-orchestration.md`.

Each phase node must include:

- phase ID (`P-01`, `P-02`, ...)
- objective and baseline slice
- dependencies
- entry criteria
- exit criteria
- expected phase-level OpenSpec/opsx artifacts
- dev-flow owner flow
- test/eval gates
- repair policy
- stop/escalation conditions
- trace links to phase acceptance and phase_eval evidence

Parallel phase execution is allowed only when all parallel phase nodes have no dependency path between them, no shared writer conflict, and the envelope permits concurrent agents. If only some phase nodes are independent, only those nodes may be considered for parallel sub-waves; dependent phases remain serial.

## Auto-Continue Policy

After Baseline Docs Gate and Execution Envelope Gate are both approved, the loop should auto-continue inside the confirmed baseline. It should not ask after every dev-flow phase gate that is already authorized by the baseline.

Auto-continue is allowed when all are true:

- confirmed loop-only baseline artifacts exist and are the source of truth
- Loop Phase DAG names the current phase as ready
- Execution Envelope Gate explicitly approved `auto_continue_scope: within_confirmed_baseline` and `dev_flow_phase_handoff`
- phase work is inside baseline scope and acceptance criteria
- envelope budget, agent cap, and side-effect permissions allow continuation
- no destructive Git/external/paid operation is needed
- phase_eval result is pass with independent checker score >= 95 and no P0/P1 finding, or is repairable inside baseline for a repair round

Hard-stop and ask the user when any is true:

- requirement baseline, acceptance baseline, non-goals, API/protocol/data/security/release boundary, or test strategy changes
- phase_eval reports P0/P1 issue that changes design or scope, not just implementation quality
- envelope budget, max rounds, max wall time, or retry cap is reached
- destructive Git operation, push, PR, production action, tracker mutation, paid service, or worktree creation needs approval
- evidence is missing such that the next phase cannot be evaluated safely
- loop detects competing writers or stale state that cannot be reconciled from artifacts

Default limits if the user did not specify them:

- max phase repair rounds: 3 per phase
- max full-loop passes: 2
- independent checker baseline threshold: 95
- phase_eval threshold: 95

These defaults are stated to the user and recorded; they do not need a separate question unless the user asks to change them.

## Loop Primitives

| Primitive | Meaning | Requirement |
|---|---|---|
| `goal` | The single outcome the loop is trying to improve or detect. | Keep it one sentence and measurable enough to evaluate. |
| `baseline` | User-confirmed requirements/design/test source of truth for the outer loop. | Loop-only baseline artifacts, independent checker score >= 95, user confirmation. |
| `phase_dag` | Cross-phase dependency graph. | Records phase nodes, dependencies, entry/exit criteria, eval gates, repair policy. |
| `trigger` | How the loop starts: manual request, heartbeat, schedule, external event, or background monitor. | Treat every non-manual trigger as envelope-required and approval-required. |
| `trace` | The evidence trail of what was inspected, what was recommended, and what was deliberately not done. | Record artifacts, commands, unavailable sources, and side effects. |
| `eval` | The checkpoint that decides whether the loop result is good enough. | Use an independent checker subagent for score, candidate confidence, missing-evidence limits, and boundary checks. |
| `phase_eval` | Independent checker checkpoint after a phase or repair round. Produces `phase_eval_result` signal (schema: `skills/dev-flow-loop/SKILL.md#Required Signals`). Persisted to `loop-state.md`. | Must not call `/dev-flow-cr`, emit `cr_report_ready`, or replace user-triggered independent CR. |
| `maker-checker` | Separate proposal from review. | Use one pass to produce candidates/envelope and a separate pass to check safety before handoff. |
| `handoff` | A user-readable next action for `/dev-flow`, `/dev-flow-cr`, `/dev-flow-scheduler`, manual action, or tracker work. | Ask a concrete confirmation question; after explicit candidate confirmation, enter the owner flow without requiring another slash command. |

## Loop Signal Fields

Persist delivery-loop signals and user-approved persisted loop artifacts to `loop-state.md` in the loop artifact directory, never to `dev-flow-state.md`. For read-only triage or workflow design, emit signals in the reply unless the user asks to persist loop artifacts.

```yaml
loop_baseline_ready:
  producer: dev-flow-loop
  layer: loop_engineering
  timestamp: <ISO-8601>
  baseline_id: <unique baseline identifier, e.g. loop-YYYYMMDD-NNN>
  baseline_status: draft | checker_pending | checker_reviewed | user_confirmed | blocked
  baseline_artifacts: [requirements, high_level_design, detailed_design, test_plan]
  loop_artifact_dir: <Docs/<topic>/loop/ or docs/<topic>/loop/>
  independent_checker_score: <0-100>
  quality_threshold: 95
  gate_approved_at: <ISO-8601 or none>
  phase_dag_path: <path or none>

phase_eval_result:
  producer: dev-flow-loop
  layer: loop_engineering
  timestamp: <ISO-8601>
  loop_id: <matches loop_control_ready.loop_id>
  phase_id: <P-01 | P-02 | ...>
  phase_artifact_index: <phase-artifacts.md or opsx-index.md path>
  openspec_change_path: <openspec/changes/<change-id>/ or project standard path>
  round: <integer; 1 = first eval, 2+ = repair rounds>
  independent_checker_score: <0-100>
  quality_threshold: 95
  highest_finding_severity: P0 | P1 | P2 | none
  result: pass | repairable | stop
  blocking_findings: [list or none]
  repair_recommendation: <description or none>
  evidence_paths: [list of artifact paths checked]
  next_action: continue_next_phase | repair_round | stop_ask_user

loop_eval_result:
  producer: dev-flow-loop
  layer: loop_engineering
  timestamp: <ISO-8601>
  loop_id: <matches loop_control_ready.loop_id>
  phases_completed: [list of phase_ids]
  phases_repaired: [list of phase_ids or none]
  phases_stopped: [list of phase_ids or none]
  final_independent_checker_score: <0-100>
  highest_finding_severity: P0 | P1 | P2 | none
  result: complete | partial | stopped
  residual_risks: [list or none]
  recommended_next_action: <description or none>
  loop_report_path: <path or none>

loop_control_ready:
  producer: dev-flow-loop
  layer: loop_engineering
  timestamp: <ISO-8601>
  loop_id: <unique loop identifier, e.g. loop-YYYYMMDD-NNN>
  scope: workflow_design | repository_triage | completed_run_review | automation_proposal | dispatch_handoff | delivery_loop
  loop_goal: <one line>
  trigger_type: manual | heartbeat | scheduled | event_triggered | background
  evidence_reviewed: [list]
  trace_or_eval_evidence: [list or none]
  envelope_required: true | false
  auto_continue_scope: within_confirmed_baseline | ask_user | disabled
  loop_artifact_dir: <Docs/<topic>/loop/ or docs/<topic>/loop/>
  phase_artifact_index: <phase-artifacts.md or opsx-index.md path>
  maker_checker_completed: true | false
  triage_report_path: <path or none>
  loop_phase_dag_path: <path or none>
  handoff_question: <question or none>
  recommended_next_route: none | ask_user | /dev-flow | /dev-flow-cr | /dev-flow-scheduler | manual_action | external_tracker
  side_effects_performed: none
  independent_checker_score: <0-100>
  unresolved_risks: [list or none]
  review_limits: [list or none]
```

## Evidence Order

Use actual artifacts before memory:

1. Git/filesystem state, including current diff and branch.
2. CI/test output when available.
3. OpenSpec/opsx change artifacts.
4. dev-flow artifacts: `dev-flow-state.md`, `progress.md`, `task-orchestration.md`, `delivery-report.md`, CR reports.
5. Loop artifacts when explicitly present: `loop-state.md` (canonical loop signal ledger), `phase-artifacts.md` or `opsx-index.md`, loop report, envelope, candidate inbox, trace log, `phase_eval_result` entries.
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
- 20: delivery loop lacks user-confirmed loop-only baseline artifacts before implementation.
- 20: phase handoff starts before Execution Envelope Gate approves Loop Phase DAG, `auto_continue_scope`, and `dev_flow_phase_handoff`.
- 20: internal `phase_eval` is confused with `/dev-flow-cr` or emits `cr_report_ready`.
- 15: baseline artifacts lack independent checker score or auto-revision evidence.
- 15: delivery loop lacks a Loop Phase DAG or confuses it with phase-internal `task-orchestration.md`.
- 15: dev-flow phase handoff does not require phase-level OpenSpec/opsx artifacts.
- 15: OpenSpec/opsx originals are moved or copied into `Docs/<topic>/loop/` instead of being linked from `phase-artifacts.md` or `opsx-index.md`.
- 15: implementation tasks do not require TDD per task via superpowers or equivalent fallback.
- 15: gate-impacting scoring, readiness, or phase_eval is done only by the main agent without independent checker subagent review.
- 15: no envelope for recurring, scheduled, background, or persistent loops.
- 15: loop creates, updates, pauses, resumes, or deletes schedulers instead of routing to `dev-flow-scheduler`.
- 10: recommendations are not backed by artifacts.
- 10: no stop condition, retry limit, or budget boundary.
- 10: auto-continue policy asks on every phase despite confirmed baseline, or continues outside baseline without asking.
- 5: no trace/eval evidence for a loop recommendation.
- 5: no maker-checker review before recommending a handoff from automation proposal to execution.
- 5: no concrete handoff question for `/dev-flow`, `/dev-flow-cr`, or `/dev-flow-scheduler` recommendation.
- 5: report omits review limits or unresolved risks.

Scores below 95 require revision before running a delivery loop or recommending persistent automation.

## Report Shape

```text
## Loop Engineering Review
- Scope:
- Goal:
- Trigger:
- Evidence:
- Trace/eval evidence:
- Independent checker score:
- Side effects performed: none
- Handoff question:
- Recommended next route:
- Risks:
- Review limits:
```
