import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop } from 'react-native-svg';

import { chart, font, usePalette } from '@/theme';

import { ChartText } from './common';
import { Metal, Sheen, TopLight, url, usePaintIds } from './paint';

/** Width of the metal rim, and the ring outside it where the minute labels sit. */
const RIM = 8;
const MINUTE_RING = 20;

/**
 * Where a clock face sits in a w × h canvas: its center and the face's radius (inside the rim).
 * `minuteLabels` leaves room outside the rim for 5 … 55.
 */
export function clockGeometry(w: number, h: number, minuteLabels = false) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - RIM - 6 - (minuteLabels ? MINUTE_RING : 0);
  const at = (angle: number, len: number) =>
    [cx + len * Math.sin(angle), cy - len * Math.cos(angle)] as const;
  // The minute hand reaches the tick ring; its drag handle (20 px) sits on the rim's inner
  // edge, clear of the numerals inside and the minute labels outside.
  return { cx, cy, r, at, minuteTip: r - 9, minuteHandle: r + 2 };
}

/**
 * A wall clock: a metal rim, a cream face lit from above, 60 minute ticks (heavier every five
 * minutes), numerals 1–12, a short wide hour hand in ink and a long thin minute hand in the
 * highlight color, a metal cap and a faint glass sheen. `hour` (1–12) and `minute` (0–59) set
 * the hands exactly; the hour hand moves on between hours as the minutes pass.
 */
export function ClockDial({
  w,
  h,
  hour,
  minute,
  minuteLabels = false,
}: {
  w: number;
  h: number;
  hour: number;
  minute: number;
  /** Muted minute numbers (5, 10, … 55) outside the rim, for counting by fives. */
  minuteLabels?: boolean;
}) {
  const c = usePalette();
  const ids = usePaintIds('bezel', 'face', 'light', 'glass', 'cap');
  const { cx, cy, r, at, minuteTip } = clockGeometry(w, h, minuteLabels);
  const minuteAngle = (minute / 60) * 2 * Math.PI;
  const hourAngle = (((hour % 12) + minute / 60) / 12) * 2 * Math.PI;
  // A hand tapers from a wide base near the center to a point, with a short tail past the
  // center. Drawn again offset for its shadow on the face.
  const hand = (angle: number, len: number, width: number, dx = 0, dy = 0) => {
    const [tx, ty] = at(angle, len);
    const side = (dir: number, along: number, half: number) => {
      const [ax, ay] = at(angle, along);
      return [ax + half * Math.cos(angle) * dir, ay + half * Math.sin(angle) * dir] as const;
    };
    const pts = [
      side(-1, -len * 0.14, width * 0.3),
      side(-1, len * 0.1, width / 2),
      side(-1, len * 0.72, width * 0.36),
      [tx, ty] as const,
      side(1, len * 0.72, width * 0.36),
      side(1, len * 0.1, width / 2),
      side(1, -len * 0.14, width * 0.3),
    ];
    return `M ${pts.map(([x, y]) => `${x + dx} ${y + dy}`).join(' L ')} Z`;
  };
  const numeral = Math.max(chart.emphasis, Math.min(font.body, r / 6.5));
  return (
    <Svg width={w} height={h}>
      <Defs>
        <Metal id={ids.bezel} light={c.metal} dark={c.metalDark} />
        <RadialGradient id={ids.face} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0.78" stopColor={c.paper} />
          <Stop offset="1" stopColor={c.chartSurface} />
        </RadialGradient>
        <TopLight id={ids.light} strength={0.6} />
        <Sheen id={ids.glass} strength={0.35} />
        <Metal id={ids.cap} light={c.metal} dark={c.metalDark} />
      </Defs>
      {/* Shadow on the wall, the metal rim with an inner lip, then the face. */}
      <Circle cx={cx + 2} cy={cy + 4} r={r + RIM} fill={c.shadow} />
      <Circle cx={cx} cy={cy} r={r + RIM} fill={url(ids.bezel)} />
      <Circle
        cx={cx}
        cy={cy}
        r={r + RIM - 0.75}
        fill="none"
        stroke={c.metalDark}
        strokeWidth={1.5}
      />
      <Circle cx={cx} cy={cy} r={r} fill={url(ids.face)} stroke={c.metalDark} strokeWidth={1} />
      <Circle cx={cx} cy={cy} r={r} fill={url(ids.light)} />
      {Array.from({ length: 60 }, (_, i) => {
        const five = i % 5 === 0;
        const [x1, y1] = at((i / 60) * 2 * Math.PI, r - (five ? 11 : 5));
        const [x2, y2] = at((i / 60) * 2 * Math.PI, r - 1);
        return (
          <Line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={five ? c.chartInk : c.chartMuted}
            strokeWidth={five ? chart.strokeHeavy : 1}
            strokeOpacity={five ? 1 : 0.7}
          />
        );
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const [x, y] = at(((i + 1) / 12) * 2 * Math.PI, r - 16 - numeral * 0.75);
        return (
          <ChartText
            key={`n${i}`}
            x={x}
            y={y + numeral * 0.36}
            fontSize={numeral}
            fontWeight="700"
            textAnchor="middle"
          >
            {i + 1}
          </ChartText>
        );
      })}
      {minuteLabels
        ? Array.from({ length: 11 }, (_, i) => {
            const [x, y] = at(((i + 1) / 12) * 2 * Math.PI, r + RIM + MINUTE_RING / 2 + 2);
            return (
              <ChartText
                key={`m${i}`}
                x={x}
                y={y + chart.label * 0.36}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                {(i + 1) * 5}
              </ChartText>
            );
          })
        : null}
      <G>
        <Path d={hand(hourAngle, r * 0.5, 11, 2, 3)} fill={c.shadow} />
        <Path d={hand(minuteAngle, minuteTip, 6, 2, 3)} fill={c.shadow} />
        <Path d={hand(hourAngle, r * 0.5, 11)} fill={c.chartInk} />
        <Path d={hand(minuteAngle, minuteTip, 6)} fill={c.chartHighlight} />
        <Circle cx={cx} cy={cy} r={7} fill={url(ids.cap)} stroke={c.metalDark} strokeWidth={1} />
      </G>
      {/* Glass over the face: a faint sheen. */}
      <Circle cx={cx} cy={cy} r={r} fill={url(ids.glass)} />
    </Svg>
  );
}
