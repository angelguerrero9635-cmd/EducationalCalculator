/**
 * Math typesetting for the step-by-step and the formulas, in a small subset of LaTeX that the
 * app draws itself (no network, no web view). The steps are written as plain text (the harness evaluates them);
 * `toLatex` turns a line into text with `$…$` math where typesetting reads better, and
 * `fromLatex` turns it back, so a test can prove nothing is lost on the way.
 *
 * Commands: `\frac{a}{b}` (a/b), `\tfrac{a}{b}` (a/b inside a sentence, drawn smaller),
 * `\half` (½), `\divfrac{a}{b}` (a ÷ b drawn stacked), `{b}^{e}` (a power the text writes b²),
 * `\pow{b}{e}` (a power the text writes b^e), `\sqrt{x}`, `\mathit{x}` (a letter that stands for
 * a number), `\rep{0.1666…}` (a repeating decimal, a bar over its block) and symbol commands
 * (\times, \div, \le, …).
 */

import { repeatingParts } from './format';

/**
 * Which lines get typeset (from grade.ts): `early` K–2, never; `elementary` Grades 3–6 word
 * pages: fractions, mixed numbers, powers of numbers, roots; `middle` Grade 6 letter pages: also
 * letters in italic, powers of letters and brackets, and solving lines stacked (4x ÷ 4);
 * `standard` high school and college: also every division stacked and ^ powers.
 */
export type MathBand = 'early' | 'elementary' | 'middle' | 'standard';

const SUPER = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const fromSuper = (s: string) =>
  [...s].map((ch) => (ch === '⁻' ? '-' : String(SUPER.indexOf(ch)))).join('');
const toSuper = (s: string) =>
  [...s].map((ch) => (ch === '-' ? '⁻' : (SUPER[Number(ch)] ?? ch))).join('');

/** A whole number, with thousands separators allowed (1,200). */
const INT = String.raw`\d{1,3}(?:,\d{3})+|\d+`;
/** A fraction's top or bottom: a whole number, or ? for one not found yet (8/?). */
const PART = String.raw`${INT}|\?`;
/** Not followed by more of a number (a sentence's final period is fine). */
const END = String.raw`(?![\d/?]|[.,]\d)`;
const SUP = '⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+';
const SUB = '[₀₁₂₃₄₅₆₇₈₉ₜ]*';
/** A letter right after "number space" is a unit (36 m², 4 V), never a variable. */
const NOT_UNIT = String.raw`(?<!\d[  ])`;
/** An operand of a stacked division: a bracket, a number (maybe times a letter), a name. */
const OPERAND = String.raw`\([^()]*\)|\d[\d,]*(?:\.\d+)?\p{L}?|\p{L}+${SUB}`;

const letterBand = (band: MathBand) => band === 'middle' || band === 'standard';

/** One pattern for everything inside a line that is drawn as math, by band. */
function atomPattern(band: MathBand): RegExp {
  const letters = letterBand(band);
  const side = letters ? String.raw`${PART}|${NOT_UNIT}\p{L}` : PART;
  return new RegExp(
    [
      // Mixed number: a whole, one space, a fraction.
      String.raw`(?<![\d/.,])(?<mw>${INT}) (?<mn>${INT})\/(?<md>${INT})${END}`,
      // Fraction: numbers (3/4, 8/?), or from Grade 6 letters one letter over a number (r/100).
      String.raw`(?<![\d/.,?\p{L}])(?<fn>${side})\/(?<fd>${side})${END}(?!\p{L})`,
      // Power of a bracket: (1 + 0.1)³.
      ...(letters ? [String.raw`\((?<gb>[^()]*)\)(?<ge>${SUP})`] : []),
      // Power of a number, or from Grade 6 letters of one letter (10³, x²; never cm²).
      String.raw`(?<![\p{L}\d.])(?<pb>\d+(?:\.\d+)?${letters ? String.raw`|${NOT_UNIT}\p{L}${SUB}` : ''})(?<pe>${SUP})`,
      // A power written with ^ (x^(n − 1), 1.5^1): high school and college.
      ...(band === 'standard'
        ? [
            String.raw`(?<cb>\([^()]*\)|\d+(?:\.\d+)?|(?<!\p{L})\p{L})\^(?<ce>\([^()]*\)|\d+(?:\.\d+)?|\p{L}(?!\p{L}))`,
          ]
        : []),
      // Square root of a bracket or of a number.
      String.raw`√(?<rb>\([^()]*\))|√(?<rn>\d+(?:\.\d+)?)`,
      '(?<half>½)',
    ].join('|'),
    'gu',
  );
}

