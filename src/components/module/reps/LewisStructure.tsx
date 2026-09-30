/**
 * Bonding (H47), flat electron-dot diagrams:
 * - `molecule`: a Lewis structure, shared pairs as lines (or dots) and lone pairs as dots, an
 *   ion in brackets with its charge;
 * - `ionic`: metal atoms giving their valence electrons to nonmetal atoms (arrows), then the
 *   ions in brackets, in the smallest whole-number ratio;
 * - `metallic`: metal ions in a sea of the electrons they gave up, every electron drawn;
 * - `hydrocarbon`: a straight chain of n carbons with its hydrogens, single, one double or one
 *   triple bond.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path } from 'react-native-svg';

import type { LewisStructureSpec } from '@/data/modules/typesHsi';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { chargeSup } from './AtomModel';
import { BranchedAlkane } from './BranchedAlkane';
import { elementName, subscript } from './chem';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import {
  LEWIS,
  lewisKey,
  chainHydrogens,
  hydrocarbonName,
  hydrogensOf,
  ionFormula,
  ionic,
  lewisCounts,
  valenceElectrons,
  type Lewis,
} from './lewis';
import { METALS_BY_CHARGE, NONMETALS_BY_CHARGE, ionsFromCharges } from './ionicCharges';
import { Ball, url, usePaintIds } from './paint';

const RAD = Math.PI / 180;
const SYM = 22;

export function LewisStructure({ spec, calc }: { spec: LewisStructureSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'ionic':
      return <Ionic spec={spec} calc={calc} />;
    case 'metallic':
      return <Metallic spec={spec} calc={calc} />;
    case 'hydrocarbon':
      return spec.branches?.length ? (
        <BranchedAlkane spec={spec} calc={calc} />
      ) : (
        <Hydrocarbon spec={spec} calc={calc} />
      );
    default:
      return <Molecule spec={spec} calc={calc} />;
  }
}

/** Two dots side by side, `r` from (x, y) in direction `deg`. */
function pairDots(
  x: number,
  y: number,
  deg: number,
  r: number,
  color: string,
  key: string,
  size = 2.6,
) {
  const [dx, dy] = [Math.cos(deg * RAD), Math.sin(deg * RAD)];
  const [px, py] = [-dy, dx];
  return (
    <G key={key}>
      <Circle cx={x + dx * r + px * 4} cy={y + dy * r + py * 4} r={size} fill={color} />
      <Circle cx={x + dx * r - px * 4} cy={y + dy * r - py * 4} r={size} fill={color} />
    </G>
  );
}

/** Square brackets around a box, with a charge at the top right. */
function Brackets({
  x0,
  y0,
  x1,
  y1,
  charge,
  color,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  charge: number;
  color: string;
}) {
  const c = usePalette();
  const text = `${Math.abs(charge) === 1 ? '' : Math.abs(charge)}${charge > 0 ? '+' : '−'}`;
  return (
    <G>
      <Path
        d={`M ${x0 + 6} ${y0} H ${x0} V ${y1} H ${x0 + 6}`}
        fill="none"
        stroke={c.chartInk}
        strokeWidth={1.6}
      />
      <Path
        d={`M ${x1 - 6} ${y0} H ${x1} V ${y1} H ${x1 - 6}`}
        fill="none"
        stroke={c.chartInk}
        strokeWidth={1.6}
      />
      <ChartText x={x1 + 2} y={y0 + 10} fontSize={chart.label} fontWeight="700" fill={color}>
        {text}
      </ChartText>
    </G>
  );
}

// ─── Molecule ────────────────────────────────────────────────────────────────

