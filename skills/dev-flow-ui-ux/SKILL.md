---
name: dev-flow-ui-ux
description: Use when a development request involves user-facing screens, layout, visual design, interaction behavior, responsive behavior, accessibility, browser rendering, copy density, visual polish, screenshots, or UI verification.
---

# dev-flow-ui-ux

Own the UI/UX route when the main success criterion is what a user sees, understands, or interacts with.

## Boundary

Do not replace `dev-flow-master` for routing, complexity, gates, Git side effects, or final completion. Broken UI behavior routes to debugging first. UI work that adds substantial business behavior should be primary feature work unless visual/interaction quality is the main acceptance criterion.

## Language Policy

All user-facing replies and all generated artifact documents (requirements, design, specs, CLI specs, test plans, delivery reports, and other persisted Markdown files) in dev-flow must be written in Chinese.

## Core Contract

- Ground the target screen, component, state, viewport, workflow, and acceptance signal.
- Tiny copy/style tweaks use the lightweight opsx/OpenSpec artifact route plus visual check.
- Runtime UI risk requires `ui_ux_report` before acceptance.
- Browser/runtime evidence is required when visual correctness is central; if blocked, record why and the residual risk.

## References

- `references/ui-verification.md`: Load before choosing the UI path, implementing UI-specific checks, producing `ui_ux_report`, or coordinating with debugging/planning/acceptance.

## Required Signal

```yaml
ui_ux_report:
  producer: dev-flow-ui-ux
  timestamp: <ISO-8601>
  scope: <what was verified>
  blocked_count: <integer>
  visual_evidence_attached: true | false
  acceptance_threshold_met: true | false
  residual_risks: [list or none]
```

This is the orchestration summary signal. The full persisted report schema is in `references/ui-verification.md`.
