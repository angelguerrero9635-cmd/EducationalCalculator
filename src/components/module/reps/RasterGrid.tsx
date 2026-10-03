/**
 * HC134 `rasterGrid` (RasterGridSpec in typesHe4h.ts). `extent`: a lake (a vector feature) on
 * the raster's grid, the cells whose centres fall in it filled, columns and rows counted, the
 * extent and the cell size written; past 40 cells a side each drawn square is b × b cells.
 * `window`: a 3 × 3 window of elevations, the centre cell lit, the arrow downhill and a compass
 * with the aspect. Flat; no handles.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { RasterExtentSpec, RasterWindowSpec } from '@/data/modules/typesHe4h';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import {
  LAKE,
  aspectName,
  downhillBearing,
  inside,
  rasterBlock,
  rasterCount,
  slopeOf,
} from './he4hMath';

const n3 = (x: number) => formatNumber(Number(x.toPrecision(3)));
const whole = (x: number) => formatNumber(Math.round(x));
/** A number squared as written: 0.6², (−0.4)². */
const sq = (x: number) => (x < 0 ? `(${n3(x)})²` : `${n3(x)}²`);

type V = number | string | undefined;

function useValues(calc: Calculator) {
  const rep = useRep(calc);
  const known = (v: V) => v !== undefined && (typeof v === 'number' || rep.known(v));
  const get = (v: V): number | undefined =>
    !known(v) ? undefined : typeof v === 'number' ? v : rep.shown(v as string);
  // A typed value reads as typed; a worked-out one to 3 figures.
  const say = (v: V, x: number, unit = '') =>
    typeof v === 'string' && rep.typed(v)
      ? rep.value(v, unit !== '')
      : `${n3(x)}${unit ? (unit === '%' || unit === '°' ? unit : ` ${unit}`) : ''}`;
  return { rep, get, say };
}

export function RasterGrid({
  spec,
  calc,
}: {
  spec: RasterExtentSpec | RasterWindowSpec;
  calc: Calculator;
}) {
  return spec.mode === 'window' ? (
    <RasterWindow spec={spec} calc={calc} />
  ) : (
    <RasterExtent spec={spec} calc={calc} />
  );
}

// ─── extent ──────────────────────────────────────────────────────────────────────

