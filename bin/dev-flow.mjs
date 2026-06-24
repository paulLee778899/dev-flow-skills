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
const codexCommandsSourceRoot = path.join(packageRoot, 'commands');
const claudeSkillsRoot = path.join(packageRoot, 'skills');
const claudeCommandsSourceRoot = path.join(packageRoot, 'commands', 'claude');
const packageJsonPath = path.join(packageRoot, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const manifestName = 'dev-flow-manifest.json';
const repositorySlug = 'paulLee778899/dev-flow-skills';
const coreSkillNames = [
  'dev-flow-acceptance',
  'dev-flow-cr',
  'dev-flow-debugging',
  'dev-flow-execution',
  'dev-flow-git',
  'dev-flow-intent',
  'dev-flow-master',
  'dev-flow-planning',
  'dev-flow-review',
  'dev-flow-ui-ux',
];
const opsxRequiredPhrases = ['/opsx:ff', '/opsx:apply', '/opsx:verify'];
const commandFileNames = ['dev-flow.md', 'dev-flow-cr.md'];
const crIndependentPhrase = 'Do not run as an automatic `/dev-flow` stage';
const staleWorkflowPatterns = [
  { pattern: 'opsx-propose', reason: 'old opsx command name' },
  { pattern: 'lightweight-change', reason: 'ad hoc lightweight artifact name' },
  { pattern: 'minimal local', reason: 'local-note fallback wording' },
  { pattern: 'one-off direct', reason: 'direct-change fallback wording' },
];
const staleRepositoryPatterns = [
  { pattern: '1Zihao/dev-flow-skills', reason: 'old repository URL' },
];
const forbiddenOpenCodeInstallPaths = [
  { pattern: /^node_modules(\/|$)/, reason: 'local dependency directory must not be installed' },
  { pattern: /^package(?:-lock)?\.json$/, reason: 'local dependency manifest must not be installed' },
  { pattern: /^bun\.lock$/, reason: 'local dependency lockfile must not be installed' },
  { pattern: /^skills\/tk8620-firmware-workflow(\/|$)/, reason: 'OpenCode surface only mirrors core dev-flow skills' },
];
const maxCoreSkillLines = 80;
const maxSkillLines = 120;
const referenceTocLineThreshold = 100;
const governanceSemanticChecks = [
  {
    skill: 'dev-flow-master',
    label: 'master gates and lightweight signals',
    required: [
      'Phase 1 Gate',
      'Phase 2 Gate',
      'execution_actor_decided',
      'ready-to-report',
      'lightweight_artifact_ready',
      'opsx_apply_complete',
      'opsx_verify_complete',
      'Chat memory is never sufficient',
    ],
  },
  {
    skill: 'dev-flow-planning',
    label: 'planning gates and orchestration',
    required: [
      'documentation_start_approved',
      'planning_docs_ready',
      'task_orchestration_ready',
      'Executable Test Matrix',
      'Phase 1 Gate',
      'Phase 2 Gate',
    ],
  },
  {
    skill: 'dev-flow-execution',
    label: 'execution settlement and recovery',
    required: [
      'Run-to-Completion Loop',
      'final_success',
      'final_failed',
      'final_blocked',
      'Requirement Change During Execution',
      'Never dispatch from stale memory',
      'execution_settled',
    ],
  },
  {
    skill: 'dev-flow-cr',
    label: 'independent CR command',
    required: [
      'cr_report_ready',
      'Run only when the user explicitly requests CR',
      'do not run automatically inside `/dev-flow`',
      'Stay read-only for implementation files',
      'CR Report',
    ],
  },
  {
    skill: 'dev-flow-git',
    label: 'git modes and canonical states',
    required: [
      'git_safe',
      'patch_ready',
      'deferred_accepted',
      'shared_working_tree_applied',
      'applied_from_shared_worktree_patch',
      'worktree mode',
    ],
  },
  {
    skill: 'dev-flow-acceptance',
    label: 'acceptance readiness',
    required: [
      'ready-to-report',
      'acceptance_ready',
      '/opsx:verify <change>',
      'canonical Git/patch integration state',
      'not-ready',
    ],
  },
];

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
    const resolved = path.resolve(process.cwd(), explicitTarget);
    return path.extname(resolved) ? path.dirname(resolved) : resolved;
  }

  return path.join(homedir(), '.agents', 'commands');
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
    const resolved = path.resolve(process.cwd(), explicitTarget);
    return path.extname(resolved) ? path.dirname(resolved) : resolved;
  }

  return path.join(homedir(), '.claude', 'commands');
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
  const files = collectInstallableOpenCodeFiles();
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
    ...commandFileNames.map((fileName) => `command/${fileName}`),
    ...collectCoreSkillFiles().map((relativePath) => `skills/${relativePath}`),
  ];

  console.log('Dev Flow Skills Doctor');
  console.log(`Target: ${target}\n`);

  let ok = true;
  for (const relativePath of required) {
    const exists = existsSync(path.join(target, relativePath));
    ok = ok && exists;
    console.log(`${exists ? '✓' : '✗'} ${relativePath}`);
  }

  ok = checkInstalledOpenCodeSemantics(target) && ok;

  const manifest = readManifest(target);
  if (manifest) {
    console.log(`✓ ${manifestName} (${manifest.version})`);
  } else if (isSourceOpenCodeTarget(target)) {
    console.log(`✓ ${manifestName} (source tree; generated on install)`);
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
  const commandsTarget = codexCommandTarget();
  const dryRun = flags.has('dry-run');
  const force = flags.has('force');
  const targets = [
    { label: 'skills', source: codexSkillsRoot, target: skillsTarget, type: 'dir' },
    ...commandFileNames.map((fileName) => ({
      label: `command:${fileName}`,
      source: path.join(codexCommandsSourceRoot, fileName),
      target: path.join(commandsTarget, fileName),
      type: 'file',
    })),
  ];

  console.log(`Dev Flow Skills ${action}`);
  console.log(`Skills source: ${codexSkillsRoot}`);
  console.log(`Skills target: ${skillsTarget}`);
  console.log(`Commands source: ${codexCommandsSourceRoot}`);
  console.log(`Commands target: ${commandsTarget}`);
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
  console.log('\nCodex skills and /dev-flow commands installed. Restart Codex to discover them.');
}

