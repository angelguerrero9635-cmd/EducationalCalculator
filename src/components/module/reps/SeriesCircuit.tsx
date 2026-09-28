import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Chip } from './Circuit';
import { Canvas, Caption, ChartText, DragHandle, useRep } from './common';

type Spec = Extract<Representation, { kind: 'seriesCircuit' }>;
/** Pixels of vertical drag per variable step. */
const PX_PER_STEP = 8;
/** Resistor symbols and battery plates: a little heavier than chart lines, lighter than wire. */
const PART_STROKE = 2.5;

/** A resistor's zigzag from (x, y) to (x + len, y): six peaks, 8 px high. */
const zigzag = (x: number, y: number, len: number) => {
  const n = 6;
  const seg = len / n;
  const lead = seg / 2;
  let d = `M ${x} ${y} L ${x + lead} ${y}`;
  const body = len - 2 * lead;
  const step = body / n;
  for (let i = 0; i < n; i++) d += ` L ${x + lead + step * (i + 0.5)} ${y + (i % 2 ? 8 : -8)}`;
  return `${d} L ${x + len - lead} ${y} L ${x + len} ${y}`;
};

/**
 * A college schematic in the style of the Grade 8 circuits (Circuit.tsx): a source (long plate
 * +, short plate −) drives current round one loop of copper wire through resistors in series.
 * Each resistor's resistance is on a chip above it and its voltage drop on a chip below; the
 * current is an arrow beside the bottom wire, clockwise out of +. Drag the source's handle or a
 * resistor up to increase it, down to decrease it.
 */