function RasterExtent({ spec, calc }: { spec: RasterExtentSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, say } = useValues(calc);
  const W = get(spec.width);
  const H = get(spec.height);
  const cell = get(spec.cell);
  const bytes = get(spec.bytes);
  const ok = W !== undefined && H !== undefined && W > 0 && H > 0;
  const cols = ok && cell ? rasterCount(W, cell) : undefined;
  const rows = ok && cell ? rasterCount(H, cell) : undefined;
  const b = cols !== undefined && rows !== undefined ? rasterBlock(cols, rows) : 1;
  const cells = cols !== undefined && rows !== undefined ? cols * rows : undefined;
  const size = cells !== undefined && bytes !== undefined ? (cells * bytes) / 1e6 : undefined;

  const lines: string[] = [];
  if (cols !== undefined && rows !== undefined) {
    lines.push(
      `Columns = 1,000 × ${say(spec.width, W!, 'km')} ÷ ${say(spec.cell, cell!, 'm')} = ${whole(cols)}; rows = 1,000 × ${say(spec.height, H!, 'km')} ÷ ${say(spec.cell, cell!, 'm')} = ${whole(rows)}.`,
      `Cells = ${whole(cols)} × ${whole(rows)} = ${whole(cells!)}${size !== undefined ? `; ${whole(cells!)} × ${say(spec.bytes, bytes!)} ${bytes === 1 ? 'byte' : 'bytes'} ÷ 10⁶ = ${say(spec.size, size, 'MB')}` : ''}.`,
    );
    if (b > 1) lines.push(`Each square drawn is ${whole(b)} × ${whole(b)} cells.`);
    lines.push(
      `Halving c to ${say(undefined, cell! / 2, 'm')} would make ${whole(4 * cells!)} cells, four times as many.`,
    );
  } else lines.push('Type the extent and the cell size to lay the grid.');

  return (
    <View>
      <Canvas aspect={(w) => extentLayout(w, W, H).h / w}>
        {({ w }) => {
          const L = extentLayout(w, W, H);
          const gx = L.x;
          const gy = L.y;
          const across = cols !== undefined ? Math.ceil(cols / b - 1e-9) : 0;
          const down = rows !== undefined ? Math.ceil(rows / b - 1e-9) : 0;
          // A drawn square is b cells; the last column or row may be cut by the extent's edge.
          const sqW = cols ? (L.gw * b) / cols : 0;
          const sqH = rows ? (L.gh * b) / rows : 0;
          const filled: { x: number; y: number; w: number; h: number }[] = [];
          for (let i = 0; i < across; i++)
            for (let j = 0; j < down; j++) {
              const x0 = i * sqW;
              const y0 = j * sqH;
              const x1 = Math.min(L.gw, x0 + sqW);
              const y1 = Math.min(L.gh, y0 + sqH);
              const centre = { x: (x0 + x1) / 2 / L.gw, y: (y0 + y1) / 2 / L.gh };
              if (inside(centre, LAKE))
                filled.push({ x: gx + x0, y: gy + y0, w: x1 - x0, h: y1 - y0 });
            }
          const lake = LAKE.map(
            (p) => `${(gx + p.x * L.gw).toFixed(1)},${(gy + p.y * L.gh).toFixed(1)}`,
          ).join(' ');
          const colsText = cols !== undefined ? `${whole(cols)} columns` : '';
          const rowsText = rows !== undefined ? `${whole(rows)} rows` : '';
          return (
            <Svg width={w} height={L.h}>
              <Rect x={gx} y={gy} width={L.gw} height={L.gh} fill={c.he4hMapPaper} />
              {filled.map((r, k) => (
                <Rect key={`f${k}`} x={r.x} y={r.y} width={r.w} height={r.h} fill={c.water} />
              ))}
              {/* The grid: every drawn square's edge. */}
              {Array.from({ length: across + 1 }, (_, i) => Math.min(L.gw, i * sqW)).map((x, i) => (
                <Line
                  key={`v${i}`}
                  x1={gx + x}
                  y1={gy}
                  x2={gx + x}
                  y2={gy + L.gh}
                  stroke={c.chartGrid}
                  strokeWidth={across > 25 ? 0.6 : 1}
                />
              ))}
              {Array.from({ length: down + 1 }, (_, j) => Math.min(L.gh, j * sqH)).map((y, j) => (
                <Line
                  key={`h${j}`}
                  x1={gx}
                  y1={gy + y}
                  x2={gx + L.gw}
                  y2={gy + y}
                  stroke={c.chartGrid}
                  strokeWidth={down > 25 ? 0.6 : 1}
                />
              ))}
              {/* The lake as a vector outline over its cells. */}
              <Polygon
                points={lake}
                fill="none"
                stroke={c.waterDeep}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
              />
              <Rect
                x={gx}
                y={gy}
                width={L.gw}
                height={L.gh}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {/* One square outlined: a cell, or a block of b × b cells. */}
              {across > 0 && down > 0 ? (
                <Rect
                  x={gx}
                  y={gy}
                  width={Math.min(sqW, L.gw)}
                  height={Math.min(sqH, L.gh)}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
              ) : null}
              {colsText ? (
                <ChartText
                  {...fitLabel(gx + L.gw / 2, colsText, chart.value, w)}
                  y={gy - 10}
                  fontSize={chart.value}
                  fontWeight="700"
                >
                  {colsText}
                </ChartText>
              ) : null}
              {rowsText ? (
                <ChartText
                  x={gx - 10}
                  y={gy + L.gh / 2}
                  textAnchor="middle"
                  fontSize={chart.value}
                  fontWeight="700"
                  transform={`rotate(-90 ${gx - 10} ${gy + L.gh / 2})`}
                >
                  {rowsText}
                </ChartText>
              ) : null}
              {ok ? (
                <G>
                  <ChartText x={gx + L.gw / 2} y={gy + L.gh + 18} textAnchor="middle">
                    {`width ${say(spec.width, W!, 'km')}`}
                  </ChartText>
                  <ChartText
                    x={gx + L.gw + 14}
                    y={gy + L.gh / 2}
                    textAnchor="middle"
                    transform={`rotate(90 ${gx + L.gw + 14} ${gy + L.gh / 2})`}
                  >
                    {`height ${say(spec.height, H!, 'km')}`}
                  </ChartText>
                </G>
              ) : null}
              {cell !== undefined && across > 0 ? (
                <ChartText x={gx} y={gy + L.gh + 36} fill={c.chartHighlight} fontWeight="700">
                  {b > 1
                    ? `□ ${whole(b)} × ${whole(b)} cells, ${say(undefined, (b * cell) / 1000, 'km')} a side`
                    : `□ one cell, c = ${say(spec.cell, cell, 'm')}`}
                </ChartText>
              ) : null}
              <G>
                <Rect x={w - 104} y={gy + L.gh + 26} width={12} height={12} fill={c.water} />
                <ChartText x={w - 88} y={gy + L.gh + 36}>
                  lake cells
                </ChartText>
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

/** The grid's box at width w, the extent's shape kept (a square until both sides are known). */
function extentLayout(w: number, W?: number, H?: number) {
  const ratio = W && H ? H / W : 1;
  const maxW = w - 60;
  const maxH = 240;
  const gw = Math.min(maxW, maxH / ratio);
  const gh = gw * ratio;
  return { x: (w - gw) / 2, y: 26, gw, gh, h: 26 + gh + 48 };
}

// ─── window ─────────────────────────────────────────────────────────────────────

function RasterWindow({ spec, calc }: { spec: RasterWindowSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, say } = useValues(calc);
  const cell = get(spec.cell);
  const z = {
    N: get(spec.north),
    S: get(spec.south),
    E: get(spec.east),
    W: get(spec.west),
    C: get(spec.center),
  };
  const all = z.N !== undefined && z.S !== undefined && z.E !== undefined && z.W !== undefined;
  const ex = all && cell ? (z.E! - z.W!) / (2 * cell) : undefined;
  const ny = all && cell ? (z.N! - z.S!) / (2 * cell) : undefined;
  const slope = ex !== undefined && ny !== undefined ? slopeOf(ex, ny) : undefined;
  const bearing = ex !== undefined && ny !== undefined ? downhillBearing(ex, ny) : undefined;
  const zs = [z.N, z.S, z.E, z.W, z.C].filter((x): x is number => x !== undefined);
  const lo = Math.min(...zs);
  const hi = Math.max(...zs);

  const lines: string[] = [];
  if (ex !== undefined && ny !== undefined) {
    lines.push(
      `East: (${say(spec.east, z.E!)} − ${say(spec.west, z.W!)}) ÷ (2 × ${say(spec.cell, cell!)}) = ${say(spec.dzdx, ex)}; north: (${say(spec.north, z.N!)} − ${say(spec.south, z.S!)}) ÷ (2 × ${say(spec.cell, cell!)}) = ${say(spec.dzdy, ny)}.`,
      `Slope = tan⁻¹√(${sq(ex)} + ${sq(ny)}) = ${say(spec.slope, slope!.deg, '°')} (${say(spec.percent, slope!.percent, '%')}).`,
    );
    if (bearing !== undefined)
      lines.push(
        `Downhill is −east, −north: the slope faces ${say(spec.aspect, bearing, '°')} from north (${aspectName(bearing)}).`,
      );
    else lines.push('The window is flat: no way is downhill, so there is no aspect.');
  } else lines.push('Type the cell size and the four elevations to find the slope.');

  return (
    <View>
      <Canvas aspect={(w) => windowLayout(w).h / w}>
        {({ w }) => {
          const L = windowLayout(w);
          const cellAt = (i: number, j: number) => ({ x: L.x + i * L.g, y: L.y + j * L.g });
          const shade = (v: number | undefined) =>
            v === undefined || hi === lo ? 0.12 : 0.1 + (0.5 * (v - lo)) / (hi - lo);
          const named: [string, number, number, number | undefined, V][] = [
            ['N', 1, 0, z.N, spec.north],
            ['W', 0, 1, z.W, spec.west],
            ['E', 2, 1, z.E, spec.east],
            ['S', 1, 2, z.S, spec.south],
          ];
          const mid = cellAt(1, 1);
          const cx = mid.x + L.g / 2;
          const cy = mid.y + L.g / 2;
          const rad = bearing !== undefined ? (bearing * Math.PI) / 180 : 0;
          const ux = Math.sin(rad);
          const uy = -Math.cos(rad);
          const arm = L.g * 0.42;
          return (
            <Svg width={w} height={L.h}>
              {Array.from({ length: 9 }, (_, k) => {
                const i = k % 3;
                const j = Math.floor(k / 3);
                const p = cellAt(i, j);
                const one = named.find((n) => n[1] === i && n[2] === j);
                const lit = i === 1 && j === 1;
                const v = one ? one[3] : lit ? z.C : undefined;
                return (
                  <G key={`k${k}`}>
                    <Rect
                      x={p.x}
                      y={p.y}
                      width={L.g}
                      height={L.g}
                      fill={one || lit ? c.he4hContour : c.chartSurface}
                      fillOpacity={one || lit ? shade(v) : 1}
                      stroke={lit ? c.chartHighlight : c.chartGrid}
                      strokeWidth={lit ? chart.strokeHeavy : 1}
                    />
                    {one ? (
                      <G>
                        <ChartText x={p.x + 5} y={p.y + 15} fill={c.chartMuted}>
                          {`z_${one[0]}`}
                        </ChartText>
                        {v !== undefined ? (
                          <ChartText
                            x={p.x + L.g / 2}
                            y={p.y + L.g / 2 + 10}
                            textAnchor="middle"
                            fontSize={chart.emphasis}
                            fontWeight="700"
                          >
                            {say(one[4], v, 'm')}
                          </ChartText>
                        ) : null}
                      </G>
                    ) : null}
                  </G>
                );
              })}
              {/* The arrow downhill from the centre cell. */}
              {bearing !== undefined ? (
                <G>
                  <Line
                    x1={cx - ux * arm}
                    y1={cy - uy * arm}
                    x2={cx + ux * arm}
                    y2={cy + uy * arm}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <Path
                    d={`M${cx + ux * (arm + 4)},${cy + uy * (arm + 4)}L${cx + ux * (arm - 8) - uy * 6},${cy + uy * (arm - 8) + ux * 6}L${cx + ux * (arm - 8) + uy * 6},${cy + uy * (arm - 8) - ux * 6}Z`}
                    fill={c.chartHighlight}
                  />
                </G>
              ) : null}
              {cell !== undefined ? (
                <ChartText x={L.x + (3 * L.g) / 2} y={L.y + 3 * L.g + 18} textAnchor="middle">
                  {`each cell ${say(spec.cell, cell, 'm')} a side`}
                </ChartText>
              ) : null}
              {/* The compass: north up, the aspect swept clockwise to the downhill way. */}
              <Circle
                cx={L.kx}
                cy={L.ky}
                r={L.kr}
                fill={c.chartSurface}
                stroke={c.chartGrid}
                strokeWidth={1}
              />
              {[0, 90, 180, 270].map((d) => {
                const r = (d * Math.PI) / 180;
                return (
                  <ChartText
                    key={`n${d}`}
                    x={L.kx + Math.sin(r) * (L.kr + 10)}
                    y={L.ky - Math.cos(r) * (L.kr + 10) + 4}
                    textAnchor="middle"
                    fontWeight={d === 0 ? '700' : '400'}
                    fill={d === 0 ? c.chartInk : c.chartMuted}
                  >
                    {['N', 'E', 'S', 'W'][d / 90]!}
                  </ChartText>
                );
              })}
              <Line
                x1={L.kx}
                y1={L.ky}
                x2={L.kx}
                y2={L.ky - L.kr}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              {bearing !== undefined ? (
                <G>
                  <Path
                    d={arc(L.kx, L.ky, L.kr * 0.45, bearing)}
                    fill="none"
                    stroke={c.he4hContour}
                    strokeWidth={chart.stroke}
                  />
                  <Line
                    x1={L.kx}
                    y1={L.ky}
                    x2={L.kx + ux * L.kr}
                    y2={L.ky + uy * L.kr}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <ChartText
                    x={L.kx}
                    y={L.ky + L.kr + 34}
                    textAnchor="middle"
                    fontWeight="700"
                    fill={c.he4hContour}
                  >
                    {`aspect ${say(spec.aspect, bearing, '°')} ${aspectName(bearing)}`}
                  </ChartText>
                </G>
              ) : null}
              {slope !== undefined ? (
                <ChartText
                  x={L.kx}
                  y={L.ky + L.kr + 52}
                  textAnchor="middle"
                  fontWeight="700"
                  fill={c.chartHighlight}
                >
                  {`slope ${say(spec.slope, slope.deg, '°')}`}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

/** A clockwise arc from north to `deg` round (x, y). */
function arc(x: number, y: number, r: number, deg: number) {
  const t = (deg * Math.PI) / 180;
  const ex = x + r * Math.sin(t);
  const ey = y - r * Math.cos(t);
  return `M${x},${y - r}A${r},${r} 0 ${deg > 180 ? 1 : 0} 1 ${ex.toFixed(1)},${ey.toFixed(1)}`;
}

function windowLayout(w: number) {
  const g = Math.min(66, (w - 150) / 3);
  const kr = Math.min(52, (w - 3 * g - 60) / 2);
  return { g, x: 10, y: 10, kx: w - kr - 22, ky: 20 + kr, kr, h: 10 + 3 * g + 30 };
}
