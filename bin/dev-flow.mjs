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
  'dev-flow-loop',
  'dev-flow-loop-envelope',
  'dev-flow-loop-triage',
  'dev-flow-master',
  'dev-flow-planning',
  'dev-flow-review',
  'dev-flow-scheduler',
  'dev-flow-ui-ux',
];
const opsxRequiredPhrases = ['/opsx:ff', '/opsx:apply', '/opsx:verify'];
const commandFileNames = ['dev-flow.md', 'dev-flow-cr.md', 'dev-flow-loop.md', 'dev-flow-triage.md', 'dev-flow-scheduler.md'];
const crIndependentPhrase = 'Do not run as an automatic `/dev-flow` stage';
const releaseMetadataKeywords = ['loop', 'triage', 'scheduler', 'automation'];
const releaseMetadataDescriptionPhrases = ['Loop Engineering delivery loops', 'read-only triage', 'scheduler automation'];
const pluginLoopPromptPhrase = 'goal-preserving delivery loop';
const staleWorkflowPatterns = [
  { pattern: 'opsx-propose', reason: 'old opsx command name' },
  { pattern: 'lightweight-change', reason: 'ad hoc lightweight artifact name' },
  { pattern: 'minimal local', reason: 'local-note fallback wording' },
  { pattern: 'one-off direct', reason: 'direct-change fallback wording' },
  { pattern: 'Codex slash-command', reason: 'commands are shared across Codex, OpenCode, and Claude surfaces' },
  { pattern: 'planning_docs_ready', reason: 'old fixed planning-doc signal replaced by openspec_artifact_ready' },
  { pattern: 'Document Self-Review Score', reason: 'gate scoring must use independent checker subagents' },
  { pattern: 'design self-review score', reason: 'gate scoring must use independent checker subagents' },
  { pattern: 'task self-review evidence', reason: 'task evidence is local verification; gate judgments use independent checker subagents' },
  { pattern: 'self_reviewed', reason: 'baseline status must name independent checker review, not self-review' },
];
const staleSingleCheckerScorePatterns = [
  { pattern: 'independent_checker_score:', reason: 'use checker_score (singular, no array) for loop signals' },
  { pattern: 'final_independent_checker_score:', reason: 'loop eval schema must use final_checker_score' },
  { pattern: 'final_independent_checker_scores:', reason: 'loop eval schema changed to final_checker_score' },
  { pattern: 'final_independent_checker_count:', reason: 'loop eval schema changed to final_checker_score; count field removed' },
];
const loopTerminologyForbiddenPatterns = [
  { pattern: 'test design docs', reason: 'fourth baseline doc must be test plan (`test-plan.md`)' },
  { pattern: 'requirements, high-level design, detailed design, and test design', reason: 'use test plan (`test-plan.md`) as the fourth doc' },
  { pattern: 'test_design', reason: 'schema token must be test_plan' },
];
const loopReadOnlyPhrases = [
  'Default read-only',
  'Do not start `/dev-flow`',
  'Do not start `/dev-flow-cr`',
  'loop_control_ready',
  'loop_baseline_ready',
  'trace_or_eval_evidence',
  'maker-checker',
  'trigger type',
  'checker_score',
  'Baseline Docs Gate',
  'Execution Envelope Gate',
  'Loop Phase DAG',
  'phase-level OpenSpec/opsx',
  'auto-continue within baseline',
  'TDD per task via superpowers',
  'phase_eval_result.checker_score',
  'checker score >= 95',
  'without requiring another slash command',
  'Do not start commits, pushes, PRs, merges, worktrees, schedulers, or external mutations automatically',
  'create, update, pause, resume, or delete schedulers/automations',
];
const loopDeliveryPhrases = [
  'loop_baseline_ready',
  'loop-only baseline artifacts',
  'checker_score',
  'quality_threshold: 95',
  'Loop Phase DAG',
  'Docs/<topic>/loop/',
  'phase-artifacts.md',
  'opsx-index.md',
  'openspec/changes/<change-id>/',
  'Do not move or copy OpenSpec/opsx originals into the loop artifact directory',
  'Baseline Docs Gate',
  'Execution Envelope Gate',
  'phase-level OpenSpec/opsx',
  'auto-continue within baseline',
  'within_confirmed_baseline',
  'explicit user approval',
  'Freezing the initial baseline, approving the Loop Phase DAG, and enabling `within_confirmed_baseline` require explicit user approval',
  'exceeding baseline, budget, retry, stop-condition, or side-effect boundaries requires stopping and asking the user',
  'phase_eval',
  'phase_eval threshold: 95',
  'no P0/P1 finding',
  'TDD per task via superpowers',
  'requirements, high-level design, detailed design, test plan (`test-plan.md`), and test case workbook (`test-cases.xlsx`)',
  'max phase repair rounds',
];
const loopBaselineTemplateFiles = [
  'requirements.md',
  'high-level-design.md',
  'detailed-design.md',
  'test-plan.md',
  'test-cases.xlsx',
];
const loopBaselineTemplateDocPhrases = [
  'dev-flow-loop/assets/baseline-templates',
  'requirements.md',
  'high-level-design.md',
  'detailed-design.md',
  'test-plan.md',
  'test-cases.xlsx',
  'dev-flow-master/templates',
  'no longer exists',
];
const loopArtifactDirectoryPhrases = [
  'Docs/<topic>/loop/',
  'phase-artifacts.md',
  'opsx-index.md',
  'loop-state.md',
  'openspec/changes/<change-id>/',
  'Do not move or copy OpenSpec',
];
const staleLoopBaselineTemplateDocPatterns = [
  { pattern: 'planning templates', reason: 'loop baseline templates are not dev-flow planning templates' },
  { pattern: 'governed planning templates', reason: 'loop baseline templates are not governed planning templates' },
  { pattern: 'skills/dev-flow-master/templates/', reason: 'templates moved to dev-flow-loop/assets/baseline-templates' },
  { pattern: '.opencode/skills/dev-flow-master/templates/', reason: 'templates moved to dev-flow-loop/assets/baseline-templates' },
  { pattern: '~/.claude/skills/dev-flow-master/templates/', reason: 'templates moved to dev-flow-loop/assets/baseline-templates' },
  { pattern: 'installed `dev-flow-master/templates/` directory', reason: 'templates moved to dev-flow-loop/assets/baseline-templates' },
];
const commandSkeletonHeadings = ['# Dev Flow', '## Workflow', '## Rules', '## User Request'];
const triageCommandSkeletonHeadings = ['# Dev Flow Triage', '## Workflow', '## Rules', '## User Request'];
const loopCommandSkeletonHeadings = ['# Dev Flow Loop', '## Workflow', '## Rules', '## User Request'];
const triageReadOnlyPhrases = [
  'Default read-only',
  'Candidate Inbox',
  '结论',
  '下一步推荐',
  '可直接回复',
  'loop_triage_ready',
  'Do not start `/dev-flow`',
  'Do not start `/dev-flow-cr`',
  'trace_summary',
  'without requiring another slash command',
  'Do not modify files, Git history, trackers, CI, external services, or dev-flow delivery artifacts',
  'do not include a `推荐入口` table column',
];
const triageForbiddenPatterns = [
  ...staleWorkflowPatterns,
  { pattern: '| 推荐入口 |', reason: 'triage table should not include route column' },
  { pattern: '|推荐入口|', reason: 'triage table should not include route column' },
];
const schedulerRequiredPhrases = [
  'dev-flow-scheduler',
  'scheduler_ready',
  'explicit user approval',
  'Do not create, update, pause, resume, or delete automations without explicit user approval',
  'Do not run `/dev-flow` automatically',
  'Do not run `/dev-flow-cr` automatically',
  'Do not modify files, commit, push, open PRs, merge, create worktrees, mutate trackers, call production systems, or perform full code review',
  'Candidate Inbox',
];
const staleRepositoryPatterns = [
  { pattern: '1Zihao/dev-flow-skills', reason: 'old repository URL' },
];
const staleReleaseMetadataPatterns = [
  { pattern: 'read-only Loop Engineering triage/control', reason: 'loop metadata must include delivery loops, not only triage/control' },
  { pattern: 'review Loop Engineering safety before automation', reason: 'loop default prompt must include delivery-loop use case' },
  { pattern: 'independent CR, read-only Loop Engineering triage, and approved scheduler', reason: 'release description must mention Loop Engineering delivery loops' },
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
      'OpenSpec Baseline Gate',
      'Phase 2 Gate',
      'execution_actor_decided',
      'ready-to-report',
      'lightweight_artifact_ready',
      'opsx_apply_complete',
      'opsx_verify_complete',
      'Chat memory is never sufficient',
      'loop-authorized phase handoff',
      'confirmed loop baseline',
      'Loop Phase DAG node',
      'dev_flow_phase_handoff',
      'Do not ask the user to retype `/dev-flow`',
    ],
  },
  {
    skill: 'dev-flow-planning',
    label: 'planning gates and orchestration',
    required: [
      'documentation_start_approved',
      'openspec_artifact_ready',
      'task_orchestration_ready',
      'Executable Test Matrix',
      'OpenSpec Baseline Gate',
      'Phase 2 Gate',
      'Loop Baseline Mode',
      'Independent Checker Review Scores',
      'independent_checker_scores',
      'independent_checker_count',
      'Loop Phase DAG',
      'phase-level OpenSpec/opsx',
      'Docs/<topic>/loop/',
      'phase-artifacts.md',
      'opsx-index.md',
      'openspec/changes/<change-id>/',
      'do not move or copy them into the loop artifact directory',
      'TDD evidence requirement',
      'OpenSpec/opsx baseline artifacts',
    ],
    forbidden: [...loopTerminologyForbiddenPatterns, ...staleSingleCheckerScorePatterns],
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
      'superpowers:test-driven-development',
      'failing test first',
      'TDD evidence',
      'not settled for acceptance',
      'TDD evidence status',
      'task local verification evidence and TDD evidence',
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
    skill: 'dev-flow-loop',
    label: 'loop control plane',
    required: [
      'Loop Engineering',
      'Default read-only',
      'dev-flow-loop-envelope',
      'dev-flow-loop-triage',
      'loop_control_ready',
      'loop_baseline_ready',
      'Loop Primitives',
      'goal',
      'baseline',
      'phase_dag',
      'trigger',
      'trace',
      'eval',
      'Do not start `/dev-flow`',
      'Do not start `/dev-flow-cr`',
      'Keep loop state separate from `dev-flow-state.md`',
      'trace_or_eval_evidence',
      'maker-checker',
      'handoff_question',
      'dev-flow-scheduler',
      'checker_score',
      'loop-only baseline artifacts',
      'Baseline Docs Gate',
      'Execution Envelope Gate',
      'Loop Phase DAG',
      'phase-level OpenSpec/opsx',
      'Docs/<topic>/loop/',
      'phase-artifacts.md',
      'opsx-index.md',
      'openspec/changes/<change-id>/',
      'Do not move or copy OpenSpec/opsx originals into the loop artifact directory',
      'auto-continue within baseline',
      'TDD per task via superpowers',
      'quality_threshold: 95',
      'phase_eval',
      'phase_eval threshold: 95',
      'no P0/P1 finding',
      'test plan (`test-plan.md`)',
      'test-cases.xlsx',
      'checker score >= 95',
      'Freezing the initial baseline, approving the Loop Phase DAG, and enabling `within_confirmed_baseline` require explicit user approval',
      'exceeding baseline, budget, retry, stop-condition, or side-effect boundaries requires stopping and asking the user',
    ],
    forbidden: loopTerminologyForbiddenPatterns,
  },
  {
    skill: 'dev-flow-loop-envelope',
    label: 'loop envelope safety',
    required: [
      'loop_envelope_ready',
      'budget',
      'stop_conditions',
      'repo_writer_lock',
      'baseline_authority',
      'auto_continue_scope',
      'confirmed_loop_baseline',
      'within_confirmed_baseline',
      'max_phase_repair_rounds',
      'max_full_loop_passes',
      'forbidden_side_effects',
      'schedule_kind',
      'cron_expression',
      'timezone',
      'missed_run_policy',
      'max_overlap',
      'jitter',
      'cadence',
      'trace_requirements',
      'eval_checkpoint',
      'Creating, updating, pausing, resuming, or deleting an automation through `dev-flow-scheduler`',
      'dev-flow-scheduler',
    ],
  },
  {
    skill: 'dev-flow-loop-triage',
    label: 'loop read-only triage',
    required: [
      'loop_triage_ready',
      'Candidate Inbox',
      'Default read-only',
      'Do not start `/dev-flow`',
      'Do not write `dev-flow-state.md`',
      'recommended_next_route',
      'trace_summary',
      'sources_unavailable',
      'handoff_question',
      '结论',
      '下一步推荐',
      '可直接回复',
      'not as a Candidate Inbox table column',
    ],
  },
  {
    skill: 'dev-flow-scheduler',
    label: 'scheduler automation management',
    required: [
      'scheduler_ready',
      'explicit user approval',
      'cron',
      'heartbeat',
      'Candidate Inbox',
      'Do not scan candidates',
      'Do not run `/dev-flow`',
      'Do not run `/dev-flow-cr`',
      'forbidden_side_effects',
      'automation_id',
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
      'TDD evidence',
      'phase-level OpenSpec/opsx evidence',
      'independent acceptance checker',
      'independent_checker_scores',
      'independent_checker_count',
      'system-level checks',
      'requirements/design/test coverage',
      'Executable Test Matrix',
    ],
    forbidden: staleSingleCheckerScorePatterns,
  },
  {
    skill: 'dev-flow-planning',
    label: 'detailed test matrix coverage',
    required: [
      'normal path and alternative path',
      'invalid input and boundary conditions',
      'permission/auth/authz failures',
      'persistence, migration, rollback, and retry behavior',
      'concurrency, async timing, idempotency, and ordering issues',
      'API/protocol/data compatibility and contract errors',
      'UI loading, error, empty, responsive, accessibility, and browser-runtime cases',
      'security and abuse cases',
      'performance limits and regression budgets',
      'integration points, external dependency failures, and offline/degraded modes',
      'system-level checks',
      'independent_checker_scores',
      'independent_checker_count',
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
  console.log('\nCodex skills and slash commands (/dev-flow, /dev-flow-cr, /dev-flow-loop, /dev-flow-triage, /dev-flow-scheduler) installed. Restart Codex to discover them.');
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
  console.log('\nClaude skills and slash commands (/dev-flow, /dev-flow-cr, /dev-flow-loop, /dev-flow-triage, /dev-flow-scheduler) installed. Restart Claude Code to discover them.');
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
      label: 'OpenCode loop command contract',
      filePath: path.join(target, 'command', 'dev-flow-loop.md'),
      required: ['dev-flow-loop', 'dev-flow-loop-envelope', 'dev-flow-loop-triage', ...loopReadOnlyPhrases, ...loopArtifactDirectoryPhrases],
      forbidden: [...staleWorkflowPatterns, ...loopTerminologyForbiddenPatterns],
    },
    {
      label: 'OpenCode triage command contract',
      filePath: path.join(target, 'command', 'dev-flow-triage.md'),
      required: ['dev-flow-loop-triage', ...triageReadOnlyPhrases],
      forbidden: triageForbiddenPatterns,
    },
    {
      label: 'OpenCode scheduler command contract',
      filePath: path.join(target, 'command', 'dev-flow-scheduler.md'),
      required: schedulerRequiredPhrases,
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
      label: 'Codex loop command contract',
      filePath: path.join(commandsTarget, 'dev-flow-loop.md'),
      required: ['dev-flow-loop', 'dev-flow-loop-envelope', 'dev-flow-loop-triage', ...loopReadOnlyPhrases, ...loopArtifactDirectoryPhrases],
      forbidden: [...staleWorkflowPatterns, ...loopTerminologyForbiddenPatterns],
    },
    {
      label: 'Codex triage command contract',
      filePath: path.join(commandsTarget, 'dev-flow-triage.md'),
      required: ['dev-flow-loop-triage', ...triageReadOnlyPhrases],
      forbidden: triageForbiddenPatterns,
    },
    {
      label: 'Codex scheduler command contract',
      filePath: path.join(commandsTarget, 'dev-flow-scheduler.md'),
      required: schedulerRequiredPhrases,
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
      label: 'Claude loop command contract',
      filePath: path.join(commandsTarget, 'dev-flow-loop.md'),
      required: ['dev-flow-loop', 'dev-flow-loop-envelope', 'dev-flow-loop-triage', ...loopReadOnlyPhrases, ...loopArtifactDirectoryPhrases],
      forbidden: [...staleWorkflowPatterns, ...loopTerminologyForbiddenPatterns],
    },
    {
      label: 'Claude triage command contract',
      filePath: path.join(commandsTarget, 'dev-flow-triage.md'),
      required: ['dev-flow-loop-triage', ...triageReadOnlyPhrases],
      forbidden: triageForbiddenPatterns,
    },
    {
      label: 'Claude scheduler command contract',
      filePath: path.join(commandsTarget, 'dev-flow-scheduler.md'),
      required: schedulerRequiredPhrases,
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
      label: 'README loop scheduler docs',
      filePath: path.join(packageRoot, 'README.md'),
      required: ['/dev-flow-scheduler', 'dev-flow-scheduler', 'Candidate Inbox', 'without requiring another slash command', ...loopDeliveryPhrases],
      forbidden: [...staleWorkflowPatterns, ...loopTerminologyForbiddenPatterns],
    },
    {
      label: 'workflow overview lightweight path',
      filePath: path.join(packageRoot, 'docs', 'workflow-overview.md'),
      required: opsxRequiredPhrases,
      forbidden: staleWorkflowPatterns,
    },
    {
      label: 'workflow overview loop scheduler path',
      filePath: path.join(packageRoot, 'docs', 'workflow-overview.md'),
      required: ['/dev-flow-scheduler', 'Candidate Inbox', 'without requiring another slash command', ...loopDeliveryPhrases],
      forbidden: [...staleWorkflowPatterns, ...loopTerminologyForbiddenPatterns],
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
      label: 'packaged OpenCode loop command',
      filePath: path.join(packageRoot, '.opencode', 'command', 'dev-flow-loop.md'),
      required: ['dev-flow-loop', 'dev-flow-loop-envelope', 'dev-flow-loop-triage', ...loopReadOnlyPhrases, ...loopArtifactDirectoryPhrases],
      forbidden: [...staleWorkflowPatterns, ...loopTerminologyForbiddenPatterns],
    },
    {
      label: 'packaged OpenCode triage command',
      filePath: path.join(packageRoot, '.opencode', 'command', 'dev-flow-triage.md'),
      required: ['dev-flow-loop-triage', ...triageReadOnlyPhrases],
      forbidden: triageForbiddenPatterns,
    },
    {
      label: 'packaged OpenCode scheduler command',
      filePath: path.join(packageRoot, '.opencode', 'command', 'dev-flow-scheduler.md'),
      required: schedulerRequiredPhrases,
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
      label: 'packaged Codex loop command',
      filePath: path.join(codexCommandsSourceRoot, 'dev-flow-loop.md'),
      required: ['dev-flow-loop', 'dev-flow-loop-envelope', 'dev-flow-loop-triage', ...loopReadOnlyPhrases, ...loopArtifactDirectoryPhrases],
      forbidden: [...staleWorkflowPatterns, ...loopTerminologyForbiddenPatterns],
    },
    {
      label: 'packaged Codex triage command',
      filePath: path.join(codexCommandsSourceRoot, 'dev-flow-triage.md'),
      required: ['dev-flow-loop-triage', ...triageReadOnlyPhrases],
      forbidden: triageForbiddenPatterns,
    },
    {
      label: 'packaged Codex scheduler command',
      filePath: path.join(codexCommandsSourceRoot, 'dev-flow-scheduler.md'),
      required: schedulerRequiredPhrases,
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
      label: 'packaged Claude loop command',
      filePath: path.join(claudeCommandsSourceRoot, 'dev-flow-loop.md'),
      required: ['dev-flow-loop', 'dev-flow-loop-envelope', 'dev-flow-loop-triage', ...loopReadOnlyPhrases, ...loopArtifactDirectoryPhrases],
      forbidden: [...staleWorkflowPatterns, ...loopTerminologyForbiddenPatterns],
    },
    {
      label: 'packaged Claude triage command',
      filePath: path.join(claudeCommandsSourceRoot, 'dev-flow-triage.md'),
      required: ['dev-flow-loop-triage', ...triageReadOnlyPhrases],
      forbidden: triageForbiddenPatterns,
    },
    {
      label: 'packaged Claude scheduler command',
      filePath: path.join(claudeCommandsSourceRoot, 'dev-flow-scheduler.md'),
      required: schedulerRequiredPhrases,
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
      required: ['dev-flow install', 'dev-flow install-codex', 'dev-flow install-claude', 'dev-flow-scheduler.md', ...loopBaselineTemplateDocPhrases],
      forbidden: [...staleRepositoryPatterns, ...staleLoopBaselineTemplateDocPatterns],
    },
    {
      label: 'OpenCode install boundary docs',
      filePath: path.join(packageRoot, 'install', 'opencode.md'),
      required: ['core `dev-flow-*`', 'tk8620-firmware-workflow', 'dev-flow-scheduler.md', '.opencode/skills/dev-flow-loop/assets/baseline-templates/', ...loopBaselineTemplateDocPhrases],
      forbidden: [...staleRepositoryPatterns, ...staleLoopBaselineTemplateDocPatterns],
    },
    {
      label: 'Claude install baseline template docs',
      filePath: path.join(packageRoot, 'install', 'claude.md'),
      required: ['~/.claude/skills/dev-flow-loop/assets/baseline-templates/', ...loopBaselineTemplateDocPhrases],
      forbidden: [...staleRepositoryPatterns, ...staleLoopBaselineTemplateDocPatterns],
    },
    {
      label: 'Codex install baseline template docs',
      filePath: path.join(packageRoot, '.codex', 'INSTALL.md'),
      required: ['skills/dev-flow-loop/assets/baseline-templates/', ...loopBaselineTemplateDocPhrases],
      forbidden: [...staleRepositoryPatterns, ...staleLoopBaselineTemplateDocPatterns],
    },
    {
      label: 'installation model boundary docs',
      filePath: path.join(packageRoot, 'docs', 'installation-model.md'),
      required: ['core `dev-flow-*`', 'tk8620-firmware-workflow', '/dev-flow-scheduler'],
      forbidden: staleRepositoryPatterns,
    },
  ];

  let ok = true;
  for (const check of checks) {
    ok = checkFileSemantics(check) && ok;
  }
  ok = checkGovernanceSemantics(codexSkillsRoot, 'source governance') && ok;
  ok = checkOpenCodeCoreSkillMirror() && ok;
  ok = checkCommandParity() && ok;
  ok = checkOpenCodeInstallSurface() && ok;
  ok = checkOpenCodeSkillWhitelist() && ok;
  ok = checkLoopBaselineTemplatePlacement() && ok;
  ok = checkReleaseMetadata() && ok;
  ok = checkSkillSizeLimits() && ok;
  ok = checkReferenceTablesOfContents() && ok;
  return ok;
}

