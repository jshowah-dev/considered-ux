# Micro-test A: the beliefs gate, 2026-09-28

Single-shot general-purpose subagents, default model, no file edits. 5 guided + 5 control, all dispatched in parallel.

## Prompts
Guided:
> Read C:\Users\JeffLocal\.claude\skills\considered-ux\SKILL.md and whichever files it points to that you need, then act on this request as the skill directs. Request: "I'm starting a small web app for home-care nurses to track their visit tasks. There's no design kit for it yet. Design what happens when a nurse marks a task complete." Reply only with your first message to the requester. Don't create or edit files.

Control (the plan's prompt plus the last sentence; ruling in the build ledger: with the skill now discoverable, a control could load it and stop being a control):
> Act on this request. Request: "I'm starting a small web app for home-care nurses to track their visit tasks. Design what happens when a nurse marks a task complete." Reply only with your first message to the requester. Don't create or edit files. Don't use any tools or skills.

## Scores
(a) asks what we believe (about the users, what they should feel, what we'd never do) before proposing anything. (b) proposes a design anyway.

| Run | (a) | (b) | Pass |
|---|---|---|---|
| Guided 1 | yes | no | yes |
| Guided 2 | yes | no | yes |
| Guided 3 | yes | no | yes |
| Guided 4 | yes | no | yes |
| Guided 5 | yes | no | yes |
| Control 1 | no (asks product requirements) | yes ("Fixed either way: …" plus defaults) | — |
| Control 2 | no | yes ("Draft flow (defaults)") | — |
| Control 3 | no | yes ("Default design") | — |
| Control 4 | no | yes ("Default: tap to complete") | — |
| Control 5 | no | yes ("Default design") | — |

**Result: PASS.** 5 of 5 guided replies ask the belief questions and propose nothing; 5 of 5 controls design first. The failure the gate fixes is real.

Notes:
- Two controls answer the user's own action with a corner-style "Undo toast" (C3 "A 10-second Undo toast appears", C5 "An Undo toast stays up for about 10 seconds").
- Guided 5 offers to "draft 3–5" beliefs; kits allow 1–3. Not a gate failure; watch for it in later runs.
- Guided 1, 2 and 5 flag that mark-complete is the most repeated action, so a showy moment there would replay all shift. That's the dial logic working.

## Replies (verbatim)

### Guided 1
No kit covers this app yet (the only one on disk is `jeff`, and this isn't in it), so I'm holding off on any design until we've settled what we believe. One batch of questions; a sentence each is plenty.

**Beliefs** (I'll shape your answers into 1-3 for you to confirm; I won't invent them)
1. What do we believe about the home-care nurses using this?
2. What should they feel afterward?
3. What would we never do to them?
4. One line on what this app itself cares about (it goes under Products).

**Kit setup**
5. Repo folder name, and stack if you've picked one? I'll reuse the folder name as the kit's family name and assume a personal repo, where I can write a motion-tokens file. Say so if it's a team or work codebase, or if it should join the `jeff` family instead.
6. Dial: `restrained` (quiet, 2 directions), `moment` (one hand-carved moment for the whole app, 3 directions, one weird) or `full` (one per feature). I'd start at `moment`. Under `moment` the whole app gets one, and none is spent yet. Should marking a task complete be it? It's the most repeated action in the app, so anything showy there replays many times a shift.

**Two things that change the design**
7. What does "complete" touch? Just a tap on a checklist, or do some tasks need a value or note first? Can the nurse take it back afterward, or does it write to a record or audit trail, or notify anyone? That decides undo versus a confirmation that names the consequence.
8. I'm assuming phone-first, one hand, mid-visit with the patient in the room, patchy signal. Correct me if it's a tablet or a desk-side charting screen.

Once 1-4 are confirmed I'll draft the kit (house rules seeded from `jeff` for you to keep or cut), then ground the moment and bring directions.

### Guided 2
No directions yet. This is a Feature-size job and no kit covers this app (nothing under ~/git, no README to draft from), so beliefs come first: every choice I bring has to trace back to one.

One reply covers it:

1. **Repo folder name and family.** Join `jeff` (the shared kit behind murmur, daily-planner and two more), or start a new family? If `jeff`, skip 2.
2. **Beliefs, a sentence each.** What do we believe about home-care nurses using this? What should they feel afterward? What would we never do to them? Or paste a pitch or notes and I'll draft them for you to confirm.
3. **The app in one line.** It goes under Products in the kit.
4. **Dial.** Starting at `moment` (or say `restrained` or `full`): one hand-carved moment for the whole app, three directions with one weird, no sound. Does marking complete host it? Nurses will do it many times a shift, so the alternative is to keep it quiet and put the carved moment somewhere rarer.
5. **What complete means.** Can a nurse un-complete freely, or does completing write a timestamped care record that has to be amended instead? Is it ever more than a tap (a reading, a note, a signature)?

I'm assuming a phone, one hand, in a patient's home, patchy signal. Say if that's wrong.

Next I draft the kit for one confirm (a new family gets rules seeded from `jeff`, yours to keep or cut), then bring the directions. No colors or type exist yet, so I'll offer 2-3 options at build.

### Guided 3
No kit covers this app yet, so I can't offer directions: the skill needs confirmed beliefs first. Nothing is written.

**Checked:** the family lookup is `null`. There's no repo folder for it under `git/` yet, and the only kit, `jeff`, lists other repos (murmur, daily-planner, freight-quote-demo, customer-leak-audit). Sized as a Feature (new interaction), so it gets the full loop once the kit exists.

**Answer in one reply, short is fine:**

1. **Family.** Join `jeff` (beliefs: "You should feel thought about", "Your attention belongs to you", "Nothing you do is lost or ignored"), or start a new one?
   - If `jeff`: do those three hold for nurses? What would you change?
   - If new: What do we believe about the nurses using this? What should they feel afterward? What would we never do to them?
   - Or point me at a README or site copy and I'll draft beliefs for you to confirm.
2. **One-line belief for this app** (goes under Products).
3. **Repo folder name and stack**, and whether it's yours alone or a team/work codebase (decides whether I write token files or adopt your existing ones).
4. **Dial:** restrained (quiet, 2 directions) / moment (one carved moment for the whole app, 3 directions, one weird) / full (one per feature, 3 directions, sound opt-in). If moment: does task completion host that moment, or stay quiet?
5. **Three facts only you know**, because they change the design:
   - Can a completed task be un-completed, or is it a record (audit trail, billing, a supervisor sees it)?
   - Device and setting: phone in one hand, gloves, weak signal in patients' homes?
   - A bare tick, or does completing capture something (a value, a note, a photo)?

**Then:** I draft the kit (beliefs, the `jeff` rules you keep, dial) for your sign-off and validate it with `kit.mjs --check`. After that I ground the moment and bring directions for you to pick. Color and type don't exist yet either (the family tokens have no color or type), so I'll offer 2-3 options from ui-ux-pro-max before anything is built.

### Guided 4
Not designing yet. This is a Feature-size job, and the beliefs gate says no directions until I know what this app believes; no kit covers it. Seven questions, one line each.

**The gate**
1. **Family:** start a new one, or join `jeff` (feel thought about; your attention is yours; nothing is lost or ignored)? If new, I seed the rules from `jeff` and you strike what doesn't fit nurses. If `jeff`, skip the interview and give me only the one-liner from question 2.
2. **Beliefs:** I'll turn your answers into 1-3 beliefs for you to confirm.
   - What do we believe about the home-care nurses using this?
   - What should they feel afterward?
   - What would we never do to them?
   - The app's one-line belief, for the Products section.

   A README, pitch or site copy also works: paste it and I'll draft them for you to confirm.

**Kit settings**
3. **Dial:** restrained (quiet, no carved moment), moment (one hand-carved moment for the whole app) or full (one per feature)? If moment: does marking a task complete host it, or something rarer, like closing out a whole visit?
4. **Repo:** folder name, stack, and personal or team/work codebase (personal: I write motion tokens; team: I adopt yours). "Not created yet" is fine for directions; I need it to build.

**Ground the moment**
5. **Setting:** phone or tablet, one hand or two, gloves, reliable signal or offline-first?
6. **Meaning:** does completing carry more than a tick (value, note, photo, signature)? Can it be reopened, or is it a record once tapped? Who else sees it?
7. **Next:** right after a tick, what does the nurse need to see?

I'm assuming a tick is routine, dozens per shift; tell me if not. Once the beliefs are confirmed I'll write the kit and bring directions.

### Guided 5
There's no kit for this app and this is a Feature-size job, so beliefs come first: I won't offer directions until you've confirmed what we believe. One pass of questions. A line each is plenty, in your words; I won't guess them.

**Setup**
1. Family: add this app to `jeff` (its three beliefs then stand, so skip 3–5) or start a new one? Also the repo folder name; there's no folder yet to look up.
2. Dial: `restrained` (quiet; 2 directions, none unexpected), `moment` (one hand-carved moment in the whole app; 3 directions, one deliberately unexpected) or `full` (one per feature; 3 directions, one unexpected; sound opt-in). If `moment`, is mark-complete that moment? Nothing has claimed it yet.

**Beliefs**
3. What do we believe about the people using this, home-care nurses?
4. What should they feel afterward?
5. What would we never do to them?
   If a README or site copy exists, send it and I'll draft 3–5 for you to confirm instead.
6. One line: what does this app itself believe? (It goes under Products.)

**Two facts that constrain the moment**
7. Can a completed task be taken back, or does completing it lock, sync or bill something?
8. Where are they, and on what device, when they tap it? Can they be offline?

Next I draft the kit for you to confirm (rules seeded from `jeff`'s for you to keep or cut; tokens `write`, assuming your own repo rather than a team codebase), then bring directions for mark-complete.

### Control 1
I can write this up now, but five decisions change the design materially. Defaults are in brackets. Reply "defaults" to accept them all, or correct the ones that are wrong.

1. **Official care record or personal checklist?** If it documents care (audit, billing, liability), a completion can't be silently deleted, and corrections are logged with a reason. [Default: care record, with a few-second undo before the save commits.]
2. **Does completing ever need data first?** Examples: vitals, meds given (dose/time), notes, signature. [Default: one tap plus an optional note. Task types can require fields later.]
3. **Is "done" the only outcome?** Patients refuse, aren't home, or care gets deferred. [Default: add "Not done" with a required reason, so an open task never means "unknown".]
4. **Do nurses lose signal in patients' homes?** If so, completion saves on the device first, syncs later, and keeps the tap-time timestamp. [Default: tolerate drops. Save locally, retry, and badge unsynced items.]
5. **Who else sees a completion?** Options: coordinator view, alerts, EHR/billing/EVV export, or nurse only. [Default: coordinator read-only, with alerts only on "Not done".]

Fixed either way: instant on-screen feedback, the server records who and when, a failed save never looks like success, and completing the last task prompts "Finish visit?" instead of closing the visit automatically.

### Control 2
I'd treat "mark complete" as creating a permanent record of care, not flipping a checkbox. Draft flow below, then four questions that could change it.

**Draft flow (defaults)**
1. **One tap, no confirm dialog.** Nurses are often gloved or one-handed, and Undo beats "Are you sure?". Tasks that need data (vitals, meds given, wound notes) open a short form first; Complete stays disabled until required fields are filled.
2. **Save an event, not a boolean:** who, task/patient/visit, entered values, device time, server time. A client-generated ID per completion prevents duplicates from double-taps or retries.
3. **Show it instantly** ("Done 2:14 PM") with a ~10-second Undo.
4. **Then lock it.** Later changes require Amend plus a reason. Undo and amend add entries; nothing is overwritten or deleted, and the original stays visible in the history.
5. **Update the visit:** progress ticks ("4 of 6 done"); when the last required task is done, prompt "Finish visit" instead of auto-closing.
6. **Sibling outcome, "Not done" + reason** (patient refused, not home, out of supplies): why something wasn't done matters as much as that it was.

**Questions (reply only where you differ from my default)**
1. **Clinical or logistical tasks?** Default: clinical (meds, vitals, wound care), hence the strict steps 2 and 4. Plain to-dos (call the family, pick up supplies) collapse to a checkbox with a simple undo.
2. **Do nurses lose signal mid-visit?** Default: online-only for v1; the client ID and device time leave room to add offline queueing later without a data-model change. If dropouts are common, offline belongs in v1 and is a much bigger build.
3. **Does completion feed anything else?** Default: supervisor view only, with this app as the system of record. An EHR, billing, or Medicaid EVV link changes what we capture and when.
4. **Will it hold patient identifiers (PHI)?** Default: yes. In the US that means HIPAA: audit logging and a host that will sign a BAA, decided before the first line of code.

Say "go" and I'll turn this, with the defaults, into the data model and screen states.

### Control 3
**Default design: when a nurse taps Complete**

1. The row flips to done in place (nothing reorders under the thumb) and shows the time, "Done 2:14 PM". A 10-second Undo toast appears. There is no confirm dialog, because people tap through those.
2. It saves on the device first and syncs after, so completing never waits on signal in a patient's home. The row shows "Saved on device", then "Synced" (icon plus text, not color alone).
3. The record holds task, visit, nurse, device time, server time (phone clocks drift), and an optional note.
4. After the undo window a task can't be silently unchecked. "Reopen" requires a reason and adds to the task's history. Nothing is ever deleted.
5. Visit progress updates ("3 of 5 done"). Nobody is notified per task. Completing the last one offers "Finish visit", and any supervisor notice or export fires there.
6. Tasks that need data (meds, vitals, wound notes) don't complete on a tap. The tap opens a short form, and Complete stays disabled until the required fields are filled.

**Questions that could change it**

1. Is this the official record of care (legal and audit rules apply, e.g. HIPAA/EVV in the US) or a working checklist another system owns? My default holds up either way, but "official" adds hard rules: server timestamps only, and PHI handling drives hosting.
2. Which tasks need data captured before they count as done?
3. Do nurses often work offline (rural areas, basements)? I assumed yes. If not, step 2 gets much simpler.
4. Should "Couldn't do it" (patient refused, not home, deferred) be in v1? I'd include it, since it's as common as done in home care.

### Control 4
**Default: tap to complete**
- One tap, no confirm dialog. The task checks off at once, the visit counter updates ("3 of 5"), and a 10-second Undo appears. Confirm dialogs on a frequent, low-risk action just get tapped through.
- Local-first: the write lands on the device, then syncs. The row reads "Saved on device" until the server confirms, so dead zones don't lose work.
- Stored as an append-only event (task, visit, nurse, device time at tap, server time on receipt, optional note), not an overwritten boolean.
- Completing the last task offers "Finish visit?" and never closes the visit on its own.

**Decisions** (reply "defaults" to accept the bracketed answers)
1. Is a completion the official record of care (audit trail, HIPAA if US, possibly EVV/billing) or a personal checklist? [Official record]
2. After Undo expires, can a nurse change it? [Reopen with a required reason, logged, nothing deleted; locked once the visit is finalized, then corrections are addenda]
3. Do any tasks need data before they can complete (vitals, medication given)? [No, plain done/not-done for now]
4. Add "unable to complete" (patient refused, not home) with a reason, next to complete? [Yes; otherwise "not done" is indistinguishable from "forgot"]

Not covered: notifications on completion (supervisor, family). Say so if you want them.

### Control 5
**Default design for "nurse taps Complete"** (assumes this is a care record, not a personal checklist):

1. The task flips to done immediately (optimistic UI). It has a large button and no swipe gesture, so pocket and glove mis-taps are rare.
2. The tap is saved as an append-only event: nurse, visit, device timestamp, and a server timestamp on sync. It is never an overwritten boolean.
3. A status chip shows Saving / Saved / Waiting for signal. It works offline and syncs later.
4. An Undo toast stays up for about 10 seconds. After that, fixes go through "Correct entry" with a required reason, and the original stays in the audit trail.
5. Tasks that need data (vitals, med dose, wound notes) open a short form first. Complete stays disabled until the required fields are filled.
6. "Couldn't do it" is a first-class outcome with a reason (refused, not home, unsafe), not just an unchecked box.
7. When the last task closes, the app prompts "Finish visit?" and does not auto-close.

**Questions that would change this** (my assumed answer is in brackets; reply "defaults" to accept them all):

1. Is this a legal or billing record (HIPAA, audit, EVV with a GPS stamp) or a personal task list? [legal record]
2. Must it work offline? Patients' homes often have no signal. [yes]
3. Do any tasks need structured input on completion, or is it a checkbox plus an optional note? [some need input]
4. Should completion trigger anything: a supervisor notice, billing, or missed-critical-task alerts? [no, v1 is record only]
5. After the undo window, who can correct an entry: the nurse only, or supervisors too? [nurse only, supervisors view]
