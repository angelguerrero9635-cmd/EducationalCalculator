/**
 * Checks for the college round 2 group E options (HC19 `induction` field sources and rails,
 * HC29 `charges` Gauss surfaces and distributions): every value a page names is the one the
 * picture works out from the same physics (he2eMath.ts), in SI. Test-only.
 */
import {
  electricOf,
  gaussOf,
  fluxOf,
  imageOf,
  diskOf,
  loopAxial,
  loopsField,
  loopTorque,
  MU0,
  platesOf,
  railsOf,
  ringOf,
  solenoidOf,
  solenoidStarts,
  toroidField,
  wireField,
  wireForce,
} from '@/components/module/reps/he2eMath';

import {
  isHe2eInduction,
  type ChargesDistribution,
  type ChargesGauss,
  type InductionField,
  type InductionRails,
} from '../typesHe2e';

type Val = (id: string) => number | undefined;
type X = number | string | undefined;

const read = (val: Val, x: X, fallback?: number) =>
  x === undefined ? fallback : typeof x === 'number' ? x : val(x);

/**
 * Equal to 1 part in 10⁵ of the larger, or of `scale` (the size the value would have at its
 * largest: a torque's μB when sin θ is nearly 0), since the values run from 10⁻¹² to 10⁵.
 */
const near = (a: number, b: number, scale = 0) =>
  Math.abs(a - b) <= 1e-5 * Math.max(Math.abs(a), Math.abs(b), Math.abs(scale)) + 1e-300;

function checker(kind: string, val: Val, out: string[]) {
  return (id: string | undefined, want: number, what: string, scale = 0) => {
    const x = id ? val(id) : undefined;
    if (x !== undefined && Number.isFinite(want) && !near(x, want, scale))
      out.push(`${kind}: ${what} ${id} = ${x}, the picture draws ${want}`);
  };
}

/** Whether a spec is one of group E's options (the shared harness case sends it here). */
export const isHe2e = (rep: { kind: string }) =>
  (rep.kind === 'induction' && isHe2eInduction(rep)) ||
  (rep.kind === 'charges' && ('gauss' in rep || 'distribution' in rep));

export function he2eIssues(rep: { kind: string }, val: Val): string[] {
  if (rep.kind === 'induction')
    return inductionIssues(rep as unknown as InductionField | InductionRails, val);
  return chargesIssues(rep as unknown as ChargesGauss | ChargesDistribution, val);
}

