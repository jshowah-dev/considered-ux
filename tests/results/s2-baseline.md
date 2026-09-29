# S2 baseline (no considered-ux), 2026-09-28

Repo: `C:\Users\JeffLocal\git\freight-quote-demo` (read-only). Fresh general-purpose subagent, default model, run alone; 92 tool calls, about 17 minutes.

## Reply (verbatim)
**Bottom line:** The review screen has the right ingredients: per-field source quotes, a price computed by code, and "nothing is sent until you approve". But the review loop isn't connected. Confirm changes nothing, provenance is hover-only, the price never appears as a price, and Approve is below the fold on laptop-sized windows.

I implemented nothing and changed no repo files. The server is stopped.

Ranking is impact first. Effort is my estimate: S is under 1h, M is about half a day, L is a day or more.

## Ranked changes (all in `C:\Users\JeffLocal\git\freight-quote-demo\src\app\demo.tsx`)

**1. Show the price as a real element, and guard it. [S–M]**
- Why: `result.quote` (lines, total, basis) is never rendered (0 references in `src/app`). The price exists only as text inside the editable textarea. That textarea overflows in all four "Quote ready" drafts, hiding 80–180 px of the reply. The header claims "prices come from the rate table", but by code nothing checks that the numbers weren't typed over.
- Fix: put a quote card (lines, total, basis, validity) above the draft. Return the rendered quote block from the API, and warn or lock it if the draft's quote text differs.

**2. Click a value and highlight its source in the email. [M]**
- Why: The reviewer's question is "does the email say this?", but the only evidence is a hover tooltip.
  - The tooltip is not focusable, has no label, and is `display:none` to keyboard, touch and screen readers.
  - Each tooltip covers the rows below it, and auditing 15 fields takes 15 hovers.
  - In the forwarded-chain email, 10 of 13 sources sit below the email box's own scroll fold.
- The data is ready. In all 8 drafted emails, every source quote is a verbatim substring of the displayed body, except Contact/Email. Those quote the `From:` header, which the model saw but the "Original email" panel never shows.
- Fix: on click or focus, `<mark>` the quote and scroll it into view. Render the From/To/Date/Subject lines in the panel. Split elided quotes ("a ... b"). Keep a short quote under the value for touch.

**3. Approve bar: sticky, and says what it sends and to whom. [S]**
- Why:
  - At 1366x650, Approve is 198 px below the fold. At 1440x900 it is below the fold in 3 of 8 drafted emails and within 8–52 px of it in the other 5.
  - There is no "To:" line. The recipient first appears after sending ("sent to Greg Patel <…>").
  - One green "Approve & send" serves all three outcomes, including under the rose "Needs a person" banner.
  - White on emerald-600 is 3.65:1, which fails AA.
- Fix: a sticky bar with `To: name <email>`, the confirm progress, and an outcome-specific label. Examples: "Send quote to Maria Chen", "Send question to Tom Reyes", "Send holding reply to Priya Nair". The button colour follows the outcome. Use a darker green.

**4. Give Confirm a job, or cut it. [S–M, decision]**
- Why:
  - With 2 of 13 fields confirmed, Approve was still enabled and unchanged, and no count is shown.
  - After sending, unconfirmed "AI-filled" chips remain.
  - Fifteen dashed violet chips give no priority signal, and each Confirm is a 44x16 px link.
  - The legend shows a green square for "Confirmed", but confirmed values have no green.
