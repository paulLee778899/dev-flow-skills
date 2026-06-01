# Changelog

## Unreleased

### Added

- Add `dev-flow-intent` as the master-loaded intent classifier for debugging, feature, change-adjustment, review, UI/UX, status-recovery, and question routes.
- Add focused route skills for `dev-flow-debugging`, `dev-flow-ui-ux`, and `dev-flow-review`.
- Add Claude Code installation support with `install-claude`, `update-claude`, `doctor-claude`, and a Claude `/dev-flow` command.
- Add routing eval prompts in `evals/evals.json`.

### Changed

- Update `dev-flow-master` to remain the entry controller while delegating intent classification to `dev-flow-intent`.
- Show the default multi-agent/subagent execution mode at Phase 2 Gate after orchestration and Git checks, with main-agent serial fallback/override.
- Clarify the skill reuse policy: call Superpowers workflows directly when available, and absorb optional marketplace/local skill patterns without hard dependencies.
- Update installer doctor checks, command docs, plugin metadata, and public docs for the new route skills.

## [0.1.9] - 2026-04-27

### Changed

- Rename the entry routing skill from `dev-flow-governor` to `dev-flow-master` across OpenCode and Codex installs.
- Update installer doctor checks, command entrypoints, planning template paths, and documentation for the new skill name.

## [0.1.8] - 2026-04-27

### Added

- Add Codex `/dev-flow` command support through a root `commands/dev-flow.md` file.
- Update `install-codex`, `update-codex`, and `doctor-codex` to manage both Codex skills and the Codex command symlink.

### Changed

- Document that Codex discovers commands from `commands/` / `~/.agents/commands`, not from a `.codex-plugin/plugin.json` `commands` field.

## [0.1.7] - 2026-04-27

### Changed

- Make the AI-agent installation prompt platform-neutral and move platform-specific routing into `install/agent-install.md`.

## [0.1.6] - 2026-04-27

### Changed

- Keep README command list platform-neutral and move platform-specific command details to platform guides.

## [0.1.5] - 2026-04-27

### Changed

- Make the README AI-agent installation section a directly copy-pasteable prompt.

## [0.1.4] - 2026-04-27

### Changed

- Move platform-specific installation detail out of README and into platform guides.
- Add a copy-paste AI agent prompt to `install/agent-install.md`.
- Expand OpenCode installation details in `install/opencode.md`.

## [0.1.3] - 2026-04-27

### Changed

- Improve README with badges, workflow diagram, copy-paste AI agent install prompt, and Codex CLI commands.

## [0.1.2] - 2026-04-27

### Added

- Add Codex plugin metadata in `.codex-plugin/plugin.json`.
- Add Codex native skill discovery instructions in `.codex/INSTALL.md`.
- Add top-level `skills/` directory for Codex-compatible skill discovery.
- Add `install-codex`, `update-codex`, and `doctor-codex` CLI commands.

## [0.1.1] - 2026-04-27

### Changed

- Mark npm installation as the recommended path now that the package is published.
- Add repository, bugs, and homepage metadata to `package.json`.

## [0.1.0] - 2026-04-27

### Added

- Initial Dev Flow Skills package structure.
- Global and project-local install model.
- `/dev-flow` OpenCode command entrypoint.
- Five focused skills: governor, planning, execution, git, and acceptance.
- CLI commands for install, update, doctor, uninstall, and version.
- Manifest checksum protection for safe updates.
- Manual, Agent, and OpenCode installation docs.
