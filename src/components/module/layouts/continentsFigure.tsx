import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { COASTS, ERAS, PIECES, SPOTS, type Piece } from './continentShapes';
import { ChartText } from '../reps/common';
import { BOARD_W, Board, Chip, chipW } from './earthKit';

/**
 * The continents over time (Grade 6): a flat blue ocean with a faint latitude grid and the
 * continents in land green, each ringed by its pale continental shelf (the edge that really
 * fits). The same outlines are moved and turned between 250 and 150 million years ago and
 * today. Clue scenes add their evidence where it is found: Mesosaurus fossils on a band across
 * South America and Africa, one mountain belt hatched across North America, Greenland and
 * Europe, ice-sheet scratches pointing away from one ice cap with coal in Antarctica, or the
 * two coasts that fit, with South America's outline slid back against Africa.
 */

const H = 212;
/** Latitude lines every 30°, the equator at 0 (board rows). */
const LATS = [60, 30, 0, -30, -60].map((lat) => ({ lat, y: 30 + (84 - lat) * 1.1 }));
const ORDER: Piece[] = ['an', 'au', 'in', 'eu', 'af', 'sa', 'na'];

type Place = readonly [number, number, number];

/**
 * Names set in the open ocean, with a leader, where the land is too crowded for them (India
 * and Australia while they sit together south of Africa).
 */
const OUTSIDE: Partial<Record<0 | 150 | 250, Partial<Record<Piece, [number, number]>>>> = {
  250: { in: [278, 146], au: [326, 197] },
  150: { in: [296, 147], au: [328, 199] },
};

/** A point in a piece's units, on the board where the piece sits. */
function at(place: Place, p: readonly [number, number]): [number, number] {
  const t = (place[2] * Math.PI) / 180;
  return [
    place[0] + p[0] * Math.cos(t) - p[1] * Math.sin(t),
    place[1] + p[0] * Math.sin(t) + p[1] * Math.cos(t),
  ];
}

const move = (place: Place) => `translate(${place[0]} ${place[1]}) rotate(${place[2]})`;

/** A small Mesosaurus: a long-snouted swimming reptile with a long tail, facing right. */
function Mesosaurus({ x, y, c }: { x: number; y: number; c: Palette }) {
  return (
    <G transform={`translate(${x} ${y}) scale(0.75)`}>
      <Path
        d="M -16 1 C -12 -1 -6 -2.6 0 -2.6 C 5 -2.6 8 -1.8 13 -1 L 13 0.4 C 8 1 4 2.2 0 2.4 C -6 2.6 -11 2 -16 1 Z"
        fill={c.chartInk}
      />
      <Path
        d="M -4 2 L -6 5 M 3 2 L 5 5 M -3 -2 L -5 -5 M 2 -2 L 4 -5"
        stroke={c.chartInk}
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </G>
  );
}