type Seg = { s: string; tex?: string };

/** Splits each plain segment at the matches of `re`; `make` gives a match's math, or keeps it. */
function pass(segs: Seg[], re: RegExp, make: (m: RegExpMatchArray) => string | undefined) {
  return segs.flatMap((seg): Seg[] => {
    if (seg.tex !== undefined) return [seg];
    const out: Seg[] = [];
    let last = 0;
    for (const m of seg.s.matchAll(re)) {
      const tex = make(m);
      if (tex === undefined) continue;
      if (m.index! > last) out.push({ s: seg.s.slice(last, m.index) });
      out.push({ s: m[0], tex });
      last = m.index! + m[0].length;
    }
    if (last < seg.s.length) out.push({ s: seg.s.slice(last) });
    return out;
  });
}

/** The math for one match of `atomPattern`. */
function atom(m: RegExpMatchArray, band: MathBand, prose: boolean, symbols: string[]) {
  const g = m.groups!;
  const frac = prose ? '\\tfrac' : '\\frac';
  const inner = (s: string) => innerTex(s, band, symbols);
  // A letter fraction needs a number on the other side (r/100), or both letters the module's
  // own (a/b); never a unit (m/s).
  if (
    g.fn &&
    /\p{L}/u.test(g.fn) &&
    /\p{L}/u.test(g.fd!) &&
    !(symbols.includes(g.fn) && symbols.includes(g.fd!))
  )
    return undefined;
  if (g.mw) return `${g.mw}${frac}{${g.mn}}{${g.md}}`;
  if (g.fn) return `${frac}{${inner(g.fn)}}{${inner(g.fd!)}}`;
  if (g.gb !== undefined) return `{(${inner(g.gb)})}^{${fromSuper(g.ge!)}}`;
  if (g.pb) return `{${inner(g.pb)}}^{${fromSuper(g.pe!)}}`;
  if (g.cb) return `\\pow{${inner(g.cb)}}{${inner(g.ce!)}}`;
  if (g.rb) return `\\sqrt{${inner(g.rb)}}`;
  if (g.rn) return `\\sqrt{${g.rn}}`;
  return '\\half';
}

/** The module's one-letter symbols (x, v₀) as a pattern, longest first; '' when none. */
const symbolPattern = (symbols: string[]) =>
  symbols
    .filter((s) => new RegExp(`^\\p{L}${SUB}$`, 'u').test(s))
    .sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

/** Short words that are also runs of one-letter symbols (a, t → "at"): never a product. */
const WORDS = new Set(
  'a an am as at be by do go he if in is it me my no of on or so to up us we and are but can for has its not per the was'.split(
    ' ',
  ),
);

/**
 * Letters in italic: a symbol, a number times it (4x), or a product of up to three symbols
 * (cx, rh) in a line that is not a sentence; never a unit after a number. From the letter pages on, a
 * function name before its bracket (f(x), f′(x)) too.
 */
