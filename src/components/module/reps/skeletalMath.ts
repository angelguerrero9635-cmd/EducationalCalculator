/**
 * Line-angle (skeletal) structures from a small SMILES-like spec (HC2, `typesHe1c.ts`): the
 * reader, aromatic rings written out with alternating double bonds, the formula, rings and π
 * bonds for the IHD, CIP ranks and R or S, the parent chain and its numbers, functional groups,
 * and a 2D layout (chains zigzag, rings regular, fused rings share an edge) with wedges and
 * dashes for every stereocenter. Pure code with no imports, so the harness can use it too.
 *
 * The spec reads like SMILES, without the parts a course never needs:
 *
 * - atoms: `B C N O P S F Cl Br I`, aromatic `c n o s p` (rings written out), and bracket atoms
 *   `[nH]`, `[O-]`, `[NH3+]`, `[C@@H]`, `[cH-]`, `[CH+]` (H count, charge, `@` or `@@`);
 * - bonds `-` `=` `#` `:`, and `/` `\` for a double bond's cis or trans;
 * - branches in brackets, ring closures `1`–`9` and `%10`–`%99`.
 *
 * Atoms are numbered from 0 in the order they are written; options name atoms by that number.
 */

export interface SkAtom {
  el: string;
  /** Written lowercase (part of an aromatic ring). */
  aromatic: boolean;
  charge: number;
  /** Hydrogens on the atom (implicit, or the bracket's count). */
  h: number;
  bracket: boolean;
  chiral?: '@' | '@@';
  /** Neighbors in written order, for `@`/`@@`: atom numbers, −1 for the bracket's H. */
  order: number[];
}

export interface SkBond {
  a: number;
  b: number;
  order: 1 | 2 | 3;
  /** `/` or `\`, read from `a` (written first) to `b`. */
  dir?: '/' | '\\';
  /** Part of an aromatic ring as written (drawn as alternating single and double bonds). */
  aromatic?: boolean;
}

export interface SkMol {
  atoms: SkAtom[];
  bonds: SkBond[];
  /** Bond numbers at each atom. */
  adj: number[][];
  error?: string;
}

const Z: Record<string, number> = {
  H: 1,
  B: 5,
  C: 6,
  N: 7,
  O: 8,
  F: 9,
  Si: 14,
  P: 15,
  S: 16,
  Cl: 17,
  Br: 35,
  I: 53,
};
export const atomicNumberOf = (el: string) => Z[el] ?? 0;
export const HALOGENS = ['F', 'Cl', 'Br', 'I'];

/** Normal valences of the organic subset, lowest first. */
const VALENCE: Record<string, number[]> = {
  B: [3],
  C: [4],
  N: [3, 5],
  O: [2],
  P: [3, 5],
  S: [2, 4, 6],
  F: [1],
  Cl: [1],
  Br: [1],
  I: [1],
};

/** An atom's valence with its charge: C⁺ and C⁻ make 3 bonds, N⁺ 4, O⁻ 1, O⁺ 3. */
export function chargedValence(el: string, charge: number): number {
  const v = VALENCE[el]?.[0] ?? 0;
  if (charge === 0) return v;
  if (el === 'C' || el === 'B') return v - Math.abs(charge);
  // N, O, S, P: a cation gains a bond, an anion loses one.
  return v + charge;
}

export const other = (b: SkBond, i: number) => (b.a === i ? b.b : b.a);
export const bondBetween = (m: SkMol, i: number, j: number) =>
  m.adj[i]?.map((k) => m.bonds[k]!).find((b) => other(b, i) === j);
export const neighbors = (m: SkMol, i: number) => m.adj[i]!.map((k) => other(m.bonds[k]!, i));
export const bondSum = (m: SkMol, i: number) =>
  m.adj[i]!.reduce((s, k) => s + m.bonds[k]!.order, 0);

const ORGANIC = ['Cl', 'Br', 'B', 'C', 'N', 'O', 'P', 'S', 'F', 'I'];
const AROMATIC = ['c', 'n', 'o', 's', 'p', 'b'];

/** Reads a spec into atoms and bonds; `error` says what could not be read. */
export function parseSmiles(src: string): SkMol {
  const atoms: SkAtom[] = [];
  const bonds: SkBond[] = [];
  const fail = (error: string): SkMol => ({ atoms, bonds, adj: atoms.map(() => []), error });
  let prev = -1;
  const stack: number[] = [];
  let pending: { order?: 1 | 2 | 3; dir?: '/' | '\\'; aromatic?: boolean } | undefined;
  const open = new Map<
    number,
    { atom: number; slot: number; pending?: typeof pending; written: number }
  >();
  const addBond = (a: number, b: number, p: typeof pending) => {
    const arom = p?.aromatic ?? (!p?.order && atoms[a]!.aromatic && atoms[b]!.aromatic);
    bonds.push({ a, b, order: p?.order ?? 1, ...(p?.dir ? { dir: p.dir } : {}), aromatic: arom });
  };
  const addAtom = (a: Omit<SkAtom, 'order' | 'h'> & { h?: number }) => {
    const i = atoms.length;
    atoms.push({ ...a, h: a.h ?? -1, order: [] });
    if (prev >= 0) {
      addBond(prev, i, pending);
      atoms[prev]!.order.push(i);
      atoms[i]!.order.push(prev);
    }
    if (a.bracket && (a.h ?? 0) > 0 && a.chiral) atoms[i]!.order.push(-1);
    pending = undefined;
    prev = i;
  };
  let i = 0;
  while (i < src.length) {
    const ch = src[i]!;
    if (ch === '(') {
      if (prev < 0) return fail('a branch before any atom');
      stack.push(prev);
      i++;
    } else if (ch === ')') {
      if (stack.length === 0) return fail('a ")" with no "("');
      prev = stack.pop()!;
      i++;
    } else if ('-=#:/\\'.includes(ch)) {
      pending = {
        ...pending,
        ...(ch === '=' ? { order: 2 as const } : ch === '#' ? { order: 3 as const } : {}),
        ...(ch === '-' ? { order: 1 as const, aromatic: false } : {}),
        ...(ch === ':' ? { aromatic: true } : {}),
        ...(ch === '/' || ch === '\\' ? { dir: ch } : {}),
      };
      i++;
    } else if (/[0-9%]/.test(ch)) {
      let n: number;
      if (ch === '%') {
        n = Number(src.slice(i + 1, i + 3));
        i += 3;
      } else {
        n = Number(ch);
        i++;
      }
      if (prev < 0 || Number.isNaN(n)) return fail('a ring number before any atom');
      const o = open.get(n);
      if (o) {
        if (o.atom === prev) return fail(`ring ${n} closes on its own atom`);
        const p = { ...o.pending, ...pending };
        addBond(o.atom, prev, p);
        atoms[o.atom]!.order[o.slot] = prev;
        atoms[prev]!.order.push(o.atom);
        open.delete(n);
        pending = undefined;
      } else {
        open.set(n, {
          atom: prev,
          slot: atoms[prev]!.order.length,
          pending,
          written: i,
        });
        atoms[prev]!.order.push(-2);
        pending = undefined;
      }
    } else if (ch === '[') {
      const end = src.indexOf(']', i);
      if (end < 0) return fail('a "[" with no "]"');
      const body = src.slice(i + 1, end);
      const m = /^(\d*)([A-Z][a-z]?|[cnospb])(@@|@)?(H\d?)?([+-]+\d*|[+-]\d+)?$/.exec(body);
      if (!m) return fail(`can't read [${body}]`);
      const sym = m[2]!;
      const aromatic = AROMATIC.includes(sym);
      const el = aromatic ? sym.toUpperCase() : sym;
      if (!(el in Z) || el === 'H') return fail(`no element ${sym}`);
      const hs = m[4] ? (m[4].length > 1 ? Number(m[4].slice(1)) : 1) : 0;
      let charge = 0;
      if (m[5]) {
        const sign = m[5][0] === '+' ? 1 : -1;
        const digits = /\d+/.exec(m[5]);
        charge = sign * (digits ? Number(digits[0]) : m[5].length);
      }
      addAtom({
        el,
        aromatic,
        charge,
        h: hs,
        bracket: true,
        ...(m[3] ? { chiral: m[3] as '@' | '@@' } : {}),
      });
      i = end + 1;
    } else {
      const two = src.slice(i, i + 2);
      const sym = ORGANIC.includes(two)
        ? two
        : ORGANIC.includes(ch) || AROMATIC.includes(ch)
          ? ch
          : '';
      if (!sym) return fail(`can't read "${ch}"`);
      const aromatic = AROMATIC.includes(sym);
      addAtom({ el: aromatic ? sym.toUpperCase() : sym, aromatic, charge: 0, bracket: false });
      i += sym.length;
    }
  }
  if (stack.length) return fail('a "(" with no ")"');
  if (open.size) return fail(`ring ${[...open.keys()][0]} is never closed`);
  if (atoms.length === 0) return fail('no atoms');
  const adj: number[][] = atoms.map(() => []);
  bonds.forEach((b, k) => {
    adj[b.a]!.push(k);
    adj[b.b]!.push(k);
  });
  const mol: SkMol = { atoms, bonds, adj };
  const kek = kekulize(mol);
  if (kek) return { ...mol, error: kek };
  // Implicit hydrogens: the lowest normal valence that holds the bonds.
  for (let a = 0; a < atoms.length; a++) {
    const at = atoms[a]!;
    if (at.bracket) continue;
    const sum = bondSum(mol, a);
    const v = (VALENCE[at.el] ?? [sum]).find((x) => x >= sum) ?? sum;
    at.h = v - sum;
  }
  for (let a = 0; a < atoms.length; a++) {
    const at = atoms[a]!;
    if (at.chiral && !at.bracket) return { ...mol, error: 'a stereocenter outside brackets' };
  }
  return mol;
}

