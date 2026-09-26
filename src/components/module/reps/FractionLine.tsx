import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, useRep, Caption } from './common';
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
  const W = Math.max(spec.wholes, Math.ceil(raw / b), second);
  const a = raw;
  const known = rep.known(spec.numerator) && rep.known(spec.denominator);
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

  return (
    <View>
      <Canvas aspect={spec.second ? 0.74 : 0.5}>
        {({ w, h: full }) => {
          const h = spec.second ? full * (0.5 / 0.74) : full;
          const pad = 22;
          const unit = (w - 2 * pad) / W;
          const px = (x: number) => pad + x * unit;
          const y = h * 0.66;
          const step = unit / b;
          const lift = Math.min(h * 0.38, Math.max(10, step * 0.55));
          // Label every mark when there's room; otherwise only whole numbers.
          const labelAll = step >= 30;
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
                {Array.from({ length: W * b + 1 }, (_, i) => {
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
                {Array.from({ length: W + 1 }, (_, i) => i)
                  // Long lines label every 2nd or 5th whole so the numbers don't touch.
                  .filter((i) => i % (unit >= 26 ? 1 : unit >= 13 ? 2 : 5) === 0 || i === W)
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
                  ? Array.from({ length: W * 10 + 1 }, (_, i) => i)
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
                          <ChartText
                            x={px(i / 10)}
                            y={y + 24}
                            fontSize={chart.tiny}
                            fill={c.chartMuted}
                            textAnchor="middle"
                          >
                            {decimal(i / 10, 1)}
                          </ChartText>
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
                {known
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
                      y={y - 2 * lift - 10}
                      fontSize={chart.emphasis}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {spec.decimal ? decimal(a / b, places(b)) : `${a}/${b}`}
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
                  onStart={() => (start.current = a)}
                  onMove={(dx) =>
                    calc.set({
                      ...rep.pin([
                        spec.denominator,
                        ...(spec.parts ?? []).filter((id) => id !== dragVar),
                      ]),
                      [dragVar]: rep.snapTo(
                        dragVar,
                        Math.min(W * b, Math.max(0, start.current + dx / step)) - dragOthers,
                      ),
                    })
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {known && spec.decimal
          ? `${decimal(a / b, places(b))}: ${a} ${b === 10 ? 'tenths' : 'hundredths'} from 0.`
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
        ]}
      />
    </View>
  );
}