function italics(segs: Seg[], symbols: string[], products: boolean): Seg[] {
  const sym = symbolPattern(symbols);
  if (sym) {
    const re = new RegExp(
      String.raw`(?<![\p{L}\d.])(?<k>\d+(?:\.\d+)?)?(?<v>(?:${sym})${products ? '{1,3}' : ''})(?![\p{L}\d₀-₉])`,
      'gu',
    );
    const one = new RegExp(`^(?:${sym})$`, 'u');
    const each = new RegExp(sym, 'gu');
    segs = pass(segs, re, (m) => {
      const { k, v } = m.groups!;
      // A letter after "number space" is a unit (36 m, 4 V, 12 cm²): a variable follows its
      // number directly (4x).
      if (!k && /\d[  ]$/.test(m.input!.slice(0, m.index))) return undefined;
      if (!one.test(v!) && WORDS.has(v!.toLowerCase())) return undefined;
      return `${k ?? ''}${v!.replace(each, (x) => `\\mathit{${x}}`)}`;
    });
  }
  return pass(segs, /(?<![\p{L}\d])[fgh](?=′?\()/gu, (m) => `\\mathit{${m[0]}}`);
}

/** Divisions drawn stacked (a ÷ b), inside `segs`. */
function divisions(segs: Seg[], band: MathBand, symbols: string[]): Seg[] {
  const div = new RegExp(String.raw`(?<a>${OPERAND}) ÷ (?<b>${OPERAND})`, 'gu');
  return pass(segs, div, (m) =>
    // A long top (a sum of eight distances) stays plain text that wraps: stacked, it is
    // wider than a phone.
    m.groups!.a!.length > MAX_STACKED
      ? undefined
      : `\\divfrac{${innerTex(m.groups!.a!, band, symbols)}}{${innerTex(m.groups!.b!, band, symbols)}}`,
  );
}

/** The longest top a division is drawn stacked with, in characters. */
const MAX_STACKED = 28;

/** A fragment (inside a fraction, a root or a power) wholly as math. */
function innerTex(s: string, band: MathBand, symbols: string[], divide = false): string {
  let segs: Seg[] = [{ s }];
  if (divide) segs = divisions(segs, band, symbols);
  segs = pass(segs, atomPattern(band), (m) => atom(m, band, false, symbols));
  if (letterBand(band)) segs = italics(segs, symbols, true);
  return segs.map((x) => x.tex ?? x.s).join('');
}

/**
 * A sentence (it ends with a period, has 6 or more words, or states a limit: "3/4 is at most
 * 1", "fills", "full wholes in"): its fractions are drawn smaller.
 */
const isProse = (line: string) =>
  /\.\s*$/.test(line) ||
  (line.match(/\p{L}{3,}/gu) ?? []).length >= 6 ||
  /\b(?:is (?:at most|at least|less than|more than)|fills|full wholes in|marks of|quotient of)\b/.test(
    line,
  );

export type LatexOptions = {
  /**
   * Grade 6 letter pages: whether a line with a letter is solved step by step, so its
   * divisions are stacked (4x ÷ 4). True in the steps; the Formulas section states rules, so
   * its divisions stay inline there.
   */
  solving?: boolean;
  /**
   * A rule in words under a formula: only its number fractions and mixed numbers, drawn small
   * (letters in words, like "leg a²", stay text).
   */
  words?: boolean;
};

/**
 * The line with its math in `$…$`, or undefined when nothing in it needs typesetting.
 * `symbols` are the module's letters (italic from the Grade 6 letter pages on).
 */
export function toLatex(
  line: string,
  band: MathBand,
  symbols: string[] = [],
  options: LatexOptions = {},
): string | undefined {
  if (band === 'early') return undefined;
  if (options.words) {
    const segs = pass([{ s: line }], atomPattern('elementary'), (m) =>
      m.groups!.mw || m.groups!.fn ? atom(m, 'elementary', true, []) : undefined,
    );
    if (!segs.some((x) => x.tex !== undefined)) return undefined;
    return segs.map((x) => (x.tex !== undefined ? `$${x.tex}$` : escapeDollars(x.s))).join('');
  }
  let segs: Seg[] = [{ s: line }];
  // Divisions drawn stacked: every one in high school and college; on Grade 6 letter pages only
  // in a line that solves for a letter (4x ÷ 4 = 30 ÷ 4). Never beside a remainder.
  const sym = symbolPattern(symbols);
  const solving =
    band === 'middle' &&
    options.solving !== false &&
    !!sym &&
    new RegExp(String.raw`(?<!\p{L})\d*(?:${sym})(?!\p{L})`, 'u').test(line);
  const divide = (band === 'standard' || solving) && !/remainder/.test(line);
  // A bracket raised to a power first, with its own divisions inside: (1 + r ÷ 100)^t.
  if (letterBand(band)) {
    const caret = band === 'standard' ? String.raw`|\^(?<ce>\d+(?:\.\d+)?|\p{L}(?!\p{L}))` : '';
    segs = pass(
      segs,
      new RegExp(String.raw`\((?<b>[^()]*)\)(?:(?<se>${SUP})${caret})`, 'gu'),
      (m) => {
        const { b, se, ce } = m.groups!;
        const body = `(${innerTex(b!, band, symbols, divide)})`;
        return se
          ? `{${body}}^{${fromSuper(se)}}`
          : `\\pow{${body}}{${innerTex(ce!, band, symbols)}}`;
      },
    );
  }
  if (divide) segs = divisions(segs, band, symbols);
  // A repeating decimal written 0.1666… gets its bar: 0.16̅.
  segs = pass(segs, /(?<![\d.,])−?\d[\d,]*\.\d+…/gu, (m) =>
    repeatingParts(m[0]) ? `\\rep{${m[0]}}` : undefined,
  );
  const prose = isProse(line);
  segs = pass(segs, atomPattern(band), (m) => atom(m, band, prose, symbols));
  if (letterBand(band)) segs = italics(segs, symbols, !prose);
  if (!segs.some((x) => x.tex !== undefined)) return undefined;
  return segs.map((x) => (x.tex !== undefined ? `$${x.tex}$` : escapeDollars(x.s))).join('');
}

/** Math between `$…$`; a dollar sign in the text ("$10") is written `\$`. */
const MATH = /(?<!\\)\$([^$]*)\$/g;
const escapeDollars = (t: string) => t.replace(/\$/g, '\\$');

/** The plain text a typeset line came from (for the round-trip test). */
export function fromLatex(tex: string): string {
  return tex.replace(MATH, (_, math: string) => plainMath(parseMath(math))).replace(/\\\$/g, '$');
}

// ─── Parsing ───────────────────────────────────────────────────────────────────

/** A piece of typeset math. */
export type MathNode =
  | { t: 'text'; s: string; italic?: boolean }
  | {
      t: 'frac';
      num: MathNode[];
      den: MathNode[];
      /** \tfrac or \half: drawn smaller. */
      small?: boolean;
      /** \half: the ½ of the area formulas. */
      half?: boolean;
      /** \divfrac: a ÷ b drawn stacked. */
      div?: boolean;
    }
  | { t: 'sup'; base: MathNode[]; exp: MathNode[]; caret?: boolean }
  | { t: 'sqrt'; body: MathNode[] }
  /** \rep{0.1666…}: a repeating decimal, drawn with a bar over its block (0.16̅). */
  | { t: 'rep'; lead: string; block: string; src: string };

/** Symbol commands, drawn as their characters. */
const SYMBOLS: Record<string, string> = {
  times: '×',
  div: '÷',
  cdot: '·',
  pm: '±',
  le: '≤',
  ge: '≥',
  ne: '≠',
  approx: '≈',
  pi: 'π',
  to: '→',
  ',': ' ',
  ' ': ' ',
  '%': '%',
  $: '$',
};

/** Parses math (the inside of `$…$`); an unknown command throws, so a test can catch it. */
export function parseMath(src: string): MathNode[] {
  let i = 0;
  const braced = (): MathNode[] => {
    while (src[i] === ' ') i++;
    if (src[i] !== '{') {
      const ch = src[i++];
      if (ch === undefined) throw new Error(`missing argument in "${src}"`);
      return [{ t: 'text', s: ch }];
    }
    i++;
    const nodes = seq('}');
    i++;
    return nodes;
  };
  const seq = (close?: string): MathNode[] => {
    const nodes: MathNode[] = [];
    const text = (s: string, italic = false) => {
      const prev = nodes[nodes.length - 1];
      if (prev?.t === 'text' && !!prev.italic === italic) prev.s += s;
      else nodes.push(italic ? { t: 'text', s, italic } : { t: 'text', s });
    };
    while (i < src.length && src[i] !== close) {
      const ch = src[i]!;
      if (ch === '\\') {
        const name = /^\\([a-zA-Z]+|.)/.exec(src.slice(i))![1]!;
        i += name.length + 1;
        if (['frac', 'tfrac', 'dfrac', 'divfrac'].includes(name)) {
          const num = braced();
          const den = braced();
          nodes.push({
            t: 'frac',
            num,
            den,
            ...(name === 'tfrac' ? { small: true } : {}),
            ...(name === 'divfrac' ? { div: true } : {}),
          });
        } else if (name === 'half') {
          nodes.push({
            t: 'frac',
            num: [{ t: 'text', s: '1' }],
            den: [{ t: 'text', s: '2' }],
            small: true,
            half: true,
          });
        } else if (name === 'pow') {
          const base = braced();
          nodes.push({ t: 'sup', base, exp: braced(), caret: true });
        } else if (name === 'rep') {
          const src = plainMath(braced());
          const parts = repeatingParts(src);
          if (!parts) throw new Error(`not a repeating decimal: ${src}`);
          nodes.push({ t: 'rep', ...parts, src });
        } else if (name === 'sqrt') {
          nodes.push({ t: 'sqrt', body: braced() });
        } else if (name === 'mathit') {
          text(plainMath(braced()), true);
        } else if (name === 'text' || name === 'mathrm') {
          text(plainMath(braced()));
        } else if (name in SYMBOLS) {
          text(SYMBOLS[name]!);
        } else {
          throw new Error(`unknown command \\${name} in "${src}"`);
        }
      } else if (ch === '{') {
        i++;
        const inner = seq('}');
        i++;
        // A braced group then ^ is the whole power's base: {(1 + 0.1)}^{3}.
        if (src[i] === '^') {
          i++;
          nodes.push({ t: 'sup', base: inner, exp: braced() });
        } else nodes.push(...inner);
      } else if (ch === '^') {
        i++;
        // A bare ^ raises the last token of the text before it.
        const prev = nodes.pop();
        let base: MathNode[] = prev ? [prev] : [];
        if (prev?.t === 'text') {
          const m = /(\S+)$/.exec(prev.s);
          const head = m ? prev.s.slice(0, m.index) : prev.s;
          if (head) nodes.push({ ...prev, s: head });
          base = [{ ...prev, s: m ? m[1]! : '' }];
        }
        nodes.push({ t: 'sup', base, exp: braced() });
      } else {
        text(ch);
        i++;
      }
    }
    return nodes.filter((n) => n.t !== 'text' || n.s !== '');
  };
  return seq();
}

/** Math back to the plain text the steps are written in. */
export function plainMath(nodes: MathNode[]): string {
  let out = '';
  nodes.forEach((n, k) => {
    const prev = nodes[k - 1];
    if (n.t === 'text') out += n.s;
    else if (n.t === 'frac') {
      const [a, b] = [plainMath(n.num), plainMath(n.den)];
      if (n.half) out += '½';
      else if (n.div) out += `${a} ÷ ${b}`;
      else {
        // A mixed number's whole is the text right before it: "2" + "1/4" → "2 1/4".
        const mixed = prev?.t === 'text' && /\d$/.test(prev.s);
        out += `${mixed ? ' ' : ''}${a}/${b}`;
      }
    } else if (n.t === 'sup') {
      out += n.caret
        ? `${plainMath(n.base)}^${plainMath(n.exp)}`
        : `${plainMath(n.base)}${toSuper(plainMath(n.exp))}`;
    } else if (n.t === 'rep') out += n.src;
    else out += `√${plainMath(n.body)}`;
  });
  return out;
}

/**
 * Brackets a stacked fraction, a root or an exponent makes unnecessary: (8 − 2) over (4 − 1)
 * draws as 8 − 2 over 4 − 1. The plain text keeps them.
 */
export function withoutOuterBrackets(nodes: MathNode[]): MathNode[] {
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (first?.t !== 'text' || last?.t !== 'text') return nodes;
  const all = plainMath(nodes);
  if (!all.startsWith('(') || !all.endsWith(')')) return nodes;
  // One bracket pair around everything: "(a) and (b)" keeps its brackets.
  let depth = 0;
  for (let k = 0; k < all.length - 1; k++) {
    if (all[k] === '(') depth++;
    else if (all[k] === ')') depth--;
    if (depth === 0) return nodes;
  }
  if (nodes.length === 1) return [{ ...first, s: first.s.slice(1, -1) }];
  return [
    { ...first, s: first.s.slice(1) },
    ...nodes.slice(1, -1),
    { ...last, s: last.s.slice(0, -1) },
  ].filter((n) => n.t !== 'text' || n.s !== '');
}

/** A line split into text and math, for drawing. */
export type LinePiece = { t: 'text'; s: string } | { t: 'math'; nodes: MathNode[] };

export function splitLine(tex: string): LinePiece[] {
  const pieces: LinePiece[] = [];
  let last = 0;
  const text = (t: string) => pieces.push({ t: 'text', s: t.replace(/\\\$/g, '$') });
  for (const m of tex.matchAll(MATH)) {
    if (m.index! > last) text(tex.slice(last, m.index));
    pieces.push({ t: 'math', nodes: parseMath(m[1]!) });
    last = m.index! + m[0].length;
  }
  if (last < tex.length) text(tex.slice(last));
  return pieces;
}
