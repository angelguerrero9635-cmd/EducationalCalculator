/**
 * Math typesetting for the step-by-step and the formulas, in a small subset of LaTeX that the
 * app draws itself (no network, no web view). The steps are written as plain text (the harness evaluates them);
 * `toLatex` turns a line into text with `$…$` math where typesetting reads better, and
 * `fromLatex` turns it back, so a test can prove nothing is lost on the way.
 *
 * Commands: `\frac{a}{b}` (a/b), `\tfrac{a}{b}` (a/b inside a sentence, drawn smaller),
 * `\half` (½), `\divfrac{a}{b}` (a ÷ b drawn stacked), `{b}^{e}` (a power the text writes b²),
 * `\pow{b}{e}` (a power the text writes b^e), `\sqrt{x}`, `\mathit{x}` (a letter that stands for
 * a number), `\rep{0.1666…}` (a repeating decimal, a bar over its block),
 * `\sum_{k=1}^{n}{body}` (a sum with its limits, which the text writes "Σ from k = 1 to n of
 * (body)"), `\int_{a}^{b}{body}` (an integral with its limits, "∫ from a to b of (body) dx")
 * and symbol commands (\times, \div, \le, \partial, \nabla, …).
 *
 * College symbols (HE-E7) are plain text the typesetting keeps whole: dotted and hatted
 * letters and vector arrows written with combining marks (ṁ, Q̇, x̂, F⃗), bold vectors (𝐅),
 * primes (f′_c, σ′₃), ∂, ∇, ⌊ ⌋ and ⌈ ⌉, and subscripts of several letters or with a comma
 * (T_wall, σ_max, ΔT_lm, T_h,in), drawn lowered by the text component.
 */

import { repeatingParts } from './format';
import { SUBSCRIPT } from './subscripts';

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
/**
 * A subscript written with an underscore: letters or digits, Greek too (σ_max, T_wall, μ_Σ),
 * maybe a second part after a comma (T_h,in, K_c,u). Never split by the typesetting.
 */
const USUB = String.raw`(?:_[\p{L}\d]+(?:,[\p{L}\d]+)?)`;
/**
 * An operand of a stacked division: a function of a bracket (sin(30°), ln(ΔT₁ ÷ ΔT₂): never
 * the name alone over its bracket) or of one number or letter (log₁₀ 2), a bracket, a number (maybe times a letter), a name (with
 * its marks and subscript, maybe after ∂: ∂U ÷ ∂P).
 */
const OPERAND = String.raw`\p{L}+[₀-₉]*\([^()]*\)|(?:ln|log|log₁₀|log₂|sin|cos|tan) (?:\d+(?:\.\d+)?|\p{L}${SUB})(?![\p{L}\p{M}\d(_])|\([^()]*\)|\d[\d,]*(?:\.\d+)?\p{L}?|∂?(?:\p{L}\p{M}*)+′?${USUB}?${SUB}`;
/** A bracket with one more bracket level inside: ((k − 1)/k), (P₂ ÷ (P₁ + 1)). */
const NESTED = String.raw`\((?:[^()]|\([^()]*\))*\)`;

const letterBand = (band: MathBand) => band === 'middle' || band === 'standard';

/**
 * A sum with its limits as the steps write it (E5): "Σ from k = 1 to 8 of (3k − 1)". The
 * limits are one token each (a number, a letter, a value put in); the body is a bracket (one
 * bracket deep inside, maybe raised to a power: (x − 5)²) or one term (k², 2^k, 1/k).
 */
export const SIGMA = new RegExp(
  String.raw`Σ from (?<si>\p{L}) = (?<lo>[^\s()]+) to (?<hi>[^\s()]+) of (?<sb>\((?:[^()]|\([^()]*\))*\)(?:${SUP}|\^\S+)?|[^\s,;()]*[^\s,;.()])`,
  'gu',
);

/**
 * A definite integral with its limits as the steps write it (HE-E7): "∫ from 0 to 2 of (x² + 1)
 * dx", "∫ from V₁ to V₂ of P dV", "∫ from 0 to X of dX ÷ (k(1 − X))". The limits are one token
 * each; the body is a bracket (one bracket deep inside, maybe raised to a power) or one term,
 * then its d and variable; or d and the variable over a bracket or term.
 */
const D_VAR = String.raw`d\p{L}\p{M}*(?:_[\p{L}\d]+)?[₀-₉]*`;
const INT_TERM = String.raw`\((?:[^()]|\([^()]*\))*\)(?:${SUP}|\^\S+)?|[^\s,;()]*[^\s,;.()]`;
export const INTEGRAL = new RegExp(
  String.raw`∫ from (?<lo>[^\s()]+) to (?<hi>[^\s()]+) of (?<body>(?<ib>${INT_TERM}) (?<dv>${D_VAR})(?![\p{L}\p{M}\d_])|(?<dv2>${D_VAR}) ÷ (?<ib2>${INT_TERM}))`,
  'gu',
);

/** Capital at the start of a sentence. */
const sentenceStart = (line: string, at: number) => /^$|[.:;]\s+$/.test(line.slice(0, at));

