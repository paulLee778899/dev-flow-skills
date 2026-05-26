---
name: tk8620-firmware-workflow
description: Use this skill whenever the user needs to compile, flash/burn, open a serial console, or troubleshoot the build/burn/serial workflow for TK8620 firmware on Windows, macOS, or Linux. This skill focuses only on TK8620 firmware build artifacts, RISC-V/Nuclei toolchains, burn tools, UART/serial ports, Docker or native host setup, and hardware assumptions; it does not cover JTAG/GDB debugging, protocol-stack debugging, or application logic debugging.
---

# TK8620 Firmware Workflow

Use this skill to guide TK8620 firmware compilation, flashing, and serial interaction on the current host system. Keep the workflow generic: do not assume a specific application, protocol stack, editor, or project name unless the user provides one.

## First Principles

- Start from the user's actual TK8620 SDK or firmware repository. The SDK is expected to provide both firmware source and workflow source: `Compile_burn/`, `tk8620_soc/`, `tk8620_bootloader/`, `py_tool/`, `build.py`, `Makefile`, linker scripts, and existing project notes.
- This skill does not bundle SDK workflow source, burn protocol code, toolchains, or build outputs. Compilation and flashing depend on the same-version SDK/release package providing the build scripts and burn scripts. If those workflow files are missing from the SDK checkout, ask for the matching SDK package, repository path, release archive, or clone URL before claiming that compilation or flashing can be performed.
- Identify the host OS before selecting commands. Read the repository's declared toolchain version first; use Nuclei 2020.08 / GCC 9.2.0 only when it matches the SDK or as a clearly labeled known-compatible fallback.
- Build and burn are separate phases. Do not flash hardware until the user confirms target and control ports.
- Treat `.elf`, `.hex`, `.bin`, and `.map` as the expected firmware artifacts. If linking fails, report logs and maps rather than substituting artifacts from a different build.
- Preserve local worktree changes. Build flows may generate logs and artifacts; do not delete or stage unrelated files.

## Repository Detection

Prefer the current workspace if it contains the expected paths. If the current workspace does not contain the SDK workflow sources, clone the canonical SDK workflow repository into the current directory by default:

```bash
git clone ssh://git@192.168.9.78:10022/end_node/tk8620_ai_devkit.git
```

After cloning, use the cloned repository as the SDK root if it contains `Compile_burn/`.

If the clone fails, stop and report the failure. Include the command attempted, the stderr summary, and likely next actions: verify SSH access, VPN/network route, repository permission, SSH key, or provide a local SDK path/release archive. Do not fall back to invented build or burn commands.

Useful probes:

```bash
pwd
find . -maxdepth 3 -type d \( -name Compile_burn -o -name tk8620_soc -o -name tk8620_bootloader -o -name py_tool \) -print
find . -maxdepth 4 -type f \( -name build.py -o -name Makefile -o -name '*.ld' \) -print
test -f AGENTS.md && sed -n '1,260p' AGENTS.md
```

If `Compile_burn/` exists:

```bash
COMPILE_BURN="$(find . -maxdepth 3 -type d -name Compile_burn -print -quit)"
test -n "$COMPILE_BURN" || { echo "Compile_burn not found" >&2; exit 2; }
SDK_ROOT="${COMPILE_BURN%/Compile_burn}"
```

If the SDK exists but `Compile_burn/` or equivalent workflow sources are not found even after the default clone attempt, stop at environment diagnosis:

- State that the build/burn workflow sources are missing from the current SDK checkout.
- Ask for the matching TK8620 SDK package, firmware repository path, release archive, or clone URL that contains `Compile_burn/`, `build.py`, and `py_tool/`.
- Do not invent build commands, burn commands, partition addresses, or serial protocol details.
- You may still explain what will be needed: SDK firmware source, build scripts, burn tool/protocol implementation, matching toolchain, target/control serial ports, and hardware wiring.

## Burn Protocol Boundary

TK8620 serial flashing is protocol-driven. The executable protocol should come from the SDK burn tool, normally under `Compile_burn/py_tool/`, such as:

```text
Compile_burn/py_tool/burn_8620_cli.py
Compile_burn/py_tool/tk8620_burn.py
Compile_burn/py_tool/crc32_ref.py
Compile_burn/py_tool/burnpatch.h
```

Do not reimplement the burn protocol from memory. Inspect the SDK script and its `--help` before issuing burn commands. If the SDK burn tool is missing, report that flashing is blocked until the matching SDK/release package or project-maintained burn tool is provided.

Known protocol signals from the observed SDK are useful for troubleshooting only: initial serial baud `115200`, optional switch to `921600`, boot handshake token followed by `TaoLink.`, command headers packed as little-endian code/address/length, erase/write/CRC operations, and optional control-port GPIO reset. Treat those as SDK-specific observations, not a universal contract for every TK8620 SDK package.

## Select Host Reference

Read only the reference for the current host:

- Windows: `references/windows.md`
- macOS: `references/macos.md`
- Linux: `references/linux.md`

