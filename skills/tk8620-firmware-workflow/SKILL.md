---
name: tk8620-firmware-workflow
description: Use when TK8620 / 8620 SDK2.0 firmware work needs target build, RISC-V artifact checks, map/size evidence, artifact trust, burn/flash, serial capture, hardware smoke, release evidence, or build/burn/serial troubleshooting.
---

# TK8620 Firmware Workflow

TK8620 firmware-specific test provider. It supplies target build, artifact, size, flash, serial, hardware smoke, and release firmware evidence for dev-flow phases or direct diagnostics. It does not own requirements, planning, implementation, or generic acceptance.

## Language Policy

All user-facing replies and all generated artifact documents (requirements, design, specs, CLI specs, test plans, delivery reports, and other persisted Markdown files) in dev-flow must be written in Chinese.

## Core Contract

1. Act only as the TK8620 domain test provider or as a direct diagnostic helper for build/burn/serial requests.
2. Read `references/authorization-and-scope.md` before any side effect, target-source selection, or domain-test-provider handoff.
3. Read `references/build-and-evidence.md` before target builds, bootloader decisions, target-architecture checks, artifact trust, map/size evidence, or evidence reports.
4. Read exactly one host reference before host-specific commands: `references/macos.md`, `references/linux.md`, or `references/windows.md`.
5. Read `references/burn-and-serial.md` before port discovery, burn tool use, serial monitoring, or burn/serial troubleshooting.
6. Read `references/flash-gate.md` before preparing Flash Gate packages, flashing hardware, collecting gating serial evidence, or claiming hardware smoke/release evidence.
7. Read `references/automated-test-flow.md` before running unattended compile/burn/serial/smoke loops.
8. Use `references/build-size-report.md` as the firmware evidence schema. Do not invent a looser report format.

## Domain Test Provider

When called from dev-flow, satisfy only the TK8620-specific parts of the Executable Test Matrix:

```yaml
domain_test_provider:
  skill: tk8620-firmware-workflow
  provides:
    - target_build
    - target_architecture_gate
    - map_size_evidence
    - artifact_trust
    - flash_gate
    - burn
    - serial_capture
    - hardware_smoke
    - release_firmware_evidence
  host_tests_are: supporting_only
```

Host tests are supporting evidence only. They cannot satisfy target build, target architecture, artifact trust, Flash Gate, hardware validation, or release readiness.

## Side Effects

Every side effect must be authorized by the current dev-flow phase/test matrix, the `tk8620_automation_envelope`, or by a direct user build/burn/serial request. Do not add a side effect because it would be useful.

| Side effect | Scope |
|---|---|
| `build` | target or approved baseline-comparison build commands |
| `artifact-write` | firmware evidence reports |
| `flash` | burn/flash command after Flash Gate package approval or preapproved unattended Flash Gate |
| `serial` | serial sessions or bounded log capture |
| `hardware-smoke` | serial/output evidence intended for phase or release checks |

Build-only authorization must not flash or collect gating serial evidence. Serial-only diagnostics must be labeled `non-gating diagnostic` unless the active dev-flow phase and Flash Gate both authorize gating hardware evidence. A generic dev-flow test command cannot satisfy TK8620 firmware evidence unless this provider's report is produced.

In unattended dev-test mode, do not pause for human approval before every compile, flash, serial capture, or smoke test. Run the authorized test sequence automatically inside the envelope; stop only on a declared stop condition, stale/mismatched evidence, missing hardware prerequisite, or explicit user interruption. When stopped, return a structured `tk8620_provider_result` instead of asking a new question mid-flow.

## Hard Rules

- Do not build, clean, or generate files inside baseline/reference source directories. Copy them to a temporary directory for baseline comparison.
- Do not use a host binary, RAM model, placeholder map, or self-asserted architecture field as firmware evidence.
- Do not flash if target architecture, artifact trust, size evidence, or Flash Gate package approval/preapproval is missing or stale.
- Do not guess serial target/control ports.
- Do not reimplement the burn protocol from memory; use maintained project scripts only.
- Do not treat direct burn CLI use as gating hardware evidence unless the maintained structured wrapper verifies dev-flow authorization, Flash Gate, artifact hashes, ports, and artifact trust.

## Evidence Output

Persist firmware evidence under the caller-provided evidence directory. For a direct diagnostic request, write evidence only when the user asks and label it `non-gating diagnostic`.

No integrated phase may claim target build, hardware validation, or release readiness until the firmware evidence report has passing `artifact_trust`, `target_arch_check`, `size_evidence`, and required reviewer/flash/serial sections. The firmware reviewer in `references/build-size-report.md` is a required independent approval for dev-flow acceptance or loop `phase_eval`; the main agent must not self-approve firmware evidence.

## References

- `references/authorization-and-scope.md`: authorization contexts, workspace paths, target-source selection, side-effect boundaries.
- `references/build-and-evidence.md`: build flow, target architecture, bootloader decision, artifact trust, size evidence, evidence reporting, failure routes.
- `references/automated-test-flow.md`: unattended compile, flash, serial, smoke, retry, and stop-condition sequence.
- `references/burn-and-serial.md`: pyserial, burn scripts, port identification, hardware wiring, serial console, diagnostic command shape.
- `references/flash-gate.md`: exact Flash Gate approval fields and stale-evidence checks.
- `references/macos.md`, `references/linux.md`, `references/windows.md`: host-specific setup and command variants.
- `references/build-size-report.md`: required firmware evidence schema.
