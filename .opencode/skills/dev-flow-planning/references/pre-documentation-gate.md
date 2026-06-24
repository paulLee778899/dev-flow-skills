# Pre-Documentation Gate Reference

## Planning State Ledger

From `documentation_start_approved` onward, maintain `Docs/<topic>/dev-flow-state.md` or `docs/<topic>/dev-flow-state.md` beside the planning documents. If an existing legacy flat artifact set is reused, place the state file beside those artifacts and record that legacy location in the file.

The state ledger must include:

- chosen workspace path and whether it is canonical or legacy
- blocking and non-blocking questions, answers, accepted assumptions, and open issues
- technology-stack decision status
- review mode
- document revision counts
- signal entries for `documentation_start_approved`, `planning_docs_ready`, and `task_orchestration_ready`
- Phase 1 and Phase 2 gate presentation summaries and explicit user approval text when approvals occur
- stale/repair notes after interruption, compaction, or requirement changes

Use `progress.md` for execution progress, but do not wait for Phase 3 to persist planning gate state. Chat memory is not evidence for planning approvals or revision counts.

## Pre-Documentation Gate — Clarify Before Writing

Do not start drafting the four planning documents immediately after routing into governed planning.

Before drafting, stop and ask the user to confirm whether to begin document drafting, after presenting a concise clarification checklist. This is a user-facing gate because formal planning documents shape the solution and may encode assumptions that are expensive to unwind later.

Required behavior:

1. Summarize the current understanding of the request in Chinese.
2. Ask structured clarification questions for information that would materially affect requirements, design, tests, technology choices, delivery risk, or acceptance.
3. Separate questions into **blocking** and **non-blocking**.
4. Do not draft documents while blocking questions remain unanswered. If a blocking question receives no answer after 2 reminder prompts within the same session, offer the user three options: (a) provide the missing information now, (b) accept the uncertainty as a known risk and proceed with a documented assumption, or (c) pause the flow. Do not silently proceed or loop indefinitely. If the user selects pause: write a `gate_paused` entry to `dev-flow-state.md` with fields: `gate: pre-documentation`, `paused_at: <timestamp>`, `blocking_questions: [list]`, `resume_condition: user provides answers`. This ensures context recovery can distinguish a paused gate from one that was never entered.
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

Emit and persist `documentation_start_approved` with: summary of understood scope, answered blocking questions, accepted assumptions/open issues, technology-stack decision status, review mode, explicit approval to start drafting, and the chosen `dev-flow-state.md` path.
