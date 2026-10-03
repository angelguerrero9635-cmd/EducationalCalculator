/**
 * Explore figure `circulationCells` (HC140, `typesHe4g.ts`): Earth from the side, painted, with
 * the three cells of each hemisphere drawn flat over its right limb (Hadley 0–30°, Ferrel 30–60°,
 * polar 60–90°; rising and sinking air at their edges), the surface winds on its face (trades
 * toward the equator, westerlies toward the pole, polar easterlies), and the pressure belts named
 * at the left limb (ITCZ, subtropical high, subpolar low, polar high). A scene lights one.
 */
import { Circle, Defs, G, Line, Path } from 'react-native-svg';

import type { CirculationLit, CirculationScene } from '@/data/modules/typesHe4g';
import { chart, usePalette } from '@/theme';

import { ChartText } from '../reps/common';
import { Arrow } from '../reps/he1fKit';
import { CELL_EDGES, CELLS, windArrow } from '../reps/he4gMath';
import { Ball, url, usePaintIds } from '../reps/paint';
import { Board, HaloText } from './earthKit';

const H = 350;
const CX = 175;
const CY = 175;
const R = 115;
/** The cells' loops sit in a ring just above the limb. */
const R1 = R + 6;
const R2 = R + 36;
const D = Math.PI / 180;

/** The point at latitude φ (north positive) on the right limb, at radius r. */
const at = (phi: number, r: number): [number, number] => [
  CX + r * Math.cos(phi * D),
  CY - r * Math.sin(phi * D),
];

/** An arc along radius r from latitude a to b (either way), as path commands after a move. */
function arc(r: number, a: number, b: number) {
  const [x, y] = at(b, r);
  const sweep = b > a ? 0 : 1;
  return `A ${r} ${r} 0 0 ${sweep} ${x.toFixed(1)} ${y.toFixed(1)}`;
}

/** An arrowhead at latitude φ on radius r pointing poleward (dir 1) or equatorward (−1). */
function head(phi: number, r: number, dir: number, north: boolean) {
  const [x, y] = at(phi, r);
  // The tangent toward increasing latitude (screen coords), flipped by dir and hemisphere.
  const s = north ? 1 : -1;
  const t = [-Math.sin(phi * D), -Math.cos(phi * D)].map((v) => v * dir * s) as [number, number];
  const n: [number, number] = [t[1], -t[0]];
  const p = (k: number, m: number) =>
    `${(x + t[0] * k + n[0] * m).toFixed(1)} ${(y + t[1] * k + n[1] * m).toFixed(1)}`;
  return `M ${p(5, 0)} L ${p(-5, 5)} L ${p(-5, -5)} Z`;
}

