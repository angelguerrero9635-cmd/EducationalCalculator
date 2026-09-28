import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { Text } from '@/components/Text';
import { chart, font, radius, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, fitLabel, useRep, Caption } from './common';
import { hopArcs } from './hopArcs';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'hops' }>;

const textW = (t: string, size: number) => t.length * size * 0.6;

/**
 * A number line with the hops of a word problem: start at `start`, hop forward (+) or back (−)
 * by each hop's value, and land on `end`. Each hop is drawn one arc per ten (per `tick`) plus
 * the ones, with arrowheads; adding hops are solid in the highlight, taking-away hops dashed in
 * a second color, and a hop over a stretch another hop covers arcs higher. The line is zoomed
 * to the stops. − / + buttons change the start and each hop.
 */
export function Hops({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = [spec.start, ...spec.hops.map((x) => x.var), spec.end];
  /** A hop's direction: fixed, or read from its switch variable. */
  const signOf = (hop: Spec['hops'][number]): number =>
    typeof hop.sign === 'number' ? hop.sign : rep.val(hop.sign) < 0 ? -1 : 1;
  const switches = spec.hops.filter((hop) => typeof hop.sign === 'string');
  const faded = !ids.every(rep.known);
  const signs = spec.hops.map(signOf);
  const stops = spec.hops.reduce(
    (acc, hop, i) => [...acc, acc[acc.length - 1]! + signs[i]! * rep.val(hop.var)],
    [rep.val(spec.start)],
  );
  const tick = spec.tick ?? 10;
  // The line runs over the stops, from the ten (or hundred) below to the one above, half a
  // ten further where a stop sits on that end, inside the lesson's range.
  const low = Math.min(...stops);
  const high = Math.max(...stops);
  const floor = Math.floor(low / tick) * tick;
  const ceil = Math.ceil(high / tick) * tick;
  const lo = Math.min(Math.max(spec.min, floor - (floor === low ? tick / 2 : 0)), low);
  const hi = Math.max(
    Math.min(spec.max, ceil + (ceil === high ? tick / 2 : 0)),
    high,
    lo + 2 * tick,
  );
  const arcs = hopArcs(stops, signs, tick);
  const text = (i: number, size: number) => `${signs[i]! > 0 ? '+' : '−'}${formatSize(size)}`;
  const formatSize = (n: number) => String(Math.round(n * 1e6) / 1e6);

  const layout = (w: number) => {
    const pad = 22;
    const unit = (w - 2 * pad) / (hi - lo);
    const sx = (n: number) => pad + (n - lo) * unit;
    // Arc heights from their widths; a hop over a stretch another hop covers goes a level up,
    // clear of the lower arcs and their labels.
    const base = (a: (typeof arcs)[number]) =>
      Math.min(38, Math.max(16, Math.abs(a.to - a.from) * unit * 0.36));
    const step = Math.max(...arcs.map(base), 12) + 22;
    const lifts = arcs.map((a) => base(a) + a.level * step);
    // Labels on each arc ("−10", "−10", "−10") when they fit and no higher arc lands inside
    // one; otherwise one label for the hop ("+95") in a row above all the arcs.
    const labelSpan = (k: number) => {
      const a = arcs[k]!;
      const mid = (sx(a.from) + sx(a.to)) / 2;
      const half = textW(text(a.hop, Math.abs(a.to - a.from)), chart.label) / 2 + 2;
      return [mid - half, mid + half] as const;
    };
    const perArc = spec.hops.map((_, i) =>
      arcs.every((a, k) => {
        if (a.hop !== i) return true;
        const [l, r] = labelSpan(k);
        if (r - l > Math.abs(a.to - a.from) * unit) return false;
        return !arcs.some(
          (o) => o.level > a.level && [sx(o.from), sx(o.to)].some((x) => x > l - 3 && x < r + 3),
        );
      }),
    );
    const top = Math.max(...lifts, 16);
    // Rows of whole-hop labels above the arcs; hops whose labels would touch take a row each.
    const lanes: { hop: number; row: number; x: number; t: string }[] = [];
    spec.hops.forEach((_, i) => {
      if (perArc[i] || Math.abs(stops[i + 1]! - stops[i]!) < 1e-9) return;
      const t = text(i, Math.abs(stops[i + 1]! - stops[i]!));
      const x = fitLabel((sx(stops[i]!) + sx(stops[i + 1]!)) / 2, t, chart.value, w).x;
      const half = textW(t, chart.value) / 2 + 6;
      let row = 0;
      while (
        lanes.some((l) => l.row === row && Math.abs(l.x - x) < half + textW(l.t, chart.value) / 2)
      )
        row++;
      lanes.push({ hop: i, row, x, t });
    });
    const laneRows = lanes.reduce((m, l) => Math.max(m, l.row + 1), 0);
    // Room above the highest arc for its labels.
    const y = top + 22 + (laneRows ? laneRows * 18 + 4 : 0);
    return { pad, unit, sx, y, lifts, top, perArc, lanes, h: y + 12 + 20 + 22 };
  };

  return (
    <View>
      <Canvas aspect={(w) => layout(w).h / w}>
        {({ w, h }) => {
          const { pad, unit, sx, y, lifts, top, perArc, lanes } = layout(w);
          const minor = tick / 10;
          const ticks = Array.from(
            { length: Math.round((hi - lo) / minor) + 1 },
            (_, i) => lo + i * minor,
          );
          const major = (n: number) => Math.abs(n / tick - Math.round(n / tick)) < 1e-9;
          // Numbers on every 1st, 2nd or 5th major mark, whichever leaves room for the widest.
          const labelEvery =
            [1, 2, 5, 10].find((k) => k * tick * unit >= textW(String(hi), chart.label) + 8) ?? 10;
          // The start and end numbers, bold under their dots; the middle stops lighter. Tick
          // numbers that would touch them are left out.
          const stopLabels = stops.map((n, i) => ({
            n,
            x: sx(n),
            end: i === 0 || i === stops.length - 1,
          }));
          const clashes = (x: number, t: string) =>
            stopLabels.some(
              (s) =>
                Math.abs(s.x - x) <
                (textW(t, chart.label) + textW(String(s.n), chart.emphasis)) / 2 + 4,
            );
          // A stop label that would touch one already placed (the ends first) drops to a
          // second row.
          const order = stopLabels
            .map((_, i) => i)
            .sort((i, k) => Number(stopLabels[k]!.end) - Number(stopLabels[i]!.end));
          const lowered = stopLabels.map(() => false);
          const placed: number[] = [];
          for (const i of order) {
            const s = stopLabels[i]!;
            const size = (k: number) => (stopLabels[k]!.end ? chart.emphasis : chart.value);
            lowered[i] = placed.some(
              (k) =>
                !lowered[k] &&
                Math.abs(stopLabels[k]!.x - s.x) <
                  (textW(String(stopLabels[k]!.n), size(k)) + textW(String(s.n), size(i))) / 2 + 4,
            );
            placed.push(i);
          }
          const colorOf = (i: number) => (signs[i]! > 0 ? c.chartHighlight : c.hopBack);
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
              {ticks.map((n, i) =>
                !major(n) && minor * unit < 4 ? null : (
                  <G key={n}>
                    <Line
                      x1={sx(n)}
                      y1={y - (major(n) ? 7 : 4)}
                      x2={sx(n)}
                      y2={y + (major(n) ? 7 : 4)}
                      stroke={major(n) ? c.chartInk : c.chartMuted}
                      strokeWidth={major(n) ? chart.strokeLight : 1}
                    />
                    {major(n) &&
                    Math.round((n - lo) / tick) % labelEvery === 0 &&
                    !clashes(sx(n), String(n)) ? (
                      <ChartText
                        key={`n${i}`}
                        x={sx(n)}
                        y={y + 24}
                        fontSize={chart.label}
                        fill={c.chartMuted}
                        textAnchor="middle"
                      >
                        {String(n)}
                      </ChartText>
                    ) : null}
                  </G>
                ),
              )}
              {arcs.map((a, k) => {
                const x0 = sx(a.from);
                const x1 = sx(a.to);
                const L = lifts[k]!;
                const mid = (x0 + x1) / 2;
                // A cubic arch (steep sides, round top) peaking L above the line.
                const inset = (x1 - x0) * 0.08;
                const cy = y - (4 / 3) * L;
                const color = colorOf(a.hop);
                // Arrowhead at the landing end, along the curve's last direction.
                const [tx, ty] = [inset, y - cy];
                const len = Math.hypot(tx, ty) || 1;
                const [ux, uy] = [tx / len, ty / len];
                const s = 8;
                const tip = `${x1} ${y - 1}`;
                const back = (side: number) =>
                  `${x1 - ux * s + side * uy * s * 0.5} ${y - 1 - uy * s - side * ux * s * 0.5}`;
                return (
                  <G key={k} opacity={faded ? 0.35 : 1}>
                    <Path
                      d={`M ${x0} ${y} C ${x0 + inset} ${cy} ${x1 - inset} ${cy} ${x1} ${y}`}
                      stroke={color}
                      strokeWidth={chart.stroke + 0.5}
                      strokeDasharray={signs[a.hop]! > 0 ? undefined : chart.dash}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <Path d={`M ${tip} L ${back(1)} L ${back(-1)} Z`} fill={color} />
                    {perArc[a.hop] ? (
                      <ChartText
                        {...fitLabel(mid, text(a.hop, Math.abs(a.to - a.from)), chart.label, w)}
                        y={y - L - 6}
                        fontSize={chart.label}
                        fontWeight="700"
                        fill={color}
                      >
                        {text(a.hop, Math.abs(a.to - a.from))}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {lanes.map((l) => (
                <ChartText
                  key={`h${l.hop}`}
                  x={l.x}
                  y={y - top - 24 - l.row * 18}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                  fill={colorOf(l.hop)}
                  opacity={faded ? 0.35 : 1}
                >
                  {l.t}
                </ChartText>
              ))}
              {stopLabels.map((s, i) => (
                <G key={`s${i}`}>
                  <Circle
                    cx={s.x}
                    cy={y}
                    r={s.end ? 6 : 4.5}
                    fill={s.end ? c.chartInk : c.card}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText
                    {...fitLabel(s.x, String(s.n), s.end ? chart.emphasis : chart.value, w)}
                    y={y + (lowered[i] ? 44 : 25)}
                    fontSize={s.end ? chart.emphasis : chart.value}
                    fontWeight={s.end ? '700' : '600'}
                    fill={s.end ? c.chartInk : c.chartMuted}
                  >
                    {String(s.n)}
                  </ChartText>
                </G>
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{`Start ${rep.label(spec.start, false)}, ${spec.hops
        .map((hop) => `${signOf(hop) > 0 ? 'add' : 'take away'} ${rep.label(hop.var, false)}`)
        .join(', then ')}. End ${rep.label(spec.end, false)}.`}</Caption>
      {switches.length > 0 ? (
        <View style={styles.switches}>
          {switches.map((hop, i) => {
            const id = hop.sign as string;
            const up = signOf(hop) > 0;
            return (
              <Pressable
                key={id}
                testID={`hop-sign-${i}`}
                accessibilityRole="switch"
                accessibilityState={{ checked: up }}
                accessibilityLabel={`${rep.variable(hop.var).name}: ${up ? 'add' : 'take away'}`}
                onPress={() =>
                  calc.set({ ...rep.pin(ids.filter((x) => x !== spec.end)), [id]: up ? -1 : 1 })
                }
                style={[styles.switch, { borderColor: c.border, backgroundColor: c.card }]}
              >
                <Text style={[styles.switchText, { color: c.text }]}>
                  {`${rep.variable(hop.var).name}: ${up ? '+ add' : '− take away'}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <Steppers
        calc={calc}
        items={[spec.start, ...spec.hops.map((x) => x.var)].map((id, _, all) => ({
          var: id,
          steps: [1, 10],
          pin: all.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  switches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  switch: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: space.md,
    borderWidth: 1.5,
    borderRadius: radius.pill,
  },
  switchText: { fontSize: font.body, fontWeight: '600' },
});
