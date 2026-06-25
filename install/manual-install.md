# Manual Installation

Dev Flow Skills supports both global and project-local installation.

## Global install, recommended

Use global installation when you want `/dev-flow` available in all projects.

```bash
npm install -g dev-flow-skills
dev-flow install --global
```

This installs files into:

```text
~/.opencode/
  command/dev-flow.md
  command/dev-flow-cr.md
  command/dev-flow-loop.md
  command/dev-flow-triage.md
  command/dev-flow-scheduler.md
  skills/dev-flow-*/
```

The installed skills include the entry controller (`dev-flow-master`), intent routing (`dev-flow-intent`), focused routes for debugging/UI/UX/review, Loop Engineering control/triage/envelope, approved scheduler management, and the governed planning/execution/Git/acceptance skills.

Each core skill keeps its short routing contract in `SKILL.md` and detailed instructions in `references/` for on-demand loading. The four loop-only baseline templates live under the installed `dev-flow-loop/assets/baseline-templates/` directory as `requirements.md`, `high-level-design.md`, `detailed-design.md`, and `test-plan.md`. `dev-flow-master/templates/` no longer exists and is rejected by the doctor command.

The OpenCode install surface intentionally includes the core `dev-flow-*` skills only. Extra skills in the repository's top-level `skills/` directory are for platform adapters or project-specific use and are not automatically part of `.opencode/skills`.

Doctor commands also check core `references/`, `/dev-flow-cr`, `/dev-flow-loop`, `/dev-flow-triage`, `/dev-flow-scheduler`, lightweight opsx/OpenSpec contract wording, Loop Engineering read-only boundaries, approved scheduler boundaries, stale command-name drift, and core `.opencode/skills` mirror consistency.

Verify:

```bash
dev-flow doctor --global
```

## Platform adapters

OpenCode uses `dev-flow install` and `dev-flow doctor`. Codex and Claude Code use native discovery directories and require their own adapter commands:

```bash
dev-flow install-codex
dev-flow doctor-codex
dev-flow install-claude
dev-flow doctor-claude
```

## Project-local install

Use project-local installation when the workflow should be committed with a repository.

```bash
cd your-project
dev-flow install
```

This installs files into:

```text
./.opencode/
  command/dev-flow.md
  command/dev-flow-cr.md
  command/dev-flow-loop.md
  command/dev-flow-triage.md
  command/dev-flow-scheduler.md
  skills/dev-flow-*/
```

Verify:

```bash
dev-flow doctor
```

## Update

Update the npm package first, then sync installed files.

```bash
npm install -g dev-flow-skills@latest
dev-flow update --global
```

For project-local installs:

```bash
dev-flow update
```

## Conflict handling

The installer writes a `dev-flow-manifest.json` with file checksums. During update:

- unchanged installed files are overwritten safely
- locally modified files are preserved
- pre-existing files without a manifest entry are treated as unmanaged local files and preserved
- the new version is written as `.new` unless `--force` is passed

Use `--dry-run` before applying updates when in doubt.
