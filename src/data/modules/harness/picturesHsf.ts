/**
 * Picture checks for the Grades 9–12 fields group HF adds to existing kinds (H23–H29,
 * `typesHsf.ts`): what each draws must agree with the values. Called from the kind's case in
 * `repIssues` (`pictures.ts`). Test-only.
 */
import { rootSplit } from '@/components/module/reps/rootSplit';
import { partitionOf } from '@/components/module/reps/planeGeo';
import { roundCut, roundReach } from '@/components/module/reps/roundSection';
import { splitterShape } from '@/components/module/reps/scaleSplitter';
import { mirrorOf } from '@/components/module/reps/hs2h';
import { imageOf, type MoveValues, type Pt } from '@/components/module/reps/transform';

import { primeFactors } from '../helpers';
import type { SecondMove } from '../typesHsf';
import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;
type Of<K extends Representation['kind']> = Extract<Representation, { kind: K }>;

const far = (a: number, b: number) => Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(b));

/** A move's numbers, or undefined while one is unknown. */
function moveValues(m: SecondMove, val: Val): MoveValues | undefined {
  const num = (x: string | number | undefined, d: number) => (x === undefined ? d : val(x));
  const center = 'center' in m && m.center ? m.center : undefined;
  const mirror = m.move === 'reflect' ? mirrorOf(m, (id) => val(id)) : undefined;
  const line =
    mirror && typeof mirror === 'object' ? val('x' in mirror ? mirror.x : mirror.y) : undefined;
  if (mirror && typeof mirror === 'object' && line === undefined) return undefined;
  const xs = [
    m.move === 'translate' ? num(m.right, 0) : 0,
    m.move === 'translate' ? num(m.up, 0) : 0,
    m.move === 'rotate' ? num(m.angle, 0) : 0,
    m.move === 'dilate' ? num(m.factor, 1) : 1,
    num(center?.[0], 0),
    num(center?.[1], 0),
  ];
  if (xs.some((x) => x === undefined)) return undefined;
  const [right, up, angle, factor, cx, cy] = xs as number[];
  return {
    right: right!,
    up: up!,
    mirror,
    line,
    angle: angle!,
    factor: factor!,
    center: [cx!, cy!],
  };
}

/** H23: a second move takes A′ to A″ (`image2`), and a figure with symmetry has 3+ corners. */
export function transformationHsfIssues(rep: Of<'transformation'>, val: Val): string[] {
  const out: string[] = [];
  if (rep.image2 && !rep.then) out.push('image2 (A″) needs a second move (then)');
  if (rep.symmetry && rep.figure.length < 3)
    out.push('symmetry needs a figure of 3 or more corners');
  if (!rep.then) return out;
  const second = moveValues(rep.then, val);
  if (second && rep.then.move === 'dilate' && second.factor <= 0)
    out.push(`second dilation by scale factor ${second.factor}`);
  const first = moveValues(rep as unknown as SecondMove, val);
  const a = rep.figure[0] && [val(rep.figure[0][0]), val(rep.figure[0][1])];
  if (!rep.image2 || !first || !second || !a || a.some((x) => x === undefined)) return out;
  const [ix, iy] = [val(rep.image2.x), val(rep.image2.y)];
  if (ix === undefined || iy === undefined) return out;
  const move = rep.move as SecondMove['move']; // HC95: 'matrix' is checked apart
  const [ex, ey] = imageOf(imageOf(a as Pt, move, first), rep.then.move, second);
  if (far(ix, ex) || far(iy, ey))
    out.push(`A″ (${ix}, ${iy}) is not where the two moves take A (${ex}, ${ey})`);
  return out;
}

/**
 * H24: a dilation's copy lengths are k times the original's (whole squares, on a grid of up to
 * 30 squares); the side-splitter's pieces add to the sides in the ratio k : (1 − k), DE is k × BC,
 * and the three sides close.
 */