export function SeriesCircuit({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const resistorIds = spec.resistors.map((r) => r.r);
  const n = spec.resistors.length;

  const dragProps = (id: string, pin: string[]) => ({
    label: rep.variable(id).name,
    onStart: () => {
      start.current = rep.shown(id);
    },
    onMove: (_: number, dy: number) => {
      const step = rep.variable(id).step ?? 0.5;
      calc.set(
        {
          ...rep.pin(pin),
          [id]: rep.snapTo(id, (start.current - (dy / PX_PER_STEP) * step) * rep.factor(id)),
        },
        rep.slide(id),
      );
    },
  });
  const flows = rep.known(spec.current) && rep.val(spec.current) > 0;

  return (
    <View>
      <Canvas aspect={(w) => 210 / w}>
        {({ w, h }) => {
          const left = 58;
          const right = w - 26;
          const topY = 46;
          const botY = h - 18;
          const midY = (topY + botY) / 2 + 4;
          const span = (right - left - 24) / n;
          const rLen = Math.min(96, span * 0.62);
          const rx = (i: number) => left + 24 + span * (i + 0.5) - rLen / 2;
          const part = {
            stroke: c.chartInk,
            strokeWidth: PART_STROKE,
            strokeLinejoin: 'round' as const,
            strokeLinecap: 'round' as const,
            fill: 'none' as const,
          };
          // Copper wires, as in Circuit.tsx.
          const wire = {
            stroke: c.copper,
            strokeWidth: chart.strokeHeavy,
            strokeLinecap: 'round' as const,
            strokeLinejoin: 'round' as const,
            fill: 'none' as const,
          };
          // The top wire runs from the left corner through each resistor to the right corner.
          const topWire = [
            `M ${left} ${topY} H ${rx(0)}`,
            ...spec.resistors.slice(1).map((_, i) => `M ${rx(i) + rLen} ${topY} H ${rx(i + 1)}`),
            `M ${rx(n - 1) + rLen} ${topY} H ${right}`,
          ].join(' ');
          const chevron = (x: number, y: number, dir: 'up' | 'down') => (
            <Path
              key={`${x},${y}`}
              d={
                dir === 'down'
                  ? `M ${x - 5} ${y - 3} L ${x} ${y + 3} L ${x + 5} ${y - 3}`
                  : `M ${x - 5} ${y + 3} L ${x} ${y - 3} L ${x + 5} ${y + 3}`
              }
              stroke={c.chartHighlight}
              strokeWidth={chart.stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          );
          // The current arrow: inside the loop, just above the bottom wire, pointing left.
          const ax = (left + right) / 2;
          const ay = botY - 14;
          const half = 34;
          const sourceKnown = rep.known(spec.source);
          return (
            <>
              <Svg width={w} height={h}>
                <Path
                  d={`M ${left} ${midY - 7} V ${topY} ${topWire} M ${right} ${topY} V ${botY} H ${left} V ${midY + 7}`}
                  {...wire}
                />

                {/* Source: long plate (+) on top, short thick plate (−) below. */}
                <G opacity={sourceKnown ? 1 : 0.45}>
                  <Line x1={left - 18} y1={midY - 7} x2={left + 18} y2={midY - 7} {...part} />
                  <Line
                    x1={left - 9}
                    y1={midY + 7}
                    x2={left + 9}
                    y2={midY + 7}
                    {...part}
                    strokeWidth={chart.strokeHeavy + 2}
                  />
                  <ChartText
                    x={left - 28}
                    y={midY - 2}
                    fontSize={chart.emphasis}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    +
                  </ChartText>
                  <ChartText
                    x={left - 28}
                    y={midY + 17}
                    fontSize={chart.emphasis}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    −
                  </ChartText>
                </G>
                <ChartText
                  x={left + 50}
                  y={midY + 5}
                  fontSize={chart.value}
                  fontWeight="700"
                  opacity={sourceKnown ? 1 : 0.45}
                >
                  {rep.label(spec.source)}
                </ChartText>

                {/* Resistors: resistance on a chip above, voltage drop on a chip below. */}
                {spec.resistors.map((r, i) => (
                  <G key={r.r}>
                    <Path
                      d={zigzag(rx(i), topY, rLen)}
                      {...part}
                      opacity={rep.known(r.r) ? 1 : 0.45}
                    />
                    <Chip
                      x={rx(i) + rLen / 2}
                      y={topY - 18}
                      text={rep.label(r.r)}
                      w={w}
                      size={chart.value}
                      faded={!rep.known(r.r)}
                    />
                    <Chip
                      x={rx(i) + rLen / 2}
                      y={topY + 34}
                      text={rep.label(r.v)}
                      w={w}
                      size={chart.value}
                      faded={!rep.known(r.v)}
                    />
                  </G>
                ))}

                {/* Conventional current: out of +, up, across the top, down, back along the bottom. */}
                {flows ? (
                  <>
                    {chevron(left, (topY + midY - 7) / 2, 'up')}
                    {chevron(right, (topY + botY) / 2, 'down')}
                  </>
                ) : null}
                <G opacity={rep.known(spec.current) ? 1 : 0.45}>
                  <Line
                    x1={ax + half}
                    y1={ay}
                    x2={ax - half + 10}
                    y2={ay}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    strokeLinecap="round"
                  />
                  <Path
                    d={`M ${ax - half} ${ay} L ${ax - half + 12} ${ay - 7} L ${ax - half + 12} ${ay + 7} Z`}
                    fill={c.chartHighlight}
                  />
                  <ChartText
                    x={ax}
                    y={ay - 12}
                    fontSize={chart.value}
                    fontWeight="700"
                    fill={c.chartHighlight}
                    textAnchor="middle"
                  >
                    {rep.label(spec.current)}
                  </ChartText>
                </G>
              </Svg>
              <DragHandle
                testID="drag-source"
                x={left + 32}
                y={midY}
                {...dragProps(spec.source, resistorIds)}
              />
              {spec.resistors.map((r, i) => (
                <DragHandle
                  key={r.r}
                  testID={`drag-${r.r}`}
                  x={rx(i) + rLen / 2}
                  y={topY}
                  {...dragProps(r.r, [spec.source, ...resistorIds.filter((id) => id !== r.r)])}
                />
              ))}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
    </View>
  );

  /** Kirchhoff's voltage law and Ohm's law for the loop, with every number. */
  function caption(): string {
    const sym = (id: string) => rep.variable(id).symbol;
    const drops = spec.resistors.map((r) => r.v);
    const kvl = `${sym(spec.source)} = ${drops.map(sym).join(' + ')} = ${drops.map((id) => rep.value(id)).join(' + ')} = ${rep.value(spec.source)}`;
    const rs = spec.resistors.map((r) => r.r);
    const sum = (xs: string[]) => (xs.length > 1 ? `(${xs.join(' + ')})` : xs[0]!);
    const ohm = `${sym(spec.current)} = ${sym(spec.source)} ÷ ${sum(rs.map(sym))} = ${rep.value(spec.source)} ÷ ${sum(rs.map((id) => rep.value(id)))} = ${rep.value(spec.current)}`;
    return `${kvl} · ${ohm} · Drag the source or a resistor up or down to change it.`;
  }
}
