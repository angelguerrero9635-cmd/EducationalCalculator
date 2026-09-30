/**
 * H104 `percentBar` with `second`: a second percent on the same 0–100% bar (the share that must
 * be immune beside the share to vaccinate). It is a band along the bottom of the bar in the
 * second series colour, from 0 to its percent, with a dashed line up through the bar and its
 * label ("H = 80%") above the percent scale, so it never sits on the main shading's label.
 */
import { G, Line, Rect } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { ChartText, fitLabel } from './common';

export function SecondMark({
  x0,
  x1,
  y,
  h,
  label,
  w,
}: {
  x0: number;
  x1: number;
  y: number;
  h: number;
  label: string;
  w: number;
}) {
  const c = usePalette();
  const at = fitLabel(x1, label, chart.label, w);
  return (
    <G>
      <Rect
        x={x0}
        y={y + h * 0.62}
        width={Math.max(0, x1 - x0)}
        height={h * 0.38}
        fill={c.chartSecond}
        fillOpacity={0.85}
      />
      <Line
        x1={x1}
        y1={y - 20}
        x2={x1}
        y2={y + h + 2}
        stroke={c.chartSecond}
        strokeWidth={chart.stroke}
        strokeDasharray={chart.dashFine}
      />
      <ChartText
        x={at.x}
        y={y - 24}
        fontSize={chart.label}
        fontWeight="700"
        textAnchor={at.textAnchor}
        fill={c.chartInk}
      >
        {label}
      </ChartText>
    </G>
  );
}
