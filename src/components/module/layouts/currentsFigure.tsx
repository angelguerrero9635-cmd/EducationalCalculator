import type { ReactNode } from 'react';
import { ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import { LANDS, SEAS } from '@/data/modules/layouts/cardFigureData';
import type { CurrentsScene } from '@/data/modules/typesHsl';
import { chart, usePalette, type Palette } from '@/theme';

import { url, usePaintIds } from '../reps/paint';
import { Board, BOARD_W, HaloText } from './earthKit';

/** The map's west edge (20° E, so the Pacific sits whole in the middle), top and bottom. */
const WEST = 20;
const NORTH = 72;
const SOUTH = -62;
const TOP = 6;
const MAP_H = NORTH - SOUTH;
const H = TOP + MAP_H + 34;

type LonLat = [number, number];

/** Copies of the world a path is drawn at, so unwrapped longitudes land on the map. */
const SHIFTS = [-720, -360, 0, 360, 720];

/** Board point of a longitude (east of the map's edge) and latitude: 1 unit per degree. */
const at = ([lon, lat]: LonLat, shift = 0): [number, number] => [
  lon - WEST + shift,
  TOP + NORTH - lat,
];

const line = (pts: LonLat[], shift: number, close = false) =>
  `M ${pts
    .map((p) =>
      at(p, shift)
        .map((v) => v.toFixed(1))
        .join(' '),
    )
    .join(' L ')}${close ? ' Z' : ''}`;

/** A path drawn at each copy of the world, so one that crosses the map's edge shows both halves. */
const wrapped = (pts: LonLat[], close = false) => SHIFTS.map((s) => line(pts, s, close)).join(' ');

/** Points on an ellipse around (lon, lat) from angle a0 to a1 (radians, north up). */
const arc = (c: LonLat, rx: number, ry: number, a0: number, a1: number, n = 16): LonLat[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [c[0] + rx * Math.cos(a), c[1] + ry * Math.sin(a)];
  });

/** An arrowhead at the end of a path (last two points), drawn at each copy of the world. */
function head(pts: LonLat[], color: string, key: string) {
  const [x1, y1] = at(pts[pts.length - 1]!);
  const [x0, y0] = at(pts[pts.length - 2]!);
  const t = Math.atan2(y1 - y0, x1 - x0);
  const s = 5.5;
  return SHIFTS.map((sh) => (
    <Path
      key={`${key}${sh}`}
      d={`M ${x1 + sh - s * Math.cos(t - 0.5)} ${y1 - s * Math.sin(t - 0.5)} L ${x1 + sh} ${y1} L ${x1 + sh - s * Math.cos(t + 0.5)} ${y1 - s * Math.sin(t + 0.5)} Z`}
      fill={color}
    />
  ));
}

/** A current as an arrow, drawn at each copy of the world. */
function current(pts: LonLat[], color: string, key: string, dash?: string, width = 2.2): ReactNode {
  return (
    <G key={key}>
      <Path
        d={wrapped(pts)}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {head(pts, color, key)}
    </G>
  );
}

/**
 * The five subtropical gyres, each turning clockwise in the north and counterclockwise in the
 * south, warm water carried poleward on the west side of each basin and cold water toward the
 * equator on the east side; and the Antarctic Circumpolar Current flowing east.
 */
function gyres(c: Palette): ReactNode[] {
  // Centre (lon east of 20° E unwrapped as it lies on the map), radii in degrees, hemisphere.
  const GYRES: [LonLat, number, number, 1 | -1][] = [
    [[-45, 30], 28, 13, 1], // North Atlantic
    [[-15, -24], 17, 12, -1], // South Atlantic
    [[-178, 28], 46, 15, 1], // North Pacific
    [[-125, -28], 48, 14, -1], // South Pacific
    [[80, -24], 26, 12, -1], // Indian
  ];
  const out: ReactNode[] = [];
  GYRES.forEach(([ctr, rx, ry, ns], g) => {
    // Quarters centred on north, east, south and west, in the gyre's turning direction.
    const q = (mid: number) => {
      const a0 = mid + (ns === 1 ? 0.7 : -0.7);
      const a1 = mid - (ns === 1 ? 0.7 : -0.7);
      return arc(ctr, rx, ry, a0, a1);
    };
    out.push(current(q(Math.PI), c.currentWarm, `w${g}`)); // west side: warm, poleward
    out.push(current(q(0), c.currentCold, `e${g}`)); // east side: cold, toward the equator
    out.push(current(q(Math.PI / 2), c.chartMuted, `n${g}`, undefined, 1.5));
    out.push(current(q(-Math.PI / 2), c.chartMuted, `s${g}`, undefined, 1.5));
  });
  out.push(
    current(
      [
        [-60, -57],
        [0, -56],
        [60, -54],
        [120, -55],
      ],
      c.currentCold,
      'acc1',
    ),
    current(
      [
        [150, -57],
        [200, -58],
        [260, -58],
      ],
      c.currentCold,
      'acc2',
    ),
  );
  return out;
}

