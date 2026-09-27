/**
 * Round-3 card icons (group D), 48 × 48 like every card icon, drawn in their materials with the
 * helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/r3d.ts.
 *
 * Life cycles are drawn as one scene changing, so the order reads at a glance: the butterfly's
 * stages on the same twig and milkweed leaf (egg, caterpillar, chrysalis, butterfly), the frog's
 * at the frog icon's scale and facing, and the bean plant's in the same cut-away soil. The bee's
 * pollen steps use one pink flower throughout.
 */
import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { usePalette } from '@/theme';

import { MaterialIcon } from '../cardIcons';
import { FloorShadow, Sheen, TopLight, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

type Pt = [number, number];

/** An ellipse as a path, so it can be filled and then lit with the same `d`. */
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

/** An oak leaf pointing up from its stalk at (0, 0), 20 long: three round lobes a side. */
const OAK_LEAF =
  'M 0 0 Q -3 -1 -3.5 -3.5 Q -5.5 -4 -5.5 -6.5 Q -5 -8.5 -3 -8.5 Q -6 -9.5 -6 -12 Q -5.5 -14.5 -3 -14 Q -5 -16 -3.5 -18.5 Q -2 -20.5 0 -20.5 Q 2 -20.5 3.5 -18.5 Q 5 -16 3 -14 Q 5.5 -14.5 6 -12 Q 6 -9.5 3 -8.5 Q 5 -8.5 5.5 -6.5 Q 5.5 -4 3.5 -3.5 Q 3 -1 0 0 Z';

/** A bean leaf pointing up from its stalk at (0, 0): broad, with a pointed tip. */
const BEAN_LEAF =
  'M 0 0 C -5 -1 -6.5 -7 -4.5 -10.5 C -3 -13 -1 -14 0 -16.5 C 1 -14 3 -13 4.5 -10.5 C 6.5 -7 5 -1 0 0 Z';

/** The frog icon's body (cardIcons.tsx), sitting and facing left, for the froglet. */
const FROG_BODY =
  'M 6 31 C 6 24 12 19 20 19 C 28 19 36 23 38 30 C 39 35 36 39 30 39 H 13 C 8 39 6 36 6 31 Z';

export function R3DIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('round', 'light', 'sheen');

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
  /** A lit ellipse, turned by `rot` degrees. */
  const blob = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, w = 0.9) => (
    <G transform={`rotate(${rot} ${cx} ${cy})`}>
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} {...o(w)} />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={url(ids.round)} />
    </G>
  );
  /** A stem, leg or root: a thick stroke in its color with an outline. */
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
  /** A leaf drawn from a path pointing up, placed at (x, y), turned and scaled. */
  const leaf = (d: string, x: number, y: number, rot: number, s: number, fill = c.life) => (
    <G key={`${x} ${y} ${rot}`} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Path d={d} fill={fill} {...o(0.9 / s)} />
      <Path d={d} fill={url(ids.round)} />
      <Path d="M 0 -0.5 L 0 -15" stroke={c.lifeDeep} strokeWidth={0.8 / s} />
    </G>
  );
  /** Cut-away soil from `top` to the bottom of the card. */
  const soil = (top: number) => (
    <>
      <Rect x={2} y={top} width={44} height={46 - top} rx={3} fill={c.soil} />
      <Rect x={2} y={top} width={44} height={46 - top} rx={3} fill={url(ids.light)} />
      {(
        [
          [8, top + 5],
          [39, top + 8],
          [14, 44],
          [33, 43.5],
        ] as Pt[]
      ).map(([x, y]) => (
        <Ellipse key={`${x}`} cx={x} cy={y} rx={1.4} ry={0.9} fill={c.soilDark} />
      ))}
      <Path d={`M 2 ${top} H 46`} stroke={c.lifeDeep} strokeWidth={1.6} strokeLinecap="round" />
    </>
  );
  /** A pond's water behind the whole card. */
  const pond = (strength = 0.25) => (
    <Rect x={2} y={2} width={44} height={44} rx={6} fill={c.water} fillOpacity={strength} />
  );
  /** Grass blades from a clump at (x, y), `h` tall. */
  const grass = (x: number, y: number, h: number, n = 9) =>
    Array.from({ length: n }, (_, j) => {
      // Outer blades first, so the middle ones stand in front.
      const i = j % 2 ? n - 1 - (j - 1) / 2 : j / 2;
      const t = i / (n - 1) - 0.5;
      const bx = x + t * h * 0.35;
      const tx = x + t * h * 1.25;
      const ty = y - h * (1 - Math.abs(t) * 0.8) + (i % 3) * 1.2;
      const cx = x + t * h * 0.45;
      const cy = y - h * 0.55;
      const w = Math.max(1.2, h * 0.07);
      const d = `M ${bx - w} ${y} Q ${cx - w} ${cy} ${tx} ${ty} Q ${cx + w} ${cy} ${bx + w} ${y} Z`;
      return (
        <G key={i}>
          <Path d={d} fill={i % 2 ? c.life : c.lifeDeep} {...o(0.6)} />
          <Path d={d} fill={url(ids.round)} />
        </G>
      );
    });

  /** An acorn at (x, y) (the join of cap and nut), turned by `rot`: cap, nut and stalk. */
  const acorn = (x: number, y: number, s: number, rot = 0) => (
    <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {limb('M 0 -9.5 L 1.2 -13.5', c.bark, 1.4 / s)}
      {lit('M -8 -1 C -8 7 -4 12 0 13.5 C 4 12 8 7 8 -1 Z', c.fur, 1 / s)}
      <Path
        d="M -4 1 C -4.5 5 -3 9 -1 11"
        fill="none"
        stroke={c.shine}
        strokeOpacity={0.5}
        strokeWidth={1.2 / s}
      />
      <Circle cx={0} cy={13.2} r={1} fill={c.furDark} />
      {lit('M -10 0 C -10 -7 -6 -10 0 -10 C 6 -10 10 -7 10 0 C 5 2 -5 2 -10 0 Z', c.bark, 1 / s)}
      <Path
        d="M -8 -5 Q -6.5 -3.5 -5 -5 Q -3.5 -3.5 -2 -5 Q -0.5 -3.5 1 -5 Q 2.5 -3.5 4 -5 Q 5.5 -3.5 7 -5 Q 8 -3.8 8.5 -4.5 M -9 -1.5 Q -7.5 0 -6 -1.5 Q -4.5 0 -3 -1.5 Q -1.5 0 0 -1.5 Q 1.5 0 3 -1.5 Q 4.5 0 6 -1.5 Q 7.5 0 9 -1.5 M -5 -8 Q -3.5 -6.5 -2 -8 Q -0.5 -6.5 1 -8 Q 2.5 -6.5 4 -8 Q 5 -7 5.5 -7.8"
        fill="none"
        stroke={c.furDark}
        strokeWidth={0.6 / s}
      />
    </G>
  );

  // ── The butterfly's twig and milkweed leaf, the same in every stage ────────────
  const twigAndLeaf = (
    <>
      {limb('M 2 8.5 C 12 6.5 28 9.5 46 6', c.bark, 2.4)}
      {limb('M 9 8 C 7 16 5 26 6.5 35', c.lifeDeep, 1)}
      {lit('M 6 36 C 13 26 32 24 45 32 C 33 43 14 45 6 36 Z', c.life)}
      <Path
        d="M 6.5 36 Q 25 33.5 44 32.3 M 15 35.3 L 19 29.5 M 15 35.3 L 19 41 M 25 34.3 L 29 28.3 M 25 34.3 L 29 40.5 M 34 33.3 L 37.5 29 M 34 33.3 L 37.5 38"
        fill="none"
        stroke={c.lifeDeep}
        strokeWidth={0.8}
      />
    </>
  );
  const caterpillar = (() => {
    const d = 'M 13.5 33 C 17 30 21 33.5 25 31.5 C 29 29.5 33 32 37 30.5';
    return (
      <>
        <Path d="M 36.5 29.5 Q 38 25.5 41 25" fill="none" stroke={c.rubber} strokeWidth={1} />
        <Path d={d} fill="none" {...o(7.2)} />
        <Path d={d} fill="none" stroke={c.snow} strokeWidth={5.6} strokeLinecap="round" />
        <Path d={d} fill="none" stroke={c.rubber} strokeWidth={5.6} strokeDasharray="1.2 1.2" />
        <Path
          d={d}
          fill="none"
          stroke={c.chartSecond}
          strokeWidth={5.6}
          strokeDasharray="1.2 3.6"
          strokeDashoffset={1.2}
        />
        <Path
          d="M 15 31 C 18 28.5 21 31.6 25 29.6 C 29 27.6 33 30 36 28.8"
          fill="none"
          stroke={c.shine}
          strokeOpacity={0.4}
          strokeWidth={1.1}
          strokeLinecap="round"
        />
        <Path d="M 12.5 31.5 Q 10.5 27.5 8 27" fill="none" stroke={c.rubber} strokeWidth={1} />
        <Circle cx={11.8} cy={33.6} r={2.9} fill={c.rubber} {...o(0.8)} />
        <Circle cx={11} cy={32.8} r={0.8} fill={c.shine} fillOpacity={0.6} />
      </>
    );
  })();
  const chrysalis = (
    <>
      <Line x1={33} y1={8} x2={33} y2={10.8} stroke={c.rubber} strokeWidth={1.3} />
      {lit(
        'M 33 10.5 C 38 11 39.2 18.5 37.6 22 C 36 25.2 30 25.2 28.4 22 C 26.8 18.5 28 11 33 10.5 Z',
        c.life,
        1,
      )}
      <Path d="M 28.4 14.8 Q 33 16.6 37.7 14.8" fill="none" stroke={c.rubber} strokeWidth={1.2} />
      {(
        [
          [29.6, 15.3],
          [31.8, 15.9],
          [34.2, 15.9],
          [36.4, 15.3],
          [30.6, 21.4],
          [35.4, 21.4],
          [33, 23.2],
        ] as Pt[]
      ).map(([x, y]) => (
        <Circle key={`${x}${y}`} cx={x} cy={y} r={0.65} fill={c.chartSecond} />
      ))}
    </>
  );
  const butterfly = (() => {
    const wings = (
      <>
        <Path
          d="M 25.5 19 C 28 12 37 7.5 44 9.5 C 45.5 14 41 21 26 23 Z"
          fill={c.orange}
          stroke={c.rubber}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path
          d="M 26 23 C 33 22 39 25.5 38 30.5 C 36.5 35 29.5 35 26 27 Z"
          fill={c.orange}
          stroke={c.rubber}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path
          d="M 26.5 21 L 40 11 M 27 22 L 42.5 15 M 27.5 22.6 L 36 21 M 27 24 L 36.5 27 M 27 25 L 33 32.5 M 26.5 26 L 29.5 32"
          stroke={c.rubber}
          strokeWidth={0.7}
        />
        {(
          [
            [43, 10.8],
            [44, 13.2],
            [41, 9.6],
            [37.3, 31.2],
            [34.5, 33],
          ] as Pt[]
        ).map(([x, y]) => (
          <Circle key={`${x}`} cx={x} cy={y} r={0.55} fill={c.snow} />
        ))}
        <Path d="M 25.5 19 C 28 12 37 7.5 44 9.5 C 45.5 14 41 21 26 23 Z" fill={url(ids.round)} />
      </>
    );
    return (
      <>
        {wings}
        <G transform="translate(50 0) scale(-1 1)">{wings}</G>
        <Path
          d="M 24.5 14 Q 22.5 11 21 10 M 25.5 14 Q 27.5 11 29 10"
          fill="none"
          stroke={c.rubber}
          strokeWidth={0.8}
        />
        <Circle cx={21} cy={10} r={0.8} fill={c.rubber} />
        <Circle cx={29} cy={10} r={0.8} fill={c.rubber} />
        <Ellipse cx={25} cy={23.5} rx={1.6} ry={7.5} fill={c.rubber} />
        <Circle cx={25} cy={15.3} r={1.9} fill={c.rubber} />
        <Ellipse cx={24.5} cy={20} rx={0.5} ry={2.5} fill={c.snow} fillOpacity={0.35} />
      </>
    );
  })();

  // ── Frogs ────────────────────────────────────────────────────────────────────
  const frogEggs = (
    <>
      {pond()}
      {(
        [
          [19, 16.5],
          [26, 16.5],
          [15.5, 22.5],
          [22.5, 22.5],
          [29.5, 22.5],
          [12, 28.5],
          [19, 28.5],
          [26, 28.5],
          [33, 28.5],
          [15.5, 34.5],
          [22.5, 34.5],
          [29.5, 34.5],
          [36, 34.5],
          [20, 40],
          [27, 40],
        ] as Pt[]
      ).map(([x, y]) => (
        <G key={`${x}${y}`}>
          <Circle
            cx={x}
            cy={y}
            r={3.7}
            fill={c.glass}
            fillOpacity={0.8}
            stroke={c.glassEdge}
            strokeWidth={0.8}
          />
          <Circle cx={x + 0.3} cy={y + 0.3} r={1.5} fill={c.rubber} />
          <Circle cx={x - 1.4} cy={y - 1.5} r={0.7} fill={c.shine} />
        </G>
      ))}
    </>
  );
  const tadpole = (
    <>
      {pond()}
      <Path
        d="M 21 22.5 C 29 19 36 25 45 21.5 C 41 27.5 33 31.5 21 29.5 Z"
        fill={c.soilDark}
        fillOpacity={0.45}
        {...o(0.8)}
      />
      <Path
        d="M 22 26 C 30 25 37 26.5 44 23"
        fill="none"
        stroke={c.soilDark}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      {lit(ell(15.5, 26, 8.5, 6.8), c.soilDark)}
      {(
        [
          [17, 22.5],
          [20, 25],
          [14, 29.5],
          [18.5, 29],
        ] as Pt[]
      ).map(([x, y]) => (
        <Circle key={`${x}`} cx={x} cy={y} r={0.55} fill={c.chartSecond} fillOpacity={0.8} />
      ))}
      <Circle cx={11} cy={23.8} r={1.9} fill={c.chartSecond} fillOpacity={0.7} />
      {eye(11, 23.8, 1.2)}
      <Path d="M 7.5 28 Q 8.5 29 10 28.6" fill="none" {...o(0.7)} />
    </>
  );
  const froglet = (
    <>
      <FloorShadow cx={24} cy={42} rx={14} ry={2.5} />
      {lit('M 32 31 C 37 30.5 41 32 45 36 C 40 36.5 36 36.5 32 36 Z', c.life, 1)}
      <G transform="translate(7 11.3) scale(0.72)">
        {lit(FROG_BODY, c.life, 1.4)}
        {limb('M 14 33 L 12 40 L 8 40.5', c.life, 2.4)}
        {lit(ell(31, 32, 8, 6), c.life, 1.4)}
        {limb('M 27 38 L 41 39.5 L 44 39', c.life, 2.4)}
        <Path d="M 6.5 30 Q 11 32.5 16.5 30" fill="none" {...o(1)} />
        {lit(ell(15, 19.5, 4.6, 4.4), c.life, 1.4)}
        <Circle cx={15} cy={19.5} r={2.7} fill={c.chartSecond} />
        <Ellipse cx={15} cy={19.5} rx={1.7} ry={1} fill={c.rubber} />
      </G>
    </>
  );

  // ── The bean plant, in the same soil at every stage ─────────────────────────
  const beanSeed = (
    <>
      {lit(
        'M 18 35 C 18 32 22 31.5 24 33 C 26 31.5 30 32 30 35 C 30 39 26 40.5 24 40.5 C 22 40.5 18 39 18 35 Z',
        c.fat,
      )}
      <Ellipse cx={24} cy={33.6} rx={1.4} ry={0.7} fill={c.furDark} />
    </>
  );
  const roots = (big: boolean) => (
    <>
      {limb(
        big ? 'M 24 31 C 24 36 23 40 24 45' : 'M 24 40 C 23.5 42 24.5 43.5 23.5 45.5',
        c.fat,
        big ? 1.4 : 1.2,
      )}
      {big ? (
        <>
          {limb('M 24 34 C 20 36 17 38 13 42', c.fat, 0.9)}
          {limb('M 24 35 C 28 37 31 39 35 43', c.fat, 0.9)}
          {limb('M 23.5 39 C 21 41 19 43 18 45', c.fat, 0.6)}
          {limb('M 24 40 C 26.5 42 28 43.5 29.5 45', c.fat, 0.6)}
        </>
      ) : (
        <Path
          d="M 23.8 42 L 21.4 42.6 M 24.1 43.4 L 26.5 44 M 23.8 44.6 L 21.8 45.4"
          stroke={c.fat}
          strokeWidth={0.7}
          strokeLinecap="round"
        />
      )}
    </>
  );
  /** The grown bean plant: stem to the top, two pairs of leaves (or pods at the upper node). */
  const beanPlant = (upper: boolean) => (
    <>
      {roots(true)}
      {limb('M 24 30 C 24.5 22 23 14 24 6', c.lifeDeep, 1.6)}
      {leaf(BEAN_LEAF, 24, 24, -65, 0.72)}
      {leaf(BEAN_LEAF, 24, 24, 65, 0.72)}
      {upper ? leaf(BEAN_LEAF, 23.8, 15, -55, 0.62) : null}
      {upper ? leaf(BEAN_LEAF, 23.8, 15, 55, 0.62) : null}
      {leaf(BEAN_LEAF, 24, 7, 0, 0.42)}
    </>
  );
  const beanFlower = (x: number, y: number, fx: number, fy: number) => (
    <G key={`${x}${y}`}>
      <Path
        d={`M ${x} ${y} Q ${(x + fx) / 2} ${y - 1} ${fx} ${fy}`}
        fill="none"
        stroke={c.lifeDeep}
        strokeWidth={0.9}
      />
      {blob(fx, fy, 2.6, 2.1, c.petalPink, 0, 0.7)}
      {blob(fx + (fx > x ? 1.6 : -1.6), fy + 1.2, 1.5, 1.1, c.petalPink, 0, 0.6)}
    </G>
  );
  /** An open pod, `len` long, lying from (x, y) at `rot` degrees, its seeds showing. */
  const openPod = (x: number, y: number, rot: number, s: number) => (
    <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Path
        d="M 0 0 C 5 -4.5 13 -4.5 18 2.5 C 12 -1 5 -1.2 0 0 Z"
        fill={c.lifeDeep}
        {...o(0.8 / s)}
      />
      {lit('M 0 0 C 4 7 13 8 18 2.5 C 12 4 5 3 0 0 Z', c.life, 0.8 / s)}
      <Path d="M 1.5 0.9 C 5 4.2 12 4.6 16.5 2.8 C 11 2.2 5 1.8 1.5 0.9 Z" fill={c.featherLight} />
      {[4.2, 7.6, 11, 14.2].map((sx) => (
        <G key={sx}>{blob(sx, 2.6, 1.7, 1.3, c.fat, 8, 0.6 / s)}</G>
      ))}
    </G>
  );

  // ── Bees and the pink flower ─────────────────────────────────────────────────
  /** A honeybee facing left (or right when `s` < 0), centered at (x, y). */
  const bee = (x: number, y: number, s: number, rot = 0, pollen = 0) => {
    const k = 1 / Math.abs(s);
    const band = (xc: number) => {
      const h = 3.9 * Math.sqrt(Math.max(0, 1 - ((xc - 4) / 5.8) ** 2));
      return <Rect key={xc} x={xc - 0.7} y={0.5 - h} width={1.4} height={2 * h} fill={c.furDark} />;
    };
    const dots: Pt[] = [
      [-3.5, -1.5],
      [-1.5, 1.2],
      [-3.2, 1.5],
      [-1, -2],
      [-2.4, 0],
      [-5, 2.6],
      [0.6, 2],
    ];
    return (
      <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s} ${Math.abs(s)})`}>
        <Path
          d="M -4 2.5 L -5.5 5.5 M -2.5 3 L -2.5 6.2 M -0.5 2.8 L 1.5 6"
          stroke={c.rubber}
          strokeWidth={0.9 * k}
          strokeLinecap="round"
        />
        <Ellipse cx={4} cy={0.5} rx={5.8} ry={3.9} fill={c.chartSecond} />
        {[2.4, 5.2, 8].map(band)}
        <Ellipse cx={4} cy={0.5} rx={5.8} ry={3.9} fill={url(ids.round)} {...o(0.8 * k)} />
        <Path d="M 9.6 0 L 11.2 0.6 L 9.6 1.2" fill={c.rubber} />
        <Circle cx={-2.4} cy={-0.2} r={3.3} fill={c.fur} {...o(0.8 * k)} />
        <Circle
          cx={-2.4}
          cy={-0.2}
          r={3.7}
          fill="none"
          stroke={c.fur}
          strokeWidth={1 * k}
          strokeDasharray={`${0.4 * k} ${0.6 * k}`}
        />
        <Circle cx={-2.4} cy={-0.2} r={3.3} fill={url(ids.round)} />
        <Circle cx={-6.4} cy={0.6} r={2.4} fill={c.rubber} {...o(0.6 * k)} />
        <Ellipse cx={-6.5} cy={0} rx={1} ry={1.3} fill={c.furDark} />
        <Circle cx={-6.9} cy={-0.4} r={0.4} fill={c.shine} />
        <Path
          d="M -7.2 -1.4 Q -8.5 -4.5 -10.5 -5"
          fill="none"
          stroke={c.rubber}
          strokeWidth={0.7 * k}
        />
        {pollen
          ? dots
              .slice(0, pollen)
              .map(([px, py]) => (
                <Circle
                  key={`${px}${py}`}
                  cx={px}
                  cy={py}
                  r={0.75}
                  fill={c.pollen}
                  {...o(0.3 * k)}
                />
              ))
          : null}
        {pollen >= 7 ? (
          <Ellipse cx={1} cy={4.6} rx={1.4} ry={1.1} fill={c.pollen} {...o(0.4 * k)} />
        ) : null}
        <G transform="rotate(-20 0.5 -4.8)">
          <Ellipse
            cx={0.5}
            cy={-4.8}
            rx={5}
            ry={2.2}
            fill={c.glass}
            fillOpacity={0.7}
            stroke={c.glassEdge}
            strokeWidth={0.6 * k}
          />
        </G>
        <G transform="rotate(-5 3 -3.8)">
          <Ellipse
            cx={3}
            cy={-3.8}
            rx={4}
            ry={1.8}
            fill={c.glass}
            fillOpacity={0.7}
            stroke={c.glassEdge}
            strokeWidth={0.6 * k}
          />
        </G>
      </G>
    );
  };
  /** A five-petaled flower head at (cx, cy). */
  const flowerHead = (cx: number, cy: number, s: number, petal: string, center = c.sunRay) => (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = -90 + i * 72;
        const r = (a * Math.PI) / 180;
        return (
          <G key={i}>
            {blob(
              cx + 6 * s * Math.cos(r),
              cy + 6 * s * Math.sin(r),
              3.9 * s,
              5.8 * s,
              petal,
              a + 90,
              0.8,
            )}
          </G>
        );
      })}
      {blob(cx, cy, 3.6 * s, 3.6 * s, center, 0, 0.8)}
    </>
  );
  /** The pink flower on its stem, its head at (24, 17). */
  const stemAndLeaves = (
    <>
      <FloorShadow cx={24} cy={44} rx={10} ry={2} />
      {limb('M 24 24 C 24 32 23 38 24 44', c.lifeDeep, 1.6)}
      {blob(18, 36, 5.5, 2.2, c.life, -30)}
      {blob(30, 32.5, 5.5, 2.2, c.life, 30)}
    </>
  );
  const flower = (
    <>
      {stemAndLeaves}
      {flowerHead(24, 17, 1.15, c.petalPink)}
    </>
  );
  const pollenOn = (cx: number, cy: number, r: number) =>
    (
      [
        [-1.6, -1.2],
        [1.2, -1.8],
        [2, 0.8],
        [-0.4, 1.8],
        [-2, 1],
        [0.3, -0.1],
      ] as Pt[]
    ).map(([dx, dy]) => (
      <Circle
        key={`${dx}${dy}`}
        cx={cx + dx * r}
        cy={cy + dy * r}
        r={0.85 * r}
        fill={c.pollen}
        {...o(0.35)}
      />
    ));

  let art: ReactNode;
  switch (icon) {
    // ── Butterfly life cycle (one twig and leaf) ──────────────────────────────
    case 'butterfly egg on leaf':
      art = (
        <>
          {twigAndLeaf}
          {blob(25, 30.5, 3, 4, c.fat, 0, 0.8)}
          <Path
            d="M 23.6 27.6 V 33.4 M 25 26.8 V 34.2 M 26.4 27.6 V 33.4"
            stroke={c.rock5}
            strokeWidth={0.35}
          />
        </>
      );
      break;
    case 'caterpillar':
      art = (
        <>
          {twigAndLeaf}
          {caterpillar}
        </>
      );
      break;
    case 'chrysalis':
      art = (
        <>
          {twigAndLeaf}
          {chrysalis}
        </>
      );
      break;
    case 'butterfly':
      art = (
        <>
          {twigAndLeaf}
          {butterfly}
        </>
      );
      break;

    // ── Frog life cycle ──────────────────────────────────────────────────────
    case 'frog eggs':
      art = frogEggs;
      break;
    case 'tadpole':
      art = tadpole;
      break;
    case 'froglet':
      art = froglet;
      break;

    // ── Oak ──────────────────────────────────────────────────────────────────
    case 'acorn':
      art = (
        <>
          <FloorShadow cx={24} cy={43} rx={11} ry={2.2} />
          {acorn(24, 22, 1.4, 12)}
        </>
      );
      break;
    case 'oak seedling':
      art = (
        <>
          {soil(36)}
          {limb(
            'M 22.5 36 C 22 40 23 42 22 45 M 22.5 39 L 18.5 42 M 22.5 40 L 26.5 43',
            c.fat,
            0.8,
          )}
          {limb('M 22.5 36 C 23 29 22 20 24 14', c.bark, 1.1)}
          {leaf(OAK_LEAF, 22.8, 29, -62, 0.78)}
          {leaf(OAK_LEAF, 23, 21, 58, 0.74)}
          {leaf(OAK_LEAF, 24, 14.5, 3, 0.52)}
          {acorn(16.5, 36.5, 0.5, -70)}
        </>
      );
      break;
    case 'oak tree': {
      const crown: [number, number, number, number][] = [
        [24, 16, 17, 9],
        [10, 21, 8, 6],
        [38, 21, 8, 6],
        [16, 9.5, 9, 6.5],
        [32, 9.5, 9, 6.5],
        [24, 6.5, 8, 4.5],
      ];
      art = (
        <>
          <FloorShadow cx={24} cy={44} rx={16} ry={2.5} />
          {lit(
            'M 19 44 C 21 38 21 33 19 29 L 14 25 L 16 23.5 L 21 27 L 21.5 22 L 26.5 22 L 27 27 L 32 23.5 L 34 25 L 29 29 C 27 33 27 38 29 44 Z',
            c.bark,
          )}
          <Path d="M 23 42 C 24 37 23 32 24 28" fill="none" stroke={c.furDark} strokeWidth={0.7} />
          {crown.map(([x, y, rx, ry]) => (
            <Ellipse
              key={`o${x}${y}`}
              cx={x}
              cy={y}
              rx={rx}
              ry={ry}
              fill={c.lifeDeep}
              {...o(2.2)}
            />
          ))}
          {crown.map(([x, y, rx, ry]) => (
            <G key={`f${x}${y}`}>
              <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill={c.lifeDeep} />
              <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill={url(ids.round)} />
            </G>
          ))}
          {leaf(OAK_LEAF, 14, 24, -35, 0.55)}
          {leaf(OAK_LEAF, 33, 22, 35, 0.55)}
          {leaf(OAK_LEAF, 24, 18, 0, 0.55)}
        </>
      );
      break;
    }

    // ── Bean plant life cycle ─────────────────────────────────────────────────
    case 'bean seed':
      art = (
        <>
          {soil(28)}
          {beanSeed}
        </>
      );
      break;
    case 'bean sprout':
      art = (
        <>
          {soil(28)}
          {roots(false)}
          {limb('M 25 33 C 25.5 28 24.5 24 24.5 19', c.lifeDeep, 1.4)}
          {beanSeed}
          {leaf(BEAN_LEAF, 24.5, 19.5, -40, 0.4)}
          {leaf(BEAN_LEAF, 24.5, 19.5, 40, 0.4)}
        </>
      );
      break;
    case 'young bean plant':
      art = (
        <>
          {soil(28)}
          {roots(true)}
          {limb('M 24 30 C 24.5 25 23.5 19 24 13', c.lifeDeep, 1.5)}
          {leaf(BEAN_LEAF, 24, 22, -65, 0.66)}
          {leaf(BEAN_LEAF, 24, 22, 65, 0.66)}
          {leaf(BEAN_LEAF, 24, 13.5, -30, 0.42)}
          {leaf(BEAN_LEAF, 24, 13.5, 30, 0.42)}
        </>
      );
      break;
    case 'bean plant with flowers':
      art = (
        <>
          {soil(28)}
          {beanPlant(true)}
          {beanFlower(24, 18, 32, 20)}
          {beanFlower(24, 11, 16.5, 11.5)}
          {beanFlower(24.2, 9, 31, 7.5)}
        </>
      );
      break;
    case 'bean plant with pods':
      art = (
        <>
          {soil(28)}
          {beanPlant(false)}
          <G transform="translate(23.5 14.5) rotate(160) scale(0.95)">
            {lit('M 0 0 C 5 -2.6 12 -1.6 16.5 3 C 11 1.6 5 2.4 0 1.8 Z', c.life, 0.9)}
            <Path
              d="M 4 0.2 Q 5.5 -1 7 0 M 8.5 -0.1 Q 10 -1.1 11.5 0.4"
              fill="none"
              stroke={c.lifeDeep}
              strokeWidth={0.6}
            />
          </G>
          {openPod(24.5, 14.5, 12, 1.05)}
        </>
      );
      break;

    // ── Pollination: the bee and the pink flower ──────────────────────────────
    case 'flower':
      art = flower;
      break;
    case 'bee on flower':
      art = (
        <>
          {flower}
          {bee(25, 14.5, 1.05, -12)}
        </>
      );
      break;
    case 'bee with pollen':
      art = (
        <>
          {bee(24, 26, 1.95, 0, 7)}
          {(
            [
              [-3.2, -3.4],
              [-0.8, -3.2],
              [-4.4, 1],
            ] as Pt[]
          ).map(([px, py]) => (
            <Circle
              key={`${px}`}
              cx={24 + px * 1.95}
              cy={26 + py * 1.95}
              r={1.3}
              fill={c.pollen}
              {...o(0.4)}
            />
          ))}
        </>
      );
      break;
    case 'bee between flowers':
      art = (
        <>
          {[11, 37].map((x) => (
            <G key={x}>
              <FloorShadow cx={x} cy={44} rx={7} ry={1.6} />
              {limb(`M ${x} 30 C ${x} 36 ${x - 0.5} 40 ${x} 44`, c.lifeDeep, 1.3)}
              {blob(x - 3.5, 39, 3.6, 1.5, c.life, -30)}
              {flowerHead(x, 25, 0.72, c.petalPink)}
            </G>
          ))}
          <Path
            d="M 12 16 Q 22 3 33 14"
            fill="none"
            stroke={ink}
            strokeWidth={0.9}
            strokeDasharray="1.6 1.6"
          />
          <Path d="M 30.5 14.6 L 33.6 15 L 33.3 11.8" fill="none" {...o(0.9)} />
          {bee(24, 12, -0.85, 12, 5)}
        </>
      );
      break;
    case 'pollen on flower':
      art = (
        <>
          {flower}
          {pollenOn(24, 17, 1.25)}
          <Path
            d="M 29 13 Q 33 8 37.5 8"
            fill="none"
            stroke={ink}
            strokeWidth={0.9}
            strokeDasharray="1.6 1.6"
          />
          {bee(40, 7, -0.72, -15, 3)}
        </>
      );
      break;
    case 'flower making seeds':
      art = (
        <>
          {stemAndLeaves}
          <G opacity={0.75}>
            {blob(15.5, 22, 3.2, 5.2, c.petalPink, 40, 0.7)}
            {blob(32.5, 22, 3.2, 5.2, c.petalPink, -40, 0.7)}
            {blob(24, 25, 2.8, 4.4, c.petalPink, 0, 0.7)}
          </G>
          {blob(10, 43, 3, 1.4, c.petalPink, -15, 0.6)}
          {blob(37, 43.5, 3, 1.4, c.petalPink, 20, 0.6)}
          {blob(24, 17, 7, 7, c.life, 0, 1)}
          {(
            [
              [24, 12.6],
              [28.2, 15.4],
              [26.8, 20.6],
              [21.2, 20.6],
              [19.8, 15.4],
              [24, 17],
            ] as Pt[]
          ).map(([x, y]) => (
            <G key={`${x}${y}`}>
              {blob(
                x,
                y,
                1.5,
                2,
                c.furDark,
                (Math.atan2(y - 17, x - 24) * 180) / Math.PI + 90,
                0.5,
              )}
            </G>
          ))}
        </>
      );
      break;

    // ── Seeds that travel ────────────────────────────────────────────────────
    case 'dandelion seed head': {
      const rays = Array.from({ length: 28 }, (_, i) => (i * 2 * Math.PI) / 28);
      const floater = (x: number, y: number, rot: number) => (
        <G transform={`translate(${x} ${y}) rotate(${rot})`}>
          <Path d="M 0 0 V 5" stroke={c.glassEdge} strokeWidth={0.5} />
          <Ellipse cx={0} cy={6} rx={0.6} ry={1.3} fill={c.rock4} />
          <Path
            d="M -3.4 -1.2 L 0 0 L 3.4 -1.2 M -2 -2.8 L 0 0 L 2 -2.8 M 0 -3.4 V 0"
            stroke={c.glassEdge}
            strokeWidth={0.5}
          />
        </G>
      );
      art = (
        <>
          {limb('M 20 46 C 20 38 18.5 30 19.5 22', c.lifeDeep, 1.4)}
          <Circle cx={19.5} cy={15.5} r={13} fill={c.snow} fillOpacity={0.5} />
          {rays.map((a, i) => (
            <G key={i}>
              <Line
                x1={19.5 + 2.2 * Math.cos(a)}
                y1={15.5 + 2.2 * Math.sin(a)}
                x2={19.5 + 11.5 * Math.cos(a)}
                y2={15.5 + 11.5 * Math.sin(a)}
                stroke={c.glassEdge}
                strokeWidth={0.5}
              />
              <Circle
                cx={19.5 + 12 * Math.cos(a)}
                cy={15.5 + 12 * Math.sin(a)}
                r={1.3}
                fill={c.snow}
                stroke={c.glassEdge}
                strokeWidth={0.4}
              />
            </G>
          ))}
          {blob(19.5, 15.5, 2.4, 2.4, c.rock4, 0, 0.7)}
          {floater(38, 12, 30)}
          {floater(42, 26, 50)}
        </>
      );
      break;
    }
    case 'winged maple seed': {
      const samara = (
        <>
          {lit(
            'M -3 -2 C -6.5 -10 -8.5 -19 -6.5 -25 C -4.5 -29.5 1.5 -29 3 -23.5 C 4 -16 3.5 -7 2.5 -2.5 Z',
            c.rock4,
            1,
          )}
          <Path
            d="M 2 -3 C 3 -12 3 -20 1.5 -26 M 0 -3 C -1.5 -10 -3.5 -17 -4.5 -23 M -1 -3 C -3.5 -9 -5.5 -14 -6.5 -19"
            fill="none"
            stroke={c.woodDark}
            strokeWidth={0.6}
          />
          {lit(ell(0, 0, 3.4, 4.2), c.woodDark, 1)}
        </>
      );
      art = (
        <>
          <G transform="translate(21.5 35) rotate(-26)">{samara}</G>
          <G transform="translate(26.5 35) rotate(26) scale(-1 1)">{samara}</G>
          <Path
            d="M 12 43 Q 24 47 36 43"
            fill="none"
            stroke={ink}
            strokeOpacity={0.5}
            strokeWidth={0.9}
            strokeDasharray="1.6 1.6"
          />
          <Path
            d="M 34 41.2 L 36.4 42.9 L 34 44.8"
            fill="none"
            stroke={ink}
            strokeOpacity={0.5}
            strokeWidth={0.9}
          />
        </>
      );
      break;
    }
    case 'milkweed pod': {
      const rad = (-50 * Math.PI) / 180;
      const at = (lx: number, ly: number): Pt => [
        19 + lx * Math.cos(rad) - ly * Math.sin(rad),
        29 + lx * Math.sin(rad) + ly * Math.cos(rad),
      ];
      const silk = (x: number, y: number, rot: number) => (
        <G transform={`translate(${x} ${y}) rotate(${rot})`}>
          {[-50, -30, -10, 10, 30, 50].map((a) => (
            <Path
              key={a}
              d={`M 0 0 Q ${a / 12} -5 ${(a / 50) * 6} -9`}
              fill="none"
              stroke={c.glassEdge}
              strokeWidth={0.5}
            />
          ))}
          {blob(0, 1, 1.8, 1.3, c.fur, 0, 0.6)}
        </G>
      );
      art = (
        <>
          {[-9, -5, -1, 3, 7].map((lx, i) => {
            const [sx, sy] = at(lx, -1.5);
            const ex = sx - 7 - (i % 2) * 3;
            const ey = sy - 9 + (i % 3) * 2;
            const d = `M ${sx} ${sy} Q ${sx - 1} ${ey + 3} ${ex} ${ey}`;
            return (
              <G key={lx}>
                <Path
                  d={d}
                  fill="none"
                  stroke={c.glassEdge}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <Path d={d} fill="none" stroke={c.snow} strokeWidth={2.2} strokeLinecap="round" />
              </G>
            );
          })}
          <G transform="translate(19 29) rotate(-50)">
            {lit('M -16 1 C -9 -5 7 -6.5 17 -2 C 9 7 -8 8 -16 1 Z', c.scales)}
            <Path
              d="M -12.5 0 C -6 -3.8 7 -4.8 14 -1.8 C 7 2 -6 3 -12.5 0 Z"
              fill={c.fat}
              {...o(0.6)}
            />
            {[-8, -4.2, -0.4, 3.4, 7.2].map((lx) => (
              <G key={lx}>{blob(lx, -0.8, 2.2, 1.5, c.fur, 0, 0.5)}</G>
            ))}
            <Path d="M -12 3.5 C -4 6 6 5 13 1" fill="none" stroke={c.lifeDeep} strokeWidth={0.6} />
          </G>
          {silk(38, 14, 20)}
          {silk(41, 30, 35)}
        </>
      );
      break;
    }
    case 'burr in dog fur': {
      const spikes = Array.from({ length: 16 }, (_, i) => (i * 2 * Math.PI) / 16);
      art = (
        <G>
          <MaterialIcon icon="dog" ink={ink} />
          {spikes.map((a, i) => (
            <Path
              key={i}
              d={`M ${26 + 3 * Math.cos(a)} ${17.5 + 3 * Math.sin(a)} L ${26 + 6.2 * Math.cos(a)} ${17.5 + 6.2 * Math.sin(a)} l ${-1.2 * Math.sin(a)} ${1.2 * Math.cos(a)}`}
              fill="none"
              stroke={c.furDark}
              strokeWidth={0.7}
              strokeLinecap="round"
            />
          ))}
          {blob(26, 17.5, 3.8, 3.6, c.furDark, 0, 0.8)}
        </G>
      );
      break;
    }
    case 'bird eating berry':
      art = (
        <G>
          <MaterialIcon icon="bird" ink={ink} />
          <Path d="M 8 40.5 Q 6 36 6.5 31" fill="none" stroke={c.woodDark} strokeWidth={0.9} />
          {blob(6.5, 30.5, 2.1, 2.1, c.blockRed, 0, 0.7)}
          {blob(9.2, 33.6, 1.9, 1.9, c.blockRed, 0, 0.7)}
          {blob(4.4, 34.4, 1.9, 1.9, c.blockRed, 0, 0.7)}
          {blob(4.4, 19.8, 2.3, 2.3, c.blockRed, 0, 0.7)}
        </G>
      );
      break;
    case 'squirrel burying acorn':
      art = (
        <>
          {soil(39)}
          <Path d="M 3.5 39 Q 9 46 14.5 39 Z" fill={c.soilDark} {...o(0.6)} />
          {acorn(9, 39.5, 0.42, 10)}
          <Path d="M 15 39.2 Q 18 36 21 39.2 Z" fill={c.soil} {...o(0.6)} />
          {lit(
            'M 32 36 C 43 36 46 26 42 18 C 39 11 43 6 38 4 C 33 3 30 9 33 14 C 36 20 36.5 27 30 31 Z',
            c.furGrey,
          )}
          {lit(
            'M 16 29 C 18 21 30 19 35 27 C 38 33 35 38.5 29 38.5 H 21 C 17 38.5 15 33 16 29 Z',
            c.furGrey,
          )}
          {lit(ell(30, 34.5, 6, 4.3), c.furGrey)}
          <Path
            d="M 18 34 C 21 37 25 37.5 27 37"
            fill="none"
            stroke={c.snow}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          {limb('M 18 33 L 13.5 37.5', c.furGrey, 1.6)}
          {lit('M 16 22.5 L 15.5 18 L 19.5 21.5 Z', c.furGrey, 0.9)}
          {lit(ell(14, 28, 5.8, 4.8), c.furGrey)}
          {eye(12.5, 26.2, 1.1)}
          <Circle cx={8.6} cy={29.6} r={0.9} fill={c.rubber} />
        </>
      );
      break;
    case 'floating coconut':
      art = (
        <>
          {lit(
            'M 10 27 C 10 16 18 11 25 11 C 33 11 38 17 38 26 C 38 34 31 40 24 40 C 16 40 10 35 10 27 Z',
            c.fur,
          )}
          <Path
            d="M 25 11 C 21.5 20 21.5 31 24 40 M 15 16 L 17 19 M 30 14 L 31.5 17.5 M 33 21 L 35.5 23 M 13.5 23 L 16 24.5"
            fill="none"
            stroke={c.furDark}
            strokeWidth={0.8}
          />
          <Path
            d="M 2 30 Q 7 28 12 30 T 22 30 T 32 30 T 42 30 T 46 30 V 44 Q 46 46 44 46 H 4 Q 2 46 2 44 Z"
            fill={c.water}
            fillOpacity={0.6}
          />
          <Path
            d="M 2 30 Q 7 28 12 30 T 22 30 T 32 30 T 42 30 T 46 30"
            fill="none"
            stroke={c.waterDeep}
            strokeWidth={1.1}
          />
          <Path
            d="M 6 36 Q 9 35 12 36 M 36 38 Q 39 37 42 38"
            fill="none"
            stroke={c.waterTop}
            strokeWidth={0.9}
          />
        </>
      );
      break;
    case 'water lily seed pod': {
      const pad = (cx: number, cy: number, r: number, a: number) => {
        const a1 = ((a - 12) * Math.PI) / 180;
        const a2 = ((a + 12) * Math.PI) / 180;
        const d = `M ${cx} ${cy} L ${cx + r * Math.cos(a2)} ${cy + r * 0.55 * Math.sin(a2)} A ${r} ${r * 0.55} 0 1 1 ${cx + r * Math.cos(a1)} ${cy + r * 0.55 * Math.sin(a1)} Z`;
        return lit(d, c.lifeDeep, 0.9);
      };
      art = (
        <>
          {pond(0.3)}
          {pad(15, 34, 12, -60)}
          {pad(38, 40, 7, -120)}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = -90 + (i - 2.5) * 30;
            return (
              <G key={i}>
                {blob(
                  15 + 5 * Math.cos((a * Math.PI) / 180),
                  29 + 4 * Math.sin((a * Math.PI) / 180),
                  1.8,
                  4.6,
                  c.petalPink,
                  a + 90,
                  0.7,
                )}
              </G>
            );
          })}
          {blob(15, 29.5, 2.4, 1.6, c.sunDisk, 0, 0.6)}
          {limb('M 33 38 C 33 33 34 28 34 23', c.lifeDeep, 1.2)}
          {blob(34, 19, 5.2, 5, c.life, 0, 1)}
          <Path
            d="M 30.5 15.5 L 34 16.8 L 37.5 15.5 M 34 14 V 16.8 M 31.5 14.5 L 34 16.8 L 36.5 14.5"
            fill="none"
            stroke={c.lifeDeep}
            strokeWidth={0.8}
          />
          {(
            [
              [26, 42],
              [29.5, 44],
              [22.5, 44.5],
            ] as Pt[]
          ).map(([x, y]) => (
            <G key={`${x}`}>
              <Circle
                cx={x}
                cy={y}
                r={1.5}
                fill={c.snow}
                fillOpacity={0.8}
                stroke={c.glassEdge}
                strokeWidth={0.4}
              />
              <Circle cx={x} cy={y} r={0.7} fill={c.furDark} />
            </G>
          ))}
        </>
      );
      break;
    }

    // ── How animals grow up ──────────────────────────────────────────────────
    case 'ladybug': {
      const spots: [number, number, number][] = [
        [24, 15.5, 2.6],
        [17.5, 21.5, 2.8],
        [30.5, 21.5, 2.8],
        [15.5, 30, 2.4],
        [32.5, 30, 2.4],
        [19.5, 36.5, 2],
        [28.5, 36.5, 2],
      ];
      art = (
        <>
          <Path
            d="M 14 22 L 8 18 M 13 28 L 6 28.5 M 14.5 34 L 8.5 39 M 34 22 L 40 18 M 35 28 L 42 28.5 M 33.5 34 L 39.5 39 M 20.5 9 Q 18 5 15 5 M 27.5 9 Q 30 5 33 5"
            fill="none"
            stroke={c.rubber}
            strokeWidth={1.3}
            strokeLinecap="round"
          />
          {lit('M 15 14 C 15 6 33 6 33 14 Z', c.rubber, 1)}
          <Ellipse cx={19.5} cy={11.5} rx={2} ry={1.3} fill={c.snow} />
          <Ellipse cx={28.5} cy={11.5} rx={2} ry={1.3} fill={c.snow} />
          <Circle cx={24} cy={27.5} r={14} fill={c.blockRed} {...o(1.1)} />
          {spots.map(([x, y, r]) => (
            <Circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={c.rubber} />
          ))}
          <Circle cx={24} cy={27.5} r={14} fill={url(ids.round)} />
          <Path d="M 24 13.5 V 41.5" stroke={ink} strokeWidth={1} />
          <Ellipse
            cx={18}
            cy={19}
            rx={3.5}
            ry={1.6}
            fill={c.shine}
            fillOpacity={0.45}
            transform="rotate(-35 18 19)"
          />
        </>
      );
      break;
    }
    case 'mosquito':
      art = (
        <>
          <FloorShadow cx={22} cy={44} rx={16} ry={1.6} />
          <Path
            d="M 17 23 C 12 27 9 33 5 43.5 M 19 23.5 C 17 30 16.5 36 15 44 M 21 23.5 C 25 30 28 36 30 44 M 21.5 22.5 C 28 21 36 22 44 14"
            fill="none"
            stroke={c.rubber}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          <G transform="rotate(26 31 27)">
            <Ellipse cx={31} cy={27} rx={9.5} ry={2.6} fill={c.furGrey} {...o(0.9)} />
            <Path
              d="M 23.5 27 H 40"
              stroke={c.rubber}
              strokeWidth={4.6}
              strokeDasharray="1.2 1.6"
            />
            <Ellipse cx={31} cy={27} rx={9.5} ry={2.6} fill={url(ids.round)} {...o(0.9)} />
          </G>
          {blob(19, 20, 4.5, 3.6, c.furGrey, -10, 0.9)}
          {blob(13.3, 20.6, 2.3, 2.3, c.rubber, 0, 0.7)}
          <Path
            d="M 11.5 21.8 L 3 28.5"
            stroke={c.rubber}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          <Path
            d="M 12.5 18.8 L 8 13.5 M 11 17 L 9.5 17.8 M 10 15.6 L 8.6 16.2 M 11.3 17 L 11.8 15.4 M 10 15.5 L 10.4 14"
            stroke={c.rubber}
            strokeWidth={0.6}
          />
          <G transform="rotate(10 29 14.5)">
            <Ellipse
              cx={29}
              cy={14.5}
              rx={10}
              ry={2.4}
              fill={c.glass}
              fillOpacity={0.65}
              stroke={c.glassEdge}
              strokeWidth={0.7}
            />
          </G>
          <G transform="rotate(-4 28 17)">
            <Ellipse
              cx={28}
              cy={17}
              rx={9}
              ry={2}
              fill={c.glass}
              fillOpacity={0.6}
              stroke={c.glassEdge}
              strokeWidth={0.7}
            />
          </G>
        </>
      );
      break;
    case 'chicken':
      art = (
        <>
          <FloorShadow cx={25} cy={44} rx={15} ry={2.3} />
          <Path
            d="M 21 37 V 43 L 18 44 M 21 43 L 23.5 44 M 28 37 V 43 L 25 44 M 28 43 L 30.5 44"
            fill="none"
            stroke={c.chartSecond}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {lit('M 35 25 C 38 16 40 10 44 8 C 46 14 46 24 42 30 Z', c.furDark)}
          {lit(
            'M 13 20 C 11 30 18 38 28 38 C 36 38 43 32 42 23 C 40 18 34 20 30 22 C 24 24 20 21 19 17 Z',
            c.fur,
          )}
          <Path
            d="M 22 26 C 26 32 34 33 38 28 C 33 27 28 26 22 26 Z"
            fill={c.furDark}
            fillOpacity={0.6}
            {...o(0.8)}
          />
          {lit(ell(14.5, 15, 5.5, 5.5), c.fur)}
          <Path
            d="M 10 11 C 9.5 7 12 6.5 13 9 C 13.5 6 16 6 16.5 9 C 17.5 7 20 8 18.5 12 Z"
            fill={c.blockRed}
            {...o(0.8)}
          />
          <Path d="M 9.3 14 L 5 15.8 L 9.4 17.3 Z" fill={c.chartSecond} {...o(0.8)} />
          {blob(10.5, 20, 1.5, 2.4, c.blockRed, 0, 0.7)}
          {eye(12.6, 13.8, 1)}
        </>
      );
      break;

    // ── Traits ───────────────────────────────────────────────────────────────
    case 'eye': {
      const iris = Array.from({ length: 16 }, (_, i) => (i * 2 * Math.PI) / 16);
      art = (
        <>
          <Path
            d="M 8 11 Q 24 3 41 10"
            fill="none"
            stroke={c.furDark}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {lit('M 3 25 C 12 11 36 11 45 25 C 36 39 12 39 3 25 Z', c.skin)}
          <Path d="M 6 25 C 14 15 34 15 42 25 C 34 35 14 35 6 25 Z" fill={c.snow} {...o(0.9)} />
          <Circle cx={24} cy={25} r={8.4} fill={c.blockBlue} {...o(0.9)} />
          {iris.map((a, i) => (
            <Line
              key={i}
              x1={24 + 4.2 * Math.cos(a)}
              y1={25 + 4.2 * Math.sin(a)}
              x2={24 + 7.8 * Math.cos(a)}
              y2={25 + 7.8 * Math.sin(a)}
              stroke={c.waterDeep}
              strokeWidth={0.6}
            />
          ))}
          <Circle cx={24} cy={25} r={3.8} fill={c.rubber} />
          <Circle cx={21.5} cy={22.3} r={1.6} fill={c.shine} />
          <Path d="M 6 25 C 14 15 34 15 42 25" fill="none" {...o(1.4)} />
          <Path
            d="M 11 19.5 L 9.5 16.5 M 16 16.8 L 15 13.6 M 21 15.6 L 20.6 12.4 M 27 15.6 L 27.4 12.4 M 32 16.8 L 33 13.6 M 37 19.5 L 38.5 16.5"
            stroke={c.rubber}
            strokeWidth={1}
            strokeLinecap="round"
          />
        </>
      );
      break;
    }
    case 'two flower colors':
      art = (
        <>
          {[
            [13, c.purple],
            [35, c.snow],
          ].map(([x, color]) => {
            const cx = x as number;
            return (
              <G key={cx}>
                <FloorShadow cx={cx} cy={44} rx={8} ry={1.8} />
                {limb(`M ${cx} 24 C ${cx} 32 ${cx - 0.5} 38 ${cx} 44`, c.lifeDeep, 1.4)}
                {blob(cx - 4.5, 36, 4.2, 1.8, c.life, -30)}
                {blob(cx + 4.5, 33, 4.2, 1.8, c.life, 30)}
                {flowerHead(cx, 18, 0.88, color as string, c.chartSecond)}
              </G>
            );
          })}
        </>
      );
      break;
    case 'knee with scar':
      art = (
        <>
          {lit(
            'M 2 12 C 12 10 22 10 29 13 C 35 16 37 22 35 28 L 31.5 46 H 21 L 23.5 31 C 18 27.5 10 27 2 27 Z',
            c.skin,
          )}
          {lit('M 2 9.5 H 16 L 17.5 28.5 H 2 Z', c.blockBlue)}
          <Path
            d="M 29 16 Q 32.2 19.5 32.6 24.5"
            fill="none"
            stroke={c.copperDark}
            strokeOpacity={0.8}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <Path
            d="M 29.2 18.4 L 31.6 16.8 M 30.8 20.6 L 33.2 19.4 M 31.6 23 L 34 22.4"
            stroke={c.copperDark}
            strokeOpacity={0.7}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        </>
      );
      break;
    case 'tree bent by wind':
      art = (
        <>
          <FloorShadow cx={22} cy={44} rx={14} ry={2.2} />
          <Path d="M 4 44 H 44" stroke={c.lifeDeep} strokeWidth={1.6} strokeLinecap="round" />
          {lit('M 12 44 C 14 34 18 25 27 17 L 30.5 19.5 C 23 26 20 35 20 44 Z', c.bark)}
          {(
            [
              [24, 13, 9, 6, 15],
              [34, 14, 10, 6, 20],
              [39.5, 21, 6.5, 4.5, 30],
              [29, 21, 8, 4.5, 15],
            ] as [number, number, number, number, number][]
          ).map(([x, y, rx, ry, r]) => (
            <G key={`${x}${y}`}>{blob(x, y, rx, ry, c.lifeDeep, r, 1)}</G>
          ))}
          <Path
            d="M 2 9 Q 7 7 12 9 M 3 17 Q 8 15 14 17 M 2 25 Q 6 23 10 25 M 4 32 Q 8 30 12 32"
            fill="none"
            stroke={c.glassEdge}
            strokeWidth={1.3}
            strokeLinecap="round"
          />
        </>
      );
      break;
    case 'pale seedling in dark box':
      art = (
        <>
          {lit('M 4 6 H 44 V 44 H 4 Z', c.wood, 1.1)}
          <Rect x={8} y={10} width={32} height={30} fill={c.cupDark} {...o(0.8)} />
          <Path
            d="M 4 6 L 8 10 M 44 6 L 40 10 M 4 44 L 8 40 M 44 44 L 40 40"
            stroke={c.woodDark}
            strokeWidth={0.9}
          />
          <Path d="M 18.5 33 H 29.5 L 28.3 40 H 19.7 Z" fill={c.copper} {...o(0.8)} />
          <Ellipse cx={24} cy={33} rx={5.5} ry={1.2} fill={c.soilDark} {...o(0.6)} />
          <Path
            d="M 24 33 C 24.5 26 22.5 20 24.5 14"
            fill="none"
            stroke={c.fat}
            strokeWidth={1.1}
            strokeLinecap="round"
          />
          {blob(22, 14, 2.4, 1.1, c.fat, -20, 0.5)}
          {blob(27, 13.5, 2.4, 1.1, c.fat, 20, 0.5)}
        </>
      );
      break;
    case 'dog sitting':
      art = (
        <>
          <FloorShadow cx={24} cy={44} rx={14} ry={2.3} />
          {limb('M 34 42 Q 40 43 43 39', c.furLight, 2.4)}
          {lit(ell(29, 35, 8.5, 7.5), c.furLight)}
          {lit(
            'M 15 19 C 19 15 27 17 30 25 C 32 31 30 37 26 40 H 18 C 16 33 13.5 25 15 19 Z',
            c.furLight,
          )}
          {lit('M 16 28 H 20 V 43 H 16 Z', c.furLight, 1)}
          {lit('M 21 29 H 25 V 43 H 21 Z', c.furLight, 1)}
          {lit(ell(29, 42, 6, 1.9), c.furLight, 1)}
          {lit(ell(15, 12.5, 6.5, 6), c.furLight)}
          {lit('M 11 11.5 H 6.2 C 4.4 11.5 4.4 17.5 6.2 17.5 H 12.5 Z', c.furLight)}
          <Circle cx={5.8} cy={13.1} r={1.6} fill={c.rubber} />
          {eye(13.2, 10.5, 1.1)}
          <Path
            d="M 15.5 7 C 20 6.5 22 10.5 21 17 C 18.5 18 16.5 14.5 15.5 10.5 Z"
            fill={c.fur}
            {...o(0.9)}
          />
          <Path
            d="M 14.5 20.5 L 20.5 18.2"
            stroke={c.blockRed}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </>
      );
      break;
    case 'child riding bike': {
      const wheel = (x: number) => (
        <G key={x}>
          <Circle cx={x} cy={37} r={8} fill="none" stroke={c.rubber} strokeWidth={2.2} />
          <Circle cx={x} cy={37} r={6.6} fill="none" stroke={c.metal} strokeWidth={0.6} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i * Math.PI) / 6;
            return (
              <Line
                key={i}
                x1={x - 6.6 * Math.cos(a)}
                y1={37 - 6.6 * Math.sin(a)}
                x2={x + 6.6 * Math.cos(a)}
                y2={37 + 6.6 * Math.sin(a)}
                stroke={c.metalDark}
                strokeWidth={0.4}
              />
            );
          })}
          <Circle cx={x} cy={37} r={1} fill={c.metalDark} />
        </G>
      );
      art = (
        <>
          <FloorShadow cx={24} cy={45} rx={19} ry={1.8} />
          {wheel(10)}
          {wheel(38)}
          <Path
            d="M 10 37 L 22 37 L 18 23 Z M 22 37 L 34 23 L 18 23 M 34 23 L 38 37 M 34 23 L 33 19"
            fill="none"
            stroke={c.blockRed}
            strokeWidth={1.9}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Path d="M 30.5 18.5 H 35" stroke={c.rubber} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M 15 21.5 H 21.5" stroke={c.rubber} strokeWidth={2} strokeLinecap="round" />
          {limb('M 19 20 L 25 27 L 23 37', c.blockBlue, 2.4)}
          {limb('M 19.5 11 L 19 20', c.orange, 4.2)}
          {limb('M 20 12.5 L 26 16 L 31.5 18.5', c.orange, 2)}
          {lit(ell(31.8, 18.6, 1.3, 1.3), c.skin, 0.7)}
          <Path d="M 21.5 37 H 25.5" stroke={c.rubber} strokeWidth={1.6} strokeLinecap="round" />
          {lit(ell(21.5, 6.8, 3.6, 3.8), c.skin)}
          {eye(23.6, 6.4, 0.6)}
          {lit('M 17 6 C 16.5 1.5 21 0.5 23.5 1.8 C 25.5 2.8 26 4.5 25.5 5.4 Z', c.blockGreen, 0.9)}
        </>
      );
      break;
    }

    // ── Parts and their jobs ─────────────────────────────────────────────────
    case 'rose stem with thorns':
      art = (
        <>
          {limb('M 22 46 C 23 36 25 26 26 17', c.lifeDeep, 2.2)}
          {(
            [
              [22.5, 40, -1],
              [23.4, 33, 1],
              [24.4, 27, -1],
              [25.3, 21.5, 1],
            ] as [number, number, number][]
          ).map(([x, y, sd]) => {
            return (
              <Path
                key={`${x}${y}`}
                d={`M ${x} ${y - 2} L ${x + sd * 5} ${y - 3} L ${x} ${y + 1.2} Z`}
                fill={c.copperDark}
                {...o(0.7)}
              />
            );
          })}
          {limb('M 23.5 31 C 28 30 31 30 34 28', c.lifeDeep, 0.9)}
          {leaf(BEAN_LEAF, 34, 28, 70, 0.48)}
          {leaf(BEAN_LEAF, 30, 29.8, 25, 0.38)}
          {lit('M 19 16 L 26 21 L 33 16 L 30 17.5 L 26 16.5 L 22 17.5 Z', c.lifeDeep, 0.9)}
          {lit(
            'M 18 9.5 C 17.5 15 21 19 26 19 C 31 19 34.5 15 34 9.5 C 33.5 5 29.5 2.5 26 2.5 C 22.5 2.5 18.5 5 18 9.5 Z',
            c.blockRed,
          )}
          <Path
            d="M 21.5 4.5 C 19.5 9 21 14.5 26 17.5 M 30.5 4.5 C 32.5 9 31 14.5 26 17.5 M 23.5 6.5 C 24.5 4.5 28 4.5 28.5 6.8 C 28.5 9 25.5 9 25.5 7.2"
            fill="none"
            stroke={c.copperDark}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        </>
      );
      break;
    case 'tree with roots':
      art = (
        <>
          {soil(27)}
          {limb('M 24 27 C 24 33 23 38 24 44', c.furLight, 1.8)}
          {limb('M 23 28 C 18 31 13 33 7 38', c.furLight, 1.4)}
          {limb('M 25 28 C 30 31 35 33 41 37', c.furLight, 1.4)}
          {limb('M 23 31 C 19 36 17 40 13 44', c.furLight, 1)}
          {limb('M 25 31 C 29 36 31 40 35 44', c.furLight, 1)}
          {limb(
            'M 13 33.5 L 10 31 M 35 33.5 L 38 31 M 9 36.5 L 8 41 M 39 35.5 L 41 41',
            c.furLight,
            0.6,
          )}
          {lit('M 21 27.5 C 22 21 22 17 21 12 H 27 C 26 17 26 21 27 27.5 Z', c.bark)}
          {(
            [
              [24, 10, 12, 7],
              [14, 13.5, 7, 5],
              [34, 13.5, 7, 5],
            ] as [number, number, number, number][]
          ).map(([x, y, rx, ry]) => (
            <Ellipse key={`o${x}`} cx={x} cy={y} rx={rx} ry={ry} fill={c.lifeDeep} {...o(2.2)} />
          ))}
          {(
            [
              [24, 10, 12, 7],
              [14, 13.5, 7, 5],
              [34, 13.5, 7, 5],
            ] as [number, number, number, number][]
          ).map(([x, y, rx, ry]) => (
            <G key={`f${x}`}>
              <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill={c.lifeDeep} />
              <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill={url(ids.round)} />
            </G>
          ))}
        </>
      );
      break;
    case 'bird beak':
      art = (
        <G>
          <MaterialIcon icon="bird" ink={ink} />
          <Circle
            cx={6.5}
            cy={18.6}
            r={5.2}
            fill="none"
            stroke={c.chartHighlight}
            strokeWidth={2}
          />
        </G>
      );
      break;
    case 'fish gills':
      art = (
        <G>
          <MaterialIcon icon="fish" ink={ink} />
          <Ellipse
            cx={13.8}
            cy={24}
            rx={4.2}
            ry={9}
            fill="none"
            stroke={c.chartHighlight}
            strokeWidth={2}
          />
        </G>
      );
      break;
    case 'owl face':
      art = (
        <>
          {lit('M 10 16 L 7 3 L 17 10 Z', c.feather, 1)}
          {lit('M 38 16 L 41 3 L 31 10 Z', c.feather, 1)}
          {lit(ell(24, 26, 19, 19), c.feather)}
          {lit(
            'M 24 18 C 20 10 5 12 6 24 C 7 34 18 36 24 30 C 30 36 41 34 42 24 C 43 12 28 10 24 18 Z',
            c.featherLight,
          )}
          {[16, 32].map((x) => (
            <G key={x}>
              <Circle cx={x} cy={24} r={6} fill={c.chartSecond} {...o(1)} />
              <Circle cx={x} cy={24} r={3.3} fill={c.rubber} />
              <Circle cx={x - 1.6} cy={22.2} r={1.2} fill={c.shine} />
            </G>
          ))}
          <Path d="M 21.5 28 H 26.5 L 24 35 Z" fill={c.rock5} {...o(0.9)} />
          <Path
            d="M 16 40 L 18 42 L 20 40 M 22 42 L 24 44 L 26 42 M 28 40 L 30 42 L 32 40"
            fill="none"
            stroke={c.furDark}
            strokeWidth={0.9}
          />
        </>
      );
      break;
    case 'bird flying':
      art = (
        <>
          <Path
            d="M 22 24 C 18 16 12 9 5 7 L 7 11 L 3 12 L 8 15 L 5 17 L 11 19 C 15 21 19 23 21 25 Z"
            fill={c.furDark}
            {...o(1)}
          />
          <Path
            d="M 22 24 C 18 16 12 9 5 7 L 7 11 L 3 12 L 8 15 L 5 17 L 11 19 C 15 21 19 23 21 25 Z"
            fill={c.rubber}
            fillOpacity={0.3}
          />
          {lit('M 36 27 L 46 23.5 L 45 32 Z', c.furDark)}
          {lit(ell(26, 28, 11, 6), c.furDark)}
          <Path d="M 16 29 C 18 34 26 35.5 32 32.5 C 26 32 20 31 16 29 Z" fill={c.orange} />
          {lit(ell(14.5, 24.5, 5.5, 5), c.furDark)}
          <Path d="M 9.2 23.8 L 4 25.5 L 9.4 26.8 Z" fill={c.chartSecond} {...o(0.8)} />
          <Circle cx={13} cy={23.5} r={1.8} fill={c.snow} />
          {eye(13, 23.5, 1)}
          {lit(
            'M 21 26 C 21 17 27 8 37 3 L 37.5 7 L 41 5.5 L 40 10 L 44 9.5 L 40.5 14 L 43.5 15 L 37 19 C 33 22 29 24.5 27 27 Z',
            c.furDark,
          )}
          <Path
            d="M 30 11 L 37.5 7 M 31 15 L 40 10 M 31.5 19 L 40.5 14"
            fill="none"
            stroke={c.rubber}
            strokeOpacity={0.5}
            strokeWidth={0.8}
          />
        </>
      );
      break;
    case 'sunflower head': {
      const seed = (x: number, y: number, rot: number) => (
        <G key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${rot}) scale(1.2)`}>
          <Path
            d="M 0 -4.5 C 2.6 -2 2.6 2.5 0 4.5 C -2.6 2.5 -2.6 -2 0 -4.5 Z"
            fill={c.rubber}
            {...o(0.6)}
          />
          <Path d="M -0.9 -2.8 L -1 2.8 M 0.9 -2.8 L 1 2.8" stroke={c.snow} strokeWidth={0.5} />
        </G>
      );
      art = (
        <>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i * 360) / 16 + (i % 2 ? 11 : 0);
            const r = (a * Math.PI) / 180;
            return (
              <G key={i}>
                {blob(
                  20 + 12.5 * Math.cos(r),
                  20 + 12.5 * Math.sin(r),
                  2.6,
                  5,
                  i % 2 ? c.chartSecond : c.sunDisk,
                  a + 90,
                  0.7,
                )}
              </G>
            );
          })}
          <Circle cx={20} cy={20} r={10} fill={c.soilDark} {...o(1)} />
          {Array.from({ length: 70 }, (_, i) => {
            const r = 9 * Math.sqrt((i + 0.5) / 70);
            const a = i * 2.39996;
            return (
              <Circle
                key={i}
                cx={20 + r * Math.cos(a)}
                cy={20 + r * Math.sin(a)}
                r={0.7}
                fill={i > 45 ? c.fur : c.rubber}
              />
            );
          })}
          <Circle cx={20} cy={20} r={10} fill={url(ids.round)} />
          {seed(35.5, 40, 30)}
          {seed(42.5, 34, -25)}
          {seed(42, 43.5, 75)}
        </>
      );
      break;
    }

    // ── Food webs ────────────────────────────────────────────────────────────
    case 'tuft of grass':
      art = (
        <>
          <FloorShadow cx={24} cy={43} rx={13} ry={2.4} />
          {grass(24, 43, 32, 11)}
        </>
      );
      break;
    case 'algae on pond':
      art = (
        <>
          {pond(0.35)}
          <Path
            d="M 2 12 Q 8 10 14 12 M 30 38 Q 36 36 42 38"
            fill="none"
            stroke={c.waterTop}
            strokeWidth={1}
          />
          {[
            'M 5 20 C 7 12 16 9 22 13 C 28 8 38 9 41 15 C 45 19 43 26 38 27 C 42 32 38 38 31 36 C 27 42 17 41 15 36 C 8 38 3 33 7 29 C 3 26 3 22 5 20 Z',
            'M 34 39 C 36 37 41 38 41 40.5 C 42 43 38 44 36 43 C 33 43.5 32 41 34 39 Z',
          ].map((d, i) => (
            <G key={i}>
              <Path d={d} fill={c.insect} stroke={c.lifeDeep} strokeWidth={0.8} />
              <Path d={d} fill={url(ids.round)} />
            </G>
          ))}
          {Array.from({ length: 22 }, (_, i) => {
            const x = 8 + ((i * 7.3) % 30);
            const y = 14 + ((i * 11.7) % 21);
            return (
              <Path
                key={i}
                d={`M ${x} ${y} q 1.5 -1.5 3 0 t 3 0`}
                fill="none"
                stroke={i % 3 ? c.lifeDeep : c.life}
                strokeWidth={0.6}
                strokeLinecap="round"
              />
            );
          })}
          <Ellipse
            cx={24}
            cy={24}
            rx={4}
            ry={2.5}
            fill={c.water}
            fillOpacity={0.5}
            stroke={c.lifeDeep}
            strokeWidth={0.5}
          />
          {(
            [
              [17, 20],
              [24, 27],
              [35, 14],
              [33, 36],
              [11, 40],
            ] as Pt[]
          ).map(([x, y]) => (
            <Circle
              key={`${x}`}
              cx={x}
              cy={y}
              r={0.9}
              fill={c.snow}
              stroke={c.glassEdge}
              strokeWidth={0.3}
            />
          ))}
        </>
      );
      break;
    case 'mushroom on log': {
      const shroom = (x: number, base: number, top: number, w: number, h: number) => (
        <G key={x}>
          {lit(
            `M ${x - w * 0.22} ${base} L ${x - w * 0.16} ${top} H ${x + w * 0.16} L ${x + w * 0.22} ${base} Z`,
            c.fat,
            0.8,
          )}
          {lit(
            `M ${x - w} ${top + 0.5} C ${x - w} ${top - h} ${x + w} ${top - h} ${x + w} ${top + 0.5} C ${x + w * 0.5} ${top + 1.8} ${x - w * 0.5} ${top + 1.8} ${x - w} ${top + 0.5} Z`,
            c.fur,
          )}
        </G>
      );
      art = (
        <>
          <FloorShadow cx={23} cy={45} rx={19} ry={2} />
          {lit('M 5 29 H 38 V 44 H 5 C 2 44 2 29 5 29 Z', c.bark)}
          <Path
            d="M 8 33 H 20 M 14 37 H 30 M 9 41 H 18 M 24 32 H 34"
            stroke={c.furDark}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          {lit(ell(38, 36.5, 4.2, 7.5), c.wood)}
          <Path
            d={`${ell(38, 36.5, 2.6, 4.8)} ${ell(38, 36.5, 1.1, 2.2)}`}
            fill="none"
            stroke={c.woodDark}
            strokeWidth={0.7}
          />
          {blob(10, 29.5, 4, 1.6, c.life, 0, 0.6)}
          {shroom(17, 30, 21, 8, 8)}
          {shroom(28, 30, 25, 4.6, 5)}
          {shroom(33.5, 30, 27, 3, 3.4)}
        </>
      );
      break;
    }
    case 'earthworm in soil': {
      const d = 'M 8 24 C 14 19 20 27 26 27 C 32 27 35 32 31 36 C 28 39 32 42.5 40 40';
      art = (
        <>
          {grass(10, 14, 7, 5)}
          {grass(36, 14, 8, 5)}
          {soil(14)}
          <Path d={d} fill="none" stroke={c.soilDark} strokeWidth={8} strokeLinecap="round" />
          <Path d={d} fill="none" {...o(5.6)} />
          <Path d={d} fill="none" stroke={c.wormPink} strokeWidth={4.2} strokeLinecap="round" />
          <Path
            d={d}
            fill="none"
            stroke={c.copperDark}
            strokeOpacity={0.35}
            strokeWidth={4.2}
            strokeDasharray="0.4 1.5"
          />
          <Path
            d="M 12.5 22.3 C 14 22.4 16.5 23.2 17.9 24"
            fill="none"
            stroke={c.copper}
            strokeWidth={4.2}
          />
          <Path
            d="M 9 22.8 C 14 18.4 20 25.8 26 25.8 C 31 25.8 34 30 31.5 33.5"
            fill="none"
            stroke={c.shine}
            strokeOpacity={0.4}
            strokeWidth={1}
            strokeLinecap="round"
          />
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
      </Defs>
      {art}
    </G>
  );
}
