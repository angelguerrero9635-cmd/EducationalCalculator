/**
 * Shared parts of the round 3 group H college pictures (HC40 `heatExchanger`, HC41
 * `elementChain`, HC52 `fatigueDiagram`, HC59 `shaft`): a value reader in each kind's base unit
 * (a "?" reads undefined, so nothing of its own is drawn), labels in the page's notation, and a
 * dimension bracket between two heights.
 */
import { G, Line, Path } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';

import type { Calculator } from '../useCalculator';
import { arrowHead } from './graphKit';
import { useGetter } from './he2cKit';
import { sigText, unitScale, type He3hDim } from './he3hUnits';

export function useHe3hReader(calc: Calculator) {
  const { rep } = useGetter(calc);
  const unitOf = (id: string) => rep.unit(id) ?? rep.variable(id).unit;
  /** The value in the base unit of `dim`, or undefined for a "?" or a missing field. */
  const num = (x: NumOrVar | undefined, dim: He3hDim = 'none') => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    if (!rep.known(x)) return undefined;
    const v = rep.val(x) * unitScale(unitOf(x), dim);
    return Number.isFinite(v) ? v : undefined;
  };
  const isVar = (x: NumOrVar | undefined): x is string => typeof x === 'string';
  /** The page's symbol for a field, or the fallback for a fixed number or a missing field. */
  const sym = (x: NumOrVar | undefined, fallback: string) =>
    isVar(x) ? rep.variable(x).symbol : fallback;
  /**
   * "τ_max = 81.49 MPa": a variable as the page shows it, a fixed number with `unit`, or the
   * value worked out here (`worked`, in `unit`) when the page has no field for it.
   */
  const label = (x: NumOrVar | undefined, fallback: string, worked?: number, unit = '') => {
    if (isVar(x)) {
      if (!rep.known(x)) return undefined;
      // A value the page writes in powers of ten (1.0 × 10⁸ N/m) reads so here too.
      const vd = rep.variable(x);
      if (vd.scientific && !rep.typed(x)) {
        const u = unitOf(x);
        return `${vd.symbol} = ${sigText(rep.val(x), 4)}${u ? ` ${u}` : ''}`;
      }
      return rep.label(x);
    }
    const v = x ?? worked;
    if (v === undefined || !Number.isFinite(v)) return undefined;
    return `${fallback} = ${sigText(v, 3)}${unit ? ` ${unit}` : ''}`;
  };
  /** The value alone ("81.49 MPa"), or undefined. */
  const valueText = (x: NumOrVar | undefined, worked?: number, unit = '') => {
    if (isVar(x)) return rep.known(x) ? rep.value(x) : undefined;
    const v = x ?? worked;
    if (v === undefined || !Number.isFinite(v)) return undefined;
    return `${sigText(v, 3)}${unit ? ` ${unit}` : ''}`;
  };
  const unit = (x: NumOrVar | undefined, fallback: string) =>
    isVar(x) ? (unitOf(x) ?? fallback) : fallback;
  return { rep, num, sym, label, valueText, unit, isVar };
}

export type He3hReader = ReturnType<typeof useHe3hReader>;

/** A double-headed bracket from (x, y1) to (x, y2) (upright) or (x1, y) to (x2, y) (level). */
export function Bracket({
  x1,
  y1,
  x2,
  y2,
  color,
  dashed = false,
  width = 1.5,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  dashed?: boolean;
  width?: number;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 4) return null;
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
  const k = Math.min(7, len / 3);
  return (
    <G>
      <Line
        x1={x1 + ux * k * 0.7}
        y1={y1 + uy * k * 0.7}
        x2={x2 - ux * k * 0.7}
        y2={y2 - uy * k * 0.7}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dashed ? '4 3' : undefined}
      />
      <Path d={arrowHead(x2, y2, ux, uy, k)} fill={color} />
      <Path d={arrowHead(x1, y1, -ux, -uy, k)} fill={color} />
    </G>
  );
}
