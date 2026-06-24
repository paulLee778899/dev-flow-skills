---
description: Run the governed Dev Flow workflow for a development task.
---

# Dev Flow

Use this command as the Codex slash-command entrypoint for Dev Flow Skills.

## Workflow

1. Use the `dev-flow-master` skill as the entry controller.
2. Let `dev-flow-master` load `dev-flow-intent` to classify the request as debugging, feature, change-adjustment, review, UI/UX, status-recovery, or question.
3. Follow the route chosen by the master: focused diagnosis/review, lightweight opsx/OpenSpec artifact path, or governed planning/execution path.
4. If the request is lightweight and changes code, config, tests, or user-visible behavior, create/apply/verify the OpenSpec artifacts before completion, normally through `/opsx:ff`, `/opsx:apply`, and `/opsx:verify`; focused skills may operate inside that path, not replace it.
5. If planning is required, use `dev-flow-planning` before implementation and wait for required user confirmations.
6. During implementation, use `dev-flow-execution` to continue until all planned tasks settle.
7. Use `dev-flow-git` before any Git side effect such as branching, committing, PR creation, patch generation, rollback, or cleanup.
8. Before reporting completion, use `dev-flow-acceptance` to collect verification evidence and write the delivery decision.

## Rules

- Do not skip clarification, planning, orchestration, Git safety, or acceptance gates when the task requires governed flow.
- Do not treat this command as a chat-only summary. It is an execution workflow.
- Do not skip intent classification for new dev-flow entry requests.
- Lightweight work must leave persisted evidence through opsx/OpenSpec artifacts. If opsx/OpenSpec is unavailable or uninitialized, stop and ask whether to initialize/install it or reclassify into governed planning. A direct change without artifacts is only allowed if the user explicitly exits dev-flow.
- Before Phase 3, show the proposed execution actor after task orchestration, parallel-safety, and Git checks; do not assume multi-agent or worktree use without explicit approval.
- Do not run CR automatically. After delivery, users may run `/dev-flow-cr` after their own acceptance.
- If requirements change during execution, return to planning before continuing implementation.
- If local files would be overwritten, preserve modified content unless the user explicitly approves a force operation.

## User request

Apply the workflow above to the user's current request and any arguments supplied after `/dev-flow`.
