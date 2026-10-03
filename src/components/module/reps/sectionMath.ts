/**
 * The geometry of HC3 `section` (typesHe1b.ts): a cross-section as rectangles and disks (a
 * hole is a negative part), its area, centroid, second moments, first moment Q above a line,
 * the equal-area (plastic) axis, an RC section's bars and the Lamé hoop stress. Lengths are in
 * one unit, x from the left edge and y up from the bottom. Shared by the picture and its
 * harness check, so both work the same numbers.
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { SectionShape, SectionSpec } from '@/data/modules/typesHe1b';
import { getUnit } from '@/engine/units';

export type Part =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; sign: 1 | -1 }
  | { kind: 'disk'; cx: number; cy: number; r: number; sign: 1 | -1 };

/** Sizes in the section's one length unit (undefined when the page doesn't give one). */
export interface Sizes {
  b?: number;
  h?: number;
  d?: number;
  bf?: number;
  tf?: number;
  tw?: number;
  hw?: number;
  t?: number;
  di?: number;
  r?: number;
  holeD?: number;
  holeX?: number;
  holeY?: number;
}

export interface Built {
  parts: Part[];
  /** The bounding box, from (0, 0). */
  width: number;
  height: number;
  /** Why the sizes make no section (drawn faded with this in the caption). */
  why?: string;
}

const pos = (...xs: (number | undefined)[]) => xs.every((x) => x !== undefined && x > 0);

/** The parts of a shape from its sizes, or undefined while a size it needs is missing. */
export function buildSection(shape: SectionShape, s: Sizes): Built | undefined {
  const rect = (x: number, y: number, w: number, h: number, sign: 1 | -1 = 1): Part => ({
    kind: 'rect',
    x,
    y,
    w,
    h,
    sign,
  });
  switch (shape) {
    case 'rectangle':
    case 'rc':
      if (!pos(s.b, s.h)) return undefined;
      return { parts: [rect(0, 0, s.b!, s.h!)], width: s.b!, height: s.h! };
    case 'tee': {
      if (!pos(s.bf, s.tf, s.tw, s.hw)) return undefined;
      const { bf, tf, tw, hw } = s as Required<Sizes>;
      return {
        parts: [rect(0, hw, bf, tf), rect((bf - tw) / 2, 0, tw, hw)],
        width: Math.max(bf, tw),
        height: hw + tf,
        why: tw > bf ? 'the web is wider than the flange' : undefined,
      };
    }
    case 'wide': {
      if (!pos(s.d, s.bf, s.tf, s.tw)) return undefined;
      const { d, bf, tf, tw } = s as Required<Sizes>;
      const web = Math.max(0, d - 2 * tf);
      return {
        parts: [rect(0, 0, bf, tf), rect((bf - tw) / 2, tf, tw, web), rect(0, d - tf, bf, tf)],
        width: bf,
        height: d,
        why:
          2 * tf >= d
            ? 'the two flanges are deeper than the section'
            : tw >= bf
              ? 'the web is as wide as the flanges'
              : undefined,
      };
    }
    case 'angle': {
      if (!pos(s.b, s.h, s.t)) return undefined;
      const { b, h, t } = s as Required<Sizes>;
      return {
        parts: [rect(0, 0, t, h), rect(t, 0, Math.max(0, b - t), t)],
        width: b,
        height: h,
        why: t >= Math.min(b, h) ? 'the legs are no longer than they are thick' : undefined,
      };
    }
    case 'circle':
      if (!pos(s.d)) return undefined;
      return {
        parts: [{ kind: 'disk', cx: s.d! / 2, cy: s.d! / 2, r: s.d! / 2, sign: 1 }],
        width: s.d!,
        height: s.d!,
      };
    case 'tube': {
      if (!pos(s.d) || s.di === undefined || s.di < 0) return undefined;
      const { d, di } = s as Required<Sizes>;
      return {
        parts: [
          { kind: 'disk', cx: d / 2, cy: d / 2, r: d / 2, sign: 1 },
          ...(di > 0 ? [{ kind: 'disk', cx: d / 2, cy: d / 2, r: di / 2, sign: -1 } as Part] : []),
        ],
        width: d,
        height: d,
        why: di >= d ? 'the inside diameter is not less than the outside' : undefined,
      };
    }
    case 'hole': {
      if (!pos(s.b, s.h, s.holeD) || s.holeX === undefined) return undefined;
      const { b, h, holeD, holeX } = s as Required<Sizes>;
      const hy = s.holeY ?? h / 2;
      const r = holeD / 2;
      return {
        parts: [rect(0, 0, b, h), { kind: 'disk', cx: holeX, cy: hy, r, sign: -1 }],
        width: b,
        height: h,
        why:
          holeX - r < 0 || holeX + r > b || hy - r < 0 || hy + r > h
            ? 'the hole runs past the plate’s edge'
            : undefined,
      };
    }
    case 'cylinder': {
      if (!pos(s.r, s.t)) return undefined;
      const ro = s.r! + s.t!;
      return {
        parts: [
          { kind: 'disk', cx: ro, cy: ro, r: ro, sign: 1 },
          { kind: 'disk', cx: ro, cy: ro, r: s.r!, sign: -1 },
        ],
        width: 2 * ro,
        height: 2 * ro,
      };
    }
    case 'box': {
      if (!pos(s.b, s.h, s.t)) return undefined;
      const { b, h, t } = s as Required<Sizes>;
      return {
        parts: [rect(0, 0, b + t, h + t), rect(t, t, Math.max(0, b - t), Math.max(0, h - t), -1)],
        width: b + t,
        height: h + t,
        why: t >= Math.min(b, h) ? 'the wall is as thick as the box' : undefined,
      };
    }
  }
}

