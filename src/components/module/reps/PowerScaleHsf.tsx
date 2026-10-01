/**
 * The log mode of the powers-of-ten ruler (H29): under the 1–10 ruler, the same positions read
 * as logarithms from 0 to 1 (a slide rule's L scale), so the mantissa's point reads off its
 * log: 4.7 sits at 0.67, and log₁₀ 470,000 = 5 + 0.67 = 5.67.
 */
import { G, Line } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { ChartText, fitLabel } from './common';

/** How far below the 1–10 ruler the log scale sits, and the extra height it needs. */
export const LOG_GAP = 62;
export const LOG_ROOM = 70;

/** log₁₀ to 2 places for the picture ("0.67"); the caption gives 3. */
const two = (x: number) => x.toFixed(2);

export function LogScale({
  zx,
  y,
  logA,
  pointX,
  w,
  known,
}: {
  /** The lower ruler's x for a log from 0 to 1. */
  zx: (log: number) => number;
  /** The 1–10 ruler's line. */
  y: number;
  logA: number;
  pointX: number;
  w: number;
  known: boolean;
}) {
  const c = usePalette();
  const ly = y + LOG_GAP;
  return (
    <G>
      <Line x1={zx(0)} y1={ly} x2={zx(1)} y2={ly} stroke={c.chartInk} strokeWidth={chart.stroke} />
      {Array.from({ length: 11 }, (_, i) => i / 10).map((t) => (
        <G key={`L${t}`}>
          <Line
            x1={zx(t)}
            y1={ly - (i2(t) ? 6 : 3)}
            x2={zx(t)}
            y2={ly + (i2(t) ? 6 : 3)}
            stroke={i2(t) ? c.chartInk : c.chartMuted}
            strokeWidth={1}
          />
          {i2(t) ? (
            <ChartText x={zx(t)} y={ly + 20} fontSize={chart.label} textAnchor="middle">
              {formatNumber(t)}
            </ChartText>
          ) : null}
        </G>
      ))}
      <ChartText x={zx(0)} y={ly - 8} fontSize={chart.label} fill={c.chartMuted}>
        log₁₀
      </ChartText>
      <ChartText
        x={(zx(0) + zx(1)) / 2}
        y={ly + 38}
        fontSize={chart.label}
        fill={c.chartMuted}
        textAnchor="middle"
      >
        the log of the number above
      </ChartText>
      <G opacity={known ? 1 : 0.35}>
        {/* The mantissa's point, dropped straight down to its log. */}
        <Line
          x1={pointX}
          y1={y + 8}
          x2={pointX}
          y2={ly}
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeLight}
          strokeDasharray={chart.dashFine}
        />
        {/* Right of the dropped line, on the log ruler's own row: the 1–10 numbers are
            well above it now. */}
        <ChartText
          {...fitLabel(Math.max(pointX + 8, zx(0) + 40), two(logA), chart.value, w, 'start', 8)}
          y={ly - 8}
          fontSize={chart.value}
          fontWeight="700"
          fill={c.chartHighlight}
        >
          {two(logA)}
        </ChartText>
      </G>
    </G>
  );
}

/** A tick every 0.2 is labelled. */
const i2 = (t: number) => Math.abs(t * 5 - Math.round(t * 5)) < 1e-9;
