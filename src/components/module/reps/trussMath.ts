/**
 * The truss behind the `truss` picture (HC27, `typesHe2i.ts`): joints, members, supports and
 * loads in the page's units, member forces by the method of joints (+ tension), a section cut
 * with its moment centre, and a joint's deflection by the unit-load method. Shared by the
 * picture and its harness check.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { TrussCoord, TrussSpec } from '@/data/modules/typesHe2i';

export type Get = (x: NumOrVar | undefined) => number | undefined;

export type MemberRole = 'top' | 'bottom' | 'diagonal' | 'vertical' | 'post' | 'member';

export interface TrussModel {
  joints: { name: string; x: number; y: number }[];
  members: { a: number; b: number; force?: NumOrVar; role: MemberRole }[];
  supports: { j: number; kind: 'pin' | 'roller'; reaction?: NumOrVar }[];
  /** External loads: components (+ right, + up) and the size as given. */
  loads: { j: number; fx: number; fy: number; P: number; dir: 'down' | 'up' | 'left' | 'right' }[];
  panel?: { type: 'pratt' | 'howe' | 'warren'; n: number; d: number; h: number; P: number };
}

const coordOf = (c: TrussCoord, get: Get) =>
  Array.isArray(c) ? (get(c[0]) === undefined ? undefined : get(c[0])! * c[1]) : get(c);

const DIRS = { down: [0, -1], up: [0, 1], left: [-1, 0], right: [1, 0] } as const;

/** The panel truss's joints and members (Pratt and Howe with end posts; Warren). */
function panelTruss(
  type: 'pratt' | 'howe' | 'warren',
  n: number,
  d: number,
  h: number,
): Pick<TrussModel, 'joints' | 'members'> {
  const joints: TrussModel['joints'] = [];
  const members: TrussModel['members'] = [];
  const L = (i: number) => i;
  for (let i = 0; i <= n; i++) joints.push({ name: `L${i}`, x: i * d, y: 0 });
  for (let i = 0; i < n; i++) members.push({ a: L(i), b: L(i + 1), role: 'bottom' });
  if (type === 'warren') {
    const U = (i: number) => n + 1 + i;
    for (let i = 0; i < n; i++) joints.push({ name: `U${i}`, x: (i + 0.5) * d, y: h });
    for (let i = 0; i + 1 < n; i++) members.push({ a: U(i), b: U(i + 1), role: 'top' });
    for (let i = 0; i < n; i++) {
      members.push({ a: L(i), b: U(i), role: 'diagonal' });
      members.push({ a: U(i), b: L(i + 1), role: 'diagonal' });
    }
    return { joints, members };
  }
  // Pratt and Howe: top joints U1 … U(n − 1) over the inner bottom joints.
  const U = (i: number) => n + i;
  for (let i = 1; i < n; i++) joints.push({ name: `U${i}`, x: i * d, y: h });
  for (let i = 1; i + 1 < n; i++) members.push({ a: U(i), b: U(i + 1), role: 'top' });
  members.push({ a: L(0), b: U(1), role: 'post' });
  members.push({ a: U(n - 1), b: L(n), role: 'post' });
  for (let i = 1; i < n; i++) members.push({ a: L(i), b: U(i), role: 'vertical' });
  for (let i = 1; i + 1 < n; i++) {
    // The panel from i to i + 1: left of midspan or right of it.
    const left = i + 0.5 < n / 2;
    // Pratt: diagonals fall toward midspan (tension under gravity); Howe: they rise toward it.
    const pratt = type === 'pratt';
    if (left === pratt) members.push({ a: U(i), b: L(i + 1), role: 'diagonal' });
    else members.push({ a: L(i), b: U(i + 1), role: 'diagonal' });
  }
  return { joints, members };
}

/** The truss a spec draws, or undefined while a value it needs is blank (or out of range). */
export function buildTruss(spec: TrussSpec, get: Get, r?: number): TrussModel | undefined {
  if (spec.panels) {
    const p = spec.panels;
    const [n, d, h, P] = [get(p.n), get(p.length), get(p.height), get(p.load)];
    if (n === undefined || d === undefined || h === undefined || P === undefined) return undefined;
    if (!Number.isInteger(n) || n < 2 || n > 12 || !(d > 0) || !(h > 0)) return undefined;
    const { joints, members } = panelTruss(p.type, n, d, h);
    const loads: TrussModel['loads'] = [];
    for (let i = 1; i < n; i++) loads.push({ j: i, fx: 0, fy: -P, P, dir: 'down' });
    return {
      joints,
      members,
      supports: [
        { j: 0, kind: 'pin', reaction: p.reaction },
        { j: n, kind: r === 4 ? 'pin' : 'roller', reaction: p.reaction },
      ],
      loads,
      panel: { type: p.type, n, d, h, P },
    };
  }
  const joints: TrussModel['joints'] = [];
  for (const j of spec.joints ?? []) {
    const [x, y] = [coordOf(j.x, get), coordOf(j.y, get)];
    if (x === undefined || y === undefined) return undefined;
    joints.push({ name: j.name, x, y });
  }
  const index = (name: string) => joints.findIndex((j) => j.name === name);
  const members: TrussModel['members'] = [];
  for (const m of spec.members ?? []) {
    const [a, b] = [index(m.from), index(m.to)];
    if (a < 0 || b < 0 || a === b) return undefined;
    members.push({ a, b, force: m.force, role: 'member' });
  }
  const supports = (spec.supports ?? []).map((s) => ({
    j: index(s.joint),
    kind: s.kind,
    reaction: s.reaction,
  }));
  if (supports.some((s) => s.j < 0)) return undefined;
  const loads: TrussModel['loads'] = [];
  for (const l of spec.loads ?? []) {
    const P = get(l.P);
    const j = index(l.joint);
    if (P === undefined || j < 0) return undefined;
    const [ux, uy] = DIRS[l.dir ?? 'down'];
    loads.push({ j, fx: ux * P, fy: uy * P, P, dir: l.dir ?? 'down' });
  }
  return { joints, members, supports, loads };
}

