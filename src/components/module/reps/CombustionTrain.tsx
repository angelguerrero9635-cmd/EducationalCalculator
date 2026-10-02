/**
 * `combustion` on `reaction` (HC74, `typesHe3e.ts`): combustion analysis. The train is painted
 * in its materials (a glass combustion tube in a furnace with the sample boat, then the H₂O and
 * CO₂ absorbers packed with their granules, each with the mass it gained); under it, flat, the
 * moles of C, H and O as bars with their ratio to C, the CₓHᵧO_z formula worked out from the
 * values and its balanced combustion. The sums are in `moleHe3eMath.ts`.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { CombustionTrain as Spec } from '@/data/modules/typesHe3e';
import { formatNumber, scientific } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { combustion, formulaText, MOLAR } from './moleHe3eMath';
import { Sheen, TopLight, url, usePaintIds } from './paint';

const num = (x: number) =>
  Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-2)
    ? scientific(Number(x.toPrecision(3)))
    : formatNumber(Number(x.toPrecision(3)));

export function CombustionTrain({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const read = reader(useRep(calc));
  const ids = usePaintIds('tube', 'furnace');
  const m = read(spec.sample);
  const co2 = read(spec.co2);
  const h2o = read(spec.h2o);
  const known = m.known && co2.known && h2o.known && co2.value > 0 && h2o.value > 0;
  const k = { ...MOLAR, ...(spec.masses ?? {}) };
  const res = known ? combustion(m.value, co2.value, h2o.value, k) : undefined;
  const fits = !!res && res.mO > -0.01 * m.value;
  const height = 292;

  const art = (w: number): ReactNode => {
    const ty = 70;
    const fx0 = 30;
    const fx1 = fx0 + w * 0.36;
    const gap = 14;
    const aw = (w - 24 - fx1 - 2 * gap) / 2;
    const a1 = fx1 + gap;
    const a2 = a1 + aw + gap;
    const absorber = (x: number, fill: string, key: string) => (
      <G key={key}>
        <Rect x={x} y={ty - 14} width={aw} height={28} rx={8} fill={c.glass} opacity={0.85} />
        {Array.from({ length: Math.max(1, Math.floor((aw - 10) / 7)) }, (_, i) =>
          [-7, 0, 7].map((dy, j) => (
            <Circle
              key={`${i}-${j}`}
              cx={x + 7 + i * 7 + (j % 2) * 3}
              cy={ty + dy}
              r={2.8}
              fill={fill}
              stroke={c.chartMuted}
              strokeWidth={0.4}
            />
          )),
        )}
        <Rect x={x} y={ty - 14} width={aw} height={28} rx={8} fill={url(ids.tube)} />
        <Rect
          x={x}
          y={ty - 14}
          width={aw}
          height={28}
          rx={8}
          fill="none"
          stroke={c.glassEdge}
          strokeWidth={1.2}
        />
      </G>
    );
    // The bars: moles of each element, to one scale.
    const els = res
      ? ([
          ['C', res.nC, 1],
          ['H', res.nH, res.hPerC],
          ['O', Math.max(0, res.nO), Math.max(0, res.oPerC)],
        ] as const)
      : [];
    const most = Math.max(1e-12, ...els.map((e) => e[1]));
    const bx = 30;
    const bMax = w - bx - 168;
    const by = 152;
    return (
      <Svg width={w} height={height}>
        <Defs>
          <Sheen id={ids.tube} vertical strength={0.8} />
          <TopLight id={ids.furnace} />
        </Defs>
        {/* O₂ in, through the furnace, the H₂O absorber, then the CO₂ absorber. */}
        <ChartText x={8} y={ty - 12} fontSize={chart.label} fontWeight="700">
          O₂
        </ChartText>
        <Line x1={6} y1={ty} x2={fx0 - 6} y2={ty} stroke={c.chartInk} strokeWidth={1.6} />
        <Path d={`M ${fx0 - 2} ${ty} l -8 -4.5 l 0 9 z`} fill={c.chartInk} />
        <Rect
          x={fx0 + 6}
          y={ty - 26}
          width={fx1 - fx0 - 12}
          height={52}
          rx={6}
          fill={c.trainFurnace}
        />
        <Rect
          x={fx0 + 6}
          y={ty - 26}
          width={fx1 - fx0 - 12}
          height={52}
          rx={6}
          fill={url(ids.furnace)}
        />
        {/* The heating coil, glowing. */}
        <Path
          d={Array.from({ length: 9 }, (_, i) => {
            const x = fx0 + 14 + (i * (fx1 - fx0 - 28)) / 8;
            return `${i ? 'L' : 'M'} ${x} ${i % 2 ? ty - 20 : ty + 20}`;
          }).join(' ')}
          fill="none"
          stroke={c.trainFlame}
          strokeWidth={1.6}
          opacity={0.8}
        />
        <Rect
          x={fx0}
          y={ty - 8}
          width={fx1 - fx0 + gap}
          height={16}
          rx={7}
          fill={c.glass}
          opacity={0.9}
        />
        <Path
          d={`M ${(fx0 + fx1) / 2 - 14} ${ty - 1} l 28 0 l -4 6 l -20 0 z`}
          fill={c.card}
          stroke={c.chartInk}
          strokeWidth={1}
        />
        <Rect x={(fx0 + fx1) / 2 - 8} y={ty - 5} width={16} height={4} rx={1.5} fill={c.chartInk} />
        <Rect x={fx0} y={ty - 8} width={fx1 - fx0 + gap} height={16} rx={7} fill={url(ids.tube)} />
        <Rect
          x={fx0}
          y={ty - 8}
          width={fx1 - fx0 + gap}
          height={16}
          rx={7}
          fill="none"
          stroke={c.glassEdge}
          strokeWidth={1.2}
        />
        <Line x1={a1 + aw - 2} y1={ty} x2={a2 + 2} y2={ty} stroke={c.glassEdge} strokeWidth={5} />
        {absorber(a1, c.trainWaterTrap, 'w')}
        {absorber(a2, c.trainCarbonTrap, 'c')}
        <Line x1={a2 + aw} y1={ty} x2={w - 4} y2={ty} stroke={c.chartInk} strokeWidth={1.6} />
        <ChartText
          x={(fx0 + fx1) / 2}
          y={ty - 36}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
        >
          {`Sample ${m.known ? `${m.text} g` : '?'}`}
        </ChartText>
        <ChartText
          x={(fx0 + fx1) / 2}
          y={ty + 44}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.chartMuted}
        >
          furnace, O₂ to burn
        </ChartText>
        {[
          [a1, 'H₂O', h2o],
          [a2, 'CO₂', co2],
        ].map(([x, name, r]) => {
          const v = r as typeof m;
          return (
            <G key={String(name)}>
              <ChartText
                x={(x as number) + aw / 2}
                y={ty + 32}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
              >
                {`${name as string} trap`}
              </ChartText>
              <ChartText
                x={(x as number) + aw / 2}
                y={ty + 48}
                fontSize={chart.label}
                textAnchor="middle"
              >
                {v.known ? `+${v.text} g` : '?'}
              </ChartText>
            </G>
          );
        })}
        {/* Moles of each element, and their ratio to C. */}
        {els.map(([el, n, r], i) => {
          const y = by + i * 26;
          return (
            <G key={el}>
              <ChartText x={12} y={y + 5} fontSize={chart.value} fontWeight="700">
                {el}
              </ChartText>
              <Rect
                x={bx}
                y={y - 8}
                width={Math.max(1, (n / most) * bMax)}
                height={16}
                rx={3}
                fill={c.chartHighlight}
                opacity={0.75}
              />
              <ChartText x={w - 12} y={y + 5} fontSize={chart.label} textAnchor="end">
                {`${num(n)} mol · ${i === 0 ? '1' : formatNumber(Number(r.toFixed(2)))}`}
              </ChartText>
            </G>
          );
        })}
        {res?.formula && res.equation && fits ? (
          <G>
            <ChartText x={12} y={by + 92} fontSize={chart.emphasis} fontWeight="700">
              {`Empirical formula ${formulaText(res.formula.x, res.formula.y, res.formula.z)}`}
            </ChartText>
            <ChartText x={12} y={by + 116} fontSize={chart.value}>
              {(() => {
                const [a, b, cc, d] = res.equation;
                const co = (n: number) => (n === 1 ? '' : `${n} `);
                return `${co(a)}${formulaText(res.formula.x, res.formula.y, res.formula.z)} + ${co(b)}O₂ → ${co(cc)}CO₂ + ${co(d)}H₂O`;
              })()}
            </ChartText>
          </G>
        ) : res ? (
          <ChartText x={12} y={by + 92} fontSize={chart.value} fill={c.chartMuted}>
            {fits ? 'No whole-number ratio up to × 6.' : 'C and H weigh more than the sample.'}
          </ChartText>
        ) : null}
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => height / w}>{({ w }) => art(w)}</Canvas>
      <Caption>
        {res
          ? [
              `n(C) = ${co2.text} ÷ ${k.co2} = ${num(res.nC)} mol; n(H) = 2 × ${h2o.text} ÷ ${k.h2o} = ${num(res.nH)} mol.`,
              `m(O) = ${m.text} − ${k.c} × ${num(res.nC)} − ${k.h} × ${num(res.nH)} = ${num(res.mO)} g, so n(O) = ${num(res.nO)} mol.`,
              `Ratio C : H : O = 1 : ${formatNumber(Number(res.hPerC.toFixed(2)))} : ${formatNumber(Number(Math.max(0, res.oPerC).toFixed(2)))}${res.formula ? `, so ${formulaText(res.formula.x, res.formula.y, res.formula.z)}` : ''}.`,
              'All C ends in CO₂ and all H in H₂O; O is the mass left over.',
            ].join(' · ')
          : 'Type the sample’s mass and the CO₂ and H₂O it gave.'}
      </Caption>
    </View>
  );
}
