import { CHOICE_BOX, choiceOf, choiceSign, codeLabel } from '@/engine/choices';
import {
  dollarsOf,
  formatNumber,
  lowerFirst,
  parseNumber,
  plainDigits,
  renderTemplate,
  significant,
  superscript,
  unitFor,
} from '@/engine/format';
import { holds, outOfCount, type SolveResult } from '@/engine/solve';
import type { Values, VariableDef } from '@/engine/types';
import { makeUnitContext, type UnitContext } from '@/engine/unitContext';
import { getUnit } from '@/engine/units';

import {
  gradeBand,
  gradeOf,
  quantityLabel,
  withWorkedFigures,
  wordRule,
  workedFigures,
  type GradeBand,
} from './grade';
import { evaluatePrinted, operationCount, simplifyChain } from './simplify';
import type { ModuleDef } from './types';
import { factWork } from './work';
import { autoWritten, type Written } from './written';

export interface Quantity {
  id: string;
  symbol: string;
  name: string;
  /** e.g. "12 cm²" or "?" */
  value: string;
  /** As listed for the grade: "First group: 3" (K–5) or "r = 3". */
  label: string;
  /** As named in "Find": "first group" (K–5) or "rows (r)". */
  ask: string;
}

export interface Step {
  id: string;
  /** "Find w", i.e. the variable's name */
  title: string;
  /** The relation used, symbolically: "A = l × w" */
  formula: string;
  /** The relation with the numbers known at this step and "?" for the one found: "3 + ? = 7". */
  sentence: string;
  how: string;
  /** "w = A ÷ l" (omitted when solved numerically) */
  rearranged?: string;
  /** "w = 12 ÷ 4" */
  substituted?: string;
  /** Worked arithmetic between the substituted line and the result. */
  work?: string[];
  /** "w = 3 cm" */
  result: string;
  /** "Find width (w)"; K–5: "Find width". */
  heading: string;
  /**
   * What the box opens with: the number sentence with "?" (K–5, first) and the rule, in words
   * for Grades 3–5 ("Length × width = area") and in letters from Grade 6. K–2 sees no rule.
   */
  lead: { sentence?: string; formula?: string };
  /** The lines shown in the box, in order, before the answer (grade-appropriate wording). */
  lines: string[];
  /** The work set out on paper (a column sum, a long-division bracket), when the grade writes one. */
  written?: Written;
  /** How many of `lines` come before the written work (the substituted line, when shown). */
  writtenAfter: number;
  /** The answer line as shown: "First group: 3" (K–2), "Width = 3 cm" (3–5) or "w = 3 cm". */
  answer: string;
}

export interface Walkthrough {
  /** How the text talks to the student (see grade.ts). */
  band: GradeBand;
  given: Quantity[];
  find: Quantity[];
  steps: Step[];
  /** Every relation with the final numbers plugged in (only relations with all values known). */
  check: { formula: string; ok: boolean }[];
  /** Variables still unknown. */
  missing: Quantity[];
  /**
   * When the formulas don't hold directly in the chosen units: each entered value converted
   * into the formula's units before solving, and each answer converted back afterwards.
   */
  convertIn: string[];
  convertOut: string[];
  /** The formula units the steps are worked in, when conversion was needed ("cm, cm²"). */
  workingUnits?: string;
  /** "Type one more number: first group, second group." when values are still missing. */
  nextHint?: string;
  /** What a failed check line says: "✗", or for K–2 "≠  try another number". */
  checkFail: string;
}

/** A line with brackets or words after "x =": the work lines say it better for K–2. */
type LineVars = readonly (VariableDef & { scientificFigures?: number })[];

/** The largest number printed in a line (its terms set how near 0 its sides can come). */
const largest = (text: string) =>
  Math.max(0, ...(plainDigits(text).match(/\d+(?:\.\d+)?/g) ?? []).map(Number));

/** Two sides of a printed line that agree: within 10⁻³, or a millionth of its largest term. */
const agreeIn = (a: number, b: number, text: string) =>
  Math.abs(a - b) <= 1e-3 * Math.max(Math.abs(a), Math.abs(b)) + 1e-6 * largest(text) + 1e-9;

/** Whether `x` to the page's figures is `shown` (162.3 → 162: true as a 3-figure value). */
const roundsTo = (x: number, shown: number, figures: number | undefined) =>
  figures !== undefined && Number(parseNumber(significant(x, figures))) === shown;

