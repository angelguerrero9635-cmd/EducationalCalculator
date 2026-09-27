import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Canvas,
  ChartText,
  DragHandle,
  fitLabel,
  niceCeil,
  useFrozen,
  useRep,
  Caption,
} from './common';
import { quotientText } from './exact';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'skipCount' }>;

/**
 * A number line from the start number (0 unless `start` is set) with equal jumps of `step`.
 * Drag the end to add or remove jumps. With `group`, past 30 jumps the arcs are tens of jumps
 * (hundreds past 300), then the single jumps left.
 */
export function SkipCount({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  // A number keeps the jump size fixed (1 meter = 100 cm).
  const stepVar = typeof spec.step === 'string' ? spec.step : undefined;
  // Whole jumps, or decimal ones (2.5, 0.3) kept to their tenths and hundredths.
  const fix = (x: number) => Number(x.toFixed(6));
  const raw = stepVar ? rep.shown(stepVar) : (spec.step as number);
  const s = raw >= 1 ? fix(raw) : Math.max(0.01, fix(raw));
  // A number keeps the count fixed too (4 quarters in a minute): nothing to drag or type.
  const countVar = typeof spec.count === 'string' ? spec.count : undefined;
  // How many jumps fit in the total (a quotient): 100 ÷ 3 is 33 jumps and 1/3 of a jump.
  const quotient =
    !countVar && spec.count === undefined && !spec.second && rep.known(spec.total)
      ? rep.shown(spec.total) / (stepVar ? rep.shown(stepVar) : (spec.step as number))
      : undefined;
  const part =
    quotient !== undefined &&
    Number.isFinite(quotient) &&
    Math.abs(quotient - Math.round(quotient)) > 1e-9
      ? quotient - Math.floor(quotient)
      : 0;
  const k = Math.max(
    0,
    part > 0
      ? Math.floor(quotient!)
      : Math.round(
          countVar
            ? rep.shown(countVar)
            : spec.count === undefined
              ? rep.shown(spec.total) / (stepVar ? rep.shown(stepVar) : (spec.step as number))
              : (spec.count as number),
        ),
  );
  const from = spec.start && rep.known(spec.start) ? fix(rep.shown(spec.start)) : 0;
  // A second row (the other number's multiples) runs to the total, the first shared landing.
  const second = spec.second;
  const s2 = second ? Math.max(0.01, fix(rep.shown(second.step))) : 1;
  const end = second ? rep.shown(spec.total) : 0;
  const k2 = second ? Math.max(0, Math.min(40, Math.round(end / s2))) : 0;
  // Room for 10 jumps, so the 11 labeled ticks fall where the jumps land (0, 4, 8, … for 4s).
  const fit = useFrozen(k + (part > 0 ? 1 : 0) <= 10 ? s * 10 : niceCeil(s * (k + part)));
  // Counting back: jumps go left from the start, so the line ends at the start.
  const dir = spec.back ? -1 : 1;
  // `group`: past 30 jumps, one arc per ten jumps (per hundred past 300), then the single jumps.
  const grouped = !!spec.group && !second && k > 30;
  const runs: { size: number; n: number; at: number }[] = [];
  if (grouped) {
    const hundreds = k > 300 ? Math.floor(k / 100) : 0;
    const tens = Math.floor((k - 100 * hundreds) / 10);
    const ones = k - 100 * hundreds - 10 * tens;
    let at = 0;
    for (const [size, n] of [
      [100, hundreds],
      [10, tens],
      [1, ones],
    ] as const) {
      if (n > 0) runs.push({ size, n, at });
      at += size * n;
    }
  }
  const jumpWord = (n: number) => (n === 1 ? 'jump' : 'jumps');
  const runName = (r: { size: number; n: number }) =>
    r.size === 1 ? `${r.n} ${jumpWord(r.n)}` : `${r.n} × ${r.size} jumps`;

  /** Where each grouped arc lands, from the start: 0, 2, 4, …, 20, 20.2, … 21. */
  const landings = () => {
    const at = [0];
    for (const r of runs) for (let i = 1; i <= r.n; i++) at.push(r.at + i * r.size);
    const text = (j: number) => formatNumber(fix(from + dir * j * s));
    return at.length <= 12
      ? at.map(text).join(', ')
      : `${at.slice(0, 11).map(text).join(', ')}, …, ${text(at[at.length - 1]!)}`;
  };

  /** One arc of a run, in px at canvas width w (to scale), and how high it rises. */
  const arcOf = (size: number, w: number) => {
    const aw = (size * s * (w - 48)) / fit.value;
    const cap = size === 100 ? 44 : size === 10 ? 30 : 10;
    return { aw, lift: Math.min(cap, Math.max(size === 1 ? 2 : 8, aw * 0.6)) };
  };
  // The runs' names take a row each at the top; the "+2" over each arc, a row under them.
  const groupTop = 14 + runs.length * 15;
  const groupHeight = (w: number) =>
    groupTop + 14 + Math.max(10, ...runs.map((r) => arcOf(r.size, w).lift)) + 32;

  /**
   * The grouped arcs, to scale: higher for a hundred jumps, lower for ten, lowest for one. Each
   * run is named on its own row at the top (so the rows never collide), with a bracket over it;
   * the value an arc covers ("+2") sits over each arc of the biggest size when it fits. Arcs
   * under 4 px wide (the single jumps left after 990) are drawn as one dashed arc for the run.
   */
  const groupedJumps = (px: (x: number) => number, y: number, w: number) =>
    runs.map((r, row) => {
      const x0 = px(from + dir * r.at * s);
      const x1 = px(from + dir * (r.at + r.n * r.size) * s);
      const { aw, lift } = arcOf(r.size, w);
      const each = `+${formatNumber(fix(r.size * s))}`;
      const showEach = row === 0 && r.size > 1 && aw >= each.length * chart.tiny * 0.58 + 4;
      const ly = 12 + row * 15;
      const label = `${runName(r)}: +${formatNumber(fix(r.n * r.size * s))}`;
      const fitted = fitLabel((x0 + x1) / 2, label, chart.tiny, w);
      const [bl, br] = [Math.min(x0, x1), Math.max(x0, x1)];
      const narrow = aw < 4;
      const runLift = Math.min(10, Math.max(3, (br - bl) * 0.6));
      return (
        <G key={`run${r.size}`}>
          <Path
            d={`M ${bl} ${ly + 8} V ${ly + 4} H ${br} V ${ly + 8}`}
            stroke={c.chartMuted}
            strokeWidth={chart.strokeLight}
            fill="none"
          />
          <ChartText
            x={fitted.x}
            y={ly}
            fontSize={chart.tiny}
            fontWeight="700"
            textAnchor={fitted.textAnchor}
          >
            {label}
          </ChartText>
          {narrow ? (
            <G>
              <Path
                d={`M ${x0} ${y} Q ${(x0 + x1) / 2} ${y - 2 * runLift} ${x1} ${y}`}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dashFine}
                fill="none"
              />
              <Circle cx={x1} cy={y} r={3} fill={c.chartHighlight} />
            </G>
          ) : (
            Array.from({ length: r.n }, (_, i) => {
              const a = px(from + dir * (r.at + i * r.size) * s);
              const b = px(from + dir * (r.at + (i + 1) * r.size) * s);
              return (
                <G key={`g${r.size}-${i}`}>
                  <Path
                    d={`M ${a} ${y} Q ${(a + b) / 2} ${y - 2 * lift} ${b} ${y}`}
                    stroke={c.chartInk}
                    strokeWidth={r.size > 1 ? chart.stroke : chart.strokeLight}
                    fill="none"
                  />
                  <Circle
                    cx={b}
                    cy={y}
                    r={r.size > 1 ? 3.5 : Math.min(3, Math.max(1.5, aw / 2))}
                    fill={c.chartHighlight}
                  />
                  {showEach ? (
                    <ChartText
                      x={(a + b) / 2}
                      y={y - lift - 4}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {each}
                    </ChartText>
                  ) : null}
                </G>
              );
            })
          )}
        </G>
      );
    });

  return (
    <View>
      <Canvas aspect={grouped ? (w) => groupHeight(w) / w : 0.42}>
        {({ w, h }) => {
          const pad = 24;
          const max = fit.value;
          const lo = spec.back ? from - max : from;
          const px = (x: number) => pad + ((x - lo) / max) * (w - 2 * pad);
          const y = second ? h * 0.55 : grouped ? h - 32 : h * 0.72;
          const lift = Math.min(h * 0.4, Math.max(14, (px(s) - px(0)) * 0.6));
          const lift2 = Math.min(h * 0.12, Math.max(8, (px(s2) - px(0)) * 0.3));
          const labels = Array.from({ length: 11 }, (_, i) => fix(lo + (max / 10) * i));
          return (
            <>
              <Svg width={w} height={h}>
                <Line
                  x1={pad - 6}
                  y1={y}
                  x2={w - pad + 6}
                  y2={y}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {labels.map((x) => (
                  <Line
                    key={`t${x}`}
                    x1={px(x)}
                    y1={y - 5}
                    x2={px(x)}
                    y2={y + 5}
                    stroke={c.chartInk}
                  />
                ))}
                {labels
                  // Three-digit labels every 35 px overlap: show every other one.
                  .filter(
                    (x, i) => i % 2 === 0 || (w - 2 * pad) / 10 >= 4 + 7 * formatNumber(x).length,
                  )
                  .map((x) => (
                    <ChartText
                      key={`l${x}`}
                      x={px(x)}
                      y={y + 20}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {formatNumber(x)}
                    </ChartText>
                  ))}
                {grouped ? groupedJumps(px, y, w) : null}
                {Array.from({ length: grouped ? 0 : k }, (_, i) => (
                  <Path
                    key={`j${i}`}
                    d={`M ${px(from + dir * i * s)} ${y} Q ${(px(from + dir * i * s) + px(from + dir * (i + 1) * s)) / 2} ${y - 2 * lift} ${px(from + dir * (i + 1) * s)} ${y}`}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    fill="none"
                  />
                ))}
                {part > 0 ? (
                  // The last, part of a jump: dashed, landing on the total.
                  <Path
                    d={`M ${px(from + dir * k * s)} ${y} Q ${(px(from + dir * k * s) + px(from + dir * (k + part) * s)) / 2} ${y - 2 * lift * Math.max(0.4, part)} ${px(from + dir * (k + part) * s)} ${y}`}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dashFine}
                    fill="none"
                  />
                ) : null}
                {part > 0 ? (
                  <Circle
                    cx={px(from + dir * (k + part) * s)}
                    cy={y}
                    r={5}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                  />
                ) : null}
                {second
                  ? Array.from({ length: k2 }, (_, i) => (
                      <Path
                        key={`s${i}`}
                        d={`M ${px(i * s2)} ${y} Q ${(px(i * s2) + px((i + 1) * s2)) / 2} ${y + 2 * lift2} ${px((i + 1) * s2)} ${y}`}
                        stroke={c.chartMuted}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dashFine}
                        fill="none"
                      />
                    ))
                  : null}
                {second && rep.known(spec.total) ? (
                  <Circle
                    cx={px(end)}
                    cy={y}
                    r={11}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                  />
                ) : null}
                {Array.from({ length: grouped ? 0 : k }, (_, i) => (
                  <Circle
                    key={`d${i}`}
                    cx={px(from + dir * (i + 1) * s)}
                    cy={y}
                    r={4}
                    fill={c.chartHighlight}
                  />
                ))}
              </Svg>
              {countVar ? (
                <DragHandle
                  testID="drag-end"
                  x={px(from + dir * k * s)}
                  y={y}
                  label={rep.variable(countVar).name}
                  onStart={() => {
                    start.current = k;
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...rep.pin(stepVar ? [stepVar] : []),
                        [countVar]: rep.snapTo(
                          countVar,
                          start.current + (dir * dx) / (px(s) - px(0)),
                        ),
                      },
                      rep.slide(countVar),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      {second && rep.known(spec.total) ? (
        <Caption>
          {`Multiples of ${formatNumber(s)}: ${Array.from({ length: Math.min(k, 12) }, (_, i) => formatNumber(fix((i + 1) * s))).join(', ')}. Multiples of ${formatNumber(s2)}: ${Array.from({ length: Math.min(k2, 12) }, (_, i) => formatNumber(fix((i + 1) * s2))).join(', ')}. Both reach ${formatNumber(end)} first.`}
        </Caption>
      ) : null}
      {part > 0 ? (
        <Caption>
          {`${formatNumber(rep.shown(spec.total))} ÷ ${formatNumber(s)} = ${quotientText(quotient!)}: ${k} ${k === 1 ? 'jump' : 'jumps'} and ${quotientText(part)} of a jump.`}
        </Caption>
      ) : null}
      {grouped ? (
        <Caption>
          {`${k} jumps of ${formatNumber(s)}: ${runs
            .map((r) => `${runName(r)} (+${formatNumber(fix(r.n * r.size * s))})`)
            .join(', ')}. ${runs
            .map((r) => `${r.n * r.size} × ${formatNumber(s)}`)
            .join(' + ')} = ${formatNumber(fix(k * s))}.`}
        </Caption>
      ) : null}
      <Caption>
        {grouped
          ? landings()
          : k === 0
            ? formatNumber(from)
            : Array.from({ length: Math.min(k + 1, 12) }, (_, i) =>
                formatNumber(fix(from + dir * i * s)),
              ).join(', ') + (k + 1 > 12 ? ', …' : '')}
      </Caption>
      <Caption>
        {[
          ...(spec.start ? [spec.start] : []),
          ...(stepVar ? [stepVar] : []),
          ...(countVar ? [countVar] : []),
          spec.total,
        ]
          .map((id) => rep.named(id))
          .join(' · ')}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          ...(spec.start
            ? [
                {
                  var: spec.start,
                  steps: [1, 10, 100],
                  pin: [...(stepVar ? [stepVar] : []), ...(countVar ? [countVar] : [])],
                },
              ]
            : []),
          ...(stepVar
            ? [
                {
                  var: stepVar,
                  // A jump size that must be a multiple (of 5) steps by that multiple.
                  steps: rep.variable(stepVar).multipleOf
                    ? [rep.variable(stepVar).multipleOf!]
                    : [1, 5],
                  pin: [...(countVar ? [countVar] : []), ...(spec.start ? [spec.start] : [])],
                },
              ]
            : []),
          ...(countVar
            ? [
                {
                  var: countVar,
                  steps: [1],
                  pin: [...(stepVar ? [stepVar] : []), ...(spec.start ? [spec.start] : [])],
                },
              ]
            : []),
        ]}
      />
    </View>
  );
}