/**
 * Writes an aromatic ring out as alternating single and double bonds (a Kekulé structure):
 * every aromatic atom that still has a bond to spare takes exactly one double bond.
 */
function kekulize(m: SkMol): string | undefined {
  if (!m.bonds.some((b) => b.aromatic)) return undefined;
  const needs = m.atoms.map((at, a) => {
    if (!at.aromatic) return false;
    const deg = m.adj[a]!.length;
    // Non-aromatic bonds count their order; aromatic bonds count 1 here.
    const used = m.adj[a]!.reduce((s, k) => s + (m.bonds[k]!.aromatic ? 1 : m.bonds[k]!.order), 0);
    if (!at.bracket) {
      if (at.el === 'C') return used < 4;
      if (at.el === 'N' || at.el === 'P' || at.el === 'B') return deg === 2 && used < 3;
      return false;
    }
    return chargedValence(at.el, at.charge) - used - at.h >= 1;
  });
  const taken = m.atoms.map(() => false);
  const order = m.atoms.map((_, a) => a).filter((a) => needs[a]);
  const solve = (k: number): boolean => {
    if (k === order.length) return true;
    const a = order[k]!;
    if (taken[a]) return solve(k + 1);
    for (const bk of m.adj[a]!) {
      const b = m.bonds[bk]!;
      const o = other(b, a);
      if (!b.aromatic || !needs[o] || taken[o]) continue;
      taken[a] = taken[o] = true;
      b.order = 2;
      if (solve(k + 1)) return true;
      taken[a] = taken[o] = false;
      b.order = 1;
    }
    return false;
  };
  return solve(0) ? undefined : 'the aromatic ring has no alternating double bonds';
}

// ─── Formula, rings and π bonds ──────────────────────────────────────────────

export interface Formula {
  counts: Record<string, number>;
  /** Hill order: C, H, then the rest alphabetically ("C6H10O"). */
  text: string;
  charge: number;
}

export function formulaOf(m: SkMol): Formula {
  const counts: Record<string, number> = {};
  let charge = 0;
  for (const at of m.atoms) {
    counts[at.el] = (counts[at.el] ?? 0) + 1;
    if (at.h > 0) counts.H = (counts.H ?? 0) + at.h;
    charge += at.charge;
  }
  const keys = Object.keys(counts).sort((a, b) =>
    a === 'C' ? -1 : b === 'C' ? 1 : a === 'H' ? -1 : b === 'H' ? 1 : a.localeCompare(b),
  );
  const text = keys.map((k) => `${k}${counts[k] === 1 ? '' : counts[k]}`).join('');
  return { counts, text, charge };
}

/** Connected pieces (a salt or a mixture is several). */
export function pieces(m: SkMol): number {
  const seen = new Set<number>();
  let n = 0;
  for (let s = 0; s < m.atoms.length; s++) {
    if (seen.has(s)) continue;
    n++;
    const todo = [s];
    seen.add(s);
    while (todo.length) {
      const a = todo.pop()!;
      for (const b of neighbors(m, a))
        if (!seen.has(b)) {
          seen.add(b);
          todo.push(b);
        }
    }
  }
  return n;
}

/** Rings and π bonds as drawn: each ring 1, each double bond 1, each triple bond 2. */
export function unsaturation(m: SkMol): { rings: number; pi: number; ihd: number } {
  const rings = m.bonds.length - m.atoms.length + pieces(m);
  const pi = m.bonds.reduce((s, b) => s + b.order - 1, 0);
  return { rings, pi, ihd: rings + pi };
}

/** IHD from a formula's counts: (2C + 2 + N − H − X) ÷ 2 (O and S don't change it). */
export const ihdOf = (c: number, h: number, n = 0, x = 0) => (2 * c + 2 + n - h - x) / 2;

/** The formula's IHD (P counts like N, Si like C). */
export function formulaIhd(f: Formula): number {
  const k = (e: string) => f.counts[e] ?? 0;
  return ihdOf(
    k('C') + k('Si'),
    k('H'),
    k('N') + k('P'),
    HALOGENS.reduce((s, e) => s + k(e), 0),
  );
}

/** Every C makes 4 bonds (3 as a cation or an anion): the C atoms that don't. */
export function valenceProblems(m: SkMol): string[] {
  const out: string[] = [];
  m.atoms.forEach((at, a) => {
    if (at.el !== 'C') return;
    const total = bondSum(m, a) + at.h;
    const want = 4 - Math.abs(at.charge);
    if (total !== want) out.push(`C ${a} makes ${total} bonds, not ${want}`);
  });
  return out;
}

// ─── Rings (a minimum cycle basis) ───────────────────────────────────────────

/**
 * The smallest set of rings that makes every ring (Horton's candidates, kept while they add a
 * new ring): each ring is its atoms in order round it.
 */
