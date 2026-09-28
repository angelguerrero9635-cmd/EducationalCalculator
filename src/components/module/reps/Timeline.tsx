import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { bracketPath } from './braces';
import { Canvas, ChartText, fitLabel, useRep, Caption } from './common';
import { Steppers } from './Steppers';
import { timeJumps } from './timeJumps';

type Spec = Extract<Representation, { kind: 'timeline' }>;

const clock = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`;
const textW = (t: string, size: number) => t.length * size * 0.6;

/**
 * Elapsed time on an open number line: a tick every 5 minutes, taller ink ticks on the hours,
 * the times on one baseline (start and end bold). The jumps a student draws (to the next hour,
 * whole hours, the minutes left) are arcs with arrowheads, each with its length in a chip, and
 * a bracket under the line gives the total. Counting back from the end time (`back`, or a page
 * that opens on the end time), the jumps go right to left.
 */
export function Timeline({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = [spec.startHour, spec.startMinute, spec.minutes];
  const known = ids.every(rep.known);
  const sh = Math.round(rep.shown(spec.startHour));
  const sm = Math.round(rep.shown(spec.startMinute));
  const d = Math.max(0, Math.round(rep.shown(spec.minutes)));
  const back =
    spec.back ??
    (calc.module.startWith.includes(spec.endHour) &&
      !calc.module.startWith.includes(spec.startHour));
  /** The time `o` minutes after the start, as hour and minutes on a 12-hour clock. */
  const timeAt = (o: number): [number, number] => {
    const x = ((((sh % 12) * 60 + sm + o) % 720) + 720) % 720;
    return [Math.floor(x / 60) || 12, x % 60];
  };
  const [eh, em] = timeAt(d);
  const jumps = known && d > 0 ? timeJumps(sm, d, em, back) : [];
  const chipText = (m: number) =>
    m % 60 === 0 ? (m === 60 ? '1 hour' : `${m / 60} hours`) : `${m} min`;
  const total = `${d} minutes${d >= 60 ? ` = ${Math.floor(d / 60)} h${d % 60 ? ` ${d % 60} min` : ''}` : ''}`;

  const layout = (w: number) => {
    const pad = 30;
    // A little line before the start and after the end, to the 5-minute mark and one more.
    const before = (sm % 5) + 5;
    const after = 5 + ((5 - (em % 5)) % 5);
    const span = Math.max(1, d + before + after);
    const px = (o: number) => pad + ((o + before) / span) * (w - 2 * pad);
    // Arc heights by length; a chip that would touch the one before it goes up a row.
    const chipH = 24;
    const arcs = jumps.map((j) => {
      const x0 = px(j.from);
      const x1 = px(j.to);
      const lift = Math.min(56, Math.max(26, Math.abs(x1 - x0) * 0.3));
      const cw = textW(chipText(j.minutes), chart.emphasis) + 16;
      // A chip wider than its arc sits a row up, on a leader, clear of the next arc.
      return { ...j, x0, x1, lift, cw, raise: cw > Math.abs(x1 - x0) + 8 ? 18 : 0 };
    });
    const peak = (x: (typeof arcs)[number]) => x.lift + x.raise;
    arcs.forEach((a, i) => {
      const mid = (a.x0 + a.x1) / 2;
      const hit = () =>
        arcs
          .slice(0, i)
          .find(
            (b) =>
              Math.abs(mid - (b.x0 + b.x1) / 2) < (a.cw + b.cw) / 2 + 4 &&
              Math.abs(peak(a) - peak(b)) < chipH + 2,
          );
      for (let b = hit(), n = 0; b && n < arcs.length; b = hit(), n++)
        a.raise = peak(b) + chipH + 4 - a.lift;
    });
    const top = Math.max(20, ...arcs.map((a) => a.lift + a.raise)) + chipH / 2 + 6;
    const y = top;
    // The times: start and end bold on one baseline; the hours between them regular, left
    // out when they would touch a bold one.
    const times = [
      { o: 0, bold: true },
      { o: d, bold: true },
      ...jumps.map((j) => ({ o: j.to, bold: false })).filter((t) => t.o !== 0 && t.o !== d),
    ].map((t) => ({ ...t, x: px(t.o), text: clock(...timeAt(t.o)) }));
    const shown = times.filter(
      (t, i) =>
        t.bold ||
        !times.some(
          (o, k) =>
            k !== i &&
            (o.bold || k < i) &&
            Math.abs(o.x - t.x) <
              (textW(o.text, chart.emphasis) + textW(t.text, chart.emphasis)) / 2 + 4,
        ),
    );
    // Start and end that would touch: the end drops a row.
    const endLow = Math.abs(px(d) - px(0)) < textW(clock(sh, sm), chart.emphasis) + 6 && d > 0;
    const labelY = y + 30;
    const bracketY = labelY + (endLow ? 30 : 12);
    return { pad, px, arcs, y, shown, endLow, labelY, bracketY, span, before, h: bracketY + 34 };
  };

  return (
    <View>
      <Canvas aspect={(w) => layout(w).h / w}>
        {({ w, h }) => {
          const { pad, px, arcs, y, shown, endLow, labelY, bracketY, span, before } = layout(w);
          // Minute ticks every 5 minutes (15 or 30 when they would crowd), taller on the hours.
          const perMin = (w - 2 * pad) / span;
          const every = [5, 15, 30, 60].find((k) => k * perMin >= 5) ?? 60;
          const startAbs = (sh % 12) * 60 + sm;
          const ticks: { o: number; hour: boolean }[] = [];
          for (let o = -before; o <= span - before + 1e-9; o++) {
            const abs = (((startAbs + o) % 60) + 60) % 60;
            if (abs % every === 0) ticks.push({ o, hour: abs === 0 });
          }
          return (
            <Svg width={w} height={h}>
              <Line
                x1={pad - 12}
                y1={y}
                x2={w - pad + 12}
                y2={y}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
                strokeLinecap="round"
              />
              {ticks.map((t) => (
                <Line
                  key={`k${t.o}`}
                  x1={px(t.o)}
                  y1={y - (t.hour ? 10 : 5)}
                  x2={px(t.o)}
                  y2={y + (t.hour ? 10 : 5)}
                  stroke={t.hour ? c.chartInk : c.chartMuted}
                  strokeWidth={t.hour ? chart.stroke : 1}
                />
              ))}
              {arcs.map((a, i) => {
                const mid = (a.x0 + a.x1) / 2;
                const L = a.lift;
                const inset = (a.x1 - a.x0) * 0.08;
                const cy = y - (4 / 3) * L;
                // Arrowhead at the landing end, along the curve's last direction.
                const [tx, ty] = [inset, y - cy];
                const len = Math.hypot(tx, ty) || 1;
                const [ux, uy] = [tx / len, ty / len];
                const s = 9;
                // The tip stops at the dot's edge, so the dot doesn't hide it.
                const [ex, ey] = [a.x1 - ux * 6, y - uy * 6];
                const at = (side: number) =>
                  `${ex - ux * s + side * uy * s * 0.5} ${ey - uy * s - side * ux * s * 0.5}`;
                const chipY = y - L - a.raise;
                const t = chipText(a.minutes);
                return (
                  <G key={`j${i}`}>
                    {a.raise > 0 ? (
                      <Line
                        x1={mid}
                        y1={y - L}
                        x2={mid}
                        y2={chipY + 12}
                        stroke={c.chartHighlight}
                        strokeWidth={1}
                        strokeDasharray={chart.dashFine}
                      />
                    ) : null}
                    <Path
                      d={`M ${a.x0} ${y} C ${a.x0 + inset} ${cy} ${a.x1 - inset} ${cy} ${a.x1} ${y}`}
                      stroke={c.chartHighlight}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <Path d={`M ${ex} ${ey} L ${at(1)} L ${at(-1)} Z`} fill={c.chartHighlight} />
                    <Rect
                      x={fitLabel(mid, t, chart.emphasis, w).x - a.cw / 2}
                      y={chipY - 12}
                      width={a.cw}
                      height={24}
                      rx={12}
                      fill={c.card}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.strokeLight}
                    />
                    <ChartText
                      x={fitLabel(mid, t, chart.emphasis, w).x}
                      y={chipY + 5}
                      fontSize={chart.emphasis}
                      fontWeight="700"
                      fill={c.chartHighlight}
                      textAnchor="middle"
                    >
                      {t}
                    </ChartText>
                  </G>
                );
              })}
              {shown.map((t, i) => (
                <G key={`t${i}`}>
                  <Circle
                    cx={t.x}
                    cy={y}
                    r={t.bold ? 5.5 : 4}
                    fill={t.bold ? c.chartInk : c.card}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText
                    {...fitLabel(t.x, t.text, chart.emphasis, w)}
                    y={labelY + (endLow && t.o === d && t.bold ? 18 : 0)}
                    fontSize={chart.emphasis}
                    fontWeight={t.bold ? '700' : '400'}
                    fill={t.bold ? c.chartInk : c.chartMuted}
                  >
                    {t.text}
                  </ChartText>
                </G>
              ))}
              {known && d > 0 ? (
                <>
                  <Path
                    d={bracketPath(px(d), bracketY, px(0), bracketY, 6)}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    fill="none"
                  />
                  <ChartText
                    {...fitLabel((px(0) + px(d)) / 2, `In all: ${total}`, chart.value, w)}
                    y={bracketY + 18}
                    fontSize={chart.value}
                    fontWeight="600"
                  >
                    {`In all: ${total}`}
                  </ChartText>
                </>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `Start ${clock(sh, sm)}, end ${clock(eh, em)}: ${d} minutes` +
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
