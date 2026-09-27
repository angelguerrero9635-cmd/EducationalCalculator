#!/usr/bin/env python3
"""Validate the reference question set and print coverage tables.

Usage:
  python3 research/questions/validate.py            # validate + summary
  python3 research/questions/validate.py --markdown # also print COVERAGE.md tables

Checks every line of research/questions/<subject>/<grade>.jsonl parses as JSON,
has every required key, uses a skillId that exists in src/data/taxonomy.ts (or null
with notes), and that grade/subject match the file it is in. Exits 1 on any error.
"""
import json, os, re, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
TAXONOMY = os.path.join(ROOT, "src", "data", "taxonomy.ts")
GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8"]
KEYS = ["id", "grade", "subject", "standardCode", "skillId", "question", "choices",
        "answer", "type", "picture", "source", "license", "retrieved"]
TYPES = {"multiple choice", "constructed", "grid-in", "short answer"}


def load_skills():
    """Parse the MATH and SCIENCE tables of taxonomy.ts -> ordered {id: title} for K-8."""
    src = open(TAXONOMY, encoding="utf-8").read()
    skills = collections.OrderedDict()
    for table, prefix in (("MATH", "m"), ("SCIENCE", "s")):
        start = src.index(f"const {table}: Record<Grade, Row[]> = {{")
        end = src.index("\n};", start)
        body = src[start:end]
        for gm in re.finditer(r'^  "(\w+)": \[(.*?)^  \],', body, re.S | re.M):
            grade = gm.group(1)
            if grade not in GRADES:
                continue
            for rm in re.finditer(r'^\s+\["([a-z0-9-]+)", "([^"]*)"', gm.group(2), re.M):
                skills[f"{prefix}.{grade}.{rm.group(1)}"] = rm.group(2)
    return skills


def load_records():
    recs, errors = [], []
    for subject in ("math", "science"):
        for grade in GRADES:
            path = os.path.join(HERE, subject, f"{grade}.jsonl")
            if not os.path.exists(path):
                continue
            for n, line in enumerate(open(path, encoding="utf-8"), 1):
                if not line.strip():
                    continue
                where = f"{subject}/{grade}.jsonl:{n}"
                try:
                    r = json.loads(line)
                except Exception as e:
                    errors.append(f"{where}: bad JSON ({e})")
                    continue
                r["_where"] = where
                r["_file_grade"], r["_file_subject"] = grade, subject
                recs.append(r)
    return recs, errors


def validate(recs, skills, errors):
    seen = set()
    for r in recs:
        w = r["_where"]
        for k in KEYS:
            if k not in r:
                errors.append(f"{w}: missing key {k}")
        if r.get("grade") != r["_file_grade"]:
            errors.append(f"{w}: grade {r.get('grade')!r} does not match file")
        if r.get("subject") != r["_file_subject"]:
            errors.append(f"{w}: subject {r.get('subject')!r} does not match file")
        sid = r.get("skillId")
        if sid is None:
            if not r.get("notes"):
                errors.append(f"{w}: skillId null without notes")
        elif sid not in skills:
            errors.append(f"{w}: unknown skillId {sid}")
        elif sid[0] != r.get("subject", "?")[0]:
            errors.append(f"{w}: skillId {sid} is not a {r.get('subject')} skill")
        also = r.get("alsoSkills", [])
        if not (isinstance(also, list) and all(isinstance(a, str) for a in also)):
            errors.append(f"{w}: alsoSkills must be a list of skill ids")
        else:
            for a in also:
                if a not in skills:
                    errors.append(f"{w}: unknown alsoSkills id {a}")
                elif a == sid:
                    errors.append(f"{w}: alsoSkills repeats skillId {a}")
        if r.get("type") not in TYPES:
            errors.append(f"{w}: bad type {r.get('type')!r}")
        if not isinstance(r.get("question"), str) or not r["question"].strip():
            errors.append(f"{w}: empty question")
        if r.get("choices") is not None and not (isinstance(r["choices"], list) and all(isinstance(c, str) for c in r["choices"])):
            errors.append(f"{w}: choices must be a list of strings or null")
        p = r.get("picture")
        if not (isinstance(p, dict) and {"involved", "kind", "description"} <= set(p)):
            errors.append(f"{w}: picture needs involved/kind/description")
        s = r.get("source")
        if not (isinstance(s, dict) and {"name", "pageUrl", "itemUrl", "author"} <= set(s)):
            errors.append(f"{w}: source needs name/pageUrl/itemUrl/author")
        l = r.get("license")
        if not (isinstance(l, dict) and {"name", "url", "attribution"} <= set(l)):
            errors.append(f"{w}: license needs name/url/attribution")
        key = (r.get("subject"), r.get("id"))
        if key in seen:
            errors.append(f"{w}: duplicate id {r.get('id')}")
        seen.add(key)
    return errors


def source_label(r):
    n = r["source"]["name"]
    return "NAEP (NCES)" if "NAEP" in n else ("Illustrative Mathematics" if "Illustrative" in n else n)


def main():
    skills = load_skills()
    recs, errors = load_records()
    errors = validate(recs, skills, errors)
    for e in errors:
        print("ERROR", e)
    by_source = collections.Counter(source_label(r) for r in recs)
    by_file = collections.Counter((r["subject"], r["grade"]) for r in recs)
    by_skill = collections.Counter(r["skillId"] for r in recs)
    # A question also counts for the lessons that teach its idea earlier (science: tested in
    # Grades 4 and 8, learned in every grade).
    by_lesson = collections.Counter(
        s for r in recs for s in [r["skillId"], *r.get("alsoSkills", [])]
    )
    print(f"records: {len(recs)}  errors: {len(errors)}")
    print("by source:", dict(by_source))
    for subject in ("math", "science"):
        print(subject, {g: by_file.get((subject, g), 0) for g in GRADES})
    covered = [s for s in skills if by_lesson.get(s)]
    print(f"K-8 skills: {len(skills)}  with >=1 question (filed or also): {len(covered)}  null skillId: {by_skill.get(None, 0)}")
    if "--markdown" in sys.argv:
        print("\n## Totals by source\n\n| Source | Questions |\n| --- | ---: |")
        for k, v in by_source.most_common():
            print(f"| {k} | {v} |")
        print(f"| **Total** | **{len(recs)}** |")
        print("\n## Totals by subject and file grade\n\n| Subject | " + " | ".join(GRADES) + " | Total |")
        print("| --- |" + " ---: |" * (len(GRADES) + 1))
        for subject in ("math", "science"):
            row = [by_file.get((subject, g), 0) for g in GRADES]
            print(f"| {subject} | " + " | ".join(map(str, row)) + f" | {sum(row)} |")
        print("\n## Questions per skill (every K–8 skill in taxonomy.ts)\n\nFiled: the question's `skillId`. Also: questions filed elsewhere that list this skill in\n`alsoSkills` (an idea tested later that this lesson teaches).\n\n| Skill id | Title | Filed | Also |\n| --- | --- | ---: | ---: |")
        for s, t in skills.items():
            print(f"| `{s}` | {t} | {by_skill.get(s, 0)} | {by_lesson.get(s, 0) - by_skill.get(s, 0)} |")
        print("\n## Skills with no questions\n")
        for s, t in skills.items():
            if not by_lesson.get(s):
                print(f"- `{s}` — {t}")
        kinds = collections.Counter(r["picture"]["kind"] for r in recs if r["picture"]["involved"])
        print("\n## Picture kinds used by the questions\n\n| Kind | Questions |\n| --- | ---: |")
        for k, v in kinds.most_common():
            print(f"| {k} | {v} |")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
