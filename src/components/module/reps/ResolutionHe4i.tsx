/**
 * HC149 (round 4, group I): `fieldOfView` `resolution`. Two points `gap` apart seen through the
 * eyepiece (a dark field in its metal ring), each blurred by the lens into an Airy disk whose
 * first dark ring (dashed on the left one) lies at the resolution limit d. Under the field, on
 * the same nm scale, the brightness along the line through the two points: each disk dashed
 * and their sum solid, which dips between the peaks when gap ≥ d (resolved; just resolved at
 * d, the Rayleigh limit) and merges into one hump when gap < d. The spots are painted light;
 * the brightness graph is flat and exact.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop } from 'react-native-svg';

import type { FieldResolutionHe4i } from '@/data/modules/typesHe4i';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { fig3 } from './he1dText';
import { airy, resolvedAs } from './he4iMath';
import { Metal, url, usePaintIds } from './paint';

const CY = 92;
const R = 76;
const RING = 10;
const GRAPH_TOP = 222;
const GRAPH_H = 84;
const H = GRAPH_TOP + GRAPH_H + 34;

export function ResolutionHe4i({ spec, calc }: { spec: FieldResolutionHe4i; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const paint = usePaintIds('spot', 'ring');
  const read = reader(rep);
  const q = spec.resolution;
  const d = read(q.d);
  const gap = read(q.gap);
  const known = d.known && gap.known && d.value > 0 && gap.value > 0;
  const unit = typeof q.d === 'string' ? (rep.unit(q.d) ?? 'nm') : 'nm';
  const nm = (x: number) => `${fig3(x)} ${unit}`;
  const verdict = known ? resolvedAs(gap.value, d.value) : undefined;
  const opt = (v: string | number | undefined) => (v === undefined ? undefined : read(v));
  const [lam, na, ob, ey] = [opt(q.wavelength), opt(q.na), opt(q.objective), opt(q.eyepiece)];
  const headline = !known
    ? 'Type d and the gap to see the two points.'
    : verdict === 'blob'
      ? `One blob: ${nm(gap.value)} < d = ${nm(d.value)}`
      : verdict === 'just'
        ? `Just resolved: the gap is d = ${nm(d.value)}`
        : `Resolved: ${nm(gap.value)} ≥ d = ${nm(d.value)}`;
  const caption = [
    ...(lam?.known && na?.known
      ? [
          `d = 0.61λ ÷ NA = 0.61 × ${formatNumber(lam.value)} ÷ ${formatNumber(na.value)} = ${nm((0.61 * lam.value) / na.value)}`,
        ]
      : []),
    ...(ob?.known && ey?.known
      ? [
          `Total magnification = ${formatNumber(ob.value)} × ${formatNumber(ey.value)} = ${formatNumber(ob.value * ey.value)}×`,
        ]
      : []),
    known
      ? 'Two points are resolved when the gap is at least d: then the brightness dips between them.'
      : 'Each point blurs to an Airy disk; d is the radius of its first dark ring.',
  ].join(' · ');

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w }) => {
          const cx = w / 2;
          // nm across the field: both disks out to their first dark rings, with room.
          const span = known ? Math.max(gap.value + 3.4 * d.value, 4 * d.value) : 1;
          const s = (2 * R) / span;
          const x1 = cx - (gap.value / 2) * s;
          const x2 = cx + (gap.value / 2) * s;
          const spotR = 1.7 * d.value * s;
          // The brightness along the line through the points, the sum scaled to its peak.
          const n = 120;
          const xs = Array.from({ length: n + 1 }, (_, i) => -span / 2 + (span * i) / n);
          const one = (x: number, at: number) => airy(x - at, d.value);
          const sum = (x: number) => one(x, -gap.value / 2) + one(x, gap.value / 2);
          const peak = known ? Math.max(...xs.map(sum)) : 1;
          const gx = (x: number) => cx + x * s;
          const gy = (b: number) => GRAPH_TOP + GRAPH_H - (b / peak) * (GRAPH_H - 8);
          const path = (f: (x: number) => number) =>
            xs
              .map((x, i) => `${i ? 'L' : 'M'} ${gx(x).toFixed(1)} ${gy(f(x)).toFixed(1)}`)
              .join(' ');
          const color =
            verdict === 'blob' ? c.chartInk : verdict === 'just' ? c.chartSecond : c.chartHighlight;
          return (
            <Svg width={w} height={H}>
              <Defs>
                <Metal id={paint.ring} light={c.metalDark} dark={c.rubber} />
                <RadialGradient id={paint.spot} cx="0.5" cy="0.5" r="0.5">
                  {Array.from({ length: 18 }, (_, k) => {
                    const t = k / 17;
                    return (
                      <Stop
                        key={k}
                        offset={t}
                        stopColor={c.he4iAiry}
                        // Square root: the first bright ring (1.7% of the peak) still shows.
                        stopOpacity={Math.min(1, Math.sqrt(airy(t * 1.7, 1)) * 0.95)}
                      />
                    );
                  })}
                </RadialGradient>
              </Defs>
              {/* The eyepiece: a dark field in its metal ring. */}
              <Circle cx={cx} cy={CY + 3} r={R + RING} fill={c.shadow} />
              <Circle cx={cx} cy={CY} r={R + RING} fill={url(paint.ring)} />
              <Circle cx={cx} cy={CY} r={R} fill={c.he4iField} />
              {known ? (
                <G>
                  <Circle cx={x1} cy={CY} r={spotR} fill={url(paint.spot)} />
                  <Circle cx={x2} cy={CY} r={spotR} fill={url(paint.spot)} />
                  <Circle
                    cx={x1}
                    cy={CY}
                    r={d.value * s}
                    fill="none"
                    stroke={c.he4iAiry}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                    opacity={0.8}
                  />
                </G>
              ) : null}
              <ChartText
                x={cx}
                y={CY + R + RING + 22}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
                fill={known ? color : c.chartMuted}
              >
                {headline}
              </ChartText>
              {/* The brightness along the line through the two points. */}
              <Line
                x1={cx - R}
                y1={GRAPH_TOP + GRAPH_H}
                x2={cx + R}
                y2={GRAPH_TOP + GRAPH_H}
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              <ChartText
                x={cx - R - 6}
                y={GRAPH_TOP + 12}
                fontSize={chart.label}
                textAnchor="end"
                fill={c.chartMuted}
              >
                light
              </ChartText>
              {known ? (
                <G>
                  <Path
                    d={path((x) => one(x, -gap.value / 2))}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                    fill="none"
                  />
                  <Path
                    d={path((x) => one(x, gap.value / 2))}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dashFine}
                    fill="none"
                  />
                  <Path d={path(sum)} stroke={color} strokeWidth={chart.stroke} fill="none" />
                  {/* The gap, between the two points, under the axis. */}
                  <Line
                    x1={x1}
                    y1={GRAPH_TOP + GRAPH_H + 8}
                    x2={x2}
                    y2={GRAPH_TOP + GRAPH_H + 8}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  {[x1, x2].map((x) => (
                    <Line
                      key={x}
                      x1={x}
                      y1={GRAPH_TOP + GRAPH_H + 3}
                      x2={x}
                      y2={GRAPH_TOP + GRAPH_H + 13}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                  ))}
                  <ChartText
                    x={x2 + 8}
                    y={GRAPH_TOP + GRAPH_H + 13}
                    fontSize={chart.label}
                    fill={c.chartInk}
                  >
                    {`gap ${nm(gap.value)}`}
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