Use `references/burn-and-serial.md` before flashing, opening a long-running serial console, or sending serial data.

## Bootloader Decision

Default to application firmware only. Build or flash the bootloader only when there is a clear reason:

- The user explicitly asks for bootloader build, full image, factory image, first-time programming, or recovery after full-chip erase.
- Bootloader source, startup code, flash layout, linker script, boot parameters, reset/boot protocol, or burn protocol changed.
- No trusted bootloader artifact exists, but the burn command or release package requires a bootloader hex path.
- The project documentation says the application and bootloader must be released as a matched pair.

Treat a bootloader artifact as trusted only when at least two objective signals are available:

- It came from an approved release package, CI artifact, documented tag/commit, or repository-maintained output path.
- It has a recorded checksum, signature, build log, or release note tying it to the intended board and flash layout.
- It is documented as compatible with the application image or the project states boot/app do not need to be matched.

Before building or flashing bootloader:

1. Locate the bootloader build entry and expected artifact path.
2. Check whether a known-good bootloader `.hex` already exists.
3. Confirm the recovery path: ROM/download mode access, spare programmer/control board if applicable, whether full-chip erase is allowed, and how to roll back.
4. Confirm with the user before flashing bootloader, because a bad bootloader can make recovery harder than an application-only failure.

If only application code changed and a trusted bootloader artifact exists, reuse the bootloader and build/flash only the application image.

## Generic Build Flow

1. Verify the toolchain version and command prefix.
2. Verify `python`/`python3`, `make`, and any required Python packages.
3. Export `PATH_SEPARATOR=:` on POSIX hosts and `TOOLCHAIN_PREFIX` when not using the repository default.
4. Apply the bootloader decision rules above.
5. Build application firmware and collect `.elf`, `.hex`, `.bin`, and `.map`.
6. If the project has generated build metadata, follow its source lists, defines, linker script, library order, and object order as closely as possible.
7. If a project-specific app has no maintained command-line build, say that clearly and reconstruct only the minimum temporary build needed for verification.

## Artifact Trust Gate

Before flashing any existing artifact, verify and report:

- Artifact paths for application and, if used, bootloader.
- Source of each artifact: current build output, approved release package, CI artifact, or user-provided file.
- Timestamp or build log/commit when available.
- `sha256` for every `.hex` or `.bin` that may be flashed.
- Matching `.map` and linker script for the same build when available.
- Target board revision, flash size/layout, and whether the bootloader/application pair must match.

Do not flash if the link failed, a linker region overflowed, the `.map` shows an out-of-bounds section, the toolchain is non-equivalent and the user did not accept that difference, or the artifact source is unknown and the user cannot confirm it.

## Generic Burn And Serial Flow

1. List candidate serial ports with stable details such as description, VID/PID, and serial number when the platform exposes them.
2. Ask the user to identify target and control ports. If uncertain, ask them to unplug/replug each board and compare the port list.
3. Confirm whether the workflow uses a control board for automatic boot/reset or a manual boot-mode sequence.
4. Confirm hardware wiring, voltage level, reset control, boot strap/mode setting, and board revision before flashing.
5. Apply the artifact trust gate.
6. Burn only after the target artifact paths and ports are known.
7. Open a serial console only after burn completes or when the user asks for monitor-only mode.

## Automatic Burn And Smoke Test

Support end-to-end automation when the user asks for compile, burn, and test, but never treat hardware flashing as an unattended default side effect.

Before automatic burn is allowed, all of these must be true:

1. SDK workflow source is present or the default clone succeeded.
2. Build completed successfully and produced trusted application artifacts.
3. Bootloader decision is resolved.
4. Target and control ports are identified by stable port details.
5. Hardware wiring and board mode are confirmed.
6. The exact burn command is shown to the user and the user explicitly approves flashing.

After burn, a smoke test may run automatically if the user requested testing and the expected serial evidence is known. Acceptable smoke tests include opening the serial console, capturing a bounded log window, checking for boot banner/version text, checking reset behavior, or sending a user-approved harmless command. If expected serial output or commands are unknown, collect logs and report them without claiming functional success.

## Troubleshooting

- If the current OS cannot execute the bundled compiler, switch to the OS-specific reference instead of editing source files.
- If a build succeeds only by changing toolchain family, using stale prebuilt libraries, omitting project defines, or changing linker/object order, label it non-equivalent.
- If `.data`, flash, RAM, or linker region overflow occurs, report the exact region and byte count when available.
- If a serial port is busy, identify the owning process where possible instead of force-killing it.
- If multiple serial ports exist, do not guess.

## Expected Response

When reporting back, include:

- Detected project root and host OS.
- Selected reference: Windows, macOS, Linux, or burn/serial only.
- Toolchain source and version.
- Commands run or recommended.
- Artifact paths (`.elf`, `.hex`, `.bin`, `.map`) if produced.
- Whether burn/serial actions were performed, skipped, or awaiting user confirmation.
- Any remaining hardware/toolchain assumptions.
