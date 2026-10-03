/**
 * Finite elements (HC41, `elementChain`; ME-P25, ACC-P14 `axial`). `chain`: nodes in a row
 * joined by springs or painted steel bars, fixed nodes as hatched walls, nodal loads and
 * reactions as arrows, each node's displacement as an arrow above it (one scale for all), the
 * element number on each element with its k above and its force (T or C) under it.
 * `mesh`: a plate cut into n_x × n_y quadrilaterals with its nodes and the node and DOF counts.
 * Values are read through elementChainMath.ts; a "?" draws nothing of its own.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { ElementChainSpec } from '@/data/modules/typesHe3h';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel } from './common';
import { Hatch } from './beamKit';
import { arrowHead } from './graphKit';
import { makePlacer } from './he2cKit';
import { useHe3hReader, type He3hReader } from './he3hKit';
import { sigText } from './he3hUnits';
import { elementForce, meshCounts, nodeDisplacements } from './elementChainMath';
import { usePaintIds } from './paint';

type Spec = ElementChainSpec;
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (i: number) => [...String(i)].map((ch) => SUB[Number(ch)]).join('');

export function ElementChain({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const R = useHe3hReader(calc);
  const ids = usePaintIds('steel');
  const lines: string[] = [];
  const body = spec.mode === 'mesh' ? mesh(spec, R, c, lines) : chain(spec, R, c, lines, ids.steel);
  for (const id of spec.more ?? []) {
    const lab = R.label(id, '');
    if (lab) lines.push(lab);
  }
  return (
    <View>
      <Canvas aspect={(w) => (spec.mode === 'mesh' ? 250 : 200) / w}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <LinearGradient id={ids.steel} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={c.metalDark} stopOpacity={1} />
                <Stop offset="0.3" stopColor={c.shine} stopOpacity={0.85 * c.sheen} />
                <Stop offset="0.5" stopColor={c.metal} stopOpacity={1} />
                <Stop offset="1" stopColor={c.metalDark} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            {body(w, h)}
          </Svg>
        )}
      </Canvas>
      {lines.length ? <Caption>{lines.join(' · ')}</Caption> : null}
    </View>
  );
}

/** A spring's zigzag from x0 to x1 on the line y. */
const zigzag = (x0: number, x1: number, y: number, amp = 8) => {
  const lead = Math.min(10, (x1 - x0) * 0.15);
  const n = 8;
  const d = (x1 - x0 - 2 * lead) / n;
  const pts = [`M ${x0} ${y}`, `L ${x0 + lead} ${y}`];
  for (let i = 0; i < n; i++)
    pts.push(`L ${x0 + lead + d * (i + 0.5)} ${y + (i % 2 ? amp : -amp)}`);
  pts.push(`L ${x1 - lead} ${y}`, `L ${x1} ${y}`);
  return pts.join(' ');
};

