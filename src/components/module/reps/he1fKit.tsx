/**
 * Shared parts of the group F college pictures (HC5 `controlVolume`, HC13 `velocityProfile`):
 * arrows, stacked labels, and a value's label at the page's worked figures.
 */
import { G, Line, Path, Rect } from 'react-native-svg';

import { withWorkedFigures } from '@/data/modules/grade';
import { formatNumber } from '@/engine/format';
import { chart, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { ChartText, useRep } from './common';

export const LH = 15;

/** Rounded for a label: 4 significant figures. */
export const r4 = (x: number) => formatNumber(Number(x.toPrecision(4)));
export const textW = (s: string, size = chart.label) => s.length * size * 0.56;

export type LabelLine = {
  text: string;
  bold?: boolean;
  tags?: { text: string; unknown?: boolean }[];
};

/** An arrow from (x1, y1) to (x2, y2) with its head at the second point. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 2,
  dashed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
  dashed?: boolean;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const head = 7 + width;
  const bx = x2 - head * Math.cos(a);
  const by = y2 - head * Math.sin(a);
  const px = Math.sin(a) * (head * 0.55);
  const py = -Math.cos(a) * (head * 0.55);
  return (
    <G>
      <Line
        x1={x1}
        y1={y1}
        x2={bx}
        y2={by}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dashed ? chart.dash : undefined}
      />
      <Path d={`M ${x2} ${y2} L ${bx + px} ${by + py} L ${bx - px} ${by - py} Z`} fill={color} />
    </G>
  );
}

/** A stack of label lines with its last baseline at `y`, anchored at x. */
export function Block({
  x,
  y,
  lines,
  anchor,
  c,
}: {
  x: number;
  y: number;
  lines: LabelLine[];
  anchor: 'start' | 'end' | 'middle';
  c: Palette;
}) {
  const top = y - (lines.length - 1) * LH;
  return (
    <G>
      {lines.map((l, i) =>
        l.tags ? (
          <G key={i}>
            {(() => {
              // Tags side by side, an unknown lit; laid out from the anchor.
              const widths = l.tags.map((t) => textW(t.text) + 10);
              const total = widths.reduce((a, b) => a + b + 4, -4);
              let x0 = anchor === 'start' ? x : anchor === 'end' ? x - total : x - total / 2;
              return l.tags.map((t, k) => {
                const w = widths[k]!;
                const el = (
                  <G key={k}>
                    <Rect
                      x={x0}
                      y={top + i * LH - 11}
                      width={w}
                      height={15}
                      rx={4}
                      fill={t.unknown ? c.chartHighlight : c.chartSurface}
                      stroke={t.unknown ? c.chartHighlight : c.chartGrid}
                    />
                    <ChartText
                      x={x0 + w / 2}
                      y={top + i * LH}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={t.unknown ? c.onChartHighlight : c.chartInk}
                    >
                      {t.text}
                    </ChartText>
                  </G>
                );
                x0 += w + 4;
                return el;
              });
            })()}
          </G>
        ) : (
          <ChartText
            key={i}
            x={x}
            y={top + i * LH}
            fontSize={chart.label}
            fontWeight={l.bold ? 'bold' : undefined}
            textAnchor={anchor}
            fill={l.bold ? c.chartInk : c.chartMuted}
          >
            {l.text}
          </ChartText>
        ),
      )}
    </G>
  );
}

/**
 * A value's label, "F₁ = 100 kg/h": as typed, or a worked-out value at the page's figures
 * (4 unless it sets `workedFigures`). Undefined while it is "?".
 */
export function useValueLabel(calc: Calculator) {
  const rep = useRep(calc);
  const figs = calc.module.workedFigures ?? 4;
  return (id: string): string | undefined => {
    if (!rep.known(id)) return undefined;
    if (rep.typed(id)) return rep.label(id);
    const v = rep.variable(id);
    const unit = rep.unit(id);
    const num = formatNumber(rep.shown(id), withWorkedFigures(v, figs));
    const gap = unit && ['%', '°', '′', '″'].includes(unit) ? '' : ' ';
    return `${v.symbol} = ${num}${unit ? `${gap}${unit}` : ''}`;
  };
}
