/**
 * Round-3 card icons (group G), 48 × 48 like every card icon, drawn in their materials with the
 * helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/r3g.ts.
 *
 * Everyday scenes for Kindergarten to Grade 4. People are simple and friendly, with no real
 * likeness, in the palette's skin tones (`skin`, `skinBrown`, `skinDeep`). The car rows are a
 * number picture: exactly five cars, the red ones first, so each card shows its split. The two
 * sequences are one scene changing: the cup phone with the shaking part marked in orange, and a
 * child catching a ball with the lit path moving eye → nerve → brain → nerve → arm.
 */
import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { usePalette } from '@/theme';

import { Ball, FloorShadow, Metal, Sheen, TopLight, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

/** An ellipse as a path, so it can be filled and then lit with the same `d`. */
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

/** A water drop, point up, `s` tall above its center. */
const drop = (x: number, y: number, s: number) =>
  `M ${x} ${y - s} C ${x + 0.75 * s} ${y - 0.1 * s} ${x + 0.75 * s} ${y + 0.65 * s} ${x} ${y + 0.65 * s} C ${x - 0.75 * s} ${y + 0.65 * s} ${x - 0.75 * s} ${y - 0.1 * s} ${x} ${y - s} Z`;

/** A car facing right, its left end at `x`, wheels on y = 28. */
const CAR = (x: number) =>
  `M ${x + 0.3} 27.6 V 23.6 Q ${x + 0.3} 22 ${x + 1.8} 21.8 L ${x + 2.6} 21.6 L ${x + 3.5} 18.3 Q ${x + 3.7} 17.5 ${x + 4.4} 17.5 H ${x + 6.1} Q ${x + 6.8} 17.5 ${x + 7.1} 18.3 L ${x + 7.9} 21.6 Q ${x + 8.6} 21.9 ${x + 8.6} 23.2 V 27.6 Z`;

/** "cars 2 red 3 blue" → 2 (the red cars come first). */
const redCars = (icon: string) => Number(/^cars (\d) red/.exec(icon)?.[1] ?? 0);

export function R3GIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('round', 'light', 'sheen', 'sheenV', 'metal', 'ball', 'soccer');

  const o = (w = 1.1) => ({
    stroke: ink,
    strokeWidth: w,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  });
  /** A shape in its color, outlined, with light from the top left laid over it. */
  const lit = (d: string, fill: string, w = 1.1) => (
    <>
      <Path d={d} fill={fill} {...o(w)} />
      <Path d={d} fill={url(ids.round)} />
    </>
  );
  /** A flat face lit from above (a wall, a table top, a slab). */
  const face = (d: string, fill: string, w = 0.9) => (
    <>
      <Path d={d} fill={fill} {...o(w)} />
      <Path d={d} fill={url(ids.light)} />
    </>
  );
  /** A lit ellipse, turned by `rot` degrees. */
  const blob = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, w = 0.9) => (
    <G transform={`rotate(${rot} ${cx} ${cy})`}>
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} {...o(w)} />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={url(ids.round)} />
    </G>
  );
  /** A stem, leg, arm or rope: a thick stroke in its color with an outline. */
  const limb = (d: string, color: string, w = 3) => (
    <>
      <Path d={d} fill="none" {...o(w + 1.6)} />
      <Path d={d} fill="none" {...o(w)} stroke={color} />
    </>
  );
  /** A dark eye with a glint. */
  const eye = (x: number, y: number, r = 1) => (
    <>
      <Circle cx={x} cy={y} r={r} fill={c.rubber} />
      <Circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.4} fill={c.shine} />
    </>
  );
  /** A force or motion arrow from (x1, y1) to its point at (x2, y2): flat, in one color. */
  const arrow = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color = c.chartHighlight,
    w = 2,
  ) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const L = 2.6 * w;
    const bx = x2 - L * Math.cos(a);
    const by = y2 - L * Math.sin(a);
    const nx = -Math.sin(a) * L * 0.62;
    const ny = Math.cos(a) * L * 0.62;
    return (
      <G>
        <Line
          x1={x1}
          y1={y1}
          x2={bx}
          y2={by}
          stroke={color}
          strokeWidth={w}
          strokeLinecap="round"
        />
        <Path
          d={`M ${x2} ${y2} L ${bx + nx} ${by + ny} L ${bx - nx} ${by - ny} Z`}
          fill={color}
          stroke={color}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
      </G>
    );
  };
  /**
   * A head in profile facing right (`dir` 1) or left (−1), or from the front (0): skin, hair
   * on the top and back, an eye and a smile.
   */
  const head = (cx: number, cy: number, r: number, skin: string, hair: string, dir: -1 | 0 | 1) => {
    const d = dir || 1;
    const hairPath =
      dir === 0
        ? `M ${cx - r * 1.02} ${cy + r * 0.1} A ${r * 1.02} ${r * 1.02} 0 0 1 ${cx + r * 1.02} ${cy + r * 0.1} Q ${cx + r * 0.6} ${cy - r * 0.55} ${cx} ${cy - r * 0.5} Q ${cx - r * 0.6} ${cy - r * 0.55} ${cx - r * 1.02} ${cy + r * 0.1} Z`
        : `M ${cx + d * r * 0.72} ${cy - r * 0.72} A ${r * 1.02} ${r * 1.02} 0 0 ${d > 0 ? 0 : 1} ${cx - d * r * 1.0} ${cy + r * 0.3} L ${cx - d * r * 0.5} ${cy + r * 0.25} Q ${cx - d * r * 0.1} ${cy - r * 0.5} ${cx + d * r * 0.72} ${cy - r * 0.72} Z`;
    return (
      <G>
        {lit(ell(cx, cy, r, r), skin, 0.9)}
        <Path d={hairPath} fill={hair} {...o(0.7)} />
        {dir === 0 ? (
          <>
            {eye(cx - r * 0.36, cy + r * 0.05, r * 0.15)}
            {eye(cx + r * 0.36, cy + r * 0.05, r * 0.15)}
            <Path
              d={`M ${cx - r * 0.3} ${cy + r * 0.45} Q ${cx} ${cy + r * 0.7} ${cx + r * 0.3} ${cy + r * 0.45}`}
              fill="none"
              {...o(0.6)}
            />
          </>
        ) : (
          <>
            {eye(cx + d * r * 0.5, cy - r * 0.02, r * 0.15)}
            <Path
              d={`M ${cx + d * r * 0.45} ${cy + r * 0.5} Q ${cx + d * r * 0.66} ${cy + r * 0.62} ${cx + d * r * 0.82} ${cy + r * 0.44}`}
              fill="none"
              {...o(0.6)}
            />
          </>
        )}
      </G>
    );
  };
  /**
   * A hand as a mitten, fingers along +x from the wrist at (0, 0), placed at (x, y) and turned
   * by `rot` degrees.
   */
  const hand = (x: number, y: number, rot: number, skin: string, s = 1) => (
    <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {lit('M 0 -2.4 H 4 C 6.6 -2.4 6.6 2.4 4 2.4 H 0 Z', skin, 0.8 / s)}
      {lit(ell(2.4, -2.6, 1.8, 1), skin, 0.7 / s)}
      <Path d="M 3 -0.8 H 5 M 3 0.8 H 5" fill="none" stroke={ink} strokeWidth={0.4 / s} />
    </G>
  );
  /** Grass blades along the ground from x0 to x1 at y. */
  const grass = (x0: number, x1: number, y: number, h = 4) => {
    const n = Math.max(2, Math.round((x1 - x0) / 2.6));
    return (
      <Path
        d={Array.from({ length: n }, (_, i) => {
          const x = x0 + ((x1 - x0) * (i + 0.5)) / n;
          const t = h * (0.7 + ((i * 7) % 5) / 10);
          return `M ${x - 1} ${y} Q ${x - 0.2} ${y - t * 0.6} ${x + (i % 2 ? 0.8 : -0.6)} ${y - t} Q ${x + 0.3} ${y - t * 0.5} ${x + 1} ${y} Z`;
        }).join(' ')}
        fill={c.life}
        stroke={c.lifeDeep}
        strokeWidth={0.5}
        strokeLinejoin="round"
      />
    );
  };
  /** Soil seen in a cut-away from `top` to the bottom of the card, grass on top if asked. */
  const soil = (top: number, withGrass = false, x0 = 2, x1 = 46) => (
    <>
      <Rect x={x0} y={top} width={x1 - x0} height={46 - top} rx={2.5} fill={c.soil} />
      <Rect x={x0} y={top} width={x1 - x0} height={46 - top} rx={2.5} fill={url(ids.light)} />
      {[
        [x0 + 5, top + 4],
        [x1 - 7, top + 6],
        [(x0 + x1) / 2 - 4, 43.5],
      ].map(([x, y]) => (
        <Ellipse key={`${x}`} cx={x} cy={y} rx={1.3} ry={0.8} fill={c.soilDark} />
      ))}
      {withGrass ? grass(x0 + 0.5, x1 - 0.5, top + 0.6, 3.2) : null}
    </>
  );
  /** A green leaf on a stalk from (x, y), `len` long, turned by `rot` (0 = pointing right). */
  const leaf = (x: number, y: number, len: number, rot: number, fill = c.life) => (
    <G transform={`translate(${x} ${y}) rotate(${rot})`}>
      {lit(
        `M 0 0 C ${len * 0.3} ${-len * 0.38} ${len * 0.75} ${-len * 0.3} ${len} 0 C ${len * 0.75} ${len * 0.3} ${len * 0.3} ${len * 0.38} 0 0 Z`,
        fill,
        0.7,
      )}
      <Path d={`M 0.5 0 H ${len * 0.85}`} stroke={c.lifeDeep} strokeWidth={0.5} />
    </G>
  );
  /** Short zigzags above and below a part that shakes. */
  const shake = (x: number, y: number) => (
    <Path
      d={`M ${x - 2.4} ${y} l 0.8 -0.9 l 0.8 0.9 l 0.8 -0.9 l 0.8 0.9 l 0.8 -0.9 l 0.8 0.9`}
      fill="none"
      stroke={c.orange}
      strokeWidth={0.9}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );

  let art: ReactNode;
  switch (icon) {
    // ── All the ways to make 5: five cars in a row, the red ones first ────────
    case 'cars 0 red 5 blue':
    case 'cars 1 red 4 blue':
    case 'cars 2 red 3 blue':
    case 'cars 3 red 2 blue':
    case 'cars 4 red 1 blue':
    case 'cars 5 red 0 blue': {
      const red = redCars(icon);
      art = (
        <G transform="translate(0 -3) scale(1 1.12)">
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 1 + i * 9.2;
            return (
              <G key={i}>
                <FloorShadow cx={x + 4.3} cy={29} rx={4.6} ry={0.9} />
                {lit(CAR(x), i < red ? c.blockRed : c.blockBlue, 0.8)}
                <Path
                  d={`M ${x + 3.9} 21.5 L ${x + 4.7} 18.6 H ${x + 5.9} L ${x + 6.8} 21.5 Z`}
                  fill={c.glass}
                  stroke={ink}
                  strokeWidth={0.4}
                />
                <Circle cx={x + 8.1} cy={23.3} r={0.55} fill={c.sunDisk} />
                {[x + 2.2, x + 6.5].map((wx) => (
                  <G key={wx}>
                    <Circle
                      cx={wx}
                      cy={27.6}
                      r={1.75}
                      fill={c.rubber}
                      stroke={ink}
                      strokeWidth={0.4}
                    />
                    <Circle cx={wx} cy={27.6} r={0.65} fill={c.metal} />
                  </G>
                ))}
              </G>
            );
          })}
        </G>
      );
      break;
    }

    // ── Which unit? ───────────────────────────────────────────────────────────
    case 'school hallway': {
      // One-point view down the hall: walls with doors on both sides, tiles meeting far away.
      const door = (d: string, win: string, knob: [number, number], key: string) => (
        <G key={key}>
          {face(d, c.blockBlue, 0.7)}
          <Path d={win} fill={c.glass} stroke={ink} strokeWidth={0.5} />
          <Circle cx={knob[0]} cy={knob[1]} r={0.6} fill={c.chartSecond} />
        </G>
      );
      art = (
        <>
          {face('M 2 2 H 46 L 30 14 H 18 Z', c.chartDay)}
          {face('M 2 2 L 18 14 V 28 L 2 46 Z', c.paper)}
          {face('M 46 2 L 30 14 V 28 L 46 46 Z', c.paper)}
          {face('M 2 46 L 18 28 H 30 L 46 46 Z', c.wood)}
          <Path
            d="M 21 28 L 13 46 M 24 28 V 46 M 27 28 L 35 46 M 12.7 34.3 H 35.3 M 7.3 40.3 H 40.7"
            stroke={c.woodDark}
            strokeWidth={0.5}
          />
          {face('M 18 14 H 30 V 28 H 18 Z', c.rock3, 0.7)}
          <Rect
            x={21}
            y={16.5}
            width={6}
            height={6}
            fill={c.skyMorning}
            stroke={ink}
            strokeWidth={0.5}
          />
          <Path d="M 24 16.5 V 22.5 M 21 19.5 H 27" stroke={ink} strokeWidth={0.4} />
          {door(
            'M 5 42.6 V 15.7 L 10 16.7 V 37 Z',
            'M 6 22.4 V 18.3 L 9 18.9 V 22.4 Z',
            [9, 28],
            'l1',
          )}
          {door(
            'M 12.5 34.2 V 17.2 L 15 17.7 V 31.4 Z',
            'M 13 21.6 V 18.4 L 14.5 18.7 V 21.5 Z',
            [14.4, 25.5],
            'l2',
          )}
          {door(
            'M 43 42.6 V 15.7 L 38 16.7 V 37 Z',
            'M 42 22.4 V 18.3 L 39 18.9 V 22.4 Z',
            [39, 28],
            'r1',
          )}
          {door(
            'M 35.5 34.2 V 17.2 L 33 17.7 V 31.4 Z',
            'M 35 21.6 V 18.4 L 33.5 18.7 V 21.5 Z',
            [33.6, 25.5],
            'r2',
          )}
          <Path
            d="M 20.5 6 H 27.5 L 27 7.6 H 21 Z M 22.3 10.4 H 25.7 L 25.5 11.4 H 22.5 Z"
            fill={c.bulbGlow}
          />
        </>
      );
      break;
    }
    case 'classroom from above': {
      // Seen from the ceiling: the board at the front, the teacher's desk, three rows of desks.
      const cols = [6.5, 19.5, 32.5];
      const rows = [17, 26, 35];
      art = (
        <>
          {face('M 3 3 H 45 V 45 H 3 Z', c.rock3, 1.6)}
          <Path d="M 3 11 V 18" stroke={c.rock3} strokeWidth={2.2} />
          <Path
            d="M 3 11 A 7 7 0 0 1 10 18"
            fill="none"
            stroke={ink}
            strokeWidth={0.6}
            strokeDasharray="1 1"
          />
          <Rect
            x={11}
            y={3.6}
            width={26}
            height={2.6}
            rx={0.6}
            fill={c.snow}
            stroke={ink}
            strokeWidth={0.6}
          />
          {face('M 31 8 H 42 V 13 H 31 Z', c.wood, 0.7)}
          <Rect
            x={33}
            y={9}
            width={3.2}
            height={2.4}
            fill={c.blockRed}
            stroke={ink}
            strokeWidth={0.3}
          />
          <Circle cx={36.5} cy={15} r={1.3} fill={c.blockGreen} stroke={ink} strokeWidth={0.4} />
          {rows.map((y) =>
            cols.map((x) => (
              <G key={`${x} ${y}`}>
                <Rect
                  x={x + 2.2}
                  y={y + 5.2}
                  width={4.6}
                  height={2.8}
                  rx={0.9}
                  fill={c.blockBlue}
                  stroke={ink}
                  strokeWidth={0.4}
                />
                {face(`M ${x} ${y} H ${x + 9} V ${y + 5} H ${x} Z`, c.wood, 0.6)}
              </G>
            )),
          )}
        </>
      );
      break;
    }

    // ── a.m. or p.m.? ─────────────────────────────────────────────────────────
    case 'breakfast by morning window':
    case 'dinner by evening window': {
      const morning = icon === 'breakfast by morning window';
      art = (
        <>
          {/* The window: morning blue with the sun up low, or dusk orange with the moon. */}
          <Rect x={8} y={3} width={32} height={21} fill={morning ? c.skyMorning : c.skyEvening} />
          {morning ? null : (
            <Rect x={8} y={3} width={32} height={8} fill={c.purple} fillOpacity={0.55} />
          )}
          {morning ? (
            <>
              <Circle
                cx={30}
                cy={18}
                r={4.2}
                fill={c.sunDisk}
                stroke={c.sunRay}
                strokeWidth={0.8}
              />
              <Path
                d="M 30 11.2 V 12.6 M 24.6 13.4 L 25.7 14.4 M 35.4 13.4 L 34.3 14.4 M 23.2 18 H 24.6 M 36.8 18 H 35.4"
                stroke={c.sunRay}
                strokeWidth={0.9}
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <Path d="M 16 6 A 3.2 3.2 0 1 0 19.2 10.6 A 2.6 2.6 0 1 1 16 6 Z" fill={c.moonLit} />
              <Path
                d="M 30 7 l 0.5 1.1 l 1.1 0.5 l -1.1 0.5 l -0.5 1.1 l -0.5 -1.1 l -1.1 -0.5 l 1.1 -0.5 Z"
                fill={c.moonLit}
              />
            </>
          )}
          <Path
            d="M 8 24 V 20 C 14 17.5 20 18.5 24 20 C 29 21.5 35 19 40 20.5 V 24 Z"
            fill={c.lifeDeep}
          />
          {morning ? null : (
            <Path
              d="M 8 24 V 20 C 14 17.5 20 18.5 24 20 C 29 21.5 35 19 40 20.5 V 24 Z"
              fill={c.rubber}
              fillOpacity={0.35}
            />
          )}
          <Rect x={8} y={3} width={32} height={21} fill="none" stroke={c.paper} strokeWidth={2} />
          <Rect x={7} y={2} width={34} height={23} fill="none" stroke={ink} strokeWidth={0.8} />
          <Path d="M 24 3 V 24 M 8 13.5 H 40" stroke={c.paper} strokeWidth={1.4} />
          <Rect x={6} y={24} width={36} height={2} fill={c.paper} stroke={ink} strokeWidth={0.6} />
          {/* The table. */}
          {face('M 2 39 H 46 V 46 H 2 Z', c.wood)}
          {morning ? (
            <>
              <FloorShadow cx={24} cy={39.4} rx={10} ry={1.4} />
              {limb('M 30 31 L 41 25', c.metal, 1.2)}
              {lit(
                'M 12 30.5 H 36 C 35 36.5 30.5 39.5 24 39.5 C 17.5 39.5 13 36.5 12 30.5 Z',
                c.blockBlue,
              )}
              <Ellipse
                cx={24}
                cy={30.6}
                rx={11.6}
                ry={2.3}
                fill={c.snow}
                stroke={ink}
                strokeWidth={0.6}
              />
              {[
                [18, 30.2],
                [21.5, 31.2],
                [25, 29.9],
                [28.5, 31],
                [31, 30],
                [15.6, 30.9],
              ].map(([x, y]) => (
                <Circle
                  key={x}
                  cx={x}
                  cy={y}
                  r={1.1}
                  fill={c.orange}
                  stroke={c.furDark}
                  strokeWidth={0.3}
                />
              ))}
            </>
          ) : (
            <>
              <FloorShadow cx={24} cy={39.6} rx={16} ry={1.3} />
              {lit(ell(22, 35, 15, 4.3), c.snow, 0.8)}
              <Ellipse
                cx={22}
                cy={34.8}
                rx={10.5}
                ry={2.8}
                fill="none"
                stroke={c.fabric}
                strokeWidth={0.7}
              />
              {blob(17, 34.2, 4.2, 2, c.fur, -8, 0.6)}
              {blob(25.5, 33.6, 3.4, 1.9, c.fat, 0, 0.6)}
              {[
                [26, 36],
                [28, 36.4],
                [29.2, 35],
                [27.3, 34.9],
              ].map(([x, y]) => (
                <Circle
                  key={x}
                  cx={x}
                  cy={y}
                  r={0.9}
                  fill={c.life}
                  stroke={c.lifeDeep}
                  strokeWidth={0.3}
                />
              ))}
              <Path
                d="M 40 30 L 42.6 39 M 39.4 30.2 V 32 M 40.3 30 V 31.8 M 41.2 29.8 V 31.6"
                stroke={c.metalDark}
                strokeWidth={0.8}
                strokeLinecap="round"
              />
            </>
          )}
        </>
      );
      break;
    }
    case 'sunrise with arrow up':
    case 'sunset with arrow down': {
      const rise = icon === 'sunrise with arrow up';
      art = (
        <>
          <Rect
            x={2}
            y={2}
            width={44}
            height={32}
            rx={3}
            fill={rise ? c.skyMorning : c.skyEvening}
          />
          {rise ? (
            <Rect x={2} y={24} width={44} height={9} fill={c.chartSecond} fillOpacity={0.35} />
          ) : (
            <Rect x={2} y={2} width={44} height={12} rx={3} fill={c.purple} fillOpacity={0.55} />
          )}
          {rise ? (
            <>
              <Path
                d="M 19 19 V 15.5 M 12.6 21.6 L 10.2 19.2 M 25.4 21.6 L 27.8 19.2 M 9.4 27.5 H 6.4 M 28.6 27.5 H 31.6"
                stroke={c.sunRay}
                strokeWidth={1.3}
                strokeLinecap="round"
              />
              {lit('M 10 32 A 9 9 0 0 1 28 32 Z', c.sunDisk, 0.9)}
            </>
          ) : (
            lit('M 10.6 32 A 10 10 0 0 1 29.4 32 Z', c.orange, 0.9)
          )}
          {face('M 2 32 H 46 V 43 Q 46 46 43 46 H 5 Q 2 46 2 43 Z', c.lifeDeep)}
          {rise ? null : (
            <Path
              d="M 2 32 H 46 V 43 Q 46 46 43 46 H 5 Q 2 46 2 43 Z"
              fill={c.rubber}
              fillOpacity={0.35}
            />
          )}
          <Path d="M 2 32 H 46" stroke={ink} strokeWidth={0.9} />
          {rise ? arrow(38.5, 28, 38.5, 8, ink, 2.2) : arrow(38.5, 8, 38.5, 28, ink, 2.2)}
        </>
      );
      break;
    }

    // ── What plants and animals need ─────────────────────────────────────────
    case 'pot of soil with roots':
      art = (
        <>
          <FloorShadow cx={24} cy={44.5} rx={12} ry={1.6} />
          {limb('M 24 17 C 24 13 24.5 10 24 6', c.lifeDeep, 1.2)}
          {leaf(24, 11, 8, -35)}
          {leaf(24, 13.5, 7.5, -150)}
          {face('M 9 18 H 39 L 35 44.5 H 13 Z', c.orange)}
          {/* The front of the pot cut away, to show the soil and the roots in it. */}
          <Path
            d="M 12.4 21 H 35.6 L 32.8 41.5 H 15.2 Z"
            fill={c.soil}
            stroke={ink}
            strokeWidth={0.6}
          />
          <Path
            d="M 24 21 C 24 26 22.5 30 20 35 M 23.6 25 C 21 27 18.5 28 16.5 31 M 24.2 23.5 C 26.5 28 29.5 30 31.5 34 M 24.1 27 C 24.6 32 24 36 24.6 40 M 27 29.2 C 29 29.8 31 29.4 33.5 27.5 M 20.8 33 C 18.5 34.5 17.6 36.5 17 38.5"
            fill="none"
            stroke={c.furLight}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <Ellipse cx={30} cy={38} rx={1.2} ry={0.8} fill={c.soilDark} />
          <Ellipse cx={18.5} cy={24.5} rx={1.2} ry={0.8} fill={c.soilDark} />
          {face('M 7 14.5 H 41 V 19.5 H 7 Z', c.orange, 1)}
          <Ellipse cx={24} cy={15.2} rx={15.5} ry={1.1} fill={c.soil} />
        </>
      );
      break;
    case 'water drop':
      art = (
        <>
          <FloorShadow cx={24} cy={44} rx={10} ry={1.8} />
          {lit(drop(24, 28, 22), c.water, 1.2)}
          <Path
            d="M 17.5 26 C 17 30 18.5 35 22 37"
            fill="none"
            stroke={c.shine}
            strokeOpacity={0.75}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Circle cx={19} cy={21.5} r={1.1} fill={c.shine} fillOpacity={0.75} />
        </>
      );
      break;
    case 'bird nest': {
      const twigs =
        'M 7 29 Q 16 33 26 31 T 41 30 M 8 33 Q 18 38 30 35 T 40 34 M 11 37 Q 22 41 34 38 M 14 40 Q 24 43 33 41 M 10 28 L 16 34 M 20 30 L 25 38 M 32 30 L 28 39 M 39 29 L 34 36';
      art = (
        <>
          <FloorShadow cx={24} cy={44} rx={17} ry={1.8} />
          {lit('M 6 26 C 6 34 13 43.5 24 43.5 C 35 43.5 42 34 42 26 Z', c.bark)}
          {blob(18, 25, 4, 5, c.skyMorning, -12, 0.8)}
          {blob(30, 25, 4, 5, c.skyMorning, 12, 0.8)}
          {blob(24, 23.5, 4, 5, c.skyMorning, 0, 0.8)}
          {lit(
            'M 4.5 25.5 Q 24 32 43.5 25.5 Q 44.5 29 41 30.5 Q 24 36 7 30.5 Q 3.5 29 4.5 25.5 Z',
            c.fur,
          )}
          <Path d={twigs} fill="none" stroke={c.furDark} strokeWidth={0.7} strokeLinecap="round" />
          <Path
            d="M 5 26.5 L 1.5 24.5 M 43 26 L 46.5 23 M 42 31 L 46 32.5"
            stroke={c.furDark}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
        </>
      );
      break;
    }

    // ── Who made the change? ─────────────────────────────────────────────────
    case 'beaver at dam':
      art = (
        <>
          {/* Deep water held back on the left, a low stream on the right. */}
          <Rect x={2} y={22} width={24} height={24} rx={2.5} fill={c.water} fillOpacity={0.6} />
          <Rect x={22} y={37} width={24} height={9} rx={2.5} fill={c.water} fillOpacity={0.45} />
          <Path
            d="M 4 25 H 9 M 12 28 H 18"
            stroke={c.shine}
            strokeOpacity={0.7}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          {lit('M 10 46 C 12 32 17 23 24 23 C 31 23 35 34 38 46 Z', c.bark)}
          <Path
            d="M 12 38 L 34 31 M 14 32 L 33 40 M 18 26 L 30 34 M 17 43 L 36 36 M 22 24.5 L 25 45 M 29 26 L 20 40"
            stroke={c.furDark}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <Path
            d="M 12 38 L 34 31 M 17 43 L 36 36"
            stroke={c.fur}
            strokeWidth={0.6}
            strokeLinecap="round"
          />
          {/* The beaver on top, a stick in its mouth. */}
          <G transform="rotate(20 21 22)">
            <Ellipse cx={20} cy={22} rx={5.5} ry={2.3} fill={c.furDark} {...o(0.8)} />
            <Path d="M 16 21 L 24 23 M 17 23 L 23 21" stroke={c.fur} strokeWidth={0.4} />
          </G>
          {blob(29, 19, 7.5, 5.5, c.fur, -8)}
          {blob(36.5, 14.5, 4.3, 3.8, c.fur, 0)}
          <Circle cx={34.5} cy={11} r={1.2} fill={c.furDark} stroke={ink} strokeWidth={0.5} />
          {eye(37.6, 13.4, 0.75)}
          <Circle cx={40.6} cy={14.6} r={0.9} fill={c.rubber} />
          <Rect
            x={38.8}
            y={17}
            width={1.8}
            height={1.6}
            fill={c.orange}
            stroke={ink}
            strokeWidth={0.4}
          />
          {limb('M 33 18 L 46 13', c.wood, 1.1)}
          {blob(32.5, 22.5, 1.8, 2.4, c.furDark, -20, 0.6)}
          {blob(26, 24, 3, 1.6, c.furDark, 0, 0.6)}
        </>
      );
      break;
    case 'squirrel digging':
      art = (
        <>
          {soil(34, true)}
          <Path d="M 6 34.6 Q 12.5 43 19 34.6 Z" fill={c.soilDark} stroke={ink} strokeWidth={0.5} />
          {blob(35, 32.5, 6, 2.6, c.soil, 0, 0.6)}
          {limb('M 31 25 C 38 24 41 18 38 13 C 36 9 38 5 43 5.5', c.fur, 6)}
          <Path
            d="M 33 24 C 38 22.5 39.5 18 37 13.5 C 35.2 10.3 37.5 7 41.5 7"
            fill="none"
            stroke={c.furLight}
            strokeWidth={1.3}
            strokeOpacity={0.8}
            strokeLinecap="round"
          />
          {blob(29, 30, 4, 4.5, c.fur, 0)}
          {limb('M 30 33 L 33 34', c.fur, 1.6)}
          {blob(23, 26.5, 8, 5.4, c.fur, 25)}
          {limb('M 17 30 L 13 35', c.fur, 1.5)}
          {limb('M 19.5 31 L 16.5 35.5', c.fur, 1.5)}
          {blob(14.5, 29.5, 4.2, 3.6, c.fur, 30)}
          <Path d="M 15 25.5 L 16.2 22.6 L 17.8 25.8 Z" fill={c.fur} {...o(0.7)} />
          {eye(14.2, 28.4, 0.75)}
          <Circle cx={11.2} cy={31.8} r={0.7} fill={c.rubber} />
          {[
            [7, 29, 1],
            [5, 25.5, 0.8],
            [9.5, 25, 0.7],
            [3.8, 30.5, 0.7],
          ].map(([x, y, r]) => (
            <Circle key={x} cx={x} cy={y} r={r} fill={c.soil} stroke={ink} strokeWidth={0.3} />
          ))}
        </>
      );
      break;
    case 'bird building nest':
      art = (
        <>
          {limb('M 2 38 C 14 36 30 37 46 33', c.bark, 2.6)}
          {limb('M 36 35 L 44 26', c.bark, 1.6)}
          {leaf(44, 26, 6, -60)}
          {/* A nest half built: a low bowl with loose twigs. */}
          {lit(
            'M 21 31 C 22 37 26 38.5 31 38.5 C 36 38.5 40 37 41 31 Q 31 34 21 31 Z',
            c.bark,
            0.9,
          )}
          <Path
            d="M 21 32 Q 31 36 41 32 M 23 35 Q 31 38 39 35 M 20 30 L 25 33 M 40 29.5 L 36 34 M 30 33 L 33 29"
            fill="none"
            stroke={c.furDark}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          <Path
            d="M 11 32 V 36.8 M 13.5 32 V 36.8"
            stroke={c.orange}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          <Path d="M 7.5 28.5 L 1.5 31 L 3 27.5 Z" fill={c.feather} {...o(0.7)} />
          {blob(12, 27.5, 6.2, 4.6, c.feather, -18)}
          <Path
            d="M 10 30.5 C 12 32 15.5 31.5 17 29"
            fill={c.featherLight}
            stroke={ink}
            strokeWidth={0.4}
          />
          <Path
            d="M 8 26.5 C 10.5 24.5 14 25.5 15 28"
            fill="none"
            stroke={c.furDark}
            strokeWidth={0.9}
          />
          {blob(17.5, 21.5, 3.6, 3.4, c.feather, 0)}
          {eye(18.6, 20.6, 0.7)}
          <Path d="M 20.8 21 L 24 22 L 20.8 23 Z" fill={c.orange} {...o(0.5)} />
          {limb('M 21.5 22 L 30 17.5', c.wood, 0.8)}
          <Path d="M 26.5 19.4 L 28 21.5" stroke={c.wood} strokeWidth={0.8} strokeLinecap="round" />
        </>
      );
      break;
    case 'roots cracking sidewalk':
      art = (
        <>
          {soil(27, false)}
          {grass(2.5, 14, 27.4, 3)}
          {lit('M 4 28 C 6 20 6.5 11 5.5 2 H 12.5 C 11.5 11 12 20 14 28 Z', c.bark)}
          <Path
            d="M 8 8 V 13 M 9.6 17 V 22"
            stroke={c.furDark}
            strokeWidth={0.6}
            strokeLinecap="round"
          />
          {blob(10, 4, 10, 5.5, c.lifeDeep, 0, 0.8)}
          {blob(6, 6, 5, 3.5, c.life, 0, 0.7)}
          {blob(15, 5.5, 5, 3.2, c.life, 0, 0.7)}
          {limb('M 11 30 C 16 34 22 34 27 29.5 C 31 26.5 36 30 45 33', c.bark, 2.8)}
          {limb('M 6 30 C 5 35 6 39 4 43', c.bark, 1.4)}
          {limb('M 16 33 C 16 37 14 40 15 44', c.bark, 1)}
          {face('M 15 23.5 H 28 V 27.5 H 15 Z', c.rock3, 0.8)}
          <G transform="rotate(12 46 27.5)">
            {face('M 29.5 23.5 H 46 V 27.5 H 29.5 Z', c.rock3, 0.8)}
          </G>
          <Path
            d="M 25 23.5 L 26.3 25 L 25.4 26 L 26.5 27.5 M 33.5 20.6 L 34.5 22.3 L 33.6 23.3 L 34.8 24.7"
            fill="none"
            stroke={ink}
            strokeWidth={0.8}
            strokeLinejoin="round"
          />
        </>
      );
      break;
    case 'weeds in pavement crack':
      art = (
        <>
          {soil(38, false)}
          {face('M 2 29 H 22 L 21 31.5 L 22.5 34 L 21.5 38 H 2 Z', c.rock3)}
          {face('M 46 29 H 26 L 25.2 31.8 L 26.6 34.5 L 25.5 38 H 46 Z', c.rock3)}
          <Path
            d="M 22 29 L 21 31.5 L 22.5 34 L 21.5 38 H 25.5 L 26.6 34.5 L 25.2 31.8 L 26 29 Z"
            fill={c.soilDark}
          />
          {limb('M 24 30 C 24 22 25 16 27 11', c.lifeDeep, 1)}
          {lit(
            'M 23.5 29 C 18 28 14 25 12 20 C 15 21 16 19 18.5 22 C 18.5 19 20 18 21.5 20 C 22.5 23 23.5 26 23.5 29 Z',
            c.life,
            0.7,
          )}
          {lit(
            'M 24.5 29 C 30 28.5 34 26 36.5 21.5 C 33.5 22 32.5 20.5 30 23 C 30 20 28.5 19.5 27 21.5 C 26 24 24.5 26 24.5 29 Z',
            c.life,
            0.7,
          )}
          {grass(21.5, 26.5, 29.4, 4)}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            const a = (i * Math.PI) / 5;
            return (
              <Ellipse
                key={i}
                cx={27 + 2.6 * Math.cos(a)}
                cy={10 + 2.6 * Math.sin(a)}
                rx={1.7}
                ry={0.8}
                fill={c.chartSecond}
                stroke={ink}
                strokeWidth={0.3}
                transform={`rotate(${i * 36} ${27 + 2.6 * Math.cos(a)} ${10 + 2.6 * Math.sin(a)})`}
              />
            );
          })}
          <Circle cx={27} cy={10} r={1.8} fill={c.sunRay} stroke={ink} strokeWidth={0.4} />
        </>
      );
      break;
    case 'road roller on new road':
      art = (
        <>
          {/* Loose gravel ahead of the roller, smooth new road behind it. */}
          <Rect x={2} y={38} width={20} height={6} fill={c.rock3} stroke={ink} strokeWidth={0.6} />
          {[4, 7.5, 11, 14.5, 18, 5.5, 9, 16].map((x, i) => (
            <Circle key={i} cx={x} cy={i < 5 ? 40 : 42.3} r={0.7} fill={c.furGrey} />
          ))}
          <Rect
            x={18}
            y={38}
            width={28}
            height={6}
            fill={c.rubber}
            stroke={ink}
            strokeWidth={0.6}
          />
          <Path
            d="M 30 41 H 35 M 39 41 H 44"
            stroke={c.snow}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          {face('M 5 22 H 21 V 25.5 H 5 Z', c.chartSecond, 0.8)}
          <Circle cx={12} cy={30.5} r={7.5} fill={url(ids.metal)} {...o(1)} />
          <Circle cx={12} cy={30.5} r={2.2} fill={c.chartSecond} stroke={ink} strokeWidth={0.6} />
          {face('M 16 24 H 42 V 33 H 16 Z', c.chartSecond)}
          <Path d="M 26 24 V 10.5 M 40 24 V 10.5" stroke={c.rubber} strokeWidth={1.4} />
          <Rect x={27} y={12} width={12} height={9} fill={c.glass} stroke={ink} strokeWidth={0.5} />
          {face('M 24 8 H 42 V 10.8 H 24 Z', c.rubber, 0.7)}
          {limb('M 19 24 V 16', c.metalDark, 1)}
          <Circle cx={37} cy={33} r={5} fill={c.rubber} stroke={ink} strokeWidth={0.8} />
          <Circle cx={37} cy={33} r={1.8} fill={c.metal} />
        </>
      );
      break;
    case 'hands planting garden':
      art = (
        <>
          {soil(31, false)}
          <Path d="M 2 31 Q 12 29 24 31 T 46 31" fill="none" stroke={c.soilDark} strokeWidth={1} />
          {[7, 15].map((x) => (
            <G key={x}>
              {limb(`M ${x} 31 V 25`, c.lifeDeep, 0.9)}
              {leaf(x, 26.5, 4.5, -30)}
              {leaf(x, 26.5, 4.5, -150)}
            </G>
          ))}
          <Ellipse cx={32} cy={31.5} rx={5.5} ry={1.6} fill={c.soilDark} />
          {limb('M 32 26 V 16', c.lifeDeep, 1)}
          {leaf(32, 18, 6, -35)}
          {leaf(32, 20, 5.5, -150)}
          {blob(32, 28, 3.6, 3, c.soil, 0, 0.8)}
          {limb('M 25 26 L 20.5 13', c.skinBrown, 3.6)}
          {limb('M 40 26 L 42.5 13', c.skinBrown, 3.6)}
          {limb('M 20.5 13 L 16 1', c.blockGreen, 5.5)}
          {limb('M 42.5 13 L 45 1', c.blockGreen, 5.5)}
          {hand(25, 25.5, 70, c.skinBrown, 1.1)}
          {hand(40, 25.5, 110, c.skinBrown, 1.1)}
        </>
      );
      break;

    // ── Help or hurt? ────────────────────────────────────────────────────────
    case 'hand putting can in bin':
      art = (
        <>
          <FloorShadow cx={24} cy={45} rx={12} ry={1.5} />
          {face('M 12 25 H 36 L 33.5 45 H 14.5 Z', c.blockGreen)}
          <Path
            d="M 18 28 L 19 42 M 24 28 V 42 M 30 28 L 29 42"
            stroke={c.lifeDeep}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          {face('M 10 22 H 38 V 25.5 H 10 Z', c.blockGreen, 1)}
          <Ellipse cx={24} cy={22.4} rx={12.5} ry={1} fill={c.rubber} />
          <Path
            d="M 24 12.5 V 19"
            stroke={c.chartMuted}
            strokeWidth={0.9}
            strokeDasharray="1.2 1.2"
            strokeLinecap="round"
          />
          <G transform="rotate(-12 24 9)">
            {face('M 20.5 3.5 H 27.5 V 14.5 H 20.5 Z', c.blockRed, 0.8)}
            <Rect x={20.5} y={3.5} width={7} height={11} fill={url(ids.sheen)} />
            <Path d="M 20.5 5.2 H 27.5 M 20.5 12.8 H 27.5" stroke={c.silver} strokeWidth={1} />
          </G>
          {limb('M 46 13 L 35 9.5', c.skinDeep, 3.6)}
          {hand(33, 9.5, 170, c.skinDeep, 1.1)}
        </>
      );
      break;
    case 'cloth shopping bag':
      art = (
        <>
          <FloorShadow cx={24} cy={45} rx={14} ry={1.6} />
          {lit('M 27 20 L 33 6 L 36.5 7.5 L 31 21 Z', c.wood, 0.8)}
          {leaf(18, 20, 9, -120, c.lifeDeep)}
          {leaf(19, 20, 9, -80)}
          {leaf(21, 20, 8, -50)}
          {limb('M 15 19 C 15 8 22 8 22 19', c.furLight, 1.8)}
          {limb('M 26 19 C 26 8 33 8 33 19', c.furLight, 1.8)}
          {face('M 10 18 H 38 L 36 44.5 H 12 Z', c.furLight)}
          <Path d="M 10.4 21 H 37.6" stroke={c.fur} strokeWidth={0.7} strokeDasharray="1.2 1" />
          {leaf(19, 34, 10, -30, c.lifeDeep)}
          <Path d="M 17 36 C 21 34 26 34 29 30" fill="none" stroke={c.lifeDeep} strokeWidth={0.8} />
        </>
      );
      break;
    case 'hand closing faucet':
    case 'running faucet': {
      const running = icon === 'running faucet';
      art = (
        <>
          {lit('M 3 35 H 45 C 43 42.5 36 45.5 24 45.5 C 12 45.5 5 42.5 3 35 Z', c.snow)}
          <Ellipse
            cx={24}
            cy={35.8}
            rx={20}
            ry={2}
            fill={c.fabric}
            stroke={ink}
            strokeWidth={0.6}
          />
          {face('M 30 18 H 36 V 36 H 30 Z', c.metal)}
          <Rect x={30} y={18} width={6} height={18} fill={url(ids.sheen)} />
          <Path d="M 33 19 C 33 11.5 20 11 18 16.5 V 20" fill="none" {...o(5.4)} />
          <Path
            d="M 33 19 C 33 11.5 20 11 18 16.5 V 20"
            fill="none"
            stroke={c.metal}
            strokeWidth={3.8}
          />
          <Path
            d="M 31.8 17 C 31 13.5 22 12.8 19.5 15.5"
            fill="none"
            stroke={c.shine}
            strokeOpacity={0.7}
            strokeWidth={0.9}
          />
          <G transform={running ? 'rotate(-35 33 12)' : undefined}>
            {face('M 27.5 10.5 H 38.5 V 13.5 H 27.5 Z', c.metal, 0.8)}
          </G>
          <Circle cx={33} cy={12} r={1.4} fill={c.blockBlue} stroke={ink} strokeWidth={0.5} />
          {running ? (
            <>
              <Path
                d="M 16.3 21 C 16 26 16.8 30 16 35.5 H 20 C 19.4 30 20.2 26 19.7 21 Z"
                fill={c.water}
                fillOpacity={0.85}
                stroke={c.waterDeep}
                strokeWidth={0.5}
              />
              <Path
                d="M 17.4 23 V 32"
                stroke={c.shine}
                strokeOpacity={0.7}
                strokeWidth={0.7}
                strokeLinecap="round"
              />
              {[
                [12.5, 33],
                [23.5, 32.5],
                [10, 35],
                [26, 34.5],
              ].map(([x = 0, y = 0]) => (
                <Path key={x} d={drop(x, y, 1.6)} fill={c.water} />
              ))}
            </>
          ) : (
            <>
              <Path d={drop(18, 25, 2)} fill={c.water} stroke={c.waterDeep} strokeWidth={0.4} />
              <Path
                d="M 26 7.5 A 8 5.5 0 0 1 40 7.5"
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={1.3}
                strokeLinecap="round"
              />
              <Path d="M 40.8 4.8 L 40.6 9.2 L 37 7.4 Z" fill={c.chartHighlight} />
              {limb('M 47 22 L 41 15', c.skin, 3.6)}
              {hand(40, 14, -150, c.skin, 1.05)}
            </>
          )}
        </>
      );
      break;
    }
    case 'planting a tree sapling':
      art = (
        <>
          {soil(33, true)}
          <Path d="M 14 33.6 Q 21 44 28 33.6 Z" fill={c.soilDark} stroke={ink} strokeWidth={0.5} />
          {blob(21, 37, 4, 3.2, c.soil, 0, 0.7)}
          {limb('M 21 36 C 21 28 21.5 20 21 13', c.bark, 1.6)}
          {blob(21, 10, 7.5, 6.5, c.life)}
          {blob(16.5, 12.5, 4, 3.4, c.lifeDeep, 0, 0.7)}
          {blob(25.5, 7.5, 3.6, 3, c.life, 0, 0.7)}
          {/* A dirt pile with the shovel in it. */}
          {blob(38, 33, 7, 3.5, c.soil, 0, 0.8)}
          {limb('M 38.5 29 L 43 7', c.wood, 1.6)}
          <Path d="M 40.5 6.5 H 45.5" stroke={ink} strokeWidth={2.6} strokeLinecap="round" />
          <Path d="M 40.5 6.5 H 45.5" stroke={c.wood} strokeWidth={1.4} strokeLinecap="round" />
          {lit('M 35.2 27.5 L 41.2 28.7 L 39.4 35.5 L 35 33.5 Z', c.metal, 0.8)}
          {limb('M 2 25 L 15 23.5', c.skinDeep, 3.6)}
          <Path d="M 1 22.5 H 6 V 27.5 H 1 Z" fill={c.blockRed} {...o(0.7)} />
          {hand(16, 23.4, -5, c.skinDeep, 1.05)}
        </>
      );
      break;
    case 'wrapper falling on grass': {
      const wrapper = (
        <>
          <Path
            d="M -4 -2.6 H 4 L 7.5 -4.5 V 4.5 L 4 2.6 H -4 L -7.5 4.5 V -4.5 Z"
            fill={c.petalPink}
            {...o(0.8)}
          />
          <Path d="M -1.5 -2.6 V 2.6 M 1.5 -2.6 V 2.6" stroke={c.purple} strokeWidth={1.1} />
        </>
      );
      art = (
        <>
          {soil(40, true)}
          {grass(2.5, 45.5, 40.4, 5)}
          <Path
            d="M 17 12 C 21 15 23 18 24.5 22"
            fill="none"
            stroke={c.chartMuted}
            strokeWidth={0.9}
            strokeDasharray="1.2 1.4"
            strokeLinecap="round"
          />
          <G transform="translate(27 29) rotate(28)">{wrapper}</G>
          <Path
            d="M 22 20 L 20 23 M 25 18 L 23 21.5"
            stroke={c.chartMuted}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          {limb('M 1 3 L 11 8', c.skin, 3.6)}
          <Path d="M 0 0.5 H 3.5 L 2.8 6 L 0 5 Z" fill={c.blockBlue} {...o(0.7)} />
          {hand(12, 8.5, 35, c.skin, 1.05)}
        </>
      );
      break;
    }
    case 'hand with picked flowers': {
      const heads: [number, number, string][] = [
        [20, 8, c.petalPink],
        [27, 5, c.chartSecond],
        [34, 8, c.purple],
        [23.5, 14, c.orange],
        [31, 13.5, c.blockRed],
        [38, 15, c.petalPink],
      ];
      art = (
        <>
          {soil(40, true)}
          {[5, 9.5, 14, 18.5].map((x) => (
            <G key={x}>{limb(`M ${x} 40.5 V ${35 + (x % 3)}`, c.lifeDeep, 0.9)}</G>
          ))}
          {heads.map(([x, y], i) => (
            <Path
              key={i}
              d={`M 30 30 Q ${(x + 30) / 2} ${(y + 30) / 2 + 2} ${x} ${y}`}
              fill="none"
              stroke={c.lifeDeep}
              strokeWidth={0.9}
            />
          ))}
          <Path
            d="M 29 32 L 28 37 M 30.5 32 L 30.5 37.5 M 32 32 L 33 37"
            stroke={c.lifeDeep}
            strokeWidth={0.9}
          />
          {heads.map(([x, y, col], i) => (
            <G key={i}>
              {[0, 1, 2, 3, 4].map((k) => {
                const a = (k * 2 * Math.PI) / 5 + i;
                return (
                  <Circle
                    key={k}
                    cx={x + 2 * Math.cos(a)}
                    cy={y + 2 * Math.sin(a)}
                    r={1.6}
                    fill={col}
                    stroke={ink}
                    strokeWidth={0.35}
                  />
                );
              })}
              <Circle cx={x} cy={y} r={1.1} fill={c.sunDisk} stroke={ink} strokeWidth={0.3} />
            </G>
          ))}
          {limb('M 34 32 L 46 38', c.skinBrown, 3.8)}
          {lit(ell(30.8, 30.8, 3.4, 3), c.skinBrown, 0.8)}
          <Path d="M 28.5 29 H 32 M 28.4 31 H 32 M 28.8 33 H 31.8" stroke={ink} strokeWidth={0.4} />
        </>
      );
      break;
    }

    // ── A cup phone: one scene, the shaking part in orange ────────────────────
    case 'cup phone voice shakes cup':
    case 'cup phone string shakes':
    case 'cup phone far cup shakes':
    case 'cup phone friend hears': {
      const stage = [
        'cup phone voice shakes cup',
        'cup phone string shakes',
        'cup phone far cup shakes',
        'cup phone friend hears',
      ].indexOf(icon);
      const hot = c.orange;
      const cupL = 'M 12 14.5 L 16.5 16.4 V 19.6 L 12 21.5 Z';
      const cupR = 'M 36 14.5 L 31.5 16.4 V 19.6 L 36 21.5 Z';
      const string =
        stage === 1
          ? 'M 16.5 18 Q 18.4 15.6 20.25 18 T 24 18 T 27.75 18 T 31.5 18'
          : 'M 16.5 18 H 31.5';
      art = (
        <>
          {lit('M 1 47 V 30 C 1 26 4 24 7 24 C 10 24 13 26 13 30 V 47 Z', c.blockBlue)}
          {lit('M 35 47 V 30 C 35 26 38 24 41 24 C 44 24 47 26 47 30 V 47 Z', c.blockRed)}
          {head(7, 16, 4.8, c.skin, c.furDark, 1)}
          {head(41, 16, 4.8, c.skinDeep, c.rubber, 0)}
          {stage === 3 ? (
            <Circle cx={41} cy={16} r={5.9} fill="none" stroke={hot} strokeWidth={1.1} />
          ) : null}
          <Path
            d={string}
            fill="none"
            stroke={stage === 1 ? hot : c.fur}
            strokeWidth={stage === 1 ? 1.2 : 0.8}
          />
          {lit(cupL, c.cupLight, 0.8)}
          {lit(cupR, c.cupLight, 0.8)}
          <Path d="M 12 14.5 V 21.5 M 36 14.5 V 21.5" stroke={c.cupDark} strokeWidth={1} />
          {stage === 0 ? <Path d={cupL} fill="none" stroke={hot} strokeWidth={1.3} /> : null}
          {stage === 2 ? <Path d={cupR} fill="none" stroke={hot} strokeWidth={1.3} /> : null}
          {limb('M 10.5 27.5 L 14.3 21.8', c.skin, 1.8)}
          {lit(ell(14.4, 21.4, 1.5, 1.4), c.skin, 0.6)}
          {limb('M 37.5 27.5 L 33.7 21.8', c.skinDeep, 1.8)}
          {lit(ell(33.6, 21.4, 1.5, 1.4), c.skinDeep, 0.6)}
          {stage === 0 ? (
            <>
              {shake(14.2, 11.6)}
              {shake(14.2, 25.4)}
            </>
          ) : null}
          {stage === 1 ? (
            <>
              {shake(24, 13.2)}
              {shake(24, 23.4)}
            </>
          ) : null}
          {stage === 2 ? (
            <>
              {shake(33.8, 11.6)}
              {shake(33.8, 25.4)}
            </>
          ) : null}
          {stage === 3 ? (
            <Path
              d="M 38.6 16.3 A 2.4 2.4 0 0 1 38.6 19.7 M 40 14.6 A 4.2 4.2 0 0 1 40 21.4"
              fill="none"
              stroke={hot}
              strokeWidth={0.9}
              strokeLinecap="round"
            />
          ) : null}
        </>
      );
      break;
    }

    // ── Balanced or unbalanced? ──────────────────────────────────────────────
    case 'book on table with equal arrows':
      art = (
        <>
          <FloorShadow cx={24} cy={44.8} rx={19} ry={1.2} />
          {face('M 7 31.5 H 10 V 44.5 H 7 Z', c.wood)}
          {face('M 38 31.5 H 41 V 44.5 H 38 Z', c.wood)}
          {face('M 4 28 H 44 V 31.5 H 4 Z', c.wood)}
          {lit('M 15 21.5 H 34 V 28 H 15 Q 13 28 13 24.75 Q 13 21.5 15 21.5 Z', c.blockRed, 0.9)}
          <Rect
            x={15.5}
            y={22.9}
            width={18.5}
            height={3.7}
            fill={c.paper}
            stroke={ink}
            strokeWidth={0.4}
          />
          <Path d="M 16 24.1 H 33.5 M 16 25.4 H 33.5" stroke={c.fabric} strokeWidth={0.4} />
          {arrow(24, 21, 24, 6.5)}
          {arrow(24, 28.5, 24, 43)}
        </>
      );
      break;
    case 'tug of war with equal arrows': {
      const person = (x: number, dir: 1 | -1, skin: string, hair: string, shirt: string) => {
        const sx = x - dir * 3.5;
        const hx = x - dir * 5;
        return (
          <G key={x}>
            {limb(`M ${x} 35 L ${x + dir * 4.5} 43.5`, c.rubber, 1.7)}
            {limb(`M ${x} 35 L ${x - dir * 1.5} 43.5`, c.rubber, 1.7)}
            {limb(`M ${x} 35 L ${sx} 26.5`, shirt, 3.8)}
            {head(hx, 21.2, 3.1, skin, hair, dir)}
            {limb(`M ${sx} 27.5 L ${x + dir * 3.5} 27`, skin, 1.3)}
          </G>
        );
      };
      art = (
        <>
          <FloorShadow cx={24} cy={44} rx={21} ry={1.3} />
          {grass(2, 46, 44.5, 2.2)}
          <Path
            d="M 24 36 V 44"
            stroke={c.chartMuted}
            strokeWidth={0.8}
            strokeDasharray="1.2 1.2"
          />
          {limb('M 3 27 H 45', c.furLight, 1.2)}
          {person(9, 1, c.skinDeep, c.rubber, c.blockBlue)}
          {person(18, 1, c.skin, c.fur, c.blockBlue)}
          {person(39, -1, c.skinBrown, c.furDark, c.blockRed)}
          {person(30, -1, c.skin, c.rubber, c.blockRed)}
          <Path
            d="M 23.2 27 L 22.4 32 L 24 31 L 25.6 32 L 24.8 27 Z"
            fill={c.chartSecond}
            {...o(0.6)}
          />
          {arrow(21, 10, 5, 10)}
          {arrow(27, 10, 43, 10)}
        </>
      );
      break;
    }
    case 'swing hanging still':
      art = (
        <>
          {grass(2, 46, 44.5, 2.2)}
          <FloorShadow cx={24} cy={44.4} rx={6} ry={1} />
          {limb('M 8 5 L 3 44', c.metal, 1.8)}
          {limb('M 8 5 L 13 44', c.metal, 1.8)}
          {limb('M 40 5 L 35 44', c.metal, 1.8)}
          {limb('M 40 5 L 45 44', c.metal, 1.8)}
          {limb('M 5.5 5 H 42.5', c.metal, 2.4)}
          <Path d="M 5.5 4.3 H 42.5" stroke={c.shine} strokeOpacity={0.6} strokeWidth={0.7} />
          {limb('M 19 6 V 33', c.furGrey, 0.7)}
          {limb('M 29 6 V 33', c.furGrey, 0.7)}
          {face('M 16 32.5 H 32 V 35.5 H 16 Z', c.wood)}
        </>
      );
      break;
    case 'hand pushing box on rug':
      art = (
        <>
          {face('M 2 42.5 H 46 V 46 H 2 Z', c.wood, 0.7)}
          {face('M 4 38.5 H 46 V 42.5 H 4 Z', c.blockRed, 0.8)}
          <Path
            d="M 4 40.5 H 46"
            stroke={c.chartSecond}
            strokeWidth={0.9}
            strokeDasharray="2 1.5"
          />
          <Path d="M 4 39 L 2 38.6 M 4 40.5 H 2 M 4 42 L 2 42.4" stroke={ink} strokeWidth={0.5} />
          <FloorShadow cx={33} cy={38.8} rx={11} ry={1} />
          {face('M 22 21 H 43 V 38.5 H 22 Z', c.furLight)}
          <Path d="M 22 24.5 H 43" stroke={c.fur} strokeWidth={0.6} />
          <Path d="M 32.5 21 V 27.5" stroke={c.fur} strokeWidth={2.4} />
          {limb('M 1 29.5 L 8 29.8', c.blockGreen, 5)}
          {limb('M 8 29.8 L 17 30', c.skinBrown, 3.2)}
          {hand(18, 31, -85, c.skinBrown, 1.05)}
        </>
      );
      break;
    case 'foot kicking ball':
      art = (
        <>
          {face('M 2 39.5 H 46 V 46 H 2 Z', c.life, 0.7)}
          {grass(2, 46, 39.9, 2.6)}
          {limb('M 3 2 L 13 26', c.skinDeep, 4.2)}
          {limb('M 0 -3 L 4 5', c.blockBlue, 7)}
          {limb('M 12.2 24 L 14 29', c.snow, 4.2)}
          {lit(
            'M 11.5 28 C 11 32.5 13 35.5 17.5 35.5 H 23 C 24.8 35.5 25 33 23.3 32.3 C 20 31.3 17.5 30.2 15.5 27 Z',
            c.blockBlue,
          )}
          <Path
            d="M 12.5 34 C 14 35.8 16 36.2 17.5 36.2 H 23"
            fill="none"
            stroke={c.rubber}
            strokeWidth={1.2}
          />
          <FloorShadow cx={30} cy={39.6} rx={5.5} ry={1} />
          <Circle cx={30} cy={33} r={6} fill={url(ids.soccer)} {...o(0.9)} />
          <Path d="M 30 30.3 L 32.4 32 L 31.5 34.8 L 28.5 34.8 L 27.6 32 Z" fill={c.rubber} />
          <Path
            d="M 30 30.3 V 27.4 M 32.4 32 L 35.4 31 M 31.5 34.8 L 33.2 37.7 M 28.5 34.8 L 26.8 37.7 M 27.6 32 L 24.6 31"
            stroke={ink}
            strokeWidth={0.5}
          />
          <Path
            d="M 23.5 27.5 L 25 29.2 M 22.5 38.5 L 24.3 37.2"
            stroke={ink}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          {arrow(38, 33, 46.5, 33)}
        </>
      );
      break;
    case 'bike braking': {
      const wheel = (x: number) => (
        <G key={x}>
          <Circle cx={x} cy={34} r={7.5} fill="none" stroke={c.rubber} strokeWidth={2.2} />
          <Circle cx={x} cy={34} r={6.1} fill="none" stroke={c.metal} strokeWidth={0.6} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i * Math.PI) / 6;
            return (
              <Line
                key={i}
                x1={x - 6.1 * Math.cos(a)}
                y1={34 - 6.1 * Math.sin(a)}
                x2={x + 6.1 * Math.cos(a)}
                y2={34 + 6.1 * Math.sin(a)}
                stroke={c.metalDark}
                strokeWidth={0.4}
              />
            );
          })}
          <Circle cx={x} cy={34} r={1} fill={c.metalDark} />
          {/* The brake pads squeezing the rim. */}
          <Rect
            x={x - 1.8}
            y={25.4}
            width={3.6}
            height={1.8}
            rx={0.5}
            fill={c.rubber}
            stroke={ink}
            strokeWidth={0.4}
          />
          <Path
            d={`M ${x - 3.4} 25 l -1.2 -1.2 M ${x + 3.4} 25 l 1.2 -1.2 M ${x} 23.8 v -1.5`}
            stroke={c.orange}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
        </G>
      );
      art = (
        <>
          {face('M 2 41.5 H 46 V 46 H 2 Z', c.rock3, 0.7)}
          <Path d="M 2.5 41.2 H 11" stroke={c.rubber} strokeWidth={1.5} strokeLinecap="round" />
          <Circle cx={4} cy={38.4} r={1.3} fill={c.rock3} stroke={ink} strokeWidth={0.4} />
          <Circle cx={2.6} cy={35.8} r={0.9} fill={c.rock3} stroke={ink} strokeWidth={0.4} />
          {wheel(11)}
          {wheel(37)}
          <Path
            d="M 11 34 L 22 34 L 18 21 Z M 22 34 L 33 21 L 18 21 M 33 21 L 37 34 M 33 21 L 32 17"
            fill="none"
            stroke={c.blockRed}
            strokeWidth={1.9}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Path d="M 29.5 16.8 H 34.5" stroke={c.rubber} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M 33.8 17.6 L 35.6 19.6" stroke={ink} strokeWidth={0.9} strokeLinecap="round" />
          <Path d="M 15 19.8 H 21.5" stroke={c.rubber} strokeWidth={2} strokeLinecap="round" />
        </>
      );
      break;
    }
    case 'apple falling from branch':
      art = (
        <>
          {face('M 2 42 H 46 V 46 H 2 Z', c.life, 0.7)}
          {grass(2, 46, 42.4, 2.6)}
          <FloorShadow cx={24} cy={42.2} rx={4} ry={0.8} />
          {limb('M 1 7 C 12 9 30 6 47 10', c.bark, 2.6)}
          {leaf(10, 8.3, 7, 60)}
          {leaf(16, 8.2, 7, 125)}
          {leaf(33, 7.6, 7, 45)}
          {leaf(41, 8.8, 6, 120)}
          {leaf(29, 7.2, 6, -60)}
          {limb('M 24 7.5 L 24.4 10.5', c.bark, 0.8)}
          <Path
            d="M 20 13 V 17.5 M 24 12 V 17 M 28 13 V 17.5"
            stroke={c.chartMuted}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          <Path
            d="M 24 23 C 21 21 17 22.5 17 27.5 C 17 32 20.5 35 24 34 C 27.5 35 31 32 31 27.5 C 31 22.5 27 21 24 23 Z"
            fill={url(ids.ball)}
            {...o(0.9)}
          />
          <Path d="M 24 23 Q 24.3 20.5 25.5 19.5" fill="none" stroke={c.bark} strokeWidth={1} />
          {leaf(25.2, 20.4, 4.5, -25)}
        </>
      );
      break;
    case 'rock sliding on ice': {
      const rock = (x: number) =>
        `M ${x - 6} 33 C ${x - 6.5} 29 ${x - 3} 26 ${x + 0.5} 26 C ${x + 4.5} 26 ${x + 7} 29 ${x + 6.5} 33 Z`;
      art = (
        <>
          {face('M 2 33 H 46 V 44 Q 46 46 44 46 H 4 Q 2 46 2 44 Z', c.plastic)}
          <Path
            d="M 6 37 H 12 M 19 40.5 H 29 M 35 37 H 42 M 9 43 H 14"
            stroke={c.shine}
            strokeOpacity={0.8}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          {/* Where the rock was: the gaps shrink as it slows. */}
          {[8, 19, 27.5].map((x) => (
            <Path
              key={x}
              d={rock(x)}
              fill="none"
              stroke={c.chartMuted}
              strokeWidth={0.8}
              strokeDasharray="1.2 1.2"
            />
          ))}
          <FloorShadow cx={34.5} cy={33} rx={6.5} ry={0.9} />
          {lit(rock(34), c.furGrey)}
          <Path d="M 6 16 L 34 17.6 V 18.4 L 6 20 Z" fill={c.chartHighlight} />
          <Path d="M 34 15.2 L 40 18 L 34 20.8 Z" fill={c.chartHighlight} />
        </>
      );
      break;
    }

    // ── From seeing to catching: one scene, the lit path moving ──────────────
    case 'ball light entering eye':
    case 'eye nerve to brain lit':
    case 'brain lit':
    case 'brain nerve to arm lit':
    case 'hand catching ball': {
      const stage = [
        'ball light entering eye',
        'eye nerve to brain lit',
        'brain lit',
        'brain nerve to arm lit',
        'hand catching ball',
      ].indexOf(icon);
      const caught = stage === 4;
      const skin = c.skinBrown;
      const glow = (d: string) => (
        <>
          <Path
            d={d}
            fill="none"
            stroke={c.bulbGlow}
            strokeWidth={3.4}
            strokeOpacity={0.85}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d={d}
            fill="none"
            stroke={c.orange}
            strokeWidth={1.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
      const faint = (d: string) => (
        <Path
          d={d}
          fill="none"
          stroke={c.chartMuted}
          strokeWidth={0.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
      const eyeNerve = 'M 18.3 11.8 C 17.4 11 16.6 10.4 15.6 10';
      const armNerve = caught
        ? 'M 11 13 C 11 18 12 22 13 25 C 14 27 16 28.5 17.5 29.5 L 25 24 L 31 18.2'
        : 'M 11 13 C 11 18 12 22 13 25 C 14 27 16 28.5 17.5 29.5 L 22 37 L 28.5 34.2';
      const brain =
        'M 5 10 C 4.5 6 7.5 3.8 10.5 4 C 14 3.8 16.5 6 16 9.5 C 15.8 12.5 13 13.5 10.5 13 C 7.5 13.5 5.3 12.5 5 10 Z';
      art = (
        <>
          {lit('M 2 47 V 33 C 2 28 6 26 12 26 C 18 26 22 28 22 33 V 47 Z', c.blockGreen)}
          <Rect x={10} y={20} width={5} height={7} fill={skin} stroke={ink} strokeWidth={0.7} />
          {lit(ell(13, 12.5, 9.5, 9.5), skin)}
          <Path
            d="M 20 5.5 A 9.7 9.7 0 0 0 3.6 15.5 L 5.2 15.2 Q 7 7 20 5.5 Z"
            fill={c.rubber}
            {...o(0.7)}
          />
          {eye(19.3, 12.3, 1.1)}
          <Path d="M 22.4 12.6 L 23.6 15.4 L 22 15.8" fill="none" {...o(0.7)} />
          <Path d="M 19 18.3 Q 20.6 19 21.8 18" fill="none" {...o(0.7)} />
          {stage === 2 ? (
            <Ellipse cx={10.5} cy={8.6} rx={8} ry={6.6} fill={c.bulbGlow} fillOpacity={0.8} />
          ) : null}
          <Path
            d={brain}
            fill={stage === 2 ? c.bulbGlow : c.organ}
            stroke={stage === 2 ? c.orange : ink}
            strokeWidth={stage === 2 ? 1.3 : 0.7}
          />
          <Path
            d="M 7 7.5 Q 9 6 11 7.5 T 14.5 7.5 M 7 10.5 Q 9.5 9 12 10.5 T 15 10 M 10 4.5 Q 9 6 10 7"
            fill="none"
            stroke={c.organDeep}
            strokeWidth={0.5}
          />
          {/* The arm: down while the message travels, up to catch the ball. */}
          {caught ? (
            <>
              <Circle cx={36} cy={14} r={4.2} fill={url(ids.ball)} {...o(0.8)} />
              {limb('M 17 29.5 L 25 24', c.blockGreen, 3.4)}
              {limb('M 25 24 L 31 18.2', skin, 2.4)}
              {hand(31, 18.2, -45, skin, 0.95)}
              <Path
                d="M 22 36 Q 27 33.5 29 28 M 26 38 Q 32 34 33.5 27"
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={0.8}
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              {limb('M 17 29.5 L 22 37', c.blockGreen, 3.4)}
              {limb('M 22 37 L 28.5 34.2', skin, 2.4)}
              {hand(28.5, 34.2, -20, skin, 0.95)}
              <Circle cx={40} cy={9} r={4.2} fill={url(ids.ball)} {...o(0.8)} />
              <Path
                d="M 45.5 6.5 H 47.5 M 45.5 10.5 H 47.5"
                stroke={c.chartMuted}
                strokeWidth={0.9}
                strokeLinecap="round"
              />
              {stage === 0 ? (
                <>
                  <Path
                    d="M 35.8 9.6 L 21 12"
                    stroke={c.bulbGlow}
                    strokeWidth={3.4}
                    strokeOpacity={0.85}
                    strokeLinecap="round"
                  />
                  {arrow(35.8, 9.6, 21, 12, c.orange, 1.3)}
                </>
              ) : (
                <Path
                  d="M 35.8 9.6 L 21 12"
                  stroke={c.chartMuted}
                  strokeWidth={0.8}
                  strokeDasharray="1.2 1.4"
                />
              )}
            </>
          )}
          {stage === 1 ? glow(eyeNerve) : faint(eyeNerve)}
          {stage === 3 ? glow(armNerve) : faint(armNerve)}
        </>
      );
      break;
    }

    default:
      return null;
  }

  return (
    <G>
      <Defs>
        <RadialGradient id={ids.round} cx="0.35" cy="0.3" r="0.8" fx="0.3" fy="0.25">
          <Stop offset="0" stopColor={c.shine} stopOpacity={0.45 * c.sheen} />
          <Stop offset="0.5" stopColor={c.shine} stopOpacity={0} />
          <Stop offset="1" stopColor={c.shade} stopOpacity={0.22} />
        </RadialGradient>
        <TopLight id={ids.light} />
        <Sheen id={ids.sheen} />
        <Sheen id={ids.sheenV} vertical />
        <Metal id={ids.metal} light={c.metal} dark={c.metalDark} />
        <Ball id={ids.ball} color={c.blockRed} />
        <Ball id={ids.soccer} color={c.snow} />
      </Defs>
      {art}
    </G>
  );
}
