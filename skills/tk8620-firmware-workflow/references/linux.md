# Linux TK8620 Firmware Workflow

Use this reference when the current host is Linux.

## Table of Contents

- Current Project Checks
- Toolchain
- Environment
- Build
- Serial And Burn
- Common Failures

## Current Project Checks

From project root:

```bash
test -f tools/compile_burn/workflow/workflow.py
python3 -m tools.compile_burn.workflow.workflow --help
```

For rewrite validation, also verify the active target:

```bash
test -f <target_source_directory>/build.py
```

## Toolchain

Use the active target project's declared toolchain if available. If the project matches the known Nuclei 2020.08 / GCC 9.2.0 flow and the automation envelope or manual scope accepts the fallback, a project-local Linux64 toolchain can live at:

```text
.toolchains/nuclei-2020.08-linux64/gcc/bin/riscv-nuclei-elf-gcc
```

Verify:

```bash
.toolchains/nuclei-2020.08-linux64/gcc/bin/riscv-nuclei-elf-gcc --version
```

Expected family:

```text
riscv-nuclei-elf-gcc (GCC) 9.2.0
```

## Environment

```bash
export TOOLCHAIN="$PWD/.toolchains/nuclei-2020.08-linux64/gcc/bin"
export PATH_SEPARATOR=:
export TOOLCHAIN_PREFIX="$TOOLCHAIN/riscv-nuclei-elf-"
```

Host-mutating setup commands require envelope/manual approval before execution. Prefer project-local shims, virtual environments, existing tooling, or containers before changing the host package set or user groups. In unattended mode, missing host-mutation approval is `blocked`; do not ask mid-flow.

Manual host dependency remediation, only after approval:

```bash
sudo apt-get update
sudo apt-get install -y make python3 file binutils
```

Provide `python` if Makefiles require it:

```bash
mkdir -p /tmp/tk8620-tools
ln -sf "$(command -v python3)" /tmp/tk8620-tools/python
export PATH="/tmp/tk8620-tools:$PATH"
```

## Build

Preferred rewrite target command:

```bash
python3 <target_source_directory>/build.py build -j 8
```

For baseline comparison, copy the source baseline or bootloader baseline to a temporary directory first, then build the copy:

```bash
test -f source_projects/sdk2_baseline/build.py
test -f source_projects/bootloader_baseline/build.py
python3 <temporary_baseline_copy>/build.py build -j 8
python3 <temporary_bootloader_copy>/build.py -j 8
```

For Make-based diagnostics:

```bash
PATH_SEPARATOR=: make -j4 TOOLCHAIN_PREFIX="$TOOLCHAIN/riscv-nuclei-elf-"
```

Collect `.elf`, `.hex`, `.bin`, `.map`, and logs from `<target_source_directory>` and its build output directories. Do not build, clean, or generate files in place inside source baseline/reference directories.

Verify target artifacts with the active target toolchain:

```bash
"$TOOLCHAIN/riscv-nuclei-elf-readelf" -h <artifact>.elf
"$TOOLCHAIN/riscv-nuclei-elf-objdump" -f <artifact>.elf
"$TOOLCHAIN/riscv-nuclei-elf-size" <artifact>.elf
file <artifact>.elf
```

If the project declares another `riscv*-` prefix, use its matching `readelf`/`objdump`/`size` tools and record exact paths in `build-size-report.md`.

## Serial And Burn

Linux ports usually look like:

```text
/dev/ttyUSB0
/dev/ttyACM0
```

The user may need dialout permissions. Changing groups is host-mutating and must be preauthorized in the automation envelope or presented as a manual remediation step:

```bash
groups
sudo usermod -aG dialout "$USER"
```

Group changes usually require a new login session. Use `references/burn-and-serial.md` before flashing.

## Common Failures

- Serial permission denied: check group membership.
- Compiler not found: verify `TOOLCHAIN_PREFIX`.
- Exec format error: use an amd64-compatible toolchain or Docker.
- Linker region overflow: keep `.map` and link logs; no burnable firmware exists if link failed.
