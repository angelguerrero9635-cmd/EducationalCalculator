import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { Sheen, url, usePaintIds } from '../reps/paint';

/** The top panel: a flashlight shining into the night. */
const PANEL = 96;
/** Room under each frame for its number. */
const NUMBER = 24;
const SPACING = 5;

/** A row's width in frame units: short 1, long 2, a dark gap between flashes 0.45. */
const unitsOf = (row: string[]) =>
  row.reduce((s, m) => s + (m === '—' ? 2 : 1), 0) + (row.length - 1) * 0.45;

/** The widest row, in frame units, before the frames get too small to read. */
const ROW_UNITS = 7.5;

/**
 * The frames of a flash code in rows. A long code made of up to three runs of the same flash
 * (the help code) gets a row per run, so "three short, three long, three short" reads as three
 * rows; any other code fills rows left to right, a new row when one would get too wide.
 */
function rowsOf(marks: string[]): string[][] {
  const runs: string[][] = [];
  for (const m of marks) {
    const last = runs[runs.length - 1];
    if (last && last[0] === m) last.push(m);
    else runs.push([m]);
  }
  if (marks.length > 5 && runs.length <= 3 && runs.every((r) => unitsOf(r) <= ROW_UNITS)) {
    return runs;
  }
  const rows: string[][] = [[]];
  for (const m of marks) {
    const row = rows[rows.length - 1]!;
    if (row.length && unitsOf([...row, m]) > ROW_UNITS) rows.push([m]);
    else row.push(m);
  }
  return rows;
}

/**
 * A flashlight code. A metal flashlight shines into a night panel; under it, the code as a
 * strip of frames, each a small night window: a short flash is a round burst of light, a long
 * flash a stretched beam, and between flashes a dark frame (the light off). Flashes are
 * numbered 1, 2, 3 in order. The pattern ("● ● ●", "—" for a long one) is the source.
 */
export function Flashes({ pattern }: { pattern: string }) {
  const c = usePalette();
  const ids = usePaintIds('barrel', 'lens', 'beam', 'burst');
  const marks = pattern.split(/\s+/).filter(Boolean);
  const rows = rowsOf(marks);
  const most = Math.max(...rows.map(unitsOf));
  const unit = (w: number) => {
    const count = Math.max(...rows.map((r) => r.length * 2 - 1));
    return Math.min(48, (w - 32 - (count - 1) * SPACING) / most);
  };
  const heightOf = (w: number) => PANEL + 14 + rows.length * (unit(w) + NUMBER + 6);
  return (
    <Canvas aspect={(w) => heightOf(w) / w}>
      {({ w, h }) => {
        const u = unit(w);
        const cy = PANEL / 2;
        const lens = { x: 150, r: 17 };
        let n = 0;
        return (
          <Svg width={w} height={h}>
            <Defs>
              <Sheen id={ids.barrel} vertical strength={1.6} />
              <RadialGradient id={ids.lens} cx="0.5" cy="0.5" r="0.5">
                <Stop offset="0" stopColor={c.shine} />
                <Stop offset="0.45" stopColor={c.bulbGlow} />
                <Stop offset="1" stopColor={c.sunRay} />
              </RadialGradient>
              <LinearGradient id={ids.beam} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={c.bulbGlow} stopOpacity={0.8} />
                <Stop offset="1" stopColor={c.bulbGlow} stopOpacity={0} />
              </LinearGradient>
              <RadialGradient id={ids.burst} cx="0.5" cy="0.5" r="0.5">
                <Stop offset="0" stopColor={c.shine} />
                <Stop offset="0.25" stopColor={c.bulbGlow} />
                <Stop offset="0.6" stopColor={c.bulbGlow} stopOpacity={0.45} />
                <Stop offset="1" stopColor={c.bulbGlow} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            {/* the night, and the flashlight shining into it */}
            <Rect
              x={16}
              y={0}
              width={w - 32}
              height={PANEL}
              rx={12}
              fill={c.shade}
              opacity={0.88}
            />
            <Path
              d={`M ${lens.x} ${cy - lens.r} L ${w - 16} ${cy - PANEL / 2 + 6} L ${w - 16} ${cy + PANEL / 2 - 6} L ${lens.x} ${cy + lens.r} Z`}
              fill={url(ids.beam)}
            />
            {/* tail cap, barrel, switch, head */}
            <Rect x={34} y={cy - 10} width={12} height={20} rx={4} fill={c.rubber} />
            <Rect x={42} y={cy - 11} width={82} height={22} rx={3} fill={c.metal} />
            <Rect x={42} y={cy - 11} width={82} height={22} rx={3} fill={url(ids.barrel)} />
            {[56, 62, 68].map((x) => (
              <Rect
                key={x}
                x={x}
                y={cy - 11}
                width={2}
                height={22}
                fill={c.metalDark}
                opacity={0.5}
              />
            ))}
            <Rect x={84} y={cy - 16} width={20} height={7} rx={3.5} fill={c.blockRed} />
            <Path
              d={`M 122 ${cy - 11} L ${lens.x - 4} ${cy - lens.r - 2} L ${lens.x - 4} ${cy + lens.r + 2} L 122 ${cy + 11} Z`}
              fill={c.metal}
            />
            <Path
              d={`M 122 ${cy - 11} L ${lens.x - 4} ${cy - lens.r - 2} L ${lens.x - 4} ${cy + lens.r + 2} L 122 ${cy + 11} Z`}
              fill={url(ids.barrel)}
            />
            <Circle cx={lens.x} cy={cy} r={lens.r * 1.9} fill={url(ids.burst)} />
            <Ellipse
              cx={lens.x - 1}
              cy={cy}
              rx={5}
              ry={lens.r}
              fill={url(ids.lens)}
              stroke={c.metalDark}
              strokeWidth={1.5}
            />
            {/* the code: a row of frames per run */}
            {rows.map((row, r) => {
              const widths = row.flatMap((m, i) => [
                ...(i ? [0.45 * u] : []),
                m === '—' ? 2 * u : u,
              ]);
              const total = widths.reduce((s, x) => s + x, 0) + (widths.length - 1) * SPACING;
              let x = (w - total) / 2;
              const y = PANEL + 14 + r * (u + NUMBER + 6);
              return (
                <G key={r}>
                  {row.flatMap((m, i) => {
                    const out = [];
                    if (i) {
                      // A dark frame: the light is off between flashes.
                      out.push(
                        <Rect
                          key={`g${i}`}
                          x={x}
                          y={y + u * 0.1}
                          width={0.45 * u}
                          height={u * 0.8}
                          rx={4}
                          fill={c.shade}
                          opacity={0.88}
                        />,
                      );
                      x += 0.45 * u + SPACING;
                    }
                    const fw = m === '—' ? 2 * u : u;
                    n += 1;
                    out.push(
                      <G key={`f${i}`}>
                        <Rect
                          x={x}
                          y={y}
                          width={fw}
                          height={u}
                          rx={6}
                          fill={c.shade}
                          opacity={0.88}
                        />
                        <Ellipse
                          cx={x + fw / 2}
                          cy={y + u / 2}
                          rx={m === '—' ? fw / 2 - 2 : u * 0.46}
                          ry={m === '—' ? u * 0.3 : u * 0.46}
                          fill={url(ids.burst)}
                        />
                        <ChartText
                          x={x + fw / 2}
                          y={y + u + 17}
                          fontSize={chart.value}
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {String(n)}
                        </ChartText>
                      </G>,
                    );
                    x += fw + SPACING;
                    return out;
                  })}
                </G>
              );
            })}
          </Svg>
        );
      }}
    </Canvas>
  );
}
