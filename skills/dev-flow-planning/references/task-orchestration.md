# Task Orchestration Reference

## Table of Contents

- [Phase 2 — Task Orchestration](#phase-2--task-orchestration)
- [Loop Phase DAG Versus Task DAG](#loop-phase-dag-versus-task-dag)
- [Required Task Schema](#required-task-schema)
- [Execution Batches](#execution-batches)
- [Executable Test Matrix](#executable-test-matrix)
- [Automation Readiness Checklist](#automation-readiness-checklist)
- [Circular Dependency Handling](#circular-dependency-handling)
- [Phase 2 Signal](#phase-2-signal)

## Phase 2 — Task Orchestration

After OpenSpec Baseline Gate is explicitly approved, read the persisted OpenSpec/opsx artifacts, `dev-flow-state.md`, and any loop baseline references. Files are source of truth; do not infer from chat when files exist.

Main duties:

1. Identify implementation tasks implied by OpenSpec requirements, design/spec, tasks, and test artifacts.
2. Build a dependency graph.
3. Detect and resolve cycles before writing final orchestration.
4. Group tasks into execution batches; same-batch tasks have no unmet dependencies and no unresolved high file/symbol overlap risk.
5. Convert the detailed test plan into concrete per-task, per-batch, final integration, and system-level checks.
6. Write `Docs/<topic>/task-orchestration.md` or the canonical legacy path.
7. Run at least 2 independent checker subagents concurrently against raw OpenSpec artifacts and `task-orchestration.md`; revise until all checker scores are at least 95 or a hard blocker is reached.

## Loop Phase DAG Versus Task DAG

When work enters from `dev-flow-loop`, the Loop Phase DAG is already the cross-phase source of truth. `task-orchestration.md` must cover only the current phase's implementation DAG.

Required handling:

- Record the loop ID, phase ID, baseline doc paths, and Loop Phase DAG path.
- Keep task dependencies inside the current phase unless the Loop Phase DAG marks a cross-phase dependency as already satisfied.
- Do not reorder other loop phases from this file; request a loop-level replan instead.
- Use phase-level OpenSpec/opsx artifacts as the phase spec/task source before implementation.
- Map the phase test plan into per-task TDD entry tests, batch checks, final acceptance checks, and system-level checks.
- Return to `dev-flow-loop` after acceptance so loop eval can decide next phase or repair round.

### Required Task Schema

Every task must include:

- task ID (`T-01`, `T-02`, ...)
- task name
- scope: files/modules affected
- implementation scope: what may change and what must not change
- dependencies: explicit list; root tasks must use an empty list and be marked `root: true`
- parallel safety: `file_overlap` (`none`, `low`, `high`), `symbol_overlap` (`none`, `low`, `high`), overlap notes, and forced-serial reason when `file_overlap` or `symbol_overlap` is `high`, or when the orchestration records another safe-integration constraint
- effort estimate: S / M / L
- acceptance criteria
- required diagnostics: `lsp_diagnostics`, lint/typecheck/static checks, or explicit N/A with reason
- required tests: concrete unit/integration/E2E/API/browser/security/performance/system commands, or explicit N/A with reason
- TDD evidence requirement: failing test first, expected failure observed, minimal implementation, green result, refactor result or explicit N/A approved by the user
- negative/edge/failure tests: likely invalid inputs, boundary values, permission failures, network/storage/runtime failures, concurrency/race cases, rollback/retry paths, and compatibility cases relevant to the task
- affected regression scope
- quality gates: list each category and mark N/A with a one-line reason for each excluded gate — categories: source/docs, API contract, UI/browser, security, performance, migration/deprecation, release/rollback
- rollback / recovery note
- done signal: changed files, commands run, pass/fail summary, task local verification evidence, and one canonical Git integration state from `dev-flow-git`

### Execution Batches

Express the DAG as ordered parallel groups:

```text
Batch 1 (parallel): T-01, T-02
Batch 2 (parallel): T-03       ← depends on Batch 1
Batch 3 (parallel): T-04, T-05 ← depends on T-03
```

If a batch exceeds the agent cap (default: 5 parallel sub-agents per batch, defined in `dev-flow-execution/references/task-settlement-and-modes.md`), execution may split it into sub-waves without changing logical dependency ordering.

Parallel safety rules:

- Tasks with `file_overlap: high` or `symbol_overlap: high` must not run as concurrent writers in the same batch/sub-wave.
- Same-file or same-symbol tasks default to serial unless the orchestration records why concurrent work is safe.
- Same-batch tasks with `low` overlap must include an integration order and verification note.
- Read-only, analysis-only, and patch-ready tasks may run in parallel only if `dev-flow-git` mode allows it and writer concurrency remains within `git_safe`.
- The Phase 2 Gate must summarize overlap risks and any forced-serial tasks.

### Executable Test Matrix

The orchestration must include a table mapping every task and batch to executable checks:

- task ID / batch ID
- command or evidence type
- when to run: pre-change, per-task, batch boundary, final acceptance
- pass criteria
- failure owner / recovery path

The matrix must be detailed enough that implementers do not invent coverage during execution. Cover every behavior and likely problem point surfaced by the OpenSpec artifacts:

- normal path and alternative path
- invalid input and boundary conditions
- permission/auth/authz failures
- persistence, migration, rollback, and retry behavior
- concurrency, async timing, idempotency, and ordering issues
- API/protocol/data compatibility and contract errors
- UI loading, error, empty, responsive, accessibility, and browser-runtime cases
- security and abuse cases
- performance limits and regression budgets
- integration points, external dependency failures, and offline/degraded modes

Final integration, regression, and system-level commands must be named before Phase 2 Gate unless explicitly blocked and listed as a gate blocker. System-level checks must verify the whole requested workflow or user/system journey, not only isolated task outputs.

### Independent Orchestration Checker

Before presenting Phase 2 Gate, spawn at least 2 independent checker subagents concurrently with only the raw OpenSpec/opsx artifacts, `task-orchestration.md`, relevant Git diff/status when needed, and the requested review criteria. Do not pass the main agent's expected score or conclusions.

The checker must verify:

- every OpenSpec requirement and acceptance criterion maps to at least one task and one test
- every test-plan item maps to per-task, batch, final, or system-level checks
- DAG dependencies are valid and acyclic
- high-overlap tasks are serialized or have a safe integration plan
- every implementation task has a TDD entry test or an approved exception
- Git/writer safety assumptions are explicit
- system-level tests cover the complete workflow and major failure modes

The Phase 2 Gate is not ready unless `independent_checker_count >= 2` and all independent checker scores are at least 95, or the user explicitly accepts a documented risk.

### Automation Readiness Checklist

Phase 2 is `not-ready` unless:

- every task declares dependencies, using an empty list for root tasks, and has acceptance criteria
- every task declares parallel safety fields and high-overlap tasks are serialized or blocked
- every task has diagnostics or explicit N/A reason
- every task has concrete tests or explicit N/A reason
- every task has TDD evidence requirements or an explicit user-approved exception
- every batch has entry and exit criteria
- final integration/regression commands are named
- system-level acceptance commands are named
- independent orchestration checker count is at least 2 and all checker scores are at least 95, or a documented risk is explicitly accepted
- unresolved approvals, credentials, remotes, external services, or environment assumptions are listed as blockers
- DAG has no cycles
- task IDs are stable enough for progress tracking

### Circular Dependency Handling

If a cycle exists:

- identify the cycle
- resolve by removing weakest dependency, extracting shared prerequisite task, or splitting a task
- do not write final orchestration as ready until cycles are gone

### Phase 2 Signal

Emit and persist `task_orchestration_ready` with: task-orchestration path, task count, batch count, DAG/cycle status, parallel-safety status, forced-serial tasks, detailed Executable Test Matrix status, system-level acceptance checks, `independent_checker_scores`, `independent_checker_count`, checker findings, automation readiness result, blockers, and the `dev-flow-state.md` path.
