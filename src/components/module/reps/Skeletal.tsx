/**
 * `skeletal` (HC2, `typesHe1c.ts`): a line-angle structure from its SMILES-like spec, with a
 * lit group, chain numbers, CIP ranks and R or S; the IHD's rings and π bonds counted on the
 * structure a typed formula draws (or its π bonds taking H₂); a pair of enantiomers with their
 * shares; or cyclohexane's chair before and after a ring flip. Flat, as a textbook draws them.
 */
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import type { SkeletalSpec } from '@/data/modules/typesHe1c';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { subscript } from './chem';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { fitLayout, SkeletalView } from './skeletalDraw';
import {
  chainNumbers,
  chairOf,
  cipRanks,
  configurationOf,
  formulaOf,
  GROUP_WORDS,
  ihdOf,
  layoutMol,
  litAtoms,
  parseSmiles,
  pickCandidate,
  unsaturation,
  type SkLayout,
} from './skeletalMath';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function Skeletal({ spec, calc }: { spec: SkeletalSpec; calc: Calculator }) {
  if (spec.mode === 'chair') return <ChairView spec={spec} calc={calc} />;
  return <StructureView spec={spec} calc={calc} />;
}

/** Which structure a spec draws with the current values, and why when none. */
function useStructure(spec: SkeletalSpec, calc: Calculator) {
  const rep = useRep(calc);
  const read = reader(rep);
  const i = spec.ihd;
  if (!i) return { smiles: spec.smiles, name: spec.name, counts: undefined, why: undefined };
  const c = read(i.carbons);
  const h = read(i.hydrogens);
  const n = i.nitrogens === undefined ? undefined : read(i.nitrogens);
  const x = i.halogens === undefined ? undefined : read(i.halogens);
  const pi = i.pi === undefined ? undefined : read(i.pi);
  const rings = i.rings === undefined ? undefined : read(i.rings);
  const known = c.known && h.known && (n?.known ?? true) && (x?.known ?? true);
  const counts = {
    c: c.value!,
    h: h.value!,
    n: n?.value ?? 0,
    x: x?.value ?? 0,
  };
  if (!known) return { smiles: undefined, name: undefined, counts: undefined, why: 'type' };
  const ihd = ihdOf(counts.c, counts.h, counts.n, counts.x);
  if (ihd < 0 || !Number.isInteger(ihd))
    return { smiles: undefined, name: undefined, counts: { ...counts, ihd }, why: 'formula' };
  const want = {
    ...counts,
    ...(pi?.known ? { pi: pi.value } : {}),
    ...(rings?.known ? { rings: rings.value } : {}),
  };
  const list =
    spec.candidates ?? (spec.smiles ? [{ smiles: spec.smiles, name: spec.name ?? '' }] : []);
  const k = pickCandidate(
    list.map((s) => s.smiles),
    want,
  );
  return {
    smiles: k >= 0 ? list[k]!.smiles : undefined,
    name: k >= 0 ? list[k]!.name : undefined,
    counts: { ...counts, ihd },
    why: k >= 0 ? undefined : 'none',
  };
}

