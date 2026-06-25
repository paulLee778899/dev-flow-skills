# Manifest and Updates

Every install writes a manifest file:

```text
dev-flow-manifest.json
```

Example:

```json
{
  "name": "dev-flow-skills",
  "version": "0.1.0",
  "installedAt": "2026-04-27T00:00:00.000Z",
  "source": "npm:dev-flow-skills",
  "target": "/Users/example/.opencode",
  "files": [
    {
      "path": "command/dev-flow.md",
      "sha256": "..."
    },
    {
      "path": "command/dev-flow-cr.md",
      "sha256": "..."
    },
    {
      "path": "command/dev-flow-loop.md",
      "sha256": "..."
    },
    {
      "path": "command/dev-flow-triage.md",
      "sha256": "..."
    },
    {
      "path": "command/dev-flow-scheduler.md",
      "sha256": "..."
    }
  ]
}
```

## Update behavior

During `dev-flow update`, the CLI compares each installed file with the previous manifest checksum.

- If the file is unchanged, it is safe to overwrite.
- If the target file already exists but there is no previous manifest entry, it is treated as unmanaged local content and preserved.
- If the file was modified locally, it is preserved and the incoming version is written as `.new`.
- If `--force` is passed, the incoming version overwrites the local file.
- If `--dry-run` is passed, no files are changed.

This makes global updates safe while still supporting local customization.
