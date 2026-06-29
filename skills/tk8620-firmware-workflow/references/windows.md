# Windows TK8620 Firmware Workflow

Use this reference when the current host is Windows.

## Table of Contents

- Current Project Checks
- Toolchain
- Build
- Ports
- Burn And Serial
- Common Failures

## Current Project Checks

From project root:

```powershell
Test-Path tools\compile_burn\workflow\workflow.py
py -3 -m tools.compile_burn.workflow.workflow --help
```

For rewrite validation, also verify the active target:

```powershell
Test-Path <target_source_directory>\build.py
```

## Toolchain

Prefer the active target project's declared or bundled compiler. Find and verify the target toolchain before falling back to baseline comparison paths:

```powershell
Get-ChildItem -Path <target_source_directory> -Recurse -Filter riscv-nuclei-elf-gcc.exe -ErrorAction SilentlyContinue |
  Select-Object -First 5 FullName
```

If the target source declares a toolchain path or prefix, verify that exact compiler:

```powershell
& "<target_toolchain>\riscv-nuclei-elf-gcc.exe" --version
```

Baseline compiler paths may be used only for baseline comparison:

```text
source_projects\sdk2_baseline\toolchain\gcc\bin\
source_projects\bootloader_baseline\toolchain\gcc\bin\
```

Baseline comparison verification:

```powershell
& "source_projects\sdk2_baseline\toolchain\gcc\bin\riscv-nuclei-elf-gcc.exe" --version
```

Expected family:

```text
riscv-nuclei-elf-gcc (GCC) 9.2.0
```

Do not silently replace the compiler with another RISC-V toolchain.

## Build

Preferred rewrite target command:

```powershell
py -3 <target_source_directory>\build.py build -j 8
```

For baseline comparison, copy the source baseline or bootloader baseline to a temporary directory first, then build the copy:

```powershell
Test-Path source_projects\sdk2_baseline\build.py
Test-Path source_projects\bootloader_baseline\build.py
py -3 <temporary_baseline_copy>\build.py build -j 8
py -3 <temporary_bootloader_copy>\build.py -j 8
```

Collect artifacts:

```powershell
Get-ChildItem -Path <target_source_directory> -Recurse -Include *.elf,*.hex,*.bin,*.map |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 20 FullName,Length,LastWriteTime
```

For baseline comparison, collect artifacts from the temporary baseline copy, not from source baseline/reference directories. Do not build, clean, or generate files in place inside source baseline/reference directories.

## Ports

Windows ports usually look like:

```text
COM3
COM4
COM5
```

List details:

```powershell
py -3 -m serial.tools.list_ports -v
```

If `pyserial` is missing, prefer a project-local virtual environment. Any `pip install` that changes the host Python environment must be preauthorized in the automation envelope or handled as manual remediation. In unattended mode, missing host-mutation authorization is `blocked`.

Do not guess target/control roles.

## Burn And Serial

Use `references/burn-and-serial.md` before flashing.

Windows command variants:

```powershell
py -3 <target_source_directory>\build.py build -j 8
py -3 -m tools.compile_burn.burn_tool.burn_8620_cli --help
```

```powershell
py -3 -m tools.compile_burn.workflow.workflow `
  --port COM5 `
  --ctrl-port COM4 `
  --source-dir source_projects\rewrite_<project-id> `
  --work build\app.hex `
  --evidence-out <diagnostic-evidence-dir>\<run-id>.json `
  --serial-log <diagnostic-evidence-dir>\<run-id>.log
```

Use the workflow command only after applying `references/burn-and-serial.md` and `references/flash-gate.md`. For application-only flashing with no serial capture, add `--no-console` and omit `--serial-log`.

## Common Failures

- Compiler not found: confirm bundled `toolchain\gcc\bin`.
- Python not found: install Python 3 or use SDK-provided Python.
- Burn tool import failure: verify `tools\compile_burn\burn_tool` files exist.
- Linker region overflow: keep `.map` and build logs.
- Multiple COM ports: in unattended mode return `blocked` with observed COM ports and missing role; in manual diagnostic mode request unplug/replug identification.
