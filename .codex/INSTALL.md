# Installing Dev Flow Skills for Codex

Codex discovers skills and commands through native discovery directories:

```text
~/.agents/skills/
~/.agents/commands/
```

This package includes a Codex plugin manifest at `.codex-plugin/plugin.json`, a top-level `skills/` directory for Codex-compatible skill discovery, and root command files for `/dev-flow`, `/dev-flow-cr`, `/dev-flow-loop`, `/dev-flow-triage`, and `/dev-flow-scheduler`.

The four loop-only baseline templates are bundled under `skills/dev-flow-loop/assets/baseline-templates/` as `requirements.md`, `high-level-design.md`, `detailed-design.md`, and `test-plan.md`. `dev-flow-master/templates/` no longer exists and `dev-flow doctor-codex` checks this placement.

Codex plugin commands are discovered from a plugin-root `commands/` directory; they are not declared with a `commands` field in `.codex-plugin/plugin.json`. This matches the official Codex plugin examples and the Superpowers plugin structure.

## Codex App

If the package appears in the Codex plugin marketplace, install it from the Plugins sidebar.

Until marketplace listing is available, use the manual install below.

## Manual install

After installing the npm package, link the bundled skills and command into Codex's discovery directories:

```bash
npm install -g dev-flow-skills
dev-flow install-codex
dev-flow doctor-codex
```

Then restart Codex so it discovers the skills and `/dev-flow`, `/dev-flow-cr`, `/dev-flow-loop`, `/dev-flow-triage`, and `/dev-flow-scheduler` commands.

## Manual Git install

Alternatively, clone the repository and symlink its skills and command into Codex's discovery directories:

```bash
git clone https://github.com/paulLee778899/dev-flow-skills.git ~/.codex/dev-flow-skills
mkdir -p ~/.agents/skills
mkdir -p ~/.agents/commands
ln -s ~/.codex/dev-flow-skills/skills ~/.agents/skills/dev-flow-skills
ln -s ~/.codex/dev-flow-skills/commands/dev-flow.md ~/.agents/commands/dev-flow.md
ln -s ~/.codex/dev-flow-skills/commands/dev-flow-cr.md ~/.agents/commands/dev-flow-cr.md
ln -s ~/.codex/dev-flow-skills/commands/dev-flow-loop.md ~/.agents/commands/dev-flow-loop.md
ln -s ~/.codex/dev-flow-skills/commands/dev-flow-triage.md ~/.agents/commands/dev-flow-triage.md
ln -s ~/.codex/dev-flow-skills/commands/dev-flow-scheduler.md ~/.agents/commands/dev-flow-scheduler.md
```

Then restart Codex so it discovers the skills and `/dev-flow`, `/dev-flow-cr`, `/dev-flow-loop`, `/dev-flow-triage`, and `/dev-flow-scheduler` commands.

## Install from npm package contents

The CLI commands above are preferred because they locate the global npm package automatically from the running `dev-flow` executable.

## Using the workflow in Codex

Use the slash command when available:

```text
/dev-flow <your task>
/dev-flow-cr <optional review scope>
/dev-flow-loop <optional loop scope>
/dev-flow-triage <optional triage scope>
/dev-flow-scheduler <approved automation action>
```

Or ask Codex to use the master skill explicitly:

```text
Use the dev-flow-master skill for this task. Let it load dev-flow-intent, route to debugging/UI-UX/review or governed planning as appropriate, then follow the dev-flow execution, git, and acceptance workflow.
```

OpenCode and Codex use different command locations. OpenCode commands are installed through `.opencode/command/*.md`; Codex commands are installed through `~/.agents/commands/*.md` or a plugin-root `commands/*.md`.

## Updating

If installed by Git clone:

```bash
cd ~/.codex/dev-flow-skills
git pull
```

If installed by npm:

```bash
npm install -g dev-flow-skills@latest
dev-flow update-codex
dev-flow doctor-codex
```

Restart Codex after updating.

If you installed an earlier adapter, `dev-flow update-codex` adds the missing `/dev-flow`, `/dev-flow-cr`, `/dev-flow-loop`, `/dev-flow-triage`, and `/dev-flow-scheduler` command symlinks.

## Uninstalling

```bash
rm ~/.agents/skills/dev-flow-skills
rm ~/.agents/commands/dev-flow.md
rm ~/.agents/commands/dev-flow-cr.md
rm ~/.agents/commands/dev-flow-loop.md
rm ~/.agents/commands/dev-flow-triage.md
rm ~/.agents/commands/dev-flow-scheduler.md
```

Optionally delete the clone:

```bash
rm -rf ~/.codex/dev-flow-skills
```
