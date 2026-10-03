/**
 * HC162 `scaffold` (ScaffoldSpec in typesHe4k.ts): an open-cell cube, three cells a side, painted
 * in isometric: square struts along every cell edge, as thick as the relative density makes
 * them (3s² − 2s³ = ρ∗ ÷ ρ_s), pores open between. Beside it the cell's volume as a bar, solid
 * below and pores above. No handles.
 */
import { View } from 'react-native';
import { G, Polygon, Rect } from 'react-native-svg';

import type { ScaffoldSpec } from '@/data/modules/typesHe4k';
import { usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Caption, ChartText } from './common';
import { BW, Board } from './fluidKit';
import { latticeStruts, strutFor, strutShare, type Box } from './he4kMath';
import { n3, useReader } from './he4kKit';

const CELLS = 3;
const A = 30;
const COS = Math.cos(Math.PI / 6);
/** The cube's middle (x = y = z = 1.5 projects here). */
const OX = 110;
const OY = 118;
const H = 236;

/** Isometric: x to the lower right, y to the lower left, z up. */
const px = (x: number, y: number, z: number): [number, number] => [
  OX + (x - y) * COS * A,
  OY + ((x + y) * 0.5 - z) * A,
];

const pts = (corners: [number, number, number][]) =>
  corners
    .map(([x, y, z]) => px(x, y, z))
    .map(([u, v]) => `${u.toFixed(1)},${v.toFixed(1)}`)
    .join(' ');

/** The three faces a viewer up the (1, 1, 1) diagonal sees: top, +x and +y. */
function faces([x0, x1, y0, y1, z0, z1]: Box) {
  return {
    top: pts([
      [x0, y0, z1],
      [x1, y0, z1],
      [x1, y1, z1],
      [x0, y1, z1],
    ]),
    right: pts([
      [x1, y0, z0],
      [x1, y1, z0],
      [x1, y1, z1],
      [x1, y0, z1],
    ]),
    left: pts([
      [x0, y1, z0],
      [x1, y1, z0],
      [x1, y1, z1],
      [x0, y1, z1],
    ]),
  };
}

export function Scaffold({ spec, calc }: { spec: ScaffoldSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, text, say } = useReader(calc);
  const rs = get(spec.rhoS);
  const rStar = get(spec.rhoStar);
  const es = get(spec.es);
  const known = rs !== undefined && rStar !== undefined && rs > 0 && rStar > 0;
  const wrong = known && rStar >= rs;
  const rel = known ? Math.min(1, rStar / rs) : undefined;
  const s = rel === undefined ? undefined : wrong ? 1 : strutFor(rel);
  const drawn = s === undefined ? undefined : strutShare(s);
  const struts = s === undefined ? [] : latticeStruts(CELLS, s);
  const estar = es !== undefined && rel !== undefined && !wrong ? es * rel * rel : undefined;

  const lines: string[] = [];
  if (wrong)
    lines.push(
      `ρ∗ = ${text(spec.rhoStar)} is not below ρ_s = ${text(spec.rhoS)}: a scaffold with pores is lighter than its solid, so ρ∗ < ρ_s.`,
    );
  else if (rel !== undefined) {
    lines.push(
      `ρ∗ ÷ ρ_s = ${text(spec.rhoStar, '', false)} ÷ ${text(spec.rhoS, '', false)} = ${say(spec.relative, rel)}: the struts are ${n3(s!)} of a cell wide, so 3(${n3(s!)})² − 2(${n3(s!)})³ = ${n3(drawn!)} of each cell is solid and ${say(spec.porosity, 100 * (1 - rel), '%')} is pore.`,
    );
    if (estar !== undefined)
      lines.push(
        `Open cells bend at their struts: E∗ = E_s(ρ∗ ÷ ρ_s)² = ${text(spec.es, '', false)} × ${n3(rel)}² = ${say(spec.estar, estar, 'MPa')}.`,
      );
  } else lines.push('Type ρ_s and ρ∗ to build the struts.');

  const BAR = { x: 262, y0: 34, y1: 194, w: 34 };
  const barH = BAR.y1 - BAR.y0;

  return (
    <View>
      <Board
        height={H}
        draw={() => (
          <G>
            <G opacity={wrong ? 0.4 : 1}>
              {struts.map((b, i) => {
                const f = faces(b);
                return (
                  <G key={`s${i}`}>
                    <Polygon
                      points={f.left}
                      fill={c.he4kStrut}
                      stroke={c.he4kStrutEdge}
                      strokeWidth={0.5}
                      strokeOpacity={0.6}
                    />
                    <Polygon points={f.left} fill={c.shade} opacity={0.14} />
                    <Polygon
                      points={f.right}
                      fill={c.he4kStrut}
                      stroke={c.he4kStrutEdge}
                      strokeWidth={0.5}
                      strokeOpacity={0.6}
                    />
                    <Polygon points={f.right} fill={c.shade} opacity={0.3} />
                    <Polygon
                      points={f.top}
                      fill={c.he4kStrut}
                      stroke={c.he4kStrutEdge}
                      strokeWidth={0.5}
                      strokeOpacity={0.6}
                    />
                    <Polygon points={f.top} fill={c.shine} opacity={0.25 * c.sheen} />
                  </G>
                );
              })}
            </G>
            {/* The cell's volume: solid below, pores above. */}
            {drawn !== undefined ? (
              <G>
                <Rect
                  x={BAR.x}
                  y={BAR.y0}
                  width={BAR.w}
                  height={barH * (1 - drawn)}
                  fill={c.he4kPore}
                />
                <Rect
                  x={BAR.x}
                  y={BAR.y1 - barH * drawn}
                  width={BAR.w}
                  height={barH * drawn}
                  fill={c.he4kStrut}
                />
                <Rect
                  x={BAR.x}
                  y={BAR.y1 - barH * drawn}
                  width={BAR.w}
                  height={barH * drawn}
                  fill={c.shade}
                  opacity={0.14}
                />
                <Rect
                  x={BAR.x}
                  y={BAR.y0}
                  width={BAR.w}
                  height={barH}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <ChartText x={BAR.x + BAR.w / 2} y={BAR.y0 - 8} textAnchor="middle">
                  {`${say(spec.porosity, 100 * (1 - rel!), '%')} pore`}
                </ChartText>
                <ChartText x={BAR.x + BAR.w / 2} y={BAR.y1 + 16} textAnchor="middle">
                  {`${n3(100 * drawn)}% solid`}
                </ChartText>
              </G>
            ) : null}
            {rel !== undefined ? (
              <ChartText x={6} y={H - 10} fontWeight="700">
                {`ρ∗ ÷ ρ_s = ${say(spec.relative, rel)}`}
              </ChartText>
            ) : null}
            {estar !== undefined ? (
              <ChartText x={BW - 6} y={H - 10} textAnchor="end">
                {`E∗ = ${say(spec.estar, estar, 'MPa')}`}
              </ChartText>
            ) : null}
          </G>
        )}
      />
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
