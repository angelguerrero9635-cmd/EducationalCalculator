/**
 * HC141 (round 4, group I): `curvedSolid` `ratio`, why cells are small. The cell is a sphere of
 * radius r, painted as a lit ball with its membrane, r marked; under it A = 4πr², V = (4/3)πr³
 * and A ÷ V = 3 ÷ r. `compare` (default 2) draws a second cell r × factor beside it at the same
 * scale with its own three lines, so a cell twice as wide has half the membrane for each μm³.
 * Drag the first cell's rim to change r (the scale holds while dragging). A "?" r draws no cell.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { reader } from './graphKit';
import { fig3 as sig3, Ital } from './he1dText';
import { cellRatio } from './he4iMath';
import { Ball, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'curvedSolid' }>;

/** Most px the bigger cell's diameter takes. */
const BIG = 168;
const TOP = 30;
const LINES = 3;
const LINE_H = 18;

export function CellRatioHe4i({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('cell');
  const start = useRef(0);
  const q = spec.ratio!;
  const known = rep.known(spec.radius);
  const r = rep.shown(spec.radius);
  const unit = rep.unit(spec.radius) ?? '';
  const f = q.compare === false ? undefined : reader(rep)(q.compare ?? 2);
  const k = f && f.known && f.value > 0 ? f.value : undefined;
  const two = q.compare !== false;
  const cells = known ? [r, ...(k ? [r * k] : [])] : [];
  // The scale: the biggest cell fits BIG px and its column, held while the rim is dragged.
  const fit = useFrozen(Math.max(...(cells.length ? cells : [1])));
  const u = (sym: string) => (unit ? ` ${unit}${sym}` : '');
  const sq = rep.unit(q.area ?? '') ?? u('²').trim();
  const cu = rep.unit(q.volume ?? '') ?? u('³').trim();
  const per = rep.unit(q.ratio ?? '') ?? (unit ? `per ${unit}` : '');
  /** A page value at 3 figures when known (a "?" leaves its line out). */
  const page = (id: string | undefined, x: number) =>
    id ? (rep.known(id) ? sig3(rep.shown(id)) : undefined) : sig3(x);
  const lines = (radius: number, own: boolean) => {
    const m = cellRatio(radius);
    return [
      own ? page(q.area, m.area) : sig3(m.area),
      own ? page(q.volume, m.volume) : sig3(m.volume),
      own ? page(q.ratio, m.ratio) : sig3(m.ratio),
    ].map((x, i) =>
      x === undefined
        ? undefined
        : [`A = ${x} ${sq}`, `V = ${x} ${cu}`, `A ÷ V = ${x} ${per}`][i]!.trim(),
    );
  };
  const rText = (x: number) => `r = ${formatNumber(Number(x.toPrecision(4)))}${u('')}`;
  const caption = known
    ? [
        'A = 4πr², V = 4/3 πr³, so A ÷ V = 3 ÷ r',
        `r = ${sig3(r)}${u('')}: A ÷ V = 3 ÷ ${sig3(r)} = ${sig3(3 / r)} ${per}`.trim(),
        ...(k
          ? [
              `r × ${formatNumber(k)} = ${sig3(r * k)}${u('')}: A ÷ V = ${sig3(3 / (r * k))} ${per}, ${k > 1 ? `1/${formatNumber(k)} as much` : `${formatNumber(1 / k)} times as much`} membrane for each ${cu}`.trim(),
            ]
          : []),
      ].join(' · ')
    : 'A cell as a sphere: type r to draw it.';

  const height = TOP + BIG + 14 + LINES * LINE_H + 4;
  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w }) => {
          const cols = two ? [w * 0.27, w * 0.73] : [w / 2];
          const big = fit.value;
          // px per unit: the bigger cell fits BIG px, and each fits its column.
          const s = Math.min(BIG / (2 * big), ((two ? w / 2 : w) - 16) / (2 * big));
          const cy = TOP + BIG / 2;
          return (
            <>
              <Svg width={w} height={height}>
                <Defs>
                  <Ball id={ids.cell} color={c.he4iCell} />
                </Defs>
                {cells.map((radius, i) => {
                  const x = cols[i]!;
                  const R = Math.max(1.5, radius * s);
                  const rLabel = fitLabel(x, rText(radius), chart.label, w);
                  return (
                    <G key={i}>
                      <ChartText
                        {...rLabel}
                        y={16}
                        fontSize={chart.label}
                        fontWeight="700"
                        fill={c.chartInk}
                      >
                        <Ital text={rText(radius)} />
                      </ChartText>
                      <Circle
                        cx={x}
                        cy={cy}
                        r={R}
                        fill={url(ids.cell)}
                        stroke={c.he4iCellEdge}
                        strokeWidth={R > 12 ? 2 : 1}
                      />
                      {R > 6 ? (
                        <G>
                          <Line
                            x1={x}
                            y1={cy}
                            x2={x + R}
                            y2={cy}
                            stroke={c.chartInk}
                            strokeWidth={chart.strokeLight}
                          />
                          <Circle cx={x} cy={cy} r={2} fill={c.chartInk} />
                        </G>
                      ) : null}
                      {lines(radius, i === 0).map((t, j) =>
                        t ? (
                          <ChartText
                            key={j}
                            {...fitLabel(x, t, chart.label, w)}
                            y={TOP + BIG + 14 + j * LINE_H + 12}
                            fontSize={chart.label}
                            fontWeight={j === 2 ? '700' : '400'}
                            fill={j === 2 ? c.chartHighlight : c.chartInk}
                          >
                            <Ital text={t} />
                          </ChartText>
                        ) : null,
                      )}
                    </G>
                  );
                })}
              </Svg>
              {known && rep.movable(spec.radius) ? (
                <DragHandle
                  testID="drag-radius"
                  x={cols[0]! + Math.max(1.5, r * s)}
                  y={cy}
                  label={rep.variable(spec.radius).name}
                  onStart={() => {
                    fit.freeze();
                    start.current = rep.val(spec.radius);
                  }}
                  onEnd={fit.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        [spec.radius]: rep.snapTo(
                          spec.radius,
                          start.current + (dx / s) * rep.factor(spec.radius),
                        ),
                      },
                      rep.slide(spec.radius),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
