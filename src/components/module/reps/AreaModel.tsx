import { View } from 'react-native';
import Svg, { G, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { placeParts } from '@/data/modules/helpers';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, useTone } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { DimLine, textW } from './dimKit';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'areaModel' }>;

/** What the boxes show, whichever way the module gave it. */
interface Model {
  top: string[];
  side: string[];
  /** Sizes for the widths and heights (the bigger part bigger). */
  topSize: number[];
  sideSize: number[];
  /** Box (i across, j down): the multiplication on one line, the product under it. */
  box: (i: number, j: number) => [string, string];
  caption: string;
  /** A narrow box after the last column: what is left over in a division. */
  remainder?: string;
  steppers: string[];
  faded: boolean;
  /** The top parts are place values (their columns are tinted and named by place). */
  places?: boolean;
}

/** A number without floating-point dust: 0.1 × 0.3 is 0.03. */
const fmt = (x: number) => formatNumber(Number(x.toFixed(9)));

function modelOf(spec: Spec, rep: ReturnType<typeof useRep>): Model {
  const val = (id: string) => (rep.known(id) ? Math.max(0, rep.shown(id)) : 0);
  if ('factors' in spec) {
    const [a, b] = spec.factors.map(val) as [number, number];
    const known = spec.factors.every(rep.known);
    const tops = placeParts(a, 4);
    const sides = placeParts(b, 4);
    const products = sides.flatMap((s) => tops.map((t) => t * s));
    // A "?" factor is labelled "?", never drawn as 0.
    const factorText = (i: 0 | 1, x: number) => (rep.known(spec.factors[i]) ? fmt(x) : '?');
    return {
      top: tops.map((t) => factorText(0, t)),
      side: sides.map((s) => factorText(1, s)),
      topSize: tops,
      sideSize: sides,
      box: (i, j) => [`${fmt(tops[i]!)} × ${fmt(sides[j]!)}`, fmt(tops[i]! * sides[j]!)],
      caption: !known
        ? 'Type both factors.'
        : products.length === 1
          ? `${fmt(a)} × ${fmt(b)} = ${rep.value(spec.total)}.`
          : `${fmt(a)} × ${fmt(b)}: ${products.map(fmt).join(' + ')} = ${rep.value(spec.total)}.`,
      steppers: [...spec.factors],
      faded: !known,
      places: true,
    };
  }
  if ('divide' in spec) {
    const d = spec.divide;
    const [n, s, q] = [val(d.dividend), val(d.divisor), val(d.quotient)];
    const r = d.remainder ? val(d.remainder) : 0;
    // A quotient cleared (a dividend the range can't take) counts as unknown too: the model
    // then shows "?" rather than a quotient of 0.
    const known = [d.dividend, d.divisor, d.quotient].every(rep.known);
    if (!known) {
      return {
        top: ['?'],
        side: [rep.known(d.divisor) ? fmt(s) : '?'],
        topSize: [1],
        sideSize: [1],
        box: () => ['?', '?'],
        caption: 'Type the dividend and the divisor.',
        steppers: [d.dividend, d.divisor],
        faded: true,
      };
    }
    // Fewer than one full group (1 ÷ 2): no group boxes, only what is left over.
    const parts = q > 0 ? placeParts(q, 4) : [];
    const amounts = parts.map((p) => p * s);
    const left = r ? ` + ${fmt(r)} left over` : '';
    const rest = r ? `, remainder ${fmt(r)}` : '';
    return {
      top: parts.map(fmt),
      side: [fmt(s)],
      topSize: parts,
      sideSize: [1],
      box: (i) => [`${fmt(s)} × ${fmt(parts[i]!)}`, fmt(amounts[i]!)],
      remainder: d.remainder ? fmt(r) : undefined,
      caption:
        parts.length <= 1
          ? // One group of boxes: no "= parts" step to add up.
            `${fmt(s)} × ${fmt(q)}${left} = ${fmt(n)}. ${fmt(n)} ÷ ${fmt(s)} = ${fmt(q)}${rest}.`
          : `${amounts.map(fmt).join(' + ')}${left} = ${fmt(n)}. ` +
            `${fmt(n)} ÷ ${fmt(s)} = ${fmt(q)}${rest}: ${parts.map(fmt).join(' + ')}.`,
      steppers: [d.dividend, d.divisor],
      faded: false,
      places: true,
    };
  }
  return {
    top: spec.top.map((id) => rep.value(id)),
    side: spec.side.map((id) => rep.value(id)),
    topSize: spec.top.map(val),
    sideSize: spec.side.map(val),
    box: (i, j) => {
      const id = spec.parts[j]?.[i];
      return id
        ? [`${rep.value(spec.top[i]!)} × ${rep.value(spec.side[j]!)}`, rep.value(id)]
        : ['', ''];
    },
    caption: `${spec.parts.flatMap((row) => row.map((id) => rep.value(id))).join(' + ')} = ${rep.value(spec.total)}.`,
    steppers: [...spec.top, ...spec.side],
    faded: ![...spec.top, ...spec.side].every(rep.known),
  };
}

