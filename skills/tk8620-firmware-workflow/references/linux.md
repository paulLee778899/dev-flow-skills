# Linux TK8620 Firmware Workflow

## Table of Contents

- [Select Architecture](#select-architecture)
- [Toolchain](#toolchain)
- [Environment](#environment)
- [Build](#build)
- [Serial And Burn](#serial-and-burn)
- [Common Failures](#common-failures)

Use this reference when the current host is Linux.

## Select Architecture

Check host architecture:

```bash
uname -m
```

- `x86_64`: use the repository-declared Linux toolchain directly. If the repository matches the known Nuclei 2020.08 flow, or has no declared version and the user accepts this fallback, the Nuclei 2020.08 Linux64 toolchain below is the known-compatible fallback.
- `aarch64` or other ARM Linux: prefer Docker `linux/amd64`, following the same container strategy as macOS.

## Toolchain

Expected project-local path:

```text
.toolchains/nuclei-2020.08-linux64/gcc/bin/riscv-nuclei-elf-gcc
```

Verify:

```bash
.toolchains/nuclei-2020.08-linux64/gcc/bin/riscv-nuclei-elf-gcc --version
```

Expected:

```text
riscv-nuclei-elf-gcc (GCC) 9.2.0
```

If missing, obtain the verified Nuclei 2020.08 Linux64 archive from the team artifact store or the public fallback URL:

```text
https://download.nucleisys.com/upload/files/toolchain/gcc/nuclei_riscv_newlibc_prebuilt_linux64_2020.08.tar.bz2
```

Expected archive details:

```text
file: nuclei_riscv_newlibc_prebuilt_linux64_2020.08.tar.bz2
size: 106162516 bytes
sha256: 398c25b9385b8122d2e864bf71e47b1d871f6c326c21d0ae6d3afd2858f36041
```

Extract it under the project root as `.toolchains/nuclei-2020.08-linux64/`.

Verify checksum before extracting. If this check fails, stop and do not use the archive:

```bash
printf '%s  %s\n' \
  398c25b9385b8122d2e864bf71e47b1d871f6c326c21d0ae6d3afd2858f36041 \
  .toolchains/downloads/nuclei_riscv_newlibc_prebuilt_linux64_2020.08.tar.bz2 | sha256sum -c -
```

## Environment

```bash
export TOOLCHAIN="$PWD/.toolchains/nuclei-2020.08-linux64/gcc/bin"
export PATH_SEPARATOR=:
export TOOLCHAIN_PREFIX="$TOOLCHAIN/riscv-nuclei-elf-"
```

Install host dependencies if needed. Debian/Ubuntu example:

```bash
sudo apt-get update
sudo apt-get install -y make python3
```

Fedora example:

```bash
sudo dnf install -y make python3
```

Provide `python` if the SDK Makefiles require it:

```bash
mkdir -p /tmp/tk8620-tools
ln -sf "$(command -v python3)" /tmp/tk8620-tools/python
export PATH="/tmp/tk8620-tools:$PATH"
```

## Build

Prefer the repository's own build entry. A common SDK layout is:

```bash
COMPILE_BURN="$(find "$PWD" -maxdepth 3 -type d -name Compile_burn -print -quit)"
test -n "$COMPILE_BURN" || { echo "Compile_burn not found" >&2; exit 2; }
SDK_ROOT="${COMPILE_BURN%/Compile_burn}"
cd "$SDK_ROOT/Compile_burn/tk8620_soc"
PATH_SEPARATOR=: TOOLCHAIN_PREFIX="$TOOLCHAIN/riscv-nuclei-elf-" python3 build.py build -j 8
```

For Make-based targets:

```bash
PATH_SEPARATOR=: make -j4 TOOLCHAIN_PREFIX="$TOOLCHAIN/riscv-nuclei-elf-"
```

## Serial And Burn

Linux serial ports usually look like:

```text
/dev/ttyUSB0
/dev/ttyACM0
```

The user may need dialout permissions:

```bash
groups
sudo usermod -aG dialout "$USER"
```

Group changes usually require a new login session. Use the burn/serial reference before flashing.

## Common Failures

- `Permission denied` on serial port: check group membership or use a temporary privileged test only with user approval.
- `riscv-nuclei-elf-gcc: not found`: verify `TOOLCHAIN_PREFIX` and executable bit.
- `Exec format error`: the Linux64 toolchain is x86_64; use Docker `linux/amd64` on ARM Linux.
- Linker region overflow: keep `.map` and link logs; no burnable firmware exists if the link failed.
