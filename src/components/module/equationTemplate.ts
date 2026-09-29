/**
 * The equation input's template language (a module's `equation`; drawn by `EquationInput` in
 * InputsSection.tsx; the syntax table is in docs/EQUATION_INPUTS.md). Pure: no React, so the
 * parser is tested on its own (`__tests__/equationTemplate.test.ts`).
 */

/**
 * A box (`{a}`), a fixed number or letters (the 1 of `1/{b}`, the x of `{b}^x`), or a small
 * expression (`{{x} − {m}}`, the top of a z-score) drawn as a row of its own parts.
 */
export type Slot = { id: string } | { text: string } | { parts: EquationPart[] };

/**
 * A template split into its pieces: boxes, fractions, mixed numbers, powers and the text between.
 * A text piece written against its neighbour (`{p}x`, `{a}°`, `f({x})`) is `tight` on that
 * side and is drawn touching it.
 */
export type EquationPart =
  /** `unit`: the value's unit written after the box, following the unit menu ({a:unit}). */
  | { kind: 'box'; id: string; unit?: boolean }
  | { kind: 'fraction'; top: Slot; bottom: Slot; whole?: string }
  /** `tightBefore`: a bracket written against the piece before it, {a}(1 + {r})^{t}. */
  | { kind: 'power'; base: Slot; exponent: Slot; tightBefore?: boolean }
  /** A sign the student taps through (`CHOICES`), its value the sign's place: {s:sign}. */
  | { kind: 'choice'; id: string; choices: Choices }
  /**
   * A grid of cells in brackets (`det`: between bars, a determinant); `bar` cells from the left,
   * a vertical line (an augmented matrix).
   */
  | { kind: 'matrix'; rows: Slot[][]; bar?: number; det?: boolean }
  /** A subscript: log_{b}, a_{n}. */
  | { kind: 'sub'; base: Slot; sub: Slot }
  /** Scripts stacked on the left of the symbol after them: ^{A}_{Z}X. */
  | { kind: 'scripts'; top: Slot; bottom: Slot }
  /** A radical, its bar over `body`; `index` 3 for a cube root. */
  | { kind: 'root'; index?: string; body: Slot; tightBefore?: boolean }
  | { kind: 'text'; text: string; tightBefore?: boolean; tightAfter?: boolean };

/** A box id starts with a letter: {4} is the number 4. */
const BOX = /^[A-Za-z]\w*$/;
/** `{s:sign}`, `{s:relation}`, `{o:op}`: a box the student taps to change its sign. */
const CHOICE = /^(\w+):(sign|relation|op)$/;

/** `{a:unit}`: a box with its unit after it, the one the unit menu shows. */
const MARKED = /^(\w+):(unit)$/;

/** What a choice box cycles through; the value is the sign's place, counted from 1. */
export type Choices = 'sign' | 'relation' | 'op';
export const CHOICES: Record<Choices, readonly string[]> = {
  // As the inequality pages code it: 1 <, 2 ≤, 3 >, 4 ≥ (and 5 = for `relation`).
  sign: ['<', '≤', '>', '≥'],
  relation: ['<', '≤', '>', '≥', '='],
  op: ['+', '−'],
};

/** The index just past the `}` closing the `{` at `i` (braces nest). */
function closeBrace(s: string, i: number): number {
  let depth = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === '{') depth++;
    else if (s[k] === '}' && --depth === 0) return k + 1;
  }
  throw new Error(`Equation template: no } for the { at ${i} in "${s}"`);
}

/** The index just past the `)` closing the `(` at `i` (brackets nest; braces are skipped). */
function closeParen(s: string, i: number): number | undefined {
  let depth = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === '{') k = closeBrace(s, k) - 1;
    else if (s[k] === '(') depth++;
    else if (s[k] === ')' && --depth === 0) return k + 1;
  }
  return undefined;
}

type Read = { slot: Slot; end: number };

