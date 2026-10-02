/**
 * Picture checks for college pictures, round 2, group I (`typesHe2i.ts`): what each draws must
 * agree with the values. Called from `repIssues` in `pictures.ts` with a reader of formula units
 * (`siOf`), and from `layoutFigureIssues` for the card figure. Test-only.
 */
import {
  buildTruss,
  cutOf,
  elementStretch,
  memberLength,
  reactionCount,
  solveTruss,
  unitLoadDeflection,
} from '@/components/module/reps/trussMath';

import type { LayoutDef } from '../layouts';
import type { NumOrVar } from '../typesGraphs';
import type { TrussJointCard, TrussSpec } from '../typesHe2i';

type Val = (id: string) => number | undefined;

const near = (a: number, b: number, rel = 2e-3, abs = 1e-6) =>
  Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;

const reader = (val: Val) => (x: NumOrVar | undefined) =>
  x === undefined ? undefined : typeof x === 'number' ? x : val(x);

/** HC27 `truss`. */
export function trussIssues(rep: TrussSpec, val: Val): string[] {
  const out: string[] = [];
  const get = reader(val);
  /** A page value (when known) must match what the picture draws; `abs` compares sizes. */
  const same = (x: NumOrVar | undefined, want: number, what: string, abs = false) => {
    const v = get(x);
    if (v === undefined || !Number.isFinite(want)) return;
    if (!near(abs ? Math.abs(v) : v, abs ? Math.abs(want) : want))
      out.push(`truss: ${what} is ${v}, the picture draws ${want}`);
  };

  if (rep.mode === 'element') {
    const e = rep.element;
    if (!e) return ['truss: element mode without an element'];
    const [th, du, dv, L, A, E] = [e.theta, e.du, e.dv, e.L, e.A, e.E].map(get);
    if (th === undefined || du === undefined || dv === undefined) return out;
    const delta = elementStretch(du, dv, th);
    same(e.delta, delta, 'δ = Δu cos θ + Δv sin θ');
    if (L !== undefined && A !== undefined && E !== undefined && L > 0) {
      const f = (A * E * delta) / (1000 * L);
      same(e.f, f, 'f = (AE ÷ L)δ');
      if (A > 0) same(e.sigma, (1000 * f) / A, 'σ = f ÷ A');
    }
    return out;
  }

  const r = rep.counts?.r === undefined ? undefined : get(rep.counts.r);
  if (r !== undefined && r !== 3 && r !== 4 && rep.panels)
    out.push(`truss: r = ${r}, but a panel truss draws a pin and a roller (3) or two pins (4)`);
  const t = buildTruss(rep, get, r);
  if (!t) return out;
  const m = t.members.length;
  const j = t.joints.length;
  const rr = reactionCount(t);
  // m + r − 2j shown equals the drawing's own counts.
  if (rep.counts) {
    same(rep.counts.m, m, 'm (members drawn)');
    same(rep.counts.j, j, 'j (joints drawn)');
    same(rep.counts.r, rr, 'r (reactions drawn)');
    same(rep.counts.degree, m + rr - 2 * j, 'm + r − 2j');
  }
  if (rep.panels) {
    const p = t.panel!;
    same(rep.panels.reaction, ((p.n - 1) * p.P) / 2, 'R = (n − 1)P ÷ 2');
  }
  const sol = solveTruss(t);
  if (!sol.ok) {
    if (!rep.counts) out.push(`truss: the drawn truss is ${sol.why}, so its forces can't be drawn`);
    return out;
  }
  // Every joint balances with the drawn forces, reactions and loads.
  const scale = Math.max(1, ...t.loads.map((l) => Math.abs(l.P)));
  const sum = t.joints.map(() => [0, 0]);
  t.members.forEach(({ a, b }, k) => {
    const L = memberLength(t, k);
    const [ux, uy] = [(t.joints[b]!.x - t.joints[a]!.x) / L, (t.joints[b]!.y - t.joints[a]!.y) / L];
    const F = sol.forces[k]!;
    sum[a]![0]! += F * ux;
    sum[a]![1]! += F * uy;
    sum[b]![0]! -= F * ux;
    sum[b]![1]! -= F * uy;
  });
  t.supports.forEach((s, i) => {
    sum[s.j]![0]! += sol.reactions[i]!.rx;
    sum[s.j]![1]! += sol.reactions[i]!.ry;
  });
  for (const l of t.loads) {
    sum[l.j]![0]! += l.fx;
    sum[l.j]![1]! += l.fy;
  }
  sum.forEach(([fx, fy], i) => {
    if (Math.abs(fx!) > 1e-6 * scale || Math.abs(fy!) > 1e-6 * scale)
      out.push(`truss: joint ${t.joints[i]!.name} does not balance (${fx}, ${fy})`);
  });
  // Zero-force members are exactly 0 (drawn dashed with 0), the rest carry a T or C letter.
  sol.forces.forEach((F, k) => {
    if (F !== 0 && Math.abs(F) < 1e-6 * scale)
      out.push(`truss: member ${k} carries ${F}, drawn with a letter instead of 0`);
  });
  // A page's member force: its size, and its sign when the page writes one (+ T, − C).
  t.members.forEach((mm, k) => {
    const v = get(mm.force);
    if (v === undefined) return;
    const F = sol.forces[k]!;
    if (!near(Math.abs(v), Math.abs(F)))
      out.push(`truss: member ${k}'s force is ${v}, the picture draws ${F}`);
    else if (v !== 0 && Math.sign(v) !== Math.sign(F) && v < 0)
      out.push(`truss: member ${k} is ${v} (C) but drawn in tension`);
  });
  t.supports.forEach((s, i) => same(s.reaction, sol.reactions[i]!.ry, 'a reaction'));
  if (rep.cut) {
    const cut = cutOf(t, sol, rep.cut);
    if (!cut) {
      out.push(`truss: the cut through panel ${String(rep.cut.panel)} does not cut three members`);
      return out;
    }
    const h = t.panel!.h;
    const F = Math.abs(sol.forces[cut.chord]!);
    // The cut chord's force × the height is the moment at the cut joint.
    if (!near(F * h, Math.abs(cut.M)))
      out.push(`truss: chord F × h = ${F * h}, the moment at the cut joint is ${cut.M}`);
    same(rep.cut.M, cut.M, 'M at the cut', true);
    same(rep.cut.F, F, 'the cut chord force', true);
    same(rep.cut.V, cut.V, 'V in the cut panel', true);
    same(rep.cut.Fd, sol.forces[cut.diagonal]!, 'the cut diagonal force', true);
    same(rep.cut.theta, cut.theta, 'θ of the cut diagonal');
    same(rep.cut.x, t.joints[cut.centre]!.x - t.joints[0]!.x, 'x of the moment centre');
    const fd = Math.abs(sol.forces[cut.diagonal]!);
    if (!near(fd * Math.sin((cut.theta * Math.PI) / 180), Math.abs(cut.V)))
      out.push(
        `truss: F_d sin θ = ${fd * Math.sin((cut.theta * Math.PI) / 180)} is not V = ${cut.V}`,
      );
  }
  if (rep.deflect) {
    const ji = t.joints.findIndex((J) => J.name === rep.deflect!.joint);
    const [A, E] = [get(rep.deflect.A), get(rep.deflect.E)];
    if (ji < 0) out.push(`truss: no joint ${rep.deflect.joint} to deflect`);
    else if (A !== undefined && E !== undefined) {
      const d = unitLoadDeflection(t, sol, ji, A, E);
      if (d) same(rep.deflect.delta, d.delta, 'δ = ΣFfL ÷ (AE)');
    }
  }
  if (rep.angle?.value !== undefined) {
    const at = (name: string) => t.joints.find((J) => J.name === name);
    const [J, A, B] = [at(rep.angle.joint), at(rep.angle.from), at(rep.angle.to)];
    if (J && A && B) {
      const a1 = Math.atan2(A.y - J.y, A.x - J.x);
      const a2 = Math.atan2(B.y - J.y, B.x - J.x);
      let d = (Math.abs(a2 - a1) * 180) / Math.PI;
      if (d > 180) d = 360 - d;
      same(rep.angle.value, d, 'the marked angle');
    }
  }
  return out;
}

