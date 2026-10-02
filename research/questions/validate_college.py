#!/usr/bin/env python3
"""Validate the college question records and print coverage tables.

Usage:
  python3 research/questions/validate_college.py             # validate + summary
  python3 research/questions/validate_college.py --markdown  # also print COVERAGE tables
  python3 research/questions/validate_college.py --field math  # only research/questions/college/math.jsonl

Reads research/questions/college/<field>.jsonl (one JSON object per line; the format is in
docs/RESEARCH_HE.md, "Recording format") and checks, for every record:

- every required key is present and `level` is "college";
- `field` is a field id of HE_FIELDS in src/data/taxonomy.ts and matches the file name;
- `courseId` is a course of COURSES and `topicId` is a real `<courseId>#<i>` of that course;
  every `alsoTopics` id is a real topic too (and not the topicId again);
- `page` is null or starts with a real topic id (`<courseId>#<i>` or `<courseId>#<i>~slug`);
- `content` is "text" or "type": "text" only under a licence that allows copying with
  attribution (public domain, CC0, CC BY, CC BY-SA, any version) with a non-empty `question`
  and attribution; "type" with `question`, `choices` and `answer` all null and a
  `questionType`;
- `type`, `picture`, `givens`, `source`, `license`, `retrieved` and `mark` are well formed;
- ids are unique across every college file.

Records whose `field` is not one of the course's own (cross-listed) fields are reported as
warnings, not errors (a group may file a shared-core course under its own field). Exits 1 on
any error.
"""
import collections, glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
TAXONOMY = os.path.join(ROOT, "src", "data", "taxonomy.ts")
COLLEGE = os.path.join(HERE, "college")

KEYS = ["id", "level", "field", "courseId", "topicId", "alsoTopics", "page", "standardCode",
        "question", "choices", "answer", "type", "questionType", "unknown", "givens",
        "answerForm", "picture", "feArea", "source", "license", "content", "retrieved",
        "notes", "mark"]
TYPES = {"multiple choice", "multiple select", "constructed", "short answer", "grid-in",
         "numeric entry", "true/false", "proof", "derivation", "free response"}
MARKS = {None, "Solves", "Partly", "No"}
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

# Targets per course (docs/RESEARCH_HE.md, "Targets per course"). Courses not named take their
# group's default below.
TARGETS = {
    "he.math.calc-1": 120, "he.math.calc-2": 120, "he.math.calc-3": 100,
    "he.math.diff-eq": 80, "he.math.linear-algebra": 100,
    "he.physics.university-1": 90, "he.physics.university-2": 75, "he.physics.university-3": 75,
    "he.physics.classical-mechanics": 50, "he.physics.electromagnetism": 40,
    "he.physics.quantum": 40, "he.physics.thermal-statistical": 40,
    "he.chemistry.gen-chem-1": 60, "he.chemistry.gen-chem-2": 60, "he.chemistry.organic-1": 40,
    "he.chemistry.organic-2": 40, "he.chemistry.analytical": 40, "he.chemistry.physical-1": 30,
    "he.chemistry.physical-2": 30, "he.chemistry.biochemistry": 30, "he.chemistry.inorganic": 30,
    **{f"he.engineering.{s}": 40 for s in ("statics", "dynamics", "mechanics-of-materials",
                                          "thermodynamics", "fluid-mechanics", "heat-transfer")},
    **{f"he.engineering.{s}": 30 for s in ("materials-science", "machine-design", "vibrations",
                                          "numerical-methods", "manufacturing")},
    **{f"he.engineering.{s}": 20 for s in ("advanced-solid-mechanics", "finite-element-analysis",
                                          "engineering-programming", "cad-graphics")},
    **{f"he.engineering.{s}": 40 for s in ("circuits-1", "circuits-2", "signals-systems",
                                          "control-systems", "digital-logic", "discrete-math",
                                          "data-structures", "computer-architecture")},
    **{f"he.engineering.{s}": 25 for s in ("electronics", "electromagnetics", "power-systems",
                                          "communication-systems", "embedded-systems",
                                          "operating-systems", "networks")},
    **{f"he.engineering.{s}": 15 for s in ("biomechanics", "biomaterials", "biotransport",
                                          "bioinstrumentation", "tissue-engineering")},
}
DEFAULT_TARGET = {"earth-science": 25, "geography": 25, "biology": 30, "aerospace": 30,
                  "civil": 30, "chemical": 30}


