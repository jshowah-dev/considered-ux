# Stacks

## Tokens: write mode
`node ~/.claude/skills/considered-ux/scripts/emit-tokens.mjs --tokens ~/.claude/skills/considered-ux/kits/<family>.tokens.json --target <target> --out <file>`

It refuses to overwrite a file it didn't generate. Commit the emitted file with the feature.

| Stack | Command | File | Use |
|---|---|---|---|
| Vanilla JS, Tauri webview | `--target css` | `public/motion.css`, loaded first | `transition: transform var(--motion-duration-enter) var(--motion-easing-enter)` |
| Next/React + Tailwind v4 | `--target css` and `--target ts` | `src/app/motion.css` imported by `globals.css`; `src/lib/motion.ts` | Classes: `duration-(--motion-duration-hover)`, `ease-(--motion-easing-enter)`. WAAPI: `el.animate(k, { duration: motion.duration.enter, easing: motion.easing.enter })` |
| Angular | `--target scss` | `src/styles/_motion.scss` | `$motion-duration-enter` |
| egui (Rust) | `--target rust` | `src/motion.rs` | `ctx.animate_bool_with_time(id, on, motion::duration::ENTER.as_secs_f32())` |

## Adopt mode (team codebases)
Don't emit anything. Find the repo's existing motion and timing tokens and map each kit purpose to the closest one. Add missing ones as ordinary edits in the repo's own style. Never overwrite existing values; propose changes in the PR description instead. Nothing you write mentions the kit, this skill or AI.

## Recording (web)
`node ~/.claude/skills/considered-ux/scripts/frames.mjs --url <url> --click <sel> | --hover <sel> | --eval <js> [--probe <sel>] [--duration <ms>] [--frames 6] [--max 2000] [--clip <sel>] [--reduced-motion] [--out <dir>] [--title <text>]`
- Where a selector matches several elements, pick one with `>> nth=0`.
- Use `--duration` when the motion runs in JS (requestAnimationFrame). CSS and WAAPI motion is found on its own.
- `strip.mjs --dir <dir> --out <png>` rebuilds a strip from any folder of frames.

## egui recording
Not yet proven; Task 9 of the implementation plan decides. Until then, egui runs report measurements (tokens used, nothing blocks input), hand motion review to the builder, and say so.
