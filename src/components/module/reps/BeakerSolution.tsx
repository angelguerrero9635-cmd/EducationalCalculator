/**
 * Solutions in a beaker (H52, Grades 9–12 chemistry; `beaker` with `solution`): a glass beaker
 * filled to its volume, the solute as dots spread through the liquid (counted from the moles)
 * and the liquid tinted by its concentration; a dilution as the stock beside the diluted
 * solution, the same dots in both; or a salt's solubility curve with the solution's point on it.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polyline, Rect } from 'react-native-svg';

import type { BeakerSolution as Solution } from '@/data/modules/typesHsj';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { convert, getUnit } from '@/engine/units';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { gasSpots, molesPerParticle, particleCount } from './gasModel';
import { Arrow } from './graphKit';
import { niceStep } from './hsdGrid';
import { MathText } from './hsdText';
import { Ball, Deepen, Glass, Sheen, url, usePaintIds } from './paint';
import { SOLUBILITY, saltText, solubilityAt } from './solubility';

type Rep = ReturnType<typeof useRep>;
type Read = { value: number; known: boolean; text: string; id?: string; unit?: string };

const readOf =
  (rep: Rep) =>
  (x: NumOrVar): Read =>
    typeof x === 'number'
      ? { value: x, known: true, text: formatNumber(x) }
      : {
          value: rep.shown(x),
          known: rep.known(x),
          text: rep.value(x, false),
          id: x,
          unit: rep.unit(x),
        };

/** A volume in liters, from its value in the shown unit (liters when the unit isn't a volume). */
const liters = (r: Read) => {
  const u = getUnit(r.unit);
  return u && u.dimension === 'volume' ? convert(r.value, r.unit!, 'L') : r.value;
};

export function BeakerSolution({ spec, calc }: { spec: Solution; calc: Calculator }) {
  const rep = useRep(calc);
  if (spec.mode === 'solubility') return <SolubilityCurve spec={spec} rep={rep} />;
  return <Beakers spec={spec} rep={rep} />;
}

