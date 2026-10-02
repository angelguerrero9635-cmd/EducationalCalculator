/**
 * HC43 `gasPiston` `real` (round 3, group G): a van der Waals gas. The molecules have their own
 * volume (gathered, the band of nb at the foot of the gas, to scale with V) and pull on their
 * neighbours (dashed lines, as many as the share of pressure attraction takes away); two gauges
 * on one scale read the ideal pressure nRT ÷ V and the van der Waals pressure. Z is in the
 * caption. A "?" draws nothing for its value.
 */
import { View } from 'react-native';
import Svg, { Defs, G, Line, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { GasPistonSpec } from '@/data/modules/typesHsj';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil, useRep } from './common';
import { Cylinder, Gauge } from './gasHe3gKit';
import { particleCount } from './gasModel';
import { vdw } from './gasPvMath';
import { fig3 } from './he1dText';
import { niceStep } from './hsdGrid';
import { Ball, Glass, Metal, Sheen, usePaintIds } from './paint';

/** R in L·atm/(mol·K), the default for the van der Waals page. */
const R_VDW = 0.08206;

export function GasPistonReal({ spec, calc }: { spec: GasPistonSpec; calc: Calculator }) {
  const real = spec.real!;
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('glass', 'sheen', 'rod', 'ball', 'dial');
  const num = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const R = spec.R ?? R_VDW;
  const [n, V, T, a, b] = [
    num(spec.moles),
    num(spec.volume),
    num(spec.temperature),
    num(real.a),
    num(real.b),
  ];
  const ok = n !== undefined && V !== undefined && T !== undefined && n > 0 && V > 0 && T > 0;
  const g =
    ok && a !== undefined && b !== undefined && V > n * b ? vdw(n, V, T, a, b, R) : undefined;
  const ideal = ok ? (n * R * T) / V : undefined;
  const vUnit =
    (typeof spec.volume === 'string' ? rep.variable(spec.volume)?.unit : undefined) ?? 'L';
  const pUnit =
    (typeof real.pressure === 'string' ? rep.variable(real.pressure)?.unit : undefined) ?? 'atm';
  const count = n !== undefined && n > 0 ? particleCount(n) : 0;
  const pMax = niceCeil(Math.max(1, ideal ?? 0, g?.p ?? 0) * 1.1);
  const lost = g && g.repel > 0 ? Math.max(0, Math.min(1, g.attract / g.repel)) : 0;
  const pairs = g ? Math.round(lost * count) : 0;
  const vAny = typeof spec.volume === 'string' ? rep.val(spec.volume) : (spec.volume ?? 1);
  const vScale = niceStep(vAny / 3) * Math.ceil((vAny * 1.25) / niceStep(vAny / 3));

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.9, 320 / w)}>
        {({ w, h }) => {
          const top = 40;
          const bottom = h - 34;
          const cw = Math.min(110, w * 0.3);
          const left = Math.max(44, w * 0.2);
          const span = bottom - top;
          const py =
            V !== undefined ? bottom - (Math.min(V, vScale) / vScale) * span : top + span * 0.2;
          const gasH = bottom - py;
          const band = g && b !== undefined && n !== undefined && V ? gasH * ((n * b) / V) : 0;
          const area = Math.max(1, band * (cw - 2));
          const radius =
            band > 0
              ? Math.max(2.5, Math.min(9, Math.sqrt(area / Math.max(1, count) / Math.PI)))
              : 3.6;
          const gx = left + cw + Math.max(54, (w - left - cw) / 2);
          const gr = Math.min(30, (w - left - cw) / 3.2);
          const gauges = [
            { y: top + gr + 4, share: ideal, name: 'Ideal', value: ideal },
            { y: top + gr * 3 + 44, share: g?.p, name: 'van der Waals', value: g?.p },
          ];
          const ticks = Array.from(
            { length: Math.round(vScale / niceStep(vScale / 4)) + 1 },
            (_, i) => Number((i * niceStep(vScale / 4)).toFixed(9)),
          );
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Glass id={ids.glass} />
                <Sheen id={ids.sheen} strength={0.8} />
                <Sheen id={ids.rod} strength={1.2} />
                <Metal id={ids.dial} light={c.metal} dark={c.metalDark} />
                <Ball id={ids.ball} color={c.gasParticle} />
              </Defs>
              {ticks.map((t) => (
                <G key={t}>
                  <Line
                    x1={left - 6}
                    y1={bottom - (t / vScale) * span}
                    x2={left}
                    y2={bottom - (t / vScale) * span}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText
                    x={left - 9}
                    y={bottom - (t / vScale) * span + 4}
                    textAnchor="end"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  >
                    {formatNumber(t)}
                  </ChartText>
                </G>
              ))}
              <ChartText
                x={left - 9}
                y={top - 20}
                textAnchor="end"
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                {vUnit}
              </ChartText>
              <Cylinder
                left={left}
                cw={cw}
                top={top}
                bottom={bottom}
                py={Math.max(top + 4, py)}
                count={ok ? count : 0}
                kelvins={T}
                paint={ids}
                band={band > 0.5 ? band : undefined}
                radius={radius}
                pairs={pairs}
              />
              {band > 0.5 ? (
                <ChartText
                  x={left + cw / 2}
                  y={bottom + 16}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {`nb = ${fig3(n! * b!)} ${vUnit}`}
                </ChartText>
              ) : null}
              {gauges.map((gg) => (
                <G key={gg.name}>
                  <Rect
                    x={left + cw}
                    y={gg.y - 3}
                    width={gx - left - cw}
                    height={6}
                    fill={c.metal}
                    stroke={c.metalDark}
                    strokeWidth={0.8}
                  />
                  <Gauge
                    x={gx}
                    y={gg.y}
                    r={gr}
                    share={gg.share === undefined ? undefined : gg.share / pMax}
                    dial={ids.dial}
                    needle={gg.name === 'Ideal' ? c.chartMuted : c.mercury}
                  />
                  <ChartText
                    x={gx}
                    y={gg.y + gr + 15}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fontWeight="700"
                  >
                    {gg.value === undefined ? gg.name : `${gg.name}: ${fig3(gg.value)} ${pUnit}`}
                  </ChartText>
                </G>
              ))}
              <ChartText
                x={gx}
                y={h - 8}
                textAnchor="middle"
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                {`Both dials 0 to ${formatNumber(pMax)} ${pUnit}`}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionOf(real.gas, { n, V, T, a, b, R }, g, ideal, pUnit, vUnit)}</Caption>
    </View>
  );
}

