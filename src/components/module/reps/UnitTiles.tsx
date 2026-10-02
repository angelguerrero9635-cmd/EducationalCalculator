import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep, pinHeld } from './common';
import { BoxShadow, Sheen, TopLight, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';
import { WoodStick } from './wood';

type Spec = Extract<Representation, { kind: 'unitTiles' }>;

/** Sides of the canvas, the ribbon's height, and each stick's height. */
const PAD = 14;
const RIBBON = 20;
const STICK = 30;
/** Row heights: a label line above each thing, and the "12 inches" line under the long stick. */
const LABEL_H = 18;

/** Tick spacing in small units: every unit when they're wide enough, else 2, 5, 10 … */
const tickStep = (cell: number) =>
  [1, 2, 5, 10, 20, 25, 50, 100, 200, 500].find((s) => s * cell >= 4) ?? 1000;

/** Which small units get a number: steps that fit a big unit evenly, at least 36 px apart. */
const numberStep = (cell: number, size: number) =>
  [1, 2, 3, 5, 6, 10, 12, 20, 25, 50, 100, 200, 500, 1000].find(
    (s) => s * cell >= 36 && (size % s === 0 || s % size === 0),
  ) ?? size;

/**
 * One object measured two ways, as it is in class: a ribbon laid along one long stick marked in
 * small units (a yardstick in inches, a tape in centimeters), each big unit on it in its own
 * tone with "12 inches" under it, and along a row of big-unit sticks (foot rulers, meter
 * sticks) laid end to end. Drag the ribbon's end to change how many big units long it is.
 */
export function UnitTiles({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const ids = usePaintIds('light', 'ribbon');
  const count = Math.max(0, Math.round(rep.shown(spec.count)));
  const sizeVar = typeof spec.size === 'string' ? spec.size : undefined;
  const size = Math.max(1, Math.round(sizeVar ? rep.shown(sizeVar) : (spec.size as number)));
  const total = count * size;
  const smallName = (n: number) =>
    spec.names ? spec.names.small[n === 1 ? 0 : 1] : n === 1 ? 'cube' : 'cubes';
  const bigName = (n: number) =>
    spec.names ? spec.names.big[n === 1 ? 0 : 1] : rep.variable(spec.count).name.toLowerCase();
  // The drawing fits the object (at least one big unit); held steady while dragging.
  const span = useFrozen(Math.max(total, size));
  const y = {
    objLabel: 14,
    ribbon: 22,
    smallLabel: 22 + RIBBON + 26,
    small: 22 + RIBBON + 26 + 8,
    smallUnder: 22 + RIBBON + 26 + 8 + STICK + 16,
    bigLabel: 22 + RIBBON + 26 + 8 + STICK + 16 + LABEL_H + 8,
    big: 22 + RIBBON + 26 + 8 + STICK + 16 + LABEL_H + 16,
  };
  const height = y.big + STICK + 12;

  /** A wooden stick from x0 to x1 (every other big unit in the lighter tone). */
  const stick = (key: string, x0: number, x1: number, top: number, tone: 0 | 1, r = 2) => (
    <WoodStick
      key={key}
      x0={x0}
      x1={x1}
      y={top}
      height={STICK}
      lightId={ids.light}
      r={r}
      tone={tone}
    />
  );

  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w, h }) => {
          const cell = (w - 2 * PAD) / span.value;
          const x = (units: number) => PAD + units * cell;
          const end = x(total);
          const tick = tickStep(cell);
          const every = numberStep(cell, size);
          const nodes: ReactNode[] = [];
          // Ticks down from the top edge of a stick: long at a big unit, medium at a number.
          const ticks = (from: number, to: number, top: number, key: string, faint = false) => {
            for (let u = from; u <= to; u += tick) {
              if (u === from && faint) continue;
              const big = u % size === 0;
              const num = u % every === 0;
              const len = big ? 14 : num ? 10 : 6;
              nodes.push(
                <Line
                  key={`${key}${u}`}
                  x1={x(u)}
                  y1={top}
                  x2={x(u)}
                  y2={top + len}
                  stroke={c.chartInk}
                  strokeOpacity={faint ? 0.5 : 0.85}
                  strokeWidth={big && !faint ? 1.5 : 1}
                />,
              );
            }
          };

          // The long stick in small units, a tone per big unit.
          const sticks: ReactNode[] = [];
          for (let k = 0; k < Math.max(1, count); k++) {
            const x0 = x(k * size);
            const x1 = x(Math.min(total, (k + 1) * size));
            if (count === 0) break;
            sticks.push(stick(`s${k}`, x0, x1, y.small, (k % 2) as 0 | 1, 0));
            const under = `${formatNumber(size)} ${smallName(size)}`;
            const text =
              under.length * chart.label * 0.58 < x1 - x0 - 6 ? under : formatNumber(size);
            nodes.push(
              <ChartText
                key={`u${k}`}
                x={(x0 + x1) / 2}
                y={y.smallUnder}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                {text}
              </ChartText>,
            );
          }
          ticks(0, total, y.small, 't');
          for (let u = 0; u <= total; u += every) {
            nodes.push(
              <ChartText
                key={`n${u}`}
                x={Math.min(end - 4, Math.max(x(0) + 4, x(u)))}
                y={y.small + STICK - 6}
                fontSize={chart.label}
                fontWeight={u % size === 0 ? '700' : '400'}
                fill={c.coinInk}
                textAnchor={u === 0 ? 'start' : u === total ? 'end' : 'middle'}
              >
                {formatNumber(u)}
              </ChartText>,
            );
          }

          // The big-unit sticks, end to end, each named on a paper tag.
          const bigs: ReactNode[] = [];
          for (let k = 0; k < count; k++) {
            const x0 = x(k * size) + (k ? 1 : 0);
            const x1 = x((k + 1) * size) - (k < count - 1 ? 1 : 0);
            bigs.push(stick(`b${k}`, x0, x1, y.big, (k % 2) as 0 | 1, 3));
            ticks(k * size, (k + 1) * size - tick, y.big, `bt${k}`, true);
            const tag = `1 ${bigName(1)}`;
            const tw = tag.length * chart.label * 0.56 + 8;
            if (tw < x1 - x0 - 4)
              nodes.push(
                <G key={`g${k}`}>
                  <Rect
                    x={(x0 + x1) / 2 - tw / 2}
                    y={y.big + STICK / 2 - 8}
                    width={tw}
                    height={17}
                    rx={4}
                    fill={c.paper}
                    stroke={c.woodDark}
                    strokeWidth={1}
                  />
                  <ChartText
                    x={(x0 + x1) / 2}
                    y={y.big + STICK / 2 + 4.5}
                    fontSize={chart.label}
                    fontWeight="600"
                    fill={c.chartInk}
                    textAnchor="middle"
                  >
                    {tag}
                  </ChartText>
                </G>,
              );
          }

          const known = rep.known(spec.count);
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <TopLight id={ids.light} />
                  <Sheen id={ids.ribbon} vertical />
                </Defs>
                {/* Row names above each thing. */}
                <ChartText x={PAD} y={y.objLabel} fontSize={chart.label} fontWeight="700">
                  Object
                </ChartText>
                <ChartText x={PAD} y={y.smallLabel} fontSize={chart.label} fontWeight="700">
                  {`${rep.tag(spec.total)}: ${known ? `${formatNumber(total)} ${smallName(total)}` : '?'}`}
                </ChartText>
                <ChartText x={PAD} y={y.bigLabel} fontSize={chart.label} fontWeight="700">
                  {`${rep.tag(spec.count)}: ${known ? `${count} ${bigName(count)}` : '?'}`}
                </ChartText>
                {/* The object: a ribbon from 0 to its length, with a notched end. */}
                {total > 0 ? (
                  <G opacity={known ? 1 : 0.4}>
                    <BoxShadow x={x(0)} y={y.ribbon} width={end - x(0)} height={RIBBON} />
                    <Path
                      d={`M ${x(0)} ${y.ribbon} H ${end} L ${end - 6} ${y.ribbon + RIBBON / 2} L ${end} ${y.ribbon + RIBBON} H ${x(0)} Z`}
                      fill={c.blockRed}
                    />
                    <Path
                      d={`M ${x(0)} ${y.ribbon} H ${end} L ${end - 6} ${y.ribbon + RIBBON / 2} L ${end} ${y.ribbon + RIBBON} H ${x(0)} Z`}
                      fill={url(ids.ribbon)}
                    />
                  </G>
                ) : null}
                {/* Dashed guides: both ends of the ribbon line up with both measures. */}
                {[x(0), end].map((gx, k) => (
                  <Line
                    key={`d${k}`}
                    x1={gx}
                    y1={y.ribbon + RIBBON}
                    x2={gx}
                    y2={y.big + STICK + 4}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                  />
                ))}
                <G opacity={known ? 1 : 0.4}>
                  {sticks}
                  {bigs}
                </G>
                {nodes}
              </Svg>
              <DragHandle
                testID="drag-end"
                x={Math.max(end, x(0) + 8)}
                y={y.ribbon + RIBBON / 2}
                label={rep.variable(spec.count).name}
                onStart={() => {
                  start.current = count;
                  span.freeze();
                }}
                onEnd={span.release}
                onMove={(dx) => {
                  const n = rep.snapTo(spec.count, start.current + dx / (size * cell));
                  calc.set(
                    {
                      ...pinHeld(calc, rep, sizeVar ? [sizeVar] : [], { [spec.count]: n }),
                      [spec.count]: n,
                    },
                    rep.slide(spec.count),
                  );
                }}
              />
            </>
          );
        }}
      </Canvas>
      <Caption>
        {rep.early
          ? `${count} ${bigName(count)}, each ${size} ${smallName(size)} long: ${total} ${smallName(total)} in all.`
          : `${rep.variable(spec.count).symbol} = ${count} ${bigName(count)}, each ${sizeVar ? `${rep.variable(sizeVar).symbol} = ` : ''}${size} ${smallName(size)} long. ${rep.variable(spec.total).symbol} = ${total} ${smallName(total)}.`}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.count, steps: [1], pin: sizeVar ? [sizeVar] : [] },
          ...(sizeVar ? [{ var: sizeVar, steps: [1], pin: [spec.count] }] : []),
        ]}
      />
    </View>
  );
}
