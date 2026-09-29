# Stacks

## Tokens: write mode
`node ~/.claude/skills/considered-ux/scripts/emit-tokens.mjs --tokens ~/.claude/skills/considered-ux/kits/<family>.tokens.json --target <target> --out <file>`

It refuses to overwrite a file it didn't generate. Commit the emitted file with the feature.

| Stack | Command | File | Use |
|---|---|---|---|
| Vanilla JS, Tauri webview | `--target css` | `public/motion.css`, loaded first | `transition: transform var(--motion-duration-enter) var(--motion-easing-enter)` |
| Next/React + Tailwind v4 | `--target css` and `--target ts` | `src/app/motion.css` imported by `globals.css`; `src/lib/motion.ts` | Classes: `duration-(--motion-duration-hover)`, `ease-(--motion-easing-enter)`. WAAPI: `el.animate(k, { duration: motion.duration.enter, easing: motion.easing.enter })` |
| Angular | `--target scss` | `src/styles/_motion.scss` | `$motion-duration-enter` |
| egui (Rust) | `--target rust` | `src/motion.rs` | `ctx.animate_bool_with_time(id, on, motion::scaled(motion::duration::ENTER).as_secs_f32())` |

## Adopt mode (team codebases)
Don't emit anything. Find the repo's existing motion and timing tokens and map each kit purpose to the closest one. Add missing ones as ordinary edits in the repo's own style. Never overwrite existing values; propose changes in the PR description instead. Nothing you write mentions the kit, this skill or AI.

## Recording (web)
`node ~/.claude/skills/considered-ux/scripts/frames.mjs --url <url> --click <sel> | --hover <sel> | --eval <js> [--probe <sel>] [--duration <ms>] [--frames 6] [--max 2000] [--clip <sel>] [--reduced-motion] [--out <dir>] [--title <text>]`
- Where a selector matches several elements, pick one with `>> nth=0`.
- Use `--duration` when the motion runs in JS (requestAnimationFrame). CSS and WAAPI motion is found on its own, including motion started a frame or two after the input (rAF, `setTimeout`); animations already running before the action are frozen and left out. Motion that waits on the network lands in real time, so record it after it lands.
- The target is scrolled into view first; if something covers it, the capture stops and says what.
- `--clip` is measured once, before the action. Clip a container that holds the whole motion, not the moving element.
- `strip.mjs --dir <dir> --out <png>` rebuilds a strip from any folder of frames.

## egui recording
1. Use tokens through `motion::scaled(motion::duration::…)`.
2. Run a debug build with `MOTION_TIME_SCALE=10` and trigger the interaction.
3. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File <skill>/scripts/frames-native.ps1 -Title "<window title>" -Out <dir>` (50 frames, 100 ms apart = 5 s ≈ 0.5 s real time).
4. `node <skill>/scripts/strip.mjs --dir <dir> --out <dir>/strip.png`.
Release builds ignore `MOTION_TIME_SCALE`.
- Each capture adds about 35 ms, so frames land about 135 ms apart; read timing from frame counts, not the nominal interval.
- 50 frames make an unreadably wide strip. Copy the frames that span the transition into their own folder and strip those.
- If `cargo build` fails with `link: extra operand`, Git Bash's GNU `link` is shadowing MSVC's. Build from a VS Build Tools environment (`vcvars64.bat`, then `cargo build`).
