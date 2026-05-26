---
description: Enter the intent-routed dev-flow system through dev-flow-master
---

Enter the intent-routed dev-flow system.

Use `dev-flow-master` as the top-level controller for deciding:

- what the user's intent is through `dev-flow-intent`
- whether this is debugging, feature work, change-adjustment, review, UI/UX, status recovery, or a question
- whether the request should use the lightweight opsx artifact path or the governed document path
- whether a focused skill such as `dev-flow-debugging`, `dev-flow-ui-ux`, or `dev-flow-review` owns the next step
- when `superpowers brainstorming` must happen
- how the four Chinese planning docs should be governed
- that Phase 2 Gate must show the default multi-agent/subagent execution mode after orchestration and Git checks
- when a stage is actually ready to be reported complete
- which focused `dev-flow-*` sub-skill owns the current stage

---

**Input**: The argument after `/dev-flow` is the user's current request, goal, or development-flow context.

Examples:

- `/dev-flow 帮我先按规范梳理这个新功能`
- `/dev-flow 先看看有没有相关 spec`
- `/dev-flow 这个需求先不要写代码，先做分析和设计`

---

## What This Command Does

`/dev-flow` is a **thin entry command**.

It should:

1. Read the user's current request or context.
2. Enter the `dev-flow-master` skill.
3. Let that skill load `dev-flow-intent`, classify the request, and decide the route.
4. Load the required focused sub-skill (`dev-flow-debugging`, `dev-flow-ui-ux`, `dev-flow-review`, `dev-flow-planning`, `dev-flow-execution`, `dev-flow-git`, or `dev-flow-acceptance`).
5. Present user-facing replies in Chinese.

It should **not**:

- duplicate the routing and gating logic already defined in `dev-flow-master`
- skip intent classification for new entry requests
- duplicate the detailed stage logic owned by focused `dev-flow-*` sub-skills
- replace `opsx-propose`, `opsx-explore`, or `opsx-apply`
- embed the four document templates directly

---

## Expected Behavior

After entering this command, the workflow should be governed by `dev-flow-master`, which will decide whether to:

- check for existing change/spec context
- classify user intent through `dev-flow-intent`
- route debugging, UI/UX, and review work to focused skills
- route lightweight work into the built-in opsx artifact flow
- route medium/heavy work into the governed document path
- ask for review mode
- invoke `superpowers brainstorming`
- govern the four Chinese docs and their completion gate
- delegate stage-specific details to focused sub-skills instead of keeping all workflow logic in the entry command

For lightweight requests, this command should ultimately lead into built-in OpenSpec artifact creation in the active project context. For governed medium/heavy requests, it should ultimately lead into the required formal document artifacts rather than stopping at a chat-only design summary.

Intermediate stage progress may be reported briefly, but should not imply a pause unless the workflow has hit a real blocker, a user-owned decision, or true overall completion.

---

## Guardrails

- Keep this command short and stable
- Treat `dev-flow-master` as the owner of governance logic
- Do not re-implement downstream opsx or superpowers behavior here
- Use this command as an entry point, not as a second workflow engine
- Do not let OpenSpec-path work end as oral discussion only when formal documents are required
