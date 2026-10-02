/**
 * Reaction energy (H53, Grades 9–12 chemistry): the energy profile, flat at the reactants, over
 * the activation hump and down (or up) to the products, with Eₐ, ΔH and the reverse barrier as
 * arrows and the catalyst's lower hump dashed; or a foam-cup calorimeter whose thermometer goes
 * from T₁ to T₂, q = mcΔT worked under it.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polyline, Rect } from 'react-native-svg';

import type { EnergyProfileSpec } from '@/data/modules/typesHsj';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { FALL, PEAK, RISE, profileAt, profileProblem } from './energyModel';
import { Arrow } from './graphKit';
import { MathChip } from './hsdText';
import { axisOf, makePlot, PlotFrame, ticksOf } from './hsjPlot';
import { Deepen, Metal, Sheen, TopLight, url, usePaintIds } from './paint';

type Rep = ReturnType<typeof useRep>;
type Read = { value: number; known: boolean; text: string; id?: string };
type Profile = Exclude<EnergyProfileSpec, { mode: 'calorimeter' | 'ladder' | 'bomb' }>;
type Calorimeter = Extract<EnergyProfileSpec, { mode: 'calorimeter' }>;

const readOf =
  (rep: Rep) =>
  (x: NumOrVar): Read =>
    typeof x === 'number'
      ? { value: x, known: true, text: formatNumber(x) }
      : { value: rep.shown(x), known: rep.known(x), text: rep.value(x, false), id: x };

/** "ΔH = −90 kJ" from a variable, or from the symbol and a number. */
const labelOf = (rep: Rep, r: Read, symbol: string, unit: string) =>
  r.id ? rep.label(r.id) : `${symbol} = ${r.text} ${unit}`;

export function EnergyProfile({
  spec,
  calc,
}: {
  spec: Exclude<EnergyProfileSpec, { mode: 'ladder' | 'bomb' }>;
  calc: Calculator;
}) {
  const rep = useRep(calc);
  return spec.mode === 'calorimeter' ? (
    <CalorimeterView spec={spec} rep={rep} />
  ) : (
    <ProfileView spec={spec} rep={rep} calc={calc} />
  );
}

