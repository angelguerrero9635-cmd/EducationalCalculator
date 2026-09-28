"""Checker for research group d (K-8 science TOCs and practice questions).

Loads research/textbooks/toc/science/{openscied,amplify-science,foss,inspire-science}.json and
research/textbooks/practice/science/*.jsonl written by group d, checks required fields, that every
skill id exists in src/data/taxonomy.ts and every screenshot file exists, then prints counts per
grade. Usage: python3 research/textbooks/tools/check_d.py   (exit code 1 on any error)
"""
import json, os, re, sys, glob
from collections import Counter, defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
TB = os.path.join(ROOT, 'research', 'textbooks')
TOCS = ['openscied', 'amplify-science', 'foss', 'inspire-science']
PRACTICE_IDS = {'openscied'}  # curricula whose practice records group d writes
GRADES = {'K', '1', '2', '3', '4', '5', '6', '7', '8', '6-8'}
errors = []

def err(msg):
    errors.append(msg)

def skill_ids():
    src = open(os.path.join(ROOT, 'src', 'data', 'taxonomy.ts'), encoding='utf-8').read()
    ids = set()
    m = re.search(r'const SCIENCE: Record<Grade, Row\[\]> = \{(.*?)\n\};', src, re.S)
    for g, body in re.findall(r'"(\w+)": \[(.*?)\n  \]', m.group(1), re.S):
        for slug in re.findall(r'\["([a-z0-9-]+)",', body):
            ids.add(f's.{g}.{slug}')
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
        if 'skills' in l: check_skills(f'{where} lesson {l.get("n")}', l['skills'])

def check_toc(cid):
    path = os.path.join(TB, 'toc', 'science', f'{cid}.json')
    if not os.path.exists(path):
        print(f'  (not yet written: {cid})'); return None
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
    per = defaultdict(Counter); ids = set(); shots = []
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
            lic = r.get('license') or {}
            if not lic.get('name') or not lic.get('url') or not lic.get('attribution'):
                err(f'{w}: license needs name, url, attribution')
            pic = r.get('picture') or {}
            if 'involved' not in pic or 'description' not in pic: err(f'{w}: picture needs involved, description')
            src = r.get('source') or {}
            if not src.get('name') or not src.get('pageUrl'): err(f'{w}: source needs name, pageUrl')
            if r.get('screenshot'):
                p = os.path.join(TB, r['screenshot'])
                if not os.path.exists(p): err(f'{w}: screenshot missing {r["screenshot"]}')
                else: shots.append(p)
            per[grade]['problems'] += 1
            per[grade]['screenshots'] += 1 if r.get('screenshot') else 0
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
        order = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '6-8']
        print(f'  {cid:16}', '  '.join(f'{g}:{c[g][0]}/{c[g][1]}' for g in order if g in c),
              f'| total {sum(v[0] for v in c.values())} units, {sum(v[1] for v in c.values())} lessons')
    per, shots = check_practice()
    print('Practice (problems / screenshots / MB per grade)')
    mb = defaultdict(float)
    for p in shots:
        g = os.path.basename(os.path.dirname(p))
    for g in sorted(per, key=lambda x: (len(x), x)):
        print(f'  grade {g}: {per[g]["problems"]} problems, {per[g]["screenshots"]} screenshots')
    total = sum(os.path.getsize(p) for p in set(shots)) / 1e6
    print(f'  screenshots total: {len(set(shots))} files, {total:.2f} MB')
    if errors:
        print(f'\n{len(errors)} ERRORS'); [print(' ', e) for e in errors[:60]]; sys.exit(1)
    print('\nOK')

if __name__ == '__main__':
    main()