export function ringsOf(m: SkMol): number[][] {
  const need = m.bonds.length - m.atoms.length + pieces(m);
  if (need <= 0) return [];
  const n = m.atoms.length;
  const cands: number[][] = [];
  for (let v = 0; v < n; v++) {
    // Shortest paths from v.
    const parent = new Array<number>(n).fill(-2);
    const dist = new Array<number>(n).fill(Infinity);
    parent[v] = -1;
    dist[v] = 0;
    const q = [v];
    while (q.length) {
      const a = q.shift()!;
      for (const b of neighbors(m, a))
        if (dist[b] === Infinity) {
          dist[b] = dist[a]! + 1;
          parent[b] = a;
          q.push(b);
        }
    }
    const path = (x: number) => {
      const p: number[] = [];
      for (let y = x; y !== -1; y = parent[y]!) p.push(y);
      return p.reverse();
    };
    for (const b of m.bonds) {
      const [x, y] = [b.a, b.b];
      if (dist[x] === Infinity || dist[y] === Infinity) continue;
      if (parent[x] === y || parent[y] === x) continue;
      const px = path(x);
      const py = path(y);
      const shared = px.filter((a) => py.includes(a));
      if (shared.length !== 1) continue;
      cands.push([...px, ...py.slice(1).reverse()]);
    }
  }
  cands.sort((p, q) => p.length - q.length);
  const edgeIndex = (a: number, b: number) =>
    m.bonds.findIndex((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));
  const basis: boolean[][] = [];
  const pivots: number[] = [];
  const out: number[][] = [];
  for (const c of cands) {
    if (out.length === need) break;
    const vec = new Array<boolean>(m.bonds.length).fill(false);
    c.forEach((a, k) => {
      const e = edgeIndex(a, c[(k + 1) % c.length]!);
      if (e >= 0) vec[e] = !vec[e];
    });
    // Reduce against the basis (GF(2)).
    for (let r = 0; r < basis.length; r++)
      if (vec[pivots[r]!]) for (let e = 0; e < vec.length; e++) vec[e] = vec[e] !== basis[r]![e];
    const piv = vec.indexOf(true);
    if (piv < 0) continue;
    basis.push(vec);
    pivots.push(piv);
    out.push(c);
  }
  return out;
}

// ─── CIP ranks and R or S ─────────────────────────────────────────────────────

interface DNode {
  z: number;
  /** The real atom, or −1 for an H, a duplicate or a phantom. */
  atom: number;
  from: number;
  path: number[];
}

function childrenOf(m: SkMol, n: DNode): DNode[] {
  if (n.atom < 0) return n.z > 1 ? [0, 0, 0].map(() => phantom()) : [];
  const a = n.atom;
  const out: DNode[] = [];
  for (const k of m.adj[a]!) {
    const b = m.bonds[k]!;
    const o = other(b, a);
    const zo = atomicNumberOf(m.atoms[o]!.el);
    if (o === n.from) {
      // A multiple bond back to the parent adds its duplicates here.
      for (let d = 1; d < b.order; d++) out.push(dup(zo));
      continue;
    }
    if (n.path.includes(o)) out.push(dup(zo));
    else out.push({ z: zo, atom: o, from: a, path: [...n.path, o] });
    for (let d = 1; d < b.order; d++) out.push(dup(zo));
  }
  for (let h = 0; h < m.atoms[a]!.h; h++) out.push({ z: 1, atom: -1, from: a, path: [] });
  return out.sort((p, q) => q.z - p.z);
}
const dup = (z: number): DNode => ({ z, atom: -1, from: -1, path: [] });
const phantom = (): DNode => ({ z: 0, atom: -1, from: -1, path: [] });

/** Compares two branches sphere by sphere (CIP rule 1a): positive when `p` ranks higher. */
function compareBranches(m: SkMol, p: DNode, q: DNode, depth = 10): number {
  if (p.z !== q.z) return p.z - q.z;
  let lp = [p];
  let lq = [q];
  for (let d = 0; d < depth; d++) {
    const sp = lp.map((n) => childrenOf(m, n));
    const sq = lq.map((n) => childrenOf(m, n));
    for (let k = 0; k < Math.max(sp.length, sq.length); k++) {
      const a = sp[k] ?? [];
      const b = sq[k] ?? [];
      for (let j = 0; j < Math.max(a.length, b.length); j++) {
        const za = a[j]?.z ?? -1;
        const zb = b[j]?.z ?? -1;
        if (za !== zb) return za - zb;
      }
    }
    lp = sp.flat();
    lq = sq.flat();
    if (lp.length === 0 && lq.length === 0) return 0;
  }
  return 0;
}

/**
 * CIP ranks of the four groups on `center` (rank 1 highest), keyed by neighbor (−1 is the H);
 * undefined when two groups tie (not a stereocenter) or the atom has no four groups.
 */
export function cipRanks(m: SkMol, center: number): Map<number, number> | undefined {
  const at = m.atoms[center];
  if (!at) return undefined;
  const nbrs = neighbors(m, center);
  if (nbrs.length + at.h !== 4 || at.h > 1) return undefined;
  const branches: { key: number; node: DNode }[] = nbrs.map((o) => ({
    key: o,
    node: { z: atomicNumberOf(m.atoms[o]!.el), atom: o, from: center, path: [center, o] },
  }));
  if (at.h === 1) branches.push({ key: -1, node: { z: 1, atom: -1, from: center, path: [] } });
  const sorted = [...branches].sort((x, y) => compareBranches(m, y.node, x.node));
  for (let k = 1; k < sorted.length; k++)
    if (compareBranches(m, sorted[k - 1]!.node, sorted[k]!.node) === 0) return undefined;
  return new Map(sorted.map((b, k) => [b.key, k + 1]));
}

/** Even or odd: the number of swaps that turn `from` into `to` (same members). */
function parity(from: number[], to: number[]): number {
  const p = to.map((x) => from.indexOf(x));
  let inv = 0;
  for (let i = 0; i < p.length; i++)
    for (let j = i + 1; j < p.length; j++) if (p[i]! > p[j]!) inv++;
  return inv % 2;
}

/** The written neighbor order of a stereocenter, the bracket H as −1 (ring slots filled). */
export const writtenOrder = (m: SkMol, a: number) => m.atoms[a]!.order.filter((x) => x !== -2);

/**
 * R or S of a stereocenter as written (`@` or `@@`): R when, looking from the lowest-ranked
 * group, groups 1, 2 and 3 run anticlockwise (so clockwise with it pointing away).
 */
export function configurationOf(m: SkMol, a: number): 'R' | 'S' | undefined {
  const at = m.atoms[a];
  const ranks = cipRanks(m, a);
  if (!at?.chiral || !ranks) return undefined;
  const order = writtenOrder(m, a);
  if (order.length !== 4) return undefined;
  const byRank = [...ranks.entries()].sort((x, y) => x[1] - y[1]).map(([k]) => k);
  const target = [byRank[3]!, byRank[0]!, byRank[1]!, byRank[2]!];
  const same = parity(order, target) === 0;
  const anticlockwise = (at.chiral === '@') === same;
  return anticlockwise ? 'R' : 'S';
}

type V3 = [number, number, number];
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const det3 = (a: V3, b: V3, c: V3) =>
  a[0] * (b[1] * c[2] - b[2] * c[1]) -
  a[1] * (b[0] * c[2] - b[2] * c[0]) +
  a[2] * (b[0] * c[1] - b[1] * c[0]);
/** The sign of the canonical `@` arrangement: from the first, the rest anticlockwise. */
const AT_SIGN = Math.sign(
  det3(
    sub3([1, 0, -1 / 3], [0, 0, 1]),
    sub3([Math.cos((2 * Math.PI) / 3), Math.sin((2 * Math.PI) / 3), -1 / 3], [0, 0, 1]),
    sub3([Math.cos((4 * Math.PI) / 3), Math.sin((4 * Math.PI) / 3), -1 / 3], [0, 0, 1]),
  ),
);
/** Whether four points (in this order) are arranged as `@`: from the first, anticlockwise. */
export function isAnticlockwise(p: V3[]): boolean {
  return Math.sign(det3(sub3(p[1]!, p[0]!), sub3(p[2]!, p[0]!), sub3(p[3]!, p[0]!))) === AT_SIGN;
}

