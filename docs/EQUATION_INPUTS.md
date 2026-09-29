# Equation inputs

A page can take its numbers in the equation itself: a box for each value, drawn where the problem
writes it (`equation` on the module, `EquationInput` in `src/components/module/InputsSection.tsx`).
This file says when to use one, the template syntax, and which pages use one. It comes from a
review of every page (2026-09-30, three lesson-reviewers, one per grade band).

## When to use one

Use one when the problem is **one number sentence or equation** and its unknown is a box:

- facts and missing addends or factors;
- fraction and decimal operations;
- proportions and percent equations;
- one- and two-step equations and equations with the letter on both sides;
- exponent rules and scientific notation;
- balancing a chemical equation.

The template must read **exactly** like the lesson, the use line and the textbooks write it. A
template that reads differently is worse than rows.

Keep rows for:

- **Measurements whose unit can change** (cm or in, kg or lb). Boxes have no unit menu and show
  no unit. Fixed units (°, %, $) are written as text.
- **Pages about a picture:** a clock, a graph, a data set, a sort.
- **Two directions or several steps:** + and − on one page, or two relations that don't make one
  sentence.
- **K–2 stories** where the row names ("Apples in the basket") teach the roles.
- **Science formulas with named quantities** (Push, Friction, Mass): the names are the lesson.

## Template syntax

| Write                                  | Draws                                                    |
| -------------------------------------- | -------------------------------------------------------- |
| `{a}`                                  | A box for value `a` (dashed when worked out).            |
| `{a}/{b}`, `1/{b}`                     | A stacked fraction (a fixed top or bottom is a number).  |
| `{w} {a}/{b}`                          | A mixed number.                                          |
| `{b}^{n}`, `10^{n}`, `{a}^2`           | A power (the base or exponent can be a fixed number).    |
| `{p}x + {q}`, `{a}°`, `{p}%`, `f({x})` | Text written against a box touches it: no space between. |
| `{{x} − {m}}/{s}`, `{r}^{{n} − 1}`     | A group in braces: an expression slot (boxes, text).     |
| A line break (`\n`)                    | A second equation under the first (a system).            |

Line breaks and brackets:

- A line never ends with a sign ("=", "+").
- Nothing wraps inside brackets: `({a} × 10^{n})` stays on one line.
- "× 10ⁿ" stays with the number before it.

Boxes and letters:

- More than 6 boxes, or more than 4 columns on a line, draw compact boxes.
- On Grade 6 letters pages each box names its letter under it. A page with `letters` names only
  those.

## K–8 pages that use one

`grep -n "equation:" src/data/modules/math/*.ts src/data/modules/science/*.ts` finds them (two
helpers, `signedSum` and `exponentRule`, set it for several pages): 70 pages before the review,
111 after it.

**Added in the review:**

- **K and Grade 3:** the number bond; dividing on a number line; multiplying by tens in a story;
  elapsed time and start time (`{sh}:{sm} + {d} minutes = {eh}:{em}`).
- **Grades 4–6:**
  - factor pairs;
  - two-digit division with a remainder;
  - decimal × and ÷ (Grades 5 and 6);
  - a fraction of a whole number;
  - division with a remainder in Grade 6;
  - fraction = decimal = percent;
  - powers of ten (`{n} × 10^{k} = {p}`), with whole numbers and with decimals.
- **Grades 7–8:**
  - signed sums and differences;
  - fraction to decimal;
  - two-step equations (`{p}x + {q} = {r}`, `{p}(x + {q}) = {r}`);
  - angle sums (`{a}° + {b}° = 180°`);
  - the product and quotient exponent rules (`{b}^{m} × {b}^{n} = {b}^{k} = {P}`) and negative
    exponents;
  - equations with the letter on both sides, with brackets and with a fraction coefficient;
  - lines (`y = {m}x + {b}`, `{a}x + {b}y = {c}`);
  - systems (two lines);
  - scientific notation and its products;
  - balancing hydrogen, rust and methane.

**Changed:**

- `m.4.angles` writes its degrees (`{a}° + {b}° = {w}°`).
- `m.6.divide-fractions~how-many-fit` says to type 2 1/4 as 9/4.
- The use line of `m.3.fractions-number-line~wholes` now reads 8/4 = 2.

**Removed:** `m.6.multi-digit-decimals~add-subtract` went back to rows. Its use line subtracts, and
the addition template made students type 7.2 into the sum.

**Not yet possible:**

- The power-of-a-power page: it needs an exponent on a bracket. Possible now (H82):
  `({b}^{m})^{n} = {b}^{k} = {P}`, demo `g.m8-exponent-rules-power-of-power`.
- `m.6.expressions-variables`: a negative constant would read "3x + −5", and the answer has no
  box.
- Fraction as division: a mixed number with a zero part shows "0 3/4".

## Grades 9–12: the templates the pages should use

These are the planned shapes. **Must** means the page can't be written as its equation until the
input can draw the part named in the last column; the pictures chat builds those parts
(`docs/RENDERINGS_HS_EQUATIONS.md`).

