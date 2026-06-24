# Task Orchestration Reference

## Phase 2 — Task Orchestration

After Phase 1 Gate is explicitly approved, read all four planning documents from the canonical workspace. Files are source of truth; do not infer from chat when files exist.

Main duties:

1. Identify implementation tasks implied by requirements/design/tests.
2. Build a dependency graph.
3. Detect and resolve cycles before writing final orchestration.
4. Group tasks into execution batches; same-batch tasks have no unmet dependencies and no unresolved high file/symbol overlap risk.
5. Convert the test plan into concrete per-task, per-batch, and final checks.
6. Write `Docs/<topic>/task-orchestration.md` or the canonical legacy path.

### Required Task Schema

Every task must include:

- task ID (`T-01`, `T-02`, ...)
- task name
- scope: files/modules affected
- implementation scope: what may change and what must not change
- dependencies: explicit list; root tasks must use an empty list and be marked `root: true`
- parallel safety: `file_overlap` (`none`, `low`, `high`), `symbol_overlap` (`none`, `low`, `high`), overlap notes, and forced-serial reason when applicable
- effort estimate: S / M / L
- acceptance criteria
- required diagnostics: `lsp_diagnostics`, lint/typecheck/static checks, or explicit N/A with reason
- required tests: concrete unit/integration/E2E/API/browser/security/performance commands, or explicit N/A with reason
- affected regression scope
- quality gates: source/docs, API contract, UI/browser, security, performance, migration/deprecation, release/rollback where applicable
- rollback / recovery note
- done signal: changed files, commands run, pass/fail summary, review/self-review evidence, and one canonical Git integration state from `dev-flow-git`

### Execution Batches

Express the DAG as ordered parallel groups:

```text
Batch 1 (parallel): T-01, T-02
Batch 2 (parallel): T-03       ← depends on Batch 1
Batch 3 (parallel): T-04, T-05 ← depends on T-03
```

If a batch exceeds the agent cap later defined by `dev-flow-execution`, execution may split it into sub-waves without changing logical dependency ordering.

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

Final integration/regression commands must be named before Phase 2 Gate unless explicitly blocked and listed as a gate blocker.

### Automation Readiness Checklist

Phase 2 is `not-ready` unless:

- every task declares dependencies, using an empty list for root tasks, and has acceptance criteria
- every task declares parallel safety fields and high-overlap tasks are serialized or blocked
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

Emit and persist `task_orchestration_ready` with: task-orchestration path, task count, batch count, DAG/cycle status, parallel-safety status, forced-serial tasks, Executable Test Matrix status, automation readiness result, blockers, and the `dev-flow-state.md` path.
