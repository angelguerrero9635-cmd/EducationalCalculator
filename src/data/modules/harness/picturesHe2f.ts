/**
 * Picture checks for the college pictures of round 2, group F (typesHe2f.ts). Each value the
 * page labels must be the one the drawing makes, to 0.1%, from the shared arithmetic in
 * reps/he2fMath.ts. `val` reads formula units. Test-only.
 */
import {
  bankOf,
  capstan,
  climbOf,
  ellipseOf,
  hohmannOf,
  ladderOf,
  pulleyOf,
  synodicOf,
  tipOf,
  turnOf,
  visViva,
} from '@/components/module/reps/he2fMath';

import type { NumOrVar } from '../typesGraphs';
import type { He2fSpec } from '../typesHe2f';

type Val = (id: string) => number | undefined;

const near = (a: number, b: number, tol = 1e-3) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function he2fIssues(rep: He2fSpec, val: Val): string[] {
  const out: string[] = [];
  const read = (x: NumOrVar | undefined, d?: number) =>
    x === undefined ? d : typeof x === 'number' ? x : val(x);
  const same = (id: string | undefined, want: number, what: string) => {
    const x = id ? val(id) : undefined;
    if (x !== undefined && Number.isFinite(want) && !near(x, want))
      out.push(`${rep.kind}: ${what} ${id} = ${x}, the picture draws ${want}`);
  };
  if (rep.kind === 'circularMotion') {
    const own = orbitIssues(rep, read, same);
    return [...out, ...own];
  }
  const g = read(rep.kind === 'freeBody' ? rep.g : undefined, 9.8);
  if (g === undefined) return out;
  if (!(g > 0)) out.push(`${rep.kind}: g = ${g} is not positive`);

  // HC20: each block's net force is its mass × a; T₂ − T₁ = ½Ma.
  if ('pulley' in rep) {
    const p = rep.pulley;
    const [m1, m2, mu, M] = [read(p.m1), read(p.m2), read(p.mu, 0), read(p.pulleyMass, 0)];
    if (m1 === undefined || m2 === undefined || mu === undefined || M === undefined) return out;
    if (m1 <= 0 || m2 <= 0 || mu < 0 || M < 0)
      return [...out, 'freeBody: a pulley block with no mass, or a negative μ or M'];
    const r = pulleyOf({ layout: p.layout, m1, m2, mu, M, g });
    // Held by friction the picture draws a = 0 and T = W₂; the page's formula gives a ≤ 0.
    if (r.holds) return out;
    same(p.a, r.a, 'acceleration');
    same(p.T, r.T1, 'tension on m₁');
    same(p.T2, r.T2, 'tension on m₂');
    if (!M && p.T2) out.push('freeBody: T₂ without a pulley mass (the tensions are equal)');
    const net1 = p.layout === 'table' ? r.T1 - r.f : r.T1 - r.W1;
    if (!near(net1, m1 * r.a)) out.push(`freeBody: block 1's net ${net1} is not m₁a`);
    if (!near(r.W2 - r.T2, m2 * r.a)) out.push(`freeBody: block 2's net is not m₂a`);
    if (!near(r.T2 - r.T1, (M / 2) * r.a)) out.push('freeBody: T₂ − T₁ is not ½Ma');
  }

  // HC20: forces and torques about the foot sum to 0.
  if ('ladder' in rep) {
    const l = rep.ladder;
    const [W, deg] = [read(l.weight), read(l.angle)];
    if (W === undefined || deg === undefined) return out;
    if (W < 0 || deg <= 0 || deg >= 90)
      return [...out, `freeBody: ladder weight ${W} or angle ${deg}° out of range`];
    const r = ladderOf(W, deg);
    same(l.wall, r.Nw, 'wall force');
    same(l.floor, r.Nf, 'floor force');
    same(l.friction, r.f, 'friction');
    same(l.mu, r.mu, 'least μₛ');
    const t = (deg * Math.PI) / 180;
    // Torques about the foot (L = 1): N_w sin θ against W ½cos θ; level: f = N_w.
    if (!near(r.Nw * Math.sin(t), (W * Math.cos(t)) / 2, 1e-9))
      out.push('freeBody: ladder torques about the foot do not cancel');
    if (!near(r.f, r.Nw, 1e-9) || !near(r.Nf, W, 1e-9))
      out.push('freeBody: ladder forces do not cancel');
  }

  // HC20: P_tip = Wb ÷ (2h), P_slip = μW; the smaller one governs.
  if ('tip' in rep) {
    const t = rep.tip;
    const [W, b, h, mu] = [read(t.weight), read(t.width), read(t.height), read(t.mu)];
    if ([W, b, h, mu].some((x) => x === undefined)) return out;
    if (!(W! > 0 && b! > 0 && h! > 0 && mu! >= 0))
      return [...out, 'freeBody: a crate with no weight, size or push height'];
    const r = tipOf(W!, b!, h!, mu!);
    same(t.tip, r.tip, 'P_tip');
    same(t.slip, r.slip, 'P_slip');
    if (r.P !== Math.min(r.tip, r.slip)) out.push('freeBody: the drawn push is not the smaller');
    const H = read(t.crateHeight);
    if (H !== undefined && H < h!) out.push(`freeBody: push height ${h} is above the crate`);
  }

  // HC20: T₂ = T₁e^(μβ).
  if ('drum' in rep) {
    const d = rep.drum;
    const [t1, t2, mu, wrap] = [read(d.t1), read(d.t2), read(d.mu), read(d.wrap)];
    if ([t1, t2, mu, wrap].some((x) => x === undefined)) return out;
    if (t1! < 0 || mu! < 0 || wrap! < 0) return [...out, 'freeBody: a negative tension, μ or β'];
    const beta = d.radians ? wrap! : (wrap! * Math.PI) / 180;
    if (!near(t2!, capstan(t1!, mu!, beta)))
      out.push(`freeBody: T₂ = ${t2} is not T₁e^(μβ) = ${capstan(t1!, mu!, beta)}`);
  }

  // HC20: N sin θ = mv²/r and N cos θ = mg (with μ: the top-speed balance).
  if ('banked' in rep) {
    const b = rep.banked;
    const [deg, mu] = [read(b.angle), read(b.mu, 0)];
    if (deg === undefined || mu === undefined) return out;
    if (deg < 0 || deg >= 90) return [...out, `freeBody: bank angle ${deg}° out of range`];
    const k = bankOf(deg, mu);
    if (!Number.isFinite(k.N)) return out;
    const m = read(b.mass, 1);
    const r = read(b.radius);
    const v = read(b.speed);
    if (m === undefined) return out;
    const mg = m * g;
    if (b.mass !== undefined) same(b.normal, k.N * mg, 'normal force');
    const t = (deg * Math.PI) / 180;
    const N = k.N * mg;
    if (!near(N * Math.cos(t) - k.friction * mg * Math.sin(t), mg, 1e-9))
      out.push('freeBody: the bank’s vertical forces do not cancel');
    if (r !== undefined && v !== undefined && r > 0) {
      if (!near((m * v * v) / r, k.inward * mg))
        out.push(`freeBody: mv²/r = ${(m * v * v) / r} is not the inward force ${k.inward * mg}`);
      if (b.mass !== undefined) same(b.net, (m * v * v) / r, 'net force mv²/r');
    }
  }
  // HC25: L = W in level flight (W cos γ in a climb, T − D = W sin γ); L cos φ = W in a
  // level turn; the CG ahead of the neutral point exactly when SM > 0.
  if ('aircraft' in rep) {
    const a = rep.aircraft;
    if (a.view === 'side') {
      const [W, L, T, D] = [read(a.weight), read(a.lift), read(a.thrust), read(a.drag)];
      const gam = read(a.gamma, 0);
      if (gam === undefined) return out;
      if (gam < -90 || gam > 90) out.push(`freeBody: climb angle ${gam}° out of range`);
      if (W !== undefined) {
        const c = climbOf(W, gam);
        if (L !== undefined && !near(L, c.L))
          out.push(`freeBody: lift ${L} is not W cos γ = ${c.L} (L = W in level flight)`);
        if (T !== undefined && D !== undefined && !near(T - D, c.along))
          out.push(`freeBody: T − D = ${T - D} is not W sin γ = ${c.along}`);
      }
    }
    if (a.view === 'front') {
      const phi = read(a.phi);
      const V = read(a.speed);
      if (phi === undefined) return out;
      if (phi < 0 || phi >= 90) return [...out, `freeBody: bank ${phi}° out of range`];
      const t = turnOf(phi, V ?? 0, g);
      same(a.factor, t.n, 'load factor 1 ÷ cos φ');
      const [W, L] = [read(a.weight), read(a.lift)];
      if (W !== undefined && L !== undefined && !near(L * Math.cos((phi * Math.PI) / 180), W))
        out.push('freeBody: L cos φ is not W');
      if (V !== undefined && phi > 0) {
        same(a.radius, t.R, 'turn radius V² ÷ (g tan φ)');
        same(a.rate, a.rateDegrees ? (t.omega * 180) / Math.PI : t.omega, 'turn rate V ÷ R');
      }
    }
    if (a.view === 'stability') {
      const [hac, h, hn] = [read(a.hac), read(a.h), read(a.hn)];
      if (hac === undefined || h === undefined || hn === undefined) return out;
      // (The neutral point may fall off the chord: its mark stops at the chord's end.)
      for (const [x, what] of [
        [hac, 'aerodynamic center'],
        [h, 'CG'],
      ] as const)
        if (x < -0.05 || x > 1.05) out.push(`freeBody: ${what} ${x} is off the chord`);
      same(a.margin, hn - h, 'static margin h_n − h');
      const m = read(a.margin);
      if (m !== undefined && m > 0 !== hn > h)
        out.push('freeBody: the CG is drawn ahead of the neutral point but SM ≤ 0');
    }
  }
  return out;
}

