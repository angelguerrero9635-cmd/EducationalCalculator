#!/usr/bin/env python3
"""Checker for research group hs-d (grades 9-12 science: OpenStax Biology 2e, Chemistry 2e, Physics (HS),
Astronomy 2e; OpenSciEd High School; commercial titles-only lists).

Loads research/textbooks/toc/science/<id>.json for this group's ids and the practice JSONL of its
curricula, checks every required field, that every skill id exists in src/data/taxonomy.ts, that every
screenshot file exists, and prints counts per grade.

    python3 research/textbooks/tools/check_hs_d.py      (exit code 1 on any error)
"""
import json, os, re, sys, glob
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
TB = os.path.join(ROOT, 'research', 'textbooks')
TOCS = ['openstax-biology-2e', 'openstax-chemistry-2e', 'openstax-physics-hs', 'openstax-astronomy-2e',
        'openscied-hs', 'miller-levine-biology', 'hmh-science-dimensions', 'savvas-experience-science',
        'glencoe-physics-chemistry', 'savvas-earth-science']
PRACTICE_IDS = {'openstax-biology-2e', 'openstax-chemistry-2e', 'openstax-physics-hs', 'openstax-astronomy-2e'}
GRADES = {'9', '10', '11', '12', '9-12'}
NC = {'openstax-biology-2e', 'openstax-chemistry-2e', 'openstax-astronomy-2e'}  # CC BY-NC-SA: sample only
errors = []

def err(msg):
    errors.append(msg)

def skill_ids():
    """Every skill id in taxonomy.ts (m.<grade>.<slug>, s.<grade>.<slug>)."""
    src = open(os.path.join(ROOT, 'src', 'data', 'taxonomy.ts'), encoding='utf-8').read()
    ids = set()
    for table, prefix in (('MATH', 'm'), ('SCIENCE', 's')):
        start = src.index(f'const {table}: Record<Grade, Row[]> = {{')
        body = src[start:src.index('\n};', start)]
        for gm in re.finditer(r'^  "(\w+)": \[(.*?)^  \],', body, re.S | re.M):
            for rm in re.finditer(r'^\s+\["([a-z0-9-]+)", "', gm.group(2), re.M):
                ids.add(f'{prefix}.{gm.group(1)}.{rm.group(1)}')
    return ids

SKILLS = skill_ids()

def check_skills(where, skills):
    if not isinstance(skills, list):
        err(f'{where}: skills must be a list'); return
    for s in skills:
        if s not in SKILLS:
            err(f'{where}: unknown skill id {s}')

def check_lessons(where, lessons):
    for l in lessons:
        if not l.get('n') or not l.get('title'):
            err(f'{where}: lesson without n/title: {l}')
        if 'skills' in l:
            check_skills(f'{where} lesson {l.get("n")}', l['skills'])

def check_toc(cid):
    path = os.path.join(TB, 'toc', 'science', f'{cid}.json')
    if not os.path.exists(path):
        return None
    d = json.load(open(path, encoding='utf-8'))
    for k in ('id', 'curriculum', 'publisher', 'edition', 'subject', 'grades', 'content', 'license',
              'sourceUrl', 'retrieved', 'books'):
        if k not in d: err(f'{cid}: missing field {k}')
    if d.get('id') != cid: err(f'{cid}: id is {d.get("id")}')
    if d.get('content') == 'full' and not (d.get('license') or {}).get('attribution'):
        err(f'{cid}: open content needs license.attribution')
    if d.get('content') == 'titles' and d.get('license') is not None:
        err(f'{cid}: titles-only content must have license null')
    rows = []
    for b in d['books']:
        g = b.get('grade')
        if g not in GRADES: err(f'{cid}: bad grade {g}')
        for u in b.get('units', []):
            w = f'{cid} {g} unit {u.get("n")}'
            if not u.get('n') or not u.get('title'): err(f'{w}: missing n/title')
            if 'url' not in u: err(f'{w}: missing url')
            check_skills(w, u.get('skills'))
            if not u.get('skills') and d.get('content') == 'full' and not u.get('notes'):
                err(f'{w}: no skills and no notes saying why')
            nl = 0
            for s in u.get('sections', []):
                if not s.get('title'): err(f'{w}: section without title')
                if 'skills' in s: check_skills(f'{w} section {s.get("n")}', s['skills'])
                check_lessons(f'{w} section {s.get("n")}', s.get('lessons', []))
                nl += len(s.get('lessons', []))
            check_lessons(w, u.get('lessons', []))
            nl += len(u.get('lessons', []))
            rows.append((g, nl))
    return d, rows

REQ = ('id', 'curriculum', 'grade', 'subject', 'chapter', 'skillId', 'alsoSkills', 'question', 'choices',
       'answer', 'type', 'picture', 'screenshot', 'source', 'license', 'retrieved')

