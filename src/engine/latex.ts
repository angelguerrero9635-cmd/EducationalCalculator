/**
 * Math typesetting for the step-by-step, in a small subset of LaTeX that the app draws itself
 * (no network, no web view): `\frac{a}{b}`, `{base}^{exp}`, `\sqrt{x}` and the usual symbol
 * commands. The steps are written as plain text (the harness evaluates them); `toLatex` turns
 * a line into text with `$…$` math where typesetting reads better, and `fromLatex` turns it
 * back, so a test can prove nothing is lost on the way.
 */

/** Which lines get typeset: none before Grade 3 (fractions are words and pictures there). */
export type MathBand = 'early' | 'elementary' | 'middle' | 'standard';

const SUPER = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const fromSuper = (s: string) => [...s].map((ch) => String(SUPER.indexOf(ch))).join('');
const toSuper = (s: string) => [...s].map((ch) => SUPER[Number(ch)] ?? ch).join('');

/** A whole number, with thousands separators allowed (1,200). */
const INT = String.raw`\d{1,3}(?:,\d{3})+|\d+`;
/** A fraction's top or bottom: a whole number, or ? for one not found yet (8/?). */
const PART = String.raw`${INT}|\?`;

/**
 * One pass over the line, left to right: mixed numbers (2 1/4), fractions of numbers (3/4,
 * 1,200/144), powers of a number or a single letter (10³, x²; never units like cm²), square
 * roots (√16, √(A ÷ 6)) and ½. Everything else stays text.
 */
const ATOM = new RegExp(
  [
    // Mixed number: a whole, one space, a fraction.
    String.raw`(?<![\d/.,])(?<mw>${INT}) (?<mn>${INT})\/(?<md>${INT})(?![\d/])`,
    // Fraction of two whole numbers (not a date, not part of a longer run).
    String.raw`(?<![\d/.,?])(?<fn>${PART})\/(?<fd>${PART})(?![\d/.?])`,
    // Power: a number or one letter, then superscript digits.
    String.raw`(?<![\p{L}\d.])(?<pb>\d+(?:\.\d+)?|\p{L})(?<pe>[⁰¹²³⁴⁵⁶⁷⁸⁹]+)`,
    // Square root of a bracket or of a number.
    String.raw`√\((?<rb>[^()]*)\)|√(?<rn>\d+(?:\.\d+)?)`,
    '(?<half>½)',
  ].join('|'),
  'gu',
);

/** The line with its math in `$…$`, or undefined when nothing in it needs typesetting. */
export function toLatex(line: string, band: MathBand): string | undefined {
  if (band === 'early') return undefined;
  let out = '';
  let last = 0;
  let any = false;
  for (const m of line.matchAll(ATOM)) {
    const g = m.groups!;
    const tex = g.mw
      ? `${g.mw}\\frac{${g.mn}}{${g.md}}`
      : g.fn
        ? `\\frac{${g.fn}}{${g.fd}}`
        : g.pb
          ? `{${g.pb}}^{${fromSuper(g.pe!)}}`
          : g.rb !== undefined
            ? `\\sqrt{${g.rb}}`
            : g.rn
              ? `\\sqrt{${g.rn}}`
              : '\\tfrac{1}{2}';
    // A bracketed root keeps its brackets when turned back (√(A ÷ 6)); mark it.
    const mark = g.rb !== undefined ? '\\left.' : '';
    out += line.slice(last, m.index) + `$${mark}${tex}$`;
    last = m.index! + m[0].length;
    any = true;
  }
  return any ? out + line.slice(last) : undefined;
}

/** The plain text a typeset line came from (for the round-trip test). */
export function fromLatex(tex: string): string {
  return tex.replace(/\$([^$]*)\$/g, (_, math: string) => {
    const bracket = math.startsWith('\\left.');
    const body = bracket ? math.slice('\\left.'.length) : math;
    return plainMath(parseMath(body), bracket);
  });
}

// ─── Parsing ───────────────────────────────────────────────────────────────────

/** A piece of typeset math. */
export type MathNode =
  | { t: 'text'; s: string }
  | { t: 'frac'; num: MathNode[]; den: MathNode[]; small?: boolean }
  | { t: 'sup'; base: MathNode[]; exp: MathNode[] }
  | { t: 'sqrt'; body: MathNode[] };