// ─── Functional groups ───────────────────────────────────────────────────────

export type GroupName =
  | 'hydroxyl'
  | 'carbonyl'
  | 'aldehyde'
  | 'ketone'
  | 'carboxyl'
  | 'ester'
  | 'amide'
  | 'amine'
  | 'nitrile'
  | 'ether'
  | 'halide'
  | 'alkene'
  | 'alkyne'
  | 'arene'
  | 'nitro'
  | 'thiol'
  | 'anhydride';

/** Atoms of the named group (all of its matches); empty when the molecule has none. */
export function groupAtoms(m: SkMol, g: GroupName): number[] {
  const out = new Set<number>();
  const el = (a: number) => m.atoms[a]!.el;
  const nb = (a: number) => neighbors(m, a);
  const order = (a: number, b: number) => bondBetween(m, a, b)?.order ?? 0;
  /** The carbonyl O of a C, if it has one. */
  const oxo = (c: number) => nb(c).find((o) => el(o) === 'O' && order(c, o) === 2);
  const isAcylC = (c: number) => el(c) === 'C' && oxo(c) !== undefined;
  const add = (...xs: number[]) => xs.forEach((x) => out.add(x));
  m.atoms.forEach((at, a) => {
    switch (g) {
      case 'hydroxyl':
        if (at.el === 'O' && at.h === 1 && nb(a).length === 1 && !isAcylC(nb(a)[0]!)) add(a);
        break;
      case 'thiol':
        if (at.el === 'S' && at.h === 1) add(a);
        break;
      case 'carbonyl':
      case 'aldehyde':
      case 'ketone': {
        const o = isAcylC(a) ? oxo(a)! : -1;
        if (o < 0) break;
        const rest = nb(a).filter((x) => x !== o);
        const hetero = rest.some((x) => el(x) !== 'C');
        if (hetero) break;
        if (g === 'carbonyl') add(a, o);
        else if (g === 'aldehyde' && at.h >= 1) add(a, o);
        else if (g === 'ketone' && rest.length === 2) add(a, o);
        break;
      }
      case 'carboxyl':
        if (isAcylC(a)) {
          const oh = nb(a).find((x) => el(x) === 'O' && order(a, x) === 1 && m.atoms[x]!.h === 1);
          if (oh !== undefined) add(a, oxo(a)!, oh);
        }
        break;
      case 'ester':
        if (isAcylC(a)) {
          const o = nb(a).find(
            (x) =>
              el(x) === 'O' &&
              order(a, x) === 1 &&
              nb(x).length === 2 &&
              nb(x).every((y) => y === a || (el(y) === 'C' && !isAcylC(y))),
          );
          if (o !== undefined) add(a, oxo(a)!, o);
        }
        break;
      case 'anhydride':
        if (isAcylC(a)) {
          const o = nb(a).find(
            (x) => el(x) === 'O' && nb(x).length === 2 && nb(x).every((y) => isAcylC(y)),
          );
          if (o !== undefined) add(a, oxo(a)!, o);
        }
        break;
      case 'amide':
        if (isAcylC(a)) {
          const n = nb(a).find((x) => el(x) === 'N');
          if (n !== undefined) add(a, oxo(a)!, n);
        }
        break;
      case 'amine':
        if (
          at.el === 'N' &&
          !at.aromatic &&
          nb(a).every((x) => el(x) === 'C' && !isAcylC(x)) &&
          m.adj[a]!.every((k) => m.bonds[k]!.order === 1)
        )
          add(a);
        break;
      case 'nitrile':
        if (at.el === 'N') {
          const c = nb(a).find((x) => order(a, x) === 3);
          if (c !== undefined) add(a, c);
        }
        break;
      case 'ether':
        if (at.el === 'O' && nb(a).length === 2 && nb(a).every((x) => el(x) === 'C' && !isAcylC(x)))
          add(a);
        break;
      case 'halide':
        if (HALOGENS.includes(at.el)) add(a);
        break;
      case 'alkene':
        for (const k of m.adj[a]!) {
          const b = m.bonds[k]!;
          if (b.order === 2 && !b.aromatic && el(b.a) === 'C' && el(b.b) === 'C') add(b.a, b.b);
        }
        break;
      case 'alkyne':
        for (const k of m.adj[a]!) {
          const b = m.bonds[k]!;
          if (b.order === 3 && el(b.a) === 'C' && el(b.b) === 'C') add(b.a, b.b);
        }
        break;
      case 'arene':
        if (at.aromatic) add(a);
        break;
      case 'nitro':
        if (at.el === 'N' && nb(a).filter((x) => el(x) === 'O').length === 2)
          add(a, ...nb(a).filter((x) => el(x) === 'O'));
        break;
    }
  });
  return [...out].sort((x, y) => x - y);
}

// ─── The parent chain ─────────────────────────────────────────────────────────

/**
 * The parent chain, C1 first: the chain of carbons holding the most carbons of the principal
 * group (C=O, C–O, C–N), then the longest, then the one with the most branches; numbered to give
 * the principal group, then double and triple bonds, then branches the lowest numbers.
 */
