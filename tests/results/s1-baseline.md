# S1 baseline (no considered-ux), 2026-09-28

Run folder: `C:\Users\JeffLocal\cx-runs\s1-baseline\daily-planner` (port 4801). Fresh general-purpose subagent, default model; 246 tool calls, about 35 minutes.

## Reply (verbatim)
DONE. Ticking a checklist item now animates, keeps keyboard focus, and updates the rail strip live. Changes are uncommitted. The running 4801 instance serves the new build (stamp b32) after a page reload. No server restart is needed because only static files changed.

QUESTIONS I'D HAVE ASKED (I would wait; I proceeded with my recommendation)
1. How far should "feels good" go? Options: (a) polish the tick and make the rail react live; (b) also sink or hide completed items after a beat; (c) also celebration effects. I picked (a). Option (b) reorders or hides lines in the vault file, which fights the index-based model and carry-forward (ticked items stay put as the record). Option (c) is noise in an all-day tool.
2. Should a ticked line get a completion stamp (Tasks-style done date)? It changes file bytes and what search and carry-forward see. I picked no.
3. Is it OK for ticked text to be struck through as well as dimmed? Today it is dim only. I picked yes, because done should not rest on colour alone and it makes the animation land. It is one CSS line to revert (`text-decoration` on `.item.checkbox .text`).
4. What motion budget? I picked subtle: everything is under about 550 ms and is off under prefers-reduced-motion.

WHAT WAS WRONG (reproduced on the untouched baseline before editing)
- The tick called `rerender()`, which rebuilds the whole day. The clicked row node was destroyed, 0 animations ran, and focus dropped to BODY, so Space could not tick a second item. The button had no role or aria state.
- The rail strip froze while expanded, because SSE is ignored and polling is cleared then. After a tick the strip still read "7 open, 13%" 1.85 s later, after the save had landed, while disk said 6. So the ring and count, the natural payoff, only moved after collapse.

WHAT CHANGED (all under C:\Users\JeffLocal\cx-runs\s1-baseline\daily-planner\)
- public\editor.js:
  - New `checkButtonHtml` (inline-SVG tick, role=checkbox, aria-checked, aria-labelledby) and `setRowChecked`.
  - The click handler patches the row in place instead of calling `rerender()`. It uses `closest('.check')`, because the tick SVG now sits inside the button.
  - New optional `onToggle` hook.
  - The label id is run through `escapeAttr`.
- public\app.js:
  - `render()` uses `checkButtonHtml` and gives each `.text` an id.
  - New `syncRail()` pushes today's counts from the in-memory doc to the strip after every tick and at the end of `render()`, which covers undo/redo, Reload, day loads and structural edits. It does nothing outside rail mode, while collapsed, or when another day is shown.
- public\rail.js:
  - New `syncFromDoc()` uses the same `summarizeDay` the server runs.
  - A one-shot halo on a section ring when the last open item is ticked. It never fires on a tile's first render.
- public\styles.css:
  - Tick motion is CSS transitions declared on the state being entered, not keyframes. It plays only when a live row flips, never on `render()` rebuilds or on the rail re-showing `#day`.
  - Ticking plays: press-in dip, spring fill (about 18% overshoot), tick drawn in, ripple, text dimming and strikethrough fading in. Unticking retracts quickly with no ripple. A hover ghost dot hints at the fill.
  - All check-off transitions sit inside `prefers-reduced-motion: no-preference`. The rail halo is added to the existing reduce block.
- public\index.html: build stamp b31 to b32.
- test\checkoff.test.js (new, 7 tests): tick moves open/done counts by one and round-trips bytes; clearing the last item leaves total unchanged; a bullet is a no-op; markup, aria and escaping; in-place row patch.

HOW I CHECKED
- Tests: with a long-form TEMP, 296/296 pass (baseline 289 plus 7 new).
  - With this shell's default 8.3 TEMP, 274 pass and 3 fail. Those are the same three files that fail before any edit: events-endpoint, search-endpoint and server (libuv fs-event assertion). This is unrelated to the change.
- Browser, against a scratch vault copy on separate ports (the live vault and seed note were never touched; scratch servers stopped):
  - Real mouse click: the row node is kept, focus stays on the button, aria-checked flips, and the disk line updates after the autosave. Six transitions run on tick, and none on load.
  - No animation replays on a full re-render (Enter) or on a rail collapse/expand.
  - Tab then Space toggles and keeps focus. Double-click nets to unchanged, and model, DOM and disk agree.
  - Ctrl+Z / Ctrl+Y work.
  - I verified the timing by seeking the transition timeline and inspecting static frames at 4x, including the settled states, where the open ring shows no stray dot at rest.
  - Rail:
    - At click time the strip moved (7 to 6 open, ring 13% to 25%, count bump) with 0 PUTs issued yet.
    - Ticking the last Validation item gave 0 open, ring 100% and the halo.
    - Undo restored the counts and the urgent flag.
    - Ticking on another day left the strip unchanged.
    - After Esc the strip matched /api/summary.
  - No console errors.