function StructureView({ spec, calc }: { spec: SkeletalSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const pick = useStructure(spec, calc);
  const mol = pick.smiles ? parseSmiles(pick.smiles) : undefined;
  const ok = mol && !mol.error;
  const pair = !!spec.enantiomers;
  const aspect = pair ? 1.1 : 2.2;
  const lay: SkLayout | undefined = ok
    ? layoutMol(mol, { aspect, center: spec.center })
    : undefined;
  const u = mol && ok ? unsaturation(mol) : undefined;
  const tally = !!spec.ihd;
  const ranks = lay && spec.center !== undefined ? cipRanks(lay.mol, spec.center) : undefined;
  const rs = lay && spec.center !== undefined ? configurationOf(lay.mol, spec.center) : undefined;
  const major = spec.enantiomers ? read(spec.enantiomers.major) : undefined;
  const mirrorRs = rs === 'R' ? 'S' : rs === 'S' ? 'R' : undefined;
  const marks = lay
    ? {
        lit: litAtoms(lay.mol, spec.group),
        numbers: chainNumbers(lay.mol, spec.numbered),
        ...(ranks ? { ranks, center: spec.center } : {}),
        ...(spec.rs !== false && rs ? { rs } : {}),
        rings: tally && !spec.ihd?.hydrogen,
        ...(tally ? { pi: spec.ihd?.hydrogen ? ('h2' as const) : ('pi' as const) } : {}),
      }
    : undefined;

  const heightFor = (w: number) => {
    if (!lay) return tally ? 70 : 60;
    const half = pair ? (w - 24) / 2 : w;
    const f = fitLayout(lay, half, 1000, 44, 22, chart.value);
    const ys = lay.pos.map((p) => p[1]).concat(lay.hs.map((x) => x.at[1]));
    const bh = (Math.max(...ys) - Math.min(...ys)) * f.scale;
    return Math.max(110, bh + 64) + (tally ? 34 : 0) + (pair ? 30 : 0);
  };

  const art = (w: number, h: number) => {
    const extra = (tally ? 34 : 0) + (pair ? 30 : 0);
    const boxH = h - extra;
    const font = chart.value;
    const views = [];
    if (lay && marks) {
      if (pair) {
        const half = (w - 24) / 2;
        const f = fitLayout(lay, half, boxH, 40, 22, chart.value);
        views.push(
          <SkeletalView
            key="l"
            lay={lay}
            x0={half / 2}
            y0={boxH / 2}
            {...f}
            font={font}
            c={c}
            marks={marks}
          />,
          <SkeletalView
            key="r"
            lay={lay}
            x0={w - half / 2}
            y0={boxH / 2}
            {...f}
            font={font}
            c={c}
            marks={{ ...marks, ...(mirrorRs && spec.rs !== false ? { rs: mirrorRs } : {}) }}
            mirror
          />,
          <Line
            key="mirror"
            x1={w / 2}
            y1={10}
            x2={w / 2}
            y2={boxH + 6}
            stroke={c.chartMuted}
            strokeWidth={1.5}
            strokeDasharray={chart.dash}
          />,
        );
        if (major?.known) {
          const share = [major.value!, 100 - major.value!];
          share.forEach((s, k) => {
            const cx = k === 0 ? half / 2 : w - half / 2;
            const name = k === 0 ? rs : mirrorRs;
            views.push(
              <ChartText
                key={`share${k}`}
                x={cx}
                y={boxH + 22}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
                fill={k === 0 ? c.chartHighlight : c.chartInk}
              >
                {`${name ? `(${name}): ` : ''}${formatNumber(Number(s.toFixed(4)))}%`}
              </ChartText>,
            );
          });
        }
      } else {
        const f = fitLayout(lay, w, boxH, 44, 22, chart.value);
        views.push(
          <SkeletalView
            key="m"
            lay={lay}
            x0={w / 2}
            y0={boxH / 2}
            {...f}
            font={font}
            c={c}
            marks={marks}
          />,
        );
      }
    }
    if (tally && pick.counts && !pick.why) {
      const text = spec.ihd?.hydrogen
        ? `${plural(u!.pi, 'π bond')} take ${plural(u!.pi, 'H₂', 'H₂')}; ${plural(u!.rings, 'ring')} stay${u!.rings === 1 ? 's' : ''}`
        : `${plural(u!.rings, 'ring')} + ${plural(u!.pi, 'π bond')} = IHD ${u!.ihd}`;
      views.push(
        <ChartText
          key="tally"
          x={w / 2}
          y={h - 12}
          fontSize={chart.value}
          fontWeight="700"
          textAnchor="middle"
        >
          {text}
        </ChartText>,
      );
    } else if (tally && pick.counts && pick.why === 'none' && pick.counts.ihd >= 0) {
      // No structure here has the formula: the IHD as boxes, each a ring or a π bond.
      const n = Math.min(12, pick.counts.ihd);
      const s = Math.min(28, (w - 40) / Math.max(1, n));
      const x0 = w / 2 - (n * s) / 2;
      for (let k = 0; k < n; k++)
        views.push(
          <Rect
            key={`box${k}`}
            x={x0 + k * s + 2}
            y={boxH / 2 - s / 2}
            width={s - 4}
            height={s - 4}
            rx={4}
            fill={c.chartFill}
            stroke={c.chartHighlight}
            strokeWidth={1.5}
          />,
        );
      views.push(
        <ChartText
          key="tally"
          x={w / 2}
          y={h - 12}
          fontSize={chart.value}
          fontWeight="700"
          textAnchor="middle"
        >
          {`IHD ${pick.counts.ihd}: ${plural(pick.counts.ihd, 'ring or π bond', 'rings or π bonds')}`}
        </ChartText>,
      );
    }
    return (
      <Svg width={w} height={h}>
        <G>{views}</G>
      </Svg>
    );
  };

  const f = mol && ok ? formulaOf(mol) : undefined;
  const formula = f ? subscript(f.text) : '';
  const lines: string[] = [];
  if (mol?.error) lines.push(`Can't draw ${pick.smiles}: ${mol.error}.`);
  if (spec.ihd) {
    const i = spec.ihd;
    const k = pick.counts;
    if (pick.why === 'type' || !k)
      lines.push('Type the numbers of C and H atoms to draw a structure.');
    else {
      const parts = [`2 × ${k.c} + 2`];
      if (i.nitrogens !== undefined) parts.push(`+ ${k.n}`);
      parts.push(`− ${k.h}`);
      if (i.halogens !== undefined) parts.push(`− ${k.x}`);
      lines.push(`IHD = (${parts.join(' ')}) ÷ 2 = ${formatNumber(k.ihd)}.`);
      if (pick.why === 'formula')
        lines.push(
          k.ihd < 0
            ? 'No molecule has more H than a chain can hold (2C + 2): check the counts.'
            : 'A neutral molecule has an even number of H, N and X together: check the counts.',
        );
      else if (pick.why === 'none')
        lines.push(
          'None of the structures drawn here has this formula: each ring or π bond adds 1.',
        );
      else if (u && pick.name) {
        if (i.hydrogen) {
          lines.push(
            `${cap(pick.name)}, ${formula}: each π bond takes one H₂, so ${plural(u.pi, 'π bond')}; rings = IHD − π bonds = ${u.ihd} − ${u.pi} = ${u.rings}.`,
          );
        } else {
          lines.push(
            `One structure with these counts: ${pick.name}, ${formula}: ${plural(u.rings, 'ring')} + ${plural(u.pi, 'π bond')} = ${u.ihd}.`,
          );
          lines.push(
            'O and S add no H, so they leave the IHD as it is; a triple bond is 2 π bonds.',
          );
        }
      }
    }
  } else if (lay && f) {
    lines.push(
      `${spec.name ? `${cap(spec.name)}, ` : ''}${formula}: each corner and line end is a C, with its H left out.`,
    );
  }
  if (lay && spec.group && marks?.lit.size) {
    const g = Array.isArray(spec.group) ? 'the lit atoms' : GROUP_WORDS[spec.group];
    lines.push(`Lit: ${g}.`);
  }
  if (lay && marks?.numbers.size)
    lines.push(
      `The parent chain is numbered 1 to ${marks.numbers.size}, from the end that gives the lowest numbers.`,
    );
  if (lay && spec.center !== undefined) {
    if (!ranks)
      lines.push(
        `Atom ${spec.center} has two groups that rank the same: it is not a stereocenter.`,
      );
    else {
      lines.push(
        'Ranks 1–4 by atomic number at the first point of difference; a wedge points toward you, a dash away.',
      );
      if (rs && spec.rs !== false)
        lines.push(
          `With rank 4 pointing away, 1 → 2 → 3 turns ${rs === 'R' ? 'clockwise: R' : 'counterclockwise: S'}.`,
        );
    }
  }
  if (pair && major?.known)
    lines.push(
      `A mirror image has every stereocenter flipped: (${rs}) ${formatNumber(Number(major.value!.toFixed(4)))}% and (${mirrorRs}) ${formatNumber(Number((100 - major.value!).toFixed(4)))}%.`,
    );
  return (
    <View>
      <Canvas aspect={(w) => heightFor(w) / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

function ChairView({ spec, calc }: { spec: SkeletalSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ch = spec.chair ?? { groups: [] };
  const groups = ch.groups.filter((g) => g.at >= 1 && g.at <= 6);
  const g0 = groups[0];
  // The first chair puts the first group axial.
  const plain = chairOf(false);
  const firstFlipped = g0 ? plain.up[g0.at - 1] !== (g0.face === 'up' ? 1 : -1) : false;
  const chairs = [chairOf(firstFlipped), chairOf(!firstFlipped)];
  const k = ch.k === undefined ? undefined : read(ch.k);
  const pct = ch.percent === undefined ? undefined : read(ch.percent);
  const kText = typeof ch.k === 'string' ? rep.label(ch.k) : `K = ${k?.text ?? '?'}`;
  const axialIn = (chair: ReturnType<typeof chairOf>, g: (typeof groups)[number]) =>
    chair.up[g.at - 1] === (g.face === 'up' ? 1 : -1);

  const art = (w: number, h: number) => {
    const mid = 92;
    const bw = (w - mid) / 2;
    const s = Math.min(56, bw / 3.3);
    const cy = 96;
    const font = chart.value;
    const nodes = [];
    chairs.forEach((chair, ci) => {
      const ox = ci === 0 ? bw / 2 : w - bw / 2;
      const P = (p: [number, number]): [number, number] => [ox + p[0] * s, cy - p[1] * s];
      const ring = chair.ring.map(P);
      nodes.push(
        <Path
          key={`ring${ci}`}
          d={`M ${ring.map((p) => p.join(' ')).join(' L ')} Z`}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={2}
          strokeLinejoin="round"
        />,
      );
      const axialGroups = groups.filter((g) => axialIn(chair, g));
      groups.forEach((g, gi) => {
        const at = g.at - 1;
        const ax = axialIn(chair, g);
        const d = ax ? chair.axial[at]! : chair.equatorial[at]!;
        const from = ring[at]!;
        const len = 0.85;
        const to: [number, number] = [from[0] + d[0] * s * len, from[1] - d[1] * s * len];
        const lx = from[0] + d[0] * s * (len + 0.3);
        const ly = from[1] - d[1] * s * (len + 0.3);
        nodes.push(
          <G key={`g${ci}-${gi}`}>
            <Line
              x1={from[0]}
              y1={from[1]}
              x2={to[0]}
              y2={to[1]}
              stroke={c.chartHighlight}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <ChartText
              x={lx}
              y={ly + font * 0.36}
              fontSize={font}
              fontWeight="700"
              textAnchor="middle"
              fill={c.chartHighlight}
              halo
            >
              {g.label}
            </ChartText>
          </G>,
        );
      });
      // 1,3-diaxial H: same side as each axial group, two carbons away.
      for (const g of axialGroups) {
        const at = g.at - 1;
        for (const o of [(at + 2) % 6, (at + 4) % 6]) {
          if (groups.some((x) => x.at - 1 === o)) continue;
          const from = ring[o]!;
          const d = chair.axial[o]!;
          const to: [number, number] = [from[0], from[1] - d[1] * s * 0.6];
          const gl: [number, number] = [ring[at]![0], ring[at]![1] - chair.axial[at]![1] * s * 1.0];
          nodes.push(
            <G key={`h${ci}-${o}`}>
              <Line
                x1={from[0]}
                y1={from[1]}
                x2={to[0]}
                y2={to[1]}
                stroke={c.chartInk}
                strokeWidth={1.4}
              />
              <ChartText
                x={to[0]}
                y={to[1] - d[1] * 9 + font * 0.36}
                fontSize={font}
                textAnchor="middle"
                halo
              >
                H
              </ChartText>
              <Line
                x1={to[0]}
                y1={to[1] - d[1] * 2}
                x2={gl[0]}
                y2={gl[1]}
                stroke={c.chartMuted}
                strokeWidth={1.3}
                strokeDasharray={chart.dashFine}
              />
            </G>,
          );
        }
      }
      // Under the chair: which way each group points, and the chair's share.
      const words = groups
        .map((g) => `${g.label} ${axialIn(chair, g) ? 'axial' : 'equatorial'}`)
        .join(', ');
      nodes.push(
        <ChartText
          key={`w${ci}`}
          x={ox}
          y={cy + s * 1.35}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.chartInk}
        >
          {words}
        </ChartText>,
      );
      if (pct?.known) {
        const share = ci === 1 ? pct.value! : 100 - pct.value!;
        const bx = ox - bw * 0.4;
        const by = cy + s * 1.35 + 12;
        const full = bw * 0.8;
        nodes.push(
          <G key={`bar${ci}`}>
            <Rect
              x={bx}
              y={by}
              width={full}
              height={12}
              rx={3}
              fill={c.chartSurface}
              stroke={c.chartGrid}
            />
            <Rect
              x={bx}
              y={by}
              width={(full * Math.max(0, Math.min(100, share))) / 100}
              height={12}
              rx={3}
              fill={c.chartHighlight}
            />
            <ChartText
              x={ox}
              y={by + 30}
              fontSize={chart.value}
              fontWeight="700"
              textAnchor="middle"
            >
              {`${formatNumber(Number(share.toFixed(4)))}%`}
            </ChartText>
          </G>,
        );
      }
    });
    // The equilibrium arrows, the longer toward the favored chair.
    const ax0 = bw + 10;
    const ax1 = w - bw - 10;
    const fwd = k?.known ? (k.value! >= 1 ? 1 : 0.55) : 1;
    const back = k?.known ? (k.value! >= 1 ? 0.55 : 1) : 1;
    const len = ax1 - ax0;
    const yA = cy - 4;
    const yB = cy + 4;
    const f0 = (ax0 + ax1) / 2 - (len * fwd) / 2;
    const f1 = (ax0 + ax1) / 2 + (len * fwd) / 2;
    const b0 = (ax0 + ax1) / 2 - (len * back) / 2;
    const b1 = (ax0 + ax1) / 2 + (len * back) / 2;
    nodes.push(
      <G key="arrows">
        <Path
          d={`M ${f0} ${yA} L ${f1} ${yA} L ${f1 - 8} ${yA - 6}`}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={1.8}
        />
        <Path
          d={`M ${b1} ${yB} L ${b0} ${yB} L ${b0 + 8} ${yB + 6}`}
          fill="none"
          stroke={c.chartInk}
          strokeWidth={1.8}
        />
        <ChartText
          x={(ax0 + ax1) / 2}
          y={yA - 14}
          fontSize={chart.label}
          textAnchor="middle"
          fill={c.chartMuted}
        >
          ring flip
        </ChartText>
        {k?.known ? (
          <ChartText
            x={(ax0 + ax1) / 2}
            y={yB + 22}
            fontSize={chart.value}
            fontWeight="700"
            textAnchor="middle"
          >
            {kText}
          </ChartText>
        ) : null}
      </G>,
    );
    const cond = [ch.energy, ch.temperature]
      .filter((x): x is string => typeof x === 'string' && rep.known(x))
      .map((x) => rep.label(x))
      .join(' · ');
    if (cond)
      nodes.push(
        <ChartText
          key="cond"
          x={w / 2}
          y={h - 10}
          fontSize={chart.value}
          textAnchor="middle"
          fill={c.chartInk}
        >
          {cond}
        </ChartText>,
      );
    return (
      <Svg width={w} height={h}>
        <G>{nodes}</G>
      </Svg>
    );
  };

  const first = groups.map((g) => g.label).join(' and ');
  const lines = [
    g0
      ? `A ring flip turns every axial bond equatorial: the ${first} axial in the first chair is equatorial in the second.`
      : 'A ring flip turns every axial bond equatorial and every equatorial bond axial.',
    'An axial group is crowded by the axial H two carbons away on each side (dotted).',
  ];
  if (k?.known && pct?.known)
    lines.push(
      `${kText}, so ${formatNumber(Number(pct.value!.toFixed(4)))}% of the molecules are in the second chair.`,
    );
  return (
    <View>
      <Canvas aspect={(w) => 270 / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
