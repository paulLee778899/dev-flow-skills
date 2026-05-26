---
name: dev-flow-ui-ux
description: Use when a development request involves user-facing screens, layout, visual design, interaction behavior, responsive behavior, accessibility, browser rendering, copy density, visual polish, screenshots, or UI verification.
---

# dev-flow-ui-ux

`dev-flow-ui-ux` owns the UI/UX route for dev-flow. It is selected when the main success criterion is what a user sees, understands, or interacts with.

All user-facing replies in this dev-flow system must be written in Chinese. Command names, file paths, artifact IDs, and literal CLI commands may remain in their original language.

## Boundary

This skill governs UI/UX-specific design and verification. It does not replace `dev-flow-master` for routing, complexity classification, phase gates, Git side effects, or final completion.

If a UI issue is broken behavior, route to `dev-flow-debugging` first. If UI work adds substantial business behavior, keep `ui-ux` as primary only when visual/interaction quality is the main acceptance criterion; otherwise make it a secondary type for `feature`.

Use available frontend, Figma, browser, or DevTools skills when they exist, but do not require them. Absorb their handling patterns here: design-system alignment, design-to-code parity, browser-runtime testing, console/network inspection, responsive checks, accessibility checks, and screenshot evidence.

## Workflow

1. Ground the UI target.
- Identify the screen, component, route, state, viewport, user workflow, and acceptance signal.
- Inspect existing design conventions before proposing a new pattern.

2. Choose the right path.
- Tiny copy/style tweak: lightweight route with visual check.
- Bounded component or page behavior: medium route if tests or browser verification are needed.
- Multi-page flow, accessibility-critical UI, upload/download, complex responsive behavior, or large redesign: heavyweight route.

3. Implement with product context.
- Match the existing design system and local component patterns.
- Prefer clear controls, predictable hierarchy, and domain-appropriate density.
- Keep UI text within containers; avoid overlap, clipping, and layout shift.
- Do not introduce broad palette or layout shifts unrelated to the request.
- For operational apps, dashboards, admin tools, CRM/SaaS, and developer tools, prefer dense, calm, scan-friendly interfaces over marketing-style hero sections or decorative card-heavy layouts.
- Cover expected states: loading, empty, error, disabled, active/selected, validation, permission-denied, and long-content states when applicable.
- For design-to-code tasks, compare implementation against the source design or screenshot and prefer existing tokens/components over raw copied styles.

4. Verify in a real runtime.
- Run the relevant build/test checks.
- Open the target UI when a browser runtime is available.
- Check desktop and narrow/mobile viewports.
- Exercise key interactions, not just initial render.
- Inspect console errors and obvious network failures.
- Capture screenshot or browser evidence when visual correctness is central.
- Check obvious accessibility basics: keyboard reachability for key controls, focus visibility, label/name clarity, contrast problems visible by inspection, and semantic control choice.
- Check text overflow, clipping, unexpected horizontal scroll, z-index overlap, sticky/fixed element collisions, and layout shift after data or viewport changes.

## Required Evidence

Produce a compact `ui_ux_report` before handoff:

```yaml
ui_ux_report:
  target_surface: "route/component/state"
  user_goal: "..."
  implementation_scope: "..."
  verification:
    desktop_viewport: "checked | not_applicable | blocked"
    mobile_or_narrow_viewport: "checked | not_applicable | blocked"
    key_interactions: "checked | not_applicable | blocked"
    console_errors: "none | listed | not_checked"
    text_overflow_or_overlap: "none_found | issue_found | not_checked"
    accessibility_basics: "checked | not_applicable | blocked"
    screenshot_or_visual_evidence: "captured | not_applicable | blocked"
  residual_risks:
    - "..."
```

If browser tooling is unavailable, say so plainly and run the strongest available non-browser checks. Do not claim visual verification without visual evidence.

## Coordination

- Use `dev-flow-debugging` when a UI defect needs root-cause investigation.
- Use `dev-flow-planning` when UI work needs formal docs, task DAGs, or a test matrix.
- Use `dev-flow-acceptance` for final evidence and delivery readiness.
