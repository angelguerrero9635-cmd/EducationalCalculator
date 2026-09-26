/**
 * Shading for pictures of real things: gradients that make a jug look like glass, water look
 * wet, a coin look like metal and a block look solid. Colors come from the theme's materials;
 * the sheen is black and white at low opacity, so it lays over any fill in either theme.
 *
 * Gradient ids must be unique on the page (a page can show one picture twice), so pictures
 * get them from `usePaintIds` and refer to them with `url(id)`.
 */
import { useId } from 'react';
import { Ellipse, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { usePalette } from '@/theme';

/** Unique gradient ids for one picture: `ids.glass`, `ids.water`, … */
export function usePaintIds<K extends string>(...names: K[]): Record<K, string> {
  // React's ids contain colons, which aren't allowed in url(#…) references on the web.
  const base = 'p' + useId().replace(/[^A-Za-z0-9]/g, '');
  return Object.fromEntries(names.map((n) => [n, `${base}-${n}`])) as Record<K, string>;
}

export const url = (id: string) => `url(#${id})`;

/**
 * Round-object shading across a shape (left to right): a dark edge, a bright band a quarter of
 * the way in, then shade again. Lay a Rect filled with it over a tube, bar or cylinder.
 */
export function Sheen({
  id,
  vertical = false,
  strength = 1,
}: {
  id: string;
  vertical?: boolean;
  strength?: number;
}) {
  const c = usePalette();
  const k = strength;
  return (
    <LinearGradient id={id} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '0'}>
      <Stop offset="0" stopColor={c.shade} stopOpacity={0.22 * k} />
      <Stop offset="0.18" stopColor={c.shine} stopOpacity={0.1 * k} />
      <Stop offset="0.3" stopColor={c.shine} stopOpacity={0.42 * k} />
      <Stop offset="0.45" stopColor={c.shine} stopOpacity={0.05 * k} />
      <Stop offset="0.85" stopColor={c.shade} stopOpacity={0.08 * k} />
      <Stop offset="1" stopColor={c.shade} stopOpacity={0.26 * k} />
    </LinearGradient>
  );
}

/** Light from above: a flat face a little brighter at the top, for bars and blocks. */
export function TopLight({ id, strength = 1 }: { id: string; strength?: number }) {
  const c = usePalette();
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor={c.shine} stopOpacity={0.35 * strength} />
      <Stop offset="0.5" stopColor={c.shine} stopOpacity={0.05 * strength} />
      <Stop offset="1" stopColor={c.shade} stopOpacity={0.12 * strength} />
    </LinearGradient>
  );
}

/** A solid color that deepens toward the bottom (liquid in a jug, a filled bar). */
export function Deepen({ id, from, to }: { id: string; from: string; to: string }) {
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor={from} />
      <Stop offset="1" stopColor={to} />
    </LinearGradient>
  );
}

/** Glass: a clear wall with a faint tint and a bright streak near the left edge. */
export function Glass({ id }: { id: string }) {
  const c = usePalette();
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
      <Stop offset="0" stopColor={c.glassEdge} stopOpacity={0.35} />
      <Stop offset="0.08" stopColor={c.glass} stopOpacity={0.9} />
      <Stop offset="0.16" stopColor={c.glassShine} stopOpacity={0.95} />
      <Stop offset="0.24" stopColor={c.glass} stopOpacity={0.75} />
      <Stop offset="0.9" stopColor={c.glass} stopOpacity={0.8} />
      <Stop offset="1" stopColor={c.glassEdge} stopOpacity={0.4} />
    </LinearGradient>
  );
}

/** Metal disk (a coin, a dial): light from the top left, darker at the far rim. */
export function Metal({ id, light, dark }: { id: string; light: string; dark: string }) {
  const c = usePalette();
  return (
    <RadialGradient id={id} cx="0.35" cy="0.3" r="0.8" fx="0.3" fy="0.25">
      <Stop offset="0" stopColor={c.shine} stopOpacity={0.9} />
      <Stop offset="0.25" stopColor={light} />
      <Stop offset="0.85" stopColor={dark} />
      <Stop offset="1" stopColor={dark} />
    </RadialGradient>
  );
}

/** A ball lit from the top left (counters, planets, fruit). */
export function Ball({ id, color }: { id: string; color: string }) {
  const c = usePalette();
  return (
    <RadialGradient id={id} cx="0.4" cy="0.35" r="0.7" fx="0.32" fy="0.28">
      <Stop offset="0" stopColor={c.shine} stopOpacity={0.75} />
      <Stop offset="0.35" stopColor={color} />
      <Stop offset="1" stopColor={color} />
    </RadialGradient>
  );
}

/** A soft oval shadow on the floor under an object. */
export function FloorShadow({
  cx,
  cy,
  rx,
  ry = 4,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry?: number;
}) {
  const c = usePalette();
  return <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={c.shadow} />;
}

/** A shadow offset down and right of a box, drawn before the box. */
export function BoxShadow({
  x,
  y,
  width,
  height,
  r = 0,
  offset = 3,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  r?: number;
  offset?: number;
}) {
  const c = usePalette();
  return (
    <Rect
      x={x + offset * 0.5}
      y={y + offset}
      width={width}
      height={height}
      rx={r}
      fill={c.shadow}
    />
  );
}
