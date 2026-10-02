// Copies a gallery demo into a grade file as a lesson page, so a page whose picture was drawn
// ahead of it starts from the demo's tested values, relations, steps and picture instead of
// being typed again:
//
//   node scripts/promote-demo.mjs g.cart-force s.8.newtons-laws ["Title"]
//   node scripts/promote-demo.mjs g.series-loop he.engineering.circuits-1#0~divider ["Title"]
//
// Finds the demo's element in the gallery files (an object literal, a helper call or a `demo(`
// call), appends a copy to the grade file's array (src/data/modules/<math|science>/<grade>.ts,
// or layouts/<math|science><grade>.ts for a layout demo; a college page goes to
// src/data/modules/college/<field>.ts or layouts/college<Field>.ts, the course's home field,
// created when new) with the new id, the title (problem
// types only; a main page takes the skill's title) and a `use` line to fill in, adds the page
// to the picture tracker entry that lists the demo, and reports the helpers the copy calls so
// their imports can be added. The copy is a start: edit its assumptions, ranges and use line to
// the plan, then run `MODULE_IDS=<id> pnpm test src/data/modules`. `--no-tracker` leaves the
// tracker alone (builders working in parallel; the tracker is updated once when they merge).
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { collegeLayoutFile, collegeModuleFile, parseCollegeId } from './college-files.mjs';

const noTracker = process.argv.includes('--no-tracker');
const [demoId, pageId, title] = process.argv.slice(2).filter((a) => a !== '--no-tracker');
const college = pageId?.startsWith('he.') ? parseCollegeId(pageId) : undefined;
if (college?.error) {
  console.log(college.error);
  process.exit(2);
}
if (
  !demoId?.startsWith('g.') ||
  (!college && !/^[ms]\.\w+\.[\w-]+(~[\w-]+)?$/.test(pageId ?? ''))
) {
  console.log(
    'Usage: node scripts/promote-demo.mjs g.<demo> <m|s>.<grade>.<skill>[~<slug>] ["Title"]\n' +
      '       node scripts/promote-demo.mjs g.<demo> he.<field>.<course>#<topic>[~<slug>] ["Title"]',
  );
  process.exit(2);
}
const [, subject, grade] = college ? [] : /^([ms])\.(\w+)\./.exec(pageId);
const isType = pageId.includes('~');
if (isType && !title) {
  console.log('A problem type needs a title.');
  process.exit(2);
}