/** A disk's area above the line y (its segment) and that segment's centroid height. */
function diskAbove(cy: number, r: number, y: number) {
  const u = Math.max(-r, Math.min(r, y - cy));
  const area = r * r * Math.acos(u / r) - u * Math.sqrt(r * r - u * u);
  if (area <= 1e-300) return { area: 0, ybar: cy + r };
  return { area, ybar: cy + ((2 / 3) * (r * r - u * u) ** 1.5) / area };
}

/** The area of each part above the line y, with that piece's centroid height. */
function above(p: Part, y: number) {
  if (p.kind === 'rect') {
    const top = p.y + p.h;
    const hh = Math.max(0, Math.min(p.h, top - y));
    return { area: p.w * hh, ybar: top - hh / 2 };
  }
  return diskAbove(p.cy, p.r, y);
}

const partArea = (p: Part) => (p.kind === 'rect' ? p.w * p.h : Math.PI * p.r * p.r);
const partX = (p: Part) => (p.kind === 'rect' ? p.x + p.w / 2 : p.cx);
const partY = (p: Part) => (p.kind === 'rect' ? p.y + p.h / 2 : p.cy);
/** A part's own second moment about its horizontal centroidal axis. */
const partI = (p: Part) => (p.kind === 'rect' ? (p.w * p.h ** 3) / 12 : (Math.PI * p.r ** 4) / 4);
/** … and about its vertical one. */
const partIy = (p: Part) => (p.kind === 'rect' ? (p.h * p.w ** 3) / 12 : (Math.PI * p.r ** 4) / 4);

export interface Props {
  area: number;
  xbar: number;
  ybar: number;
  /** About the horizontal centroidal axis. */
  ix: number;
  /** About the vertical centroidal axis. */
  iy: number;
}

/** Area, centroid (ΣAx ÷ ΣA, ΣAy ÷ ΣA) and centroidal second moments (Σ(Ī + Ad²)). */
export function propsOf(parts: Part[]): Props {
  const area = parts.reduce((s, p) => s + p.sign * partArea(p), 0);
  const xbar = parts.reduce((s, p) => s + p.sign * partArea(p) * partX(p), 0) / area;
  const ybar = parts.reduce((s, p) => s + p.sign * partArea(p) * partY(p), 0) / area;
  const ix = parts.reduce(
    (s, p) => s + p.sign * (partI(p) + partArea(p) * (partY(p) - ybar) ** 2),
    0,
  );
  const iy = parts.reduce(
    (s, p) => s + p.sign * (partIy(p) + partArea(p) * (partX(p) - xbar) ** 2),
    0,
  );
  return { area, xbar, ybar, ix, iy };
}

/** Each solid part's centroid offset from the section's (dᵢ, up positive). */
export const partOffsets = (parts: Part[], ybar: number) =>
  parts.filter((p) => p.sign > 0).map((p) => partY(p) - ybar);

/** The area above the line y. */
export const areaAbove = (parts: Part[], y: number) =>
  parts.reduce((s, p) => s + p.sign * above(p, y).area, 0);

/** Q: the first moment about the centroidal axis of the area above the line y. */
export function firstMoment(parts: Part[], y: number, ybar: number): number {
  return parts.reduce((s, p) => {
    const a = above(p, y);
    return s + p.sign * a.area * (a.ybar - ybar);
  }, 0);
}

/** The section's width cut by the line y. */
export function widthAt(parts: Part[], y: number): number {
  return parts.reduce((s, p) => {
    if (p.kind === 'rect') return s + (y >= p.y && y <= p.y + p.h ? p.sign * p.w : 0);
    const u = y - p.cy;
    return s + (Math.abs(u) <= p.r ? p.sign * 2 * Math.sqrt(p.r * p.r - u * u) : 0);
  }, 0);
}

