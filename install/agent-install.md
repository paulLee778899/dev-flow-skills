# Agent Installation Instructions

You are installing Dev Flow Skills for a user.

## Copy-paste prompt

Users can give an AI agent this prompt:

```text
Install Dev Flow Skills for this environment.

Follow the instructions at:
https://raw.githubusercontent.com/paulLee778899/dev-flow-skills/main/install/agent-install.md

Default to global installation unless I explicitly ask for project-local installation.
Use npm when available:
  npm install -g dev-flow-skills
  dev-flow install --global
  dev-flow doctor --global

Detect the current agent platform and follow the matching platform guide when one exists:
  OpenCode -> install/opencode.md
  Codex -> .codex/INSTALL.md
  Claude Code -> install/claude.md
  Unknown platform -> use the default global install, then report that no platform-specific adapter was applied.

Do not overwrite existing modified files. Preserve local files and write incoming versions as .new unless I explicitly approve --force.
After installation, report exactly what changed and what verification passed.
```

## Default decision

Install globally unless the user explicitly asks for project-local installation.

Global installation avoids copying the same workflow into every project.

## Install targets

Global target:

```text
~/.opencode/
```

Project target:

```text
./.opencode/
```

## Required behavior

1. Determine the target scope.
2. Detect the current agent platform if possible.
3. Install the default global package unless the user requested project-local installation.
4. Apply the matching platform guide when one exists.
5. Preserve existing modified files.
6. Write or update `dev-flow-manifest.json` with version and checksums where applicable.
7. Run the relevant doctor command for each installed adapter.
8. Report exactly what changed and what was verified.

## Platform routing

| Platform | Guide | Verification |
| --- | --- | --- |
| OpenCode | `install/opencode.md` | `dev-flow doctor --global` or `dev-flow doctor` |
| Codex | `.codex/INSTALL.md` | `dev-flow doctor-codex` |
| Claude Code | `install/claude.md` | `dev-flow doctor-claude` |
| Unknown | Default global install | `dev-flow doctor --global` |

Do not hard-code every future platform into the user-facing prompt. Add new platform behavior here and in the platform guide.

## Commands

Recommended global install:

```bash
npm install -g dev-flow-skills
dev-flow install --global
dev-flow doctor --global
```

Project-local install:

```bash
dev-flow install
dev-flow doctor
```

Update global install:

```bash
npm install -g dev-flow-skills@latest
dev-flow update --global
dev-flow doctor --global
```

Platform-specific installs are documented in the platform guides. For example, Codex skill and command discovery uses:

```bash
npm install -g dev-flow-skills
dev-flow install-codex
dev-flow doctor-codex
```

Claude Code skill and command discovery uses:

```bash
npm install -g dev-flow-skills
dev-flow install-claude
dev-flow doctor-claude
```

## Do not

- Do not overwrite local modifications unless the user explicitly asks for `--force`.
- Do not commit installed files unless the user explicitly asks.
- Do not assume project-local installation is required just because the user is inside a repository.
- Do not stop after copying files; run doctor or perform an equivalent structural check.
