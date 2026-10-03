/**
 * HC79 `membrane` `potential` and `psi` (college, round 3 group G). The same bilayer as H32.
 *
 * - `potential`: + charges line the positive face and − the other, one pair per 10 mV (at most
 *   8 a side); a voltmeter (reference electrode outside, a glass micropipette through the
 *   membrane) reads V, inside relative to outside; the ions as dots on one scale, each ion its
 *   own color, named in the key; a channel protein when the transport is facilitated.
 * - `psi`: Ψ written on each side (Ψₛ and Ψₚ under it when given), solute dots from Ψₛ (one per
 *   0.025 MPa) and water's arrow through an aquaporin toward the lower Ψ, two-way when equal.
 *
 * A "?" draws nothing for its value.
 */
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { MembraneSpec } from '@/data/modules/typesHsg';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { fig3 } from './he1dText';
import { Bilayer, Protein } from './Membrane';
import { jitter, shuffled } from './membraneMath';
import { chargesFor, ionDots, positiveFace, soluteDots, waterFlow } from './membraneHe3gMath';
import { Ball, Metal, url, usePaintIds } from './paint';

const W = 360;
const H = 300;
const HEAD_TOP = 122;
const HEAD_BOTTOM = 174;
const PROTEIN_X = 200;
/** Columns dots and charges may use: clear of the protein and the meter. */
const ALL_COLS = Array.from({ length: 15 }, (_, k) => 14 + k * 18);
const colsFor = (protein: boolean) =>
  protein ? ALL_COLS.filter((x) => Math.abs(x - PROTEIN_X) > 30) : ALL_COLS;

type Rep = ReturnType<typeof useRep>;

