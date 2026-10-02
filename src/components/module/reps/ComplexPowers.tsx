/**
 * H99: powers and roots on the complex plane, flat. `power: n`: z, z², …, zⁿ in turn, each
 * step turning by arg z and stretching by |z|, joined by a dashed path, zⁿ lit. `roots: n`: the
 * n nth roots of z on the circle of radius |z|^(1/n), a regular polygon, the first root's
 * argument arg z ÷ n marked, z itself as an arrow. No handle: the values have sliders.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import type { ComplexPlaneSpec } from '@/data/modules/typesHsd';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { complexText } from './ComplexPlane';
import { argOf, powersOf, rootsOf } from './complexPowers';
import { Arrow, makeFrame } from './graphKit';
import { HsdGrid, symmetricWindow } from './hsdGrid';
import { magnitudeText, short } from './hsdKit';
import { MathChip, textWidth } from './hsdText';

const RAD = Math.PI / 180;
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) => [...String(n)].map((d) => SUP[Number(d)]).join('');

export function ComplexPowers({ spec, calc }: { spec: ComplexPlaneSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const isKnown = (v: number | string) => typeof v === 'number' || rep.known(v);
  const z =
    'modulus' in spec.z
      ? {
          a: num(spec.z.modulus) * Math.cos(num(spec.z.argument) * RAD),
          b: num(spec.z.modulus) * Math.sin(num(spec.z.argument) * RAD),
          known: isKnown(spec.z.modulus) && isKnown(spec.z.argument),
        }
      : { a: num(spec.z.re), b: num(spec.z.im), known: isKnown(spec.z.re) && isKnown(spec.z.im) };
  const roots = spec.roots !== undefined;
  const nv = roots ? spec.roots! : spec.power!;
  const n = Math.max(1, Math.min(12, Math.round(num(nv))));
  const known = z.known && isKnown(nv);
  const r = Math.hypot(z.a, z.b);
  const t = argOf(z.a, z.b);
  const pts = roots ? rootsOf(z.a, z.b, n) : powersOf(z.a, z.b, n);
  const rho = r ** (1 / n);
  // A "?" box reads "?" on the picture too: z's tag, and no roots or powers named with the
  // example's numbers drawn faded behind it.
  const zText = z.known ? `z = ${complexText(z.a, z.b)}` : 'z = ?';

  const lines: string[] = [];
  if (!known) lines.push('Type z and n.');
  else if (r === 0) lines.push('z = 0: every power and root is 0.');
  else if (!roots) {
    const last = pts[n - 1]!;
    // |z| exactly when it is a root of a whole number: √2, and (√2)⁸ for its power.
    const rt = magnitudeText(z.a, z.b).split(' ≈')[0]!;
    const rp = rt.includes('√') ? `(${rt})` : rt;
    lines.push(
      `z = ${complexText(z.a, z.b)} = ${rt}(cos ${short(t)}° + i sin ${short(t)}°)`,
      `Each power turns ${short(t)}° more and stretches by ${rt}: z${sup(n)} = ${rp}${sup(n)}(cos ${short(n * t)}° + i sin ${short(n * t)}°) = ${complexText(last.a, last.b)}`,
    );
  } else {
    const shown = pts.slice(0, 6).map((p) => complexText(p.a, p.b));
    // The roots' modulus as a root sign over |z| (∛8, ∜(4√2)), never a caret.
    const rt = magnitudeText(z.a, z.b).split(' ≈')[0]!;
    const sign = n === 2 ? '√' : n === 3 ? '∛' : n === 4 ? '∜' : `${sup(n)}√`;
    const rootText = `${sign}${rt.includes('√') ? `(${rt})` : rt}`;
    lines.push(
      `The ${n} roots of z = ${complexText(z.a, z.b)}: modulus ${rootText} = ${short(rho)}, arguments (${short(t)}° + 360°k) ÷ ${n} = ${pts
        .slice(0, 6)
        .map((p) => `${short(p.deg)}°`)
        .join(', ')}${n > 6 ? ', …' : ''}`,
      `Roots: ${shown.join(', ')}${n > 6 ? ', …' : ''}; ${n === 2 ? 'opposite each other' : `the corners of a regular ${n}-gon`}`,
    );
  }

  return (
    <View>
      <Canvas aspect={1}>
        {({ w, h }) => {
          const win = symmetricWindow([...pts.flatMap((p) => [p.a, p.b]), z.a, z.b], 8);
          const f = makeFrame(w, h, [win.lo, win.hi], [win.lo, win.hi], true, true);
          const O = { x: f.sx(0), y: f.sy(0) };
          const P = (p: { a: number; b: number }) => ({ x: f.sx(p.a), y: f.sy(p.b) });
          const tip = (
            p: { a: number; b: number },
            text: string,
            color: string,
            bold = true,
            below = false,
          ) => {
            const q = P(p);
            const len = Math.hypot(q.x - O.x, q.y - O.y) || 1;
            const [ux, uy] = [(q.x - O.x) / len, (q.y - O.y) / len];
            // Along an axis the label sits beside the point, off the axis's numbers and name.
            const flat = Math.abs(uy) < 0.3;
            const upright = Math.abs(ux) < 0.3;
            return (
              <MathChip
                x={flat ? q.x - ux * 4 : upright ? q.x + 10 : q.x + ux * 12}
                y={flat ? q.y + (below ? 22 : -12) : upright ? q.y + 4 : q.y + uy * 14 + 4}
                text={text}
                anchor={
                  flat
                    ? ux > 0
                      ? 'end'
                      : 'start'
                    : upright
                      ? 'start'
                      : ux > 0.3
                        ? 'start'
                        : ux < -0.3
                          ? 'end'
                          : 'middle'
                }
                w={w}
                h={h}
                color={color}
                bold={bold}
              />
            );
          };
          const arcD = (from: number, to: number, rr: number) => {
            const k = Math.max(2, Math.ceil(Math.abs(to - from) / 4));
            return Array.from({ length: k + 1 }, (_, i) => {
              const d = (from + ((to - from) * i) / k) * RAD;
              return `${i ? 'L' : 'M'} ${O.x + rr * Math.cos(d)} ${O.y - rr * Math.sin(d)}`;
            }).join(' ');
          };
          // zⁿ on the real axis level with z's tag (z⁸ = 16 touched z = 1 + i): its tag goes
          // under the axis, and the axis numbers there are left out.
          const lastQ = P(pts[n - 1] ?? z);
          const lastText = `z${sup(n)} = ${complexText((pts[n - 1] ?? z).a, (pts[n - 1] ?? z).b)}`;
          const lastBelow =
            !roots &&
            n > 1 &&
            Math.abs(lastQ.y - O.y) < 0.3 * Math.hypot(lastQ.x - O.x, lastQ.y - O.y) &&
            Math.abs(lastQ.y - P(pts[0]!).y) < 30;
          const lastTw = textWidth(lastText, chart.label) + 6;
          const lastX = lastQ.x - Math.sign(lastQ.x - O.x) * 4;
          const lastL = lastQ.x > O.x ? lastX - lastTw + 3 : lastX - 3;
          const clear = lastBelow
            ? [{ l: lastL, t: lastQ.y + 22 - chart.label, r: lastL + lastTw, b: lastQ.y + 28 }]
            : [];
          const path = (list: { a: number; b: number }[], close: boolean) =>
            list.map((p, i) => `${i ? 'L' : 'M'} ${P(p).x} ${P(p).y}`).join(' ') +
            (close ? ' Z' : '');
          return (
            <Svg width={w} height={h}>
              <HsdGrid
                f={f}
                step={{ x: win.step, y: win.step }}
                names={{ x: 'Re', y: 'Im' }}
                yText={(v) => complexText(0, v)}
                clear={clear}
              />
              <G opacity={known && r > 0 ? 1 : 0.35}>
                {roots ? (
                  <G>
                    <Circle
                      cx={O.x}
                      cy={O.y}
                      r={rho * f.ux}
                      fill="none"
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dash}
                    />
                    {n > 2 ? (
                      <Path
                        d={path(pts, true)}
                        fill={c.chartHighlight}
                        fillOpacity={0.08}
                        stroke={c.chartHighlight}
                        strokeWidth={chart.strokeLight}
                      />
                    ) : null}
                    <Arrow
                      x1={O.x}
                      y1={O.y}
                      x2={P(z).x}
                      y2={P(z).y}
                      color={c.hopBack}
                      width={chart.stroke}
                    />
                    {tip(z, zText, c.hopBack)}
                    <Path
                      d={arcD(0, pts[0]!.deg, 26)}
                      fill="none"
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                    {pts.map((p, i) => (
                      <G key={`r${i}`}>
                        <Circle
                          cx={P(p).x}
                          cy={P(p).y}
                          r={i === 0 ? 6 : 4.5}
                          fill={c.chartHighlight}
                          fillOpacity={i === 0 ? 1 : 0.75}
                        />
                        {known && (n <= 6 || i === 0)
                          ? tip(p, complexText(p.a, p.b), c.chartHighlight, i === 0)
                          : null}
                      </G>
                    ))}
                  </G>
                ) : (
                  <G>
                    <Path
                      d={path([{ a: 0, b: 0 }, ...pts], false)}
                      fill="none"
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dashFine}
                    />
                    <Path
                      d={arcD(0, t, 24)}
                      fill="none"
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {pts.map((p, i) => (
                      <Circle
                        key={`p${i}`}
                        cx={P(p).x}
                        cy={P(p).y}
                        r={i === n - 1 ? 6 : 4}
                        fill={i === n - 1 ? c.vectorResultant : c.chartHighlight}
                        fillOpacity={i === 0 || i === n - 1 ? 1 : 0.55}
                      />
                    ))}
                    <Arrow
                      x1={O.x}
                      y1={O.y}
                      x2={P(pts[0]!).x}
                      y2={P(pts[0]!).y}
                      color={c.chartHighlight}
                      width={chart.stroke}
                    />
                    {n > 1 ? (
                      <Arrow
                        x1={O.x}
                        y1={O.y}
                        x2={P(pts[n - 1]!).x}
                        y2={P(pts[n - 1]!).y}
                        color={c.vectorResultant}
                        width={chart.strokeHeavy}
                      />
                    ) : null}
                    {/* Each power in between named small (z², z³, …), out from the origin. */}
                    {pts.slice(1, n - 1).map((p, i) => {
                      const q = P(p);
                      const len = Math.hypot(q.x - O.x, q.y - O.y) || 1;
                      return (
                        <ChartText
                          key={`k${i}`}
                          x={q.x + ((q.x - O.x) / len) * 12}
                          y={q.y + ((q.y - O.y) / len) * 12 + 4}
                          textAnchor="middle"
                          fontSize={chart.tiny}
                          fill={c.chartMuted}
                          halo
                        >
                          {`z${sup(i + 2)}`}
                        </ChartText>
                      );
                    })}
                    {tip(pts[0]!, zText, c.chartHighlight)}
                    {n > 1
                      ? tip(
                          pts[n - 1]!,
                          known
                            ? `z${sup(n)} = ${complexText(pts[n - 1]!.a, pts[n - 1]!.b)}`
                            : `z${isKnown(nv) ? sup(n) : 'ⁿ'} = ?`,
                          c.vectorResultant,
                          true,
                          lastBelow,
                        )
                      : null}
                  </G>
                )}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
