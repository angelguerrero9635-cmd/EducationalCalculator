# research/textbooks/

What K–8 math and science textbooks cover, grade by grade, and practice problems tied to the
chapter that teaches them. Reference for the people who write and review lessons. **Nothing
here is part of the app**: it is never imported, bundled or shipped (see `../README.md`).

Start with **`grades/<grade>.md`**: every textbook's units for that grade side by side, the
lessons in each, the taxonomy skills each unit maps to, and how many practice problems and
test questions exist per skill. **`CROSSWALK.md`** turns it around: for every K–8 skill in
`src/data/taxonomy.ts`, which unit of each textbook teaches it.

| Path                                            | What                                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| `grades/<grade>.md`                             | Per grade: each textbook's table of contents, mapped to skills (generated)       |
| `CROSSWALK.md`                                  | Skill → units in each textbook, practice and test question counts (generated)    |
| `toc/<subject>/<curriculum>.json`               | One table of contents per textbook program, all grades                           |
| `practice/<subject>/<grade>.<curriculum>.jsonl` | Practice problems, one per line, each tied to its unit/lesson and skill          |
| `screenshots/<curriculum>/<id>.webp`            | The problem as published, for problems whose figure carries the question         |
| `sources/<group>.md`                            | Each source, its license or reuse statement (quoted, with URL), what was skipped |
| `tools/build.py`                                | Validates everything and regenerates `grades/` and `CROSSWALK.md`                |

Run `python3 research/textbooks/tools/build.py` after changing `toc/` or `practice/`.

## Two kinds of table of contents

- **`"content": "full"`** — openly licensed programs (Illustrative Mathematics, OpenSciEd:
  CC BY 4.0; Eureka Math/EngageNY: CC BY-NC-SA). The table of contents is complete, and
  practice problems are replicated with the license and attribution in every record.
- **`"content": "titles"`** — commercial, all-rights-reserved programs (enVision, HMH, Big
  Ideas, Amplify Science, FOSS, …). Our own list of their chapter or unit titles, read from
  public pages and cited; nothing else is copied, and there are no practice problems from them.

## Practice records

Each line of `practice/*.jsonl` is one problem: `id`, `curriculum`, `grade`, `subject`,
`chapter` (`unit`, `unitTitle`, `section`, `sectionTitle`, `lesson`, `lessonTitle`, `url`),
`skillId` (and `alsoSkills`), `question` and `choices` as published, `answer` (only when
public), `type`, `picture` (`involved`, `description`: the page's own alt text),
`screenshot` (path or null), `source`, `license` (`name`, `url`, `attribution`) and
`retrieved`.

## Using it

Check that a lesson covers what the textbooks teach at that grade, in a sensible order, with
the numbers, words and pictures students meet in class. Do not copy problems into lessons:
lesson text stays original (`CLAUDE.md`). The test questions filed by skill are in
`../questions/`; the grade pages count both.