export const memberLength = (t: TrussModel, k: number) => {
  const { a, b } = t.members[k]!;
  return Math.hypot(t.joints[b]!.x - t.joints[a]!.x, t.joints[b]!.y - t.joints[a]!.y);
};

/** Reactions counted: 2 for a pin, 1 for a roller. */
export const reactionCount = (t: TrussModel) =>
  t.supports.reduce((s, x) => s + (x.kind === 'pin' ? 2 : 1), 0);

/** Solves A x = b by elimination with partial pivoting; undefined when A is singular. */
function solveLinear(A: number[][], b: number[]): number[] | undefined {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]!]);
  const scale = Math.max(1e-12, ...A.flat().map(Math.abs));
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r]![col]!) > Math.abs(M[piv]![col]!)) piv = r;
    if (Math.abs(M[piv]![col]!) < 1e-9 * scale) return undefined;
    [M[col], M[piv]] = [M[piv]!, M[col]!];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r]![col]! / M[col]![col]!;
      if (f === 0) continue;
      for (let k = col; k <= n; k++) M[r]![k]! -= f * M[col]![k]!;
    }
  }
  return M.map((row, i) => row[n]! / row[i]!);
}

export type TrussSolution =
  | {
      ok: true;
      /** Member forces, + tension. */
      forces: number[];
      /** Each support's reaction components (+ right, + up). */
      reactions: { rx: number; ry: number }[];
    }
  | { ok: false; why: 'indeterminate' | 'unstable' };

/** Member forces and reactions by the method of joints, under `loads` (default the model's). */
export function solveTruss(t: TrussModel, loads = t.loads): TrussSolution {
  const m = t.members.length;
  const r = reactionCount(t);
  const nj = t.joints.length;
  if (m + r > 2 * nj) return { ok: false, why: 'indeterminate' };
  if (m + r < 2 * nj) return { ok: false, why: 'unstable' };
  const A = Array.from({ length: 2 * nj }, () => new Array<number>(m + r).fill(0));
  const b = new Array<number>(2 * nj).fill(0);
  t.members.forEach(({ a, b: e }, k) => {
    const L = memberLength(t, k);
    const ux = (t.joints[e]!.x - t.joints[a]!.x) / L;
    const uy = (t.joints[e]!.y - t.joints[a]!.y) / L;
    // A tension member pulls each end toward the other.
    A[2 * a]![k] = ux;
    A[2 * a + 1]![k] = uy;
    A[2 * e]![k] = -ux;
    A[2 * e + 1]![k] = -uy;
  });
  let col = m;
  const cols: { x?: number; y: number }[] = [];
  for (const s of t.supports) {
    if (s.kind === 'pin') {
      A[2 * s.j]![col] = 1;
      A[2 * s.j + 1]![col + 1] = 1;
      cols.push({ x: col, y: col + 1 });
      col += 2;
    } else {
      A[2 * s.j + 1]![col] = 1;
      cols.push({ y: col });
      col += 1;
    }
  }
  for (const l of loads) {
    b[2 * l.j]! -= l.fx;
    b[2 * l.j + 1]! -= l.fy;
  }
  const x = solveLinear(A, b);
  if (!x) return { ok: false, why: 'unstable' };
  const clean = (v: number) => (Math.abs(v) < 1e-9 * Math.max(1, ...b.map(Math.abs)) ? 0 : v);
  return {
    ok: true,
    forces: x.slice(0, m).map(clean),
    reactions: cols.map((c) => ({
      rx: c.x === undefined ? 0 : clean(x[c.x]!),
      ry: clean(x[c.y]!),
    })),
  };
}

export interface TrussCut {
  /** Where the cut crosses the bottom chord. */
  x: number;
  panel: number;
  /** The three members it cuts. */
  top: number;
  bottom: number;
  diagonal: number;
  /** The chord found by moments, and the joint the moments are taken about. */
  chord: number;
  centre: number;
  /** Sagging moment at the centre from the left part, shear in the panel, θ of the diagonal. */
  M: number;
  V: number;
  theta: number;
  /** The left part's joints (the free body). */
  left: number[];
}