/** Combining marks over a letter, as they are read: ṁ "m dot", x̂ "x hat", F⃗ "F vector". */
const MARK_WORDS: Record<string, string> = {
  '\u0307': 'dot',
  '\u0308': 'double dot',
  '\u0302': 'hat',
  '\u0304': 'bar',
  '\u0305': 'bar',
  '\u20D7': 'vector',
};
/** Precomposed dotted letters (ṁ, ṅ, ẋ, ẏ) and bars (x̄ has none), read the same way. */
const PRECOMPOSED: Record<string, string> = {
  ṁ: 'm dot',
  ṅ: 'n dot',
  ẋ: 'x dot',
  ẏ: 'y dot',
  ż: 'z dot',
  ṗ: 'p dot',
  ṙ: 'r dot',
  ṡ: 's dot',
  ṫ: 't dot',
  ẇ: 'w dot',
  Ẇ: 'W dot',
  ŷ: 'y hat',
  ȳ: 'y bar',
};

/**
 * The text a screen reader says for a line: "Σ from k = 1 to 8 of …" is "the sum from …",
 * "∫ from 0 to 2 of …" "the integral from …"; ∂ is "partial", ∇ "del", ⌊x⌋ "floor of x",
 * ⌈x⌉ "ceiling of x", a dotted or hatted letter "m dot", "x hat", and a subscript drawn
 * lowered (T_wall, v_y) "T sub wall", never an underscore.
 */
export const spokenMath = (line: string) =>
  line
    .replace(/Σ from (?=\p{L} = )/gu, (_, at: number) =>
      sentenceStart(line, at) ? 'The sum from ' : 'the sum from ',
    )
    .replace(/∫ from (?=\S+ to )/gu, (_, at: number) =>
      sentenceStart(line, at) ? 'The integral from ' : 'the integral from ',
    )
    .replace(/∂(?=\S)/g, 'partial ')
    .replace(/∇·/g, 'del dot ')
    .replace(/∇×/g, 'del cross ')
    .replace(/∇(?=\S)/g, 'del ')
    .replace(/⌊([^⌊⌋]+)⌋/g, 'floor of $1')
    .replace(/⌈([^⌈⌉]+)⌉/g, 'ceiling of $1')
    .replace(
      /(\p{L})([\u0307\u0308\u0302\u0304\u0305\u20D7])/gu,
      (_, l: string, mark: string) => `${l} ${MARK_WORDS[mark]}`,
    )
    .replace(/[ṁṅẋẏżṗṙṡṫẇẆŷȳ]/g, (ch) => PRECOMPOSED[ch]!)
    .replace(SUBSCRIPT, (_, base: string, sub: string) => `${base} sub ${sub}`);