function inductionIssues(rep: InductionField | InductionRails, val: Val): string[] {
  const out: string[] = [];
  const same = checker('induction', val, out);
  if ('rails' in rep) {
    const x = rep.rails;
    const [B, L, v, R] = [read(val, x.B), read(val, x.L), read(val, x.v), read(val, x.R)];
    if (B === undefined || L === undefined || v === undefined) return out;
    if (!(L > 0)) out.push(`induction: rod length ${L} is not positive`);
    const q = railsOf(B, L, v, R);
    same(x.emf, Math.abs(q.emf), 'ε = BLv');
    if (R !== undefined) {
      if (!(R > 0)) out.push(`induction: resistance ${R} is not positive`);
      same(x.I, Math.abs(q.I), 'I = ε/R');
      same(x.F, q.F, 'F = BIL');
      same(x.P, q.P, 'P = Fv');
      // The drawn force points against v (Lenz), and its power is the heating I²R.
      if (v !== 0 && q.F > 0 && q.forceSign !== -Math.sign(v))
        out.push('induction: the rod’s force is not drawn against v');
      if (Number.isFinite(q.I) && !near(q.P, q.I * q.I * R)) out.push('induction: Fv ≠ I²R');
    }
    return out;
  }
  const mu0 = rep.mu0 ?? MU0;
  const I = read(val, rep.current);
  if (I === undefined) return out;
  switch (rep.source) {
    case 'wire': {
      const [r, a] = [read(val, rep.r), read(val, rep.radius, 0)];
      if (r === undefined || a === undefined) break;
      if (!(r > 0)) out.push(`induction: distance ${r} is not positive`);
      // A page's rule for one side of the surface: B from that side's formula.
      const want =
        rep.region === 'inside'
          ? (mu0 * I * r) / (2 * Math.PI * a * a)
          : rep.region === 'outside'
            ? wireField(mu0, I, r)
            : wireField(mu0, I, r, a);
      same(rep.field, want, 'B at r');
      same(rep.H, I / (2 * Math.PI * r), 'H = I/(2πr)');
      const I2 = read(val, rep.second);
      if (I2 !== undefined) same(rep.force, wireForce(mu0, I, I2, r), 'F/L');
      break;
    }
    case 'loop': {
      const [R, N] = [read(val, rep.radius), read(val, rep.turns, 1)];
      if (R === undefined || N === undefined) break;
      if (R < 0) out.push(`induction: loop radius ${R} is negative`);
      if (N < 1) out.push(`induction: ${N} turns`);
      const u = rep.uniform;
      if (u) {
        const [B, th, A] = [read(val, u.field), read(val, u.angle), read(val, u.area)];
        if (A === undefined) break;
        const t = loopTorque(N, I, A, B ?? 0, th ?? 0);
        same(u.moment, t.mu, 'μ = NIA');
        if (B === undefined || th === undefined) break;
        same(u.torque, t.torque, 'τ = μB sin θ', t.mu * B);
        same(u.energy, t.energy, 'U = −μB cos θ', t.mu * B);
        break;
      }
      same(rep.center, loopAxial(mu0, N, I, R, 0), 'B₀ at the center');
      const z = read(val, rep.z);
      if (z !== undefined) same(rep.field, loopAxial(mu0, N, I, R, z), 'B on the axis at z');
      break;
    }
    case 'solenoid': {
      const [N, len, A] = [read(val, rep.turns), read(val, rep.length), read(val, rep.area)];
      if (N === undefined || len === undefined) break;
      if (!(len > 0)) out.push(`induction: solenoid length ${len} is not positive`);
      const s = solenoidOf(mu0, N, len, I, A);
      same(rep.perLength, s.n, 'n = N/ℓ');
      same(rep.field, s.B, 'B = μ₀nI');
      if (A !== undefined) {
        same(rep.inductance, s.L, 'L = μ₀N²A/ℓ');
        same(rep.energy, s.U, 'U = ½LI²');
      }
      // The lines start evenly spaced across the middle, and there the field is even (a long
      // solenoid, summed from loops 0.2 radius apart).
      const starts = solenoidStarts(1, 3);
      const gaps = starts.slice(1).map((x, i) => x - starts[i]!);
      if (gaps.some((g) => !near(g, gaps[0]!))) out.push('induction: solenoid lines not even');
      const a = A !== undefined && A > 0 ? Math.sqrt(A / Math.PI) : 0;
      if (a > 0 && len / a >= 8 && len / a <= 80) {
        const k = Math.ceil(len / a / 0.2);
        const zs = Array.from({ length: k }, (_, i) => (-len / 2 + (len * (i + 0.5)) / k) / a);
        const [b0, b1] = [loopsField(1, zs, 0, 0, 24)[1], loopsField(1, zs, 0.7, 0, 24)[1]];
        if (Math.abs(b1 - b0) > 0.05 * Math.abs(b0))
          out.push('induction: B inside the solenoid is not even across it');
      }
      break;
    }
    case 'toroid': {
      const [N, r] = [read(val, rep.turns), read(val, rep.r)];
      if (N === undefined || r === undefined) break;
      if (!(r > 0)) out.push(`induction: toroid radius ${r} is not positive`);
      same(rep.field, toroidField(mu0, N, I, r), 'B = μ₀NI/(2πr)');
      break;
    }
    case 'plates': {
      const [R, r] = [read(val, rep.radius), read(val, rep.r)];
      if (R === undefined || r === undefined) break;
      if (!(R > 0) || !(r > 0)) out.push('induction: plate radius and r must be positive');
      // The pages' rule I(r/R)² holds between the plates (r ≤ R); past the rim the picture
      // draws faded with the reason and keeps the page's rule.
      const p = platesOf(mu0, rep.eps0 ?? 8.85e-12, I, R, r, true);
      same(rep.rate, p.rate, 'dE/dt = I/(ε₀πR²)');
      same(rep.displacement, p.Id, 'I_d = I(r/R)²', I);
      same(rep.field, p.B, 'B = μ₀I_d/(2πr)', r > 0 ? (mu0 * I) / (2 * Math.PI * r) : 0);
      break;
    }
  }
  return out;
}

