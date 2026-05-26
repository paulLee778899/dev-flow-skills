---
name: dev-flow-planning
description: Use when governed dev-flow work needs planning documents, document review, task orchestration, DAG batches, or executable test matrix before execution.
---

# dev-flow-planning

Owns planning before execution: pre-document clarification, Phase 1 four Chinese planning documents, and Phase 2 task orchestration. This skill produces `documentation_start_approved`, `planning_docs_ready`, and `task_orchestration_ready`.

## Pre-Documentation Gate — Clarify Before Writing

Do not start drafting the four planning documents immediately after routing into governed planning.

Before drafting, stop and ask the user to confirm whether to begin document drafting, after presenting a concise clarification checklist. This is a user-facing gate because formal planning documents shape the solution and may encode assumptions that are expensive to unwind later.

Required behavior:

1. Summarize the current understanding of the request in Chinese.
2. Ask structured clarification questions for information that would materially affect requirements, design, tests, technology choices, delivery risk, or acceptance.
3. Separate questions into **blocking** and **non-blocking**.
4. Do not draft documents while blocking questions remain unanswered.
5. For non-blocking unknowns, either ask the user to answer them now or explicitly ask whether they accept recording them as assumptions/open issues.
6. Ask for explicit approval to start drafting documents after the clarification state is resolved.

Accepted approval signals include “开始写文档”, “开始生成文档”, “可以写”, “确认”, “继续”, “go ahead”, or equivalent unambiguous approval.

Do not treat silence, unrelated messages, or a vague “随便” as approval to decide major requirements or technology choices.

### Clarification Checklist

Ask only relevant questions, but cover these categories before drafting:

- business goal / user value: what problem is being solved and for whom
- scope / non-goals: what is included and explicitly excluded
- target users / roles / permissions
- core workflows and edge cases
- data model, persistence, import/export, migration, compatibility
- APIs, protocols, third-party integrations, callbacks, webhooks, queues, SDKs
- UI/UX expectations, responsive behavior, accessibility, loading/empty/error states
- security, auth/authz, user input validation, secrets, audit, abuse boundaries
- performance, scale, latency, throughput, capacity, Core Web Vitals where applicable
- observability, logging, metrics, alerts, debugging support
- deployment, release, rollback, feature flags, migration plan
- technology stack, framework/library constraints, existing project patterns, prohibited options
- test requirements: unit/integration/E2E/browser/security/performance/manual acceptance
- acceptance criteria and delivery definition of done
- deadlines, priority, rollout sequence, stakeholder review expectations

### Blocking vs Non-Blocking Unknowns

Treat an unknown as **blocking** when it affects any of:

- requirement baseline or acceptance criteria
- public API/protocol/data schema
- auth/authz/security boundary
- technology stack or framework choice
- migration, compatibility, rollout, rollback, or production risk
- test strategy required to prove completion

Treat an unknown as **non-blocking** only when it can be safely recorded as an assumption or open issue without changing the solution architecture or acceptance baseline.

### Technology Stack Rule

Do not silently choose a technology stack, framework, library, database, queue, protocol, deployment target, or test runner when it materially affects implementation.

Before drafting HLD/DDD for stack-sensitive work:

- inspect existing project patterns first
- ask the user to confirm unknown or ambiguous technology choices
- if the user delegates the decision, record alternatives, rationale, and risks in the documents
- if the decision blocks design quality, do not proceed to final docs until resolved or explicitly accepted as a known risk

### Required Signal

Emit `documentation_start_approved` with: summary of understood scope, answered blocking questions, accepted assumptions/open issues, technology-stack decision status, review mode, and explicit approval to start drafting.

## Phase 1 — Four Planning Documents

Governed medium/heavy work requires persisted local files:

1. 需求分析（product or software variant）
2. 概要设计
3. 详细设计
4. 测试方案

Template sources:

- `.opencode/skills/dev-flow-master/templates/product-requirement-analysis.md`
- `.opencode/skills/dev-flow-master/templates/software-requirement-analysis.md`
- `.opencode/skills/dev-flow-master/templates/high-level-design.md`
- `.opencode/skills/dev-flow-master/templates/detailed-design.md`
- `.opencode/skills/dev-flow-master/templates/test-plan.md`

Do not overwrite templates. Generated artifacts go under the project docs workspace.

### Canonical Workspace

- prefer `Docs/` if it exists, otherwise `docs/`, otherwise create `Docs/`
- use `Docs/<topic>/` or `docs/<topic>/` for governed work
- reuse an existing matching workspace or legacy flat artifact set before creating a new workspace
- never leave the final governed document only in chat

Workspace filenames:

- `software-requirement-analysis.md` or `product-requirement-analysis.md`
- `high-level-design.md`
- `detailed-design.md`
- `test-plan.md`
- later: `task-orchestration.md`, `progress.md`, `delivery-report.md`

### Requirement Variant

Use product variant when centered on product/system composition, hardware+software, devices, protocol stacks, gateways, product features, deployment scenarios, or product functional/performance specification.

Use software variant when centered on software behavior: platform feature, application behavior, backend workflow, UI flow, permission logic, import/export, reporting, integration behavior, or scoped functional enhancement.

If both are plausible and document shape materially changes, ask one short clarification question.

### Brainstorming Handoff

