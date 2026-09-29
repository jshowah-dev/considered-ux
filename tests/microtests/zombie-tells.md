# Micro-test B: zombie tells and directions, 2026-09-28

Single-shot general-purpose subagents, default model, no file edits. 5 guided + 5 control, dispatched in parallel.

## Prompts
Guided:
> Read C:\Users\JeffLocal\.claude\skills\considered-ux\SKILL.md and follow it. The repo is daily-planner (read kits/jeff.md in the skill folder; it maps daily-planner to the full dial). Request: "Design what happens when the user saves the settings panel." Reply only with the directions you'd offer. No code, no files.

Control (the plan's prompt plus the last sentence; ruling in the build ledger):
> Request: "Design what happens when the user saves the settings panel of a desktop daily-planner app." Offer 3 directions. Reply only with the directions. No code, no files. Don't use any tools or skills.

## Scores
Tells counted against `references/zombie-tells.md`. A tell the direction itself justifies is listed but not counted.

| Run | Unjustified tells | Every direction names a belief | Weird direction |
|---|---|---|---|
| Guided 1 | 0 (B's "Saved · Undo" tab at the gear is the fold's destination, reason stated) | yes (3; 2; 2 + 3) | yes, "C. Seen before it's true" |
| Guided 2 | 0 | yes (3; 1 + product trust; 2) | yes, "3. Leaving is saving" |
| Guided 3 | 0 | yes (1; 2; 3) | yes, "3. The panel keeps a diary" |
| Guided 4 | 0 (direction 1's topbar "Settings saved · Undo" is off-site, reason stated as a cost) | yes (2; 3 + product trust; 1) | yes, "3. Promise, then proof" |
| Guided 5 | 0 | yes (1; 2; 3) | yes, "3. The settings log" |
| Control 1 | 1: receipt bar rising at the bottom of the planner for the user's own save (dir 3) | n/a | none framed |
| Control 2 | 0 | n/a | none framed |
| Control 3 | 0 | n/a | none framed |
| Control 4 | 3: "Settings saved · Undo" toast (dir 1), "Changes discarded · Undo" toast (dir 2), "Saved" toast (dir 3) | n/a | none framed |
| Control 5 | 2: bottom-edge "Saved: … Undo" line (dir 1), "Discarded 3 changes. Restore" line for 6 s (dir 2) | n/a | none framed |

**Result: PASS** on all three requirements: guided replies total 0 unjustified tells (limit 1), 15 of 15 guided directions name a belief, and a weird direction appears in 5 of 5 guided replies.

Notes:
- Convergence is the clearest zombie signal: all 5 controls offer the same three archetypes (explicit Save that closes / live settings with no Save / preview-or-impact receipt). The guided replies are each different and use the product's own material (pencil to ink, the planner's open ring filling, a dated line like "Worked on").
- Guided 2 and 4 use the daily-planner product belief ("trust and security"): never claim "saved" before the disk confirms; don't expose config writes on the unauthenticated loopback API.
- Guided 1 reported that a repo-wide grep surfaced the first lines of this micro-test's scoring criteria in the implementation plan, and that it stopped reading there. Its reply matches the other four, so the score stands; worth knowing when reading its tell check.
- Every guided run read the daily-planner code (read-only) and found real friction: `savePref` swallows write failures (`.catch(() => {})`), so a failed save looks like a success.

## Replies (verbatim)

### Guided 1
**Assumed:** daily-planner has no settings panel yet. Today it has the rail's right-click Auto-hide (saved on click), zoom/width/monitor written silently to `prefs.json`, and a hand-edited `config.json`. I designed for an explicit-Save panel opened as a popover from a topbar gear in the expanded rail. Material: paper, so it slides and settles and never bounces. Eyes: on Save, then on whatever they wanted changed.

**Under all three** (kit rules; only the carved moment differs)
- The press answers at the button within 100 ms (pressed state plus a label change, so reduced motion keeps the meaning). Never `#banner`; that is the corner-toast tell.
- Undo instead of "Are you sure?": `prefs.json` merges, so undo is one write of the old values. Save commits at once.
- No "Saved" until the write lands. `savePref` swallows failures today (`.catch(() => {})`), so a failed write looks like a success. Failures show at their row (what happened, what to do) and the value stays.
- Nothing takes focus or moves your place. Anything the server reads only at start (vault folder) says "after restart," not "Saved." I'd keep port out of the panel: the Tauri config and `planner-rail.cmd` hard-code 4747.

**A. Open rings, closed** (the quiet one)
- **Moment:** Each row you change sits with an open purple ring, the planner's own mark for unfinished. You press Save: the rings fill, and under your pointer the button becomes a receipt, "Zoom 100→120% · Auto-hide off→on · Undo," that stays until you touch something else.
- **Belief:** 3, Nothing you do is lost or ignored (plus the product's trust line: exactly what changed, and it's reversible).
- **Surprise:** Settings behave like tasks the app closes for you, and the proof has no timer. A saved-but-not-live row fills gold.
- **Cost:** Low. Reuses the ring and `--pct` fill (`fill`); the receipt rises by the `enter` distance. Fill only, no drawn tick, no overshoot. Needs a non-color cue for AA (open vs filled, plus text).

**B. Folded away**
- **Moment:** Mid-sentence in a note, you open settings, raise the zoom, press Save. The button answers in place, then the sheet folds back toward the gear and leaves a small "Saved · Undo" tab there. Your caret is blinking in the same word, on the same line at the same height, though the text just got bigger.
- **Belief:** 2, Your attention belongs to you (the fold also serves 1: it moves from where it came to where it went).
- **Surprise:** The panel becomes the receipt instead of vanishing, and the change lands around your place, not over it.
- **Cost:** Medium. Origin-aware fold (transform and opacity) at `emphasis` rather than `exit`, because the path is the point; that is the one grammar break, to log. Restoring the caret and anchoring the focused line must go through the same commit-before-render path the undo/focus fix just hardened (`render()` rebuilds `#day`; focusout fires mid-removal). The tab lives until your next input elsewhere.

**C. Seen before it's true** (the weird one)
- **Moment:** You rest on Save (or focus it) and the day behind the panel shows the new zoom in pencil (a dashed outline), with the other changes written under the button as they'll read once true. Move off and it all goes back. Click and the pencil goes solid; nothing changes, because you'd already seen it.
- **Belief:** 2, Your attention belongs to you (Preview on approach), and 3: nothing lands that you haven't seen.
- **Surprise:** Save is a window, not a door. The click is the moment a preview stops being provisional, which is why no confirmation is needed.
- **Cost:** Medium-high. Zoom previews through the apply-without-persist path `initZoom` already has; width, monitor and auto-hide can't preview without moving the OS window, so they preview as text. The preview waits for intent, as the flyout does, so a passing pointer doesn't twitch the day; pencil to solid runs over `confirm`. Mount the panel on body like the other popovers: `#topbar` and `#day` carry the zoom, and the button would rescale away from the pointer mid-preview. Every future setting must declare how it previews.

**Tell check:** none is a corner toast, spinner, confetti, spring, "Are you sure?" or drawn tick. A borrows the planner's own ring (fill only) because that ring is this product's done mark. No sound offered (the strip sits over other work; Belief 2).

**Need from you:** pick one, or say combine. Also: explicit Save (assumed) or instant-apply like today's Auto-hide, and does the vault folder belong in the panel at all?

*Process note, outside the directions: my repo-wide grep for "settings panel" surfaced the first lines of Micro-test B (its scoring criteria) from the Considered UX implementation plan in personal-vault. I stopped reading there and did not open that file. The directions come from the skill, the kit and the daily-planner code (C:\Users\JeffLocal\git\daily-planner\public\rail.js, public\app.js, public\styles.css, server.js, src-tauri\tauri.conf.json). No files written, no code.*

### Guided 2
No settings panel exists yet, and nothing here waits for a Save today: notes autosave and prefs persist the moment they change. So I've assumed a panel of auto-hide, zoom, width and display (`prefs.json`). Port stays out: it's hard-wired into `tauri.conf.json`, the capability allowlist, both launchers and the installed PWA's origin.

**1. Ink dries** (at the field)
- Moment: You press Save and the values you changed, heavier and tinted while unsaved, settle into plain text row by row as the disk confirms each one.
- Belief: 3. The panel never claims more than the disk confirmed; a rejected value stays tinted, with its reason underneath.
- Surprising: the confirmation is the row settling, tied to the real write, not a timer or a message.
- Cost: no perf hit; low complexity (three row states plus the reconcile); low upkeep, since new settings inherit it. The tint is an opacity crossfade, because color can't animate under the floor. Quietest of the three.

**2. The strip proves it** (at the destination, for the one save that matters)
- Moment: You point the planner at another folder and press Save. The button says what it found ("212 notes, template present") before anything switches, then the strip's rings and counts re-tally to that folder's real numbers.
- Belief: 1, plus the product's trust. It checked before it touched anything, and you watch it read what you meant. Everyday saves stay quiet.
- Surprising: no "switched!" anywhere; the strip's numbers moving is the receipt. Reuses `fill` and `bump`, nothing invented.
- Cost: highest. Adds a vault-folder row (hand-edited in `config.json` today). The server fixes vault, watcher and port at start with no restart path. The write must not ride `/api/prefs` (any key, no origin check). A pending note edit must flush to the old vault first. Identical tallies show no change, so the row still names the folder.

**3. Leaving is saving** (weird)
- Moment: There's no Save button. You send the strip to Display 2 and leave the way you leave everything here (Esc, click the strip, drift off the flyout). As the flyout goes, the strip hops, and a dot on it reads "Display 2 · Undo" on hover.
- Belief: 2. Nothing to remember to press, and no "unsaved changes?" nag when the flyout closes under your pointer (it dismisses on pointer-leave).
- Surprising: it deletes the button and the guarantee gets stronger, since nothing can be left unsaved. Display and width can't move the window while the panel sits inside it, so the exit is where they land, and the exit is the moment.
- Cost: every row must be safe to apply instantly; needs a Revert row; Esc means "keep" (already true when collapsing); the strip's only dot today is offline, so the marker needs its own place; window moves are native snaps, no tween.

**Held constant under all three**
- Answer within 100 ms where they acted (the button says `Saved 02:32 PM`, the topbar's own voice), optimistic, then reconciled with what `PUT /api/prefs` echoes back. No spinner, no toast; nothing takes focus or closes the panel for you.
- Failure at the field in the app's voice: "Not saved — server isn't answering. Retrying; your changes are kept." Today `savePref` swallows the error and the strip carries on as if it saved.
- Undo, never "Are you sure?"; every save here is reversible.
- Unsaved edits survive the flyout dismissing, reopen and errors; the strip carries a mark while any are pending. Reduced motion keeps every state, carried by weight and text.
- Sound: none, since a settings save is routine.

Pick one.

### Guided 3
Assumes a new panel with an explicit Save, holding what prefs.json holds today (auto-hide, zoom, width, monitor). The repo has no settings panel yet; the rail's right-click menu applies instantly and never checks that the write succeeded.

**All three:** the panel stays open and focus stays on Save. The answer starts at the Save button inside 100 ms, never a corner toast, `#banner`, or `#save-status` (that one means "your note is on disk"). Undo sits in place with no timer and no confirm. A failed write keeps the values and says the fix at the button. The panel sits outside the CSS-zoomed `#topbar`/`#day`, so a zoom change can't slide Save out from under the pointer. Reduced motion means an instant swap plus a text or weight cue.

**1. Receipt in place**
- Moment: You press Save and the button itself becomes the receipt, "Saved · Auto-hide on · Width 480 → 520", with Undo beside it, until you edit again or put the panel away.
- Belief: 1, You should feel thought about.
- Surprise: It's specific where every app says "Settings saved", and it answers your next question before you ask. For auto-hide: "The strip tucks to a thin edge a few seconds after your pointer leaves; touch the edge to bring it back." The button's count ("Save 3 changes") bumps as you edit, like the strip's counts.
- Cost: No perf cost. Low complexity: diff two flat objects, one crossfade on `enter`/`exit`, the failed-write state. Upkeep is one line of copy per setting.

**2. Pencil to ink**
- Moment: A setting you change goes down in pencil (dimmer, dotted underline, the word "unsaved") and stays pencil even if you close the panel. Save goes over every pencilled row in ink, top to bottom, and Undo turns them back to pencil instead of discarding them.
- Belief: 2, Your attention belongs to you. What's saved and what isn't reads at a glance, from where you already are, and leaving mid-thought loses nothing.
- Surprise: You see a save coming and see it land. Paper physics: ink takes, nothing bounces, no tick. Drafts linger visibly, the way the planner carries unfinished items forward.
- Cost: No perf cost. Medium complexity: per-row draft state, persisted server-side (WebView2's localStorage lost data on a tray Quit); the ink pass is an opacity crossfade of two stacked text layers, staggered inside `confirm`. Upkeep: each new setting defines both states. Pencil vs ink is weight, underline and a word, so it holds in both themes and under reduced motion.

**3. The panel keeps a diary (the weird one)**
- Moment: You press Save and a dated line, "Mon 14:32 · Auto-hide off → on", slips out of the button into a short log right beneath it: your receipt, your Undo, and the answer to "when did I change that?"
- Belief: 3, Nothing you do is lost or ignored, written in the planner's own form (a dated line, like "Worked on"). It also carries the trust line: an audit trail of your own config on your own machine.
- Surprise: Nobody expects a settings panel to remember. It's how you find out why the strip vanished last Tuesday. The line travels button to log, so cause to effect is visible.
- Cost: No perf cost. Highest complexity: a capped history stored server-side (today's shallow-merge PUT needs the client to send the whole array, or an append endpoint), human names for values ("Display 1", not `\\.\DISPLAY1`), and a narrow panel, so show the newest line and disclose the rest. Undo on the newest line only. Upkeep: old → new copy per setting. The only motion is one `enter`.

Sound: none proposed (the full dial keeps it opt-in). Pick one.

### Guided 4
**Assumption.** The panel is new: no control in daily-planner has a Save button today. Notes autosave ("Saved 02:14 PM" in the topbar), and zoom, auto-hide, monitor and width apply on touch, PUT silently and swallow failures. An explicit Save earns its place only if the panel holds things that can't apply live. Vault path and port sit in config.json, read once at server start, and exposing them to the unauthenticated loopback API is a security call. If the panel is only the live prefs, drop Save and commit on touch.

**Every direction.** Paper physics: things slide and settle, nothing bounces. The Save button answers inside 100 ms, and the final state lands on the server's reply (a local write, so no spinner). A failure speaks at its row with what to do and keeps your input. Undo replaces any "Are you sure?". Enter in a field saves, as in the link dialog. Closing with unsaved changes parks the draft. Focus only ever returns to where it was. Motion is interruptible, and reduced motion becomes an instant change plus a text cue. No toast, no sound. Performance is negligible: one local PUT, transform and opacity only.

**1. Back to your line** (the answer is your place)
- Moment: You press Save and the panel slides back the way it came. You're on the line you left, caret in place, the new setting already working around it.
- Belief: 2, Your attention belongs to you (mechanism: 3's Never lose their place). A settings visit is a detour, and the confirmation is getting your thread back.
- Surprising: Nothing celebrates.
  - The panel leaves when the file confirms (`exit` timing, `enter` distance reversed).
  - Your last line gets one `locate` flash.
  - If zoom or width changed, that line holds its screen position while the layout reflows.
  - Undo waits in the topbar status ("Settings saved · Undo") until your next edit.
- Cost:
  - Capture focus, selection and scroll on open.
  - Holding an anchor line under CSS zoom is the fiddly part.
  - The existing search flash animates background, so it gets rebuilt as an opacity overlay.
  - Undo sits a step from the line, because the button leaves with the panel.

**2. Pencil to ink** (the answer is on the rows)
- Moment: Each changed row wears a dashed pencil edge. You press Save and ink runs out from the button, turning each edge solid as it arrives, but only once the reply matches what you sent. The panel stays open.
- Belief: 3, Nothing you do is lost or ignored, plus the product's trust: never "saved" before the disk says so.
- Surprising: The animation is the truth. If the write fails, the dashes stay and the button says why. After `confirm` the solid edges recede, leaving a dim "was 80%" on each row that works as its own Undo until the panel closes. Dashed versus solid carries state without relying on color.
- Cost: per-row dirty and "was" tracking, comparing reply to request, the run (`fill`) and the recede (`exit`), a live region so screen readers hear "3 changes saved", and every future setting must define its "was".

**3. Promise, then proof** (the weird one; the answer is the button)
- Moment: You rest on Save and it shows what it's about to do. You click, and the same box turns from future tense to past. The panel stays open.
- Belief: 1, You should feel thought about (with 2's Preview on approach: peek, then commit, never a dialog).
- Surprising: Save is an object with a lifecycle, not a trigger.
  - Only the changed verbs crossfade (`emphasis`): "Zoom will go 100% to 80%" becomes "Zoom is now 80%".
  - A restart-only setting flips to "Waiting for restart", never "Changed".
  - The box names the file it wrote and keeps Undo.
  - The count on the button ("Save 3") bumps as you add changes, like the rail's counts.
- Cost:
  - A new popover (the rail's flyout exists only while collapsed) that fits a 272px column, the narrowest expanded width.
  - Keyboard focus previews too.
  - Two tenses of copy per setting to keep in sync.

Pick one. Directions only; nothing built or recorded.

### Guided 5
**Assumed.** daily-planner has no settings panel yet. The nearest thing is the rail's right-click menu (auto-hide only), which applies at once through `PUT /api/prefs` and swallows failures in `savePref`. I took the panel to hold today's prefs: auto-hide, zoom, width, monitor. `vaultPath` and `port` can't save live (config.json is read once at boot; the port is baked into the Tauri window, the PWA and the launchers). If they join, that row alone says "applies after restart", and port is the one place a confirm is earned, naming what breaks.

Three ways to answer "did it take?": show it, step aside, keep a record.

**1. It acts it out**
- **Moment:** You save auto-hide and the strip slides to its 6 px sliver and back, once. The row says "Tucks away 4 s after your pointer leaves. Touch the right edge to bring it back." with Undo beside it.
- **Belief:** 1, you should feel thought about. It answers the question you were about to ask: where will it go, and how do I get it back?
- **Surprising:** the proof is on the thing, not a message about it. Only rows you changed speak; the rest stay still.
- **Cost:** low. One slide on the strip, clipped by the window edge (no window motion) and cancelled when the pointer arrives. Out on `emphasis`, a `confirm` beat to read the sliver, back on `enter`. Only auto-hide needs staging: zoom and monitor show themselves, and width shows on the next expand, so its row just states the number. The copy per setting is built from PEEK_MS and PEEK_W so it can't drift.

**2. Handed back**
- **Moment:** You save and the panel tucks back toward the strip. You're typing again in the same word, with caret, selection and scroll exactly where you left them.
- **Belief:** 2, your attention belongs to you (Never steal focus, Never lose their place).
- **Surprising:** no ceremony. The panel leaving is the receipt: it leaves only once the server confirms the write, so if it stays, it says why at the field.
- **Cost:** medium. Restoring the caret runs through editor.js's blur-commit path, where the uncommitted undo/focus fix sits, so land that first. The exit (`exit`, toward the strip) must finish before applyWindow's native resize snaps the window. Undo becomes "Last saved 02:14 PM, Revert" at the top of the reopened panel (Ctrl+Z belongs to the day's history).

**3. The settings log (the weird one)**
- **Moment:** You save and each change drops from its row into a running log at the foot of the panel ("02:14 PM  Auto-hide off → on  Undo"), under last week's entries.
- **Belief:** 3, nothing you do is lost or ignored. It is also the product's trust promise: a visible trail, kept on this PC.
- **Surprising:** settings that remember, in the same habit as the day's Worked on. Undo adds a line instead of erasing one, so history never rewrites.
- **Cost:** high. The log has to persist (prefs.json is flat and shallow-merged, so appending needs a read-modify-write or a small endpoint). It also needs a retention cap, a taller panel and a row-to-log transform path. Over-built for four prefs; it earns its keep if the panel grows or the vault path ever joins.

**Held constant.** No toast, tick, confetti or "Are you sure?" (reversible, so it applies at once with undo). Save answers in place within 100 ms, optimistically, in the notes' voice ("Saved 02:14 PM"; every other save in the app is automatic). Failure keeps the panel open with the draft intact and says at the button what happened and what to do. The draft survives close and any pointer-leave dismissal. Reduced motion: same change, instantly, cue kept in text. Transform and opacity only, kit tokens only, no sound.

Pick 1, 2, 3 or a blend. Nothing gets built until you do.

### Control 1
**1. Commit bar: explicit save, pending state made visible**
- **Model:** Edits stay pending until saved. The first edit raises a footer bar ("2 unsaved changes", Discard, Save) and puts a small accent mark on each changed row, so nothing is pending invisibly.
- **On save** (button or Ctrl+S): everything commits at once. Save turns into "Saved" with a check icon for about 1.5 s (spinner only if it takes over 150 ms), then the bar retracts and the marks clear. Focus returns to the last edited control. The panel stays open, and screen readers hear "Settings saved".
- **Leaving with pending edits:** the bar becomes "Discard 2 changes?" with Keep editing focused. No modal.
- **Failure:** invalid fields show inline errors and focus jumps to the first. If the write fails, edits stay pending with Retry. If the OS refuses one item (e.g. a taken global shortcut), the rest saves and that row is flagged.
- **Trade-off:** most predictable and forgiving, but it adds one step to every tweak.

**2. Live settings: no save step, undo instead**
- **Model:** The panel is a side sheet, so the planner stays in view. Every control commits as it changes (text after a ~600 ms pause or on blur). The planner reacting is the confirmation.
- **On "save":** nothing to press. A small "Saved" tick appears beside the changed row and fades after about 1 s (also announced to screen readers). The header holds Undo (last change) and Revert all (back to how it was when the panel opened). Closing just closes.
- **Exceptions:** high-consequence rows (e.g. data folder, sync account, clear data) keep their own inline Apply with a one-line confirm.
- **Failure:** local to the row. The control snaps back with the reason beneath it ("Ctrl+Alt+P is used by another app"), and everything else stays applied.
- **Trade-off:** least friction and no lost edits, but no moment to review before committing, so accidents rely on undo.

**3. Preview and receipt: try it, commit it, see what it changed**
- **Model:** The panel is a side sheet. Edits preview live in the planner under a "Previewing" chip, but nothing is persisted. Esc or Cancel snaps the planner back.
- **On save:** commits atomically, then the panel closes and a receipt bar rises at the bottom of the planner. It states what changed and what that did to existing items, with Undo for about 10 s. E.g. "Day hours 7:00 to 18:00, 2 tasks fall outside and now sit in an Outside hours strip. Reminders 15 min before, 12 upcoming rescheduled."
- **Partial results:** OS-dependent settings (e.g. launch at login, notifications, global shortcut) commit one by one and report per item: "Saved 5 of 6. Ctrl+Alt+P is taken, kept Ctrl+Alt+Space."
- **Failure:** the panel stays open with edits intact and Retry.
- **Trade-off:** most informative, and it suits settings that reshape existing days. It costs the most to build, because the whole UI must read a provisional settings layer. Trivial changes such as theme get a plain "Saved" instead of a receipt.

### Control 2
**1. Commit and return** - explicit Save, the panel closes, the plan shows the effect.
- Before saving: edits are staged, so nothing changes behind the panel. Save stays disabled until something changes, and a dot on the title marks unsaved edits. Esc with edits swaps the footer to "Discard 3 changes? [Discard] [Keep editing]" (inline, no modal).
- On save (Ctrl+S or Enter): validate, write, close the panel (150 ms fade; instant under reduced motion). No spinner, since the write is local. Focus and scroll return to where the user was in the day.
- Behind the panel: everything applies at once as it clears. Local changes (hour rail, default block length) get one soft 600 ms highlight; global ones (theme, density) crossfade. If nothing visible changed (reminder sound), the status bar says "Settings saved" for 2 s, and screen readers hear it.
- If it fails: an invalid value keeps the panel open, with the message under the field and focus on the first error. A write error keeps it open with a footer message and [Retry]. Nothing is lost.
- Trade-off: simplest to build and predict. Costs an extra step, no preview before committing, and no undo after saving (Cancel is the only safety net).

**2. Live settings** - no save step; the plan is the confirmation.
- The panel is a side sheet, not a modal, so the planner stays visible beside it and reacts as each setting changes (theme, week start, hour range).
- Toggles and selects apply and write instantly; text fields and sliders after ~300 ms idle. A value that would be invalid (work day ending before it starts) is not applied until it is valid.
- The header rests on "All changes saved" and only speaks up when a write takes over 300 ms ("Saving...") or fails. No per-change toasts. It is a live region, so screen readers hear it.
- The footer has [Done] (also Esc) instead of Save and Cancel. After the first edit, [Undo all since opening] appears and stands in for Cancel.
- Exception: settings that reshape existing plans (day start, time zone, carry-over) don't apply on change. Their row shows an inline [Apply: moves 3 tasks].
- If it fails: the value stays applied for this session, the row shows "Not saved" with [Retry], and the header changes to match.
- Trade-off: least friction, and the closest match to modern desktop settings. Costs cross-field validation, and "did it save?" rests on one quiet line.

**3. Save with a receipt** - commit, then report what it did to the day and offer to undo it.
- Staged like #1 (Save/Cancel, panel closes on success). When an edit will move existing plan items, a footer line says so before saving ("Moves 3 tasks to the previous day"). No blocking confirmation.
- If nothing in the plan changes (theme, sounds), the result is just "Settings saved" in the status bar for 2 s. Feedback scales with consequence.
- If the plan changes: affected items glide to their new places (250 ms, lightly staggered) and a receipt strip pins to the top of the day: "Day now starts at 6:00; 3 tasks moved; 1 reminder rescheduled. [Undo] [Review]". It stays until dismissed or the next plan edit, since it has to be read (a 5 s toast is too short).
- [Review] steps through the affected items with arrow keys, highlighting each. [Undo] reverts settings and plan together, in one step.
- If it fails: partial results are itemized in the receipt ("Applied: day start. Not applied: calendar sync (permission denied). [Retry]") instead of a blanket error.
- Trade-off: most trust for something as personal as someone's day. Needs an impact calculator and a reversible apply, so it has the highest build cost, and it is overkill if few settings touch the plan.

### Control 3
**1. Quiet commit** (confirmation lives in the panel)
Explicit Save, kept small and local. The panel stays open.
- Save is dimmed until something changes. Changed rows get a thin accent bar and the footer reads "2 changes".
- Save (or Ctrl+S) validates, then applies all-or-nothing. If a field or the OS refuses something (a taken hotkey), nothing changes, focus jumps to that row, and the message states the fix.
- Success: no spinner under ~300 ms. The button shows a check for ~1.2 s, the accent bars clear, the plan behind updates, and the footer echoes the biggest change in plain words ("Day now starts at 7:30"). The button dims but keeps focus; screen readers hear "Saved".
- Undo sits in the footer until the next edit or panel close, so there is no timer to race.
- Anything that can't apply live shows "Applies after restart" with a Restart now link on its row. Never blocks.
- Closing with pending changes expands the footer inline ("Discard 2 changes? Keep editing / Discard / Save"). No modal.
- Choose if: you want the predictable, cheap, easily tested version. Weak spot: no help when a setting reshapes existing plans.

**2. Live, no Save** (confirmation lives in the control)
There is no save moment. Each change is saved as it's made, and the panel becomes a side sheet so the plan behind it re-flows in real time.
- Toggles and selects apply on change, text and time fields on blur or Enter, steppers after a 400 ms pause.
- Each control shows a small "Saved" tick for ~1 s. Screen-reader announcements are debounced to one per burst.
- Footer has Done (closes) and Revert all, which appears after the first change and restores the snapshot from when the panel opened. Ctrl+S flashes "All changes saved". Esc and click-outside are always safe.
- Settings that can fail (global hotkey, launch at login, data folder) aren't live. Each gets its own Apply on the row, with errors inline.
- Rule: a control never shows a value that isn't in effect. If a write fails, it snaps back and says why.
- Choose if: most settings are cosmetic or timeline-view and you want zero ceremony. Weak spot: every setting must be safe half-edited, and a workday change hits existing plans instantly.

**3. Impact-aware save** (confirmation lives in the plan)
Save is where settings meet the user's actual days. Silent when nothing is affected, informative when something is.
- On Save, diff the new settings against today, the next 7 days and recurring items. Nothing affected: saves with a check on the button.
- Affected (workday hours, time zone, a removed calendar): the form swaps in place for a short summary, e.g. "Workday now ends 4:00 PM. 2 blocks today fall after that." Up to 5 items listed, then "and 3 more".
- Default is non-destructive: items stay put, tinted "after hours". Opt-in: "Move them earlier". The primary button says what it will do ("Save" or "Save and move 2 blocks"); Back returns to the form with edits intact.
- After confirm: the panel closes, focus returns to the plan, the grid reflows, touched blocks pulse once (static outline under reduced motion), and the status bar reads "Workday updated. Undo". Undo is one step and restores settings and moved blocks together.
- Failure: settings and block moves commit together or not at all. The summary stays open with the reason and "Try again".
- Choose if: settings reshape existing plans and trust matters more than speed. Weak spot: needs a diff layer and per-setting copy, and it nags if the trigger list gets loose.

### Control 4
**1. Commit and close** — Save is a clean, all-or-nothing commit

- Footer has Save and Cancel. Save stays disabled until something differs from what's stored, then reads "Save 3 changes". Ctrl+S saves, Esc cancels.
- On Save, validate everything first. If anything is invalid, nothing is written: the first bad field takes focus, errors sit inline in plain words ("Day can't end before it starts"), and sidebar sections holding errors get a dot.
- If valid: write safely (temp file, then swap, previous copy kept), apply to the running app immediately, close the panel, return focus to the gear icon.
- Confirmation is a toast, "Settings saved · Undo", for 8s. Undo restores the kept copy and re-applies. Restart-only settings (language, data folder) are tagged before saving; the toast then reads "Saved · Restart now".
- Failure: a write error keeps the panel open with edits intact and an inline banner giving the reason and Retry. No modal.
- Trade-off: simplest to build and test, fully predictable. The user sees results only after committing, so it leans on Undo. Fits a small set of independent settings.

**2. Preview, then keep** — Save confirms what the user is already seeing

- Settings open as a side sheet over the live planner. Every control previews at once: day start 7:00 → 6:00 adds a timeline row; flipping theme flips the window. Nothing is written yet; the footer reads "3 changes previewing · Revert all".
- On Save, the previewed state becomes the real state with no re-render or flash. The footer swaps to "Saved 14:32" for about 1.5s, then the sheet slides away. No Undo toast; the user already saw the result.
- OS-level items that can't preview (launch at login, global hotkey, notifications) apply at this moment, one by one. If one fails (hotkey taken by another app), the rest still save, the sheet stays open, and the failed field shows the reason inline and stays unsaved.
- Esc or Cancel reverts with a short reverse transition. No "discard changes?" dialog; a 5s "Changes discarded · Undo" toast instead. Quitting mid-preview discards, since nothing was written.
- Trade-off: best feel, no guessing. Costs the most: every setting needs live-apply and revert paths, and previewing time settings can briefly strand tasks outside the visible day. Fits when most settings are about look and layout.

**3. Review the impact** — Save scales with what the change touches

- Cosmetic-only edits (theme, density, time format): Save is immediate, panel closes, brief "Saved" toast.
- If any edit touches tasks or reminders (day hours, reminder lead time, rollover of unfinished tasks, calendar sync, data folder), Save turns the footer into an inline Review step listing effects computed from the user's real data:
  - "Reminders 10 → 15 min before. 9 upcoming reminders reschedule; 1 is already inside the new window and fires now."
  - "Unfinished tasks now roll over to tomorrow. 4 open tasks from yesterday: Roll over now / Start from tomorrow." The non-destructive option is the default.
  - "Day shrinks to 8:00–18:00. 2 Thursday tasks fall outside; they stay put, flagged."
- The confirm button names the result: "Save and reschedule 9 reminders". Enter confirms; Esc steps back to the form (edits intact) before it ever closes the panel.
- After confirm: write, apply, toast with Undo covering reversible effects (reminders, hours). Irreversible ones are labelled as such and off by default.
- Failure: an effect that can't apply (sync sign-in failed, data folder not writable) blocks only that setting, shown in the review as "Not saved: reason"; the rest commit.
- Trade-off: most trustworthy for an app that holds the user's plans; prevents "where did my tasks go". Costs an impact calculator per consequential setting, and feels heavy if too many settings are tagged consequential. Keep that list to about six.

### Control 5
**1. Commit and return**
Settings are a detour from planning. Save ends the detour and proves it worked by changing the planner, not by announcing it.

On save:
1. Validate first. A bad value (day ends before it starts) focuses that field with an inline message. The panel stays and nothing is written.
2. Write all changes as one all-or-nothing step.
3. The panel closes in about 150 ms. Focus returns to whatever opened it.
4. The planner reflects the change over about 250 ms (theme cross-fades, week start reflows columns, the working-hours band shifts). The affected region gets one soft highlight that fades in about 1 s.
5. One quiet line at the window's bottom edge: "Saved: week starts Monday, reminders 5 min before. Undo". It names two changes, then "+N more". It lasts 6 s and pauses on hover. Undo or Ctrl+Z restores the old values as one step. Changes the planner can't show (sound, hotkey) get named here.

Edges:
- The primary button reads "Close" until something changes, then "Save", so it is never a dead button.
- Shrinking working hours past a block already on today's plan never hides the block. It stays, styled as outside hours, and the line says so.
- Relaunch-only settings are tagged before saving. The line offers "Relaunch now" instead of a dialog.

Cost: least ceremony, but no tweak-and-look loop. Reopening returns to the same section and scroll position to soften that.

**2. Preview live, keep on save**
Most planner settings are visible ones. Let people watch the result while choosing, and make Save only the decision to keep it.

Setup: a non-modal side drawer with the planner visible beside it. Theme, week start, hours, density and time format preview as they change. Each unsaved row carries a small accent dot. The footer shows "3 unsaved changes" with "Revert all". Settings that can't preview (launch at login, hotkey) are labelled "Applies on save", so Save holds no surprises.

On save:
1. Dots fade over about 150 ms. The footer switches to "All saved, 10:42". Save rests as a disabled "Saved" with a check icon. The button is the confirmation, so no toast.
2. The panel stays open. Focus stays on the last control touched, so keyboard flow continues.
3. Leaving with unsaved changes (Esc, click away): no "Discard changes?" dialog. The preview reverts and a line offers "Discarded 3 changes. Restore" for 6 s. Restore brings them back as unsaved previews.

Failure: if the write fails (read-only disk, locked file), the preview stays active for the session and the dots stay. The footer shows a persistent error: "Couldn't save. Changes are active but not saved. Retry". Nothing visible is yanked away mid-plan.

Cost: feels most direct and is hard to regret. Needs a draft layer over saved settings that reverts cleanly, and a firm split between previewable and non-previewable settings.

**3. Report what actually happened**
On a desktop, saving isn't one event. Hotkeys, login items, notification permission, data folders and calendar accounts can each fail on their own. Report per setting and never discard what worked. Closing means it worked. Staying open means look here.

On save:
1. Every changed row resolves inline to one of three states, icon plus one line: Applied, Applies on relaunch, or Needs attention. A "Saving" state shows only if it takes over 200 ms, to avoid flicker.
2. All Applied or relaunch-only: receipts show for about 1.2 s, then the panel closes itself. If anything is relaunch-only, the closing line reads "Saved. Language applies after relaunch. Relaunch now".
3. Any Needs attention: the panel stays, and focus and scroll go to the first problem row. Good rows go quiet. Problem rows keep what the user typed, state the cause, and put the fix in the row: "Ctrl+Alt+P is already in use. Pick another." or "Notifications are blocked in system settings. Open settings."
4. Footer: "2 saved, 1 needs attention". The button becomes "Save 1 remaining". Good rows are already persisted, not rolled back because a sibling failed.

Edge: closing with a row unresolved reverts only that row to its last good value, and the closing line names it.

Cost: most honest, and best when the panel touches the OS or network. Needs a per-row state model and more visual density. Overkill if every setting is a harmless visual one.

In all three: Ctrl+S or Enter saves, Esc cancels, outcomes are announced to screen readers, and animation collapses to instant swaps under reduced-motion.
