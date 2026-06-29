# Flash Gate

Use this reference before preparing Flash Gate authorization, flashing hardware, collecting gating serial evidence, or claiming hardware smoke/release evidence. Do not use it to define generic dev-flow approval storage or acceptance policy.

## Approval Package

Hardware flashing requires a persisted Flash Gate package. In unattended dev-test loops, create this package from the approved `tk8620_automation_envelope` before execution starts; do not ask again before each flash if the action remains inside the envelope.

```yaml
flash_gate:
  mode: manual-once|preapproved-unattended
  gate_decision:
    gate: flash
    decision: approved
    approved_scope:
      - application_flash
      - serial_capture
      - hardware_smoke
  target_port:
  control_port:
  board_assumptions:
  wiring_assumptions:
  exact_flash_command_template:
  risk_notes:
  stop_conditions: []
  typed_evidence:
    flash:
      artifact_trust:
      artifact_trust_hash:
      target_arch_check:
      application_sha256:
      bootloader_sha256:
```

Manual mode may present the package to the user once and persist approval. Preapproved unattended mode is valid only when the automation envelope already authorizes `flash`, names the ports, board assumptions, exact command source/template, stop conditions, and evidence output root.

This skill does not self-approve Flash Gate decisions. It may derive the package from a user-approved automation envelope, but it must persist and reread the package before flashing or collecting gating serial evidence.

## Structured Evidence

For `tools.compile_burn.workflow.workflow`, the persisted Flash Gate must be exported as structured JSON. The workflow tool refuses Markdown/text-only gate evidence for hardware side effects; it parses JSON and checks typed Flash Gate fields before burn/serial work.

Gating runs must provide structured authorization through `workflow.py` or an equivalent maintained wrapper. Without that wrapper, `flash`, `serial`, and `hardware-smoke` are non-gating diagnostics only.

## Pre-Flash Recheck

Immediately before flashing, opening serial for gating evidence, or collecting serial evidence for release readiness, reread the persisted Flash Gate authorization, structured Flash Gate JSON, and current `artifact_trust` block.

Continue only when all are true:

- `gate_decision.gate: flash`
- `gate_decision.decision: approved`
- `mode` is `manual-once` or `preapproved-unattended`.
- Approval identity matches the caller-provided Flash Gate package.
- `typed_evidence.flash.exact_flash_command` or `exact_flash_command_template` resolves to the command about to run.
- `typed_evidence.flash.flash_cwd` equals the current working directory.
- `typed_evidence.flash.application_sha256` equals `artifact_trust.application_sha256`.
- `typed_evidence.flash.bootloader_sha256` equals `artifact_trust.bootloader_sha256` when bootloader is used.
- Build log, map file, linker script, hashes, and `link_status: pass` match the current `artifact_trust` block.
- Bootloader pairing and recovery assumptions match the current `artifact_trust` block.
- `typed_evidence.flash.artifact_trust` is a copy of the current firmware evidence report export.
- `typed_evidence.flash.artifact_trust_hash` matches compact sorted JSON of `artifact_trust` excluding only `artifact_trust_hash`.
- `typed_evidence.flash.artifact_trust_status: pass`.
- `typed_evidence.flash.target_arch_check.status: pass`.
- `typed_evidence.flash.target_arch_check.readelf_machine` contains RISC-V and matches actual `readelf -h` output.
- `typed_evidence.flash.target_arch_check.file_type` is not Mach-O/x86/arm64 host executable and matches actual `file <elf_artifact>` output.
- `typed_evidence.flash.target_arch_check.toolchain_is_cross: true`.
- `typed_evidence.flash.target_arch_check.size_source` is `target-map` or `riscv-size` and equals `artifact_trust.size_source`.
- `typed_evidence.flash.target_arch_check.load_addr_in_flash: true`.
- `typed_evidence.flash.elf_artifact`, `elf_sha256`, `image_artifacts`, and objcopy hashes match current files.
- Artifact mtimes are newer than `artifact_trust.build_started_at`.
- Target and control ports match the selected ports.
- Board, wiring, and boot-mode assumptions match the presented Flash Gate evidence and are non-empty.
- `typed_evidence.flash.canonical_source: true`.
- Firmware reviewer provenance is `subagent|human`, never `main`, `self`, or empty; report path and hash are present in the governing evidence list.

If any value changed, stop with a `blocked` provider result and request envelope/package repair. In unattended mode, do not improvise a new command or ask interactively in the middle of flashing.

Serial-only monitor sessions that are not used as gating evidence may run only when the current authorization allows `serial` and the output is labeled `non-gating diagnostic`. They cannot satisfy hardware validation, smoke, or release evidence.
