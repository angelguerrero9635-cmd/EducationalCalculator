import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { SegmentedControl } from '@/components/SegmentedControl';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { lineStep, lineWindow } from './integerLineWindow';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'integerLine' }>;

/** The four signs, in the order a sign value counts them (1 is <, 2 is ≤, 3 is >, 4 is ≥). */
export const INEQUALITY_SIGNS = ['<', '≤', '>', '≥'] as const;
type Sign = (typeof INEQUALITY_SIGNS)[number];
const FLIP: Record<Sign, Sign> = { '<': '>', '≤': '≥', '>': '<', '≥': '≤' };
const WORDS: Record<Sign, string> = {
  '<': 'less than',
  '≤': 'less than or equal to',
  '>': 'greater than',
  '≥': 'greater than or equal to',
};

/**
 * An inequality on a number line: the bound (`value`) as an open circle (<, >: left out) or a
 * closed one (≤, ≥: included), a thick arrow over the solutions to the end of the line, and a
 * test point marked true or false. The bound and the test point can be dragged (their knobs sit
 * under the line so the circle stays visible); a sign value gets buttons to change it.
 */
export function InequalityLine({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const ineq = spec.inequality!;
  const signVar = (INEQUALITY_SIGNS as readonly string[]).includes(ineq.sign)
    ? undefined
    : ineq.sign;
  const written: Sign | undefined = signVar
    ? rep.known(signVar)
      ? INEQUALITY_SIGNS[Math.round(rep.shown(signVar)) - 1]
      : undefined
    : (ineq.sign as Sign);
  // Grade 7: the written px + q (sign) r, solved; dividing by a negative p flips the sign drawn.
  const two = ineq.twoStep;
  const twoKnown = !!two && [two.times, two.plus, two.total].every(rep.known);
  const tp = two && rep.known(two.times) ? rep.shown(two.times) : 1;
  const flips = !!two && tp < 0;
  const sign = written && flips ? FLIP[written] : written;
  const bound = rep.shown(spec.value);
  const boundKnown = rep.known(spec.value);
  const test = ineq.test && rep.known(ineq.test) ? rep.shown(ineq.test) : undefined;
  const unit = spec.unit ?? '';
  const num = (x: number) => `${formatNumber(x)}${unit ? ` ${unit}` : ''}`;
  const extent = useFrozen(lineWindow(spec, [bound, ...(test === undefined ? [] : [test])], 1));
  const [lo, hi] = extent.value;
  const step = lineStep(spec, lo, hi);
  const right = sign === '>' || sign === '≥';
  const closed = sign === '≤' || sign === '≥';
  const holds =
    sign === undefined || test === undefined || !boundKnown
      ? undefined
      : sign === '<'
        ? test < bound
        : sign === '≤'
          ? test <= bound
          : sign === '>'
            ? test > bound
            : test >= bound;
  // Grade 6 on: "x > 3". K–5 (no letters): the sign and bound alone, "> 3".
  const letter = rep.words ? '' : `${ineq.letter ?? 'x'} `;
  // The boundary's label reads "?" while the boundary is not known (never the example's number).
  const boundLabel = `${letter}${sign ?? '?'} ${boundKnown ? num(bound) : '?'}`;

  /** "3 × 5 + 2 = 17": the written side at the test number. */
  const twoTest = (t: number) => {
    const q = rep.shown(two!.plus);
    const lhs = tp * t + q;
    const ts = t < 0 ? `(${formatNumber(t)})` : formatNumber(t);
    return `${formatNumber(tp)} × ${ts} ${q < 0 ? '−' : '+'} ${formatNumber(Math.abs(q))} = ${formatNumber(lhs)}, and ${formatNumber(lhs)}`;
  };
  /** The written inequality and its two steps, each on its own line. */
  const twoStepLines = () => {
    const ws = written ?? '?';
    const x = ineq.letter ?? 'x';
    const v = (id: string) => (rep.known(id) ? formatNumber(rep.shown(id)) : '?');
    const P = !rep.known(two!.times) ? '?' : tp === 1 ? '' : tp === -1 ? '−' : formatNumber(tp);
    const q = rep.known(two!.plus) ? rep.shown(two!.plus) : undefined;
    const plus = q === undefined ? '+ ?' : q < 0 ? `− ${formatNumber(-q)}` : `+ ${formatNumber(q)}`;
    const lines = [`${P}${x} ${plus} ${ws} ${v(two!.total)}`];
    if (!twoKnown || !written) return `${lines[0]} · `;
    const rest = rep.shown(two!.total) - q!;
    if (q !== 0)
      lines.push(
        q! > 0
          ? `Take ${formatNumber(q!)} from both sides`
          : `Add ${formatNumber(-q!)} to both sides`,
        `${P}${x} ${written} ${formatNumber(rest)}`,
      );
    if (tp !== 1)
      lines.push(
        flips
          ? `Divide both sides by ${formatNumber(tp)}: the sign flips`
          : `Divide both sides by ${formatNumber(tp)}`,
      );
    return `${lines.join(' · ')} · `;
  };

  return (
    <View>
      {signVar ? (
        <View style={{ paddingHorizontal: space.md, marginBottom: space.sm }}>
          <SegmentedControl<Sign>
            segments={INEQUALITY_SIGNS.map((s) => ({
              value: s,
              label: two ? s : `${letter}${s}`,
            }))}
            value={(written ?? '') as Sign}
            onChange={(s) =>
              calc.set({
                ...rep.pin([spec.value, ...(ineq.test ? [ineq.test] : [])]),
                [signVar]: INEQUALITY_SIGNS.indexOf(s) + 1,
              })
            }
          />
        </View>
      ) : null}
      <Canvas aspect={(w) => 150 / w}>
        {({ w, h }) => {
          const pad = 28;
          const x = (v: number) => pad + ((v - lo) / (hi - lo)) * (w - 2 * pad);
          const perUnit = x(1) - x(0);
          const lineAt = h * 0.5;
          const ticks = Array.from(
            { length: Math.round((hi - lo) / step) + 1 },
            (_, i) => lo + i * step,
          );
          const bx = x(bound);
          const end = right ? w - pad + 10 : pad - 10;
          const testLabel =
            test === undefined
              ? ''
              : `${formatNumber(test)}${holds === undefined ? '' : holds ? ': true' : ': false'}`;
          return (
            <>
              <Svg width={w} height={h} opacity={boundKnown ? 1 : 0.4}>
                <Line
                  x1={pad - 10}
                  y1={lineAt}
                  x2={w - pad + 10}
                  y2={lineAt}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                {ticks.map((t) => (
                  <Line
                    key={`t${t}`}
                    x1={x(t)}
                    y1={lineAt - (t === 0 ? 8 : 5)}
                    x2={x(t)}
                    y2={lineAt + (t === 0 ? 8 : 5)}
                    stroke={c.chartInk}
                    strokeWidth={t === 0 ? chart.stroke : 1}
                  />
                ))}
                {ticks
                  .filter((t, i) => t === 0 || i % Math.ceil(28 / (perUnit * step)) === 0)
                  .map((t) => (
                    <ChartText
                      key={`l${t}`}
                      x={x(t)}
                      y={lineAt + 22}
                      fontSize={chart.tiny}
                      fontWeight={t === bound ? '700' : '400'}
                      fill={t === bound ? c.chartInk : c.chartMuted}
                      textAnchor="middle"
                    >
                      {formatNumber(t)}
                    </ChartText>
                  ))}
                {/* The solutions: a thick ray from the bound to the end of the line. */}
                {sign ? (
                  <G>
                    <Line
                      x1={bx}
                      y1={lineAt}
                      x2={end + (right ? -8 : 8)}
                      y2={lineAt}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.strokeHeavy + 2}
                    />
                    <Path
                      d={`M ${end} ${lineAt} l ${right ? -12 : 12} -8 l 0 16 z`}
                      fill={c.chartHighlight}
                    />
                  </G>
                ) : null}
                <Circle
                  cx={bx}
                  cy={lineAt}
                  r={7}
                  fill={closed ? c.chartHighlight : c.chartSurface}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke + 0.5}
                />
                <ChartText
                  {...fitLabel(bx, boundLabel, chart.value, w)}
                  y={lineAt - 18}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.chartHighlight}
                >
                  {boundLabel}
                </ChartText>
                {/* The test point: a diamond above the line, dropped to its number. */}
                {test !== undefined ? (
                  <G>
                    <Line
                      x1={x(test)}
                      y1={lineAt - 44}
                      x2={x(test)}
                      y2={lineAt}
                      stroke={c.chartInk}
                      strokeWidth={1}
                      strokeDasharray={chart.dashFine}
                    />
                    <Path
                      d={`M ${x(test)} ${lineAt - 56} l 7 7 l -7 7 l -7 -7 z`}
                      fill={holds === false ? c.chartSurface : c.chartInk}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <ChartText
                      {...fitLabel(x(test), testLabel, chart.label, w)}
                      y={lineAt - 62}
                      fontSize={chart.label}
                      fontWeight="700"
                    >
                      {testLabel}
                    </ChartText>
                  </G>
                ) : null}
              </Svg>
              {[
                ...(boundKnown ? [{ id: spec.value, at: bx, y: lineAt + 46 }] : []),
                ...(test !== undefined && ineq.test
                  ? [{ id: ineq.test, at: x(test), y: lineAt - 49 }]
                  : []),
              ].map(({ id, at, y }) => (
                <DragHandle
                  key={id}
                  testID={`drag-${id}`}
                  x={at}
                  y={y}
                  label={rep.variable(id).name}
                  onStart={() => {
                    start.current = rep.shown(id);
                    extent.freeze();
                  }}
                  onEnd={extent.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...rep.pin(
                          [
                            spec.value,
                            ineq.test,
                            signVar,
                            // Moving the boundary of px + q ≤ r keeps p and q: r follows.
                            ...(two && id === spec.value ? [two.times, two.plus] : []),
                          ].filter((v): v is string => !!v && v !== id),
                        ),
                        [id]: rep.snapTo(id, (start.current + dx / perUnit) * rep.factor(id)),
                      },
                      rep.slide(id),
                    )
                  }
                />
              ))}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {(two ? twoStepLines() : '') +
          (!boundKnown || !sign
            ? 'Type the number and pick the sign.'
            : `${letter ? `${letter}${sign} ${num(bound)}: ` : ''}every number ${WORDS[sign]} ${num(bound)}. The ${closed ? `closed circle takes in ${num(bound)}` : `open circle leaves out ${num(bound)}`}.${
                test === undefined
                  ? ''
                  : two && twoKnown && written
                    ? ` · Test ${num(test)}: ${twoTest(test)} ${written} ${formatNumber(rep.shown(two.total))} is ${holds ? 'true' : 'false'}.`
                    : ` Test ${num(test)}: ${formatNumber(test)} ${sign} ${formatNumber(bound)} is ${holds ? 'true' : 'false'}.`
              }`)}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.value, steps: [1], pin: ineq.test ? [ineq.test] : [] },
          ...(ineq.test ? [{ var: ineq.test, steps: [1], pin: [spec.value] }] : []),
        ]}
      />
    </View>
  );
}