def _strings(s):
    return re.findall(r'"((?:[^"\\]|\\.)*)"', s)


def load_taxonomy():
    """Parse HE_FIELDS and COURSES from taxonomy.ts.

    Returns (fields, courses): fields is {field id: title}; courses is an ordered
    {course id: {"title", "division", "fields", "topics"}}.
    """
    src = open(TAXONOMY, encoding="utf-8").read()
    start = src.index("export const HE_FIELDS")
    body = src[start:src.index("\n};", start)]
    fields = collections.OrderedDict(
        (m.group(1), m.group(2)) for m in re.finditer(r'\{ id: "([a-z-]+)", title: "([^"]*)" \}', body))
    # Helper name -> (division, field or None when the call names its fields)
    helpers = {"math": ("math", "math")}
    for m in re.finditer(r'(\w+) = sci\("([a-z-]+)"\)', src):
        helpers[m.group(1)] = ("science", m.group(2))
    helpers["eng"] = ("engineering", None)
    start = src.index("export const COURSES: Course[] = [")
    body = src[start:src.index("\n];", start)]
    courses = collections.OrderedDict()
    call = re.compile(r'^\s+(\w+)\("([a-z0-9-]+)", "((?:[^"\\]|\\.)*)",(.*?)\]\),\s*$', re.S | re.M)
    for m in call.finditer(body):
        name, slug, title, rest = m.group(1), m.group(2), m.group(3), m.group(4) + "]"
        if name not in helpers:
            raise SystemExit(f"taxonomy.ts: unknown course helper {name}()")
        division, field = helpers[name]
        lists = re.findall(r"\[(.*?)\]", rest, re.S)
        topics = _strings(lists[-1])
        if field is None:
            cfields = _strings(lists[0])
            cid = f"he.engineering.{slug}"
        else:
            cfields = [field]
            cid = f"he.{field}.{slug}"
        courses[cid] = {"title": title, "division": division, "fields": cfields, "topics": topics}
    if not courses:
        raise SystemExit("taxonomy.ts: no COURSES parsed")
    return fields, courses


def topic_ids(courses):
    """Ordered {"<courseId>#<i>": topic title}."""
    return collections.OrderedDict(
        (f"{cid}#{i}", t) for cid, c in courses.items() for i, t in enumerate(c["topics"]))


def text_allowed(licence_name):
    """True when a licence allows copying the question with attribution."""
    n = (licence_name or "").strip().lower()
    if not n:
        return False
    if "public domain" in n or n.startswith("cc0"):
        return True
    m = re.match(r"cc[ -]by(-sa)?( |$)", n)
    return bool(m) and "nc" not in n and "nd" not in n


def target_of(cid, courses):
    if cid in TARGETS:
        return TARGETS[cid]
    return DEFAULT_TARGET.get(courses[cid]["fields"][0])


def load_records(only=None):
    recs, errors = [], []
    for path in sorted(glob.glob(os.path.join(COLLEGE, "*.jsonl"))):
        stem = os.path.splitext(os.path.basename(path))[0]
        if only and stem not in only:
            continue
        for n, line in enumerate(open(path, encoding="utf-8"), 1):
            if not line.strip():
                continue
            where = f"college/{stem}.jsonl:{n}"
            try:
                r = json.loads(line)
            except ValueError as e:
                errors.append(f"{where}: bad JSON ({e})")
                continue
            if not isinstance(r, dict):
                errors.append(f"{where}: not a JSON object")
                continue
            r["_where"], r["_file"] = where, stem
            recs.append(r)
    return recs, errors


