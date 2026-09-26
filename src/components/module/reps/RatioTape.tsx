import { View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'tape'; ratio: [string, string] }>;

/**
 * A ratio as a tape diagram: two bars of equal boxes, one box per part of the ratio (3 boxes
 * and 5 boxes), every box worth the same amount. Brackets give each bar's amount, the total
 * and how many more the longer bar has.
 */
export function RatioTape({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const [p, q] = spec.ratio.map((id) => Math.max(0, Math.round(rep.shown(id)))) as [number, number];
  const known = spec.ratio.every(rep.known);
  const unit = rep.known(spec.unit) ? formatNumber(rep.shown(spec.unit)) : '?';
  const most = Math.max(p, q, 1);

  return (
    <View>
      <Canvas aspect={0.46}>
        {({ w, h }) => {
          const left = 86;
          const box = Math.min(40, (w - left - 60) / most);
          const barH = Math.min(30, h * 0.18);
          const rows = [
            {
              n: p,
              y: h * 0.18,
              amount: spec.amounts?.[0],
              name: rep.variable(spec.ratio[0]).name,
            },
            {
              n: q,
              y: h * 0.52,
              amount: spec.amounts?.[1],
              name: rep.variable(spec.ratio[1]).name,
            },
          ];
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
                    {r.name.replace(/ of the ratio$/, '').replace(/^(First|Second) part:? ?/, '') ||
                      r.name.replace(/ of the ratio$/, '')}
                  </ChartText>
                  {Array.from({ length: r.n }, (_, i) => (
                    <G key={i}>
                      <Rect
                        x={left + i * box}
                        y={r.y}
                        width={box}
                        height={barH}
                        fill={j === 0 ? c.chartHighlight : c.chartFill}
                        fillOpacity={j === 0 ? 0.3 : 1}
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
              {spec.difference && p !== q ? (
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
          ? `${p} : ${q} makes ${p + q} equal parts${rep.known(spec.unit) ? `, each worth ${unit}` : ''}${spec.total && rep.known(spec.total) ? `. Total: ${rep.value(spec.total)}` : ''}.`
          : 'Type the two parts of the ratio.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.ratio[0], steps: [1], pin: [spec.ratio[1]] },
          { var: spec.ratio[1], steps: [1], pin: [spec.ratio[0]] },
        ]}
      />
    </View>
  );
}
