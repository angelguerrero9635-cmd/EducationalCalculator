/**
 * Picture checks for college pictures, round 1, group B: HC3 `section` (`typesHe1b.ts`). What
 * the picture draws must agree with the values: the centroid inside the bounding box and at
 * ΣAy ÷ ΣA (where the bending block is zero), A and Ī from the parts, I = Ī + Ad² ≥ Ī, J and k,
 * a = β₁c with the strain line straight through zero at c, bars inside the cover, one shear
 * flow all round a closed cell, σ_a = σ_h ÷ 2. Called from `repIssues` in `pictures.ts` with a
 * reader of formula units (`siOf`). Test-only.
 */
import {
  lengthFactor,
  partOffsets,
  polarOf,
  propsOf,
  setupSection,
  TIE_DIAMETER,
} from '@/components/module/reps/sectionMath';
import { getUnit } from '@/engine/units';
import type { VariableDef } from '@/engine/types';

import type { NumOrVar } from '../typesGraphs';
import type { SectionSpec } from '../typesHe1b';

type Val = (id: string) => number | undefined;

/** Equal to 1e-6 of the larger, or within 1e-9 (values are worked, not typed and rounded). */
const near = (a: number, b: number, scale = 0) =>
  Math.abs(a - b) <= 1e-6 * Math.max(Math.abs(a), Math.abs(b), scale) + 1e-9;