/**
 * The global conveyor: warm surface water from the Pacific through the Indian Ocean, round Africa
 * and up the Atlantic, sinking cold and salty near Greenland; cold deep water south down the
 * Atlantic, east round Antarctica and up into the Indian and Pacific Oceans, where it rises.
 */
function conveyor(c: Palette): ReactNode[] {
  const warm: LonLat[] = [
    [-165, 18],
    [-195, 4],
    [-235, -8],
    [-265, -14],
    [-295, -22],
    [-322, -36],
    [-342, -38],
    [-352, -28],
    [-372, -10],
    [-395, 8],
    [-420, 22],
    [-435, 32],
    [-410, 45],
    [-385, 56],
    [-378, 62],
  ];
  const deep: LonLat[] = [
    [-384, 58],
    [-392, 30],
    [-396, 0],
    [-386, -30],
    [-362, -52],
    [-300, -56],
    [-240, -56],
    [-190, -54],
    [-172, -36],
    [-168, -8],
    [-166, 12],
  ];
  const branch: LonLat[] = [
    [-300, -56],
    [-288, -40],
    [-280, -18],
  ];
  return [
    current(warm, c.currentWarm, 'warm', undefined, 3),
    current(deep, c.currentCold, 'deep', '7 4', 3),
    current(branch, c.currentCold, 'branch', '7 4', 3),
  ];
}

/**
 * Ocean currents on a world map (H75), the Pacific in the middle: the surface gyres with warm and
 * cold currents, or the deep conveyor (thermohaline circulation) with where it sinks and rises.
 */
export function CurrentsFigure({ view }: { view: CurrentsScene['view'] }) {
  const c = usePalette();
  const ids = usePaintIds('clip');
  const land = LANDS.map((p) => wrapped(p as LonLat[], true)).join(' ');
  const seas = SEAS.map((p) => wrapped(p as LonLat[], true)).join(' ');
  const key =
    view === 'gyres'
      ? [
          ['warm current', c.currentWarm, undefined],
          ['cold current', c.currentCold, undefined],
        ]
      : [
          ['warm surface flow', c.currentWarm, undefined],
          ['cold deep flow', c.currentCold, '7 4'],
        ];
  return (
    <Board height={H}>
      <Defs>
        <ClipPath id={ids.clip}>
          <Rect x={0} y={TOP} width={BOARD_W} height={MAP_H} />
        </ClipPath>
      </Defs>
      <G clipPath={url(ids.clip)}>
        <Rect x={0} y={TOP} width={BOARD_W} height={MAP_H} fill={c.waterTop} />
        <Path d={land} fill={c.landSand} stroke={c.chartInk} strokeWidth={0.5} />
        <Path d={seas} fill={c.waterTop} />
        {/* The equator. */}
        <Line
          x1={0}
          y1={TOP + NORTH}
          x2={BOARD_W}
          y2={TOP + NORTH}
          stroke={c.chartMuted}
          strokeWidth={0.8}
          strokeDasharray={chart.dashFine}
        />
        {view === 'gyres' ? gyres(c) : conveyor(c)}
      </G>
      <Rect
        x={0}
        y={TOP}
        width={BOARD_W}
        height={MAP_H}
        fill="none"
        stroke={c.chartGrid}
        strokeWidth={1}
      />
      {view === 'gyres' ? (
        <G>
          <HaloText
            x={at([-72, 40])[0] + 360}
            y={at([-72, 40])[1]}
            text="Gulf Stream"
            c={c}
            size={chart.label}
            anchor="start"
          />
          <HaloText
            x={at([146, 42])[0]}
            y={at([146, 42])[1]}
            text="Kuroshio"
            c={c}
            size={chart.label}
            anchor="start"
          />
          <HaloText
            x={at([-126, 20])[0] + 360}
            y={at([-126, 20])[1]}
            text="California"
            c={c}
            size={chart.label}
            anchor="end"
          />
          <HaloText
            x={at([-80, -30])[0] + 360}
            y={at([-80, -30])[1]}
            text="Humboldt"
            c={c}
            size={chart.label}
            anchor="end"
          />
        </G>
      ) : (
        <G>
          <HaloText
            x={at([-20, 66])[0] + 360}
            y={at([-20, 66])[1] + 4}
            text="sinks"
            c={c}
            size={chart.label}
            bold
            anchor="end"
          />
          <HaloText
            x={at([-160, 16])[0] + 360}
            y={at([-160, 16])[1] + 14}
            text="rises"
            c={c}
            size={chart.label}
            bold
            anchor="start"
          />
          <HaloText
            x={at([80, -16])[0]}
            y={at([80, -16])[1] + 14}
            text="rises"
            c={c}
            size={chart.label}
            bold
          />
        </G>
      )}
      {key.map(([name, color, dash], i) => {
        const x = 20 + i * 170;
        const y = TOP + MAP_H + 22;
        return (
          <G key={name}>
            <Line
              x1={x}
              y1={y - 4}
              x2={x + 28}
              y2={y - 4}
              stroke={color}
              strokeWidth={3}
              strokeDasharray={dash}
            />
            <HaloText x={x + 36} y={y} text={name!} c={c} size={chart.label} anchor="start" />
          </G>
        );
      })}
    </Board>
  );
}
