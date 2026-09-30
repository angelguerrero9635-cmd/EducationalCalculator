/**
 * H98: three `unitCircle` pictures past one angle, flat. `through`: a point (x, y) off the
 * circle, the circle of radius r through it, the legs x and y, and the unit point
 * (x ÷ r, y ÷ r) where the ray crosses the unit circle. `pair`: A from the x-axis, then B on from
 * A to A ± B. `solutions.also`: an equation with two values (sin θ = −1/2 or sin θ = 1), both
 * lines drawn and every solution marked.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { TrigFn, UnitCircleSpec } from '@/data/modules/typesHsd';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { toFraction } from './exact';
import { angleText, exactTrig, solutionsOf, sqrtText, toDegrees, trig, turn360 } from './hsdKit';
import { MathChip } from './hsdText';

const RAD = Math.PI / 180;
const MINUS = '−';
const dec = (x: number) => formatNumber(Number(x.toFixed(4)));

/** An arc of radius r from a to b degrees (counterclockwise when b > a). */
const arc = (cx: number, cy: number, r: number, a: number, b: number) => {
  const n = Math.max(2, Math.ceil(Math.abs(b - a) / 3));
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = (a + ((b - a) * i) / n) * RAD;
    return `${i ? 'L' : 'M'} ${cx + r * Math.cos(t)} ${cy - r * Math.sin(t)}`;
  }).join(' ');
};

/** The exact values at the multiples of 15° that are not special: (√6 ± √2)/4, 2 ± √3. */
function exact15(fn: TrigFn, deg: number): string | undefined {
  const d = Math.round(turn360(deg) * 1e6) / 1e6;
  if (Math.abs(d / 15 - Math.round(d / 15)) > 1e-9) return undefined;
  const special = exactTrig(fn, d);
  if (special) return special;
  const v = trig(fn, d);
  const forms: [number, string][] =
    fn === 'tan'
      ? [
          [2 - Math.sqrt(3), '2 − √3'],
          [2 + Math.sqrt(3), '2 + √3'],
        ]
      : [
          [(Math.sqrt(6) - Math.SQRT2) / 4, '(√6 − √2)/4'],
          [(Math.sqrt(6) + Math.SQRT2) / 4, '(√6 + √2)/4'],
        ];
  const hit = forms.find(([x]) => Math.abs(Math.abs(v) - x) < 1e-9);
  return hit
    ? `${v < 0 ? MINUS : ''}${v < 0 && hit[1].startsWith('2') ? `(${hit[1]})` : hit[1]}`
    : undefined;
}

/** A trig value as written: exact where it can be (with its decimal when not whole), else ≈. */
const valueText = (fn: TrigFn, deg: number) => {
  const e = exact15(fn, deg);
  if (e === 'undefined') return e;
  const v = trig(fn, deg);
  return e ? (/√/.test(e) ? `${e} ≈ ${dec(v)}` : e) : `≈ ${dec(v)}`;
};

/** A fraction n ÷ r as written: −3/5, or 2/√13 ≈ 0.5547 when r is a root. */
function overR(n: number, r2: number): string {
  const r = Math.sqrt(r2);
  const whole = Math.abs(r - Math.round(r)) < 1e-9;
  if (whole) {
    const f = toFraction(n / r, 1000);
    return f ? (f[1] === 1 ? `${f[0]}` : `${f[0]}/${f[1]}`).replace('-', MINUS) : dec(n / r);
  }
  const root = sqrtText(r2);
  return root
    ? `${formatNumber(n).replace('-', MINUS)}/${root} ≈ ${dec(n / r)}`
    : `≈ ${dec(n / r)}`;
}

export function UnitCircleHs2g({ spec, calc }: { spec: UnitCircleSpec; calc: Calculator }) {
  return spec.through ? (
    <Through spec={spec} calc={calc} />
  ) : spec.pair ? (
    <Pair spec={spec} calc={calc} />
  ) : (
    <TwoValues spec={spec} calc={calc} />
  );
}

/** The axes, the unit circle and the frame every mode shares. */
function Frame({
  w,
  h,
  cx,
  cy,
  R,
  faded,
  children,
}: {
  w: number;
  h: number;
  cx: number;
  cy: number;
  R: number;
  faded: boolean;
  children: ReactNode;
}) {
  const c = usePalette();
  return (
    <Svg width={w} height={h}>
      <Line
        x1={8}
        y1={cy}
        x2={w - 8}
        y2={cy}
        stroke={c.chartGrid}
        strokeWidth={chart.strokeLight}
      />
      <Line
        x1={cx}
        y1={8}
        x2={cx}
        y2={h - 8}
        stroke={c.chartGrid}
        strokeWidth={chart.strokeLight}
      />
      <Circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      <G opacity={faded ? 0.35 : 1}>{children}</G>
    </Svg>
  );
}