/** One beaker (molarity) or two (dilution), with the solute's dots and the caption. */
function Beakers({ spec, rep }: { spec: Exclude<Solution, { mode: 'solubility' }>; rep: Rep }) {
  const c = usePalette();
  const read = readOf(rep);
  const ids = usePaintIds('glass', 'sheen', 'water', 'dot');
  const jars =
    spec.mode === 'molarity'
      ? [{ volume: read(spec.volume), molarity: spec.molarity ? read(spec.molarity) : undefined }]
      : [
          { volume: read(spec.stock.volume), molarity: read(spec.stock.molarity) },
          { volume: read(spec.diluted.volume), molarity: read(spec.diluted.molarity) },
        ];
  // The moles of solute: typed (molarity) or the stock's M × V (dilution: the same in both).
  const moles =
    spec.mode === 'molarity'
      ? read(spec.moles)
      : (() => {
          const [m, v] = [jars[0]!.molarity!, jars[0]!.volume];
          const n = m.value * liters(v);
          return { value: n, known: m.known && v.known, text: formatNumber(Number(n.toFixed(6))) };
        })();
  const n = Math.max(0, moles.value);
  const count = particleCount(n);
  const per = molesPerParticle(n);
  const spots = gasSpots(count, 52);
  const unit = jars[0]!.volume.unit ?? 'L';
  // Each beaker's capacity: a round number a little past its volume, in the shown unit.
  const capOf = (v: number) => {
    const top = Math.max(v, 1e-6) * 1.3;
    const step = niceStep(top / 4);
    return { cap: Math.ceil(top / step - 1e-9) * step, step };
  };
  const caps = jars.map((j) => capOf(j.volume.value));
  const biggest = Math.max(...caps.map((x) => liters({ ...jars[0]!.volume, value: x.cap })));
  const concentration = jars.map((j) =>
    j.molarity ? j.molarity.value : n / Math.max(1e-9, liters(j.volume)),
  );
  const strongest = Math.max(...concentration, 1e-9);
  const solute = spec.solute ?? 'solute';

  return (
    <View>
      <Canvas aspect={spec.mode === 'dilution' ? 0.78 : 0.82}>
        {({ w, h }) => {
          const slot = spec.mode === 'dilution' ? w / 2 : w;
          const bottom = h - 44;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Glass id={ids.glass} />
                <Sheen id={ids.sheen} strength={0.8} />
                <Deepen id={ids.water} from={c.waterTop} to={c.water} />
                <Ball id={ids.dot} color={c.soluteParticle} />
              </Defs>
              {jars.map((j, k) => {
                const { cap, step } = caps[k]!;
                // Beakers keep their true sizes one to another: the size grows as the cube root
                // of the capacity, the smaller never under half the bigger.
                const size = Math.max(
                  0.55,
                  Math.cbrt(liters({ ...j.volume, value: cap }) / biggest),
                );
                const bh = (bottom - 34) * size;
                const bw = Math.min(slot * 0.5, 150) * size;
                const cx = k * slot + slot * (spec.mode === 'dilution' ? 0.5 : 0.5) + 10;
                const left = cx - bw / 2;
                const top = bottom - bh;
                const sy = (v: number) => bottom - (v / cap) * bh;
                const level = sy(Math.min(j.volume.value, cap));
                const faded = !(j.volume.known && (j.molarity?.known ?? true) && moles.known);
                // The tint deepens with the concentration (the strongest here the deepest).
                // Dilution: the tint deepens with the concentration (the stock the deepest).
                const tint =
                  spec.mode === 'dilution' ? 0.1 + 0.4 * (concentration[k]! / strongest) : 0.12;
                const marks = Array.from({ length: Math.floor(cap / step + 1e-9) + 1 }, (_, i) =>
                  Number((i * step).toFixed(9)),
                );
                const label = [
                  j.volume.id ? rep.label(j.volume.id) : `V = ${j.volume.text} ${unit}`,
                  j.molarity
                    ? j.molarity.id
                      ? rep.label(j.molarity.id)
                      : `M = ${j.molarity.text}`
                    : undefined,
                ].filter((x): x is string => !!x);
                return (
                  <G key={k} opacity={faded ? 0.4 : 1}>
                    <Rect x={left} y={top} width={bw} height={bh} fill={url(ids.glass)} />
                    <Rect
                      x={left}
                      y={level}
                      width={bw}
                      height={bottom - level}
                      fill={url(ids.water)}
                    />
                    <Rect
                      x={left}
                      y={level}
                      width={bw}
                      height={bottom - level}
                      fill={c.soluteParticle}
                      opacity={tint}
                    />
                    {spots.map((p, i) => (
                      <Circle
                        key={i}
                        cx={left + 6 + p.x * (bw - 12)}
                        cy={level + 5 + p.y * Math.max(0, bottom - level - 10)}
                        r={3.4}
                        fill={url(ids.dot)}
                        stroke={c.card}
                        strokeWidth={0.6}
                      />
                    ))}
                    <Rect x={left} y={top} width={bw} height={bh} fill={url(ids.sheen)} />
                    {/* The scale printed on the glass, on its left side. */}
                    {marks.map((v) =>
                      v === 0 ? null : (
                        <G key={v}>
                          <Line
                            x1={left}
                            y1={sy(v)}
                            x2={left + 10}
                            y2={sy(v)}
                            stroke={c.chartInk}
                            strokeWidth={1}
                          />
                          <ChartText
                            x={left - 5}
                            y={sy(v) + 4}
                            textAnchor="end"
                            fontSize={chart.label}
                            fill={c.chartMuted}
                          >
                            {`${formatNumber(v)} ${unit}`}
                          </ChartText>
                        </G>
                      ),
                    )}
                    <Line
                      x1={left - 4}
                      y1={level}
                      x2={left + bw + 4}
                      y2={level}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                    {/* The glass walls with a pouring lip. */}
                    <Path
                      d={`M ${left - 6} ${top - 6} Q ${left - 1} ${top - 3} ${left} ${top + 3} L ${left} ${bottom - 4} Q ${left} ${bottom} ${left + 4} ${bottom} L ${left + bw - 4} ${bottom} Q ${left + bw} ${bottom} ${left + bw} ${bottom - 4} L ${left + bw} ${top}`}
                      stroke={c.glassEdge}
                      strokeWidth={chart.strokeHeavy}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {label.map((line, i) => (
                      <MathText
                        key={i}
                        text={line}
                        x={cx}
                        y={bottom + 18 + i * 16}
                        textAnchor="middle"
                        fontSize={chart.label}
                        fontWeight="700"
                      />
                    ))}
                  </G>
                );
              })}
              {spec.mode === 'dilution' ? (
                <G>
                  <Arrow
                    x1={w / 2 - 16}
                    y1={bottom - 60}
                    x2={w / 2 + 22}
                    y2={bottom - 60}
                    color={c.chartInk}
                  />
                  {/* Under the arrow, where the big beaker's scale has no number (above it,
                      "150 mL" ran into the "100 mL" tick). */}
                  <ChartText
                    x={w / 2 + 3}
                    y={bottom - 42}
                    textAnchor="middle"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  >
                    + water
                  </ChartText>
                  {spec.water !== undefined ? (
                    <ChartText
                      x={w / 2 + 3}
                      y={bottom - 25}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fontWeight="700"
                    >
                      {`${read(spec.water).text} ${unit}`}
                    </ChartText>
                  ) : null}
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          spec.mode === 'molarity'
            ? `Molarity is moles per liter: ${moles.known ? moles.text : '?'} mol in ${jars[0]!.volume.text} ${unit} is ${formatNumber(Number(concentration[0]!.toPrecision(6)))} mol/L.`
            : `Water spreads the same solute out: M₁V₁ = M₂V₂ = ${moles.text} mol of ${solute}. The paler tint is the weaker solution.`,
          `Each dot is ${formatNumber(per)} mol of ${solute}: ${count} dots${Math.abs(count * per - n) > 1e-9 * Math.max(1, n) ? ', about' : ''}.`,
        ].join(' · ')}
      </Caption>
    </View>
  );
}

/** The salt's solubility curve, others faint, and the solution's point on the graph. */
function SolubilityCurve({
  spec,
  rep,
}: {
  spec: Extract<Solution, { mode: 'solubility' }>;
  rep: Rep;
}) {
  const c = usePalette();
  const read = readOf(rep);
  const t = read(spec.temperature);
  const amount = spec.amount === undefined ? undefined : read(spec.amount);
  const s = solubilityAt(spec.salt, t.value);
  const salts = [...(spec.others ?? []).filter((x) => x !== spec.salt), spec.salt];
  const yTop = Math.max(...salts.map((x) => Math.max(...SOLUBILITY[x])), amount?.value ?? 0, 1);
  const yStep = niceStep(yTop / 6);
  const yMax = Math.ceil((yTop * 1.05) / yStep) * yStep;
  const name = saltText(spec.salt);
  const verdict =
    amount === undefined || !amount.known
      ? undefined
      : Math.abs(amount.value - s) < 1e-6
        ? `${amount.text} g is saturated: exactly what dissolves.`
        : amount.value < s
          ? `${amount.text} g is unsaturated: ${formatNumber(Number((s - amount.value).toFixed(4)))} g more can dissolve.`
          : `${amount.text} g is more than dissolves: ${formatNumber(Number((amount.value - s).toFixed(4)))} g settles out.`;

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const [L, R, T, B] = [46, 58, 14, 40];
          const sx = (x: number) => L + (x / 100) * (w - L - R);
          const sy = (y: number) => T + (1 - y / yMax) * (h - T - B);
          const px = sx(Math.min(100, Math.max(0, t.value)));
          // Names at the curves' right ends, pushed apart to 14 px and kept in the plot.
          const labelY = spread(
            salts.map((x) => Math.min(h - B, Math.max(T + 8, sy(SOLUBILITY[x][10]!) + 4))),
            14,
          );
          return (
            <Svg width={w} height={h}>
              {Array.from({ length: Math.round(yMax / yStep) + 1 }, (_, i) => i * yStep).map(
                (y) => (
                  <G key={`y${y}`}>
                    <Line
                      x1={L}
                      y1={sy(y)}
                      x2={w - R}
                      y2={sy(y)}
                      stroke={c.chartGrid}
                      strokeWidth={1}
                    />
                    <ChartText
                      x={L - 5}
                      y={sy(y) + 4}
                      textAnchor="end"
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    >
                      {formatNumber(y)}
                    </ChartText>
                  </G>
                ),
              )}
              {Array.from({ length: 11 }, (_, i) => i * 10).map((x) => (
                <G key={`x${x}`}>
                  <Line
                    x1={sx(x)}
                    y1={T}
                    x2={sx(x)}
                    y2={h - B}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                  {x % 20 === 0 ? (
                    <ChartText
                      x={sx(x)}
                      y={h - B + 15}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    >
                      {formatNumber(x)}
                    </ChartText>
                  ) : null}
                </G>
              ))}
              <Line x1={L} y1={h - B} x2={w - R} y2={h - B} stroke={c.chartInk} strokeWidth={1.5} />
              <Line x1={L} y1={T} x2={L} y2={h - B} stroke={c.chartInk} strokeWidth={1.5} />
              <ChartText x={(L + w - R) / 2} y={h - 6} textAnchor="middle" fontSize={chart.label}>
                Temperature (°C)
              </ChartText>
              <ChartText
                x={12}
                y={(T + h - B) / 2}
                textAnchor="middle"
                fontSize={chart.label}
                transform={`rotate(-90 12 ${(T + h - B) / 2})`}
              >
                Grams per 100 g of water
              </ChartText>
              {salts.map((salt, k) => {
                const main = salt === spec.salt;
                const table = SOLUBILITY[salt];
                return (
                  <G key={salt} opacity={main ? 1 : 0.55}>
                    <Polyline
                      points={table.map((y, i) => `${sx(i * 10)},${sy(y)}`).join(' ')}
                      fill="none"
                      stroke={main ? c.chartHighlight : c.chartMuted}
                      strokeWidth={main ? chart.strokeHeavy : chart.strokeLight}
                      strokeLinejoin="round"
                    />
                    <ChartText
                      x={sx(100) + 4}
                      y={labelY[k]!}
                      fontSize={chart.label}
                      fontWeight={main ? '700' : '400'}
                      fill={main ? c.chartHighlight : c.chartMuted}
                    >
                      {saltText(salt)}
                    </ChartText>
                  </G>
                );
              })}
              <G opacity={t.known ? 1 : 0.4}>
                <Line
                  x1={px}
                  y1={h - B}
                  x2={px}
                  y2={sy(Math.max(s, amount?.value ?? 0))}
                  stroke={c.chartInk}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <Circle
                  cx={px}
                  cy={sy(s)}
                  r={5}
                  fill={c.card}
                  stroke={c.chartHighlight}
                  strokeWidth={2}
                />
                {amount ? (
                  <G opacity={amount.known ? 1 : 0.4}>
                    <Circle
                      cx={px}
                      cy={sy(Math.min(yMax, amount.value))}
                      r={6}
                      fill={amount.value > s + 1e-6 ? c.hopBack : c.chartSecond}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <ChartText
                      x={px + (px > w * 0.55 ? -10 : 10)}
                      y={sy(Math.min(yMax, amount.value)) + 4}
                      textAnchor={px > w * 0.55 ? 'end' : 'start'}
                      fontSize={chart.label}
                      fontWeight="700"
                    >
                      {`${amount.text} g`}
                    </ChartText>
                  </G>
                ) : null}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `At ${t.known ? t.text : '?'} °C, ${formatNumber(s)} g of ${name} dissolves in 100 g of water.`,
          ...(verdict ? [verdict] : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}

/** Label baselines moved apart to at least `gap`, each as near its own place as it can be. */
function spread(ys: number[], gap: number): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k++) order[k]!.y = Math.max(order[k]!.y, order[k - 1]!.y + gap);
  const out: number[] = [];
  for (const o of order) out[o.i] = o.y;
  return out;
}