const ROOTS: Record<string, string | undefined> = { '√': undefined, '∛': '3', '∜': '4' };

/**
 * A slot starting at `i`: a box `{a}`, a group `{…}` (anything else in braces: an expression),
 * a radical (`√{n}`, `∛{n}`, `√({a}x + {b})`, `√2`), or bare, a number (`12`) or, where
 * `letters`, a word or signed number (`x`, `−1`).
 */
function readSlot(s: string, i: number, letters: boolean): Read | undefined {
  if (s[i]! in ROOTS) {
    // The bar covers a box, a group in braces or brackets (the brackets not drawn), or a number.
    const close = s[i + 1] === '(' ? closeParen(s, i + 1) : undefined;
    const body: Read | undefined =
      close !== undefined
        ? { slot: { parts: equationParts(s.slice(i + 2, close - 1)) }, end: close }
        : readSlot(s, i + 1, true);
    if (!body) return undefined;
    const index = ROOTS[s[i]!];
    const root: EquationPart = { kind: 'root', ...(index ? { index } : {}), body: body.slot };
    return { slot: { parts: [root] }, end: body.end };
  }
  if (s[i] === '{') {
    const end = closeBrace(s, i);
    const inner = s.slice(i + 1, end - 1);
    const marked = MARKED.exec(inner);
    if (marked)
      return { slot: { parts: [{ kind: 'box', id: marked[1]!, [marked[2]!]: true }] }, end };
    const choice = CHOICE.exec(inner);
    if (choice)
      return {
        slot: { parts: [{ kind: 'choice', id: choice[1]!, choices: choice[2] as Choices }] },
        end,
      };
    if (/^\d+$/.test(inner)) return { slot: { text: inner }, end };
    return { slot: BOX.test(inner) ? { id: inner } : { parts: equationParts(inner) }, end };
  }
  const m = (letters ? /^[−-]?[\w.]+/ : /^\d+/).exec(s.slice(i));
  return m ? { slot: { text: m[0] }, end: i + m[0].length } : undefined;
}

/** `s` split at `sep` where it is not inside braces or brackets. */
function splitTop(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let from = 0;
  for (let k = 0; k < s.length; k++) {
    if ('{('.includes(s[k]!)) depth++;
    else if ('})'.includes(s[k]!)) depth--;
    else if (s[k] === sep && depth === 0) {
      out.push(s.slice(from, k));
      from = k + 1;
    }
  }
  out.push(s.slice(from));
  return out;
}

/** A cell, a script or any small piece as one slot: a box, a number or a row of parts. */
function asSlot(src: string): Slot {
  const parts = equationParts(src.trim());
  const only = parts.length === 1 ? parts[0]! : undefined;
  if (only?.kind === 'box') return { id: only.id };
  if (only?.kind === 'text' && !only.tightBefore && !only.tightAfter) return { text: only.text };
  return { parts };
}

/**
 * A matrix at `i`: `[[{a}, {b}; {c}, {d}]]` in brackets, `||…||` as a determinant; rows split
 * by `;`, cells by `,`, and a `|` in every row draws the augmented bar there.
 */
function readMatrix(s: string, i: number): { part: EquationPart; end: number } | undefined {
  const open = s.slice(i, i + 2);
  if (open !== '[[' && open !== '||') return undefined;
  const close = s.indexOf(open === '[[' ? ']]' : '||', i + 2);
  if (close < 0) return undefined;
  const rows = splitTop(s.slice(i + 2, close), ';').map((row) => splitTop(row, '|'));
  const bars = new Set(rows.map((r) => (r.length > 1 ? splitTop(r[0]!, ',').length : 0)));
  const bar = bars.size === 1 ? [...bars][0]! : 0;
  const part: EquationPart = {
    kind: 'matrix',
    rows: rows.map((r) => r.flatMap((side) => splitTop(side, ',')).map(asSlot)),
    ...(bar ? { bar } : {}),
    ...(open === '||' ? { det: true } : {}),
  };
  return { part, end: close + 2 };
}

