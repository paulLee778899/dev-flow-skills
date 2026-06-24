# Claude Code Integration

Dev Flow Skills installs Claude Code skills plus `/dev-flow` and `/dev-flow-cr` slash commands.

## Install

Global install:

```bash
npm install -g dev-flow-skills
dev-flow install-claude
dev-flow doctor-claude
```

Update global install:

```bash
npm install -g dev-flow-skills@latest
dev-flow update-claude
dev-flow doctor-claude
```

## What gets installed

```text
~/.claude/
  commands/
    dev-flow.md
    dev-flow-cr.md
  skills/
    dev-flow-cr/
    dev-flow-master/
    dev-flow-intent/
    dev-flow-debugging/
    dev-flow-ui-ux/
    dev-flow-review/
    dev-flow-planning/
    dev-flow-execution/
    dev-flow-git/
    dev-flow-acceptance/
    tk8620-firmware-workflow/
```

The planning templates are installed under `~/.claude/skills/dev-flow-master/templates/` and checked by `dev-flow doctor-claude`.

## Command

```text
~/.claude/commands/dev-flow.md
~/.claude/commands/dev-flow-cr.md
```

`/dev-flow` is intentionally thin. It enters `dev-flow-master`, which owns routing, classification, phase gates, and focused skill selection. `/dev-flow-cr` is independent and runs post-acceptance CR through `dev-flow-cr`.

## Skills

Claude Code discovers skills from directories containing `SKILL.md`, including user-level `~/.claude/skills/` and project-level `.claude/skills/`.

The CLI links each bundled skill directory into `~/.claude/skills/` by default:

```text
~/.claude/skills/dev-flow-master/
~/.claude/skills/dev-flow-cr/
~/.claude/skills/dev-flow-intent/
~/.claude/skills/dev-flow-debugging/
~/.claude/skills/dev-flow-ui-ux/
~/.claude/skills/dev-flow-review/
~/.claude/skills/dev-flow-planning/
~/.claude/skills/dev-flow-execution/
~/.claude/skills/dev-flow-git/
~/.claude/skills/dev-flow-acceptance/
~/.claude/skills/tk8620-firmware-workflow/
```

## Project-Local Option

Use custom targets when a repository should pin and commit its workflow:

```bash
dev-flow install-claude --target .claude/skills --commands-target .claude/commands
dev-flow doctor-claude --target .claude/skills --commands-target .claude/commands
```

## Updating

If installed by npm:

```bash
npm install -g dev-flow-skills@latest
dev-flow update-claude
dev-flow doctor-claude
```

Restart Claude Code after updating so it discovers changed skills and commands.

## Uninstalling

```bash
rm ~/.claude/commands/dev-flow.md
rm ~/.claude/commands/dev-flow-cr.md
rm ~/.claude/skills/dev-flow-master
rm ~/.claude/skills/dev-flow-cr
rm ~/.claude/skills/dev-flow-intent
rm ~/.claude/skills/dev-flow-debugging
rm ~/.claude/skills/dev-flow-ui-ux
rm ~/.claude/skills/dev-flow-review
rm ~/.claude/skills/dev-flow-planning
rm ~/.claude/skills/dev-flow-execution
rm ~/.claude/skills/dev-flow-git
rm ~/.claude/skills/dev-flow-acceptance
rm ~/.claude/skills/tk8620-firmware-workflow
```
