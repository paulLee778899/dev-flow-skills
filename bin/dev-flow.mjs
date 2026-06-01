#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { copyFile, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(packageRoot, '.opencode');
const codexSkillsRoot = path.join(packageRoot, 'skills');
const codexCommandSource = path.join(packageRoot, 'commands', 'dev-flow.md');
const claudeSkillsRoot = path.join(packageRoot, 'skills');
const claudeCommandSource = path.join(packageRoot, 'commands', 'claude', 'dev-flow.md');
const packageJsonPath = path.join(packageRoot, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const manifestName = 'dev-flow-manifest.json';

const args = process.argv.slice(2);
const command = args[0] ?? 'help';
const flags = parseFlags(args.slice(1));

async function main() {
  if (command === 'install' || command === 'update') {
    await installOrUpdate(command);
    return;
  }

  if (command === 'doctor') {
    await doctor();
    return;
  }

  if (command === 'install-codex' || command === 'update-codex') {
    await installCodexAdapter(command);
    return;
  }

  if (command === 'doctor-codex') {
    await doctorCodex();
    return;
  }

  if (command === 'install-claude' || command === 'update-claude') {
    await installClaudeAdapter(command);
    return;
  }

  if (command === 'doctor-claude') {
    await doctorClaude();
    return;
  }

  if (command === 'uninstall') {
    await uninstall();
    return;
  }

  if (command === 'version' || command === '--version' || command === '-v') {
    console.log(packageJson.version);
    return;
  }

  printHelp();
}

function codexTargetRoot() {
  const explicitTarget = flags.get('target');
  if (typeof explicitTarget === 'string') {
    return path.resolve(process.cwd(), explicitTarget);
  }

  return path.join(homedir(), '.agents', 'skills', 'dev-flow-skills');
}

function codexCommandTarget() {
  const explicitTarget = flags.get('commands-target');
  if (typeof explicitTarget === 'string') {
    return path.resolve(process.cwd(), explicitTarget);
  }

  return path.join(homedir(), '.agents', 'commands', 'dev-flow.md');
}

function claudeSkillsTargetRoot() {
  const explicitTarget = flags.get('target');
  if (typeof explicitTarget === 'string') {
    return path.resolve(process.cwd(), explicitTarget);
  }

  return path.join(homedir(), '.claude', 'skills');
}

function claudeCommandTarget() {
  const explicitTarget = flags.get('commands-target');
  if (typeof explicitTarget === 'string') {
    return path.resolve(process.cwd(), explicitTarget);
  }

  return path.join(homedir(), '.claude', 'commands', 'dev-flow.md');
}

function parseFlags(items) {
  const parsed = new Map();

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!item.startsWith('--')) {
      continue;
    }

    const [rawName, inlineValue] = item.slice(2).split('=');
    if (inlineValue !== undefined) {
      parsed.set(rawName, inlineValue);
      continue;
    }

    const next = items[index + 1];
    if (next && !next.startsWith('--')) {
      parsed.set(rawName, next);
      index += 1;
    } else {
      parsed.set(rawName, true);
    }
  }

  return parsed;
}

function targetRoot() {
  const explicitTarget = flags.get('target');
  if (typeof explicitTarget === 'string') {
    const resolved = path.resolve(process.cwd(), explicitTarget);
    return path.basename(resolved) === '.opencode' ? resolved : path.join(resolved, '.opencode');
  }

  if (flags.has('global')) {
    return path.join(homedir(), '.opencode');
  }

  return path.join(process.cwd(), '.opencode');
}

