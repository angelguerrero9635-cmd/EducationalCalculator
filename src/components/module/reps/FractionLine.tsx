import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, fitLabel, useFrozen, useRep, Caption } from './common';
import { mixedParts, mixedText } from './exact';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'fractionLine' }>;

/** Decimal places for a denominator of 10 or 100. */
const places = (b: number) => (b <= 10 ? 1 : 2);
/** A decimal with its places, and a 0 before the point: 0.35. */
const decimal = (x: number, p: number) => x.toFixed(p);

/**
 * The second line of a two-line comparison: its own marks and point, and a dashed line up to
 * the first point when the two are equal (2/4 and 1/2 land on the same spot).
 */
function SecondLine({
  spec,
  rep,
  c,
  W,
  px,
  y,
  first,
  firstY,
}: {
  spec: NonNullable<Spec['second']>;
  rep: ReturnType<typeof useRep>;
  c: ReturnType<typeof usePalette>;
  W: number;
  px: (x: number) => number;
  y: number;
  first: number | undefined;
  firstY: number;
}) {
  const known = rep.known(spec.numerator) && rep.known(spec.denominator);
  const b = Math.max(1, Math.round(rep.shown(spec.denominator)));
  const a = Math.max(0, Math.round(rep.shown(spec.numerator)));
  const same = known && first !== undefined && Math.abs(a / b - first) < 1e-9;
  return (
    <G>
      <Line
        x1={px(0) - 6}
        y1={y}
        x2={px(W) + 6}
        y2={y}
        stroke={c.chartInk}
        strokeWidth={chart.stroke}
      />
      {Array.from({ length: W * b + 1 }, (_, i) => (
        <Line
          key={`s${i}`}
          x1={px(i / b)}
          y1={y - (i % b === 0 ? 10 : 6)}
          x2={px(i / b)}
          y2={y + (i % b === 0 ? 10 : 6)}
          stroke={c.chartInk}
          strokeWidth={i % b === 0 ? chart.stroke : chart.strokeLight}
        />
      ))}
      {Array.from({ length: W + 1 }, (_, i) => (
        <ChartText
          key={`sw${i}`}
          x={px(i)}
          y={y + 26}
          fontSize={chart.value}
          fontWeight="700"
          textAnchor="middle"
        >
          {String(i)}
        </ChartText>
      ))}
      {same ? (
        <Line
          x1={px(first!)}
          y1={firstY}
          x2={px(first!)}
          y2={y}
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeLight}
          strokeDasharray={chart.dash}
        />
      ) : null}
      {known ? (
        <G>
          <Circle cx={px(a / b)} cy={y} r={6} fill={c.chartInk} />
          <ChartText
            x={px(a / b)}
            y={y - 14}
            fontSize={chart.emphasis}
            fontWeight="700"
            textAnchor="middle"
          >
            {`${a}/${b}`}
          </ChartText>
        </G>
      ) : null}
    </G>
  );
}

/** The jumps 0..a cut into runs by `runOf`: [from, to) of each run with at least one jump. */
function runLabels(a: number, runOf: (i: number) => number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < a; i++) {
    const last = out[out.length - 1];
    if (last && runOf(i) === runOf(last[0])) last[1] = i + 1;
    else out.push([i, i + 1]);
  }
  return out;
}

/** Jumps from `from` to `to` parts: tenths first when a whole is 100 parts, then single parts. */
function startJumps(from: number, to: number, b: number): [number, number][] {
  const big = b === 100 ? 10 : 1;
  const out: [number, number][] = [];
  let i = from;
  while (i + big <= to) out.push([i, (i += big)]);
  while (i < to) out.push([i, (i += 1)]);
  return out;
}

/**
 * Fractions on a number line: each whole from 0 to `wholes` cut into equal parts, one jump per
 * part from 0 to the fraction. Drag the point to another mark.
 */
