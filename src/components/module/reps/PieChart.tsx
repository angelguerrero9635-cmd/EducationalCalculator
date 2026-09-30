import { View } from 'react-native';
import type { ReactNode } from 'react';
import Svg, { Circle, G, Path, Polyline, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, useResolvedScheme, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';
import { PIE_ICON_W, PieStageIcon } from './pieStageIcon';

type Spec = Extract<Representation, { kind: 'pieChart' }>;

/** A point on a circle at `deg` degrees clockwise from the top. */
const polar = (cx: number, cy: number, r: number, deg: number) => {
  const t = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as const;
};

/** One wedge of the pie, from angle a0 to a1 (degrees, clockwise from the top). */
function wedgePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}

/** Text sizes and line heights of the labels beside the pie. */
const NAME = chart.label;
const VALUE = chart.value;
const LINE = 16;
/** Gap between labels, and the indent of a group's labels under its bracket. */
const GAP = 10;
const INDENT = 16;
/** How far a group's wedges are pulled out of the pie. */
const EXPLODE = 8;

/** Splits a name into lines no wider than `width` px at the label size. */
function wrap(text: string, width: number, size = NAME) {
  const per = Math.max(6, Math.floor(width / (size * 0.6)));
  const lines: string[] = [];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && `${last} ${word}`.length <= per)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

/** Fills for parts whose colors mean nothing but "a different part" (each is named beside it). */
const DEFAULT_FILLS = ['blockBlue', 'chartSecond', 'blockGreen', 'purple', 'orange', 'blockRed'];

/** A part's fill: the palette color the page names for it, or a distinct color of its own. */
function partFill(i: number, colors: string[] | undefined, c: Palette) {
  const all = c as unknown as Record<string, unknown>;
  const named = colors?.[i] !== undefined ? all[colors[i]!] : undefined;
  if (typeof named === 'string') return { fill: named, opacity: 1 };
  return { fill: all[DEFAULT_FILLS[i % DEFAULT_FILLS.length]!] as string, opacity: 0.8 };
}

/**
 * A pie chart: each part is a flat wedge sized by its share of the whole (percents, or counts
 * with a total). The biggest wedge sits on the left with its name inside; every other wedge has
 * a leader line to its name, amount and percent on the right. A `group` (fresh water = frozen +
 * liquid) is pulled out of the pie and bracketed under its own name. The steppers change the
 * parts.
 */