/** The place of a part's leading digit: 40 → 1 (tens), 0.3 → −1 (tenths). */
const placeOf = (x: number) => {
  if (!(x > 0)) return undefined;
  const p = Math.floor(Math.log10(x) + 1e-9);
  // Only a single digit in its place (40, 0.3): the rest lumped together (99) has no one place.
  const digit = x / 10 ** p;
  return Math.abs(digit - Math.round(digit)) < 1e-6 ? p : undefined;
};
const PLACE_NAMES: Record<number, string> = {
  4: 'ten thousands',
  3: 'thousands',
  2: 'hundreds',
  1: 'tens',
  0: 'ones',
  [-1]: 'tenths',
  [-2]: 'hundredths',
  [-3]: 'thousandths',
};
/** Which card tone tints each place (the same place is the same colour on every page). */
const PLACE_TONE: Record<number, number> = {
  4: 5,
  3: 4,
  2: 2,
  1: 0,
  0: 1,
  [-1]: 3,
  [-2]: 5,
  [-3]: 6,
};

/**
 * The area model, flat: one factor broken into place-value parts along the top, the other down
 * the side, and each part product in its box, the multiplication on one line (chart.label)
 * over the product (chart.emphasis). Each column is tinted by its place, named over its
 * dimension line ("tens", "ones"); the parts' values sit on dimension lines with end ticks.
 * Boxes are drawn wide enough to read, not to scale (a textbook area model), with the bigger
 * part bigger. For a division the divisor is down the side, the partial quotients along the
 * top and the remainder in a dashed box beside, tagged "left over".
 */
