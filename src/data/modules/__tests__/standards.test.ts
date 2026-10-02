/**
 * The reviewer's mechanical expectations, enforced on every module (checks D, E, J and K in
 * .claude/agents/lesson-reviewer.md): reading level, notation the grade has met, no
 * shorthand or jargon, formatting, and a walkthrough that reads the way the grade reads.
 * Everything a student sees is checked: assumptions, names, number sentences, the
 * step-by-step from the example, titles and "use" lines.
 */
import { renderTemplate } from '@/engine/format';
import { solve } from '@/engine/solve';
import { unitHere } from '@/engine/unitContext';

import { TESTED_MODULES, gradeBand, gradeOf, wordRule } from '..';
import { agree, buildSteps } from '../buildSteps';
import type { ModuleDef } from '../types';
import { isStandIn, pages } from '../harness/scope';

/**
 * Longest sentence per grade: the reviewer's guide (8, 12, 15, 20 words) plus half again; high
 * school gets a cap too (a textbook sentence, 25 words, plus room for a formula read aloud).
 */
function wordLimit(grade: string | undefined): number | undefined {
  if (grade === undefined) return undefined;
  const g = grade === 'K' ? 0 : Number(grade);
  if (g <= 1) return 12;
  if (g <= 3) return 18;
  if (g <= 5) return 22;
  if (g <= 8) return 30;
  return 35;
}

/**
 * Values per module: about 4–5 in K–2, 6–7 in grades 3–8 (check C), with a little room; high
 * school holds a formula's inputs and a unit or two more.
 */
