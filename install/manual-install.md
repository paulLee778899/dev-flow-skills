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
  skills/dev-flow-*/
```

The installed skills include the entry controller (`dev-flow-master`), intent routing (`dev-flow-intent`), focused routes for debugging/UI/UX/review, and the governed planning/execution/Git/acceptance skills.

Verify:

```bash
dev-flow doctor --global
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