/** HC3 `section`. `val` reads formula units (the unit each variable declares). */
export function sectionIssues(
  rep: SectionSpec,
  val: Val,
  byId: Map<string, VariableDef>,
): string[] {
  const out: string[] = [];
  const unitOf = (x: NumOrVar | undefined) =>
    typeof x === 'string' ? byId.get(x)?.unit : undefined;
  const read = (x: NumOrVar) => (typeof x === 'number' ? x : val(x));
  const setup = setupSection(rep, read, unitOf);
  const { lenUnit, len, sizes, built, layout } = setup;
  /** A variable in the section's length unit raised to `power` (an area: 2, I and J: 4). */
  const inUnits = (id: string | undefined, power: number) => {
    if (!id) return undefined;
    const x = val(id);
    if (x === undefined) return undefined;
    const unit = byId.get(id)?.unit;
    const u = getUnit(unit);
    // An area in a registered unit converts; mm⁴ and in⁴ name their length unit.
    if (u && u.dimension === 'area' && power === 2) {
      const base = getUnit(lenUnit);
      return base ? (x * u.factor) / base.factor ** 2 : x;
    }
    const m = unit ? /^(\w+)[²³⁴]$/.exec(unit) : null;
    return m ? x * lengthFactor(m[1], lenUnit) ** power : x;
  };
  /** `scale`: the size of the terms `want` is a difference of (J from d⁴ − dᵢ⁴). */
  const same = (id: string | undefined, want: number, what: string, power = 1, scale = 0) => {
    const x = power === 1 ? len(id) : inUnits(id, power);
    if (id && x !== undefined && Number.isFinite(want) && !near(x, want, scale))
      out.push(`section: ${what} ${id} = ${x}, the picture draws ${want}`);
  };
  const known = (x: NumOrVar | undefined) => x === undefined || read(x) !== undefined;

  const sizesKnown = [
    rep.b,
    rep.h,
    rep.d,
    rep.bf,
    rep.tf,
    rep.tw,
    rep.hw,
    rep.t,
    rep.di,
    rep.r,
    rep.ro,
    rep.hole?.d,
    rep.hole?.x,
    rep.hole?.y,
  ].every(known);
  if (!built || !sizesKnown) return out;
  const p = propsOf(built.parts);

  if (!built.why && rep.shape !== 'cylinder' && !rep.thinWalled) {
    // The centroid: inside the bounding box, at ΣAx ÷ ΣA and ΣAy ÷ ΣA (the neutral axis).
    if (
      p.xbar < -1e-9 ||
      p.xbar > built.width + 1e-9 ||
      p.ybar < -1e-9 ||
      p.ybar > built.height + 1e-9
    )
      out.push(`section: the centroid (${p.xbar}, ${p.ybar}) is outside the bounding box`);
    same(rep.centroid?.x, p.xbar, 'x̄ = ΣAx ÷ ΣA');
    same(rep.centroid?.y, p.ybar, 'ȳ = ΣAy ÷ ΣA');
    if (rep.area && !rep.whitney) same(rep.area, p.area, 'A = ΣA', 2);
    same(rep.inertia, p.ix, 'Ī = Σ(Ī + Ad²)', 4);
    // A parallel axis: I = Ī + Ad², never less than Ī.
    const d = rep.axis ? len(rep.axis.d) : undefined;
    if (rep.axis && d !== undefined) {
      const I = p.ix + p.area * d * d;
      same(rep.axis.inertia, I, 'I = Ī + Ad²', 4);
      const typed = inUnits(rep.axis.inertia, 4);
      const bar = inUnits(rep.inertia, 4);
      if (typed !== undefined && bar !== undefined && typed < bar * (1 - 1e-9))
        out.push(`section: I about x′ (${typed}) is less than Ī (${bar})`);
    }
    // A composite's parts: dᵢ from the section's centroid to each part's.
    const offsets = partOffsets(built.parts, p.ybar);
    rep.parts?.d?.forEach((id, i) => {
      if (offsets[i] !== undefined) same(id, offsets[i]!, `d${i + 1} (part offset)`);
    });
    if (rep.gyration) same(rep.gyration, Math.sqrt(p.ix / p.area), 'k = √(I ÷ A)');
    if (rep.polar && (rep.shape === 'circle' || rep.shape === 'tube'))
      same(
        rep.polar,
        polarOf(sizes.d ?? 0, sizes.di ?? 0),
        'J = π(d⁴ − dᵢ⁴) ÷ 32',
        4,
        polarOf(sizes.d ?? 0) + polarOf(sizes.di ?? 0),
      );
    if (rep.web && rep.shape === 'wide')
      same(rep.web, (sizes.d ?? 0) * (sizes.tw ?? 0), 'A_w = d t_w', 2);
  }
  if (rep.stress === 'torsion' && rep.shape !== 'circle' && rep.shape !== 'tube')
    out.push(`section: torsion is drawn on a circle or tube, not a ${rep.shape}`);
  if (rep.stress === 'hoop' && rep.shape !== 'cylinder')
    out.push(`section: hoop stress is drawn on a cylinder, not a ${rep.shape}`);

  // Whitney: a = β₁c; the strain line runs from 0.003 at the top through zero at c, so it
  // reads ε_t = 0.003(d − c) ÷ c at the bars.
  if (rep.whitney) {
    const a = len(rep.a);
    const c = len(rep.c);
    const beta = rep.beta1 !== undefined ? read(rep.beta1) : 0.85;
    if (a !== undefined && c !== undefined && beta !== undefined && !near(a, beta * c))
      out.push(`section: a = ${a} is not β₁c = ${beta} × ${c}`);
    const et = rep.epsT ? val(rep.epsT) : undefined;
    if (c !== undefined && c > 0 && et !== undefined && sizes.d !== undefined) {
      const line = (0.003 * (sizes.d - c)) / c;
      if (!near(et, line))
        out.push(`section: ε_t = ${et} is off the strain line, 0.003(d − c) ÷ c = ${line}`);
    }
  }

  // Bars: every one inside the cover and the tie (when they fit; else the picture says why).
  if (layout && !layout.why && sizes.b !== undefined && sizes.h !== undefined) {
    const inset = setup.cover + TIE_DIAMETER * setup.inch + setup.db / 2 - 1e-9;
    for (const bar of layout.bars) {
      const inside =
        rep.tie === 'spiral'
          ? Math.hypot(bar.x - sizes.b / 2, bar.y - sizes.h / 2) <=
            Math.min(sizes.b, sizes.h) / 2 - inset + 2e-9
          : bar.x >= inset &&
            bar.x <= sizes.b - inset &&
            bar.y >= inset &&
            bar.y <= sizes.h - inset;
      if (!inside) out.push(`section: a bar at (${bar.x}, ${bar.y}) is inside the cover`);
    }
  }

  // Thin-walled: A_m is the area inside the wall's mid-line; one q all round (one value drawn).
  if (rep.thinWalled) {
    const Am =
      rep.shape === 'box'
        ? (sizes.b ?? 0) * (sizes.h ?? 0)
        : (Math.PI * ((sizes.d ?? 0) - (sizes.t ?? 0)) ** 2) / 4;
    same(rep.area, Am, 'A_m (inside the mid-line)', 2);
    const q = rep.q ? val(rep.q) : undefined;
    if (q !== undefined && q < 0) out.push(`section: shear flow q = ${q} is negative`);
  }

  // Thin-walled hoop: σ_a = σ_h ÷ 2 (the arrows drawn in that proportion).
  if (rep.stress === 'hoop' && !rep.thick && rep.edge !== undefined && rep.axial) {
    const sh = read(rep.edge);
    const sa = val(rep.axial);
    if (sh !== undefined && sa !== undefined && !near(sa, sh / 2))
      out.push(`section: σ_a = ${sa} is not σ_h ÷ 2 = ${sh / 2}`);
  }
  // A stress block's edge value is a size: never negative.
  const edge = rep.edge !== undefined ? read(rep.edge) : undefined;
  if (edge !== undefined && edge < 0)
    out.push(`section: the block's edge value ${edge} is negative`);
  return out;
}
