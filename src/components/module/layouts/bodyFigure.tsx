import type { ReactNode } from 'react';
import { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { Ball, TopLight, url, usePaintIds } from '../reps/paint';
import { ell, useDrawKit } from './drawKit';
import { BOARD_W, Board, Chip, chipW } from './earthKit';

/**
 * The body's systems (Grade 6): a soft silhouette with each system's organs in their own
 * colors (a pink brain and yellow nerves, bone-white bones, red muscles, pink lungs, a red heart
 * with red and blue vessels, the stomach and intestines, and brown kidneys). The systems a scene
 * is about are drawn in full, on top; the others stay ghosted, so the body still reads whole.
 * Each lit system gets a chip with its color, in a column beside the body, and a leader line to
 * its organ.
 */

type System = NonNullable<Scene['body']>['systems'][number];

const H = 384;
const CX = BOARD_W / 2;

/** What each system's chip says. */
const NAMES: Record<System, string> = {
  circulatory: 'circulatory',
  respiratory: 'respiratory',
  digestive: 'digestive',
  nervous: 'nervous',
  muscular: 'muscles',
  skeletal: 'bones',
  excretory: 'excretory',
};

/** Where each chip's leader line points (an organ), which side it goes, and its row. */
const PIN: Record<System, { at: [number, number]; side: -1 | 1; y: number }> = {
  nervous: { at: [CX - 12, 32], side: -1, y: 36 },
  respiratory: { at: [CX - 20, 128], side: -1, y: 118 },
  circulatory: { at: [CX + 10, 140], side: 1, y: 132 },
  digestive: { at: [CX + 20, 172], side: 1, y: 178 },
  excretory: { at: [CX - 18, 196], side: -1, y: 202 },
  muscular: { at: [CX - 24, 276], side: -1, y: 270 },
  skeletal: { at: [CX + 23, 290], side: 1, y: 292 },
};

/**
 * The order systems are drawn in: bones over muscles (so both show in the limbs), deep organs
 * first, so the heart sits over the lungs.
 */
const LAYERS: System[] = [
  'muscular',
  'skeletal',
  'excretory',
  'digestive',
  'respiratory',
  'circulatory',
  'nervous',
];

/** Right half of the body outline, from the top of the head round to the crotch. */
const HALF =
  'M 0 12 C 16 12 27 26 27 44 C 27 60 20 70 12 74 L 12 86 C 22 90 40 90 48 96 ' +
  'C 58 102 62 112 62 124 L 68 228 C 70 244 67 258 59 258 C 52 258 50 248 50 236 ' +
  'L 45 136 C 42 150 38 172 37 196 C 38 212 45 222 45 238 L 35 350 C 40 356 46 364 40 369 ' +
  'L 10 369 C 8 360 10 352 12 346 L 6 246 L 0 246';

/** A shape in body coordinates for both sides (x measured from the middle, `s` = side). */
const both = (f: (s: 1 | -1) => string) => `${f(1)} ${f(-1)}`;
const X = (x: number) => CX + x;

export function BodyFigure({ body, c }: { body: NonNullable<Scene['body']>; c: Palette }) {
  const k = useDrawKit();
  const ids = usePaintIds('lung', 'heart', 'light');
  const lit = (s: System) => body.systems.includes(s);
  const ink = { stroke: c.chartInk, strokeWidth: 1.2, strokeLinejoin: 'round' as const };

  const drawings: Record<System, ReactNode> = {
    skeletal: (
      <G>
        {/* Skull, spine, ribs, pelvis and the long bones of the arms and legs. */}
        {k.shape(ell(CX, 42, 22, 27), c.bone)}
        <Circle cx={X(-8)} cy={44} r={4.5} fill={c.chartInk} opacity={0.55} />
        <Circle cx={X(8)} cy={44} r={4.5} fill={c.chartInk} opacity={0.55} />
        {Array.from({ length: 16 }, (_, i) => (
          <Rect
            key={i}
            x={CX - 4}
            y={78 + i * 9}
            width={8}
            height={7}
            rx={2}
            fill={c.bone}
            {...ink}
          />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) =>
          k.line(
            both(
              (s) =>
                `M ${X(s * 5)} ${104 + i * 11} C ${X(s * 26)} ${98 + i * 11} ${X(s * 34)} ${106 + i * 11} ${X(s * 30)} ${118 + i * 11}`,
            ),
            c.bone,
            2.4,
          ),
        )}
        {k.shape(
          both(
            (s) =>
              `M ${X(s * 4)} 214 C ${X(s * 10)} 206 ${X(s * 30)} 202 ${X(s * 36)} 210 C ${X(s * 36)} 222 ${X(s * 30)} 232 ${X(s * 24)} 244 L ${X(s * 16)} 246 C ${X(s * 14)} 236 ${X(s * 8)} 234 ${X(s * 3)} 240 Z`,
          ),
          c.bone,
        )}
        {k.line(
          both(
            (s) =>
              `M ${X(s * 54)} 108 L ${X(s * 57)} 170 M ${X(s * 58)} 176 L ${X(s * 61)} 232 M ${X(s * 25)} 244 L ${X(s * 23)} 300 M ${X(s * 23)} 306 L ${X(s * 23)} 350`,
          ),
          c.bone,
          3.6,
        )}
      </G>
    ),
    muscular: (
      <G>
        {/* Shoulder and upper-arm muscles, forearms, thighs and calves: spindles with fibres. */}
        {(
          [
            [55, 104, 170, 11],
            [60, 176, 228, 8.5],
            [25, 246, 302, 15],
            [23, 308, 346, 11],
          ] as const
        ).map(([x, y0, y1, r]) =>
          ([1, -1] as const).map((s) => {
            const m = (y0 + y1) / 2;
            const d = `M ${X(s * x)} ${y0} C ${X(s * (x + r))} ${m - 16} ${X(s * (x + r))} ${m + 16} ${X(s * x)} ${y1} C ${X(s * (x - r))} ${m + 16} ${X(s * (x - r))} ${m - 16} ${X(s * x)} ${y0} Z`;
            return (
              <G key={`${x}${s}`}>
                {k.shape(d, c.wormPink)}
                <Path
                  d={`M ${X(s * (x - r * 0.4))} ${m - 12} L ${X(s * (x - r * 0.3))} ${m + 12} M ${X(s * (x + r * 0.35))} ${m - 12} L ${X(s * (x + r * 0.25))} ${m + 12}`}
                  stroke={c.organDeep}
                  strokeWidth={1}
                  opacity={0.6}
                />
              </G>
            );
          }),
        )}
      </G>
    ),
    excretory: (
      <G>
        {/* Two kidneys, the tubes down to the bladder, and the bladder. */}
        {([1, -1] as const).map((s) => (
          <G key={s}>
            {k.shape(
              `M ${X(s * 12)} 186 C ${X(s * 12)} 176 ${X(s * 28)} 176 ${X(s * 28)} 196 C ${X(s * 28)} 214 ${X(s * 12)} 214 ${X(s * 12)} 204 C ${X(s * 16)} 200 ${X(s * 16)} 190 ${X(s * 12)} 186 Z`,
              c.planetMars,
            )}
            <Path
              d={`M ${X(s * 14)} 204 C ${X(s * 12)} 218 ${X(s * 8)} 222 ${X(s * 6)} 230`}
              stroke={c.planetMars}
              strokeWidth={2}
              fill="none"
            />
          </G>
        ))}
        {k.shape(ell(CX, 234, 9, 7), c.fat)}
      </G>
    ),
    digestive: (
      <G>
        {/* Esophagus, stomach, small intestine coiled inside the large one. */}
        {k.line(`M ${CX} 78 L ${X(2)} 150 C ${X(4)} 160 ${X(8)} 164 ${X(12)} 164`, c.stomach, 4)}
        {k.shape(
          `M ${X(10)} 160 C ${X(20)} 152 ${X(36)} 156 ${X(34)} 172 C ${X(32)} 186 ${X(16)} 190 ${X(6)} 184 C ${X(14)} 178 ${X(16)} 168 ${X(10)} 160 Z`,
          c.stomach,
        )}
        {k.line(
          `M ${X(-24)} 226 L ${X(-26)} 196 C ${X(-26)} 188 ${X(26)} 188 ${X(26)} 196 L ${X(24)} 226 L ${X(8)} 230`,
          c.rock4,
          5,
        )}
        {k.line(
          `M ${X(-16)} 200 L ${X(13)} 200 C ${X(19)} 200 ${X(19)} 206 ${X(13)} 206 L ${X(-13)} 206 C ${X(-19)} 206 ${X(-19)} 212 ${X(-13)} 212 L ${X(13)} 212 C ${X(19)} 212 ${X(19)} 218 ${X(13)} 218 L ${X(-13)} 218 C ${X(-19)} 218 ${X(-19)} 224 ${X(-13)} 224 L ${X(6)} 226`,
          c.petalPink,
          3,
        )}
      </G>
    ),
    respiratory: (
      <G>
        {/* Windpipe branching into two lungs (the left one notched for the heart). */}
        {k.line(
          `M ${CX} 80 L ${CX} 106 M ${CX} 106 L ${X(-10)} 116 M ${CX} 106 L ${X(10)} 116`,
          c.rainCloud,
          3.5,
        )}
        <Path
          d={`M ${X(-8)} 104 C ${X(-24)} 102 ${X(-34)} 124 ${X(-34)} 150 C ${X(-34)} 160 ${X(-26)} 164 ${X(-8)} 158 C ${X(-6)} 140 ${X(-6)} 120 ${X(-8)} 104 Z`}
          fill={url(ids.lung)}
          {...ink}
        />
        <Path
          d={`M ${X(8)} 104 C ${X(24)} 102 ${X(34)} 124 ${X(34)} 150 C ${X(34)} 160 ${X(26)} 164 ${X(18)} 160 C ${X(20)} 150 ${X(12)} 144 ${X(8)} 142 C ${X(6)} 130 ${X(6)} 116 ${X(8)} 104 Z`}
          fill={url(ids.lung)}
          {...ink}
        />
      </G>
    ),
    circulatory: (
      <G>
        {/* Arteries (red) and veins (blue) out to the limbs, and the heart. */}
        {(
          [
            [c.organDeep, 0],
            [c.blockBlue, 5],
          ] as const
        ).map(([color, o]) => (
          <G key={color}>
            <Path
              d={both(
                (s) =>
                  `M ${X(s * (2 + o / 2))} 104 C ${X(s * 30)} ${96 + o} ${X(s * 50)} ${100 + o} ${X(s * (54 - o / 2))} 120 L ${X(s * (60 - o / 2))} 240`,
              )}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={`M ${X(o / 2 - 1)} 130 L ${X(o / 2 - 1)} 226`}
              stroke={color}
              strokeWidth={3.5}
              strokeLinecap="round"
            />
            <Path
              d={both(
                (s) =>
                  `M ${X(o / 2 - 1)} 226 C ${X(s * 10)} 232 ${X(s * (18 + o / 2))} 240 ${X(s * (18 + o / 2))} 254 L ${X(s * (17 + o / 2))} 350`,
              )}
              stroke={color}
              strokeWidth={2.2}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={`M ${X(o / 2 - 1)} 104 L ${X(o / 2 - 1)} 60`}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </G>
        ))}
        {k.line(`M ${X(8)} 124 C ${X(6)} 106 ${X(-12)} 106 ${X(-8)} 130`, c.organDeep, 4)}
        <Path
          d={`M ${X(-6)} 128 C ${X(-10)} 140 ${X(0)} 156 ${X(22)} 162 C ${X(30)} 150 ${X(30)} 134 ${X(22)} 124 C ${X(14)} 116 ${X(-2)} 118 ${X(-6)} 128 Z`}
          fill={url(ids.heart)}
          {...ink}
        />
      </G>
    ),
    nervous: (
      <G>
        {/* Brain, spinal cord and nerves out to the arms and legs. */}
        {k.shape(ell(CX, 36, 21, 17), c.organ)}
        <Path
          d={`M ${X(-14)} 30 q 5 -6 9 0 q 4 6 9 0 q 4 -6 9 0 M ${X(-16)} 40 q 5 5 10 0 q 5 -5 10 0 q 5 5 10 0 M ${CX} 20 L ${CX} 50`}
          stroke={c.organDeep}
          strokeWidth={1}
          opacity={0.55}
          fill="none"
        />
        <Line
          x1={CX}
          y1={52}
          x2={CX}
          y2={214}
          stroke={c.pollen}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Path
          d={both(
            (s) =>
              `M ${CX} 96 C ${X(s * 30)} 96 ${X(s * 46)} 102 ${X(s * 50)} 124 L ${X(s * 58)} 250 ` +
              `M ${CX} 214 C ${X(s * 12)} 226 ${X(s * 20)} 240 ${X(s * 20)} 256 L ${X(s * 20)} 360 ` +
              `M ${CX} 150 L ${X(s * 30)} 160 M ${CX} 186 L ${X(s * 28)} 192`,
          )}
          stroke={c.pollen}
          strokeWidth={1.8}
          strokeLinecap="round"
          fill="none"
        />
        {/* Sense organs at work: the eyes. */}
        <Circle cx={X(-9)} cy={58} r={3} fill={c.chartInk} />
        <Circle cx={X(9)} cy={58} r={3} fill={c.chartInk} />
      </G>
    ),
  };

  const shown = LAYERS.filter(lit);
  // Chips: one column each side of the body, rows kept at least 30 apart.
  const chips = ([-1, 1] as const).flatMap((side) => {
    let last = -Infinity;
    return shown
      .filter((s) => PIN[s].side === side)
      .sort((a, b) => PIN[a].y - PIN[b].y)
      .map((s) => {
        const y = Math.max(PIN[s].y, last + 30);
        last = y;
        const w = chipW(NAMES[s], chart.value, false, true);
        const x = side === -1 ? 6 + w / 2 : BOARD_W - 6 - w / 2;
        return { s, x, y, edge: side === -1 ? x + w / 2 : x - w / 2 };
      });
  });
  const dot: Record<System, string> = {
    circulatory: c.organDeep,
    respiratory: c.organ,
    digestive: c.stomach,
    nervous: c.pollen,
    muscular: c.wormPink,
    skeletal: c.bone,
    excretory: c.planetMars,
  };

  return (
    <Board height={H}>
      {k.defs}
      <Defs>
        <Ball id={ids.lung} color={c.organ} />
        <Ball id={ids.heart} color={c.organDeep} />
        <TopLight id={ids.light} />
      </Defs>
      {/* The silhouette: one soft shape, lit from above. */}
      <G transform={`translate(${CX} 0)`}>
        {([1, -1] as const).map((s) => (
          <G key={s} transform={`scale(${s} 1)`}>
            <Path d={`${HALF} Z`} fill={c.skin} opacity={0.4} />
            <Path d={`${HALF} Z`} fill={url(ids.light)} />
            <Path
              d={HALF}
              fill="none"
              stroke={c.chartInk}
              strokeOpacity={0.55}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </G>
        ))}
      </G>
      {/* Systems not in the scene, ghosted; then the scene's systems in full. */}
      {LAYERS.filter((s) => !lit(s)).map((s) => (
        <G key={s} opacity={0.16}>
          {drawings[s]}
        </G>
      ))}
      {shown.map((s) => (
        <G key={s}>{drawings[s]}</G>
      ))}
      {chips.map(({ s, x, y, edge }) => (
        <G key={`chip-${s}`}>
          <Line
            x1={edge}
            y1={y}
            x2={PIN[s].at[0]}
            y2={PIN[s].at[1]}
            stroke={c.chartInk}
            strokeWidth={1.2}
          />
          <Circle cx={PIN[s].at[0]} cy={PIN[s].at[1]} r={3} fill={c.chartInk} />
          <Chip x={x} y={y} text={NAMES[s]} c={c} color={dot[s]} />
        </G>
      ))}
    </Board>
  );
}