/** The equal-area axis (the plastic neutral axis): as much area above as below. */
export function plasticAxis(parts: Part[], height: number): number {
  const half = areaAbove(parts, -Infinity) / 2;
  let [lo, hi] = [0, height];
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (areaAbove(parts, mid) > half) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The plastic modulus Z: the first moments of the halves about the equal-area axis. */
export function plasticModulus(parts: Part[], height: number): number {
  const yp = plasticAxis(parts, height);
  const top = firstMoment(parts, yp, yp);
  const all = firstMoment(parts, -Infinity, yp);
  return top - (all - top);
}

/** J = π(d⁴ − dᵢ⁴) ÷ 32. */
export const polarOf = (d: number, di = 0) => (Math.PI * (d ** 4 - di ** 4)) / 32;

/** Lamé: the hoop stress at radius r in a thick cylinder under inside pressure p. */
export const lameHoop = (p: number, ri: number, ro: number, r: number) =>
  ((p * ri * ri) / (ro * ro - ri * ri)) * (1 + (ro * ro) / (r * r));

// ─── RC bars ─────────────────────────────────────────────────────────────────

/** Nominal bar diameters (in) by size #3–#11. */
const BAR_DIAMETER: Record<number, number> = {
  3: 0.375,
  4: 0.5,
  5: 0.625,
  6: 0.75,
  7: 0.875,
  8: 1,
  9: 1.128,
  10: 1.27,
  11: 1.41,
};

/** A bar's diameter in inches from its size, or undefined for a size that isn't one. */
export const barDiameter = (size: number) => BAR_DIAMETER[Math.round(size)];

/** A #3 tie or stirrup (in). */
export const TIE_DIAMETER = 0.375;

export interface BarLayout {
  bars: { x: number; y: number }[];
  /** The tie's inside line (x, y, w, h), or the spiral's center and radius. */
  tie: { x: number; y: number; w: number; h: number } | { cx: number; cy: number; r: number };
  /** Why the bars don't fit (drawn faded). */
  why?: string;
}

/**
 * Where the bars sit, all lengths in the section's unit (`inch` = one inch in it): a beam's row
 * at depth d with at least max(1 in, d_b) clear between bars, or a column's bars evenly round a
 * tie (or a spiral's circle), each inside the cover and the tie.
 */
export function barLayout(o: {
  b: number;
  h: number;
  n: number;
  db: number;
  cover: number;
  inch: number;
  depth?: number;
  perimeter?: boolean;
  spiral?: boolean;
  /** The unit's name for the reasons ("in"). */
  unit?: string;
}): BarLayout {
  const { b, h, n, db, cover, inch } = o;
  const fmt = (x: number) => `${Number(x.toPrecision(3))}${o.unit ? ` ${o.unit}` : ''}`;
  const tie = TIE_DIAMETER * inch;
  const inset = cover + tie;
  const clear = Math.max(inch, db);
  const count = Math.max(0, Math.round(n));
  if (!o.perimeter) {
    const y = o.depth !== undefined ? h - o.depth : inset + db / 2;
    const room = b - 2 * inset;
    const xs =
      count <= 1
        ? [b / 2]
        : Array.from({ length: count }, (_, i) => inset + db / 2 + (i * (room - db)) / (count - 1));
    const fits = count * db + (count - 1) * clear <= room + 1e-9;
    const deepEnough = y - db / 2 >= inset - 1e-9;
    return {
      bars: xs.map((x) => ({ x, y })),
      tie: { x: cover, y: cover, w: b - 2 * cover, h: h - 2 * cover },
      why: !fits
        ? `${count} bars need ${fmt(count * db + (count - 1) * clear)} across, more than the ${fmt(room)} inside the stirrup`
        : !deepEnough
          ? 'the bars sit lower than the cover allows'
          : undefined,
    };
  }
  if (o.spiral) {
    const r = Math.min(b, h) / 2 - inset - db / 2;
    const [cx, cy] = [b / 2, h / 2];
    const bars = Array.from({ length: count }, (_, i) => {
      const a = Math.PI / 2 + (2 * Math.PI * i) / count;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
    const pitch = count > 1 ? 2 * r * Math.sin(Math.PI / count) : Infinity;
    return {
      bars,
      tie: { cx, cy, r: r + db / 2 },
      why:
        count < 6
          ? 'a spiral column needs at least 6 bars'
          : r <= 0 || pitch - db < clear - 1e-9
            ? `${count} bars don’t fit round the spiral with ${fmt(clear)} between them`
            : undefined,
    };
  }
  // Round a rectangle of bar centers, starting at a corner, evenly spaced along its edge.
  const [x0, y0] = [inset + db / 2, inset + db / 2];
  const [w, hh] = [b - 2 * x0, h - 2 * y0];
  const perim = 2 * (w + hh);
  const bars = Array.from({ length: count }, (_, i) => {
    let s = (i * perim) / Math.max(1, count);
    if (s <= w) return { x: x0 + s, y: y0 };
    s -= w;
    if (s <= hh) return { x: x0 + w, y: y0 + s };
    s -= hh;
    if (s <= w) return { x: x0 + w - s, y: y0 + hh };
    s -= w;
    return { x: x0, y: y0 + hh - s };
  });
  const spacing = count > 0 ? perim / count : Infinity;
  return {
    bars,
    tie: { x: cover, y: cover, w: b - 2 * cover, h: h - 2 * cover },
    why:
      count < 4
        ? 'a tied column needs at least 4 bars'
        : w <= 0 || spacing - db < clear - 1e-9
          ? `${count} bars don’t fit round the ties with ${fmt(clear)} between them`
          : undefined,
  };
}

// ─── Reading a spec ──────────────────────────────────────────────────────────

/** How many of `to` one `from` is (mm → m: 0.001), or 1 when either is not a length unit. */
export function lengthFactor(from: string | undefined, to: string | undefined) {
  const a = getUnit(from);
  const b = getUnit(to);
  return a && b && a.dimension === b.dimension ? a.factor / b.factor : 1;
}

/**
 * A spec's sizes in one length unit (the spec's `unit`, else its first size variable's), its
 * parts and, for RC, its bars. `value` reads a field in its declared unit (formula units) and
 * `unitOf` names a variable's declared unit.
 */
export function setupSection(
  spec: SectionSpec,
  value: (x: NumOrVar) => number | undefined,
  unitOf: (x: NumOrVar | undefined) => string | undefined,
) {
  const lenUnit =
    spec.unit ??
    [spec.b, spec.h, spec.d, spec.bf, spec.t, spec.r].map(unitOf).find((u) => !!u) ??
    '';
  const len = (x: NumOrVar | undefined) => {
    if (x === undefined) return undefined;
    const raw = value(x);
    return raw === undefined ? undefined : raw * lengthFactor(unitOf(x) ?? lenUnit, lenUnit);
  };
  const inch = lengthFactor('in', lenUnit) || 1;
  const shape = spec.shape;
  const sizes: Sizes = {
    b: len(spec.b),
    h: len(spec.h),
    d: len(spec.d),
    bf: len(spec.bf),
    tf: len(spec.tf),
    tw: len(spec.tw),
    hw: len(spec.hw),
    t: len(spec.t),
    di: len(spec.di) ?? (shape === 'tube' ? 0 : undefined),
    r: len(spec.r),
    holeD: len(spec.hole?.d),
    holeX: len(spec.hole?.x),
    holeY: len(spec.hole?.y),
  };
  // RC: the bars, the cover, and a beam's overall depth when the page gives only d (d + half a
  // bar + the stirrup + the cover).
  // A thick cylinder typed by its radii: the wall is r_o − r.
  const ro = len(spec.ro);
  if (shape === 'cylinder' && sizes.t === undefined && ro !== undefined && sizes.r !== undefined)
    sizes.t = ro - sizes.r;
  const rc = shape === 'rc';
  const count = spec.bars !== undefined ? value(spec.bars) : undefined;
  const barCount = count !== undefined ? Math.max(0, Math.round(count)) : 0;
  const barNo = spec.barSize !== undefined ? value(spec.barSize) : undefined;
  const barA = spec.barArea !== undefined ? value(spec.barArea) : undefined;
  // A bar's area in in² (the unit bar areas are listed in), its diameter from it.
  const areaUnit = getUnit(unitOf(spec.barArea));
  const areaIn =
    barA === undefined
      ? undefined
      : areaUnit?.dimension === 'area'
        ? (barA * areaUnit.factor) / 0.0254 ** 2
        : barA;
  const db =
    (areaIn !== undefined
      ? Math.sqrt((4 * areaIn) / Math.PI)
      : barNo !== undefined
        ? (barDiameter(barNo) ?? barNo / 8)
        : 1) * inch;
  const cover = len(spec.cover) ?? 1.5 * inch;
  const column = spec.layout === 'perimeter';
  const hDerived = rc && sizes.h === undefined && !column;
  if (rc) {
    if (column) sizes.h = sizes.h ?? sizes.b;
    else if (sizes.h === undefined && sizes.d !== undefined)
      sizes.h = sizes.d + db / 2 + TIE_DIAMETER * inch + cover;
  }
  const built = buildSection(shape, sizes);
  const layout =
    rc && built && barCount > 0
      ? barLayout({
          b: built.width,
          h: built.height,
          n: barCount,
          db,
          cover,
          inch,
          depth: column ? undefined : sizes.d,
          perimeter: column,
          spiral: spec.tie === 'spiral',
          unit: lenUnit,
        })
      : undefined;
  return { lenUnit, len, inch, sizes, barCount, barNo, db, cover, column, hDerived, built, layout };
}