export function MembraneHe3g({ spec, calc }: { spec: MembraneSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('head', 'a', 'b', 'c', 'solute', 'meter');
  const num = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const ionColors = [c.membrane3gIonA, c.membrane3gIonB, c.membrane3gIonC];
  const ionFill = [url(ids.a), url(ids.b), url(ids.c)];
  const pot = spec.potential;
  const psi = spec.psi;
  const V = pot ? num(pot.value) : undefined;
  // The dots: ions on one scale (potential), solute from Ψₛ (psi), or the membrane's counts.
  const ions = (pot?.ions ?? []).slice(0, 3).map((i) => ({
    name: i.name,
    outside: num(i.outside),
    inside: num(i.inside),
  }));
  const ionsKnown =
    ions.length > 0 && ions.every((i) => i.outside !== undefined && i.inside !== undefined);
  const dots = ionsKnown
    ? ionDots(ions.map((i) => ({ outside: i.outside!, inside: i.inside! })))
    : undefined;
  const sOut = psi ? num(psi.solute?.outside) : undefined;
  const sIn = psi ? num(psi.solute?.inside) : undefined;
  const plain = (x: NumOrVar) => Math.max(0, Math.min(40, Math.round(num(x) ?? 0)));
  const side = (where: 'outside' | 'inside'): { fill: string; n: number }[] => {
    if (pot && ions.length)
      return dots ? dots[where].map((n, k) => ({ fill: ionFill[k]!, n })) : [];
    if (psi) {
      const s = where === 'outside' ? sOut : sIn;
      return s === undefined ? [] : [{ fill: url(ids.solute), n: soluteDots(s) }];
    }
    return [{ fill: url(ids.solute), n: plain(where === 'outside' ? spec.outside : spec.inside) }];
  };
  const [pOut, pIn] = psi ? [num(psi.outside), num(psi.inside)] : [undefined, undefined];
  const flow = pOut !== undefined && pIn !== undefined ? waterFlow(pOut, pIn) : undefined;
  const outRows = psi ? [52, 72, 92] : [30, 50, 70, 90];
  const inRows = psi ? [204, 226, 248] : [204, 226, 248, 268];
  const protein = psi ? 'osmosis' : spec.transport === 'facilitated' ? 'facilitated' : undefined;
  const cols = colsFor(!!protein);

  return (
    <>
      <Canvas aspect={H / W}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Ball id={ids.head} color={c.bioHead} />
              <Ball id={ids.a} color={ionColors[0]!} />
              <Ball id={ids.b} color={ionColors[1]!} />
              <Ball id={ids.c} color={ionColors[2]!} />
              <Ball id={ids.solute} color={c.bioSolute} />
              <Metal id={ids.meter} light={c.metal} dark={c.metalDark} />
            </Defs>
            <G transform={`scale(${w / W})`}>
              <Rect x={0} y={0} width={W} height={HEAD_TOP} fill={c.water} opacity={0.12} />
              <Rect
                x={0}
                y={HEAD_BOTTOM}
                width={W}
                height={H - HEAD_BOTTOM}
                fill={c.life}
                opacity={0.14}
              />
              <Bilayer
                skip={protein ? [PROTEIN_X - 32, PROTEIN_X + 32] : undefined}
                head={url(ids.head)}
                c={c}
              />
              {protein ? <Protein x={PROTEIN_X} transport={protein} c={c} /> : null}
              <Dots groups={side('outside')} rows={outRows} seed={7} cols={cols} c={c} />
              <Dots groups={side('inside')} rows={inRows} seed={19} cols={cols} c={c} />
              {V !== undefined ? <Charges mV={V} cols={cols} c={c} /> : null}
              {pot ? <Meter mV={V} metal={url(ids.meter)} c={c} /> : null}
              {flow ? <WaterArrow flow={flow} c={c} /> : null}
              <ChartText x={8} y={17} fontSize={chart.label} fontWeight="700">
                Outside the cell
              </ChartText>
              <ChartText x={8} y={H - 10} fontSize={chart.label} fontWeight="700">
                Inside the cell
              </ChartText>
              {psi ? <PsiLabels psi={psi} rep={rep} c={c} /> : null}
              {pot && ions.length ? (
                <IonKey names={ions.map((i) => i.name)} colors={ionColors} c={c} />
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{captionOf(spec, rep, V, ions, dots?.per, pOut, pIn, flow, num)}</Caption>
    </>
  );
}

/** Dots of one side in fixed shuffled cells, each group (an ion, the solute) in its fill. */
function Dots({
  groups,
  rows,
  seed,
  cols,
  c,
}: {
  groups: { fill: string; n: number }[];
  rows: number[];
  seed: number;
  cols: number[];
  c: Palette;
}) {
  const cells = rows.flatMap((y) => cols.map((x) => [x, y] as [number, number]));
  const order = shuffled(cells.length, seed);
  let at = 0;
  return (
    <G>
      {groups.flatMap((g, gi) =>
        Array.from({ length: g.n }, (_, k) => {
          const cell = cells[order[at++ % cells.length]!]!;
          const [jx, jy] = jitter(at, seed);
          return (
            <Circle
              key={`${gi}-${k}`}
              cx={cell[0] + jx * 3}
              cy={cell[1] + jy * 3}
              r={4.5}
              fill={g.fill}
              stroke={c.chartInk}
              strokeWidth={0.6}
            />
          );
        }),
      )}
    </G>
  );
}

/** + along the positive face, − along the other, one pair per 10 mV (8 at most). */
function Charges({ mV, cols, c }: { mV: number; cols: number[]; c: Palette }) {
  const n = chargesFor(mV);
  const face = positiveFace(mV);
  if (!n || !face) return null;
  const slots = cols;
  const xs = Array.from(
    { length: n },
    (_, i) =>
      slots[Math.round(n === 1 ? (slots.length - 1) / 2 : (i * (slots.length - 1)) / (n - 1))]!,
  );
  const row = (y: number, sign: string, color: string) =>
    xs.map((x) => (
      <ChartText
        key={`${sign}${x}`}
        x={x}
        y={y}
        textAnchor="middle"
        fontSize={16}
        fontWeight="700"
        fill={color}
      >
        {sign}
      </ChartText>
    ));
  const [top, bottom] = face === 'outside' ? ['+', '−'] : ['−', '+'];
  return (
    <G>
      {row(HEAD_TOP - 12, top, top === '+' ? c.membrane3gPlus : c.membrane3gMinus)}
      {row(HEAD_BOTTOM + 22, bottom, bottom === '+' ? c.membrane3gPlus : c.membrane3gMinus)}
    </G>
  );
}

/** A voltmeter top right: a reference electrode outside, a micropipette through the membrane. */
function Meter({ mV, metal, c }: { mV: number | undefined; metal: string; c: Palette }) {
  return (
    <G>
      {/* The reference electrode in the outside water. */}
      <Line x1={292} y1={44} x2={292} y2={84} stroke={c.metalDark} strokeWidth={2} />
      <Circle cx={292} cy={86} r={3} fill={c.metalDark} />
      {/* The micropipette: glass, narrowing to its tip in the cytoplasm. */}
      <Path
        d={`M 338 44 L 338 150 L 333 214 L 331 214 L 334 150 L 334 44 Z`}
        fill={c.glass}
        stroke={c.glassEdge}
        strokeWidth={1}
      />
      <Line x1={336} y1={46} x2={332} y2={210} stroke={c.metalDark} strokeWidth={1} />
      <Rect x={278} y={4} width={78} height={42} rx={6} fill={metal} stroke={c.metalDark} />
      <Rect
        x={284}
        y={10}
        width={66}
        height={22}
        rx={3}
        fill={c.card}
        stroke={c.metalDark}
        strokeWidth={0.8}
      />
      <ChartText x={317} y={26} textAnchor="middle" fontSize={chart.value} fontWeight="700">
        {mV === undefined ? '' : `${fig3(mV)} mV`}
      </ChartText>
      <ChartText x={300} y={42} textAnchor="middle" fontSize={chart.label} fill={c.chartInk}>
        out
      </ChartText>
      <ChartText x={334} y={42} textAnchor="middle" fontSize={chart.label} fill={c.chartInk}>
        in
      </ChartText>
    </G>
  );
}

/** Water's arrow through the aquaporin, toward the lower Ψ (both ways when equal). */
function WaterArrow({ flow, c }: { flow: 'in' | 'out' | 'both'; c: Palette }) {
  const arrow = (x: number, down: boolean, key: string) => {
    const [a, b] = down ? [64, 236] : [236, 64];
    const s = down ? 1 : -1;
    return (
      <G key={key}>
        <Line x1={x} y1={a} x2={x} y2={b} stroke={c.card} strokeWidth={7} opacity={0.8} />
        <Line x1={x} y1={a} x2={x} y2={b} stroke={c.waterDeep} strokeWidth={chart.strokeHeavy} />
        <Path
          d={`M ${x - 7} ${b - s * 10} L ${x} ${b} L ${x + 7} ${b - s * 10}`}
          stroke={c.waterDeep}
          strokeWidth={chart.strokeHeavy}
          strokeLinejoin="round"
          fill="none"
        />
      </G>
    );
  };
  return (
    <G>
      {flow === 'both'
        ? [arrow(PROTEIN_X - 6, true, 'd'), arrow(PROTEIN_X + 6, false, 'u')]
        : arrow(PROTEIN_X, flow === 'in', 'a')}
      <ChartText
        x={PROTEIN_X + 26}
        y={150}
        fontSize={chart.label}
        fontWeight="700"
        fill={c.waterDeep}
        halo
      >
        water
      </ChartText>
    </G>
  );
}

/** Ψ on each side (right), and Ψₛ and Ψₚ under it when the page gives them. */
function PsiLabels({
  psi,
  rep,
  c,
}: {
  psi: NonNullable<MembraneSpec['psi']>;
  rep: Rep;
  c: Palette;
}) {
  const text = (x: NumOrVar | undefined) =>
    x === undefined
      ? undefined
      : typeof x === 'number'
        ? formatNumber(x)
        : rep.known(x)
          ? formatNumber(Number(rep.val(x).toPrecision(3)))
          : undefined;
  const parts = (where: 'outside' | 'inside') => {
    const [s, p] = [text(psi.solute?.[where]), text(psi.pressure?.[where])];
    return [s !== undefined ? `Ψₛ = ${s}` : '', p !== undefined ? `Ψₚ = ${p}` : '']
      .filter(Boolean)
      .join(', ');
  };
  const out = text(psi.outside);
  const inn = text(psi.inside);
  return (
    <G>
      {out !== undefined ? (
        <ChartText x={W - 8} y={17} textAnchor="end" fontSize={chart.value} fontWeight="700">
          {`Ψ = ${out} MPa`}
        </ChartText>
      ) : null}
      {parts('outside') ? (
        <ChartText x={W - 8} y={35} textAnchor="end" fontSize={chart.label} fill={c.chartMuted}>
          {parts('outside')}
        </ChartText>
      ) : null}
      {inn !== undefined ? (
        <ChartText x={W - 8} y={H - 10} textAnchor="end" fontSize={chart.value} fontWeight="700">
          {`Ψ = ${inn} MPa`}
        </ChartText>
      ) : null}
      {parts('inside') ? (
        <ChartText
          x={W - 8}
          y={H - 28}
          textAnchor="end"
          fontSize={chart.label}
          fill={c.chartMuted}
          halo
        >
          {parts('inside')}
        </ChartText>
      ) : null}
    </G>
  );
}

/** The ions' key along the bottom right: a dot in each color and its name. */
function IonKey({ names, colors, c }: { names: string[]; colors: string[]; c: Palette }) {
  const each = 52;
  const x0 = W - 8 - names.length * each;
  return (
    <G>
      {names.map((n, k) => (
        <G key={n}>
          <Circle
            cx={x0 + k * each + 6}
            cy={H - 14}
            r={5}
            fill={colors[k]}
            stroke={c.chartInk}
            strokeWidth={0.6}
          />
          <ChartText x={x0 + k * each + 15} y={H - 10} fontSize={chart.label} fontWeight="700">
            {n}
          </ChartText>
        </G>
      ))}
    </G>
  );
}

function captionOf(
  spec: MembraneSpec,
  rep: Rep,
  V: number | undefined,
  ions: { name: string; outside?: number; inside?: number }[],
  per: number | undefined,
  pOut: number | undefined,
  pIn: number | undefined,
  flow: 'in' | 'out' | 'both' | undefined,
  num: (x: NumOrVar | undefined) => number | undefined,
): string {
  const out: string[] = [];
  const f = (x: number) => formatNumber(Number(x.toPrecision(3)));
  if (spec.potential) {
    if (V === undefined) out.push('Type the values to find the membrane potential.');
    else {
      const n = chargesFor(V);
      out.push(
        V < 0
          ? `V = ${fig3(V)} mV: the inside is negative, so + charges line the outside face and − the inside.`
          : V > 0
            ? `V = ${fig3(V)} mV: the inside is positive, so − charges line the outside face and + the inside.`
            : 'V = 0 mV: no charge separates across the membrane.',
      );
      if (n) out.push(`One pair per 10 mV: ${n} a side${Math.abs(V) > 85 ? ' (8 at most)' : ''}.`);
    }
    if (per !== undefined && ions.length)
      out.push(
        `Dots on one scale, one dot ≈ ${f(per)}: ${ions.map((i) => `${i.name} ${f(i.outside!)} out, ${f(i.inside!)} in`).join('; ')}.`,
      );
  }
  if (spec.psi) {
    if (pOut === undefined || pIn === undefined || !flow)
      out.push('Type both water potentials to see which way water moves.');
    else {
      out.push(
        flow === 'both'
          ? `Ψ is ${f(pOut)} MPa on both sides: water crosses both ways equally.`
          : `Ψ outside ${f(pOut)} MPa, inside ${f(pIn)} MPa: water moves ${flow === 'in' ? 'into' : 'out of'} the cell, toward the lower Ψ.`,
      );
      for (const where of ['inside', 'outside'] as const) {
        const [s, p] = [num(spec.psi.solute?.[where]), num(spec.psi.pressure?.[where])];
        if (s !== undefined && p !== undefined)
          out.push(
            `${where === 'inside' ? 'Inside' : 'Outside'}: Ψ = Ψₛ + Ψₚ = ${f(s)} + ${f(p)} = ${f(s + p)} MPa`,
          );
      }
      if (spec.psi.solute) out.push('Each solute dot stands for 0.025 MPa of solute potential.');
    }
  }
  void rep;
  return out.join(' · ');
}