export function parentChain(m: SkMol): number[] {
  const rings = ringsOf(m);
  const inRing = new Set(rings.flat());
  const isC = (a: number) => m.atoms[a]!.el === 'C' && !inRing.has(a);
  const carbons = m.atoms.map((_, a) => a).filter(isC);
  if (carbons.length === 0) return [];
  const principal = (a: number) => {
    const ns = neighbors(m, a);
    if (ns.some((o) => m.atoms[o]!.el === 'O' && bondBetween(m, a, o)!.order === 2)) return 3;
    if (ns.some((o) => m.atoms[o]!.el === 'N' && bondBetween(m, a, o)!.order === 3)) return 3;
    if (ns.some((o) => m.atoms[o]!.el === 'O' || m.atoms[o]!.el === 'N')) return 2;
    return 0;
  };
  const paths: number[][] = [];
  const walk = (p: number[]) => {
    let ext = false;
    for (const o of neighbors(m, p[p.length - 1]!))
      if (isC(o) && !p.includes(o)) {
        ext = true;
        walk([...p, o]);
      }
    if (!ext) paths.push(p);
    if (paths.length > 5000) return;
  };
  for (const c of carbons) walk([c]);
  const top = Math.max(...paths.map((p) => Math.max(0, ...p.map(principal))));
  const score = (p: number[]) => {
    const groups = p.filter((a) => principal(a) === top && top > 0).length;
    const branches = p.reduce(
      (s, a) => s + neighbors(m, a).filter((o) => !p.includes(o) && m.atoms[o]!.el !== 'H').length,
      0,
    );
    return [groups, p.length, branches];
  };
  const locants = (p: number[]) => {
    const pg = p.flatMap((a, k) => (top > 0 && principal(a) === top ? [k + 1] : []));
    const multiple = p.flatMap((a, k) =>
      k + 1 < p.length && bondBetween(m, a, p[k + 1]!)!.order > 1 ? [k + 1] : [],
    );
    const subs = p.flatMap((a, k) =>
      neighbors(m, a)
        .filter((o) => !p.includes(o))
        .map(() => k + 1),
    );
    return [pg, multiple, subs];
  };
  const lexLess = (x: number[], y: number[]) => {
    for (let k = 0; k < Math.min(x.length, y.length); k++) if (x[k] !== y[k]) return x[k]! < y[k]!;
    return false;
  };
  let best = paths[0]!;
  for (const p of paths) {
    const [s, b] = [score(p), score(best)];
    const cmp = s[0]! - b[0]! || s[1]! - b[1]! || s[2]! - b[2]!;
    if (cmp > 0) {
      best = p;
      continue;
    }
    if (cmp < 0) continue;
    const [lp, lb] = [locants(p), locants(best)];
    for (let k = 0; k < 3; k++) {
      if (lexLess(lp[k]!, lb[k]!)) {
        best = p;
        break;
      }
      if (lexLess(lb[k]!, lp[k]!)) break;
    }
  }
  return best;
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export type P = [number, number];

export interface SkLayout {
  mol: SkMol;
  /** Positions, one bond long apart, y up. */
  pos: P[];
  rings: number[][];
  /** Wedges and dashes: bond number → +1 (wedge, toward the viewer) or −1 (dash), narrow at `from`. */
  stereo: { bond: number; from: number; z: 1 | -1 }[];
  /** An H drawn at a stereocenter (the ranked center, or a ring junction): its place and z. */
  hs: { atom: number; at: P; z: 1 | -1 }[];
}

const deg = Math.PI / 180;
const dirOf = (a: P, b: P) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const toward = (p: P, ang: number, r = 1): P => [
  p[0] + r * Math.cos(ang),
  p[1] + r * Math.sin(ang),
];
const norm = (x: number) => {
  let y = x % (2 * Math.PI);
  if (y < 0) y += 2 * Math.PI;
  return y;
};

/**
 * Places every atom: rings as regular polygons (fused rings across their shared edge), chains
 * as zigzags at 120°, a triple bond straight, branches spread; then fixes each `/` `\` double
 * bond's cis or trans, moves overlapping branches, and turns the drawing to fit `aspect`
 * (width ÷ height).
 */
export function layoutMol(m: SkMol, opts: { aspect?: number; center?: number } = {}): SkLayout {
  const n = m.atoms.length;
  const rings = ringsOf(m);
  const pos: (P | undefined)[] = new Array(n).fill(undefined);
  const turn: number[] = new Array(n).fill(0);
  const ringsAt = (a: number) => rings.filter((r) => r.includes(a));
  const linear = (a: number) => {
    const os = m.adj[a]!.map((k) => m.bonds[k]!.order);
    return os.includes(3) || os.filter((o) => o === 2).length >= 2;
  };
  /** The longest path from `b` away from `a` (for the main zigzag). */
  const reach = (a: number, b: number) => {
    let best = 0;
    const go = (x: number, seen: Set<number>, d: number) => {
      best = Math.max(best, d);
      if (seen.size > 40) return;
      for (const y of neighbors(m, x))
        if (!seen.has(y)) {
          seen.add(y);
          go(y, seen, d + 1);
          seen.delete(y);
        }
    };
    go(b, new Set([a, b]), 1);
    return best;
  };
  const placeRingFrom = (ring: number[], a: number, away: number) => {
    const k = ring.indexOf(a);
    const r = [...ring.slice(k), ...ring.slice(0, k)];
    const size = r.length;
    const R = 1 / (2 * Math.sin(Math.PI / size));
    const c = toward(pos[a]!, away, R);
    const a0 = away + Math.PI;
    r.forEach((x, j) => {
      if (!pos[x]) pos[x] = toward(c, a0 + (j * 2 * Math.PI) / size, R);
    });
  };
  /** Places a ring's missing atoms on an arc between two placed ones, away from `side`. */
  const placeArc = (ring: number[]) => {
    const size = ring.length;
    const placed = ring.map((x) => !!pos[x]);
    // The run of missing atoms (cyclically) and its placed ends.
    const s = placed.findIndex((p, j) => p && !placed[(j + 1) % size]);
    if (s < 0) return false;
    const run: number[] = [];
    let j = (s + 1) % size;
    while (!placed[j]) {
      run.push(ring[j]!);
      j = (j + 1) % size;
    }
    const u = pos[ring[s]!]!;
    const v = pos[ring[j]!]!;
    const chord = Math.hypot(v[0] - u[0], v[1] - u[1]);
    const segs = run.length + 1;
    // Per-segment angle θ with sin(segs·θ/2) ÷ sin(θ/2) = chord.
    let lo = 1e-6;
    let hi = (2 * Math.PI) / segs - 1e-6;
    const f = (t: number) => Math.sin((segs * t) / 2) / Math.sin(t / 2) - chord;
    for (let it = 0; it < 60; it++) {
      const mid = (lo + hi) / 2;
      if (f(mid) > 0) lo = mid;
      else hi = mid;
    }
    const theta = (lo + hi) / 2;
    const R = 1 / (2 * Math.sin(theta / 2));
    // Bulge away from the ring's placed atoms (and the rest of the drawing).
    const mid: P = [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2];
    const nrm: P = [-(v[1] - u[1]) / (chord || 1), (v[0] - u[0]) / (chord || 1)];
    const others = ring.filter((x, k) => placed[k] && x !== ring[s] && x !== ring[j]);
    const ref = (
      others.length
        ? others
        : pos.flatMap((p, x) => (p && x !== ring[s] && x !== ring[j] ? [x] : []))
    ).map((x) => pos[x]!);
    let side = 1;
    if (ref.length) {
      const cx = ref.reduce((t, p) => t + p[0], 0) / ref.length;
      const cy = ref.reduce((t, p) => t + p[1], 0) / ref.length;
      side = (cx - mid[0]) * nrm[0] + (cy - mid[1]) * nrm[1] > 0 ? -1 : 1;
    }
    const dc = Math.sqrt(Math.max(0, R * R - (chord / 2) ** 2));
    // Centre on the far side for a minor arc, the near side for a major one.
    const major = segs * theta > Math.PI;
    const c: P = [
      mid[0] + nrm[0] * side * dc * (major ? 1 : -1),
      mid[1] + nrm[1] * side * dc * (major ? 1 : -1),
    ];
    const au = dirOf(c, u);
    const av = dirOf(c, v);
    // Walk from u toward v the way that passes the bulge side.
    const bulge: P = [mid[0] + nrm[0] * side, mid[1] + nrm[1] * side];
    const ab = dirOf(c, bulge);
    const ccw = norm(ab - au) < norm(av - au);
    run.forEach((x, k) => {
      pos[x] = toward(c, au + (ccw ? 1 : -1) * theta * (k + 1), R);
    });
    return true;
  };
  const fillRings = () => {
    let again = true;
    while (again) {
      again = false;
      const open = rings
        .map((r) => ({ r, k: r.filter((x) => pos[x]).length }))
        .filter((x) => x.k >= 2 && x.k < x.r.length)
        .sort((p, q) => q.k - p.k);
      if (open.length && placeArc(open[0]!.r)) again = true;
    }
  };
  const start = 0;
  pos[start] = [0, 0];
  const startRings = ringsAt(start);
  if (startRings.length) {
    placeRingFrom(startRings[0]!, start, -Math.PI / 2 - Math.PI / startRings[0]!.length);
    fillRings();
  }
  const queue = [start];
  const done = new Set<number>();
  while (queue.length || pos.some((p) => !p)) {
    if (!queue.length) {
      // Another piece: start it to the right of everything.
      const x = Math.max(...pos.flatMap((p) => (p ? [p[0]] : [])));
      const s = pos.findIndex((p) => !p);
      pos[s] = [x + 2, 0];
      const rs = ringsAt(s);
      if (rs.length) {
        placeRingFrom(rs[0]!, s, 0);
        fillRings();
      }
      queue.push(s);
    }
    const a = queue.shift()!;
    if (done.has(a)) continue;
    done.add(a);
    // Rings through a that start here.
    for (const r of ringsAt(a)) {
      if (r.every((x) => pos[x])) continue;
      if (r.filter((x) => pos[x]).length === 1) {
        const placedN = neighbors(m, a).filter((o) => pos[o] && !r.includes(o));
        const away = placedN.length
          ? Math.atan2(
              -placedN.reduce((s, o) => s + Math.sin(dirOf(pos[a]!, pos[o]!)), 0),
              -placedN.reduce((s, o) => s + Math.cos(dirOf(pos[a]!, pos[o]!)), 0),
            )
          : 0;
        placeRingFrom(r, a, away);
      }
      fillRings();
    }
    const nb = neighbors(m, a);
    const todo = nb.filter((o) => !pos[o]);
    const placedDirs = nb.filter((o) => pos[o]).map((o) => dirOf(pos[a]!, pos[o]!));
    if (todo.length) {
      let dirs: number[];
      let turns: number[] = [];
      const inRing = ringsAt(a).length > 0;
      if (placedDirs.length === 0) {
        dirs =
          [[30], [30, 150], [30, 150, 270], [45, 135, 225, 315]][todo.length - 1]?.map(
            (d) => d * deg,
          ) ?? todo.map((_, k) => (k * 2 * Math.PI) / todo.length);
      } else if (inRing || placedDirs.length > 1) {
        const out = Math.atan2(
          -placedDirs.reduce((s, d) => s + Math.sin(d), 0),
          -placedDirs.reduce((s, d) => s + Math.cos(d), 0),
        );
        if (todo.length === 1) dirs = [out];
        else if (todo.length === 2 && inRing) dirs = [out + 35 * deg, out - 35 * deg];
        else {
          // Spread over the widest gap.
          const sorted = placedDirs.map(norm).sort((x, y) => x - y);
          let gs = 0;
          let gw = 0;
          sorted.forEach((d, k) => {
            const nx = k + 1 < sorted.length ? sorted[k + 1]! : sorted[0]! + 2 * Math.PI;
            if (nx - d > gw) [gs, gw] = [d, nx - d];
          });
          dirs = todo.map((_, k) => gs + (gw * (k + 1)) / (todo.length + 1));
        }
      } else {
        const din = placedDirs[0]! + Math.PI;
        const t = turn[a] || 1;
        if (todo.length === 1) {
          if (linear(a)) {
            dirs = [din];
            turns = [t];
          } else {
            dirs = [din + t * 60 * deg];
            turns = [-t];
          }
        } else if (todo.length === 2) {
          dirs = [din + t * 60 * deg, din - t * 60 * deg];
          turns = [-t, t];
        } else {
          dirs = [din, din + 90 * deg, din - 90 * deg];
          turns = [t, -t, t];
        }
      }
      // The longest branch takes the first direction (the zigzag's continuation).
      const ranked = [...todo].sort((x, y) => reach(a, y) - reach(a, x));
      ranked.forEach((o, k) => {
        const d = dirs[k] ?? dirs[dirs.length - 1]! + (k * Math.PI) / 3;
        pos[o] = toward(pos[a]!, d);
        const cos = Math.cos(d);
        const sin = Math.sin(d);
        turn[o] =
          turns[k] ??
          (Math.abs(cos) < 1e-6 ? -1 : cos > 0 ? (sin >= 0 ? -1 : 1) : sin >= 0 ? 1 : -1);
      });
      fillRings();
    }
    for (const o of nb) if (!done.has(o)) queue.push(o);
    for (let x = 0; x < n; x++) if (pos[x] && !done.has(x) && !queue.includes(x)) queue.push(x);
  }
  const placed = pos as P[];

  // Cis and trans: reflect one side of each marked double bond if it is drawn wrong.
  const inRingBond = (a: number, b: number) => rings.some((r) => r.includes(a) && r.includes(b));
  const side = (a: number, b: number, x: number) => {
    const [pa, pb, px] = [placed[a]!, placed[b]!, placed[x]!];
    return Math.sign((pb[0] - pa[0]) * (px[1] - pa[1]) - (pb[1] - pa[1]) * (px[0] - pa[0]));
  };
  const subtree = (from: number, root: number) => {
    const seen = new Set([from, root]);
    const todo = [root];
    while (todo.length) {
      const x = todo.pop()!;
      for (const y of neighbors(m, x))
        if (!seen.has(y)) {
          seen.add(y);
          todo.push(y);
        }
    }
    seen.delete(from);
    return seen;
  };
  const reflect = (atoms: Set<number>, a: number, b: number) => {
    const [pa, pb] = [placed[a]!, placed[b]!];
    const d = dirOf(pa, pb);
    const [c, s] = [Math.cos(2 * d), Math.sin(2 * d)];
    for (const x of atoms) {
      const [dx, dy] = [placed[x]![0] - pa[0], placed[x]![1] - pa[1]];
      placed[x] = [pa[0] + c * dx + s * dy, pa[1] + s * dx - c * dy];
    }
  };
  /** Which side of a=b the neighbor x is marked on: +1 above, −1 below (from its `/` `\`). */
  const markedSide = (a: number, x: number) => {
    const bd = bondBetween(m, a, x);
    if (!bd?.dir) return 0;
    const up = bd.dir === '/' ? 1 : -1;
    return bd.a === x ? -up : up;
  };
  for (const b of m.bonds) {
    if (b.order !== 2 || inRingBond(b.a, b.b)) continue;
    const xa = neighbors(m, b.a).find((x) => x !== b.b && markedSide(b.a, x) !== 0);
    const yb = neighbors(m, b.b).find((y) => y !== b.a && markedSide(b.b, y) !== 0);
    if (xa === undefined || yb === undefined) continue;
    const cis = markedSide(b.a, xa) === markedSide(b.b, yb);
    const drawnCis = side(b.a, b.b, xa) === side(b.a, b.b, yb);
    if (cis !== drawnCis) {
      const t = subtree(b.a, b.b);
      if (!t.has(b.a)) reflect(t, b.a, b.b);
    }
  }

  // Overlaps: flip a branch across its bond while that leaves fewer atoms too close.
  const crowd = () => {
    let k = 0;
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++)
        if (Math.hypot(placed[i]![0] - placed[j]![0], placed[i]![1] - placed[j]![1]) < 0.6) k++;
    return k;
  };
  for (let pass = 0; pass < 3 && crowd() > 0; pass++) {
    for (const b of m.bonds) {
      if (b.order !== 1 || inRingBond(b.a, b.b)) continue;
      for (const [u, v] of [
        [b.a, b.b],
        [b.b, b.a],
      ] as const) {
        const t = subtree(u, v);
        if (t.has(u) || t.size > n / 2) continue;
        const before = crowd();
        if (before === 0) break;
        const keep = new Map([...t].map((x) => [x, placed[x]!] as const));
        reflect(t, u, v);
        if (crowd() >= before) for (const [x, p] of keep) placed[x] = p;
      }
    }
  }

  // Turn to fit the box: the turn (in 15° steps) that draws it largest, the least turn on a tie.
  const aspect = opts.aspect ?? 2;
  const fit = (pts: P[]) => {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const w = Math.max(...xs) - Math.min(...xs) + 1;
    const h = Math.max(...ys) - Math.min(...ys) + 1;
    return Math.min(aspect / w, 1 / h);
  };
  const turned = (t: number) =>
    placed.map(([x, y]): P => [
      x * Math.cos(t) - y * Math.sin(t),
      x * Math.sin(t) + y * Math.cos(t),
    ]);
  let bestT = 0;
  let bestF = fit(placed);
  for (let k = 1; k < 24; k++) {
    const t = k * 15 * deg;
    const f = fit(turned(t));
    if (f > bestF * 1.04) [bestT, bestF] = [t, f];
  }
  const final = turned(bestT);
  const lay: SkLayout = { mol: m, pos: final, rings, stereo: [], hs: [] };
  assignWedges(lay, opts.center);
  return lay;
}

