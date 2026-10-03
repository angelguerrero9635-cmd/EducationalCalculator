/**
 * The arithmetic behind the passive-circuit schematics (HC7, NetSchematic.tsx): each topology's
 * netlist (which element joins which two nodes), a small modified-nodal-analysis solver for the
 * DC circuits, and the SI factor of a page's unit. Shared by the picture and its harness check.
 */
import { getUnit } from '@/engine/units';
import type { CircuitNet, NetPart, NetTopology } from '@/data/modules/typesHe1h';

/** Units the unit table doesn't list, in SI. */
const EXTRA: Record<string, number> = {
  H: 1,
  mH: 1e-3,
  μH: 1e-6,
  με: 1e-6,
  Hz: 1,
  kHz: 1e3,
  MHz: 1e6,
  'rad/s': 1,
  'N/m': 1,
  'N·s/m': 1,
  'kN/m': 1e3,
};

/** SI units in one of `unit` (kΩ → 1000, μF → 10⁻⁶); 1 when the unit is unknown or none. */
export const siFactor = (unit: string | undefined) =>
  unit === undefined ? 1 : (getUnit(unit)?.factor ?? EXTRA[unit] ?? 1);

/**
 * One edge of a netlist: element `el` (an index into `elements`, or -1 for the internal r) from
 * node `a` to node `b` (0 is ground). A source's + is at `b` (V(b) − V(a) = E); a current
 * source drives its value from `a` to `b`; a passive part's current and voltage are taken
 * a → b (passive sign).
 */
export interface Edge {
  el: number;
  a: number;
  b: number;
}

export interface Netlist {
  nodes: number;
  edges: Edge[];
  /** Loops for KVL: [edge index, +1 along a → b or −1 against]. */
  loops: [number, 1 | -1][][];
  /** Node index for each of `net.nodes`. */
  nodeAt: number[];
  /** Edge index for each of `net.branches`. */
  branchAt: number[];
  /** Edge index whose current is each of `net.meshes`. */
  meshAt: number[];
}

const e = (el: number, a: number, b: number): Edge => ({ el, a, b });

