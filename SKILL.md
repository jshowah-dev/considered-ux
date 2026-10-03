---
name: considered-ux
description: Use when building, reworking, reviewing or polishing a user interface (how it looks, moves, responds or is interacted with) in any stack, including web, Tauri, egui and Angular. Also use when asked for a UX pass, to make something feel better or more considered, or when UI output risks feeling generic.
---

# Considered UX

Users should feel the builder thought about them: small details kept consistent across windows, features and apps, plus one hand-carved moment that surprises through feel. The enemy is zombie UI, the most probable answer, which fits any product. Folder: `~/.claude/skills/considered-ux/`.

## 1. Kit and beliefs first
- Find the family: `node ~/.claude/skills/considered-ux/scripts/kit.mjs --family-for <repo-folder-name>`. On `null`, ask the builder which family, or start one from `kits/_template.md` (and `kits/_template.tokens.json` → `kits/<family>.tokens.json`).
- Read the kit: beliefs, rules, dial, tokens mode, products, ledger.
- **Beliefs gate** (Feature and Audit): offer no direction until you know what we believe. If the beliefs are missing or thin, run the belief interview in `kits/_template.md`. Drafts from site copy or a README are fine; the builder confirms before you continue. On the first run for a product, ask for its one-line belief and add it under Products.

## 2. Size the job
| Size | When | Do |
|---|---|---|
| Touch | small edit | Kit rules + floor. No directions, no frames. No kit: floor only, then offer to start one. |
| Feature | new or reworked screen, flow or interaction | The loop below |
| Audit | "improve the UX of X" | Editor pass first (`references/editor-pass.md`), then a ranked list of care gaps, zombie spots and invisible friction, each tied to a rule or belief. Run the loop on each item the builder picks. |

## 3. Feature loop
1. Ground the moment: `references/craft.md`.
2. Directions for the carved moment, as the dial sets. Each passes the check in `references/zombie-tells.md` and names its belief. Stop; the builder picks.
3. Build: rules everywhere, the moment in one place, tokens per `references/stacks.md`. The floor always applies.
4. Frames: `scripts/frames.mjs` for each changed interaction, normal and `--reduced-motion`. Fix what they show before presenting.
5. Editor pass and zombie critic: `references/editor-pass.md`.
6. Log the moment in the ledger. New rules go in only when the builder approves; then run `kit.mjs --check`.

## Dial
| | Carved moments | Directions | Sound |
|---|---|---|---|
| restrained | quiet | 2, neither weird | never |
| moment | one per app; if the ledger has none, ask whether this feature hosts it | 3, one weird | never |
| full | one per feature | 3, one weird | opt-in |

## Floor (every size)
Acknowledge within 100 ms. Animate transform and opacity only. Never block input; keep motion interruptible. Visible focus and AA contrast. Reduced motion keeps the meaning. Use repo or kit tokens; if color or type is missing, offer 2–3 options from ui-ux-pro-max.

## Red flags: stop
- Designing before the beliefs are confirmed.
- Typing a raw duration or easing instead of a token.
- A zombie tell with no stated reason.
- Claiming motion was reviewed without frames (egui records too: `references/stacks.md`).
- A corner toast answering the user's own action.
- Writing the skill's name, the kit or AI into a work repo.
