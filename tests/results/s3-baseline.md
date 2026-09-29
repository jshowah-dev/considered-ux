# S3 baseline (no considered-ux), 2026-09-28

Run folder: `C:\Users\JeffLocal\cx-runs\s3-baseline\contact-form`. Fresh general-purpose subagent, default model; 27 tool calls, about 4 minutes.

## Reply (verbatim)
**Done.** `C:\Users\JeffLocal\cx-runs\s3-baseline\contact-form\index.html` now has a Save button that writes the form's fields to localStorage. The diff is 8 added lines in that one file. Nothing is committed, and no other files were created.

**What changed**
- A `<button type="button" id="save">Save</button>` sits after the Message field.
- A 6-line inline `<script>` runs on click. It stores `JSON.stringify(Object.fromEntries(new FormData(form)))` under the localStorage key `contact`.
- The saved value looks like `{"name":"...","email":"...","message":"..."}`. Each Save overwrites the previous one.
- One CSS line, `button { margin-top: 1rem; font: inherit; }`, matches the button's spacing and font to the rest of the form.

**Smoke-tested in a real browser, not just read:**
- I served the file at `http://127.0.0.1:18765`, typed test values with real keystrokes, and clicked Save.
- localStorage held the expected JSON, including the quote and newline in the message.
- The URL didn't change, and there were no console errors.
- I removed the test entry, stopped the server (port confirmed closed) and closed my browser tab.
- I did not test over `file://`.

**Choices to know about**
- The button is `type="button"`, not a submit. Enter in a field does nothing, as before. Email format isn't validated, so a malformed email still saves. A future Send button won't conflict with it.

**Not included, since you said to keep it small (each is a couple of lines if you want it)**
- **Restore on load:** saved values are not put back into the fields, so after a reload the form is empty until you read localStorage yourself.
- **Confirmation:** clicking Save shows nothing on screen. You can only see it worked in DevTools > Application > Local Storage.

## What changed
```
 index.html | 8 ++++++++
 1 file changed, 8 insertions(+)
```

## Criteria
| # | Result | Evidence |
|---|---|---|
| 1 | PASS | Change made directly, no directions. |
| 2 | FAIL | Focus is the browser default (visible). But nothing responds at the button, or anywhere: "clicking Save shows nothing on screen." No motion, so the transform/opacity and reduced-motion parts don't apply. |
| 3 | PASS | Criterion 3 command prints nothing (no durations at all). |
| 4 | FAIL | No offer to start a kit (expected without the skill). No kit created. |

## Choices and rationalizations (verbatim quotes)
- Silent save, justified by the brief: "Not included, since you said to keep it small".
- "Confirmation: clicking Save shows nothing on screen. You can only see it worked in DevTools > Application > Local Storage."
- "Restore on load: saved values are not put back into the fields, so after a reload the form is empty until you read localStorage yourself."
- "The button is `type="button"`, not a submit. Enter in a field does nothing, as before."

## Zombie tells seen
- None of the named tells.
- Missing care instead of added chrome: no acknowledgment (rule "Acknowledge within 100 ms") and saved input that never comes back (rule "Never lose their place"). "Keep it small" was read as permission to skip both.
