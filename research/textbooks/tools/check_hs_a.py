#!/usr/bin/env python3
"""Check research group hs-a's files (IM Algebra 1, Geometry, Algebra 2; id im-hs).

Loads toc/math/im-hs.json and practice/math/<grade>.im-hs.jsonl (grades 9, 10, 11), checks
required fields, that every skill id exists in src/data/taxonomy.ts (math, any grade) and every
screenshot file exists, and prints counts per grade.
Run from the repository root: python3 research/textbooks/tools/check_hs_a.py
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
toc_path = os.path.join(TB, 'toc', 'math', 'im-hs.json')
toc = json.load(open(toc_path, encoding='utf-8'))
need(toc, ['id', 'curriculum', 'publisher', 'edition', 'subject', 'grades', 'content', 'license', 'sourceUrl', 'retrieved', 'books'], 'toc')
if toc.get('content') == 'full' and not (toc.get('license') or {}).get('attribution'): ERR.append('toc: full content needs license attribution')
tocstat = {}
for b in toc['books']:
    need(b, ['grade', 'course', 'units'], f"book {b.get('grade')}")
    if b.get('grade') not in ('9', '10', '11', '12'): ERR.append(f"book {b.get('grade')}: not a high-school grade")
    nu = nl = npr = 0
    for u in b['units']:
        w = f"G{b['grade']} U{u.get('n')}"
        need(u, ['n', 'title', 'url', 'skills'], w); nu += 1
        for s in u['skills']: skill_ok(s, w)
        lessons = [l for sec in u.get('sections', []) for l in sec['lessons']] + u.get('lessons', [])
        if not lessons: ERR.append(f'{w}: no lessons')
        for l in lessons:
            need(l, ['n', 'title', 'url', 'skills', 'practiceUrl'], f"{w} L{l.get('n')}"); nl += 1
            npr += bool(l.get('practiceUrl'))
            for s in l.get('skills', []): skill_ok(s, f"{w} L{l['n']}")
    tocstat[b['grade']] = (nu, nl, npr)

# practice problems
REQ = ['id', 'curriculum', 'grade', 'subject', 'chapter', 'fromLesson', 'skillId', 'alsoSkills', 'question', 'choices', 'answer',
       'type', 'picture', 'screenshot', 'source', 'license', 'retrieved']
seen = set(); stat = collections.defaultdict(collections.Counter); shot_bytes = collections.Counter()
lesson_ids = {(b['grade'], u['n'], l['n']) for b in toc['books'] for u in b['units'] for sec in u.get('sections', []) for l in sec['lessons']}
for g in toc['grades']:
    path = os.path.join(TB, 'practice', 'math', f'{g}.im-hs.jsonl')
    if not os.path.exists(path): ERR.append(f'missing {path}'); continue
    for i, line in enumerate(open(path, encoding='utf-8'), 1):
        w = f'{g}.im-hs.jsonl:{i}'
        try: r = json.loads(line)
        except Exception as e: ERR.append(f'{w}: bad JSON {e}'); continue
        need(r, REQ, w)
        if r.get('id') in seen: ERR.append(f"{w}: duplicate id {r['id']}")
        seen.add(r.get('id'))
        if r.get('grade') != g: ERR.append(f'{w}: grade mismatch')
        if r.get('curriculum') != 'im-hs': ERR.append(f'{w}: curriculum is not im-hs')
        ch = r.get('chapter', {})
        need(ch, ['unit', 'unitTitle', 'section', 'sectionTitle', 'lesson', 'lessonTitle', 'url'], w + ' chapter')
        if (g, ch.get('unit'), ch.get('lesson')) not in lesson_ids: ERR.append(f'{w}: chapter lesson not in the table of contents')
        fl = r.get('fromLesson')
        if fl and not all(k in fl for k in ('grade', 'unit', 'lesson', 'url')): ERR.append(f'{w}: fromLesson needs grade, unit, lesson, url')
        if r.get('skillId'): skill_ok(r['skillId'], w)
        else: ERR.append(f'{w}: no skillId')
        for s in r.get('alsoSkills', []): skill_ok(s, w)
        if not str(r.get('question', '')).strip(): ERR.append(f'{w}: empty question')
        q = r.get('question', '') + ' '.join(r.get('choices') or [])
        if re.search(r'\\(frac|text|sqrt|begin|left|right|cdot|times)\b|\\\(|\\\[', q): ERR.append(f'{w}: TeX left in question')
        if r.get('answer') is not None: ERR.append(f'{w}: answer given but IM answers are not public')
        lic = r.get('license') or {}
        if not lic.get('name') or not lic.get('attribution') or not lic.get('url'): ERR.append(f'{w}: license name/url/attribution missing')
        if not (r.get('source') or {}).get('pageUrl'): ERR.append(f'{w}: source.pageUrl missing')
        pic = r.get('picture') or {}
        if 'involved' not in pic or 'description' not in pic: ERR.append(f'{w}: picture needs involved and description')
        s = stat[g]; s['problems'] += 1; s['figures'] += bool(pic.get('involved'))
        s['review'] += bool(r.get('fromLesson'))
        if r.get('screenshot'):
            if not pic.get('involved'): ERR.append(f'{w}: screenshot on a text-only problem')
            f = os.path.join(TB, r['screenshot'])
            if not os.path.exists(f): ERR.append(f"{w}: screenshot missing {r['screenshot']}")
            else: s['screenshots'] += 1; shot_bytes[g] += os.path.getsize(f)
        elif pic.get('involved') and not pic.get('description'): ERR.append(f'{w}: figure with neither screenshot nor description')

print('grade  course     units  lessons  practice  problems  review  figures  screenshots  MB')
for b in toc['books']:
    g = b['grade']; s = stat[g]
    print(f"{g:>5}  {b['course']:<9}  {tocstat[g][0]:>5}  {tocstat[g][1]:>7}  {tocstat[g][2]:>8}  {s['problems']:>8}  {s['review']:>6}  {s['figures']:>7}  {s['screenshots']:>11}  {shot_bytes[g]/1e6:5.1f}")
print(f"total screenshots {sum(shot_bytes.values())/1e6:.1f} MB")
if ERR:
    print(f'{len(ERR)} problems:'); print('\n'.join(ERR[:50])); sys.exit(1)
print('OK')
