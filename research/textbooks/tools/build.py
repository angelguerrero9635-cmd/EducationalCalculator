#!/usr/bin/env python3
"""Build the per-grade pages and the skill crosswalk for research/textbooks/.

Usage:
  python3 research/textbooks/tools/build.py          # write grades/*.md and CROSSWALK.md
  python3 research/textbooks/tools/build.py --check  # validate only, exit 1 on any error

Reads toc/<subject>/<curriculum>.json and practice/<subject>/<grade>.<curriculum>.jsonl (the
schema is in README.md), plus research/questions/<subject>/<grade>.jsonl (NAEP and IM test
and practice questions filed by skill). Checks that every skill id exists in
src/data/taxonomy.ts, every screenshot file exists, and every practice record points at a
unit of its curriculum's table of contents.
"""
import collections, glob, importlib.util, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)  # research/textbooks
ROOT = os.path.dirname(os.path.dirname(BASE))
GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
SUBJECTS = {"math": "Math", "science": "Science"}

spec = importlib.util.spec_from_file_location(
    "qvalidate", os.path.join(ROOT, "research", "questions", "validate.py"))
qvalidate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qvalidate)


def load_tocs(errors):
    tocs = []
    for path in sorted(glob.glob(os.path.join(BASE, "toc", "*", "*.json"))):
        if os.path.basename(os.path.dirname(path)) == "college":
            continue  # college tables of contents: tools/build_college.py
        try:
            t = json.load(open(path, encoding="utf-8"))
        except ValueError as e:
            errors.append(f"{path}: {e}")
            continue
        for k in ("id", "curriculum", "publisher", "subject", "content", "sourceUrl", "books"):
            if k not in t:
                errors.append(f"{path}: missing {k}")
        t["_path"] = os.path.relpath(path, BASE)
        tocs.append(t)
    # Openly licensed programs (full contents, practice) first, then the titles-only ones.
    order = ["im-k5", "im-68", "eureka", "openscied"]
    tocs.sort(key=lambda t: (t["content"] != "full", order.index(t["id"]) if t["id"] in order else 99, t["id"]))
    return tocs


def load_practice(errors):
    recs = []
    for path in sorted(glob.glob(os.path.join(BASE, "practice", "*", "*.jsonl"))):
        for i, line in enumerate(open(path, encoding="utf-8"), 1):
            if not line.strip():
                continue
            try:
                r = json.loads(line)
            except ValueError as e:
                errors.append(f"{path}:{i}: {e}")
                continue
            r["_path"] = os.path.relpath(path, BASE)
            recs.append(r)
    return recs


def all_skills():
    """Every skill id in taxonomy.ts, any grade (a unit can teach toward a skill of another grade)."""
    import re
    src = open(os.path.join(ROOT, "src", "data", "taxonomy.ts"), encoding="utf-8").read()
    ids = set()
    for table, prefix in (("MATH", "m"), ("SCIENCE", "s")):
        start = src.index(f"const {table}: Record<Grade, Row[]> = {{")
        body = src[start:src.index("\n};", start)]
        for gm in re.finditer(r'^  "(\w+)": \[(.*?)^  \],', body, re.S | re.M):
            for rm in re.finditer(r'^\s+\["([a-z0-9-]+)", "', gm.group(2), re.M):
                ids.add(f"{prefix}.{gm.group(1)}.{rm.group(1)}")
    return ids


def grades_of(book):
    """A book's grades: "6" → ["6"]; a course band "6-8" → ["6", "7", "8"]."""
    g = str(book.get("grade"))
    if "-" in g:
        lo, hi = g.split("-")
        if lo in GRADES and hi in GRADES:
            return GRADES[GRADES.index(lo):GRADES.index(hi) + 1]
    return [g]


def units_of(book):
    """Units in order with their lesson count (sections flattened)."""
    for u in book.get("units", []):
        lessons = list(u.get("lessons", []))
        for s in u.get("sections", []) or []:
            lessons += s.get("lessons", [])
        yield u, lessons


