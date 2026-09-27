import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Canvas,
  Caption,
  ChartText,
  DragHandle,
  fitLabel,
  nowrap,
  useFrozen,
  useRep,
} from './common';

type Spec = Extract<Representation, { kind: 'energyPyramid' }>;

/** The most levels a pyramid draws. */
export const PYRAMID_MAX = 5;

const LEVEL_NAMES = [
  'producers',
  'first consumers',
  'second consumers',
  'third consumers',
  'fourth consumers',
];

/** Tier colors, bottom up: green plants, then yellow, orange, red and purple consumers. */
const tierColor = (c: Palette, i: number) =>
  [c.life, c.chartSecond, c.orange, c.blockRed, c.purple][i] ?? c.chartFill;

const ROW = 44;
const PAD = 10;

/**
 * An energy pyramid: a flat tier per feeding level, producers at the bottom, each tier as
 * wide as its energy on one scale, so the top tiers shrink to slivers (10% of 10% of …). The
 * share passed up is marked beside each step; the energies are written on the tiers. Drag
 * the bottom tier's edge.
 */
export function EnergyPyramid({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const levels = spec.levels.slice(0, PYRAMID_MAX);
  const n = levels.length;
  const names = levels.map((_, i) => spec.names?.[i] ?? LEVEL_NAMES[i]!);
  // The scale: the biggest energy (the producers, normally); held still while dragging.
  const biggest = Math.max(1e-9, ...levels.map((id) => Math.abs(rep.shown(id))));
  const scale = useFrozen(biggest);
  const percent =
    spec.percent === undefined
      ? '10%'
      : typeof spec.percent === 'number'
        ? `${formatNumber(spec.percent)}%`
        : rep.known(spec.percent)
          ? `${formatNumber(rep.shown(spec.percent))}%`
          : '?%';
  const base = levels[0]!;
  const draggable = !rep.variable(base).derived;

  return (
    <View>
      <Canvas aspect={(w) => (n * ROW + 2 * PAD) / w}>
        {({ w, h }) => {
          const nameW = Math.min(112, w * 0.3);
          const stepW = 48;
          const left = nameW + 4;
          const span = w - left - stepW - 6;
          const mid = left + span / 2;
          const width = (id: string) =>
            Math.max(3, (Math.min(Math.abs(rep.shown(id)), scale.value) / scale.value) * span);
          // Row i (0 = producers) sits at the bottom.
          const rowY = (i: number) => h - PAD - (i + 1) * ROW;
          return (
            <>
              <Svg width={w} height={h}>
                {levels.map((id, i) => {
                  const known = rep.known(id);
                  const bw = width(id);
                  const y = rowY(i);
                  const text = rep.value(id);
                  const tw = text.length * chart.value * 0.6;
                  const inside = tw + 10 < bw;
                  return (
                    <G key={id}>
                      <Rect
                        x={mid - bw / 2}
                        y={y + 2}
                        width={bw}
                        height={ROW - 4}
                        rx={2}
                        fill={tierColor(c, i)}
                        fillOpacity={known ? 1 : 0.25}
                        // A sliver keeps its color: a thin outline, not a black bar.
                        stroke={bw < 8 ? tierColor(c, i) : c.chartInk}
                        strokeWidth={bw < 8 ? 0.75 : chart.strokeLight}
                        strokeDasharray={known ? undefined : chart.dashFine}
                      />
                      <ChartText
                        {...(inside
                          ? { x: mid, textAnchor: 'middle' as const }
                          : fitLabel(mid + bw / 2 + 6, text, chart.value, w - stepW, 'start', 3))}
                        y={y + ROW / 2 + 5}
                        fontSize={chart.value}
                        fontWeight="700"
                      >
                        {text}
                      </ChartText>
                      <ChartText
                        x={nameW}
                        y={y + ROW / 2 + 4}
                        fontSize={chart.small}
                        fill={c.chartMuted}
                        textAnchor="end"
                      >
                        {names[i]}
                      </ChartText>
                    </G>
                  );
                })}
                {levels.slice(1).map((id, i) => {
                  // The step from level i up to level i + 1: an arrow up at the right, the share.
                  const x = w - stepW / 2 - 2;
                  const y = rowY(i) + 2;
                  return (
                    <G key={`step-${id}`}>
                      <Line
                        x1={x - 14}
                        y1={y + 9}
                        x2={x - 14}
                        y2={y - 9}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.stroke}
                        strokeLinecap="round"
                      />
                      <Path
                        d={`M ${x - 18} ${y - 5} L ${x - 14} ${y - 10} L ${x - 10} ${y - 5}`}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.stroke}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      <ChartText
                        x={x - 6}
                        y={y + 4}
                        fontSize={chart.small}
                        fontWeight="700"
                        fill={c.chartHighlight}
                      >
                        {percent}
                      </ChartText>
                    </G>
                  );
                })}
              </Svg>
              {draggable ? (
                <DragHandle
                  testID={`drag-${base}`}
                  x={mid + width(base) / 2}
                  y={rowY(0) + ROW / 2}
                  label={rep.variable(base).name}
                  onStart={() => {
                    start.current = Math.abs(rep.shown(base));
                    scale.freeze();
                  }}
                  onEnd={scale.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...(typeof spec.percent === 'string' ? rep.pin([spec.percent]) : {}),
                        [base]: rep.snapTo(
                          base,
                          Math.max(0, start.current + ((2 * dx) / span) * scale.value) *
                            rep.factor(base),
                        ),
                      },
                      rep.slide(base),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {levels
          .slice(1)
          .map((id, i) => nowrap(`${percent} of ${rep.value(levels[i]!)} = ${rep.value(id)}`))
          .join(' · ')}
      </Caption>
    </View>
  );
}
