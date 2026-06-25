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
    dev-flow-cr.md
    dev-flow-loop.md
    dev-flow-triage.md
    dev-flow-scheduler.md
  skills/
    dev-flow-cr/
    dev-flow-loop/
    dev-flow-loop-envelope/
    dev-flow-loop-triage/
    dev-flow-scheduler/
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

Each core skill keeps its short routing contract in `SKILL.md` and detailed instructions in `references/` for on-demand loading. The four loop-only baseline templates are installed under `.opencode/skills/dev-flow-loop/assets/baseline-templates/` as `requirements.md`, `high-level-design.md`, `detailed-design.md`, and `test-plan.md`. `dev-flow-master/templates/` no longer exists and `dev-flow doctor` checks this placement.

`.opencode/skills` is the OpenCode package surface for the core `dev-flow-*` workflow. It is not a full mirror of the repository's top-level `skills/` directory; platform-specific or project-specific skills, such as `tk8620-firmware-workflow`, may exist only under `skills/` for Codex/Claude adapters.

`dev-flow doctor` also checks core `references/`, `/dev-flow-cr`, `/dev-flow-loop`, `/dev-flow-triage`, `/dev-flow-scheduler`, lightweight opsx/OpenSpec contract wording, Loop Engineering read-only boundaries, approved scheduler boundaries, stale command-name drift, and core `.opencode/skills` mirror consistency.

## Command

```text
.opencode/command/dev-flow.md
.opencode/command/dev-flow-cr.md
.opencode/command/dev-flow-loop.md
.opencode/command/dev-flow-triage.md
.opencode/command/dev-flow-scheduler.md
```

The `/dev-flow` command is intentionally thin. It enters `dev-flow-master`, which owns routing, classification, phase gates, and focused skill selection. The `/dev-flow-cr` command is independent and runs post-acceptance CR through `dev-flow-cr`; it is not an automatic `/dev-flow` stage. `/dev-flow-loop` and `/dev-flow-triage` are read-only Loop Engineering commands; they may recommend `/dev-flow` or `/dev-flow-cr`, then enter the equivalent owner flow only after explicit confirmation of a specific candidate. `/dev-flow-scheduler` separately manages approved cron/heartbeat automations and does not scan candidates or execute development work.

## Skills

```text
.opencode/skills/dev-flow-master/
.opencode/skills/dev-flow-cr/
.opencode/skills/dev-flow-loop/
.opencode/skills/dev-flow-loop-envelope/
.opencode/skills/dev-flow-loop-triage/
.opencode/skills/dev-flow-scheduler/
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