| Skill                                   | Template                                                          | Needs                                                    |
| --------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| m.9.solving-equations                   | `{a}x + {b} = {c}x + {d}`; `{p}({a}x + {b}) = {c}x + {d}`         | today                                                    |
| m.9.linear-inequalities                 | `{a}x + {b} {s} {c}`; compound `{l} {s1} {a}x + {b} {s2} {r}`     | **must**: sign choice box                                |
| m.9.absolute-value                      | `\|{a}x + {b}\| = {c}`                                            | today                                                    |
| m.9.function-notation                   | `f({x}) = {y}`                                                    | today                                                    |
| m.9.linear-modeling                     | `y = {m}x + {b}`; `y − {y1} = {m}(x − {x1})`; `{a}x + {b}y = {c}` | today                                                    |
| m.9.inequality-systems                  | two lines, `{a}x + {b}y = {c}` and `{d}x + {e}y = {f}`            | today; inequalities need the sign box                    |
| m.9.radicals                            | `√{n} = {k}√{r}`; `{b}^{p/q}`                                     | **must**: radical bar; fraction exponent                 |
| m.9.exponential-functions               | `y = {a}({b})^x`; `{A} = {P}(1 + {r})^{t}`                        | today (H82: an exponent on a bracket)                    |
| m.9.sequences                           | `aₙ = {a1} + ({n} − 1){d}`; `aₙ = {a1} × {r}^{{n} − 1} = {an}`    | today; the geometric term uses H81’s expression exponent |
| m.9.polynomial-operations               | `({a}x + {b})({c}x + {d}) = {p}x² + {q}x + {r}`                   | today                                                    |
| m.9.factoring                           | `x² + {b}x + {c} = (x + {p})(x + {q})`                            | today                                                    |
| m.9.quadratic-functions                 | `y = {a}(x − {h})² + {k}`; `y = {a}x² + {b}x + {c}`               | today                                                    |
| m.9.quadratic-formula                   | `{a}x² + {b}x + {c} = 0`; the two roots as rows                   | today                                                    |
| m.10.special-right-triangles            | `{a}^2 + {b}^2 = {c}^2` (fixed unit); `{s}√2`                     | radical bar                                              |
| m.10.right-triangle-trig                | `sin({A}°) = {o}/{h}` (cos, tan the same)                         | today                                                    |
| m.10.law-sines-cosines                  | `{a}/{sin({A}°)} = {b}/{sin({B}°)}`                               | today (H81: a group as a fraction slot)                  |
| m.10.circle-equations                   | `(x − {h})² + (y − {k})² = {r}^2`                                 | today                                                    |
| m.10.probability-rules                  | `C({n}, {r}) = {c}`, `P({n}, {r}) = {c}`                          | today                                                    |
| m.10.conditional-probability            | `P(A \| B) = {ab}/{b}`                                            | today                                                    |
| m.11.function-transformations           | `y = {a}f(x − {h}) + {k}`                                         | today                                                    |
| m.11.complex-numbers                    | `({a} + {b}i)({c} + {d}i) = {p} + {q}i`                           | today                                                    |
| m.11.polynomial-functions               | `P({r}) = {R}` (remainder theorem)                                | today                                                    |
| m.11.binomial-theorem                   | `({a}x + {b})^{n}`; term: `C({n}, {k})`                           | today (H82: an exponent on a bracket)                    |
| m.11.radical-functions                  | `√({a}x + {b}) = {c}`                                             | **must**: radical bar over a group                       |
| m.11.logarithms                         | `log_{b}({x}) = {y}` beside `{b}^{y} = {x}`                       | **must**: subscript box                                  |
| m.11.exp-log-equations                  | `{a} × {b}^x = {c}`; `{A} = {P}e^{{r}{t}}`                        | today (H81: letter or group exponent)                    |
| m.11.unit-circle                        | `{d}° = {p}/{q}π`                                                 | today                                                    |
| m.11.pythagorean-identities             | `({s})^2 + ({c})^2 = 1`                                           | today (H82: an exponent on a bracket)                    |
| m.11.normal-distribution                | `{z} = {{x} − {m}}/{s}` stacked                                   | today (H81: a group as a fraction slot)                  |
| m.12.inverse-trig                       | `sin⁻¹({x}) = {A}°`                                               | today                                                    |
| m.12.vectors                            | `⟨{a}, {b}⟩ · ⟨{c}, {d}⟩ = {p}`                                   | today                                                    |
| m.12.polar                              | `{r}(cos {t}° + i sin {t}°) = {a} + {b}i`                         | today                                                    |
| m.12.matrices                           | 2 × 2 and 3 × 3 grids; a three-variable system on three lines     | **must**: matrix grid                                    |
| m.12.conics                             | `{(x − {h})²}/{a}^2 + {(y − {k})²}/{b}^2 = 1`                     | today (H81: a group as a fraction slot)                  |
| m.12.confidence-intervals               | `{x} ± {z} × {s}/√{n}`                                            | radical bar, expression slot                             |
| s.10.reaction-types, s.10.stoichiometry | `{a} H₂ + {b} O₂ → {c} H₂O`                                       | today (a coefficient of 1 shows "1")                     |
| s.10.mole                               | `{m} g ÷ {M} g/mol = {n} mol`                                     | today (fixed units)                                      |
| s.10.molarity                           | `{c} M = {n} mol ÷ {V} L`                                         | today (fixed units)                                      |
| s.10.acids-bases                        | `pH = −log({h})`; `[H⁺] = 10^{−{p}}`                              | today (H81: expression exponent)                         |
| s.10.nuclear-chemistry                  | isotope boxes in a nuclear equation; `(1/2)^{t/T}`                | **must**: stacked scripts on the left                    |
| s.10.measurement                        | `{a} km × {1000 m}/{1 km} = {b} m`                                | today (H81: text in a fraction slot)                     |
| s.11.circuits                           | `{V} V = {I} A × {R} Ω` (SI only)                                 | a unit after a box that follows the unit menu (better)   |

Everything else in Grades 9–12 stays rows:

- statistics and probability-distribution pages;
- geometry picture and proof pages;
- pages about reading a graph;
- biology and Earth and space science;
- physics formulas whose units change.
