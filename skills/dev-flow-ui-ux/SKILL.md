---
name: dev-flow-ui-ux
description: Use when a development request involves user-facing screens, layout, visual design, interaction behavior, responsive behavior, accessibility, browser rendering, copy density, visual polish, screenshots, or UI verification.
---

# dev-flow-ui-ux

Own the UI/UX route when the main success criterion is what a user sees, understands, or interacts with. All user-facing replies in dev-flow are Chinese.

## Boundary

Do not replace `dev-flow-master` for routing, complexity, gates, Git side effects, or final completion. Broken UI behavior routes to debugging first. UI work that adds substantial business behavior should be primary feature work unless visual/interaction quality is the main acceptance criterion.

## Core Contract

- Ground the target screen, component, state, viewport, workflow, and acceptance signal.
- Tiny copy/style tweaks use the lightweight opsx/OpenSpec artifact route plus visual check.
- Runtime UI risk requires `ui_ux_report` before acceptance.
- Browser/runtime evidence is required when visual correctness is central; if blocked, record why and the residual risk.

Read `references/ui-verification.md` before choosing UI path, implementing UI-specific checks, producing `ui_ux_report`, or coordinating with debugging/planning/acceptance.
