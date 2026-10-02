/**
 * `orbitalDiagram` mode `mo` (HC70, `typesHe3e.ts`), flat, energy up the page: a second-period
 * diatomic's MO diagram (AOs at the sides, MOs between, filled), a heteronuclear pair's two MOs
 * from the secular determinant to scale, or a Hückel ring's Frost circle. The sums are in
 * `orbitalMoMath.ts`.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon } from 'react-native-svg';

import type { OrbitalMoSpec } from '@/data/modules/typesHe3e';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { subscript } from './chem';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { fig3 } from './he1dText';
import {
  DIATOMIC_NAMES,
  diatomicMOs,
  frost,
  frostText,
  heteronuclear,
  VALENCE,
} from './orbitalMoMath';

const ORB = 24;
const GAP = 6;

/** Up and down arrows on a level line at (x, y): `n` electrons (0, 1 or 2). */
function Electrons({ x, y, n, c }: { x: number; y: number; n: number; c: Palette }) {
  const arrow = (ax: number, up: boolean, color: string) => {
    const [a, b] = up ? [y + 8, y - 8] : [y - 8, y + 8];
    const d = up ? 1 : -1;
    return (
      <G>
        <Line x1={ax} y1={a} x2={ax} y2={b + d * 3} stroke={color} strokeWidth={1.6} />
        <Path d={`M ${ax} ${b} l -3 ${d * 5} l 6 0 z`} fill={color} />
      </G>
    );
  };
  if (n <= 0) return null;
  if (n === 1) return arrow(x, true, c.chartHighlight);
  return (
    <G>
      {arrow(x - 4, true, c.chartInk)}
      {arrow(x + 4, false, c.chartInk)}
    </G>
  );
}

/** A level of `fill.length` orbitals centred on x: short lines, each with its electrons. */
function Level({
  x,
  y,
  fill,
  color,
  c,
  show = true,
}: {
  x: number;
  y: number;
  fill: number[];
  color: string;
  c: Palette;
  show?: boolean;
}) {
  const n = fill.length;
  const span = n * ORB + (n - 1) * GAP;
  return (
    <G>
      {fill.map((e, k) => {
        const x0 = x - span / 2 + k * (ORB + GAP);
        return (
          <G key={k}>
            <Line x1={x0} y1={y} x2={x0 + ORB} y2={y} stroke={color} strokeWidth={chart.stroke} />
            {show ? <Electrons x={x0 + ORB / 2} y={y} n={e} c={c} /> : null}
          </G>
        );
      })}
    </G>
  );
}

const half = (n: number) => (n * ORB + (n - 1) * GAP) / 2;

/** The energy arrow up the left edge. */
function EnergyArrow({ y0, y1, c }: { y0: number; y1: number; c: Palette }) {
  return (
    <G>
      <Line x1={10} y1={y0} x2={10} y2={y1 + 4} stroke={c.chartMuted} strokeWidth={1.2} />
      <Path d={`M 10 ${y1} l -4 8 l 8 0 z`} fill={c.chartMuted} />
    </G>
  );
}

export function OrbitalMo({ spec, calc }: { spec: OrbitalMoSpec; calc: Calculator }) {
  if (spec.view === 'heteronuclear') return <Hetero spec={spec} calc={calc} />;
  if (spec.view === 'frost') return <Frost spec={spec} calc={calc} />;
  return <Diatomic spec={spec} calc={calc} />;
}

// ─── Diatomic ────────────────────────────────────────────────────────────────