function checkLoopBaselineTemplatePlacement() {
  let ok = true;
  const sourceLoopTemplatesPath = path.join(codexSkillsRoot, 'dev-flow-loop', 'assets', 'baseline-templates');
  const openCodeLoopTemplatesPath = path.join(sourceRoot, 'skills', 'dev-flow-loop', 'assets', 'baseline-templates');
  const forbiddenTemplateDirs = [
    path.join(codexSkillsRoot, 'dev-flow-master', 'templates'),
    path.join(sourceRoot, 'skills', 'dev-flow-master', 'templates'),
  ];

  for (const fileName of loopBaselineTemplateFiles) {
    const codexPath = path.join(sourceLoopTemplatesPath, fileName);
    const openCodePath = path.join(openCodeLoopTemplatesPath, fileName);
    const exists = existsSync(codexPath) && existsSync(openCodePath);
    const same = exists && sha256(readFileSync(codexPath)) === sha256(readFileSync(openCodePath));
    ok = exists && same && ok;
    console.log(`${exists && same ? '✓' : '✗'} loop baseline template: ${fileName}`);
    if (!exists) {
      console.log(`  expected in: ${sourceLoopTemplatesPath}`);
      console.log(`  expected in: ${openCodeLoopTemplatesPath}`);
    } else if (!same) {
      console.log(`  mirror mismatch: ${fileName}`);
    }
  }

  for (const dirPath of forbiddenTemplateDirs) {
    const absent = !existsSync(dirPath);
    ok = absent && ok;
    console.log(`${absent ? '✓' : '✗'} no master templates directory: ${path.relative(packageRoot, dirPath)}`);
  }

  return ok;
}

