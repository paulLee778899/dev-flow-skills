# UI Verification Reference

## Workflow

1. Ground the UI target.
- Identify the screen, component, route, state, viewport, user workflow, and acceptance signal.
- Inspect existing design conventions before proposing a new pattern.

2. Choose the right path.
- Tiny copy/style tweak: lightweight opsx/OpenSpec artifact route with visual check.
- Bounded component or page behavior: medium route if tests or browser verification are needed.
- Multi-page flow, accessibility-critical UI, upload/download, complex responsive behavior, or large redesign: heavyweight route.

3. Implement with product context.
- Match the existing design system and local component patterns.
- Prefer clear controls, predictable hierarchy, and domain-appropriate density.
- Keep UI text within containers; avoid overlap, clipping, and layout shift.
- Do not introduce broad palette or layout shifts unrelated to the request.
- For operational apps, dashboards, admin tools, CRM/SaaS, and developer tools, prefer dense, calm, scan-friendly interfaces over marketing-style hero sections or decorative card-heavy layouts.
- Cover expected states: check loading state when the component fetches async data; check empty state when no records exist; check error state when a network or API request can fail; check disabled state when permissions may deny access; check active/selected, validation, permission-denied, and long-content states when those conditions apply.
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

Produce and persist a compact `ui_ux_report` before handoff when UI/UX is primary, when UI runtime risk applies, or when acceptance requires visual/runtime evidence:

> **Note:** The schema below is the full persisted report artifact. The SKILL.md `## Required Signal` section contains a summary signal emitted inline for orchestration. Both artifacts are produced at the end of UI verification; they are not the same object.

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
  deferred_items:  # optional; required when any verification item is blocked and accepted
    - field: <which verification item was blocked>
      deferral_reason: <why it is accepted as deferred>
      approved_by: <user | tech_lead>
```

## Acceptance Threshold

The `ui_ux_report` is considered sufficient for acceptance when: (1) `blocked` count = 0, OR (2) all `blocked` items are marked with an approved deferral reason recorded in `deferred_items`. A report with any `blocked` item lacking a deferral reason must be returned for re-verification before acceptance_ready can be emitted.

## Screenshot Evidence Rule

Screenshot or equivalent visual evidence is required whenever `screenshot_or_visual_evidence` is listed as `checked`. Stating `checked` without attached evidence is a protocol violation.

For lightweight UI work, `ui_ux_report` and screenshots are supplemental evidence inside the opsx/OpenSpec artifact workflow. They do not replace `lightweight_artifact_ready`, `opsx_apply_complete`, or `opsx_verify_complete`.

If browser tooling is unavailable, say so plainly and run the strongest available non-browser checks. Do not claim visual verification without visual evidence.

## Coordination

- Use `dev-flow-debugging` when a UI defect needs root-cause investigation.
- Use `dev-flow-planning` when UI work needs formal docs, task DAGs, or a test matrix.
- Use `dev-flow-acceptance` for final evidence and delivery readiness.
