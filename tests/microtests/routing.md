# Routing: before and after demoting ui-ux-pro-max, 2026-09-28

Single-shot general-purpose subagents, default model. Rollback text for the old description is in plan Task 7; a byte copy of the old `SKILL.md` was also kept in the build session's scratchpad.

## Prompt
> Without doing any of these tasks, say which one skill from your available skills you'd invoke first for each request, or "none". Answer as three lines: "a: <skill>", "b: <skill>", "c: <skill>". (a) Suggest a color palette and font pairing for a bakery landing page. (b) Make the save button on this form feel better when it's clicked. (c) Add a settings dialog to the desktop planner.

## Before (old description, considered-ux already discoverable)
| Run | a | b | c |
|---|---|---|---|
| 1 | ui-ux-pro-max | considered-ux | considered-ux |
| 2 | ui-ux-pro-max | considered-ux | considered-ux |
| 3 | ui-ux-pro-max | considered-ux | considered-ux |
| 4 | ui-ux-pro-max | considered-ux | considered-ux |
| 5 | ui-ux-pro-max | considered-ux | considered-ux |

The target routing already held before the edit: considered-ux's description wins (b) and (c) even against the old "Use to plan, build, review, fix, or polish UI" line. So the after-runs alone can't show whether the edit was read.

## Edit
Old: `description: "UI/UX design intelligence for web and mobile — styles, color palettes, font pairings, product-type patterns, and UX guidelines across common frontend stacks. Use to plan, build, review, fix, or polish UI: layout, visual hierarchy, color, typography, spacing, accessibility, animation, and component patterns (buttons, forms, modals, nav, tables, dashboards)."`

New: `description: "Use when choosing a color palette, font pairing or visual style from a catalog: a project has no palette or type yet, or considered-ux needs 2–3 visual options to offer. Not for general UI, UX, motion or interaction work; considered-ux covers that."`

## Was the edit picked up mid-session?
Yes. A fresh subagent asked to quote ui-ux-pro-max's description word for word returned the new text exactly, from its skill listing, without tools.

## After (new description)
| Run | a | b | c |
|---|---|---|---|
| 1 | not run: the dispatch was denied by the auto-mode permission classifier ("Self-Modification"); not retried | | |
| 2 | ui-ux-pro-max | considered-ux | considered-ux |
| 3 | ui-ux-pro-max | considered-ux | considered-ux |
| 4 | ui-ux-pro-max | considered-ux | considered-ux |
| 5 | ui-ux-pro-max | considered-ux | considered-ux |

**Result: PASS.** (a) is ui-ux-pro-max and (b) and (c) are considered-ux in 4 of 4 completed runs, which meets the "at least 4 of 5" bar even if the fifth had failed.
