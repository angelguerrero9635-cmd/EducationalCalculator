import { useRef } from 'react';
import Svg, { Defs, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { mixedValue } from './exact';
import { LitRect, TopLight, usePaintIds } from './paint';
import { Canvas, ChartText, DragHandle, fitLabel, useFrozen, useRep, Caption } from './common';

type Spec = Exclude<
  Extract<Representation, { kind: 'tape' }>,
  { ratio: unknown } | { equation: unknown }
>;

/** A scale just past `span`: 10% more, rounded up to a tenth of its power of ten (at least 10). */
export const fitScale = (span: number) => {
  const x = Math.max(10, span * 1.1);
  const step = 10 ** Math.floor(Math.log10(x)) / 10;
  return Math.ceil(x / step) * step;
};

/** A bracket under (or over) [x1, x2] at height y, opening toward the bar. */
export const bracket = (x1: number, x2: number, y: number, dir: 1 | -1) => {
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
  const paint = usePaintIds('light');
  const rep = useRep(calc);
  const start = useRef(0);
  const compare = 'compare' in spec;
  const ids = compare ? spec.compare : spec.parts;
  const shown = ids.map((id) => (rep.known(id) ? Math.max(0, rep.shown(id)) : 0));
  // A fixed whole (the story sets it) is drawn at its size even while a part is unknown.
  const fixed = !compare && typeof spec.total === 'object' ? spec.total : undefined;
  // A "?" part still gets a box to fill: as wide as the known parts on average (or a quarter
  // of the scale when none is known), faded, with "?" in it.
  const knownParts = shown.filter((_, i) => rep.known(ids[i]!));
  const placeholder = knownParts.length
    ? Math.max(1, knownParts.reduce((a, b) => a + b, 0) / knownParts.length)
    : 1;
  const drawn =
    compare || fixed ? shown : shown.map((x, i) => (rep.known(ids[i]!) ? x : placeholder));
  const sum = drawn.reduce((a, b) => a + b, 0);
  const span = compare ? Math.max(...shown) : fixed ? Math.max(fixed.value, sum) : sum;
  // Round the scale up a little past the values (100 → 110, 72 → 80), so bars fill the width.
  const fit = useFrozen(fitScale(span));
  // `mixed`: a share or quotient reads as a mixed number (33 1/3, 2 3/8 L), not a decimal.
  const value = (id: string) => (spec.mixed ? mixedValue(rep, id) : rep.value(id));
  const label = (id: string) =>
    !spec.mixed
      ? rep.label(id)
      : rep.words
        ? value(id)
        : `${rep.variable(id).symbol} = ${value(id)}`;
  const named = (id: string) =>
    !spec.mixed
      ? rep.named(id)
      : rep.words
        ? `${rep.variable(id).name}: ${value(id)}`
        : `${rep.variable(id).symbol} = ${value(id)}`;
  const fmt = (id: string) =>
    !rep.known(id)
      ? '?'
      : spec.mixed
        ? mixedValue(rep, id, false)
        : formatNumber(rep.shown(id), rep.variable(id));
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
                calc.set(
                  {
                    // Moving the line between two parts: the next part gives way and the total
                    // stays (price up, money left down). The last part grows the total.
                    ...rep.pin(
                      ids
                        .filter((v) => v !== id && v !== ids[i + 1])
                        .concat(
                          ids[i + 1] && !compare && typeof spec.total === 'string'
                            ? [spec.total]
                            : [],
                        ),
                    ),
                    [id]: rep.snapTo(id, (start.current + dx / scale) * rep.factor(id)),
                  },
                  rep.slide(id),
                )
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
                  <Defs>
                    <TopLight id={paint.light} />
                  </Defs>
                  {[a, b].map((id, i) => (
                    <LitRect
                      lightId={paint.light}
                      rx={3}
                      key={id}
                      x={left}
                      y={ys[i]}
                      width={Math.max(2, shown[i]! * scale)}
                      height={barH}
                      fill={i === 0 ? c.chartHighlight : c.chartSecond}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                      opacity={rep.known(id) ? 1 : 0.35}
                    />
                  ))}
                  {[a, b].map((id, i) => {
                    // A label wider than its bar (less the handle over its end) sits to the
                    // right of the handle instead of being cut by it.
                    const text = `${name(id)}: ${label(id)}`;
                    const barW = shown[i]! * scale;
                    const outside =
                      text.length * chart.small * 0.58 > barW - chart.handle / 2 - 8 &&
                      left + barW + chart.handle + text.length * chart.small * 0.58 < w;
                    return (
                      <ChartText
                        key={`t${id}`}
                        x={outside ? left + barW + chart.handle / 2 + 6 : left + 6}
                        y={ys[i]! + barH / 2 + 5}
                        fontSize={chart.small}
                        fill={!outside && i === 0 ? c.onChartHighlight : c.chartInk}
                      >
                        {text}
                      </ChartText>
                    );
                  })}
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
          const ends = drawn.reduce<number[]>(
            (acc, v) => [...acc, (acc.length ? acc[acc.length - 1]! : 0) + v],
            [],
          );
          const x0 = (i: number) => left + (i === 0 ? 0 : ends[i - 1]!) * scale;
          const x1 = (i: number) => left + ends[i]! * scale;
          const fills = [c.chartHighlight, c.chartSecond, c.life];
          // Names under the parts sit on one row unless one is wider than its part.
          // A part too narrow for its value inside (under a handle) names it with its value below.
          const narrow = (i: number) => x1(i) - x0(i) < chart.handle + 12;
          const under = (id: string, i: number) => (narrow(i) ? named(id) : rep.tag(id));
          const totalText =
            typeof spec.total === 'object'
              ? `${spec.total.label}: ${formatNumber(spec.total.value)}`
              : `${rep.tag(spec.total)}: ${value(spec.total)}`;
          const stagger = spec.parts.some(
            (id, i) => under(id, i).length * chart.tiny * 0.6 > x1(i) - x0(i) - 4,
          );
          return (
            <>
              <Svg width={w} height={128}>
                <Defs>
                  <TopLight id={paint.light} />
                </Defs>
                <Path
                  d={bracket(left, left + span * scale, 28, -1)}
                  stroke={c.chartInk}
                  fill="none"
                />
                <ChartText
                  {...fitLabel(left + (span * scale) / 2, totalText, chart.label, w)}
                  y={14}
                  fontSize={chart.label}
                >
                  {totalText}
                </ChartText>
                {spec.parts.map((id, i) => (
                  <LitRect
                    lightId={paint.light}
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
                    fill={i % fills.length === 0 ? c.onChartHighlight : c.coinInk}
                  >
                    {/* A narrow part shows only its value, clear of the drag handles; the name
                        with its letter is under the bar. */}
                    {x1(i) - x0(i) < chart.handle + 12
                      ? ''
                      : label(id).length * chart.small * 0.55 > x1(i) - x0(i) - chart.handle - 4
                        ? value(id)
                        : label(id)}
                  </ChartText>
                ))}
                {spec.parts.map((id, i) => (
                  <ChartText
                    key={`n${id}`}
                    // The last name, near the bar's end, is right-aligned so it stays on screen;
                    // a centered name is kept inside the canvas.
                    {...fitLabel(
                      i === spec.parts.length - 1 && narrow(i)
                        ? x1(i)
                        : i === 0 && narrow(i)
                          ? x0(i)
                          : (x0(i) + x1(i)) / 2,
                      under(id, i),
                      chart.tiny,
                      w,
                      i === spec.parts.length - 1 && narrow(i)
                        ? 'end'
                        : i === 0 && narrow(i)
                          ? 'start'
                          : 'middle',
                    )}
                    // Names take two rows only when a name is wider than its part.
                    y={y + barH + 18 + (stagger ? (i % 2) * 14 : 0)}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                  >
                    {under(id, i)}
                  </ChartText>
                ))}
                {/* The groups count sits under the part names: above the bar it would cross the
                    total's bracket. */}
                {!dashed && spec.groups ? (
                  <ChartText
                    x={left + (span * scale) / 2}
                    y={y + barH + 18 + (stagger ? 28 : 14)}
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
              {/* With a fixed whole, the last part's end is the whole's end: no handle there. */}
              {spec.parts
                .slice(0, fixed ? -1 : undefined)
                .map((id, i) => drag(id, i, x1(i), y + barH / 2))}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </>
  );
}