function Molecule({
  spec,
  calc,
}: {
  spec: Extract<LewisStructureSpec, { mode: 'molecule' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const atoms = Object.entries(spec.atoms ?? {}).map(([el, x]) => ({ el, r: read(x) }));
  const q = spec.charge === undefined ? undefined : read(spec.charge);
  const key =
    spec.formula ??
    lewisKey(
      Object.fromEntries(atoms.map((a) => [a.el, Math.round(a.r.value)])),
      Math.round(q?.value ?? 0),
    );
  const s: Lewis | undefined = key ? LEWIS[key] : undefined;
  const known =
    atoms.every((a) => a.r.known) &&
    (q?.known ?? true) &&
    [spec.valence, spec.bonding, spec.lone].every((id) => id === undefined || rep.known(id));
  const typed = atoms
    .map((a) => `${a.el}${Math.round(a.r.value) > 1 ? Math.round(a.r.value) : ''}`)
    .join('');
  if (!s)
    return (
      <Caption>
        {`No Lewis structure is drawn for ${subscript(typed)}${q && q.value ? ` with charge ${q.text}` : ''}: try H₂O, NH₃, CH₄, CO₂, N₂, O₂, HCl, CH₂O, HCN, NH₄⁺, H₃O⁺, OH⁻ or CN⁻.`}
      </Caption>
    );
  const counts = lewisCounts(s);
  const name = ionFormula(key!);
  const xs = s.atoms.map((a) => a.x);
  const ys = s.atoms.map((a) => a.y);
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const H = 200;

  const art = (w: number, h: number): ReactNode => {
    const L = Math.min(
      76,
      (w - 120) / Math.max(1, maxX - minX),
      (h - 90) / Math.max(1, maxY - minY),
    );
    const cx = w / 2 - ((minX + maxX) / 2) * L;
    const cy = h / 2 - ((minY + maxY) / 2) * L;
    const P = (a: { x: number; y: number }) => ({ x: cx + a.x * L, y: cy + a.y * L });
    const bonds = s.bonds.map(([i, j, order], k) => {
      const a = P(s.atoms[i]!);
      const b = P(s.atoms[j]!);
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const [ux, uy] = [(b.x - a.x) / len, (b.y - a.y) / len];
      const [nx, ny] = [-uy, ux];
      const trim = 15;
      const offsets = order === 1 ? [0] : order === 2 ? [-3.5, 3.5] : [-6, 0, 6];
      if (spec.dots) {
        // Each shared pair as two dots across the bond's middle.
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        return (
          <G key={`b${k}`}>
            {offsets.map((o, m) =>
              pairDots(
                mx + nx * o * 1.6,
                my + ny * o * 1.6,
                Math.atan2(uy, ux) / RAD,
                0,
                c.chartHighlight,
                `${m}`,
              ),
            )}
          </G>
        );
      }
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
    });
    const pts = s.atoms.map(P);
    const bx0 = Math.min(...pts.map((p) => p.x)) - 34;
    const bx1 = Math.max(...pts.map((p) => p.x)) + 34;
    const by0 = Math.min(...pts.map((p) => p.y)) - 34;
    const by1 = Math.max(...pts.map((p) => p.y)) + 34;
    return (
      <Svg width={w} height={h}>
        <G opacity={known ? 1 : 0.4}>
          {bonds}
          {s.atoms.map((a, i) => {
            const p = pts[i]!;
            return (
              <G key={`a${i}`}>
                <ChartText
                  x={p.x}
                  y={p.y + SYM * 0.36}
                  fontSize={SYM}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {a.el}
                </ChartText>
                {a.lone.map((deg, k) =>
                  pairDots(p.x, p.y, deg, a.el.length > 1 ? 20 : 17, c.chartInk, `l${k}`),
                )}
              </G>
            );
          })}
          {s.charge !== 0 ? (
            <Brackets
              x0={bx0}
              y0={by0}
              x1={bx1}
              y1={by1}
              charge={s.charge}
              color={c.chartHighlight}
            />
          ) : null}
        </G>
      </Svg>
    );
  };

  const each = s.atoms.map((a) => a.el);
  const unique = [...new Set(each)];
  const sum = unique
    .map((el) => {
      const k = each.filter((e) => e === el).length;
      return `${k > 1 ? `${k} × ` : ''}${valenceElectrons(el)}`;
    })
    .join(' + ');
  const chargeText = s.charge > 0 ? ` − ${s.charge}` : s.charge < 0 ? ` + ${-s.charge}` : '';
  return (
    <View>
      <Canvas aspect={(w) => H / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>
        {[
          `${name}: ${sum}${chargeText} = ${counts.valence} valence electrons.`,
          `${counts.bonding} shared pairs (${2 * counts.bonding} electrons, the ${spec.dots ? 'lit dots' : 'lines'}) and ${counts.lone} lone pairs (${2 * counts.lone} electrons).`,
          each.includes('H')
            ? each.every((el) => el === 'H')
              ? 'Each hydrogen has 2 electrons around it.'
              : 'Each hydrogen has 2 electrons around it; every other atom has 8.'
            : 'Every atom has 8 electrons around it.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}

// ─── Ionic ───────────────────────────────────────────────────────────────────

/** Where an atom's k-th valence dot sits: one on each side first, then pairs (right, top, left, bottom). */
const dotSpot = (k: number) => {
  const side = [0, 270, 180, 90][k % 4]!;
  const second = k >= 4;
  return { side, second };
};

function Ionic({
  spec,
  calc,
}: {
  spec: Extract<LewisStructureSpec, { mode: 'ionic' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  // Round 3 (H108 part 2): the elements may come from the ions' charges.
  const pick = ionsFromCharges(spec.charges, spec, (x) => {
    const r = read(x);
    return r.known ? Math.round(r.value) : undefined;
  });
  const { metal, nonmetal } = pick;
  const ion = ionic(metal, nonmetal);
  const ar = spec.metals === undefined ? undefined : read(spec.metals);
  const br = spec.nonmetals === undefined ? undefined : read(spec.nonmetals);
  const known =
    pick.known &&
    [spec.transferred].every((id) => id === undefined || rep.known(id)) &&
    (ar?.known ?? true) &&
    (br?.known ?? true);
  const va = ar ? Math.round(ar.value) : ion.metals;
  const vb = br ? Math.round(br.value) : ion.nonmetals;
  // The ions the values ask for, when their charges balance and they fit; else the formula unit, faded.
  const balanced = va >= 1 && vb >= 1 && va * ion.give === vb * ion.take && va + vb <= 6;
  const [na, nb] = balanced ? [va, vb] : [ion.metals, ion.nonmetals];
  const vm = ion.give;
  const vn = valenceElectrons(nonmetal);
  // Alternate the ions, starting with the more numerous: Cl Mg Cl, Na Cl, O Al O Al O.
  const order: ('m' | 'n')[] = [];
  let [a, b] = [na, nb];
  let turn: 'm' | 'n' = a >= b ? 'm' : 'n';
  while (a + b > 0) {
    if ((turn === 'm' && a > 0) || b === 0) {
      order.push('m');
      a--;
    } else {
      order.push('n');
      b--;
    }
    turn = turn === 'm' ? 'n' : 'm';
  }
  const formula = `${metal}${ion.metals > 1 ? ion.metals : ''}${nonmetal}${ion.nonmetals > 1 ? ion.nonmetals : ''}`;

  const art = (w: number, h: number): ReactNode => {
    const sp = (w - 40) / order.length;
    const X = (i: number) => 20 + sp * (i + 0.5);
    const y1 = 70;
    const y2 = 190;
    // Each metal electron goes to the nearest nonmetal still short of 8.
    const need = order.map((t) => (t === 'n' ? ion.take : 0));
    const got = order.map(() => 0);
    const moves: { from: number; k: number; to: number; slot: number }[] = [];
    order.forEach((t, i) => {
      if (t !== 'm') return;
      for (let k = 0; k < vm; k++) {
        const to = order
          .map((_, j) => j)
          .filter((j) => need[j]! > 0)
          .sort((p, q) => Math.abs(p - i) - Math.abs(q - i) || p - q)[0];
        if (to === undefined) break;
        need[to]!--;
        moves.push({ from: i, k, to, slot: vn + got[to]! });
        got[to]!++;
      }
    });
    const spot = (x: number, y: number, k: number, r = 17) => {
      const { side, second } = dotSpot(k);
      const [dx, dy] = [Math.cos(side * RAD), Math.sin(side * RAD)];
      const off = second ? 4 : -4;
      return { x: x + dx * r - dy * off, y: y + dy * r + dx * off };
    };
    return (
      <Svg width={w} height={h}>
        <ChartText x={8} y={18} fontSize={chart.label} fill={c.chartMuted}>
          Atoms
        </ChartText>
        <ChartText x={8} y={138} fontSize={chart.label} fill={c.chartMuted}>
          Ions
        </ChartText>
        <G opacity={known && balanced ? 1 : 0.4}>
          {order.map((t, i) => {
            const el = t === 'm' ? metal : nonmetal;
            const v = t === 'm' ? vm : vn;
            return (
              <G key={`a${i}`}>
                <ChartText
                  x={X(i)}
                  y={y1 + SYM * 0.36}
                  fontSize={SYM}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {el}
                </ChartText>
                {Array.from({ length: v }, (_, k) => {
                  const p = spot(X(i), y1, k, el.length > 1 ? 20 : 17);
                  return (
                    <Circle
                      key={k}
                      cx={p.x}
                      cy={p.y}
                      r={2.8}
                      fill={t === 'm' ? c.chartHighlight : c.chartInk}
                    />
                  );
                })}
              </G>
            );
          })}
          {moves.map((m, k) => {
            const p = spot(X(m.from), y1, m.k, metal.length > 1 ? 20 : 17);
            const q = spot(X(m.to), y1, m.slot, nonmetal.length > 1 ? 20 : 17);
            const lift = 26 + (k % 3) * 8;
            const mx = (p.x + q.x) / 2;
            const my = Math.min(p.y, q.y) - lift;
            const dir = Math.sign(q.x - p.x) || 1;
            return (
              <G key={`m${k}`}>
                <Path
                  d={`M ${p.x} ${p.y - 4} Q ${mx} ${my} ${q.x - dir * 3} ${q.y - 5}`}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={1.4}
                />
                <Path
                  d={`M ${q.x} ${q.y - 3} l ${-dir * 7} -2 l ${dir * 2} -6 z`}
                  fill={c.chartHighlight}
                />
                <Circle
                  cx={q.x}
                  cy={q.y}
                  r={2.8}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={1.2}
                  strokeDasharray="1.5 1.5"
                />
              </G>
            );
          })}
          {order.map((t, i) => {
            const el = t === 'm' ? metal : nonmetal;
            const x = X(i);
            const half = Math.min(sp / 2 - 10, 26);
            return (
              <G key={`i${i}`}>
                <ChartText
                  x={x}
                  y={y2 + SYM * 0.36}
                  fontSize={SYM}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {el}
                </ChartText>
                {t === 'n'
                  ? Array.from({ length: 8 }, (_, k) => {
                      const p = spot(x, y2, k, el.length > 1 ? 20 : 17);
                      return (
                        <Circle
                          key={k}
                          cx={p.x}
                          cy={p.y}
                          r={2.8}
                          fill={k >= vn ? c.chartHighlight : c.chartInk}
                        />
                      );
                    })
                  : null}
                <Brackets
                  x0={x - half}
                  y0={y2 - 28}
                  x1={x + half}
                  y1={y2 + 28}
                  charge={t === 'm' ? ion.give : -ion.take}
                  color={c.chartHighlight}
                />
              </G>
            );
          })}
        </G>
        <ChartText
          x={w / 2}
          y={h - 8}
          fontSize={chart.emphasis}
          fontWeight="700"
          textAnchor="middle"
        >
          {subscript(formula)}
        </ChartText>
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => 256 / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>
        {[
          ...(spec.charges
            ? [
                pick.known
                  ? `Charges ${ion.give} and ${ion.take}: ${metal}${chargeSup(ion.give)} with ${nonmetal}${chargeSup(-ion.take)}.`
                  : `The charges pick the ions (1, 2, 3: ${(spec.charges.metals ?? METALS_BY_CHARGE).join(', ')} and ${(spec.charges.nonmetals ?? NONMETALS_BY_CHARGE).join(', ')}).`,
              ]
            : []),
          `Each ${elementName(metal).toLowerCase()} atom gives ${vm} electron${vm > 1 ? 's' : ''} (lit); each ${elementName(nonmetal).toLowerCase()} atom takes ${ion.take} to fill its octet.`,
          balanced
            ? `${na} × ${vm} = ${nb} × ${ion.take} = ${na * vm} electrons move; the smallest whole-number ratio gives ${subscript(formula)}.`
            : `${va} × ${vm} ≠ ${vb} × ${ion.take}: those ions' charges do not balance${va + vb > 6 ? ' (or there are more than 6)' : ''}, so the formula unit ${subscript(formula)} is drawn faded.`,
          'The ions’ opposite charges hold them together: an ionic bond.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}

// ─── Metallic ────────────────────────────────────────────────────────────────

/** Scattered spots, the same every time. */
const jitter = (k: number, seed: number) => {
  const v = Math.sin(k * 12.9898 + seed * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

function Metallic({
  spec,
  calc,
}: {
  spec: Extract<LewisStructureSpec, { mode: 'metallic' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ids = usePaintIds('ion', 'electron');
  const nr = read(spec.atoms);
  const n = Math.max(0, Math.min(24, Math.round(nr.value)));
  const v = valenceElectrons(spec.element);
  const cols = Math.max(1, Math.min(6, Math.ceil(Math.sqrt(n * 1.5))));
  const rows = Math.max(1, Math.ceil(n / cols));
  const chargeText = chargeSup(v);

  const art = (w: number, h: number): ReactNode => {
    const cellW = Math.min(58, (w - 40) / cols);
    const cellH = Math.min(58, (h - 30) / rows);
    const x0 = (w - cols * cellW) / 2;
    const y0 = 12;
    const R = Math.min(cellW, cellH) * 0.3;
    const ionAt = (i: number) => ({
      x: x0 + ((i % cols) + 0.5) * cellW,
      y: y0 + (Math.floor(i / cols) + 0.5) * cellH,
    });
    // Electrons in the spaces between the ions, spread over the whole block.
    const electrons = Array.from({ length: n * v }, (_, k) => {
      const cell = k % Math.max(1, n);
      const p = ionAt(cell);
      const a = jitter(k, 3) * 2 * Math.PI;
      const r = R + 5 + jitter(k, 7) * (Math.min(cellW, cellH) / 2 - R - 6);
      return { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r };
    });
    return (
      <Svg width={w} height={h}>
        <Defs>
          <Ball id={ids.ion} color={c.atomMetal} />
          <Ball id={ids.electron} color={c.atomElectron} />
        </Defs>
        <Path
          d={`M ${x0 - 8} ${y0 - 4} h ${cols * cellW + 16} v ${rows * cellH + 8} h ${-cols * cellW - 16} z`}
          fill={c.chartSurface}
          stroke={c.chartGrid}
          strokeWidth={1}
        />
        <G opacity={nr.known ? 1 : 0.4}>
          {Array.from({ length: n }, (_, i) => {
            const p = ionAt(i);
            return (
              <G key={`i${i}`}>
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={R}
                  fill={url(ids.ion)}
                  stroke={c.shade}
                  strokeOpacity={0.35}
                  strokeWidth={0.8}
                />
                <ChartText
                  x={p.x}
                  y={p.y + 4}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor="middle"
                  fill={c.atomInk}
                >
                  {`${spec.element}${chargeText}`}
                </ChartText>
              </G>
            );
          })}
          {electrons.map((e, k) => (
            <Circle key={`e${k}`} cx={e.x} cy={e.y} r={3} fill={url(ids.electron)} />
          ))}
        </G>
        <ChartText
          x={w / 2}
          y={h - 6}
          fontSize={chart.label}
          fill={c.chartMuted}
          textAnchor="middle"
        >
          {`${n} ${spec.element}${chargeText} ions, ${n * v} free electrons`}
        </ChartText>
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => (Math.min(58, (w - 40) / cols) * rows + 44) / w}>
        {({ w, h }) => art(w, h)}
      </Canvas>
      <Caption>
        {nr.known
          ? [
              `Each ${elementName(spec.element).toLowerCase()} atom gives its ${v} valence electron${v > 1 ? 's' : ''} to the whole piece: ${n} × ${v} = ${n * v} electrons.`,
              'They move freely among the positive ions (a sea of electrons), so metals conduct and bend without breaking.',
            ].join(' · ')
          : 'Type the number of atoms.'}
      </Caption>
    </View>
  );
}

// ─── Hydrocarbon ─────────────────────────────────────────────────────────────

function Hydrocarbon({
  spec,
  calc,
}: {
  spec: Extract<LewisStructureSpec, { mode: 'hydrocarbon' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const bond = spec.bond ?? 'single';
  const nr = read(spec.carbons);
  const least = bond === 'single' ? 1 : 2;
  const n = Math.max(least, Math.min(8, Math.round(nr.value)));
  const hs = chainHydrogens(n, bond);
  const total = hydrogensOf(n, bond);
  const order = bond === 'single' ? 1 : bond === 'double' ? 2 : 3;
  const name = hydrocarbonName(n, bond);
  const formula = `C${n > 1 ? n : ''}H${total}`;

  const art = (w: number, h: number): ReactNode => {
    const sp = Math.min(64, (w - 40) / (n + 1));
    const x0 = w / 2 - ((n - 1) * sp) / 2;
    const y = h / 2 - 8;
    const hl = Math.min(34, sp * 0.95);
    const fs = sp < 44 ? 16 : 20;
    const line = (xa: number, ya: number, xb: number, yb: number, k: string, off = 0) => {
      const len = Math.hypot(xb - xa, yb - ya);
      const [ux, uy] = [(xb - xa) / len, (yb - ya) / len];
      const t = fs * 0.55;
      return (
        <Line
          key={k}
          x1={xa + ux * t - uy * off}
          y1={ya + uy * t + ux * off}
          x2={xb - ux * t - uy * off}
          y2={yb - uy * t + ux * off}
          stroke={c.chartInk}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      );
    };
    const parts: ReactNode[] = [];
    for (let i = 0; i < n; i++) {
      const x = x0 + i * sp;
      parts.push(
        <ChartText
          key={`c${i}`}
          x={x}
          y={y + fs * 0.36}
          fontSize={fs}
          fontWeight="700"
          textAnchor="middle"
        >
          C
        </ChartText>,
      );
      if (i < n - 1) {
        const o = i === 0 ? order : 1;
        const offs = o === 1 ? [0] : o === 2 ? [-3, 3] : [-5, 0, 5];
        offs.forEach((off, k) => parts.push(line(x, y, x + sp, y, `cc${i}-${k}`, off)));
      }
      const h = hs[i]!;
      const end = i === 0 ? -1 : i === n - 1 ? 1 : 0;
      const dirs: [number, number][] =
        n === 1
          ? [
              [0, -1],
              [0, 1],
              [-1, 0],
              [1, 0],
            ]
          : end !== 0 && h === 3
            ? [
                [end, 0],
                [0, -1],
                [0, 1],
              ]
            : end !== 0 && h === 1
              ? [[end, 0]]
              : h === 1
                ? [[0, -1]]
                : [
                    [0, -1],
                    [0, 1],
                  ];
      dirs.slice(0, h).forEach(([dx, dy], k) => {
        const hx = x + dx * hl;
        const hy = y + dy * hl;
        parts.push(line(x, y, hx, hy, `h${i}-${k}`));
        parts.push(
          <ChartText
            key={`ht${i}-${k}`}
            x={hx}
            y={hy + fs * 0.36}
            fontSize={fs}
            fontWeight="600"
            textAnchor="middle"
            fill={c.chartMuted}
          >
            H
          </ChartText>,
        );
      });
    }
    return (
      <Svg width={w} height={h}>
        <G opacity={nr.known ? 1 : 0.4}>{parts}</G>
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => 150 / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>
        {nr.known
          ? [
              `${name[0]!.toUpperCase()}${name.slice(1)}, ${subscript(formula)}: every carbon makes 4 bonds and every hydrogen 1.`,
              bond === 'single'
                ? `Hydrogens = 2 × ${n} + 2 = ${total}.`
                : bond === 'double'
                  ? `One double bond: hydrogens = 2 × ${n} = ${total}.`
                  : `One triple bond: hydrogens = 2 × ${n} − 2 = ${total}.`,
            ].join(' · ')
          : 'Type the number of carbons.'}
      </Caption>
    </View>
  );
}