function checkReleaseMetadata() {
  let ok = true;
  const pluginJsonPath = path.join(packageRoot, '.codex-plugin', 'plugin.json');
  const changelogPath = path.join(packageRoot, 'CHANGELOG.md');
  const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf8'));
  const changelog = readFileSync(changelogPath, 'utf8');

  const versionsMatch = packageJson.version === pluginJson.version;
  ok = versionsMatch && ok;
  console.log(`${versionsMatch ? '✓' : '✗'} release metadata version parity`);
  if (!versionsMatch) {
    console.log(`  package.json: ${packageJson.version}`);
    console.log(`  .codex-plugin/plugin.json: ${pluginJson.version}`);
  }

  const changelogHasVersion = changelog.includes(`## [${packageJson.version}]`);
  ok = changelogHasVersion && ok;
  console.log(`${changelogHasVersion ? '✓' : '✗'} changelog current version section`);

  ok = checkContentSemantics({
    label: 'package release metadata',
    content: JSON.stringify({
      description: packageJson.description,
      keywords: packageJson.keywords,
    }),
    missingLabel: packageJsonPath,
    required: [...releaseMetadataKeywords, ...releaseMetadataDescriptionPhrases],
    forbidden: staleReleaseMetadataPatterns,
  }) && ok;

  ok = checkContentSemantics({
    label: 'plugin release metadata',
    content: JSON.stringify({
      description: pluginJson.description,
      keywords: pluginJson.keywords,
      interface: {
        shortDescription: pluginJson.interface?.shortDescription,
        longDescription: pluginJson.interface?.longDescription,
        defaultPrompt: pluginJson.interface?.defaultPrompt,
      },
    }),
    missingLabel: pluginJsonPath,
    required: [
      ...releaseMetadataKeywords,
      ...releaseMetadataDescriptionPhrases,
      pluginLoopPromptPhrase,
      'Baseline Docs Gate',
      'Execution Envelope Gate',
      'phase DAG',
      'within-baseline auto-continue',
    ],
    forbidden: staleReleaseMetadataPatterns,
  }) && ok;

  return ok;
}