function chargesIssues(rep: ChargesGauss | ChargesDistribution, val: Val): string[] {
  const out: string[] = [];
  const same = checker('charges', val, out);
  const o = electricOf(rep);
  if ('gauss' in rep) {
    const g = rep.gauss;
    const [Q, r, R] = [read(val, g.Q), read(val, g.r), read(val, g.R)];
    if (Q === undefined) return out;
    if (g.shape === 'plane') {
      const p = gaussOf('plane', o, Q, 1);
      same(g.E, p.E, 'E = σ/(2ε₀)');
      same(g.between, Q / o.eps0, 'E between = σ/ε₀');
      // Gauss on the drawn pillbox: E × (both faces) = Q_enc/ε₀.
      if (!near(p.E * p.area, fluxOf(p.enc, o.eps0))) out.push('charges: pillbox flux ≠ Q_enc/ε₀');
      return out;
    }
    if (r === undefined || (g.R !== undefined && R === undefined)) return out;
    if (!(r > 0)) out.push(`charges: r = ${r} is not positive`);
    if (R !== undefined && !(R > 0)) out.push(`charges: R = ${R} is not positive`);
    // A page's rule for one side of R (the picture fades the other side and keeps the rule).
    const p = gaussOf(g.shape, o, Q, r, g.region === 'outside' ? undefined : R);
    const enc = g.region === 'inside' && R ? Q * (r / R) ** (g.shape === 'sphere' ? 3 : 2) : p.enc;
    const E =
      g.region === 'inside' && R
        ? g.shape === 'sphere'
          ? (o.k * Q * r) / R ** 3
          : (2 * o.k * Q * r) / (R * R)
        : p.E;
    same(g.E, E, g.shape === 'sphere' ? 'E = kQ_enc/r²' : 'E = 2kλ/r');
    same(g.enclosed, enc, 'Q_enc');
    same(g.flux, fluxOf(enc, o.eps0), 'Φ = Q_enc/ε₀');
    // Gauss on the drawn surface: E × area = Q_enc/ε₀ (the line's cylinder 1 m long).
    const area = g.shape === 'sphere' ? 4 * Math.PI * r * r : 2 * Math.PI * r;
    if (r > 0 && !near(E * area, fluxOf(enc, o.eps0), Math.abs(Q) / o.eps0))
      out.push('charges: E × area ≠ Q_enc/ε₀ on the drawn surface');
    return out;
  }
  const [q, z, R] = [read(val, rep.charge), read(val, rep.z), read(val, rep.radius)];
  if (q === undefined || z === undefined) return out;
  switch (rep.distribution) {
    case 'ring': {
      if (R === undefined) break;
      const v = ringOf(o.k, q, R, z);
      same(rep.potential, v.V, 'V = kQ/√(z² + R²)');
      same(rep.field, v.E, 'E_z = kQz/(z² + R²)^(3/2)', R > 0 ? (o.k * Math.abs(q)) / (R * R) : 0);
      break;
    }
    case 'disk': {
      if (R === undefined) break;
      const v = diskOf(o.k, q, R, z);
      same(rep.sheet, v.sheet, 'the sheet limit 2πkσ');
      same(rep.field, v.E, 'E_z = 2πkσ(1 − z/√(z² + R²))', v.sheet);
      break;
    }
    case 'image': {
      if (!(z > 0)) out.push(`charges: the charge's height ${z} is not above the plane`);
      const v = imageOf(o.k, q, z);
      // The image is −q at −d: its field and q's meet the plane square (no sideways part).
      if (v.image !== -q || v.at !== -z) out.push('charges: the image is not −q at −d');
      const ex = (x: number) =>
        q * x * (1 / Math.hypot(x, z) ** 3) + v.image * x * (1 / Math.hypot(x, z) ** 3);
      if ([0.5, 1, 2].some((k) => Math.abs(ex(k * z)) > 1e-9 * Math.abs(q / (z * z))))
        out.push('charges: the field meets the plane at a slant');
      same(rep.force, v.F, 'F = kq²/(2d)²');
      same(rep.density, v.sigma0, 'σ₀ = −q/(2πd²)');
      same(rep.induced, v.total, 'induced charge −q');
      break;
    }
  }
  return out;
}