/**
 * HC35: the transfer ellipse touches r₁ and r₂ with a = (r₁ + r₂) ÷ 2 as drawn, the burns and
 * TOF; vis-viva at r on the drawn ellipse; the synodic period, after which the planets line up;
 * a_n = v² ÷ ρ and a = √(a_t² + a_n²).
 */
function orbitIssues(
  rep: Extract<He2fSpec, { kind: 'circularMotion' }>,
  read: (x: NumOrVar | undefined, d?: number) => number | undefined,
  same: (id: string | undefined, want: number, what: string) => void,
): string[] {
  const out: string[] = [];
  switch (rep.mode) {
    case 'hohmann': {
      const [mu, r1, r2] = [read(rep.mu), read(rep.r1), read(rep.r2)];
      if (mu === undefined || r1 === undefined || r2 === undefined) break;
      if (!(mu > 0 && r1 > 0 && r2 > 0)) return ['circularMotion: μ, r₁ and r₂ must be positive'];
      const h = hohmannOf(mu, r1, r2);
      // The drawing's ellipse: perigee and apogee on the two circles.
      if (!near(h.a - h.c, Math.min(r1, r2)) || !near(h.a + h.c, Math.max(r1, r2)))
        out.push('circularMotion: the transfer ellipse misses an orbit');
      same(rep.a, (r1 + r2) / 2, 'transfer a = (r₁ + r₂) ÷ 2');
      same(rep.v1, h.v1, 'v₁');
      same(rep.v2, h.v2, 'v₂');
      same(rep.vp, h.vp, 'v at departure');
      same(rep.va, h.va, 'v at arrival');
      same(rep.dv1, h.dv1, 'Δv₁');
      same(rep.vinf, h.dv1, 'v∞');
      same(rep.dv2, h.dv2, 'Δv₂');
      same(rep.tof, h.tof / (rep.tofScale ?? 1), 'time of flight');
      // An orbit inside the body draws faded with the reason (the page's limits are its own).
      break;
    }
    case 'visViva': {
      const [mu, rp, ra, r] = [read(rep.mu), read(rep.rp), read(rep.ra), read(rep.r)];
      if ([mu, rp, ra, r].some((x) => x === undefined)) break;
      // r_a < r_p, or r off the ellipse, draws faded with the reason in the caption.
      if (!(mu! > 0 && rp! > 0 && ra! >= rp!)) break;
      if (r! < rp! * (1 - 1e-9) || r! > ra! * (1 + 1e-9)) break;
      const el = ellipseOf(rp!, ra!);
      same(rep.a, el.a, 'a = (r_p + r_a) ÷ 2');
      same(rep.v, visViva(mu!, r!, el.a), 'vis-viva speed');
      break;
    }
    case 'pair': {
      const [t1, t2] = [read(rep.t1), read(rep.t2)];
      if (t1 === undefined || t2 === undefined) break;
      if (!(t1 > 0 && t2 > 0) || t1 === t2) return ['circularMotion: the periods must differ'];
      const S = synodicOf(t1, t2);
      same(rep.synodic, S, 'synodic period');
      const turns = S / t1 - S / t2;
      if (!near(Math.abs(turns), 1)) out.push('circularMotion: not lined up again after S');
      break;
    }
    case 'tangential': {
      const [v, rho, at] = [read(rep.speed), read(rep.rho), read(rep.at)];
      if (v === undefined || rho === undefined || at === undefined) break;
      if (!(rho > 0)) return ['circularMotion: ρ must be positive'];
      same(rep.an, (v * v) / rho, 'a_n = v² ÷ ρ');
      same(rep.accel, Math.hypot(at, (v * v) / rho), 'a = √(a_t² + a_n²)');
      break;
    }
  }
  return out;
}