/**
 * The piece starting at `i`, when one does: a matrix, scripts, a subscript, or a box or group,
 * then its exponent (`^{n}`, `^2`, `^x`, `^{n − 1}`) and a fraction bar (`/`) with the bottom. A
 * number or letters start a piece only when an exponent or (a number) a bar follows: `10^{n}`,
 * `e^{{r}{t}}`, `1/{b}`. A group with neither is drawn in line, as if the braces weren't there.
 */
function readPiece(s: string, i: number): { parts: EquationPart[]; end: number } | undefined {
  const matrix = readMatrix(s, i);
  if (matrix) return { parts: [matrix.part], end: matrix.end };
  // Scripts on the left of a symbol, mass number over atomic number: ^{A}_{Z}X (a ^ with
  // nothing before it).
  if (s[i] === '^' && (i === 0 || /\s/.test(s[i - 1]!))) {
    const top = readSlot(s, i + 1, true);
    const bottom = top && s[top.end] === '_' ? readSlot(s, top.end + 1, true) : undefined;
    if (!top || !bottom) return undefined;
    return { parts: [{ kind: 'scripts', top: top.slot, bottom: bottom.slot }], end: bottom.end };
  }
  // A subscript: log_{b}, a_{n} (a box), a_n (a letter). Letters or a box before the _.
  const base = /^[A-Za-z]+(?=_)/.exec(s.slice(i))?.[0];
  if (
    (base && (i === 0 || !/[\w.]/.test(s[i - 1]!))) ||
    (s[i] === '{' && s[closeBrace(s, i)] === '_')
  ) {
    const b = base ? { slot: { text: base }, end: i + base.length } : readSlot(s, i, false)!;
    const sub = readSlot(s, b.end + 1, true);
    if (sub) return { parts: [{ kind: 'sub', base: b.slot, sub: sub.slot }], end: sub.end };
  }
  let first: Read | undefined;
  if (s[i] === '{' || s[i]! in ROOTS) first = readSlot(s, i, false);
  else if (s[i] === '(') {
    // A bracketed group raised to a power, the brackets drawn: (1 + {r})^{t}, ({b}^{m})^{n}.
    const end = closeParen(s, i);
    if (end !== undefined && s[end] === '^')
      first = { slot: { parts: equationParts(s.slice(i, end)) }, end };
  } else if (/\w/.test(s[i]!) && (i === 0 || !/[\w.]/.test(s[i - 1]!))) {
    const run = /^[A-Za-z]+|^\d+/.exec(s.slice(i))?.[0];
    const after = run && s[i + run.length];
    if (run && (after === '^' || (/^\d/.test(run) && after === '/')))
      first = { slot: { text: run }, end: i + run.length };
  }
  if (!first) return undefined;
  // The exponent binds first: {a}^2/{b}^2 is a²/b².
  const power = (r: Read): Read & { power?: EquationPart } => {
    const exponent = s[r.end] === '^' ? readSlot(s, r.end + 1, true) : undefined;
    if (!exponent) return r;
    const part: EquationPart = { kind: 'power', base: r.slot, exponent: exponent.slot };
    return { slot: { parts: [part] }, end: exponent.end, power: part };
  };
  const top = power(first);
  const simpleTop = 'id' in top.slot || ('text' in top.slot && /^\d+$/.test(top.slot.text));
  const bottom = s[top.end] === '/' ? readSlot(s, top.end + 1, false) : undefined;
  if (bottom && (simpleTop || 'parts' in top.slot)) {
    const b = power(bottom);
    return { parts: [{ kind: 'fraction', top: top.slot, bottom: b.slot }], end: b.end };
  }
  if (top.power) return { parts: [top.power], end: top.end };
  if ('id' in first.slot) return { parts: [{ kind: 'box', id: first.slot.id }], end: first.end };
  if ('parts' in first.slot) return { parts: first.slot.parts, end: first.end };
  return undefined;
}

