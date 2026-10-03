/**
 * HC180 `oneLine` (OneLineSpec in typesHe4m.ts): a radial power system's one-line diagram and,
 * under it, its reactance diagram. Above: the generator (a circle with ~), transformers (two
 * linked circles) and lines between buses (thick bars), a load arrow off the last bus, the
 * fault bolt on the faulted bus, each element written with its jX in pu. Below: V_f behind the
 * reactances in series to the fault, summed to X_th; for a line-to-ground fault the positive,
 * negative and zero sequence networks in series. Flat, as a schematic is.
 */
import type { ReactElement } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { OneLineSpec } from '@/data/modules/typesHe4m';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel } from './common';
import { n3, useFields } from './he4mKit';

const H = 278;

export function OneLine({ spec, calc }: { spec: OneLineSpec; calc: Calculator }) {
  const c = usePalette();
  const { get, say } = useFields(calc);
  const els = spec.elements;
  const xs = els.map((e) => get(e.x));
  const fb = Math.min(els.length, Math.max(1, spec.faultBus ?? els.length));
  // The reactances between the source and the fault: the elements before the faulted bus.
  const upTo = xs.slice(0, fb);
  const allX = upTo.every((x) => x !== undefined) && upTo.length > 0;
  const slg = spec.fault === 'slg';
  const vf = get(spec.vf);
  const xthGiven = get(spec.xth);
  const xth = xthGiven ?? (allX ? (upTo as number[]).reduce((a, b) => a + b, 0) : undefined);
  const seq = spec.sequence
    ? [get(spec.sequence.x1), get(spec.sequence.x2), get(spec.sequence.x0)]
    : undefined;
  const seqSum =
    seq && seq.every((x) => x !== undefined)
      ? (seq as number[]).reduce((a, b) => a + b, 0)
      : undefined;
  const If =
    get(spec.current) ??
    (vf === undefined
      ? undefined
      : slg
        ? seqSum && seqSum > 0
          ? (3 * vf) / seqSum
          : undefined
        : xth && xth > 0
          ? vf / xth
          : undefined);
  const S = get(spec.base?.s);
  const V = get(spec.base?.v);
  const Ibase = get(spec.base?.iBase) ?? (S && V ? (S * 1000) / (Math.sqrt(3) * V) : undefined);
  const jx = (i: number) => (xs[i] === undefined ? '' : `j${say(els[i]!.x, xs[i]!)}`);

  const lines: string[] = [];
  if (!slg) {
    if (allX && xth !== undefined)
      lines.push(
        upTo.length === 1
          ? `X_th = ${say(spec.xth, xth)} pu: the source’s own reactance is all there is between it and the fault.`
          : `X_th = ${upTo.map((x, i) => say(els[i]!.x, x!)).join(' + ')} = ${say(spec.xth, xth)} pu, the reactances from the source to the fault in series.`,
      );
    if (vf !== undefined && xth !== undefined && If !== undefined)
      lines.push(
        `I_f = V_f ÷ X_th = ${say(spec.vf, vf)} ÷ ${say(spec.xth, xth)} = ${say(spec.current, If)} pu.`,
      );
  } else if (seq) {
    if (vf !== undefined && seqSum !== undefined && If !== undefined)
      lines.push(
        `I_a = 3 × V_f ÷ (X₁ + X₂ + X₀) = 3 × ${say(spec.vf, vf)} ÷ (${seq.map((x, i) => say([spec.sequence!.x1, spec.sequence!.x2, spec.sequence!.x0][i], x!)).join(' + ')}) = ${say(spec.current, If)} pu: the three sequence networks carry one current in series.`,
      );
    else lines.push('Type V_f and the three sequence reactances to find the fault current.');
  }
  if (If !== undefined && Ibase !== undefined && S !== undefined && V !== undefined) {
    const iKA = get(spec.base?.iKA) ?? (If * Ibase) / 1000;
    lines.push(
      `I_base = S_base ÷ (√3 V_base) = ${say(spec.base!.s, S)} ÷ (√3 × ${say(spec.base!.v, V)}) = ${say(spec.base?.iBase, Ibase)} A, so I_f = ${n3(If)} × ${n3(Ibase)} A = ${say(spec.base?.iKA, iKA)} kA.`,
    );
    if (!slg && spec.base?.mva)
      lines.push(
        `The fault MVA is I_f × S_base = ${n3(If)} × ${say(spec.base.s, S)} = ${say(spec.base.mva, get(spec.base.mva) ?? If * S)} MVA.`,
      );
  }
  if (!lines.length) lines.push('Type the reactances to sum them to the fault.');

  return (
    <View>
      <Canvas aspect={(w) => H / w}>
        {({ w, h }) => {
          const L = 30;
          const Rm = 50;
          const n = els.length;
          const u = (w - L - Rm) / n;
          const cy = 62;
          const busH = 44;
          const busX = (i: number) => L + u * (i + 1);
          const elX = (i: number) => L + u * i + u * 0.5;
          const parts: ReactElement[] = [];
          const wire = { stroke: c.chartInk, strokeWidth: chart.stroke };
          els.forEach((e, i) => {
            const x = elX(i);
            const x0 = i === 0 ? L : busX(i - 1);
            const x1 = busX(i);
            const key = `el${i}`;
            if (e.type === 'generator' || e.type === 'source') {
              const r = 15;
              parts.push(
                <G key={key}>
                  <Line x1={x + r} x2={x1} y1={cy} y2={cy} {...wire} />
                  <Circle cx={x} cy={cy} r={r} fill={c.background} {...wire} />
                  <Path
                    d={`M ${x - 8} ${cy} C ${x - 5} ${cy - 7}, ${x - 1} ${cy - 7}, ${x} ${cy} S ${x + 5} ${cy + 7}, ${x + 8} ${cy}`}
                    fill="none"
                    stroke={c.chartInk}
                    strokeWidth={1.6}
                  />
                  {i > 0 ? <Line x1={x0} x2={x - r} y1={cy} y2={cy} {...wire} /> : null}
                </G>,
              );
            } else if (e.type === 'transformer') {
              const r = 11;
              parts.push(
                <G key={key}>
                  <Line x1={x0} x2={x - 1.6 * r} y1={cy} y2={cy} {...wire} />
                  <Line x1={x + 1.6 * r} x2={x1} y1={cy} y2={cy} {...wire} />
                  <Circle cx={x - 0.6 * r} cy={cy} r={r} fill="none" {...wire} />
                  <Circle cx={x + 0.6 * r} cy={cy} r={r} fill="none" {...wire} />
                </G>,
              );
            } else {
              parts.push(
                <G key={key}>
                  <Line x1={x0} x2={x1} y1={cy} y2={cy} {...wire} />
                  {/* A line's length: two hatch marks across it. */}
                  <Line x1={x - 5} x2={x - 1} y1={cy + 6} y2={cy - 6} {...wire} />
                  <Line x1={x + 1} x2={x + 5} y1={cy + 6} y2={cy - 6} {...wire} />
                </G>,
              );
            }
            if (e.name)
              parts.push(
                <ChartText key={`${key}n`} x={x} y={cy - 26} textAnchor="middle" fontWeight="700">
                  {e.name}
                </ChartText>,
              );
            if (xs[i] !== undefined)
              parts.push(
                <ChartText
                  key={`${key}x`}
                  x={x}
                  y={cy + 36}
                  textAnchor="middle"
                  fill={c.he4mReactance}
                >
                  {`${jx(i)} pu`}
                </ChartText>,
              );
          });
          // The buses, the load and the fault.
          const fx = busX(fb - 1);
          const last = busX(n - 1);
          const bolt = `M ${fx} ${cy + busH / 2} L ${fx + 7} ${cy + busH / 2 + 10} L ${fx - 3} ${cy + busH / 2 + 15} L ${fx + 6} ${cy + busH / 2 + 28}`;
          const tipY = cy + busH / 2 + 28;
          // The reactance diagram.
          const top = 184;
          const ref = 252;
          const boxes = slg
            ? (['X₁', 'X₂', 'X₀'] as const).map((name, i) => ({
                name,
                x: seq?.[i],
                v: [spec.sequence?.x1, spec.sequence?.x2, spec.sequence?.x0][i],
              }))
            : els.slice(0, fb).map((e, i) => ({ name: e.name ?? '', x: xs[i], v: e.x }));
          const sx0 = L + 46;
          const sx1 = w - 40;
          const bw = Math.min(54, ((sx1 - sx0) / boxes.length) * 0.6);
          const step = (sx1 - sx0) / boxes.length;
          return (
            <Svg width={w} height={h}>
              {parts}
              {Array.from({ length: n }, (_, i) => (
                <Line
                  key={`bus${i}`}
                  x1={busX(i)}
                  x2={busX(i)}
                  y1={cy - busH / 2}
                  y2={cy + busH / 2}
                  stroke={c.chartInk}
                  strokeWidth={5}
                />
              ))}
              {spec.load !== false ? (
                <G>
                  <Line x1={last} x2={last + 30} y1={cy - 12} y2={cy - 12} {...wire} />
                  <Path
                    d={`M ${last + 24} ${cy - 18} L ${last + 34} ${cy - 12} L ${last + 24} ${cy - 6} Z`}
                    fill={c.chartInk}
                  />
                  <ChartText x={last + 8} y={cy - 22} fill={c.chartMuted}>
                    Load
                  </ChartText>
                </G>
              ) : null}
              {spec.fault ? (
                <G>
                  <Path
                    d={bolt}
                    fill="none"
                    stroke={c.he4mFault}
                    strokeWidth={3}
                    strokeLinejoin="round"
                  />
                  {slg ? (
                    <G>
                      <Line x1={fx - 9} x2={fx + 15} y1={tipY + 2} y2={tipY + 2} {...wire} />
                      <Line x1={fx - 5} x2={fx + 11} y1={tipY + 6} y2={tipY + 6} {...wire} />
                      <Line x1={fx - 1} x2={fx + 7} y1={tipY + 10} y2={tipY + 10} {...wire} />
                    </G>
                  ) : null}
                  <ChartText
                    {...fitLabel(fx, slg ? 'a–g fault' : '3φ fault', chart.label, w)}
                    y={tipY + (slg ? 28 : 18)}
                    fontWeight="700"
                    fill={c.he4mFault}
                  >
                    {slg ? 'a–g fault' : '3φ fault'}
                  </ChartText>
                </G>
              ) : null}
              {/* Reactance diagram: V_f, the reactances in series, the fault to the reference. */}
              <ChartText x={L - 20} y={top - 38} fill={c.chartMuted}>
                {slg ? 'Sequence networks in series' : 'Reactance diagram'}
              </ChartText>
              <Line x1={L} x2={sx1} y1={ref} y2={ref} {...wire} />
              <Line x1={L} x2={L} y1={top} y2={ref - 32} {...wire} />
              <Line x1={L} x2={L} y1={ref} y2={ref - 4} {...wire} />
              <Circle cx={L} cy={ref - 18} r={14} fill={c.background} {...wire} />
              <ChartText x={L} y={ref - 14} textAnchor="middle" fontSize={chart.small + 1}>
                ~
              </ChartText>
              <ChartText x={L + 20} y={ref - 12} fontStyle="italic">
                {vf === undefined ? 'V_f' : `V_f = ${say(spec.vf, vf)}`}
              </ChartText>
              <Line x1={L} x2={sx0} y1={top} y2={top} {...wire} />
              {boxes.map((b, i) => {
                const bx = sx0 + step * i + (step - bw) / 2;
                return (
                  <G key={`box${i}`}>
                    <Line x1={sx0 + step * i} x2={bx} y1={top} y2={top} {...wire} />
                    <Line x1={bx + bw} x2={sx0 + step * (i + 1)} y1={top} y2={top} {...wire} />
                    <Rect
                      x={bx}
                      y={top - 8}
                      width={bw}
                      height={16}
                      fill={c.background}
                      stroke={c.he4mReactance}
                      strokeWidth={chart.stroke}
                    />
                    <ChartText x={bx + bw / 2} y={top - 14} textAnchor="middle" fontWeight="700">
                      {b.name}
                    </ChartText>
                    {b.x !== undefined ? (
                      <ChartText
                        x={bx + bw / 2}
                        y={top + 24}
                        textAnchor="middle"
                        fill={c.he4mReactance}
                      >
                        {`j${say(b.v, b.x)}`}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {/* The fault: the far end down to the reference. */}
              <Path
                d={`M ${sx1} ${top} L ${sx1} ${top + 18} L ${sx1 + 7} ${top + 28} L ${sx1 - 3} ${top + 33} L ${sx1} ${ref}`}
                fill="none"
                stroke={c.he4mFault}
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
              <ChartText x={sx1 + 6} y={top - 4} fontWeight="700">
                F
              </ChartText>
              {If !== undefined ? (
                <G>
                  <Path
                    d={`M ${L + 18} ${top - 5} L ${L + 28} ${top} L ${L + 18} ${top + 5} Z`}
                    fill={c.he4mFault}
                  />
                  <ChartText x={L + 4} y={top + 20} fill={c.he4mFault} fontWeight="700">
                    {`${slg ? 'I_a1' : 'I_f'} = ${n3(slg ? If / 3 : If)}`}
                  </ChartText>
                </G>
              ) : null}
              {!slg && xth !== undefined ? (
                <ChartText
                  {...fitLabel((sx0 + sx1) / 2, `X_th = j${say(spec.xth, xth)} pu`, chart.label, w)}
                  y={ref - 12}
                  fontWeight="700"
                >
                  {`X_th = j${say(spec.xth, xth)} pu`}
                </ChartText>
              ) : null}
              {slg && seqSum !== undefined ? (
                <ChartText
                  {...fitLabel((sx0 + sx1) / 2, `ΣX = j${n3(seqSum)} pu`, chart.label, w)}
                  y={ref - 12}
                  fontWeight="700"
                >
                  {`ΣX = j${n3(seqSum)} pu`}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