export function FractionLine({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const b = Math.max(1, Math.round(rep.shown(spec.denominator)));
  const raw = Math.max(0, Math.round(rep.shown(spec.numerator)));
  // Enough wholes for the fraction (at least `wholes`), so 17/5 is drawn where it is.
  const second = spec.second
    ? Math.ceil(
        Math.max(0, Math.round(rep.shown(spec.second.numerator))) /
          Math.max(1, Math.round(rep.shown(spec.second.denominator))),
      )
    : 0;
  const known = rep.known(spec.numerator) && rep.known(spec.denominator);
  // Mixed-number jumps: from `from` to the numerator, on only the wholes around the two.
  const hasFrom = spec.from !== undefined;
  // The start is drawn once it and the parts in a whole are typed; the jump once both points are.
  const fromShown = hasFrom && rep.known(spec.denominator) && rep.known(spec.from!);
  const fromKnown = fromShown && known;
  const fromN = hasFrom ? Math.max(0, Math.round(rep.shown(spec.from!))) : 0;
  // While one point is "?", the line shows the wholes around the other alone.
  const ends = [...(fromShown ? [fromN] : []), ...(known ? [raw] : [])];
  const windowLo = Math.floor(Math.min(...ends) / b);
  const windowHi = Math.max(Math.ceil(Math.max(...ends) / b), windowLo + 1);
  // A "?" denominator draws no parts: the line keeps its usual wholes, not raw ÷ 1.
  // The number of wholes (and a mixed-number line's first whole) holds still while the point
  // is dragged (the line doesn't rescale under the finger).
  // A line from another whole (1 to 3): the typed start, else the whole below the point.
  const hasStart = spec.startWhole !== undefined && !hasFrom;
  const startW =
    typeof spec.startWhole === 'number'
      ? spec.startWhole
      : spec.startWhole !== undefined && rep.known(spec.startWhole)
        ? Math.max(0, Math.round(rep.shown(spec.startWhole)))
        : known
          ? Math.floor(raw / b)
          : 0;
  const startLo = known ? Math.min(startW, Math.floor(raw / b)) : startW;
  const fit = useFrozen(
    hasFrom && ends.length
      ? [windowLo, Math.max(spec.wholes, windowHi - windowLo)]
      : hasStart
        ? [
            startLo,
            Math.max(1, startW + spec.wholes, known ? Math.ceil(raw / b) : 0, second) - startLo,
          ]
        : [0, Math.max(spec.wholes, known ? Math.ceil(raw / b) : 0, second)],
  );
  const [lo, W] = fit.value as [number, number];
  const scale = useRef(1);
  const a = raw;
  const wholes = Math.floor(a / b);
  const left = a - wholes * b;
  // Where each run of jumps ends: the addends' tops in turn, or every `each` jumps for copies.
  const partVals = (spec.parts ?? []).map((id) => Math.max(0, Math.round(rep.shown(id))));
  const copies = spec.copies ? Math.max(1, Math.round(rep.shown(spec.copies))) : 0;
  const each = copies > 0 && a % copies === 0 ? a / copies : 0;
  const runOf = (i: number) => {
    if (spec.parts && spec.parts.every(rep.known)) {
      let end = 0;
      for (let k = 0; k < partVals.length; k++) {
        end += partVals[k]!;
        if (i < end) return k;
      }
      return partVals.length;
    }
    return each > 0 ? Math.floor(i / each) : 0;
  };
  // The point moves the last addend (the others stay), else the numerator itself.
  const dragVar =
    spec.parts && spec.parts.every(rep.known) ? spec.parts[spec.parts.length - 1]! : spec.numerator;
  const dragOthers =
    dragVar === spec.numerator ? 0 : partVals.slice(0, -1).reduce((x, y) => x + y, 0);
  // The jump from `from` to the point: whole numbers first, then the parts left (18 1/4 − 2 3/4
  // is back 2 to 16 1/4, then back 3/4 to 15 2/4).
  const change = raw - fromN;
  const dir = change < 0 ? -1 : 1;
  const wholeJump = Math.floor(Math.abs(change) / b);
  const partJump = Math.abs(change) - wholeJump * b;
  const hops = fromKnown
    ? [
        ...(wholeJump > 0 ? [{ from: fromN, to: fromN + dir * wholeJump * b }] : []),
        ...(partJump > 0 ? [{ from: fromN + dir * wholeJump * b, to: raw }] : []),
      ]
    : [];
  const unitName = (n: number) =>
    spec.unit ? (n === 1 ? spec.unit.one : spec.unit.many) : n === 1 ? 'whole' : 'wholes';
  const mixedCaption = () => {
    const op = dir < 0 ? '−' : '+';
    const way = dir < 0 ? 'back' : 'on';
    const moves = [
      ...(wholeJump > 0 ? [`${wholeJump} ${unitName(wholeJump)}`] : []),
      ...(partJump > 0 ? [`${partJump}/${b}${spec.unit ? ` ${spec.unit.one}` : ''}`] : []),
    ];
    const simpler = mixedText(raw / b);
    return (
      `${mixedParts(fromN, b)} ${op} ${mixedParts(Math.abs(change), b)} = ${mixedParts(raw, b)}.` +
      (moves.length ? ` Jump ${way} ${moves.join(`, then ${way} `)}.` : '') +
      (simpler !== mixedParts(raw, b) ? ` ${mixedParts(raw, b)} = ${simpler}.` : '')
    );
  };

  return (
    <View>
      <Canvas aspect={spec.second ? 0.74 : 0.5}>
        {({ w, h: full }) => {
          const h = spec.second ? full * (0.5 / 0.74) : full;
          const pad = 22;
          const unit = (w - 2 * pad) / W;
          const px = (x: number) => pad + (x - lo) * unit;
          const y = h * 0.66;
          const step = unit / b;
          const lift = Math.min(h * 0.38, Math.max(10, step * 0.55));
          // Label every mark when there's room; otherwise only whole numbers.
          const labelAll = known && step >= 30 && !hasFrom;
          // The two points of a mixed-number jump, named under the line (apart when close).
          const close = Math.abs(px(raw / b) - px(fromN / b)) < 64;
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
                {Array.from({ length: W * b + 1 }, (_, k) => {
                  const i = lo * b + k;
                  const whole = i % b === 0;
                  return (
                    <Line
                      key={`t${i}`}
                      x1={px(i / b)}
                      y1={y - (whole ? 10 : 6)}
                      x2={px(i / b)}
                      y2={y + (whole ? 10 : 6)}
                      stroke={c.chartInk}
                      strokeWidth={whole ? chart.stroke : chart.strokeLight}
                    />
                  );
                })}
                {Array.from({ length: W + 1 }, (_, i) => lo + i)
                  // Long lines label every 2nd or 5th whole so the numbers don't touch.
                  .filter(
                    (i) => (i - lo) % (unit >= 26 ? 1 : unit >= 13 ? 2 : 5) === 0 || i === lo + W,
                  )
                  .map((i) => (
                    <ChartText
                      key={`w${i}`}
                      x={px(i)}
                      y={y + 28}
                      fontSize={chart.value}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {String(i)}
                    </ChartText>
                  ))}
                {spec.decimal && b % 10 === 0
                  ? Array.from({ length: W * 10 + 1 }, (_, k) => lo * 10 + k)
                      .filter((i) => i % 10 !== 0)
                      .map((i) => (
                        <G key={`d${i}`}>
                          <Line
                            x1={px(i / 10)}
                            y1={y - 9}
                            x2={px(i / 10)}
                            y2={y + 9}
                            stroke={c.chartInk}
                            strokeWidth={chart.strokeLight}
                          />
                          {/* From another whole, every other tenth when they'd touch (1.2, 1.4 …). */}
                          {!hasStart || unit / 10 >= 24 || i % 2 === 0 ? (
                            <ChartText
                              x={px(i / 10)}
                              y={y + 24}
                              fontSize={chart.tiny}
                              fill={c.chartMuted}
                              textAnchor="middle"
                            >
                              {decimal(i / 10, 1)}
                            </ChartText>
                          ) : null}
                        </G>
                      ))
                  : null}
                {labelAll && !spec.decimal
                  ? Array.from({ length: W * b + 1 }, (_, i) => (
                      <ChartText
                        key={`f${i}`}
                        x={px(i / b)}
                        y={y + 44}
                        fontSize={chart.tiny}
                        fill={c.chartMuted}
                        textAnchor="middle"
                      >
                        {`${i}/${b}`}
                      </ChartText>
                    ))
                  : null}
                {/* Mixed-number jumps: one arc for the wholes, one for the parts left. */}
                {hops.map((hop, k) => {
                  const [x0, x1] = [px(hop.from / b), px(hop.to / b)];
                  const hl = Math.min(h * 0.3, 12 + Math.abs(x1 - x0) * 0.2);
                  const n = Math.abs(hop.to - hop.from);
                  const text = `${dir < 0 ? '−' : '+'}${k === 0 && wholeJump > 0 ? n / b : `${n}/${b}`}`;
                  return (
                    <G key={`h${k}`}>
                      <Path
                        d={`M ${x0} ${y} Q ${(x0 + x1) / 2} ${y - 2 * hl} ${x1} ${y}`}
                        stroke={k === 0 ? c.chartHighlight : c.chartInk}
                        strokeWidth={chart.stroke}
                        fill="none"
                      />
                      <ChartText
                        {...fitLabel((x0 + x1) / 2, text, chart.value, w)}
                        y={y - hl - 8}
                        fontSize={chart.value}
                        fontWeight="700"
                      >
                        {text}
                      </ChartText>
                    </G>
                  );
                })}
                {fromShown ? (
                  <>
                    <Circle cx={px(fromN / b)} cy={y} r={5} fill={c.chartMuted} />
                    <ChartText
                      {...fitLabel(px(fromN / b), mixedParts(fromN, b), chart.label, w)}
                      y={y + 48}
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    >
                      {mixedParts(fromN, b)}
                    </ChartText>
                  </>
                ) : null}
                {known && !hasFrom && !hasStart
                  ? Array.from({ length: a }, (_, i) => (
                      <Path
                        key={`j${i}`}
                        d={`M ${px(i / b)} ${y} Q ${px((i + 0.5) / b)} ${y - 2 * lift} ${px((i + 1) / b)} ${y}`}
                        stroke={runOf(i) % 2 === 0 ? c.chartHighlight : c.chartInk}
                        strokeWidth={runOf(i) % 2 === 0 ? chart.strokeLight : chart.stroke}
                        fill="none"
                      />
                    ))
                  : null}
                {/* From another whole, the jumps count on from the whole before the point: hundredths
                    go by tenths first, then hundredths (7 to 7.8, then 7.84). */}
                {known && hasStart
                  ? startJumps(wholes * b, a, b).map(([i0, i1], k) => {
                      const hl = Math.min(h * 0.38, Math.max(10, (i1 - i0) * step * 0.55));
                      return (
                        <Path
                          key={`j${k}`}
                          d={`M ${px(i0 / b)} ${y} Q ${px((i0 + i1) / 2 / b)} ${y - 2 * hl} ${px(i1 / b)} ${y}`}
                          stroke={b === 100 && i1 - i0 === 1 ? c.chartInk : c.chartHighlight}
                          strokeWidth={chart.strokeLight}
                          fill="none"
                        />
                      );
                    })
                  : null}
                {/* One label per run: "3/8" over its jumps, so the addends (or copies) are seen. */}
                {known && (spec.parts || each > 0) && a > 0
                  ? runLabels(a, runOf).map(([from, to], k) => (
                      <ChartText
                        key={`p${k}`}
                        x={px((from + to) / 2 / b)}
                        y={y - 2 * lift * 0.55 - 4}
                        fontSize={chart.tiny}
                        fill={c.chartMuted}
                        textAnchor="middle"
                      >
                        {`${to - from}/${b}`}
                      </ChartText>
                    ))
                  : null}
                {known ? (
                  <>
                    <Circle cx={px(a / b)} cy={y} r={6} fill={c.chartHighlight} />
                    <ChartText
                      x={Math.min(w - 24, Math.max(24, px(a / b)))}
                      y={hasFrom ? y + (close ? 64 : 48) : y - 2 * lift - 10}
                      fontSize={chart.emphasis}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {spec.decimal
                        ? decimal(a / b, places(b))
                        : hasFrom
                          ? mixedParts(a, b)
                          : `${a}/${b}`}
                    </ChartText>
                  </>
                ) : null}
                {spec.second ? (
                  <SecondLine
                    spec={spec.second}
                    rep={rep}
                    c={c}
                    W={W}
                    px={px}
                    y={y + (full - h) + 4}
                    first={known ? a / b : undefined}
                    firstY={y}
                  />
                ) : null}
              </Svg>
              {known ? (
                <DragHandle
                  testID="drag-fraction"
                  x={px(a / b)}
                  y={y}
                  label={rep.variable(dragVar).name}
                  onStart={() => {
                    start.current = a;
                    scale.current = step;
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx) => {
                    const pins = rep.pin([
                      spec.denominator,
                      ...(spec.from ? [spec.from] : []),
                      ...(spec.parts ?? []).filter((id) => id !== dragVar),
                    ]);
                    const at = Math.min(
                      (lo + W) * b,
                      Math.max(lo * b, start.current + dx / scale.current),
                    );
                    const value = rep.snapTo(dragVar, at - dragOthers);
                    // A page whose fraction must be a whole number of wholes (a = w × b) takes
                    // the nearest whole mark instead, so the denominator is never let go.
                    const wholeMark = rep.snapTo(dragVar, Math.round(at / b) * b - dragOthers);
                    const tries = [value, wholeMark].map((v) => ({ ...pins, [dragVar]: v }));
                    calc.set(tries.find((u) => calc.fits(u)) ?? tries[0]!, rep.slide(dragVar));
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {fromKnown
          ? mixedCaption()
          : known && spec.decimal
            ? `${decimal(a / b, places(b))}: ${a} ${b === 10 ? 'tenths' : 'hundredths'} from 0` +
              (hasStart && wholes > 0 && left > 0
                ? `, ${left} ${b === 10 ? (left === 1 ? 'tenth' : 'tenths') : left === 1 ? 'hundredth' : 'hundredths'} past ${wholes}.`
                : '.')
            : known
              ? `${a}/${b}: ${a} ${a === 1 ? 'jump' : 'jumps'} of 1/${b} from 0.` +
                (spec.unit
                  ? ` That is ${wholes > 0 ? `${wholes} ${wholes === 1 ? spec.unit.one : spec.unit.many}` : ''}${wholes > 0 && left > 0 ? ' and ' : ''}${left > 0 || wholes === 0 ? `${left}/${b} ${spec.unit.one}` : ''}.`
                  : wholes > 0
                    ? left > 0
                      ? ` That is ${wholes} ${wholes === 1 ? 'whole' : 'wholes'} and ${left}/${b} more.`
                      : ` That is exactly ${wholes}: ${a}/${b} = ${wholes}.`
                    : '')
              : 'Type the parts counted and the parts in one whole.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          {
            var: spec.denominator,
            // Halves and quarters of an inch step 2 ↔ 4; plain fractions step by 1.
            steps: [rep.variable(spec.denominator).step ?? 1],
            pin: [spec.numerator],
          },
          { var: spec.numerator, steps: [1], pin: [spec.denominator] },
          ...(typeof spec.startWhole === 'string'
            ? [{ var: spec.startWhole, steps: [1], pin: [spec.numerator, spec.denominator] }]
            : []),
        ]}
      />
    </View>
  );
}
