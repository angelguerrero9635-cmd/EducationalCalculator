import { View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'tape'; ratio: unknown }>;

/**
 * A ratio as a tape diagram: two (or three) bars of equal boxes, one box per part of the ratio
 * (3 boxes and 5 boxes), every box worth the same amount. Brackets give each bar's amount and
 * how many more the longer of two bars has; three bars have the total bracketed beside them.
 */
export function RatioTape({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const counts = spec.ratio.map((id) => Math.max(0, Math.round(rep.shown(id))));
  const [p = 0, q = 0] = counts;
  const three = counts.length === 3;
  const known = spec.ratio.every(rep.known);
  const unit = rep.known(spec.unit) ? formatNumber(rep.shown(spec.unit)) : '?';
  const most = Math.max(...counts, 1);
  // Three bars: one per row, a little closer, with room on the right for the total's bracket.
  const tops = three ? [0.1, 0.38, 0.66] : [0.18, 0.52];
  const fills = [c.chartHighlight, c.chartFill, c.chartSecond];
  const opacities = [0.3, 1, 0.35];

  return (
    <View>
      <Canvas aspect={three ? 0.5 : 0.46}>
        {({ w, h }) => {
          const left = 86;
          const box = Math.min(40, (w - left - (three ? 124 : 60)) / most);
          const barH = Math.min(30, h * (three ? 0.16 : 0.18));
          const rows = spec.ratio.map((id, j) => ({
            n: counts[j]!,
            y: h * tops[j]!,
            amount: spec.amounts?.[j],
            name: rep.variable(id).name,
          }));
          // The total's bracket stands past the longest bar and its amount.
          const bx = left + most * box + 56;
          const [y1, y2] = [rows[0]!.y, rows[rows.length - 1]!.y + barH];
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              {rows.map((r, j) => (
                <G key={j}>
                  <ChartText
                    x={left - 8}
                    y={r.y + barH * 0.66}
                    fontSize={chart.small}
                    fill={c.chartInk}
                    textAnchor="end"
                  >
                    {r.name
                      .replace(/ of the ratio$/, '')
                      .replace(/^(First|Second|Third) part:? ?/, '') ||
                      r.name.replace(/ of the ratio$/, '')}
                  </ChartText>
                  {Array.from({ length: r.n }, (_, i) => (
                    <G key={i}>
                      <Rect
                        x={left + i * box}
                        y={r.y}
                        width={box}
                        height={barH}
                        fill={fills[j]}
                        fillOpacity={opacities[j]}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                      />
                      {box >= 24 ? (
                        <ChartText
                          x={left + i * box + box / 2}
                          y={r.y + barH * 0.66}
                          fontSize={chart.tiny}
                          fill={c.chartInk}
                          textAnchor="middle"
                        >
                          {unit}
                        </ChartText>
                      ) : null}
                    </G>
                  ))}
                  {r.amount && r.n > 0 ? (
                    <ChartText
                      x={left + r.n * box + 6}
                      y={r.y + barH * 0.66}
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={c.chartInk}
                    >
                      {rep.value(r.amount)}
                    </ChartText>
                  ) : null}
                </G>
              ))}
              {three && spec.total ? (
                <G>
                  <Path
                    d={`M ${bx - 6} ${y1} L ${bx} ${y1} L ${bx} ${(y1 + y2) / 2 - 4} L ${bx + 6} ${(y1 + y2) / 2} L ${bx} ${(y1 + y2) / 2 + 4} L ${bx} ${y2} L ${bx - 6} ${y2}`}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <ChartText
                    x={bx + 10}
                    y={(y1 + y2) / 2 + 5}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.chartInk}
                  >
                    {rep.value(spec.total)}
                  </ChartText>
                  <ChartText
                    x={bx + 10}
                    y={(y1 + y2) / 2 + 22}
                    fontSize={chart.small}
                    fill={c.chartHighlight}
                  >
                    in all
                  </ChartText>
                </G>
              ) : null}
              {!three && spec.difference && p !== q ? (
                <G>
                  <Path
                    d={`M ${left + Math.min(p, q) * box} ${h * 0.52 + barH + 8} l 0 6 L ${left + Math.max(p, q) * box} ${h * 0.52 + barH + 14} l 0 -6`}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    fill="none"
                  />
                  <ChartText
                    x={left + ((p + q) / 2) * box}
                    y={h * 0.52 + barH + 30}
                    fontSize={chart.small}
                    fill={c.chartHighlight}
                    textAnchor="middle"
                  >
                    {`${rep.value(spec.difference)} more`}
                  </ChartText>
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${counts.join(' : ')} makes ${counts.reduce((s, n) => s + n, 0)} equal parts${rep.known(spec.unit) ? `, each worth ${unit}` : ''}${spec.total && rep.known(spec.total) ? `. Total: ${rep.value(spec.total)}` : ''}.`
          : `Type the ${three ? 'three' : 'two'} parts of the ratio.`}
      </Caption>
      <Steppers
        calc={calc}
        items={spec.ratio.map((id) => ({
          var: id,
          steps: [1],
          pin: spec.ratio.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}
