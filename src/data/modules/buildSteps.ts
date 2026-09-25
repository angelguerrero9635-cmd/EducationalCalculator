import { formatNumber, renderTemplate } from '@/engine/format';
import { holds, type SolveResult } from '@/engine/solve';
import type { Values } from '@/engine/types';
import { makeUnitContext, type UnitContext } from '@/engine/unitContext';

import { gradeBand, quantityLabel, type GradeBand } from './grade';
import type { ModuleDef } from './types';

export interface Quantity {
  id: string;
  symbol: string;
  name: string;
  /** e.g. "12 cm²" or "?" */
  value: string;
  /** As listed for the grade: "First group: 3" (K–2), "Rows (r): 3" (3–5) or "r = 3". */
  label: string;
  /** As named in "Find": "first group" (K–2) or "rows (r)". */
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
  /** "Find width (w)"; K–2: "Find width". */
  heading: string;
  /**
   * What the box opens with: the number sentence with "?" (K–5, first) and the rule in letters
   * (Grade 3 on). K–2 sees no letters.
   */
  lead: { sentence?: string; formula?: string };
  /** The lines shown in the box, in order, before the answer (grade-appropriate wording). */
  lines: string[];
  /** The answer line as shown: "First group: 3" (K–2) or "w = 3 cm". */
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
const wordy = (line: string) => /[(]|[a-z]{3,}/i.test(line.replace(/^\S+ = /, ''));

const lowerFirst = (x: string) => `${x[0]!.toLowerCase()}${x.slice(1)}`;

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
  rows: 'row',
  groups: 'group',
  clips: 'clip',
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
  const early = band === 'early';
  /** K–2: "a = 7 − 4" → "7 − 4", "a = 3" → "First group: 3" (the name, not the letter). */
  const plain = (line: string, id: string, keepName: boolean) => {
    const v = byId.get(id);
    if (!early || !v || !line.startsWith(`${v.symbol} = `)) return line;
    const rest = line.slice(v.symbol.length + 3);
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
    const n = formatNumber(x, inShownUnit && v ? { ...v, digits: undefined } : undefined);
    if (!unit) return n;
    // $ goes before the number; ¢ right after it; word units in the singular for 1 ("1 cup").
    if (unit === '$') return `$${n}`;
    if (unit === '¢') return `${n}${unit}`;
    return `${n} ${x === 1 ? (SINGULAR[unit] ?? unit) : unit}`;
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

  const quantity = (id: string): Quantity => {
    const v = byId.get(id)!;
    const known = result.values[id] !== undefined;
    const value = known ? fmt(id, shownValue(id), shownUnit(id)) : '?';
    return {
      id,
      symbol: v.symbol,
      name: v.name,
      value,
      label: quantityLabel(band, v.name, v.symbol, value),
      ask: early ? lowerFirst(v.name) : `${lowerFirst(v.name)} (${v.symbol})`,
    };
  };

  // Values known before each step: the entered ones, then each answer as it is found.
  const known: Values = Object.fromEntries(givenIdsOf(result).map((id) => [id, working[id]!]));
  const steps = result.trace.map((t): Step => {
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
        ? `Find ${v.name[0]!.toLowerCase()}${v.name.slice(1)}: ${v.symbol}`
        : `Find ${v.name[0]!.toLowerCase()}${v.name.slice(1)} (${v.symbol})`,
      formula: renderTemplate(relation.display, vars),
      sentence: agree(renderTemplate(relation.display, workVars, knownHere)),
      result: `${v.symbol} = ${fmt(t.id, workValue(t.id), workUnit(t.id), direct)}`,
    };
    // Grade 3–5 boxes open with the number sentence, then the rule; K–2 with the sentence only.
    const lead =
      band === 'early'
        ? { sentence: base.sentence }
        : band === 'elementary'
          ? { sentence: base.sentence, formula: base.formula }
          : { formula: base.formula };
    const heading = early ? `Find ${lowerFirst(v.name)}` : base.title;
    const answer = plain(base.result, t.id, true);
    if (!text || !t.exact) {
      return {
        ...base,
        how: 'Try numbers until both sides match.',
        heading,
        lead,
        lines: [],
        answer,
      };
    }
    // Text functions get the numbers the steps show (the working values), so every line matches.
    const expr = typeof text.expr === 'function' ? text.expr(working) : text.expr;
    const work = typeof text.work === 'function' ? text.work(working) : text.work;
    const rearranged = `${v.symbol} = ${renderTemplate(expr, vars)}`;
    const substituted = agree(`${v.symbol} = ${renderTemplate(expr, workVars, working)}`);
    // Lines that only repeat the one before ("c = 4", then "c = 4") are left out.
    const same = (x: string, y: string) => x === y.split(' (')[0];
    const result =
      text.note && direct ? `${base.result} ${text.note(working)}`.trimEnd() : base.result;
    const workLines = work?.length
      ? work.map((line) => agree(renderTemplate(line, workVars, working)))
      : undefined;
    // "35 + 20" before "35 + 20 = 55" says nothing: the work line carries it.
    const bare = substituted.slice(v.symbol.length + 3);
    // A compare page's first work line ("Tens: 4 < 5, so 45 < 54") is the lesson; the bare
    // "54 − 45" before it would put the subtraction first.
    const repeatedByWork =
      (workLines?.[0]?.startsWith(`${bare} =`) ?? false) ||
      (early && (workLines?.some((l) => /^(Hundreds|Tens|Ones): .*, so /.test(l)) ?? false)) ||
      // K–2: "8 + 2 − 5" in one go is more than the grade reads; the work lines take it apart.
      (early && !!workLines?.length && (bare.match(/ [+−] /g)?.length ?? 0) >= 2);
    const showSubstituted =
      !(same(substituted, base.result) || substituted === rearranged) && !repeatedByWork;
    return {
      ...base,
      result,
      how: typeof text.how === 'function' ? text.how(working) : text.how,
      rearranged,
      ...(showSubstituted ? { substituted } : {}),
      ...(workLines ? { work: workLines } : {}),
      heading,
      lead,
      lines: [
        // K–5 skip the letter rearrangement ("a = c − b"): the numbers carry the idea.
        ...(band === 'standard' ? [rearranged] : []),
        // K–2: a line with brackets or words ("h = hundreds digit of 347") is skipped when the
        // work lines show the arithmetic.
        ...(showSubstituted && !(band !== 'standard' && workLines?.length && wordy(substituted))
          ? [plain(substituted, t.id, false)]
          : []),
        ...(workLines ?? []),
      ],
      answer: plain(result, t.id, true),
    };
  });

  const conversion = (id: string, into: 'formula' | 'shown') => {
    const v = byId.get(id)!;
    const shown = fmt(id, shownValue(id), shownUnit(id));
    const formula = fmt(id, result.values[id]!, formulaUnit(id), false);
    // State the factor in the direction that reads as a number ≥ 1 ("1 kg = 2.20462 lb").
    const f = units.factor(id);
    const sig = (x: number) => String(Number(x.toPrecision(6)));
    const one =
      f >= 1
        ? `1 ${shownUnit(id)} = ${sig(f)} ${formulaUnit(id)}`
        : `1 ${formulaUnit(id)} = ${sig(1 / f)} ${shownUnit(id)}`;
    return into === 'formula'
      ? `${v.symbol} = ${shown} = ${formula}   (${one})`
      : `${v.symbol} = ${formula} = ${shown}   (${one})`;
  };

  const converted = direct ? [] : vars.map((v) => v.id).filter(needsConversion);
  const givenIds = result.given.map((g) => g.id);
  const workingUnits = direct
    ? undefined
    : [...new Set(converted.map(formulaUnit).filter((u): u is string => !!u))].join(', ');

  const missing = result.unknown.map(quantity);
  // A line the student has just read in an earlier step ("97 = 90 + 7" for both the tens and
  // the ones) is shown once: later steps keep only what is new.
  const seen = new Set<string>();
  const repeated = (line: string) => /\d/.test(line) && line.length >= 8 && seen.has(line);
  for (const s of steps) {
    s.lines = s.lines.filter((line) => !repeated(line));
    if (s.work) s.work = s.work.filter((line) => !repeated(line));
    for (const line of s.lines) seen.add(line);
  }
  return {
    band,
    given: givenIds.map(quantity),
    find: result.trace.map((t) => quantity(t.id)),
    steps,
    check: module.relations
      .filter((r) => r.vars.every((id) => id in result.values))
      .map((r) => ({
        formula: agree(
          r.check && direct ? r.check(working) : renderTemplate(r.display, workVars, working),
        ),
        ok: holds(r, result.values),
      })),
    missing,
    convertIn: givenIds
      .filter((id) => converted.includes(id))
      .map((id) => conversion(id, 'formula'))
      .map((line) => plain(line, convertedId(line), true)),
    convertOut: result.trace
      .map((t) => t.id)
      .filter((id) => converted.includes(id))
      .map((id) => conversion(id, 'shown'))
      .map((line) => plain(line, convertedId(line), true)),
    workingUnits: workingUnits || undefined,
    ...(missing.length
      ? {
          nextHint:
            band === 'standard'
              ? `Type one more number (${missing.map((q) => q.symbol).join(', ')}) to keep going.`
              : `Type one more number: ${missing.map((q) => q.ask).join(', ')}.`,
        }
      : {}),
    checkFail: early ? '≠  try another number' : '✗',
  };
}
