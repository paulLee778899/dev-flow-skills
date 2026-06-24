# Contributing

Thanks for improving Dev Flow Skills.

## Development setup

```bash
git clone https://github.com/paulLee778899/dev-flow-skills.git
cd dev-flow-skills
npm install -g .
dev-flow doctor --target .
```

## Local verification

Run these before opening a pull request:

```bash
node --check bin/dev-flow.mjs
node --check scripts/install-dev-flow.mjs
node --check scripts/update-dev-flow.mjs

tmpdir="$(mktemp -d)"
node bin/dev-flow.mjs install --target "$tmpdir"
node bin/dev-flow.mjs doctor --target "$tmpdir"
node scripts/update-dev-flow.mjs --target "$tmpdir" --dry-run

npm pack --dry-run
```

## Change guidelines

- Keep `/dev-flow` as a thin entry command.
- Put detailed stage behavior in the focused `dev-flow-*` skills.
- Preserve install/update safety: never overwrite unmanaged or locally modified files unless `--force` is passed.
- Update docs when CLI behavior changes.
- Add changelog entries for user-visible changes.

## Commit style

Use concise conventional-style messages:

```text
feat: add install conflict protection
fix: preserve modified files during uninstall
docs: document GitHub installation
chore: add CI verification
```

## Release checklist

1. Update `CHANGELOG.md`.
2. Run local verification.
3. Confirm CI is green on `main`.
4. Tag the release, for example `v0.1.0`.
5. Create a GitHub Release from the tag.
