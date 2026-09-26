/**
 * The reviewer's mechanical expectations, enforced on every module (checks D, E, J and K in
 * .claude/agents/lesson-reviewer.md): reading level, notation the grade has met, no
 * shorthand or jargon, formatting, and a walkthrough that reads the way the grade reads.
 * Everything a student sees is checked: assumptions, names, number sentences, the
 * step-by-step from the example, titles and "use" lines.
 */
import { renderTemplate } from '@/engine/format';
import { solve } from '@/engine/solve';

import { TESTED_MODULES, gradeBand, gradeOf, namedVariables } from '..';
import { agree, buildSteps } from '../buildSteps';
import type { ModuleDef } from '../types';

/** Longest sentence per grade: the reviewer's guide (8, 12, 15, 20 words) plus half again. */
function wordLimit(grade: string | undefined): number | undefined {
  if (grade === undefined) return undefined;
  const g = grade === 'K' ? 0 : Number(grade);
  if (g <= 1) return 12;
  if (g <= 3) return 18;
  if (g <= 5) return 22;
  if (g <= 8) return 30;
  return undefined;
}

/** Values per module: about 4–5 in K–2, 6–7 in grades 3–8 (check C), with a little room. */
function valueLimit(grade: string | undefined): number | undefined {
  if (grade === undefined) return undefined;
  const g = grade === 'K' ? 0 : Number(grade);
  return g <= 2 ? 6 : g <= 8 ? 8 : undefined;
}

/** Shorthand and jargon by grade (check K). */
const SHORTHAND = /\b(?:incl|e\.g|i\.e|vs|etc|approx)\.|\bw\/(?=\w)/;
const JARGON_K3 = /\bquotient\b/i;

/** Letters standing for numbers: "a = 3", "(B)", "a + b" (before Grade 6, check K). */
const LETTERS =
  /(^|[\s(])(?<!\d[ \u00a0])[A-Za-z] =|\((?![gLNSms]\))[A-Za-z]\)|(^|\s)(?<!\d[ \u00a0])[b-zB-HJ-Z] [+−×÷] /;
// (a unit's abbreviation after its name, "grams (g)", "liters (L)", "newtons (N)", is not a letter
// standing for a number)
/** A lone capital letter naming a thing ("Pencil A", "Jar B"): K–2 says first and second. */
const LONE_CAPITAL = /(^|\s)[A-Z](\s|$)/;

const BAD_VALUE = /NaN|undefined|Infinity|null|(^|[^\w.])[-−]0(?![\d.])/;
/** "1 tens", "3 ten": number words that don't agree (check B). */
const PLURAL =
  /(?<![\d.,$/])\b(?:1 (?:tens|ones|hundreds|groups|bills|feet|inches|cubes|rows|jumps|triangles|clips|wholes)\b|(?:0|[2-9]|\d\d+) (?:ten|one|hundred|group|bill|foot|inch|row|jump|clip|whole(?= and|[.,;:)]|$))\b(?![-\w]))/;