def _is_str(x):
    return isinstance(x, str) and x.strip() != ""


def validate(recs, fields, courses, errors, warnings):
    topics = topic_ids(courses)
    seen = {}
    for r in recs:
        w = r["_where"]
        for k in KEYS:
            if k not in r:
                errors.append(f"{w}: missing key {k}")
        if r.get("level") != "college":
            errors.append(f"{w}: level must be \"college\"")
        f = r.get("field")
        if f not in fields:
            errors.append(f"{w}: unknown field {f!r}")
        if f != r["_file"]:
            errors.append(f"{w}: field {f!r} does not match file {r['_file']}.jsonl")
        cid, tid = r.get("courseId"), r.get("topicId")
        if cid not in courses:
            errors.append(f"{w}: unknown courseId {cid!r}")
        elif f in fields and f not in courses[cid]["fields"]:
            warnings.append(f"{w}: field {f} is not one of {cid}'s fields {courses[cid]['fields']}")
        if tid not in topics:
            errors.append(f"{w}: unknown topicId {tid!r}")
        elif cid in courses and not tid.startswith(cid + "#"):
            errors.append(f"{w}: topicId {tid} is not a topic of courseId {cid}")
        also = r.get("alsoTopics")
        if not (isinstance(also, list) and all(isinstance(a, str) for a in also)):
            errors.append(f"{w}: alsoTopics must be a list of topic ids")
        else:
            for a in also:
                if a not in topics:
                    errors.append(f"{w}: unknown alsoTopics id {a}")
                elif a == tid:
                    errors.append(f"{w}: alsoTopics repeats topicId {a}")
        page = r.get("page")
        if page is not None:
            if not isinstance(page, str) or page.split("~", 1)[0] not in topics:
                errors.append(f"{w}: page {page!r} must be <courseId>#<i>[~slug] of a real topic")
        if r.get("type") not in TYPES:
            errors.append(f"{w}: bad type {r.get('type')!r} (one of {sorted(TYPES)})")
        content = r.get("content")
        lic = r.get("license")
        if not (isinstance(lic, dict) and {"name", "url", "attribution"} <= set(lic)):
            errors.append(f"{w}: license needs name/url/attribution")
            lic = {}
        if content == "text":
            if not text_allowed(lic.get("name")):
                errors.append(f"{w}: content \"text\" under licence {lic.get('name')!r} "
                              "(text only from public domain, CC0, CC BY, CC BY-SA)")
            if not _is_str(r.get("question")):
                errors.append(f"{w}: content \"text\" with an empty question")
            if not _is_str(lic.get("attribution")):
                errors.append(f"{w}: content \"text\" needs the licence attribution")
        elif content == "type":
            for k in ("question", "choices", "answer"):
                if r.get(k) is not None:
                    errors.append(f"{w}: content \"type\" must have {k} null")
        else:
            errors.append(f"{w}: content must be \"text\" or \"type\", not {content!r}")
        if not _is_str(r.get("questionType")):
            errors.append(f"{w}: empty questionType")
        ch = r.get("choices")
        if ch is not None and not (isinstance(ch, list) and all(isinstance(c, str) for c in ch)):
            errors.append(f"{w}: choices must be a list of strings or null")
        g = r.get("givens")
        if not (isinstance(g, list) and all(isinstance(x, dict) and _is_str(x.get("name")) for x in g)):
            errors.append(f"{w}: givens must be a list of {{name, unit, range}} objects")
        p = r.get("picture")
        if not (isinstance(p, dict) and {"involved", "kind", "description"} <= set(p)
                and isinstance(p.get("involved"), bool)):
            errors.append(f"{w}: picture needs involved (bool)/kind/description")
        s = r.get("source")
        if not (isinstance(s, dict) and {"name", "pageUrl", "itemUrl", "author"} <= set(s)
                and _is_str(s.get("name")) and _is_str(s.get("pageUrl"))):
            errors.append(f"{w}: source needs name/pageUrl/itemUrl/author (name and pageUrl set)")
        if not (isinstance(r.get("retrieved"), str) and DATE.match(r["retrieved"])):
            errors.append(f"{w}: retrieved must be YYYY-MM-DD")
        if r.get("mark") not in MARKS:
            errors.append(f"{w}: mark must be null, \"Solves\", \"Partly\" or \"No\"")
        fe = r.get("feArea")
        if fe is not None and not isinstance(fe, str):
            errors.append(f"{w}: feArea must be a string or null")
        rid = r.get("id")
        if not _is_str(rid):
            errors.append(f"{w}: empty id")
        elif rid in seen:
            errors.append(f"{w}: duplicate id {rid} (also {seen[rid]})")
        else:
            seen[rid] = w
    return errors


