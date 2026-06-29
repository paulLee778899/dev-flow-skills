---
name: tk8620-firmware-adapter
description: Use when starting, scoping, changing, or preparing TK8620 / 8620 SDK2.0 firmware work that needs requirements, hard resource metrics, KB/source feasibility, hardware evidence scope, or a domain handoff before generic dev-flow.
---

# TK8620 Firmware Adapter

TK8620 domain entry adapter. Use it before generic dev-flow whenever TK8620 firmware work needs to be started, rescoped, or prepared. It captures firmware-specific requirements and evidence constraints, verifies KB/source feasibility, then hands the confirmed scope to `dev-flow-loop` or `dev-flow-master`. It does not own a project-specific stage machine.

## Language Policy

All user-facing replies and all generated artifact documents (requirements, design, specs, CLI specs, test plans, delivery reports, and other persisted Markdown files) in dev-flow must be written in Chinese.

## Entry Priority

For TK8620 / 8620 SDK2.0 firmware requests, start here before `dev-flow-master` unless the user is asking only for a direct build, burn, serial monitor, or build/burn troubleshooting command. Generic dev-flow starts only after this adapter emits a `tk8620_domain_handoff` or the user explicitly exits the adapter path.

## Boundary

Owns:

- Firmware requirement capture before dev-flow starts.
- One front-loaded confirmation of hard metrics, must-keep behavior, exclusions, hardware assumptions, evidence scope, automation envelope, and permission to enter the selected generic flow when required.
- KB/source feasibility classification.
- Flow selection: default to `dev-flow-loop`; allow `dev-flow-master` for narrow phase work; do not pause for route choice when the automation envelope already authorizes the default.
- TK8620 domain handoff blocks for build, flash, serial, hardware smoke, and release evidence.

Does not own:

- Loop baseline documents, phase DAGs, execution envelopes, OpenSpec/opsx artifacts, task orchestration, code execution, final acceptance, commits, PRs, or generic gate decisions.
- Build, flash, serial capture, or hardware evidence execution. Route those to `tk8620-firmware-workflow`.

## Required Flow

1. Capture requirements, exclusions, hard metrics, interface policy, and evidence scope. Read `references/intake-and-handoff.md`.
2. Establish the automation envelope once: objective, hard metrics, target source, hardware ports/board assumptions, allowed side effects, and stop conditions.
3. Check KB/source/tool/hardware feasibility. Read `references/context-feasibility.md`.
4. If feasibility is `pass` or user-accepted `partial`, enter `dev-flow-loop` by default unless the request matches the narrow `dev-flow-master` rule below.
5. Hand off a `tk8620_domain_handoff` block to the selected generic flow.
6. Ensure every phase test matrix that needs target firmware evidence names `tk8620-firmware-workflow` as the domain test provider.

## Flow Selection

Use `dev-flow-loop` by default for firmware rewrite, trimming, multi-phase delivery, repeated optimization, hardware validation, release-bound work, or any request that should run an automated compile/burn/test loop.

Use `dev-flow-master` only when all are true:

- The task is already scoped and single-phase.
- The request needs generic dev-flow governance, not a long-running loop.
- There is no loop repair, repeated optimization, or repeated hardware validation expectation.
- Firmware evidence can be satisfied by a bounded phase test matrix.

Do not route direct diagnostics through `dev-flow-master`. If the user only asks for direct build, inspect size, flash, open serial, or troubleshoot burn/serial without development flow, route directly to `tk8620-firmware-workflow`.

After feasibility, state the selected route and continue. Ask only when route selection would change side effects, exceed the approved automation envelope, or the user explicitly asks to choose.

## Hard Stop Conditions

Block before handoff if:

- The user has not confirmed final objective and target project identity.
- A must-have behavior, removed behavior, interface policy, or size/resource rule is contradictory.
- Feasibility is `blocked`.
- A release-gate resource rule lacks a machine-checkable metric, comparison, target value, and evidence source.
- The automation envelope lacks required side-effect authorization for build, artifact write, flash, serial, hardware smoke, Git, or external tool setup.
- A requested hardware action lacks target/control ports, board assumptions, exact command source, or stop condition.
- The selected generic flow will write baseline/control artifacts and the current turn lacks explicit approval to proceed. A user request such as "开始", "继续", "走 loop", "全自动跑", or equivalent counts only when the automation envelope is complete.

## References

- `references/intake-and-handoff.md`: read before requirement capture, front-loaded automation envelope confirmation, intake brief writing, flow selection, or dev-flow handoff.
- `references/context-feasibility.md`: read before KB/source feasibility checks, source evidence discovery, CodeGraph use, or feasibility output.
