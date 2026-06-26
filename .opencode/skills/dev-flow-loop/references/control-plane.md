# Loop Control Plane Reference

## Table of Contents

- [Scope Types](#scope-types)
- [Loop Versus Dev-Flow Boundary](#loop-versus-dev-flow-boundary)
- [Loop Artifact Directory](#loop-artifact-directory)
- [Delivery Loop Lifecycle](#delivery-loop-lifecycle)
- [Baseline Document Quality Checklist](#baseline-document-quality-checklist)
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
| `phase_eval` / `loop_eval` | checker quality checkpoint per phase (`phase_eval_result`) or final loop summary (`loop_eval_result`); both persisted to `loop-state.md` | independent `/dev-flow-cr`, `cr_report_ready`, implementation fixes, baseline changes |
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
- `test-plan.md` — test strategy, traceability, test categories, and 3–5 representative samples per applicable layer
- `test-cases.xlsx` — execution-level full test case catalog; multi-sheet by category; Sheet 1 「测试汇总」records product/project information (hardware platform, software version, hardware version, etc.) plus per-Sheet execution statistics (total/pass/fail/blocked/not-run/skipped/pass-rate); the default category sheets are 单元测试, 集成测试, 系统测试, 性能测试, 安全测试, 回归测试, and 资源约束测试; project-specific sheets may be added or removed only when the summary rows are updated with the exact Sheet name and copied formulas
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
    test-cases.xlsx
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
2. Use brainstorming patterns when requirements or design direction are ambiguous; present options and get direction confirmation. **When discussion is complete, explicitly ask the user whether to proceed with writing the baseline documents — do not proceed to Step 3 until the user confirms in the current turn. Prior discussion, regardless of length, does not count as confirmation.**
3. Generate loop-only baseline artifacts:
   - requirements (`requirements.md`)
   - high-level design (`high-level-design.md`)
   - detailed design (`detailed-design.md`)
   - test plan (`test-plan.md`) — strategy, test category descriptions, traceability, and 3–5 representative samples per applicable layer: unit, integration, system/E2E, performance, security, regression
   - test case catalog (`test-cases.xlsx`) — execution-level full test case table; multi-sheet by category; Sheet 1「测试汇总」records product/project info and per-Sheet statistics, including skipped cases as a separate column; default sheets are 单元测试, 集成测试, 系统测试, 性能测试, 安全测试, 回归测试, and 资源约束测试; add/remove project-specific sheets only when the summary rows are updated with the exact Sheet name and copied formulas; each row records: TC-ID, 模块, 测试场景, 优先级, 前置条件, 输入/操作步骤, 预期结果, 实际结果, 测试状态, 测试人, 测试日期, 备注
   These artifacts preserve the outer loop goal and are not `/dev-flow` implementation documents.
   When a concrete document shape is useful, reuse the templates in `assets/baseline-templates/`. The templates are loop-owned assets and must not be copied into `dev-flow-master` or treated as a `/dev-flow` planning requirement.
   **Mandatory diagram requirements** — all diagrams must be filled with real project-specific names; unfilled placeholders are a checker-gate blocker:
   - `requirements.md` §2.2: `graph LR` context diagram — system, external actors, external systems, labeled edges
   - `high-level-design.md` §2: `graph TB` architecture diagram — all layers, modules, external dependencies
   - `high-level-design.md` §3.3: `graph LR` module dependency diagram — dependency direction, interface types
   - `high-level-design.md` §5.1: `flowchart TD` main process — decision branches, alternate paths
   - `high-level-design.md` §5.2: `sequenceDiagram` key interaction — named participants, message labels
   - `high-level-design.md` §5.3: `flowchart TD` exception flow — exception types, handling paths, termination states
   - `detailed-design.md` §5.4: `sequenceDiagram` happy path — always required
   - `detailed-design.md` §5.1: `stateDiagram-v2` — required if stateful behavior
   - `detailed-design.md` §5.5: `flowchart TD` failure/rollback — required if retry or rollback behavior
   - `detailed-design.md` §3.3: `sequenceDiagram` protocol lifecycle — required if protocol design
4. Run checker review:
   - Spawn a checker subagent to score the full artifact set (requirements, HLD, DDD, test-plan, test-cases.xlsx) from 0–100 against `§Baseline Document Quality Checklist`
   - Record the score in `loop_baseline_ready.checker_score`; the gate condition is checker score ≥ 95
   - Auto-revise against all findings
   - Repeat until checker score ≥ 95 or a blocker is found
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
10. Run checker `phase_eval` after each phase or repair round using a checker subagent; the checker scores phase artifacts from 0–100; record `phase_eval_result.checker_score`. `phase_eval` is not `/dev-flow-cr`, must not emit `cr_report_ready`, and must not use the independent CR report schema.
11. Decide:
   - continue to next phase only when `phase_eval` checker score ≥ 95, no P0/P1 finding exists, and dependencies are ready
   - run a repair round when issues are inside baseline and budget remains
   - stop and ask the user when a stop condition is met
12. Emit final loop report with phase outcomes, evidence, scores, residual risks, and recommended next action.

## Baseline Document Quality Checklist

A checker subagent scores the full baseline artifact set using this checklist. Score = (YES items / applicable items) × 100, rounded to the nearest integer. Items marked "If applicable" are excluded from the denominator when the relevant design element does not exist in the project. Auto-revise against all findings and repeat until checker score ≥ 95.

### requirements.md

| ID | Item | Scope |
|---|---|---|
| RQ-01 | §2.2 includes a Mermaid context diagram with the system, external actors, and external systems | Always |
| RQ-02 | §2.3 includes a use case table with UC-IDs, roles, and scenario descriptions | Always |
| RQ-03 | §3.1 functional requirements table covers all functional domains derived from project goals | Always |
| RQ-04 | §3.2 business rules table has entries for applicable rule types: state flow, permission, validation, trigger, exception | Always |
| RQ-05 | §3.4 non-functional requirements table covers all five dimensions: performance, security, stability, compatibility, observability | Always |
| RQ-06 | §4.3 risk/assumption table identifies known risks with impact and mitigation | Always |
| RQ-07 | §5.1 functional acceptance criteria table has concrete, testable pass conditions and verification methods | Always |
| RQ-08 | §5.2 non-functional acceptance criteria table has measurable thresholds and verification methods | Always |
| RQ-09 | No unresolved `{{placeholder}}` in body sections (sections 1–5) | Always |
| RQ-10 | No TBD/待确认/后续补充 outside §4 open issues table | Always |
| RQ-11 | All acceptance conditions are measurable, not vague descriptions | Always |

### high-level-design.md

| ID | Item | Scope |
|---|---|---|
| HLD-01 | §2 includes a Mermaid architecture diagram with system layers, major modules, and external dependencies; §2.1 has a layer description table; §2.2 has a design boundary table; §2.3 has a key data flow table | Always |
| HLD-02 | §3.3 includes a Mermaid module dependency diagram showing dependency direction and interface types | Always |
| HLD-03 | §5.1 includes a Mermaid flowchart of the main process with decision branches and alternate paths | Always |
| HLD-04 | §5.2 has at least one sub-section (§5.2.x), each containing a Mermaid sequence diagram with named participants and message labels | Always |
| HLD-05 | §5.3 has at least one sub-section (§5.3.x), each containing a Mermaid flowchart with exception types, handling paths, and termination states | Always |
| HLD-06 | §3.1 module list table is present with all columns: ID, name, type, description | Always |
| HLD-07 | §3.2 module responsibility table has: module, responsibility, input, output, NOT responsible for | Always |
| HLD-08 | §4.1 function list table has all columns: function ID, name, goal, input, output, modules | Always |
| HLD-09 | §5.4 drill-down points table lists every protocol/API/state machine/error-code/data-field item needing detailed design | Always |
| HLD-10 | §7.1 technology stack table covers all applicable layers with chosen tech, alternatives, rationale, and risk | Always |
| HLD-11 | All modules listed in §3.1 appear in at least one Mermaid diagram | Always |
| HLD-12 | No TBD/待确认 outside §8.1 open issues table | Always |

### detailed-design.md

| ID | Item | Scope |
|---|---|---|
| DDD-01 | §5.1 includes a Mermaid `stateDiagram-v2` with all states and transitions | If stateful behavior |
| DDD-02 | §5.4 has at least one sub-section (§5.4.x) with a Mermaid `sequenceDiagram` covering the happy path | Always |
| DDD-03 | §5.5 has at least one sub-section (§5.5.x) with a Mermaid flowchart for each distinct failure/rollback pattern | If retry or rollback behavior |
| DDD-04 | §3.3 includes a Mermaid `sequenceDiagram` for protocol lifecycle | If §3 protocol design |
| DDD-05 | §3.1 protocol list table present with all 8 columns: ID, name, layer, participants, transport, encoding, auth, version | If §3 protocol design |
| DDD-06 | §3.2 frame/message field table has all 8 columns: field, type, required, default, range, encoding, example, description | If §3 protocol design |
| DDD-07 | §3.4 protocol error table has: error code, name, trigger, recoverable, peer action, local action, log fields | If §3 protocol design |
| DDD-08 | §4.1 API overview table present with all required columns: ID, name, type, provider, consumer, method, path, auth, idempotent, version | If §4 API design |
| DDD-09 | §4.3 has at least one API sub-section (§4.3.x); each sub-section has a functional description and all five sub-sub-sections: 函数原型, 输入说明, 输出/返回值说明, 使用限制, 调用示例 | If §4 API design |
| DDD-10 | §5.2 state transition table has all columns: source state, event, guard, target state, action, failure path | If stateful behavior |
| DDD-11 | §6.2 field-level schema table covers all data objects with: field, type, required, nullable, default, constraint, index/key, example | Always |
| DDD-12 | All error codes have explicit code values, trigger conditions, retry policy, and caller action | Always |
| DDD-13 | All retry/timeout/idempotency/rollback behaviors specify concrete values (time limits, retry counts, policy) | Always |
| DDD-14 | No TBD/待确认 outside §8.1 open issues table | Always |

### test-plan.md + test-cases.xlsx

| ID | Item | Scope |
|---|---|---|
| TP-01 | §1 quality goals table has: goal, verification method, measurable pass criteria, related requirement/design reference | Always |
| TP-02 | §2.3 traceability matrix covers all core requirements and major APIs/state machines from detailed design | Always |
| TP-03 | §3.1 unit test section has strategy description AND 3–5 representative rows; full execution cases live in `test-cases.xlsx` | Always |
| TP-04 | §3.2 integration test section has strategy description AND 3–5 representative rows; full execution cases live in `test-cases.xlsx` | Always |
| TP-05 | §3.3 system/E2E test section has strategy description AND 3–5 representative rows; full execution cases live in `test-cases.xlsx` | Always |
| TP-06 | §3.4 performance test section has test types, load targets, metrics, and tool | If performance NFR |
| TP-07 | §3.5 security test section has test directions: auth, injection, sensitive data | If security NFR |
| TP-08 | §4.1 API contract test table covers all APIs listed in detailed design §4.1 | If APIs exist |
| TP-09 | §4.3 state machine test table covers all state transitions from detailed design §5.2 | If state machine |
| TP-10 | §6 regression strategy specifies trigger conditions, scope, and test commands | Always |
| TP-11 | `test-cases.xlsx` exists alongside `test-plan.md` in the loop artifact directory | Always |
| TP-12 | `test-cases.xlsx` Sheet 1「测试汇总」has all product/project info fields and intact statistics formulas driven by the registered Sheet names in column B | Always |
| TP-13 | `test-cases.xlsx` has registered category sheets in the summary table; the default template includes 单元测试, 集成测试, 系统测试, 性能测试, 安全测试, 回归测试, and 资源约束测试 | Always |
| TP-14 | Each registered `test-cases.xlsx` category sheet has the correct 12-column structure with valid TC-ID naming convention | Always |
| TP-15 | No TBD/待确认 outside §7 open issues table | Always |

### Cross-Document Consistency

| ID | Item |
|---|---|
| CD-01 | External systems in requirements.md §2.2 context diagram appear in high-level-design.md §2 architecture diagram |
| CD-02 | All modules in high-level-design.md §3.1 are addressed in detailed-design.md §2 module designs |
| CD-03 | All items in high-level-design.md §5.4 drill-down points table have corresponding sections in detailed-design.md |
| CD-04 | All APIs in detailed-design.md §4.1 have corresponding contract test entries in test-plan.md §4.1 |
| CD-05 | All state machines in detailed-design.md §5 have corresponding state flow test scenarios in test-plan.md §4.3 |
| CD-06 | All non-functional requirements in requirements.md §3.4 map to test entries in test-plan.md §3.4–§3.5 |

### Embedded Resource Constraints（If applicable）

> Skip this entire section for non-embedded projects.

| ID | Item | Scope |
|---|---|---|
| EMB-01 | requirements.md §3.5.1 hardware platform table is complete: MCU, RAM total, Flash total, OS/RTOS, compiler, FPU availability | If embedded project |
| EMB-02 | requirements.md §3.5.2 resource budget table has concrete upper limits for RAM, Stack, Code/Flash, and Heap policy | If embedded project |
| EMB-03 | requirements.md §3.5.3 coding constraints table covers integer types, floating point, dynamic memory, recursion, byte order, and packing | If embedded project |
| EMB-04 | high-level-design.md §6.3.1 per-module resource budget table is present with RAM/Stack/Code columns and totals row | If embedded project |
| EMB-05 | high-level-design.md §6.3.2 task/interrupt stack depth table lists all tasks and interrupts with stack budgets | If embedded project |
| EMB-06 | detailed-design.md §9.1 data type spec table covers interface fields, boolean flags, register mappings, enums, and fixed-point rules | If embedded project |
| EMB-07 | detailed-design.md §9.2 struct size table has `sizeof()` annotations and `_Static_assert` entries for all key structs, consistent with §6.3.1 | If embedded project |
| EMB-08 | detailed-design.md §9.3 task stack depth table lists all tasks/interrupts with peak call-path analysis | If embedded project |
| EMB-09 | detailed-design.md §9.4 interface constraints table covers FPU policy, recursion ban, byte order, compile warnings, implicit casts, global variable access, and `volatile` usage | If embedded project |
| EMB-10 | test-plan.md §3.6 resource constraint verification table covers RAM, Code/Flash, Stack, dynamic memory, type compliance, and static assertions | If embedded project |
| EMB-11 | test-plan.md §5.5 has representative embedded resource samples covering Linker Map, stack depth, malloc/free ban, type compliance, and canary detection | If embedded project |
| EMB-12 | `test-cases.xlsx` contains a 「资源约束测试」sheet with all embedded resource execution cases | If embedded project |
| EMB-13 | Resource budget limits in HLD §6.3 are consistent with requirements §3.5.2 (no module budget exceeds system-level constraint) | If embedded project |

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
- phase_eval result is pass with checker score >= 95 and no P0/P1 finding, or is repairable inside baseline for a repair round

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
- checker baseline threshold: 95
- phase_eval threshold: 95

These defaults are stated to the user and recorded; they do not need a separate question unless the user asks to change them.

## Loop Primitives

| Primitive | Meaning | Requirement |
|---|---|---|
| `goal` | The single outcome the loop is trying to improve or detect. | Keep it one sentence and measurable enough to evaluate. |
| `baseline` | User-confirmed requirements/design/test source of truth for the outer loop. | Loop-only baseline artifacts, checker score >= 95, user confirmation. |
| `phase_dag` | Cross-phase dependency graph. | Records phase nodes, dependencies, entry/exit criteria, eval gates, repair policy. |
| `trigger` | How the loop starts: manual request, heartbeat, schedule, external event, or background monitor. | Treat every non-manual trigger as envelope-required and approval-required. |
| `trace` | The evidence trail of what was inspected, what was recommended, and what was deliberately not done. | Record artifacts, commands, unavailable sources, and side effects. |
| `eval` | The checkpoint that decides whether the loop result is good enough. | Use a checker subagent for score, candidate confidence, missing-evidence limits, and boundary checks. |
| `phase_eval` | Checker checkpoint after a phase or repair round. Produces `phase_eval_result` signal (schema: `skills/dev-flow-loop/SKILL.md#Required Signals`). Persisted to `loop-state.md`. | Must not call `/dev-flow-cr`, emit `cr_report_ready`, or replace user-triggered independent CR. |
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
  baseline_artifacts: [requirements, high_level_design, detailed_design, test_plan, test_cases_xlsx]
  loop_artifact_dir: <Docs/<topic>/loop/ or docs/<topic>/loop/>
  checker_score: <integer 0–100>
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
  checker_score: <integer 0–100>
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
  final_checker_score: <minimum phase_eval checker_score across all completed phases; integer 0–100>
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
  checker_score: <integer 0–100 or none>
  checker_gate_result: pass | blocked | not_applicable
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
- 15: baseline artifacts skip the checker subagent review, or checker score < 95, or auto-revision evidence is missing.
- 15: delivery loop lacks a Loop Phase DAG or confuses it with phase-internal `task-orchestration.md`.
- 15: dev-flow phase handoff does not require phase-level OpenSpec/opsx artifacts.
- 15: OpenSpec/opsx originals are moved or copied into `Docs/<topic>/loop/` instead of being linked from `phase-artifacts.md` or `opsx-index.md`.
- 15: implementation tasks do not require TDD per task via superpowers or equivalent fallback.
- 15: phase_eval skips the checker subagent, or is scored only by the main agent without a separate checker.
- 15: the checker subagent that scores baseline or phase artifacts is the same agent instance that produced those artifacts.
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
- Checker score: <integer>
- Side effects performed: none
- Handoff question:
- Recommended next route:
- Risks:
- Review limits:
```
