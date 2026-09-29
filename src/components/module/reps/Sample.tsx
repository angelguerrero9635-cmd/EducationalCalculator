import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { PictureButton, seeded, shuffled } from './chance';

type Spec = Extract<Representation, { kind: 'sample' }>;

/** The most dots drawn: one per member of the population. */
export const SAMPLE_MAX = 400;

/**
 * A population as a field of dots, one per member, and a random sample of them ringed. With
 * `trait`, the members who have it are colored and "Take a new sample" draws a fresh random
 * sample (setting how many in it have the trait); without it only the sample's members show
 * whether they have it, as in a real survey. The caption scales the sample up to the
 * population.
 */
export function Sample({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const count = (id: string | undefined, max: number) =>
    id && rep.known(id) ? Math.max(0, Math.min(max, Math.round(rep.shown(id)))) : undefined;
  const N = count(spec.population, SAMPLE_MAX) ?? 0;
  const n = count(spec.size, N) ?? 0;
  const T = count(spec.trait, N);
  // The sample's members who have the trait; with the population's count known, no more than
  // there are (and no fewer than the sample leaves).
  const kRaw = count(spec.found, n);
  const k =
    kRaw === undefined
      ? undefined
      : T === undefined
        ? kRaw
        : Math.max(n - (N - T), Math.min(T, kRaw));
  // The sample a "Take a new sample" drew, kept while its count still matches.
  const [drawn, setDrawn] = useState<{ seed: number; picks: number[]; k: number } | null>(null);
  const [seed, setSeed] = useState(1);
  const [yes, no] = spec.labels ?? ['have it', 'do not'];

  // Who has the trait: the first T of a fixed random order (the same population every time).
  const order = shuffled(N, 11);
  const has = new Set(T === undefined ? [] : order.slice(0, T));
  // The sample: the drawn one when it still fits, else k members with the trait and n − k
  // without, picked at random.
  const picks = (() => {
    if (drawn && drawn.k === k && drawn.picks.length === n && drawn.picks.every((i) => i < N))
      return drawn.picks;
    const mix = shuffled(N, 101 + seed);
    if (T === undefined || k === undefined) return mix.slice(0, n);
    const inTrait = mix.filter((i) => has.has(i)).slice(0, k);
    const outTrait = mix.filter((i) => !has.has(i)).slice(0, n - k);
    return [...inTrait, ...outTrait];
  })();
  const inSample = new Set(picks);
  // Without the population's count, the first k of the sample are the ones who have it.
  const sampleHas = new Set(
    T === undefined ? picks.slice(0, k ?? 0) : picks.filter((i) => has.has(i)),
  );
  const known = [spec.population, spec.size, spec.found].every((id) => rep.known(id));
  const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);

  const newSample = () => {
    const next = seed + 1;
    setSeed(next);
    const fresh = shuffled(N, 5000 + next).slice(0, n);
    const found = fresh.filter((i) => has.has(i)).length;
    setDrawn({ seed: next, picks: fresh, k: found });
    calc.set({
      ...rep.pin([spec.population, spec.size, ...(spec.trait ? [spec.trait] : [])]),
      [spec.found]: found,
    });
  };

  const e = spec.estimate;
  const exact = N && n ? (N * (k ?? 0)) / n : undefined;
  const estimateLine =
    e && k !== undefined && n > 0
      ? `${sym(e)} = ${sym(spec.found)} ÷ ${sym(spec.size)} × ${sym(spec.population)} = ${k} ÷ ${n} × ${N} ${
          rep.known(e) && exact !== undefined && Math.abs(rep.shown(e) - exact) > 1e-9 ? '≈' : '='
        } ${rep.value(e)}`
      : undefined;

  return (
    <View>
      <Canvas aspect={0.78}>
        {({ w, h }) => {
          const legendH = 26;
          const areaH = h - legendH - 8;
          const cols = Math.max(1, Math.ceil(Math.sqrt((Math.max(N, 1) * w) / areaH)));
          const rows = Math.max(1, Math.ceil(Math.max(N, 1) / cols));
          const cw = (w - 8) / cols;
          const ch = areaH / rows;
          const r = Math.max(2, Math.min(7, Math.min(cw, ch) * 0.3));
          // A little jitter so the field reads as people, not a chart.
          const jit = seeded(7);
          const at = Array.from({ length: N }, (_, i) => ({
            x: 4 + ((i % cols) + 0.5 + (jit() - 0.5) * 0.3) * cw,
            y: 4 + (Math.floor(i / cols) + 0.5 + (jit() - 0.5) * 0.3) * ch,
          }));
          const legend = [
            { x: 10, fill: c.chartHighlight, ring: false, text: yes },
            { x: w * 0.36, fill: c.chartFill, ring: false, text: no },
            { x: w * 0.66, fill: 'none', ring: true, text: 'in the sample' },
          ];
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              {at.map((p, i) => {
                const shown = T !== undefined || inSample.has(i);
                const colored = T !== undefined ? has.has(i) : sampleHas.has(i);
                return (
                  <Circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={r}
                    fill={colored ? c.chartHighlight : c.chartFill}
                    stroke={colored ? c.chartHighlight : c.chartMuted}
                    strokeWidth={1}
                    // The sample stands out; the rest of the population steps back.
                    opacity={inSample.has(i) ? 1 : shown ? 0.55 : 0.35}
                  />
                );
              })}
              {picks.map((i) => (
                <Circle
                  key={`s${i}`}
                  cx={at[i]!.x}
                  cy={at[i]!.y}
                  r={r + 2.5}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
              ))}
              {legend.map((g) => (
                <G key={g.text}>
                  <Circle
                    cx={g.x + 6}
                    cy={h - legendH / 2}
                    r={g.ring ? 7 : 5}
                    fill={g.fill}
                    stroke={g.ring ? c.chartInk : c.chartMuted}
                    strokeWidth={g.ring ? chart.strokeLight : 1}
                  />
                  <ChartText x={g.x + 17} y={h - legendH / 2 + 4} fontSize={chart.small}>
                    {g.text}
                  </ChartText>
                </G>
              ))}
            </Svg>
          );
        }}
      </Canvas>
      {spec.trait ? (
        <PictureButton testID="sample-new" label="Take a new sample" onPress={newSample} />
      ) : null}
      <Caption>
        {[
          `Population ${rep.label(spec.population)}, sample ${rep.label(spec.size)} picked at random.`,
          k !== undefined && n > 0
            ? `In the sample ${rep.label(spec.found)} ${yes}: ${k}/${n} = ${formatNumber(
                Number(((100 * k) / n).toFixed(1)),
              )}%`
            : `In the sample: ${rep.named(spec.found)}`,
          estimateLine,
          spec.trait && T !== undefined
            ? `The real count, which a survey can’t see: ${rep.label(spec.trait)} ${yes}.`
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}
