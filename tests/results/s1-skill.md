# S1 with considered-ux, 2026-09-28

Run folder: `C:\Users\JeffLocal\cx-runs\s1-skill\daily-planner` (port 4802), archived from daily-planner `c8d52f2`, the same commit as the baseline, with an identical seed note. Fresh general-purpose subagent, default model, prompt identical to the baseline (no mention of the skill); 135 tool calls, about 44 minutes.

**Triggered on its own:** the transcript's first tool call is `Skill {"skill":"considered-ux"}`; it then read `kits/jeff.md` and the references and emitted tokens with `emit-tokens.mjs`.

## Reply (verbatim)
#### Result
Ticking a checklist item now answers at the circle within one frame, and the rail strip answers in the same beat. Finishing a list rules it off. Changes are in `C:\Users\JeffLocal\cx-runs\s1-skill\daily-planner`, uncommitted and not pushed.

I checked it in headless Chromium against isolated scratch servers, plus read-only loads of the live 4802 instance. I did not test it in the real Tauri rail window or the Edge PWA window.

#### The question I'd have waited on (I picked #1)
Family `jeff`, dial `full`, so the skill wants 3 directions for the one carved moment, with the builder picking. Sound was declined because the action is routine.

| # | Direction | Moment | Belief | Cost |
|---|---|---|---|---|
| 1 (picked) | Rule it off | Tick is quiet. Ticking the last item draws a fine rule under the list, left to right, in the section colour, and it stays as a resting mark. | 1 | Small |
| 2 | Ink dries | The tick lands "wet" and dries once the note is on disk; a failed save stays wet at the row. | 3 | Medium |
| 3 (weird) | Strike down the list | Press one circle and drag down the column to tick every circle crossed, undone by one Ctrl+Z. | 2 | High: collides with row drag-reorder |

I picked 1 because the kit bans the stock "satisfying" recipe on routine ticks. Liveliness is spent once, on finishing a list.

Other assumptions, all reversible:
- **Save on tick:** a tick now saves immediately instead of waiting out the 800 ms debounce. To undo, remove the `doSave()` call in `afterToggle` in `public/app.js`.
- **Resting mark:** the rule persists on cleared lists, including when you reopen past days. To drop it, delete the `.panel.cleared::after` rule.
- **Save time hidden in the rail:** it is hidden in the expanded rail view (why is under "Found by looking at the frames").

#### What changed
| File | Change |
|---|---|
| `public/motion.css` (new) | Kit tokens, emitted by the kit's tool (write mode). |
| `public/index.html` | Loads motion.css first; build stamp b31 to b32, per the repo convention. |
| `public/styles.css` | The circle's fill and tick are pseudo-elements, so a tick moves only opacity and transform. Ticking uses the enter token (150 ms) and unticking the exit token (100 ms). Also added: hover preview, a token-based focus ring, done text dimmed via opacity, the section rule, a reduced-motion block, and the two topbar fixes below. |
| `public/editor.js` | A tick flips the row in place instead of calling `rerender()`, then calls a new `onToggled` hook. |
| `public/app.js` | New `syncAmbient()` sets each panel's `.cleared` mark and pushes live counts to the rail. It runs after render, after a tick and after an autosave commit. New `afterToggle()` saves at once. |
| `public/rail.js` | New `pushSummary()`. |
| `src/summary.js` | New `isCleared()`, using the same open/done rules as the rail. |
| `test/summary.test.js` | 6 new tests. |

Outside the repo, I appended one row to the kit ledger in `C:\Users\JeffLocal\.claude\skills\considered-ux\kits\jeff.md`; `kit.mjs --check` passes.

#### Why
- **Old click:** it rebuilt the whole day, so no motion was possible and keyboard focus was lost.
- **Stale strip:** while expanded, the rail ignored SSE and never polled, so its counts froze as you ticked.
- **Slow update elsewhere:** a tick took about 1.05 s to reach a collapsed strip in another window. It now takes about 0.27 s (measured).
- **Kit rules served:** answer where they acted, state without opening, acknowledge within 100 ms, never lose their place, undo over "Are you sure?".

#### Found by looking at the frames
- **Layout jump:** in windows under about 640 px, including the rail's default 480 px, the first "Saved hh:mm" wrapped and grew the topbar, so the whole list jumped 13 to 15 px. It was already there when typing, but my immediate save moved it to the first tick. A hidden placeholder now holds the status's place, and a regression check runs at 4 widths.
- **Trade-off:** in narrow PWA windows the topbar now starts at the height it used to reach after the first save.
- **Ghost text:** in the expanded rail, "Saved hh:mm" showed through the glass behind the ring and count. It is hidden there now, so the strip is the only answer in that view.
- **Seam:** a dark hairline ring appeared between the new fill and the border, at every display scale. The fill now runs under the border, as the old background did.

