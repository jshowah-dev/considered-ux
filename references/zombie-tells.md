# Zombie tells

A zombie tell is a choice that shows up whatever the product is. Each one below is banned as a default. Use one only when the chosen direction says why this product needs it.

| Tell | Why it's a tell | Instead |
|---|---|---|
| Fade-up entrance on every section, hover lift on every card | Motion with no cause; every template does it | Move things only when something happened (Motion explains cause) |
| `transition: all` with one duration for everything | Nobody decided anything, and layout properties animate too | Name the property; use the kit token for its purpose |
| Spinner or skeleton where an instant or optimistic response would work | Tells the user to wait when they didn't have to | Respond within 100 ms where they acted; show the result optimistically and reconcile quietly. If the wait is real (a model call, a network round trip), show its real steps where they acted, not a generic skeleton |
| Corner toast for an action the user just took | Answers where they aren't looking | Answer where they acted |
| Confetti or a celebration for routine completions | Loud once, meaningless after | A small, specific change at the item itself (a count bump, a ring fill) |
| The stock "satisfying" recipe on a routine action: spring overshoot, ripple, tick drawn in, on every tick | Every to-do app ships it, and it plays hundreds of times a day | Keep everyday motion quiet (no overshoot, transform and opacity only); spend liveliness on the one carved moment, shaped by the product's material |
| "Are you sure?" on a reversible action | Taxes every action to guard a rare mistake | Undo over "Are you sure?" |
| Illustration plus "Nothing here yet" | Mood instead of direction | Say what goes here and give the one action that adds it |
| "Oops! Something went wrong." | Apologizes and says nothing | What happened, what to do, at the field |
| Identical card grids, gradient washes, emoji as icons, everything centered | Template chrome whatever the subject | Let the content's structure set the layout; use the repo's icon set |

## The check
Ask this of every detail before offering a direction:
1. Would a generic model produce this for any similar app? If yes, change it or say why this product needs it.
2. Does it express one of the kit's beliefs? If not, cut it.
