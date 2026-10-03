/**
 * The college options of `lewisStructure` molecules (HC111; `typesHe4d.ts`), flat: a structure
 * from `lewisHe4d.ts` with every atom's formal charge circled beside it, the atom whose v, N and
 * B the page holds ringed, an ion in brackets, and (with `resonance`) each resonance form, two
 * to a row, joined by double-headed arrows. Expanded octets are named in the caption.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { LewisStructureSpec } from '@/data/modules/typesHsi';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { numReader } from './he3fKit';
import { valenceElectrons } from './lewis';
import {
  electronTotals,
  formalCharges,
  RESONANCE,
  resonanceSet,
  setFormula,
  type ResonanceForm,
  type ResonanceSet,
} from './lewisHe4d';

type Spec = Extract<LewisStructureSpec, { mode: 'molecule' }>;

const RAD = Math.PI / 180;
const signed = (q: number) => (q > 0 ? `+${q}` : q < 0 ? `−${-q}` : '0');
/** Smallest gap between two directions, in degrees. */
const apart = (a: number, b: number) => Math.abs(((((a - b) % 360) + 540) % 360) - 180);

/** One form drawn around (cx, cy) with bond length L. */
function FormArt({
  set,
  form,
  cx,
  cy,
  L,
  size,
  lit,
}: {
  set: ResonanceSet;
  form: ResonanceForm;
  cx: number;
  cy: number;
  L: number;
  size: number;
  lit: number[];
}) {
  const c = usePalette();
  const xs = set.atoms.map((a) => a.x);
  const ys = set.atoms.map((a) => a.y);
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const my = (Math.min(...ys) + Math.max(...ys)) / 2;
  const P = set.atoms.map((a) => ({ x: cx + (a.x - mx) * L, y: cy + (a.y - my) * L }));
  const counts = formalCharges(set, form);
  // Each atom's busy directions: its bonds and lone pairs; the charge goes in the widest gap.
  const busy = set.atoms.map((_, i) => [
    ...form.lone[i]!,
    ...form.bonds
      .filter(([p, q]) => p === i || q === i)
      .map(([p, q]) => {
        const o = p === i ? q : p;
        return Math.atan2(P[o]!.y - P[i]!.y, P[o]!.x - P[i]!.x) / RAD;
      }),
  ]);
  const slots = [-45, -135, 45, 135, -90, 90, 0, 180, -22, -158, 22, 158, -68, -112, 68, 112];
  const chargeAt = busy.map((b) =>
    b.length === 0
      ? -45
      : slots.reduce(
          (best, s) =>
            Math.min(...b.map((d) => apart(s, d))) >
            Math.min(...b.map((d) => apart(best, d))) + 1e-9
              ? s
              : best,
          slots[0]!,
        ),
  );
  const dotR = (el: string) => (el.length > 1 ? 20 : 17);
  const trim = size * 0.62;
  const box = {
    x0: Math.min(...P.map((p) => p.x)) - 42,
    x1: Math.max(...P.map((p) => p.x)) + 42,
    y0: Math.min(...P.map((p) => p.y)) - 40,
    y1: Math.max(...P.map((p) => p.y)) + 40,
  };
  return (
    <G>
      {form.bonds.map(([i, j, order], k) => {
        const a = P[i]!;
        const b = P[j]!;
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const [ux, uy] = [(b.x - a.x) / len, (b.y - a.y) / len];
        const [nx, ny] = [-uy, ux];
        const offsets = order === 1 ? [0] : order === 2 ? [-3.5, 3.5] : [-6, 0, 6];
        return (
          <G key={`b${k}`}>
            {offsets.map((o, m) => (
              <Line
                key={m}
                x1={a.x + ux * trim + nx * o}
                y1={a.y + uy * trim + ny * o}
                x2={b.x - ux * trim + nx * o}
                y2={b.y - uy * trim + ny * o}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
                strokeLinecap="round"
              />
            ))}
          </G>
        );
      })}
      {set.atoms.map((a, i) => {
        const p = P[i]!;
        const q = counts[i]!.FC;
        const [dx, dy] = [Math.cos(chargeAt[i]! * RAD), Math.sin(chargeAt[i]! * RAD)];
        const qx = p.x + dx * (dotR(a.el) + 12);
        const qy = p.y + dy * (dotR(a.el) + 12);
        const color = q > 0 ? c.he4dChargePos : q < 0 ? c.he4dChargeNeg : c.chartMuted;
        return (
          <G key={`a${i}`}>
            {lit.includes(i) ? (
              <Circle
                cx={p.x}
                cy={p.y}
                r={size * 0.62}
                fill={c.he4dLobePlus}
                stroke={c.chartHighlight}
                strokeWidth={2}
              />
            ) : null}
            <ChartText
              x={p.x}
              y={p.y + size * 0.36}
              fontSize={size}
              fontWeight="700"
              textAnchor="middle"
            >
              {a.el}
            </ChartText>
            {form.lone[i]!.map((d, k) => {
              const [ex, ey] = [Math.cos(d * RAD), Math.sin(d * RAD)];
              const r = dotR(a.el);
              return (
                <G key={`l${k}`}>
                  <Circle
                    cx={p.x + ex * r - ey * 4}
                    cy={p.y + ey * r + ex * 4}
                    r={2.4}
                    fill={c.chartInk}
                  />
                  <Circle
                    cx={p.x + ex * r + ey * 4}
                    cy={p.y + ey * r - ex * 4}
                    r={2.4}
                    fill={c.chartInk}
                  />
                </G>
              );
            })}
            <Circle
              cx={qx}
              cy={qy}
              r={9}
              fill={c.card}
              stroke={color}
              strokeWidth={q === 0 ? 1 : 1.8}
            />
            <ChartText
              x={qx}
              y={qy + 4}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight={q === 0 ? '400' : '700'}
              fill={color}
            >
              {signed(q)}
            </ChartText>
          </G>
        );
      })}
      {set.charge !== 0 ? (
        <G>
          <Path
            d={`M ${box.x0 + 6} ${box.y0} H ${box.x0} V ${box.y1} H ${box.x0 + 6}`}
            fill="none"
            stroke={c.chartInk}
            strokeWidth={1.6}
          />
          <Path
            d={`M ${box.x1 - 6} ${box.y0} H ${box.x1} V ${box.y1} H ${box.x1 - 6}`}
            fill="none"
            stroke={c.chartInk}
            strokeWidth={1.6}
          />
          <ChartText x={box.x1 + 2} y={box.y0 + 10} fontWeight="700">
            {`${Math.abs(set.charge) === 1 ? '' : Math.abs(set.charge)}${set.charge > 0 ? '+' : '−'}`}
          </ChartText>
        </G>
      ) : null}
    </G>
  );
}

