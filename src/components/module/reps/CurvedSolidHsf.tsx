/**
 * The Grades 9–12 curved-solid pictures (H27): a solid's surface-area net (a cylinder's
 * rectangle and two circles, a cone's sector and base, a sphere's four great circles), and
 * Cavalieri's principle as two stacks of coins, one straight and one leaning.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { Chip } from './graphKit';
import { toFraction } from './exact';
import { FloorShadow, Metal, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'curvedSolid' }>;

const short = (x: number) => formatNumber(Number(x.toFixed(2)));

/** k × π written exactly when it can be ("48π", "20π/3"), then ≈ the decimal. */
function piTimes(k: number): string {
  const f = toFraction(k, 12);
  const exact =
    Math.abs(k * 100 - Math.round(k * 100)) < 1e-6
      ? `${short(k)}π`
      : f
        ? `${f[0]}π/${f[1]}`
        : undefined;
  return exact ? `${exact} ≈ ${short(Math.PI * k)}` : `≈ ${short(Math.PI * k)}`;
}

/** The solid's numbers in the radius's shown unit. */
function useSolid(spec: Spec, calc: Calculator) {
  const rep = useRep(calc);
  const f = rep.factor(spec.radius);
  const r = rep.shown(spec.radius);
  const h = spec.shape === 'sphere' ? 2 * r : rep.val(spec.height!) / f;
  const l = spec.slant && rep.known(spec.slant) ? rep.val(spec.slant) / f : Math.hypot(r, h);
  const known = rep.known(spec.radius) && (spec.shape === 'sphere' || rep.known(spec.height!));
  const unit = rep.unit(spec.radius);
  return { rep, r, h, l, known, u: unit ? ` ${unit}` : '', sq: unit ? ` ${unit}²` : '' };
}