export function AreaModel({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const m = modelOf(spec, rep);
  // One hook call per tone, always the same seven.
  const tones = [
    useTone(0),
    useTone(1),
    useTone(2),
    useTone(3),
    useTone(4),
    useTone(5),
    useTone(6),
  ];
  // Widths: each part gets at least 36% so its label fits at a readable size; the rest by size.
  const share = (xs: number[]) => {
    const sum = xs.reduce((a, b) => a + b, 0) || 1;
    const raw = xs.map((x) => Math.max(0.36, x / sum));
    const total = raw.reduce((a, b) => a + b, 0);
    return raw.map((x) => x / total);
  };
  const cols = share(m.topSize);
  const rows = share(m.sideSize);
  // Place names over the columns when the parts are places (not for letters' parts).
  const places = m.places ? m.topSize.map(placeOf) : m.top.map(() => undefined);
  const named = places.some((p) => p !== undefined && PLACE_NAMES[p] !== undefined);
  const top = named ? 50 : 34;
  const bottom = 10;
  const rowH = (w: number) => Math.min(96, Math.max(64, w * 0.2));

  return (
    <View>
      <Canvas aspect={(w) => (top + rowH(w) * m.side.length + bottom) / w}>
        {({ w, h }) => {
          const sideW = Math.max(...m.side.map((s) => textW(s))) + 26;
          const extra = m.remainder !== undefined ? 70 : 0;
          // About 85 % of the width, centred with the side labels.
          const width = Math.min(w - sideW - extra - 16, (w - 16) * 0.86 - extra);
          const left = (w - (sideW + width + extra)) / 2 + sideW;
          const height = h - top - bottom;
          let x = left;
          const xs = cols.map((f) => {
            const at = x;
            x += f * width;
            return [at, f * width] as const;
          });
          let y = top;
          const ys = rows.map((f) => {
            const at = y;
            y += f * height;
            return [at, f * height] as const;
          });
          const fillOf = (i: number) => {
            const p = places[i];
            const k = p !== undefined && PLACE_TONE[p] !== undefined ? PLACE_TONE[p] : i * 2;
            return tones[k % tones.length]!.fg;
          };
          return (
            <Svg width={w} height={h} opacity={m.faded ? 0.4 : 1}>
              {/* Boxes: each column tinted by its place. */}
              {ys.flatMap(([cy, ch], j) =>
                xs.map(([cx, cw], i) => (
                  <G key={`r${i}-${j}`}>
                    <Rect x={cx} y={cy} width={cw} height={ch} fill={c.card} />
                    <Rect
                      x={cx}
                      y={cy}
                      width={cw}
                      height={ch}
                      fill={fillOf(i)}
                      fillOpacity={0.17}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                  </G>
                )),
              )}
              {/* The top parts on dimension lines, their places over them. */}
              {xs.map(([cx, cw], i) => {
                const p = places[i];
                return (
                  <G key={`t${i}`}>
                    <DimLine
                      x1={cx + 3}
                      y1={top - 10}
                      x2={cx + cw - 3}
                      y2={top - 10}
                      side="above"
                      label={m.top[i]!}
                    />
                    {named &&
                    p !== undefined &&
                    PLACE_NAMES[p] &&
                    textW(PLACE_NAMES[p], chart.label) + 4 <= cw ? (
                      <ChartText
                        x={cx + cw / 2}
                        y={top - 34}
                        fontSize={chart.label}
                        fill={fillOf(i)}
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {PLACE_NAMES[p]}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {ys.map(([cy, ch], j) => (
                <DimLine
                  key={`s${j}`}
                  x1={left - 10}
                  y1={cy + 3}
                  x2={left - 10}
                  y2={cy + ch - 3}
                  side="left"
                  label={m.side[j]!}
                />
              ))}
              {ys.flatMap(([cy, ch], j) =>
                xs.map(([cx, cw], i) => {
                  const [times, product] = m.box(i, j);
                  // The multiplication only where it fits at a readable size.
                  const both = textW(times, chart.label) + 10 <= cw && ch >= 44;
                  // The product as big as fits: never under chart.label.
                  const big =
                    [chart.emphasis + 2, chart.emphasis, chart.value].find(
                      (f) => textW(product, f) + 8 <= cw && (f <= chart.emphasis || cw > 90),
                    ) ?? chart.label;
                  return (
                    <G key={`m${i}-${j}`}>
                      {both ? (
                        <ChartText
                          x={cx + cw / 2}
                          y={cy + ch / 2 - 5}
                          fontSize={chart.label}
                          fill={c.chartMuted}
                          textAnchor="middle"
                        >
                          {times}
                        </ChartText>
                      ) : null}
                      <ChartText
                        x={cx + cw / 2}
                        y={cy + ch / 2 + (both ? 14 : 5)}
                        fontSize={big}
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {product}
                      </ChartText>
                    </G>
                  );
                }),
              )}
              {m.remainder !== undefined ? (
                <>
                  <Rect
                    x={x + 10}
                    y={top}
                    width={extra - 10}
                    height={height}
                    fill="none"
                    stroke={c.chartMuted}
                    strokeWidth={chart.stroke}
                    strokeDasharray={chart.dash}
                  />
                  <ChartText
                    x={x + 10 + (extra - 10) / 2}
                    y={top - 14}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    left over
                  </ChartText>
                  <ChartText
                    x={x + 10 + (extra - 10) / 2}
                    y={top + height / 2 + 5}
                    fontSize={chart.emphasis + 2}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {m.remainder}
                  </ChartText>
                </>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{m.caption}</Caption>
      <Steppers
        calc={calc}
        items={m.steppers.map((id, _, all) => ({
          var: id,
          steps: [rep.variable(id).multipleOf ?? rep.variable(id).step ?? 1],
          pin: all.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}
