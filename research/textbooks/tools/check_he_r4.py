#!/usr/bin/env python3
"""Check research group R4's college files (aerospace, civil, chemical, electrical, computer).

Run from the repository root: python3 research/textbooks/tools/check_he_r4.py
Reads COURSES from src/data/taxonomy.ts through `npx tsx` (node_modules must be present), then checks
every question record and every table of contents of these fields. R1's college validator replaces this
at merge; this is the interim check the research brief asks each group to keep.
"""
import glob, json, os, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
FIELDS = ['aerospace', 'civil', 'chemical', 'electrical', 'computer']
REQ = ['id', 'level', 'field', 'courseId', 'topicId', 'alsoTopics', 'page', 'standardCode', 'question', 'choices',
       'answer', 'type', 'questionType', 'unknown', 'givens', 'answerForm', 'picture', 'feArea', 'source', 'license',
       'content', 'retrieved', 'notes', 'mark']
TEXT_OK = ('CC BY 4.0', 'CC BY 3.0', 'CC BY 2.5', 'CC BY-SA 4.0', 'CC BY-SA 3.0', 'Public domain')


def courses():
    js = ("import {COURSES} from './src/data/taxonomy'; "
          "console.log(JSON.stringify(COURSES.filter(c=>c.id.startsWith('he.')).map(c=>({id:c.id,fields:c.fields,topics:c.topics}))))")
    out = subprocess.run(['npx', 'tsx', '-e', js], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return {c['id']: c for c in json.loads(out)}


def topic_ok(C, t):
    cid, _, i = t.partition('#')
    return cid in C and i.isdigit() and int(i) < len(C[cid]['topics'])


def main():
    C = courses()
    err = []
    n = 0
    seen = set()
    for f in FIELDS:
        p = os.path.join(ROOT, 'research/questions/college', f + '.jsonl')
        if not os.path.exists(p):
            continue
        for k, line in enumerate(open(p), 1):
            n += 1
            r = json.loads(line)
            where = '%s:%d %s' % (f, k, r.get('id'))
            for key in REQ:
                if key not in r:
                    err.append(where + ' missing ' + key)
            if r.get('id') in seen:
                err.append(where + ' duplicate id')
            seen.add(r.get('id'))
            if r.get('field') != f:
                err.append(where + ' field')
            if not topic_ok(C, r.get('topicId', '')):
                err.append(where + ' bad topicId')
            elif r['topicId'].split('#')[0] != r.get('courseId'):
                err.append(where + ' courseId does not match topicId')
            elif f not in C[r['courseId']]['fields']:
                err.append(where + ' course not in field')
            for a in r.get('alsoTopics', []):
                if not topic_ok(C, a):
                    err.append(where + ' bad alsoTopic ' + a)
            pg = r.get('page')
            if pg and not topic_ok(C, pg.split('~')[0]):
                err.append(where + ' bad page ' + pg)
            if r.get('content') == 'text':
                if not r['license']['name'].startswith(TEXT_OK):
                    err.append(where + ' text from a licence that does not allow it')
                if not r.get('question'):
                    err.append(where + ' text record without question')
            elif r.get('content') == 'type':
                if r.get('question') is not None or r.get('choices') is not None or r.get('answer') is not None:
                    err.append(where + ' type record carries text')
            else:
                err.append(where + ' content')
            if r.get('mark') not in (None, 'Solves', 'Partly', 'No'):
                err.append(where + ' mark')
            if r.get('level') != 'college' or not r.get('retrieved'):
                err.append(where + ' level/retrieved')
    t = 0
    for p in sorted(glob.glob(os.path.join(ROOT, 'research/textbooks/toc/college/*.json'))):
        d = json.load(open(p))
        if d.get('subject') not in FIELDS:
            continue
        t += 1
        name = os.path.basename(p)
        for key in ('id', 'curriculum', 'publisher', 'edition', 'subject', 'level', 'content', 'license', 'terms',
                    'sourceUrl', 'retrieved', 'notes', 'books'):
            if key not in d:
                err.append(name + ' missing ' + key)
        if d.get('id') + '.json' != name:
            err.append(name + ' id does not match file name')
        if d.get('content') not in ('titles', 'full'):
            err.append(name + ' content')
        for b in d['books']:
            for u in b['units']:
                for tp in u.get('topics', []):
                    if not topic_ok(C, tp):
                        err.append('%s unit %s bad topic %s' % (name, u.get('n'), tp))
                if not u.get('topics') and not u.get('notes'):
                    err.append('%s unit %s has no topic and no note' % (name, u.get('n')))
                if d.get('content') == 'titles' and any(k in u for k in ('examples', 'ranges')):
                    err.append('%s unit %s: titles-only file carries examples' % (name, u.get('n')))
    for e in err:
        print(e)
    print('%d question records, %d tables of contents, %d errors' % (n, t, len(err)))
    sys.exit(1 if err else 0)


if __name__ == '__main__':
    main()