async function doctorCodex() {
  const skillsTarget = codexTargetRoot();
  const commandsTarget = codexCommandTarget();
  const required = collectAllSkillFiles();

  console.log('Dev Flow Skills Codex Doctor');
  console.log(`Skills target: ${skillsTarget}`);
  console.log(`Commands target: ${commandsTarget}\n`);

  let ok = existsSync(skillsTarget);
  console.log(`${ok ? '✓' : '✗'} ${skillsTarget}`);

  for (const relativePath of required) {
    const exists = existsSync(path.join(skillsTarget, relativePath));
    ok = ok && exists;
    console.log(`${exists ? '✓' : '✗'} ${relativePath}`);
  }

  for (const fileName of commandFileNames) {
    const commandPath = path.join(commandsTarget, fileName);
    const commandExists = existsSync(commandPath);
    ok = ok && commandExists;
    console.log(`${commandExists ? '✓' : '✗'} ${commandPath}`);
  }

  ok = checkCodexSemantics(skillsTarget, commandsTarget) && ok;

  if (!ok) {
    process.exitCode = 1;
    console.log('\nNot ready. Run `dev-flow install-codex` and restart Codex.');
    return;
  }

  console.log('\nReady. Restart Codex if it was already running.');
}

async function installClaudeAdapter(action) {
  const skillsTargetRoot = claudeSkillsTargetRoot();
  const commandsTarget = claudeCommandTarget();
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
    ...commandFileNames.map((fileName) => ({
      label: `command:${fileName}`,
      source: path.join(claudeCommandsSourceRoot, fileName),
      target: path.join(commandsTarget, fileName),
      type: 'file',
    })),
  ];

  console.log(`Dev Flow Skills ${action}`);
  console.log(`Skills source: ${claudeSkillsRoot}`);
  console.log(`Skills target: ${skillsTargetRoot}`);
  console.log(`Commands source: ${claudeCommandsSourceRoot}`);
  console.log(`Commands target: ${commandsTarget}`);
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
  console.log('\nClaude skills and /dev-flow commands installed. Restart Claude Code to discover them.');
}