**REQUIRED SUB-SKILL:** Use `superpowers:brainstorming` when available for creative feature shaping, UI concepts, new workflows, or ambiguous behavior changes before implementation planning. Dev-flow still owns the persisted four-document output, review gates, task orchestration, and test matrix.

Before drafting, the handoff must cover:

- background / goals
- scope / non-goals
- design direction
- risks / assumptions
- testing concerns

Brainstorming is preparation, not a substitute for persisted documents.

When converting approved requirements into implementation tasks, use the task-decomposition patterns from `superpowers:writing-plans` when available. Do not replace dev-flow's canonical `task-orchestration.md` or Executable Test Matrix with a superpowers plan file; adapt the useful task granularity, file-scope, TDD, and verification patterns into dev-flow artifacts.

### Review Mode

Supported modes:

- `逐份审阅`
- `集中审阅`（default if no preference）

Review mode controls delivery cadence, not which documents are required.

### Design Sufficiency Gate

Before Phase 1 Gate, verify:

- HLD and DDD use required template structure
- protocol/interface-heavy triggers were evaluated
- if protocol/API/stateful/cross-module work exists, HLD covers functional/workflow guidance and DDD covers concrete protocol design, API description, data, error, state, sequence, compatibility, security, observability, and test points where applicable
- framework/library choices that affect implementation are backed by official docs/source or existing project patterns
- UI work records accessibility, responsive behavior, loading/error/empty states, and browser-runtime verification expectations
- security-sensitive work records auth/authz/input validation/secret handling/error boundaries
- performance-sensitive work records measurable targets and profiling/benchmark method
- architecture-significant decisions record alternatives and rationale
- no blocking TBD remains unresolved unless explicitly accepted by user
- diagrams or ordered textual sequences exist where prose would be ambiguous

If this fails, mark documents `not-ready` and revise before Phase 1 Gate.

### Diagram Governance

For formal product/system documents, diagrams are governed assets. Use `.drawio` editable source + `.svg` publishable asset + Markdown SVG reference when needed. Mermaid is acceptable only for quick internal sketches.

### Revision Loop

- Apply requested revisions and re-present for confirmation.
- Track revision count per document.
- Maximum 3 revisions per document per session.
- After 3 revisions, present choices: accept current version, restart that document from brainstorming, or pause.
- Do not silently apply a 4th revision.

### Phase 1 Signal

Emit `planning_docs_ready` with: four document paths, requirement variant, review mode, design sufficiency result, unresolved/accepted risks, and Phase 1 Gate readiness.

## Phase 2 — Task Orchestration

After Phase 1 Gate is explicitly approved, read all four planning documents from the canonical workspace. Files are source of truth; do not infer from chat when files exist.

Main duties:

1. Identify implementation tasks implied by requirements/design/tests.
2. Build a dependency graph.
3. Detect and resolve cycles before writing final orchestration.
4. Group tasks into execution batches; same-batch tasks have no unmet dependencies.
5. Convert the test plan into concrete per-task, per-batch, and final checks.
6. Write `Docs/<topic>/task-orchestration.md` or the canonical legacy path.

### Required Task Schema

Every task must include:

- task ID (`T-01`, `T-02`, ...)
- task name
- scope: files/modules affected
- implementation scope: what may change and what must not change
- dependencies
- effort estimate: S / M / L
- acceptance criteria
- required diagnostics: `lsp_diagnostics`, lint/typecheck/static checks, or explicit N/A with reason
- required tests: concrete unit/integration/E2E/API/browser/security/performance commands, or explicit N/A with reason
- affected regression scope
- quality gates: source/docs, API contract, UI/browser, security, performance, migration/deprecation, release/rollback where applicable
- rollback / recovery note
- done signal: changed files, commands run, pass/fail summary, Git/patch state

### Execution Batches

Express the DAG as ordered parallel groups:

```text
Batch 1 (parallel): T-01, T-02
Batch 2 (parallel): T-03       ← depends on Batch 1
Batch 3 (parallel): T-04, T-05 ← depends on T-03
```

If a batch exceeds the agent cap later defined by `dev-flow-execution`, execution may split it into sub-waves without changing logical dependency ordering.

### Executable Test Matrix

The orchestration must include a table mapping every task and batch to executable checks:

- task ID / batch ID
- command or evidence type
- when to run: pre-change, per-task, batch boundary, final acceptance
- pass criteria
- failure owner / recovery path

Final integration/regression commands must be named before Phase 2 Gate unless explicitly blocked and listed as a gate blocker.

### Automation Readiness Checklist

Phase 2 is `not-ready` unless:

- every task has dependencies and acceptance criteria
- every task has diagnostics or explicit N/A reason
- every task has concrete tests or explicit N/A reason
- every batch has entry and exit criteria
- final integration/regression commands are named
- unresolved approvals, credentials, remotes, external services, or environment assumptions are listed as blockers
- DAG has no cycles
- task IDs are stable enough for progress tracking

### Circular Dependency Handling

If a cycle exists:

- identify the cycle
- resolve by removing weakest dependency, extracting shared prerequisite task, or splitting a task
- do not write final orchestration as ready until cycles are gone

### Phase 2 Signal

Emit `task_orchestration_ready` with: task-orchestration path, task count, batch count, DAG/cycle status, Executable Test Matrix status, automation readiness result, and blockers.