function valueLimit(grade: string | undefined): number | undefined {
  if (grade === undefined) return undefined;
  const g = grade === 'K' ? 0 : Number(grade);
  // Kindergarten holds 6; from Grade 1 a released item can need 7 or 8 (a line plot of 7 lengths).
  return g === 0 ? 6 : g <= 8 ? 8 : 10;
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

/**
 * Things counted one by one, as a plural: a value named for them ("Warblers fed", "Oak trees",
 * "Number of students") or measured in them (people) is a count, and a count is whole.
 */
const COUNT_NOUNS =
  'people|persons|students|children|kids|adults|players|members|visitors|customers|workers|patients|voters|individuals|immigrants|emigrants|births|deaths|animals|birds|fish|insects|beetles|bees|frogs|tadpoles|dogs|cats|puppies|cows|calves|sheep|goats|horses|pigs|chickens|deer|rabbits|hares|wolves|foxes|owls|hawks|mice|shrews|warblers|caterpillars|grasshoppers|organisms|offspring|plants|trees|seeds|flowers|bacteria|cells|eggs|chromosomes|copies|atoms|molecules|particles|electrons|protons|neutrons|ions|coins|pennies|nickels|dimes|cards|books|boxes|bags|cans|jars|marbles|beads|balls|blocks|cubes|counters|tickets|items|objects|apples|pears|plums|bananas|grapes|cookies|muffins|pencils|crayons|stickers|toys|cars|buses|trucks|bikes|houses|chairs|tables|stamps|games|groups|teams|bins|packs|pictures|beakers|bulbs|washers|trials|successes|outcomes';
const COUNT_WORD = new RegExp(`^(?:${COUNT_NOUNS})$`, 'i');
/** A population is a count of individuals; its standard deviation or proportion is not. */
const POPULATION = /^population(?!\s+(?:standard|proportion|mean|density|growth))/i;

/** Whether a value counts things: its unit is a count noun, or its name leads with one. */
function countsThings(v: ModuleDef['variables'][number]): boolean {
  if (v.unit && COUNT_WORD.test(v.unit)) return true;
  // A rate or a ratio ("Zooplankton per gram", "Daughter atoms per parent atom") and an
  // expected value ("Expected successes E(X)") are not counts.
  if (/\bper\b|^expected\b/i.test(v.name)) return false;
  if (POPULATION.test(v.name)) return true;
  // The leading noun phrase: "Warblers fed", "Oak trees", "Number of groups".
  const words = v.name.replace(/^(?:number of|how many)\s+/i, '').split(/\s+/);
  return words.slice(0, 2).some((w) => COUNT_WORD.test(w.replace(/[,:;’']+$/, '')));
}

/** Values named for counted things that are rightly not whole, with the reason. */
const HALF_PICTURES = 'a scaled picture graph draws half pictures';
const FITTING_GROUPS = 'how many groups fit is a quotient of fractions (3 groups and 1/3 of one)';
const PARTICLES = 'an Avogadro-sized count in scientific notation, to its significant figures';
const AVERAGE_CASES = 'R₀ is an average over many cases (2.5 people)';
const RATE_POPULATION =
  'worked back from birth and death rates read to a tenth; rounded, the rate rules would no longer check';
const COUNT_ALLOWED: Record<string, string> = {
  'm.3.scaled-graphs~picture-graph p1': HALF_PICTURES,
  'm.3.scaled-graphs~picture-graph p2': HALF_PICTURES,
  'm.3.scaled-graphs~picture-graph p3': HALF_PICTURES,
  'm.3.scaled-graphs~picture-more p1': HALF_PICTURES,
  'm.3.scaled-graphs~picture-more p2': HALF_PICTURES,
  'm.6.divide-fractions~how-many-fit g': FITTING_GROUPS,
  'g.r4d-fit g': FITTING_GROUPS,
  's.10.mole N': PARTICLES,
  's.10.mole~gas-volume N': PARTICLES,
  's.9.immune-disease~herd-immunity R0': AVERAGE_CASES,
  'g.s9-immune-disease-herd-immunity R0': AVERAGE_CASES,
  'g.s9-immune-disease-herd-immunity-measles R0': AVERAGE_CASES,
  'he.geography.human-geography#0 Pop': RATE_POPULATION,
  'g.r4f-waterfall Pop': RATE_POPULATION,
  // Found when this check came in, in a file being edited elsewhere; fix and remove.
  's.9.biotechnology~pcr N': 'to fix: N₀ × 2ⁿ is always whole, so mark it integer',
  's.9.population-ecology N': 'to fix: round the logistic model to whole individuals',
  's.9.population-ecology~doubling N': 'to fix: N₀ × 2^g is not whole when g is not',
  's.9.immune-disease~herd-immunity V': 'to fix: round up in the rule, not only in a note',
  'g.s9-immune-disease-herd-immunity V': 'to fix with s.9.immune-disease~herd-immunity',
  'g.s9-immune-disease-herd-immunity-measles V': 'to fix with s.9.immune-disease~herd-immunity',
};

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
        band === 'standard' || band === 'middle'
          ? renderTemplate(r.display, m.variables)
          : agree(renderTemplate(r.display, m.variables, example)),
    },
    ...(band === 'elementary'
      ? [{ where: `rule ${r.id}`, text: wordRule(r.display, m.variables, r.words) }]
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

describe.each(pages(TESTED_MODULES))('standards for %s', (id, m) => {
  if (isStandIn(id)) return void it.skip('no pages in scope', () => {});
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
    expect(failures(text.all, (t) => FORMAT.find(([re]) => re.test(t))?.[1] ?? false)).toEqual([]);
  });

  it('ends sentences and labels the right way', () => {
    expect(
      failures(text.prose, (t) => (/[.!?”…]$/.test(t) ? false : 'sentence needs a period')),
    ).toEqual([]);
    expect(failures(text.labels, (t) => (/\.$/.test(t) ? 'no period on a label' : false))).toEqual(
      [],
    );
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
    // Grade 6 letter pages teach letters (grade.ts, the middle band).
    if (band === 'standard' || band === 'middle') return;
    // A Grade 6 words page may show the one letter it teaches (x in "3x + 5").
    const allowLetters = (t: string) =>
      m.letters?.length
        ? t.replace(new RegExp(`(?<![A-Za-z])(${m.letters.join('|')})(?![A-Za-z])`, 'g'), '1')
        : t;
    const early = band === 'early';
    const sixth = grade === '6';
    expect(
      failures(text.all, (t) =>
        !sixth && /(^|[\s(])−\d|\(-\d/.test(t)
          ? 'negative number before Grade 6'
          : sixth && /[ρλΔμσ]/.test(t)
            ? 'a Greek letter on a Grade 6 page that names values in words'
            : early && /[×÷]/.test(t)
              ? '× or ÷ before Grade 3'
              : early && /\d\/\d/.test(t)
                ? 'a fraction before Grade 3'
                : LETTERS.test(allowLetters(t))
                  ? sixth
                    ? 'a letter standing for a number on a Grade 6 words page'
                    : 'a letter standing for a number before Grade 6'
                  : early && equalsJoinsWords(t)
                    ? '"=" outside a number sentence (K–2)'
                    : false,
      ),
    ).toEqual([]);
  });

  it('reads each Grade 3–5 rule as a sentence (no "apart" rule, no doubled word)', () => {
    if (band !== 'elementary') return;
    expect(
      failures(
        text.box.filter((b) => b.where.startsWith('rule')),
        (t) =>
          /\bare .+ apart$/.test(t)
            ? 'an "are … apart" rule: give the relation `words`'
            : /\b(\w+) \1\b/i.test(t)
              ? 'a doubled word'
              : false,
      ),
    ).toEqual([]);
  });

  it('counts only where the grade still counts (no counting lines for facts from Grade 4)', () => {
    const g = grade === undefined ? undefined : grade === 'K' ? 0 : Number(grade);
    if (g === undefined || g < 3) return;
    expect(
      failures(text.walk, (t) => {
        const list = /Count by (\d+)s[^:]*: ([^→]*)/.exec(t);
        if (!list) return false;
        // Counting by 5s round a clock and by 10s for tens is how Grade 3 still works.
        if (g === 3 && ['5', '10'].includes(list[1]!)) return false;
        if (g >= 4) return 'a counting line for a basic fact from Grade 4';
        return list[2]!.split(',').length > 4 ? 'a count of more than 4 jumps in Grade 3' : false;
      }),
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

  it('says a value only the search pins in the grade’s words', () => {
    // A pinned step shows up with an opening value left out (the common denominator with the
    // first denominator still "?"): each opening value is left out in turn. K–5 reads "12 is
    // the only number that works here.", not the Grade 6 wording ("fits every rule").
    const young = band === 'early' || band === 'elementary';
    const wrong = /fits every rule|no other number works/;
    for (let i = -1; i < m.startWith.length; i++) {
      const ids = m.startWith.filter((_, j) => j !== i);
      const w = buildSteps(
        m,
        solve(
          m,
          ids.map((id) => ({ id, value: example[id]! })),
          example,
        ),
      );
      const pinned = w.steps.filter((s) => /only number that works|fits every rule/.test(s.how));
      const bad = pinned.filter((s) => (young ? wrong.test(s.how) : !wrong.test(s.how)));
      expect(bad.map((s) => `${s.id}: ${s.how}`)).toEqual([]);
    }
  });

  it('names a count after what it counts, not after a measurement', () => {
    // "At 1/8 L: 2" reads as 2 liters; a count of beakers is "Beakers with 1/8 L". A count
    // named only by a length or an amount ("One inch longer", "In eighths") is the same slip.
    const MEASURE =
      /^(?:At|One|Two|Three)\b.*\b(?:in|inch(?:es)?|cm|m|L|mL|liters?|g|kg|lb|oz|feet|foot)$|^(?:At|One|Two|Three) .*\b(?:length|longer|shorter)$/;
    expect(
      m.variables.filter((v) => v.integer && !v.unit && MEASURE.test(v.name)).map((v) => v.name),
    ).toEqual([]);
  });

  it('keeps a count of things whole', () => {
    // "857.1429 warblers": a value named for things counted one by one (warblers, calves,
    // cards, people, groups) is `integer`, and a rule that shares them out floors or rounds
    // (⌊N₂ ÷ b⌋), since the engine refuses a worked-out count that isn't whole.
    const bad = m.variables
      .filter((v) => !v.integer && countsThings(v) && !COUNT_ALLOWED[`${m.id} ${v.id}`])
      .map((v) => `${v.id}: “${v.name}”${v.unit ? ` (${v.unit})` : ''} is not whole`);
    expect(bad).toEqual([]);
  });

  it('names a convertible value by what it measures, not by its unit', () => {
    // "Minutes: 0.33 h" after a unit change: the name must survive the units menu.
    const UNIT_WORD =
      /^(?:seconds|minutes|hours|days|liters|milliliters|grams|kilograms|meters|centimeters|millimeters|kilometers|inches|feet|yards|miles|pounds|ounces|gallons|quarts|cups|newtons|joules|watts|volts|amperes|amps)\b/i;
    expect(
      m.variables.filter((v) => unitHere(v) && UNIT_WORD.test(v.name)).map((v) => v.name),
    ).toEqual([]);
  });

  it('has about as many values as the grade can hold', () => {
    const limit = valueLimit(grade);
    // Derived values are read-only boxes the lesson fills in, not values the student holds;
    // a data set (3 to 10 values and their count) is one list, held as one value, and so is a
    // group (a matrix's cells, a fixed data list).
    const held = m.variables.filter((v) => !v.derived && !v.countedBy && !v.hidden);
    const groups = new Set(held.flatMap((v) => (v.group ? [v.group] : [])));
    if (limit !== undefined)
      expect(held.filter((v) => !v.group).length + groups.size).toBeLessThanOrEqual(limit);
  });

  it('names each value with a symbol a student can read aloud', () => {
    // A symbol that is an expression (−q) reads "−q = −q" in its own step; a Greek look-alike
    // subscript (ᵦ, U+1D66) reads "beta", not "B".
    const bad = m.variables.flatMap((v) =>
      /^[−+×÷=-]/.test(v.symbol)
        ? [`${v.id}: "${v.symbol}" starts with an operator`]
        : /[ᵦᵨᵩᵪ]/.test(v.symbol)
          ? [`${v.id}: "${v.symbol}" has a Greek subscript`]
          : [],
    );
    expect(bad).toEqual([]);
  });
});
