/**
 * HC5 `controlVolume`: a process unit or a steady-flow device inside a dashed control volume,
 * its streams as labelled arrows, Q̇ and Ẇ arrows, a balance line "in = out" per component and,
 * where the streams carry energy, an energy bar (ControlVolumeSpec in typesHe1f.ts). Plant units
 * and devices are painted in steel; boxes, arrows, balance lines and bars stay flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { ControlVolumeSpec, CvStream } from '@/data/modules/typesHe1f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import {
  balances,
  energyBalance,
  flowOf,
  foodToMass,
  holdsBalance,
  leftAfterEach,
  residenceTime,
  stageFactor,
  stagesLeft,
  streamSide,
  streamTotal,
  type Getter,
} from './controlVolumeMath';
import { Arrow, Block, LH, r4, textW, useValueLabel, type LabelLine } from './he1fKit';
import { Deepen, Sheen, url, usePaintIds } from './paint';

const BW = 356;

/** The kinds the picture paints in steel (the rest are flat boxes). */
const PAINTED = new Set(['column', 'evaporator', 'burner', 'tank', 'heater', 'membrane']);

const UNIT_NAMES: Record<string, string> = {
  box: 'Unit',
  mixer: 'Mixer',
  splitter: 'Splitter',
  column: 'Column',
  evaporator: 'Evaporator',
  burner: 'Burner',
  tank: 'Tank',
  heater: 'Heater',
  membrane: 'Membrane',
  turbine: 'Turbine',
  compressor: 'Compressor',
  pump: 'Pump',
  nozzle: 'Nozzle',
  diffuser: 'Diffuser',
  valve: 'Valve',
  mixingChamber: 'Mixing chamber',
};