function Through({ spec, calc }: { spec: UnitCircleSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const t = spec.through!;
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const known = [t.x, t.y].every((v) => typeof v === 'number' || rep.known(v));
  const [x, y] = [num(t.x), num(t.y)];
  const r2 = x * x + y * y;
  const r = Math.sqrt(r2);
  const theta = turn360(Math.atan2(y, x) / RAD);
  const rText = sqrtText(r2) ?? dec(r);
  const lines: string[] = [];
  if (!known) lines.push('Type x and y to place the point.');
  else if (r === 0) lines.push('(0, 0) is on no terminal side: pick a point off the origin.');
  else {
    const sq = (v: number) =>
      v < 0 ? `(${formatNumber(v).replace('-', MINUS)})²` : `${formatNumber(v)}²`;
    lines.push(
      `r = √(${sq(x)} + ${sq(y)}) = √${formatNumber(r2)}${rText.includes('√') ? '' : ` = ${rText}`}`,
    );
    lines.push(
      `cos θ = x/r = ${overR(x, r2)}, sin θ = y/r = ${overR(y, r2)}, tan θ = y/x = ${
        x === 0
          ? 'undefined (x = 0)'
          : (() => {
              const f = toFraction(y / x, 1000);
              return f
                ? (f[1] === 1 ? `${f[0]}` : `${f[0]}/${f[1]}`).replace('-', MINUS)
                : `≈ ${dec(y / x)}`;
            })()
      }`,
    );
    lines.push(
      `The unit point (cos θ, sin θ) is (x, y) scaled by 1/r: θ ≈ ${formatNumber(Number(theta.toFixed(2)))}°`,
    );
  }
  return (
    <View>
      <Canvas aspect={1}>
        {({ w, h }) => {
          const cx = w / 2;
          const cy = h / 2;
          const Rr = w / 2 - 34; // the circle through (x, y)
          const s = r > 0 ? Rr / r : 1;
          const R1 = s; // the unit circle
          const P = { x: cx + x * s, y: cy - y * s };
          const U = { x: cx + (r ? x / r : 0) * R1, y: cy - (r ? y / r : 0) * R1 };
          const pText = `(${formatNumber(x).replace('-', MINUS)}, ${formatNumber(y).replace('-', MINUS)})`;
          const out = (d: number, k: number) => ({
            x: cx + k * Math.cos(d),
            y: cy - k * Math.sin(d),
          });
          const mid = { x: (cx + P.x) / 2, y: (cy + P.y) / 2 };
          // r's label beside the ray, on the side away from the legs.
          const side = theta * RAD + (Math.PI / 2) * (y >= 0 === x >= 0 ? 1 : -1);
          const rAt = { x: mid.x + 14 * Math.cos(side), y: mid.y - 14 * Math.sin(side) + 4 };
          const thetaAt = out((theta / 2) * RAD, Math.min(30, R1 + 16));
          return (
            <Frame w={w} h={h} cx={cx} cy={cy} R={R1} faded={!known || r === 0}>
              <Circle
                cx={cx}
                cy={cy}
                r={Rr}
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dash}
              />
              <Path
                d={arc(cx, cy, Math.max(10, R1 * 0.5), 0, theta)}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
              <Line
                x1={cx}
                y1={cy}
                x2={P.x}
                y2={cy}
                stroke={c.unitCircleCosine}
                strokeWidth={chart.strokeHeavy}
              />
              <Line
                x1={P.x}
                y1={cy}
                x2={P.x}
                y2={P.y}
                stroke={c.unitCircleSine}
                strokeWidth={chart.strokeHeavy}
              />
              <Line
                x1={cx}
                y1={cy}
                x2={P.x}
                y2={P.y}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
              <Circle cx={P.x} cy={P.y} r={6} fill={c.chartHighlight} />
              <Circle
                cx={U.x}
                cy={U.y}
                r={4}
                fill={c.card}
                stroke={c.chartHighlight}
                strokeWidth={2}
              />
              <MathChip
                x={(cx + P.x) / 2}
                y={cy + (y >= 0 ? 18 : -8)}
                text={`x = ${formatNumber(x).replace('-', MINUS)}`}
                w={w}
                h={h}
                color={c.unitCircleCosine}
              />
              <MathChip
                x={P.x + (x >= 0 ? 8 : -8)}
                y={(cy + P.y) / 2 + 4}
                anchor={x >= 0 ? 'start' : 'end'}
                text={`y = ${formatNumber(y).replace('-', MINUS)}`}
                w={w}
                h={h}
                color={c.unitCircleSine}
              />
              <MathChip
                x={rAt.x}
                y={rAt.y}
                text={`r = ${rText}`}
                w={w}
                h={h}
                color={c.chartHighlight}
              />
              <MathChip x={P.x} y={P.y + (y >= 0 ? -12 : 22)} text={pText} w={w} h={h} />
              {R1 >= 26 ? (
                <MathChip
                  x={thetaAt.x}
                  y={thetaAt.y + 4}
                  text="θ"
                  w={w}
                  h={h}
                  color={c.chartHighlight}
                />
              ) : null}
              <MathChip x={cx - 6} y={cy - R1 - 6} anchor="end" text="1" w={w} h={h} bold={false} />
            </Frame>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

function Pair({ spec, calc }: { spec: UnitCircleSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const p = spec.pair!;
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const known = [p.a, p.b].every((v) => typeof v === 'number' || rep.known(v));
  const measure = spec.measure ?? 'degrees';
  const show = spec.show ?? (measure === 'degrees' ? 'degrees' : 'radians');
  const [A, B] = [toDegrees(num(p.a), measure), toDegrees(num(p.b), measure)];
  const minus = p.op === 'difference';
  const C = minus ? A - B : A + B;
  const at = (d: number) => angleText(d, show);
  const lines: string[] = [];
  if (!known) lines.push('Type A and B.');
  else {
    lines.push(
      `A ${minus ? '−' : '+'} B = ${at(A)} ${minus ? '−' : '+'} ${at(B)} = ${at(C)}: turn A, then B ${minus ? 'back' : 'on'}`,
    );
    const four = (f1: TrigFn, d1: number, f2: TrigFn, d2: number) =>
      `${exact15(f1, d1) ?? dec(trig(f1, d1))} × ${exact15(f2, d2) ?? dec(trig(f2, d2))}`;
    if (spec.sin)
      lines.push(
        `sin(${at(C)}) = sin A cos B ${minus ? '−' : '+'} cos A sin B = ${four('sin', A, 'cos', B)} ${minus ? '−' : '+'} ${four('cos', A, 'sin', B)} = ${valueText('sin', C)}`,
      );
    if (spec.cos)
      lines.push(
        `cos(${at(C)}) = cos A cos B ${minus ? '+' : '−'} sin A sin B = ${four('cos', A, 'cos', B)} ${minus ? '+' : '−'} ${four('sin', A, 'sin', B)} = ${valueText('cos', C)}`,
      );
  }
  return (
    <View>
      <Canvas aspect={1}>
        {({ w, h }) => {
          const cx = w / 2;
          const cy = h / 2;
          const R = w / 2 - 42;
          const pt = (d: number, k = R) => ({
            x: cx + k * Math.cos(d * RAD),
            y: cy - k * Math.sin(d * RAD),
          });
          const [PA, PC] = [pt(A), pt(C)];
          const rA = R * 0.26;
          const rB = R * 0.4;
          const chipAt = (d: number, k: number) => pt(d, R + k);
          return (
            <Frame w={w} h={h} cx={cx} cy={cy} R={R} faded={!known}>
              <Line
                x1={cx}
                y1={cy}
                x2={PA.x}
                y2={PA.y}
                stroke={c.unitCircleAngleA}
                strokeWidth={chart.stroke}
              />
              <Line
                x1={cx}
                y1={cy}
                x2={PC.x}
                y2={PC.y}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeHeavy}
              />
              <Path
                d={arc(cx, cy, rA, 0, A)}
                fill="none"
                stroke={c.unitCircleAngleA}
                strokeWidth={chart.stroke}
              />
              <Path
                d={arc(cx, cy, rB, A, C)}
                fill="none"
                stroke={c.unitCircleAngleB}
                strokeWidth={chart.strokeHeavy}
              />
              <Circle cx={PA.x} cy={PA.y} r={5} fill={c.unitCircleAngleA} />
              <Circle cx={PC.x} cy={PC.y} r={6} fill={c.chartHighlight} />
              {/* The key: the two arcs' colours, in the corner away from the circle. */}
              <MathChip
                x={10}
                y={20}
                anchor="start"
                text={`A = ${at(A)}`}
                w={w}
                h={h}
                color={c.unitCircleAngleA}
              />
              <MathChip
                x={10}
                y={40}
                anchor="start"
                text={`B = ${at(B)}${minus ? ', back' : ''}`}
                w={w}
                h={h}
                color={c.unitCircleAngleB}
              />
              <MathChip
                x={chipAt(C, 20).x}
                y={chipAt(C, 20).y + 4}
                text={`A ${minus ? '−' : '+'} B = ${at(C)}`}
                w={w}
                h={h}
                color={c.chartHighlight}
              />
            </Frame>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

function TwoValues({ spec, calc }: { spec: UnitCircleSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const sol = spec.solutions!;
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const known = [sol.value, sol.also!].every((v) => typeof v === 'number' || rep.known(v));
  const values = [num(sol.value), num(sol.also!)];
  const measure = spec.measure ?? 'degrees';
  const show = spec.show ?? (measure === 'degrees' ? 'degrees' : 'radians');
  const at = (d: number) => angleText(d, show);
  const fn = sol.fn;
  const sets = values.map((v) => solutionsOf(fn, v));
  const vText = (v: number) => {
    const f = toFraction(v, 12);
    return f ? (f[1] === 1 ? `${f[0]}` : `${f[0]}/${f[1]}`).replace('-', MINUS) : dec(v);
  };
  const lines: string[] = [];
  if (!known) lines.push(`${fn} θ = ? or ?`);
  else {
    values.forEach((v, i) =>
      lines.push(
        sets[i]!.length
          ? `${fn} θ = ${vText(v)} at θ = ${sets[i]!.map(at).join(' and ')}`
          : `${fn} θ = ${vText(v)} has no solution: ${fn} θ stays from −1 to 1`,
      ),
    );
    const n = new Set(sets.flat().map((d) => Math.round(d * 1e6))).size;
    lines.push(`${n} solution${n === 1 ? '' : 's'} for ${at(0)} ≤ θ < ${at(360)}`);
  }
  const colors = [c.unitCircleAngleA, c.unitCircleAngleB];
  return (
    <View>
      <Canvas aspect={1}>
        {({ w, h }) => {
          const cx = w / 2;
          const cy = h / 2;
          const R = w / 2 - 48;
          const pt = (d: number, k = R) => ({
            x: cx + k * Math.cos(d * RAD),
            y: cy - k * Math.sin(d * RAD),
          });
          return (
            <Frame w={w} h={h} cx={cx} cy={cy} R={R} faded={!known}>
              {values.map((v, i) => {
                const col = colors[i]!;
                const line =
                  fn === 'sin' ? (
                    <Line
                      x1={cx - R - 20}
                      y1={cy - v * R}
                      x2={cx + R + 20}
                      y2={cy - v * R}
                      stroke={col}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dash}
                    />
                  ) : fn === 'cos' ? (
                    <Line
                      x1={cx + v * R}
                      y1={cy - R - 20}
                      x2={cx + v * R}
                      y2={cy + R + 20}
                      stroke={col}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dash}
                    />
                  ) : (
                    (() => {
                      const d = Math.atan(v);
                      const k = R + 20;
                      return (
                        <Line
                          x1={cx - k * Math.cos(d)}
                          y1={cy + k * Math.sin(d)}
                          x2={cx + k * Math.cos(d)}
                          y2={cy - k * Math.sin(d)}
                          stroke={col}
                          strokeWidth={chart.strokeLight}
                          strokeDasharray={chart.dash}
                        />
                      );
                    })()
                  );
                const tag = `${fn} θ = ${vText(v)}`;
                // The key, in the corner: each value's line and angles in its colour.
                const tagAt = { x: 10, y: 20 + 20 * i, anchor: 'start' as const };
                return (
                  <G key={`v${i}`}>
                    {line}
                    {sets[i]!.map((d) => {
                      const P = pt(d);
                      const L = pt(d, R + 26);
                      return (
                        <G key={`p${i}-${d}`}>
                          <Line
                            x1={cx}
                            y1={cy}
                            x2={P.x}
                            y2={P.y}
                            stroke={col}
                            strokeWidth={chart.stroke}
                          />
                          <Circle cx={P.x} cy={P.y} r={5.5} fill={col} />
                          <MathChip x={L.x} y={L.y + 4} text={at(d)} w={w} h={h} color={col} />
                        </G>
                      );
                    })}
                    <MathChip
                      x={tagAt.x}
                      y={tagAt.y}
                      anchor={tagAt.anchor}
                      text={tag}
                      w={w}
                      h={h}
                      color={col}
                    />
                  </G>
                );
              })}
            </Frame>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
