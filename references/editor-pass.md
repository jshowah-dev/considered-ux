# Editor pass

Done isn't good. Run this after every Feature build, and as the first step of every Audit.

## 1. Walk the journey
Start where a user starts (a cold open, not the screen you changed) and go to their goal. Cover every window the feature touches, plus its neighbors. At each step check:
- **The kit's rules:** name the ones that apply at this step.
- **The floor:** a response within 100 ms, transform/opacity only, no blocked input, visible focus, and reduced motion keeping the meaning.
- **Consistency:** same durations, easing and feedback style as the neighbors. A mismatch is a defect.
- **Problem solved?** Does the user reach the goal faster and with less doubt than before? If not, "feels good" doesn't matter yet.

Capture every interaction you changed (in an Audit, every key interaction on the journey, as it is today) with `scripts/frames.mjs`, once normally and once with `--reduced-motion`. Open each strip and look at it before you describe it.

## 2. Cut
List anything that doesn't earn its place (motion, copy, chrome) and remove it.

## 3. Zombie critic
Dispatch a fresh subagent (model: sonnet) and give it ONLY:
- the strip paths
- the visible text of the screens
- the kit's beliefs and rules, pasted in
- `references/zombie-tells.md`

Never include your reasoning or the directions you rejected.

Critic prompt:
> You are reviewing a UI change for genericness and missing care. You have frame strips, screen text, the product's beliefs and house rules, and a list of zombie tells. Report as a numbered list: (1) every zombie tell you can see, with its frame; (2) every place a house rule is broken; (3) every detail that would fit any product and expresses none of the beliefs. For each, say what you'd expect instead. If a category is empty, write "none". Don't invent findings.

If you can't dispatch a subagent (you are one), write the payload and the prompt to `critic-request.md` next to the strips. Tell the builder where it is, and continue with anything that doesn't depend on the critic's answer.

## 4. Resolve
Fix each finding or write one line on why it stays. Report anything unresolved to the builder, along with the frame that shows it.

## Audit output
One ranked list. Rank by what the user loses today (time, doubt, lost work), not by effort. Give each item:
- its kind: care gap, zombie spot or invisible friction. Look for all three; if a kind is empty, say so.
- the kit rule or belief it serves, by name.
- the frame that shows it.