def check(tocs, practice, skills, errors):
    by_id = {t["id"]: t for t in tocs}
    for t in tocs:
        for b in t.get("books", []):
            if not all(g in GRADES for g in grades_of(b)):
                errors.append(f"{t['_path']}: grade {b.get('grade')!r}")
            for u, _ in units_of(b):
                for s in u.get("skills", []):
                    if s not in skills:
                        errors.append(f"{t['_path']}: grade {b['grade']} unit {u.get('n')}: unknown skill {s}")
    for r in practice:
        where = f"{r['_path']} {r.get('id')}"
        t = by_id.get(r.get("curriculum"))
        unit = (r.get("chapter") or {}).get("unit")
        if not t:
            # A practice source with no textbook of its own (a quiz page): it needs its source,
            # license and chapter title instead of a unit of a table of contents.
            if not ((r.get("source") or {}).get("pageUrl") and r.get("license")
                    and (r.get("chapter") or {}).get("unitTitle")):
                errors.append(f"{where}: unknown curriculum {r.get('curriculum')} and no source")
        else:
            book = next((b for b in t["books"] if r.get("grade") in grades_of(b)), None)
            if not book or not any(str(u.get("n")) == str(unit) for u in book["units"]):
                errors.append(f"{where}: unit {unit} not in {t['id']} grade {r.get('grade')}")
        for s in [r.get("skillId")] + list(r.get("alsoSkills") or []):
            if s and s not in skills:
                errors.append(f"{where}: unknown skill {s}")
        shot = r.get("screenshot")
        if shot and not os.path.exists(os.path.join(BASE, shot)):
            errors.append(f"{where}: missing screenshot {shot}")
        if t and t.get("content") != "full":
            errors.append(f"{where}: practice from a titles-only curriculum")


def md_escape(s):
    return str(s).replace("|", "\\|").replace("\n", " ")


def grade_page(g, tocs, practice, questions, skills):
    out = [f"# Grade {g}: what the textbooks cover\n",
           "Generated by `tools/build.py` from `toc/` and `practice/`; don't edit by hand. Reference",
           "only (see `../README.md`). Practice counts are problems stored in `practice/` for that unit.\n"]
    for subj, name in SUBJECTS.items():
        books = [(t, b) for t in tocs if t["subject"] == subj for b in t["books"] if g in grades_of(b)]
        if not books:
            continue
        out.append(f"## {name}\n")
        for t, b in books:
            kind = "full table of contents" if t["content"] == "full" else "titles only (commercial, our own list)"
            out.append(f"### {t['curriculum']} ({t['publisher']}) — {kind}\n")
            out.append(f"Source: <{b.get('url') or t['sourceUrl']}>\n")
            out.append("| # | Unit | Lessons | Skills | Practice |\n| --- | --- | ---: | --- | ---: |")
            for u, lessons in units_of(b):
                n = sum(1 for r in practice if r["curriculum"] == t["id"] and r["grade"] == g
                        and b["grade"] in (g, r["grade"]) and str(r["chapter"]["unit"]) == str(u.get("n")))
                sk = ", ".join(f"`{s}`" for s in u.get("skills", [])) or "—"
                out.append(f"| {md_escape(u.get('n', ''))} | {md_escape(u.get('title', ''))} | "
                           f"{len(lessons) or ''} | {sk} | {n or ''} |")
            out.append("")
            detailed = [(u, ls) for u, ls in units_of(b) if ls or u.get("sections")]
            if detailed:
                out.append("<details><summary>Lessons</summary>\n")
                for u, _ in detailed:
                    out.append(f"**{md_escape(u.get('n', ''))}. {md_escape(u.get('title', ''))}**\n")
                    for s in u.get("sections") or [{"lessons": u.get("lessons", [])}]:
                        if s.get("title"):
                            out.append(f"- *{md_escape(s.get('n', ''))}. {md_escape(s['title'])}*")
                        for le in s.get("lessons", []):
                            out.append(f"  - {md_escape(le.get('n', ''))}. {md_escape(le.get('title', ''))}")
                    out.append("")
                out.append("</details>\n")
    # Practice sources with no table of contents of their own (quiz pages), by topic.
    toc_ids = {t["id"] for t in tocs}
    other = collections.Counter((r["curriculum"], r["chapter"].get("unitTitle"), r["source"].get("pageUrl"))
                                for r in practice if r["grade"] == g and r["curriculum"] not in toc_ids)
    if other:
        out.append("## Other practice sources\n")
        out.append("| Source | Topic | Problems |\n| --- | --- | ---: |")
        for (cid, title, url), n in sorted(other.items()):
            out.append(f"| {cid} | [{md_escape(title)}]({url}) | {n} |")
        out.append("")
    # Skills of this grade with where they are taught and how many questions exist.
    out.append("## Skills of this grade\n")
    out.append("| Skill | Title | Units that teach it | Textbook practice | Test questions |")
    out.append("| --- | --- | --- | ---: | ---: |")
    for sid, title in skills.items():
        if sid.split(".")[1] != g:
            continue
        units = [f"{t['id']} {b['grade']}.{u.get('n')}" for t in tocs for b in t["books"]
                 for u, _ in units_of(b) if sid in u.get("skills", [])]
        p = sum(1 for r in practice if r.get("skillId") == sid or sid in (r.get("alsoSkills") or []))
        q = sum(1 for r in questions if r.get("skillId") == sid or sid in (r.get("alsoSkills") or []))
        out.append(f"| `{sid}` | {md_escape(title)} | {', '.join(units) or '—'} | {p or ''} | {q or ''} |")
    return "\n".join(out) + "\n"


