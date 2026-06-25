# Classification Reference

## Classification Order

Apply the first strong match, then record secondary types when useful.

1. `status-recovery` if the user asks about progress, continuation, resuming, current state, blockers, or "继续上次".
2. `change-adjustment` if the user changes, narrows, reverses, or reinterprets an already discussed or approved requirement.
3. `review` if the user asks to review, inspect, audit, evaluate, critique, check risks, or look for bugs without explicitly asking to modify.
4. `debugging` if the request contains a bug, failing test, build failure, runtime error, regression, unexpected behavior, broken interaction, bad log, or incident.
5. `ui-ux` if the main success criterion is user-facing presentation, layout, interaction, copy, visual polish, responsive behavior, accessibility, or browser-rendered experience.
6. `feature` if the user asks for new behavior, a new workflow, a new capability, an integration, or normal implementation work.
7. `question` if the user only wants explanation, comparison, or read-only advice with no workflow commitment.

Tie-breakers:

- Review intent wins over implementation intent unless the user explicitly asks to fix the findings.
- Debugging wins over UI/UX when the UI problem is broken behavior rather than design improvement.
- Change-adjustment wins when an active dev-flow, spec, plan, or recent task is being modified.
- UI/UX can be primary with `feature` secondary when the work adds UI capability but visual/interaction quality is the main acceptance criterion.
- If uncertain after inspecting local context, choose the route that preserves safety and ask one concise clarification before side effects.

## Task Types

| Task type | Strong signals | Recommended route |
|---|---|---|
| `debugging` | 报错, 测试失败, build failed, regression, 不符合预期, 页面点不了, 日志异常 | `dev-flow-debugging` |
| `feature` | 新增, 支持, 实现, 接入, 增加流程, 用户故事 | `dev-flow-master` governed/lightweight path |
| `change-adjustment` | 刚才那个改成, 需求变了, 不要这样, 重新调整, 继续但换方向 | `dev-flow-master` recovery or replan path |
| `review` | review, 帮我看, 检查问题, 评审, audit, 找风险 | `dev-flow-review` |
| `ui-ux` | 页面, 布局, 视觉, 交互, 响应式, 可访问性, 文案, 截图 | `dev-flow-ui-ux` |
| `status-recovery` | 进度, 到哪了, 继续上次, 恢复, 还剩多少 | `dev-flow-master` context recovery |
| `question` | 怎么理解, 有什么建议, 比较一下, 解释 | direct answer or read-only analysis |
| `loop_engineering` | outer loop design, recurring triage, loop control, loop envelope, scheduling a scan/monitor, automation safety review, loop handoff governance | direct invocation of `/dev-flow-loop`, `/dev-flow-loop-triage`, `/dev-flow-loop-envelope`, or `/dev-flow-scheduler` — bypasses dev-flow phases; do not route to dev-flow-execution or dev-flow-planning |

```yaml
loop_engineering:
  description: User asks for outer loop design, recurring triage, automation safety review, loop control, scheduling a scan/monitor, or defining a loop envelope
  recommended_route: direct invocation of /dev-flow-loop, /dev-flow-loop-triage, /dev-flow-loop-envelope, or /dev-flow-scheduler
  note: Loop engineering requests bypass dev-flow phases; do not route to dev-flow-execution or dev-flow-planning
```

## Risk Flags

Risk flags do not replace task type. They upgrade complexity, add required checks, or change the next owner.

- `security`: auth, permissions, secrets, sensitive data, injection, abuse, external trust boundary.
- `api_contract`: public API, SDK, protocol, schema, event, webhook, compatibility.
- `data_migration`: database migration, data shape rewrite, backfill, irreversible transformation.
- `ui_runtime`: browser runtime, responsive layout, accessibility, upload/download, visual regression risk.
- `test_quality`: missing tests, flaky tests, coverage, quality gate, regression tests.
- `performance`: latency, memory, throughput, rendering performance, profiling.
- `release_ops`: deployment, rollback, production operations, launch sequencing.
- `ci_tooling`: CI, build scripts, dependency/toolchain/environment failure.

## Output Contract

Return an `intent_decided` block for `dev-flow-master` to consume:

```yaml
intent_decided:
  task_type: debugging
  secondary_types:
    - ui-ux
  confidence: high
  evidence:
    - "用户描述页面按钮点击无效"
    - "这是异常行为而非新功能请求"
  risk_flags:
    - ui_runtime
  action_mode: investigate_then_fix
  recommended_route: dev-flow-debugging
  required_protocols:
    - reproduce_failure
    - root_cause_analysis
    - regression_verification
  next_step: reproduce_the_failure
```

Field descriptions:

- `task_type`: primary classified intent type (see Task Types table).
- `secondary_types`: additional intent types that apply but did not win the tie-breaker.
- `confidence`: `high`, `medium`, or `low` — how certain the classification is.
- `evidence`: short list of signals from the user's words or persisted artifacts that support the classification.
- `risk_flags`: zero or more flags from the Risk Flags list that apply to this request.
- `action_mode` (optional): how the classified intent should be executed. Values: `investigate_then_fix` (gather information before implementing), `implement_directly` (implement without investigation phase), `review_only` (produce assessment without implementation).
- `recommended_route`: the dev-flow skill or path that should handle this request.
- `required_protocols`: ordered list of protocols the handling skill must follow.
- `next_step`: the first concrete action the handling skill should take.

Keep evidence short and tied to the user's words or persisted artifacts. Do not expose speculative internal reasoning.
