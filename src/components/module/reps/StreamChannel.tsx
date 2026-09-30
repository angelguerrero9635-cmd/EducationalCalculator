import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Polygon } from 'react-native-svg';

import type { StreamChannelSpec } from '@/data/modules/typesHs2f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { Deepen, TopLight, url, usePaintIds } from './paint';

const BW = 360;
/** The tallest the drawing grows. */
const BH = 262;
/** The oblique view: one metre along the stream goes this far right and up (× the scale). */
const OX = 0.5;
const OY = 0.35;
/** Soil below the channel's bed, and room left for the labels below. */
const BED = 22;
const BELOW = 50;

const round = (x: number, places = 2) => Number(x.toFixed(places));
const pts = (...p: [number, number][]) =>
  p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/** A stream channel to scale, and the water that passes in one second (StreamChannelSpec). */
export function StreamChannel({ spec, calc }: { spec: StreamChannelSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('soil', 'water', 'top', 'grass');
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const label = (x: number | string, unit: string) =>
    typeof x === 'string' ? rep.named(x) : `${formatNumber(x)} ${unit}`;
  const w = Math.max(0.01, num(spec.width, 12));
  const d = Math.max(0.01, num(spec.depth, 1.5));
  const v = Math.max(0, num(spec.speed, 0.8));
  const on = [spec.width, spec.depth, spec.speed].every(known);
  const A = w * d;
  const Q = A * v;
  // The channel is drawn back at least a third of its width, and past the one-second slab.
  const back = Math.max(v * 1.25, w * 0.4);
  // One scale for every length: fit the width and the view back across, the depth and rise down.
  const s = Math.min((BW - 150) / (w + OX * back), (BH - 34 - BED - BELOW) / (d + OY * back));
  const W = w * s;
  const D = Math.max(3, d * s);
  const bx = OX * back * s;
  const by = -OY * back * s;
  const x0 = (BW - W - bx) / 2;
  const GY = 34 - by;
  const xl = 8;
  const xr = BW - 8 - bx;
  const vx = OX * v * s;
  const vy = -OY * v * s;
  const bottom = GY + D + BED;
  const height = bottom + BELOW - 8;
  // The one-second slab is drawn to scale; a very wide channel makes it too thin to see.
  const slabSeen = Math.hypot(OX * v * s, OY * v * s) >= 4;
  const fl: [number, number] = [x0, GY];
  const fr: [number, number] = [x0 + W, GY];
  const add = (p: [number, number], dx: number, dy: number): [number, number] => [
    p[0] + dx,
    p[1] + dy,
  ];
  const mid = add(fl, W / 2, 0);

  return (
    <View>
      <Canvas aspect={height / BW}>
        {({ w: cw, h }) => {
          const k = cw / BW;
          return (
            <Svg width={cw} height={h}>
              <Defs>
                <Deepen id={ids.soil} from={c.soil} to={c.soilDark} />
                <Deepen id={ids.water} from={c.water} to={c.waterDeep} />
                <TopLight id={ids.top} />
                <Deepen id={ids.grass} from={c.landGrass} to={c.landGrass} />
              </Defs>
              <G transform={`scale(${k})`}>
                {/* The banks' grassy tops, running back. */}
                <Polygon
                  points={pts([xl, GY], fl, add(fl, bx, by), [xl + bx, GY + by])}
                  fill={url(ids.grass)}
                />
                <Polygon
                  points={pts(fr, [xr, GY], [xr + bx, GY + by], add(fr, bx, by))}
                  fill={url(ids.grass)}
                />
                {/* The soil in cross-section, the channel cut into it, and the far end. */}
                <Path
                  d={`M ${xl} ${GY} L ${x0} ${GY} L ${x0} ${GY + D} L ${x0 + W} ${GY + D} L ${x0 + W} ${GY} L ${xr} ${GY} L ${xr} ${bottom} L ${xl} ${bottom} Z`}
                  fill={url(ids.soil)}
                />
                <Polygon
                  points={pts([xr, GY], [xr + bx, GY + by], [xr + bx, bottom + by], [xr, bottom])}
                  fill={c.soilDark}
                />
                {/* The water: its front face, its surface running back. */}
                <Polygon points={pts(fl, fr, add(fr, bx, by), add(fl, bx, by))} fill={c.waterTop} />
                <Path d={`M ${x0} ${GY} h ${W} v ${D} h ${-W} Z`} fill={url(ids.water)} />
                <Path d={`M ${x0} ${GY} h ${W} v ${D} h ${-W} Z`} fill={url(ids.top)} />
                {/* The water that passes the front in one second: v metres of the channel. */}
                <G opacity={on ? 1 : 0.4}>
                  <Polygon
                    points={pts(fl, fr, add(fr, vx, vy), add(fl, vx, vy))}
                    fill={c.chartHighlight}
                    fillOpacity={0.22}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    strokeLinejoin="round"
                  />
                  <Path
                    d={`M ${x0} ${GY} h ${W} v ${D} h ${-W} Z`}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                  />
                  {/* The flow, toward us. */}
                  <Line
                    x1={mid[0] + bx * 0.9}
                    y1={mid[1] + by * 0.9}
                    x2={mid[0] + bx * 0.25}
                    y2={mid[1] + by * 0.25}
                    stroke={c.waterDeep}
                    strokeWidth={chart.strokeHeavy}
                    strokeLinecap="round"
                  />
                  {(() => {
                    const [tx, ty] = [mid[0] + bx * 0.25, mid[1] + by * 0.25];
                    const t = Math.atan2(-by, -bx);
                    const a = (dt: number) =>
                      `${tx - 10 * Math.cos(t + dt)} ${ty - 10 * Math.sin(t + dt)}`;
                    return (
                      <Path
                        d={`M ${a(-0.5)} L ${tx} ${ty} L ${a(0.5)}`}
                        stroke={c.waterDeep}
                        strokeWidth={chart.strokeHeavy}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  })()}
                  <HaloText
                    x={Math.min(BW - 70, mid[0] + bx * 0.6 + 12)}
                    y={mid[1] + by * 0.6 - 6}
                    text={label(spec.speed, 'm/s')}
                    c={c}
                    size={chart.value}
                    bold
                    anchor="start"
                  />
                </G>
                {/* The width under the channel, the depth beside it. */}
                <Path
                  d={`M ${x0} ${bottom + 8} v 12 M ${x0 + W} ${bottom + 8} v 12 M ${x0} ${bottom + 14} H ${x0 + W}`}
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                />
                <HaloText
                  x={Math.max(60, Math.min(BW - 60, x0 + W / 2))}
                  y={bottom + 34}
                  text={label(spec.width, 'm')}
                  c={c}
                  size={chart.value}
                  bold
                />
                <Path
                  d={`M ${x0 - 12} ${GY} h 8 M ${x0 - 12} ${GY + D} h 8 M ${x0 - 8} ${GY} V ${GY + D}`}
                  stroke={c.card}
                  strokeWidth={1.5}
                />
                <HaloText
                  x={x0 - 16}
                  y={GY + D / 2 + 5}
                  text={label(spec.depth, 'm')}
                  c={c}
                  size={chart.value}
                  bold
                  anchor="end"
                />
                <HaloText
                  x={8}
                  y={16}
                  text={
                    slabSeen
                      ? 'Shaded: the water that passes in 1 second'
                      : 'The water passing in 1 second is too thin to see here'
                  }
                  c={c}
                  size={chart.label}
                  fill={c.chartHighlight}
                  bold
                  anchor="start"
                />
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {on
          ? `The cross-section is A = w × d = ${formatNumber(round(w))} × ${formatNumber(round(d))} = ${formatNumber(round(A))} m². Each second the water moves ${formatNumber(round(v))} m, so the slab passing is ${formatNumber(round(A))} × ${formatNumber(round(v))} = ${formatNumber(round(Q))} m³: Q = ${formatNumber(round(Q))} m³/s.`
          : 'Type the width, depth and speed to draw the channel.'}
      </Caption>
    </View>
  );
}
