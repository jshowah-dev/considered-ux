---
family: jeff
repos: {murmur: full, daily-planner: full, freight-quote-demo: moment, customer-leak-audit: moment, consulting-site: moment, journal-hub: moment}
tokens: write
---
# What we believe
1. **You should feel thought about.**
2. **Your attention belongs to you.**
3. **Nothing you do is lost or ignored.**

# Rules
## Answer where they acted
- **What:** Feedback appears at the button, caret or row the user acted on, not in a corner toast. Toasts are only for events the user didn't trigger.
- **Why:** Belief 1. Feedback far from the action makes people hunt for the result; answering where they acted shows we knew where their eyes were.
- **Feel:** "It answered me right where I was looking."

## Motion explains cause
- **What:** Things move from where they came from to where they went. Nothing moves without a cause.
- **Why:** Belief 1. Motion that shows origin and destination explains the change, so nobody has to work out what happened.
- **Feel:** "I saw where it went."

## Errors fix, at the field
- **What:** An error says what happened and what to do next, right where it happened, in the app's voice. It doesn't apologize and it isn't vague.
- **Why:** Belief 1. An error is a moment of need; the fix in place is care, an apology in a corner is not.
- **Feel:** "It told me what to do next."

## Never steal focus
- **What:** Nothing takes focus while the user is typing. Background events wait or appear passively.
- **Why:** Belief 2. Focus belongs to the user; taking it mid-sentence costs them their train of thought.
- **Feel:** "It waited for me."

## State without opening
- **What:** Anything the user checks often gets an ambient indicator (a count, a ring, a pill) that's visible from where they already are.
- **Why:** Belief 2. Making people open something to check a status spends their attention on our convenience.
- **Feel:** "I already know, at a glance."

## Preview on approach
- **What:** Hovering or approaching shows the contents first, as in the rail flyout. A click commits.
- **Why:** Belief 2. A preview lets them decide without committing their attention to a full view.
- **Feel:** "I can peek before I commit."

## Acknowledge within 100 ms
- **What:** Every input gets a visible response within 100 ms, even if the work takes longer.
- **Why:** Belief 3. Silence after input feels like being ignored; a response inside 100 ms feels instant.
- **Feel:** "It heard me instantly."

## Never lose their place
- **What:** Typed input, scroll, selection, and window size, position and zoom all survive closing, reopening and errors.
- **Why:** Belief 3. Lost input or position is lost work, and it's our fault, not theirs.
- **Feel:** "Everything is where I left it."

## Undo over "Are you sure?"
- **What:** Reversible actions happen right away with an undo. Only irreversible actions ask for confirmation, and the confirmation names the consequence.
- **Why:** Belief 3. Confirmations tax every action to guard against rare mistakes; undo protects without the tax.
- **Feel:** "I can act freely. Mistakes are cheap to take back."

# Products
<!-- One line per product, asked the first time the skill runs on it. -->
- **murmur:** I want to hear and understand you.
- **daily-planner:** We care deeply about serving and helping the customer accomplish their goals. We care deeply about trust and security.
- **freight-quote-demo:** We care deeply about serving and helping the customer accomplish their goals. We care deeply about trust and security.
- **consulting-site:** We free our customers to do what they love and what they're good at.
- **customer-leak-audit:** We care deeply about serving and helping the customer accomplish their goals. We care deeply about trust and security.
- **journal-hub:** You always know where everything stands, without digging.

# Ledger
| Date | Repo | Feature | Moment | Belief | Tokens |
|---|---|---|---|---|---|
| 2026-09-29 | murmur | Dictionary editor | Typing a spoken form shows `hob → HAWB` under it; the result fades in and slides out from under the heard word | I want to hear and understand you | emphasis + easing.enter + distance.enter_px; list re-sort: emphasis + easing.standard |
| 2026-09-29 | murmur | About window | Credits in the app's voice ("Heard by Parakeet… · Understood through sherpa-onnx") plus "Knows N of your words" | I want to hear and understand you | none (copy only) |
| 2026-09-29 | consulting-site | Hero | Mess → process: a tangled ball of freight tiles unwinds into a diagonal lane of evidence cards (RFQ → quote → booking → invoice); after two passes it rests on the lane and replays on scroll-back | We free our customers to do what they love and what they're good at | timeline.js (hero loop, spec § 2); fallback line: enter + easing.enter + distance.enter |
| 2026-09-30 | murmur | Pill | Your words fly home: on key release a mote arcs from the pill to your caret, breathes there while the speech is transcribed, and dissolves into the words; everyday: growth, voice ribbon, cursor-side glow, landing pulse | I want to hear and understand you | flight 300 ms (break) + easing.enter + upward arc 0.2·len; settle breath duration.locate; dissolve/fade duration.exit + easing.exit; voice rise 40 ms (break), fall duration.fill; growth enter/exit + easing.standard; pulse duration.emphasis |
| 2026-10-02 | murmur | Answers where you acted | The mote speaks: it stretches into a capsule above the caret holding "Didn't catch that", "Replaced" or "Learned hob → HAWB", holds for read time, pulls back to a dot and dissolves | I want to hear and understand you | flight FLIGHT (break) + easing.enter; unfurl duration.enter + easing.enter; hold max(duration.locate, duration.readPerChar × chars); furl duration.exit + easing.exit |
| 2026-10-03 | murmur | First run | The card goes home: "Ready", the setup card fades to the mote's dot, which arcs to the pill and says "Hold Right Ctrl and talk" until you press the key | I want to hear and understand you | beat duration.locate; fade duration.exit + easing.exit; carry FLIGHT (break) + easing.enter; unfurl duration.enter + easing.enter; hold until dismissed |
| 2026-10-03 | customer-leak-audit | Report look (Worksheet port) | The lane at a glance: under the verdict, the five checks sit as tiles on the logo's lane, nearest the sale first; fill shows each check's worst result (leak solid, worth a look outlined, looks good muted, couldn't check dashed) and each tile links to its card; vertical on phones | We care deeply about serving and helping the customer accomplish their goals. We care deeply about trust and security. | none (static, no motion) |
| 2026-10-03 | journal-hub | Link a loose item (Suggest → ✓) | The link lands: the item's text slides from its row into its project in the sidebar and that count bumps; the loose count bumps as it lets go. Reduced motion: the project lights up where it landed | You always know where everything stands, without digging | flight duration.emphasis + easing.enter (fill forwards, timer-removed); count bump scale.bump + duration.bump + easing.standard; reduced: highlight duration.locate; row dim duration.exit + easing.exit |
| 2026-10-03 | freight-quote-demo | Demo video (Playwright stage + ffmpeg) | Builder picked all three: (A) evidence thread — a line draws from the hovered value to its source sentence, which lights up; (B) the lane — the title-card process line travels up into a rail whose marker glides step to step, branching for ask/route/status; (C) the quote leaves the desk — on Approve the draft lifts as paper and slides out toward the customer, then settles on the closing card | We care deeply about serving and helping the customer accomplish their goals. We care deeply about trust and security. | camera duration.locate + easing.standard; callouts emphasis/enter in, exit/exit out, distance.enter; rail glide duration.emphasis; thread draw 800 ms (break) + easing.enter; paper lift duration.emphasis, fly 800 ms (break) + easing.exit, settle 1100 ms (break) + easing.enter |
