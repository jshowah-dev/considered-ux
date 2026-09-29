# Craft

## Ground the moment first
- **Who** is using it, and what were they doing a second ago?
- **Where are their eyes?** The response starts there.
- **What do they need to know without asking?** That becomes glanceable state.
- **What's the material?** Say what the thing is like physically, because the material sets the physics. Dictation is breath, a planner is paper, a quote is a document sliding across a desk.
  - Paper slides and settles. It never bounces.
  - Liquid fills and levels out.
  - A spring overshoots once, and only in a carved moment.
  - Glass fades.

## The grammar (everyday motion)
- Use kit tokens by purpose: `hover`, `enter`, `exit`, `emphasis`, `bump`, `fill`, `confirm`, `locate`. Never type a raw duration or easing.
- Animate `transform` and `opacity` only. Nothing that moves layout.
- Exits run faster than entrances: `exit` duration with `exit` easing, versus `enter` with `enter`.
- Every animation is interruptible. New input redirects it from wherever it is; nothing queues or blocks input.
- No overshoot in the grammar.
- Small isn't silent. "Keep it small" limits scope, never the floor: every input still gets a visible answer at the control within 100 ms.
- Reduced motion: replace movement with an instant change plus a cue in color, weight or text. The meaning has to survive.

## The carved moment
- One per scope, as the dial allows. Everything else stays quiet so it lands.
- It must express a belief. The direction says which one.
- It starts where attention already is, and its path shows cause → effect.
- It may break the grammar (a spring, a longer duration) if the direction says why. Record its values in the ledger's Tokens column.
- Sound: full dial only, opt-in, never for routine actions, never louder than the UI's own clicks.
- Spend iterations here. A great moment takes many tries; everything else takes one.

## Presenting directions
For each direction give:
- **The moment, in one line from the user's side.** For example: "You finish speaking and the words settle in at your cursor."
- **The belief it expresses.**
- **What's surprising about it.**
- **What it costs:** performance, complexity, maintenance.

The weird direction is a real proposal, not a joke: an interaction model nobody would expect that still obviously fits. Then stop, because the builder picks.
