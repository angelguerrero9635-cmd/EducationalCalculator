/**
 * Picture checks for the Grades 9–12 round 3 group C kinds (`typesHs3c.ts`, earth and space
 * H110): what each one draws must agree with the values and with the science. Called from
 * `repIssues` in `pictures.ts`. Test-only.
 */
import {
  clockTime,
  EARTH_AGE_MY,
  minutesLeft,
  transitDepth,
  EARTH_PER_SUN,
  YEAR_HOURS,
  planetTemp,
  zoneInner,
  zoneOuter,
  LY_PER_PC,
  parsecsOf,
} from '@/components/module/reps/spaceHs3c';

import type { Representation } from '../types';

/** Equal to display rounding. */
const near = (a: number, b: number, tol = 1e-4) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function hs3cIssues(rep: Representation, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) => {
    const y = x === undefined ? undefined : typeof x === 'number' ? x : val(x);
    return y === undefined || Number.isNaN(y) ? undefined : y;
  };
  if (rep.kind === 'geologicClock') {
    const span = rep.span ?? EARTH_AGE_MY;
    if (!(span > 0)) out.push(`geologicClock: span ${span} is not positive`);
    for (const e of rep.events ?? [])
      if (e.age < 0 || e.age > span) out.push(`geologicClock: event "${e.name}" is off the day`);
    if (new Set((rep.events ?? []).map((e) => e.name)).size !== (rep.events ?? []).length)
      out.push('geologicClock: an event is named twice');
    if ((rep.events ?? []).length > 8) out.push('geologicClock: more than 8 events');
    const A = num(rep.ago);
    const t = num(rep.time);
    const m = num(rep.minutes);
    if (A !== undefined && (A < 0 || A > span))
      out.push(`geologicClock: ${A} million years ago is before Earth formed`);
    if (t !== undefined && (t < 0 || t > 24))
      out.push(`geologicClock: clock time ${t} is off the dial`);
    // The hand stands at t = 24 − A ÷ span × 24, with m = A ÷ span × 1,440 minutes shaded after it.
    if (A !== undefined && t !== undefined && !near(t, clockTime(A, span)))
      out.push(
        `geologicClock: clock time ${t}, but 24 − ${A} ÷ ${span} × 24 = ${clockTime(A, span)}`,
      );
    if (A !== undefined && m !== undefined && !near(m, minutesLeft(A, span)))
      out.push(`geologicClock: ${m} minutes, but ${A} ÷ ${span} × 1,440 = ${minutesLeft(A, span)}`);
    if (t !== undefined && m !== undefined && !near(t, 24 - m / 60))
      out.push(`geologicClock: clock time ${t}, but 24 − ${m} ÷ 60 = ${24 - m / 60}`);
    const p = num(rep.share);
    if (A !== undefined && p !== undefined && !near(p, (A / span) * 100))
      out.push(`geologicClock: share ${p}%, but ${A} ÷ ${span} × 100 = ${(A / span) * 100}`);
  }
  if (rep.kind === 'coralSection') {
    const n = num(rep.lines);
    const b = num(rep.bands);
    // Usually whole counts; a worked-out one draws as a part band or line.
    if (n !== undefined && n < 1) out.push(`coralSection: ${n} growth lines is less than 1`);
    if (b !== undefined && (b <= 0 || b > 10))
      out.push(`coralSection: ${b} bands is not from 0 to 10 (at most 10 are drawn)`);
    const year = rep.yearHours ?? YEAR_HOURS;
    // The bands split the lines evenly: N = n ÷ b a year, and the day D = year ÷ N hours.
    const N = num(rep.days);
    if (n !== undefined && b !== undefined && b > 0 && N !== undefined && !near(N, n / b))
      out.push(`coralSection: ${N} days a year, but ${n} ÷ ${b} = ${n / b}`);
    const days = N ?? (n !== undefined && b !== undefined && b > 0 ? n / b : undefined);
    const D = num(rep.day);
    if (days !== undefined && days > 0 && D !== undefined && !near(D, year / days))
      out.push(`coralSection: a day of ${D} hours, but ${year} ÷ ${days} = ${year / days}`);
  }
  if (rep.kind === 'transit') {
    const R = num(rep.star);
    const r = num(rep.planet);
    if (R !== undefined && R <= 0) out.push(`transit: star radius ${R} is not positive`);
    if (r !== undefined && r <= 0) out.push(`transit: planet radius ${r} is not positive`);
    if (R !== undefined && r !== undefined && R > 0 && r >= EARTH_PER_SUN * R)
      out.push(`transit: a planet of ${r} R⊕ is not smaller than a star of ${R} R☉`);
    // The dip's bottom: the planet's disk over the star's, δ = 100 × (r ÷ (109 × R))².
    const d = num(rep.depth);
    if (
      R !== undefined &&
      r !== undefined &&
      R > 0 &&
      d !== undefined &&
      !near(d, transitDepth(r, R))
    )
      out.push(`transit: depth ${d}%, but 100 × (${r} ÷ (109 × ${R}))² = ${transitDepth(r, R)}`);
  }
  if (rep.kind === 'habitableZone') {
    const L = num(rep.luminosity);
    if (L !== undefined && L <= 0) out.push(`habitableZone: luminosity ${L} is not positive`);
    const a = num(rep.orbit);
    if (a !== undefined && a <= 0) out.push(`habitableZone: orbit ${a} AU is not positive`);
    if (L === undefined || L <= 0) return out;
    // The zone is shaded from 0.95 √L to 1.37 √L; the planet's label reads 278 × L^(1/4) ÷ √a.
    const d1 = num(rep.inner);
    if (d1 !== undefined && !near(d1, zoneInner(L)))
      out.push(`habitableZone: inner edge ${d1}, but 0.95 × √${L} = ${zoneInner(L)}`);
    const d2 = num(rep.outer);
    if (d2 !== undefined && !near(d2, zoneOuter(L)))
      out.push(`habitableZone: outer edge ${d2}, but 1.37 × √${L} = ${zoneOuter(L)}`);
    const T = num(rep.temperature);
    if (a !== undefined && a > 0 && T !== undefined && !near(T, planetTemp(L, a)))
      out.push(`habitableZone: ${T} K, but 278 × ${L}^(1/4) ÷ √${a} = ${planetTemp(L, a)}`);
  }
  if (rep.kind === 'parallax') {
    const p = num(rep.angle);
    if (p !== undefined && (p <= 0 || p > 1))
      out.push(`parallax: ${p}″ is not from 0″ to 1″ (no star is nearer than 1 parsec)`);
    if (p === undefined || p <= 0) return out;
    // The caption and labels say d = 1 ÷ p parsecs and D = 3.26 × d light-years.
    const d = num(rep.parsecs);
    if (d !== undefined && !near(d, parsecsOf(p)))
      out.push(`parallax: ${d} parsecs, but 1 ÷ ${p} = ${parsecsOf(p)}`);
    const D = num(rep.lightYears);
    if (D !== undefined && !near(D, LY_PER_PC * (d ?? parsecsOf(p))))
      out.push(
        `parallax: ${D} light-years, but 3.26 × ${d ?? parsecsOf(p)} = ${LY_PER_PC * (d ?? parsecsOf(p))}`,
      );
  }
  return out;
}
