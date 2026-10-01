import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ConicGraphSpec } from '@/data/modules/typesHsd';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { quadraticText, turnedConic, unturn } from './conicTurned';
import { makeFrame } from './graphKit';
import { HsdGrid, niceWindow } from './hsdGrid';
import { short } from './hsdKit';
import { MathChip } from './hsdText';
import { usePaintIds } from './paint';

const RAD = Math.PI / 180;

/**
 * A conic with an xy term (H106, `conicGraph` with `conic: 'turned'`): Ax² + Bxy + Cy² = 1 on
 * the x, y grid with the x′ and y′ axes turned by θ, the angle marked, and in the turned axes its
 * own half-axes (an ellipse), asymptotes (a hyperbola) or two parallel lines.
 */
export function ConicTurned({ spec, calc }: { spec: ConicGraphSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('clip');
  const s = spec as Extract<ConicGraphSpec, { conic: 'turned' }>;
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = [s.A, s.B, s.C, s.F].every(
    (x) => x === undefined || typeof x === 'number' || rep.known(x),
  );
  const [A, B, C, F] = [num(s.A, 1), num(s.B, 0), num(s.C, 1), num(s.F, -1)];
  const t = turnedConic(A, B, C, F);
  const sh = t.shape;
  const reach =
    sh.kind === 'ellipse'
      ? Math.max(sh.a, sh.b) * 1.25
      : sh.kind === 'hyperbola'
        ? Math.max(sh.a, sh.b) * 2.6
        : sh.kind === 'lines'
          ? sh.a * 2.2
          : 1;
  const w0 = niceWindow([-reach, reach], 8, 0.04);
  const win = { lo: -Math.max(-w0.lo, w0.hi), hi: Math.max(-w0.lo, w0.hi), step: w0.step };
  const G0 = -F;
  const eq = quadraticText(
    [
      [A, 'x²'],
      [B, 'xy'],
      [C, 'y²'],
    ],
    G0,
  );
  const eq1 = quadraticText(
    [
      [Number(t.A1.toFixed(4)), 'x′²'],
      [Number(t.C1.toFixed(4)), 'y′²'],
    ],
    G0,
  );

  // Caption.
  const lines: string[] = [];
  if (!known) lines.push(`${eq}, with a value still to type.`);
  else if (B === 0) lines.push(`The equation ${eq} has no xy term: its axes are x and y already.`);
  else {
    const two = 2 * t.theta;
    lines.push(
      A === C
        ? `With A = C the turned axes bisect the old ones: 2θ = 90°, so θ = 45°.`
        : `The turn has tan 2θ = ${short(B)} ÷ (${short(A)} − ${C < 0 ? `(${short(C)})` : short(C)}) = ${short(B / (A - C))}, so 2θ = ${short(two)}° and θ = ${short(t.theta)}°.`,
    );
    const name =
      sh.kind === 'ellipse'
        ? 'an ellipse'
        : sh.kind === 'hyperbola'
          ? 'a hyperbola'
          : sh.kind === 'lines'
            ? 'two parallel lines'
            : 'no points at all';
    lines.push(
      `In the turned axes the equation reads ${eq1}, with no x′y′ term: ${name}, as B² − 4AC = ${short(t.D)} ${t.D < 0 ? '< 0' : t.D > 0 ? '> 0' : '= 0'} says.`,
    );
    if (sh.kind === 'ellipse')
      lines.push(
        `Its half-axes are √(${short(G0)} ÷ A′) = ${short(sh.a)} along x′ and √(${short(G0)} ÷ C′) = ${short(sh.b)} along y′.`,
      );
  }

  return (
    <View>
      <Canvas aspect={1}>
        {({ w, h }) => {
          const f = makeFrame(w, h, [win.lo, win.hi], [win.lo, win.hi], true, true);
          const P = (x: number, y: number) => ({ x: f.sx(x), y: f.sy(y) });
          const T = (xp: number, yp: number) => {
            const q = unturn(t.theta, xp, yp);
            return P(q.x, q.y);
          };
          const far = (win.hi - win.lo) * 0.8;
          const path = (pts: { x: number; y: number }[]) =>
            pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
          const curves: string[] = [];
          const helpers: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
          if (sh.kind === 'ellipse') {
            curves.push(
              path(
                Array.from({ length: 145 }, (_, i) =>
                  T(sh.a * Math.cos(i * 2.5 * RAD), sh.b * Math.sin(i * 2.5 * RAD)),
                ),
              ),
            );
          } else if (sh.kind === 'hyperbola') {
            const top = Math.asinh(far / sh.b);
            for (const sign of [1, -1]) {
              const pts = Array.from({ length: 121 }, (_, i) => {
                const u = -top + (2 * top * i) / 120;
                const [p, q] = [sign * sh.a * Math.cosh(u), sh.b * Math.sinh(u)];
                return sh.along === 'x' ? T(p, q) : T(q, p);
              });
              curves.push(path(pts));
            }
            // Asymptotes: y′ = ±(b ÷ a)x′ (or x′ = ±(b ÷ a)y′).
            for (const sign of [1, -1]) {
              const [p, q] = [far, (sign * far * sh.b) / sh.a];
              helpers.push(
                sh.along === 'x' ? { a: T(-p, -q), b: T(p, q) } : { a: T(-q, -p), b: T(q, p) },
              );
            }
          } else if (sh.kind === 'lines') {
            for (const sign of [1, -1])
              curves.push(
                path(
                  sh.along === 'x'
                    ? [T(sign * sh.a, -far), T(sign * sh.a, far)]
                    : [T(-far, sign * sh.a), T(far, sign * sh.a)],
                ),
              );
          }
          const axisEnd = (deg: number) => {
            const r = (win.hi - win.lo) * 0.47;
            return P(r * Math.cos(deg * RAD), r * Math.sin(deg * RAD));
          };
          const O = P(0, 0);
          const xEnd = axisEnd(t.theta);
          const yEnd = axisEnd(t.theta + 90);
          const arcR = 34;
          const arc = Array.from({ length: 31 }, (_, i) => {
            const a = ((t.theta * i) / 30) * RAD;
            return `${i ? 'L' : 'M'} ${O.x + arcR * Math.cos(a)} ${O.y - arcR * Math.sin(a)}`;
          }).join(' ');
          const mid = (t.theta / 2) * RAD;
          const op = known ? 1 : 0.35;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <ClipPath id={ids.clip}>
                  <Rect
                    x={f.sx(win.lo)}
                    y={f.sy(win.hi)}
                    width={f.sx(win.hi) - f.sx(win.lo)}
                    height={f.sy(win.lo) - f.sy(win.hi)}
                  />
                </ClipPath>
              </Defs>
              <HsdGrid f={f} step={{ x: win.step, y: win.step }} />
              <G clipPath={`url(#${ids.clip})`} opacity={op}>
                {/* The turned axes x′ and y′, through the origin both ways. */}
                {[t.theta, t.theta + 90].map((deg) => {
                  const [a, b] = [axisEnd(deg), axisEnd(deg + 180)];
                  return (
                    <Line
                      key={`ax${deg}`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={c.hopBack}
                      strokeWidth={chart.stroke}
                      strokeDasharray={chart.dash}
                    />
                  );
                })}
                {helpers.map((l, i) => (
                  <Line
                    key={`as${i}`}
                    x1={l.a.x}
                    y1={l.a.y}
                    x2={l.b.x}
                    y2={l.b.y}
                    stroke={c.chartMuted}
                    strokeWidth={chart.strokeLight}
                    strokeDasharray={chart.dashFine}
                  />
                ))}
                {curves.map((d, i) => (
                  <Path
                    key={`c${i}`}
                    d={d}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    fill="none"
                  />
                ))}
                {sh.kind === 'ellipse' ? (
                  <G>
                    {[T(sh.a, 0), T(-sh.a, 0), T(0, sh.b), T(0, -sh.b)].map((p, i) => (
                      <Circle key={`v${i}`} cx={p.x} cy={p.y} r={4} fill={c.chartHighlight} />
                    ))}
                  </G>
                ) : null}
              </G>
              {t.theta > 1 ? (
                <G opacity={op}>
                  <Path d={arc} stroke={c.chartInk} strokeWidth={chart.strokeLight} fill="none" />
                  <MathChip
                    x={O.x + (arcR + 12) * Math.cos(mid)}
                    y={O.y - (arcR + 12) * Math.sin(mid) + 4}
                    text={`θ = ${short(t.theta)}°`}
                    anchor="start"
                    w={w}
                    h={h}
                  />
                </G>
              ) : null}
              <MathChip x={xEnd.x} y={xEnd.y - 8} text="x′" w={w} h={h} color={c.hopBack} />
              <MathChip
                x={yEnd.x - 10}
                y={yEnd.y + 4}
                text="y′"
                anchor="end"
                w={w}
                h={h}
                color={c.hopBack}
              />
              <MathChip
                x={8}
                y={h - 30}
                text={eq}
                anchor="start"
                w={w}
                h={h}
                color={c.chartHighlight}
                size={chart.value}
              />
              {B !== 0 ? (
                <MathChip
                  x={8}
                  y={h - 10}
                  text={eq1}
                  anchor="start"
                  w={w}
                  h={h}
                  color={c.hopBack}
                />
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