/** The section through a panel truss's panel (or the one with its centre at midspan). */
export function cutOf(
  t: TrussModel,
  sol: Extract<TrussSolution, { ok: true }>,
  cut: NonNullable<TrussSpec['cut']>,
): TrussCut | undefined {
  const p = t.panel;
  if (!p) return undefined;
  const warren = p.type === 'warren';
  // 'mid': the panel left of midspan, whose moment centre is at midspan for a Pratt's top chord,
  // a Howe's bottom chord and a Warren's top chord (and a Warren's bottom chord when n is odd).
  const panel =
    cut.panel !== 'mid'
      ? cut.panel
      : warren && cut.chord === 'bottom'
        ? Math.floor((p.n - 1) / 2)
        : Math.ceil(p.n / 2) - 1;
  const x = (panel + (warren ? 0.75 : 0.5)) * p.d;
  const crossing = t.members
    .map((m, k) => ({ k, xa: t.joints[m.a]!.x, xb: t.joints[m.b]!.x, role: m.role }))
    .filter((m) => Math.min(m.xa, m.xb) < x - 1e-9 && Math.max(m.xa, m.xb) > x + 1e-9);
  const top = crossing.find((m) => m.role === 'top');
  const bottom = crossing.find((m) => m.role === 'bottom');
  const diagonal = crossing.find((m) => m.role === 'diagonal');
  if (crossing.length !== 3 || !top || !bottom || !diagonal) return undefined;
  const dm = t.members[diagonal.k]!;
  const [ja, jb] = [t.joints[dm.a]!, t.joints[dm.b]!];
  const lowEnd = ja.y < jb.y ? dm.a : dm.b;
  const highEnd = lowEnd === dm.a ? dm.b : dm.a;
  const centre = cut.chord === 'top' ? lowEnd : highEnd;
  const c = t.joints[centre]!;
  const left = t.joints.map((_, i) => i).filter((i) => t.joints[i]!.x < x);
  let M = 0;
  let V = 0;
  const add = (j: number, fx: number, fy: number) => {
    const J = t.joints[j]!;
    if (J.x >= x) return;
    M += (c.x - J.x) * fy + (J.y - c.y) * fx;
    V += fy;
  };
  t.supports.forEach((s, i) => add(s.j, sol.reactions[i]!.rx, sol.reactions[i]!.ry));
  for (const l of t.loads) add(l.j, l.fx, l.fy);
  const run = Math.abs(jb.x - ja.x);
  return {
    x,
    panel,
    top: top.k,
    bottom: bottom.k,
    diagonal: diagonal.k,
    chord: cut.chord === 'top' ? top.k : bottom.k,
    centre,
    M,
    V,
    theta: (Math.atan2(p.h, run) * 180) / Math.PI,
    left,
  };
}

/**
 * The vertical deflection of joint `j` by the unit-load method: ΣFfL (force × length units)
 * and δ = 1000 ΣFfL ÷ (AE) in mm for kN, m, mm² and GPa.
 */
export function unitLoadDeflection(
  t: TrussModel,
  sol: Extract<TrussSolution, { ok: true }>,
  j: number,
  A: number,
  E: number,
): { sum: number; delta: number; unit: number[] } | undefined {
  const unit = solveTruss(t, [{ j, fx: 0, fy: -1, P: 1, dir: 'down' }]);
  if (!unit.ok || !(A > 0) || !(E > 0)) return undefined;
  const sum = sol.forces.reduce((s, F, k) => s + F * unit.forces[k]! * memberLength(t, k), 0);
  return { sum, delta: (1000 * sum) / (A * E), unit: unit.forces };
}

/** δ along a bar element from its end's displacements: Δu cos θ + Δv sin θ. */
export const elementStretch = (du: number, dv: number, thetaDeg: number) =>
  du * Math.cos((thetaDeg * Math.PI) / 180) + dv * Math.sin((thetaDeg * Math.PI) / 180);

/** A card joint's zero-force members: indices of the members that must carry nothing. */
export function zeroForceMembers(card: {
  members: number[];
  load?: number;
  support?: 'pin' | 'roller';
}): number[] {
  if (card.load !== undefined || card.support) {
    // A load or a reaction along one member of a T can still leave the stem bare, but the cards
    // ask the plain rule: a loaded or supported joint carries force.
    return [];
  }
  const ms = card.members;
  const along = (a: number, b: number) => {
    const d = (((a - b) % 180) + 180) % 180;
    return d < 1 || d > 179;
  };
  if (ms.length === 2 && !along(ms[0]!, ms[1]!)) return [0, 1];
  if (ms.length === 3) {
    for (let i = 0; i < 3; i++) {
      const [p, q] = [0, 1, 2].filter((k) => k !== i);
      if (along(ms[p!]!, ms[q!]!)) return [i];
    }
  }
  return [];
}