/** 3D points round a stereocenter as drawn: in the page plane, z from the wedges. */
function drawn3d(lay: SkLayout, a: number, order: number[], hAt: P | undefined, hz: number) {
  const p0 = lay.pos[a]!;
  return order.map((o): V3 => {
    if (o === -1) {
      const h = hAt ?? p0;
      return [h[0] - p0[0], h[1] - p0[1], hz];
    }
    const p = lay.pos[o]!;
    const len = Math.hypot(p[0] - p0[0], p[1] - p0[1]) || 1;
    const w = lay.stereo.find((s) => s.from === a && other(lay.mol.bonds[s.bond]!, a) === o);
    return [(p[0] - p0[0]) / len, (p[1] - p0[1]) / len, w ? w.z : 0];
  });
}

/**
 * A wedge or dash on one bond of each stereocenter (narrow end at the center) so the drawing
 * has the written `@`/`@@`. The ranked center (and a center with no bond to spare) shows its H.
 */
function assignWedges(lay: SkLayout, center?: number) {
  const m = lay.mol;
  const used = new Set<number>();
  const ringOf = (a: number, b: number) => lay.rings.some((r) => r.includes(a) && r.includes(b));
  const centers = m.atoms.flatMap((at, a) => (at.chiral ? [a] : []));
  for (const a of centers) {
    const at = m.atoms[a]!;
    const order = writtenOrder(m, a);
    if (order.length !== 4) continue;
    const want = at.chiral === '@';
    const nb = neighbors(m, a);
    const p0 = lay.pos[a]!;
    const showH = at.h === 1 && (a === center || nb.every((o) => ringOf(a, o)));
    // Candidate bonds, best first: off any ring, to a branch end, to a heteroatom, not another
    // stereocenter.
    const cands = nb
      .map((o) => {
        const k = m.adj[a]!.find((kk) => other(m.bonds[kk]!, a) === o)!;
        const score =
          (ringOf(a, o) ? 0 : 8) +
          (neighbors(m, o).length === 1 ? 4 : 0) +
          (m.atoms[o]!.el !== 'C' ? 2 : 0) -
          (m.atoms[o]!.chiral ? 6 : 0) -
          (m.bonds[k]!.order > 1 ? 20 : 0);
        return { o, k, score };
      })
      .filter((c) => !used.has(c.k))
      .sort((x, y) => y.score - x.score);
    const dirs = nb.map((o) => norm(dirOf(p0, lay.pos[o]!)));
    /** Where an H goes: beside bond o, in the gap on side s (±1), or in the widest gap. */
    const hPlace = (o: number | undefined, s: number): P => {
      const sorted = [...dirs].sort((x, y) => x - y);
      if (o === undefined) {
        let gs = 0;
        let gw = 0;
        sorted.forEach((d, k) => {
          const nx = k + 1 < sorted.length ? sorted[k + 1]! : sorted[0]! + 2 * Math.PI;
          if (nx - d > gw) [gs, gw] = [d, nx - d];
        });
        return toward(p0, gs + gw / 2, 0.75);
      }
      const d = norm(dirOf(p0, lay.pos[o]!));
      const k = sorted.indexOf(d);
      const nx =
        s > 0
          ? (sorted[(k + 1) % sorted.length]! - d + 2 * Math.PI) % (2 * Math.PI) || 2 * Math.PI
          : (d - sorted[(k - 1 + sorted.length) % sorted.length]! + 2 * Math.PI) % (2 * Math.PI) ||
            2 * Math.PI;
      return toward(p0, d + s * Math.min(nx / 2, 50 * deg), 0.75);
    };
    const tries: { c?: (typeof cands)[number]; z: 1 | -1; s: number }[] = [];
    // A ring junction shows only its H, wedged or dashed.
    if (showH && cands.every((c) => ringOf(a, c.o)))
      for (const z of [1, -1] as const) tries.push({ z, s: 0 });
    for (const c of cands)
      for (const z of [1, -1] as const)
        for (const s of showH ? [1, -1] : [0]) tries.push({ c, z, s });
    for (const t of tries) {
      if (t.c) lay.stereo.push({ bond: t.c.k, from: a, z: t.z });
      const hz = t.c ? -t.z : t.z;
      const hAt = showH ? hPlace(t.c?.o, t.s) : at.h ? hiddenH(lay, a) : undefined;
      if (isAnticlockwise(drawn3d(lay, a, order, hAt, hz)) === want) {
        if (t.c) used.add(t.c.k);
        if (showH && hAt) lay.hs.push({ atom: a, at: hAt, z: hz as 1 | -1 });
        break;
      }
      if (t.c) lay.stereo.pop();
    }
  }
}

