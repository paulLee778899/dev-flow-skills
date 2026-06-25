# Phase 1 OpenSpec Artifact Reference

## Table of Contents

- [Phase 1 — OpenSpec Baseline Artifacts](#phase-1--openspec-baseline-artifacts)
- [Canonical Workspace](#canonical-workspace)
- [Artifact Variant](#artifact-variant)
- [Brainstorming Handoff](#brainstorming-handoff)
- [Loop Baseline Mode](#loop-baseline-mode)
- [Review Mode](#review-mode)
- [Artifact Sufficiency Gate](#artifact-sufficiency-gate)
- [Independent Checker Review Score](#independent-checker-review-score)
- [Diagram Governance](#diagram-governance)
- [Revision Loop](#revision-loop)
- [OpenSpec Baseline Signal](#openspec-baseline-signal)

## Phase 1 — OpenSpec Baseline Artifacts

All dev-flow implementation work uses persisted OpenSpec/opsx artifacts as the documentation baseline. Medium/heavy work enriches the OpenSpec/opsx change with enough requirement, design, task, spec, and test evidence to support implementation, review, and system-level acceptance.

Expected baseline evidence:

- OpenSpec/opsx change directory and change ID
- requirement/acceptance criteria artifacts required by the active schema
- design/spec artifacts required by the active schema, with extra detail for medium/heavy work
- task artifact with implementation scope and acceptance criteria
- detailed test plan content in the OpenSpec/opsx artifact set
- known blockers, assumptions, non-goals, and unresolved risks
- independent checker review report and score

Use `/opsx:ff <change>` to create or refresh artifacts when starting a new change, `/opsx:continue` when resuming a change, `/opsx:apply <change>` for implementation, and `/opsx:verify <change>` for verification evidence. If OpenSpec/opsx is missing, stop and ask the user to initialize/install it or explicitly exit dev-flow.

Do not overwrite unrelated existing OpenSpec artifacts. Do not create loop-only baseline documents here; the four-document baseline belongs to `dev-flow-loop/assets/baseline-templates/` and is used only before loop execution is approved.

### Canonical Workspace

- prefer the project's existing OpenSpec/opsx location when present; for standard OpenSpec this is normally `openspec/changes/<change-id>/`
- keep `dev-flow-state.md`, `task-orchestration.md`, `progress.md`, and `delivery-report.md` under `Docs/<topic>/` or `docs/<topic>/` when governed orchestration is needed
- reuse an existing matching workspace or active OpenSpec change before creating a new change
- never leave final requirements, design, tasks, or test strategy only in chat

Workspace filenames:

- `dev-flow-state.md`
- `task-orchestration.md`
- `progress.md`
- `delivery-report.md`

Legacy path rule: if a prior run already has matching dev-flow artifacts outside `Docs/<topic>/` or `docs/<topic>/`, reuse it only when it clearly belongs to the active work; otherwise create the canonical topic directory.

### Artifact Variant

Use richer product/system artifact detail when centered on product/system composition, hardware+software, devices, protocol stacks, gateways, product features, deployment scenarios, or product functional/performance specification.

Use richer software behavior artifact detail when centered on platform feature, application behavior, backend workflow, UI flow, permission logic, import/export, reporting, integration behavior, or scoped functional enhancement.

If both are plausible and artifact shape materially changes, ask one short clarification question.

### Brainstorming Handoff

**Optional helper skill:** Use `superpowers:brainstorming` when available for creative feature shaping, UI concepts, new workflows, or ambiguous behavior changes before implementation planning. Dev-flow still owns the persisted OpenSpec/opsx artifact baseline, review gates, task orchestration, and test matrix.

Before drafting, the handoff must cover:

- background / goals
- scope / non-goals
- design direction
- risks / assumptions
- testing concerns

Brainstorming is preparation, not a substitute for persisted OpenSpec/opsx artifacts.

When converting approved requirements into implementation tasks, use the task-decomposition patterns from `superpowers:writing-plans` when available. Do not replace dev-flow's canonical `task-orchestration.md` or Executable Test Matrix with a superpowers plan file; adapt the useful task granularity, file-scope, TDD, and verification patterns into dev-flow artifacts.

### Loop Baseline Mode

When invoked from `dev-flow-loop` with a confirmed loop baseline:

- The loop-owned requirements, high-level design, detailed design, and test plan (`test-plan.md`) are the upstream loop source of truth.
- The loop artifact directory is normally `Docs/<topic>/loop/` or `docs/<topic>/loop/`.
- Keep OpenSpec/opsx originals in `openspec/changes/<change-id>/` or the project's standard OpenSpec/opsx location; do not move or copy them into the loop artifact directory.
- Use the loop's `phase-artifacts.md` or `opsx-index.md` only as an index that maps phase IDs to OpenSpec/opsx change IDs, canonical paths, status, verification evidence, and `phase_eval_result`.
- Do not ask the user to re-confirm the same global baseline for every phase.
- Do not regenerate the full loop-only baseline artifacts inside phase-level dev-flow.
- Create phase-level OpenSpec/opsx artifacts that slice the baseline into the current phase's spec/tasks.
- Create or update the phase-internal `task-orchestration.md` and Executable Test Matrix for implementation.
- Record the loop ID, baseline doc paths, Loop Phase DAG node, envelope limits, and phase artifact index path in `dev-flow-state.md`.
- Return to the loop/user if the phase needs to change requirements, non-goals, acceptance, API/protocol/data/security/release boundaries, or the overall test strategy.

This keeps loop and dev-flow decoupled: loop owns the target and cross-phase DAG; dev-flow owns phase execution artifacts.

### Review Mode

Supported modes:

- `逐项审阅`
- `集中审阅`（default if no preference）

Review mode controls delivery cadence, not which artifacts are required. Gate-impacting review must be performed by an independent checker subagent.

### Artifact Sufficiency Gate

Before OpenSpec Baseline Gate, verify:

- OpenSpec/opsx artifacts exist and match the active schema
- requirements, design/spec, tasks, and test strategy are persisted
- protocol/interface-heavy triggers were evaluated
- if protocol/API/stateful/cross-module work exists, artifacts cover workflow guidance, concrete API/protocol description, data, error, state, sequence, compatibility, security, observability, and test points
- framework/library choices that affect implementation are backed by official docs/source or existing project patterns
- UI work records accessibility, responsive behavior, loading/error/empty states, and browser-runtime verification expectations
- security-sensitive work records auth/authz/input validation/secret handling/error boundaries
- performance-sensitive work records measurable targets and profiling/benchmark method
- architecture-significant decisions record alternatives and rationale
- no blocking TBD remains unresolved unless explicitly accepted by user
- diagrams or ordered textual sequences exist where prose would be ambiguous

If this fails, mark artifacts `not-ready` and revise before OpenSpec Baseline Gate.

If the same artifact set fails the Artifact Sufficiency Gate more than **3 times** without satisfactory revision, emit a hard-stop and ask the user whether to: (a) narrow the scope to remove the unresolvable section, (b) mark the section as a known TBD with an explicit deferral, or (c) pause. Do not allow unbounded revision loops.

### Independent Checker Review Score

Before presenting loop-only baseline artifacts or OpenSpec baseline artifacts for user confirmation, spawn an independent checker subagent to review raw artifacts and score the artifact set from 0-100. The main agent must not score its own artifacts for gate passage.

Score dimensions:

- requirements clarity and acceptance criteria
- blocker/non-goal coverage
- design/spec consistency and implementability
- API/protocol/data/security/UI/performance/release coverage when applicable
- test plan coverage, including every likely behavior, edge case, failure mode, TDD entry point, and final system-level verification
- no unresolved TBD/TODO/contradiction unless explicitly accepted as risk

For loop-only baseline artifacts and medium/heavy OpenSpec baseline artifacts, score must be at least 95 before asking the user to approve execution. If the score is below 95, revise the artifacts and run another independent checker pass. Stop after 3 checker revision rounds and ask the user to narrow scope, accept a known risk, or pause.

Persist the checker score, checker identity/model when available, raw artifact scope, findings, and revision notes in `dev-flow-state.md` for normal governed planning, or in the loop baseline artifact for loop-owned docs.

### Diagram Governance

For formal product/system OpenSpec artifacts, diagrams are governed assets. Use `.drawio` editable source + `.svg` publishable asset + Markdown SVG reference when the artifact includes architecture, protocol flow, or state-machine diagrams. Mermaid is acceptable only for quick internal sketches.

### Revision Loop

- Apply requested revisions and re-present for confirmation.
- Track revision count per artifact set in `dev-flow-state.md`.
- Maximum 3 checker revision rounds per artifact set per session.
- After 3 revisions, present choices: accept current version, restart that document from brainstorming, or pause.
- Do not silently apply a 4th revision.

### OpenSpec Baseline Signal

Emit and persist `openspec_artifact_ready` with: OpenSpec change path, generated artifact list, artifact variant, review mode, independent checker score, checker findings path or summary, unresolved/accepted risks, OpenSpec Baseline Gate readiness, and the `dev-flow-state.md` path. In loop-authorized phase mode, also include the loop artifact directory and `phase-artifacts.md` or `opsx-index.md` path, while keeping the canonical OpenSpec change path outside the loop directory.