function ProfileView({ spec, rep, calc }: { spec: Profile; rep: Rep; calc: Calculator }) {
  const c = usePalette();
  const read = readOf(rep);
  const start = useRef(0);
  const [r, p, ea] = [read(spec.reactants), read(spec.products), read(spec.activation)];
  const cat = spec.catalyst === undefined ? undefined : read(spec.catalyst);
  const unit =
    [spec.activation, spec.reactants, spec.products]
      .map((x) => (typeof x === 'string' ? rep.unit(x) : undefined))
      .find(Boolean) ?? 'kJ';
  const problem = profileProblem(r.value, p.value, ea.value);
  // HC44: free energy (ΔG, ΔG°, ΔG°′) in place of enthalpy.
  const sym = `Δ${spec.quantity ?? 'H'}`;
  const free = sym.startsWith('ΔG');
  const catProblem = cat ? profileProblem(r.value, p.value, cat.value) : undefined;
  const peak = r.value + ea.value;
  const levels = [r.value, p.value, peak, ...(cat ? [r.value + cat.value] : [])];
  const span = Math.max(...levels) - Math.min(...levels) || 1;
  const live = axisOf(Math.min(...levels) - span * 0.12, Math.max(...levels) + span * 0.12, 5);
  const frame = useFrozen(live);
  const y = frame.value;
  const dH = p.value - r.value;
  const known = r.known && p.known && ea.known;
  const eaId = typeof spec.activation === 'string' ? spec.activation : undefined;
  const pinIds = [spec.reactants, spec.products, spec.deltaH, spec.catalyst].filter(
    (x): x is string => typeof x === 'string',
  );

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const pl = makePlot(w, h, { lo: 0, hi: 1, step: 0.25 }, y, { B: 30, R: 12 });
          const X = (x: number) => pl.sx(x);
          const curve = (e: number) =>
            Array.from({ length: 121 }, (_, i) => i / 120)
              .map((x) => `${X(x)},${pl.sy(profileAt(x, r.value, p.value, e))}`)
              .join(' ');
          const mid = (a: number, b: number) => (pl.sy(a) + pl.sy(b)) / 2 + 4;
          const arrow = (x: number, from: number, to: number, color: string) =>
            Math.abs(pl.sy(to) - pl.sy(from)) > 10 ? (
              <G>
                <Arrow x1={X(x)} y1={pl.sy(from)} x2={X(x)} y2={pl.sy(to)} color={color} />
              </G>
            ) : null;
          const eaText = labelOf(rep, ea, 'Eₐ', unit);
          const dHText = spec.deltaH
            ? labelOf(rep, read(spec.deltaH), sym, unit)
            : `${sym} = ${formatNumber(Number(dH.toFixed(6)))} ${unit}`;
          return (
            <>
              <Svg width={w} height={h}>
                <PlotFrame
                  p={pl}
                  xName="Reaction progress"
                  yName={free ? `Free energy (${unit})` : `Energy (${unit})`}
                  xNumbers={false}
                />
                <G opacity={known && !problem ? 1 : 0.35}>
                  {/* The levels carried across, dashed, for the arrows to start from. */}
                  <Line
                    x1={X(RISE)}
                    y1={pl.sy(r.value)}
                    x2={X(0.97)}
                    y2={pl.sy(r.value)}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dash}
                  />
                  <Line
                    x1={X(0.45)}
                    y1={pl.sy(p.value)}
                    x2={X(FALL)}
                    y2={pl.sy(p.value)}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray={chart.dash}
                  />
                  {cat && !catProblem ? (
                    <Polyline
                      points={curve(cat.value)}
                      fill="none"
                      stroke={c.energyCatalyst}
                      strokeWidth={chart.stroke}
                      strokeDasharray={chart.dash}
                      opacity={cat.known ? 1 : 0.4}
                    />
                  ) : null}
                  <Polyline
                    points={curve(ea.value)}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    strokeLinejoin="round"
                  />
                  {/* The levels' names, under their flat parts. */}
                  <ChartText
                    x={X(0.01)}
                    y={pl.sy(r.value) + 16}
                    fontSize={chart.label}
                    fontWeight="700"
                  >
                    {spec.names?.reactants ?? 'Reactants'}
                  </ChartText>
                  <ChartText
                    x={X(0.99)}
                    y={pl.sy(p.value) + 16}
                    textAnchor="end"
                    fontSize={chart.label}
                    fontWeight="700"
                  >
                    {spec.names?.products ?? 'Products'}
                  </ChartText>
                  {arrow(PEAK, r.value, peak, c.chartInk)}
                  {arrow(0.95, r.value, p.value, dH < 0 ? c.hopBack : c.chartHighlight)}
                  {spec.reverse !== undefined ? arrow(0.58, p.value, peak, c.chartMuted) : null}
                  {cat && !catProblem
                    ? arrow(0.41, r.value, r.value + cat.value, c.energyCatalyst)
                    : null}
                </G>
                <G opacity={known && !problem ? 1 : 0.35}>
                  <MathChip
                    // Left of its arrow, always: the reverse barrier's tag is on the right.
                    // Over a catalyst's lower arrow it rides higher, clear of that tag.
                    x={X(PEAK) - 6}
                    y={mid(r.value, peak) - (cat ? 10 : 0)}
                    text={eaText}
                    anchor="end"
                    w={w}
                    h={h}
                  />
                  {cat && !catProblem ? (
                    <MathChip
                      x={X(0.41) - 6}
                      // Above the dashed reactants' level, not on it.
                      y={Math.min(mid(r.value, r.value + cat.value) + 8, pl.sy(r.value) - 8)}
                      text={labelOf(rep, cat, 'Eₐ,cat', unit)}
                      anchor="end"
                      color={c.energyCatalyst}
                      w={w}
                      h={h}
                    />
                  ) : null}
                  {spec.reverse !== undefined ? (
                    <MathChip
                      x={X(0.58) + 6}
                      y={mid(p.value, peak) - 10}
                      text={labelOf(rep, read(spec.reverse), 'Eₐ reverse', unit)}
                      anchor="start"
                      w={w}
                      h={h}
                    />
                  ) : null}
                  <MathChip
                    x={X(0.95) - 6}
                    y={mid(r.value, p.value)}
                    text={dHText}
                    anchor="end"
                    color={dH < 0 ? c.hopBack : c.chartHighlight}
                    w={w}
                    h={h}
                  />
                </G>
              </Svg>
              {eaId && !spec.fixed ? (
                <DragHandle
                  testID="drag-peak"
                  x={X(PEAK)}
                  y={pl.sy(peak)}
                  label="the activation energy (the peak)"
                  onStart={() => {
                    start.current = ea.value;
                    frame.freeze();
                  }}
                  onMove={(_, dy) => {
                    const perPx = (y.hi - y.lo) / (h - pl.T - pl.B);
                    const next = Math.max(0, start.current - dy * perPx);
                    calc.set(
                      {
                        ...(spec.keep ? rep.pin(spec.keep) : rep.pin(pinIds)),
                        [eaId]: rep.snapTo(eaId, next * rep.factor(eaId)),
                      },
                      rep.slide(eaId),
                    );
                  }}
                  onEnd={frame.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          problem ??
            (!(r.known && p.known)
              ? `${sym} = products − reactants: type both to compare them.`
              : free
                ? dH < 0
                  ? `The products are lower: ${sym} < 0, so it runs forward on its own (exergonic).`
                  : dH > 0
                    ? `The products are higher: ${sym} > 0, so it does not run on its own (endergonic).`
                    : `The products are at the same level: ${sym} = 0.`
                : dH < 0
                  ? `The products are lower: the reaction gives off ${formatNumber(Number((-dH).toFixed(6)))} ${unit}. Exothermic.`
                  : dH > 0
                    ? `The products are higher: the reaction takes in ${formatNumber(Number(dH.toFixed(6)))} ${unit}. Endothermic.`
                    : 'The products are at the same level: ΔH = 0.'),
          ...(cat && !catProblem
            ? [`A catalyst lowers the hump, not the levels: ${sym} stays the same.`]
            : []),
          ...(catProblem ? [`With the catalyst: ${catProblem}`] : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}

/** The foam-cup calorimeter: cups, lid, stirrer, the water and a thermometer from T₁ to T₂. */
function CalorimeterView({ spec, rep }: { spec: Calorimeter; rep: Rep }) {
  const c = usePalette();
  const read = readOf(rep);
  const ids = usePaintIds('water', 'cup', 'metal', 'block', 'light');
  const [m, cw, t1, t2] = [read(spec.mass), read(spec.heat), read(spec.start), read(spec.end)];
  const metal = spec.metal
    ? {
        name: spec.metal.name,
        mass: read(spec.metal.mass),
        start: read(spec.metal.start),
        heat: spec.metal.heat === undefined ? undefined : read(spec.metal.heat),
      }
    : undefined;
  const dT = t2.value - t1.value;
  const q = m.value * cw.value * dT;
  const axis = axisOf(Math.min(t1.value, t2.value) - 2, Math.max(t1.value, t2.value) + 2, 5);
  const known = m.known && cw.known && t1.known && t2.known;
  const num = (x: number) => formatNumber(Number(x.toFixed(4)));
  const qText = spec.q ? read(spec.q).text : num(q);
  const dTText = spec.change ? read(spec.change).text : num(dT);

  return (
    <View>
      <Canvas aspect={0.82}>
        {({ w, h }) => {
          const cx = w * 0.38;
          const cupTop = h * 0.3;
          const cupBottom = h - 18;
          const topW = Math.min(150, w * 0.42);
          const botW = topW * 0.78;
          const cup = (grow: number) =>
            `M ${cx - topW / 2 - grow} ${cupTop - grow} L ${cx + topW / 2 + grow} ${cupTop - grow} L ${cx + botW / 2 + grow} ${cupBottom + grow} L ${cx - botW / 2 - grow} ${cupBottom + grow} Z`;
          const level = cupTop + (cupBottom - cupTop) * 0.25;
          const wAt = (yy: number) =>
            botW + ((topW - botW) * (cupBottom - yy)) / (cupBottom - cupTop);
          // The thermometer through the lid, its scale beside it.
          const tx = cx + topW * 0.22;
          const scaleTop = 22;
          const scaleBottom = cupBottom - 44;
          const ty = (t: number) =>
            scaleBottom - ((t - axis.lo) / (axis.hi - axis.lo)) * (scaleBottom - scaleTop);
          const warm = dT >= 0;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Deepen id={ids.water} from={c.waterTop} to={c.water} />
                <TopLight id={ids.light} />
                <Sheen id={ids.cup} strength={0.6} />
                <Metal id={ids.metal} light={c.metal} dark={c.metalDark} />
                <Sheen id={ids.block} strength={1.2} />
              </Defs>
              <G opacity={known ? 1 : 0.4}>
                {/* Two foam cups, one inside the other, and the water in the inner one. */}
                <Path d={cup(4)} fill={c.foamCup} stroke={c.foamCupEdge} strokeWidth={1.5} />
                <Path d={cup(0)} fill={c.foamCup} stroke={c.foamCupEdge} strokeWidth={1} />
                <Path
                  d={`M ${cx - wAt(level) / 2 + 3} ${level} L ${cx + wAt(level) / 2 - 3} ${level} L ${cx + botW / 2 - 3} ${cupBottom - 3} L ${cx - botW / 2 + 3} ${cupBottom - 3} Z`}
                  fill={url(ids.water)}
                  opacity={0.9}
                />
                {metal ? (
                  <G>
                    <Rect
                      x={cx - botW * 0.36}
                      y={cupBottom - 34}
                      width={botW * 0.3}
                      height={28}
                      rx={3}
                      fill={c.metal}
                      stroke={c.metalDark}
                    />
                    <Rect
                      x={cx - botW * 0.36}
                      y={cupBottom - 34}
                      width={botW * 0.3}
                      height={28}
                      rx={3}
                      fill={url(ids.block)}
                    />
                  </G>
                ) : null}
                <Path d={cup(4)} fill={url(ids.cup)} />
                {/* The lid, and a stirrer through it. */}
                <Rect
                  x={cx - topW / 2 - 8}
                  y={cupTop - 12}
                  width={topW + 16}
                  height={8}
                  rx={3}
                  fill={c.foamCup}
                  stroke={c.foamCupEdge}
                />
                <Line
                  x1={cx - topW * 0.34}
                  y1={cupTop - 34}
                  x2={cx - topW * 0.34}
                  y2={cupBottom - 14}
                  stroke={c.metalDark}
                  strokeWidth={2.5}
                />
                <Circle
                  cx={cx - topW * 0.34}
                  cy={cupTop - 38}
                  r={5}
                  fill="none"
                  stroke={c.metalDark}
                  strokeWidth={2.5}
                />
                {/* The thermometer: glass, red liquid to T₂, its bulb in the water. */}
                <Rect
                  x={tx - 5}
                  y={scaleTop - 8}
                  width={10}
                  height={cupBottom - 22 - scaleTop + 8}
                  rx={5}
                  fill={c.glass}
                  stroke={c.glassEdge}
                />
                <Rect
                  x={tx - 2}
                  y={ty(t2.value)}
                  width={4}
                  height={cupBottom - 22 - ty(t2.value)}
                  fill={c.mercury}
                />
                <Circle cx={tx} cy={cupBottom - 18} r={7} fill={c.mercury} stroke={c.glassEdge} />
                {ticksOf(axis).map((t) => (
                  <G key={t}>
                    <Line
                      x1={tx + 5}
                      y1={ty(t)}
                      x2={tx + 11}
                      y2={ty(t)}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <ChartText x={tx + 14} y={ty(t) + 4} fontSize={chart.label} fill={c.chartMuted}>
                      {formatNumber(t)}
                    </ChartText>
                  </G>
                ))}
                <ChartText x={tx + 14} y={scaleTop - 12} fontSize={chart.label} fill={c.chartMuted}>
                  °C
                </ChartText>
                {/* T₁ dashed where it started, T₂ where it is, and ΔT between them. */}
                <Line
                  x1={tx + 38}
                  y1={ty(t1.value)}
                  x2={tx + 60}
                  y2={ty(t1.value)}
                  stroke={c.chartMuted}
                  strokeWidth={1.5}
                  strokeDasharray={chart.dash}
                />
                <Line
                  x1={tx + 38}
                  y1={ty(t2.value)}
                  x2={tx + 60}
                  y2={ty(t2.value)}
                  stroke={warm ? c.hopBack : c.chartHighlight}
                  strokeWidth={2}
                />
                {Math.abs(ty(t2.value) - ty(t1.value)) > 12 ? (
                  <Arrow
                    x1={tx + 66}
                    y1={ty(t1.value)}
                    x2={tx + 66}
                    y2={ty(t2.value)}
                    color={warm ? c.hopBack : c.chartHighlight}
                  />
                ) : null}
              </G>
              <MathChip
                x={tx + 74}
                y={ty(t1.value) + (warm ? 14 : -4)}
                text={labelOf(rep, t1, 'T₁', '°C')}
                anchor="start"
                bold={false}
                w={w}
                h={h}
              />
              <MathChip
                x={tx + 74}
                y={ty(t2.value) + (warm ? -4 : 14)}
                text={labelOf(rep, t2, 'T₂', '°C')}
                anchor="start"
                color={warm ? c.hopBack : c.chartHighlight}
                w={w}
                h={h}
              />
              {metal ? (
                <MathChip
                  x={cx - botW * 0.21}
                  y={cupBottom - 40}
                  text={`${metal.name}: ${metal.mass.text} g at ${metal.start.text} °C`}
                  anchor="middle"
                  size={chart.label}
                  w={w}
                  h={h}
                />
              ) : null}
              <MathChip
                x={cx - topW * 0.06}
                y={cupTop + 34}
                text={labelOf(rep, m, 'm', 'g')}
                anchor="middle"
                w={w}
                h={h}
              />
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `Heat taken in by the water: q = mcΔT = ${m.text} × ${cw.text} × ${dTText} = ${qText} J`,
          dT > 0
            ? metal
              ? `The water took in ${qText} J, all of it from the ${metal.name}. It cooled by ${num(metal.start.value - t2.value)} °C, so its c = ${qText}/(${metal.mass.text} × ${num(metal.start.value - t2.value)}) = ${metal.heat ? metal.heat.text : num(q / (metal.mass.value * (metal.start.value - t2.value)))} J/(g·°C).`
              : `The water warmed: the reaction gave off ${qText} J. Exothermic.`
            : dT < 0
              ? `The water cooled: the reaction took in ${known ? num(-q) : '?'} J from it. Endothermic.`
              : 'The temperature did not change: no heat moved.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}