- Not verified:
  - The real Tauri window.
  - A physically held mouse press. I simulated `:active` with an inline transform, so the press-in dip is confirmed only as CSS.
  - 60 fps playback: the embedded browser produced no frames on its own.
  - Reduced motion was checked via CSSOM, not the OS setting.

KNOWN LIMITS
- Ctrl+Z after a tick rebuilds the DOM, so the undone box snaps rather than animates.
- Live sync covers ticks, undo/redo, loads and structural edits. Typed-text count changes still catch up on collapse, as before.

PRE-EXISTING BUG FOUND, NOT FIXED (reproduces on the untouched b31 baseline)
- Press Enter in an item, then Ctrl+Z while the new empty line is still focused: the next item's text is blanked (that item was "Book the dock appointment" in the scratch note).
- If the new line is blurred first, undo is clean. So it looks like the stale-focusout class of the I8 comment on the undo path, and I did not trace the code path.
- Likely fix (unverified): blur the active element before `render()` in `applyHistorySnapshot`, as the Backspace handler does.

## What changed
```
 public/app.js     | 28 +++++++++++++++++++++++-----
 public/editor.js  | 45 +++++++++++++++++++++++++++++++++++++++-----
 public/index.html |  2 +-
 public/rail.js    | 29 +++++++++++++++++++++++++++-
 public/styles.css | 56 +++++++++++++++++++++++++++++++++++++++++++++++++++----
 5 files changed, 144 insertions(+), 16 deletions(-)
```
Plus a new untracked `test/checkoff.test.js` (7 tests).

## Criteria
| # | Result | Evidence |
|---|---|---|
| 1 | FAIL | No kit or belief anywhere. The options it weighed were scoped by effort ("how far should feels good go"), not by what the product believes. |
| 2 | FAIL | It listed three scope options (polish / sink-or-hide / celebrate), not three directions for a moment; none was weird; it picked (a) itself. It did mark where it would have waited. |
| 3 | FAIL | Criterion 3 command: 10 hits, all in `public/styles.css`: `.32s`, `.55s`, `.08s`, `.1s`, `.12s`, `.26s`, `.28s`, `.3s`, `.7s`, and three raw `cubic-bezier`s (`--spring: cubic-bezier(.3, 1.8, .5, 1)`, `cubic-bezier(.3, .7, .3, 1)`). None of the planner's existing rail values were reused. |
| 4 | FAIL | No listed tell by name, but the check-off is the stock "satisfying checkbox" recipe (spring overshoot, ripple, tick draw-in, hover ghost dot), which fits any to-do app and names no belief. The overshoot and ripple play on every routine tick, which is the carved-moment liveliness applied to everyday motion. The ripple (`box-shadow`), color and `stroke-dashoffset` transitions break the floor's transform/opacity-only rule. |
| 5 | FAIL | No strip files. It says it "inspected static frames at 4x" by seeking; reduced motion was checked via CSSOM only. |
| 6 | FAIL | No editor pass and no critic. It did walk a lot of the journey (focus, undo, rail sync, other days), which is the strongest part of this baseline. |

## Choices and rationalizations (verbatim quotes)
- Rejected celebration: "Option (c) is noise in an all-day tool."
- Rejected sinking finished items: "Option (b) reorders or hides lines in the vault file, which fights the index-based model and carry-forward (ticked items stay put as the record)."
- Strikethrough: "done should not rest on colour alone and it makes the animation land."
- Motion budget: "I picked subtle: everything is under about 550 ms and is off under prefers-reduced-motion."
- The spring (CSS comment): "Press-in is quick and plain; the overshoot spring on release is the pop."
- The hover dot (CSS comment): "anticipation: a faint dot promises the fill"
- The ripple (CSS comment): "the ripple: a halo that grows and fades"
- Timing was set per property by feel (`.32s`, `.26s`, `.28s`, and so on), with no reference to the rail's existing `.15s`/`.35s`/`.4s` values.

## Zombie tells seen
- None of the spec's named tells (no toast, no confetti, no `transition: all`, no spinner, no "Are you sure?").
- Genericness the two-question check catches: the spring + ripple + draw-in tick is what a generic model produces for any checklist, and nothing in it expresses a product belief.

## Frames (Task 4 Step 4)
- `C:\Users\JeffLocal\cx-runs\s1-baseline\frames\strip.png` (the plan's capture: `.item .check >> nth=0`, 6 frames): 5 animations found, span 550 ms. At full-viewport scale the change is too small to judge; the ring goes purple from 110 ms and the row dims.
- Extra close-up for reading (`--clip ".item >> nth=0"`), `...\frames-clip\strip.png` and its frames: at 0 ms the empty ring shows the press state; by 110 ms the purple fill is in and the strikethrough starts; at 550 ms the fill carries a white tick and the text is dimmed and struck through. The overshoot and ripple aren't visible at this size.
- Neither capture touched the seeded note (`git status -- starter-vault` clean afterwards).
