/**
 * HC80 `dilutionSeries` (college microbiology, round 3 group G): a row of glass test tubes, each
 * diluting the one before by the factor, the culture's tint fading along the row, curved arrows
 * for the volume moved and each tube's dilution under it. A plate count spreads one tube on an
 * agar plate and draws its colonies (up to 300; more is a lawn marked TNTC); a titer lights the
 * positive tubes (clumped, ringed) and names the last one's dilution. A "?" draws nothing for
 * its value.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { DilutionSeriesSpec } from '@/data/modules/typesHe3g';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber, superscript } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { MAX_COLONIES, MAX_TUBES, cfuOf, colonySpots, tubeDilution, tubeOf } from './dilutionMath';
import { fig3 } from './he1dText';
import { MathChip } from './hsdText';
import { Glass, Sheen, TopLight, url, usePaintIds } from './paint';

type Rep = ReturnType<typeof useRep>;

/** "10⁻⁶" for a power of ten, else "1:320". */
export function dilutionLabel(n: number, tens = true): string {
  const e = Math.log10(n);
  return tens && Math.abs(e - Math.round(e)) < 1e-9 && n >= 10
    ? superscript(`10^(−${Math.round(e)})`)
    : `1:${formatNumber(Number(n.toPrecision(6)))}`;
}

