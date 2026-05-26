# Windows TK8620 Firmware Workflow

Use this reference when the current host is Windows.

## Toolchain

First read the repository's declared toolchain version. The TK8620 SDK often bundles Windows PE tools under the firmware build tree:

```text
SDK_ROOT\Compile_burn\tk8620_soc\toolchain\gcc\bin\
SDK_ROOT\Compile_burn\tk8620_bootloader\toolchain\gcc\bin\
```

Prefer the bundled compiler when it exists. Do not silently replace it with another RISC-V compiler. If the bundled compiler is missing, use the project's release package or documented toolchain source; label any other compiler as non-equivalent unless the user accepts that difference.

Find the SDK root from PowerShell:

```powershell
$CompileBurn = Get-ChildItem -Path . -Directory -Recurse -Filter Compile_burn | Select-Object -First 1
if (-not $CompileBurn) { throw "Compile_burn not found" }
$SdkRoot = Split-Path -Parent $CompileBurn.FullName
```

Verify the bundled compiler:

```powershell
& "$SdkRoot\Compile_burn\tk8620_soc\toolchain\gcc\bin\riscv-nuclei-elf-gcc.exe" --version
```

If the compiler is already on `PATH`, this is also acceptable:

```bat
riscv-nuclei-elf-gcc --version
```

Expected family:

```text
riscv-nuclei-elf-gcc (GCC) 9.2.0
```

If the compiler is not on `PATH`, use the repository build script first before inventing manual commands. Many Windows SDK layouts add the bundled toolchain path internally.

## Build

From the SDK firmware build directory, prefer the existing Python build entry:

```powershell
Set-Location "$SdkRoot\Compile_burn\tk8620_soc"
py -3 build.py build -j 8
```

For bootloader builds:

```powershell
Set-Location "$SdkRoot\Compile_burn\tk8620_bootloader"
py -3 build.py build -j 8
```

If the project uses Make directly, preserve the repository's toolchain prefix and path separator conventions. Do not replace the bundled compiler with another RISC-V compiler unless the user explicitly asks for a non-equivalent diagnostic build.

Collect the build artifacts after a successful link:

```powershell
Get-ChildItem -Path "$SdkRoot" -Recurse -Include *.elf,*.hex,*.bin,*.map |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 20 FullName,Length,LastWriteTime
```

## Ports

Windows serial ports usually look like:

```text
COM3
COM4
COM5
```

Use Python's detailed port listing before choosing target/control roles:

```powershell
py -3 -m pip install pyserial
py -3 -m serial.tools.list_ports -v
```

Use the burn/serial reference before flashing.

## Burn And Serial

Run burn scripts from `Compile_burn` after applying the artifact trust gate from `references/burn-and-serial.md`.

```powershell
Set-Location "$SdkRoot\Compile_burn"
py -3 -m py_tool.burn_8620_cli --help
$TargetPort = "COM5"
$ControlPort = "COM4"
$AppHex = "path\to\app.hex"
Get-FileHash -Algorithm SHA256 $AppHex
py -3 -m py_tool.burn_8620_cli $TargetPort --work $AppHex --ctrl-port $ControlPort
```

Use the full-image command with a bootloader path only when the bootloader decision rules require it and the user confirms the higher-risk operation.

## Common Failures

- `riscv-nuclei-elf-gcc` not found: confirm the bundled `toolchain/gcc/bin` path or run through the SDK build script.
- Python not found: install Python 3 or use the Python configured by the SDK environment. Prefer Python 3.10+ for burn tools when script syntax is unknown.
- Linker region overflow: keep the `.map` and linker log; do not claim burnable `.hex/.bin` if the link failed.
- Multiple COM ports: do not guess. Ask the user to unplug/replug target and control boards and compare `serial.tools.list_ports -v` output.
