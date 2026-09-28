#!/usr/bin/env python3
"""Check research group b's files (IM 6-8 Math, id im-68).

Loads toc/math/im-68.json and practice/math/<grade>.im-68.jsonl, checks required fields,
that every skill id exists in src/data/taxonomy.ts and every screenshot file exists,
and prints counts per grade. Run from the repository root: python3 research/textbooks/tools/check_b.py
"""
import json, os, re, sys, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
TB = os.path.join(ROOT, 'research', 'textbooks')
ERR = []

def taxonomy_ids():
    src = open(os.path.join(ROOT, 'src', 'data', 'taxonomy.ts'), encoding='utf-8').read()
    ids, grade = set(), None
    for line in src.splitlines():
        g = re.match(r'\s*"([K0-9]+)": \[', line)
        if g: grade = g.group(1)
        s = re.match(r'\s*\["([a-z0-9-]+)", "', line)
        if s and grade: ids.add(f'm.{grade}.{s.group(1)}')
    return ids  # math skills only (this group covers math)

SKILLS = taxonomy_ids()

def need(obj, keys, where):
    for k in keys:
        if k not in obj: ERR.append(f'{where}: missing "{k}"')

def skill_ok(s, where):
    if s not in SKILLS: ERR.append(f'{where}: unknown skill id {s}')

# table of contents
toc_path = os.path.join(TB, 'toc', 'math', 'im-68.json')
toc = json.load(open(toc_path, encoding='utf-8'))
need(toc, ['id', 'curriculum', 'publisher', 'edition', 'subject', 'grades', 'content', 'license', 'sourceUrl', 'retrieved', 'books'], 'toc')
if toc.get('content') == 'full' and not (toc.get('license') or {}).get('attribution'): ERR.append('toc: full content needs license attribution')
tocstat = {}
for b in toc['books']:
    need(b, ['grade', 'units'], f"book {b.get('grade')}")
    nu = nl = 0
    for u in b['units']:
        w = f"G{b['grade']} U{u.get('n')}"
        need(u, ['n', 'title', 'url', 'skills'], w); nu += 1
        for s in u['skills']: skill_ok(s, w)
        lessons = [l for sec in u.get('sections', []) for l in sec['lessons']] + u.get('lessons', [])
        if not lessons: ERR.append(f'{w}: no lessons')
        for l in lessons:
            need(l, ['n', 'title', 'url'], f"{w} L{l.get('n')}"); nl += 1
            for s in l.get('skills', []): skill_ok(s, f"{w} L{l['n']}")
    tocstat[b['grade']] = (nu, nl)

# practice problems
REQ = ['id', 'curriculum', 'grade', 'subject', 'chapter', 'skillId', 'alsoSkills', 'question', 'choices', 'answer',
       'type', 'picture', 'screenshot', 'source', 'license', 'retrieved']
seen = set(); stat = collections.defaultdict(collections.Counter); shot_bytes = collections.Counter()
for g in toc['grades']:
    path = os.path.join(TB, 'practice', 'math', f'{g}.im-68.jsonl')
    if not os.path.exists(path): ERR.append(f'missing {path}'); continue
    for i, line in enumerate(open(path, encoding='utf-8'), 1):
        w = f'{g}.im-68.jsonl:{i}'
        try: r = json.loads(line)
        except Exception as e: ERR.append(f'{w}: bad JSON {e}'); continue
        need(r, REQ, w)
        if r.get('id') in seen: ERR.append(f"{w}: duplicate id {r['id']}")
        seen.add(r.get('id'))
        if r.get('grade') != g: ERR.append(f'{w}: grade mismatch')
        need(r.get('chapter', {}), ['unit', 'unitTitle', 'section', 'sectionTitle', 'lesson', 'lessonTitle', 'url'], w + ' chapter')
        if r.get('skillId'): skill_ok(r['skillId'], w)
        else: ERR.append(f'{w}: no skillId')
        for s in r.get('alsoSkills', []): skill_ok(s, w)
        if not str(r.get('question', '')).strip(): ERR.append(f'{w}: empty question')
        if '\\frac' in r.get('question', '') or '\\(' in r.get('question', ''): ERR.append(f'{w}: TeX left in question')
        lic = r.get('license') or {}
        if not lic.get('name') or not lic.get('attribution'): ERR.append(f'{w}: license/attribution missing')
        pic = r.get('picture') or {}
        if 'involved' not in pic or 'description' not in pic: ERR.append(f'{w}: picture needs involved and description')
        s = stat[g]; s['problems'] += 1; s['figures'] += bool(pic.get('involved'))
        s['review'] += bool(r.get('fromLesson'))
        if r.get('screenshot'):
            f = os.path.join(TB, r['screenshot'])
            if not os.path.exists(f): ERR.append(f"{w}: screenshot missing {r['screenshot']}")
            else: s['screenshots'] += 1; shot_bytes[g] += os.path.getsize(f)
        elif pic.get('involved') and not pic.get('description'): ERR.append(f'{w}: figure with neither screenshot nor description')

print('grade  units  lessons  problems  review  figures  screenshots  MB')
for g in toc['grades']:
    s = stat[g]
    print(f"{g:>5}  {tocstat[g][0]:>5}  {tocstat[g][1]:>7}  {s['problems']:>8}  {s['review']:>6}  {s['figures']:>7}  {s['screenshots']:>11}  {shot_bytes[g]/1e6:5.1f}")
print(f"total screenshots {sum(shot_bytes.values())/1e6:.1f} MB")
if ERR:
    print(f'{len(ERR)} problems:'); print('\n'.join(ERR[:50])); sys.exit(1)
print('OK')