/** Where a hidden H points: a little way opposite the drawn bonds (out of the page). */
function hiddenH(lay: SkLayout, a: number): P {
  const p0 = lay.pos[a]!;
  const nb = neighbors(lay.mol, a);
  const sx = nb.reduce((s, o) => s + Math.cos(dirOf(p0, lay.pos[o]!)), 0);
  const sy = nb.reduce((s, o) => s + Math.sin(dirOf(p0, lay.pos[o]!)), 0);
  return [p0[0] - sx * 0.3, p0[1] - sy * 0.3];
}

/** R or S as drawn: from the ranks and the wedges (and any drawn H). */
export function drawnConfiguration(lay: SkLayout, a: number): 'R' | 'S' | undefined {
  const m = lay.mol;
  const ranks = cipRanks(m, a);
  if (!ranks || !m.atoms[a]!.chiral) return undefined;
  const h = lay.hs.find((x) => x.atom === a);
  const wedged = lay.stereo.find((s) => s.from === a);
  const byRank = [...ranks.entries()].sort((x, y) => x[1] - y[1]).map(([k]) => k);
  const order = [byRank[3]!, byRank[0]!, byRank[1]!, byRank[2]!];
  // A hidden H sits opposite the drawn bonds, on the far side of the wedge.
  const hAt = h?.at ?? (m.atoms[a]!.h === 1 ? hiddenH(lay, a) : undefined);
  const hz = h ? h.z : wedged ? -wedged.z : 0;
  const pts = drawn3d(lay, a, order, hAt, hz);
  return isAnticlockwise(pts) ? 'R' : 'S';
}

// ─── The chair ────────────────────────────────────────────────────────────────

export interface Chair {
  /** The six ring carbons, C1 first, projected (y up). */
  ring: P[];
  /** +1 where the carbon sits up (its axial bond points up), −1 where it sits down. */
  up: number[];
  /** The axial and equatorial bond directions at each carbon, projected. */
  axial: P[];
  equatorial: P[];
}

/**
 * Cyclohexane's chair, from its 3D shape (carbons round a circle, alternately up and down)
 * seen from a little above: axial bonds vertical, each equatorial bond tilted the other way.
 * `flipped` is the chair after a ring flip: every carbon that was up is down, so every axial
 * group turns equatorial on the same face. C1 is the left tip, down in the first chair.
 */
