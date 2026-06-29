# Intake And Handoff

## Table of Contents

- [Required Confirmations](#required-confirmations)
- [Hard Metric Rules](#hard-metric-rules)
- [Intake Brief](#intake-brief)
- [Automation Envelope](#automation-envelope)
- [Handoff Block](#handoff-block)
- [Dev-Flow Phase Test Rule](#dev-flow-phase-test-rule)
- [Migration Rule](#migration-rule)

Use this reference before requirement capture, front-loaded automation envelope confirmation, intake brief writing, flow selection, or dev-flow handoff.

## Required Confirmations

Capture each must-have item into an automation envelope before the loop starts. Ask concise follow-up questions only for fields that are required for automation and cannot be inferred from the current request, repository, or existing evidence. This is the only normal interactive stop before the automated development loop.

Release-gate eligible resource rules, target-build evidence, target-architecture evidence, artifact trust, Flash Gate, burn/serial evidence, and hardware smoke cannot pass through `unknown` or `accepted_unknowns`. If any of these are unknown, the handoff may continue only as `partial` with explicit risk; release or gating hardware evidence must remain `fail|blocked` until the missing value is confirmed.

| Category | Required confirmation |
|---|---|
| Objective | rewrite, trim, port, bug fix, build validation, hardware validation, or release |
| Project identity | project id, target application, target chip, target board, delivery target |
| Source baseline | baseline source project, minimal/reference project, bootloader involvement |
| Target source | intended `source_projects/rewrite_<project-id>/` or existing target directory |
| Must keep | PHY/BBU behavior, AT commands, OTA, production test, parameter storage, events, public APIs |
| Must remove | relay, ACK/retry, transparent UART, address filtering, encryption, debug features, or other exclusions |
| Resource targets | flash/code, RAM/data/bss, stack, heap, linker region, size formula, baseline source |
| Interface policy | public C API, AT command compatibility, error model, callback/event model, parameter compatibility |
| Hardware rules | real RISC-V target firmware, no host substitute, max packet/buffer constraints, bootloader decision |
| Evidence required | static checks, target build, target architecture gate, map/size, artifact trust, flash, serial, smoke, release |

## Hard Metric Rules

- Prefer machine-checkable rules: `rewrite_dec <= 95560`, `flash-region used <= 128 KiB`, `data+bss <= <bytes>`.
- Percentage reduction targets may be analysis goals, but release gates need a final mechanically checkable rule.
- Every final resource rule must name metric, comparison, target value, source of measurement, and whether it is release-gate eligible.
- Treat conflicting metrics as blockers before handoff.
- Do not let the agent choose resource targets alone. If a target is inferred from existing artifacts, label it `proposed`. It becomes release-gate eligible only when the front-loaded envelope or intake confirmation accepts it.

## Intake Brief

Write the intake brief only after the current turn authorizes persisting adapter output. The brief is input to `dev-flow-loop`, not final requirements authority.

Preferred path:

```text
Docs/<topic>/firmware/firmware-intake-brief.yaml
```

Schema:

```yaml
firmware_intake_brief:
  producer: tk8620-firmware-adapter
  project_id:
  objective:
  project_kind: tk8620-firmware
  chip: TK8620
  target_board:
  delivery_target:
  source_roots:
    baseline:
    minimal_reference:
    bootloader_baseline:
    target:
  must_keep:
    - id:
      description:
      evidence_or_source:
  must_remove:
    - id:
      description:
      rationale:
  public_interfaces:
    c_api_policy:
    at_command_policy:
    event_callback_policy:
    parameter_compatibility_policy:
  hard_constraints:
    - real_riscv_target_firmware_required
    - host_build_or_ram_model_cannot_satisfy_firmware_evidence
    - baseline_and_reference_sources_are_read_only
  resource_rules:
    - rule_id:
      metric:
      comparison:
      target_value:
      baseline_source:
      release_gate_eligible: true
  hardware_evidence_required:
    target_build: true
    target_architecture_gate: true
    map_size_evidence: true
    artifact_trust: true
    flash_gate: true|false|not-in-phase
    burn: true|false|not-in-phase
    serial_capture: true|false|not-in-phase
    hardware_smoke: true|false|not-in-phase
    structured_hardware_wrapper_required: true
    non_gating_diagnostic_allowed: true|false
  open_questions: []
  accepted_unknowns: []
  user_confirmation:
    status: draft|confirmed
    confirmed_by:
    confirmed_at:
    confirmation_source:
```

The intake brief is not enough to satisfy dev-flow acceptance. It only defines the firmware-specific evidence contract that later phases must test through `tk8620-firmware-workflow`.

## Automation Envelope

Use one front-loaded automation envelope for the development test loop. Once this envelope is confirmed, the agent must not stop before every compile, burn, serial capture, or smoke test. It should execute the authorized phase tests automatically and stop only when a stop condition or blocked prerequisite is hit.

```yaml
tk8620_automation_envelope:
  mode: unattended_dev_test_loop
  default_route: dev-flow-loop
  route_without_prompt: true
  allowed_side_effects:
    - build
    - artifact-write
    - flash
    - serial
    - hardware-smoke
  target_source_directory:
  evidence_output_root:
  target_port:
  control_port:
  board_assumptions:
    board_revision:
    voltage:
    wiring:
    boot_mode:
  flash_policy:
    allow_application_flash: true|false
    allow_bootloader_flash: true|false
    require_fresh_artifact_trust: true
    structured_wrapper_required: true
  serial_policy:
    baud_rate:
    capture_duration_seconds:
    expected_boot_patterns: []
    expected_command_responses: []
  smoke_policy:
    commands: []
    pass_patterns: []
    fail_patterns: []
    max_retries:
  stop_conditions:
    - build_failed
    - target_architecture_failed
    - artifact_trust_failed
    - size_rule_failed
    - flash_failed
    - serial_port_missing
    - smoke_failed
    - evidence_schema_failed
```

If `allowed_side_effects` includes `flash`, `serial`, or `hardware-smoke`, the envelope must include ports, board assumptions, serial policy, and stop conditions before execution begins. Missing values make the loop `blocked`; do not ask in the middle of a burn/test phase unless the envelope permits human escalation.

The adapter should not ask the user whether to use `dev-flow-loop` after feasibility when all are true:

- `tk8620_automation_envelope.default_route: dev-flow-loop`
- `route_without_prompt: true`
- feasibility is `pass` or user-accepted `partial`
- the requested side effects stay inside `allowed_side_effects`

In that case, state the route and continue into `dev-flow-loop`. Use `dev-flow-master` only for the narrow single-phase case defined in `SKILL.md`.

## Handoff Block

Include this compact block when handing to `dev-flow-loop` or `dev-flow-master`:

```yaml
tk8620_domain_handoff:
  producer: tk8620-firmware-adapter
  project_id:
  project_kind: tk8620-firmware
  intake_brief:
  kb_feasibility_status: pass|partial
  kb_feasibility_evidence:
  canonical_source_roots:
    baseline:
    minimal_reference:
    bootloader_baseline:
    target:
  hard_constraints:
    - real_riscv_target_firmware_required
    - host_build_or_ram_model_cannot_satisfy_firmware_evidence
    - baseline_and_reference_sources_are_read_only
  resource_rules:
    - rule_id:
      metric:
      comparison:
      target_value:
      evidence_source:
      release_gate_eligible: true
  domain_test_provider:
    skill: tk8620-firmware-workflow
    required_for:
      - target_build
      - target_architecture_gate
      - map_size_evidence
      - artifact_trust
      - flash_gate
      - burn
      - serial_capture
      - hardware_smoke
      - release_firmware_evidence
    host_tests_are: supporting_only
    executable_test_matrix_rule: every phase that claims target firmware evidence must include this provider and list the requested TK8620 checks
  automation_envelope:
  recommended_flow: dev-flow-loop
```

## Dev-Flow Phase Test Rule

When the selected generic flow creates a phase test matrix, insert the TK8620 domain provider as a required test provider whenever the phase touches firmware source, build settings, linker/map/resource constraints, burn/flash behavior, serial-visible behavior, bootloader pairing, or release readiness.

Use this compact matrix row shape:

```yaml
domain_test_matrix:
  provider: tk8620-firmware-workflow
  phase_id:
  requested_checks:
    - target_build
    - target_architecture_gate
    - map_size_evidence
    - artifact_trust
  optional_hardware_checks:
    - flash_gate
    - burn
    - serial_capture
    - hardware_smoke
  allowed_side_effects:
    - build
    - artifact-write
  evidence_output:
  pass_requires:
    - firmware evidence report follows tk8620-firmware-workflow/references/build-size-report.md
    - host tests are supporting only
```

Add `flash`, `serial`, or `hardware-smoke` to `allowed_side_effects` only when the active phase and automation envelope allow those hardware actions. Build-only phases must not imply flashing approval.

For an unattended loop, the approved automation envelope is that approval. Do not ask again before each compile, flash, serial capture, or smoke test when the exact action is inside the envelope and the pre-run checks still match.

## Migration Rule

Old `rewrite_artifacts/<project-id>/` files and old `tk8620-rewrite-*` flows are historical evidence. Do not create new project-specific master, route, gate, or stage skills for TK8620. If the user asks to migrate an old run, map its evidence into the intake brief and then start the generic dev-flow path.