export function CirculationFigure({ scene }: { scene: CirculationScene }) {
  const c = usePalette();
  const ids = usePaintIds('earth');
  const lit = scene.lit;
  const cellColor = { hadley: c.he4gHadley, ferrel: c.he4gFerrel, polar: c.he4gPolar };
  const isCell = lit === 'hadley' || lit === 'ferrel' || lit === 'polar';
  const isWind = lit === 'trades' || lit === 'westerlies' || lit === 'easterlies';
  const isBelt = lit === 'itcz' || lit === 'highs' || lit === 'lows';
  const fade = (on: boolean) => (lit === undefined || on ? 1 : 0.3);
  const beltOn = (b: CirculationLit) => lit === undefined || lit === b;

  // The pressure belts at the cells' edges: rising air (low) at 0° and 60°, sinking (high) at 30°
  // and 90°, named in the north at the left limb.
  const belts: { phi: number; high: boolean; name: string[]; belt: CirculationLit }[] = [
    { phi: 0, high: false, name: ['ITCZ'], belt: 'itcz' },
    { phi: 30, high: true, name: ['subtropical', 'high'], belt: 'highs' },
    { phi: 60, high: false, name: ['subpolar low'], belt: 'lows' },
    { phi: 90, high: true, name: [], belt: 'highs' },
  ];

  return (
    <Board height={H}>
      <Defs>
        <Ball id={ids.earth} color={c.he4gOcean} />
      </Defs>
      {/* The globe and its parallels at the cells' edges. */}
      <Circle cx={CX} cy={CY} r={R} fill={url(ids.earth)} stroke={c.chartInk} strokeWidth={1} />
      {CELL_EDGES.slice(0, 3).flatMap((phi) =>
        (phi === 0 ? [0] : [phi, -phi]).map((p) => (
          <Line
            key={p}
            x1={CX - R * Math.cos(p * D)}
            y1={CY - R * Math.sin(p * D)}
            x2={CX + R * Math.cos(p * D)}
            y2={CY - R * Math.sin(p * D)}
            stroke={c.he4gOnGround}
            strokeWidth={p === 0 ? 1.6 : 1}
            strokeDasharray={p === 0 ? undefined : chart.dash}
          />
        )),
      )}
      {/* The cells, both hemispheres. */}
      {CELLS.flatMap((cell) =>
        [true, false].map((north) => {
          const s = north ? 1 : -1;
          const [a, b] = [cell.from * s, cell.to * s];
          const [ax, ay] = at(a, R1);
          const [bx, by] = at(b, R2);
          const col = cellColor[cell.id];
          const on = isCell ? lit === cell.id : !isWind && !isBelt;
          // Surface (inner) flow toward the equator in Hadley and polar cells, poleward in Ferrel.
          const surface = cell.toward === 'pole' ? 1 : -1;
          const mid = (cell.from + cell.to) / 2;
          return (
            <G key={`${cell.id}${north}`} opacity={fade(on || (!isCell && lit !== undefined))}>
              <Path
                d={`M ${ax.toFixed(1)} ${ay.toFixed(1)} ${arc(R1, a, b)} L ${bx.toFixed(1)} ${by.toFixed(1)} ${arc(R2, b, a)} Z`}
                stroke={col}
                strokeWidth={lit === cell.id ? 3.5 : 2}
                fill={col}
                fillOpacity={0.12}
                strokeLinejoin="round"
              />
              <Path d={head(mid * s, R1, surface, north)} fill={col} />
              <Path d={head(mid * s, R2, -surface, north)} fill={col} />
            </G>
          );
        }),
      )}
      {CELLS.map((cell) => {
        const [x, y] = at((cell.from + cell.to) / 2, (R1 + R2) / 2);
        return (
          <ChartText
            key={cell.id}
            x={x}
            y={y + 4}
            fontSize={chart.label}
            fontWeight="700"
            textAnchor="middle"
            fill={cellColor[cell.id]}
            halo={c.card}
            opacity={fade(lit === cell.id || !isCell)}
          >
            {cell.name}
          </ChartText>
        );
      })}
      {/* Latitudes at the right of the ring. */}
      {[0, 30, -30, 60, -60].map((p) => {
        const [x, y] = at(p, R2 + 8);
        return (
          <ChartText key={p} x={x} y={y + 4} fontSize={chart.label} fill={c.chartMuted}>
            {p === 0 ? '0°' : `${Math.abs(p)}°${p > 0 ? 'N' : 'S'}`}
          </ChartText>
        );
      })}
      {/* Surface winds on the face, by band; named in the north. */}
      {CELLS.flatMap((cell) =>
        [true, false].map((north) => {
          const mid = ((cell.from + cell.to) / 2) * (north ? 1 : -1);
          const [dx, dy] = windArrow(cell, north);
          const y = CY - R * Math.sin(mid * D);
          const x = CX + (cell.id === 'polar' ? 16 : 30);
          const scale = cell.id === 'polar' ? 0.7 : 1;
          return (
            <G key={`w${cell.id}${north}`} opacity={fade(lit === cell.wind || !isWind)}>
              <Arrow
                x1={x - (dx * scale) / 2}
                y1={y - (dy * scale) / 2}
                x2={x + (dx * scale) / 2}
                y2={y + (dy * scale) / 2}
                color={c.he4gOnGround}
                width={lit === cell.wind ? 3.5 : 2.2}
              />
            </G>
          );
        }),
      )}
      {(
        [
          ['trade winds', CX - 8, CY - R * Math.sin(15 * D) + 4, 'end', 'trades'],
          ['westerlies', CX - 8, CY - R * Math.sin(35 * D) + 4, 'end', 'westerlies'],
          ['polar easterlies', CX - 30, CY - R - 24, 'end', 'easterlies'],
        ] as const
      ).map(([t, x, y, anchor, w]) => (
        <G key={t} opacity={fade(lit === w || !isWind)}>
          <HaloText
            x={x}
            y={y}
            text={t}
            c={c}
            size={chart.label}
            bold={lit === w}
            anchor={anchor}
          />
        </G>
      ))}
      {/* The pressure belts: H and L at the limb, named outside it in the north. */}
      {belts.flatMap(({ phi, high, belt }) =>
        (phi === 0 ? [phi] : [phi, -phi]).map((p) => {
          const [x, y] =
            Math.abs(p) === 90
              ? [CX - 14, CY - Math.sign(p || 1) * (R + 9)]
              : [CX - R * Math.cos(p * D) + 14, CY - R * Math.sin(p * D)];
          return (
            <ChartText
              key={`hl${p}`}
              x={x}
              y={y + 5}
              fontSize={chart.emphasis}
              fontWeight="800"
              textAnchor="middle"
              fill={high ? c.pressureHigh : c.pressureLow}
              halo={c.card}
              opacity={fade(beltOn(belt) && !isCell && !isWind)}
            >
              {high ? 'H' : 'L'}
            </ChartText>
          );
        }),
      )}
      {belts.flatMap(({ phi, name, belt }) => {
        const top = phi === 90;
        const x = top ? CX - 12 : CX - R * Math.cos(phi * D) - 6;
        const y = top ? CY - R - 6 : CY - R * Math.sin(phi * D) + (phi === 0 ? 4 : 16);
        return name.map((line, i) => (
          <G key={`${phi}${line}`} opacity={fade(beltOn(belt) && !isCell && !isWind)}>
            <HaloText
              x={x}
              y={y + i * 15}
              text={line}
              c={c}
              size={chart.label}
              bold={lit === belt}
              anchor="end"
            />
          </G>
        ));
      })}
    </Board>
  );
}