async function doctorClaude() {
  const skillsTargetRoot = claudeSkillsTargetRoot();
  const commandsTarget = claudeCommandTarget();

  console.log('Dev Flow Skills Claude Doctor');
  console.log(`Skills target: ${skillsTargetRoot}`);
  console.log(`Commands target: ${commandsTarget}\n`);

  let ok = existsSync(skillsTargetRoot);
  console.log(`${ok ? '✓' : '✗'} ${skillsTargetRoot}`);

  for (const relativePath of collectAllSkillFiles()) {
    const exists = existsSync(path.join(skillsTargetRoot, relativePath));
    ok = ok && exists;
    console.log(`${exists ? '✓' : '✗'} ${relativePath}`);
  }

  for (const fileName of commandFileNames) {
    const commandPath = path.join(commandsTarget, fileName);
    const commandExists = existsSync(commandPath);
    ok = ok && commandExists;
    console.log(`${commandExists ? '✓' : '✗'} ${commandPath}`);
  }

  ok = checkClaudeSemantics(skillsTargetRoot, commandsTarget) && ok;

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

function collectInstallableOpenCodeFiles() {
  return [
    ...collectFiles(path.join(sourceRoot, 'command')),
    ...collectFiles(path.join(sourceRoot, 'skills')),
  ].sort();
}

function openCodeInstallRelativePath(filePath) {
  return path.relative(sourceRoot, filePath).split(path.sep).join('/');
}

function collectSkillDirectories(root) {
  return readdirSync(root)
    .map((entry) => path.join(root, entry))
    .filter((entryPath) => statSync(entryPath).isDirectory() && existsSync(path.join(entryPath, 'SKILL.md')))
    .sort();
}

function checkInstalledOpenCodeSemantics(target) {
  const checks = [
    {
      label: 'OpenCode command lightweight opsx contract',
      filePath: path.join(target, 'command', 'dev-flow.md'),
      required: opsxRequiredPhrases,
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'OpenCode CR command contract',
      filePath: path.join(target, 'command', 'dev-flow-cr.md'),
      required: ['dev-flow-cr', 'cr_report_ready', crIndependentPhrase],
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'OpenCode master lightweight opsx contract',
      dirPath: path.join(target, 'skills', 'dev-flow-master'),
      required: [
        ...opsxRequiredPhrases,
        'lightweight_artifact_ready',
        'opsx_apply_complete',
        'opsx_verify_complete',
      ],
      forbidden: staleWorkflowPatterns,
    },
  ];

  let ok = true;
  console.log('\nSemantic checks:');
  for (const check of checks) {
    ok = checkFileSemantics(check) && ok;
  }
  ok = checkGovernanceSemantics(path.join(target, 'skills'), 'OpenCode governance') && ok;
  ok = checkSourceSemantics() && ok;
  return ok;
}

function checkCodexSemantics(skillsTarget, commandsTarget) {
  const checks = [
    {
      label: 'Codex command lightweight opsx contract',
      filePath: path.join(commandsTarget, 'dev-flow.md'),
      required: opsxRequiredPhrases,
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'Codex CR command contract',
      filePath: path.join(commandsTarget, 'dev-flow-cr.md'),
      required: ['dev-flow-cr', 'cr_report_ready', crIndependentPhrase],
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'Codex master lightweight opsx contract',
      dirPath: path.join(skillsTarget, 'dev-flow-master'),
      required: [
        ...opsxRequiredPhrases,
        'lightweight_artifact_ready',
        'opsx_apply_complete',
        'opsx_verify_complete',
      ],
      forbidden: staleWorkflowPatterns,
    },
  ];

  let ok = true;
  console.log('\nSemantic checks:');
  for (const check of checks) {
    ok = checkFileSemantics(check) && ok;
  }
  ok = checkGovernanceSemantics(skillsTarget, 'Codex governance') && ok;
  ok = checkSourceSemantics() && ok;
  return ok;
}

function checkClaudeSemantics(skillsTargetRoot, commandsTarget) {
  const checks = [
    {
      label: 'Claude command lightweight opsx contract',
      filePath: path.join(commandsTarget, 'dev-flow.md'),
      required: opsxRequiredPhrases,
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'Claude CR command contract',
      filePath: path.join(commandsTarget, 'dev-flow-cr.md'),
      required: ['dev-flow-cr', 'cr_report_ready', crIndependentPhrase],
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'Claude master lightweight opsx contract',
      dirPath: path.join(skillsTargetRoot, 'dev-flow-master'),
      required: [
        ...opsxRequiredPhrases,
        'lightweight_artifact_ready',
        'opsx_apply_complete',
        'opsx_verify_complete',
      ],
      forbidden: staleWorkflowPatterns,
    },
  ];

  let ok = true;
  console.log('\nSemantic checks:');
  for (const check of checks) {
    ok = checkFileSemantics(check) && ok;
  }
  ok = checkGovernanceSemantics(skillsTargetRoot, 'Claude governance') && ok;
  ok = checkSourceSemantics() && ok;
  return ok;
}

function checkSourceSemantics() {
  const checks = [
    {
      label: 'README lightweight artifact docs',
      filePath: path.join(packageRoot, 'README.md'),
      required: opsxRequiredPhrases,
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'workflow overview lightweight path',
      filePath: path.join(packageRoot, 'docs', 'workflow-overview.md'),
      required: opsxRequiredPhrases,
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'packaged OpenCode command',
      filePath: path.join(packageRoot, '.opencode', 'command', 'dev-flow.md'),
      required: opsxRequiredPhrases,
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'packaged OpenCode CR command',
      filePath: path.join(packageRoot, '.opencode', 'command', 'dev-flow-cr.md'),
      required: ['dev-flow-cr', 'cr_report_ready', crIndependentPhrase],
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'packaged Codex command',
      filePath: path.join(codexCommandsSourceRoot, 'dev-flow.md'),
      required: opsxRequiredPhrases,
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'packaged Codex CR command',
      filePath: path.join(codexCommandsSourceRoot, 'dev-flow-cr.md'),
      required: ['dev-flow-cr', 'cr_report_ready', crIndependentPhrase],
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'packaged Claude command',
      filePath: path.join(claudeCommandsSourceRoot, 'dev-flow.md'),
      required: opsxRequiredPhrases,
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'packaged Claude CR command',
      filePath: path.join(claudeCommandsSourceRoot, 'dev-flow-cr.md'),
      required: ['dev-flow-cr', 'cr_report_ready', crIndependentPhrase],
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'Codex install repository URL',
      filePath: path.join(packageRoot, '.codex', 'INSTALL.md'),
      required: [repositorySlug],
      forbidden: staleRepositoryPatterns,
    },
    {
      label: 'contributing repository URL',
      filePath: path.join(packageRoot, 'CONTRIBUTING.md'),
      required: [repositorySlug],
      forbidden: staleRepositoryPatterns,
    },
    {
      label: 'agent install repository URL',
      filePath: path.join(packageRoot, 'install', 'agent-install.md'),
      required: [repositorySlug],
      forbidden: staleRepositoryPatterns,
    },
    {
      label: 'manual install current commands',
      filePath: path.join(packageRoot, 'install', 'manual-install.md'),
      required: ['dev-flow install', 'dev-flow install-codex', 'dev-flow install-claude'],
      forbidden: staleRepositoryPatterns,
    },
    {
      label: 'OpenCode install boundary docs',
      filePath: path.join(packageRoot, 'install', 'opencode.md'),
      required: ['core `dev-flow-*`', 'tk8620-firmware-workflow'],
      forbidden: staleRepositoryPatterns,
    },
    {
      label: 'installation model boundary docs',
      filePath: path.join(packageRoot, 'docs', 'installation-model.md'),
      required: ['core `dev-flow-*`', 'tk8620-firmware-workflow'],
      forbidden: staleRepositoryPatterns,
    },
  ];

  let ok = true;
  for (const check of checks) {
    ok = checkFileSemantics(check) && ok;
  }
  ok = checkGovernanceSemantics(codexSkillsRoot, 'source governance') && ok;
  ok = checkOpenCodeCoreSkillMirror() && ok;
  ok = checkOpenCodeInstallSurface() && ok;
  ok = checkOpenCodeSkillWhitelist() && ok;
  ok = checkSkillSizeLimits() && ok;
  ok = checkReferenceTablesOfContents() && ok;
  return ok;
}

function checkGovernanceSemantics(skillsRoot, labelPrefix) {
  let ok = true;
  for (const check of governanceSemanticChecks) {
    ok = checkFileSemantics({
      label: `${labelPrefix}: ${check.label}`,
      dirPath: path.join(skillsRoot, check.skill),
      required: check.required,
      forbidden: staleWorkflowPatterns,
    }) && ok;
  }

  return ok;
}

function checkOpenCodeCoreSkillMirror() {
  let ok = true;
  const relativePaths = collectCoreSkillFiles();

  for (const relativePath of relativePaths) {
    const codexFile = path.join(codexSkillsRoot, relativePath);
    const openCodeFile = path.join(sourceRoot, 'skills', relativePath);

    if (!existsSync(codexFile) || !existsSync(openCodeFile)) {
      ok = false;
      console.log(`✗ core skill mirror: ${relativePath}`);
      continue;
    }

    const same = readFileSync(codexFile, 'utf8') === readFileSync(openCodeFile, 'utf8');
    ok = same && ok;
    console.log(`${same ? '✓' : '✗'} core skill mirror: ${relativePath}`);
  }

  return ok;
}

function checkOpenCodeInstallSurface() {
  let ok = true;
  const installable = new Set(collectInstallableOpenCodeFiles().map(openCodeInstallRelativePath));
  const forbiddenInPlan = [...installable].filter((relativePath) => isForbiddenOpenCodeInstallPath(relativePath));

  if (forbiddenInPlan.length === 0) {
    console.log('✓ OpenCode install surface allowlist');
  } else {
    ok = false;
    console.log('✗ OpenCode install surface allowlist');
    for (const relativePath of forbiddenInPlan) {
      console.log(`  forbidden install path: ${relativePath}`);
    }
  }

  const ignoredSourceResidue = collectTopLevelForbiddenOpenCodeResidue();
  const residueExcluded = ignoredSourceResidue.every((relativePath) => !installable.has(relativePath));
  ok = residueExcluded && ok;
  console.log(`${residueExcluded ? '✓' : '✗'} OpenCode local dependency residue excluded from install`);

  return ok;
}

function checkOpenCodeSkillWhitelist() {
  const skillsRoot = path.join(sourceRoot, 'skills');
  if (!existsSync(skillsRoot)) {
    console.log('✗ OpenCode skills whitelist');
    return false;
  }

  const actual = readdirSync(skillsRoot)
    .map((entry) => path.join(skillsRoot, entry))
    .filter((entryPath) => statSync(entryPath).isDirectory())
    .map((entryPath) => path.basename(entryPath))
    .sort();
  const allowed = [...coreSkillNames].sort();
  const extra = actual.filter((name) => !allowed.includes(name));
  const missing = allowed.filter((name) => !actual.includes(name));
  const ok = extra.length === 0 && missing.length === 0;

  console.log(`${ok ? '✓' : '✗'} OpenCode skills whitelist`);
  for (const name of extra) {
    console.log(`  extra skill: ${name}`);
  }
  for (const name of missing) {
    console.log(`  missing skill: ${name}`);
  }

  return ok;
}

function checkSkillSizeLimits() {
  let ok = true;
  for (const skillPath of collectSkillDirectories(codexSkillsRoot)) {
    const skillName = path.basename(skillPath);
    const limit = coreSkillNames.includes(skillName) ? maxCoreSkillLines : maxSkillLines;
    const skillFile = path.join(skillPath, 'SKILL.md');
    const lineCount = countLines(readFileSync(skillFile, 'utf8'));
    const passed = lineCount <= limit;
    ok = passed && ok;
    console.log(`${passed ? '✓' : '✗'} skill size: ${skillName}/SKILL.md (${lineCount}/${limit} lines)`);
  }

  return ok;
}

function checkReferenceTablesOfContents() {
  let ok = true;
  for (const skillPath of collectSkillDirectories(codexSkillsRoot)) {
    const referencesPath = path.join(skillPath, 'references');
    if (!existsSync(referencesPath)) {
      continue;
    }

    for (const filePath of collectFiles(referencesPath).filter((file) => file.endsWith('.md'))) {
      const content = readFileSync(filePath, 'utf8');
      const lineCount = countLines(content);
      if (lineCount <= referenceTocLineThreshold) {
        continue;
      }

      const hasToc = hasTopLevelTableOfContents(content);
      ok = hasToc && ok;
      const relativePath = path.relative(codexSkillsRoot, filePath);
      console.log(`${hasToc ? '✓' : '✗'} reference TOC: ${relativePath} (${lineCount} lines)`);
    }
  }

  return ok;
}

function countLines(content) {
  return content === '' ? 0 : content.replace(/\n$/, '').split('\n').length;
}

function hasTopLevelTableOfContents(content) {
  const firstLines = content.split('\n').slice(0, 20).join('\n');
  return /(^|\n)## Table of Contents\n/.test(firstLines);
}

function isForbiddenOpenCodeInstallPath(relativePath) {
  return forbiddenOpenCodeInstallPaths.some(({ pattern }) => pattern.test(relativePath));
}

function collectTopLevelForbiddenOpenCodeResidue() {
  if (!existsSync(sourceRoot)) {
    return [];
  }

  return readdirSync(sourceRoot)
    .filter((entry) => isForbiddenOpenCodeInstallPath(entry))
    .sort();
}

function checkContentSemantics({ label, content, missingLabel, required = [], forbidden = [] }) {
  if (content === null) {
    console.log(`✗ ${label} (missing: ${missingLabel})`);
    return false;
  }

  const missing = required.filter((phrase) => !content.includes(phrase));
  const stale = forbidden.filter(({ pattern }) => content.includes(pattern));

  if (missing.length === 0 && stale.length === 0) {
    console.log(`✓ ${label}`);
    return true;
  }

  console.log(`✗ ${label}`);
  for (const phrase of missing) {
    console.log(`  missing: ${phrase}`);
  }
  for (const item of stale) {
    console.log(`  stale: ${item.pattern} (${item.reason})`);
  }
  return false;
}

function readSemanticContent(filePath) {
  if (!filePath) {
    return null;
  }
  if (!existsSync(filePath)) {
    return null;
  }
  return readFileSync(filePath, 'utf8');
}

function checkFileSemantics({ label, filePath, dirPath, required = [], forbidden = [] }) {
  const content = dirPath ? readSkillSemanticContent(dirPath) : readSemanticContent(filePath);
  return checkContentSemantics({
    label,
    content,
    missingLabel: dirPath ?? filePath,
    required,
    forbidden,
  });
}

function readSkillSemanticContent(dirPath) {
  if (!existsSync(dirPath)) {
    return null;
  }

  const files = [];
  const skillFile = path.join(dirPath, 'SKILL.md');
  if (existsSync(skillFile)) {
    files.push(skillFile);
  }

  const referencesPath = path.join(dirPath, 'references');
  if (existsSync(referencesPath)) {
    files.push(...collectFiles(referencesPath));
  }

  if (files.length === 0) {
    return null;
  }

  return files.map((file) => readFileSync(file, 'utf8')).join('\n');
}

function collectCoreSkillFiles() {
  const files = [];
  for (const skillName of coreSkillNames) {
    const skillPath = path.join(codexSkillsRoot, skillName);
    if (!existsSync(skillPath)) {
      files.push(`${skillName}/SKILL.md`);
      continue;
    }

    for (const file of collectFiles(skillPath)) {
      files.push(path.relative(codexSkillsRoot, file));
    }
  }

  return files.sort();
}

function collectAllSkillFiles() {
  const files = [];
  for (const skillPath of collectSkillDirectories(codexSkillsRoot)) {
    for (const file of collectFiles(skillPath)) {
      files.push(path.relative(codexSkillsRoot, file));
    }
  }

  return files.sort();
}

function readManifest(target) {
  const manifestPath = path.join(target, manifestName);
  if (!existsSync(manifestPath)) {
    return null;
  }

  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

function isSourceOpenCodeTarget(target) {
  return path.resolve(target) === path.resolve(sourceRoot);
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