/** Symbol commands a line may use, drawn as their characters. */
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
  left: '',
  right: '',
  ',': ' ',
  ' ': ' ',
  '%': '%',
  $: '$',
};

/** Parses math (the inside of `$…$`); unknown commands throw, so a test can catch them. */
export function parseMath(src: string): MathNode[] {
  let i = 0;
  const group = (): MathNode[] => {
    while (src[i] === ' ') i++;
    if (src[i] !== '{') {
      // A single character argument (\frac12).
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
    const text = (s: string) => {
      const prev = nodes[nodes.length - 1];
      if (prev?.t === 'text') prev.s += s;
      else nodes.push({ t: 'text', s });
    };
    while (i < src.length && src[i] !== close) {
      const ch = src[i]!;
      if (ch === '\\') {
        const name = /^\\([a-zA-Z]+|.)/.exec(src.slice(i))![1]!;
        i += name.length + 1;
        if (name === 'frac' || name === 'tfrac' || name === 'dfrac') {
          const num = group();
          const den = group();
          nodes.push({ t: 'frac', num, den, ...(name === 'tfrac' ? { small: true } : {}) });
        } else if (name === 'sqrt') {
          nodes.push({ t: 'sqrt', body: group() });
        } else if (name === 'text' || name === 'mathrm') {
          text(plainMath(group()));
        } else if (name in SYMBOLS) {
          // "\left." and "\right." mark invisible brackets.
          if ((name === 'left' || name === 'right') && src[i] === '.') i++;
          text(SYMBOLS[name]!);
        } else {
          throw new Error(`unknown command \\${name} in "${src}"`);
        }
      } else if (ch === '{') {
        i++;
        const inner = seq('}');
        i++;
        nodes.push(...(inner.length === 1 ? inner : [{ t: 'text' as const, s: '' }, ...inner]));
      } else if (ch === '^') {
        i++;
        // The power applies to the last piece (a braced group or the text's last token).
        const prev = nodes.pop();
        let base: MathNode[] = prev ? [prev] : [];
        if (prev?.t === 'text') {
          const m = /(\S+)$/.exec(prev.s);
          const head = m ? prev.s.slice(0, m.index) : prev.s;
          if (head) nodes.push({ t: 'text', s: head });
          base = [{ t: 'text', s: m ? m[1]! : '' }];
        }
        nodes.push({ t: 'sup', base, exp: group() });
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
export function plainMath(nodes: MathNode[], bracketRoot = false): string {
  let out = '';
  nodes.forEach((n, k) => {
    const prev = nodes[k - 1];
    if (n.t === 'text') out += n.s;
    else if (n.t === 'frac') {
      // A mixed number's whole is the text right before it: "2" + "1/4" → "2 1/4".
      const mixed = prev?.t === 'text' && /\d$/.test(prev.s);
      const [a, b] = [plainMath(n.num), plainMath(n.den)];
      // \tfrac{1}{2} is the ½ the area formulas write.
      out += n.small && a === '1' && b === '2' ? '½' : `${mixed ? ' ' : ''}${a}/${b}`;
    } else if (n.t === 'sup') out += `${plainMath(n.base)}${toSuper(plainMath(n.exp))}`;
    else out += bracketRoot ? `√(${plainMath(n.body)})` : `√${plainMath(n.body)}`;
  });
  return out;
}

/** A line split into text and math, for drawing. */
export type LinePiece = { t: 'text'; s: string } | { t: 'math'; nodes: MathNode[] };

export function splitLine(tex: string): LinePiece[] {
  const pieces: LinePiece[] = [];
  const re = /\$([^$]*)\$/g;
  let last = 0;
  for (const m of tex.matchAll(re)) {
    if (m.index! > last) pieces.push({ t: 'text', s: tex.slice(last, m.index) });
    const body = m[1]!.replace(/^\\left\./, '');
    pieces.push({ t: 'math', nodes: parseMath(body) });
    last = m.index! + m[0].length;
  }
  if (last < tex.length) pieces.push({ t: 'text', s: tex.slice(last) });
  return pieces;
}