async function installOrUpdate(action) {
  const target = targetRoot();
  const dryRun = flags.has('dry-run');
  const force = flags.has('force');
  const files = collectFiles(sourceRoot);
  const existingManifest = readManifest(target);
  const manifestFiles = [];
  const operations = [];

  for (const sourceFile of files) {
    const relativePath = path.relative(sourceRoot, sourceFile);
    const targetFile = path.join(target, relativePath);
    const content = await readFile(sourceFile);
    const nextHash = sha256(content);
    const previous = existingManifest?.files?.find((file) => file.path === relativePath);
    const targetExists = existsSync(targetFile);
    const currentHash = targetExists ? sha256(readFileSync(targetFile)) : null;
    const locallyModified = Boolean(previous && currentHash && currentHash !== previous.sha256);
    const unmanagedExistingFile = Boolean(!previous && targetExists && currentHash !== nextHash);

    manifestFiles.push({ path: relativePath, sha256: nextHash });

    if (targetExists && (locallyModified || unmanagedExistingFile) && !force) {
      operations.push({ type: 'preserve', sourceFile, targetFile, newFile: `${targetFile}.new`, relativePath });
      continue;
    }

    operations.push({ type: targetExists ? 'update' : 'create', sourceFile, targetFile, relativePath });
  }

  const manifest = {
    name: packageJson.name,
    version: packageJson.version,
    installedAt: new Date().toISOString(),
    source: `npm:${packageJson.name}`,
    target,
    files: manifestFiles,
  };

  printPlan(action, target, operations, dryRun);

  if (dryRun) {
    return;
  }

  for (const operation of operations) {
    const destination = operation.type === 'preserve' ? operation.newFile : operation.targetFile;
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(operation.sourceFile, destination);
  }

  await writeFile(path.join(target, manifestName), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\n${action} complete: ${target}`);
}

async function doctor() {
  const target = targetRoot();
  const required = [
    'command/dev-flow.md',
    'skills/dev-flow-master/SKILL.md',
    'skills/dev-flow-intent/SKILL.md',
    'skills/dev-flow-debugging/SKILL.md',
    'skills/dev-flow-ui-ux/SKILL.md',
    'skills/dev-flow-review/SKILL.md',
    'skills/dev-flow-planning/SKILL.md',
    'skills/dev-flow-execution/SKILL.md',
    'skills/dev-flow-git/SKILL.md',
    'skills/dev-flow-acceptance/SKILL.md',
  ];

  console.log('Dev Flow Skills Doctor');
  console.log(`Target: ${target}\n`);

  let ok = true;
  for (const relativePath of required) {
    const exists = existsSync(path.join(target, relativePath));
    ok = ok && exists;
    console.log(`${exists ? '✓' : '✗'} ${relativePath}`);
  }

  const manifest = readManifest(target);
  if (manifest) {
    console.log(`✓ ${manifestName} (${manifest.version})`);
  } else {
    ok = false;
    console.log(`✗ ${manifestName}`);
  }

  if (!ok) {
    process.exitCode = 1;
    console.log('\nNot ready. Run `dev-flow install` for project scope or `dev-flow install --global` for global scope.');
    return;
  }

  console.log('\nReady.');
}

async function installCodexAdapter(action) {
  const skillsTarget = codexTargetRoot();
  const commandTarget = codexCommandTarget();
  const dryRun = flags.has('dry-run');
  const force = flags.has('force');
  const targets = [
    { label: 'skills', source: codexSkillsRoot, target: skillsTarget, type: 'dir' },
    { label: 'command', source: codexCommandSource, target: commandTarget, type: 'file' },
  ];

  console.log(`Dev Flow Skills ${action}`);
  console.log(`Skills source: ${codexSkillsRoot}`);
  console.log(`Skills target: ${skillsTarget}`);
  console.log(`Command source: ${codexCommandSource}`);
  console.log(`Command target: ${commandTarget}`);
  if (dryRun) {
    console.log('Mode: dry-run');
  }

  let blocked = false;
  for (const item of targets) {
    const targetExists = existsSync(item.target);
    if (targetExists) {
      const stat = lstatSync(item.target);
      if (!stat.isSymbolicLink() && !force) {
        blocked = true;
        console.log(`\n⚠ ${item.label} target exists and is not a symlink. Preserving it: ${item.target}`);
        console.log('Use --force to replace it intentionally.');
        continue;
      }
      console.log(`~ replace ${item.target}`);
    } else {
      console.log(`+ link ${item.target}`);
    }
  }

  if (blocked) {
    return;
  }

  if (dryRun) {
    return;
  }

  for (const item of targets) {
    await mkdir(path.dirname(item.target), { recursive: true });
    if (existsSync(item.target)) {
      rmSync(item.target, { recursive: true, force: true });
    }
    await symlink(item.source, item.target, item.type);
  }
  console.log('\nCodex skills and /dev-flow command installed. Restart Codex to discover them.');
}

async function doctorCodex() {
  const skillsTarget = codexTargetRoot();
  const commandTarget = codexCommandTarget();
  const required = [
    'dev-flow-master/SKILL.md',
    'dev-flow-intent/SKILL.md',
    'dev-flow-debugging/SKILL.md',
    'dev-flow-ui-ux/SKILL.md',
    'dev-flow-review/SKILL.md',
    'dev-flow-planning/SKILL.md',
    'dev-flow-execution/SKILL.md',
    'dev-flow-git/SKILL.md',
    'dev-flow-acceptance/SKILL.md',
  ];

  console.log('Dev Flow Skills Codex Doctor');
  console.log(`Skills target: ${skillsTarget}`);
  console.log(`Command target: ${commandTarget}\n`);

  let ok = existsSync(skillsTarget);
  console.log(`${ok ? '✓' : '✗'} ${skillsTarget}`);

  for (const relativePath of required) {
    const exists = existsSync(path.join(skillsTarget, relativePath));
    ok = ok && exists;
    console.log(`${exists ? '✓' : '✗'} ${relativePath}`);
  }

  const commandExists = existsSync(commandTarget);
  ok = ok && commandExists;
  console.log(`${commandExists ? '✓' : '✗'} ${commandTarget}`);

  if (!ok) {
    process.exitCode = 1;
    console.log('\nNot ready. Run `dev-flow install-codex` and restart Codex.');
    return;
  }

  console.log('\nReady. Restart Codex if it was already running.');
}

async function installClaudeAdapter(action) {
  const skillsTargetRoot = claudeSkillsTargetRoot();
  const commandTarget = claudeCommandTarget();
  const dryRun = flags.has('dry-run');
  const force = flags.has('force');
  const skillDirectories = collectSkillDirectories(claudeSkillsRoot);
  const targets = [
    ...skillDirectories.map((source) => ({
      label: `skill:${path.basename(source)}`,
      source,
      target: path.join(skillsTargetRoot, path.basename(source)),
      type: 'dir',
    })),
    { label: 'command', source: claudeCommandSource, target: commandTarget, type: 'file' },
  ];

  console.log(`Dev Flow Skills ${action}`);
  console.log(`Skills source: ${claudeSkillsRoot}`);
  console.log(`Skills target: ${skillsTargetRoot}`);
  console.log(`Command source: ${claudeCommandSource}`);
  console.log(`Command target: ${commandTarget}`);
  if (dryRun) {
    console.log('Mode: dry-run');
  }

  let blocked = false;
  for (const item of targets) {
    const targetExists = existsSync(item.target);
    if (targetExists) {
      const stat = lstatSync(item.target);
      if (!stat.isSymbolicLink() && !force) {
        blocked = true;
        console.log(`\n⚠ ${item.label} target exists and is not a symlink. Preserving it: ${item.target}`);
        console.log('Use --force to replace it intentionally.');
        continue;
      }
      console.log(`~ replace ${item.target}`);
    } else {
      console.log(`+ link ${item.target}`);
    }
  }

  if (blocked) {
    return;
  }

  if (dryRun) {
    return;
  }

  for (const item of targets) {
    await mkdir(path.dirname(item.target), { recursive: true });
    if (existsSync(item.target)) {
      rmSync(item.target, { recursive: true, force: true });
    }
    await symlink(item.source, item.target, item.type);
  }
  console.log('\nClaude skills and /dev-flow command installed. Restart Claude Code to discover them.');
}

async function doctorClaude() {
  const skillsTargetRoot = claudeSkillsTargetRoot();
  const commandTarget = claudeCommandTarget();
  const required = collectSkillDirectories(claudeSkillsRoot).map((source) => path.basename(source));

  console.log('Dev Flow Skills Claude Doctor');
  console.log(`Skills target: ${skillsTargetRoot}`);
  console.log(`Command target: ${commandTarget}\n`);

  let ok = existsSync(skillsTargetRoot);
  console.log(`${ok ? '✓' : '✗'} ${skillsTargetRoot}`);

  for (const skillName of required) {
    const exists = existsSync(path.join(skillsTargetRoot, skillName, 'SKILL.md'));
    ok = ok && exists;
    console.log(`${exists ? '✓' : '✗'} ${skillName}/SKILL.md`);
  }

  const commandExists = existsSync(commandTarget);
  ok = ok && commandExists;
  console.log(`${commandExists ? '✓' : '✗'} ${commandTarget}`);

  if (!ok) {
    process.exitCode = 1;
    console.log('\nNot ready. Run `dev-flow install-claude` and restart Claude Code.');
    return;
  }

  console.log('\nReady. Restart Claude Code if it was already running.');
}

async function uninstall() {
  const target = targetRoot();
  const dryRun = flags.has('dry-run');
  const force = flags.has('force');
  const manifest = readManifest(target);

  if (!manifest) {
    console.log(`No ${manifestName} found at ${target}. Nothing to uninstall.`);
    return;
  }

  console.log(`Uninstall target: ${target}`);
  const removable = [];
  const preserved = [];

  for (const file of manifest.files) {
    const installedPath = path.join(target, file.path);
    if (!existsSync(installedPath)) {
      continue;
    }

    const currentHash = sha256(readFileSync(installedPath));
    if (currentHash !== file.sha256 && !force) {
      preserved.push(file.path);
      continue;
    }

    removable.push(file.path);
  }

  for (const filePath of removable) {
    console.log(`- remove ${filePath}`);
  }
  for (const filePath of preserved) {
    console.log(`⚠ preserve modified file ${filePath}`);
  }
  console.log(`- remove ${manifestName}`);

  if (dryRun) {
    return;
  }

  for (const filePath of removable) {
    rmSync(path.join(target, filePath), { force: true });
  }
  rmSync(path.join(target, manifestName), { force: true });
  console.log('\nUninstall complete.');
}

function collectFiles(root) {
  const files = [];
  const entries = readdirSync(root);

  for (const entry of entries) {
    if (entry === '.DS_Store') {
      continue;
    }

    const fullPath = path.join(root, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (stat.isFile()) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function collectSkillDirectories(root) {
  return readdirSync(root)
    .map((entry) => path.join(root, entry))
    .filter((entryPath) => statSync(entryPath).isDirectory() && existsSync(path.join(entryPath, 'SKILL.md')))
    .sort();
}

function readManifest(target) {
  const manifestPath = path.join(target, manifestName);
  if (!existsSync(manifestPath)) {
    return null;
  }

  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function printPlan(action, target, operations, dryRun) {
  console.log(`Dev Flow Skills ${action}`);
  console.log(`Version: ${packageJson.version}`);
  console.log(`Target: ${target}`);
  if (dryRun) {
    console.log('Mode: dry-run');
  }
  console.log('');

  for (const operation of operations) {
    if (operation.type === 'preserve') {
      console.log(`⚠ preserve local changes: ${operation.relativePath}`);
      console.log(`  write new version: ${path.relative(target, operation.newFile)}`);
      continue;
    }

    console.log(`${operation.type === 'create' ? '+' : '~'} ${operation.relativePath}`);
  }
}

function printHelp() {
  console.log(`Dev Flow Skills ${packageJson.version}

Usage:
  dev-flow install [--global|--target PATH] [--dry-run] [--force]
  dev-flow update [--global|--target PATH] [--dry-run] [--force]
  dev-flow doctor [--global|--target PATH]
  dev-flow install-codex [--target PATH] [--commands-target PATH] [--dry-run] [--force]
  dev-flow update-codex [--target PATH] [--commands-target PATH] [--dry-run] [--force]
  dev-flow doctor-codex [--target PATH] [--commands-target PATH]
  dev-flow install-claude [--target PATH] [--commands-target PATH] [--dry-run] [--force]
  dev-flow update-claude [--target PATH] [--commands-target PATH] [--dry-run] [--force]
  dev-flow doctor-claude [--target PATH] [--commands-target PATH]
  dev-flow uninstall [--global|--target PATH] [--dry-run]
  dev-flow version
`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
