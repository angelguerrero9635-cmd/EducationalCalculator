#!/usr/bin/env python3
"""Check group a's files (IM K-5 Math, id im-k5): the table of contents JSON, the practice
JSONL records and their screenshots. Prints counts per grade; exits 1 on any problem.

    python3 research/textbooks/tools/check_a.py
"""
import json, os, re, sys, glob, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
TB = os.path.join(ROOT, 'research', 'textbooks')
CUR = 'im-k5'
errors = []
def err(m): errors.append(m)

# Skill ids from the taxonomy: rows like ["add-sub-20", "…", OA, …] under "K": [ … ].
tax = open(os.path.join(ROOT, 'src', 'data', 'taxonomy.ts'), encoding='utf-8').read()
SKILLS = set()
for block in re.finditer(r'const (MATH|SCIENCE)\b.*?\n\};', tax, re.S):
    pre = 'm' if block.group(1) == 'MATH' else 's'
    grade = None
    for line in block.group(0).splitlines():
        g = re.match(r'\s*"?([K0-9]+|[A-Za-z0-9]+)"?\s*:\s*\[', line)
        if g: grade = g.group(1)
        r = re.match(r'\s*\["([a-z0-9-]+)"\s*,', line)
        if r and grade: SKILLS.add(f'{pre}.{grade}.{r.group(1)}')
if not SKILLS: err('no skills read from taxonomy.ts')

def skill_ok(s, where):
    if s not in SKILLS: err(f'{where}: unknown skill {s}')

# --- table of contents -------------------------------------------------------------
toc_path = os.path.join(TB, 'toc', 'math', f'{CUR}.json')
toc = json.load(open(toc_path, encoding='utf-8'))
for k in ['id', 'curriculum', 'publisher', 'edition', 'subject', 'grades', 'content', 'license', 'sourceUrl', 'retrieved', 'books']:
    if k not in toc: err(f'toc: missing {k}')
if toc.get('content') == 'full' and not (toc.get('license') or {}).get('attribution'): err('toc: full content needs license attribution')
counts = collections.OrderedDict()
for b in toc['books']:
    g = b['grade']; c = counts.setdefault(g, collections.Counter())
    for u in b['units']:
        c['units'] += 1
        for k in ['n', 'title', 'url', 'skills']:
            if k not in u: err(f'toc {g} unit {u.get("n")}: missing {k}')
        for s in u['skills']: skill_ok(s, f'toc {g}.{u["n"]}')
        if not u.get('sections') and not u.get('lessons'): err(f'toc {g}.{u["n"]}: no sections or lessons')
        for s in u.get('sections', []):
            c['sections'] += 1
            for sk in s.get('skills', []): skill_ok(sk, f'toc {g}.{u["n"]}.{s["n"]}')
            if s.get('skills') == [] and not s.get('notes'): err(f'toc {g}.{u["n"]}.{s["n"]}: empty skills without notes')
            for l in s['lessons']:
                c['lessons'] += 1
                if not (l.get('n') and l.get('title') and l.get('url', '').startswith('https://')): err(f'toc {g}.{u["n"]}.{s["n"]}: bad lesson {l}')

# --- practice records ----------------------------------------------------------------
REQ = ['id', 'curriculum', 'grade', 'subject', 'chapter', 'skillId', 'alsoSkills', 'question', 'choices', 'answer',
       'type', 'picture', 'screenshot', 'source', 'license', 'retrieved']
ids = set(); shot_bytes = collections.Counter()
for f in sorted(glob.glob(os.path.join(TB, 'practice', 'math', f'*.{CUR}.jsonl'))):
    fg = os.path.basename(f).split('.')[0]
    for n, line in enumerate(open(f, encoding='utf-8'), 1):
        where = f'{os.path.basename(f)}:{n}'
        try: r = json.loads(line)
        except Exception as e: err(f'{where}: bad JSON {e}'); continue
        for k in REQ:
            if k not in r: err(f'{where}: missing {k}')
        if r.get('id') in ids: err(f'{where}: duplicate id {r.get("id")}')
        ids.add(r.get('id'))
        if r.get('grade') != fg or r.get('curriculum') != CUR: err(f'{where}: grade/curriculum mismatch')
        if not (r.get('question') or '').strip(): err(f'{where}: empty question')
        ch = r.get('chapter') or {}
        for k in ['unit', 'unitTitle', 'section', 'sectionTitle', 'lesson', 'lessonTitle', 'url']:
            if k not in ch: err(f'{where}: chapter.{k} missing')
        if r.get('skillId') is None: err(f'{where}: no skillId')
        else: skill_ok(r['skillId'], where)
        for s in r.get('alsoSkills', []): skill_ok(s, where)
        lic = r.get('license') or {}
        if not (lic.get('name') and lic.get('url') and 'Illustrative Mathematics' in lic.get('attribution', '')): err(f'{where}: license/attribution')
        pic = r.get('picture') or {}
        if pic.get('involved') and not pic.get('description'): err(f'{where}: picture involved without description')
        c = counts.setdefault(fg, collections.Counter())
        c['problems'] += 1; c['figure problems'] += bool(pic.get('involved'))
        if r.get('screenshot'):
            p = os.path.join(TB, r['screenshot'])
            if not os.path.exists(p): err(f'{where}: screenshot missing {r["screenshot"]}')
            else:
                c['screenshots'] += 1; shot_bytes[fg] += os.path.getsize(p)

# Every screenshot file is used by a record.
used = {f'{i}.webp' for i in ids}
for p in glob.glob(os.path.join(TB, 'screenshots', CUR, '*')):
    if os.path.basename(p) not in used: err(f'unused screenshot {p}')

print(f'{"grade":6}{"units":>6}{"sect.":>6}{"lessons":>8}{"probl.":>7}{"fig.":>6}{"shots":>6}{"MB":>7}')
tot = collections.Counter(); tb = 0
for g, c in counts.items():
    tot.update(c); tb += shot_bytes[g]
    print(f'{g:6}{c["units"]:>6}{c["sections"]:>6}{c["lessons"]:>8}{c["problems"]:>7}{c["figure problems"]:>6}{c["screenshots"]:>6}{shot_bytes[g]/1e6:>7.2f}')
print(f'{"all":6}{tot["units"]:>6}{tot["sections"]:>6}{tot["lessons"]:>8}{tot["problems"]:>7}{tot["figure problems"]:>6}{tot["screenshots"]:>6}{tb/1e6:>7.2f}')
if errors:
    print(f'\n{len(errors)} problem(s):'); [print(' -', e) for e in errors[:50]]; sys.exit(1)
print('\nOK')
