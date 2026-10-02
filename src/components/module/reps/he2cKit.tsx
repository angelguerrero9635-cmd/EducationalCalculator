/**
 * Shared parts of the college round 2 group C pictures (HC17 `propertyDiagram`, HC23
 * `thermalWall`): labels placed clear of each other, a polyline, and a value reader that reads
 * worked-out values to 4 figures.
 */
import { formatNumber } from '@/engine/format';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { chart } from '@/theme';

import type { Calculator } from '../useCalculator';
import { useReadSpec } from './phaseEnvelopeKit';

type Pt = [number, number];

export const poly = (ps: Pt[]) =>
  ps.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

// ─── Labels that keep clear of each other ────────────────────────────────────

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export type Anchor = 'start' | 'middle' | 'end';

/** Offsets tried in turn round a point: right above, left above, right below, left below… */
export const AROUND: [number, number, Anchor][] = [
  [8, -8, 'start'],
  [-8, -8, 'end'],
  [8, 17, 'start'],
  [-8, 17, 'end'],
  [0, -12, 'middle'],
  [0, 22, 'middle'],
  [12, 4, 'start'],
  [-12, 4, 'end'],
];

/**
 * Places each label at the first offset that overlaps nothing placed before (dots and labels)
 * and stays inside the canvas; else at the offset that overlaps least.
 */
export function makePlacer(w: number, h: number) {
  const boxes: Box[] = [];
  const overlap = (a: Box, b: Box) =>
    Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) *
    Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
  const boxOf = (x: number, y: number, text: string, size: number, anchor: Anchor): Box => {
    const tw = [...text.replace(/_/g, '')].length * size * 0.56;
    const x0 = anchor === 'start' ? x : anchor === 'end' ? x - tw : x - tw / 2;
    return { x0, y0: y - size * 0.85, x1: x0 + tw, y1: y + size * 0.3 };
  };
  return {
    block: (b: Box) => boxes.push(b),
    dot: (x: number, y: number, r = 6) =>
      boxes.push({ x0: x - r, y0: y - r, x1: x + r, y1: y + r }),
    place: (
      x: number,
      y: number,
      text: string,
      size: number = chart.label,
      tries: [number, number, Anchor][] = AROUND,
    ) => {
      let best = {
        x,
        y,
        anchor: 'start' as Anchor,
        score: Infinity,
        box: undefined as Box | undefined,
      };
      tries.forEach(([dx, dy, anchor], i) => {
        const bx = boxOf(x + dx, y + dy, text, size, anchor);
        const out =
          Math.max(0, 2 - bx.x0) +
          Math.max(0, bx.x1 - (w - 2)) +
          Math.max(0, 2 - bx.y0) +
          Math.max(0, bx.y1 - (h - 2));
        const score = boxes.reduce((s, b) => s + overlap(bx, b), 0) + out * 50 + i * 0.01;
        if (score < best.score) best = { x: x + dx, y: y + dy, anchor, score, box: bx };
      });
      if (best.box) boxes.push(best.box);
      return { x: best.x, y: best.y, textAnchor: best.anchor };
    },
  };
}

/** Reads spec fields in the variable's own unit; a "?" is undefined. */
export function useGetter(calc: Calculator) {
  const { rep: base, read } = useReadSpec(calc);
  const get: (x: NumOrVar | undefined) => number | undefined = (x) => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    return base.known(x) ? base.shown(x) : undefined;
  };
  // A worked-out value reads to 4 figures in the picture (3,200 kJ/kg, not 3,199.9301); a typed
  // one reads as typed.
  const value = (id: string, withUnit = true) => {
    if (!base.known(id) || base.typed(id)) return base.value(id, withUnit);
    const unit = base.unit(id);
    const num = formatNumber(Number(base.shown(id).toPrecision(4)));
    if (!withUnit || !unit) return num;
    return `${num}${['%', '°'].includes(unit) ? '' : ' '}${unit}`;
  };
  const rep = {
    ...base,
    value,
    label: (id: string, withUnit = true) => `${base.variable(id).symbol} = ${value(id, withUnit)}`,
  };
  return { rep, read, get };
}
