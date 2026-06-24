# Routing And Complexity Reference

## Core Skill Boundaries

Dev-flow owns routing, governance, persisted artifacts, handoffs, and evidence contracts. It should not duplicate mature external skill workflows when they are available.

Reuse policy:

- Superpowers workflow skills are stable process dependencies. When a stage lists a required Superpowers sub-skill, load and follow that skill first, then adapt the result into dev-flow's signals, reports, gates, and artifacts.
- Other installed or marketplace skills may be used when available, but dev-flow must not hard-depend on them unless they are part of the current environment. Copy or absorb their useful handling patterns into the focused dev-flow skill so the route still works when those skills are absent.

| Area | Skill | Owns |
|---|---|---|
| Global dispatch | `dev-flow-master` | entrypoint, final route selection, phase gates, signal checks, progress routing |
| Intent classification | `dev-flow-intent` | task type, secondary types, risk flags, recommended route, required protocols |
| Debugging | `dev-flow-debugging` | reproduction, evidence gathering, root-cause diagnosis, fix discipline, regression recommendation |
| UI/UX | `dev-flow-ui-ux` | user-facing UI route, browser/runtime verification expectations, responsive/interaction evidence |
| Review | `dev-flow-review` | read-first review stance, findings-first output, risk and test-gap reporting |
| Planning | `dev-flow-planning` | four Chinese docs, review cadence, design sufficiency, task DAG, `task-orchestration.md`, Executable Test Matrix |
| Execution | `dev-flow-execution` | Phase 3 run-to-completion, task settlement, Runtime Orchestration State, dynamic replanning, failure handling, progress updates |
| Git safety | `dev-flow-git` | worktree/branch modes, PR/direct/patch-ready modes, permissions, conflicts, rollback, cleanup |
| Acceptance | `dev-flow-acceptance` | final regression, quality evidence, delivery report, acceptance readiness |

Required loading rule: before stage-specific work, load the skill that owns that stage. Every new entry request must load `dev-flow-intent` before complexity classification unless the request is an explicit continuation inside a known phase and the current phase owner is already unambiguous. If areas overlap, the owner in the table above is authoritative. In particular, Git side effects are owned by `dev-flow-git`; execution may reference Git mode but must not invent Git permissions.

## Intent Classification

Before forcing the governed path, load `dev-flow-intent` and obtain `intent_decided`.

`dev-flow-intent` may recommend these task types:

| Task type | Primary owner after master routing | Route behavior |
|---|---|---|
| `debugging` | `dev-flow-debugging` | Reproduce, gather evidence, find root cause, then route fix by complexity |
| `feature` | `dev-flow-master` -> planning/execution owners | Use the normal complexity matrix and governed/lightweight path mapping |
| `change-adjustment` | `dev-flow-master` + current phase owner | Recover context, classify baseline impact, re-enter planning/orchestration gate when needed |
| `review` | `dev-flow-review` | Read-first, findings-first; do not edit unless user asks for fixes |
| `ui-ux` | `dev-flow-ui-ux` | UI/UX-specific design and runtime verification, then normal gates if medium/heavy |
| `status-recovery` | `dev-flow-master` | Reload persisted progress/orchestration/test/Git state before answering or continuing |
| `question` | no governed owner by default | Answer directly or do read-only analysis unless user asks to enter dev-flow |

Tie-breaker rule:

- `change-adjustment` wins when the user modifies an active or recently approved baseline.
- `review` wins when the user asks to evaluate rather than implement.
- `debugging` wins when the request is about broken behavior, even if the broken surface is UI.
- `ui-ux` wins when the main success criterion is user-facing presentation or interaction quality.
- `feature` is the default implementation route after more specific task types are excluded.

Master must convert `intent_decided` into `routing_decided`; no other skill may declare the route final.

## Complexity Classification

Classify before forcing a heavy path. Classification is an internal master decision, not a separate user gate.

| Dimension | Lightweight signal | Medium signal | Heavyweight signal |
|---|---|---|---|
| Files / modules | one known file or one narrow artifact | 2–5 files or 2–3 bounded modules | new module, cross-cutting module set, or unclear file spread |
| Behavior change | no externally visible behavior change, or tiny copy/config change | bounded feature or behavior change with clear acceptance criteria | new workflow, major behavior redesign, or multiple user/system journeys |
| Data / API / protocol | no schema/API/protocol contract change | small API/data shape change with limited consumers | database migration, public API/protocol, SDK, webhook, MQ, or compatibility impact |
| Security / permissions | none | localized validation or permission check | auth, authorization, secrets, external boundary, abuse prevention, or sensitive data |
| UI / runtime surface | none or tiny static text/style change | bounded UI flow or component behavior | multi-page flow, responsive/accessibility-critical UI, upload/download, browser runtime risk |
| Test surface | existing obvious related tests only | new unit/integration tests or limited E2E | multi-layer regression, performance/security/browser/API contract testing |
| Rollback / release risk | trivial revert | local rollback possible | migration, deployment, rollback, compatibility, or release sequencing required |

Routing rule:

- If every applicable dimension is lightweight, classify as **lightweight**.
- If any dimension is heavyweight, classify as **heavyweight** unless existing change/spec context proves the risk is already bounded.
- Otherwise classify as **medium**.
- If key information is unknown, inspect repo/spec context first. If still unknown and uncertainty affects safety, choose the higher-risk classification rather than under-governing.

Path mapping:

- **Lightweight** → lightweight opsx/OpenSpec artifact path; do not generate the four governed Chinese docs unless reclassified.
- **Medium** → governed planning path; load `dev-flow-planning` for docs and orchestration.
- **Heavyweight** → governed planning path with explicit risk, rollback/release, integration-test, and quality-evidence treatment before execution.

### Lightweight OpenSpec / opsx Contract

Lightweight work must still use persisted OpenSpec/opsx artifacts. It must not end as chat-only discussion or as an ad hoc local note when code, config, tests, or user-visible behavior changed.

Use this contract:

- owner: `dev-flow-master` routes; the focused route owner or main agent performs the small change.
- artifact workflow: use the active project's OpenSpec/opsx change workflow, normally `/opsx:ff <change>` to create required artifacts, `/opsx:apply <change>` to implement, and `/opsx:verify <change>` to verify against artifacts. If a change already exists, use `/opsx:continue`, `/opsx:apply`, or `/opsx:verify` as appropriate.
- required artifact evidence: change directory, generated artifact list, task/proposal/spec/design evidence as produced by the active OpenSpec schema, implementation status, verification output, Git/patch state, and unresolved risks.
- Git boundary: use `dev-flow-git` before staging, committing, pushing, opening PRs, merging, rollback, or destructive actions.
- verification: run the smallest command or manual/runtime check that proves the requested behavior; record skipped checks with reason.
- fallback: if OpenSpec/opsx support is absent, missing from the project, or not initialized, do not silently replace it with a handwritten local note. Report the blocker and ask the user to choose either to initialize/install OpenSpec/opsx or to reclassify into governed planning with four dev-flow documents. A direct change without OpenSpec/opsx artifacts is only allowed when the user explicitly exits dev-flow; it is not a dev-flow delivery path.

Required routing output to the user:

```text
任务类型：<debugging|feature|change-adjustment|review|ui-ux|status-recovery|question>
复杂度：<轻量|中量|重量|不适用>
依据：<2-4 个关键维度或意图证据>
路径：<focused route | opsx/OpenSpec artifact | governed planning path | direct answer/read-only>
下一步：<具体阶段>
```