def md(s):
    return str(s).replace("|", "\\|").replace("\n", " ")


def main():
    only = None
    if "--field" in sys.argv:
        only = set(sys.argv[sys.argv.index("--field") + 1].split(","))
    fields, courses = load_taxonomy()
    topics = topic_ids(courses)
    recs, errors = load_records(only)
    warnings = []
    errors = validate(recs, fields, courses, errors, warnings)
    for e in errors:
        print("ERROR", e)
    for x in warnings:
        print("WARN", x)
    by_source = collections.Counter(r.get("source", {}).get("name") for r in recs)
    by_course = collections.Counter(r.get("courseId") for r in recs)
    by_topic = collections.Counter(r.get("topicId") for r in recs)
    by_lesson = collections.Counter(t for r in recs for t in [r.get("topicId"), *(r.get("alsoTopics") or [])])
    by_content = collections.Counter(r.get("content") for r in recs)
    print(f"college records: {len(recs)}  errors: {len(errors)}  warnings: {len(warnings)}  "
          f"content: {dict(by_content)}")
    shown = [c for c in courses if by_course.get(c) or (only and courses[c]["fields"][0] in only)]
    for cid in shown:
        t = target_of(cid, courses)
        print(f"  {cid}: {by_course.get(cid, 0)}" + (f" / {t}" if t else ""))
    if "--markdown" in sys.argv:
        print("\n## Totals by source\n\n| Source | Records |\n| --- | ---: |")
        for k, v in by_source.most_common():
            print(f"| {md(k)} | {v} |")
        print(f"| **Total** | **{len(recs)}** |")
        print("\n## Records by course\n\n| Course | Title | Records | Target | Text | Type |\n| --- | --- | ---: | ---: | ---: | ---: |")
        for cid in shown or courses:
            rs = [r for r in recs if r.get("courseId") == cid]
            t = target_of(cid, courses)
            print(f"| `{cid}` | {md(courses[cid]['title'])} | {len(rs)} | {t or ''} | "
                  f"{sum(r.get('content') == 'text' for r in rs)} | {sum(r.get('content') == 'type' for r in rs)} |")
        print("\n## Records by topic\n\nFiled: the record's `topicId`. Also: records filed elsewhere that list it in `alsoTopics`.\n")
        print("| Topic | Title | Filed | Also |\n| --- | --- | ---: | ---: |")
        for tid, title in topics.items():
            cid = tid.split("#")[0]
            if shown and cid not in shown:
                continue
            print(f"| `{tid}` | {md(title)} | {by_topic.get(tid, 0)} | {by_lesson.get(tid, 0) - by_topic.get(tid, 0)} |")
        print("\n## Topics with no record\n")
        for tid, title in topics.items():
            if (not shown or tid.split("#")[0] in shown) and not by_lesson.get(tid):
                print(f"- `{tid}` — {title}")
        kinds = collections.Counter((r.get("picture") or {}).get("kind") for r in recs
                                    if (r.get("picture") or {}).get("involved"))
        print("\n## Picture kinds\n\n| Kind | Records |\n| --- | ---: |")
        for k, v in kinds.most_common():
            print(f"| {md(k)} | {v} |")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