def crosswalk(tocs, practice, questions, skills):
    out = ["# Crosswalk: taxonomy skills → textbook units and questions\n",
           "Generated by `tools/build.py`; don't edit by hand. For each K–12 skill in",
           "`src/data/taxonomy.ts`: the units of each curriculum that teach it (`curriculum grade.unit`),",
           "the textbook practice problems in `practice/`, and the test questions in",
           "`../questions/` (NAEP and IM) filed under it.\n"]
    ids = [t["id"] for t in tocs]
    out.append("| Skill | " + " | ".join(ids) + " | Practice | Tests |")
    out.append("| --- | " + " | ".join("---" for _ in ids) + " | ---: | ---: |")
    for sid in skills:
        cells = []
        for t in tocs:
            cells.append(", ".join(f"{b['grade']}.{u.get('n')}" for b in t["books"]
                                   for u, _ in units_of(b) if sid in u.get("skills", [])) or "")
        p = sum(1 for r in practice if r.get("skillId") == sid)
        q = sum(1 for r in questions if r.get("skillId") == sid)
        out.append(f"| `{sid}` | " + " | ".join(cells) + f" | {p or ''} | {q or ''} |")
    missing = [s for s in skills if not any(s in u.get("skills", []) for t in tocs
                                            for b in t["books"] for u, _ in units_of(b))]
    out.append(f"\n**Skills no textbook unit maps to ({len(missing)}):** "
               + (", ".join(f"`{s}`" for s in missing) or "none") + "\n")
    return "\n".join(out)


def main():
    errors = []
    skills = qvalidate.load_skills()
    tocs = load_tocs(errors)
    practice = load_practice(errors)
    questions, qerrors = qvalidate.load_records()
    errors += [f"questions: {e}" for e in qerrors]
    check(tocs, practice, set(skills) | all_skills(), errors)
    for e in errors:
        print("ERROR", e)
    counts = collections.Counter((r["subject"], r["grade"]) for r in practice)
    shots = sum(1 for r in practice if r.get("screenshot"))
    print(f"{len(tocs)} tables of contents, {len(practice)} practice problems, {shots} screenshots")
    for (s, g), n in sorted(counts.items(), key=lambda x: (x[0][0], GRADES.index(x[0][1]))):
        print(f"  {s} {g}: {n}")
    if errors:
        sys.exit(1)
    if "--check" in sys.argv:
        return
    os.makedirs(os.path.join(BASE, "grades"), exist_ok=True)
    for g in GRADES:
        with open(os.path.join(BASE, "grades", f"{g}.md"), "w", encoding="utf-8") as f:
            f.write(grade_page(g, tocs, practice, questions, skills))
    with open(os.path.join(BASE, "CROSSWALK.md"), "w", encoding="utf-8") as f:
        f.write(crosswalk(tocs, practice, questions, skills))
    print("wrote grades/*.md and CROSSWALK.md")


if __name__ == "__main__":
    main()