/** The net, flat: each face drawn to scale with its area as a multiple of π. */
export function SolidNet({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const { rep, r, h, l, known, u, sq } = useSolid(spec, calc);
  const sym = (id: string | undefined, d: string) => (id ? rep.variable(id).symbol : d);
  const S = sym(spec.surface, 'S');
  const rt = short(r);
  const lines: string[] = [];
  const fan = (2 * Math.PI * r) / l;
  if (!known) lines.push('Type the radius and height to unfold the solid.');
  else if (spec.shape === 'cylinder')
    lines.push(
      'The net: two circles and a rectangle as long as the circumference, 2πr.',
      `${S} = 2 × π × ${rt}² + 2π × ${rt} × ${short(h)} = ${piTimes(2 * r * r + 2 * r * h)}${sq}`,
    );
  else if (spec.shape === 'cone')
    lines.push(
      `The net: the base circle and a sector of radius ℓ = ${short(l)}${u} whose arc wraps the base, 2πr long.`,
      `The sector's angle is 360 × r ÷ ℓ = 360 × ${rt} ÷ ${short(l)} = ${short((360 * r) / l)}°.`,
      `${S} = π × ${rt}² + π × ${rt} × ${short(l)} = ${piTimes(r * r + r * l)}${sq}`,
    );
  else
    lines.push(
      'A sphere has no flat net: its surface is as much as four of its great circles.',
      `${S} = 4 × π × ${rt}² = ${piTimes(4 * r * r)}${sq}`,
    );

  /** The net's parts in units (y down), with their size. */
  const parts = () => {
    if (spec.shape === 'cylinder') return { w: 2 * Math.PI * r, h: h + 4 * r };
    if (spec.shape === 'cone') {
      const pts = Array.from({ length: 41 }, (_, i) => {
        const a = Math.PI / 2 - fan / 2 + (i / 40) * fan;
        return [l * Math.cos(a), l * Math.sin(a)];
      });
      const xs = [0, ...pts.map((p) => p[0]!)];
      const ys = [0, ...pts.map((p) => p[1]!)];
      return {
        w: Math.max(Math.max(...xs) - Math.min(...xs), 2 * r),
        h: Math.max(...ys) - Math.min(...ys) + 2 * r,
        top: -Math.min(...ys),
      };
    }
    return { w: 4 * r + r * 0.4, h: 4 * r + r * 0.4 };
  };
  const box = parts();

  return (
    <View>
      <Canvas
        aspect={(w) => Math.min(1.1, (box.h * Math.min((w - 48) / box.w, 300 / box.h) + 48) / w)}
      >
        {({ w, h: ch }) => {
          const k = Math.min((w - 48) / box.w, (ch - 48) / box.h);
          const cx = w / 2;
          const top = 24 + (ch - 48 - box.h * k) / 2;
          const face = { fill: c.chartFill, stroke: c.chartInk, strokeWidth: chart.stroke };
          const text = (x: number, y: number, t: string, color?: string) => (
            <ChartText {...fitLabel(x, t, chart.label, w)} y={y} fontWeight="700" fill={color}>
              {t}
            </ChartText>
          );
          const R = r * k;
          if (spec.shape === 'cylinder') {
            const W = 2 * Math.PI * R;
            const H = h * k;
            const [x0, y0] = [cx - W / 2, top + 2 * R];
            return (
              <Svg width={w} height={ch} opacity={known ? 1 : 0.4}>
                <Rect
                  x={x0}
                  y={y0}
                  width={W}
                  height={H}
                  {...face}
                  fill={c.chartHighlight}
                  fillOpacity={0.2}
                />
                <Circle cx={x0 + R} cy={y0 - R} r={R} {...face} />
                <Circle cx={x0 + R} cy={y0 + H + R} r={R} {...face} />
                {text(x0 + R, y0 - R + 4, `π × ${rt}²`)}
                {text(x0 + R, y0 + H + R + 4, `π × ${rt}²`)}
                {text(
                  cx + R,
                  y0 + H / 2 - 4,
                  `2π × ${rt} = ${piTimes(2 * r).split(' ≈')[0]}${u}`,
                  c.chartHighlight,
                )}
                {text(cx + R, y0 + H / 2 + 14, `by ${short(h)}${u}`)}
              </Svg>
            );
          }
          if (spec.shape === 'cone') {
            const L = l * k;
            const ay = top + (box.top ?? 0) * k;
            const a0 = Math.PI / 2 - fan / 2;
            const at = (a: number) => [cx + L * Math.cos(a), ay + L * Math.sin(a)] as const;
            const [p0, p1] = [at(a0), at(a0 + fan)];
            const sector =
              fan >= 2 * Math.PI - 1e-9
                ? `M ${cx + L} ${ay} A ${L} ${L} 0 1 1 ${cx - L} ${ay} A ${L} ${L} 0 1 1 ${cx + L} ${ay} Z`
                : `M ${cx} ${ay} L ${p0[0]} ${p0[1]} A ${L} ${L} 0 ${fan > Math.PI ? 1 : 0} 1 ${p1[0]} ${p1[1]} Z`;
            const baseY = ay + L + R;
            const edge = at(a0 + fan);
            return (
              <Svg width={w} height={ch} opacity={known ? 1 : 0.4}>
                <Path d={sector} {...face} fill={c.chartHighlight} fillOpacity={0.2} />
                <Circle cx={cx} cy={baseY} r={R} {...face} />
                <Circle cx={cx} cy={ay} r={2.5} fill={c.chartInk} />
                {text(cx, baseY + 4, `π × ${rt}²`)}
                {text(cx, ay + Math.min(L * 0.45, 40), `${short((360 * r) / l)}°`)}
                {(() => {
                  // ℓ beside the left edge, on the side away from the sector.
                  const [mx, my] = [(cx + edge[0]) / 2, (ay + edge[1]) / 2];
                  const len = Math.hypot(edge[0] - cx, edge[1] - ay) || 1;
                  let [nx, ny] = [-(edge[1] - ay) / len, (edge[0] - cx) / len];
                  const inward = at(a0 + fan / 2);
                  if ((inward[0] - mx) * nx + (inward[1] - my) * ny > 0) [nx, ny] = [-nx, -ny];
                  // The arc's label outside it, a little way round from the bottom.
                  const am = at(a0 + fan * 0.78);
                  const [ox, oy] = [(am[0] - cx) / L, (am[1] - ay) / L];
                  return (
                    <G>
                      <Chip
                        x={mx + nx * 14}
                        y={my + ny * 14 + 5}
                        text={`ℓ = ${short(l)}${u}`}
                        anchor={nx < -0.3 ? 'end' : nx > 0.3 ? 'start' : 'middle'}
                        w={w}
                        h={ch}
                        size={chart.label}
                      />
                      <Chip
                        x={am[0] + ox * 12}
                        y={am[1] + oy * 14 + 5}
                        text={`arc = 2π × ${rt}`}
                        anchor={ox < -0.3 ? 'end' : ox > 0.3 ? 'start' : 'middle'}
                        w={w}
                        h={ch}
                        size={chart.label}
                        color={c.chartHighlight}
                      />
                    </G>
                  );
                })()}
              </Svg>
            );
          }
          // A sphere: four great circles, 2 × 2.
          const gap = R * 0.4;
          return (
            <Svg width={w} height={ch} opacity={known ? 1 : 0.4}>
              {[0, 1, 2, 3].map((i) => {
                const x = cx + (i % 2 ? 1 : -1) * (R + gap / 2);
                const y = top + R + Math.floor(i / 2) * (2 * R + gap);
                return (
                  <G key={i}>
                    <Circle
                      cx={x}
                      cy={y}
                      r={R}
                      {...face}
                      fill={c.chartHighlight}
                      fillOpacity={0.2}
                    />
                    {text(x, y + 4, `π × ${rt}²`)}
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

const COINS = 12;

/**
 * Cavalieri's principle: two stacks of the same coins, one straight, one leaning. At every
 * height each has a coin of the same area, so the two hold the same volume.
 */
export function CoinStacks({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('coin');
  const { r, h, known, u } = useSolid(spec, calc);
  const rt = short(r);
  const lines = known
    ? [
        `Both stacks are ${COINS} coins of radius ${rt}${u}, ${short(h)}${u} tall; one leans.`,
        'At every height the two stacks cut a coin of the same area, π × r².',
        `So they hold the same volume (Cavalieri's principle): V = π × ${rt}² × ${short(h)} = ${piTimes(r * r * h)}${u ? `${u}³` : ''}`,
      ]
    : ['Type the radius and height of the stacks.'];
  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h: ch }) => {
          const pad = 30;
          const lean = 0.9;
          // Two stacks: 2r across each, the leaning one 2r + lean·r; a gap between.
          const k = Math.min((w - 2 * pad - 30) / (r * (5.8 + lean)), (ch - 70) / (h + r * 0.6));
          const R = r * k;
          const ry = R * 0.28;
          const H = h * k;
          const t = H / COINS;
          const yb = ch - 30 - ry;
          const x1 = pad + 30 + R;
          const x2 = x1 + 2 * R + R * 0.8 + R;
          const coin = (x: number, y: number, key: string) => (
            <G key={key}>
              <Path
                d={`M ${x - R} ${y} L ${x - R} ${y - t} A ${R} ${ry} 0 0 0 ${x + R} ${y - t} L ${x + R} ${y} A ${R} ${ry} 0 0 1 ${x - R} ${y} Z`}
                fill={url(ids.coin)}
                stroke={c.copperDark}
                strokeWidth={0.8}
              />
              <Ellipse
                cx={x}
                cy={y - t}
                rx={R}
                ry={ry}
                fill={c.copper}
                stroke={c.copperDark}
                strokeWidth={0.8}
              />
            </G>
          );
          const stack = (x: number, slope: number, key: string) =>
            Array.from({ length: COINS }, (_, i) =>
              coin(x + (slope * i * (lean * R)) / COINS, yb - i * t, `${key}${i}`),
            );
          return (
            <Svg width={w} height={ch} opacity={known ? 1 : 0.4}>
              <Defs>
                <Metal id={ids.coin} light={c.copper} dark={c.copperDark} />
              </Defs>
              <FloorShadow cx={x1 + 2} cy={yb + ry} rx={R * 1.1} ry={Math.max(3, ry * 0.6)} />
              <FloorShadow cx={x2 + 2} cy={yb + ry} rx={R * 1.1} ry={Math.max(3, ry * 0.6)} />
              {stack(x1, 0, 'a')}
              {stack(x2, 1, 'b')}
              {/* The same height: a guide across both tops, and h beside the first stack. */}
              <Line
                x1={x1 - R - 18}
                y1={yb - H - ry}
                x2={x2 + R + lean * R}
                y2={yb - H - ry}
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
              <Line
                x1={x1 - R - 12}
                y1={yb}
                x2={x1 - R - 12}
                y2={yb - H}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <ChartText
                {...fitLabel(x1 - R - 16, `${short(h)}${u}`, chart.label, w, 'end', 4)}
                y={yb - H / 2}
                fontWeight="700"
              >
                {`${short(h)}${u}`}
              </ChartText>
              {[x1, x2].map((x, i) => (
                <ChartText key={i} x={x} y={yb + ry + 18} textAnchor="middle" fontWeight="700">
                  {`r = ${rt}${u}`}
                </ChartText>
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
