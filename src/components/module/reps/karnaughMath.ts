/**
 * HC184 (`typesHe4n.ts`): the logic behind the `karnaugh` picture and explore figure. Gray
 * order for 2–4 variables, a group of cells as a cube (a power-of-two rectangle, wrapping
 * allowed) and its product term, the minimal sum of products of a function with don't-cares,
 * and a small parser for truth-table columns (¬ ∧ ∨ → ↔ ⊕, primes, juxtaposition, +).
 */

/** Gray order of `bits` bits: 0, 1 (one bit); 00, 01, 11, 10 (two). */
export const gray = (bits: number): number[] =>
  bits === 0 ? [0] : bits === 1 ? [0, 1] : [0, 1, 3, 2];

/**
 * The map's shape for n variables: the first `rowBits` variables down the side (A; A and B),
 * the rest across the top, each in Gray order.
 */
export function kmapShape(n: number) {
  const rowBits = Math.floor(n / 2);
  const colBits = n - rowBits;
  const rows = gray(rowBits);
  const cols = gray(colBits);
  /** The minterm in row i, column j. */
  const at = (i: number, j: number) => (rows[i]! << colBits) | cols[j]!;
  /** Where minterm m sits. */
  const where = (m: number): [number, number] => [
    rows.indexOf(m >> colBits),
    cols.indexOf(m & ((1 << colBits) - 1)),
  ];
  return { rowBits, colBits, rows, cols, at, where };
}

/** A binary string of `bits` bits. */
export const bin = (x: number, bits: number) => x.toString(2).padStart(bits, '0');

/** A cube: the bits fixed (`mask`) and their values (`value`), over n variables. */
export interface Cube {
  mask: number;
  value: number;
}

/** The cube a set of minterms is, or undefined when it is not one (not a power-of-two block). */
export function cubeOf(cells: number[], n: number): Cube | undefined {
  const set = [...new Set(cells)];
  if (!set.length) return undefined;
  const all = (1 << n) - 1;
  let and = all;
  let or = 0;
  for (const m of set) {
    and &= m;
    or |= m;
  }
  const free = and ^ or;
  const mask = all & ~free;
  const freeBits = popcount(free);
  if (set.length !== 1 << freeBits) return undefined;
  return { mask, value: and & mask };
}

export const popcount = (x: number) => {
  let c = 0;
  for (let y = x; y; y &= y - 1) c++;
  return c;
};

/** The minterms in a cube. */
export function cubeCells(q: Cube, n: number): number[] {
  const out: number[] = [];
  for (let m = 0; m < 1 << n; m++) if ((m & q.mask) === q.value) out.push(m);
  return out;
}

/** A cube's product term: A′C′; "1" when it fixes nothing. */
export function termOf(q: Cube, names: string[]): string {
  const n = names.length;
  let s = '';
  for (let i = 0; i < n; i++) {
    const bit = 1 << (n - 1 - i);
    if (!(q.mask & bit)) continue;
    s += names[i]! + (q.value & bit ? '' : '′');
  }
  return s || '1';
}

/** A sum of products written out: A′C′ + AC; "0" for no terms. */
export const sopOf = (cubes: Cube[], names: string[]) =>
  cubes.length ? cubes.map((q) => termOf(q, names)).join(' + ') : '0';

/** The minterm's product term: m5 of A, B, C is AB′C. */
export const mintermTerm = (m: number, names: string[]) =>
  termOf({ mask: (1 << names.length) - 1, value: m }, names);

/**
 * The minimal sum of products of a function (its 1s and don't-cares): the prime implicants,
 * then the fewest of them (then the fewest letters) that cover every 1.
 */
export function minimalCover(n: number, ones: number[], dcs: number[] = []): Cube[] {
  const on = new Set(ones);
  const ok = new Set([...ones, ...dcs]);
  if (!on.size) return [];
  const all = (1 << n) - 1;
  // Every cube of only 1s and don't-cares.
  const cubes: Cube[] = [];
  for (let mask = 0; mask <= all; mask++)
    for (let value = 0; value <= all; value++) {
      if ((value & ~mask) !== 0) continue;
      const cells = cubeCells({ mask, value }, n);
      if (cells.every((m) => ok.has(m))) cubes.push({ mask, value });
    }
  const inside = (a: Cube, b: Cube) =>
    (a.mask & b.mask) === b.mask && (a.value & b.mask) === b.value;
  const primes = cubes.filter(
    (q) =>
      cubeCells(q, n).some((m) => on.has(m)) &&
      !cubes.some((r) => r !== q && r.mask !== q.mask && inside(q, r)),
  );
  const covers = primes.map((q) => cubeCells(q, n).filter((m) => on.has(m)));
  const literals = (ix: number[]) => ix.reduce((s, i) => s + popcount(primes[i]!.mask), 0);
  const need = [...on];
  // Smallest subsets first; among those of one size, the fewest letters.
  for (let size = 1; size <= primes.length; size++) {
    let best: number[] | undefined;
    const pick: number[] = [];
    const walk = (start: number) => {
      if (pick.length === size) {
        const got = new Set(pick.flatMap((i) => covers[i]!));
        if (need.every((m) => got.has(m)) && (!best || literals(pick) < literals(best)))
          best = [...pick];
        return;
      }
      for (let i = start; i < primes.length; i++) {
        pick.push(i);
        walk(i + 1);
        pick.pop();
      }
    };
    walk(0);
    if (best)
      return best.map((i) => primes[i]!).sort((a, b) => b.value - a.value || a.mask - b.mask);
  }
  return primes;
}

