/**
 * Small drawings of nature shared by pictures and explore figures: the sun, a tuft of grass
 * and a leaf. Each is drawn around (x, y) in its own colors, lit from the top left; gradient
 * ids come from the caller's `usePaintIds`.
 */
import { Circle, G, Line, Path } from 'react-native-svg';

import { chart, type Palette } from '@/theme';

import { url } from './paint';

/** The sun: a lit yellow disc (a Ball gradient with `c.sunDisk`, id `ball`) with short rays. */
export function SunDisk({
  x,
  y,
  r,
  ball,
  c,
  rays = 8,
}: {
  x: number;
  y: number;
  r: number;
  ball: string;
  c: Palette;
  rays?: number;
}) {
  return (
    <G>
      {Array.from({ length: rays }, (_, i) => {
        const a = (i * 2 * Math.PI) / rays + Math.PI / rays;
        return (
          <Line
            key={i}
            x1={x + (r + 3) * Math.cos(a)}
            y1={y + (r + 3) * Math.sin(a)}
            x2={x + (r + 3 + r * 0.5) * Math.cos(a)}
            y2={y + (r + 3 + r * 0.5) * Math.sin(a)}
            stroke={c.sunRay}
            strokeWidth={chart.stroke}
            strokeLinecap="round"
          />
        );
      })}
      <Circle cx={x} cy={y} r={r} fill={url(ball)} stroke={c.sunRay} strokeWidth={1} />
    </G>
  );
}

/** A tuft of grass blades rising from (x, y), `w` wide and `h` tall. */
export function GrassTuft({
  x,
  y,
  w,
  h,
  c,
  blades = 7,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  c: Palette;
  blades?: number;
}) {
  return (
    <G>
      {Array.from({ length: blades }, (_, i) => {
        const t = blades === 1 ? 0.5 : i / (blades - 1);
        const bx = x - w / 2 + t * w;
        // Blades lean outward from the middle and vary in height, the tallest near the middle.
        const lean = (t - 0.5) * w * 0.6;
        const tall = h * (0.65 + 0.35 * Math.sin(Math.PI * t) - (i % 2) * 0.12);
        const base = Math.max(1.6, w / blades / 2.2);
        return (
          <Path
            key={i}
            d={`M ${bx - base} ${y} Q ${bx + lean * 0.3} ${y - tall * 0.6} ${bx + lean} ${y - tall} Q ${bx + lean * 0.2 + base * 0.4} ${y - tall * 0.5} ${bx + base} ${y} Z`}
            fill={i % 2 ? c.lifeDeep : c.life}
          />
        );
      })}
    </G>
  );
}

/**
 * A leaf on a stem at (x, y), pointing at `angle` degrees (0 = right, −90 = up), `size` long,
 * with its middle vein. Faded draws it as an outline only (a count not typed yet).
 */
export function Leaf({
  x,
  y,
  angle,
  size,
  c,
  faded,
}: {
  x: number;
  y: number;
  angle: number;
  size: number;
  c: Palette;
  faded?: boolean;
}) {
  const wd = size * 0.36;
  return (
    <G transform={`translate(${x} ${y}) rotate(${angle})`}>
      <Path
        d={`M 0 0 C ${size * 0.25} ${-wd} ${size * 0.75} ${-wd} ${size} 0 C ${size * 0.75} ${wd} ${size * 0.25} ${wd} 0 0 Z`}
        fill={faded ? 'none' : c.life}
        stroke={c.lifeDeep}
        strokeWidth={1.2}
        strokeDasharray={faded ? chart.dashFine : undefined}
      />
      {faded ? null : (
        <Line x1={1} y1={0} x2={size * 0.85} y2={0} stroke={c.lifeDeep} strokeWidth={0.8} />
      )}
    </G>
  );
}