function chain(spec: Spec, R: He3hReader, c: Palette, lines: string[], steelId: string) {
  const { num } = R;
  const els = spec.elements ?? [];
  const count = els.length + 1;
  const fixed = spec.fixed ?? [];
  const u = nodeDisplacements(
    count,
    fixed,
    (spec.disp ?? []).map((x) => ({ node: x.node, u: num(x.u, 'length') })),
  );
  const ks = els.map((e) => num(e.k, 'stiffness'));
  const forces = els.map((e, i) => {
    const given = num(e.force, 'force');
    if (given !== undefined) return given;
    const [k, a, b] = [ks[i], u[i], u[i + 1]];
    return k !== undefined && a !== undefined && b !== undefined
      ? elementForce(k, a, b)
      : undefined;
  });
  const areas = els.map((e) => num(e.A));
  const maxA = Math.max(...areas.map((a) => a ?? 0), 0);
  const fScale = R.unit(spec.loads?.[0]?.F, 'N') === 'kN' ? 1000 : 1;
  const uUnit = R.unit(spec.disp?.[0]?.u, 'mm');

  // The caption: each element's force from k and Δu, and the balance at the loaded node.
  els.forEach((e, i) => {
    const f = forces[i];
    if (f === undefined) return;
    const kText = R.valueText(e.k);
    const du = u[i + 1] !== undefined && u[i] !== undefined ? u[i + 1]! - u[i]! : undefined;
    const how =
      e.force === undefined && kText && du !== undefined
        ? ` = k${sub(i + 1)}(u${sub(i + 2)} − u${sub(i + 1)}) = ${kText} × ${sigText(du, 4)} mm`
        : '';
    lines.push(
      `${R.sym(e.force, `f${sub(i + 1)}`)}${how} = ${sigText(f / fScale, 4)} ${fScale === 1 ? 'N' : 'kN'} (${f >= 0 ? 'tension' : 'compression'}).`,
    );
  });
  if (forces.every((f) => f !== undefined) && els.length)
    lines.push(
      'Each free node balances: its load equals the left element’s force less the right one’s.',
    );
  const sl = spec.stress !== undefined ? R.label(spec.stress, 'σ') : undefined;
  if (sl) lines.push(`${sl}: the force over the bar’s area.`);

  return function draw(w: number, h: number) {
    const y = 104;
    const l = 40;
    const r = w - 40;
    const xs = [...Array(count).keys()].map((i) => l + ((r - l) * i) / Math.max(1, count - 1));
    const out: ReactNode[] = [];
    const place = makePlacer(w, h);
    // Walls at fixed nodes (left of the first node, right of the last, else under it).
    fixed.forEach((n) => {
      const x = xs[n - 1];
      if (x === undefined) return;
      const side = n === 1 ? -1 : 1;
      out.push(
        <G key={`w${n}`}>
          <Rect
            x={side < 0 ? x - 16 : x + 6}
            y={y - 28}
            width={10}
            height={56}
            fill={c.chartGrid}
            opacity={0.6}
          />
          <Hatch
            x1={y - 28}
            x2={y + 28}
            y={side < 0 ? x - 6 : x + 6}
            vertical
            side={side as 1 | -1}
            depth={8}
          />
          <Line
            x1={x}
            y1={y}
            x2={side < 0 ? x - 6 : x + 6}
            y2={y}
            stroke={c.chartInk}
            strokeWidth={2}
          />
        </G>,
      );
    });
    // Elements: springs or bars, the number on each, k above, the force under.
    els.forEach((e, i) => {
      const [a, b] = [xs[i]! + 10, xs[i + 1]! - 10];
      const mid = (a + b) / 2;
      if (e.type === 'bar') {
        const t = maxA > 0 && areas[i] !== undefined ? 8 + (12 * areas[i]!) / maxA : 14;
        out.push(
          <Rect
            key={`e${i}`}
            x={a}
            y={y - t / 2}
            width={b - a}
            height={t}
            fill={`url(#${steelId})`}
            stroke={c.metalDark}
            strokeWidth={1}
          />,
        );
      } else {
        out.push(
          <Path
            key={`e${i}`}
            d={zigzag(a, b, y)}
            stroke={c.physSpring}
            strokeWidth={2.4}
            fill="none"
          />,
        );
      }
      out.push(
        <Rect
          key={`nb${i}`}
          x={mid - 8}
          y={y - 8}
          width={16}
          height={16}
          rx={3}
          fill={c.card}
          stroke={c.chartInk}
          strokeWidth={1.2}
        />,
        <ChartText
          key={`nt${i}`}
          x={mid}
          y={y + 4.5}
          textAnchor="middle"
          fontSize={chart.label}
          fontWeight="700"
        >
          {String(i + 1)}
        </ChartText>,
      );
      place.block({ x0: mid - 9, y0: y - 9, x1: mid + 9, y1: y + 9 });
      const kl = R.label(e.k, `k${sub(i + 1)}`) ?? `${R.sym(e.k, `k${sub(i + 1)}`)} = ?`;
      const pk = place.place(mid, y - 22, kl, chart.label, [
        [0, 0, 'middle'],
        [0, -14, 'middle'],
      ]);
      out.push(
        <ChartText key={`k${i}`} {...pk} fontSize={chart.label} fontWeight="700" fill={c.chartInk}>
          {kl}
        </ChartText>,
      );
      const f = forces[i];
      if (f !== undefined) {
        const fl = R.label(e.force, `f${sub(i + 1)}`, f / fScale, fScale === 1 ? 'N' : 'kN') ?? '';
        const text = `${fl} ${f >= 0 ? 'T' : 'C'}`;
        const pf = place.place(mid, y + 30, text, chart.label, [
          [0, 0, 'middle'],
          [0, 14, 'middle'],
        ]);
        out.push(
          <ChartText
            key={`f${i}`}
            {...pf}
            fontSize={chart.label}
            fill={f >= 0 ? c.sectionTension : c.sectionCompression}
            fontWeight="700"
          >
            {text}
          </ChartText>,
        );
      }
    });
    // Nodes.
    xs.forEach((x, i) => {
      out.push(
        <Circle key={`n${i}`} cx={x} cy={y} r={6} fill={c.chartInk} />,
        <ChartText
          key={`nn${i}`}
          x={x}
          y={y + 4}
          textAnchor="middle"
          fontSize={chart.small}
          fill={c.card}
          fontWeight="700"
        >
          {String(i + 1)}
        </ChartText>,
      );
      place.dot(x, y, 7);
    });
    // Displacements above the nodes, one scale (the largest 46 px).
    const uMax = Math.max(...u.map((v) => Math.abs(v ?? 0)), 0);
    (spec.disp ?? []).forEach((d) => {
      const x = xs[d.node - 1];
      const v = num(d.u, 'length');
      if (x === undefined) return;
      const yy = 38;
      const len = v !== undefined && uMax > 0 ? (46 * v) / uMax : 0;
      out.push(
        <Line
          key={`ut${d.node}`}
          x1={x}
          y1={yy - 8}
          x2={x}
          y2={y - 10}
          stroke={c.chartGrid}
          strokeWidth={1}
          strokeDasharray={chart.dashFine}
        />,
      );
      if (Math.abs(len) > 3)
        out.push(
          <Line
            key={`ul${d.node}`}
            x1={x}
            y1={yy}
            x2={x + len - Math.sign(len) * 6}
            y2={yy}
            stroke={c.chartHighlight}
            strokeWidth={2.2}
          />,
          <Path
            key={`uh${d.node}`}
            d={arrowHead(x + len, yy, Math.sign(len), 0, 8)}
            fill={c.chartHighlight}
          />,
        );
      const ul = R.label(d.u, `u${sub(d.node)}`) ?? `${R.sym(d.u, `u${sub(d.node)}`)} = ?`;
      const p = place.place(x, yy - 10, ul, chart.label, [
        [0, 0, 'middle'],
        [-4, 0, 'end'],
        [4, 0, 'start'],
        [0, -14, 'middle'],
      ]);
      out.push(
        <ChartText
          key={`u${d.node}`}
          {...p}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartHighlight}
        >
          {ul}
        </ChartText>,
      );
    });
    // Loads and reactions at the nodes, as arrows along the chain.
    const arrows = [
      ...(spec.loads ?? []).map((x) => ({
        node: x.node,
        v: num(x.F, 'force'),
        id: x.F,
        sign: x.negate ? -1 : 1,
        name: 'F',
        color: c.beamLoad,
      })),
      ...(spec.reactions ?? []).map((x) => ({
        node: x.node,
        v: num(x.R, 'force'),
        id: x.R,
        sign: 1,
        name: `R${sub(x.node)}`,
        color: c.beamReaction,
      })),
    ];
    arrows.forEach((a, j) => {
      const x = xs[a.node - 1];
      if (x === undefined || a.v === undefined) return;
      const dir = Math.sign(a.v * a.sign) || 1;
      const yy = y + 56;
      // The arrow points along the force, from the node's foot.
      const [x0, x1] = dir > 0 ? [x, x + 36] : [x, x - 36];
      out.push(
        <Line
          key={`al${j}`}
          x1={x}
          y1={y + 8}
          x2={x}
          y2={yy}
          stroke={c.chartGrid}
          strokeWidth={1}
          strokeDasharray={chart.dashFine}
        />,
        <Line
          key={`aa${j}`}
          x1={x0}
          y1={yy}
          x2={x1 - dir * 7}
          y2={yy}
          stroke={a.color}
          strokeWidth={2.6}
        />,
        <Path key={`ah${j}`} d={arrowHead(x1, yy, dir, 0, 9)} fill={a.color} />,
      );
      const base = R.label(a.id, a.name) ?? '';
      const text = base;
      // Centred under the node, slid in from the canvas's edge.
      const cx = fitLabel(x, text, chart.label, w, 'middle').x;
      const p = place.place(cx, yy + 18, text, chart.label, [
        [0, 0, 'middle'],
        [0, 14, 'middle'],
      ]);
      out.push(
        <ChartText key={`at${j}`} {...p} fontSize={chart.label} fontWeight="700" fill={a.color}>
          {text}
        </ChartText>,
      );
    });
    if (uMax > 0 && (spec.disp ?? []).length)
      out.push(
        <ChartText key="us" x={4} y={14} fontSize={chart.small} fill={c.chartMuted}>
          {`Displacements to one scale (${uUnit})`}
        </ChartText>,
      );
    return <G>{out}</G>;
  };
}