export function scaleCopyHsfIssues(rep: Of<'scaleCopy'>, val: Val): string[] {
  const out: string[] = [];
  const [W, H, k] = [rep.width, rep.height, rep.factor].map(val);
  if (k !== undefined && k <= 0) out.push(`scale factor ${k} is not positive`);
  if (rep.splitter) {
    if (k !== undefined && k >= 1) out.push(`side-splitter factor ${k} is not below 1`);
    if (W === undefined || H === undefined || k === undefined) return out;
    const [ad, db, ae, ec] = (rep.splitter.parts ?? []).map(val);
    const want = [k * W, (1 - k) * W, k * H, (1 - k) * H];
    ['AD', 'DB', 'AE', 'EC'].forEach((name, i) => {
      const x = [ad, db, ae, ec][i];
      if (x !== undefined && far(x, want[i]!))
        out.push(`${name} = ${x}, the picture has ${want[i]}`);
    });
    const [de, bc] = (rep.splitter.base ?? []).map(val);
    if (de !== undefined && bc !== undefined && far(de, k * bc))
      out.push(`DE = ${de} is not ${k} × BC (${bc})`);
    if (!splitterShape(W, H, bc).tri) out.push(`sides ${W}, ${H}, ${bc} make no triangle`);
    return out;
  }
  // A dilation: whole squares for the original, and the grid stays readable.
  for (const [x, name] of [
    [W, 'width'],
    [H, 'height'],
  ] as const)
    if (x !== undefined && (x < 1 || x > 12 || x !== Math.round(x)))
      out.push(`original ${name} ${x} (whole squares, 1–12)`);
  const [cx, cy] = rep.center!.map(val);
  if (W === undefined || H === undefined || k === undefined || cx === undefined || cy === undefined)
    return out;
  const xs = [0, W, cx, cx + k * -cx, cx + k * (W - cx)];
  const ys = [0, H, cy, cy + k * -cy, cy + k * (H - cy)];
  const span = (v: number[]) => Math.ceil(Math.max(...v)) - Math.floor(Math.min(...v)) + 2;
  if (span(xs) > 30 || span(ys) > 30)
    out.push(`dilation grid ${span(xs)} × ${span(ys)} squares (up to 30)`);
  const cw = rep.copyWidth ? val(rep.copyWidth) : undefined;
  const ch = rep.copyHeight ? val(rep.copyHeight) : undefined;
  if (cw !== undefined && far(cw, W * k)) out.push(`copy width ${cw} is not ${k} × ${W}`);
  if (ch !== undefined && far(ch, H * k)) out.push(`copy height ${ch} is not ${k} × ${H}`);
  return out;
}

/**
 * H25: the midpoint and the partition point the values give are the ones the picture draws, the
 * ratio's parts are above 0, and a polygon has 3 to 6 corners.
 */
export function planeGeometryIssues(rep: Of<'coordinatePlane'>, val: Val): string[] {
  const out: string[] = [];
  if ((rep.midpoint || rep.partition) && !rep.second)
    out.push('a midpoint or partition needs a second point');
  if (rep.polygon && (rep.polygon.length < 3 || rep.polygon.length > 6))
    out.push(`polygon with ${rep.polygon.length} corners (3 to 6 are named A–F)`);
  if (rep.slopes && !rep.polygon) out.push("slopes label a polygon's sides");
  const ends = rep.second
    ? [val(rep.x), val(rep.y), val(rep.second.x), val(rep.second.y)]
    : undefined;
  if (!ends || ends.some((x) => x === undefined)) return out;
  const [x1, y1, x2, y2] = ends as number[];
  const check = (
    name: string,
    at: { x?: string; y?: string } | undefined,
    m: number,
    n: number,
  ) => {
    if (!at) return;
    const [ex, ey] = partitionOf([x1!, y1!], [x2!, y2!], m, n);
    const [x, y] = [at.x ? val(at.x) : undefined, at.y ? val(at.y) : undefined];
    if ((x !== undefined && far(x, ex)) || (y !== undefined && far(y, ey)))
      out.push(`${name} (${x}, ${y}) drawn, the ratio ${m} : ${n} gives (${ex}, ${ey})`);
  };
  check('M', rep.midpoint, 1, 1);
  if (rep.partition) {
    const [m, n] = rep.partition.ratio.map(val);
    if (m !== undefined && n !== undefined) {
      if (m <= 0 || n <= 0) out.push(`ratio ${m} : ${n} (both above 0)`);
      else check('P', rep.partition, m, n);
    }
  }
  return out;
}

/**
 * H26: the sector's angle is a part of one turn, and its arc length and area are the angle's
 * share of the circle's (radians: s = r × θ, A = r² × θ ÷ 2).
 */
export function circleSectorIssues(rep: Of<'circle'>, val: Val): string[] {
  const out: string[] = [];
  const views = rep.views ?? [];
  if (views.includes('sector') && !rep.sector) out.push('the sector view needs a sector');
  if (!rep.sector) return out;
  const s = rep.sector;
  const t = val(s.angle);
  const r = val(rep.radius);
  if (t === undefined) return out;
  const turn = s.unit === 'radians' ? 2 * Math.PI : 360;
  if (t <= 0 || t > turn + 1e-9)
    out.push(`sector angle ${t} is not within one turn (0 to ${turn})`);
  if (r === undefined) return out;
  const rad = s.unit === 'radians' ? t : (t * Math.PI) / 180;
  const [arc, area] = [s.arc, s.area].map((id) => (id ? val(id) : undefined));
  if (arc !== undefined && far(arc, r * rad)) out.push(`arc ${arc} is not r × θ = ${r * rad}`);
  if (area !== undefined && far(area, (r * r * rad) / 2))
    out.push(`sector area ${area} is not r² × θ ÷ 2 = ${(r * r * rad) / 2}`);
  return out;
}