def check_practice():
    per = defaultdict(lambda: {'problems': 0, 'answers': 0, 'screenshots': 0, 'files': set(), 'bytes': 0})
    ids = set(); shots = []
    for path in sorted(glob.glob(os.path.join(TB, 'practice', 'science', '*.jsonl'))):
        name = os.path.basename(path)
        cid = name.split('.', 1)[1].rsplit('.', 1)[0]
        if cid not in PRACTICE_IDS: continue
        grade = name.split('.', 1)[0]
        for i, line in enumerate(open(path, encoding='utf-8')):
            w = f'{name}:{i + 1}'
            try:
                r = json.loads(line)
            except Exception as e:
                err(f'{w}: bad JSON {e}'); continue
            for k in REQ:
                if k not in r: err(f'{w}: missing {k}')
            if r.get('id') in ids: err(f'{w}: duplicate id {r.get("id")}')
            ids.add(r.get('id'))
            if r.get('grade') != grade: err(f'{w}: grade {r.get("grade")} but file is {grade}')
            if r.get('curriculum') != cid: err(f'{w}: curriculum {r.get("curriculum")}')
            if r.get('subject') != 'science': err(f'{w}: subject')
            ch = r.get('chapter') or {}
            for k in ('unit', 'unitTitle', 'lesson', 'lessonTitle', 'url'):
                if k not in ch: err(f'{w}: chapter.{k} missing')
            if r.get('skillId') not in SKILLS: err(f'{w}: unknown skillId {r.get("skillId")}')
            for s in r.get('alsoSkills') or []:
                if s not in SKILLS: err(f'{w}: unknown alsoSkill {s}')
            if not (r.get('question') or '').strip(): err(f'{w}: empty question')
            if r.get('choices') is not None and (not isinstance(r['choices'], list) or len(r['choices']) < 2):
                err(f'{w}: choices must be null or a list of at least 2')
            lic = r.get('license') or {}
            if not lic.get('name') or not lic.get('url') or not lic.get('attribution'):
                err(f'{w}: license needs name, url, attribution')
            if cid in NC and 'NC' not in lic.get('name', ''):
                err(f'{w}: {cid} is CC BY-NC-SA; the record must say so')
            if cid in NC and not r.get('sample'):
                err(f'{w}: a record from a CC BY-NC-SA book must be marked "sample": true')
            pic = r.get('picture') or {}
            if 'involved' not in pic or 'description' not in pic: err(f'{w}: picture needs involved, description')
            if pic.get('involved') and not pic.get('description'): err(f'{w}: picture involved but no description')
            src = r.get('source') or {}
            if not src.get('name') or not src.get('pageUrl'): err(f'{w}: source needs name, pageUrl')
            key = (cid, grade)
            if r.get('screenshot'):
                p = os.path.join(TB, r['screenshot'])
                if not os.path.exists(p): err(f'{w}: screenshot missing {r["screenshot"]}')
                else:
                    shots.append(p)
                    if p not in per[key]['files']:
                        per[key]['files'].add(p); per[key]['bytes'] += os.path.getsize(p)
            per[key]['problems'] += 1
            per[key]['answers'] += 1 if r.get('answer') else 0
            per[key]['screenshots'] += 1 if r.get('screenshot') else 0
    return per, shots

def main():
    print('TOC (units / lessons per grade)')
    for cid in TOCS:
        res = check_toc(cid)
        if not res: continue
        _, rows = res
        c = defaultdict(lambda: [0, 0])
        for g, nl in rows:
            c[g][0] += 1; c[g][1] += nl
        order = ['9', '10', '11', '12', '9-12']
        print(f'  {cid:26}', '  '.join(f'{g}:{c[g][0]}/{c[g][1]}' for g in order if g in c),
              f'| total {sum(v[0] for v in c.values())} units, {sum(v[1] for v in c.values())} lessons')
    per, shots = check_practice()
    print('Practice (problems / with answer / with screenshot / screenshot files, MB per curriculum and grade)')
    for (cid, g) in sorted(per, key=lambda x: (x[0], len(x[1]), x[1])):
        v = per[(cid, g)]
        print(f'  {cid:26} grade {g}: {v["problems"]:3} problems, {v["answers"]:3} with answer, '
              f'{v["screenshots"]:2} with screenshot, {len(v["files"]):2} files, {v["bytes"] / 1e6:.2f} MB')
    total = sum(os.path.getsize(p) for p in set(shots)) / 1e6
    print(f'  screenshots total: {len(set(shots))} files, {total:.2f} MB')
    if errors:
        print(f'\n{len(errors)} ERRORS'); [print(' ', e) for e in errors[:60]]; sys.exit(1)
    print('\nOK')

if __name__ == '__main__':
    main()
