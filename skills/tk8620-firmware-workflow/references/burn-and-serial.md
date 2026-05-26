# TK8620 Burn And Serial

Use this reference before flashing hardware or opening a serial console.

## Dependencies

Verify Python before using the burn scripts. Some SDK burn tools require Python 3.10+ syntax.

```bash
python3 --version
python3 -m pip install pyserial
```

On Windows, use whichever launcher is available:

```powershell
py -3 --version
py -3 -m pip install pyserial
```

Common SDK entrypoints include:

```text
SDK_ROOT/Compile_burn/py_tool/tk8620_burn.py
SDK_ROOT/Compile_burn/py_tool/burn_8620_cli.py
```

The burn protocol is implemented by these SDK scripts and their adjacent support files, not by the skill itself. These files should be obtained from the same TK8620 SDK/release package as the firmware source. If they do not exist, inspect `py_tool/`, README files, and script `--help`. If no project-maintained burn tool exists, flashing is blocked until the user provides the matching SDK burn tool or official protocol documentation.

For the observed SDK, the CLI depends on adjacent files such as `crc32_ref.py` and `burnpatch.h`, waits for boot handshake, sends a `TaoLink.` sync token, writes a RAM patch, switches baud rate when supported, erases/writes flash blocks, and verifies CRC. Use this only as troubleshooting context. Do not reimplement or alter the protocol unless the user explicitly asks for burn-tool development.

## Find Build Directory

POSIX hosts:

```bash
COMPILE_BURN="$(find "$PWD" -maxdepth 3 -type d -name Compile_burn -print -quit)"
test -n "$COMPILE_BURN" || { echo "Compile_burn not found" >&2; exit 2; }
cd "$COMPILE_BURN"
```

Windows PowerShell:

```powershell
$CompileBurn = Get-ChildItem -Path . -Directory -Recurse -Filter Compile_burn | Select-Object -First 1
if (-not $CompileBurn) { throw "Compile_burn not found" }
Set-Location $CompileBurn.FullName
```

If `Compile_burn` is missing, fetch the default SDK workflow source from the current directory before trying burn commands:

```bash
git clone ssh://git@192.168.9.78:10022/end_node/tk8620_ai_devkit.git
```

Windows PowerShell:

```powershell
git clone ssh://git@192.168.9.78:10022/end_node/tk8620_ai_devkit.git
```

If cloning fails, report the SSH/network/permission failure and ask the user for access, a local SDK path, or a same-version release archive. Do not continue to burn.

Check script options before relying on examples:

```bash
python3 -m py_tool.burn_8620_cli --help
```

Windows PowerShell:

```powershell
py -3 -m py_tool.burn_8620_cli --help
```

If `--help` fails because `py_tool` is missing, imports fail, `burnpatch.h` is absent, or Python cannot import local modules, stop and fix the SDK/tooling issue before any hardware action.

## Artifact Trust Gate

Before flashing, report and confirm:

- Application artifact path.
- Bootloader artifact path only if bootloader flashing is required.
- Artifact source: current build, approved release package, CI artifact, or user-provided file.
- Timestamp, build log, commit, or release tag when available.
- SHA-256 for every file that may be flashed.
- Matching `.map` and linker script when available.
- Target board revision, flash size/layout, and whether bootloader/application images must be paired.

POSIX checksum:

```bash
APP_HEX=path/to/app.hex
if command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$APP_HEX"
else
  sha256sum "$APP_HEX"
fi
```

Windows PowerShell checksum:

```powershell
$AppHex = "path\to\app.hex"
Get-FileHash -Algorithm SHA256 $AppHex
```

Do not flash if the artifact source is unknown, the link failed, a linker region overflowed, the `.map` shows an out-of-bounds section, or the toolchain is non-equivalent and the user did not accept that difference.

## Port Identification

Never guess target and control ports.

Port examples:

- Windows: `COM5`, `COM4`
- macOS: `/dev/tty.usbserial-*`, `/dev/tty.usbmodem*`
- Linux: `/dev/ttyUSB0`, `/dev/ttyACM0`

List ports with details:

```bash
python3 -m serial.tools.list_ports -v
```

Windows:

```powershell
py -3 -m serial.tools.list_ports -v
```

If the port roles are unclear, ask the user to unplug and replug the target board, then the control board, and compare the detailed port list. Prefer stable identifiers such as USB serial number, VID/PID, and description over `/dev/ttyUSB0` order.

## Hardware Mode

First determine whether the SDK burn tool expects:

- Single-port burn with manual boot/reset sequence.
- Dual-port burn with a control board for automatic boot/reset.

For dual-port automatic mode, common wiring is:

```text
Control board GPIO3 -> target board GPIO7
Control board GPIO6 -> target board RST
```

Before flashing, confirm board voltage level, reset control, boot strap/mode setting, board revision, and whether jumpers or switches must be set to download mode.

## Burn

Ask for confirmation immediately before flashing a real board.

Application-only burn, preferred when a trusted bootloader is already present and the tool supports it:

```bash
TARGET_PORT=/dev/tty.usbserial-target
CONTROL_PORT=/dev/tty.usbserial-control
APP_HEX=path/to/app.hex
python3 -m py_tool.burn_8620_cli "$TARGET_PORT" --work "$APP_HEX" --ctrl-port "$CONTROL_PORT"
```

Windows PowerShell:

```powershell
$TargetPort = "COM5"
$ControlPort = "COM4"
$AppHex = "path\to\app.hex"
py -3 -m py_tool.burn_8620_cli $TargetPort --work $AppHex --ctrl-port $ControlPort
```

Full image burn, only after the bootloader decision rules in `SKILL.md` say bootloader flashing is required:

```bash
TARGET_PORT=/dev/tty.usbserial-target
CONTROL_PORT=/dev/tty.usbserial-control
APP_HEX=path/to/app.hex
BOOT_HEX=path/to/boot.hex
python3 -m py_tool.burn_8620_cli "$TARGET_PORT" --work "$APP_HEX" --boot "$BOOT_HEX" --ctrl-port "$CONTROL_PORT"
```

Windows PowerShell:

```powershell
$TargetPort = "COM5"
$ControlPort = "COM4"
$AppHex = "path\to\app.hex"
$BootHex = "path\to\boot.hex"
py -3 -m py_tool.burn_8620_cli $TargetPort --work $AppHex --boot $BootHex --ctrl-port $ControlPort
```

If the tool's `--help` shows different option names, follow the script help and preserve the same safety gates.

## Serial Console

For monitoring, use a dedicated serial tool or pyserial/minicom/screen. Do not send commands until the user confirms what should be sent.

macOS example:

```bash
screen /dev/tty.usbserial-XXXX 115200
```

Linux example:

```bash
minicom -D /dev/ttyUSB0 -b 115200
```

Windows examples include PuTTY, Tera Term, or the project's Python serial tool if one exists.

If there is no serial output, do not immediately assume the burn failed. Re-check baud rate, port role, boot mode, reset behavior, and expected firmware banner.

## Safety Notes

- Burning is destructive to target flash. Confirm target/control ports and artifact checksums.
- Flashing bootloader is higher risk than application-only flashing. Confirm user intent, bootloader file source, and recovery path before doing it.
- Port names are not stable identifiers, especially on Linux.
- If multiple serial ports exist, do not guess. Ask the user or list candidates.
- If a serial port is busy, identify the owning process if possible instead of force-killing it.
