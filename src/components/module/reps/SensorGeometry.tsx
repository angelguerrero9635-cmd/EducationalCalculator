/**
 * HC137 `sensorGeometry` (SensorGeometrySpec in typesHe4h.ts): a satellite at H over flat
 * ground, its field of view fanned to the swath, all to scale; the one pixel under it, far too
 * small to see, enlarged in a box with its IFOV cone. The satellite is painted; the rest flat.
 * No handles.
 */
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { SensorGeometrySpec } from '@/data/modules/typesHe4h';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { sensorLayout, sensorPixel, sensorSwath } from './he4hMath';
import { Deepen, Metal, TopLight, url, usePaintIds } from './paint';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
const n4 = (x: number) => formatNumber(Number(x.toPrecision(4)));
type V = number | string | undefined;

const HEIGHT = 330;

export function SensorGeometry({ spec, calc }: { spec: SensorGeometrySpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('land', 'light', 'body');
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  const say = (v: V, x: number, unit: string, f = n3) =>
    typeof v === 'string' && rep.typed(v)
      ? rep.value(v)
      : `${f(x)}${unit === '°' ? '°' : ` ${unit}`}`;
  const H = get(spec.altitude);
  const ifov = get(spec.ifov);
  const fov = get(spec.fov);
  const pixel = H !== undefined && ifov !== undefined ? sensorPixel(H, ifov) : undefined;
  const swath = H !== undefined && fov !== undefined ? sensorSwath(H, fov) : undefined;

  const lines: string[] = [];
  if (pixel !== undefined)
    lines.push(
      `Pixel = H × IFOV = ${say(spec.altitude, H!, 'km')} × ${say(spec.ifov, ifov!, 'μrad')} = ${n4(H! * 1000)} m × ${formatNumber(ifov! / 1e6)} = ${say(spec.pixel, pixel, 'm')}.`,
    );
  if (swath !== undefined)
    lines.push(
      `Swath = 2H tan(FOV ÷ 2) = 2 × ${say(spec.altitude, H!, 'km')} × tan ${n3(fov! / 2)}° = ${say(spec.swath, swath, 'km', n4)}.`,
    );
  if (H !== undefined && fov !== undefined)
    lines.push('H, the fan and the swath are drawn to scale; the pixel is enlarged in the box.');
  else lines.push('Type H and the FOV to draw the fan.');

  return (
    <View>
      <Canvas aspect={(w) => HEIGHT / w}>
        {({ w }) => {
          const L = sensorLayout(w, HEIGHT, H ?? 1, fov ?? 20);
          const sat = { x: L.cx, y: L.satY };
          const halfPx = L.halfSwath;
          const inset = { x: w - 126, y: 8, s: 120 };
          return (
            <Svg width={w} height={HEIGHT}>
              <Defs>
                <Deepen id={ids.land} from={c.he4hLand} to={c.he4hLandDeep} />
                <TopLight id={ids.light} />
                <Metal id={ids.body} light={c.chartSurface} dark={c.chartMuted} />
              </Defs>
              {/* The ground: flat, painted land. */}
              <Rect x={0} y={L.ground} width={w} height={16} fill={url(ids.land)} />
              <Line
                x1={0}
                y1={L.ground}
                x2={w}
                y2={L.ground}
                stroke={c.soilDark}
                strokeWidth={chart.strokeLight}
              />
              {/* The field of view, fanned to the swath. */}
              {H !== undefined && fov !== undefined ? (
                <G>
                  <Polygon
                    points={`${sat.x},${sat.y} ${L.cx - halfPx},${L.ground} ${L.cx + halfPx},${L.ground}`}
                    fill={c.chartHighlight}
                    fillOpacity={0.12}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeLight}
                  />
                  <Path
                    d={`M${sat.x - 22 * Math.sin(L.half)},${sat.y + 22 * Math.cos(L.half)}A22,22 0 0 0 ${sat.x + 22 * Math.sin(L.half)},${sat.y + 22 * Math.cos(L.half)}`}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                  />
                  <ChartText
                    {...fitLabel(
                      sat.x - 30,
                      `FOV = ${say(spec.fov, fov, '°')}`,
                      chart.label,
                      w,
                      'end',
                    )}
                    y={sat.y + 4}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  >
                    {`FOV = ${say(spec.fov, fov, '°')}`}
                  </ChartText>
                  {/* The swath under the ground. */}
                  <Line
                    x1={L.cx - halfPx}
                    y1={L.ground + 26}
                    x2={L.cx + halfPx}
                    y2={L.ground + 26}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                  />
                  {[-1, 1].map((d) => (
                    <Line
                      key={`s${d}`}
                      x1={L.cx + d * halfPx}
                      y1={L.ground + 20}
                      x2={L.cx + d * halfPx}
                      y2={L.ground + 32}
                      stroke={c.chartInk}
                      strokeWidth={1.2}
                    />
                  ))}
                  {swath !== undefined ? (
                    <ChartText
                      {...fitLabel(
                        L.cx,
                        `swath = ${say(spec.swath, swath, 'km', n4)}`,
                        chart.label,
                        w,
                      )}
                      y={L.ground + 46}
                      fontWeight="700"
                    >
                      {`swath = ${say(spec.swath, swath, 'km', n4)}`}
                    </ChartText>
                  ) : null}
                </G>
              ) : null}
              {/* H along the nadir line. */}
              <Line
                x1={sat.x}
                y1={sat.y + 10}
                x2={sat.x}
                y2={L.ground}
                stroke={c.chartInk}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
              {H !== undefined ? (
                <ChartText
                  x={sat.x - 6}
                  y={(sat.y + L.ground) / 2 + 4}
                  textAnchor="end"
                  fontWeight="700"
                  halo
                >
                  {`H = ${say(spec.altitude, H, 'km', n4)}`}
                </ChartText>
              ) : null}
              {/* The satellite: a metal body between two solar panels. */}
              <G>
                <Rect
                  x={sat.x - 24}
                  y={sat.y - 12}
                  width={16}
                  height={9}
                  fill={c.satellitePanel}
                  stroke={c.chartInk}
                  strokeWidth={0.8}
                />
                <Rect
                  x={sat.x + 8}
                  y={sat.y - 12}
                  width={16}
                  height={9}
                  fill={c.satellitePanel}
                  stroke={c.chartInk}
                  strokeWidth={0.8}
                />
                <Rect x={sat.x - 24} y={sat.y - 12} width={48} height={9} fill={url(ids.light)} />
                <Rect
                  x={sat.x - 8}
                  y={sat.y - 16}
                  width={16}
                  height={16}
                  rx={2}
                  fill={url(ids.body)}
                  stroke={c.chartInk}
                  strokeWidth={0.8}
                />
                <Rect x={sat.x - 3} y={sat.y} width={6} height={4} fill={c.chartInk} />
              </G>
              {/* The pixel, enlarged: the IFOV cone to one ground cell, led from the nadir point. */}
              <G>
                <Line
                  x1={inset.x + inset.s / 2}
                  y1={inset.y + 130}
                  x2={sat.x + 2}
                  y2={L.ground - 2}
                  stroke={c.he4hCase}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <Rect
                  x={inset.x}
                  y={inset.y}
                  width={inset.s}
                  height={130}
                  fill={c.background}
                  stroke={c.chartGrid}
                />
                <ChartText
                  x={inset.x + inset.s / 2}
                  y={inset.y + 15}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  pixel, enlarged
                </ChartText>
                <Path
                  d={`M${inset.x + inset.s / 2},${inset.y + 22}L${inset.x + inset.s / 2 - 16},${inset.y + 66}L${inset.x + inset.s / 2 + 16},${inset.y + 66}Z`}
                  fill={c.he4hCase}
                  fillOpacity={0.15}
                  stroke={c.he4hCase}
                  strokeWidth={1.2}
                />
                <Rect
                  x={inset.x + inset.s / 2 - 16}
                  y={inset.y + 66}
                  width={32}
                  height={8}
                  fill={url(ids.land)}
                  stroke={c.he4hCase}
                  strokeWidth={1.5}
                />
                {ifov !== undefined ? (
                  <ChartText
                    x={inset.x + inset.s / 2}
                    y={inset.y + 120}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fill={c.he4hCase}
                    halo
                  >
                    {`IFOV ${say(spec.ifov, ifov, 'μrad')}`}
                  </ChartText>
                ) : null}
                {pixel !== undefined ? (
                  <ChartText
                    x={inset.x + inset.s / 2}
                    y={inset.y + 96}
                    textAnchor="middle"
                    fontWeight="700"
                    fill={c.he4hCase}
                  >
                    {say(spec.pixel, pixel, 'm')}
                  </ChartText>
                ) : null}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
