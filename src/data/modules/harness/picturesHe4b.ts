/**
 * Picture checks for the round-4 group B college options (typesHe4b.ts): `vectorDiagram`
 * `project`, `masses`, `forces`, `cone` and `rotor` `rolling`, `rod`, `precession`, `plate`.
 * What each draws must agree with the page's values. Called from the kinds' cases in
 * `pictures.ts`. Test-only.
 */
import type { VariableDef } from '@/engine/types';
import {
  centerOf,
  coneOf,
  forceDirection,
  headingOf,
  partsOf,
  plateOf,
  precessionOf,
  projectOf,
  rodOf,
  rollingOf,
} from '@/components/module/reps/he4bMath';
import type { V3 } from '@/components/module/reps/vectorSpace';

import type { Representation } from '../types';
import { siOf } from './picturesHs2c';

type Val = (id: string) => number | undefined;
type X = number | string | undefined;

const RAD = Math.PI / 180;

/** The round-4 group B checks (formula units through `siOf`). */
export function he4bIssues(
  rep: Representation,
  raw: Val,
  byId: Map<string, VariableDef>,
): string[] {
  const out: string[] = [];
  const val = siOf(raw, byId);
  const read = (x: X, fallback?: number) =>
    x === undefined ? fallback : typeof x === 'number' ? x : val(x);
  /** A named value agrees with what the picture works out (to 1 part in 10⁴). */
  const same = (id: string | undefined, want: number, what: string) => {
    if (!id || !Number.isFinite(want)) return;
    const got = val(id);
    if (got !== undefined && Math.abs(got - want) > 1e-4 * Math.max(1, Math.abs(want)))
      out.push(`${rep.kind}: ${what} is ${got}, the picture gives ${want}`);
  };

  if (rep.kind === 'vectorDiagram') {
    const vec = (i: number): V3 | undefined => {
      const v = rep.vectors[i];
      if (!v) return undefined;
      if (v.x === undefined && v.magnitude !== undefined) {
        const [m, d] = [read(v.magnitude), read(v.direction, 0)];
        if (m === undefined || d === undefined) return undefined;
        return [m * Math.cos(d * RAD), m * Math.sin(d * RAD), 0];
      }
      const [x, y, z] = [read(v.x, 0), read(v.y, 0), read(v.z, 0)];
      return x === undefined || y === undefined || z === undefined ? undefined : [x, y, z];
    };
    // HC96: the perpendicular part's dot with v is 0; the projection equals the page's values.
    const p = rep.project;
    const [u, v] = [vec(0), vec(1)];
    if (p && u && v) {
      const pr = projectOf(u, v);
      if (!pr) out.push('project: v is the zero vector');
      else {
        const perpDot = pr.perp[0] * v[0] + pr.perp[1] * v[1] + pr.perp[2] * v[2];
        if (Math.abs(perpDot) > 1e-6 * Math.max(1, pr.vv))
          out.push(`project: the perpendicular part's dot with v is ${perpDot}, not 0`);
        same(p.dot, pr.dot, 'u·v');
        same(p.k, pr.k, 'u·v ÷ v·v');
        (['x', 'y', 'z'] as const).forEach((a, i) => {
          same(p.proj?.[a], pr.proj[i]!, `the projection's ${a}`);
          same(p.perp?.[a], pr.perp[i]!, `the perpendicular part's ${a}`);
        });
      }
    }
    // HC100: the marked point = Σmx ÷ Σm.
    if (rep.masses) {
      const ms = rep.masses.map((q) => ({ m: read(q.m), x: read(q.x), y: read(q.y, 0) }));
      if (ms.some((q) => q.m !== undefined && q.m <= 0)) out.push('masses: a mass is not positive');
      if (ms.every((q) => q.m !== undefined && q.x !== undefined && q.y !== undefined)) {
        const cm = centerOf(ms as { m: number; x: number; y: number }[]);
        if (cm) {
          same(rep.centerOfMass?.x, cm.x, 'x_cm = Σmx ÷ Σm');
          same(rep.centerOfMass?.y, cm.y, 'y_cm = Σmy ÷ Σm');
          same(rep.centerOfMass?.total, cm.M, 'M = Σm');
          const xs = ms.map((q) => q.x!);
          if (cm.x < Math.min(...xs) - 1e-9 || cm.x > Math.max(...xs) + 1e-9)
            out.push('masses: the balance point is outside the masses');
        }
      }
    }
    // HC171: the polygon closes when the page says equilibrium; the resultant is the sum.
    const fs = rep.forces;
    if (fs) {
      if (fs.list.length < 2 || fs.list.length > 4)
        out.push(`forces: ${fs.list.length} forces (2 to 4 are drawn)`);
      const parts = fs.list.map((f) => {
        const [m, d, l] = [read(f.magnitude), read(f.direction), read(f.level, 0)];
        if (m === undefined || l === undefined || (f.direction !== undefined && d === undefined))
          return undefined;
        if (m < 0) out.push(`forces: ${f.name} has a negative size ${m}`);
        return partsOf(m, forceDirection(f, d, l));
      });
      if (parts.every((q) => q)) {
        const sx = parts.reduce((s, q) => s + q!.x, 0);
        const sy = parts.reduce((s, q) => s + q!.y, 0);
        const big = Math.max(1, ...parts.map((q) => Math.hypot(q!.x, q!.y)));
        if (fs.equilibrium && Math.hypot(sx, sy) > 1e-4 * big)
          out.push(`forces: the polygon does not close (ΣF = ${sx}, ${sy})`);
        const r = rep.vectors[0];
        if (!fs.equilibrium && r) {
          same(typeof r.x === 'string' ? r.x : undefined, sx, 'Rₓ = ΣF cos α');
          same(typeof r.y === 'string' ? r.y : undefined, sy, 'R_y = ΣF sin α');
          same(
            typeof r.magnitude === 'string' ? r.magnitude : undefined,
            Math.hypot(sx, sy),
            '|R|',
          );
          if (Math.hypot(sx, sy) > 1e-9)
            same(
              typeof r.direction === 'string' ? r.direction : undefined,
              headingOf(sx, sy),
              'R’s direction',
            );
        }
      }
    }
    // HC108: cos θ = m ÷ √(ℓ(ℓ + 1)); |m| ≤ ℓ.
    const k = rep.cone;
    if (k) {
      const [l, m] = [read(k.l), read(k.m)];
      if (l !== undefined && m !== undefined) {
        if (!Number.isInteger(l) || l < 0) out.push(`cone: ℓ = ${l} is not a whole number ≥ 0`);
        if (!Number.isInteger(m) || Math.abs(m) > l) out.push(`cone: m = ${m} is not −ℓ to ℓ`);
        const q = coneOf(l, m);
        same(k.size, q.size, '|L| = √(ℓ(ℓ + 1))');
        same(k.lz, m, 'L_z = m');
        if (q.size > 0) {
          same(k.angle, q.theta, 'θ');
          if (Math.abs(Math.cos(q.theta * RAD) - m / q.size) > 1e-9)
            out.push('cone: cos θ is not m ÷ |L|');
        }
        same(k.states, q.states, '2ℓ + 1');
      }
    }
  }

  if (rep.kind === 'rotor') {
    const c = read(rep.shape);
    const [m, r] = [read(rep.mass), read(rep.radius)];
    // HC102 rolling: K_t + K_r = mgh; v = rω.
    const q = rep.rolling;
    if (q && c !== undefined && m !== undefined && r !== undefined) {
      const [h, g] = [read(q.height), read(q.g, 9.8)];
      if (h !== undefined && g !== undefined) {
        const s = rollingOf(c, m, r, h, g);
        if (Math.abs(s.kt + s.kr - s.total) > 1e-6 * Math.max(1, s.total))
          out.push('rolling: K_t + K_r is not mgh');
        same(q.speed, s.v, 'v = √(2gh ÷ (1 + c))');
        same(q.spin, s.w, 'ω = v/r');
        same(q.kt, s.kt, 'K_t = ½mv²');
        same(q.kr, s.kr, 'K_r = cK_t');
        const [v, w] = [read(q.speed), read(q.spin)];
        if (v !== undefined && w !== undefined && Math.abs(v - r * w) > 1e-4 * Math.max(1, v))
          out.push('rolling: v is not rω');
      }
    }
    // HC102 rod: I = I_cm + Md².
    const d = rep.rod;
    if (d && m !== undefined) {
      const L = read(d.length);
      const dd = read(d.d, d.axis === 'end' && L !== undefined ? L / 2 : 0);
      if (L !== undefined && dd !== undefined) {
        const s = rodOf(m, L, dd);
        same(d.icm, s.icm, 'I_cm = ML²/12');
        same(d.inertia, s.I, 'I = I_cm + Md²');
      }
    }
    // HC106: Ω = mgr ÷ (Iω).
    const p = rep.precession;
    if (p && m !== undefined) {
      const [rr, w, g] = [read(p.r), read(p.omega), read(p.g, 9.8)];
      // I = cmr² (a disk, c = ½, unless the page names the shape), or the page's I.
      const I =
        r !== undefined
          ? (c ?? 0.5) * m * r * r
          : typeof rep.inertia === 'string'
            ? val(rep.inertia)
            : undefined;
      if (rr !== undefined && w !== undefined && g !== undefined && I !== undefined) {
        const s = precessionOf(m, r ?? 0, w, rr, g, I);
        same(p.L, s.L, 'L = Iω');
        same(p.torque, s.tau, 'τ = mgr');
        same(p.rate, (m * g * rr) / (s.I * w), 'Ω = mgr ÷ (Iω)');
        same(p.period, s.period, 'T_p = 2π/Ω');
      }
    }
    // HC107: I₃ = I₁ + I₂.
    const t = rep.plate;
    if (t && m !== undefined) {
      const [a, b] = [read(t.a), read(t.b)];
      if (a !== undefined && b !== undefined) {
        const s = plateOf(m, a, b);
        same(t.i1, s.i1, 'I₁ = Mb²/12');
        same(t.i2, s.i2, 'I₂ = Ma²/12');
        same(t.i3, s.i3, 'I₃');
        const [i1, i2, i3] = [read(t.i1), read(t.i2), read(t.i3)];
        if (i1 !== undefined && i2 !== undefined && i3 !== undefined)
          if (Math.abs(i3 - i1 - i2) > 1e-4 * Math.max(1e-9, i3))
            out.push('plate: I₃ is not I₁ + I₂');
      }
    }
  }
  return out;
}