/** The netlist a topology draws; `count` is the number of elements (series loops vary). */
export function netlistOf(net: CircuitNet): Netlist {
  const n = net.elements.length;
  switch (net.topology) {
    case 'series':
    case 'rc':
    case 'rl':
    case 'rlc': {
      // Round the loop clockwise from the bottom-left corner: element i from node i to i + 1.
      const parts = net.internal ? [0, -1, ...range(1, n)] : range(0, n);
      const k = parts.length;
      const edges = parts.map((el, i) => e(el, i, (i + 1) % k));
      const after = (el: number) => (parts.indexOf(el) + 1) % k;
      return {
        nodes: k,
        edges,
        loops: [edges.map((_, i) => [i, 1] as [number, 1])],
        nodeAt: range(0, n).map(after),
        branchAt: [0],
        meshAt: [0],
      };
    }
    case 'parallel':
      return {
        nodes: 2,
        edges: [e(0, 0, 1), ...range(1, n).map((i) => e(i, 1, 0))],
        loops: range(1, n).map((i) => [
          [0, 1],
          [i, 1],
        ]),
        nodeAt: [1],
        branchAt: range(0, n),
        meshAt: [],
      };
    case 'twoNode':
      return {
        nodes: 4,
        edges: [e(0, 0, 3), e(1, 3, 1), e(2, 1, 0), e(3, 1, 2), e(4, 2, 0), e(5, 0, 2)],
        loops: [
          [
            [0, 1],
            [1, 1],
            [2, 1],
          ],
          [
            [2, -1],
            [3, 1],
            [4, 1],
          ],
        ],
        nodeAt: [1, 2],
        branchAt: [1, 2, 3, 4],
        meshAt: [],
      };
    case 'twoMesh':
      return {
        nodes: 4,
        edges: [e(0, 0, 1), e(1, 1, 2), e(2, 2, 0), e(3, 2, 3), e(4, 0, 3)],
        loops: [
          [
            [0, 1],
            [1, 1],
            [2, 1],
          ],
          [
            [3, 1],
            [4, -1],
            [2, -1],
          ],
        ],
        nodeAt: [2],
        branchAt: [2],
        meshAt: [1, 3],
      };
    case 'twoLoop':
      return {
        nodes: 4,
        edges: [e(0, 0, 2), e(1, 2, 1), e(2, 0, 3), e(3, 3, 1), e(4, 1, 0)],
        loops: [
          [
            [0, 1],
            [1, 1],
            [4, 1],
          ],
          [
            [2, 1],
            [3, 1],
            [4, 1],
          ],
        ],
        nodeAt: [1],
        branchAt: [0, 2, 4],
        meshAt: [],
      };
    case 'supernode':
      return {
        nodes: 3,
        edges: [e(0, 0, 1), e(1, 1, 0), e(2, 2, 1), e(3, 2, 0)],
        loops: [
          [
            [1, 1],
            [3, -1],
            [2, 1],
          ],
        ],
        nodeAt: [1, 2],
        branchAt: [1, 3, 2],
        meshAt: [],
      };
    case 'thevenin':
    case 'superposition':
      return {
        nodes: 3,
        edges: [
          e(0, 0, 2),
          e(1, 2, 1),
          e(2, 1, 0),
          net.topology === 'thevenin' ? e(3, 1, 0) : e(3, 0, 1),
        ],
        loops: [
          [
            [0, 1],
            [1, 1],
            [2, 1],
          ],
          ...(net.topology === 'thevenin'
            ? [
                [
                  [2, -1],
                  [3, 1],
                ] as [number, 1 | -1][],
              ]
            : []),
        ],
        nodeAt: [1],
        branchAt: net.topology === 'thevenin' ? [3] : [1, 2],
        meshAt: [],
      };
    case 'lowpass':
      return {
        nodes: 3,
        edges: [e(0, 0, 2), e(1, 2, 1), e(2, 1, 0)],
        loops: [],
        nodeAt: [1],
        branchAt: [1],
        meshAt: [],
      };
    case 'bridge':
      return {
        nodes: 4,
        edges: [e(0, 0, 3), e(1, 3, 1), e(2, 1, 0), e(3, 3, 2), e(4, 2, 0)],
        loops: [],
        nodeAt: [1, 2],
        branchAt: [],
        meshAt: [],
      };
    case 'seriesParallel':
    case 'parallelSeries':
      return {
        nodes: 3,
        edges: [
          e(0, 0, 2),
          e(1, 2, 1),
          e(2, 1, 0),
          net.topology === 'seriesParallel' ? e(3, 1, 0) : e(3, 2, 0),
        ],
        loops: [
          [
            [0, 1],
            [1, 1],
            [2, 1],
          ],
          net.topology === 'seriesParallel'
            ? [
                [2, -1],
                [3, 1],
              ]
            : [
                [0, 1],
                [3, 1],
              ],
        ],
        nodeAt: [1],
        branchAt: [1, 2, 3],
        meshAt: [],
      };
    case 'norton':
    case 'element':
      return { nodes: 1, edges: [], loops: [], nodeAt: [], branchAt: [], meshAt: [] };
  }
}

export const range = (from: number, to: number) =>
  Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i);

/** The DC circuits the solver works (the others are checked by their own rules). */
export const DC: ReadonlySet<NetTopology> = new Set([
  'series',
  'parallel',
  'twoNode',
  'twoMesh',
  'twoLoop',
  'supernode',
  'thevenin',
  'superposition',
  'seriesParallel',
  'parallelSeries',
]);

export interface Solved {
  /** Node voltages (V), ground 0. */
  v: number[];
  /** Each edge's current a → b (A); a capacitor network's charge (C) in place of current. */
  i: number[];
  /** Each edge's voltage V(a) − V(b). */
  drop: number[];
}

/**
 * Modified nodal analysis of `edges` with SI values `value[k]` (Ω, F, H, V, A; NaN or a part
 * left out, `skip`, is open). A network of capacitors only is solved for charge (C as the
 * admittance, uncharged at the start); otherwise C is open and L a short (DC).
 */
