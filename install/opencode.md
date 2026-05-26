# OpenCode Integration

Dev Flow Skills installs an OpenCode command plus focused skills.

## Install

Global install:

```bash
npm install -g dev-flow-skills
dev-flow install --global
dev-flow doctor --global
```

Project-local install:

```bash
cd your-project
dev-flow install
dev-flow doctor
```

Update global install:

```bash
npm install -g dev-flow-skills@latest
dev-flow update --global
dev-flow doctor --global
```

## What gets installed

```text
.opencode/
  command/
    dev-flow.md
  skills/
    dev-flow-master/
    dev-flow-intent/
    dev-flow-debugging/
    dev-flow-ui-ux/
    dev-flow-review/
    dev-flow-planning/
    dev-flow-execution/
    dev-flow-git/
    dev-flow-acceptance/
```

## Command

```text
.opencode/command/dev-flow.md
```

The command is intentionally thin. It enters `dev-flow-master`, which owns routing, classification, phase gates, and focused skill selection.

## Skills

```text
.opencode/skills/dev-flow-master/
.opencode/skills/dev-flow-intent/
.opencode/skills/dev-flow-debugging/
.opencode/skills/dev-flow-ui-ux/
.opencode/skills/dev-flow-review/
.opencode/skills/dev-flow-planning/
.opencode/skills/dev-flow-execution/
.opencode/skills/dev-flow-git/
.opencode/skills/dev-flow-acceptance/
```

## Global versus project-local

Use global install for personal default behavior across projects. Use project-local install when the repository should pin or customize the workflow.

Recommended resolution order:

1. project-local `.opencode`
2. global `~/.opencode`
3. remote install instructions

## Project shim option

If an OpenCode environment does not resolve global commands, run project-local install or create a project command shim that points to the global skill package.