/** The `trussJoint` card figures of a sort or sequence: clear members, a load and a pin apart. */
export function trussJointCardIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  const figures =
    l.kind === 'sort'
      ? l.cards.map((c) => [c.label, c.figure] as const)
      : l.kind === 'sequence'
        ? l.stages.map((s) => [s.label, s.figure] as const)
        : [];
  const gap = (a: number, b: number) => {
    const d = (((a - b) % 360) + 360) % 360;
    return Math.min(d, 360 - d);
  };
  for (const [label, f] of figures) {
    if (f?.kind !== 'trussJoint') continue;
    const card = f as TrussJointCard;
    const ms = card.members;
    if (ms.length < 1 || ms.length > 5) out.push(`card "${label}": ${ms.length} members`);
    ms.forEach((a, i) =>
      ms.slice(i + 1).forEach((b) => {
        if (gap(a, b) < 25) out.push(`card "${label}": members at ${a}° and ${b}° overlap`);
      }),
    );
    // The load's arrow comes in from the side opposite its direction.
    if (card.load !== undefined && ms.some((a) => gap(a, card.load! + 180) < 20))
      out.push(`card "${label}": the load's arrow lies on a member`);
    if (card.support && ms.some((a) => gap(a, 270) < 50))
      out.push(`card "${label}": a member runs into the support`);
  }
  return out;
}
