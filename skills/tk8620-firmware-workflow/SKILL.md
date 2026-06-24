---
name: tk8620-firmware-workflow
description: Use this skill whenever the user needs to compile, flash/burn, open a serial console, or troubleshoot the build/burn/serial workflow for TK8620 firmware on Windows, macOS, or Linux. This skill focuses only on TK8620 firmware build artifacts, RISC-V/Nuclei toolchains, burn tools, UART/serial ports, Docker or native host setup, and hardware assumptions; it does not cover JTAG/GDB debugging, protocol-stack debugging, or application logic debugging.
---

# TK8620 Firmware Workflow

Guide TK8620 firmware compilation, flashing/burning, serial monitoring, and build/burn/serial troubleshooting on the current host. Keep the workflow generic: do not assume a specific application, protocol stack, editor, or project name unless the user provides one.

## Core Contract

- Start from the user's actual TK8620 SDK or firmware repository. If workflow sources such as `Compile_burn/`, `build.py`, or `py_tool/` are missing, ask for the matching SDK/package/path before claiming build or burn can run.
- Identify host OS before selecting commands. Read the host reference for Windows, macOS, or Linux.
- Treat build and burn as separate phases. Do not flash hardware until target/control ports and the exact burn command are confirmed by the user.
- Do not reimplement the burn protocol from memory; inspect the SDK burn tool and its help.
- Preserve local worktree changes and report generated artifacts, logs, checksums, and assumptions.

## References

- Read `references/core-workflow.md` before repository detection, build planning, bootloader decisions, artifact trust checks, flashing, smoke testing, troubleshooting, or final reporting.
- Read exactly one host reference before host-specific setup: `references/windows.md`, `references/macos.md`, or `references/linux.md`.
- Read `references/burn-and-serial.md` before flashing, opening a long-running serial console, or sending serial data.
