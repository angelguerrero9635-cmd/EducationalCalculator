/**
 * HC15 `potentialWell`: a one-dimensional potential in ink (an infinite box, the oscillator's
 * parabola, a step, a barrier, a box with a small bump), the energy levels to scale, ψ or |ψ|²
 * drawn on their own level lines with the nodes ringed, and a transition arrow with ΔE and the
 * photon's λ (PotentialWellSpec in typesHe2b.ts). A diagram: flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { withWorkedFigures } from '@/data/modules/grade';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { PotentialWellSpec } from '@/data/modules/typesHe2b';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { Arrow, LH, r4, useValueLabel } from './he1fKit';
import {
  boxProbability,
  boxPsi,
  ENERGY_J,
  harmonicPsi,
  lengthUnit,
  levelHeight,
  photonWavelength,
  stepScatter,
  stepWave,
  turningPoint,
} from './potentialWellMath';

const BW = 356;
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => [...String(n)].map((d) => SUB[Number(d)] ?? d).join('');
/** The most levels drawn: n = 1 to 8 in a box, v = 0 to 5 for an oscillator. */
const BOX_TOP = 8;
const OSC_TOP = 5;

/** A wavy photon from (x, y), `len` long, ending in an arrowhead. */
function Photon({ x, y, len, color }: { x: number; y: number; len: number; color: string }) {
  const pts = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    return `${i ? 'L' : 'M'} ${x + t * (len - 6)} ${y + 4 * Math.sin(t * 4 * Math.PI)}`;
  }).join(' ');
  return (
    <G>
      <Path d={pts} stroke={color} strokeWidth={1.6} fill="none" />
      <Path
        d={`M ${x + len} ${y} L ${x + len - 7} ${y - 4} L ${x + len - 7} ${y + 4} Z`}
        fill={color}
      />
    </G>
  );
}

/** Hatching outside an infinite wall, from y0 to y1, on the `side` of x. */
function Hatch({
  x,
  y0,
  y1,
  side,
  color,
}: {
  x: number;
  y0: number;
  y1: number;
  side: -1 | 1;
  color: string;
}) {
  const lines: ReactNode[] = [];
  for (let y = y0 + 8; y <= y1; y += 9)
    lines.push(
      <Line key={y} x1={x} y1={y} x2={x + side * 9} y2={y - 8} stroke={color} strokeWidth={1} />,
    );
  return <G>{lines}</G>;
}