export function PieChart({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const dark = useResolvedScheme() === 'dark';
  const rep = useRep(calc);
  const parts = spec.parts.map((id) => Math.max(0, rep.shown(id)));
  const total = spec.total ? Math.max(0, rep.shown(spec.total)) : 100;
  const known = spec.parts.every(rep.known) && (!spec.total || rep.known(spec.total));
  const sum = parts.reduce((a, b) => a + b, 0);
  const whole = Math.max(total, sum) || 1;
  const fills = spec.parts.map((_, i) => partFill(i, spec.colors, c));
  const pct = (v: number) => `${formatNumber(Math.round((v / whole) * 1000) / 10)}%`;
  // "970 liters · 97%", or "25%" when the parts are percents; "?" when not known yet.
  const amount = (v: number, id: string) =>
    !known ? '?' : spec.total ? `${rep.value(id)} · ${pct(v)}` : pct(v);
  const name = (id: string) => rep.variable(id).name;

  const group = spec.group;
  const inGroup = (i: number) => !!group?.parts.includes(spec.parts[i]!);
  // The largest part outside the group is named inside its wedge.
  const big = parts.reduce(
    (best, v, i) => (!inGroup(i) && (best < 0 || v > parts[best]!) ? i : best),
    -1,
  );

  // Geometry that doesn't depend on the width: the angles, turned so the biggest wedge's
  // middle is on the left (270°) and the others (and the group) face the labels on the right.
  const spans = parts.map((v, i) => {
    const a0 = (parts.slice(0, i).reduce((s, x) => s + x, 0) / whole) * 360;
    return [a0, a0 + (v / whole) * 360] as const;
  });
  const groupIdx = spec.parts.flatMap((_, i) => (inGroup(i) ? [i] : []));
  const turn =
    groupIdx.length > 0
      ? 90 - (spans[groupIdx[0]!]![0] + spans[groupIdx[groupIdx.length - 1]!]![1]) / 2
      : big >= 0
        ? 270 - (spans[big]![0] + spans[big]![1]) / 2
        : 0;
  const wedges = spans.map(([a0, a1], i) => ({ i, a0: a0 + turn, a1: a1 + turn }));

  // The labels in the right column, in clockwise order from the top.
  const outside = wedges
    .filter(({ i }) => i !== big && !inGroup(i))
    .map((wd) => ({ ...wd, mid: (wd.a0 + wd.a1) / 2 }));
  const layout = (w: number) => {
    const r = Math.max(70, Math.min(135, w * 0.27));
    const cx = r + 10;
    const colX = cx + r + EXPLODE + 20;
    const colW = w - colX - 4;
    // H109: a stage icon between the swatch and the name.
    const iconW = spec.stages ? PIE_ICON_W + 4 : 0;
    const label = (id: string, indent = 0) => ({
      lines: wrap(name(id), colW - indent - 16 - iconW),
    });
    const tall = (lines: string[]) => Math.max((lines.length + 1) * LINE, iconW ? 38 : 0);
    const entries: {
      key: string;
      mid: number;
      height: number;
      heading?: { lines: string[]; value: string };
      items: { i: number; lines: string[]; indent: number }[];
    }[] = [];
    for (const wd of outside) {
      const { lines } = label(spec.parts[wd.i]!);
      entries.push({
        key: `w${wd.i}`,
        mid: wd.mid,
        height: tall(lines),
        items: [{ i: wd.i, lines, indent: 0 }],
      });
    }
    if (group && groupIdx.length) {
      const g0 = wedges[groupIdx[0]!]!.a0;
      const g1 = wedges[groupIdx[groupIdx.length - 1]!]!.a1;
      const gv = groupIdx.reduce((s, i) => s + parts[i]!, 0);
      const headLines = wrap(name(group.id), colW);
      const items = groupIdx.map((i) => ({
        i,
        lines: label(spec.parts[i]!, INDENT).lines,
        indent: INDENT,
      }));
      entries.push({
        key: 'group',
        mid: (g0 + g1) / 2,
        heading: {
          lines: headLines,
          value: !known ? '?' : spec.total ? `${rep.value(group.id)} · ${pct(gv)}` : pct(gv),
        },
        height:
          (headLines.length + 1) * LINE +
          GAP / 2 +
          items.reduce((s, it) => s + tall(it.lines) + GAP, -GAP),
        items,
      });
    }
    entries.sort((p, q) => (((p.mid % 360) + 360) % 360) - (((q.mid % 360) + 360) % 360));
    const colH = entries.reduce((s, e) => s + e.height + GAP, -GAP);
    const h = Math.max(2 * r + 24, colH + 20);
    return { r, cx, cy: h / 2, colX, h, entries, iconW, tall };
  };

  return (
    <View>
      <Canvas aspect={(w) => layout(w).h / w}>
        {({ w }) => {
          const { r, cx, cy, colX, h, entries, iconW, tall } = layout(w);
          // Pull the group's wedges out along its middle.
          const g = group && groupIdx.length ? entries.find((e) => e.key === 'group') : undefined;
          const [ex, ey] = g ? polar(0, 0, EXPLODE, g.mid) : [0, 0];
          const shift = (i: number) => (inGroup(i) ? ([ex, ey] as const) : ([0, 0] as const));
          // Stack the column: each entry near its wedge's height, pushed apart, kept inside.
          const want = entries.map((e) => polar(cx, cy, r, e.mid)[1] - e.height / 2);
          const tops: number[] = [];
          entries.forEach((e, k) => {
            const prev = k > 0 ? tops[k - 1]! + entries[k - 1]!.height + GAP : 8;
            tops.push(Math.max(prev, want[k]!));
          });
          const over = tops.length
            ? tops[tops.length - 1]! + entries[entries.length - 1]!.height - (h - 8)
            : 0;
          if (over > 0) for (let k = tops.length - 1; k >= 0; k--) tops[k] = tops[k]! - over;
          for (let k = 0; k < tops.length; k++)
            tops[k] = Math.max(tops[k]!, k > 0 ? tops[k - 1]! + entries[k - 1]!.height + GAP : 8);

          const nodes: ReactNode[] = [];
          const leaders: ReactNode[] = [];
          const swatch = (i: number, x: number, y: number) => (
            <Rect
              key={`s${i}`}
              x={x}
              y={y - 10}
              width={11}
              height={11}
              rx={3}
              fill={fills[i]!.fill}
              fillOpacity={fills[i]!.opacity}
              stroke={c.chartInk}
              strokeWidth={1}
            />
          );
          const partLabel = (i: number, lines: string[], x: number, y: number) => {
            nodes.push(swatch(i, x, y));
            const stage = spec.stages?.[i];
            if (stage)
              nodes.push(<PieStageIcon key={`st${i}`} stage={stage} x={x + 15} y={y - 12} />);
            const tx = x + 16 + iconW;
            lines.forEach((ln, k) =>
              nodes.push(
                <ChartText
                  key={`n${i}-${k}`}
                  x={tx}
                  y={y + k * LINE}
                  fontSize={NAME}
                  fontWeight="700"
                >
                  {ln}
                </ChartText>,
              ),
            );
            nodes.push(
              <ChartText key={`v${i}`} x={tx} y={y + lines.length * LINE} fontSize={VALUE}>
                {amount(parts[i]!, spec.parts[i]!)}
              </ChartText>,
            );
            // A leader from the wedge's rim to the label's swatch.
            const wd = wedges[i]!;
            if (wd.a1 > wd.a0) {
              const mid = (wd.a0 + wd.a1) / 2;
              const [sx, sy] = shift(i);
              const [x1, y1] = polar(cx + sx, cy + sy, r - Math.min(6, r * 0.05), mid);
              const [x2, y2] = polar(cx + sx, cy + sy, r + 8, mid);
              leaders.push(
                <Polyline
                  key={`l${i}`}
                  points={`${x1},${y1} ${x2},${y2} ${x - 4},${y - 4}`}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={1}
                />,
                <Circle key={`d${i}`} cx={x1} cy={y1} r={2} fill={c.chartInk} />,
              );
            }
          };
          entries.forEach((e, k) => {
            let y = tops[k]! + 12;
            if (e.heading) {
              e.heading.lines.forEach((ln, j) =>
                nodes.push(
                  <ChartText
                    key={`gh${j}`}
                    x={colX}
                    y={y + j * LINE}
                    fontSize={VALUE}
                    fontWeight="700"
                  >
                    {ln}
                  </ChartText>,
                ),
              );
              nodes.push(
                <ChartText key="gv" x={colX} y={y + e.heading.lines.length * LINE} fontSize={VALUE}>
                  {e.heading.value}
                </ChartText>,
              );
              y += (e.heading.lines.length + 1) * LINE + GAP / 2;
              // The bracket that holds the group's parts.
              const bTop = y - 12;
              const bBottom = tops[k]! + e.height;
              nodes.push(
                <Path
                  key="gb"
                  d={`M ${colX + 8} ${bTop} H ${colX + 3} V ${bBottom} H ${colX + 8}`}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                />,
              );
            }
            for (const it of e.items) {
              partLabel(it.i, it.lines, colX + it.indent, y);
              y += tall(it.lines) + GAP;
            }
          });

          // The biggest part's name inside its wedge, on a card-colored plate.
          let inside: ReactNode = null;
          if (big >= 0 && parts[big]! > 0) {
            const wd = wedges[big]!;
            const full = wd.a1 - wd.a0 >= 359.99;
            const [px, py] = full ? [cx, cy] : polar(cx, cy, r * 0.5, (wd.a0 + wd.a1) / 2);
            // Name, amount and percent on their own lines, so the plate stays inside the wedge.
            const v = parts[big]!;
            const lines = [
              name(spec.parts[big]!),
              ...(!known ? ['?'] : spec.total ? [rep.value(spec.parts[big]!), pct(v)] : [pct(v)]),
            ];
            const tw = Math.max(...lines.map((l, k) => l.length * (k ? VALUE : NAME))) * 0.6 + 14;
            const th = lines.length * LINE + 8;
            const x = Math.max(cx - r + 6, Math.min(px - tw / 2, cx - tw - 2));
            const stage = spec.stages?.[big];
            inside = (
              <G>
                {stage ? (
                  <PieStageIcon
                    stage={stage}
                    x={x + tw / 2 - PIE_ICON_W / 2}
                    y={py - th / 2 - 36}
                  />
                ) : null}
                <Rect
                  x={x}
                  y={py - th / 2}
                  width={tw}
                  height={th}
                  rx={8}
                  fill={c.card}
                  fillOpacity={dark ? 0.85 : 0.92}
                />
                {lines.map((l, k) => (
                  <ChartText
                    key={k}
                    x={x + tw / 2}
                    y={py - th / 2 + 4 + (k + 1) * LINE - 4}
                    fontSize={k ? VALUE : NAME}
                    fontWeight={k ? '400' : '700'}
                    textAnchor="middle"
                  >
                    {l}
                  </ChartText>
                ))}
              </G>
            );
          }

          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Circle cx={cx} cy={cy} r={r} fill={c.chartSurface} stroke={c.chartGrid} />
              {wedges.map(({ a0, a1, i }) => {
                if (!(a1 > a0)) return null;
                const [sx, sy] = shift(i);
                const common = {
                  fill: fills[i]!.fill,
                  fillOpacity: fills[i]!.opacity,
                  stroke: c.chartInk,
                  strokeWidth: 1,
                };
                return a1 - a0 >= 359.99 ? (
                  <Circle key={i} cx={cx} cy={cy} r={r} {...common} />
                ) : (
                  <Path
                    key={i}
                    d={wedgePath(cx + sx, cy + sy, r, a0, a1)}
                    strokeLinejoin="round"
                    {...common}
                  />
                );
              })}
              {leaders}
              {inside}
              {nodes}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? spec.total
            ? sum === total
              ? `${spec.parts.map((id) => rep.value(id, false)).join(' + ')} = ${rep.value(spec.total)}.`
              : `${spec.parts.map((id) => rep.value(id, false)).join(' + ')} = ${formatNumber(sum)} of ${rep.value(spec.total)}.`
            : `${spec.parts.map((id) => `${rep.value(id, false)}%`).join(' + ')} = ${formatNumber(sum)}% of the whole.`
          : 'Type each part to draw the pie.'}
      </Caption>
      <Steppers
        calc={calc}
        items={spec.parts.map((id) => ({
          var: id,
          steps: [1, 5],
          pin: [...spec.parts.filter((x) => x !== id), ...(spec.total ? [spec.total] : [])],
        }))}
      />
    </View>
  );
}
