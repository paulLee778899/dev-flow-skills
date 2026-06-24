---
name: dev-flow-git
description: Use when dev-flow must choose or apply Git isolation, commits, PRs, patch-ready output, conflict handling, rollback, branch cleanup, or side-effect permissions.
---

# dev-flow-git

Own Git isolation, integration mode, side-effect permissions, rollback, conflict handling, and cleanup. Execution may reference Git mode but must not invent Git permissions.

## Core Contract

- Resolve Git mode before Phase 2 Gate.
- If any batch runs multiple concurrent writing agents, worktree mode is mandatory unless agents are read-only/patch-ready and the main agent serially applies changes.
- Default to patch-ready mode when commits, pushes, PRs, merges, or destructive actions are not explicitly authorized or supported.
- Use exact canonical integration state names in persisted artifacts.
- Preserve unrelated user changes and avoid staging/committing them unless explicitly authorized.

## References

- Read `references/modes-and-states.md` before selecting isolation mode, integration mode, writer concurrency, or canonical task integration states.
- Read `references/operations-and-safety.md` before creating worktrees/branches, staging, committing, pushing, opening PRs, merging, applying shared patches, handling conflicts, rolling back, or cleaning up.

## Required Signal

Emit `git_safe` with isolation mode, integration mode, writer concurrency limit, allowed/forbidden side effects, permission check result, rollback constraints, unresolved blockers, and allowed canonical integration states.
