#!/usr/bin/env python3
"""Check research group c's high-school files: math tables of contents and Eureka HS practice.

Usage: python3 research/textbooks/tools/check_hs_c.py

Loads research/textbooks/toc/math/<id>.json for the group's high-school programs and
research/textbooks/practice/math/<grade>.eureka-hs.jsonl; checks required fields, that every
skill id exists in src/data/taxonomy.ts (any grade: a Geometry unit may teach a Grade 12 skill),
that titles-only programs carry no license and cite a URL per unit, that every screenshot file
exists, and prints counts per grade. Exits 1 on any error.
"""
import json, os, re, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))
TB = os.path.abspath(os.path.join(HERE, ".."))
ROOT = os.path.abspath(os.path.join(TB, "..", ".."))
TAXONOMY = os.path.join(ROOT, "src", "data", "taxonomy.ts")
GRADES = ["9", "10", "11", "12"]
TOCS = ["eureka-hs", "big-ideas-hs", "envision-aga", "hmh-into-hs", "reveal-hs",
        "larson-precalculus-limits", "larson-farber-statistics"]
PRACTICE_ID = "eureka-hs"
REC_KEYS = ["id", "curriculum", "grade", "subject", "chapter", "skillId", "alsoSkills", "question",
            "choices", "answer", "type", "picture", "screenshot", "source", "license", "retrieved"]
errors = []


def err(msg):
    errors.append(msg)


def load_skills():
    """Parse the MATH and SCIENCE tables of taxonomy.ts -> set of all skill ids."""
    src = open(TAXONOMY, encoding="utf-8").read()
    ids = set()
    for table, prefix in (("MATH", "m"), ("SCIENCE", "s")):
        start = src.index(f"const {table}: Record<Grade, Row[]> = {{")
        body = src[start:src.index("\n};", start)]
        for gm in re.finditer(r'^  "(\w+)": \[(.*?)^  \],', body, re.S | re.M):
            for rm in re.finditer(r'^\s+\["([a-z0-9-]+)"', gm.group(2), re.M):
                ids.add(f"{prefix}.{gm.group(1)}.{rm.group(1)}")
    return ids


SKILLS = load_skills()


def check_skills(where, skills):
    if not isinstance(skills, list):
        return err(f"{where}: skills must be a list")
    for s in skills:
        if s not in SKILLS:
            err(f"{where}: unknown skill {s}")
        elif not s.startswith("m."):
            err(f"{where}: {s} is not a math skill")


def check_lessons(where, lessons):
    for l in lessons:
        if not l.get("n") or not l.get("title"):
            err(f"{where}: lesson missing n/title: {l}")
        if "<" in l.get("title", "") or "&" in l.get("title", "").replace("& ", ""):
            err(f"{where}: markup left in title {l.get('title')!r}")
        if "skills" in l:
            check_skills(f"{where} L{l.get('n')}", l["skills"])
    return len(lessons)


def check_toc(cid):
    path = os.path.join(TB, "toc", "math", f"{cid}.json")
    if not os.path.exists(path):
        print(f"  {cid}: (not present)")
        return
    d = json.load(open(path, encoding="utf-8"))
    for k in ["id", "curriculum", "publisher", "edition", "subject", "grades", "content", "license",
              "sourceUrl", "retrieved", "books"]:
        if k not in d:
            err(f"{cid}: missing {k}")
    if d.get("id") != cid:
        err(f"{cid}: id is {d.get('id')}")
    if d.get("content") not in ("full", "titles"):
        err(f"{cid}: content must be full|titles")
    if d.get("content") == "titles" and d.get("license") is not None:
        err(f"{cid}: titles-only needs license null")
    if d.get("content") == "full" and not (d.get("license") or {}).get("attribution"):
        err(f"{cid}: open content needs license with attribution")
    rows = []
    for b in d.get("books", []):
        g = b.get("grade")
        if g not in GRADES or g not in d.get("grades", []):
            err(f"{cid}: bad grade {g}")
        units = secs = lessons = mapped = 0
        for u in b.get("units", []):
            units += 1
            w = f"{cid} G{g} {u.get('n')}"
            if not u.get("n") or not u.get("title"):
                err(f"{w}: unit missing n/title")
            if "skills" not in u:
                err(f"{w}: unit missing skills")
            check_skills(w, u.get("skills", []))
            if u.get("skills"):
                mapped += 1
            elif not u.get("notes"):
                err(f"{w}: unmapped unit needs notes")
            if not (u.get("url") or d.get("content") == "full"):
                err(f"{w}: titles-only unit needs its own source url")
            for s in u.get("sections", []):
                secs += 1
                if not s.get("n") or not s.get("title"):
                    err(f"{w}: section missing n/title")
                check_skills(f"{w}.{s.get('n')}", s.get("skills", []))
                lessons += check_lessons(f"{w}.{s.get('n')}", s.get("lessons", []))
            lessons += check_lessons(w, u.get("lessons", []))
        rows.append((g, units, mapped, secs, lessons))
    print(f"  {cid} ({d.get('content')}): " + "; ".join(
        f"G{g} {u} units ({m} mapped), {s} sections, {l} lessons" for g, u, m, s, l in rows))


