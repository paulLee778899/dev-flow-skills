# TK8620 固件证据报告（Firmware Evidence Report）

## Table of Contents

- [0. dev-flow 阶段授权检查](#0-dev-flow-阶段授权检查)
- [1. 构建结果](#1-构建结果)
- [2. 产物身份](#2-产物身份)
- [2a. Artifact Trust(Flash Gate / 固件硬证据)](#2a-artifact-trustflash-gate--固件硬证据)
- [2b. 目标架构验证(强制;无论是否烧录都必须填)](#2b-目标架构验证强制无论是否烧录都必须填)
- [3. 体积证据](#3-体积证据)
- [3b. Firmware Reviewer(进入验收前必须通过)](#3b-firmware-reviewer进入验收前必须通过)
- [3c. Automated Test Flow Result](#3c-automated-test-flow-result)
- [4. 链接 / map 状态](#4-链接--map-状态)
- [5. 烧录 / 串口证据(若已执行)](#5-烧录--串口证据若已执行)
- [6. 与约束对照](#6-与约束对照)

> dev-flow/loop 阶段固件证据。每条证据必须有路径、命令、哈希或原始输出；无法获得的标 `unknown`。正文用中文,字段名/路径/命令/哈希保持 English/ASCII。
> 关键 gating/release 字段为 `unknown` 时，对应 `status` 必须为 `fail|blocked`；不能用 `unknown`、空值或人工说明通过目标构建、架构、artifact trust、size evidence、Flash Gate、硬件 smoke 或 release readiness。

## 0. dev-flow 阶段授权检查
```yaml
phase_authorization_check:
  observed_at:
  dev_flow_state_path:
  loop_phase_artifact_index:
  openspec_change_path:
  executable_test_matrix_path:
  phase_id:
  project_id:
  requested_domain_checks: []
  allowed_side_effects: []
  tk8620_domain_handoff_path:
  prerequisites_status: pass|fail|accepted-deferred
  checked_by:
  status: pass|fail
```

> `status: pass` 要求当前 dev-flow/loop 阶段显式需要这些 TK8620 固件检查,并授权对应 side effect。未授权构建只能作为 `non-gating diagnostic`，不能满足验收、phase_eval、硬件验证或发布准备。

## 1. 构建结果
> 本节只是构建记录区；固件证据是否通过必须由 2a `artifact_trust`、2b `target_arch_check` 和 3 `size_evidence` 判定。
- 目标 source dir:source_projects/rewrite_<project-id>/
- 构建命令:`python3 build.py build -j N`(或经 workflow.py `--source-dir`)
- compiler / toolchain 路径:
- toolchain_is_cross:true|false
- 构建 cwd / start / end / 结果(pass|fail):
- 构建日志路径:

## 2. 产物身份
| 产物 | 路径 | SHA-256 | 来源 |
|---|---|---|---|

## 2a. Artifact Trust(Flash Gate / 固件硬证据)
```yaml
artifact_trust:
  project_id:
  project_root: <resolved_project_root>
  build_purpose: rewrite-target
  source_directory:
  resolved_source_directory:
  build_command:
  build_cwd:
  build_log:
  build_log_sha256:
  build_started_at:
  build_finished_at:
  build_result: pass|fail
  application_artifact:
  application_mtime:
  application_sha256:
  bootloader_artifact:
  bootloader_sha256:
  map_file:
  map_sha256:
  linker_script:
  linker_script_sha256:
  link_status: pass|fail
  bootloader_pairing_rule:
  bootloader_recovery_assumption:
  board_assumptions: []
  wiring_assumptions: []
  boot_mode_assumptions: []
  artifact_source: current-active-target-build
  source_is_canonical_target: true
  baseline_or_reference_artifact: false
  target_arch: riscv
  readelf_machine:
  file_type:
  objdump_arch:
  compiler_path:
  compiler_version:
  compile_commands: []
  link_command:
  objcopy_command:
  objcopy_input_sha256:
  objcopy_output_sha256:
  load_addr_in_flash: true
  toolchain_is_cross: true
  size_source: target-map|riscv-size
  elf_artifact:
  elf_sha256:
  image_artifacts:
    - path:
      sha256:
      format: hex|bin|merged-image|other
  raw_evidence:
    readelf_tool:
    readelf_h_output: |
    file_output: |
    readelf_l_output: |
    objdump_f_output: |
    size_output: |
  status: pass|fail
  artifact_trust_hash:
```
> `artifact_trust_hash` 由本块(排除自身字段)的 compact sorted JSON 算出。Flash Gate JSON 必须把本块复制到 `typed_evidence.flash.artifact_trust`,并记录同一个 `artifact_trust_hash`。`status` 只有在当前构建、RISC-V、非 host、mtime 晚于 build_started_at、SHA 绑定到 build log 时才可为 `pass`。

## 2b. 目标架构验证(强制;无论是否烧录都必须填)
> 把真实命令输出**原样粘贴**进来,不能只填结论。machine 不是 RISC-V、或 file 显示 Mach-O/host 可执行 = `build_result` 无效,不能满足固件证据。
```yaml
target_arch_check:
  artifact:
  readelf_h_command:
  readelf_h_output: |       # 粘贴 `readelf -h <elf>` 原始输出
  file_command:
  file_output: |            # 粘贴 `file <elf>` 原始输出,不得为 Mach-O / x86-64 / arm64 host 可执行
  readelf_l_command:
  readelf_l_output: |       # 粘贴 `readelf -l <elf>` 原始输出,用于 LOAD 地址检查
  linker_script:
  flash_region:
    origin:
    length:
  readelf_machine:
  file_type:
  objdump_arch:
  target_arch: riscv|non-riscv
  toolchain_is_cross: true|false
  compiler_path:
  size_source: target-map|riscv-size|unknown
  load_addr_in_flash: true|false
  status: pass|fail
  failure_reason:
```

## 3. 体积证据
```yaml
size_evidence:
  artifact:
  map_file:
  toolchain:
  size_source: target-map|riscv-size   # 必须来自目标 .map / riscv*-size;host 二进制体积或占位 map 一律判 unknown 并 fail
  host_or_placeholder_rejected: true|false
  ram_model_rejected: true|false       # RAM model、模拟器、估算表或人工容量模型不能作为 release/gating size evidence
  raw_size_output: |                   # 粘贴 riscv*-size 输出,字段应含 text/data/bss/dec/hex/filename
  baseline_size:
    text:
    data:
    bss:
    dec:
    hex:
    filename:
  rewrite_size:
    text:
    data:
    bss:
    dec:
    hex:
    filename:
  baseline_dec:
  rewrite_dec:
  reduction_percent:
  size_acceptance:
    rule_source: dev-flow requirement or tk8620_domain_handoff.resource_rules
    rule_text:
    size_acceptance_rule:
    metric: dec|text|data|bss|flash-region|ram-region|custom
    baseline_value:
    rewrite_value:
    target_value:
    measured_value:
    comparison: <=|>=|==              # release evidence only accepts mechanically checkable final rules
    computed_result:
    status: pass|fail
  code_size_status: pass|fail          # 必须由 size_acceptance.status 与资源 region 校验共同决定,不是固定百分比
  size_evidence_hash:
  baseline_artifact:
  baseline_size_source: target-map|riscv-size|unknown
  formula: "(baseline - rewrite) / baseline * 100"
  map_fingerprint:
    memory_configuration_excerpt: |
    section_excerpt: |
    linker_flash_region:
    linker_ram_region:
    map_mtime:
    map_sha256:
  regions:
    - name:
      used_bytes:
      limit_bytes:
      free_bytes:
      overflow_bytes:
      delta_vs_baseline:
      reduction_percent:
  status: pass|fail
  notes:
```
> `size_evidence_hash` 由本块(排除自身字段)的 compact sorted JSON 算出。Release Gate 必须用这个 hash 绑定当前体积证据。
> `rewrite_size` / `rewrite_dec` / selected metric 必须从上方 `raw_size_output` 或目标 linker map 机械解析得到;人工填数、host/placeholder 来源、RAM model、模拟器估算或人工容量模型一律 fail。`baseline_size` / `baseline_dec` / baseline delta 是分析字段,发布证据不依赖它们;若记录,也必须来自独立机械 size/map 证据,不能人工填数。`size_acceptance` 的 rule 来自 active dev-flow requirement 或 `tk8620_domain_handoff.resource_rules`;本模板不定义固定百分比。发布证据必须有具体 size rule,且只接受能由 target raw size 独立计算的 `<=` / `>=` / `==`;`baseline_source: not-applicable`、`comparison: reduction_percent>=` 或 `custom` 只能用于非最终说明/deferral,不能让 `size_acceptance.status` 成为 `pass`。


## 3b. Firmware Reviewer(进入验收前必须通过)

本节是进入 dev-flow acceptance 或 loop `phase_eval` 前的独立固件证据审查门槛。主 agent 不能用自审代替 reviewer。

```yaml
firmware_reviewer:
  reviewer_id:
  provenance: subagent|human
  report_path:
  review_input_hash:
  review_output_hash:
  status: approved|changes-required|blocked
  must_check:
    - artifact_trust
    - target_arch_check
    - size_evidence
    - map_fingerprint
    - hardware_evidence_when_present
  unresolved_required_findings: []
  re_review_evidence:
    observed_at:
    status: not-needed|approved|required
```
> `status: approved` 且 `unresolved_required_findings: []` 才能进入 dev-flow acceptance 或 loop phase_eval。`report_path` 必须在 active phase evidence 目录下,`review_output_hash` 必须匹配文件 bytes,并进入 Flash/Release Gate 的 `artifact_hashes`。缺 reviewer 工具时标 blocked,不能用自审替代。

## 3c. Automated Test Flow Result
```yaml
automated_test_flow_result:
  mode: unattended_dev_test_loop
  status: pass|fail|blocked
  requested_checks: []
  completed_checks: []
  failed_checks: []
  blocked_checks: []
  build_log:
  target_arch_log:
  flash_gate_json:
  burn_log:
  serial_log:
  smoke_result:
  provider_result:
  stop_reason:
```
> 本节汇总 `references/automated-test-flow.md` 的执行结果。`status: pass` 要求 requested checks 全部完成并有证据路径；缺端口、缺 wrapper、Flash Gate stale/mismatch、缺 reviewer 为 `blocked`；编译、架构、size、烧录、串口、smoke 失败为 `fail`。

## 4. 链接 / map 状态
- 链接状态(pass|fail|unknown)、map 文件路径、是否有 region 溢出或越界段。
- 禁止 placeholder map / host map;若 map 不是目标 linker 产物,`target_arch_check.status` 和 `size_evidence.status` 均为 `fail`。

## 5. 烧录 / 串口证据(若已执行)
- Flash Gate 状态、烧录命令、串口日志路径;未执行写「N/A — 本阶段未烧录」。

## 6. 与约束对照
| 约束(CON-NNN) | 目标 | 实测 | 达标? |
|---|---|---|---|
