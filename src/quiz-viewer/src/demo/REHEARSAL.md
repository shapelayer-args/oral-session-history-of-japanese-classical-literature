# Rehearsal: QuizDemo

- **Gold copied:** `ai-cards` (a choice kept as the record, the answer opening in place with `Collapse reveal="drop"`, the action confirming on its own button).
- **Changed:** the product is this viewer (its menu, tokens, accent and success color); a single quiz question instead of the chat thread; the check takes the place of the choice's number so the row keeps one inset; a filler next-question card fills the window's foot and is cropped by it (`data-crop`).
- **Compact:** none. Below 720px the welcome screen hides the illustration rather than squeezing a desktop window into a phone column (the film framing check flagged a 326×420 window as narrower than tall).
- **Checked:** `film.mjs --gate` on the loop at 1280 (dev server) and the reduced-motion poster: `rehearsal passed`. Sampling coverage was reported inconclusive (frame gaps over 27ms), so some motion was not judged.
- **Not checked:** the contact sheets were not reviewed by eye (the authoring model could not read images), and there was no fresh-eye review (`references/review.md`). Look at them before relying on the illustration:
  `cd SKILLS/stageshow/stageshow && node scripts/film.mjs http://127.0.0.1:5173/ --select '.qv-welcome__demo' --gate`