/** A double-headed arrow from (x1, y) to (x2, y). */
function Both({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const c = usePalette();
  return (
    <G>
      <Line x1={x1 + 5} y1={y} x2={x2 - 5} y2={y} stroke={c.chartInk} strokeWidth={1.8} />
      <Path d={`M ${x1} ${y} l 7 -4.5 l 0 9 z`} fill={c.chartInk} />
      <Path d={`M ${x2} ${y} l -7 -4.5 l 0 9 z`} fill={c.chartInk} />
    </G>
  );
}

export function LewisFormal({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const rep = useRep(calc);
  const num = numReader(rep);
  const set = spec.formula ? resonanceSet(spec.formula) : undefined;
  if (!set)
    return (
      <Caption>
        {`No structure is drawn for ${spec.formula ?? 'these atoms'}: try ${Object.keys(RESONANCE).map(setFormula).join(', ')}.`}
      </Caption>
    );
  const name = setFormula(spec.formula!);
  const forms = spec.resonance ? set.forms : set.forms.slice(0, 1);
  const f = spec.formal;
  const v = num(f?.valence);
  const N = num(f?.nonbonding);
  const B = num(f?.bonding);
  const FC = num(f?.charge);
  const typed = v !== undefined && N !== undefined && B !== undefined;
  const counts = forms.map((form) => formalCharges(set, form));
  const lit = counts.map((cs) =>
    typed
      ? cs.flatMap((x, i) => (x.v === v && x.N === N && x.B === B ? [i] : []))
      : f?.atom !== undefined && f.valence === undefined
        ? [f.atom]
        : [],
  );
  const k = forms.length;
  const rows = Math.ceil(k / 2);
  const RH = k > 1 ? 172 : 210;
  const size = k > 1 ? 18 : 20;
  const xs = set.atoms.map((a) => a.x);
  const ys = set.atoms.map((a) => a.y);
  const spanX = Math.max(1, Math.max(...xs) - Math.min(...xs));
  const spanY = Math.max(1, Math.max(...ys) - Math.min(...ys));
  const totals = electronTotals(set, forms[0]!);
  const expanded = counts[0]!.flatMap((x, i) => (x.around > 8 ? [i] : []));
  const sums = counts.map((cs) => cs.reduce((s, x) => s + x.FC, 0));
  const each = set.atoms.map((a) => a.el);
  const unique = [...new Set(each)];
  const vSum = unique
    .map((el) => {
      const n = each.filter((e) => e === el).length;
      return `${n > 1 ? `${n} × ` : ''}${valenceElectrons(el)}`;
    })
    .join(' + ');
  const chargeText =
    set.charge > 0 ? ` − ${set.charge}` : set.charge < 0 ? ` + ${-set.charge}` : '';
  const litEl = lit.flat().length ? set.atoms[lit.find((l) => l.length)![0]!]!.el : undefined;

  return (
    <View>
      <Canvas aspect={(w) => (rows * RH + 6) / w}>
        {({ w }) => {
          const pw = k === 1 ? w : (w - 30) / 2;
          const L = Math.min(62, (pw - 100) / spanX, (RH - 86) / spanY);
          const centres = forms.map((_, i) => {
            const row = Math.floor(i / 2);
            const alone = i === k - 1 && k % 2 === 1;
            const x = alone ? w / 2 : i % 2 === 0 ? pw / 2 : w - pw / 2;
            return { x, y: row * RH + RH / 2 + 3 };
          });
          return (
            <Svg width={w} height={rows * RH + 6}>
              {forms.map((form, i) => (
                <FormArt
                  key={i}
                  set={set}
                  form={form}
                  cx={centres[i]!.x}
                  cy={centres[i]!.y}
                  L={L}
                  size={size}
                  lit={lit[i]!}
                />
              ))}
              {forms.slice(1).map((_, i) => {
                const a = centres[i]!;
                const b = centres[i + 1]!;
                // Beside each other on a row, or the lone last form with its arrow to its left.
                if (Math.abs(a.y - b.y) < 1)
                  return <Both key={i} x1={w / 2 - 12} x2={w / 2 + 12} y={a.y} />;
                const left = b.x - pw / 2 + 4;
                return <Both key={i} x1={Math.max(4, left - 30)} x2={left - 4} y={b.y} />;
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `${name}: ${vSum}${chargeText} = ${totals.valence} valence electrons; ${totals.drawn} drawn in ${k > 1 ? 'each form' : 'the structure'}.`,
          litEl && typed
            ? `${litEl}: FC = v − N − B ÷ 2 = ${v} − ${N} − ${B} ÷ 2 = ${signed(v - N - B / 2)}${FC !== undefined && FC !== v - N - B / 2 ? ` (the value shows ${signed(FC)})` : ''}.`
            : typed
              ? `No atom of ${name} has v = ${v}, N = ${N} and B = ${B}; FC = ${signed(v - N - B / 2)} all the same.`
              : 'FC = v − N − B ÷ 2 for each atom, circled beside it.',
          `The formal charges add to ${signed(sums[0]!)}, the ${set.charge === 0 ? 'molecule’s 0' : 'ion’s charge'}${k > 1 ? ', in every form' : ''}.`,
          expanded.length
            ? `${set.atoms[expanded[0]!]!.el} has ${counts[0]![expanded[0]!]!.around} electrons around it: an expanded octet (period 3 and below).`
            : undefined,
          k > 1
            ? `${k} resonance forms${set.total ? ` of ${set.total}` : ''}: the ion is their blend (↔), not a switch between them.`
            : 'The best structure has charges nearest zero, a negative one on the more electronegative atom.',
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}