export function DilutionSeries({ spec, calc }: { spec: DilutionSeriesSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('glass', 'sheen', 'agar', 'light');
  const num = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const unitOf = (x: NumOrVar | undefined, fallback: string) =>
    (typeof x === 'string' ? rep.variable(x)?.unit : undefined) ?? fallback;
  const factor = num(spec.factor);
  const first = num(spec.first) ?? factor;
  const dilution = num(spec.dilution);
  const plated =
    num(spec.plated) ??
    (dilution !== undefined && first !== undefined && factor !== undefined
      ? tubeOf(dilution, first, factor)
      : undefined);
  const positive = num(spec.positive);
  const titerMode = spec.positive !== undefined || spec.titer !== undefined;
  const tubes = Math.max(
    1,
    Math.min(MAX_TUBES, Math.round(num(spec.tubes) ?? plated ?? (titerMode ? MAX_TUBES : 6))),
  );
  const plate = spec.colonies !== undefined;
  const colonies = num(spec.colonies);
  const volume = num(spec.volume);
  const vUnit = unitOf(spec.volume, 'mL');
  const transfer = num(spec.transfer);
  const tUnit = unitOf(spec.transfer, 'mL');
  const known = factor !== undefined && first !== undefined;

  return (
    <View>
      <Canvas aspect={(w) => (plate ? Math.min(0.95, 330 / w) : Math.min(0.62, 210 / w))}>
        {({ w, h }) => {
          const pitch = Math.min(56, (w - 16) / tubes);
          const x0 = (w - pitch * tubes) / 2 + pitch / 2;
          const tw = Math.min(24, pitch * 0.58);
          const top = 34;
          const bottom = 116;
          const level = top + 26;
          const tx = (k: number) => x0 + (k - 1) * pitch;
          const labels = Array.from({ length: tubes }, (_, i) =>
            known && factor! > 1
              ? dilutionLabel(tubeDilution(i + 1, first!, factor!), factor === 10)
              : '',
          );
          const widest = Math.max(...labels.map((t) => t.length)) * chart.label * 0.6;
          const stagger = widest > pitch - 4;
          const tint = (k: number) =>
            tubes === 1 ? 0.6 : 0.1 + (0.62 * (tubes - k)) / (tubes - 1);
          const lit = (k: number) => positive !== undefined && k <= positive;
          const plateK = plate ? (tubes === 1 ? 1 : plated) : undefined;
          const pr = Math.min(78, (h - 196) / 2);
          const pcx = plateK ? Math.min(w - pr - 8, Math.max(pr + 8, w / 2)) : 0;
          const pcy = h - pr - 12;
          const shown = colonies === undefined ? 0 : Math.min(MAX_COLONIES, Math.round(colonies));
          const spots = colonySpots(shown);
          const tntc = colonies !== undefined && colonies > MAX_COLONIES;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Glass id={ids.glass} />
                <Sheen id={ids.sheen} strength={0.8} />
                <TopLight id={ids.light} />
              </Defs>
              {/* Transfer arrows between neighbours, the volume on the first. */}
              {Array.from({ length: tubes - 1 }, (_, i) => {
                const [a, b] = [tx(i + 1), tx(i + 2)];
                return (
                  <G key={`t${i}`}>
                    <Path
                      d={`M ${a + 2} ${top - 4} Q ${(a + b) / 2} ${top - 22} ${b - 4} ${top - 6}`}
                      stroke={c.chartMuted}
                      strokeWidth={1.5}
                      fill="none"
                    />
                    <Path d={`M ${b - 4} ${top - 6} l -6 -5 l 1 7 z`} fill={c.chartMuted} />
                  </G>
                );
              })}
              {transfer !== undefined && tubes > 1 ? (
                <ChartText
                  x={(tx(1) + tx(2)) / 2}
                  y={top - 20}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight="700"
                  halo
                >
                  {`${formatNumber(transfer)} ${tUnit}`}
                </ChartText>
              ) : null}
              {Array.from({ length: tubes }, (_, i) => {
                const k = i + 1;
                const x = tx(k);
                const left = x - tw / 2;
                const tube = `M ${left} ${top} L ${left} ${bottom - tw / 2} A ${tw / 2} ${tw / 2} 0 0 0 ${left + tw} ${bottom - tw / 2} L ${left + tw} ${top}`;
                const liquid = `M ${left + 1.5} ${level} L ${left + 1.5} ${bottom - tw / 2} A ${tw / 2 - 1.5} ${tw / 2 - 1.5} 0 0 0 ${left + tw - 1.5} ${bottom - tw / 2} L ${left + tw - 1.5} ${level} Z`;
                const on = lit(k);
                return (
                  <G key={`k${k}`}>
                    <Path d={tube} fill={url(ids.glass)} />
                    <Path d={liquid} fill={c.dilution3gBroth} />
                    {known ? (
                      <Path
                        d={liquid}
                        fill={c.dilution3gCulture}
                        opacity={titerMode ? 0.35 : tint(k)}
                      />
                    ) : null}
                    {on
                      ? // Clumps of antibody and antigen settled in a positive tube.
                        [0, 1, 2, 3, 4].map((j) => (
                          <Circle
                            key={j}
                            cx={x + (j - 2) * (tw / 6)}
                            cy={bottom - tw / 2 - 2 - (j % 2) * 4}
                            r={2.2}
                            fill={c.dilution3gClump}
                          />
                        ))
                      : null}
                    <Path d={tube} fill={url(ids.sheen)} />
                    <Path
                      d={tube}
                      stroke={on ? c.chartHighlight : c.glassEdge}
                      strokeWidth={on ? 2.5 : 1.5}
                      fill="none"
                    />
                    <Rect
                      x={left - 2}
                      y={top - 3}
                      width={tw + 4}
                      height={4}
                      rx={2}
                      fill={c.glassEdge}
                    />
                    <ChartText
                      x={x}
                      y={bottom + 16 + (stagger && i % 2 ? 15 : 0)}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fontWeight={plateK === k || on ? '700' : '400'}
                      fill={on ? c.chartHighlight : c.chartInk}
                    >
                      {labels[i]!}
                    </ChartText>
                  </G>
                );
              })}
              {titerMode && positive !== undefined && positive >= 1 && known ? (
                <MathChip
                  x={tx(Math.min(tubes, positive))}
                  y={bottom + (stagger ? 52 : 38)}
                  text={`titer ${formatNumber(tubeDilution(Math.min(tubes, positive), first!, factor!))}`}
                  anchor="middle"
                  color={c.chartHighlight}
                  w={w}
                  h={h}
                />
              ) : null}
              {plateK ? (
                <G>
                  {/* From the plated tube down to the plate, the volume spread. */}
                  <Path
                    d={`M ${tx(plateK)} ${bottom + (stagger ? 36 : 22)} Q ${tx(plateK)} ${pcy - pr - 4} ${pcx} ${pcy - pr - 6}`}
                    stroke={c.chartInk}
                    strokeWidth={1.5}
                    fill="none"
                    strokeDasharray={chart.dash}
                  />
                  <Path d={`M ${pcx} ${pcy - pr - 3} l -5 -7 l 10 0 z`} fill={c.chartInk} />
                  {/* The plate: a glass dish of agar, the colonies on it. */}
                  <Ellipse cx={pcx + 2} cy={pcy + 4} rx={pr + 4} ry={pr + 4} fill={c.shadow} />
                  <Circle
                    cx={pcx}
                    cy={pcy}
                    r={pr + 3}
                    fill={c.glass}
                    stroke={c.glassEdge}
                    strokeWidth={1.5}
                  />
                  <Circle
                    cx={pcx}
                    cy={pcy}
                    r={pr - 1}
                    fill={c.dilution3gAgar}
                    stroke={c.dilution3gAgarEdge}
                  />
                  <Circle cx={pcx} cy={pcy} r={pr - 1} fill={url(ids.light)} />
                  {tntc ? (
                    <Circle
                      cx={pcx}
                      cy={pcy}
                      r={pr * 0.9}
                      fill={c.dilution3gColony}
                      opacity={0.75}
                    />
                  ) : null}
                  {spots.map(([sx, sy], i) => (
                    <Circle
                      key={i}
                      cx={pcx + sx * (pr - 4)}
                      cy={pcy + sy * (pr - 4)}
                      r={shown > 150 ? 1.8 : 2.4}
                      fill={c.dilution3gColony}
                      stroke={c.dilution3gColonyEdge}
                      strokeWidth={0.6}
                    />
                  ))}
                  {tntc ? (
                    <MathChip x={pcx} y={pcy + 5} text="TNTC" anchor="middle" w={w} h={h} />
                  ) : null}
                  {colonies !== undefined && !tntc ? (
                    <MathChip
                      x={pcx + pr + 10}
                      y={pcy - 8}
                      text={`${formatNumber(colonies)} colonies`}
                      anchor="start"
                      w={w}
                      h={h}
                    />
                  ) : null}
                  {volume !== undefined ? (
                    <MathChip
                      x={pcx - pr - 10}
                      y={pcy - pr + 14}
                      text={`${formatNumber(volume)} ${vUnit} plated`}
                      anchor="end"
                      bold={false}
                      w={w}
                      h={h}
                    />
                  ) : null}
                </G>
              ) : null}
              {plate && tubes === 1 && num(spec.recovery) !== undefined ? (
                <ChartText
                  x={tx(1) + tw / 2 + 8}
                  y={level + 14}
                  fontSize={chart.label}
                  fontWeight="700"
                >
                  {`${formatNumber(num(spec.recovery)!)} ${unitOf(spec.recovery, vUnit)} in the tube`}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {captionOf(spec, rep, {
          factor,
          first,
          dilution,
          plated,
          colonies,
          volume,
          vUnit,
          positive,
          num,
        })}
      </Caption>
    </View>
  );
}

function captionOf(
  spec: DilutionSeriesSpec,
  rep: Rep,
  x: {
    factor?: number;
    first?: number;
    dilution?: number;
    plated?: number;
    colonies?: number;
    volume?: number;
    vUnit: string;
    positive?: number;
    num: (x: NumOrVar | undefined) => number | undefined;
  },
): string {
  const out: string[] = [];
  const f = (v: number) => formatNumber(Number(v.toPrecision(4)));
  if (x.factor !== undefined && x.factor > 1)
    out.push(
      x.factor === 10
        ? 'Each tube is a 1:10 dilution of the one before (1 part into 9 parts of broth).'
        : `Each tube is a 1:${f(x.factor)} dilution of the one before.`,
    );
  if (spec.titer !== undefined || spec.positive !== undefined) {
    if (x.positive !== undefined && x.first !== undefined && x.factor !== undefined)
      out.push(
        `Positive through tube ${f(x.positive)}: titer = ${f(x.first)} × ${superscript(`${f(x.factor)}^${f(x.positive - 1)}`)} = ${f(tubeDilution(x.positive, x.first, x.factor))} (1:${f(tubeDilution(x.positive, x.first, x.factor))}).`,
      );
    else out.push('Type the positive tubes to find the titer.');
  }
  const recovery = x.num(spec.recovery);
  if (spec.colonies !== undefined) {
    if (x.colonies === undefined || x.volume === undefined)
      out.push('Type the colonies and the volume plated.');
    else if (recovery !== undefined)
      out.push(
        `Cells in the tube = colonies × tube volume ÷ volume plated = ${f(x.colonies)} × ${f(recovery)} ÷ ${f(x.volume)} = ${fig3((x.colonies * recovery) / x.volume)}`,
      );
    else if (x.dilution !== undefined) {
      out.push(
        `CFU/mL = colonies ÷ (dilution × volume) = ${f(x.colonies)} ÷ (${fig3(x.dilution)} × ${f(x.volume)}) = ${fig3(cfuOf(x.colonies, x.dilution, x.volume))} CFU/${x.vUnit}`,
      );
      if (x.colonies > MAX_COLONIES)
        out.push('Too many to count (TNTC): count a plate further along the row.');
      else if (x.colonies < 30)
        out.push('Fewer than 30 colonies: count a plate nearer the start for a reliable number.');
    }
  }
  void rep;
  return out.join(' · ');
}