#### How I checked
- **Behaviour script:** 51 assertions against scratch servers, all passing.
  - In-place flip, with the same DOM node, focus and scroll kept.
  - First transition starts 5 ms after the click.
  - Only opacity and transform animate.
  - Timings match the kit tokens.
  - One PUT per tick, and the rail strip updates 1.7 ms after the click.
  - Ctrl+Z, keyboard use and the focus ring, reduced motion, and AA contrast (6.48:1 dark, 4.93:1 light).
  - Bullet dot is a no-op.
  - The strip stays on today's counts when the view is on another day.
  - The rule lifts once a new item is typed under a cleared list.
- **Mutation checks:** I broke two things on purpose and the matching assertions went red (8 for the in-place flip, 1 for the today-guard), then restored the files byte for byte.
- **Frames:** I ran the skill's frame capture, normal and reduced-motion, for tick, untick, hover, list-clear and rail-expanded tick and clear. Strips are in `C:\Users\JeffLocal\AppData\Local\Temp\claude\C--\de2c014b-7a20-496a-9926-072f23d0f913\scratchpad\ux\strips\` (12 strips).
- **Unit tests:** `npm test` gives 295/295 with a long temp path. With the default temp path it gives 273/276. The same 3 server test files crash in `fs.watch` on the `JEFFLO~1` short path before and after my change (baseline 267/270).
- **Live instance:** the 4802 instance serves b32 with no console errors and zero writes, and the seed note is unchanged.
- **Scripts:** the scripts are in the same `ux` folder. `verify.mjs` reruns the assertions once `serve.mjs` and `make-vaults.mjs` have restarted the scratch servers.

#### Not done or open
- **Critic not run:** the zombie critic has not been run, because I'm a subagent. The request is written at `...\scratchpad\ux\strips\critic-request.md`. Run it as a fresh sonnet subagent.
- **Self-check:** my own pass against the same lists found no tells. Two things a critic may raise:
  - The fill scales in from 0.5 to 1 with no overshoot, the mild end of the stock recipe.
  - The rail count and the tick are linked by timing, not by a motion path.
- **Undo/redo:** they rebuild the day, so the flip is instant. State, strip and rule still follow, and scroll is kept.
- **Existing gaps, untouched:**
  - Focus drops to the body after undo.
  - `.check` has no accessible name or state.
  - The narrow PWA topbar still overflows sideways under about 500 px.
  - In rail mode the topbar's prev/next arrows start disabled until the date picker is opened.
- **Not tested:** real WebView2 and Edge windows, physical fractional display scaling (only emulated at DPR 1, 1.25, 1.5, 1.75), and high-contrast mode.
- **Live rail window:** it needs a reload to pick up b32.

## What changed
```
 public/app.js        | 29 ++++++++++++++++++++++--
 public/editor.js     |  9 ++++++--
 public/index.html    |  3 ++-
 public/motion.css    | 18 +++++++++++++++
 public/rail.js       | 10 +++++++++
 public/styles.css    | 62 +++++++++++++++++++++++++++++++++++++++++++++++-----
 src/summary.js       |  9 ++++++++
 test/summary.test.js | 35 ++++++++++++++++++++++++++++-
 8 files changed, 164 insertions(+), 11 deletions(-)
```
The kit ledger row it appended (removed from `kits/jeff.md` by a build ruling, since it logged a moment built in a throwaway snapshot):
`| 2026-09-28 | daily-planner | Check off an item | Last tick rules the list off: a 2px rule in the section colour draws left to right under it and stays as a resting mark | 1 | rule: fill 400ms, standard easing; tick: enter 150ms / exit 100ms; preview: hover 150ms |`