/** Potential wells, steps and barriers with their levels and wavefunctions (PotentialWellSpec). */
export function PotentialWell({ spec, calc }: { spec: PotentialWellSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  const figs = calc.module.workedFigures ?? 4;
  /** A known value in its own unit, or undefined while "?" (fixed numbers pass through). */
  const get = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const unitOf = (x: NumOrVar | undefined) => (typeof x === 'string' ? rep.unit(x) : undefined);
  /** A value's number as the page shows it (typed as typed, worked out at its figures). */
  const num = (id: string) => {
    if (rep.typed(id)) return rep.value(id, false);
    return formatNumber(rep.shown(id), withWorkedFigures(rep.variable(id), figs));
  };
  const lab = (x: NumOrVar | undefined) => (typeof x === 'string' ? valueLabel(x) : undefined);
  const moreLines = (spec.more ?? []).map((id) => valueLabel(id)).filter((t): t is string => !!t);

  const model = spec.model;
  const well = model === 'box' || model === 'harmonic' || model === 'bump';
  const osc = model === 'harmonic';
  const letter = spec.letter ?? (osc ? 'v' : 'n');
  const wholeOrNot = (x: number | undefined) =>
    x !== undefined && Number.isInteger(x) && x >= (osc ? 0 : 1) ? x : undefined;
  const lower = wholeOrNot(get(spec.lower));
  const upper = osc
    ? spec.upper === undefined
      ? lower === undefined
        ? undefined
        : lower + 1
      : wholeOrNot(get(spec.upper))
    : wholeOrNot(get(spec.upper));

  // Every level's energy from whichever energy the page knows, in that value's unit.
  const energyBase = (() => {
    const pick = (x: NumOrVar | undefined, per: number | undefined) => {
      const e = get(x);
      if (e === undefined || per === undefined || per === 0 || typeof x !== 'string') return null;
      return { perUnit: rep.shown(x) / per, unit: rep.unit(x) };
    };
    const h = (n: number | undefined) =>
      n === undefined ? undefined : levelHeight(osc ? 'harmonic' : 'box', n);
    return (
      pick(spec.ground, h(osc ? 0 : 1)) ??
      (osc ? pick(spec.spacing, 1) : null) ??
      pick(spec.lowerEnergy, h(lower)) ??
      pick(spec.upperEnergy, h(upper))
    );
  })();
  const levelEnergy = (n: number) =>
    energyBase ? energyBase.perUnit * levelHeight(osc ? 'harmonic' : 'box', n) : undefined;
  /** An energy for a label: 4 figures, 3 in scientific notation (so it fits beside the well). */
  const eText = (x: number, unit?: string) => {
    const sci = x !== 0 && (Math.abs(x) < 1e-3 || Math.abs(x) >= 1e6);
    const n = sci ? formatNumber(Number(x.toPrecision(3)), { scientific: true }) : r4(x);
    return `${n}${unit ? ` ${unit}` : ''}`;
  };

  // The gap and the photon's wavelength: from the page's values, else worked out from the levels.
  const gapText = (() => {
    if (typeof spec.gap === 'string' && rep.known(spec.gap)) return valueLabel(spec.gap);
    if (lower === undefined || upper === undefined || !energyBase || upper <= lower) return;
    return `ΔE = ${eText(levelEnergy(upper)! - levelEnergy(lower)!, energyBase.unit)}`;
  })();
  const lambdaText = (() => {
    if (typeof spec.wavelength === 'string' && rep.known(spec.wavelength))
      return valueLabel(spec.wavelength);
    let joules: number | undefined;
    if (typeof spec.gap === 'string' && rep.known(spec.gap)) {
      const k = ENERGY_J[rep.unit(spec.gap) ?? ''];
      if (k) joules = rep.shown(spec.gap) * k;
    } else if (lower !== undefined && upper !== undefined && energyBase && upper > lower) {
      const k = ENERGY_J[energyBase.unit ?? ''];
      if (k) joules = (levelEnergy(upper)! - levelEnergy(lower)!) * k;
    }
    if (!joules || joules <= 0) return;
    const l = lengthUnit(photonWavelength(joules));
    return `λ = ${r4(l.value)} ${l.unit}`;
  })();

  let body: ReactNode = null;
  let BH = 330;
  let caption = '';
  const top: string[] = [];
  const second: string[] = [];

  if (well) {
    const yT = 14;
    const PH = 236;
    const yB = yT + PH;
    const xL = 58;
    const lit = [...new Set([lower, upper].filter((n): n is number => n !== undefined))];
    // The well narrows to leave room for the longest energy label on the right.
    const longest = Math.max(
      0,
      ...lit.map((n) => {
        const e = levelEnergy(n);
        return e === undefined ? 0 : `E${sub(n)} = ${eText(e, energyBase?.unit)}`.length * 6.9;
      }),
    );
    const xR = Math.min(osc ? 222 : 214, BW - 8 - longest - (osc ? 26 : 30));
    const xc = (xL + xR) / 2;
    const square = !!spec.square || model === 'bump' || spec.region !== undefined;
    const highest = Math.max(osc ? 0 : 1, ...lit);
    const cap = osc ? OSC_TOP : BOX_TOP;
    const over = highest > cap;
    const nTop =
      model === 'bump'
        ? Math.min(cap, Math.max(2, highest + 1))
        : Math.min(cap, Math.max(osc ? 3 : 3, highest + 1));
    const nMin = osc ? 0 : 1;
    const eTop = osc ? nTop + 1 : levelHeight('box', nTop) * (model === 'bump' ? 1.12 : 1.08);
    /** y of an energy in level units (E₁ in a box, ħω for an oscillator). */
    const yE = (e: number) => yB - (e / eTop) * PH;
    const yLevel = (n: number) => yE(levelHeight(osc ? 'harmonic' : 'box', n));
    const xiMax = Math.sqrt(2 * eTop);
    const xOfXi = (xi: number) => xc + (xi / xiMax) * ((xR - xL) / 2);
    const levels = Array.from({ length: nTop - nMin + 1 }, (_, i) => nMin + i);

    // In the box, positions read against L in its unit.
    const L = get(spec.length);
    const sOf = (x: number | undefined) =>
      x === undefined || L === undefined || L <= 0 ? undefined : Math.min(1, Math.max(0, x / L));
    const s1 = sOf(get(spec.region?.from));
    const s2 = sOf(get(spec.region?.to));
    const xOfS = (s: number) => xL + s * (xR - xL);

    // The bump's height on the energy scale (in E₁), when the level's energy and V₀ share a unit.
    const V0 = get(spec.bump);
    const bumpUnit = unitOf(spec.bump);
    const bumpLevels =
      V0 !== undefined && energyBase && energyBase.unit === bumpUnit
        ? V0 / energyBase.perUnit
        : undefined;
    const shiftE = get(spec.shift);
    const shiftLevels =
      shiftE !== undefined && energyBase && energyBase.unit === unitOf(spec.shift)
        ? shiftE / energyBase.perUnit
        : undefined;

    /** ψ (or |ψ|²) of level n as a function of the drawing's x, scaled to peak 1. */
    const psiOf = (n: number) => {
      if (!osc) return (x: number) => boxPsi(n, (x - xL) / (xR - xL));
      let peak = 0;
      for (let i = 0; i <= 200; i++)
        peak = Math.max(peak, Math.abs(harmonicPsi(n, -xiMax + (2 * xiMax * i) / 200)));
      return (x: number) => harmonicPsi(n, ((x - xc) / ((xR - xL) / 2)) * xiMax) / peak;
    };
    /** The room above and below a level before the next line. */
    const room = (n: number) => {
      const y = yLevel(n);
      const above = n < nTop ? y - yLevel(n + 1) : y - yT + 10;
      const below = n > nMin ? yLevel(n - 1) - y : yB - y;
      return { above, below };
    };
    const wave = (n: number) => {
      const f = psiOf(n);
      const { above, below } = room(n);
      const amp = square ? Math.min(0.82 * above, 64) : Math.min(0.44 * above, 0.44 * below, 34);
      const y0 = yLevel(n);
      const xs = Array.from({ length: 121 }, (_, i) => xL + ((xR - xL) * i) / 120);
      const g = (x: number) => (square ? f(x) ** 2 : f(x));
      const d = xs.map((x, i) => `${i ? 'L' : 'M'} ${x} ${y0 - amp * g(x)}`).join(' ');
      // Nodes: where ψ crosses zero inside the well (sampled between the drawn points).
      const nodes: number[] = [];
      const mid = Array.from({ length: 240 }, (_, i) => xL + ((xR - xL) * (i + 0.5)) / 240);
      for (let i = 1; i < mid.length; i++) {
        const [a, b] = [f(mid[i - 1]!), f(mid[i]!)];
        if (a * b < 0) nodes.push(mid[i - 1]! + ((mid[i]! - mid[i - 1]!) * a) / (a - b));
      }
      // The shaded stretch x₁ to x₂ under |ψ|², the chance P.
      let shade: string | undefined;
      if (square && s1 !== undefined && s2 !== undefined && s2 > s1 && n === (lower ?? n)) {
        const pts = Array.from({ length: 61 }, (_, i) => xOfS(s1 + ((s2 - s1) * i) / 60));
        shade =
          `M ${pts[0]} ${y0} ` +
          pts.map((x) => `L ${x} ${y0 - amp * g(x)}`).join(' ') +
          ` L ${pts[pts.length - 1]} ${y0} Z`;
      }
      return {
        d,
        nodes,
        amp,
        y0,
        shade,
        fill: square ? `${d} L ${xR} ${y0} L ${xL} ${y0} Z` : undefined,
      };
    };

    // Left labels "n = 3" for every level, skipping any that would touch a lit one.
    const leftLabels: { n: number; y: number }[] = [];
    [...levels]
      .sort((a, b) => Number(lit.includes(b)) - Number(lit.includes(a)) || b - a)
      .forEach((n) => {
        const y = yLevel(n) + 4;
        if (leftLabels.every((l) => Math.abs(l.y - y) >= 15)) leftLabels.push({ n, y });
      });

    // Right labels: each lit level's energy, and the bump's estimate.
    const rightX = osc ? xR + 26 : xR + 30;
    const rightLabels: { text: string; y: number; bold?: boolean }[] = [];
    lit.forEach((n) => {
      if (n > cap) return;
      const e = levelEnergy(n);
      if (e !== undefined)
        rightLabels.push({
          text: `E${sub(n)} = ${eText(e, energyBase?.unit)}`,
          y: yLevel(n) + 4,
          bold: true,
        });
    });
    const estimateY =
      model === 'bump' && lower !== undefined && shiftLevels !== undefined && lower <= cap
        ? yE(levelHeight('box', lower) + shiftLevels)
        : undefined;
    if (estimateY !== undefined && energyBase && lower !== undefined) {
      const mine = rightLabels.find((l) => l.y === yLevel(lower) + 4);
      if (mine && yLevel(lower) - estimateY < 16) mine.y = yLevel(lower) + 15;
      rightLabels.push({
        text: `E ≈ ${eText(levelEnergy(lower)! + shiftE!, energyBase.unit)}`,
        y: estimateY - 4,
      });
    }

    const arrowOk = lower !== undefined && upper !== undefined && upper > lower && upper <= cap;
    const yUp = arrowOk ? yLevel(upper) : 0;
    const yLo = arrowOk ? yLevel(lower) : 0;
    const ax = xR + 14;

    body = (
      <G>
        {/* The potential: walls, or the parabola, in ink. */}
        {osc ? (
          <Path
            d={Array.from({ length: 81 }, (_, i) => {
              const xi = -xiMax + (2 * xiMax * i) / 80;
              return `${i ? 'L' : 'M'} ${xOfXi(xi)} ${yE((xi * xi) / 2)}`;
            }).join(' ')}
            stroke={c.chartInk}
            strokeWidth={2.4}
            fill="none"
          />
        ) : (
          <G>
            <Hatch x={xL} y0={yT - 8} y1={yB} side={-1} color={c.chartMuted} />
            <Hatch x={xR} y0={yT - 8} y1={yB} side={1} color={c.chartMuted} />
            <Path
              d={`M ${xL} ${yT - 8} L ${xL} ${yB} L ${xR} ${yB} L ${xR} ${yT - 8}`}
              stroke={c.chartInk}
              strokeWidth={2.6}
              fill="none"
            />
          </G>
        )}
        {/* The bump V₀ from x₁ to x₂, on the floor. */}
        {model === 'bump' && s1 !== undefined && s2 !== undefined && s2 > s1 && V0 !== undefined ? (
          <Rect
            x={xOfS(s1)}
            y={yB - Math.max(4, bumpLevels !== undefined ? (bumpLevels / eTop) * PH : 6)}
            width={xOfS(s2) - xOfS(s1)}
            height={Math.max(4, bumpLevels !== undefined ? (bumpLevels / eTop) * PH : 6)}
            fill={c.wellBump}
            opacity={0.55}
            stroke={c.wellBump}
            strokeWidth={1.2}
          />
        ) : null}
        {/* Levels: oscillator levels between their turning points, box levels wall to wall. */}
        {levels.map((n) => {
          const on = lit.includes(n);
          const [x1, x2] = osc
            ? [xOfXi(-turningPoint(n)), xOfXi(turningPoint(n))]
            : [xL + 1.5, xR - 1.5];
          return (
            <Line
              key={n}
              x1={x1}
              x2={x2}
              y1={yLevel(n)}
              y2={yLevel(n)}
              stroke={on ? c.chartInk : c.chartMuted}
              strokeWidth={on ? 1.6 : 1}
              strokeDasharray={on ? undefined : chart.dashFine}
            />
          );
        })}
        {estimateY !== undefined ? (
          <Line
            x1={xL + 2}
            x2={xR - 2}
            y1={estimateY}
            y2={estimateY}
            stroke={c.wellBump}
            strokeWidth={1.6}
            strokeDasharray={chart.dash}
          />
        ) : null}
        {/* ψ (or |ψ|²) on each lit level, its nodes ringed. */}
        {lit
          .filter((n) => n <= cap)
          .map((n) => {
            const w = wave(n);
            return (
              <G key={n}>
                {w.fill ? <Path d={w.fill} fill={c.wellPsiFill} opacity={0.35} /> : null}
                {w.shade ? <Path d={w.shade} fill={c.wellPsi} opacity={0.45} /> : null}
                <Path d={w.d} stroke={c.wellPsi} strokeWidth={2} fill="none" />
                {w.nodes.map((x) => (
                  <Circle
                    key={x}
                    cx={x}
                    cy={w.y0}
                    r={3.2}
                    fill={c.background}
                    stroke={c.wellPsi}
                    strokeWidth={1.4}
                  />
                ))}
              </G>
            );
          })}
        {/* ⟨x⟩ and ±Δx on the lit level. */}
        {(() => {
          const m = sOf(get(spec.mean));
          const dx = get(spec.spread);
          if (m === undefined || lower === undefined) return null;
          const y0 = yLevel(lower);
          const sd = dx !== undefined && L ? dx / L : undefined;
          return (
            <G>
              <Line
                x1={xOfS(m)}
                x2={xOfS(m)}
                y1={y0 + 6}
                y2={y0 - 74}
                stroke={c.chartInk}
                strokeWidth={1.2}
                strokeDasharray={chart.dash}
              />
              {sd !== undefined ? (
                <G>
                  <Line
                    x1={xOfS(m - sd)}
                    x2={xOfS(m + sd)}
                    y1={yB + 30}
                    y2={yB + 30}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                  />
                  {[m - sd, m + sd].map((s) => (
                    <Line
                      key={s}
                      x1={xOfS(s)}
                      x2={xOfS(s)}
                      y1={yB + 25}
                      y2={yB + 35}
                      stroke={c.chartInk}
                      strokeWidth={1.2}
                    />
                  ))}
                  <ChartText x={xOfS(m)} y={yB + 48} textAnchor="middle" fontSize={chart.label}>
                    ⟨x⟩ ± Δx
                  </ChartText>
                </G>
              ) : null}
            </G>
          );
        })()}
        {/* The transition arrow and its photon. */}
        {arrowOk ? (
          <G>
            <Arrow
              x1={ax}
              y1={spec.absorb ? yLo : yUp}
              x2={ax}
              y2={spec.absorb ? yUp : yLo}
              color={c.wellPhoton}
              width={2}
            />
            {Math.abs(yLo - yUp) > 26 ? (
              <Photon x={ax + 5} y={(yLo + yUp) / 2} len={rightX - ax + 20} color={c.wellPhoton} />
            ) : null}
          </G>
        ) : null}
        {leftLabels.map((l) => (
          <ChartText
            key={l.n}
            x={osc ? 46 : xL - 14}
            y={l.y}
            textAnchor="end"
            fontSize={chart.label}
            fontWeight={lit.includes(l.n) ? 'bold' : undefined}
            fill={lit.includes(l.n) ? c.chartInk : c.chartMuted}
          >
            {`${letter} = ${l.n}`}
          </ChartText>
        ))}
        {rightLabels.map((l) => (
          <ChartText
            key={l.text}
            x={rightX}
            y={l.y}
            fontSize={chart.label}
            fontWeight={l.bold ? 'bold' : undefined}
            fill={l.bold ? c.chartInk : c.wellBump}
          >
            {l.text}
          </ChartText>
        ))}
        {/* Under the floor: 0 and L; the region x₁ to x₂. */}
        {!osc ? (
          <G>
            <ChartText
              x={xL}
              y={yB + 16}
              textAnchor="middle"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              0
            </ChartText>
            <ChartText
              x={xR}
              y={yB + 16}
              textAnchor="middle"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              {L !== undefined && typeof spec.length === 'string'
                ? `L = ${num(spec.length)}${rep.unit(spec.length) ? ` ${rep.unit(spec.length)}` : ''}`
                : 'L'}
            </ChartText>
          </G>
        ) : (
          <ChartText
            x={xc}
            y={yB + 16}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            x = 0
          </ChartText>
        )}
        {s1 !== undefined && s2 !== undefined && s2 > s1 && spec.mean === undefined
          ? (() => {
              const text = `x₁ to x₂: ${num(spec.region!.from as string)} to ${num(spec.region!.to as string)}${rep.unit(spec.region!.to as string) ? ` ${rep.unit(spec.region!.to as string)}` : ''}`;
              const f = fitLabel((xOfS(s1) + xOfS(s2)) / 2, text, chart.label, BW);
              return (
                <G>
                  <Line
                    x1={xOfS(s1)}
                    x2={xOfS(s2)}
                    y1={yB + 26}
                    y2={yB + 26}
                    stroke={c.chartInk}
                    strokeWidth={1.2}
                  />
                  {[s1, s2].map((s) => (
                    <Line
                      key={s}
                      x1={xOfS(s)}
                      x2={xOfS(s)}
                      y1={yB + 21}
                      y2={yB + 31}
                      stroke={c.chartInk}
                      strokeWidth={1.2}
                    />
                  ))}
                  <ChartText x={f.x} y={yB + 44} textAnchor={f.textAnchor} fontSize={chart.label}>
                    {text}
                  </ChartText>
                </G>
              );
            })()
          : null}
      </G>
    );
    BH = yB + (spec.region || spec.spread ? 54 : 26);

    // The top rows and the caption.
    const nm = (n: number) => `${letter}${sub(n)}`;
    if (arrowOk) {
      const [from, to] = spec.absorb ? [lower, upper] : [upper, lower];
      top.push([`${letter} = ${from} → ${to}`, gapText, lambdaText].filter(Boolean).join(' · '));
    }
    if (model === 'bump') {
      top.push([lab(spec.shift), lab(spec.bump)].filter(Boolean).join(' · '));
    } else if (spec.region && typeof spec.probability === 'string') {
      const p = lab(spec.probability);
      if (p) top.push(p);
    }
    if (spec.mean !== undefined)
      top.push([lab(spec.mean), lab(spec.spread)].filter(Boolean).join(' · '));
    second.push(
      ...[lab(spec.length), lab(spec.mass), lab(spec.force), lab(spec.omega)].filter(
        (t): t is string => !!t,
      ),
    );
    if (osc && typeof spec.spacing === 'string' && rep.known(spec.spacing) && !arrowOk)
      second.push(valueLabel(spec.spacing)!);

    const parts: string[] = [];
    if (osc) {
      parts.push(
        `E${letter === 'v' ? 'ᵥ' : 'ₙ'} = (${letter} + ½)ħω: the levels are evenly spaced by ħω, starting from ½ħω, never 0.`,
      );
      const v = Math.max(...lit.filter((n) => n <= cap));
      if (v > 0)
        parts.push(
          `ψ${sub(v)} has ${v} node${v === 1 ? '' : 's'}; each ψ leaks past its turning points.`,
        );
      else if (v === 0) parts.push('ψ₀ has no nodes and leaks past its turning points.');
    } else if (model === 'box') {
      parts.push('Eₙ = n²h² ÷ (8mL²): the levels grow as n², and ψ = 0 at both walls.');
      const n = Math.max(...lit.filter((k) => k <= cap));
      if (n > 1 && spec.region === undefined && spec.mean === undefined)
        parts.push(`ψ${sub(n)} has ${n - 1} node${n === 2 ? '' : 's'}, ringed.`);
      if (spec.region && lower !== undefined && s1 !== undefined && s2 !== undefined && s2 > s1) {
        const P = boxProbability(lower, s1, s2);
        parts.push(
          `The shaded area of |ψ${sub(lower)}|² is P = ${r4(P)}; a classical particle would give ${r4(s2 - s1)}.`,
        );
      }
      if (spec.mean !== undefined)
        parts.push('|ψ|² is even about L ÷ 2, so ⟨x⟩ = L ÷ 2 for every n.');
    } else if (lower !== undefined && s1 !== undefined && s2 !== undefined && s2 > s1) {
      const P = boxProbability(lower, s1, s2);
      parts.push(
        `E⁽¹⁾ = V₀ × P, where P = ${r4(P)} is the shaded area of |ψ${sub(lower)}|² over the bump: a bump where ψ is large shifts E most.`,
      );
      if (bumpLevels !== undefined && (bumpLevels / eTop) * PH < 4)
        parts.push('The bump is drawn at least 4 px tall.');
    }
    if (arrowOk && lambdaText) parts.push(`${spec.absorb ? 'Absorbed' : 'Emitted'}: λ = hc ÷ ΔE.`);
    if (over)
      parts.push(`${nm(highest)} lies above the top: the drawing shows ${letter} up to ${cap}.`);
    if (lower !== undefined && upper !== undefined && upper <= lower && !osc)
      parts.push('The upper level must be above the lower one, so no arrow is drawn.');
    caption = parts.join(' ');
  } else if (model === 'step') {
    const E = get(spec.energy);
    const U = get(spec.height);
    const yT = 56;
    const PH = 190;
    const yB = yT + PH;
    const x0 = 16;
    const x1 = BW - 16;
    const xs = (x0 + x1) / 2 + 10;
    const known = E !== undefined && U !== undefined && E > 0 && U >= 0;
    const eTop = known ? Math.max(E, U) * 1.35 : 1;
    const yE = (e: number) => yB - (e / eTop) * PH;
    const yU = known ? yE(U) : yB - PH * 0.55;
    const yEn = known ? yE(E) : yB - PH * 0.75;
    const k1 = (2 * Math.PI) / 44;
    const above = known && E > U;
    const room = known ? Math.max(8, Math.min(26, above ? 0.45 * (yU - yEn) : 26)) : 22;
    const f = known ? stepWave(E, U, k1) : undefined;
    let peak = 1;
    if (f) for (let x = x0; x <= x1; x += 2) peak = Math.max(peak, Math.abs(f(x - xs)));
    const scat = above ? stepScatter(E, U) : undefined;
    body = (
      <G>
        <Rect x={xs} y={yU} width={x1 - xs} height={yB - yU} fill={c.chartFill} />
        <Path
          d={`M ${x0} ${yB} L ${xs} ${yB} L ${xs} ${yU} L ${x1} ${yU}`}
          stroke={c.chartInk}
          strokeWidth={2.6}
          fill="none"
        />
        <Line
          x1={x0}
          x2={x1}
          y1={yEn}
          y2={yEn}
          stroke={c.chartMuted}
          strokeWidth={1.2}
          strokeDasharray={chart.dash}
        />
        {f ? (
          <Path
            d={Array.from({ length: 161 }, (_, i) => {
              const x = x0 + ((x1 - x0) * i) / 160;
              return `${i ? 'L' : 'M'} ${x} ${yEn - (room / peak) * f(x - xs)}`;
            }).join(' ')}
            stroke={c.wellPsi}
            strokeWidth={2}
            fill="none"
          />
        ) : null}
        <ChartText x={x0} y={yEn - room - 8} fontSize={chart.label} fontWeight="bold">
          {lab(spec.energy) ?? 'E'}
        </ChartText>
        <ChartText
          x={x1}
          y={Math.min(yB - 6, yU + 18)}
          textAnchor="end"
          fontSize={chart.label}
          fontWeight="bold"
        >
          {lab(spec.height) ?? 'U₀'}
        </ChartText>
        <ChartText
          x={xs}
          y={yB + 16}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          x = 0
        </ChartText>
        {/* Incident, reflected and transmitted arrows. */}
        <Arrow x1={x0 + 6} y1={24} x2={x0 + 46} y2={24} color={c.wellPsi} />
        <ChartText x={x0 + 52} y={28} fontSize={chart.label}>
          incident
        </ChartText>
        {scat || (known && !above) ? (
          <G>
            <Arrow x1={xs - 24} y1={44} x2={xs - 64} y2={44} color={c.wellPsi} />
            <ChartText x={xs - 70} y={48} textAnchor="end" fontSize={chart.label}>
              {lab(spec.reflection) ?? (scat ? `R = ${r4(scat.R)}` : 'R = 1')}
            </ChartText>
          </G>
        ) : null}
        {scat ? (
          <G>
            <Arrow x1={xs + 16} y1={24} x2={xs + 56} y2={24} color={c.wellPsi} />
            <ChartText x={xs + 62} y={28} fontSize={chart.label}>
              {lab(spec.transmission) ?? `T = ${r4(scat.T)}`}
            </ChartText>
          </G>
        ) : null}
      </G>
    );
    BH = yB + 24;
    caption = !known
      ? 'Type E and U₀ to draw the wave.'
      : above
        ? `Past the step the wave is longer: k₁ ÷ k₂ = √(E ÷ (E − U₀)) = ${r4(scat!.ratio)}. R = ((k₁ − k₂) ÷ (k₁ + k₂))² = ${r4(scat!.R)}; a classical particle would never reflect.`
        : 'E is below the step’s top: ψ decays into the step and every particle is reflected (R = 1).';
  } else {
    // The barrier.
    const E = get(spec.energy);
    const U = get(spec.height);
    const kappa = get(spec.kappa);
    const a = get(spec.width);
    const yT = 56;
    const PH = 190;
    const yB = yT + PH;
    const x0 = 16;
    const x1 = BW - 16;
    const xa = 140;
    const xb = 236;
    const scaled = E !== undefined && U !== undefined && U > E && E > 0;
    const eTop = scaled ? U * 1.3 : 1;
    const yU = scaled ? yB - (U / eTop) * PH : yB - 0.78 * PH;
    const yEn = scaled ? yB - (E / eTop) * PH : yB - 0.42 * PH;
    const ka = kappa !== undefined && a !== undefined ? kappa * a : undefined;
    const amp = Math.min(30, 0.42 * (yB - yEn), 0.8 * (yEn - yU));
    const k = (2 * Math.PI) / 40;
    const psi = (x: number) => {
      if (x < xa) return Math.cos(k * (x - xa));
      if (ka === undefined) return NaN;
      if (x <= xb) return Math.exp((-ka * (x - xa)) / (xb - xa));
      return Math.exp(-ka) * Math.cos(k * (x - xb));
    };
    const pts = Array.from({ length: 201 }, (_, i) => x0 + ((x1 - x0) * i) / 200)
      .filter((x) => Number.isFinite(psi(x)))
      .map((x, i) => `${i ? 'L' : 'M'} ${x} ${yEn - amp * psi(x)}`)
      .join(' ');
    body = (
      <G>
        <Rect x={xa} y={yU} width={xb - xa} height={yB - yU} fill={c.chartFill} />
        <Path
          d={`M ${x0} ${yB} L ${xa} ${yB} L ${xa} ${yU} L ${xb} ${yU} L ${xb} ${yB} L ${x1} ${yB}`}
          stroke={c.chartInk}
          strokeWidth={2.6}
          fill="none"
        />
        <Line
          x1={x0}
          x2={x1}
          y1={yEn}
          y2={yEn}
          stroke={c.chartMuted}
          strokeWidth={1.2}
          strokeDasharray={chart.dash}
        />
        <Path d={pts} stroke={c.wellPsi} strokeWidth={2} fill="none" />
        {/* U − E: a bracket on the barrier's right face. */}
        <Line x1={xb + 10} x2={xb + 10} y1={yU} y2={yEn} stroke={c.chartInk} strokeWidth={1.2} />
        {[yU, yEn].map((y) => (
          <Line
            key={y}
            x1={xb + 5}
            x2={xb + 15}
            y1={y}
            y2={y}
            stroke={c.chartInk}
            strokeWidth={1.2}
          />
        ))}
        <ChartText x={xb + 20} y={(yU + yEn) / 2 + 4} fontSize={chart.label} fontWeight="bold">
          {lab(spec.above) ?? 'U − E'}
        </ChartText>
        <ChartText x={x0} y={yEn - amp - 8} fontSize={chart.label} fontWeight="bold">
          {lab(spec.energy) ?? 'E'}
        </ChartText>
        {lab(spec.height) ? (
          <ChartText
            x={(xa + xb) / 2}
            y={yU - 8}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="bold"
          >
            {lab(spec.height)!}
          </ChartText>
        ) : null}
        {/* The width a. */}
        <Line x1={xa} x2={xb} y1={yB + 14} y2={yB + 14} stroke={c.chartInk} strokeWidth={1.2} />
        {[xa, xb].map((x) => (
          <Line
            key={x}
            x1={x}
            x2={x}
            y1={yB + 9}
            y2={yB + 19}
            stroke={c.chartInk}
            strokeWidth={1.2}
          />
        ))}
        <ChartText x={(xa + xb) / 2} y={yB + 32} textAnchor="middle" fontSize={chart.label}>
          {lab(spec.width) ?? 'a'}
        </ChartText>
      </G>
    );
    BH = yB + 40;
    top.push([lab(spec.kappa), lab(spec.transmission)].filter(Boolean).join(' · '));
    second.push(...[lab(spec.mass)].filter((t): t is string => !!t));
    caption =
      ka === undefined
        ? 'Type κ and a to draw ψ inside the barrier.'
        : `Inside, ψ falls as e^(−κx): across a it shrinks to e^(−κa) = ${r4(Math.exp(-ka))} of its size, so T ≈ e^(−2κa) = ${r4(Math.exp(-2 * ka))}.` +
          (scaled ? '' : ' Heights are not to scale (the page gives U − E only); the decay is.');
  }

  const rows = [
    ...top.filter(Boolean).map((t) => ({ t, bold: true })),
    ...second.map((t) => ({ t, bold: false })),
  ];
  // Wells write their values above the picture; steps and barriers keep their arrows up top,
  // so their values go under it.
  const above = well ? rows : [];
  const below = well ? [] : rows;
  const shift = above.length ? 8 + above.length * 16 : 0;
  BH += shift;
  const moreTop = BH;
  if (below.length || moreLines.length) BH += (below.length + moreLines.length) * LH + 8;

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / BW})`}>
              <G transform={`translate(0, ${shift})`}>{body}</G>
              {above.map((r, k) => (
                <ChartText
                  key={r.t}
                  x={8}
                  y={16 + k * 16}
                  fontSize={chart.label}
                  fontWeight={r.bold ? 'bold' : undefined}
                  fill={r.bold ? c.chartInk : c.chartMuted}
                >
                  {r.t}
                </ChartText>
              ))}
              {[...below.map((r) => r.t), ...moreLines].map((t, k) => (
                <ChartText
                  key={t}
                  x={8}
                  y={moreTop + 6 + k * LH}
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {t}
                </ChartText>
              ))}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
