# macOS TK8620 Firmware Workflow

Use this reference when the current host is macOS.

## Table of Contents

- Strategy
- Current Project Checks
- Docker Check
- Toolchain
- Container Build
- Burn And Serial
- Common Failures

## Strategy

Do not execute bundled Windows compilers on macOS. Prefer Docker `linux/amd64` for firmware builds when the repository toolchain is Linux/Windows specific. Flashing and serial monitoring usually run directly on macOS after artifacts are produced.

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

## Docker Check

```bash
docker version
docker run --platform linux/amd64 --rm ubuntu:22.04 uname -m
```

Expected:

```text
x86_64
```

If Docker cannot mount `/Volumes/...`, use `docker cp` into a temporary container and copy artifacts/logs back.

## Toolchain

Use the active target project's declared toolchain if available. If the project matches the known Nuclei 2020.08 / GCC 9.2.0 flow and the user accepts the fallback, use a verified Linux64 Nuclei toolchain under:

```text
.toolchains/nuclei-2020.08-linux64/gcc/bin/riscv-nuclei-elf-gcc
```

Verify:

```bash
.toolchains/nuclei-2020.08-linux64/gcc/bin/riscv-nuclei-elf-gcc --version
```

Do not treat a non-equivalent toolchain as release evidence unless the user accepts that difference.

## Container Build

Inside a temporary amd64 Linux container, build the active rewrite target. Container package installation is allowed only inside that disposable container and must be recorded in the build log:

```bash
apt-get update
apt-get install -y make python3 file binutils
ln -sf /usr/bin/python3 /usr/local/bin/python
export TOOLCHAIN=/work/.toolchains/nuclei-2020.08-linux64/gcc/bin
export PATH_SEPARATOR=:
export TOOLCHAIN_PREFIX="$TOOLCHAIN/riscv-nuclei-elf-"
python3 <target_source_directory>/build.py build -j 8
```

Collect `.elf`, `.hex`, `.bin`, `.map`, and logs from `<target_source_directory>` and its build output directories. Verify target artifacts with the target toolchain whenever possible:

```bash
"$TOOLCHAIN/riscv-nuclei-elf-readelf" -h <artifact>.elf
"$TOOLCHAIN/riscv-nuclei-elf-objdump" -f <artifact>.elf
file <artifact>.elf
"$TOOLCHAIN/riscv-nuclei-elf-size" <artifact>.elf
```

If the project uses a different `riscv*-` prefix, use the matching `readelf`/`objdump`/`size` from that toolchain and record the exact path.

For baseline comparison, copy the source baseline or bootloader baseline to a temporary directory first, then build and collect artifacts from the copy:

```bash
test -f source_projects/sdk2_baseline/build.py
test -f source_projects/bootloader_baseline/build.py
python3 <temporary_baseline_copy>/build.py build -j 8
python3 <temporary_bootloader_copy>/build.py -j 8
```

Do not build, clean, or generate files in place inside source baseline/reference directories.

## Burn And Serial

macOS port examples:

```text
/dev/tty.usbserial-*
/dev/tty.usbmodem*
```

Use `references/burn-and-serial.md` before flashing.

## Common Failures

- Docker cannot mount `/Volumes/...`: use `docker cp`.
- `python` missing in container: install Python 3 and symlink `python`.
- Linux build sees AppleDouble `._*` files: remove them in the temporary container copy.
- Toolchain architecture mismatch: use amd64 Docker.
