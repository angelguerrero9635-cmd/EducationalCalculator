import Svg, { Circle, Defs, G, Line, Rect } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { ChartText } from './common';
import { Metal, url, usePaintIds } from './paint';

/**
 * A coin as it looks: a copper penny or a silver coin, lit from the top left, with a raised rim
 * and (for dimes and quarters) the ridged edge real ones have. `label` is printed in the middle.
 */
export function Coin({ cents, d, label }: { cents: number; d: number; label: string }) {
  const c = usePalette();
  const ids = usePaintIds('metal');
  const penny = cents === 1;
  const [light, dark] = penny ? [c.copper, c.copperDark] : [c.silver, c.silverDark];
  const r = d / 2;
  const reeded = cents === 10 || cents === 25;
  const ridges = Math.round(d * 1.6);
  return (
    <Svg width={d + 2} height={d + 3}>
      <Defs>
        <Metal id={ids.metal} light={light} dark={dark} />
      </Defs>
      <Circle cx={r + 1.5} cy={r + 2.5} r={r} fill={c.shadow} />
      <Circle cx={r + 1} cy={r + 1} r={r} fill={url(ids.metal)} stroke={dark} strokeWidth={1} />
      {reeded ? (
        <G>
          {Array.from({ length: ridges }, (_, i) => {
            const a = (i / ridges) * Math.PI * 2;
            return (
              <Line
                key={i}
                x1={r + 1 + Math.cos(a) * (r - 0.5)}
                y1={r + 1 + Math.sin(a) * (r - 0.5)}
                x2={r + 1 + Math.cos(a) * (r - 2)}
                y2={r + 1 + Math.sin(a) * (r - 2)}
                stroke={dark}
                strokeWidth={0.7}
              />
            );
          })}
        </G>
      ) : null}
      {/* The raised rim. */}
      <Circle cx={r + 1} cy={r + 1} r={r - 3} fill="none" stroke={dark} strokeOpacity={0.6} />
      <ChartText
        x={r + 1}
        y={r + 1 + chart.small * 0.36}
        fontSize={d < 30 ? chart.tiny : chart.small}
        fontWeight="700"
        textAnchor="middle"
        fill={penny ? c.pennyInk : c.coinInk}
      >
        {label}
      </ChartText>
    </Svg>
  );
}

/** A dollar bill: green paper about 2.3 times as wide as tall, with a border and its value. */
export function Bill({ label, width = 64 }: { label: string; width?: number }) {
  const c = usePalette();
  const h = Math.round(width / 2.35);
  return (
    <Svg width={width + 2} height={h + 3}>
      <Rect x={1.5} y={2.5} width={width} height={h} rx={3} fill={c.shadow} />
      <Rect x={0.5} y={0.5} width={width} height={h} rx={3} fill={c.bill} stroke={c.billInk} />
      <Rect
        x={3.5}
        y={3.5}
        width={width - 6}
        height={h - 6}
        rx={2}
        fill="none"
        stroke={c.billInk}
        strokeOpacity={0.5}
      />
      {/* The portrait's oval in the middle, with the value on it. */}
      <Circle cx={width / 2 + 0.5} cy={h / 2 + 0.5} r={h / 2 - 5} fill={c.paper} fillOpacity={0.55} />
      <ChartText
        x={width / 2 + 0.5}
        y={h / 2 + 4.5}
        fontSize={chart.small}
        fontWeight="700"
        textAnchor="middle"
        fill={c.billInk}
      >
        {label}
      </ChartText>
    </Svg>
  );
}
