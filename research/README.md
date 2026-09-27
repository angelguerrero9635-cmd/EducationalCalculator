# research/

Reference material for the people who write and review lessons. **Nothing in this folder is
part of the app.** It is never bundled, imported or shipped: no file under `src/` or `app/`
imports from `research/`, and nothing here is read at build time or run time.

| Path                    | What                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `questions/`            | Published K–8 math and science test and practice questions, mapped to taxonomy skill ids  |
| `questions/SOURCES.md`  | Every source used, its reuse or license statement (quoted, with URL) and what was skipped |
| `questions/COVERAGE.md` | Counts by source, grade and skill; skills with no questions; picture kinds not yet drawn  |
| `questions/validate.py` | Checks every record and prints the coverage tables                                        |

Use the questions to check that a lesson's wording, numbers and pictures match what students
actually see on tests and in class. Do not copy them into lessons: lesson text stays original
(see `CLAUDE.md`). Questions under CC BY 4.0 keep their attribution in each record.