function Diatomic({ spec, calc }: { spec: OrbitalMoSpec; calc: Calculator }) {
  const c = usePalette();
  const read = reader(useRep(calc));
  const er = spec.electrons === undefined ? undefined : read(spec.electrons);
  const known = !!er?.known;
  const mo = diatomicMOs(known ? er!.value : 0);
  const name = spec.formula
    ? subscript(spec.formula).replace(/\+$/, '⁺').replace(/-$/, '⁻')
    : known
      ? DIATOMIC_NAMES[mo.electrons]
      : undefined;
  const symbol = (spec.formula ?? name ?? '').match(/^[A-Z][a-z]?/)?.[0];
  const perAtom = symbol ? VALENCE[symbol] : undefined;
  // AO electrons only for the neutral molecule: each atom's own valence electrons.
  const neutral = known && perAtom !== undefined && 2 * perAtom === mo.electrons;
  const aoFill = (n: number) => {
    const s = Math.min(2, n);
    const p = [0, 0, 0];
    for (let k = 0; k < Math.max(0, n - 2); k++) p[k % 3]! += 1;
    return { s: [s], p };
  };
  const ao = aoFill(perAtom ?? 0);
  const height = 330;

  const art = (w: number): ReactNode => {
    const top = 42;
    const bottom = height - 34;
    const yOf = (E: number) => bottom - ((E + 1.6) / 8) * (bottom - top);
    const xA = 30 + half(3);
    const xB = w - 6 - half(3);
    const xM = w / 2;
    const aoLevels = [
      { name: '2s', E: 0, fill: ao.s },
      { name: '2p', E: 4, fill: ao.p },
    ];
    const joins = mo.levels.map((l) => (l.name.includes('2s') ? 0 : 1));
    return (
      <Svg width={w} height={height}>
        <EnergyArrow y0={bottom} y1={top} c={c} />
        <ChartText x={16} y={top + 6} fontSize={chart.label} fill={c.chartMuted}>
          Energy
        </ChartText>
        {/* Dashed lines from each AO to the MOs it makes. */}
        {mo.levels.map((l, i) => {
          const a = aoLevels[joins[i]!]!;
          const ya = yOf(a.E);
          const ym = yOf(l.energy);
          const hm = half(l.degen);
          return (
            <G key={`j${l.name}`}>
              <Line
                x1={xA + half(a.fill.length)}
                y1={ya}
                x2={xM - hm}
                y2={ym}
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
              {/* On the right the line leaves past the MO's name, not through it. */}
              <Line
                x1={xB - half(a.fill.length)}
                y1={ya}
                x2={xM + hm + 10 + l.name.length * chart.label * 0.62}
                y2={ym}
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
            </G>
          );
        })}
        {aoLevels.map((a) =>
          [xA, xB].map((x) => (
            <G key={`${a.name}${x}`}>
              <Level x={x} y={yOf(a.E)} fill={a.fill} color={c.chartInk} c={c} show={neutral} />
              <ChartText
                x={x}
                y={yOf(a.E) + 22}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
                fill={c.chartMuted}
              >
                {a.name}
              </ChartText>
            </G>
          )),
        )}
        {mo.levels.map((l) => (
          <G key={l.name}>
            <Level
              x={xM}
              y={yOf(l.energy)}
              fill={l.fill}
              color={l.bonding ? c.moBonding : c.moAntibonding}
              c={c}
              show={known}
            />
            <ChartText
              x={xM + half(l.degen) + 6}
              y={yOf(l.energy) + 4}
              fontSize={chart.label}
              fontWeight="700"
              fill={l.bonding ? c.moBonding : c.moAntibonding}
              halo
            >
              {l.name}
            </ChartText>
          </G>
        ))}
        {[
          [xA, symbol ?? 'A'],
          [xM, name ?? 'molecule'],
          [xB, symbol ?? 'B'],
        ].map(([x, t]) => (
          <ChartText
            key={String(x)}
            x={Number(x)}
            y={height - 8}
            fontSize={chart.value}
            fontWeight="700"
            textAnchor="middle"
          >
            {String(t)}
          </ChartText>
        ))}
        {known ? (
          <ChartText x={w / 2} y={18} fontSize={chart.value} fontWeight="700" textAnchor="middle">
            {`Bond order (${mo.bonding} − ${mo.antibonding}) ÷ 2 = ${formatNumber(mo.bondOrder)}`}
          </ChartText>
        ) : null}
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => height / w}>{({ w }) => art(w)}</Canvas>
      <Caption>
        {known
          ? [
              `${name ?? 'The molecule'}: ${mo.electrons} valence electrons, filled from σ2s up${mo.mixed ? '; through N₂, s–p mixing puts π2p below σ2p' : '; from O₂ on, σ2p lies below π2p'}.`,
              `Bonding ${mo.bonding}, antibonding ${mo.antibonding} (lit red): bond order ${formatNumber(mo.bondOrder)}.`,
              mo.unpaired
                ? `${mo.unpaired} unpaired electron${mo.unpaired === 1 ? '' : 's'} (lit): paramagnetic.`
                : 'No unpaired electrons: diamagnetic.',
              neutral ? undefined : 'The atoms’ own electrons are left off for an ion.',
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type the number of valence electrons.'}
      </Caption>
    </View>
  );
}

// ─── Heteronuclear ───────────────────────────────────────────────────────────

function Hetero({ spec, calc }: { spec: OrbitalMoSpec; calc: Calculator }) {
  const c = usePalette();
  const read = reader(useRep(calc));
  const opt = (x: number | string | undefined) => (x === undefined ? undefined : read(x));
  const [aA, aB, b] = [opt(spec.alphaA), opt(spec.alphaB), opt(spec.beta)];
  const er = opt(spec.electrons);
  const known = !!(aA?.known && aB?.known && b?.known) && b!.value !== 0;
  const mo = known ? heteronuclear(aA!.value, aB!.value, b!.value) : undefined;
  const e = er ? (er.known ? Math.max(0, Math.min(4, Math.round(er.value))) : 0) : 2;
  const fills = [Math.min(2, e), Math.max(0, e - 2)];
  const [nA, nB] = spec.atoms ?? ['A', 'B'];
  const height = 280;

  const art = (w: number): ReactNode => {
    const top = 46;
    const bottom = height - 24;
    const xA = 110;
    const xB = w - 110;
    const xM = w / 2;
    if (!mo)
      return (
        <Svg width={w} height={height}>
          <EnergyArrow y0={bottom} y1={top} c={c} />
        </Svg>
      );
    const hi = Math.max(mo.minus, aA!.value, aB!.value);
    const lo = Math.min(mo.plus, aA!.value, aB!.value);
    const pad = (hi - lo) * 0.08;
    const yOf = (E: number) => top + ((hi + pad - E) / (hi - lo + 2 * pad)) * (bottom - top);
    const ys = { A: yOf(aA!.value), B: yOf(aB!.value), P: yOf(mo.plus), M: yOf(mo.minus) };
    const dash = (x1: number, y1: number, x2: number, y2: number) => (
      <Line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={c.chartMuted}
        strokeWidth={1}
        strokeDasharray={chart.dashFine}
      />
    );
    // Each AO's value sits on its outer side, with the atom's name under it.
    const side = (x: number, y: number, a: 'A' | 'B', text: string, name: string) => (
      <G>
        <ChartText
          x={a === 'A' ? x - ORB / 2 - 6 : x + ORB / 2 + 6}
          y={y + 4}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor={a === 'A' ? 'end' : 'start'}
        >
          {`α_${a} = ${text} eV`}
        </ChartText>
        <ChartText x={x} y={y + 18} fontSize={chart.label} textAnchor="middle" fill={c.chartMuted}>
          {name}
        </ChartText>
      </G>
    );
    return (
      <Svg width={w} height={height}>
        <EnergyArrow y0={bottom} y1={top} c={c} />
        <ChartText x={w / 2} y={18} fontSize={chart.value} fontWeight="700" textAnchor="middle">
          {`Splitting E₋ − E₊ = ${fig3(mo.splitting)} eV`}
        </ChartText>
        {dash(xA + ORB / 2, ys.A, xM - ORB / 2, ys.P)}
        {dash(xA + ORB / 2, ys.A, xM - ORB / 2, ys.M)}
        {dash(xB - ORB / 2, ys.B, xM + ORB / 2, ys.P)}
        {dash(xB - ORB / 2, ys.B, xM + ORB / 2, ys.M)}
        <Level x={xA} y={ys.A} fill={[0]} color={c.chartInk} c={c} />
        <Level x={xB} y={ys.B} fill={[0]} color={c.chartInk} c={c} />
        <Level x={xM} y={ys.P} fill={[fills[0]!]} color={c.moBonding} c={c} />
        <Level x={xM} y={ys.M} fill={[fills[1]!]} color={c.moAntibonding} c={c} />
        {side(xA, ys.A, 'A', aA!.text, nA)}
        {side(xB, ys.B, 'B', aB!.text, nB)}
        <ChartText
          x={xM}
          y={ys.P + 22}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          fill={c.moBonding}
        >
          {`E₊ = ${fig3(mo.plus)} eV`}
        </ChartText>
        <ChartText
          x={xM}
          y={ys.M - 14}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          fill={c.moAntibonding}
        >
          {`E₋ = ${fig3(mo.minus)} eV`}
        </ChartText>
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => height / w}>{({ w }) => art(w)}</Canvas>
      <Caption>
        {mo
          ? [
              `E± = (α_A + α_B) ÷ 2 ∓ √(((α_A − α_B) ÷ 2)² + β²) = ${fig3((aA!.value + aB!.value) / 2)} ∓ ${fig3(mo.splitting / 2)} eV.`,
              `E₊ = ${fig3(mo.plus)} eV (bonding, below both AOs); E₋ = ${fig3(mo.minus)} eV (antibonding); splitting ${fig3(mo.splitting)} eV.`,
              `β = ${b!.text} eV; the overlap S is neglected.`,
            ].join(' · ')
          : 'Type α_A, α_B and β (β not 0).'}
      </Caption>
    </View>
  );
}

// ─── Frost ───────────────────────────────────────────────────────────────────

function Frost({ spec, calc }: { spec: OrbitalMoSpec; calc: Calculator }) {
  const c = usePalette();
  const read = reader(useRep(calc));
  const nr = spec.ring === undefined ? undefined : read(spec.ring);
  const er = spec.electrons === undefined ? undefined : read(spec.electrons);
  const known = !!nr?.known;
  const N = known ? Math.max(3, Math.min(8, Math.round(nr!.value))) : 6;
  const filled = !!er?.known;
  const f = frost(N, filled ? er!.value : 0);
  const R0 = 96;
  const height = 30 + 2 * R0 + 34;

  const art = (w: number): ReactNode => {
    if (!known) return <Svg width={w} height={height} />;
    const R = Math.min(R0, (w - 150) / 2);
    const cx = 30 + R + 20;
    const cy = 30 + R + 10;
    const vx = (k: number) => cx + R * Math.sin((2 * Math.PI * k) / N);
    const vy = (k: number) => cy + R * Math.cos((2 * Math.PI * k) / N);
    const pts = Array.from({ length: N }, (_, k) => `${vx(k)},${vy(k)}`).join(' ');
    return (
      <Svg width={w} height={height}>
        <EnergyArrow y0={cy + R + 10} y1={cy - R - 10} c={c} />
        <Circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={c.chartMuted}
          strokeWidth={1.2}
          strokeDasharray={chart.dash}
        />
        <Polygon points={pts} fill="none" stroke={c.chartGrid} strokeWidth={chart.stroke} />
        <Line
          x1={cx - R - 12}
          y1={cy}
          x2={cx + R + 20}
          y2={cy}
          stroke={c.chartMuted}
          strokeWidth={1}
          strokeDasharray={chart.dashFine}
        />
        {f.levels.some((l) => Math.abs(l.coef) < 1e-9) ? null : (
          <ChartText x={cx + R + 26} y={cy + 4} fontSize={chart.label} fill={c.chartMuted}>
            α
          </ChartText>
        )}
        <Line x1={cx} y1={cy} x2={vx(0)} y2={vy(0) - 10} stroke={c.chartMuted} strokeWidth={1.2} />
        <ChartText x={cx + 5} y={(cy + vy(0)) / 2 + 4} fontSize={chart.label} fill={c.chartMuted}>
          2β
        </ChartText>
        {f.levels.map((l) => (
          <G key={l.ks.join('-')}>
            {l.ks.map((k, j) => (
              <Level
                key={k}
                x={vx(k)}
                y={vy(k)}
                fill={[l.fill[j]!]}
                color={
                  l.coef > 1e-9 ? c.moBonding : l.coef < -1e-9 ? c.moAntibonding : c.moNonbonding
                }
                c={c}
                show={filled}
              />
            ))}
            <ChartText
              x={cx + R + 26}
              y={vy(l.ks[0]!) + 4}
              fontSize={chart.label}
              fontWeight="700"
              fill={l.coef > 1e-9 ? c.moBonding : l.coef < -1e-9 ? c.moAntibonding : c.moNonbonding}
              halo
            >
              {frostText(l.coef)}
            </ChartText>
          </G>
        ))}
      </Svg>
    );
  };

  const total = (x: number) => `${formatNumber(Number(x.toFixed(3)))}β`;
  return (
    <View>
      <Canvas aspect={(w) => height / w}>{({ w }) => art(w)}</Canvas>
      <Caption>
        {known && filled
          ? [
              `A ring of ${N} carbons with ${f.electrons} π electrons: levels α + 2β cos(2πk ÷ ${N}) at the vertices of a polygon in a circle of radius 2β, one vertex down.`,
              `π energy beyond ${N}α: ${total(f.energy)}; in isolated double bonds ${total(f.isolated)}; delocalization ${total(f.delocalization)}.`,
              f.unpaired
                ? `${f.unpaired} unpaired electron${f.unpaired === 1 ? '' : 's'} in a half-filled pair: antiaromatic.`
                : f.electrons % 4 === 2
                  ? 'Every bonding level full, no unpaired electrons: aromatic (4n + 2).'
                  : undefined,
              'β is negative, so the lowest level is α + 2β.',
            ]
              .filter(Boolean)
              .join(' · ')
          : 'Type the ring size and its π electrons.'}
      </Caption>
    </View>
  );
}