def check_practice():
    counts, shots, seen = collections.Counter(), collections.Counter(), set()
    pdir = os.path.join(TB, "practice", "math")
    for fn in sorted(os.listdir(pdir)):
        m = re.match(r"^(\d+)\.(eureka-hs)\.jsonl$", fn)
        if not m:
            continue
        grade = m.group(1)
        for i, line in enumerate(open(os.path.join(pdir, fn), encoding="utf-8"), 1):
            w = f"{fn}:{i}"
            try:
                r = json.loads(line)
            except Exception as e:
                err(f"{w}: bad JSON {e}")
                continue
            for k in REC_KEYS:
                if k not in r:
                    err(f"{w}: missing {k}")
            if r.get("id") in seen:
                err(f"{w}: duplicate id {r.get('id')}")
            seen.add(r.get("id"))
            if r.get("grade") != grade or r.get("subject") != "math" or r.get("curriculum") != PRACTICE_ID:
                err(f"{w}: grade/subject/curriculum mismatch")
            check_skills(w, ([r["skillId"]] if r.get("skillId") else []) + list(r.get("alsoSkills", [])))
            if not r.get("question"):
                err(f"{w}: empty question")
            if re.search(r"[\U0001D400-\U0001D7FF]", r.get("question") or ""):
                err(f"{w}: math-alphabet letters left in question")
            if not (r.get("license") or {}).get("attribution"):
                err(f"{w}: missing attribution")
            if not r.get("sample"):
                err(f"{w}: NC-SA practice must be marked as a sample")
            ch = r.get("chapter") or {}
            for k in ["unit", "unitTitle", "section", "sectionTitle", "lesson", "lessonTitle", "url"]:
                if k not in ch:
                    err(f"{w}: chapter missing {k}")
            pic = r.get("picture") or {}
            if "involved" not in pic or "description" not in pic:
                err(f"{w}: picture needs involved/description")
            if pic.get("involved") and not pic.get("description"):
                err(f"{w}: picture involved but no description")
            if r.get("screenshot"):
                if not os.path.exists(os.path.join(TB, r["screenshot"])):
                    err(f"{w}: screenshot missing {r['screenshot']}")
                else:
                    shots[grade] += 1
            counts[grade] += 1
    d = os.path.join(TB, "screenshots", PRACTICE_ID)
    total = 0
    for g in GRADES:
        if counts[g]:
            mb = sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d)
                     if f.startswith(f"eureka-hs-G{g}-")) / 1e6 if os.path.isdir(d) else 0
            total += mb
            print(f"  practice G{g}: {counts[g]} problems, {shots[g]} screenshots ({mb:.2f} MB)")
    print(f"  practice total: {sum(counts.values())} problems, {sum(shots.values())} screenshots ({total:.2f} MB)")


print("Tables of contents")
for cid in TOCS:
    check_toc(cid)
print("Practice")
check_practice()
if errors:
    print(f"\n{len(errors)} error(s):")
    for e in errors[:200]:
        print("  " + e)
    sys.exit(1)
print("\nOK")