export function solveNet(
  nodes: number,
  edges: Edge[],
  kinds: NetPart[],
  value: number[],
  skip: ReadonlySet<number> = new Set(),
): Solved | undefined {
  const live = edges.map((_, k) => !skip.has(k));
  const charge = edges.every((_, k) => !live[k] || kinds[k] === 'C' || kinds[k] === 'V');
  const volt = edges
    .map((_, k) => k)
    .filter((k) => live[k] && (kinds[k] === 'V' || (kinds[k] === 'L' && !charge)));
  const N = nodes - 1;
  const size = N + volt.length;
  const A = Array.from({ length: size }, () => new Array<number>(size + 1).fill(0));
  const row = (node: number) => node - 1;
  const add = (r: number, k: number, x: number) => {
    A[r]![k] = A[r]![k]! + x;
  };
  edges.forEach((ed, k) => {
    if (!live[k]) return;
    const kind = kinds[k]!;
    const x = value[k]!;
    if (kind === 'R' || (kind === 'C' && charge)) {
      const g = kind === 'R' ? 1 / x : x;
      if (!Number.isFinite(g)) return;
      for (const [p, q, s] of [
        [ed.a, ed.a, 1],
        [ed.b, ed.b, 1],
        [ed.a, ed.b, -1],
        [ed.b, ed.a, -1],
      ] as const) {
        if (p > 0 && q > 0) add(row(p), row(q), s * g);
      }
    } else if (kind === 'I') {
      if (ed.b > 0) add(row(ed.b), size, x);
      if (ed.a > 0) add(row(ed.a), size, -x);
    }
  });
  volt.forEach((k, j) => {
    const ed = edges[k]!;
    const r = N + j;
    // The source's current j flows a → b through it: it leaves node a, enters node b.
    if (ed.a > 0) {
      add(row(ed.a), r, 1);
      add(r, row(ed.a), -1);
    }
    if (ed.b > 0) {
      add(row(ed.b), r, -1);
      add(r, row(ed.b), 1);
    }
    A[r]![size] = kinds[k] === 'V' ? value[k]! : 0;
  });
  const x = gauss(A);
  if (!x) return undefined;
  const v = [0, ...x.slice(0, N)];
  const i = edges.map((ed, k) => {
    if (!live[k]) return 0;
    const j = volt.indexOf(k);
    if (j >= 0) return x[N + j]!;
    const kind = kinds[k]!;
    const d = v[ed.a]! - v[ed.b]!;
    if (kind === 'R') return d / value[k]!;
    if (kind === 'C' && charge) return d * value[k]!;
    if (kind === 'I') return value[k]!;
    return 0;
  });
  return { v, i, drop: edges.map((ed) => v[ed.a]! - v[ed.b]!) };
}

/** Gaussian elimination with partial pivoting on an augmented matrix; undefined if singular. */
function gauss(M: number[][]): number[] | undefined {
  const n = M.length;
  const A = M.map((r) => [...r]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r]![c]!) > Math.abs(A[p]![c]!)) p = r;
    if (Math.abs(A[p]![c]!) < 1e-300) return undefined;
    [A[c], A[p]] = [A[p]!, A[c]!];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = A[r]![c]! / A[c]![c]!;
      if (f === 0) continue;
      for (let k = c; k <= n; k++) A[r]![k]! -= f * A[c]![k]!;
    }
  }
  return A.map((r, i) => r[n]! / r[i]!);
}

/** The edge kinds of a netlist (the internal r is a resistor). */
export const kindsOf = (net: CircuitNet, list: Netlist): NetPart[] =>
  list.edges.map((ed) => (ed.el < 0 ? 'R' : net.elements[ed.el]!.kind));

/**
 * Thévenin's V_Th and R_Th seen by the load (the last element) of a `thevenin` circuit: the
 * open-circuit voltage, and that over the short-circuit current.
 */
export function theveninOf(list: Netlist, kinds: NetPart[], value: number[]) {
  const load = list.edges.length - 1;
  const open = solveNet(list.nodes, list.edges, kinds, value, new Set([load]));
  // The load replaced by a short: a 0 V source a → b.
  const shortKinds = kinds.map((k, j) => (j === load ? 'V' : k)) as NetPart[];
  const shortVal = value.map((x, j) => (j === load ? 0 : x));
  const short = solveNet(list.nodes, list.edges, shortKinds, shortVal);
  if (!open || !short) return undefined;
  const v = open.drop[load]!;
  const isc = short.i[load]!;
  return { v, r: v / isc, isc };
}

/** The two one-source node voltages of a `superposition` circuit: [V′ (Iₛ opened), V″ (Vₛ shorted)]. */
export function superpositionOf(list: Netlist, kinds: NetPart[], value: number[]) {
  const one = solveNet(list.nodes, list.edges, kinds, value, new Set([3]));
  const two = solveNet(
    list.nodes,
    list.edges,
    kinds,
    value.map((x, j) => (j === 0 ? 0 : x)),
  );
  if (!one || !two) return undefined;
  return [one.v[1]!, two.v[1]!] as const;
}

/** A first-order RC low-pass: f_c = 1/(2πRC), |H| = 1/√(1 + (f/f_c)²), and that in dB. */
export function lowpassOf(R: number, C: number, f: number) {
  const fc = 1 / (2 * Math.PI * R * C);
  const gain = 1 / Math.sqrt(1 + (f / fc) ** 2);
  return { fc, gain, db: 20 * Math.log10(gain) };
}
