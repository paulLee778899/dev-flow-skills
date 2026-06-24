# Modes And States Reference

## Phase 2 Git Gate Inputs

Before Phase 3, resolve:

### Isolation Mode

- `worktree mode`: each parallel task uses a dedicated worktree and `task/<task-id>-<short-description>` branch.
- `branch-only serial mode`: current working tree branches only; implementation writes are serial only; effective writer cap = 1.
- `shared-working-tree serial agent mode`: no extra worktree and no extra local branch; task agents may directly modify the current working tree, but only one writing agent may run at a time and each task must settle before the next writing agent starts.
- `shared-worktree patch mode`: multiple agents may work in parallel without worktrees, but they must not write to the shared working tree. They produce patch-ready outputs, implementation plans, or diffs; the main agent applies them serially in the local working tree.

Do not force `worktree mode`. If a batch could use 2+ direct writing agents, recommend worktree isolation and ask before creating it. If worktrees are not approved, direct writes must be serial through `shared-working-tree serial agent mode`, or parallel agents must use `shared-worktree patch mode` while the main agent applies changes one at a time.

Git isolation does not make overlapping implementation safe by itself. Tasks marked with `file_overlap: high` or `symbol_overlap: high` by `dev-flow-planning` must be serialized as writers even in `worktree mode`, unless the orchestration records a specific safe integration strategy.

### Integration Mode

- `PR/review/merge mode`: task branch → commit → PR → review → merge.
- `solo-dev direct-commit mode`: local commit with equivalent self-review; no push/merge unless explicitly approved.
- `patch-ready mode`: no stage/commit/push/PR/merge; report patch/diff-ready status and verification evidence.

Default to `patch-ready mode` when Git side effects are not explicitly authorized or environment support is missing.

### Canonical Task Integration States

Every completed task must use one of these canonical integration states:

| State | Meaning |
|---|---|
| `merged` | Task branch was merged into the approved integration branch. |
| `committed` | Task changes were committed locally but not necessarily pushed or merged. |
| `pr_opened` | A PR was opened and remains the integration handoff. |
| `direct_commit_complete` | Solo-dev direct commit completed with self-review evidence. |
| `patch_ready` | Patch/diff is ready; no local apply, stage, commit, push, PR, or merge occurred. |
| `shared_working_tree_applied` | A serial sub-agent directly modified the current working tree and the main agent verified the result. |
| `applied_from_shared_worktree_patch` | A patch-ready sub-agent output was applied by the main agent to the shared working tree and verified. |
| `deferred_accepted` | Task was explicitly accepted as deferred by the user or an approved gate, with risk recorded. |

Use these exact machine-readable state names in `task-orchestration.md`, `progress.md`, `dev-flow-state.md`, and `delivery-report.md`. Do not invent synonyms such as `PR opened`, `direct-commit complete`, or `shared-working-tree-applied` in persisted task state; human-readable summaries may explain them.