/** A control volume round a process unit or a steady-flow device (ControlVolumeSpec). */
export function ControlVolume({ spec, calc }: { spec: ControlVolumeSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const paint = usePaintIds('steel', 'sheen', 'liquid', 'sludge', 'flame');
  const isVar = (x: NumOrVar | NumOrVar[] | undefined): x is string => typeof x === 'string';
  const get: Getter = (x) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const known = (x: NumOrVar | undefined) => x !== undefined && get(x) !== undefined;
  /** A value's label ("F₁ = 100 kg/h"), or undefined while it is "?". */
  const valueLabel = useValueLabel(calc);
  const lab = (x: NumOrVar | undefined, name?: string) => {
    if (x === undefined || !known(x)) return undefined;
    if (isVar(x)) return name ? `${name} ${valueLabel(x)}` : valueLabel(x);
    return `${name ? `${name} ` : ''}${formatNumber(x)}`;
  };
  const unitOf = (x: NumOrVar | undefined) => (isVar(x) ? (rep.unit(x) ?? '') : '');

  const kind = spec.device ?? spec.unit ?? 'box';
  // The unit's body between the two label columns (a tank wider, for the values inside it).
  const [UX0, UX1] = kind === 'tank' ? [124, 232] : [140, 216];
  const CX = (UX0 + UX1) / 2;
  const painted = !!spec.device || PAINTED.has(kind);

  /** A stream's label lines: its name, then each known value. */
  const linesOf = (s: CvStream): LabelLine[] => {
    const out: LabelLine[] = [{ text: s.name, bold: true }];
    const push = (t: string | undefined) => {
      if (t) out.push({ text: t });
    };
    if (Array.isArray(s.flow)) {
      const f = flowOf(s.flow, get);
      if (f !== undefined) {
        push(`${s.symbol ?? 'flow'} = ${r4(f)}${s.unit ? ` ${s.unit}` : ''}`);
      }
    } else if (typeof s.flow === 'number') {
      push(`${s.symbol ?? 'flow'} = ${formatNumber(s.flow)}${s.unit ? ` ${s.unit}` : ''}`);
    } else push(lab(s.flow));
    for (const f of s.fractions ?? []) push(lab(f.x, f.name));
    if (s.rest && (s.fractions ?? []).every((f) => known(f.x))) {
      const rest = 1 - (s.fractions ?? []).reduce((a, f) => a + get(f.x)!, 0);
      push(`${s.rest} ${r4(rest)}`);
    }
    for (const a of s.amounts ?? []) push(isVar(a.n) ? lab(a.n) : lab(a.n, a.name));
    push(lab(s.T));
    push(lab(s.P));
    push(lab(s.h));
    push(lab(s.V));
    for (const m of s.more ?? []) push(lab(m));
    if (s.tags?.length) out.push({ text: '', tags: s.tags });
    return out;
  };

  // Arrow widths: thicker for a bigger flow, when every stream's flow is known.
  const totals = spec.streams.map((s) => streamTotal(s, get));
  const maxFlow = Math.max(0, ...totals.map((t) => (t === undefined ? 0 : Math.abs(t))));
  const widthOf = (i: number) => {
    const t = totals[i];
    if (t === undefined || !(maxFlow > 0)) return 2;
    return 2 + 5 * Math.min(1, Math.abs(t) / maxFlow);
  };
  const flowColor = c.chartInk;

  // Which streams leave from the top or bottom of the unit instead of a side.
  const roles = spec.streams.map((_, i) => streamSide(spec, i));

  // ── Layout ──
  const heat = get(spec.heat);
  const work0 = get(spec.work);
  /** Work out of the volume (a pump's Ẇ_in counts as negative). */
  const work = work0 === undefined ? undefined : spec.workIn ? -work0 : work0;
  const hasHeat = spec.heat !== undefined;
  const hasWork = spec.work !== undefined;
  const topIdx = roles.indexOf('T');
  const botIdx = roles.indexOf('B');
  const topLines = topIdx >= 0 ? linesOf(spec.streams[topIdx]!) : undefined;
  const workLines: LabelLine[] | undefined = hasWork
    ? [
        { text: work !== undefined && work < 0 ? 'Work in' : 'Work out', bold: true },
        ...opt(lab(spec.work)),
      ]
    : undefined;
  const topBand =
    16 +
    Math.max(topLines ? topLines.length * LH + 30 : 0, workLines ? workLines.length * LH + 30 : 0);

  const sideStack = (side: 'L' | 'R') => {
    let y = topBand + 8;
    const ys: { i: number; y: number; lines: LabelLine[] }[] = [];
    spec.streams.forEach((s, i) => {
      if (roles[i] !== side || s.dir === 'inside') return;
      const lines = linesOf(s);
      y += lines.length * LH;
      ys.push({ i, y: y + 2, lines });
      y += 22;
    });
    return { ys, end: y };
  };
  const left = sideStack('L');
  const right = sideStack('R');
  const minBody = kind === 'column' ? 150 : kind === 'stream' ? 0 : spec.device ? 80 : 96;
  const span = Math.max(left.end, right.end) - (topBand + 8);
  const bodyH = Math.max(minBody, span);
  const by0 = topBand + 8;
  const by1 = by0 + bodyH;
  // Centre a shorter side's arrows on the body.
  for (const st of [left, right]) {
    const used = st.end - by0;
    const shift = (bodyH - used) / 2;
    for (const e of st.ys) e.y += shift;
  }

  const botLines = botIdx >= 0 ? linesOf(spec.streams[botIdx]!) : undefined;
  const heatLines: LabelLine[] | undefined = hasHeat
    ? [
        { text: heat !== undefined && heat < 0 ? 'Heat lost' : 'Heat in', bold: true },
        ...opt(lab(spec.heat)),
      ]
    : undefined;
  const steamLines: LabelLine[] | undefined = spec.steam
    ? [
        { text: 'Steam condensing', bold: true },
        ...opt(lab(spec.steam.flow)),
        ...opt(lab(spec.steam.latent)),
      ]
    : undefined;
  const belowLines = [botLines, heatLines, steamLines].filter(Boolean) as LabelLine[][];
  const botBand = belowLines.length ? 40 + Math.max(...belowLines.map((l) => l.length * LH)) : 10;

  // The panels under the drawing: balance lines, the energy bar, the unit's own numbers.

  const rows = spec.unit === 'stream' || spec.dof ? [] : balances(spec, get);
  const unitName = spec.balanceUnit ?? unitOf(spec.streams.map((s) => s.flow).find(isVar));
  const energy = energyBalance(spec, get);
  const energyUnit = spec.energyUnit
    ? spec.energyUnit
    : hasHeat
      ? unitOf(spec.heat)
      : hasWork
        ? unitOf(spec.work)
        : spec.streams.some((s) => s.flow !== undefined)
          ? 'kW'
          : 'kJ/kg';

  const isStages = kind === 'stages' && spec.stages;
  const isBypass = kind === 'evaporator' && spec.bypass;
  const isStream = kind === 'stream';

  // Special layouts have their own drawing height.
  const drawH = isStages
    ? 260
    : isBypass
      ? 250
      : isStream
        ? 40 + linesOf(spec.streams[0]!).length * LH + 40
        : by1 + botBand;

  const extras = extraLines();
  const balanceTop = drawH + 6;
  const shownRows = rows.filter((b) => b.into !== undefined && b.out !== undefined);
  const balanceH = shownRows.length ? shownRows.length * LH + 22 : 0;
  const energyTop = balanceTop + balanceH + 4;
  const pressureBars = pressureOf();
  const energyH = energy ? 92 : pressureBars ? 70 : 0;
  const extrasTop = energyTop + energyH;
  const BH = extrasTop + (extras.length ? extras.length * LH + 16 : 0) + 6;

  /** A membrane's applied ΔP and osmotic π, when both are known. */
  function pressureOf() {
    if (!spec.pressure) return undefined;
    const dP = get(spec.pressure.applied);
    const pi = get(spec.pressure.osmotic);
    if (dP === undefined || pi === undefined) return undefined;
    return { dP, pi };
  }

  /** The unit's own numbers (residence time, F/M, DOF, membrane flux), as lines. */
  function extraLines(): string[] {
    const out: string[] = [];
    if (spec.residence && spec.volume !== undefined) {
      const V = get(spec.volume);
      const q = streamTotal(spec.streams[0]!, get);
      const tau = get(spec.residence.tau);
      if (V !== undefined && q !== undefined && tau !== undefined)
        out.push(
          `τ = V ÷ q${spec.residence.factor && spec.residence.factor !== 1 ? ` × ${spec.residence.factor}` : ''} = ${r4(residenceTime(V, q, spec.residence.factor))} ${unitOf(spec.residence.tau)}`,
        );
    }
    if (spec.loading && spec.volume !== undefined) {
      const Q = streamTotal(spec.streams[0]!, get);
      const S0 = get(spec.loading.substrate);
      const V = get(spec.volume);
      const X = get(spec.loading.biomass);
      if ([Q, S0, V, X].every((x) => x !== undefined))
        out.push(
          `F/M = QS₀ ÷ (VX) = ${r4(foodToMass(Q!, S0!, V!, X!))} ${unitOf(spec.loading.ratio)}`,
        );
    }
    if (spec.dof) {
      const [u, b, s, r] = [
        spec.dof.unknowns,
        spec.dof.balances,
        spec.dof.specs,
        spec.dof.relations,
      ].map(get);
      if ([u, b, s, r].every((x) => x !== undefined)) {
        const d = u! - b! - s! - r!;
        out.push(`DOF = ${u} − ${b} − ${s} − ${r} = ${d}`);
        out.push(
          d === 0
            ? 'Solvable: as many equations as unknowns'
            : d > 0
              ? 'Needs more information'
              : 'Over-specified: check for a contradiction',
        );
      }
    }
    if (spec.pressure) {
      const dP = get(spec.pressure.applied);
      const pi = get(spec.pressure.osmotic);
      const A = get(spec.pressure.permeability);
      if (dP !== undefined && pi !== undefined && A !== undefined)
        out.push(
          dP > pi
            ? `J_w = A_w(ΔP − π) = ${r4(A)} × (${r4(dP)} − ${r4(pi)}) = ${r4(A * (dP - pi))}`
            : `ΔP ≤ π: no water crosses (J_w = 0)`,
        );
    }
    if (spec.selectivity !== undefined) {
      const a = get(spec.selectivity);
      if (a !== undefined) out.push(`α = ${r4(a)}: A crosses ${r4(a)} times as fast as B`);
    }
    return out;
  }

  // ── Body painting ──
  const body = (): ReactNode => {
    const w = UX1 - UX0;
    const h = by1 - by0;
    const metalFill = url(paint.steel);
    const sheen = <Rect x={UX0} y={by0} width={w} height={h} rx={10} fill={url(paint.sheen)} />;
    switch (kind) {
      case 'column': {
        const trays = Math.max(4, Math.floor((h - 30) / 18));
        return (
          <G>
            <Rect
              x={UX0 + 8}
              y={by0}
              width={w - 16}
              height={h}
              rx={(w - 16) / 2.4}
              fill={metalFill}
              stroke={c.metalDark}
            />
            <Rect
              x={UX0 + 8}
              y={by0}
              width={w - 16}
              height={h}
              rx={(w - 16) / 2.4}
              fill={url(paint.sheen)}
            />
            {Array.from({ length: trays }, (_, k) => {
              const y = by0 + 20 + ((h - 40) * (k + 0.5)) / trays;
              return (
                <Line
                  key={k}
                  x1={UX0 + 14}
                  x2={UX1 - 14}
                  y1={y}
                  y2={y}
                  stroke={c.metalDark}
                  strokeDasharray="6 3"
                />
              );
            })}
            {bodyName(by0 + 16)}
          </G>
        );
      }
      case 'evaporator':
      case 'tank':
      case 'heater': {
        const level = by0 + h * 0.32;
        const sludge = !!spec.loading;
        return (
          <G>
            <Rect
              x={UX0}
              y={by0}
              width={w}
              height={h}
              rx={12}
              fill={metalFill}
              stroke={c.metalDark}
            />
            {kind !== 'heater' && (
              <Rect
                x={UX0 + 5}
                y={level}
                width={w - 10}
                height={by1 - level - 5}
                rx={8}
                fill={url(sludge ? paint.sludge : paint.liquid)}
                opacity={0.9}
              />
            )}
            {kind === 'heater' &&
              [0.3, 0.5, 0.7].map((f) => (
                <Line
                  key={f}
                  x1={UX0 + 6}
                  x2={UX1 - 6}
                  y1={by0 + h * f}
                  y2={by0 + h * f}
                  stroke={c.metalDark}
                  strokeWidth={3}
                />
              ))}
            {sludge &&
              [0.2, 0.4, 0.6, 0.8].flatMap((fx) =>
                [0.55, 0.75, 0.9].map((fy) => (
                  <Circle
                    key={`${fx}-${fy}`}
                    cx={UX0 + w * fx + ((fy * 9) % 6)}
                    cy={by0 + h * fy}
                    r={2.4}
                    fill="none"
                    stroke={c.waterTop}
                    strokeWidth={1.2}
                  />
                )),
              )}
            {sheen}
            {bodyName(by0 + 18)}
            {[lab(spec.volume), lab(spec.loading?.biomass)]
              .filter((t): t is string => !!t)
              .map((t, k) => (
                <ChartText
                  key={t}
                  x={CX}
                  y={level + 18 + k * LH}
                  fontSize={chart.label}
                  textAnchor="middle"
                  halo={c.waterTop}
                >
                  {t}
                </ChartText>
              ))}
          </G>
        );
      }
      case 'burner':
        return (
          <G>
            <Rect
              x={UX0}
              y={by0}
              width={w}
              height={h}
              rx={14}
              fill={metalFill}
              stroke={c.metalDark}
            />
            <Path
              d={`M ${UX0 + 10} ${by0 + h / 2} Q ${CX} ${by0 + h * 0.15} ${UX1 - 8} ${by0 + h / 2} Q ${CX} ${by1 - h * 0.15} ${UX0 + 10} ${by0 + h / 2} Z`}
              fill={url(paint.flame)}
            />
            <Path
              d={`M ${UX0 + 12} ${by0 + h / 2} Q ${CX - 4} ${by0 + h * 0.32} ${CX + 14} ${by0 + h / 2} Q ${CX - 4} ${by1 - h * 0.32} ${UX0 + 12} ${by0 + h / 2} Z`}
              fill={c.cvFlameCore}
            />
            {sheen}
            {bodyName(by0 + 16)}
          </G>
        );
      case 'membrane': {
        const ym = by0 + h * 0.6;
        return (
          <G>
            <Rect
              x={UX0}
              y={by0}
              width={w}
              height={h}
              rx={10}
              fill={metalFill}
              stroke={c.metalDark}
            />
            <Rect
              x={UX0 + 4}
              y={by0 + 4}
              width={w - 8}
              height={ym - by0 - 6}
              rx={6}
              fill={c.water}
              opacity={0.55}
            />
            <Rect
              x={UX0 + 4}
              y={ym + 3}
              width={w - 8}
              height={by1 - ym - 7}
              rx={6}
              fill={c.waterTop}
              opacity={0.7}
            />
            <Line
              x1={UX0 + 2}
              x2={UX1 - 2}
              y1={ym}
              y2={ym}
              stroke={c.cvMembrane}
              strokeWidth={4}
              strokeDasharray="7 2"
            />
            {sheen}
            {bodyName(by0 + 16)}
          </G>
        );
      }
      case 'turbine':
      case 'compressor': {
        const narrow = h * 0.22;
        const wide = h * 0.48;
        const [hl, hr] = kind === 'turbine' ? [narrow, wide] : [wide, narrow];
        const cy = (by0 + by1) / 2;
        const d = `M ${UX0} ${cy - hl} L ${UX1} ${cy - hr} L ${UX1} ${cy + hr} L ${UX0} ${cy + hl} Z`;
        return (
          <G>
            <Path d={d} fill={metalFill} stroke={c.metalDark} />
            {[0.25, 0.45, 0.65, 0.85].map((f) => {
              const x = UX0 + w * f;
              const hh = hl + (hr - hl) * f - 4;
              return (
                <Line
                  key={f}
                  x1={x}
                  x2={x}
                  y1={cy - hh}
                  y2={cy + hh}
                  stroke={c.metalDark}
                  strokeWidth={2}
                />
              );
            })}
            <Path d={d} fill={url(paint.sheen)} />
            <Rect
              x={CX - 4}
              y={by0 - 6}
              width={8}
              height={cy - by0 + 6}
              fill={metalFill}
              stroke={c.metalDark}
            />
          </G>
        );
      }
      case 'pump': {
        const cy = (by0 + by1) / 2;
        const rr = Math.min(w, h) * 0.42;
        return (
          <G>
            <Rect
              x={UX1 - 12}
              y={cy - rr}
              width={12}
              height={16}
              fill={metalFill}
              stroke={c.metalDark}
            />
            <Circle cx={CX} cy={cy} r={rr} fill={metalFill} stroke={c.metalDark} />
            <Circle cx={CX} cy={cy} r={rr * 0.35} fill={c.metal} stroke={c.metalDark} />
            <Rect
              x={CX - 4}
              y={by0 - 6}
              width={8}
              height={cy - by0 - rr * 0.35 + 6}
              fill={metalFill}
              stroke={c.metalDark}
            />
          </G>
        );
      }
      case 'nozzle':
      case 'diffuser': {
        const cy = (by0 + by1) / 2;
        const [hl, hr] = kind === 'nozzle' ? [h * 0.42, h * 0.16] : [h * 0.16, h * 0.42];
        const top = `M ${UX0} ${cy - hl} L ${UX1} ${cy - hr}`;
        const bot = `M ${UX0} ${cy + hl} L ${UX1} ${cy + hr}`;
        return (
          <G>
            <Path
              d={`M ${UX0} ${cy - hl} L ${UX1} ${cy - hr} L ${UX1} ${cy + hr} L ${UX0} ${cy + hl} Z`}
              fill={c.water}
              opacity={0.35}
            />
            <Path d={top} stroke={c.metalDark} strokeWidth={6} />
            <Path d={bot} stroke={c.metalDark} strokeWidth={6} />
            <Path d={top} stroke={c.metal} strokeWidth={2.5} />
            <Path d={bot} stroke={c.metal} strokeWidth={2.5} />
          </G>
        );
      }
      case 'valve': {
        const cy = (by0 + by1) / 2;
        return (
          <G>
            <Rect x={UX0} y={cy - 9} width={w} height={18} fill={metalFill} stroke={c.metalDark} />
            <Path
              d={`M ${CX - 18} ${cy - 16} L ${CX + 18} ${cy + 16} L ${CX + 18} ${cy - 16} L ${CX - 18} ${cy + 16} Z`}
              fill={metalFill}
              stroke={c.metalDark}
              strokeWidth={1.5}
            />
            <Line x1={CX} x2={CX} y1={cy} y2={cy - 30} stroke={c.metalDark} strokeWidth={3} />
            <Rect
              x={CX - 14}
              y={cy - 34}
              width={28}
              height={6}
              rx={3}
              fill={metalFill}
              stroke={c.metalDark}
            />
            <Rect x={UX0} y={cy - 9} width={w} height={18} fill={url(paint.sheen)} />
          </G>
        );
      }
      case 'mixingChamber':
        return (
          <G>
            <Rect
              x={UX0}
              y={by0}
              width={w}
              height={h}
              rx={10}
              fill={metalFill}
              stroke={c.metalDark}
            />
            {sheen}
            {bodyName(by0 + h / 2 + 4)}
          </G>
        );
      default:
        // Mixer, splitter, a plain unit: a flat box.
        return (
          <G>
            <Rect
              x={UX0}
              y={by0}
              width={w}
              height={h}
              rx={8}
              fill={c.chartFill}
              stroke={c.chartInk}
              strokeWidth={1.5}
            />
            {bodyName(by0 + h / 2 + 4)}
          </G>
        );
    }
  };

  function bodyName(y: number) {
    const name = UNIT_NAMES[kind] ?? '';
    // A name wider than the body takes two lines ("Mixing" over "chamber").
    const lines = textW(name, chart.value) > UX1 - UX0 - 8 ? name.split(' ') : [name];
    return (
      <G>
        {lines.map((t, k) => (
          <ChartText
            key={t}
            x={CX}
            y={y + (k - (lines.length - 1) / 2) * LH}
            fontSize={chart.value}
            fontWeight="bold"
            textAnchor="middle"
            halo={painted ? c.metal : undefined}
          >
            {t}
          </ChartText>
        ))}
      </G>
    );
  }

  // ── Streams on the sides, top and bottom ──
  const sideArrows = (): ReactNode => (
    <G>
      {left.ys.map(({ i, y, lines }) => (
        <G key={`l${i}`}>
          <Arrow
            x1={6}
            y1={y}
            x2={UX0 - 2}
            y2={y}
            color={flowColor}
            width={widthOf(i)}
            dashed={totals[i] === undefined}
          />
          <Block x={6} y={y - 8 - widthOf(i) / 2} lines={lines} anchor="start" c={c} />
        </G>
      ))}
      {right.ys.map(({ i, y, lines }) => (
        <G key={`r${i}`}>
          <Arrow
            x1={UX1 + 2}
            y1={y}
            x2={BW - 6}
            y2={y}
            color={flowColor}
            width={widthOf(i)}
            dashed={totals[i] === undefined}
          />
          <Block x={BW - 6} y={y - 8 - widthOf(i) / 2} lines={lines} anchor="end" c={c} />
        </G>
      ))}
      {topIdx >= 0 && topLines && (
        <G>
          <Arrow
            x1={CX}
            y1={by0 - 2}
            x2={CX}
            y2={by0 - 40}
            color={flowColor}
            width={widthOf(topIdx)}
          />
          <Block x={CX + 10} y={by0 - 24} lines={topLines} anchor="start" c={c} />
        </G>
      )}
      {hasWork && workLines && (
        <G>
          {work !== undefined && work < 0 ? (
            <Arrow x1={CX} y1={by0 - 44} x2={CX} y2={by0 - 8} color={c.physWork} width={3} />
          ) : (
            <Arrow
              x1={CX}
              y1={by0 - 8}
              x2={CX}
              y2={by0 - 44}
              color={c.physWork}
              width={3}
              dashed={work === undefined}
            />
          )}
          <Block x={CX + 10} y={by0 - 18} lines={workLines} anchor="start" c={c} />
        </G>
      )}
      {(() => {
        // Under the unit: the permeate (or another bottom stream), Q̇ and the steam.
        const items: ReactNode[] = [];
        const slots = [CX - 40, CX + 4, CX + 48];
        let k = 0;
        if (botIdx >= 0 && botLines) {
          const x = belowLines.length > 1 ? slots[1]! : CX;
          items.push(
            <G key="bot">
              <Arrow
                x1={x}
                y1={by1 + 2}
                x2={x}
                y2={by1 + 34}
                color={flowColor}
                width={widthOf(botIdx)}
              />
              <Block
                x={x + 8}
                y={by1 + 34 + (botLines.length - 1) * LH}
                lines={botLines}
                anchor="start"
                c={c}
              />
            </G>,
          );
          k++;
        }
        if (hasHeat && heatLines) {
          const x = k ? slots[0]! : CX - 10;
          const out = heat !== undefined && heat < 0;
          items.push(
            <G key="heat">
              {out ? (
                <Arrow x1={x} y1={by1 + 4} x2={x} y2={by1 + 34} color={c.physHot} width={3} />
              ) : (
                <Arrow
                  x1={x}
                  y1={by1 + 34}
                  x2={x}
                  y2={by1 + 4}
                  color={c.physHot}
                  width={3}
                  dashed={heat === undefined}
                />
              )}
              <Block
                x={x - 8}
                y={by1 + 34 + (heatLines.length - 1) * LH}
                lines={heatLines}
                anchor="end"
                c={c}
              />
            </G>,
          );
        }
        if (steamLines) {
          const x = CX + 14;
          items.push(
            <G key="steam">
              <Path
                d={`M ${x} ${by1 + 34} q 6 -6 0 -12 q -6 -6 0 -12`}
                stroke={c.physHot}
                strokeWidth={2}
                fill="none"
              />
              <Block
                x={x + 10}
                y={by1 + 34 + (steamLines.length - 1) * LH}
                lines={steamLines}
                anchor="start"
                c={c}
              />
            </G>,
          );
        }
        return items;
      })()}
    </G>
  );

  // ── Special layouts ──
  const streamOnly = (): ReactNode => {
    const s = spec.streams[0]!;
    const lines = linesOf(s);
    const boxW = Math.max(...lines.map((l) => textW(l.text))) + 24;
    const boxH = lines.length * LH + 12;
    const y = 30 + boxH / 2;
    return (
      <G>
        <Arrow x1={6} y1={y} x2={BW - 6} y2={y} color={flowColor} width={5} />
        <Rect
          x={CX - boxW / 2}
          y={y - boxH / 2}
          width={boxW}
          height={boxH}
          rx={8}
          fill={c.chartSurface}
          stroke={c.chartInk}
          strokeWidth={1.2}
        />
        <Block
          x={CX}
          y={y - boxH / 2 + 6 + LH * lines.length - 3}
          lines={lines}
          anchor="middle"
          c={c}
        />
      </G>
    );
  };

  const stagesDrawing = (): ReactNode => {
    const st = spec.stages!;
    const n = Math.max(1, Math.min(10, Math.round(get(st.count) ?? 1)));
    const nKnown = known(st.count);
    const kd = get(st.kd);
    const ratio = get(st.ratio);
    const ok = nKnown && kd !== undefined && ratio !== undefined && kd > 0 && ratio > 0;
    const lefts = ok ? leftAfterEach(n, kd, ratio, st.flow) : [];
    const gap = n > 5 ? 8 : 16;
    const x0 = 52;
    const x1 = BW - 70;
    const sw = (x1 - x0 - gap * (n - 1)) / n;
    const y0 = 70;
    const y1 = 134;
    const cross = st.flow === 'crosscurrent';
    const [feed, solvent, raff, extract] = spec.streams;
    return (
      <G>
        {Array.from({ length: n }, (_, k) => {
          const x = x0 + k * (sw + gap);
          const left = lefts[k];
          const barH = 70;
          return (
            <G key={k}>
              <Rect
                x={x}
                y={y0}
                width={sw}
                height={y1 - y0}
                rx={6}
                fill={url(paint.steel)}
                stroke={c.metalDark}
              />
              <Rect
                x={x + 3}
                y={y0 + 4}
                width={sw - 6}
                height={(y1 - y0) / 2 - 5}
                rx={4}
                fill={c.cvSolvent}
              />
              <Rect
                x={x + 3}
                y={(y0 + y1) / 2 + 1}
                width={sw - 6}
                height={(y1 - y0) / 2 - 5}
                rx={4}
                fill={c.water}
                opacity={0.75}
              />
              <Rect x={x} y={y0} width={sw} height={y1 - y0} rx={6} fill={url(paint.sheen)} />
              <ChartText
                x={x + sw / 2 - 6}
                y={y0 - 6}
                fontSize={chart.label}
                textAnchor="end"
                fill={c.chartMuted}
              >
                {String(k + 1)}
              </ChartText>
              {cross && (
                <Arrow
                  x1={x + sw / 2}
                  y1={y0 - 28}
                  x2={x + sw / 2}
                  y2={y0 - 4}
                  color={c.chartInk}
                  width={2}
                />
              )}
              {cross && (
                <Arrow
                  x1={x + sw / 2}
                  y1={y1 + 2}
                  x2={x + sw / 2}
                  y2={y1 + 26}
                  color={c.chartMuted}
                  width={2}
                />
              )}
              {k < n - 1 && (
                <Arrow
                  x1={x + sw}
                  y1={(y0 + y1) / 2 + 14}
                  x2={x + sw + gap}
                  y2={(y0 + y1) / 2 + 14}
                  color={c.chartInk}
                  width={2}
                />
              )}
              {!cross && k < n - 1 && (
                <Arrow
                  x1={x + sw + gap}
                  y1={y0 + 14}
                  x2={x + sw}
                  y2={y0 + 14}
                  color={c.chartMuted}
                  width={2}
                />
              )}
              {/* The solute left in the raffinate after this stage: a bar of the feed's. */}
              {left !== undefined && (
                <G>
                  <Rect
                    x={x + sw * 0.2}
                    y={y1 + 34}
                    width={sw * 0.6}
                    height={barH}
                    fill={c.chartSurface}
                    stroke={c.chartGrid}
                  />
                  <Rect
                    x={x + sw * 0.2}
                    y={y1 + 34 + barH * (1 - left)}
                    width={sw * 0.6}
                    height={barH * left}
                    fill={c.chartHighlight}
                  />
                  {sw > 30 && (
                    <ChartText
                      x={x + sw / 2}
                      y={y1 + 34 + barH + 14}
                      fontSize={chart.label}
                      textAnchor="middle"
                    >
                      {`${r4(left * 100)}%`}
                    </ChartText>
                  )}
                </G>
              )}
            </G>
          );
        })}
        <Arrow
          x1={6}
          y1={(y0 + y1) / 2 + 14}
          x2={x0}
          y2={(y0 + y1) / 2 + 14}
          color={c.chartInk}
          width={3}
        />
        <Arrow
          x1={x1}
          y1={(y0 + y1) / 2 + 14}
          x2={BW - 6}
          y2={(y0 + y1) / 2 + 14}
          color={c.chartInk}
          width={3}
        />
        {!cross && (
          <Arrow x1={BW - 6} y1={y0 + 14} x2={x1} y2={y0 + 14} color={c.chartMuted} width={3} />
        )}
        {!cross && (
          <Arrow x1={x0} y1={y0 + 14} x2={6} y2={y0 + 14} color={c.chartMuted} width={3} />
        )}
        <ChartText x={6} y={(y0 + y1) / 2 + 32} fontSize={chart.label} fontWeight="bold">
          {feed?.name ?? 'Feed'}
        </ChartText>
        <ChartText
          x={BW - 6}
          y={(y0 + y1) / 2 + 32}
          fontSize={chart.label}
          fontWeight="bold"
          textAnchor="end"
        >
          {raff?.name ?? 'Raffinate'}
        </ChartText>
        <ChartText
          x={cross ? CX : BW - 6}
          y={cross ? 18 : y0 - 4}
          fontSize={chart.label}
          fontWeight="bold"
          textAnchor={cross ? 'middle' : 'end'}
        >
          {cross
            ? `${solvent?.name ?? 'Solvent'}${n > 1 ? `, split ${n} ways` : ''}`
            : (solvent?.name ?? 'Solvent')}
        </ChartText>
        <ChartText x={6} y={cross ? y1 + 20 : y0 - 4} fontSize={chart.label} fontWeight="bold">
          {extract?.name ?? 'Extract'}
        </ChartText>
        <ChartText
          x={CX}
          y={cross ? 34 : 36}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.chartMuted}
        >
          {[lab(st.kd), lab(st.ratio)].filter(Boolean).join(' · ')}
        </ChartText>
        {lefts.length > 0 && (
          <ChartText x={6} y={y1 + 34 + 40} fontSize={chart.label} fill={c.chartMuted}>
            left
          </ChartText>
        )}
      </G>
    );
  };

  const bypassDrawing = (): ReactNode => {
    const [feed, vapour, product, bypass, evapFeed, conc] = spec.streams;
    const ym = 120;
    const xs = 40;
    const xm = 300;
    const ex0 = 150;
    const ex1 = 210;
    const yb = ym + 74;
    const ln = (s: CvStream | undefined) => (s ? linesOf(s) : []);
    const wOf = (s: CvStream | undefined) => (s ? widthOf(spec.streams.indexOf(s)) : 2);
    const fl = ln(feed);
    const pl = ln(product);
    const vl = ln(vapour);
    const el = ln(evapFeed).slice(1, 2);
    const cl: LabelLine[] = [{ text: lab(conc?.fractions?.[0]?.x) ?? '' }];
    const bl = ln(bypass);
    return (
      <G>
        <Rect
          x={ex0}
          y={ym - 36}
          width={ex1 - ex0}
          height={72}
          rx={12}
          fill={url(paint.steel)}
          stroke={c.metalDark}
        />
        <Rect
          x={ex0 + 4}
          y={ym - 6}
          width={ex1 - ex0 - 8}
          height={38}
          rx={8}
          fill={url(paint.liquid)}
        />
        <Rect x={ex0} y={ym - 36} width={ex1 - ex0} height={72} rx={12} fill={url(paint.sheen)} />
        <Arrow x1={6} y1={ym} x2={xs} y2={ym} color={flowColor} width={wOf(feed)} />
        <Circle cx={xs} cy={ym} r={4} fill={c.chartInk} />
        <Arrow x1={xs} y1={ym} x2={ex0 - 2} y2={ym} color={flowColor} width={wOf(evapFeed)} />
        <Path
          d={`M ${xs} ${ym} L ${xs} ${yb} L ${xm} ${yb}`}
          stroke={flowColor}
          strokeWidth={wOf(bypass)}
          fill="none"
        />
        <Arrow x1={xm} y1={yb} x2={xm} y2={ym + 4} color={flowColor} width={wOf(bypass)} />
        <Arrow x1={ex1 + 2} y1={ym} x2={xm - 4} y2={ym} color={flowColor} width={wOf(conc)} />
        <Circle cx={xm} cy={ym} r={4} fill={c.chartInk} />
        <Arrow x1={xm} y1={ym} x2={BW - 6} y2={ym} color={flowColor} width={wOf(product)} />
        <Arrow
          x1={(ex0 + ex1) / 2}
          y1={ym - 38}
          x2={(ex0 + ex1) / 2}
          y2={ym - 80}
          color={flowColor}
          width={wOf(vapour)}
        />
        <Block x={6} y={ym - 10} lines={fl} anchor="start" c={c} />
        <Block x={BW - 6} y={ym - 10} lines={pl} anchor="end" c={c} />
        <Block x={(ex0 + ex1) / 2 + 10} y={ym - 66} lines={vl} anchor="start" c={c} />
        <Block
          x={(xs + ex0) / 2 + 4}
          y={ym + 20 + (el.length - 1) * LH}
          lines={el}
          anchor="middle"
          c={c}
        />
        <Block
          x={(ex1 + xm) / 2}
          y={ym + 20 + (cl.length - 1) * LH}
          lines={cl}
          anchor="middle"
          c={c}
        />
        <Block x={CX} y={yb + 18 + (bl.length - 1) * LH} lines={bl} anchor="middle" c={c} />
        <ChartText
          x={(ex0 + ex1) / 2}
          y={ym - 16}
          fontSize={chart.label}
          fontWeight="bold"
          textAnchor="middle"
        >
          Evap.
        </ChartText>
      </G>
    );
  };

  // ── Panels under the drawing ──
  const balancePanel = (): ReactNode =>
    shownRows.length ? (
      <G>
        <ChartText x={8} y={balanceTop + 12} fontSize={chart.label} fontWeight="bold">
          {spec.reaction ? `In + made = out (${spec.reaction.equation})` : 'In = out'}
        </ChartText>
        {shownRows.map((b, k) => {
          const ok = holdsBalance(b);
          const made = b.made ? ` ${b.made > 0 ? '+' : '−'} ${r4(Math.abs(b.made))}` : '';
          return (
            <ChartText
              key={b.name}
              x={8}
              y={balanceTop + 12 + (k + 1) * LH}
              fontSize={chart.label}
              fill={ok ? c.chartInk : c.hopBack}
            >
              {`${b.name}: ${r4(b.into!)}${made} ${ok ? '=' : '≠'} ${r4(b.out!)}${unitName ? ` ${unitName}` : ''}`}
            </ChartText>
          );
        })}
      </G>
    ) : null;

  const energyPanel = (): ReactNode => {
    if (!energy) return null;
    const tIn = energy.into.reduce((a, p) => a + p.value, 0);
    const tOut = energy.out.reduce((a, p) => a + p.value, 0);
    const scale = (BW - 70) / Math.max(1e-9, tIn, tOut);
    const bar = (parts: typeof energy.into, y: number, name: string) => {
      let x = 50;
      return (
        <G>
          <ChartText x={8} y={y + 14} fontSize={chart.label} fontWeight="bold">
            {name}
          </ChartText>
          {parts.map((p, k) => {
            const w = p.value * scale;
            const fill =
              p.of === 'heat'
                ? c.physHot
                : p.of === 'work'
                  ? c.physWork
                  : k % 2
                    ? c.chartSurface
                    : c.chartFill;
            const text = `${p.label} ${r4(p.value)}`;
            const el = (
              <G key={k}>
                <Rect
                  x={x}
                  y={y}
                  width={Math.max(1, w)}
                  height={20}
                  fill={fill}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                {textW(text) < w - 6 && (
                  <ChartText
                    x={x + w / 2}
                    y={y + 14}
                    fontSize={chart.label}
                    textAnchor="middle"
                    fill={p.of === 'heat' || p.of === 'work' ? c.onChartHighlight : c.chartInk}
                  >
                    {text}
                  </ChartText>
                )}
              </G>
            );
            x += w;
            return el;
          })}
        </G>
      );
    };
    const sumText = (parts: typeof energy.into) => parts.map((p) => r4(p.value)).join(' + ');
    return (
      <G>
        <ChartText x={8} y={energyTop + 12} fontSize={chart.label} fontWeight="bold">
          {`Energy, ${energyUnit}: Σṁh in${hasHeat ? ' + Q̇' : ''} = Σṁh out${hasWork ? ' + Ẇ' : ''}`}
        </ChartText>
        {bar(energy.into, energyTop + 20, 'In')}
        {bar(energy.out, energyTop + 46, 'Out')}
        <ChartText x={8} y={energyTop + 84} fontSize={chart.label} fill={c.chartMuted}>
          {`${sumText(energy.into)} = ${r4(tIn)}; ${sumText(energy.out)} = ${r4(tOut)}`}
        </ChartText>
      </G>
    );
  };

  /** ΔP and π on one scale: the water moves only where ΔP passes π, driven by the gap. */
  const pressurePanel = (): ReactNode => {
    if (!pressureBars || !spec.pressure) return null;
    const { dP, pi } = pressureBars;
    const x0 = 50;
    const scale = (BW - 70) / Math.max(dP, pi, 1e-9);
    const y = energyTop + 18;
    const bar = (v: number, yy: number, name: string, fill: string, label: string) => (
      <G>
        <ChartText x={8} y={yy + 13} fontSize={chart.label} fontWeight="bold">
          {name}
        </ChartText>
        <Rect
          x={x0}
          y={yy}
          width={Math.max(1, v * scale)}
          height={18}
          fill={fill}
          stroke={c.chartInk}
          strokeWidth={1}
        />
        {textW(label) + 12 < v * scale ? (
          <ChartText x={x0 + 6} y={yy + 13} fontSize={chart.label} fill={c.onChartHighlight}>
            {label}
          </ChartText>
        ) : (
          <ChartText x={x0 + v * scale + 6} y={yy + 13} fontSize={chart.label}>
            {label}
          </ChartText>
        )}
      </G>
    );
    return (
      <G>
        {bar(dP, y, 'ΔP', c.chartHighlight, lab(spec.pressure.applied) ?? '')}
        {bar(pi, y + 24, 'π', c.cvMembrane, lab(spec.pressure.osmotic) ?? '')}
        {dP > pi && (
          <G>
            <Line
              x1={x0 + pi * scale}
              x2={x0 + pi * scale}
              y1={y + 24}
              y2={y + 2}
              stroke={c.chartInk}
              strokeDasharray={chart.dashFine}
            />
            <ChartText
              x={x0 + ((pi + dP) / 2) * scale}
              y={y + 38}
              fontSize={chart.label}
              textAnchor="middle"
              fill={c.chartInk}
            >
              {`ΔP − π = ${r4(dP - pi)}`}
            </ChartText>
          </G>
        )}
      </G>
    );
  };

  const extrasPanel = (): ReactNode =>
    extras.length ? (
      <G>
        {extras.map((t, k) => (
          <ChartText
            key={k}
            x={8}
            y={extrasTop + 12 + k * LH}
            fontSize={chart.label}
            fontWeight={k === 0 ? 'bold' : undefined}
          >
            {t}
          </ChartText>
        ))}
      </G>
    ) : null;

  // The dashed control volume round the unit (or the whole bypass, or the chain of stages).
  // (The bypass and the stages balance round the whole process: no box would clear their labels.)
  const boundary =
    isStages || isBypass || isStream
      ? undefined
      : { x: UX0 - 14, y: by0 - 12, w: UX1 - UX0 + 28, h: bodyH + 24 };

  const caption = (() => {
    const parts: string[] = [];
    for (const b of shownRows) {
      const made = b.made ? ` ${b.made > 0 ? '+' : '−'} ${r4(Math.abs(b.made))}` : '';
      parts.push(
        `${b.name[0]!.toUpperCase()}${b.name.slice(1)}: ${r4(b.into!)}${made} = ${r4(b.out!)}${unitName ? ` ${unitName}` : ''}.`,
      );
    }
    if (energy) {
      const tIn = energy.into.reduce((a, p) => a + p.value, 0);
      const tOut = energy.out.reduce((a, p) => a + p.value, 0);
      parts.push(`Energy in ${r4(tIn)} = energy out ${r4(tOut)} ${energyUnit}.`);
    }
    if (isStages && spec.stages) {
      const n = get(spec.stages.count);
      const kd = get(spec.stages.kd);
      const ratio = get(spec.stages.ratio);
      if (n !== undefined && kd !== undefined && ratio !== undefined && n >= 1) {
        const E = stageFactor(n, kd, ratio, spec.stages.flow);
        parts.push(
          spec.stages.flow === 'crosscurrent'
            ? `Each stage: E = ${r4(kd)} × ${r4(ratio)} ÷ ${n} = ${r4(E)}, so ${r4(1 / (1 + E))} of the solute stays. After ${n}: ${r4(stagesLeft(n, kd, ratio, 'crosscurrent'))}.`
            : `E = ${r4(kd)} × ${r4(ratio)} = ${r4(E)}; after ${n} countercurrent stages, (E − 1) ÷ (Eⁿ⁺¹ − 1) = ${r4(stagesLeft(n, kd, ratio, 'countercurrent'))} is left.`,
        );
      }
    }
    if (spec.dof && extras.length) parts.push(`${extras[0]}.`);
    // A single stream has nothing to balance; a membrane's result is in its panel already.
    if (!parts.length)
      return isStream || extras.length ? '' : 'Type the flows to balance the unit.';
    return parts.join(' ');
  })();

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Deepen id={paint.steel} from={c.metal} to={c.metalDark} />
              <Sheen id={paint.sheen} />
              <Deepen id={paint.liquid} from={c.waterTop} to={c.waterDeep} />
              <Deepen id={paint.sludge} from={c.cvSludge} to={c.soilDark} />
              <Deepen id={paint.flame} from={c.cvFlameCore} to={c.cvFlame} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {boundary && (
                <Rect
                  x={boundary.x}
                  y={boundary.y}
                  width={boundary.w}
                  height={boundary.h}
                  rx={10}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dash}
                />
              )}
              {isStream ? (
                streamOnly()
              ) : isStages ? (
                stagesDrawing()
              ) : isBypass ? (
                bypassDrawing()
              ) : (
                <G>
                  {body()}
                  {sideArrows()}
                </G>
              )}
              {balancePanel()}
              {energyPanel()}
              {pressurePanel()}
              {extrasPanel()}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

const opt = (x: string | undefined): LabelLine[] => (x ? [{ text: x }] : []);
