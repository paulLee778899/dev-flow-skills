# Runtime And Dispatch Reference

## Table of Contents

- [Agent Cap](#agent-cap)
- [Default Execution Actor](#default-execution-actor)
- [Runtime Orchestration State](#runtime-orchestration-state)
- [Run-to-Completion Loop](#run-to-completion-loop)

## Terminology

**Sub-wave**: A sub-wave is a subset of tasks within a batch that are dispatched together for parallel execution. A batch may be split into multiple sub-waves when task dependencies or agent-cap constraints prevent all tasks from running simultaneously.

## Agent Cap

| Project size | Total tasks | Max concurrent agents per batch |
|---|---:|---:|
| Small | 1–5 | 2 |
| Medium | 6–15 | 4 |
| Large | 16+ | 6 |

If `branch-only serial mode` is selected by `dev-flow-git`, writer cap is 1 and all implementation writes run serially.

If `shared-working-tree serial agent mode` is selected by `dev-flow-git`, writer cap is 1, but the writing unit may be a task sub-agent directly modifying the current local checkout. The main agent coordinates, verifies, reconciles state, and dispatches the next writing agent only after the current task settles.

If `shared-worktree patch mode` is selected, analysis/patch-producing agents may run up to the normal agent cap, but shared working-tree writes still have writer cap 1. The main agent applies patch outputs serially.

## Execution Actor Proposal

After task orchestration and Git safety checks, propose an execution actor instead of assuming multi-agent dispatch. The main agent remains the coordinator: it dispatches tasks, enforces Git and side-effect boundaries, verifies done signals, reconciles progress, and integrates results.

External helper skills may be used when available, but dev-flow must remain executable without private/local skills by following the fallback execution rules in this skill.

Use task batches, dependency order, agent cap, and the `git_safe` writer limit to decide whether tasks can run in parallel. If direct parallel writes are proposed, ask for explicit approval and recommend worktree isolation without forcing it. Without approval, use serial subagent execution, shared-worktree patch mode, or main-agent serial execution. If the user requests main-agent-only serial work at Phase 2 Gate, follow that override.

If subagent dispatch is unavailable in the current platform, continue with main-agent serial execution using the same task/test contract and record the fallback in `progress.md` and the final delivery report.

## Runtime Orchestration State

During Phase 3, maintain an in-memory Runtime Orchestration State derived from:

1. `task-orchestration.md`
2. `test-plan.md`
3. `dev-flow-state.md`
4. `progress.md`
5. actual task results
6. actual Git / filesystem state

Track at least:

- current phase, batch, sub-wave
- pending / running / completed / failed / skipped / deferred / blocked tasks
- retry counts
- task dependency graph
- execution batches and sub-waves
- parallel safety and file/symbol overlap constraints
- active Executable Test Matrix
- Git isolation and integration mode
- execution actor mode and any fallback
- fallback mode, if any
- last known artifact revision or update summary

`task-orchestration.md` is the canonical persisted plan, but Phase 3 dispatch is driven by Runtime Orchestration State. After any artifact change, rebuild or reconcile runtime state before dispatching more work. Never continue from a stale in-memory task list.

## Run-to-Completion Loop

Once Phase 3 begins, this is not an interactive step-by-step workflow.

Loop:

1. Select the next unresolved batch/sub-wave from Runtime Orchestration State.
2. Dispatch eligible tasks up to the agent cap, excluding tasks whose file/symbol overlap or `git_safe` writer limit requires serialization.
3. Wait for dispatched tasks to settle.
4. Collect every final signal and verify required done signals.
5. If shared-worktree patch mode is active, apply settled patch outputs serially in the main working tree.
6. Run per-task and batch checks from the Executable Test Matrix.
7. Update `progress.md`, affected orchestration/test artifacts, and Runtime Orchestration State.
8. If the batch passes, immediately advance to the next batch/sub-wave without asking.
9. After all batches pass, invoke `dev-flow-acceptance`.

Do not stop after a task, batch, progress update, sub-agent success, fallback selection, patch-ready output, or automatic replan if execution can safely continue.

Hard-stop conditions are limited to:

- retry limit exhausted and a user recovery decision is required (retry limit = 3, as defined in task-settlement-and-modes.md § Failure Handling)
- destructive Git operation or unsafe side effect requires explicit approval through `dev-flow-git`
- requirement-baseline or acceptance-baseline change requires Phase 1 or Phase 2 gate re-entry
- missing external dependency cannot be mocked, stubbed, skipped, deferred, or otherwise resolved under fallback rules
- repository/bookkeeping/runtime-state inconsistency would make next dispatch unsafe
- all batches are settled and control must move to `dev-flow-acceptance`

These are **not** hard-stops by themselves:

- ambiguity that can be resolved by reading existing artifacts or inspecting project state
- failing tests inside an active TDD loop
- dependency changes that can be handled by Dynamic Replanning
- missing test commands that can be added to the Executable Test Matrix without changing acceptance baseline
- Git capability gaps that can use `patch-ready mode`
- user refusal of worktrees when `shared-worktree patch mode` can safely preserve multi-agent analysis
- child-agent intermediate errors before final settlement

Forbidden stopping language:

- “下一步可以继续执行...”
- “是否继续下一个 batch？”
- “我已经完成 Batch 1，等待你的确认”
- “任务已完成，后续可以运行测试”
- “patch 已准备好，是否需要我继续？”

Correct behavior:

- “Batch 1 已通过，正在启动 Batch 2。”
- “T-03 patch-ready，验证已通过，继续执行同批剩余任务。”
- “所有任务已完成，正在运行最终 Executable Test Matrix。”
