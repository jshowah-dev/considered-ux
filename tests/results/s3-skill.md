# S3 with considered-ux, 2026-09-28

Run folder: `C:\Users\JeffLocal\cx-runs\s3-skill\contact-form`. Fresh general-purpose subagent, default model, prompt identical to the baseline (no mention of the skill); 15 tool calls, about 4 minutes.

**Triggered on its own:** the transcript's third tool call is `Skill {"skill":"considered-ux"}`, followed by `kit.mjs --family-for contact-form` (→ `null`).

## Reply (verbatim)
Added a Save button to `C:\Users\JeffLocal\cx-runs\s3-skill\contact-form\index.html`. It's smoke-tested in headless Chromium, and the change is uncommitted (16 lines added, one file).

**What it does**
- Clicking **Save** writes `{name, email, message}` as JSON to `localStorage['contact-form']`.
- An inline "Saved" appears next to the button. It clears as soon as any field is edited, so it never claims saved when the form has changed.
- The button is `type="button"`, so Enter in a field does nothing and can't submit the form and put the data in the URL.
- The button gets `font: inherit` so it matches the 16px fields.

**Assumption to check:** I also restore saved values on page load (lines 28-29). Without that, a Save looks broken after a reload. Delete those two lines if you wanted write-only.

**Verified (Playwright, `file://`, all assertions passed; there is no build step)**
- Save stores exactly the three fields, and "Saved" shows immediately.
- Editing a field clears "Saved" and leaves the stored copy unchanged.
- Reload restores the fields, and keys other than the three field names are ignored.
- Tab reaches the button with a visible focus ring, and Enter on it saves.
- No console errors on the normal path.
- A screenshot showed the button and "Saved" laid out correctly.

**Not covered:** corrupt JSON in storage logs one console error on load, but Save still works. Blocked or full storage isn't handled, which I left out to keep it small.

**UX skill (considered-ux)**
- I treated this as a small edit (its "Touch" size). `kit.mjs --family-for contact-form` returned `null`, so I applied only its baseline rules, with no design directions and no recorded frames.
- Feedback is inline, not a corner toast.
- There is no motion, so nothing changes under reduced motion.
- Focus ring and text contrast are the browser and page defaults.
- No colors or fonts were added.
- **Offer:** no kit covers this repo, so say the word and I'll start one for it.

The smoke test is a throwaway at `C:\Users\JEFFLO~1\AppData\Local\Temp\claude\C--\de2c014b-7a20-496a-9926-072f23d0f913\scratchpad\smoke.mjs`, not in the repo.

## What changed
```
 index.html | 16 ++++++++++++++++
 1 file changed, 16 insertions(+)
```
An inline `<span role="status">` beside the button says "Saved" on click and clears on the next input; saved values are restored on load.

## Criteria
| # | Result | Evidence |
|---|---|---|
| 1 | PASS | Sized as Touch; no directions; change made directly. |
| 2 | PASS | "Saved" appears beside the button on click (synchronous, well inside 100 ms), announced through `role="status"`; default focus ring verified by keyboard in its smoke test; no motion. |
| 3 | PASS | Criterion 3 command prints nothing. |
| 4 | PASS | "no kit covers this repo, so say the word and I'll start one for it." `kits/` in the skill repo is unchanged. |

**Score: 4/4 (baseline 2/4).**

## Choices and rationalizations (verbatim quotes)
- Acknowledgment: "An inline 'Saved' appears next to the button. It clears as soon as any field is edited, so it never claims saved when the form has changed."
- Restore on load, flagged as an assumption: "Without that, a Save looks broken after a reload."
- Placement: "Feedback is inline, not a corner toast."
- Scope held: "Blocked or full storage isn't handled, which I left out to keep it small."

## Zombie tells seen
- None.

## Against the baseline
The baseline read "keep it small" as permission for a silent save that loses the data on reload. This run kept it small (16 lines) and still answered at the button and brought the input back.
