---
name: dev-flow-intent
description: Use when dev-flow-master needs to classify a development request before routing, including new features, bugs, debugging, UI/UX work, code review, requirement changes, continuation requests, or deciding which dev-flow skill should handle the task.
---

# dev-flow-intent

Intent classifier for `dev-flow-master`. Convert the user request and current persisted context into `intent_decided`.

## Language Policy

All user-facing replies and all generated artifact documents (requirements, design, specs, CLI specs, test plans, delivery reports, and other persisted Markdown files) in dev-flow must be written in Chinese.

## Boundary

Only emit `intent_decided`. Do not implement code, advance gates, write OpenSpec/opsx artifacts, start execution, or declare a stage complete. Master alone emits `routing_decided`.

## Core Contract

Apply after master has loaded the user's request and before complexity classification. If persisted artifacts already exist, classify against those artifacts instead of chat memory alone.

## References

Read `references/classification-reference.md` for classification order, tie-breakers, task types, risk flags, and the exact YAML output contract.

## Required Signal

Emits `intent_decided` signal. Schema defined in `references/classification-reference.md`.
