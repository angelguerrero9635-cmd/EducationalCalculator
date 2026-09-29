#!/usr/bin/env python3
"""Check research group hs-b's files (OpenStax high-school math books).

Loads toc/math/<id>.json and practice/math/<grade>.<id>.jsonl for each curriculum below,
checks required fields, that every skill id exists in src/data/taxonomy.ts, every screenshot
file exists, every record carries the CC BY-NC-SA license and attribution and is marked as a
sample, and prints counts per grade. Run from the repository root:
python3 research/textbooks/tools/check_hs_b.py
"""
import collections, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TB = os.path.join(ROOT, "research", "textbooks")
IDS = ["openstax-algebra-trig-2e", "openstax-precalculus-2e", "openstax-statistics-2e",
       "openstax-elementary-algebra-2e", "openstax-intermediate-algebra-2e"]
ERR = []


def taxonomy_ids():
    src = open(os.path.join(ROOT, "src", "data", "taxonomy.ts"), encoding="utf-8").read()
    start = src.index("const MATH: Record<Grade, Row[]> = {")
    body = src[start:src.index("\n};", start)]
    ids = set()
    for gm in re.finditer(r'^  "(\w+)": \[(.*?)^  \],', body, re.S | re.M):
        for rm in re.finditer(r'^\s+\["([a-z0-9-]+)", "', gm.group(2), re.M):
            ids.add(f"m.{gm.group(1)}.{rm.group(1)}")
    return ids


SKILLS = taxonomy_ids()
REQ = ["id", "curriculum", "grade", "subject", "chapter", "exercise", "skillId", "alsoSkills", "question", "choices",
       "answer", "type", "picture", "screenshot", "source", "license", "retrieved"]


def need(obj, keys, where):
    for k in keys:
        if k not in obj: ERR.append(f'{where}: missing "{k}"')


def skill_ok(s, where):
    if s not in SKILLS: ERR.append(f"{where}: unknown skill id {s}")


seen = set()
rows = []
total_bytes = 0
for cid in IDS:
    path = os.path.join(TB, "toc", "math", f"{cid}.json")
    if not os.path.exists(path):
        print(f"(not built yet: {cid})"); continue
    toc = json.load(open(path, encoding="utf-8"))
    need(toc, ["id", "curriculum", "publisher", "edition", "subject", "grades", "content", "license", "sourceUrl", "retrieved", "books"], cid)
    lic = toc.get("license") or {}
    if lic.get("name") != "CC BY-NC-SA 4.0" or not lic.get("attribution"): ERR.append(f"{cid}: license/attribution")
    units = {}
    for b in toc["books"]:
        nl = 0
        for u in b["units"]:
            w = f"{cid} G{b['grade']} ch{u.get('n')}"
            need(u, ["n", "title", "url", "skills", "lessons"], w)
            if not u.get("skills"): ERR.append(f"{w}: no skills")
            for s in u["skills"]: skill_ok(s, w)
            for le in u["lessons"]:
                need(le, ["n", "title", "url", "skills"], f"{w} {le.get('n')}"); nl += 1
                for s in le["skills"]: skill_ok(s, f"{w} {le['n']}")
            units[(b["grade"], u["n"])] = {le["n"] for le in u["lessons"]}
        rows.append([cid, b["grade"], len(b["units"]), nl])
    for g in toc["grades"]:
        p = os.path.join(TB, "practice", "math", f"{g}.{cid}.jsonl")
        if not os.path.exists(p):
            ERR.append(f"missing {p}"); continue
        st = collections.Counter(); nbytes = 0
        for i, line in enumerate(open(p, encoding="utf-8"), 1):
            w = f"{g}.{cid}.jsonl:{i}"
            try:
                r = json.loads(line)
            except ValueError as e:
                ERR.append(f"{w}: {e}"); continue
            need(r, REQ, w)
            if r.get("id") in seen: ERR.append(f"{w}: duplicate id {r.get('id')}")
            seen.add(r.get("id"))
            if r.get("grade") != g or r.get("curriculum") != cid: ERR.append(f"{w}: grade/curriculum mismatch")
            ch = r.get("chapter") or {}
            need(ch, ["unit", "unitTitle", "section", "sectionTitle", "lesson", "lessonTitle", "url"], w + " chapter")
            if ch.get("lesson") not in units.get((g, ch.get("unit")), set()): ERR.append(f"{w}: section {ch.get('lesson')} not in the toc")
            ex = r.get("exercise") or {}
            if not ex.get("kind") or not ex.get("n"): ERR.append(f"{w}: exercise kind and number")
            skill_ok(r.get("skillId"), w)
            for s in r.get("alsoSkills", []): skill_ok(s, w)
            q = r.get("question") or ""
            if not q.strip(): ERR.append(f"{w}: empty question")
            if re.search(r"<[a-z/]|\\frac|[âÃ]", q + (r.get("answer") or "")): ERR.append(f"{w}: markup or mojibake left")
            l = r.get("license") or {}
            if l.get("name") != "CC BY-NC-SA 4.0" or "Access for free at https://openstax.org/books/" not in l.get("attribution", ""):
                ERR.append(f"{w}: license/attribution")
            if r.get("sample") is not True: ERR.append(f"{w}: not marked as a sample")
            pic = r.get("picture") or {}
            if "involved" not in pic or "description" not in pic: ERR.append(f"{w}: picture fields")
            st["problems"] += 1; st["answers"] += bool(r.get("answer")); st["pictures"] += bool(pic.get("involved"))
            if r.get("screenshot"):
                f = os.path.join(TB, r["screenshot"])
                if not os.path.exists(f): ERR.append(f"{w}: missing {r['screenshot']}")
                else: st["shots"] += 1; nbytes += os.path.getsize(f)
            elif pic.get("involved") and not pic.get("description"): ERR.append(f"{w}: figure with neither screenshot nor description")
        total_bytes += nbytes
        for row in rows:
            if row[0] == cid and row[1] == g:
                row += [st["problems"], st["answers"], st["pictures"], st["shots"], round(nbytes / 1e6, 2)]

print(f"{'curriculum':26} grade chapters sections problems answers pictures screenshots   MB")
for r in rows:
    r += [""] * (9 - len(r))
    print(f"{r[0]:26} {r[1]:>5} {r[2]:>8} {r[3]:>8} {r[4]:>8} {r[5]:>7} {r[6]:>8} {r[7]:>11} {r[8]:>5}")
print(f"screenshots total {total_bytes / 1e6:.2f} MB")
if ERR:
    print(f"{len(ERR)} problems:"); print("\n".join(ERR[:60])); sys.exit(1)
print("OK")
