# Context Feasibility

## Table of Contents

- [Source Roots](#source-roots)
- [Tool Selection](#tool-selection)
- [Feasibility Output](#feasibility-output)
- [Evidence Dimensions](#evidence-dimensions)
- [Persisted Context Shape](#persisted-context-shape)
- [Stop Conditions](#stop-conditions)

Use this reference before KB/source feasibility checks, source evidence discovery, CodeGraph use, or feasibility output. Do not use it to write requirements, dev-flow artifacts, source edits, build outputs, or hardware evidence.

## Source Roots

Resolve actual paths before reporting evidence:

```text
source_projects/sdk2_baseline/
source_projects/bootloader_baseline/
source_projects/minimal_phy/
source_projects/rewrite_<project-id>/
knowledge_base/sdk2_baseline/
knowledge_base/minimal_phy/
tools/compile_burn/
```

Baseline and reference roots are read-only evidence sources. Do not edit, clean, build in place, or generate files inside them.

The feasibility check precedes generic dev-flow. It answers one question: can the current knowledge base, source tree, tools, and hardware-evidence path support the user's requested firmware work without inventing behavior or commands?

## Tool Selection

- Use CodeGraph for structural questions: definitions, callers, callees, impact, traces, and symbol source.
- Use `rg` or direct file reads for literal strings, comments, logs, command names, AT command names, and file existence.
- If CodeGraph reports stale files, read the listed pending files directly or sync before relying on structural results.
- Do not paste regenerable call graphs or large symbol dumps into artifacts; summarize conclusions with anchors.

## Feasibility Output

Produce this result before a new integrated dev-flow starts:

```yaml
kb_feasibility:
  producer: tk8620-firmware-adapter
  project_id:
  status: pass|partial|blocked
  source_roots:
    baseline:
      path:
      status: present|missing|not-required
    minimal_reference:
      path:
      status: present|missing|not-required
    bootloader_baseline:
      path:
      status: present|missing|not-required
    target:
      path:
      status: present|missing|to-be-created|not-required
  knowledge_base:
    sdk2_baseline:
      path:
      coverage: sufficient|partial|missing
    minimal_phy:
      path:
      coverage: sufficient|partial|missing|not-required
  codegraph:
    status: available|stale|missing|not-initialized
    pending_sync_files: []
  required_evidence:
    public_api: found|partial|missing|not-required
    at_commands: found|partial|missing|not-required
    phy_bbu_data_path: found|partial|missing|not-required
    isr_startup_vectors: found|partial|missing|not-required
    hardware_registers: found|partial|missing|not-required
    build_scripts: found|partial|missing|not-required
    linker_scripts: found|partial|missing|not-required
    burn_serial_tools: found|partial|missing|not-required
  phase_test_provider:
    skill: tk8620-firmware-workflow
    status: available|missing|partial
    required_for_phase_tests: true|false
  missing_evidence: []
  assumptions: []
  recommended_next_step: dev-flow-loop|dev-flow-master|rebuild-kb|blocked-for-envelope-repair
```

Use `pass` only when every evidence dimension needed by the request is present or not required. Use `blocked` when a must-have source root, KB area, build tool, or hardware evidence path cannot be located and no safe assumption exists. Use `partial` only when the generic flow can carry the gap explicitly as risk and the user accepts that the missing evidence cannot satisfy release or gating hardware checks.

## Evidence Dimensions

Cover only dimensions relevant to the request:

| Dimension | Evidence examples |
|---|---|
| Public API | headers, exported functions, return/error conventions, callbacks/events |
| AT command surface | command table, parser, response format, UART ingress/egress |
| PHY/BBU data path | TX/RX buffers, slot state, ISR flow, timing assumptions |
| Hardware interface | register headers, MMIO access, startup vectors, interrupt handlers, GPIO/UART/RF/BBU/flash/efuse |
| Parameters/storage | flash layout, defaults, CRC/size checks, compatibility decision points |
| Build/link | `build.py`, Makefiles, linker script, startup, toolchain, map artifacts |
| Test assets | static guards, target build command, burn tool, serial workflow, smoke scripts/log expectations |
| Risks | ambiguous legacy behavior, hidden global state, buffer/length risks, missing source evidence |

## Persisted Context Shape

Use this shape when a persisted context packet is useful:

# TK8620 Firmware Context

## Scope

```yaml
context:
  producer: tk8620-firmware-adapter
  project_id:
  request:
  status: pass|partial|blocked
```

## KB Feasibility

<paste kb_feasibility block>

## Evidence Map

| Need | Evidence | Confidence | Next use |
|---|---|---|---|

## Missing Inputs

| Missing input | Blocks flow? | Owner/next action |
|---|---|---|

## Handoff Use

Reference the `tk8620_domain_handoff` block from `references/intake-and-handoff.md`; do not duplicate it here.

## Stop Conditions

Report `blocked` if:

- A required source root is missing.
- The request requires hardware evidence but build/flash/serial tools are missing.
- The request requires target build, Flash Gate, hardware smoke, or release evidence but `tk8620-firmware-workflow` is unavailable.
- CodeGraph is required for impact/trace accuracy and both CodeGraph and direct source fallback are insufficient.
- The user asks to edit baseline/reference sources.
- The next step would execute build, flash, serial, or source edits; route to the owning skill or dev-flow phase instead.
