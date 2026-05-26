# macOS TK8620 Firmware Workflow

Use this reference when the current host is macOS.

## Strategy

Do not execute the bundled Windows `.exe` compiler on macOS. First read the repository's declared toolchain version. If the SDK matches the known TK8620 Nuclei 2020.08 / GCC 9.2.0 flow, or if no version is declared and the user accepts this fallback, use Docker `linux/amd64` with the Linux64 Nuclei toolchain.

Native macOS RISC-V GCC builds can be used for diagnostics only; do not treat them as final burnable verification unless the user explicitly accepts the toolchain difference.

## Docker Check

```bash
docker version
docker run --platform linux/amd64 --rm ubuntu:22.04 uname -m
```

Expected container architecture:

```text
x86_64
```

If Docker Desktop refuses to mount `/Volumes/...`, copy the project and toolchain into a temporary container with `docker cp`, run the build there, and copy logs/artifacts back.

## Toolchain Acquisition

Preferred team distribution:

1. Store the verified Nuclei 2020.08 Linux64 archive in an internal artifact store or release asset.
2. Publish its size, SHA-256, and expected extracted path.
3. Ask developers to extract it under the project root as `.toolchains/nuclei-2020.08-linux64/`.
4. Do not commit the expanded toolchain to source control.

Verified archive details:

```text
file: nuclei_riscv_newlibc_prebuilt_linux64_2020.08.tar.bz2
size: 106162516 bytes
sha256: 398c25b9385b8122d2e864bf71e47b1d871f6c326c21d0ae6d3afd2858f36041
```

Public fallback URL:

```text
https://download.nucleisys.com/upload/files/toolchain/gcc/nuclei_riscv_newlibc_prebuilt_linux64_2020.08.tar.bz2
```

Setup from the project root:

```bash
mkdir -p .toolchains/downloads .toolchains/nuclei-2020.08-linux64
curl -L -o .toolchains/downloads/nuclei_riscv_newlibc_prebuilt_linux64_2020.08.tar.bz2 \
  https://download.nucleisys.com/upload/files/toolchain/gcc/nuclei_riscv_newlibc_prebuilt_linux64_2020.08.tar.bz2
shasum -a 256 .toolchains/downloads/nuclei_riscv_newlibc_prebuilt_linux64_2020.08.tar.bz2
printf '%s  %s\n' \
  398c25b9385b8122d2e864bf71e47b1d871f6c326c21d0ae6d3afd2858f36041 \
  .toolchains/downloads/nuclei_riscv_newlibc_prebuilt_linux64_2020.08.tar.bz2 | shasum -a 256 -c -
tar -xjf .toolchains/downloads/nuclei_riscv_newlibc_prebuilt_linux64_2020.08.tar.bz2 \
  -C .toolchains/nuclei-2020.08-linux64 --strip-components=1
```

## Container Setup

Bind-mount flow when Docker can access the project path:

```bash
docker run --platform linux/amd64 --rm -it \
  -v "$PWD":/work -w /work ubuntu:22.04 bash
```

If Docker cannot mount the project path, use a temporary container and `docker cp`:

```bash
CONTAINER=tk8620-build
docker create --platform linux/amd64 --name "$CONTAINER" -it ubuntu:22.04 bash
docker cp "$PWD" "$CONTAINER":/work
docker start -ai "$CONTAINER"
# after building in another terminal:
docker cp "$CONTAINER":/work/path/to/artifacts ./artifacts
docker rm "$CONTAINER"
```

Inside the container:

```bash
apt-get update
apt-get install -y make python3
ln -sf /usr/bin/python3 /usr/local/bin/python
export TOOLCHAIN=/work/.toolchains/nuclei-2020.08-linux64/gcc/bin
export PATH_SEPARATOR=:
export TOOLCHAIN_PREFIX="$TOOLCHAIN/riscv-nuclei-elf-"
```

Verify inside the amd64 container:

```bash
"/work/.toolchains/nuclei-2020.08-linux64/gcc/bin/riscv-nuclei-elf-gcc" --version
```

Expected:

```text
riscv-nuclei-elf-gcc (GCC) 9.2.0
```

## Build

Prefer the repository's own build entry. A common SDK layout is:

```bash
COMPILE_BURN="$(find /work -maxdepth 3 -type d -name Compile_burn -print -quit)"
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

Compilation runs in Docker, but flashing and serial monitoring can run directly on macOS. Port names usually look like:

```text
/dev/tty.usbserial-*
/dev/tty.usbmodem*
```

Use the burn/serial reference before flashing.

## Common Failures

- Container cannot mount `/Volumes/...`: use `docker cp`.
- `python` missing: install Python 3 and create `python -> python3` inside the container.
- Linux build sees `._*` files copied from macOS: remove AppleDouble files in the temporary container copy.
- Case mismatch such as `scripts/` vs `Scripts/`: fix only in the temporary container copy unless the user asks to change the repository.
