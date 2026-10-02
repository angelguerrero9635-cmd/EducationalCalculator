/**
 * Shared pieces for the college round 2 group E pictures (HC19, HC29): a reader of the page's
 * values in SI (a "?" box is unknown, and its value is not drawn), labels with an italic symbol
 * and an upright value, and the into-the-page and out-of-the-page marks. Flat.
 */
import { Circle, G, Line, TSpan } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { ChartText } from './common';
import { fig3, Ital, textW } from './he1dText';
import { useReader } from './hs3aKit';

type X = number | string | undefined;

/**
 * Values in formula units (`v`), whether each box is known, and a label for a field: the box's
 * value as shown ("2 cm", "10 nC"), or a worked number with `unit` when the field is fixed or
 * the picture worked it out.
 */
export function useHe2e(calc: Calculator) {
  const r = useReader(calc);
  /** The shown text of a field, or `value` to 3 figures with `unit`. */
  const say = (x: X, value: number, unit: string) =>
    typeof x === 'string' ? r.rep.value(x) : `${fig3(value)}${unit ? ` ${unit}` : ''}`;
  /** A worked value: the page's box when it names one (and it is known), else ours. */
  const out = (id: string | undefined, value: number, unit: string, ok: boolean) =>
    !ok ? '?' : id && r.rep.known(id) ? r.rep.value(id) : `${fig3(value)} ${unit}`;
  return { ...r, say, out };
}

/** A number for a caption's working: 3 figures, × 10ⁿ when small or large. */
export const n3 = (x: number) => fig3(x);

/**
 * A label: `sym` in italics (single letters; "_d" a subscript) then " = " and the value upright,
 * on a halo so it reads over lines. `anchor` as SVG; the width is estimated for the caller.
 */
export function Lab({
  x,
  y,
  sym,
  value,
  anchor = 'start',
  color,
  size = chart.small,
  bold = false,
}: {
  x: number;
  y: number;
  sym: string;
  value?: string;
  anchor?: 'start' | 'middle' | 'end';
  color?: string;
  size?: number;
  bold?: boolean;
}) {
  const c = usePalette();
  const endsSub = /_[A-Za-z0-9]+$/.test(sym);
  return (
    <ChartText
      halo
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fill={color ?? c.chartInk}
      fontWeight={bold ? '700' : '400'}
    >
      <Ital text={sym} size={size} />
      {value !== undefined ? (
        <TSpan dy={endsSub ? -size * 0.3 : 0} fontStyle="normal">
          {` = ${value}`}
        </TSpan>
      ) : null}
    </ChartText>
  );
}

/** A label's width in px (for keeping labels apart and inside the canvas). */
export const labW = (sym: string, value: string | undefined, size: number = chart.small) =>
  textW(sym.replace(/_/g, '') + (value === undefined ? '' : ` = ${value}`), size);

/** Keeps a start-anchored label of width `wd` inside [4, w − 4]. */
export const inside = (x: number, wd: number, w: number) => Math.max(4, Math.min(w - wd - 4, x));

/** A current or field out of the page (• in a ring) or into it (× in a ring). */
export function PageMark({
  x,
  y,
  r,
  out,
  color,
  ring = true,
  width = 1.6,
}: {
  x: number;
  y: number;
  r: number;
  out: boolean;
  color: string;
  ring?: boolean;
  width?: number;
}) {
  const k = r * 0.55;
  return (
    <G>
      {ring ? <Circle cx={x} cy={y} r={r} stroke={color} strokeWidth={width} fill="none" /> : null}
      {out ? (
        <Circle cx={x} cy={y} r={Math.max(1.6, r * 0.28)} fill={color} />
      ) : (
        <G>
          <Line x1={x - k} y1={y - k} x2={x + k} y2={y + k} stroke={color} strokeWidth={width} />
          <Line x1={x - k} y1={y + k} x2={x + k} y2={y - k} stroke={color} strokeWidth={width} />
        </G>
      )}
    </G>
  );
}