/**
 * H27: a cone's slant height is √(r² + h²); the surface area is the net's faces together; the
 * Cavalieri stacks are cylinders.
 */
export function curvedSolidHsfIssues(rep: Of<'curvedSolid'>, val: Val): string[] {
  const out: string[] = [];
  if (rep.cavalieri && rep.shape !== 'cylinder')
    out.push('Cavalieri stacks are of coins: a cylinder');
  if (rep.slant && rep.shape !== 'cone') out.push('only a cone has a slant height');
  const r = val(rep.radius);
  const h = rep.height ? val(rep.height) : undefined;
  if (r === undefined) return out;
  const l = rep.slant ? val(rep.slant) : undefined;
  if (rep.shape === 'cone' && l !== undefined && h !== undefined && far(l, Math.hypot(r, h)))
    out.push(`slant ${l} is not √(r² + h²) = ${Math.hypot(r, h)}`);
  const S = rep.surface ? val(rep.surface) : undefined;
  if (S === undefined) return out;
  const want =
    rep.shape === 'sphere'
      ? 4 * Math.PI * r * r
      : h === undefined
        ? undefined
        : rep.shape === 'cylinder'
          ? 2 * Math.PI * r * r + 2 * Math.PI * r * h
          : Math.PI * r * r + Math.PI * r * (l ?? Math.hypot(r, h));
  if (want !== undefined && far(S, want)) out.push(`surface ${S}, the net's faces make ${want}`);
  return out;
}

/** H27: a cylinder's or cone's cut is on the solid and has the area the picture draws. */
export function roundSectionIssues(rep: Of<'crossSection'>, val: Val): string[] {
  const out: string[] = [];
  const cut = rep.cut ?? 'base';
  if (cut === 'diagonal') {
    out.push(`a ${rep.solid} is cut level ('base') or upright ('side')`);
    return out;
  }
  const [r, h] = [val(rep.length), val(rep.height)];
  if (r === undefined || h === undefined) return out;
  if (r <= 0 || h <= 0) return [`${rep.solid} of radius ${r} and height ${h}`];
  const reach = roundReach(cut, r, h);
  const at = rep.at ? val(rep.at) : reach / 2;
  if (at === undefined) return out;
  if (at < 0 || at > reach) out.push(`plane at ${at} is off the solid (0 to ${reach})`);
  const sec = roundCut(
    rep.solid as 'cylinder' | 'cone',
    cut,
    r,
    h,
    Math.min(reach, Math.max(0, at)),
  );
  const A = rep.area ? val(rep.area) : undefined;
  // (typed values are rounded to their step: a thousandth of the area, or 1e-4 on a tiny cut)
  if (A !== undefined && Math.abs(A - sec.area) > Math.max(1e-4, 1e-3 * sec.area))
    out.push(`cut area ${A}, the ${sec.name} drawn has ${sec.area}`);
  const V = rep.volume ? val(rep.volume) : undefined;
  const vol = Math.PI * r * r * h * (rep.solid === 'cone' ? 1 / 3 : 1);
  if (V !== undefined && far(V, vol)) out.push(`volume ${V} is not ${vol}`);
  return out;
}

/** H28: outside^index × inside is the number, and what the tree leaves inside has no group left. */
export function factorRootIssues(rep: Of<'factorTree'>, val: Val): string[] {
  if (!rep.root) return [];
  const out: string[] = [];
  const index = rep.root.index ?? 2;
  if (rep.second) out.push('a root is simplified on one tree');
  const n = val(rep.value);
  if (n === undefined || n < 2 || n !== Math.round(n)) return out;
  const split = rootSplit(primeFactors(n), index);
  const [a, b] = [rep.root.outside, rep.root.inside].map((id) => (id ? val(id) : undefined));
  if (a !== undefined && a !== split.outside)
    out.push(`outside ${a}, the pairs bring out ${split.outside}`);
  if (b !== undefined && b !== split.inside)
    out.push(`inside ${b}, the tree leaves ${split.inside}`);
  if (split.outside ** index * split.inside !== n)
    out.push(`${split.outside}^${index} × ${split.inside} is not ${n}`);
  return out;
}