Strips copied out of the AppData scratchpad (which Jeff can't see) to `C:\Users\JeffLocal\cx-runs\s1-skill\ux\strips\`.

After the critic round (below) the final diff is 8 files, 184 insertions, 12 deletions; the resolution round touched only `public/styles.css` and `public/editor.js`.

## Zombie critic (both sides)
The run wrote `critic-request.md` (payload only: strips, screen text, beliefs and rules, zombie tells; no reasoning). A fresh sonnet subagent ran it; its findings went back to the run with SendMessage.

| Critic finding | Run's resolution |
|---|---|
| Emoji as icons (headings and rail tiles); the check-box glyph reads "done" beside a "0 open" count | Stays: the emoji come from the vault template's own callout headings and the repo's rail map, so swapping them is a whole-UI redesign. Flags the Validation glyph as a builder decision. |
| No motion tell: circle stays 18×18, no ripple, no drawn-in tick, no overshoot | — |
| Judgment call: the rail count bumps (about 1.2×) on every tick | Stays: it's the planner's existing 350 ms bump and the kit's own "count bump" alternative; a planner sees a handful of ticks a day. |
| Possible: End-of-Day Checkpoint has no rail tile | Stays: the four tiles are fixed by the rail spec; a fifth would keep the tray badge above 0 all day. |
| Possible: no visible save cue in the expanded rail | **Fixed:** a passive "Saved hh:mm" now sits at the foot of the day view beside the strip (checked at rail zoom 0.75–2). |
| Unrecorded cases (untick from an all-done list, reopening an all-done day, rail in dark theme) | **Recorded:** `unclear-list` (the rule lifts in 100 ms), `reload-cleared` (rules present from the first frame, 0 animations), `rail-tick-dark`, `rail-clear-dark`. |
| "b32" build stamp; bare empty sections | Stay: repo convention; a per-section placeholder is a separate feature. |
| Text anti-aliasing flips to grayscale during the animations | **Fixed:** reproduced (fringing 36.8 → 0 → 36.8); the fill and tick now only fade (no scale-in) and the rule paints last. A `verify.mjs` check fails if the scale-in returns. |
| After an untick, the circle ends looking like the hover preview | **Fixed:** the circle is marked `.settled` until the pointer leaves, so it shows its real empty ring. |
| Faint glyphs behind the rail's target icon | **Fixed:** the build stamp overflowing the topbar under the translucent strip; the expanded topbar now clips at the strip. |

Final checks from the run: `verify.mjs` 71/71 (was 51); `npm test` 295/295 with a long temp path; the seed note untouched. I opened the re-captured `tick`, `untick`, `unclear-list`, `reload-cleared`, `rail-tick-dark` and `rail-clear` strips (plus all 12 first-round strips earlier).

## Criteria
| # | Result | Evidence |
|---|---|---|
| 1 | PASS | Read `kits/jeff.md` (family `jeff`, dial `full`); every direction names a belief (Rule it off: 1; Ink dries: 3; Strike down the list: 2). |
| 2 | PASS | Three directions, #3 marked weird, under "The question I'd have waited on (I picked #1)". |
| 3 | PASS | Criterion 3 command prints nothing, before and after the critic round. `public/motion.css` is the emitted token file (header "Generated from the design kit"). |
| 4 | PASS | No tell in the diff or the strips: transform/opacity only, no overshoot, ripple or drawn-in tick, no toast. The critic's one tell (emoji headings) predates the change and stays with a stated reason. |
| 5 | PASS | 20 strips in `cx-runs\s1-skill\ux\strips\`, each interaction normal plus reduced motion; reduced-motion end states match the normal ones. |
| 6 | PASS | Editor pass (it found and fixed a layout jump, ghost text and a seam from the frames); `critic-request.md` written; critic run and every finding resolved. |

**Score: 6/6 (baseline 0/6).**

## Choices and rationalizations (verbatim quotes)
- The pick: "I picked 1 because the kit bans the stock 'satisfying' recipe on routine ticks. Liveliness is spent once, on finishing a list."
- The material (CSS comment): "A fully ticked list is ruled off: a fine line drawn under it, left to right, the way you close a page in a paper planner."
- Done without strikethrough (CSS comment): "Done reads as quieter, not as struck through: opacity rather than colour so it moves with the tick".
- Sound: "Sound was declined because the action is routine."
- Its own doubt before the critic: "The fill scales in from 0.5 to 1 with no overshoot, the mild end of the stock recipe." (Removed in the resolution round.)

## Zombie tells seen
- None introduced. Pre-existing: emoji section icons (kept, reason stated).

## Frames
- Baseline vs skill, same tick: the baseline plays press-in, spring overshoot, drawn-in tick and ripple over 550 ms on every tick; the skill run fades fill and tick in over the 150 ms `enter` token and spends its one moment on finishing a list (a 2 px rule, `fill` token, 400 ms).

## Critic model (Task 8 Step 5, open item 4)
Same payload to both, built from the S1 baseline: the Task 4 strip plus the row close-ups, the day view's visible text, the kit's beliefs, product belief and 9 rules pasted in, and `references/zombie-tells.md` pasted in. Prompt: the critic prompt from `references/editor-pass.md`, plus one line saying the strips show a user checking off the first item.

| | sonnet | haiku |
|---|---|---|
| Stock "satisfying" recipe | Found all three parts, measured: overshoot "about 22 px against 18 px at rest (about 1.2x)" at 110 ms; tick "a stroke reveal, not a fade or scale", done at 330 ms; ripple "about 5 px past the circle at 220 ms and about 7 px at 330 ms". "The state is fully told by 110 ms … The next ~440 ms is decoration, replayed on every tick." | Found the fill-then-tick sequence only ("empty circle → solid fill → checkmark"); no overshoot or ripple. |
| Other real findings | Emoji as icons in the section headings; no count at the Top Priorities heading (State without opening); the pop and ripple "radiate from the ring and go nowhere" (Motion explains cause); bare empty rows; the accent colour meaning "checkbox", not a state. | No count toward the day's priorities (fair). |
| Invented or wrong | None. It marked limits itself: "What the 'x' does (rule 9) isn't shown", "Rule 7 is not shown broken … The 110 ms spacing can't prove it was under 100 ms." | Invented a delete behaviour the frames never show ("Deleting an item via X with no confirmation"), called the strikethrough (the non-colour done cue) a zombie tell, and recommended "an undo toast", itself a tell. |
| Cost | 23 tool calls, about 8 minutes | 10 tool calls, about 1 minute |

**Choice: sonnet.** Reason: it found every real tell, with measurements, and invented nothing; haiku found one of three parts of the recipe and invented findings the frames didn't show. Written into `references/editor-pass.md`.