/** A lone number as printed (7,540; −2.5; 1.57 × 10⁻¹), not an expression. */
const LONE = /^[−-]?[\d,]+(?:\.\d+)?(?: × 10[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)?$/;

/**
 * Whether a printed line's sides (each part between " = " that is plain arithmetic) disagree;
 * undefined when no two sides side by side can be worked out.
 */
const lineOff = (text: string) => {
  const parts = text.split(' = ').map(evaluatePrinted);
  let read = false;
  for (let i = 0; i + 1 < parts.length; i++) {
    const [a, b] = [parts[i], parts[i + 1]];
    if (a === undefined || b === undefined) continue;
    if (!agreeIn(a, b, text)) return true;
    read = true;
  }
  return read ? false : undefined;
};

/**
 * A line as printed from the first set of line values that makes it true as printed (`off`
 * says when it is not): the values as their boxes show them, then with more figures. A line
 * that nearly cancels (tan(2 × 45.0005°) = 634.06 ÷ (999.99 − 1000)) needs the most. One that
 * no set makes true, or that can't be worked out here (`off` undefined: arcsin(0.417)), keeps
 * its decimals' extra figures (`unread`), as lines were printed before they were checked.
 */
const firstTrue = (
  render: (vars: LineVars) => string,
  sets: readonly LineVars[],
  off: (line: string) => boolean | undefined,
  unread: LineVars,
) => {
  const first = render(sets[0]!);
  const firstOff = off(first);
  if (firstOff === undefined) return render(unread);
  if (!firstOff) return first;
  for (const vs of sets.slice(1)) {
    const line = render(vs);
    if (!off(line)) return line;
  }
  return render(unread);
};

/**
 * A check line as printed, from the first set of line values that makes it true: its sides
 * agree, or its left side is a value shown to the page's figures that the right side rounds
 * to (161 = 0.129 × 1250, which is 161.25).
 */
const checkLine = (
  display: string,
  sets: readonly LineVars[],
  unread: LineVars,
  values: Values,
  figures: number | undefined,
) =>
  firstTrue(
    (vs) => renderTemplate(display, vs, values),
    sets,
    (line) => {
      const sides = line.split(' = ');
      if (sides.length !== 2) return false;
      const [a, b] = sides.map(evaluatePrinted);
      if (a === undefined || b === undefined) return undefined;
      return !(agreeIn(a, b, line) || (LONE.test(sides[0]!) && roundsTo(b, a, figures)));
    },
    unread,
  );

/**
 * Grades 9–12 add a list at once: "(10 + 75 + 200) ÷ 25" goes straight to "285 ÷ 25", not
 * through "85 + 200". A stage that only adds two numbers is dropped when the next one does too.
 */
const sumsAtOnce = (lines: string[], start: string, grade: string) => {
  if (!['9', '10', '11', '12'].includes(grade)) return lines;
  const ops = (l: string) =>
    l
      .replace(/[⁻⁰¹²³⁴-⁹]+/g, '^')
      .replace(/sin|cos|tan/g, '√')
      .replace(/[^×÷√^·]/g, '').length;
  const adds = (l: string) => l.match(/ [+−] /g)?.length ?? 0;
  const adding = (from: string, to: string) => ops(from) === ops(to) && adds(to) === adds(from) - 1;
  return lines.filter((l, i) => {
    const next = lines[i + 1];
    return !(next && adding(lines[i - 1] ?? start, l) && adding(l, next));
  });
};

const wordy = (line: string) => /[(]|[a-z]{3,}/i.test(line.replace(/^\S+ = /, ''));

// An acronym keeps its capitals: "MAD of class A" stays, it never reads "mAD".

/**
 * Builds the step-by-step explanation of how `result` was reached from the entered values.
 * If the formulas hold in the chosen units, the steps are worked in those units; otherwise
 * values are converted to the formula's units first and the answers converted back.
 */
/** Singular forms of word units, for a value of 1 ("1 cup", "1 cube"). */
const SINGULAR: Record<string, string> = {
  cups: 'cup',
  cubes: 'cube',
  'square units': 'square unit',
  'cubic units': 'cubic unit',
  units: 'unit',
  inches: 'inch',
  meters: 'meter',
  centimeters: 'centimeter',
  feet: 'foot',
  days: 'day',
  hours: 'hour',
  years: 'year',
};

/** Count words that take the singular after 1 ("1 ten", "1 row"), and never after "$1". */
const COUNT_WORDS: Record<string, string> = {
  wholes: 'whole',
  tens: 'ten',
  ones: 'one',
  hundreds: 'hundred',
  thousands: 'thousand',
  rows: 'row',
  times: 'time',
  places: 'place',
  groups: 'group',
  clips: 'clip',
  marks: 'mark',
  jumps: 'jump',
  feet: 'foot',
  inches: 'inch',
  meters: 'meter',
  centimeters: 'centimeter',
  cubes: 'cube',
  cups: 'cup',
  bills: 'bill',
  fives: 'five',
  triangles: 'triangle',
  rounds: 'round',
  dollars: 'dollar',
  quarters: 'quarter',
  dimes: 'dime',
  nickels: 'nickel',
  pennies: 'penny',
  trapezoids: 'trapezoid',
  rhombuses: 'rhombus',
  coins: 'coin',
  'half hours': 'half hour',
  days: 'day',
  hours: 'hour',
  years: 'year',
  pushes: 'push',
  spaces: 'space',
  seconds: 'second',
  vibrations: 'vibration',
  carrots: 'carrot',
  layers: 'layer',
  sheets: 'sheet',
  kinds: 'kind',
  stages: 'stage',
  weeks: 'week',
  children: 'child',
};
/** "1 tens" → "1 ten" in rendered text (templates can't tell the count in advance). */
export const agree = (text: string) =>
  text
    .replace(
      new RegExp(`(^|[^\\d$.,])1 (${Object.keys(COUNT_WORDS).join('|')})\\b`, 'g'),
      (_, pre: string, word: string) => `${pre}1 ${COUNT_WORDS[word]}`,
    )
    // "1 $10 bills" → "1 $10 bill"
    .replace(/(^|[^\d$.,])1 (\$\d+[\s\u00a0])bills\b/g, '$11 $2bill');

const givenIdsOf = (result: SolveResult) => result.given.map((g) => g.id);

export function buildSteps(
  module: ModuleDef,
  result: SolveResult,
  units: UnitContext = makeUnitContext(module, { system: 'metric' }),
): Walkthrough {
  const vars = module.variables;
  const byId = new Map(vars.map((v) => [v.id, v]));
  const band = gradeBand(module.id);
  const grade = gradeOf(module.id);
  const figures = workedFigures(module);
  const early = band === 'early';
  /**
   * K–2: "a = 7 − 4" → "7 − 4", "a = 3" → "First group: 3" (the name, not the letter).
   * Grades 3–5: "A = 4 × 3" → "Area = 4 × 3" (words in the equation, no letters yet).
   */
  const plain = (line: string, id: string, keepName: boolean) => {
    const v = byId.get(id);
    if (band === 'standard' || band === 'middle' || !v || !line.startsWith(`${v.symbol} = `))
      return line;
    const rest = line.slice(v.symbol.length + 3);
    if (band === 'elementary') return `${v.name} = ${rest}`;
    return keepName ? `${v.name}: ${rest}` : rest;
  };
  /** The variable a conversion line is about ("a = 12 in = 30.48 cm …"). */
  const convertedId = (line: string) =>
    vars.find((v) => line.startsWith(`${v.symbol} = `))?.id ?? '';
  const relations = new Map(module.relations.map((r) => [r.id, r]));
  const direct = units.coherent;

  const shownValue = (id: string) => units.toDisplay(id, result.values[id]!);
  const shownUnit = (id: string) => units.display[id];
  const formulaUnit = (id: string) => byId.get(id)!.unit;
  const needsConversion = (id: string) => (shownUnit(id) ?? '') !== (formulaUnit(id) ?? '');
  /**
   * Formats a value with its unit. Whole-number rounding applies only to values in the shown
   * unit (lesson numbers), never to the same value converted into formula units.
   */
  const fmt = (id: string, x: number, unit: string | undefined, inShownUnit = true) => {
    const v = byId.get(id);
    // A typed value reads as typed (36.525); `figures` and the page's worked figures round
    // only worked-out values (the working lines keep their extra figures).
    const typed = result.given.some((g) => g.id === id);
    const shownAs = (w: VariableDef) =>
      typed
        ? { ...w, digits: undefined, figures: undefined }
        : withWorkedFigures({ ...w, digits: undefined }, figures);
    // An exact value (√2/2, (−3 + √17)/4) is worked from the values the steps show.
    const exactValues = inShownUnit && direct ? working : undefined;
    let n = formatNumber(x, inShownUnit && v ? { ...shownAs(v), values: exactValues } : undefined);
    // A root written exactly says its decimal beside it: √2/2 ≈ 0.7071.
    if (inShownUnit && v?.exact && n.includes('√'))
      n = `${n} ≈ ${formatNumber(x, shownAs({ ...v, exact: undefined, fraction: undefined }))}`;
    if (!unit) return n;
    // $ goes before the number; ¢ right after it; word units in the singular for 1 ("1 cup").
    if (unit === '$') return dollarsOf(x, n);
    if (unit === '¢' || unit === '°' || unit === '%' || unit === '×') return `${n}${unit}`;
    return `${n} ${x === 1 ? (SINGULAR[unit] ?? unitFor(1, unit)) : unit}`;
  };
  /** Variables for filling formulas with working values (no whole-number rounding if converted). */
  const workVars = direct ? vars : vars.map((v) => ({ ...v, integer: false }));

  /** Values and units the steps are worked in. */
  // Whole-number lesson values stay whole in any unit (13 in, not 13.000000000000002 in).
  const workValue = (id: string) => {
    if (!direct) return result.values[id]!;
    const x = shownValue(id);
    return byId.get(id)?.integer ? Math.round(x) : x;
  };
  const workUnit = (id: string) => (direct ? shownUnit(id) : formulaUnit(id));
  const working: Values = Object.fromEntries(
    Object.keys(result.values).map((id) => [id, workValue(id)]),
  );

  /**
   * A sign chosen in the equation row reads as the sign, never its code: "Hₐ: p ≠ p₀" (the
   * row itself when the choice is its only box), else "s: >".
   */
  const choiceLabel = (id: string) => {
    // A coded value reads as its meaning: "Hₐ: β ≠ 0", never "Hₐ = 0".
    const v = byId.get(id)!;
    const meaning = codeLabel(v, result.values[id]);
    if (meaning !== undefined) return `${v.symbol}: ${meaning}`;
    const choices = choiceOf(module.equation, id);
    const sign = choices && choiceSign(choices, result.values[id]);
    if (!sign) return undefined;
    const line = module.equation!.split('\n').find((l) => l.includes(`{${id}:`))!;
    if (!/\{(?!\w+:(?:sign|relation|op|alt|pm)\})/.test(line))
      return line.replace(CHOICE_BOX, (_, b: string) => (b === id ? sign : '?')).trim();
    return `${byId.get(id)!.symbol}: ${sign}`;
  };
  const quantity = (id: string): Quantity => {
    const v = byId.get(id)!;
    const known = result.values[id] !== undefined;
    const value = known
      ? (codeLabel(v, result.values[id]) ?? fmt(id, shownValue(id), shownUnit(id)))
      : '?';
    return {
      id,
      symbol: v.symbol,
      name: v.name,
      value,
      label: choiceLabel(id) ?? quantityLabel(band, v.name, v.symbol, value),
      ask:
        band === 'standard' || band === 'middle'
          ? `${lowerFirst(v.name)} (${v.symbol})`
          : lowerFirst(v.name),
    };
  };

  // Values known before each step: the entered ones, then each answer as it is found.
  const known: Values = Object.fromEntries(givenIdsOf(result).map((id) => [id, working[id]!]));
  /** The values the student typed (exact as shown). */
  const typed = new Set(givenIdsOf(result));
  /**
   * The lines' values: a worked-out one reads to the page's figures (5.93 × 10⁶, 7,540, as its
   * box and answer show it), a typed one as typed; a line whose printed numbers don't then come
   * out as printed takes more figures (`lineSets`, from the page's up to 8). (A value with a
   * display of its own keeps it, as `withWorkedFigures` leaves it.)
   */
  const shownAt = (n: number) =>
    workVars.map((w) =>
      typed.has(w.id) || withWorkedFigures(w, figures).worked === undefined
        ? w
        : { ...w, worked: n, scientificFigures: undefined },
    );
  const fine = workVars.map((w) => ({ ...w, figures: 8, scientificFigures: undefined }));
  const lineSets: LineVars[] =
    figures === undefined
      ? [workVars, fine]
      : [...Array.from({ length: Math.max(1, 9 - figures) }, (_, i) => shownAt(figures + i)), fine];
  const lineVars = lineSets[0]!;
  // (a line that can't be worked out: decimals with their extra figures, scientific notation
  // to the page's, as before lines were checked)
  const unread: LineVars =
    figures === undefined
      ? workVars
      : workVars.map((w) =>
          typed.has(w.id) || withWorkedFigures(w, figures).worked === undefined
            ? w
            : { ...w, scientificFigures: figures },
        );
  // Figure-only values are found for the picture, never written as a step.
  const trace = result.trace.filter((t) => !byId.get(t.id)?.hidden);
  const steps = trace.map((t): Step => {
    const knownHere = { ...known };
    known[t.id] = working[t.id]!;
    const v = byId.get(t.id)!;
    const relation = relations.get(t.relation)!;
    const text = module.steps[t.relation]?.[t.id];
    const base = {
      id: t.id,
      // Lowercase only the first letter, so names like “Pencil A” keep their capital.
      // “Find how many more (circles, squares)” would get two sets of brackets: use a colon.
      title: v.name.endsWith(')')
        ? `Find ${lowerFirst(v.name)}: ${v.symbol}`
        : `Find ${lowerFirst(v.name)} (${v.symbol})`,
      formula: renderTemplate(relation.display, vars),
      sentence: agree(
        relation.sentence
          ? relation.sentence(knownHere)
          : renderTemplate(relation.display, lineVars, knownHere),
      ),
      // A p-value under 0.0001 is written "P < 0.0001", never "P = 0".
      result:
        v.belowStep && v.step !== undefined && workValue(t.id) < v.step / 2
          ? `${v.symbol} < ${formatNumber(v.step)}`
          : `${v.symbol} = ${fmt(t.id, workValue(t.id), workUnit(t.id), direct || !needsConversion(t.id))}`,
    };
    // Grade 3–5 boxes open with the number sentence, then the rule in words; K–2 with the
    // sentence only; Grade 6 on with the rule in letters.
    const lead =
      band === 'early'
        ? { sentence: base.sentence }
        : band === 'elementary'
          ? { sentence: base.sentence, formula: wordRule(relation.display, vars, relation.words) }
          : band === 'middle'
            ? // Grade 6 letters: the formula with what its letters mean.
              {
                formula: `${base.formula} (${lowerFirst(wordRule(relation.display, vars, relation.words))})`,
              }
            : { formula: base.formula };
    const heading =
      band === 'standard' || band === 'middle' ? base.title : `Find ${lowerFirst(v.name)}`;
    // Grade 6 letters: the numbers put in with the unknown kept as its letter ("40 = b × 5"),
    // unless the formula already has the unknown alone on one side.
    const isolated =
      relation.display.startsWith(`{${t.id}} =`) || relation.display.endsWith(`= {${t.id}}`);
    const letterSentence = base.sentence.replaceAll('?', v.symbol);
    const answer = plain(base.result, t.id, true);
    // A value only the search pins says so: no formula found it from the values before it.
    const pinnedValue = base.result.startsWith(`${v.symbol} = `)
      ? base.result.slice(v.symbol.length + 3)
      : undefined;
    if (!text || !t.exact) {
      return {
        ...base,
        how: t.pinned
          ? `Only ${pinnedValue ?? 'one number'} fits every rule here: no other number works.`
          : 'Try numbers until both sides match.',
        heading,
        lead,
        lines: [],
        writtenAfter: 0,
        answer,
      };
    }
    // Text functions get the numbers the steps show (the working values), so every line matches.
    const expr = typeof text.expr === 'function' ? text.expr(working) : text.expr;
    const work = typeof text.work === 'function' ? text.work(working) : text.work;
    const rearranged = `${v.symbol} = ${renderTemplate(expr, vars)}`;
    // A line whose printed numbers nearly cancel (1/(1/1 + 1/(−0.994))), or whose shown values
    // are rounded, can miss the answer as printed: it then takes more figures.
    const misses = (line: string) => {
      const x = evaluatePrinted(line);
      const want = working[t.id];
      if (x === undefined || want === undefined) return undefined;
      // (true as printed: the answer it shows, to the page's figures, or within 10⁻³)
      return (
        !agreeIn(x, want, line) &&
        !roundsTo(x, Number(parseNumber(significant(want, figures ?? 1))), figures)
      );
    };
    const substituted = agree(
      `${v.symbol} = ${firstTrue((vs) => renderTemplate(expr, vs, working), lineSets, misses, unread)}`,
    );
    // Lines that only repeat the one before ("c = 4", then "c = 4") are left out.
    const same = (x: string, y: string) => x === y.split(' (')[0];
    const noted =
      text.note && direct ? `${base.result} ${text.note(working)}`.trimEnd() : base.result;
    // A π answer ("V = 90π cm³") also says its decimal, as questions ask for the nearest unit.
    const piValue = v.pi && /\dπ|= π/.test(noted) ? working[t.id] : undefined;
    const result =
      piValue !== undefined
        ? `${noted} (≈ ${formatNumber(Math.round(piValue * 100) / 100)}${workUnit(t.id) ? ` ${workUnit(t.id)}` : ''})`
        : noted;
    const workLines = work?.length
      ? byGrade(
          work.map((line) =>
            agree(firstTrue((vs) => renderTemplate(line, vs, working), lineSets, lineOff, unread)),
          ),
          grade,
        )
      : undefined;
    // "35 + 20" before "35 + 20 = 55" says nothing: the work line carries it.
    const bare = substituted.slice(v.symbol.length + 3);
    // A compare page's first work line ("Tens: 4 < 5, so 45 < 54") is the lesson; the bare
    // "54 − 45" before it would put the subtraction first.
    // "3 + 4" under the question "3 + 4 = ?" only echoes it (K–5 open with the sentence).
    const echo =
      (band === 'early' || band === 'elementary') &&
      (base.sentence === `${bare} = ?` || base.sentence === `? = ${bare}`);
    const repeatedByWork =
      echo ||
      (workLines?.[0]?.startsWith(`${bare} =`) ?? false) ||
      (early && (workLines?.some((l) => /^(Hundreds|Tens|Ones): .*, so /.test(l)) ?? false)) ||
      // K–2: "8 + 2 − 5" in one go is more than the grade reads; the work lines take it apart.
      (early && !!workLines?.length && (bare.match(/ [+−] /g)?.length ?? 0) >= 2);
    const showSubstituted =
      !(same(substituted, base.result) || substituted === rearranged) && !repeatedByWork;
    // Grade 6 letters, unknown not alone: the work lines are the undo steps ("b = 40 ÷ 5").
    const undoByWork = band === 'middle' && !isolated && !!workLines?.length;
    const substitutedShown =
      showSubstituted &&
      !undoByWork &&
      !(band !== 'standard' && band !== 'middle' && workLines?.length && wordy(substituted));
    const letterShown = band === 'middle' && !isolated && letterSentence !== base.sentence;
    // The work on paper: the module's choice, else the grid a student at this grade writes for
    // a plain arithmetic line (beside any work lines, which say the thinking behind it).
    const written =
      text.written === false
        ? undefined
        : text.written
          ? text.written(working)
          : direct && !(module.id.startsWith('s.') && grade === '6')
            ? // Grade 6 science leaves the written grids to math (6.NS.2–3).
              autoWritten(grade, bare)
            : undefined;
    // Grades 3–5: a column sum or difference makes running totals ("300 + 70 = 370") padding;
    // lines with words ("Tens: 40 + 30 = 70") stay as the thinking behind the columns. K–2
    // keep their jumps, which the number line shows.
    const running = (l: string) => /^[\d,]+\S* [+−] [\d,]+\S* = [\d,]+\S*$/.test(l);
    // A price that isn't whole cents is answered "about $3.33": the exact value comes first
    // ("10 ÷ 3 = 3.333") when the inputs are exact, unless a work line already shows it.
    const x = workValue(t.id);
    const exactLine = formatNumber(x);
    const subCent =
      workUnit(t.id) === '$' &&
      Math.abs(x * 100 - Math.round(x * 100)) >= 1e-6 &&
      // Only from typed values: a worked-out one is rounded (12.3636), so the line wouldn't add up.
      [...expr.matchAll(/\{(\w+)\}/g)].every((m) => typed.has(m[1]!)) &&
      !(workLines ?? []).some((l) => l.endsWith(`= ${exactLine}`))
        ? [`${bare} = ${exactLine}`]
        : [];
    const shownWork0 =
      // Grade 2 too, when place lines ("Hundreds: 200 + 100 = 300") say the thinking.
      (band === 'elementary' ||
        (band === 'early' && !!workLines?.some((l) => /^(Hundreds|Tens|Ones): /.test(l)))) &&
      written &&
      /^[\d,]+ [+−]/.test(written.says) &&
      workLines?.some(running)
        ? // A sentence that only led into the jumps ("Start with the bigger number.") goes too.
          workLines.filter((l) => !running(l) && (l.includes('=') || !l.endsWith('.')))
        : workLines;
    const shownWork = subCent.length ? [...(shownWork0 ?? []), ...subCent] : shownWork0;
    // With no work lines or grid, an expression of two or more operations is simplified one
    // stage per line, the way it is written under a formula in class (c = √(9 + 16), c = √25).
    const chain =
      shownWork?.length || written || !showSubstituted
        ? []
        : sumsAtOnce(simplifyChain(bare, { scientific: figures !== undefined }), bare, grade ?? '')
            // The value itself is the answer line; a chain that stops before a value that
            // needs rounding (√98) keeps its last line.
            .filter((line, i, all) => i < all.length - 1 || (operationCount(line) ?? 0) > 0)
            .map((line) => plain(`${v.symbol} = ${line}`, t.id, false));
    // Grades 9–12 open with the rule; a rearrangement that reads the same ("SE = σ ÷ √n" for
    // SE = σ ÷ √n) would only print it twice.
    const rearrangedShown = band === 'standard' && rearranged !== lead.formula;
    return {
      ...base,
      result,
      how: typeof text.how === 'function' ? text.how(working) : text.how,
      rearranged,
      ...(showSubstituted ? { substituted } : {}),
      ...(shownWork ? { work: shownWork } : {}),
      heading,
      lead,
      lines: [
        // K–5 skip the letter rearrangement ("a = c − b"): the numbers carry the idea.
        ...(rearrangedShown ? [rearranged] : []),
        ...(letterShown ? [letterSentence] : []),
        // K–2: a line with brackets or words ("h = hundreds digit of 347") is skipped when the
        // work lines show the arithmetic.
        ...(substitutedShown ? [plain(substituted, t.id, false)] : []),
        ...chain,
        ...(shownWork ?? []),
      ],
      ...(written ? { written } : {}),
      writtenAfter:
        (rearrangedShown ? 1 : 0) +
        (letterShown ? 1 : 0) +
        (substitutedShown ? 1 : 0) +
        (text.writtenLast ? chain.length + (shownWork?.length ?? 0) : 0),
      answer: plain(result, t.id, true),
    };
  });

  const conversion = (id: string, into: 'formula' | 'shown') => {
    const v = byId.get(id)!;
    const shown = fmt(id, shownValue(id), shownUnit(id));
    const formula = fmt(id, result.values[id]!, formulaUnit(id), false);
    // State the factor in the direction that reads as a number ≥ 1 ("1 kg = 2.20462 lb").
    const f = units.factor(id);
    // (a power of ten from 10⁴ up as written in class: 1 C = 10⁶ μC, never 1000000)
    const sig = (x: number) => {
      const e = Math.round(Math.log10(x));
      if (e >= 4 && Math.abs(x / 10 ** e - 1) < 1e-9) return superscript(`10^${e}`);
      return String(Number(x.toPrecision(6)));
    };
    const one =
      offsetRule(shownUnit(id), formulaUnit(id)) ??
      (f >= 1
        ? `1 ${shownUnit(id)} = ${sig(f)} ${formulaUnit(id)}`
        : `1 ${formulaUnit(id)} = ${sig(1 / f)} ${shownUnit(id)}`);
    return into === 'formula'
      ? `${v.symbol} = ${shown} = ${formula}   (${one})`
      : `${v.symbol} = ${formula} = ${shown}   (${one})`;
  };

  const converted = direct ? [] : vars.map((v) => v.id).filter(needsConversion);
  const givenIds = result.given.map((g) => g.id);
  const workingUnits = direct
    ? undefined
    : [...new Set(converted.map(formulaUnit).filter((u): u is string => !!u))].join(', ');

  const missing = result.unknown.filter((id) => !byId.get(id)?.hidden).map(quantity);
  // A line the student has just read in an earlier step ("97 = 90 + 7" for both the tens and
  // the ones) is shown once: later steps keep only what is new.
  const seen = new Set<string>();
  const repeated = (line: string) => /\d/.test(line) && line.length >= 8 && seen.has(line);
  for (const s of steps) {
    s.lines = s.lines.filter((line) => !repeated(line));
    // A count-up chain ending in "Jumps: …" keeps every jump, or its total wouldn't add up.
    if (s.work && !s.work.some((l) => l.startsWith('Jumps: ')))
      s.work = s.work.filter((line) => !repeated(line));
    for (const line of s.lines) seen.add(line);
  }
  return {
    band,
    given: givenIds.map(quantity),
    find: trace.map((t) => quantity(t.id)),
    steps,
    // Page limits (a constraint: "3/4 is at most 1") are never shown as a check: a student
    // would take them for part of the problem. A value that breaks one is refused as it is typed.
    check: module.relations
      .filter((r) => !r.constraint && !r.hidden)
      .filter((r) =>
        r.vars.every(
          (id) =>
            id in result.values ||
            outOfCount(
              module.variables.find((v) => v.id === id),
              result.values,
            ),
        ),
      )
      .map((r) => ({
        formula: agree(
          r.check && direct
            ? r.check(working)
            : checkLine(r.display, lineSets, unread, working, figures),
        ),
        ok: holds(r, result.values, module.variables),
      })),
    missing,
    convertIn: givenIds
      .filter((id) => converted.includes(id))
      .map((id) => conversion(id, 'formula'))
      .map((line) => plain(line, convertedId(line), true)),
    convertOut: trace
      .map((t) => t.id)
      .filter((id) => converted.includes(id))
      .map((id) => conversion(id, 'shown'))
      .map((line) => plain(line, convertedId(line), true)),
    workingUnits: workingUnits || undefined,
    ...(missing.length
      ? {
          nextHint:
            // A rule that says why its value can't be found speaks first.
            module.relations
              .map((r) => {
                try {
                  return r.explain?.(result.values);
                } catch {
                  return undefined;
                }
              })
              .find((t) => t) ??
            (band === 'standard'
              ? `Type one more number (${missing.map((q) => q.symbol).join(', ')}) to keep going.`
              : `Type one more number: ${missing.map((q) => q.ask).join(', ')}.`),
        }
      : {}),
    checkFail: early ? '≠  try another number' : '✗',
  };
}

/** The number of the grade ("K" is 0), or undefined for college topics. */
const gradeNumber = (grade: string | undefined) =>
  grade === undefined ? undefined : grade === 'K' ? 0 : Number(grade);

/**
 * Work lines fitted to what the grade already knows. From Grade 3 a long count of equal groups
 * ("Count by 7s, 9 times: …") becomes the fact strategy a teacher shows; from Grade 4 a basic
 * fact needs no line at all, nor does a chain of make-ten jumps (the column grid or the
 * substituted line carries it).
 */
function byGrade(lines: string[], grade: string | undefined): string[] {
  const g = gradeNumber(grade);
  if (g === undefined || g < 3) return lines;
  const countTimes = /^Count by (\d+)s, (\d+) times: .* → (\d+)$/;
  const countTo = /^Count by (\d+)s to (\d+): .* → (\d+)$/;
  const out: string[] = [];
  for (const line of lines) {
    const t = countTimes.exec(line);
    const d = countTo.exec(line);
    if (g >= 4 && (t || d)) continue;
    if (t && Number(t[2]) > 3) {
      const strategy = factWork(Number(t[2]), Number(t[1]));
      out.push(...(strategy.length ? strategy : [line]));
      continue;
    }
    if (d && Number(d[3]) > 3) {
      const [each, n, q] = [Number(d[1]), Number(d[2]), Number(d[3])];
      const strategy = factWork(q, each);
      // No "q groups of each make n" when the strategy's last line already ends at n.
      const done = strategy.length && strategy[strategy.length - 1]!.endsWith(`: ${n}`);
      out.push(
        ...(strategy.length
          ? [...strategy, ...(done ? [] : [`${q} groups of ${each} make ${n}`])]
          : [line]),
      );
      continue;
    }
    out.push(line);
  }
  if (g < 4) return out;
  // A chain of jumps (38 + 20 = 58, 58 + 2 = 60, 60 + 3 = 63): each line starts at the last
  // line's answer. From Grade 4 the sum is done in columns or in the head.
  const sum = /^([\d,]+) [+−] [\d,]+ = ([\d,]+)$/;
  const chained = new Set<number>();
  for (let i = 0; i + 1 < out.length; i++) {
    const a = sum.exec(out[i]!);
    const b = sum.exec(out[i + 1]!);
    if (a && b && b[1] === a[2]) {
      chained.add(i);
      chained.add(i + 1);
    }
  }
  return out.filter((_, i) => !chained.has(i));
}

/**
 * The rule between two temperature units, which differ by an offset as well as a factor: no
 * "1 °C = …" holds, so the step writes "K = °C + 273.15" or "°F = °C × 9/5 + 32" instead.
 */
function offsetRule(shown: string | undefined, formula: string | undefined): string | undefined {
  const a = getUnit(shown);
  const b = getUnit(formula);
  if (!a || !b || !(a.offset || b.offset)) return undefined;
  const pair = (x: string, y: string) =>
    (shown === x && formula === y) || (shown === y && formula === x);
  if (pair('°C', '°F')) return '°F = °C × 9/5 + 32';
  if (pair('K', '°C')) return 'K = °C + 273.15';
  if (pair('K', '°F')) return 'K = (°F + 459.67) × 5/9';
  return undefined;
}
