import type { ReactNode } from 'react';
import { Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { ChartText } from '../reps/common';
import { SunDisk } from '../reps/nature';
import { Ball, Deepen, url, usePaintIds } from '../reps/paint';
import { BOARD_W, Board, CurveArrow, HaloText, chipW } from './earthKit';

/**
 * Weather fronts as a textbook cross-section (Grade 6): warm air tinted warm, cold air as a
 * cool wedge along the ground, the front as the blue (cold), red (warm) or two-colored
 * (stationary) line at its edge with the weather-map marks on the side it moves toward, the
 * clouds each front makes (a cumulonimbus with its anvil, or flat layered nimbostratus) and
 * their rain. A framed key shows the front's weather-map symbol. Highs and lows show a column
 * of rising or sinking air with the map's L or H and its spiral of winds.
 */

const H = 240;
const G0 = 212;

type Pt = [number, number];
type Bez = [Pt, Pt, Pt, Pt];

const bez = ([a, b, c, d]: Bez, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
};
const bezPath = ([a, b, c, d]: Bez) =>
  `M ${a[0]} ${a[1]} C ${b[0]} ${b[1]} ${c[0]} ${c[1]} ${d[0]} ${d[1]}`;

/**
 * The map marks along a front line: triangles (cold) or half discs (warm), `size` across, on the
 * side `side` of the direction the line runs (+1 left of travel, −1 right).
 */
function Marks({
  pts,
  kind,
  size,
  side,
  color,
}: {
  pts: { p: Pt; dir: Pt }[];
  kind: 'tri' | 'semi';
  size: number;
  side: 1 | -1;
  color: string;
}) {
  return (
    <G>
      {pts.map(({ p, dir }, i) => {
        const len = Math.hypot(dir[0], dir[1]) || 1;
        const [ux, uy] = [dir[0] / len, dir[1] / len];
        // The normal on the chosen side (screen coordinates: left of travel is (uy, −ux)).
        const [nx, ny] = [uy * side, -ux * side];
        const r = size / 2;
        const a: Pt = [p[0] - ux * r, p[1] - uy * r];
        const b: Pt = [p[0] + ux * r, p[1] + uy * r];
        if (kind === 'tri') {
          const tip: Pt = [p[0] + nx * size * 0.8, p[1] + ny * size * 0.8];
          return (
            <Path
              key={i}
              d={`M ${a[0]} ${a[1]} L ${tip[0]} ${tip[1]} L ${b[0]} ${b[1]} Z`}
              fill={color}
            />
          );
        }
        // A half disc bulging toward the normal.
        const sweep = side === 1 ? 1 : 0;
        return (
          <Path
            key={i}
            d={`M ${a[0]} ${a[1]} A ${r} ${r} 0 0 ${sweep} ${b[0]} ${b[1]} Z`}
            fill={color}
          />
        );
      })}
    </G>
  );
}

/** Evenly spaced points and directions along a cubic, for the marks. */
const along = (curve: Bez, ts: number[]) =>
  ts.map((t) => {
    const p = bez(curve, t);
    const q = bez(curve, Math.min(1, t + 0.01));
    return { p, dir: [q[0] - p[0], q[1] - p[1]] as Pt };
  });

export function FrontFigure({ front, c }: { front: NonNullable<Scene['front']>; c: Palette }) {
  const ids = usePaintIds('sky', 'puff', 'soil', 'sun', 'storm');
  const blue = c.poleSouth;
  const red = c.poleNorth;
  const type = front.type ?? 'cold';

  /** A framed key at the top left: the map symbol and what it is. */
  const key = (symbol: ReactNode, name: string) => {
    const w = 46 + Math.max(chipW(name, chart.value, true) - 16, 72) + 8;
    return (
      <G>
        <Rect
          x={8}
          y={8}
          width={w}
          height={54}
          rx={8}
          fill={c.card}
          stroke={c.chartGrid}
          strokeWidth={1.5}
        />
        {symbol}
        <ChartText x={52} y={30} fontSize={chart.value} fontWeight="700">
          {name}
        </ChartText>
        <ChartText x={52} y={48} fontSize={chart.label} fill={c.chartMuted}>
          on a map
        </ChartText>
      </G>
    );
  };

  /** A flat layered cloud sheet (nimbostratus or stratus). */
  const sheet = (x: number, y: number, w: number, h: number, k: string) => (
    <G key={k}>
      <Path
        d={`M ${x} ${y + h} C ${x - 8} ${y + h} ${x - 6} ${y + 2} ${x + 8} ${y + 2} C ${x + w * 0.3} ${y - 4} ${x + w * 0.6} ${y + 3} ${x + w - 8} ${y} C ${x + w + 6} ${y} ${x + w + 8} ${y + h} ${x + w} ${y + h} Z`}
        fill={c.rainCloud}
        stroke={c.stormCloud}
        strokeWidth={1}
      />
      <Path
        d={`M ${x} ${y + h} C ${x - 8} ${y + h} ${x - 6} ${y + 2} ${x + 8} ${y + 2} C ${x + w * 0.3} ${y - 4} ${x + w * 0.6} ${y + 3} ${x + w - 8} ${y} C ${x + w + 6} ${y} ${x + w + 8} ${y + h} ${x + w} ${y + h} Z`}
        fill={url(ids.puff)}
      />
    </G>
  );

  /** Tapered rain streaks: `n` of them from (x0, y0) across `w`, `len` long. */
  const rain = (x0: number, y0: number, w: number, len: number, n: number, k: string) => (
    <G key={k}>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + (i * w) / Math.max(1, n - 1);
        const y = y0 + (i % 3) * 8;
        return (
          <Path
            key={i}
            d={`M ${x} ${y} L ${x - len * 0.18 - 1.2} ${y + len} L ${x - len * 0.18 + 1.2} ${y + len} Z`}
            fill={c.water}
            opacity={0.85}
          />
        );
      })}
    </G>
  );

  const frame = (children: ReactNode) => (
    <Board height={H}>
      <Defs>
        <Deepen id={ids.sky} from={c.skyMorning} to={c.snow} />
        <LinearGradient id={ids.puff} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.shine} stopOpacity={0.55 * c.sheen} />
          <Stop offset="0.55" stopColor={c.shine} stopOpacity={0} />
          <Stop offset="1" stopColor={c.shade} stopOpacity={0.22} />
        </LinearGradient>
        <Deepen id={ids.soil} from={c.soil} to={c.soilDark} />
        <Ball id={ids.sun} color={c.sunDisk} />
        <Deepen id={ids.storm} from={c.rainCloud} to={c.stormCloud} />
      </Defs>
      <Rect x={0} y={0} width={BOARD_W} height={G0} fill={url(ids.sky)} />
      {children}
      <Rect x={0} y={G0} width={BOARD_W} height={H - G0} fill={url(ids.soil)} />
      <Rect x={0} y={G0} width={BOARD_W} height={5} fill={c.life} />
    </Board>
  );

  if (front.air) {
    // A column of air over a low (rising, cloud and rain) or a high (sinking, clear).
    const low = front.air === 'low';
    const cx = 200;
    const letter = low ? 'L' : 'H';
    const color = low ? red : blue;
    // The map symbol: the letter with winds spiralling in (low, counterclockwise) or out (high,
    // clockwise), as seen from above in the Northern Hemisphere.
    const spiral = [0, 1, 2, 3].map((i) => {
      const a0 = (i * Math.PI) / 2 + 0.3;
      const r0 = low ? 20 : 11;
      const r1 = low ? 11 : 20;
      const turn = low ? -1.1 : 1.1;
      const p0: Pt = [30 + r0 * Math.cos(a0), 35 + r0 * Math.sin(a0)];
      const p1: Pt = [30 + r1 * Math.cos(a0 + turn), 35 + r1 * Math.sin(a0 + turn)];
      return (
        <CurveArrow
          key={i}
          a={p0}
          b={p1}
          bend={low ? 4 : -4}
          c={c}
          color={c.chartInk}
          width={1.5}
          halo={false}
        />
      );
    });
    return frame(
      <G>
        {key(
          <G>
            <ChartText
              x={30}
              y={41}
              fontSize={17}
              fontWeight="800"
              textAnchor="middle"
              fill={color}
            >
              {letter}
            </ChartText>
            {spiral}
          </G>,
          low ? 'low pressure' : 'high pressure',
        )}
        {low ? (
          <G>
            {sheet(118, 70, 170, 26, 'top')}
            {sheet(132, 60, 110, 18, 'crest')}
            {rain(146, 102, 104, 60, 8, 'rain')}
          </G>
        ) : (
          <SunDisk x={318} y={38} r={14} ball={ids.sun} c={c} />
        )}
        {/* Rising or sinking air in the column, and the winds at the ground. */}
        {[-56, 0, 56].map((dx) => (
          <CurveArrow
            key={dx}
            a={low ? [cx + dx, 190] : [cx + dx, 96]}
            b={low ? [cx + dx * 0.8, 116] : [cx + dx * 0.8, 176]}
            c={c}
          />
        ))}
        <CurveArrow
          a={low ? [36, 200] : [cx - 40, 200]}
          b={low ? [cx - 40, 200] : [36, 200]}
          c={c}
          color={c.chartInk}
          width={2}
          halo={false}
        />
        <CurveArrow
          a={low ? [BOARD_W - 12, 200] : [cx + 40, 200]}
          b={low ? [cx + 40, 200] : [BOARD_W - 12, 200]}
          c={c}
          color={c.chartInk}
          width={2}
          halo={false}
        />
        <ChartText x={cx} y={206} fontSize={26} fontWeight="800" textAnchor="middle" fill={color}>
          {letter}
        </ChartText>
        <HaloText x={low ? 306 : 96} y={150} text={low ? 'air rises' : 'air sinks'} c={c} />
      </G>,
    );
  }

  if (type === 'cold') {
    // Cold air (left) drives in along the ground and lifts the warm air steeply.
    const edge: Bez = [
      [0, 64],
      [96, 66],
      [150, 104],
      [166, 150],
    ];
    const nose: Bez = [
      [166, 150],
      [174, 178],
      [186, 206],
      [208, G0],
    ];
    // A cumulonimbus: a lumpy tower over the front, topped by a flat anvil spreading ahead.
    const cloud =
      'M 176 132 C 160 132 158 112 172 108 C 162 96 170 80 186 82 C 180 68 190 56 204 58 ' +
      'C 200 50 206 46 212 46 L 168 46 C 156 46 154 36 170 34 C 200 26 260 20 320 22 ' +
      'C 348 22 352 36 334 40 C 310 44 284 46 268 50 C 282 60 288 76 280 86 ' +
      'C 298 92 300 110 290 116 C 304 122 302 134 292 132 Z';
    return frame(
      <G>
        <Rect x={0} y={0} width={BOARD_W} height={G0} fill={c.skyEvening} opacity={0.22} />
        <Path
          d={`${bezPath(edge)} C ${nose[1].join(' ')} ${nose[2].join(' ')} ${nose[3].join(' ')} L 0 ${G0} Z`}
          fill={c.water}
          opacity={0.45}
        />
        <Path
          d={cloud}
          fill={c.stormCloud}
          stroke={c.chartInk}
          strokeOpacity={0.35}
          strokeWidth={1}
        />
        <Path d={cloud} fill={url(ids.puff)} />
        {rain(186, 138, 96, 60, 9, 'rain')}
        <Path
          d={`${bezPath(edge)} C ${nose[1].join(' ')} ${nose[2].join(' ')} ${nose[3].join(' ')}`}
          stroke={blue}
          strokeWidth={chart.strokeHeavy}
          fill="none"
        />
        <Marks
          pts={[...along(edge, [0.55, 0.85]), ...along(nose, [0.3, 0.75])]}
          kind="tri"
          size={12}
          side={1}
          color={blue}
        />
        <CurveArrow
          a={[40, 196]}
          b={[128, 196]}
          c={c}
          color={c.chartInk}
          width={2.5}
          halo={false}
        />
        <CurveArrow a={[346, 198]} b={[222, 150]} bend={-26} c={c} />
        <HaloText x={70} y={176} text="cold air" c={c} size={chart.emphasis} bold />
        <HaloText x={300} y={172} text="warm air" c={c} size={chart.emphasis} bold />
        {key(
          <G>
            <Line x1={24} y1={14} x2={24} y2={56} stroke={blue} strokeWidth={chart.strokeHeavy} />
            <Marks
              pts={[14, 28, 42].map((y) => ({ p: [24, y + 7] as Pt, dir: [0, 1] as Pt }))}
              kind="tri"
              size={14}
              side={1}
              color={blue}
            />
          </G>,
          'cold front',
        )}
      </G>,
    );
  }

  if (type === 'warm') {
    // Warm air (left) slides slowly up a long, gentle slope of cold air (right).
    const slope: Bez = [
      [96, G0],
      [170, 196],
      [270, 128],
      [BOARD_W, 84],
    ];
    return frame(
      <G>
        <Rect x={0} y={0} width={BOARD_W} height={G0} fill={c.skyEvening} opacity={0.22} />
        <Path d={`${bezPath(slope)} L ${BOARD_W} ${G0} Z`} fill={c.water} opacity={0.45} />
        {/* Flat layers of cloud spreading ahead, highest and thinnest far ahead. */}
        {[
          [110, 150, 120, 20],
          [160, 118, 130, 18],
          [226, 88, 110, 14],
        ].map(([x, y, w, h], i) => sheet(x!, y!, w!, h!, `s${i}`))}
        <Path
          d="M 300 34 q 16 -8 34 -2 M 290 44 q 20 -6 44 0 M 312 26 q 10 -4 22 0"
          stroke={c.stormCloud}
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />
        {rain(118, 172, 100, 30, 9, 'rain')}
        <Path d={bezPath(slope)} stroke={red} strokeWidth={chart.strokeHeavy} fill="none" />
        <Marks
          pts={along(slope, [0.16, 0.36, 0.56, 0.76])}
          kind="semi"
          size={12}
          side={-1}
          color={red}
        />
        <CurveArrow a={[20, 196]} b={[250, 112]} bend={-14} c={c} />
        <HaloText x={50} y={150} text="warm air" c={c} size={chart.emphasis} bold />
        <HaloText x={300} y={190} text="cold air" c={c} size={chart.emphasis} bold />
        {key(
          <G>
            <Line x1={24} y1={14} x2={24} y2={56} stroke={red} strokeWidth={chart.strokeHeavy} />
            <Marks
              pts={[14, 28, 42].map((y) => ({ p: [24, y + 7] as Pt, dir: [0, 1] as Pt }))}
              kind="semi"
              size={12}
              side={1}
              color={red}
            />
          </G>,
          'warm front',
        )}
      </G>,
    );
  }

  // Stationary: cold air (left) and warm air (right) meet; neither pushes the other away.
  const face: Bez = [
    [150, G0],
    [176, 160],
    [220, 110],
    [300, 64],
  ];
  const marks = along(face, [0.12, 0.32, 0.52, 0.72, 0.9]);
  return frame(
    <G>
      <Path
        d={`${bezPath(face)} L 330 0 L ${BOARD_W} 0 L ${BOARD_W} ${G0} Z`}
        fill={c.skyEvening}
        opacity={0.26}
      />
      <Path d={`${bezPath(face)} L 330 0 L 0 0 L 0 ${G0} Z`} fill={c.water} opacity={0.4} />
      {[
        [150, 104, 150, 20],
        [190, 80, 130, 16],
      ].map(([x, y, w, h], i) => sheet(x!, y!, w!, h!, `s${i}`))}
      {rain(166, 126, 110, 44, 9, 'rain')}
      {/* Alternating blue and red along the front: triangles toward the warm air, half discs
          toward the cold air. */}
      {[0, 1, 2, 3, 4].map((i) => {
        const t0 = i / 5;
        const t1 = (i + 1) / 5;
        const pts = Array.from({ length: 6 }, (_, k) => bez(face, t0 + ((t1 - t0) * k) / 5));
        return (
          <Path
            key={`seg${i}`}
            d={'M ' + pts.map((p) => p.join(' ')).join(' L ')}
            stroke={i % 2 === 0 ? blue : red}
            strokeWidth={chart.strokeHeavy}
            fill="none"
          />
        );
      })}
      <Marks
        pts={marks.filter((_, i) => i % 2 === 0)}
        kind="tri"
        size={11}
        side={-1}
        color={blue}
      />
      <Marks pts={marks.filter((_, i) => i % 2 === 1)} kind="semi" size={11} side={1} color={red} />
      <CurveArrow a={[30, 196]} b={[110, 196]} c={c} color={c.chartInk} width={2.5} halo={false} />
      <CurveArrow a={[330, 196]} b={[250, 196]} c={c} color={c.chartInk} width={2.5} halo={false} />
      <HaloText x={70} y={176} text="cold air" c={c} size={chart.emphasis} bold />
      <HaloText x={300} y={176} text="warm air" c={c} size={chart.emphasis} bold />
      {key(
        <G>
          <Line x1={24} y1={14} x2={24} y2={35} stroke={blue} strokeWidth={chart.strokeHeavy} />
          <Line x1={24} y1={35} x2={24} y2={56} stroke={red} strokeWidth={chart.strokeHeavy} />
          <Marks
            pts={[{ p: [24, 24] as Pt, dir: [0, 1] as Pt }]}
            kind="tri"
            size={12}
            side={1}
            color={blue}
          />
          <Marks
            pts={[{ p: [24, 46] as Pt, dir: [0, 1] as Pt }]}
            kind="semi"
            size={12}
            side={-1}
            color={red}
          />
        </G>,
        'stationary front',
      )}
    </G>,
  );
}
