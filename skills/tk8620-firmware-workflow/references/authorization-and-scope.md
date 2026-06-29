# Authorization And Scope

## Table of Contents

- [Required Inputs](#required-inputs)
- [Boundary](#boundary)
- [Workspace Layout](#workspace-layout)
- [Repository Detection](#repository-detection)
- [Active Application Source](#active-application-source)

Use this reference before any side effect, target-source selection, or domain-test-provider handoff. Do not use it to define dev-flow gates, phase envelopes, acceptance rules, or planning artifacts.

## Required Inputs

This provider may perform side effects only when the current request provides:

- `requested_checks`: one or more TK8620 checks such as `target_build`, `target_architecture_gate`, `map_size_evidence`, `artifact_trust`, `burn`, `serial_capture`, or `hardware_smoke`.
- `allowed_side_effects`: exact allowed side effects from the table below.
- `target_source_directory`: the active target source root, or a clear request for non-release diagnostics.
- `evidence_output`: where to write the firmware evidence report, when `artifact-write` is allowed.
- For unattended loops: `tk8620_automation_envelope` with ports, board assumptions, serial policy, smoke policy, and stop conditions.
- For flash/serial gating evidence: a persisted Flash Gate package or preapproved unattended Flash Gate package described in `references/flash-gate.md`.

Without these inputs, answer in discussion-only mode or perform explicitly labeled `non-gating diagnostic` work only when the user requested it.

Every side effect must be explicitly authorized:

| Side effect | Meaning |
|---|---|
| `build` | target or approved baseline-comparison build commands |
| `artifact-write` | firmware evidence reports |
| `flash` | burn/flash command after Flash Gate package approval or preapproved unattended Flash Gate |
| `serial` | serial sessions or bounded log capture |
| `hardware-smoke` | serial/output evidence intended to satisfy phase or release checks |

Build-only authorization must not flash or collect gating serial evidence. Serial-only diagnostic sessions must be labeled `non-gating diagnostic` unless the caller also provides Flash Gate evidence for gating hardware evidence. When the automation envelope authorizes `flash`, `serial`, and `hardware-smoke`, run those actions without additional user prompts as long as every pre-run check still matches the envelope and Flash Gate package.

## Boundary

Owns:

- Toolchain and host environment checks.
- Application and bootloader build invocation.
- Artifact discovery, identity, hashes, and map/size evidence.
- Flash Gate preparation and pre-run rechecks.
- Burn tool invocation after manual Flash Gate approval or preapproved unattended Flash Gate authorization.
- Serial console and bounded log capture.
- Build/burn/serial troubleshooting.

Does not own:

- Requirement intake.
- Source baseline analysis.
- Firmware architecture design.
- Application logic debugging beyond build/burn evidence.
- Generic dev-flow acceptance decisions.

## Workspace Layout

Resolve `project_root` from the active checkout, caller-provided `tk8620_domain_handoff`, or direct user request before running any command. The path below is the current-project default used by the original TK8620 SDK2.0 workspace, not a portable package constant:

```text
<project_root>
```

Current-project path shape:

```text
<project_root>/source_projects/sdk2_baseline/
<project_root>/source_projects/bootloader_baseline/
<project_root>/source_projects/rewrite_<project-id>/
<project_root>/tools/compile_burn/workflow/workflow.py
<project_root>/tools/compile_burn/burn_tool/burn_8620_cli.py
<project_root>/tools/compile_burn/burn_tool/tk8620_burn.py
<project_root>/tools/compile_burn/burn_tool/burnpatch.h
<project_root>/tools/compile_burn/burn_tool/crc32_ref.py
```

Do not assume historical package paths such as `Compile_burn/tk8620_soc`, `Compile_burn/tk8620_bootloader`, or `Compile_burn/py_tool` unless the active checkout actually contains them.

Before building, hashing, flashing, or writing evidence, resolve all source, tool, artifact, and log paths to absolute filesystem paths. Continue only when each resolved path stays under the project root or an approved temporary baseline-copy directory. Reject symlink escapes.

## Repository Detection

From the project root:

```bash
test -f tools/compile_burn/workflow/workflow.py
test -f tools/compile_burn/burn_tool/burn_8620_cli.py
```

If these are missing, stop and report which required workflow source is missing. Do not invent build or burn commands.

## Active Application Source

Select the application source in this order:

1. `tk8620_domain_handoff.canonical_source_roots.target`.
2. Caller-provided `target_source_directory`.
3. Direct user-provided target source, only for explicitly labeled non-release diagnostic work.

Canonical target source directory:

```text
<project_root>/source_projects/rewrite_<project-id>/
```

Do not use a user-provided or non-canonical target directory for rewrite build, Flash Gate, Release Gate, or delivery evidence. A separately requested spike or diagnostic target may be built only as non-release evidence and must be labeled `non-release-spike`.

Before building rewritten firmware:

```bash
test -f <target_source_directory>/build.py
```

If required public API, context, or target source evidence is missing, return a `blocked` provider result and name the missing input. Do not fill the gap by inventing requirements or source paths.

Build `source_projects/sdk2_baseline/` only for source baseline comparison or explicit baseline validation, and only from a copied temporary build directory.

## Unattended Provider Result

When an automated phase cannot continue, return a structured `blocked` or `fail` result instead of asking mid-flow:

```yaml
tk8620_provider_result:
  status: pass|fail|blocked
  stopped_at:
  reason:
  missing_or_failed_prerequisite:
  evidence_report:
  next_owner: tk8620-firmware-adapter|dev-flow-planning|dev-flow-execution|user
```

Use `blocked` for missing envelope fields, missing ports, missing tool scripts, missing structured wrapper, or stale/mismatched Flash Gate evidence. Use `fail` for build, target architecture, size rule, flash, serial, or smoke failures with evidence.
