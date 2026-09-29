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
  | { kind: 'box'; id: string }
  | { kind: 'fraction'; top: Slot; bottom: Slot; whole?: string }
  | { kind: 'power'; base: Slot; exponent: Slot }
  | { kind: 'text'; text: string; tightBefore?: boolean; tightAfter?: boolean };

const BOX = /^\w+$/;

/** The index just past the `}` closing the `{` at `i` (braces nest). */
function closeBrace(s: string, i: number): number {
  let depth = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === '{') depth++;
    else if (s[k] === '}' && --depth === 0) return k + 1;
  }
  throw new Error(`Equation template: no } for the { at ${i} in "${s}"`);
}

type Read = { slot: Slot; end: number };

/**
 * A slot starting at `i`: a box `{a}`, a group `{…}` (anything else in braces: an expression),
 * or bare, a number (`12`) or, where `letters`, a word or signed number (`x`, `−1`).
 */
function readSlot(s: string, i: number, letters: boolean): Read | undefined {
  if (s[i] === '{') {
    const end = closeBrace(s, i);
    const inner = s.slice(i + 1, end - 1);
    return { slot: BOX.test(inner) ? { id: inner } : { parts: equationParts(inner) }, end };
  }
  const m = (letters ? /^[−-]?[\w.]+/ : /^\d+/).exec(s.slice(i));
  return m ? { slot: { text: m[0] }, end: i + m[0].length } : undefined;
}

/**
 * The piece starting at `i`, when one does: a box or group, then its exponent (`^{n}`, `^2`,
 * `^x`, `^{n − 1}`) and a fraction bar (`/`) with the bottom. A number or letters start a piece
 * only when an exponent or (a number) a bar follows: `10^{n}`, `e^{{r}{t}}`, `1/{b}`. A group
 * with neither is drawn in line, as if the braces weren't there.
 */
function readPiece(s: string, i: number): { parts: EquationPart[]; end: number } | undefined {
  let first: Read | undefined;
  if (s[i] === '{') first = readSlot(s, i, false);
  else if (/\w/.test(s[i]!) && (i === 0 || !/[\w.]/.test(s[i - 1]!))) {
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
      parts.push(...piece.parts);
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
      return [p.id];
    case 'fraction':
      return [...(p.whole ? [p.whole] : []), ...slotIds(p.top), ...slotIds(p.bottom)];
    case 'power':
      return [...slotIds(p.base), ...slotIds(p.exponent)];
    case 'text':
      return [];
  }
}

/** Every value's id in the template, in order. */
export const equationIds = (template: string): string[] =>
  equationLines(template).flatMap((line) => equationParts(line).flatMap(partIds));