export function chairOf(flipped: boolean): Chair {
  const h = 0.32;
  const tilt = 0.45;
  const ring: P[] = [];
  const up: number[] = [];
  const axial: P[] = [];
  const equatorial: P[] = [];
  for (let k = 0; k < 6; k++) {
    // Turned 10° about the vertical so the near and far carbons part.
    const t = Math.PI + (k * Math.PI) / 3 + (10 * Math.PI) / 180;
    const s = (k % 2 === 0 ? -1 : 1) * (flipped ? -1 : 1);
    const [x, y, z] = [Math.cos(t), Math.sin(t), s * h];
    ring.push([x, z + y * tilt]);
    up.push(s);
    axial.push([0, s]);
    const e: V3 = [Math.cos(t), Math.sin(t), -s * 0.33];
    const len = Math.hypot(e[0], e[1], e[2]);
    equatorial.push([e[0] / len, (e[2] + e[1] * tilt) / len]);
  }
  return { ring, up, axial, equatorial };
}

/** Counts a structure is picked by: C, H, N, X (halogens), and its π bonds and rings. */
export function countsOf(m: SkMol) {
  const f = formulaOf(m);
  const k = (e: string) => f.counts[e] ?? 0;
  const u = unsaturation(m);
  return {
    c: k('C'),
    h: k('H'),
    n: k('N'),
    x: HALOGENS.reduce((s, e) => s + k(e), 0),
    pi: u.pi,
    rings: u.rings,
  };
}

/**
 * The first candidate whose C, H, N and X are the typed counts (and its π bonds and rings,
 * when typed): its index, or −1.
 */
export function pickCandidate(
  smiles: string[],
  want: { c: number; h: number; n?: number; x?: number; pi?: number; rings?: number },
): number {
  return smiles.findIndex((s) => {
    const m = parseSmiles(s);
    if (m.error) return false;
    const k = countsOf(m);
    return (
      k.c === want.c &&
      k.h === want.h &&
      k.n === (want.n ?? 0) &&
      k.x === (want.x ?? 0) &&
      (want.pi === undefined || k.pi === want.pi) &&
      (want.rings === undefined || k.rings === want.rings)
    );
  });
}

/** The atoms a `group` option lights: a named group's, or the atoms listed. */
export function litAtoms(m: SkMol, lit: GroupName | number[] | undefined): Set<number> {
  if (!lit) return new Set();
  if (Array.isArray(lit)) return new Set(lit.filter((a) => a >= 0 && a < m.atoms.length));
  return new Set(groupAtoms(m, lit));
}

/** Chain numbers by atom from a `numbered` option (true: the parent chain). */
export function chainNumbers(m: SkMol, numbered: boolean | number[] | undefined) {
  const chain = numbered === true ? parentChain(m) : Array.isArray(numbered) ? numbered : [];
  return new Map(chain.map((a, k) => [a, k + 1] as const));
}

/** Words for a lit group in a caption. */
export const GROUP_WORDS: Record<GroupName, string> = {
  hydroxyl: 'the hydroxyl group (–OH)',
  carbonyl: 'the carbonyl group (C=O)',
  aldehyde: 'the aldehyde group (–CHO)',
  ketone: 'the ketone’s C=O',
  carboxyl: 'the carboxylic acid group (–COOH)',
  ester: 'the ester group (–COO–)',
  amide: 'the amide group (–CON–)',
  amine: 'the amine’s N',
  nitrile: 'the nitrile group (–C≡N)',
  ether: 'the ether’s O (C–O–C)',
  halide: 'the halogen',
  alkene: 'the C=C double bond',
  alkyne: 'the C≡C triple bond',
  arene: 'the aromatic ring',
  nitro: 'the nitro group (–NO₂)',
  thiol: 'the thiol group (–SH)',
  anhydride: 'the anhydride group (–CO–O–CO–)',
};

const SUBS = '₀₁₂₃₄₅₆₇₈₉⁺⁻';

/**
 * How an atom is written, or undefined for a carbon (a corner): its letters with its H on the
 * side away from its bonds ("HO" when the bond comes from the right; `mirror` swaps sides) and
 * its charge as a superscript.
 */
export function atomLabel(lay: SkLayout, a: number, mirror = false) {
  const at = lay.mol.atoms[a]!;
  if (at.el === 'C' && lay.mol.adj[a]!.length > 0) return undefined;
  const p = lay.pos[a]!;
  const vx =
    neighbors(lay.mol, a).reduce((s, o) => s + lay.pos[o]![0] - p[0], 0) * (mirror ? -1 : 1);
  const hLeft = at.h > 0 && vx > 0.3;
  const hs =
    at.h > 0 ? `H${at.h > 1 ? String(at.h).replace(/\d/g, (d) => SUBS[Number(d)]!) : ''}` : '';
  const q = at.charge;
  const sup =
    q === 0 ? '' : Math.abs(q) === 1 ? (q > 0 ? '⁺' : '⁻') : `${Math.abs(q)}${q > 0 ? '+' : '−'}`;
  return { text: hLeft ? `${hs}${at.el}${sup}` : `${at.el}${hs}${sup}`, hLeft };
}

/** A label's width at a font size: letters about 0.62 em, sub- and superscripts 0.45 em. */
export const labelWidth = (text: string, font: number) =>
  [...text].reduce((s, ch) => s + (SUBS.includes(ch) ? 0.45 : 0.62) * font, 0);

/**
 * The bond length (px) that fits a layout in a w × h box, its letters (at `font`) inside the
 * margin, at most `maxBond`; and the layout point drawn at the box's centre.
 */
export function fitLayout(
  lay: SkLayout,
  w: number,
  h: number,
  maxBond: number,
  margin: number,
  font = 13,
): { scale: number; cx: number; cy: number } {
  const pts = lay.pos.concat(lay.hs.map((x) => x.at));
  // Each point's box in px about its place: [left, right, up, down].
  const pad = pts.map((_, a): [number, number, number, number] => {
    if (a >= lay.pos.length) return [font * 0.4, font * 0.4, font * 0.5, font * 0.5];
    const l = atomLabel(lay, a);
    if (!l) return [0, 0, 0, 0];
    const tw = labelWidth(l.text, font);
    const ew = labelWidth(lay.mol.atoms[a]!.el, font);
    return l.hLeft
      ? [tw - ew / 2, ew / 2, font * 0.5, font * 0.5]
      : [ew / 2, tw - ew / 2, font * 0.5, font * 0.5];
  });
  const box = (s: number) => {
    const xl = Math.min(...pts.map((p, k) => p[0] * s - pad[k]![0]));
    const xr = Math.max(...pts.map((p, k) => p[0] * s + pad[k]![1]));
    const yt = Math.max(...pts.map((p, k) => p[1] * s + pad[k]![2]));
    const yb = Math.min(...pts.map((p, k) => p[1] * s - pad[k]![3]));
    return { xl, xr, yt, yb };
  };
  const fits = (s: number) => {
    const b = box(s);
    return b.xr - b.xl <= w - 2 * margin && b.yt - b.yb <= h - 2 * margin;
  };
  let lo = 0;
  let hi = maxBond;
  if (fits(hi)) lo = hi;
  else
    for (let it = 0; it < 30; it++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
  const scale = Math.max(lo, 1);
  const b = box(scale);
  return { scale, cx: (b.xl + b.xr) / 2 / scale, cy: (b.yt + b.yb) / 2 / scale };
}