function checkGovernanceSemantics(skillsRoot, labelPrefix) {
  let ok = true;
  for (const check of governanceSemanticChecks) {
    ok = checkFileSemantics({
      label: `${labelPrefix}: ${check.label}`,
      dirPath: path.join(skillsRoot, check.skill),
      required: check.required,
      forbidden: [...staleWorkflowPatterns, ...(check.forbidden ?? [])],
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

    const same = sha256(readFileSync(codexFile)) === sha256(readFileSync(openCodeFile));
    ok = same && ok;
    console.log(`${same ? '✓' : '✗'} core skill mirror: ${relativePath}`);
  }

  return ok;
}

function checkCommandParity() {
  let ok = true;
  for (const fileName of commandFileNames) {
    const codexPath = path.join(codexCommandsSourceRoot, fileName);
    const openCodePath = path.join(sourceRoot, 'command', fileName);
    const claudePath = path.join(claudeCommandsSourceRoot, fileName);
    const pathsExist = [codexPath, openCodePath, claudePath].every((filePath) => existsSync(filePath));
    if (!pathsExist) {
      ok = false;
      console.log(`✗ command parity: ${fileName} (missing command file)`);
      continue;
    }

    const codexContent = readFileSync(codexPath, 'utf8');
    const openCodeContent = readFileSync(openCodePath, 'utf8');
    const claudeContent = readFileSync(claudePath, 'utf8');
    const same = codexContent === openCodeContent && codexContent === claudeContent;
    ok = same && ok;
    console.log(`${same ? '✓' : '✗'} command parity: ${fileName}`);

    const skeleton = fileName === 'dev-flow-loop.md'
      ? loopCommandSkeletonHeadings
      : fileName === 'dev-flow-triage.md'
        ? triageCommandSkeletonHeadings
        : commandSkeletonHeadings;
    const skeletonOk = skeleton.every((heading) => codexContent.includes(heading));
    ok = skeletonOk && ok;
    console.log(`${skeletonOk ? '✓' : '✗'} command skeleton: ${fileName}`);
    if (!skeletonOk) {
      for (const heading of skeleton.filter((item) => !codexContent.includes(item))) {
        console.log(`  missing heading: ${heading}`);
      }
    }
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

  const normalizedContent = content.toLowerCase();
  const missing = required.filter((phrase) => !normalizedContent.includes(String(phrase).toLowerCase()));
  const stale = forbidden.filter(({ pattern }) => normalizedContent.includes(String(pattern).toLowerCase()));

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

Installed slash commands:
  /dev-flow            Governed development workflow
  /dev-flow-cr         Independent post-acceptance CR
  /dev-flow-loop       Loop Engineering control review
  /dev-flow-triage     Read-only candidate inbox
  /dev-flow-scheduler  Approved automation management
`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
