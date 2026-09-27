# Renderings round 2: finishing the picture requests

Paste everything below the line into the pictures chat.

---

You are working in the EducationalCalculator repository again, on your pictures branch
(`claude/edu-calc-assets-questions-379toc`). First merge `claude/ios-education-wireframe-313z7z`
into it: the lesson chat has merged your first round and changed the lesson pages since. Then
read `CLAUDE.md`, `docs/RENDERINGS_BRIEF.md` (the hard rules and art direction still apply) and
`src/data/modules/pictureRequests.ts`.

## The tracker: `src/data/modules/pictureRequests.ts`

Every picture request is one entry in `PICTURE_REQUESTS`. Each entry names the page or pages
it is for (`pages`), so there is always a record of which module a picture is meant for.

Each entry has these fields:

- `id`: `R..` for K–6 pages, `G..` for the planned Grade 7 and 8 skills.
- `what`: what to draw, in a few words.
- `kind`: the picture kind or explore figure.
- `pages`: the page ids it is for.
- `status`: `requested`, `drawn` or `placed`.
- `gallery`: the gallery demo ids.
- `uses` (optional): text that shows the picture is on a page.
- `notes`: what the page needs from the picture.

**Status rules:**

- `requested`: not drawn yet. This is your list.
- `drawn`: you have drawn it. Its gallery demos exist and are listed in `gallery`. The lesson
  chat has not put it on its pages yet.
- `placed`: the lesson chat has put it on every page in `pages`. Only the lesson chat sets this.

`src/data/modules/__tests__/pictureRequests.test.ts` enforces the rules:

- every page id is a real page, or a planned page of a real skill;
- a drawn picture has gallery demos that exist;
- a placed picture appears on every page it names.

**When you finish a request:**

- Set its `status` to `drawn`.
- Fill `gallery` with your demo ids.
- Set `uses` if the picture is an option on an existing kind rather than a new kind: the text
  a page will contain once it uses the option, such as `'"inequality"'` or `'"scale":true'`.
- Add any notes the lesson chat needs to `notes`: which fields to pass and what a page must
  provide.

**If you need a picture no entry asks for:** add a new entry with the pages it is for,
`status: 'drawn'`, and a note saying why. Never add a picture without the pages it is for.
Never change `pages` or `status: 'placed'` on existing entries.

## What to do

Draw every entry whose `status` is `requested`. Each entry's `notes` give the example the page
must handle. They are the K–6 range raises (R21–R29) and one change (R15):

| id  | Picture                                                         | For the page(s)                                                                          |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| R15 | `numberLine` from a start, counted by ticks (no distance value) | `m.2.place-value-1000~number-line`                                                       |
| R21 | `factorPairs` to 200; `hundredChart` around a number to 1,000   | `m.4.factors-multiples`, `m.4.factors-multiples~multiples`                               |
| R22 | `linePlot` in quarter inches from a fractional start            | `m.4.add-fractions-like~line-plot`                                                       |
| R23 | `grid100` with ones to 99                                       | `m.4.decimals-intro`                                                                     |
| R24 | `equalGroups` up to 90 groups                                   | `m.3.multiplication-properties~grouping`                                                 |
| R25 | decimal `fractionLine` from any whole start                     | `m.4.decimals-intro~number-line`                                                         |
| R26 | `fractionArea` past one whole                                   | `m.5.multiply-fractions`                                                                 |
| R27 | `placeValueChart` to billions                                   | `m.5.powers-of-ten`                                                                      |
| R28 | decimal jumps past 30, grouped by tens (`skipCount`)            | `m.5.decimal-operations~divide-by-decimal`, `m.6.multi-digit-decimals~divide-by-decimal` |
| R29 | `grid100` past 100% and in tenths of a square                   | `m.6.percent~fraction-decimal-percent`                                                   |

**R15:** the first version of the 3-digit line needs a distance value, which Grade 2 would have
to find by multiplying (4 × 10). Let the line take the page's own values instead: the start
(`a`), the tick size (`s`), the ticks counted (`k`) and the number at the point (`n`). Draw one
jump per tick.

**Every picture you draw:**

- Read the page it is for (open it in the web build) and draw for that page's values, ranges
  and question.
- Keep every existing field working: all changes are optional fields, so pages that don't use
  them are unchanged.
- Add a gallery demo that uses the page's own example numbers, plus one at the new edge of the
  range.
- Add or extend the harness check in `src/data/modules/harness/pictures.ts`.
- Run `pnpm check`. Take screenshots at 390 px with `pnpm shots`, in light and dark.

**Leave these to the lesson chat (don't change their status):**

- Entries already `drawn`: R01b, R11b, R18 and G01–G54. They wait for lesson pages.
- The lesson pages themselves: never edit lesson text or relations in `src/data/modules/math`,
  `science` or `layouts`. If a page must change for your picture to fit, say so in the entry's
  `notes`.

## How to report

Commit after each picture. Push to your branch. When all the `requested` entries are `drawn`,
also add a short dated "Round 2" note under "Done" in `docs/RENDERINGS_BRIEF.md`. The tracker
is the record; the note only points to it.