function mesh(spec: Spec, R: He3hReader, c: Palette, lines: string[]) {
  const { num } = R;
  const nx = num(spec.nx);
  const ny = num(spec.ny);
  const per = spec.dofPerNode ?? 2;
  const ok = nx !== undefined && ny !== undefined && nx >= 1 && ny >= 1;
  const counts = ok ? meshCounts(Math.round(nx), Math.round(ny), per) : undefined;
  if (counts)
    lines.push(
      `Nodes = (n_x + 1)(n_y + 1) = ${Math.round(nx!) + 1} × ${Math.round(ny!) + 1} = ${counts.nodes}; DOF = ${per} × ${counts.nodes} = ${counts.dof} (${per === 2 ? 'u and v at each node' : `${per} at each node`}).`,
    );
  else lines.push('Type n_x and n_y to cut the plate into elements.');
  return function draw(w: number, h: number) {
    const out: ReactNode[] = [];
    const maxW = w - 100;
    const maxH = h - 86;
    const cell = ok ? Math.min(maxW / nx!, maxH / ny!) : 20;
    const [W, H] = ok ? [cell * nx!, cell * ny!] : [maxW, maxH * 0.6];
    const x0 = 70 + (maxW - W) / 2;
    const y0 = 30 + (maxH - H) / 2;
    out.push(
      <Rect
        key="plate"
        x={x0}
        y={y0}
        width={W}
        height={H}
        fill={c.chartSurface}
        stroke={c.chartInk}
        strokeWidth={1.6}
      />,
    );
    if (ok) {
      for (let i = 1; i < nx!; i++)
        out.push(
          <Line
            key={`vx${i}`}
            x1={x0 + i * cell}
            y1={y0}
            x2={x0 + i * cell}
            y2={y0 + H}
            stroke={c.chartMuted}
            strokeWidth={0.8}
          />,
        );
      for (let j = 1; j < ny!; j++)
        out.push(
          <Line
            key={`hy${j}`}
            x1={x0}
            y1={y0 + j * cell}
            x2={x0 + W}
            y2={y0 + j * cell}
            stroke={c.chartMuted}
            strokeWidth={0.8}
          />,
        );
      const r = Math.max(1.2, Math.min(3, cell / 6));
      for (let i = 0; i <= nx!; i++)
        for (let j = 0; j <= ny!; j++)
          out.push(
            <Circle
              key={`d${i}-${j}`}
              cx={x0 + i * cell}
              cy={y0 + j * cell}
              r={r}
              fill={c.chartHighlight}
            />,
          );
    }
    // The fixed left edge, and a load on the right.
    out.push(
      <G key="bc">
        <Hatch x1={y0} x2={y0 + H} y={x0} vertical side={-1} depth={8} />
        <Line
          key="ld"
          x1={x0 + W + 4}
          y1={y0 + H / 2}
          x2={x0 + W + 26}
          y2={y0 + H / 2}
          stroke={c.beamLoad}
          strokeWidth={2.4}
        />
        <Path d={arrowHead(x0 + W + 30, y0 + H / 2, 1, 0, 9)} fill={c.beamLoad} />
      </G>,
    );
    const xl = R.label(spec.nx, 'n_x') ?? `${R.sym(spec.nx, 'n_x')} = ?`;
    const yl = R.label(spec.ny, 'n_y') ?? `${R.sym(spec.ny, 'n_y')} = ?`;
    out.push(
      <ChartText
        key="xl"
        x={x0 + W / 2}
        y={y0 - 10}
        textAnchor="middle"
        fontSize={chart.label}
        fontWeight="700"
      >
        {xl}
      </ChartText>,
      <ChartText
        key="yl"
        x={x0 - 12}
        y={y0 + H / 2 + 4}
        textAnchor="end"
        fontSize={chart.label}
        fontWeight="700"
      >
        {yl}
      </ChartText>,
    );
    const nl = R.label(spec.nodes, 'Nodes', counts?.nodes) ?? 'Nodes = ?';
    const dl = R.label(spec.dof, 'DOF', counts?.dof) ?? 'DOF = ?';
    out.push(
      <ChartText
        key="nl"
        x={w / 2}
        y={h - 18}
        textAnchor="middle"
        fontSize={chart.value}
        fontWeight="700"
        fill={c.chartHighlight}
      >
        {`${nl}  ·  ${dl}`}
      </ChartText>,
    );
    return <G>{out}</G>;
  };
}