// 1. The demo's element: the top-level array item (at depth 0 of its enclosing [ ] or ( ))
// whose text holds `id: 'g.x'` or `demo('page', 'g.x'`.
const dir = 'src/data/modules';
const files = readdirSync(dir).filter((f) => /^gallery\w*\.ts$/.test(f));
let found;
const idPattern = new RegExp(`'${demoId.replace(/\./g, '\\.')}'`, 'g');
for (const file of files) {
  const src = readFileSync(join(dir, file), 'utf8');
  for (const hit of src.matchAll(idPattern)) {
    // Walk back to the opener that encloses the id: the element's own `{`, or the `(` of the
    // helper call that builds it (then back over the call's name). A `[` means the id sits in
    // a plain list, not a demo: try the next occurrence.
    let depth = 0;
    let open = hit.index - 1;
    for (; open >= 0; open--) {
      const ch = src[open];
      if (ch === '}' || ch === ')' || ch === ']') depth++;
      else if (ch === '{' || ch === '(' || ch === '[') {
        if (depth === 0) break;
        depth--;
      }
    }
    if (open < 0 || src[open] === '[') continue;
    let start = open;
    if (src[open] === '(') while (start > 0 && /[\w.]/.test(src[start - 1])) start--;
    // Forward to the element's end: the `,` or closing bracket at depth 0.
    depth = 0;
    let end = start;
    let inString = '';
    for (; end < src.length; end++) {
      const ch = src[end];
      if (inString) {
        if (ch === '\\') end++;
        else if (ch === inString) inString = '';
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') inString = ch;
      else if (ch === '{' || ch === '(' || ch === '[') depth++;
      else if (ch === '}' || ch === ')' || ch === ']') {
        if (depth === 0) break;
        depth--;
      } else if (ch === ',' && depth === 0) break;
    }
    const text = src.slice(start, end).trim();
    if (!/^[{a-zA-Z]/.test(text) || text.startsWith('id:')) continue;
    found = { file, text, layout: /kind: '(sort|sequence|explore|observe)'/.test(text) };
    break;
  }
  if (found) break;
}
if (!found) {
  console.log(
    `No demo ${demoId} in ${dir}/gallery*.ts (demos built inside a .map() are copied by hand).`,
  );
  process.exit(1);
}

// 2. The copy: new id and title, no gallery-only fields, a use line to fill in.
let copy = found.text
  .replace(new RegExp(`'${demoId.replace(/\./g, '\\.')}'`), `'${pageId}'`)
  .replace(/\n\s*notation: 'letters',/, '')
  .replace(/\n\s*standalone: \{[^}]*\},/, '')
  .replace(/\n\s*sliders: (true|false),/, '');
if (found.text.startsWith('{')) {
  copy = isType
    ? copy
        .replace(/\n(\s*)title: '[^']*',/, `\n$1title: '${title.replace(/'/g, '’')}',`)
        .replace(/\n(\s*)title: ('[^']*'),/, `\n$1title: $2,\n$1use: 'Use this for “…”',`)
    : copy.replace(/\n\s*title: '[^']*',/, '');
} else {
  copy = `// promoted from ${demoId}: set the id${isType ? ', title and use line' : ''} inside the helper call\n  ${copy}`;
}

// 3. Append to the grade (or college field) file's array (before its closing `];`).
const target = college
  ? found.layout
    ? collegeLayoutFile(college.field)
    : collegeModuleFile(college.field)
  : found.layout
    ? `src/data/modules/layouts/${subject === 'm' ? 'math' : 'science'}${grade}.ts`
    : `src/data/modules/${subject === 'm' ? 'math' : 'science'}/${grade}.ts`;
if (!existsSync(target)) {
  console.log(`No grade file ${target}: create it first (pnpm new-module).`);
  process.exit(1);
}
const gradeSrc = readFileSync(target, 'utf8');
const close = gradeSrc.lastIndexOf('\n];');
if (close === -1) {
  console.log(`${target} has no closing "];".`);
  process.exit(1);
}
writeFileSync(target, `${gradeSrc.slice(0, close)}\n  ${copy},${gradeSrc.slice(close)}`);

// 4. The tracker: the page joins the entry that lists the demo (K–8 entries name their pages
// in `pages: [`, Grades 9–12 entries in the fourth argument of `ask(`).
for (const trackerFile of noTracker
  ? []
  : ['src/data/modules/pictureRequests.ts', 'src/data/modules/pictureRequestsHs.ts']) {
  const tracker = readFileSync(trackerFile, 'utf8');
  const at = tracker.indexOf(`'${demoId}'`);
  if (at === -1 || tracker.includes(`'${pageId}'`)) continue;
  const open = Math.max(
    tracker.lastIndexOf('pages: [', at) + 'pages: '.length,
    tracker.indexOf('[', tracker.lastIndexOf('...ask(', at)),
  );
  const close = tracker.indexOf(']', open);
  const pages = tracker
    .slice(open + 1, close)
    .trim()
    .replace(/,$/, '');
  writeFileSync(
    trackerFile,
    `${tracker.slice(0, open + 1)}${pages ? `${pages}, ` : ''}'${pageId}'${tracker.slice(close)}`,
  );
}

// 5. What the copy calls, so the imports can be added.
const calls = [...new Set([...copy.matchAll(/\b([a-z]\w*)\(/g)].map((m) => m[1]))].filter(
  (name) =>
    !['Math', 'Number', 'String', 'Object', 'Array', 'Set', 'Map'].includes(name) &&
    !/^(v|x|y|t)$/.test(name),
);
console.log(
  [
    `Copied ${demoId} (${found.file}) to ${target} as ${pageId}.`,
    `Edit its ${found.layout ? 'assumptions and cards or scenes' : 'assumptions, ranges and use line'} to the plan.`,
    calls.length
      ? `It calls: ${calls.join(', ')} — import what the grade file lacks (helpers.ts, work.ts, reps).`
      : '',
    `Then: pnpm -s exec prettier --write ${target} src/data/modules/pictureRequests*.ts && MODULE_IDS='${pageId}' pnpm test src/data/modules`,
  ]
    .filter(Boolean)
    .join('\n'),
);
