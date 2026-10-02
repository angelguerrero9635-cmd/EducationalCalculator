/**
 * Shared pieces for the college round 2 group E pictures (HC19, HC29): a reader of the page's
 * values in SI (a "?" box is unknown, and its value is not drawn), labels with an italic symbol
 * and an upright value, and the into-the-page and out-of-the-page marks. Flat.
 */
import { useRef } from 'react';
import { Circle, G, Line, Path, Rect, TSpan } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { ChartText } from './common';
import { pathOf } from './fieldLines';
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
  /** A field's text in the unit shown, to 4 figures (10 nC, not 1 × 10¹ nC), or `value` with `unit`. */
  const say = (x: X, value: number, unit: string) => {
    if (typeof x !== 'string') return `${fig3(value)}${unit ? ` ${unit}` : ''}`;
    if (!r.rep.known(x)) return '?';
    const v = r.rep.shown(x);
    const u = r.rep.unit(x);
    if (u === '°') return `${fig(v, 4)}°`;
    return `${fig(v, 4)}${u ? ` ${u}` : ''}`;
  };
  /** A worked value: the page's box when it names one (and it is known), else ours. */
  const out = (id: string | undefined, value: number, unit: string, ok: boolean) => {
    if (!ok) return '?';
    if (!id || !r.rep.known(id)) return `${fig3(value)} ${unit}`;
    // The page's value in its shown unit, to 3 figures as a worked value reads.
    const u = r.rep.unit(id);
    return `${fig3(r.rep.shown(id))}${u ? ` ${u}` : ''}`;
  };
  return { ...r, say, out };
}

/** A number to `n` significant figures, × 10ⁿ when small or large. */
const fig = (x: number, n: number) =>
  formatNumber(Number(x.toPrecision(n)), {
    scientific: Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3),
  });

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
  size = chart.label,
  bold = false,
  chip = false,
}: {
  x: number;
  y: number;
  sym: string;
  value?: string;
  anchor?: 'start' | 'middle' | 'end';
  color?: string;
  size?: number;
  bold?: boolean;
  /** On a card-coloured chip, for a label that must sit over many lines (inside a coil). */
  chip?: boolean;
}) {
  const c = usePalette();
  const endsSub = /_[A-Za-z0-9]+$/.test(sym);
  const text = (
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
  if (!chip) return text;
  const wd = labW(sym, value, size);
  const left = anchor === 'start' ? x : anchor === 'end' ? x - wd : x - wd / 2;
  return (
    <G>
      <Rect
        x={left - 4}
        y={y - size}
        width={wd + 8}
        height={size + 6}
        rx={3}
        fill={c.card}
        opacity={0.92}
      />
      {text}
    </G>
  );
}

/** A label's width in px (for keeping labels apart and inside the canvas). */
export const labW = (sym: string, value: string | undefined, size: number = chart.label) =>
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

/**
 * A field against r through a charged or current-carrying body of radius a (B of a thick wire,
 * E of a charged ball): the rise to the surface, the fall beyond, the point at r.
 */
export function ProfileGraph({
  yName,
  x0,
  y0,
  x1,
  y1,
  a,
  r,
  aName = 'a',
  shape,
  color,
}: {
  yName: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  a: number;
  r?: number;
  /** The surface's letter (a for a wire, R for a ball). */
  aName?: string;
  shape: (x: number) => number;
  color?: string;
}) {
  const c = usePalette();
  const xmax = Math.max(a, r ?? 0) * 2.6 || 1;
  const peak = shape(a) || 1;
  const X = (x: number) => x0 + ((x1 - x0) * x) / xmax;
  const Y = (b: number) => y1 - ((y1 - y0) * b) / (peak * 1.12);
  const pts: [number, number][] = Array.from({ length: 81 }, (_, i) => {
    const x = (xmax * i) / 80;
    return [X(x), Y(shape(x))];
  });
  return (
    <G>
      <Line x1={x0} y1={y1} x2={x1} y2={y1} stroke={c.chartInk} strokeWidth={1.2} />
      <Line x1={x0} y1={y1} x2={x0} y2={y0} stroke={c.chartInk} strokeWidth={1.2} />
      <Path d={pathOf(pts)} stroke={color ?? c.he2eField} strokeWidth={2.2} fill="none" />
      <Line
        x1={X(a)}
        y1={y1}
        x2={X(a)}
        y2={Y(peak)}
        stroke={c.chartMuted}
        strokeDasharray={chart.dashFine}
      />
      <Lab x={X(a)} y={y1 + 14} sym={aName} anchor="middle" />
      {r !== undefined ? (
        <G>
          <Circle cx={X(r)} cy={Y(shape(r))} r={4} fill={c.he2eSurface} />
          {Math.abs(X(r) - X(a)) > 14 ? <Lab x={X(r)} y={y1 + 14} sym="r" anchor="middle" /> : null}
        </G>
      ) : null}
      <Lab x={x1} y={y1 - 6} sym="r" anchor="end" />
      <Lab x={x0 - 6} y={y0 + 10} sym={yName} anchor="end" />
    </G>
  );
}

/** A drag along a line from an origin: the value scales with the handle's distance. */
export function useScaleDrag(
  r: ReturnType<typeof useHe2e>,
  calc: Calculator,
  id: string | number | undefined,
  pins: string[],
) {
  const start = useRef({ value: 0, px: 1 });
  return (px: number) =>
    typeof id !== 'string'
      ? undefined
      : {
          onStart: () => {
            start.current = { value: r.rep.val(id), px: Math.max(8, px) };
          },
          onMove: (d: number) => {
            const k = Math.max(0.05, (start.current.px + d) / start.current.px);
            calc.set(
              { ...r.rep.pin(pins), [id]: r.rep.snapTo(id, start.current.value * k) },
              r.rep.slide(id),
            );
          },
        };
}

/** The variable ids among number-or-variable fields. */
export const ids = (...xs: (string | number | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');