/** One pattern for everything inside a line that is drawn as math, by band. */
function atomPattern(band: MathBand): RegExp {
  const letters = letterBand(band);
  const side = letters ? String.raw`${PART}|${NOT_UNIT}\p{L}` : PART;
  return new RegExp(
    [
      // Mixed number: a whole, one space, a fraction.
      String.raw`(?<![\d/.,])(?<mw>${INT}) (?<mn>${INT})\/(?<md>${INT})${END}`,
      // Fraction: numbers (3/4, 8/?), or from Grade 6 letters one letter over a number (r/100).
      String.raw`(?<![\d/.,?\p{L}_])(?<fn>${side})\/(?<fd>${side})${END}(?![\p{L}\p{M}₀-₉_])`,
      // Power of a bracket: (1 + 0.1)³.
      ...(letters ? [String.raw`\((?<gb>[^()]*)\)(?<ge>${SUP})`] : []),
      // Power of a number, or from Grade 6 letters of one letter (10³, x²; never cm²).
      String.raw`(?<![\p{L}\p{M}\d._])(?<pb>\d+(?:\.\d+)?${letters ? String.raw`|${NOT_UNIT}\p{L}\p{M}*${USUB}?${SUB}` : ''})(?<pe>${SUP})`,
      // A power written with ^ (x^(n − 1), 1.5^1): high school and college.
      ...(band === 'standard'
        ? [
            // (the exponent may hold one more bracket: (P₂ ÷ P₁)^((k − 1)/k))
            String.raw`(?<cb>\([^()]*\)|\d+(?:\.\d+)?|(?<![\p{L}_])\p{L}\p{M}*${USUB}?${SUB})\^(?<ce>${NESTED}|\d+(?:\.\d+)?|\p{L}(?![\p{L}\p{M}]))`,
          ]
        : []),
      // A root written exactly over its bottom (E22): √3/2, 2√31/3, (√6 + √2)/4.
      String.raw`(?<![\d/.,])(?<sk>\d*)√(?<sn>\d+)\/(?<sd>\d+)${END}`,
      String.raw`\((?<sb>[^()]*√[^()]*)\)\/(?<sbd>\d+)${END}`,
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
  if (g.sn) return `${frac}{${g.sk}\\sqrt{${g.sn}}}{${g.sd}}`;
  if (g.sb) return `${frac}{${inner(g.sb)}}{${g.sbd}}`;
  if (g.rb) return `\\sqrt{${inner(g.rb)}}`;
  if (g.rn) return `\\sqrt{${g.rn}}`;
  return '\\half';
}

/** The module's one-letter symbols (x, v₀) as a pattern, longest first; '' when none. */
const symbolPattern = (symbols: string[]) =>
  symbols
    .filter((s) => new RegExp(`^\\p{L}\\p{M}*${SUB}$`, 'u').test(s))
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
      String.raw`(?<![\p{L}\p{M}\d._])(?<k>\d+(?:\.\d+)?)?(?<v>(?:${sym})${products ? '{1,3}' : ''})(?![\p{L}\p{M}\d₀-₉_])`,
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
  return pass(segs, /(?<![\p{L}\d_])[fgh](?=′?\()/gu, (m) => `\\mathit{${m[0]}}`);
}

/** Divisions drawn stacked (a ÷ b), inside `segs`. */
function divisions(segs: Seg[], band: MathBand, symbols: string[]): Seg[] {
  // (never from the bottom of a fraction: 1/2 ÷ 3 is not 1 over 2 ÷ 3)
  const div = new RegExp(String.raw`(?<![\d/.,])(?<a>${OPERAND}) ÷ (?<b>${OPERAND})`, 'gu');
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
  // A sum with its limits (high school and college): Σ, its limits above and below, its body.
  if (band === 'standard') {
    segs = pass(segs, SIGMA, (m) => {
      const { si, lo, hi, sb } = m.groups!;
      const index = innerTex(si!, band, [...symbols, si!]);
      return `\\sum_{${index}=${innerTex(lo!, band, symbols)}}^{${innerTex(hi!, band, symbols)}}{${innerTex(sb!, band, [...symbols, si!], true)}}`;
    });
    // An integral with its limits: ∫, its limits, its body with its d and variable.
    segs = pass(segs, INTEGRAL, (m) => {
      const { lo, hi, body, dv, dv2 } = m.groups!;
      const v = (dv ?? dv2)!.slice(1);
      return `\\int_{${innerTex(lo!, band, symbols)}}^{${innerTex(hi!, band, symbols)}}{${innerTex(body!, band, [...symbols, v], true)}}`;
    });
  }
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
    const caret =
      band === 'standard'
        ? String.raw`|\^(?<ce>${NESTED}|\d+(?:\.\d+)?|\p{L}(?![\p{L}\p{M}]))`
        : '';
    segs = pass(
      segs,
      new RegExp(String.raw`\((?<b>[^()]*)\)(?:(?<se>${SUP})${caret})`, 'gu'),
      (m) => {
        const { b, se, ce } = m.groups!;
        // A root's bracket raised (√(a² + b²)^(1 ÷ n)) keeps its root bar: the root is drawn
        // first, as before.
        if (ce?.startsWith('(') && m.input!.slice(0, m.index).endsWith('√')) return undefined;
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
  | { t: 'rep'; lead: string; block: string; src: string }
  /** \sum_{k=1}^{n}{body}: Σ with its limits below and above, then its body. */
  | { t: 'sum'; lower: MathNode[]; upper: MathNode[]; body: MathNode[] }
  /** \int_{a}^{b}{body}: ∫ with its limits below and above, then its body (with its dx). */
  | { t: 'int'; lower: MathNode[]; upper: MathNode[]; body: MathNode[] };

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
  partial: '∂',
  nabla: '∇',
  infty: '∞',
  hbar: 'ħ',
  lfloor: '⌊',
  rfloor: '⌋',
  lceil: '⌈',
  rceil: '⌉',
  angle: '∠',
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
        } else if (name === 'sum' || name === 'int') {
          // \sum_{k=1}^{n}{body} (or \int): both limits, then the body, each braced.
          const limit = (mark: string) => {
            while (src[i] === ' ') i++;
            if (src[i] !== mark) throw new Error(`\\sum needs ${mark} in "${src}"`);
            i++;
            return braced();
          };
          const lower = limit('_');
          const upper = limit('^');
          nodes.push({ t: name, lower, upper, body: braced() });
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
        // A top that is a sum ((√6 + √2)/4, drawn stacked) keeps its brackets.
        out += `${mixed ? ' ' : ''}${/ /.test(a) ? `(${a})` : a}/${b}`;
      }
    } else if (n.t === 'sup') {
      out += n.caret
        ? `${plainMath(n.base)}^${plainMath(n.exp)}`
        : `${plainMath(n.base)}${toSuper(plainMath(n.exp))}`;
    } else if (n.t === 'rep') out += n.src;
    else if (n.t === 'sum')
      out += `Σ from ${plainMath(n.lower).replace(/\s*=\s*/, ' = ')} to ${plainMath(n.upper)} of ${plainMath(n.body)}`;
    else if (n.t === 'int')
      out += `∫ from ${plainMath(n.lower)} to ${plainMath(n.upper)} of ${plainMath(n.body)}`;
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
