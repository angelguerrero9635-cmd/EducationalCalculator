/**
 * The college options of `phScale` (HC71, HC73; `typesHe3f.ts`): a polyprotic titration from the
 * exact charge balance, a buffer on its Henderson–Hasselbalch curve with the HA and A⁻ bars, a
 * free amino acid's curve with its pI, and the pKₐ ladder with a reaction's equilibrium arrow.
 * Flat charts. A "?" value draws nothing for itself.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline, Rect } from 'react-native-svg';

import type { PhScaleSpec } from '@/data/modules/typesHsj';
import type {
  PhAminoAcidSpec,
  PhBufferSpec,
  PhPkaSpec,
  PhScaleHe3fSpec,
} from '@/data/modules/typesHe3f';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { arrowHead } from './graphKit';
import { fig3 } from './he1dText';
import { minus, numReader } from './he3fKit';
import {
  aminoCharge,
  aminoGroups,
  aminoPI,
  aminoRemoved,
  bufferPH,
  logKOf,
  polyproticPH,
  type AminoAcid,
} from './he3fMath';
import { MathText } from './hsdText';
import { axisOf, makePlot, PlotFrame, spread } from './hsjPlot';

type Titration = Extract<PhScaleSpec, { mode: 'titration' }>;

const ph2 = (x: number) => minus(x.toFixed(2));
const SUBS = ['₁', '₂', '₃'];

/** Is a phScale spec one of the group F options (drawn here, not by `PhScale`)? */
export const isPhHe3f = (s: PhScaleSpec | PhScaleHe3fSpec): s is PhScaleHe3fSpec | Titration =>
  s.mode === 'buffer' ||
  s.mode === 'aminoAcid' ||
  s.mode === 'pka' ||
  (s.mode === 'titration' && !!s.polyprotic);

export function PhScaleHe3f({
  spec,
  calc,
}: {
  spec: PhScaleHe3fSpec | Titration;
  calc: Calculator;
}) {
  switch (spec.mode) {
    case 'buffer':
      return <Buffer spec={spec} calc={calc} />;
    case 'aminoAcid':
      return <AminoCurve spec={spec} calc={calc} />;
    case 'pka':
      return <Ladder spec={spec} calc={calc} />;
    default:
      return <Polyprotic spec={spec} calc={calc} />;
  }
}

// ─── Polyprotic titration ────────────────────────────────────────────────────

