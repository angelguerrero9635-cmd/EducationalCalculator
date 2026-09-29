# Grades 9–12 update: equation inputs

Paste everything below the line into the pictures chat, after `docs/RENDERINGS_HS.md`.

---

This adds to your Grades 9–12 work. First merge `claude/ios-education-wireframe-313z7z` into
your branch, then read `docs/EQUATION_INPUTS.md`.

## What changed

The lesson chat reviewed every page for "equation inputs": the boxes a student types into,
drawn inside the equation itself. 42 more K–8 pages now use one (111 in all). Many Grade 9–12 pages will need one
too, and their equations need parts the input can't draw yet.

The input is drawn by `EquationInput` and parsed by `equationParts` in
`src/components/module/InputsSection.tsx`. It already draws:

- boxes;
- stacked fractions and mixed numbers;
- powers with fixed or boxed parts (`10^{n}`, `{a}^2`);
- text touching a box (`{p}x`, `{a}°`);
- systems on two lines;
- no wrapping inside brackets.

The planned Grade 9–12 templates are the table in `docs/EQUATION_INPUTS.md`. A row marked
**must** can't be built until you add its part.

Treat these parts like a picture kind:

- drawn by you, with theme tokens only;
- readable at 390 px, in light and dark;
- a gallery demo each;
- and the parser tested.

They are typesetting for boxes the student types into. Every part must keep:

- a 44 px tap target;
- the value's keyboard (`keyboardFor`);
- the dashed style for worked-out values;
- error messages under the equation.

## Parts to add, most pages first

Tracker entries `H81`–`H88` in `src/data/modules/pictureRequestsHs.ts`:

1. **H81: expression slots.** A fraction's top or bottom, or an exponent, can be a small
   expression mixing boxes, text and signs, not just one box or number:
   - `({x} − {m})/{s}`;
   - `{a}/sin({A}°)`;
   - `1000 m/1 km`;
   - `{r}^{n − 1}`;
   - `e^{{r}{t}}`.

   Letters in an exponent stay text (`{b}^x`). Must-have for the law of sines, z-scores, conics,
   unit factors, geometric sequences and continuous growth.

2. **H82: an exponent on a bracket.** A power whose base is a bracketed group:
   - `({a} + {b}i)^2`;
   - `(1 + {r})^{t}`;
   - `({b}^{m})^{n}`.

   Must-have for growth and compound interest. It also lets the Grade 8 power-of-a-power page
   take its equation.

3. **H83: radicals.** `√{n}`, `√({a}x + {b})` and `∛{n}`, with the bar drawn over the box or
   group. Must-have for simplifying radicals and radical equations.
4. **H84: a sign or operator choice.** `{s:sign}` draws a tappable box that cycles through
   <, ≤, >, ≥ (or =), and `{o:op}` cycles through + and −. Both are tied to the page's coded
   value (1–4 or 1–2, as the inequality pages store it). Must-have for linear and compound
   inequalities. It also unlocks the Grade 7 inequality page and scientific-notation add and
   subtract.
5. **H85: subscripts and left scripts.**
   - A subscript box: `log_{b}({x})`, `a_{n}`.
   - Stacked mass and atomic numbers on the left of a symbol, for nuclear equations: `^{A}_{Z}X`.

   Must-have for logarithms and nuclear chemistry.

6. **H86: a matrix grid.** Brackets around rows of boxes, 2 × 2 to 3 × 4, with an augmented bar
   option and a determinant form (vertical bars). Must-have for matrices.
7. **H87: a unit that follows the menu.** A small label after a box showing the value's current
   unit (cm, in², V, Ω). It changes with the unit menu, so physics and geometry pages can keep
   their unit choice. Should-have; K–8 pages would use it too (`m.3.area~missing-side`).
8. **H88: small fixes.**
   - A mixed number whose whole or fraction is 0 hides that part (not "0 3/4" or "3 0/4").
   - A chemical coefficient of 1 can show blank when worked out.
   - A worked-out fraction value draws stacked, like the fixed fractions beside it.

## When you finish a part

- Set its entry to `drawn` and list its gallery demo.
- In `notes`, give the template syntax you chose.
- If your syntax differs from the templates in `docs/EQUATION_INPUTS.md`, update that table in
  the same commit.
- `equationIds` must still list every box (the module test "draws its equation from declared
  values only" relies on it). Add parser cases to a test.
