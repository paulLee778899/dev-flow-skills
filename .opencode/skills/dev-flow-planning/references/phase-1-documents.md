# Phase 1 Documents Reference

## Table of Contents

- [Phase 1 — Four Planning Documents](#phase-1--four-planning-documents)
- [Canonical Workspace](#canonical-workspace)
- [Requirement Variant](#requirement-variant)
- [Brainstorming Handoff](#brainstorming-handoff)
- [Review Mode](#review-mode)
- [Design Sufficiency Gate](#design-sufficiency-gate)
- [Diagram Governance](#diagram-governance)
- [Revision Loop](#revision-loop)
- [Phase 1 Signal](#phase-1-signal)

## Phase 1 — Four Planning Documents

Governed medium/heavy work requires persisted local files:

1. 需求分析（product or software variant）
2. 概要设计
3. 详细设计
4. 测试方案

Template sources are skill-owned assets. Resolve them relative to the installed `dev-flow-master` skill directory first:

- `dev-flow-master/templates/product-requirement-analysis.md`
- `dev-flow-master/templates/software-requirement-analysis.md`
- `dev-flow-master/templates/high-level-design.md`
- `dev-flow-master/templates/detailed-design.md`
- `dev-flow-master/templates/test-plan.md`

Platform-specific install paths such as `.opencode/skills/dev-flow-master/templates/...`, `skills/dev-flow-master/templates/...`, `~/.agents/skills/dev-flow-skills/dev-flow-master/templates/...`, or `~/.claude/skills/dev-flow-master/templates/...` are valid only as resolved locations for the same skill-owned assets. Do not treat `.opencode` as the only template source.

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
- `dev-flow-state.md`
- later: `task-orchestration.md`, `progress.md`, `delivery-report.md`

Legacy path rule: a legacy flat artifact set is a directory that already contains one or more governed artifact filenames from the list above outside `Docs/<topic>/` or `docs/<topic>/`. Reuse it only when it clearly belongs to the active work; otherwise create the canonical topic directory.

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
- Track revision count per document in `dev-flow-state.md`.
- Maximum 3 revisions per document per session.
- After 3 revisions, present choices: accept current version, restart that document from brainstorming, or pause.
- Do not silently apply a 4th revision.

### Phase 1 Signal

Emit and persist `planning_docs_ready` with: four document paths, requirement variant, review mode, design sufficiency result, unresolved/accepted risks, Phase 1 Gate readiness, and the `dev-flow-state.md` path.
