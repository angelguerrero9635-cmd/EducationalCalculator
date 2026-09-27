/**
 * A small kit for drawings of living things in layout figures (a plant, a bear, a body, cats
 * and deer): shapes in their colors with an ink outline and light from the top left, limbs as
 * thick outlined strokes, and a highlight (an outline in the highlight color) for the part a
 * scene lights. `scale` is the scale the shapes are drawn at, so outlines keep one width on
 * screen.
 */
import type { ReactNode } from 'react';
import { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { usePalette, type Palette } from '@/theme';

import { url, usePaintIds } from '../reps/paint';

/** An ellipse as a path, so it can be filled and then lit with the same `d`. */
export const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

export interface DrawKit {
  c: Palette;
  /** The gradient definitions: put once inside the Svg. */
  defs: ReactNode;
  /** A shape filled with `fill`, outlined and lit; `lit` adds a highlight outline over it. */
  shape: (
    d: string,
    fill: string,
    opts?: { lit?: boolean; w?: number; flat?: boolean },
  ) => ReactNode;
  /** A limb, stem or root: a thick stroke in its color with an outline. */
  line: (d: string, color: string, w: number, lit?: boolean) => ReactNode;
  /** A highlight ring around a small part (an eye, a claw). */
  ring: (cx: number, cy: number, r: number) => ReactNode;
  /** A dark eye with a glint. */
  eye: (x: number, y: number, r: number) => ReactNode;
  /** An outline stroke, `w` screen pixels wide. */
  ink: (w?: number) => {
    stroke: string;
    strokeWidth: number;
    strokeLinejoin: 'round';
    strokeLinecap: 'round';
  };
  /** The kit for shapes inside a group scaled `f` times more. */
  at: (f: number) => DrawKit;
}

export function useDrawKit(scale = 1): DrawKit {
  const c = usePalette();
  const ids = usePaintIds('round');
  return makeKit(c, ids.round, scale);
}

function makeKit(c: Palette, round: string, scale: number): DrawKit {
  const ids = { round };
  const px = (n: number) => n / scale;
  const ink = (w = 1.3) => ({
    stroke: c.chartInk,
    strokeWidth: px(w),
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  });
  const glow = (w: number) => ({
    stroke: c.chartHighlight,
    strokeWidth: px(w),
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  });
  return {
    c,
    ink,
    at: (f) => makeKit(c, round, scale * f),
    defs: (
      <Defs>
        <RadialGradient id={ids.round} cx="0.35" cy="0.3" r="0.8" fx="0.3" fy="0.25">
          <Stop offset="0" stopColor={c.shine} stopOpacity={0.45 * c.sheen} />
          <Stop offset="0.5" stopColor={c.shine} stopOpacity={0} />
          <Stop offset="1" stopColor={c.shade} stopOpacity={0.22} />
        </RadialGradient>
      </Defs>
    ),
    shape: (d, fill, opts = {}) => (
      <>
        <Path d={d} fill={fill} {...ink(opts.w)} />
        {opts.flat ? null : <Path d={d} fill={url(ids.round)} />}
        {opts.lit ? <Path d={d} fill="none" {...glow(3.5)} /> : null}
      </>
    ),
    line: (d, color, w, lit) => (
      <>
        {lit ? <Path d={d} fill="none" {...glow(w * scale + 8)} /> : null}
        <Path d={d} fill="none" {...ink(w * scale + 2.4)} />
        <Path d={d} fill="none" {...ink(w * scale)} stroke={color} />
      </>
    ),
    ring: (cx, cy, r) => <Circle cx={cx} cy={cy} r={r} fill="none" {...glow(3)} />,
    eye: (x, y, r) => (
      <>
        <Circle cx={x} cy={y} r={r} fill={c.animalEye} />
        <Circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.4} fill={c.shine} />
      </>
    ),
  };
}
