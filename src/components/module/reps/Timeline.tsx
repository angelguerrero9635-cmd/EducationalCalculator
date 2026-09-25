import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'timeline' }>;

const clock = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`;
const nextHour = (h: number) => (h % 12) + 1;

/**
 * The jumps a student draws on an elapsed-time number line: from the start time to the next
 * hour, then whole hours, then the minutes left. Each jump is [from, to, minutes].
 */
function hops(h: number, m: number, d: number) {
  const out: { from: [number, number]; to: [number, number]; minutes: number }[] = [];
  let [hh, mm, left] = [h, m, d];
  if (mm > 0 && left >= 60 - mm) {
    out.push({ from: [hh, mm], to: [nextHour(hh), 0], minutes: 60 - mm });
    [hh, mm, left] = [nextHour(hh), 0, left - (60 - mm)];
  }
  while (left >= 60) {
    out.push({ from: [hh, mm], to: [nextHour(hh), mm], minutes: 60 });
    [hh, left] = [nextHour(hh), left - 60];
  }
  if (left > 0) out.push({ from: [hh, mm], to: [hh, mm + left], minutes: left });
  return out;
}

/** Elapsed time on a number line, from the start time to the end time in jumps. */
export function Timeline({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = [spec.startHour, spec.startMinute, spec.minutes];
  const known = ids.every(rep.known);
  const sh = Math.round(rep.shown(spec.startHour));
  const sm = Math.round(rep.shown(spec.startMinute));
  const d = Math.max(0, Math.round(rep.shown(spec.minutes)));
  const jumps = known ? hops(sh, sm, d) : [];
  const end = jumps.length ? jumps[jumps.length - 1]!.to : ([sh, sm] as [number, number]);

  return (
    <View>
      <Canvas aspect={0.46}>
        {({ w, h }) => {
          const pad = 30;
          const px = (minutes: number) => pad + (d > 0 ? minutes / d : 0) * (w - 2 * pad);
          const y = h * 0.64;
          let at = 0;
          const marks = jumps.map((j) => {
            const from = at;
            at += j.minutes;
            return { ...j, x0: px(from), x1: px(at) };
          });
          return (
            <Svg width={w} height={h}>
              <Line
                x1={pad - 10}
                y1={y}
                x2={w - pad + 10}
                y2={y}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {marks.map((j, i) => {
                const lift = Math.min(h * 0.4, Math.max(16, (j.x1 - j.x0) * 0.35));
                return [
                  <Path
                    key={`a${i}`}
                    d={`M ${j.x0} ${y} Q ${(j.x0 + j.x1) / 2} ${y - 2 * lift} ${j.x1} ${y}`}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    fill="none"
                  />,
                  <ChartText
                    key={`m${i}`}
                    x={(j.x0 + j.x1) / 2}
                    y={y - lift - 6}
                    fontSize={chart.small}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {j.minutes === 60 ? '1 hour' : `${j.minutes} min`}
                  </ChartText>,
                ];
              })}
              {[
                { x: px(0), t: [sh, sm] as [number, number] },
                ...marks.map((j) => ({ x: j.x1, t: j.to })),
              ].map((p, i) => [
                <Circle key={`d${i}`} cx={p.x} cy={y} r={4} fill={c.chartInk} />,
                <ChartText
                  key={`t${i}`}
                  x={p.x}
                  y={y + (i % 2 ? 36 : 22)}
                  fontSize={chart.label}
                  fontWeight={i === 0 || i === marks.length ? '700' : undefined}
                  textAnchor="middle"
                >
                  {clock(p.t[0], p.t[1])}
                </ChartText>,
              ])}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `Start ${clock(sh, sm)}, end ${clock(end[0], end[1])}: ${d} minutes` +
            (d >= 60 ? ` (${Math.floor(d / 60)} h ${d % 60} min)` : '') +
            '.'
          : 'Type the start time and how long it takes.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.startHour, steps: [1], pin: [spec.startMinute, spec.minutes], wrap: [1, 12] },
          { var: spec.startMinute, steps: [1, 5], pin: [spec.startHour, spec.minutes] },
          { var: spec.minutes, steps: [1, 5], pin: [spec.startHour, spec.startMinute] },
        ]}
      />
    </View>
  );
}
