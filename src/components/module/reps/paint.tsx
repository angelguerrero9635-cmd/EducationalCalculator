/**
 * Shading for pictures of real things: gradients that make a jug look like glass, water look
 * wet, a coin look like metal and a block look solid. Colors come from the theme's materials;
 * the sheen is black and white at low opacity, so it lays over any fill in either theme.
 *
 * Gradient ids must be unique on the page (a page can show one picture twice), so pictures
 * get them from `usePaintIds` and refer to them with `url(id)`.
 */
import { useId, type ReactNode } from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
  type RectProps,
} from 'react-native-svg';

import { useIsClient, usePalette } from '@/theme';

/**
 * Unique gradient ids for one picture: `ids.glass`, `ids.water`, …
 *
 * The id changes once, right after the page mounts. A pre-rendered web page is hydrated with
 * the server's ids, but React's `useId` gives different ids in the browser: shapes drawn after
 * the first edit then point at a gradient that isn't there and draw hollow. Renaming every id
 * after mount rewrites the gradients and their references together.
 */
export function usePaintIds<K extends string>(...names: K[]): Record<K, string> {
  // React's ids contain colons, which aren't allowed in url(#…) references on the web.
  const id = useId().replace(/[^A-Za-z0-9]/g, '');
  const live = useIsClient();
  const base = `p${id}${live ? 'c' : ''}`;
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
  const k = strength * (0.5 + c.sheen / 2);
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
  strength *= c.sheen;
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

/**
 * For counters and cubes drawn as views: an inset glint at the top left and shade at the bottom
 * right, so a solid counter looks like a rounded chip. Size is the counter's diameter.
 */
export const raised = (c: { edgeLight: string; edgeShade: string }, size: number) => {
  const k = Math.max(1, Math.round(size / 8));
  return {
    boxShadow: `inset ${k}px ${k}px 0 ${c.edgeLight}, inset -${k}px -${k}px 0 ${c.edgeShade}`,
  };
};

/**
 * A wooden crate: planks with a frame and a cross brace, lit from above, with a shadow on the
 * floor. `label` goes on a paper tag in the middle so it stays readable on wood.
 */
export function Crate({
  x,
  y,
  size,
  lightId,
  label,
}: {
  x: number;
  y: number;
  size: number;
  /** Id of a TopLight gradient defined in the picture's Defs. */
  lightId: string;
  label?: ReactNode;
}) {
  const c = usePalette();
  const f = Math.max(4, size * 0.12);
  const planks = 3;
  return (
    <G>
      <Ellipse cx={x + size / 2 + 3} cy={y + size} rx={size * 0.6} ry={4} fill={c.shadow} />
      <Rect
        x={x}
        y={y}
        width={size}
        height={size}
        rx={3}
        fill={c.wood}
        stroke={c.woodDark}
        strokeWidth={1.5}
      />
      {Array.from({ length: planks - 1 }, (_, i) => (
        <Line
          key={i}
          x1={x + f}
          y1={y + f + ((i + 1) * (size - 2 * f)) / planks}
          x2={x + size - f}
          y2={y + f + ((i + 1) * (size - 2 * f)) / planks}
          stroke={c.woodDark}
          strokeOpacity={0.6}
        />
      ))}
      <Line
        x1={x + f}
        y1={y + size - f}
        x2={x + size - f}
        y2={y + f}
        stroke={c.woodDark}
        strokeWidth={f * 0.8}
        strokeOpacity={0.55}
      />
      <Rect
        x={x + f / 2}
        y={y + f / 2}
        width={size - f}
        height={size - f}
        rx={2}
        fill="none"
        stroke={c.woodDark}
        strokeWidth={f}
        strokeOpacity={0.45}
      />
      <Rect x={x} y={y} width={size} height={size} rx={3} fill={url(lightId)} />
      {label}
    </G>
  );
}

/** A small paper tag centered at (cx, cy), wide enough for `chars` characters, for text on wood. */
export function Tag({ cx, cy, chars }: { cx: number; cy: number; chars: number }) {
  const c = usePalette();
  const w = chars * 7 + 10;
  return (
    <Rect
      x={cx - w / 2}
      y={cy - 10}
      width={w}
      height={20}
      rx={4}
      fill={c.paper}
      stroke={c.woodDark}
    />
  );
}

/** A round counter as its own little picture (for counters laid out as views): a lit ball. */
export function CounterDot({ size, color }: { size: number; color: string }) {
  const c = usePalette();
  const ids = usePaintIds('ball');
  return (
    <Svg width={size} height={size}>
      <Defs>
        <Ball id={ids.ball} color={color} />
      </Defs>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 0.75}
        fill={url(ids.ball)}
        stroke={c.chartInk}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

/**
 * A Rect with light from above laid over its fill (bars, tapes, fraction pieces). Takes the
 * Rect's props, plus the id of a TopLight gradient in the picture's Defs.
 */
export function LitRect({ lightId, ...props }: RectProps & { lightId: string }) {
  const { x, y, width, height, rx, ry, opacity } = props;
  return (
    <>
      <Rect {...props} />
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        ry={ry}
        opacity={opacity}
        fill={url(lightId)}
      />
    </>
  );
}
