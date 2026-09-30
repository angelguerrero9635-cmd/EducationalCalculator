import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Rect } from 'react-native-svg';

import type { VennChances } from '@/data/modules/typesHse';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { probText } from './ChanceTree';
import { reader } from './graphKit';
import { usePaintIds } from './paint';
import { vennRegions } from './stats';
import { countText, countsCaption } from './VennCounts';

/** A probability as written: 0.35, 1/6 (see ChanceTree). */
const p4 = probText;

/**
 * A Venn diagram of probabilities (H22), flat: the sample space as a rectangle (probability 1),
 * events A and B as circles, each region labelled with its own probability (A only, both,
 * B only, neither). `shade` lights A ∩ B, A ∪ B, the complement of A, A only, or neither; the
 * caption works it (the addition rule, the complement rule). Mutually exclusive events draw
 * apart, with nothing in common.
 */
export function VennChance({ spec, calc }: { spec: VennChances; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ids = usePaintIds('clipA');
  const [A, B, AB] = [read(spec.a), read(spec.b), read(spec.both)];
  // H97: counts out of a total; the regions read as counts, the rules as chances.
  const total = spec.counts ? read(spec.counts.total) : undefined;
  const N = total ? total.value : 1;
  const known = A.known && B.known && AB.known && (!total || total.known);
  const [a, b, both] = [A.value / N, B.value / N, spec.exclusive ? 0 : AB.value / N];
  const say = spec.counts ? (x: number) => countText(x, N) : p4;
  const apart = !!spec.exclusive || both === 0;
  const r = vennRegions(a, b, both);
  const [nA, nB] = spec.names ?? ['A', 'B'];
  const eps = 1e-9;
  const valid =
    [a, b, both].every((x) => x >= -eps && x <= 1 + eps) &&
    both <= Math.min(a, b) + eps &&
    r.union <= 1 + eps;
  const shade = spec.shade;

  const caption = (() => {
    if (spec.counts) return countsCaption(spec, known, valid, a, b, both, N);
    if (!known) return 'Type the probabilities to fill the diagram.';
    if (!valid)
      return `These can't all be true: P(${nA} and ${nB}) is at most the smaller of P(${nA}) and P(${nB}), and everything adds to at most 1.`;
    const parts = [
      `P(${nA}) = ${p4(a)} · P(${nB}) = ${p4(b)} · P(${nA} and ${nB}) = ${p4(both)}`,
      `${nA} only ${p4(a)} − ${p4(both)} = ${p4(r.aOnly)} · ${nB} only ${p4(b)} − ${p4(both)} = ${p4(r.bOnly)}`,
    ];
    if (spec.exclusive)
      parts.push(
        `${nA} and ${nB} can't both happen (mutually exclusive), so P(${nA} or ${nB}) = P(${nA}) + P(${nB})`,
      );
    if (shade === 'and') {
      parts.push(`Shaded: P(${nA} ∩ ${nB}) = ${p4(both)}`);
      if (a > 0)
        parts.push(
          `P(${nB} | ${nA}) = P(${nA} ∩ ${nB}) ÷ P(${nA}) = ${p4(both)} ÷ ${p4(a)} = ${p4(both / a)}`,
        );
    }
    if (shade === 'or')
      parts.push(
        spec.exclusive
          ? `Shaded: P(${nA} ∪ ${nB}) = ${p4(a)} + ${p4(b)} = ${p4(r.union)}`
          : `Shaded: P(${nA} ∪ ${nB}) = P(${nA}) + P(${nB}) − P(${nA} ∩ ${nB}) = ${p4(a)} + ${p4(b)} − ${p4(both)} = ${p4(r.union)}`,
      );
    if (shade === 'notA')
      parts.push(`Shaded: P(not ${nA}) = 1 − P(${nA}) = 1 − ${p4(a)} = ${p4(1 - a)}`);
    if (shade === 'aOnly')
      parts.push(
        `Shaded: P(${nA} and not ${nB}) = P(${nA}) − P(${nA} ∩ ${nB}) = ${p4(a)} − ${p4(both)} = ${p4(r.aOnly)}`,
      );
    if (shade === 'neither')
      parts.push(
        `Shaded: P(neither) = 1 − P(${nA} ∪ ${nB}) = 1 − ${p4(r.union)} = ${p4(r.neither)}`,
      );
    return parts.join(' · ');
  })();

  return (
    <View>
      <Canvas aspect={0.7}>
        {({ w, h }) => {
          const pad = 8;
          const top = 26;
          const box = { x: pad, y: top, w: w - 2 * pad, h: h - top - pad };
          const R = Math.min(box.h * 0.36, box.w * 0.22);
          const cy = box.y + box.h / 2 - 4;
          // Overlapping circles, or apart with a gap when nothing is shared.
          const d = apart ? 2 * R + 18 : R * 1.15;
          const [xA, xB] = [w / 2 - d / 2, w / 2 + d / 2];
          const shadeFill = c.accentSoft;
          const base = c.card;
          const lens = (fill: string) => (
            <G clipPath={`url(#${ids.clipA})`}>
              <Circle cx={xB} cy={cy} r={R} fill={fill} />
            </G>
          );
          const label = (x: number, y: number, text: string, bold = true, fill = c.chartInk) => (
            <ChartText
              x={x}
              y={y}
              fontSize={chart.value}
              fontWeight={bold ? '700' : '400'}
              fill={fill}
              textAnchor="middle"
            >
              {text}
            </ChartText>
          );
          return (
            <Svg width={w} height={h} opacity={known && valid ? 1 : 0.4}>
              <Defs>
                <ClipPath id={ids.clipA}>
                  <Circle cx={xA} cy={cy} r={R} />
                </ClipPath>
              </Defs>
              <Rect x={box.x} y={box.y} width={box.w} height={box.h} fill={base} />
              {/* The shaded region, painted in the shade and covered back where it stops. */}
              {shade === 'and' && !apart ? lens(shadeFill) : null}
              {shade === 'or' ? (
                <G>
                  <Circle cx={xA} cy={cy} r={R} fill={shadeFill} />
                  <Circle cx={xB} cy={cy} r={R} fill={shadeFill} />
                </G>
              ) : null}
              {shade === 'notA' || shade === 'neither' ? (
                <G>
                  <Rect x={box.x} y={box.y} width={box.w} height={box.h} fill={shadeFill} />
                  <Circle cx={xA} cy={cy} r={R} fill={base} />
                  {shade === 'neither' ? <Circle cx={xB} cy={cy} r={R} fill={base} /> : null}
                </G>
              ) : null}
              {shade === 'aOnly' ? (
                <G>
                  <Circle cx={xA} cy={cy} r={R} fill={shadeFill} />
                  {apart ? null : lens(base)}
                </G>
              ) : null}
              <Rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Circle
                cx={xA}
                cy={cy}
                r={R}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
              <Circle
                cx={xB}
                cy={cy}
                r={R}
                fill="none"
                stroke={c.chartSecond}
                strokeWidth={chart.stroke}
              />
              {/* Names over the circles, the whole space in the corner. */}
              <ChartText x={pad} y={16} fontSize={chart.label} fontWeight="700">
                {spec.counts ? `All: ${countText(1, N)}` : 'All outcomes: 1'}
              </ChartText>
              <ChartText
                x={Math.max(box.x + 4, xA - R)}
                y={cy - R - 8}
                fontSize={chart.value}
                fontWeight="700"
                fill={c.chartHighlight}
              >
                {`${nA}: ${say(a)}`}
              </ChartText>
              <ChartText
                x={Math.min(box.x + box.w - 4, xB + R)}
                y={cy - R - 8}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="end"
              >
                {`${nB}: ${say(b)}`}
              </ChartText>
              {/* Each region's own probability. */}
              {label(apart ? xA : xA - R * 0.45, cy + 5, say(r.aOnly))}
              {label(apart ? xB : xB + R * 0.45, cy + 5, say(r.bOnly))}
              {apart ? null : label(w / 2, cy + 5, say(both))}
              {label(box.x + box.w - 44, box.y + box.h - 10, `neither ${say(r.neither)}`, false)}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