function captionOf(
  gas: string | undefined,
  x: { n?: number; V?: number; T?: number; a?: number; b?: number; R: number },
  g: ReturnType<typeof vdw> | undefined,
  ideal: number | undefined,
  pUnit: string,
  vUnit: string,
): string {
  const f = (v: number) => formatNumber(Number(v.toPrecision(4)));
  if (ideal === undefined) return 'Type n, V and T to fill the cylinder.';
  const out = [
    `P(ideal) = nRT ÷ V = ${f(x.n!)} × ${f(x.R)} × ${f(x.T!)} ÷ ${f(x.V!)} = ${fig3(ideal)} ${pUnit}`,
  ];
  if (!g) {
    if (x.a !== undefined && x.b !== undefined && x.V! <= x.n! * x.b)
      out.push(
        `The molecules' own volume nb = ${f(x.n! * x.b)} ${vUnit} fills the cylinder: no gas can be squeezed in.`,
      );
    else out.push('Type a and b for the van der Waals pressure.');
    return out.join(' · ');
  }
  const Z = g.p / ideal;
  out.push(
    `P = nRT ÷ (V − nb) − an² ÷ V² = ${fig3(g.repel)} − ${fig3(g.attract)} = ${fig3(g.p)} ${pUnit}`,
    `Z = PV ÷ nRT = ${f(Z)}: ${Z < 1 ? 'below 1, so attraction wins' : Z > 1 ? 'above 1, so the molecules’ own volume wins' : 'exactly 1, as for an ideal gas'}${gas ? ` for ${gas}` : ''}.`,
    `The band is nb, ${fig3((100 * x.n! * x.b!) / x.V!)}% of V; each dashed pair is attraction.`,
  );
  return out.join(' · ');
}
