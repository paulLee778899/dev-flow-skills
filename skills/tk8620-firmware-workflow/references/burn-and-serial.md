# TK8620 Burn And Serial

Use this reference before flashing hardware or opening a serial console. Do not use it to define host-specific setup; load the relevant host reference for OS command variants.

## Table of Contents

- Dependencies
- Script Checks
- Port Identification
- Unattended Mode
- Hardware Mode
- Artifact Trust Gate
- Command Shape
- Serial Console

## Dependencies

Verify Python and pyserial without mutating the host when possible:

```bash
python3 --version
python3 -c "import serial; print(serial.__version__)"
```

Windows:

```powershell
py -3 --version
py -3 -c "import serial; print(serial.__version__)"
```

If `pyserial` is missing, prefer a project-local virtual environment. Any `pip install` that changes the host Python environment must be preauthorized in the automation envelope or handled as manual remediation. In unattended mode, missing host-mutation authorization is `blocked`.

Current-project burn entrypoints:

```text
tools/compile_burn/burn_tool/burn_8620_cli.py
tools/compile_burn/burn_tool/tk8620_burn.py
tools/compile_burn/workflow/workflow.py
```

Adjacent protocol files must remain available:

```text
tools/compile_burn/burn_tool/crc32_ref.py
tools/compile_burn/burn_tool/burnpatch.h
```

## Script Checks

From project root:

```bash
python3 -m tools.compile_burn.burn_tool.burn_8620_cli --help
python3 -m tools.compile_burn.workflow.workflow --help
```

If imports fail, support files are missing, or help output fails, stop and fix the local burn tool before any hardware action.

## Port Identification

Never guess target and control ports.

Common ports:

- Windows: `COM5`, `COM4`
- macOS: `/dev/tty.usbserial-*`, `/dev/tty.usbmodem*`
- Linux: `/dev/ttyUSB0`, `/dev/ttyACM0`

List detailed ports:

```bash
python3 -m serial.tools.list_ports -v
```

Windows:

```powershell
py -3 -m serial.tools.list_ports -v
```

If roles are unclear in an unattended loop, return `blocked` with the observed port list and missing role. Do not guess and do not ask interactively in the middle of the burn/test phase. For a manual diagnostic session, ask the user to unplug and replug the target board, then the control board, and compare port details.

## Unattended Mode

In `unattended_dev_test_loop`, target/control ports, board wiring, boot mode, baud rate, expected smoke patterns, retry count, and stop conditions come from `tk8620_automation_envelope`. The provider should:

1. List ports and match the envelope.
2. Run the structured workflow wrapper.
3. Capture bounded serial logs.
4. Evaluate expected pass/fail patterns.
5. Return `pass`, `fail`, or `blocked` with evidence.

Do not pause for human confirmation when the command, ports, artifacts, and board assumptions match the envelope and Flash Gate package.

## Hardware Mode

The current workflow expects a control board for automatic reset/download mode when flashing.

Common wiring:

```text
control board GPIO3 -> target board GPIO7
control board GPIO6 -> target board RST
```

Before flashing, verify board voltage level, reset control, boot strap/mode, board revision, and jumper/switch assumptions against the automation envelope or manual Flash Gate package.

## Artifact Trust Gate

Before flashing, verify against the firmware evidence report and Flash Gate package:

- Application artifact path and source.
- Bootloader artifact path and source if bootloader is used.
- SHA-256 for every flashed file.
- Matching `.map`, linker script, build log, build command, and build cwd.
- Target board revision and flash layout assumptions.
- Whether bootloader/application images must be paired.

Portable checksum:

```bash
APP_HEX=path/to/app.hex
python3 - <<'PY' "$APP_HEX"
import hashlib, pathlib, sys
path = pathlib.Path(sys.argv[1])
print(hashlib.sha256(path.read_bytes()).hexdigest(), path)
PY
```

Windows checksum:

```powershell
$AppHex = "path\to\app.hex"
Get-FileHash -Algorithm SHA256 $AppHex
```

Do not flash rewrite firmware if artifact source is unknown, artifact source is not the current active-target build, linking failed, a linker region overflowed, the `.map` shows out-of-bounds sections, required build/map/log evidence is missing, or the toolchain is non-equivalent without explicit envelope/manual acceptance.

## Command Shape

For gating `flash`, `serial`, `hardware-smoke`, or release evidence, use `tools.compile_burn.workflow.workflow` with structured authorization JSON, or an equivalent maintained wrapper that mechanically checks Flash Gate, artifact hashes, exact command, ports, and artifact-trust block. If no such wrapper exists, hardware actions are limited to `non-gating diagnostic`.

The exact structured authorization flags depend on the current workflow tool. Always run:

```bash
python3 -m tools.compile_burn.workflow.workflow --help
```

Then use only documented authorization flags.

### Direct diagnostic path

Use a direct diagnostic command only when the user explicitly asks for a non-gating flash/serial diagnostic or the current tool version has no structured authorization support. Label all resulting output `non-gating diagnostic`; it cannot satisfy gating hardware evidence. In unattended release or phase-test mode, missing structured authorization support is `blocked`.

```bash
python3 -m tools.compile_burn.workflow.workflow \
  --port <TARGET_PORT> \
  --ctrl-port <CONTROL_PORT> \
  --source-dir source_projects/rewrite_<project-id> \
  --work <APP_HEX> \
  --evidence-out <diagnostic-evidence-dir>/<run-id>.json \
  --serial-log <diagnostic-evidence-dir>/<run-id>.log
```

Application path must be explicit for rewrite flashing. Do not rely on workflow auto-selection for release or Flash Gate evidence. For application-only flashing with no gating serial capture, add `--no-console` and omit `--serial-log`. Add `--boot <BOOT_HEX> --allow-boot-flash` only when bootloader flashing has its own envelope/manual hardware authorization and recovery assumption.

## Serial Console

Open serial monitoring only when:

- The user requested monitor-only mode, or
- Burn completed and the smoke test requires bounded log capture.

Capture bounded logs with start/end time and port identity. Do not claim functional pass from a log unless expected text or command responses are known.

Before serial capture is used as gating evidence, rerun the structured wrapper or reread its structured evidence and verify it matches Flash Gate authorization, artifact hashes, target/control ports, board/wiring assumptions, and current artifact trust block. Monitor-only logs without that structured check must be labeled `non-gating diagnostic`.