function Polyprotic({ spec, calc }: { spec: Titration; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const start = useRef(0);
  const pks = (spec.polyprotic?.pKa ?? []).map((x) => num(x));
  const [ca, va, cb] = [
    num(spec.acid.concentration),
    num(spec.acid.volume),
    num(spec.base.concentration),
  ];
  const vb = num(spec.added);
  const ready =
    ca !== undefined &&
    va !== undefined &&
    cb !== undefined &&
    cb > 0 &&
    pks.length >= 2 &&
    pks.every((p) => p !== undefined);
  const kas = ready ? pks.map((p) => 10 ** -p!) : [];
  const v1 = ready ? (ca! * va!) / cb! : undefined;
  const steps = pks.length;
  const unit = (typeof spec.added === 'string' ? rep.unit(spec.added) : undefined) ?? 'mL';
  const live = axisOf(0, v1 !== undefined ? v1 * (steps + 0.6) : 50, 5);
  const frame = useFrozen(live);
  const xa = frame.value;
  const phAt = (v: number) => polyproticPH(ca!, va!, cb!, v, kas);
  const addedId = typeof spec.added === 'string' ? spec.added : undefined;
  const base = spec.base.name ?? 'base';
  const acid = spec.acid.name ?? 'the acid';

  return (
    <View>
      <Canvas aspect={0.9}>
        {({ w, h }) => {
          const p = makePlot(w, h, xa, { lo: 0, hi: 14, step: 2 }, { L: 44, R: 16, T: 30, B: 40 });
          const pts = ready
            ? Array.from({ length: 241 }, (_, k) => (xa.hi * k) / 240)
                .map((v) => `${p.sx(v)},${p.sy(phAt(v))}`)
                .join(' ')
            : '';
          return (
            <>
              <Svg width={w} height={h}>
                <PlotFrame p={p} xName={`${base} added (${unit})`} yName="pH" />
                {ready && v1 !== undefined ? (
                  <G>
                    <Polyline
                      points={pts}
                      fill="none"
                      stroke={c.chartHighlight}
                      strokeWidth={chart.strokeHeavy}
                      strokeLinejoin="round"
                    />
                    {pks.map((pk, i) => {
                      const ve = v1 * (i + 1);
                      const half = v1 * (i + 0.5);
                      const phHalf = phAt(half);
                      const hh = Math.abs(phHalf - pk!) < 0.05;
                      const tag = `pKₐ${SUBS[i]} ${ph2(pk!)}`;
                      return (
                        <G key={i}>
                          {ve <= xa.hi ? (
                            <G>
                              <Line
                                x1={p.sx(ve)}
                                y1={p.T}
                                x2={p.sx(ve)}
                                y2={h - p.B}
                                stroke={c.chartMuted}
                                strokeWidth={1.5}
                                strokeDasharray={chart.dash}
                              />
                              <MathText
                                text={`V${SUBS[i]}`}
                                x={p.sx(ve)}
                                y={p.T - 8}
                                textAnchor="middle"
                                fontSize={chart.label}
                                fontWeight="700"
                              />
                            </G>
                          ) : null}
                          <Circle
                            cx={p.sx(half)}
                            cy={p.sy(phHalf)}
                            r={4.5}
                            fill={c.card}
                            stroke={c.lineSum}
                            strokeWidth={2}
                          />
                          <MathText
                            text={hh ? tag : `${tag} (pH ${ph2(phHalf)})`}
                            {...fitLabel(
                              p.sx(half) - 8,
                              hh ? tag : `${tag} (pH ${ph2(phHalf)})`,
                              chart.label,
                              w,
                              'end',
                              8,
                            )}
                            y={p.sy(phHalf) - 8}
                            fontSize={chart.label}
                            fontWeight="700"
                            fill={c.lineSum}
                            halo
                          />
                        </G>
                      );
                    })}
                  </G>
                ) : null}
                {ready && vb !== undefined && vb <= xa.hi ? (
                  <Circle
                    cx={p.sx(vb)}
                    cy={p.sy(phAt(vb))}
                    r={6}
                    fill={c.chartSecond}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                ) : null}
              </Svg>
              {ready && addedId && vb !== undefined && !spec.fixed ? (
                <DragHandle
                  testID="drag-added"
                  x={p.sx(vb)}
                  y={p.sy(phAt(vb))}
                  label="the base added"
                  onStart={() => {
                    start.current = vb;
                    frame.freeze();
                  }}
                  onMove={(dx) => {
                    const perPx = (xa.hi - xa.lo) / (w - p.L - p.R);
                    const next = Math.min(xa.hi, Math.max(0, start.current + dx * perPx));
                    calc.set(
                      {
                        ...(spec.keep ? rep.pin(spec.keep) : {}),
                        [addedId]: rep.snapTo(addedId, next * rep.factor(addedId)),
                      },
                      rep.slide(addedId),
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
          ready && v1 !== undefined
            ? `Each proton of ${acid} takes CₐVₐ ÷ C_b = ${fig3(v1)} ${unit} of ${base}: equivalence at ${pks.map((_, i) => fig3(v1 * (i + 1))).join(', ')} ${unit}, in the ratio ${pks.map((_, i) => i + 1).join(' : ')}.`
            : 'Type the values to draw the curve.',
          ...(ready && v1 !== undefined
            ? [
                `Half-way to each, pH = pKₐ while that step is weak. At V₁, pH ≈ (pKₐ₁ + pKₐ₂) ÷ 2 = ${ph2((pks[0]! + pks[1]!) / 2)}; the exact curve gives ${ph2(phAt(v1))}.`,
              ]
            : []),
          ...(ready && vb !== undefined
            ? [`After ${fig3(vb)} ${unit}, the pH is ${ph2(phAt(vb))}.`]
            : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}

// ─── Buffer ──────────────────────────────────────────────────────────────────

function Buffer({ spec, calc }: { spec: PhBufferSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const pKa = num(spec.pKa);
  const [nA, nB] = [num(spec.acid), num(spec.base)];
  const added = spec.added === undefined ? 0 : num(spec.added);
  const [HA, Am] = spec.names ?? ['HA', 'A⁻'];
  const ok = pKa !== undefined && nA !== undefined && nB !== undefined && nA > 0 && nB > 0;
  const before = ok ? { a: nA!, b: nB!, ph: bufferPH(pKa!, nA!, nB!) } : undefined;
  const afterOk =
    ok && added !== undefined && spec.added !== undefined && nA! + added > 0 && nB! - added > 0;
  const after = afterOk
    ? { a: nA! + added!, b: nB! - added!, ph: bufferPH(pKa!, nA! + added!, nB! - added!) }
    : undefined;
  const share = (s: { a: number; b: number }) => s.b / (s.a + s.b);

  return (
    <View>
      <Canvas aspect={(w) => 330 / w}>
        {({ w }) => {
          const h = 230;
          const centre = pKa ?? 7;
          const y = { lo: Math.floor(centre - 3), hi: Math.floor(centre - 3) + 6, step: 1 };
          const p = makePlot(w, h, { lo: 0, hi: 1, step: 0.25 }, y, { L: 44, R: 16, T: 22, B: 40 });
          const fs = Array.from({ length: 121 }, (_, k) => 0.002 + (0.996 * k) / 120);
          const curve = ok
            ? fs
                .map((f) => [f, pKa! + Math.log10(f / (1 - f))] as const)
                .filter(([, v]) => v >= y.lo && v <= y.hi)
                .map(([f, v]) => `${p.sx(f)},${p.sy(v)}`)
                .join(' ')
            : '';
          // Bars: moles of HA and A⁻ before (solid) and after (outlined).
          const barTop = h + 18;
          const barH = 70;
          const most = ok ? Math.max(nA!, nB!, after?.a ?? 0, after?.b ?? 0) : 1;
          const bar = (x: number, n: number, solid: boolean, color: string, k: string) => {
            const hh = (barH * n) / most;
            return (
              <Rect
                key={k}
                x={x}
                y={barTop + barH - hh}
                width={22}
                height={hh}
                fill={solid ? color : 'none'}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={solid ? undefined : chart.dash}
              />
            );
          };
          const bx = [16, w / 2 + 4];
          return (
            <Svg width={w} height={330}>
              {ok ? (
                <Rect
                  x={p.L}
                  y={p.sy(Math.min(y.hi, pKa! + 1))}
                  width={w - p.L - p.R}
                  height={p.sy(Math.max(y.lo, pKa! - 1)) - p.sy(Math.min(y.hi, pKa! + 1))}
                  fill={c.chartFill}
                />
              ) : null}
              <PlotFrame
                p={p}
                xName={`Share as ${Am}: n(${Am}) ÷ (n(${HA}) + n(${Am}))`}
                yName="pH"
              />
              {ok ? (
                <G>
                  <Polyline
                    points={curve}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                  />
                </G>
              ) : null}
              {before ? (
                <G>
                  <Circle cx={p.sx(share(before))} cy={p.sy(before.ph)} r={5.5} fill={c.lineSum} />
                  <MathText
                    text={`pH ${ph2(before.ph)}`}
                    {...fitLabel(
                      p.sx(share(before)) + 9,
                      `pH ${ph2(before.ph)}`,
                      chart.label,
                      w,
                      'start',
                      9,
                    )}
                    y={p.sy(before.ph) + 18}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.lineSum}
                    halo
                  />
                </G>
              ) : null}
              {before && after ? (
                <G>
                  <Circle
                    cx={p.sx(share(after))}
                    cy={p.sy(after.ph)}
                    r={5.5}
                    fill={c.card}
                    stroke={c.fnSecond}
                    strokeWidth={2.5}
                  />
                  <MathText
                    text={`after: pH ${ph2(after.ph)}`}
                    {...fitLabel(
                      p.sx(share(after)) - 9,
                      `after: pH ${ph2(after.ph)}`,
                      chart.label,
                      w,
                      'end',
                      9,
                    )}
                    y={p.sy(after.ph) - 10}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.fnSecond}
                    halo
                  />
                </G>
              ) : null}
              {/* The bars. */}
              {ok
                ? (
                    [
                      [HA, nA!, after?.a, 0],
                      [Am, nB!, after?.b, 1],
                    ] as const
                  ).map(([name, n0, n1, i]) => (
                    <G key={name}>
                      {bar(bx[i]!, n0, true, i === 0 ? c.chartHighlight : c.lineSum, 'b')}
                      {n1 !== undefined
                        ? bar(bx[i]! + 28, n1, false, i === 0 ? c.chartHighlight : c.lineSum, 'a')
                        : null}
                      <ChartText
                        x={bx[i]! + 58}
                        y={barTop + barH - 22}
                        fontSize={chart.label}
                        fontWeight="700"
                      >
                        {name}
                      </ChartText>
                      <ChartText x={bx[i]! + 58} y={barTop + barH - 4} fontSize={chart.label}>
                        {`${fig3(n0)}${n1 !== undefined ? ` → ${fig3(n1)}` : ''} mol`}
                      </ChartText>
                    </G>
                  ))
                : null}
              {after ? (
                <ChartText
                  x={w / 2}
                  y={barTop - 2}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  solid: before · dashed: after
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          before
            ? `pH = pKₐ + log(n(${Am}) ÷ n(${HA})) = ${ph2(pKa!)} + log(${fig3(nB!)} ÷ ${fig3(nA!)}) = ${ph2(before.ph)}.`
            : 'Type pKₐ and both amounts to place the buffer.',
          'The shaded band is pKₐ ± 1 (a ratio from 1 : 10 to 10 : 1), where it buffers well.',
          ...(after && added !== undefined
            ? [
                `${added >= 0 ? `Adding ${fig3(added)} mol of strong acid turns that much ${Am} into ${HA}` : `Adding ${fig3(-added)} mol of strong base turns that much ${HA} into ${Am}`}: pH ${ph2(after.ph)}.`,
              ]
            : spec.added !== undefined && ok && added !== undefined
              ? ['That much strong acid or base uses up a side of the buffer: it is gone.']
              : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}

// ─── Amino acid ──────────────────────────────────────────────────────────────

const sideOf = (s: PhAminoAcidSpec['side'], num: (x: number | string) => number | undefined) => {
  if (s === undefined || s === 'none' || s === 'acidic' || s === 'basic') return s ?? 'none';
  const code = num(s);
  return code === 1 ? 'acidic' : code === 2 ? 'basic' : code === 0 ? 'none' : undefined;
};

function AminoCurve({ spec, calc }: { spec: PhAminoAcidSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const side = sideOf(spec.side, (x) => num(x));
  const [k1, k2] = [num(spec.pKa1), num(spec.pKa2)];
  const kR = num(spec.pKaR);
  const needsR = side === 'acidic' || side === 'basic';
  const ok =
    k1 !== undefined && k2 !== undefined && side !== undefined && (!needsR || kR !== undefined);
  const a: AminoAcid | undefined = ok
    ? { pKa1: k1!, pKa2: k2!, ...(needsR ? { pKaR: kR!, side } : { side: 'none' as const }) }
    : undefined;
  const groups = a ? aminoGroups(a) : [];
  const pI = a ? aminoPI(a) : undefined;
  const top = a?.side === 'basic' ? 2 : 1;
  const pH = num(spec.pH);
  const charge = a && pH !== undefined ? aminoCharge(pH, a) : undefined;
  const name = spec.name ?? 'the amino acid';

  return (
    <View>
      <Canvas aspect={0.9}>
        {({ w, h }) => {
          const n = Math.max(2, groups.length);
          const p = makePlot(
            w,
            h,
            { lo: 0, hi: n, step: 0.5 },
            { lo: 0, hi: 14, step: 2 },
            {
              L: 44,
              R: 16,
              T: 16,
              B: 40,
            },
          );
          const pts = a
            ? Array.from({ length: 281 }, (_, k) => 0.5 + (13 * k) / 280)
                .map((v) => `${p.sx(aminoRemoved(v, a))},${p.sy(v)}`)
                .join(' ')
            : '';
          const labels = groups.map((pk, i) => ({ pk, x: p.sx(i + 0.5), y: p.sy(pk) }));
          return (
            <Svg width={w} height={h}>
              <PlotFrame
                p={p}
                xName="OH⁻ added (equivalents)"
                yName="pH"
                xText={(v) => formatNumber(v)}
              />
              {a ? (
                <G>
                  <Polyline
                    points={pts}
                    fill="none"
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    strokeLinejoin="round"
                  />
                  {labels.map((l, i) => (
                    <G key={i}>
                      <Circle
                        cx={l.x}
                        cy={l.y}
                        r={4.5}
                        fill={c.card}
                        stroke={c.lineSum}
                        strokeWidth={2}
                      />
                      <MathText
                        text={`pKₐ ${ph2(l.pk)}`}
                        {...fitLabel(l.x + 8, `pKₐ ${ph2(l.pk)}`, chart.label, w, 'start', 8)}
                        y={l.y + 18}
                        fontSize={chart.label}
                        fontWeight="700"
                        fill={c.lineSum}
                        halo
                      />
                    </G>
                  ))}
                  {pI !== undefined ? (
                    <G>
                      <Line
                        x1={p.L}
                        y1={p.sy(pI)}
                        x2={p.sx(top)}
                        y2={p.sy(pI)}
                        stroke={c.fnSecond}
                        strokeWidth={1.5}
                        strokeDasharray={chart.dash}
                      />
                      <Circle cx={p.sx(top)} cy={p.sy(pI)} r={5.5} fill={c.fnSecond} />
                      <MathText
                        text={`pI ${ph2(pI)}: charge 0`}
                        x={p.L + 6}
                        y={p.sy(pI) - 6}
                        fontSize={chart.label}
                        fontWeight="700"
                        fill={c.fnSecond}
                        halo
                      />
                    </G>
                  ) : null}
                  {pH !== undefined && charge !== undefined ? (
                    <Circle
                      cx={p.sx(aminoRemoved(pH, a))}
                      cy={p.sy(pH)}
                      r={6}
                      fill={c.chartSecond}
                      stroke={c.chartInk}
                    />
                  ) : null}
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          a && pI !== undefined
            ? `${name}: pI = (${ph2(groups[top - 1]!)} + ${ph2(groups[top]!)}) ÷ 2 = ${ph2(pI)}, the mean of the pKₐ values either side of the neutral form.`
            : 'Type the pKₐ values to draw the curve.',
          ...(pH !== undefined && charge !== undefined
            ? [
                `At pH ${ph2(pH)} the net charge is ${minus(fig3(Math.abs(charge) < 5e-4 ? 0 : charge))}.`,
              ]
            : []),
          'Each group loses its proton half-way through its step, where pH = pKₐ.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}

// ─── pKₐ ladder ──────────────────────────────────────────────────────────────

function Ladder({ spec, calc }: { spec: PhPkaSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const [lo, hi] = spec.range ?? [-10, 50];
  const r = spec.reaction;
  const [pl, pr] = [num(r?.left.pKa), num(r?.right.pKa)];
  const both = pl !== undefined && pr !== undefined;
  const logK = both ? logKOf(pl!, pr!) : undefined;
  const lit = new Set([r?.left.name, r?.right.name]);
  const rows = [
    ...(spec.acids ?? []).filter((x) => !lit.has(x.name)).map((x) => ({ ...x, on: false })),
    ...(r ? [r.left, r.right].map((x) => ({ ...x, on: true })) : []),
  ]
    .map((x) => ({ name: x.name, on: x.on, pKa: num(x.pKa) }))
    .filter((x): x is { name: string; on: boolean; pKa: number } => x.pKa !== undefined)
    .sort((x, y) => x.pKa - y.pKa);

  return (
    <View>
      <Canvas aspect={(w) => 440 / w}>
        {({ w }) => {
          const [T, B] = [30, 410];
          const Y = (v: number) => T + ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (B - T);
          const ax = Math.max(84, w * 0.3);
          const ys = spread(
            rows.map((x) => Y(x.pKa) + 4),
            16,
          );
          const ticks = Array.from(
            { length: Math.floor((hi - lo) / 10) + 1 },
            (_, k) => lo + k * 10,
          );
          const yl = pl === undefined ? undefined : Y(pl);
          const yr = pr === undefined ? undefined : Y(pr);
          return (
            <Svg width={w} height={440}>
              <ChartText x={ax} y={14} textAnchor="middle" fontSize={chart.label} fontWeight="700">
                stronger acid ↑
              </ChartText>
              <ChartText x={ax} y={434} textAnchor="middle" fontSize={chart.label} fontWeight="700">
                weaker acid ↓
              </ChartText>
              <Line x1={ax} y1={T} x2={ax} y2={B} stroke={c.chartInk} strokeWidth={2} />
              {ticks.map((t) => (
                <G key={t}>
                  <Line x1={ax - 5} y1={Y(t)} x2={ax} y2={Y(t)} stroke={c.chartInk} />
                  <MathText
                    text={`pKₐ ${minus(String(t))}`}
                    x={ax - 8}
                    y={Y(t) + 4}
                    textAnchor="end"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  />
                </G>
              ))}
              {rows.map((x, i) => (
                <G key={x.name}>
                  <Circle
                    cx={ax}
                    cy={Y(x.pKa)}
                    r={x.on ? 6 : 3.5}
                    fill={x.on ? c.chartHighlight : c.chartMuted}
                  />
                  <Path
                    d={`M ${ax + 6} ${Y(x.pKa)} L ${ax + 18} ${ys[i]! - 4} L ${ax + 22} ${ys[i]! - 4}`}
                    stroke={c.chartGrid}
                    fill="none"
                  />
                  <ChartText
                    x={ax + 25}
                    y={ys[i]!}
                    fontSize={chart.label}
                    fontWeight={x.on ? '700' : '400'}
                    fill={x.on ? c.chartHighlight : c.chartInk}
                  >
                    {`${x.name} ${minus(formatNumber(x.pKa))}`}
                  </ChartText>
                </G>
              ))}
              {/* The equilibrium arrow, left of the scale, toward the weaker acid. */}
              {yl !== undefined && yr !== undefined && Math.abs(yr - yl) > 8 ? (
                <G>
                  <Path
                    d={`M ${ax - 52} ${yl} C ${ax - 74} ${yl} ${ax - 74} ${yr} ${ax - 58} ${yr}`}
                    stroke={c.fnSecond}
                    strokeWidth={2.2}
                    fill="none"
                  />
                  <Path d={arrowHead(ax - 52, yr, 1, 0, 8)} fill={c.fnSecond} />
                </G>
              ) : yl !== undefined && yr !== undefined && yl !== yr ? (
                // Two acids almost level: a short arrow still says which way, up or down.
                <G>
                  <Line
                    x1={ax - 60}
                    y1={(yl + yr) / 2 - Math.sign(yr - yl) * 14}
                    x2={ax - 60}
                    y2={(yl + yr) / 2 + Math.sign(yr - yl) * 8}
                    stroke={c.fnSecond}
                    strokeWidth={2.2}
                  />
                  <Path
                    d={arrowHead(
                      ax - 60,
                      (yl + yr) / 2 + Math.sign(yr - yl) * 14,
                      0,
                      Math.sign(yr - yl),
                      8,
                    )}
                    fill={c.fnSecond}
                  />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          r && both
            ? `${r.left.name} (${minus(formatNumber(pl!))}) gives its proton; ${r.right.name} (${minus(formatNumber(pr!))}) forms. The arrow points to the weaker acid, the ${pr! > pl! ? 'products' : 'reactants'}.`
            : r
              ? 'Type both pKₐ values to place the reaction.'
              : 'The lower the pKₐ, the stronger the acid; each step down is 10 times weaker.',
          ...(logK !== undefined
            ? [
                `log K = pKₐ(right) − pKₐ(left) = ${minus(formatNumber(pr!))} − ${pl! < 0 ? `(${minus(formatNumber(pl!))})` : formatNumber(pl!)} = ${minus(fig3(logK))}, K = ${fig3(10 ** logK)}.`,
              ]
            : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}