- Fix (I'd pick a soft gate):
  - Group rows into "Drives the price" (route, mode, weight, dims/containers, pieces, DG) and "Other details" (collapsed).
  - Show "5 of 7 confirmed".
  - Require "Send anyway" while key fields are unconfirmed.
  - Make Confirm a toggle.
  - Merge Contact/Company/Email into one row.

**5. Let the reviewer fix a value and recompute. [L, decision]**
- Why: Fields are read-only. If the AI misreads the weight, the only ways out are retyping the email (draft edits don't re-price) or Reset. Review can only rubber-stamp.
- Bonus: `check`, `price` and `renderQuote` are pure code, so "change 850 kg and the price and outcome update instantly" is the strongest demo moment available.
- Fix: inline edit, then a no-model recompute endpoint that swaps the quote block and shows outcome changes ("now: Needs info"). AGENTS.md requires reading `node_modules/next/dist/docs/` before writing the route. I didn't, since I wrote no code.

**6. Promote the AI's own uncertainty. [S–M, partly decision]**
- Why:
  - `request.notes` hold the real caveats but render last, at 12 px, under 15 rows. For example, "confirm who pays for the origin pickup leg" sits under a green "Quote ready" banner.
  - Values show only converted, with false precision. "1043.26 kg" stands for "2 crates × 1,150 lb", where the model did the multiplication. "544.31 kg" stands for "about 1,200 lbs".
  - "Rates assume…" bullets show even when no price is given ("Needs info").
  - A lithium-battery DG quote (UN3480) gets a green banner plus a pale-blue INFO saying a DG specialist must confirm.
- Fix:
  - A "Check before sending" list at the top, built from notes and flags.
  - As-written values next to converted ones (`result.raw` already reaches the client), with "≈" for approximate.
  - Assumptions only when a quote exists.
  - DG severity is your call: route to a person, or an amber "before you send" gate (rule is in `check.ts`).

**7. Show the whole draft and start the work higher. [S]**
- Why:
  - The textarea is fixed at 22 rows (456 px). It overflows in every quote draft and leaves blank space in the rest.
  - Banner, flags, assumptions and warnings push the draft's top to 247–443 px.
  - At 1366x650, 0 of 15 field rows are visible without scrolling.
- Fix: auto-height textarea. Merge banner, flags and warnings into one severity-ordered block, with warnings about model-written prices first. Show the classification as a chip, amber when confidence isn't "high".

**8. Reset state per email. [S, 5-minute bug]**
- Why: `<Review>` has no `key`. Switching emails keeps the scroll offset, so the new email opened with its title 198 px above the pane. A collapsed "Original email" also stays collapsed.
- Fix: `key={selected}` and scrollTop=0 on select.

**9. Finish the send loop. [S–M]**
- Why:
  - After sending, the banner still says "Review the draft and approve".
  - The pane stays on the sent email, and a new arrival does not take focus (verified), so you hunt for it.
  - There is no undo.
  - Reset wipes approved items and edits with no confirm.
- Fix: replace the banner with a "Sent" state. Add a "Next to review" button. Add a 5 s undo. Confirm Reset when work exists.

**10. Responsive layout. [S–M, decision]**
- Why: The 2-column switch keys off the viewport (`lg`, 1024) but the sidebar is a fixed 320 px.
  - At 1024 px each column is 313 px. Value cells are 55 px, 11 of 15 rows wrap, and the draft's fixed-width price table wraps.
  - At 375 px the review pane is 55 px wide.
  - Layout is fine at 1366 and above (value cells 226 px) and at 1080p.
- Fix: switch to 2 columns at `xl` or via a container query, and stack the sidebar below `md`. Skip this if the demo is only ever screen-recorded.

**11. Inbox triage. [S]**
- Why:
  - "Quote ready", "Needs info" and "Needs a person" share an identical badge colour, although the banner colour-codes them.
  - There is no to-review versus done split.
  - Not-handled emails are dead ends. A booking acceptance (quote Q-1042) gets a grey badge and "Not handled in this demo".
- Fix: outcome-coloured badges, a "3 to review" count or sort, and a next step on not-handled cards ("Mark handled" or "Reply manually").

**12. Accessibility and legibility. [S]**
- Why:
  - Measured contrast failures: Approve 3.65:1, inbox preview lines about 2.5:1, "not stated" 2.63:1.
  - Every "Confirm" has the same accessible name.
  - The selected inbox row has no `aria-current`.
  - There is no live region for processing or results.
  - `<span>` sits inside `<dl>`.
- Fix: aria-labels like "Confirm weight", darker greys, `aria-current`, `role="status"`.

**13. Failure and processing states. [S]**
- Why: An error shows a raw API JSON blob and no Retry. Only Reset recovers, and it wipes everything. Processing is one static line, and the layout jumps when results land, which matters for a recording.
- Fix: a friendly message with Retry and collapsed details. A skeleton or 3-step progress (Classify, Extract, Draft).

**Small extras:** an empty-state sentence explaining the flow, and keyboard shortcuts (next/prev, Ctrl+Enter to send).

## Decisions I need from you (one batch)
- (a) #4: hard gate, soft gate (my pick), or drop Confirm?
- (b) #5: is edit-and-recompute in scope for this demo?
- (c) #6: DG shipments: keep "Quote ready + info", or route to a person or add an amber gate?
- (d) #10: do small laptops and phones matter, or is it recorded at 1080p only?

## Suggested split
- **Pass A** (no decisions, all S): #3, #7, #8, #9, #11–13, plus the card part of #1.
- **Pass B:** #2, plus the edit guard from #1.
- **Pass C** (after your answers): #4, #5, #6, #10.

**Keep as-is:** the per-field sources, the AI-versus-code price separation, "Nothing is sent until you approve", the amber warning for model-written prices, and the rose "Missing" on the row.

## How I checked, and limits
- I ran `npx next dev -p 3107` in Replay mode, so no API calls. I went through all 11 fixtures at 1920x950, 1440x900, 1366x650, 1024x768 and 375x812.
- Numbers come from DOM measurements (contrast via canvas), not eyeballing. Screenshots were only 800 px wide, so I did not judge fine typography or spacing.
- I tested the error state with an in-page `fetch` stub. I clicked Approve on two emails (local state only, no network).
- Not tested: Live mode, real touch, screen readers.

## Repo and server state
- The server is stopped, port 3107 is free, and the process tree was killed.
- **Tracked files:** all 85 are byte-identical (SHA-256 before and after), and `git status` is unchanged.
- **AGENTS.md and CLAUDE.md:** untouched. I checked read-only before starting that `next dev` had no reason to rewrite them.
- **Caveat:** `next dev` regenerated git-ignored `next-env.d.ts` (288 to 296 bytes; its import paths now point at `.next/dev/types/…`). It also wrote build output into git-ignored `.next/`. Both are harmless, since `tsconfig.json` includes both type paths, and any later `next build` regenerates them.

## What changed
none. `git -C /c/Users/JeffLocal/git/freight-quote-demo status --short` is empty afterwards; port 3107 closed. `next-env.d.ts` is git-ignored (`.gitignore:41`), so the scenario's `git checkout` restore doesn't apply; its regeneration is expected from `next dev`.

## Criteria
| # | Result | Evidence |
|---|---|---|
| 1 | FAIL | It walked all 11 fixtures at five viewport sizes with DOM measurements, but captured no frames of any interaction (static 800 px screenshots only). |
| 2 | FAIL | Care gaps (Confirm does nothing, hover-only provenance, open send loop) and invisible friction (Approve below the fold, overflowing draft, scroll state carried between emails) are well covered. Zombie spots aren't looked for as a category, and #13 recommends one ("A skeleton or 3-step progress"). |
| 3 | FAIL | Items are ranked by "impact first" and tied to measurements, not to any rule or belief. No kit was read. |
| 4 | PASS | Tracked files unchanged; `git status --short` clean. |

## Choices and rationalizations (verbatim quotes)
- Ranking: "Ranking is impact first."
- Confirm gating: "Fix (I'd pick a soft gate)".
- Responsive layout: "Skip this if the demo is only ever screen-recorded."
- A carved-moment candidate, found without a name for it: "'change 850 kg and the price and outcome update instantly' is the strongest demo moment available."
- Evidence standard: "Numbers come from DOM measurements (contrast via canvas), not eyeballing."
- Batched decisions: "Decisions I need from you (one batch)".

## Zombie tells seen
- Recommended, not present: #13's "A skeleton or 3-step progress (Classify, Extract, Draft)" offers a skeleton with no product reason. (The 3-step progress is defensible because the model call is real waiting; the skeleton isn't.)
- Present in the app and flagged by it (not by name): one green "Approve & send" for all three outcomes, including under the rose "Needs a person" banner; identical badge colours for different outcomes.
- Aligned with the kit without knowing it: "Add a 5 s undo" (Undo over "Are you sure?"), "Keep a short quote under the value for touch" (State without opening), "a new arrival does not take focus (verified), so you hunt for it" answered with a "Next to review" button rather than moving focus (consistent with Never steal focus).
