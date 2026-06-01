---
description: Run the governed Dev Flow workflow for a development task.
---

# Dev Flow

Use this command as the Claude Code slash-command entrypoint for Dev Flow Skills.

## Workflow

1. Use the `dev-flow-master` skill as the entry controller.
2. Let `dev-flow-master` load `dev-flow-intent` to classify the request as debugging, feature, change-adjustment, review, UI/UX, status-recovery, or question.
3. Follow the focused route chosen by the master: `dev-flow-debugging`, `dev-flow-ui-ux`, `dev-flow-review`, or the governed planning/execution path.
4. If planning is required, use `dev-flow-planning` before implementation and wait for required user confirmations.
5. During implementation, use `dev-flow-execution` to continue until all planned tasks settle.
6. Use `dev-flow-git` before any Git side effect such as branching, committing, PR creation, patch generation, rollback, or cleanup.
7. Before reporting completion, use `dev-flow-acceptance` to collect verification evidence and write the delivery decision.

## Rules

- Do not skip clarification, planning, orchestration, Git safety, or acceptance gates when the task requires governed flow.
- Do not treat this command as a chat-only summary. It is an execution workflow.
- Do not skip intent classification for new dev-flow entry requests.
- Before Phase 3, show the default multi-agent/subagent execution mode after orchestration and Git checks; user approval accepts it unless they override to main-agent serial execution.
- If requirements change during execution, return to planning before continuing implementation.
- If local files would be overwritten, preserve modified content unless the user explicitly approves a force operation.

## User Request

Apply the workflow above to the user's current request and any arguments supplied after `/dev-flow`.