// ─── Truth-table expressions ────────────────────────────────────────────────

type Node =
  | { op: 'var'; name: string }
  | { op: 'const'; v: boolean }
  | { op: 'not'; a: Node }
  | { op: 'and' | 'or' | 'xor' | 'imp' | 'iff'; a: Node; b: Node };

/**
 * Parses a logic expression: letters are variables (one letter each), ¬ before or ′ after
 * negates, ∧ or · or juxtaposition is and, ∨ or + is or, ⊕ is xor, → implies (right to left),
 * ↔ is iff; 0 and 1 are constants. Throws on anything else.
 */
export function parseLogic(src: string): Node {
  const toks = [...src.replace(/\s+/g, '')];
  let i = 0;
  const peek = () => toks[i];
  const eat = (t: string) => {
    if (toks[i] !== t) throw new Error(`expected ${t} at ${i} in ${src}`);
    i++;
  };
  const atom = (): Node => {
    const t = peek();
    let node: Node;
    if (t === '¬' || t === '~' || t === '!') {
      i++;
      node = { op: 'not', a: atom() };
      return node;
    }
    if (t === '(') {
      i++;
      node = iff();
      eat(')');
    } else if (t === '0' || t === '1') {
      i++;
      node = { op: 'const', v: t === '1' };
    } else if (t !== undefined && /[A-Za-z]/.test(t)) {
      i++;
      node = { op: 'var', name: t };
    } else throw new Error(`unexpected ${t ?? 'end'} in ${src}`);
    while (peek() === '′' || peek() === "'") {
      i++;
      node = { op: 'not', a: node };
    }
    return node;
  };
  const and = (): Node => {
    let a = atom();
    for (;;) {
      const t = peek();
      if (t === '∧' || t === '·') {
        i++;
        a = { op: 'and', a, b: atom() };
      } else if (t !== undefined && (t === '(' || t === '¬' || /[A-Za-z01]/.test(t))) {
        a = { op: 'and', a, b: atom() };
      } else return a;
    }
  };
  const or = (): Node => {
    let a = and();
    while (peek() === '∨' || peek() === '+') {
      i++;
      a = { op: 'or', a, b: and() };
    }
    return a;
  };
  const xor = (): Node => {
    let a = or();
    while (peek() === '⊕') {
      i++;
      a = { op: 'xor', a, b: or() };
    }
    return a;
  };
  const imp = (): Node => {
    const a = xor();
    if (peek() === '→') {
      i++;
      return { op: 'imp', a, b: imp() };
    }
    return a;
  };
  const iff = (): Node => {
    let a = imp();
    while (peek() === '↔') {
      i++;
      a = { op: 'iff', a, b: imp() };
    }
    return a;
  };
  const tree = iff();
  if (i !== toks.length) throw new Error(`left over ${toks.slice(i).join('')} in ${src}`);
  return tree;
}

/** The variables an expression reads. */
export function varsOf(node: Node): string[] {
  switch (node.op) {
    case 'var':
      return [node.name];
    case 'const':
      return [];
    case 'not':
      return varsOf(node.a);
    default:
      return [...new Set([...varsOf(node.a), ...varsOf(node.b)])];
  }
}

export function evalLogic(node: Node, env: Record<string, boolean>): boolean {
  switch (node.op) {
    case 'var':
      if (!(node.name in env)) throw new Error(`no value for ${node.name}`);
      return env[node.name]!;
    case 'const':
      return node.v;
    case 'not':
      return !evalLogic(node.a, env);
    case 'and':
      return evalLogic(node.a, env) && evalLogic(node.b, env);
    case 'or':
      return evalLogic(node.a, env) || evalLogic(node.b, env);
    case 'xor':
      return evalLogic(node.a, env) !== evalLogic(node.b, env);
    case 'imp':
      return !evalLogic(node.a, env) || evalLogic(node.b, env);
    case 'iff':
      return evalLogic(node.a, env) === evalLogic(node.b, env);
  }
}

/**
 * An expression's column over the variables `names` (the first the most significant bit, so
 * row r is minterm r): 1s and 0s.
 */
export function columnOf(expr: string, names: string[]): number[] {
  const node = parseLogic(expr);
  const n = names.length;
  return Array.from({ length: 1 << n }, (_, r) => {
    const env: Record<string, boolean> = {};
    names.forEach((v, i) => (env[v] = ((r >> (n - 1 - i)) & 1) === 1));
    return evalLogic(node, env) ? 1 : 0;
  });
}
