import { useRef } from 'react';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useFrozen, useRep, Caption } from './common';

type Spec = Extract<Representation, { kind: 'tape' }>;

/** A scale just past `span`: 10% more, rounded up to a tenth of its power of ten (at least 10). */
const fitScale = (span: number) => {
  const x = Math.max(10, span * 1.1);
  const step = 10 ** Math.floor(Math.log10(x)) / 10;
  return Math.ceil(x / step) * step;
};

/** A bracket under (or over) [x1, x2] at height y, opening toward the bar. */
const bracket = (x1: number, x2: number, y: number, dir: 1 | -1) => {
  const t = 6 * dir;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y - t} L ${x1} ${y} L ${mid - 4} ${y} L ${mid} ${y + t} L ${mid + 4} ${y} L ${x2} ${y} L ${x2} ${y - t}`;
};

/**
 * Tape diagram, the bar model used in Grade 1–2 word problems.
 * - Part-whole: one bar cut into its parts, with a bracket showing the total.
 * - Compare: two bars from the same start; the bracket past the shorter bar is the difference.
 * Drag a bar's end to change that value.
 */
export function Tape({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const compare = 'compare' in spec;
  const ids = compare ? spec.compare : spec.parts;
  const shown = ids.map((id) => (rep.known(id) ? Math.max(0, rep.shown(id)) : 0));
  // A fixed whole (the story sets it) is drawn at its size even while a part is unknown.
  const fixed = !compare && typeof spec.total === 'object' ? spec.total : undefined;
  const sum = shown.reduce((a, b) => a + b, 0);
  const span = compare ? Math.max(...shown) : fixed ? Math.max(fixed.value, sum) : sum;
  // Round the scale up a little past the values (100 → 110, 72 → 80), so bars fill the width.
  const fit = useFrozen(fitScale(span));
  const fmt = (id: string) => (rep.known(id) ? formatNumber(rep.shown(id), rep.variable(id)) : '?');
  const name = (id: string) => rep.variable(id).name;

  const caption = compare
    ? (() => {
        const [a, b] = spec.compare;
        const [x, y] = shown as [number, number];
        if (spec.caption) return spec.caption.replace(/\{(\w+)\}/g, (_, id: string) => fmt(id));
        if (!rep.known(a) || !rep.known(b)) return `${name(spec.difference)}: ?`;
        if (x === y) return 'The bars are the same length: no difference.';
        const lower = (id: string) => name(id).toLowerCase();
        return `The ${lower(x > y ? a : b)} is ${fmt(spec.difference)} more than the ${lower(x > y ? b : a)}.`;
      })()
    : spec.caption
      ? spec.caption.replace(/\{(\w+)\}/g, (_, id: string) => fmt(id))
      : `${spec.parts.map(fmt).join(' + ')} = ${
          typeof spec.total === 'object' ? formatNumber(spec.total.value) : fmt(spec.total)
        }`;
  // Compare by times: the bigger bar is this many copies of the smaller.
  const times =
    compare && spec.times && rep.known(spec.times)
      ? Math.max(0, Math.round(rep.shown(spec.times)))
      : 0;
  // Equal groups the whole bar is made of (e.g. 4 packs of 6), when known.
  const groups =
    !compare && spec.groups && rep.known(spec.groups)
      ? Math.max(0, Math.round(rep.shown(spec.groups)))
      : 0;
  // Past 12 the dashes would blur into a comb: a label over the bar names the groups instead.
  const dashed = groups <= 12;

  return (
    <>
      <Canvas aspect={(w) => (compare ? 150 : 128) / w}>
        {({ w }) => {
          const left = 12;
          const scale = (w - left - 16) / fit.value;
          const barH = 34;
          const drag = (id: string, i: number, x: number, y: number) => (
            <DragHandle
              key={`d${id}`}
              testID={`drag-${id}`}
              x={x}
              y={y}
              label={name(id)}
              onStart={() => {
                start.current = shown[i]!;
                fit.freeze();
              }}
              onEnd={fit.release}
              onMove={(dx) =>
                calc.set({
                  ...rep.pin(ids.filter((v) => v !== id)),
                  [id]: rep.snapTo(id, (start.current + dx / scale) * rep.factor(id)),
                })
              }
            />
          );

          if (compare) {
            const [a, b] = spec.compare;
            const ys = [20, 20 + barH + 14];
            const [x, y] = shown as [number, number];
            const lo = left + Math.min(x, y) * scale;
            const hi = left + Math.max(x, y) * scale;
            const shortRow = x > y ? 1 : 0;
            return (
              <>
                <Svg width={w} height={150}>
                  {[a, b].map((id, i) => (
                    <Rect
                      key={id}
                      x={left}
                      y={ys[i]}
                      width={Math.max(2, shown[i]! * scale)}
                      height={barH}
                      fill={i === 0 ? c.chartHighlight : c.chartFill}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                      opacity={rep.known(id) ? 1 : 0.35}
                    />
                  ))}
                  {[a, b].map((id, i) => (
                    <ChartText
                      key={`t${id}`}
                      x={left + 6}
                      y={ys[i]! + barH / 2 + 5}
                      fontSize={chart.small}
                      fill={i === 0 ? c.onChartHighlight : c.chartInk}
                    >
                      {`${name(id)}: ${rep.label(id)}`}
                    </ChartText>
                  ))}
                  {times > 1 && Math.min(x, y) > 0
                    ? Array.from({ length: times - 1 }, (_, k) => {
                        const gx = left + (k + 1) * Math.min(x, y) * scale;
                        return gx < hi - 1 ? (
                          <Line
                            key={`c${k}`}
                            x1={gx}
                            y1={ys[1 - shortRow]! - 4}
                            x2={gx}
                            y2={ys[1 - shortRow]! + barH + 4}
                            stroke={c.chartInk}
                            strokeWidth={chart.stroke}
                            strokeDasharray={chart.dash}
                          />
                        ) : null;
                      })
                    : null}
                  {times > 1 ? (
                    <ChartText
                      x={left + (hi - left) / 2}
                      y={ys[1]! + barH + 26}
                      fontSize={chart.small}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {`${times} copies of the shorter bar`}
                    </ChartText>
                  ) : null}
                  {hi - lo > 2 && times <= 1 ? (
                    <>
                      <Rect
                        x={lo}
                        y={ys[shortRow]}
                        width={hi - lo}
                        height={barH}
                        fill="none"
                        stroke={c.chartInk}
                        strokeDasharray={chart.dash}
                      />
                      <Path
                        d={bracket(lo, hi, ys[1]! + barH + 12, 1)}
                        stroke={c.chartInk}
                        fill="none"
                      />
                      <ChartText
                        x={(lo + hi) / 2}
                        y={ys[1]! + barH + 36}
                        fontSize={chart.small}
                        textAnchor="middle"
                      >
                        {`${rep.words ? `${rep.variable(spec.difference).name}:` : `${rep.variable(spec.difference).symbol} =`} ${fmt(spec.difference)}`}
                      </ChartText>
                    </>
                  ) : null}
                </Svg>
                {[a, b].map((id, i) => drag(id, i, left + shown[i]! * scale, ys[i]! + barH / 2))}
              </>
            );
          }

          const y = 40;
          const ends = shown.reduce<number[]>(
            (acc, v) => [...acc, (acc.length ? acc[acc.length - 1]! : 0) + v],
            [],
          );
          const x0 = (i: number) => left + (i === 0 ? 0 : ends[i - 1]!) * scale;
          const x1 = (i: number) => left + ends[i]! * scale;
          const fills = [c.chartHighlight, c.chartFill, c.chartSurface];
          // Names under the parts sit on one row unless one is wider than its part.
          const stagger = spec.parts.some(
            (id, i) => rep.tag(id).length * chart.tiny * 0.6 > x1(i) - x0(i) - 4,
          );
          return (
            <>
              <Svg width={w} height={128}>
                <Path
                  d={bracket(left, left + span * scale, 28, -1)}
                  stroke={c.chartInk}
                  fill="none"
                />
                <ChartText
                  x={left + (span * scale) / 2}
                  y={14}
                  fontSize={chart.label}
                  textAnchor="middle"
                >
                  {typeof spec.total === 'object'
                    ? `${spec.total.label}: ${formatNumber(spec.total.value)}`
                    : `${rep.tag(spec.total)}: ${rep.value(spec.total)}`}
                </ChartText>
                {spec.parts.map((id, i) => (
                  <Rect
                    key={id}
                    x={x0(i)}
                    y={y}
                    width={Math.max(2, x1(i) - x0(i))}
                    height={barH}
                    fill={fills[i % fills.length]}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    opacity={rep.known(id) ? 1 : 0.35}
                  />
                ))}
                {spec.parts.map((id, i) => (
                  <ChartText
                    key={`v${id}`}
                    x={(x0(i) + x1(i)) / 2}
                    y={y + barH / 2 + 5}
                    fontSize={chart.label}
                    textAnchor="middle"
                    // Parts take turns with the fills: every part on the highlight gets light text.
                    fill={i % fills.length === 0 ? c.onChartHighlight : c.chartInk}
                  >
                    {/* A narrow part shows only its value, clear of the drag handles; the name
                        with its letter is under the bar. */}
                    {x1(i) - x0(i) < chart.handle + 12
                      ? ''
                      : rep.label(id).length * chart.small * 0.55 > x1(i) - x0(i) - chart.handle - 4
                        ? rep.value(id)
                        : rep.label(id)}
                  </ChartText>
                ))}
                {spec.parts.map((id, i) => (
                  <ChartText
                    key={`n${id}`}
                    x={(x0(i) + x1(i)) / 2}
                    // Names take two rows only when a name is wider than its part.
                    y={y + barH + 18 + (stagger ? (i % 2) * 14 : 0)}
                    fontSize={chart.tiny}
                    textAnchor="middle"
                    fill={c.chartMuted}
                  >
                    {rep.tag(id)}
                  </ChartText>
                ))}
                {!dashed && spec.groups ? (
                  <ChartText
                    x={left + (span * scale) / 2}
                    y={y - 10}
                    fontSize={chart.small}
                    textAnchor="middle"
                  >
                    {`${formatNumber(groups)} equal groups`}
                  </ChartText>
                ) : null}
                {Array.from({ length: dashed ? Math.max(0, groups - 1) : 0 }, (_, k) => {
                  // Across the whole bar, or across the one part the groups make up.
                  const gi = spec.groupsPart ? spec.parts.indexOf(spec.groupsPart) : -1;
                  const [g0, g1] = gi >= 0 ? [x0(gi), x1(gi)] : [left, left + span * scale];
                  const gx = g0 + ((k + 1) * (g1 - g0)) / groups;
                  return (
                    <Line
                      key={`g${k}`}
                      x1={gx}
                      y1={y - 6}
                      x2={gx}
                      y2={y + barH + 6}
                      stroke={c.chartInk}
                      strokeDasharray={chart.dash}
                    />
                  );
                })}
                <Line x1={left} y1={y} x2={left} y2={y + barH} stroke={c.chartInk} />
              </Svg>
              {spec.parts.map((id, i) => drag(id, i, x1(i), y + barH / 2))}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </>
  );
}
