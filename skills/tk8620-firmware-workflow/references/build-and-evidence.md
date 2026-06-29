# Build And Evidence

## Table of Contents

- [Build Contract](#build-contract)
- [Target Architecture Gate](#target-architecture-gate)
- [Bootloader Decision](#bootloader-decision)
- [Workflow Tool Modes](#workflow-tool-modes)
- [Artifact Trust](#artifact-trust)
- [Size Evidence](#size-evidence)
- [Evidence Output](#evidence-output)
- [Failure Routes](#failure-routes)

Use this reference before target builds, bootloader decisions, target-architecture checks, artifact trust, map/size evidence, or evidence reports. Do not use it to define generic planning, phase gates, or acceptance policy.

## Build Contract

Before building:

- Identify host OS and whether native build is supported.
- Verify `python3`, `python`, `make`, and toolchain expectations.
- Preserve local worktree changes.
- Do not delete generated files except through project build clean commands.
- Do not build, clean, or generate files in source baseline/reference directories.
- Confirm the caller requested this domain check and allowed the needed side effect. If prerequisite evidence is missing, return `blocked` instead of running a speculative gating build.

Preferred target command:

```bash
python3 <target_source_directory>/build.py build -j 8
```

Baseline comparison requires a temporary copy:

```bash
test -f source_projects/sdk2_baseline/build.py
test -f source_projects/bootloader_baseline/build.py
python3 <temporary_baseline_copy>/build.py build -j 8
python3 <temporary_bootloader_copy>/build.py -j 8
```

## Target Architecture Gate

The rewrite must be a RISC-V/Nuclei target build, not a host program. This provider may return `target_build: pass` only after the target architecture checks pass.

After building, record raw command output in `target_arch_check`:

```bash
command -v riscv64-unknown-elf-readelf || command -v riscv-none-elf-readelf || command -v llvm-readelf || command -v readelf
<readelf> -h <artifact>.elf
file <artifact>.elf
<readelf> -l <artifact>.elf
<objdump> -f <artifact>.elf
grep -iE 'FLASH|rom' <target_source_directory>/*.ld
```

Reject the artifact if:

- `readelf`/`llvm-readelf` is unavailable or raw output is missing.
- `readelf -h` machine is not RISC-V.
- `file` reports Mach-O, ELF x86-64, arm64, or another host executable.
- The build command used host `cc`/`gcc` instead of a RISC-V/Nuclei cross-compiler.
- The `.map` is a placeholder/host map, or `build.py` self-describes output as a host/scaffold placeholder.
- The LOAD segment vaddr from `readelf -l` is outside the FLASH region declared in the linker script.
- Artifact mtime is older than the recorded build start.
- Artifact SHA is not bound to the current build log.

Size evidence must come from the target `.map` and `riscv*-size`/`readelf` of the RISC-V ELF, never host-binary byte size.

## Bootloader Decision

Default to application firmware only. Build or flash the bootloader only when:

- The user explicitly asks for bootloader, full image, factory image, first-time programming, or recovery.
- Bootloader source, flash layout, linker script, boot parameters, reset/boot protocol, or burn protocol changed.
- No trusted bootloader artifact exists but the workflow requires one.
- Project documentation says bootloader and application must be released as a matched pair.

Before flashing bootloader, require recovery path and bootloader-flash authorization in the automation envelope or manual Flash Gate package. In unattended mode, missing bootloader authorization is `blocked`.

## Workflow Tool Modes

Run help before relying on examples:

```bash
python3 -m tools.compile_burn.workflow.workflow --help
```

Supported modes:

- **Rewrite-target mode**: pass `--source-dir <target_source_directory>` and explicit `--work <app.hex>`. Gating `flash`, `serial`, `hardware-smoke`, or release evidence must go through `workflow.py` with structured authorization JSON, or an equivalent maintained wrapper.
- **Baseline comparison mode**: build copied `sdk2_baseline` / `bootloader_baseline` packages from `--baseline-copy-dir <temporary-copy-root>`. These artifacts cannot be flashed as rewrite firmware.

For rewrite evidence, prefer the direct build command first, then fill the firmware evidence report from raw build/target-architecture/size evidence. Direct burn CLI use without the structured wrapper is `non-gating diagnostic` only.

## Artifact Trust

Before flashing, record:

- Application artifact path.
- Application source directory and build purpose.
- Bootloader artifact path when used.
- Artifact source: current active-target build.
- Build command, cwd, log path, start/end timestamps, and result.
- Commit or dirty-state summary.
- SHA-256 for every flashed `.hex` or `.bin`.
- Matching `.map`, linker script, link command/log evidence, and link status.
- Target board revision, flash layout, and image pairing requirements.

Do not flash if:

- Target Architecture Gate failed.
- Build or link failed.
- A linker region overflowed.
- `.map` shows out-of-bounds sections.
- Toolchain is non-equivalent and user did not accept it.
- Artifact source is unknown or is not the current active-target build.
- Application source directory is a source baseline/reference directory.
- Build purpose is `baseline-comparison`, `baseline-validation`, or `non-release-spike`.

The `artifact_trust` schema is defined only in `references/build-size-report.md` sections 2a and 2b. Compute `artifact_trust_hash` from compact sorted JSON excluding `artifact_trust_hash`.

## Size Evidence

The `size_evidence` schema is defined only in `references/build-size-report.md` section 3. Compute `size_evidence_hash` from compact sorted JSON excluding `size_evidence_hash`.

Rules:

- `size_source` must be `target-map` or `riscv-size`.
- `rewrite_size`, `rewrite_dec`, and selected metric must be mechanically parsed from `raw_size_output` or the target linker map.
- Human-filled numbers, host-binary size, placeholder maps, and mismatched parsed values fail.
- `baseline_size` / `baseline_dec` are analysis fields unless a future independent baseline-size evidence schema is defined.
- If the active dev-flow/loop requirements or TK8620 handoff has no concrete final size rule, `size_acceptance.status` is `fail` for release evidence.
- Final release evidence accepts only mechanically checkable `<=`, `>=`, or `==` rules.

## Evidence Output

Persist firmware evidence using `references/build-size-report.md`.

Return `pass` for firmware evidence only when applicable fields pass:

- `artifact_trust.status: pass`
- `target_arch_check.status: pass`
- `size_evidence.status: pass`
- `size_evidence.code_size_status: pass`
- `size_evidence.size_acceptance.status: pass`
- `size_evidence.size_acceptance.rule_source` points to the active dev-flow/loop requirement or TK8620 intake handoff.
- `size_evidence.rewrite_dec` is a non-empty integer derived from target raw size/map evidence.
- `firmware_reviewer.status: approved`
- `firmware_reviewer.unresolved_required_findings: []`

## Failure Routes

- Toolchain missing -> host reference and environment setup.
- Build failure -> report exact command and log summary; route code fixes to `dev-flow-execution` when integrated.
- Size overflow -> report region and byte count; route requirement/design/code change to `dev-flow-planning` or `dev-flow-execution`.
- Missing target build script -> route to `dev-flow-execution` or `tk8620-firmware-adapter`.
- Burn tool import/protocol failure -> fix tooling only after inspecting maintained scripts.
- Port ambiguity -> in unattended mode return `blocked` with observed ports and missing role; in manual diagnostic mode request unplug/replug identification.
- Serial evidence mismatch -> capture bounded logs and route behavior analysis to validation or implementation.
