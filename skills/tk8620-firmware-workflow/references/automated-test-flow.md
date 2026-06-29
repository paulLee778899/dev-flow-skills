# Automated Test Flow

## Table of Contents

- [Purpose](#purpose)
- [Inputs](#inputs)
- [Pipeline](#pipeline)
- [Result Semantics](#result-semantics)
- [Retry Policy](#retry-policy)
- [Evidence Layout](#evidence-layout)

Use this reference before running an unattended TK8620 compile, flash, serial, smoke, or release-evidence loop.

## Purpose

The automated test flow is a machine-run phase test provider. Once `tk8620_automation_envelope` authorizes build, flash, serial, and smoke side effects, the provider runs the sequence without asking the user at each step. This flow is the TK8620-specific test provider that generic `dev-flow-loop` phases call when they need target firmware evidence.

## Inputs

Required:

```yaml
tk8620_automation_envelope:
  mode: unattended_dev_test_loop
  allowed_side_effects: []
  target_source_directory:
  evidence_output_root:
  target_port:
  control_port:
  board_assumptions: {}
  flash_policy: {}
  serial_policy: {}
  smoke_policy: {}
  stop_conditions: []
domain_test_matrix:
  requested_checks: []
```

If a requested check lacks required envelope data, return `blocked` before side effects.

Commands must come from the active checkout and the relevant references:

- Build command: `references/build-and-evidence.md` plus the selected host reference.
- Burn/flash/serial command: `references/burn-and-serial.md`.
- Flash authorization package: `references/flash-gate.md`.
- Evidence schema: `references/build-size-report.md`.

Do not invent build commands, clone substitute SDKs, use historical `Compile_burn/*` paths, or bypass the maintained structured wrapper for gating hardware evidence.

## Pipeline

Run in this order:

1. **Preflight**
   - Resolve `project_root`, `target_source_directory`, and `evidence_output_root`.
   - Verify requested checks and allowed side effects.
   - Verify workflow scripts, pyserial, toolchain, and host reference.
   - List serial ports and match `target_port` / `control_port`.
   - Return `blocked` for missing scripts, missing host dependency authorization, missing ports, or ambiguous roles.

2. **Target Build**
   - Run the target build command.
   - Save raw build log.
   - Stop `fail` on compiler/linker errors.

3. **Target Architecture Gate**
   - Run `readelf`, `file`, `readelf -l`, and `objdump`.
   - Reject host artifacts, placeholder maps, RAM models, stale artifacts, or non-RISC-V output.

4. **Size And Artifact Evidence**
   - Parse target `.map` / `riscv*-size`.
   - Evaluate machine-checkable resource rules.
   - Compute artifact and evidence hashes.
   - Write `build-size-report.md` using the required schema.

5. **Firmware Reviewer Gate**
   - Run independent reviewer or use approved human reviewer evidence.
   - Stop `blocked` if reviewer is unavailable for release/phase evidence.

6. **Flash Gate Recheck**
   - Reread Flash Gate package.
   - Verify exact command/template, ports, artifact hashes, board assumptions, and evidence hashes.
   - Stop `blocked` on mismatch or stale evidence.
   - In unattended mode, repair requires a new envelope/package outside this provider run; do not ask interactively in the middle of flashing.

7. **Burn / Flash**
   - Run the maintained structured wrapper.
   - Save command, stdout/stderr, tool evidence JSON, and flashed artifact hashes.
   - Stop `fail` on burn failure.

8. **Serial Capture**
   - Capture bounded serial logs using envelope baud rate and duration.
   - Save raw log and port identity.
   - Stop `fail` on missing boot output when expected by the smoke policy.

9. **Smoke Evaluation**
   - Send configured commands when provided.
   - Match `pass_patterns` and `fail_patterns`.
   - Stop `fail` if any fail pattern appears or required pass pattern is absent.

10. **Provider Result**
    - Return `pass` only when every requested check passes and evidence files exist.
    - Return `fail` for build, arch, size, flash, serial, or smoke failures with evidence.
    - Return `blocked` for missing prerequisites, stale/mismatched authorization, missing scripts, missing ports, or missing reviewer.

## Result Semantics

```yaml
tk8620_provider_result:
  status: pass|fail|blocked
  requested_checks: []
  completed_checks: []
  failed_checks: []
  blocked_checks: []
  evidence_report:
  logs: []
  flashed_artifacts: []
  serial_logs: []
  stop_reason:
  next_owner:
```

`pass` means the TK8620 domain evidence can satisfy the matching dev-flow phase test matrix row. It does not replace generic dev-flow acceptance.

## Retry Policy

Use retries only when the envelope defines them.

- Build failure: no blind retry; return `fail` with log.
- Port missing: one rescan only if allowed, then `blocked`.
- Flash failure: retry up to `smoke_policy.max_retries` only when the wrapper reports a retryable transport/reset failure.
- Serial/smoke failure: retry only after a successful reflashing or reset action authorized by the envelope.

Never change firmware source, toolchain, ports, baud rate, flash command, or smoke expectations during retry.

## Evidence Layout

Recommended under `evidence_output_root`:

```text
<phase-id>/
  build.log
  target-arch.txt
  firmware-evidence.md
  flash-gate.json
  burn.json
  burn.log
  serial.log
  smoke-result.yaml
  provider-result.yaml
```