/** The text a row starts with, if it starts with text. */
const s0 = (parts: EquationPart[]) => (parts[0]?.kind === 'text' ? parts[0].text : undefined);

/**
 * `{a}/{b}` and `1/{b}` are stacked fractions, `{w} {a}/{b}` a mixed number, `{b}^{n}`,
 * `10^{n}` and `{a}^2` powers; any other `{id}` is a box, and the rest is text (÷, =, %, :).
 * A fraction's top or bottom and an exponent can be a group in braces, an expression of boxes,
 * text and signs: `{{x} − {m}}/{s}`, `{a}/{sin({A}°)}`, `{1000 m}/{1 km}`, `{r}^{n − 1}`,
 * `e^{{r}{t}}`; letters after `^` stay text (`{b}^x`).
 * Only one line: `equationLines` splits a template at its line breaks.
 */
export function equationParts(template: string): EquationPart[] {
  const parts: EquationPart[] = [];
  // Text is split into words, so a line can break between them; only the first word can touch
  // the piece before it and only the last the piece after.
  const pushText = (raw: string, before: boolean, after: boolean) => {
    const words = raw.trim().split(/\s+/).filter(Boolean);
    words.forEach((text, k) =>
      parts.push({
        kind: 'text',
        text,
        ...(k === 0 && before && !/^\s/.test(raw) ? { tightBefore: true } : {}),
        ...(k === words.length - 1 && after && !/\s$/.test(raw) ? { tightAfter: true } : {}),
      }),
    );
  };
  let last = 0;
  let i = 0;
  while (i < template.length) {
    const piece = readPiece(template, i);
    if (!piece) {
      i++;
      continue;
    }
    const part = piece.parts.length === 1 ? piece.parts[0] : undefined;
    const between = template.slice(last, i);
    const prev = parts[parts.length - 1];
    // A mixed number: a box, one space, then a fraction of a box or number over one.
    if (
      part?.kind === 'fraction' &&
      between === ' ' &&
      prev?.kind === 'box' &&
      !('parts' in part.top)
    ) {
      parts.pop();
      parts.push({ ...part, whole: prev.id });
    } else {
      pushText(between, parts.length > 0, true);
      // A bracket or a radical written against the piece before it: {P}(1 + {r})^{t}, {k}√{r}.
      const bracket =
        part?.kind === 'root' ||
        (part?.kind === 'power' && 'parts' in part.base && s0(part.base.parts)?.startsWith('('));
      parts.push(
        ...(bracket && parts.length > 0 && !/\s$/.test(between)
          ? [{ ...part, tightBefore: true }]
          : piece.parts),
      );
    }
    last = i = piece.end;
  }
  pushText(template.slice(last), parts.length > 0, false);
  return parts;
}

/** A template's lines: a system of equations is written one equation a line. */
export const equationLines = (template: string): string[] =>
  template.split('\n').map((l) => l.trim());

const slotIds = (s: Slot): string[] =>
  'id' in s ? [s.id] : 'parts' in s ? s.parts.flatMap(partIds) : [];

function partIds(p: EquationPart): string[] {
  switch (p.kind) {
    case 'box':
    case 'choice':
      return [p.id];
    case 'fraction':
      return [...(p.whole ? [p.whole] : []), ...slotIds(p.top), ...slotIds(p.bottom)];
    case 'power':
      return [...slotIds(p.base), ...slotIds(p.exponent)];
    case 'root':
      return slotIds(p.body);
    case 'sub':
      return [...slotIds(p.base), ...slotIds(p.sub)];
    case 'scripts':
      return [...slotIds(p.top), ...slotIds(p.bottom)];
    case 'matrix':
      return p.rows.flat().flatMap(slotIds);
    case 'text':
      return [];
  }
}

/** Every value's id in the template, in order. */
export const equationIds = (template: string): string[] =>
  equationLines(template).flatMap((line) => equationParts(line).flatMap(partIds));
