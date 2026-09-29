# considered-ux

A Claude Code skill for UI work that makes users feel the builder thought about them.

AI-built interfaces drift toward zombie UI: the most probable answer, which fits any product. This skill pushes the other way:

1. **Beliefs first.** No design direction until you know what you believe about the people using the product.
2. **Kit rules everywhere.** Small details kept consistent across windows, features and apps, each rule tied to a belief.
3. **One carved moment.** Each feature gets one hand-carved interaction that surprises through feel, checked frame by frame.

## Install

```bash
git clone https://github.com/jshowah-dev/considered-ux ~/.claude/skills/considered-ux
cd ~/.claude/skills/considered-ux
npm install
npx playwright install chromium
```

Claude Code picks the skill up automatically for UI work, or on request ("give this a UX pass").

## Make your own kit

`kits/jeff.md` is a worked example. For your own product family, copy `kits/_template.md` to `kits/<family>.md`; the skill runs the belief interview with you the first time. Then check it:

```bash
node scripts/kit.mjs --check kits/<family>.md
```

Kits matching `kits/work*` are gitignored, so an employer's kit never enters your history.

## What's inside

| Path | Purpose |
|---|---|
| `SKILL.md` | The skill: kit and beliefs gate, job sizing, feature loop, dial, floor, red flags |
| `references/` | Craft notes, editor pass, zombie tells, per-stack token guidance (web, Tauri, egui, Angular) |
| `scripts/kit.mjs` | Parse and check kits; map a repo to its family |
| `scripts/emit-tokens.mjs` | Emit motion tokens from a kit for CSS or Rust |
| `scripts/frames.mjs` | Capture frame strips of an interaction, normal and reduced motion |
| `tests/` | Unit tests, scenario runs (baseline vs. with the skill) and results |

The floor falls back to the [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill for palette and font options when a project has none; it's optional.

## Test

```bash
npm test
```

## License

MIT