export function ContinentsFigure({
  continents,
  c,
}: {
  continents: NonNullable<Scene['continents']>;
  c: Palette;
}) {
  const era = ERAS[continents.age];
  const clue = continents.clue;
  const where = (spot: readonly [Piece, readonly [number, number]]) => at(era[spot[0]], spot[1]);
  const pill = continents.age === 0 ? 'today' : `${continents.age} million years ago`;
  const keys: { text: string; color: string }[] = [];

  let evidence = null;
  if (clue === 'fossils') {
    const [a, b] = SPOTS.fossils.map(where) as [[number, number], [number, number]];
    keys.push({ text: 'Mesosaurus fossils', color: c.chartSecond });
    evidence = (
      <G>
        <Line
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
          stroke={c.chartSecond}
          strokeWidth={12}
          strokeOpacity={0.8}
          strokeLinecap="round"
        />
        <Mesosaurus x={a[0]} y={a[1]} c={c} />
        <Mesosaurus x={b[0]} y={b[1]} c={c} />
      </G>
    );
  } else if (clue === 'rocks') {
    const pts = SPOTS.rocks.map(where);
    const d = 'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ');
    // Hatching across the belt: short strokes square to it, every 6 px.
    const ticks: string[] = [];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]!;
      const [x1, y1] = pts[i]!;
      const len = Math.hypot(x1 - x0, y1 - y0);
      const [ux, uy] = [(x1 - x0) / len, (y1 - y0) / len];
      for (let s = 0; s < len; s += 6) {
        const [px, py] = [x0 + ux * s, y0 + uy * s];
        ticks.push(`M ${px - uy * 5} ${py + ux * 5} L ${px + uy * 5} ${py - ux * 5}`);
      }
    }
    keys.push({ text: 'same mountain rocks', color: c.rock5 });
    evidence = (
      <G>
        <Path
          d={d}
          stroke={c.rock5}
          strokeWidth={11}
          strokeOpacity={0.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path d={ticks.join(' ')} stroke={c.chartInk} strokeWidth={1.2} />
      </G>
    );
  } else if (clue === 'climate') {
    const [ix, iy] = where(SPOTS.iceCentre);
    keys.push({ text: 'ice-sheet scratches', color: c.snow });
    keys.push({ text: 'coal', color: c.rubber });
    evidence = (
      <G>
        <Ellipse cx={ix} cy={iy} rx={30} ry={18} fill={c.snow} opacity={0.45} />
        {SPOTS.ice.map(where).map(([x, y], i) => {
          const len = Math.hypot(x - ix, y - iy) || 1;
          const [ux, uy] = [(x - ix) / len, (y - iy) / len];
          const d = [-3.5, 0, 3.5]
            .map((o) => {
              const [sx, sy] = [x - ux * 7 - uy * o, y - uy * 7 + ux * o];
              return `M ${sx} ${sy} L ${sx + ux * 14} ${sy + uy * 14}`;
            })
            .join(' ');
          const [hx, hy] = [x + ux * 9, y + uy * 9];
          return (
            <G key={i}>
              <Path d={d} stroke={c.chartInk} strokeWidth={1.6} strokeLinecap="round" />
              <Path
                d={`M ${hx - ux * 5 - uy * 4} ${hy - uy * 5 + ux * 4} L ${hx} ${hy} L ${hx - ux * 5 + uy * 4} ${hy - uy * 5 - ux * 4}`}
                stroke={c.chartInk}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </G>
          );
        })}
        {SPOTS.coal.map(where).map(([x, y], i) => (
          <G key={`coal${i}`}>
            <Circle cx={x - 3} cy={y} r={3.5} fill={c.rubber} />
            <Circle cx={x + 3} cy={y + 1} r={3} fill={c.rubber} />
            <Circle cx={x} cy={y - 3} r={2.6} fill={c.rubber} />
          </G>
        ))}
      </G>
    );
  } else if (clue === 'shapes') {
    // South America slid back against Africa as it sat in Pangaea, dashed, and both coasts lit.
    const ghost: Place = [
      ERAS[250].sa[0] + era.af[0] - ERAS[250].af[0],
      ERAS[250].sa[1] + era.af[1] - ERAS[250].af[1],
      ERAS[250].sa[2],
    ];
    keys.push({ text: 'coasts that fit', color: c.chartHighlight });
    evidence = (
      <G>
        <G transform={move(ghost)}>
          <Path
            d={PIECES.sa.d}
            fill={c.chartHighlight}
            fillOpacity={0.12}
            stroke={c.chartHighlight}
            strokeWidth={1.5}
            strokeDasharray={chart.dashFine}
          />
        </G>
        <Path
          d={COASTS.sa}
          transform={move(era.sa)}
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeHeavy}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d={COASTS.af}
          transform={move(era.af)}
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeHeavy}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </G>
    );
  }

  const pw = chipW(pill);
  return (
    <Board height={H}>
      <Rect x={0} y={0} width={BOARD_W} height={H} fill={c.water} />
      {LATS.map(({ lat, y }) => (
        <Line
          key={lat}
          x1={0}
          y1={y}
          x2={BOARD_W}
          y2={y}
          stroke={c.waterTop}
          strokeOpacity={lat === 0 ? 0.7 : 0.35}
          strokeWidth={lat === 0 ? 1.2 : 0.8}
          strokeDasharray={lat === 0 ? undefined : chart.dashFine}
        />
      ))}
      {/* Shelves first (pale, wider than the coast), then the land on top. */}
      {ORDER.map((k) => (
        <Path
          key={`shelf${k}`}
          d={PIECES[k].d}
          transform={move(era[k])}
          fill={c.waterTop}
          stroke={c.waterTop}
          strokeWidth={6}
          strokeLinejoin="round"
        />
      ))}
      {ORDER.map((k) => (
        <Path
          key={k}
          d={PIECES[k].d}
          transform={move(era[k])}
          fill={c.life}
          stroke={c.lifeDeep}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      ))}
      {evidence}
      {ORDER.map((k) => {
        const [lx, ly] = at(era[k], PIECES[k].label);
        const out = OUTSIDE[continents.age]?.[k];
        const [rawX, y] = out ?? [lx, ly];
        // The Americas' names on two lines, so they sit inside the land.
        const lines = k === 'na' || k === 'sa' ? PIECES[k].name.split(' ') : [PIECES[k].name];
        const half = (lines[0]!.length * chart.value * 0.62) / 2;
        // A name pulled outside its land (Australia, India) stays inside the board.
        const x = Math.min(BOARD_W - half - 4, Math.max(half + 4, rawX));
        return (
          <G key={`n${k}`}>
            {out ? (
              <Line
                x1={x + (lx < x ? -half - 3 : half + 3)}
                y1={y}
                x2={lx}
                y2={ly}
                stroke={c.chartInk}
                strokeWidth={1.2}
              />
            ) : null}
            {out ? <Circle cx={lx} cy={ly} r={2.5} fill={c.chartInk} /> : null}
            {lines.map((line, i) => (
              <ChartText
                key={i}
                x={x}
                y={y + 5 + (i - (lines.length - 1) / 2) * 14}
                fontSize={chart.value}
                fontWeight="600"
                textAnchor="middle"
                fill={c.chartInk}
              >
                {line}
              </ChartText>
            ))}
          </G>
        );
      })}
      <Chip x={BOARD_W - 6 - pw / 2} y={15} text={pill} c={c} />
      {keys.map((k, i) => (
        <Chip
          key={k.text}
          x={6 + chipW(k.text, chart.value, false, true) / 2}
          y={15 + i * 26}
          text={k.text}
          c={c}
          color={k.color}
        />
      ))}
    </Board>
  );
}
