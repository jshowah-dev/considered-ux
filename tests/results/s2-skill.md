# S2 with considered-ux, 2026-09-29

Repo: `C:\Users\JeffLocal\git\freight-quote-demo` (read-only). Fresh general-purpose subagent, default model, prompt identical to the baseline (no mention of the skill); 79 tool calls, about 27 minutes. Ran alongside the S1 critic only (no other dev server).

**Triggered on its own:** the transcript's first tool call is `Skill {"skill":"considered-ux"}`.

Evidence copied out of the AppData scratchpad (which Jeff can't see) to `C:\Users\JeffLocal\cx-runs\s2-skill\frames\` and `...\evidence\`.

## Reply (verbatim)
**Audit done. No files in freight-quote-demo were changed** (SHA-1 of all 87 non-ignored files identical before/after, `git status` clean; `next dev` only wrote to the gitignored `.next/`). Dev server stopped, port 3107 free, only my own PIDs killed.

Kit: family `jeff`, dial `moment`, ledger empty. Beliefs: (1) feel thought about, (2) your attention belongs to you, (3) nothing you do is lost or ignored. The product line (serve the customer, trust and security) was already on file, so no belief interview.

Ranked by what the reviewer loses (time, doubt, lost work). Frames base: `C:\Users\JEFFLO~1\AppData\Local\Temp\claude\C--\de2c014b-7a20-496a-9926-072f23d0f913\scratchpad`. F1-F8 are `frames\F#-*\strip.png`, each with a `-reduced` twin. F1 is Simulate mail, F2 hover source, F3 Confirm, F4 Confirm all, F5 Approve, F6 select another email while scrolled, F7 Reset, F8 mail arrives while reviewing. Stills are `evidence\<name>.png`. Code is `C:\Users\JeffLocal\git\freight-quote-demo\src\app\demo.tsx`.

| # | Change | Why (measured) | Kind, rule/belief, frame |
|---|---|---|---|
| 1 | **Make Approve a decision you can see all of.** Bottom-pinned bar: To, outcome + total, "N unconfirmed", and a button named for what goes out ("Send quote $4,055 to Maria", "Send holding reply"). Auto-grow the draft. Undo-send instead of a modal. | The recipient appears only after sending. Approve is below the fold for 8/8 drafts at 1536x730, 1366x650 and 1280x720 (3/8 at 1440x900), and takes 22 Tab stops. The 22-row textarea hides the tail of 4/8 drafts (60-160 px). One label covers a quote, an info request, a holding reply, and a DG quote whose flag says a specialist must confirm first. Send is irreversible with no undo (:369, :381). | care gap. Undo over "Are you sure?", Belief 1 + trust line. F5, `holding-reply-approved-row-says-Sent`, `e07-forwarded-draft-tail-hidden-tall` |
| 2 | **Provenance on focus, tap and hover, located in the email.** A value highlights and scrolls its phrase in Original email. Converted or inferred values keep a visible "from '1,200 lbs total'". | The source is a CSS-only tooltip on non-focusable chips, so there is no keyboard or touch path. It appears instantly, covers the next two rows, and is cut off at the pane edge on the last rows (913 vs 900 px). Converted values read as copies: 1,200 lb becomes 544.31 kg, "Thursday" becomes 2026-09-24, 48x40x60 in becomes 121.92x101.6x152.4 cm. The source sits in a 320 px nested scroller clipped mid-line (:224, :280). | care gap + invisible friction. Preview on approach (built halfway), Belief 2. F2, `hover-tooltip-clipped-last-row`. Strongest carved-moment candidate. |
| 3 | **Let the reviewer correct, not only confirm.** Edit a value or a "Missing" row, then re-run check, price and draft. | Values are read-only and "Missing" has no input. The only fix is hand-editing the draft, and outcome, flags and price never recompute. Scope call, see Decisions. | care gap. Belief 3. `e05-needs-info-four-flags-tall` |
| 4 | **Make the queue scannable and honest.** Outcome-coloured pills matching the banners. Row line = "Air, Shenzhen to Chicago, $4,055". After send show "Holding reply sent, needs you" or "Waiting on customer" instead of "Sent". Add a header count and a "Next" beside the sent notice. | All three outcomes share `bg-sky-100 text-sky-800` (:170) while the pane banners are emerald/amber/rose. Approving a holding reply, an info request and a DG quote each flips the row to "Sent" (verified). The multi-leg email's open work leaves the list while its banner still says "Needs a person". Rows preview the greeting ("Hi team, Please quote...") rather than what the app now knows. | invisible friction + care gap. State without opening, Beliefs 2 and 3. `queue-all-outcomes-same-pill`, `holding-reply-approved-row-says-Sent` |
| 5 | **Lead with outcome and number.** Header shows outcome + total (or what's missing). Quote is its own block with its basis. Classification becomes a chip. A flag that changes what "ready" means beats green. | The line under the title is the model's rationale (all 11 recordings say "high"). The banner is one sentence for every quote. `quote.total` and `basis` are never rendered, so the number exists only as text inside the 12 px monospace textarea. The DG "specialist must confirm" strip is pale blue under a green "ready" banner. | zombie spot + invisible friction. Belief 1. `e03-dg-quote-green-banner-tall` |
| 6 | **Tie flags, gaps and AI notes to their rows.** A "Needs you" group on top (missing, flagged, noted, converted). Flag and row link both ways. AI notes attach to the field. Hide quote-only assumptions when there is no quote. | The same fact appears twice, unlinked (e05: 4 CRITICAL bars + 4 "Missing"). A critical flag on a present value is fetched, then dropped (:235, :266). "Routing: Multi-leg" is row 17 of 17, and e08's no-rate flag maps to no row. The AI's own doubts are 12 px at the bottom of the card (y=1040 on a 900 px screen). "Rates valid 14 days" shows on emails with no price. | invisible friction. State without opening, Belief 2. `e04-needs-a-person-routing-row-last-tall`, `e02-needs-info-ai-notes-at-bottom-tall` |
| 7 | **Give Confirm a meaning and a count.** "9 of 15 confirmed" on the card, the send bar and the queue row. Whole-row toggle. Un-confirm. | Approve works with 0/15 confirmed (verified on three items). There is no count anywhere. "Confirm all" is a header-level rubber stamp, there is no un-confirm, and 15 links are all named "Confirm" and 16 px tall. The legend's green "Confirmed by you" swatch matches nothing in the rows (:252). | invisible friction. State without opening, Undo over "Are you sure?", Belief 3. F3, F4, `confirm-all-legend-swatch-matches-nothing` |
| 8 | **Keep the work.** Persist the session (guarded sessionStorage). Reset gets an inline "Cleared 2 emails. Undo" beside the button. | Reload gives 0 rows (verified). Reset sits next to the primary button and wipes approved work with no confirmation or undo. All state is `useState`. | care gap. Never lose their place, Undo over "Are you sure?", Belief 3. F7 |
| 9 | **Errors that fix.** "Couldn't reach the model. Nothing was sent. [Try again]" on the pane and the row. | It shows `Processing failed: Error: 529 {"type":"overloaded_error"...}`. There is no retry: "Simulate incoming mail" moves to the next fixture and the `delivered` guard blocks reprocessing (:52). The only recovery is Reset, which wipes everything (#8). | care gap. Errors fix, at the field. `error-state-raw-json-no-retry` |
| 10 | **Open each email at its top.** Reset scroll on select and remember it per email. Insert new rows without displacing the selected one. | `main` is one scroller and `Review` has no key (:127). Scroll persists across selection (200 stays 200), so email B opens mid-page with title, outcome and flags off-screen. Arrivals push the row under review down 82 px with no cue. | invisible friction. Never lose their place, Motion explains cause. F6, F8 |
| 11 | **Floor fixes (cheap, ride along with any pick).** | Contrast: Approve label 3.65:1 (hover 2.47), "not stated" 2.63, inbox preview 2.47, from/date 4.35, Processing pill 4.35 at rest, AI-filled dashed border 2.85 (the only "unconfirmed" cue). Semantics: 15 buttons all named "Confirm", no live region for Processing to result, no `aria-current`, 15 non-dt/dd children in `<dl>`. The pulse ignores reduced motion. Passing: acknowledgement 7-30 ms, visible focus ring, everything but provenance keyboard-reachable. | care gap. Floor (AA, reduced motion), Belief 1. F1 normal + reduced |
| 12 | **Show the real steps while it works. Give dead ends an action.** Reveal in pipeline order (AI classifies, AI extracts, code prices, AI drafts). Not-handled emails get "Not a rate request. Nothing drafted. [Leave for later]". Sent items drop the "Review the draft and approve" banner. The empty state offers the button. | Processing is one static line, a pulsing pill and an empty right half, then everything pops in at once. This is the moment the 1.5 s replay pause stages for the recording. Not-handled (3/11) says "Not handled in this demo..." with nothing to do. "Route to pricing" has no route action. The green banner still says "Review the draft and approve" after sending (:34, :200). | zombie spot. Answer where they acted; tells: spinner where real steps are known, "nothing here" with no action. F1, `after-approve-stale-banner`. Second carved-moment candidate. |
| 13 | **Small screens (scope).** | At 1100/1024 px, 5 and 10 chips wrap, 1-3 "Confirm" links run past the card padding, and Approve wraps to two lines. At 390 px the review pane is 70 px wide. | care gap. Belief 1. `resp-1024x768-fields-card-breaks` |

**Cut** (nothing above depends on these):
- the classification sentence (becomes a chip);
- quote-only assumptions on non-quote outcomes;
- the legend line;
- the repeated CRITICAL/INFO tags;
- the 15 Confirm links, if a row toggle lands;
- "Select an email to review." beside an empty list;
- the duplicate Missing/CRITICAL statements.

**Already right, don't regress:**
- 7-30 ms acknowledgement at the control;
- arrivals never steal selection or focus;
- edits and confirmations survive switching emails;
- Approve answers in place;
- "AI wrote the text, prices come from the rate table" is honest;
- the dashed-violet AI-filled treatment is this product's own idea (fix contrast and legend, keep it).

**Decisions I need from you (one batch):**
1. May reviewers correct extracted fields (re-run check, price and draft), or is the demo accept-only on purpose?
2. Does Confirm gate Approve (hard, soft warning, bookkeeping only)? Does a DG quote need an explicit acknowledgement before send?
3. After a holding reply or info request goes out, what should the row become ("Waiting on customer", "Needs you")?
4. Dial is `moment` and the ledger is empty. Does the review screen host the app's one carved moment? Two candidates: locate-the-source (#2) or the staged pipeline reveal (#12). I have not designed directions, since the skill's loop starts when you pick.
5. Must it work below about 1100 px?
6. Which items go into the loop? I'd start with 1, 2, 4, 5, with 11 riding along. Before any edit, AGENTS.md says to read `node_modules/next/dist/docs` (Next 16.3.6).

**How I checked, and the limits.**
- I walked all 11 fixtures in headless Chromium (Playwright 1.63) against `next dev` in replay mode. That is a smoke test, not a build check.
- Not covered: live-model mode (would call the API), Firefox/Safari, touch, screen readers. The 730/650/720 px viewport heights are my stand-ins for common laptop windows. Stills show the Next dev-tools badge (dev only).
- `frames.mjs` starts every capture from a cold load with a frozen clock, so it reached only F1, and only the Processing state. F2-F8 need a pre-state, so I drove Playwright directly and reused the skill's `composeStrip`.
- I opened F1-F8. The reduced-motion twins are pixel-identical to the normal ones, so reduced motion changes nothing. The only animation in the whole journey is the Processing pulse, and everything else is a hard cut.
- The zombie critic was not run, because I am a subagent and cannot dispatch one. The payload and prompt are at `C:\Users\JEFFLO~1\AppData\Local\Temp\claude\C--\de2c014b-7a20-496a-9926-072f23d0f913\scratchpad\frames\critic-request.md`. Run it with a fresh sonnet subagent if you want the second opinion.

## What changed
none. `git -C /c/Users/JeffLocal/git/freight-quote-demo status --short` is empty afterwards; port 3107 closed.

## Criteria
| # | Result | Evidence |
|---|---|---|
| 1 | PASS | The journey walked all 11 fixtures; eight key interactions recorded as strips F1–F8, each with a reduced-motion twin, named in the reply. I opened F2 (the source tooltip covering the rows below it) and F5 (Approve). |
| 2 | PASS | The "Kind" column covers all three: care gaps (#1, 3, 8, 9, 13), zombie spots (#5, #12) and invisible friction (#2, 4, 6, 7, 10). |
| 3 | PASS | Every one of the 13 items names a kit rule or belief (and the product's trust line where it applies). |
| 4 | PASS | `git status --short` clean; the run also hashed all 87 non-ignored files before and after. |

**Score: 4/4 (baseline 1/4).**

## Choices and rationalizations (verbatim quotes)
- Ranking: "Ranked by what the reviewer loses (time, doubt, lost work)."
- Beliefs: "The product line (serve the customer, trust and security) was already on file, so no belief interview."
- Dial: "Dial is `moment` and the ledger is empty. Does the review screen host the app's one carved moment? … I have not designed directions, since the skill's loop starts when you pick."
- Kept the product's own idea: "the dashed-violet AI-filled treatment is this product's own idea (fix contrast and legend, keep it)."

## Zombie tells seen
- None recommended. It names two in the app (#5: the model's rationale line and a green banner overriding a DG flag; #12: a pulse-only processing state and "nothing here" dead ends) and prescribes the real pipeline steps instead of a skeleton.

## Against the baseline
Same depth of measurement as the baseline (contrast, fold positions, verified behaviours), plus what the baseline lacked: interaction frames, zombie spots named as such, and every item tied to a rule or belief. It also found things the baseline didn't (nothing at the Approve button ties the reply to its recipient; reload loses all work; a critical flag fetched and then dropped; after the critic round, an edited price that raises no flag while the header still says "prices come from the rate table").

## Tool gap found (not a criterion failure)
`frames.mjs` always starts from a cold page load, so it can't record an interaction that needs a prior state (hover a value on an already-processed email, approve after scrolling). The run worked around it by driving Playwright directly and reusing `composeStrip`. A `--setup <js>` (or steps) option would close this; it's a new feature, so it's left as an open item for Jeff rather than added in REFACTOR.

## Zombie critic (both sides)
The run wrote `critic-request.md` (payload only). A fresh sonnet subagent ran it and read all 18 strips. Its verdict: "no full zombie tell. Nothing animates except one pulse; every change is a hard cut by the first 50 ms sample. Copy and provenance are product-specific. The misses are care gaps: undo, an irreversible send, one raw error, scroll carry-over, stock status styling." The findings went back to the run with SendMessage. Its resolution (verbatim):

| Critic finding | Resolution |
|---|---|
| Tells: none; `transition: all` unjudgeable | Agrees with my audit: the only motion is the pulse. `transition` can be judged. There is none in demo.tsx, and the computed value on buttons is the initial `all 0s`. Not an issue. |
| 1a Pulse names no step; steps are one static line | Covered by #13. Changed: added the critic's fallback. `/api/process` is one POST that returns the final result, so stages aren't reported today. Either stream stage events and tick them in place, or keep one static honest line and drop the pulse. New frame F9: Processing frames differ only by the pulse, and the result lands as one hard cut between the 1503 and 1663 ms samples. |
| 1b Pulse ignores reduced motion ("assuming it was on") | Covered by #12. Verified it was on: `matchMedia('(prefers-reduced-motion: reduce)').matches` is true in that context and the pulse is `running`. `.animate-pulse` sits only in `@layer`, with no media query, so it needs `motion-safe:`. |
| 1c "Select an email to review." | Covered by the Cut list and #13. Changed: the critic is right that the sidebar line is the right kind. I dropped my "put a button there" as polish. The main pane says nothing or names the action. |
| 1d / 2.4 Raw error | Covered by #10. Changed: the row pill names the state ("Retry") instead of "Error". Copy says what didn't happen ("this email hasn't been read; nothing was sent"). New frame F10: the error lands by 70 ms and never changes. |
| 2.1 Reset | Covered by #9. Changed: the undo copy names the loss ("Cleared 2 emails, 1 sent reply. Undo"). It restores the queue, not the send, and sits inline beside Reset. The critic saw no toasts; keep it that way. |
| 2.2 Approve: no To line, nothing confirmed | Covered by #1 and #8. **Correction to my earlier report:** I wrote that the recipient appears only after sending. The sender's address is in the pane header, but the draft panel has no To line and nothing at the button ties the reply to it. #1 is reworded. Added to #8: the sent notice records "sent with 0 of 15 confirmed". |
| 2.3 No undo for Confirm / Confirm all | Covered by #8. Changed: undo in place ("Confirmed 15. Undo" at the header; a single Confirm toggles back). |
| 2.5 Scroll carry-over | Covered by #11. Verified the half the critic couldn't: email 1 scrolled to 250 px, email 2 opened at 246 (clamped), and returning to email 1 showed 0, not its 250. One shared scroller holds only the last value. |
| 2.6 No count; identical pills | Covered by #8 (count) and #4 (pills). "Needs a person" was unchecked, and I verified it: all three review outcomes render #dff2fe/#00598a. |
| 2.7 Row insertion shifts the selected row | Covered by #11. Changed one detail: "open from zero height" animates height, which breaks the floor (transform and opacity only). Use a transform-only FLIP on the displaced rows, or insert without displacing the selected one. |
| 3a Stock palette; green means to-do and done | Changed #4 (adds kind: zombie spot). Verified, with one nuance: it isn't literally one banner. The to-do banner and the done notice are the same #ecfdf5/#004f3b, and the to-do banner still reads "Review the draft and approve" after sending. Green is also the Approve button and Confirmed, while the list's "Quote ready" pill is sky. Neither repo nor kit defines colour tokens, so the build step must first offer 2-3 palette options (ui-ux-pro-max). |
| 3b "Processing…" / "Error" as labels | Covered by #4 (pill vocabulary: what the row needs from you) and #10 ("Retry"). |
| 3c CRITICAL tag | Adopted in #7: the consequence wording replaces the tag ("Blocks the quote: piece dimensions are missing"). My Cut list only said drop it. |
| a Quote block wraps; email splits at the hyphen | New evidence in #5. At a 1280 px viewport every priced quote line wraps in the textarea (e01 4/4, e03 3/3, e07 4/4); none at 1366 px or wider. The email chip split goes to #14. |
| b Price lines are editable text | New #6. Verified: Total 4,055.00 edited to 3,055.00 with lines still summing 4,055.00 raised no warning, and the header still says "prices come from the rate table". |
| c Hover preview covers the next row | Covered by #2. Added that the replacement must not cover it: at 1280 the 288 px popover spans the whole next row, including its Confirm link. |
| d Replay chip unexplained | Added to #12. Verified: it is a non-focusable `<span>` whose only explanation is a hover-only `title`. Visually it sits beside the title, not with the buttons (the critic read text order). Question added to Decisions (Q8). |
| e Not handled | Covered by #13. |
| Evidence limits | Filled: F9 results land, F10 error, F11 approve on Needs a person, F12 select not-handled. Needs info is in F6. Reduced-motion twins are pixel-identical for every strip. The "N" badge is the dev indicator (agreed). |
| Checked and holding | Matches my "already right" list. No change. |

Net change to the ranked list: one new item, #6 "Keep 'prices come from the rate table' true after edits" (care gap, trust line); six items reworded with the critic's detail; nothing reordered; the critic's height-animation suggestion overruled because it breaks the floor. Two decisions added for Jeff: whether a reviewer may override a computed price (Q7), and how to word the staged 1.5 s "Processing…" in Replay (Q8). The repo stayed unchanged through the second look (`git status` clean, 87 files byte-identical, port 3107 closed). New frames F9–F12 and the checks log are copied to `cx-runs\s2-skill\`.

The critic round didn't change any criterion; the score stays 4/4.
