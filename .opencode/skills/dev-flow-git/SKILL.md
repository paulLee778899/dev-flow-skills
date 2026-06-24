---
name: dev-flow-git
description: Use when dev-flow must choose or apply Git isolation, commits, PRs, patch-ready output, conflict handling, rollback, branch cleanup, or side-effect permissions.
---

# dev-flow-git

Own Git isolation, integration mode, side-effect permissions, rollback, conflict handling, and cleanup. Execution may reference Git mode but must not invent Git permissions.

## Boundary

This skill owns Git isolation mode selection, branch/worktree lifecycle, integration state transitions, rollback, and safety gate enforcement. Does NOT execute code changes — only manages Git state.

## Core Contract

- Resolve Git mode before Phase 2 Gate.
- Never force worktree mode. Recommend or ask for it when concurrent direct writers would benefit from isolation; if not approved, use serial writers or shared-worktree patch mode.
- Default to patch-ready mode when commits, pushes, PRs, merges, or destructive actions are not explicitly authorized or supported.
- Use exact canonical integration state names in persisted artifacts.
- Preserve unrelated user changes and avoid staging/committing them unless explicitly authorized.

## References

- Read `references/modes-and-states.md` before selecting isolation mode, integration mode, writer concurrency, or canonical task integration states.
- Read `references/operations-and-safety.md` before creating worktrees/branches, staging, committing, pushing, opening PRs, merging, applying shared patches, handling conflicts, rolling back, or cleaning up.

## Language Policy

All user-facing replies in dev-flow are in Chinese.

## Required Signal

Emit `git_safe` with isolation mode, integration mode, writer concurrency limit, allowed side effects, forbidden side effects, capability/permission check result, rollback constraints, unresolved Git blockers, and allowed canonical integration states.

Full YAML schema for `git_safe` is defined in `dev-flow-master/references/state-and-gates.md` § Signal Schemas. The field list here is the authoritative prose summary; the YAML block in state-and-gates.md is the authoritative machine-readable definition.