/** Formatting the copy editor checks (check J). */
const FORMAT: [RegExp, string][] = [
  [/\d -\s?\d|\d - \d/, 'hyphen for minus (use −)'],
  [/\d x \d/, 'x for times (use ×)'],
  [/\*/, '* for times (use ×)'],
  [/\d \/ \d/, '/ for division (use ÷, or a fraction with no spaces)'],
  [/"/, 'straight double quotes (use “ ”)'],
  [/\w'\w/, 'straight apostrophe (use ’)'],
  [/  (?!\S*$)/, 'double space'],
  [/\.\./, 'double period (use …)'],
  [/\d\.0(?![\d%])/, 'trailing .0'],
  [/\s[,.;:]/, 'space before punctuation'],
];

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Words to read: numbers, operators, "?" and "…" in a number sentence don't count. */
const words = (s: string) => s.split(/\s+/).filter((w) => /[A-Za-z]{2,}|\b[aI]\b/.test(w)).length;

/**
 * "=" joining a number to a phrase ("4 = full tens in 45"), which K–2 reads as a rule in
 * letters. A number sentence (8 + 5 = 13) or a rule in words with an operator ("Bigger −
 * smaller = how many more") is fine (check K).
 */
function equalsJoinsWords(line: string): boolean {
  if (!line.includes(' = ')) return false;
  const sides = line.split(' = ').map((side) => side.replace(/^[^:]*: /, '').trim());
  const bareNumber = sides.some((side) => /^[$]?\d+[¢%]?$/.test(side));
  const phrase = sides.some((side) => /[A-Za-z]/.test(side) && !/\d|[+−×÷]/.test(side));
  return bareNumber && phrase;
}

/** Everything a student reads in a module, by where it is shown. */
function studentText(m: ModuleDef) {
  const example = m.example;
  const prose: { where: string; text: string }[] = [];
  m.assumptions.forEach((a, i) => prose.push({ where: `assumption ${i + 1}`, text: a }));
  if (m.use) prose.push({ where: 'use', text: m.use });
  for (const [rel, texts] of Object.entries(m.steps)) {
    for (const [id, t] of Object.entries(texts)) {
      const how = typeof t.how === 'function' ? t.how(example) : t.how;
      prose.push({ where: `how (${rel}, ${id})`, text: how });
    }
  }
  const labels = [
    ...(m.title ? [{ where: 'title', text: m.title }] : []),
    ...m.variables.map((v) => ({ where: `name ${v.id}`, text: v.name })),
  ];
  // The formula box: numbers for K–5 (the rule in words under them from Grade 3), letters
  // from Grade 6.
  const band = gradeBand(m.id);
  const box = m.relations.flatMap((r) => [
    {
      where: `number sentence ${r.id}`,
      text:
        band === 'standard'
          ? renderTemplate(r.display, m.variables)
          : agree(renderTemplate(r.display, m.variables, example)),
    },
    ...(band === 'elementary'
      ? [{ where: `rule ${r.id}`, text: renderTemplate(r.display, namedVariables(m.variables)) }]
      : []),
  ]);
  // The walkthrough from the opening values, as the student reads it.
  const w = buildSteps(
    m,
    solve(
      m,
      m.startWith.map((id) => ({ id, value: example[id]! })),
    ),
  );
  const walk: { where: string; text: string }[] = [
    ...w.given.map((q) => ({ where: 'we know', text: q.label })),
    ...w.find.map((q) => ({ where: 'find', text: q.ask })),
    ...w.steps.flatMap((s) => [
      { where: `step ${s.id} heading`, text: s.heading },
      ...(s.lead.sentence ? [{ where: `step ${s.id} sentence`, text: s.lead.sentence }] : []),
      ...(s.lead.formula ? [{ where: `step ${s.id} formula`, text: s.lead.formula }] : []),
      ...s.lines.map((line) => ({ where: `step ${s.id} line`, text: line })),
      { where: `step ${s.id} answer`, text: s.answer },
    ]),
    ...w.check.map((k) => ({ where: 'check', text: k.formula })),
    ...(w.nextHint ? [{ where: 'next', text: w.nextHint }] : []),
  ];
  return { prose, labels, box, walk, all: [...prose, ...labels, ...box, ...walk] };
}

describe.each(TESTED_MODULES.map((m) => [m.id, m] as [string, ModuleDef]))(
  'standards for %s',
  (_, m) => {
    const grade = gradeOf(m.id);
    const band = gradeBand(m.id);
    const text = studentText(m);
    const example = m.example;
    const failures = (
      items: { where: string; text: string }[],
      test: (t: string) => string | false | undefined,
    ) =>
      items.flatMap(({ where, text: t }) => {
        const why = test(t);
        return why ? [`${where}: ${why} — "${t}"`] : [];
      });

    it('shows no broken numbers or number words', () => {
      expect(
        failures(text.all, (t) =>
          BAD_VALUE.test(t) ? 'broken value' : PLURAL.test(t) ? 'number and word disagree' : false,
        ),
      ).toEqual([]);
    });

    it('is formatted the way the copy editor expects', () => {
      expect(failures(text.all, (t) => FORMAT.find(([re]) => re.test(t))?.[1] ?? false)).toEqual(
        [],
      );
    });

    it('ends sentences and labels the right way', () => {
      expect(
        failures(text.prose, (t) => (/[.!?”…]$/.test(t) ? false : 'sentence needs a period')),
      ).toEqual([]);
      expect(
        failures(text.labels, (t) => (/\.$/.test(t) ? 'no period on a label' : false)),
      ).toEqual([]);
      expect(
        failures(
          text.labels.filter((l) => l.where !== 'title'),
          (t) => (words(t) > 7 ? 'name too long' : false),
        ),
      ).toEqual([]);
    });

    it('reads at the grade level (sentence length)', () => {
      const limit = wordLimit(grade);
      if (limit === undefined) return;
      expect(
        failures(text.prose, (t) => {
          const long = sentences(t).find((s) => words(s) > limit);
          return long ? `${words(long)} words, limit ${limit}` : false;
        }),
      ).toEqual([]);
    });

    it('uses no shorthand or jargon the grade has not met', () => {
      if (band === 'standard' && grade === undefined) return;
      expect(
        failures(text.all, (t) =>
          SHORTHAND.test(t)
            ? 'shorthand'
            : grade !== undefined && grade !== 'K' && Number(grade) > 3
              ? false
              : JARGON_K3.test(t)
                ? 'jargon'
                : false,
        ),
      ).toEqual([]);
    });

    it('uses only notation the grade has met', () => {
      if (band === 'standard') return;
      const early = band === 'early';
      expect(
        failures(text.all, (t) =>
          /(^|[\s(])−\d|\(-\d/.test(t)
            ? 'negative number before Grade 6'
            : early && /[×÷]/.test(t)
              ? '× or ÷ before Grade 3'
              : early && /\d\/\d/.test(t)
                ? 'a fraction before Grade 3'
                : LETTERS.test(t)
                  ? 'a letter standing for a number before Grade 6'
                  : early && equalsJoinsWords(t)
                    ? '"=" outside a number sentence (K–2)'
                    : false,
        ),
      ).toEqual([]);
    });

    it('names things in words, not letters, in K–2', () => {
      if (band !== 'early') return;
      expect(
        failures(
          text.labels.filter((l) => l.where !== 'title'),
          (t) => (LONE_CAPITAL.test(t) ? 'a letter names a thing (say first, second)' : false),
        ),
      ).toEqual([]);
    });

    it('makes no claim about the units menu (whole-number lengths keep their number)', () => {
      expect(
        failures(text.prose, (t) => (/units menu/i.test(t) ? 'talks about the units menu' : false)),
      ).toEqual([]);
    });

    it('works every step out from a rule, never by trying numbers', () => {
      const w = buildSteps(
        m,
        solve(
          m,
          m.startWith.map((id) => ({ id, value: example[id]! })),
        ),
      );
      expect(w.steps.filter((s) => /Try numbers/.test(s.how)).map((s) => s.id)).toEqual([]);
    });

    it('has about as many values as the grade can hold', () => {
      const limit = valueLimit(grade);
      // Derived values are read-only boxes the lesson fills in, not values the student holds.
      if (limit !== undefined)
        expect(m.variables.filter((v) => !v.derived).length).toBeLessThanOrEqual(limit);
    });
  },
);
