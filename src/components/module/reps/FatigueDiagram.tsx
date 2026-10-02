/**
 * Fatigue (HC52, `fatigueDiagram`; ME-P17, ACC-P37 S–N part), flat diagrams drawn from the
 * values (fatigueMath.ts): the Goodman diagram (σ_m against σ_a, the line from S_e to S_ut, the
 * yield line dashed, the load line from the origin through the point to the Goodman line, n as
 * the ratio of the two lengths); the S–N line on log–log axes from 10³ to 10⁶, flat at S_e past
 * it, with the page's stress read across to its life; Basquin's line over reversals 2N; and a
 * Miner bar (each block's share of the damage, filled toward failure at D = 1). A "?" draws
 * nothing of its own.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { FatigueDiagramSpec } from '@/data/modules/typesHe3h';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil } from './common';
import { makePlacer, poly } from './he2cKit';
import { Bracket, useHe3hReader, type He3hReader } from './he3hKit';
import { sigText } from './he3hUnits';
import { basquinReversals, goodmanN, lifeAt, minerDamage, snLine } from './fatigueMath';

type Spec = FatigueDiagramSpec;

const SUP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
};
const pow10 = (n: number) => `10${[...String(n)].map((ch) => SUP[ch] ?? ch).join('')}`;

export function FatigueDiagram({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const R = useHe3hReader(calc);
  const lines: string[] = [];
  let body: (w: number, h: number) => ReactNode;
  let height = 300;
  if (spec.mode === 'goodman') body = goodman(spec, R, c, lines);
  else if (spec.mode === 'miner') {
    body = miner(spec, R, c, lines);
    height = 220;
  } else body = snCurve(spec, R, c, lines);
  for (const id of spec.more ?? []) {
    const lab = R.label(id, '');
    if (lab) lines.push(lab);
  }
  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            {body(w, h)}
          </Svg>
        )}
      </Canvas>
      {lines.length ? <Caption>{lines.join(' · ')}</Caption> : null}
    </View>
  );
}

/** Axes with ticks; `fmt` writes a tick. */
function Axes({
  c,
  l,
  r,
  t,
  b,
  xs,
  ys,
  sx,
  sy,
  fx,
  fy,
  xName,
  yName,
}: {
  c: Palette;
  l: number;
  r: number;
  t: number;
  b: number;
  xs: number[];
  ys: number[];
  sx: (x: number) => number;
  sy: (y: number) => number;
  fx: (x: number) => string;
  fy: (y: number) => string;
  xName: string;
  yName: string;
}) {
  return (
    <G>
      {ys.map((y) => (
        <G key={`y${y}`}>
          <Line x1={l} y1={sy(y)} x2={r} y2={sy(y)} stroke={c.chartGrid} strokeWidth={0.8} />
          <ChartText
            x={l - 4}
            y={sy(y) + 4}
            textAnchor="end"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {fy(y)}
          </ChartText>
        </G>
      ))}
      {xs.map((x) => (
        <G key={`x${x}`}>
          <Line x1={sx(x)} y1={t} x2={sx(x)} y2={b} stroke={c.chartGrid} strokeWidth={0.8} />
          <ChartText
            x={sx(x)}
            y={b + 16}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {fx(x)}
          </ChartText>
        </G>
      ))}
      <Line x1={l} y1={t} x2={l} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
      <Line x1={l} y1={b} x2={r} y2={b} stroke={c.chartInk} strokeWidth={1.2} />
      <ChartText x={(l + r) / 2} y={b + 32} textAnchor="middle" fontSize={chart.label}>
        {xName}
      </ChartText>
      <ChartText x={4} y={t - 10} fontSize={chart.label}>
        {yName}
      </ChartText>
    </G>
  );
}

const linTicks = (hi: number, n = 4) => {
  const step = niceCeil(hi / n);
  return [...Array(Math.floor(hi / step + 1e-9) + 1).keys()].map((i) =>
    Number((i * step).toPrecision(8)),
  );
};

// ─── Goodman ─────────────────────────────────────────────────────────────────

function goodman(spec: Spec, R: He3hReader, c: Palette, lines: string[]) {
  const { num } = R;
  const Se = num(spec.Se, 'stress');
  const Sut = num(spec.Sut, 'stress');
  const Sy = num(spec.Sy, 'stress');
  const smax = num(spec.smax, 'stress');
  const smin = num(spec.smin, 'stress');
  const sa =
    num(spec.sa, 'stress') ??
    (smax !== undefined && smin !== undefined ? (smax - smin) / 2 : undefined);
  const sm =
    num(spec.sm, 'stress') ??
    (smax !== undefined && smin !== undefined ? (smax + smin) / 2 : undefined);
  const n =
    num(spec.n) ??
    (sa !== undefined && sm !== undefined && Se && Sut ? goodmanN(sa, sm, Se, Sut) : undefined);
  const u = R.unit(spec.Se, 'MPa');
  if (
    Se !== undefined &&
    Sut !== undefined &&
    sa !== undefined &&
    sm !== undefined &&
    n !== undefined
  ) {
    lines.push(
      `Goodman: σ_a ÷ S_e + σ_m ÷ S_ut = ${sigText(sa, 4)} ÷ ${sigText(Se, 4)} + ${sigText(sm, 4)} ÷ ${sigText(Sut, 4)} = 1 ÷ n, so n = ${sigText(n, 3)}.`,
    );
    lines.push(
      n >= 1
        ? `The load line from the origin meets the Goodman line ${sigText(n, 3)} times as far out as the point: the part is safe.`
        : `The point lies past the Goodman line (n under 1): the part fails in fatigue.`,
    );
  } else lines.push('Type S_e, S_ut and the stresses to place the point and the load line.');
  if (Sy !== undefined && sa !== undefined && sm !== undefined)
    lines.push(
      `Yield (dashed): σ_a + σ_m = ${sigText(sa + sm, 4)} ${u} against S_y = ${sigText(Sy, 4)} ${u}.`,
    );

  return function draw(w: number, h: number) {
    const l = 48;
    const r = w - 16;
    const t = 30;
    const b = h - 44;
    const xHi = Math.max(Sut ?? 0, Sy ?? 0, (sm ?? 0) * Math.max(1, n ?? 1), 100) * 1.08;
    const yHi = Math.max(Se ?? 0, Sy ?? 0, (sa ?? 0) * Math.max(1, n ?? 1), 50) * 1.15;
    const xs = linTicks(xHi);
    const ys = linTicks(yHi);
    const X = xs[xs.length - 1]! < xHi ? xHi : xs[xs.length - 1]!;
    const Y = ys[ys.length - 1]! < yHi ? yHi : ys[ys.length - 1]!;
    const sx = (x: number) => l + (x / X) * (r - l);
    const sy = (y: number) => b - (y / Y) * (b - t);
    const place = makePlacer(w, h);
    const out: ReactNode[] = [
      <Axes
        key="ax"
        c={c}
        l={l}
        r={r}
        t={t}
        b={b}
        xs={xs}
        ys={ys}
        sx={sx}
        sy={sy}
        fx={(x) => sigText(x, 3)}
        fy={(y) => sigText(y, 3)}
        xName={`Mean stress σ_m (${u})`}
        yName={`σ_a (${u})`}
      />,
    ];
    if (Se !== undefined && Sut !== undefined) {
      out.push(
        <Path
          key="safe"
          d={`M ${sx(0)} ${sy(0)} L ${sx(0)} ${sy(Se)} L ${sx(Sut)} ${sy(0)} Z`}
          fill={c.regionPlus}
          opacity={0.1}
        />,
        <Line
          key="gl"
          x1={sx(0)}
          y1={sy(Se)}
          x2={sx(Sut)}
          y2={sy(0)}
          stroke={c.chartInk}
          strokeWidth={2.2}
        />,
      );
      const gx = sx(Sut * 0.62);
      const gy = sy(Se * 0.38);
      const p = place.place(gx, gy, 'Goodman', chart.label, [
        [6, -6, 'start'],
        [8, 12, 'start'],
      ]);
      out.push(
        <ChartText key="gn" {...p} fontSize={chart.label} fontWeight="700" halo>
          Goodman
        </ChartText>,
      );
      const se = place.place(sx(0), sy(Se), R.label(spec.Se, 'S_e', Se, u) ?? '', chart.label, [
        [6, -6, 'start'],
        [6, 14, 'start'],
      ]);
      out.push(
        <ChartText key="se" {...se} fontSize={chart.label} fontWeight="700" halo>
          {R.label(spec.Se, 'S_e', Se, u)}
        </ChartText>,
      );
      const st = R.label(spec.Sut, 'S_ut', Sut, u) ?? '';
      const su = place.place(sx(Sut), sy(0), st, chart.label, [
        [-4, -10, 'end'],
        [-4, -24, 'end'],
      ]);
      out.push(
        <ChartText key="su" {...su} fontSize={chart.label} fontWeight="700" halo>
          {st}
        </ChartText>,
      );
    }
    if (Sy !== undefined) {
      out.push(
        <Line
          key="yl"
          x1={sx(0)}
          y1={sy(Sy)}
          x2={sx(Sy)}
          y2={sy(0)}
          stroke={c.mohrEnvelope}
          strokeWidth={1.6}
          strokeDasharray={chart.dash}
        />,
      );
      const yl = `Yield, ${R.label(spec.Sy, 'S_y', Sy, u)}`;
      const p = place.place(sx(Sy * 0.12), sy(Sy * 0.88), yl, chart.label, [
        [8, -6, 'start'],
        [8, 14, 'start'],
      ]);
      out.push(
        <ChartText key="yt" {...p} fontSize={chart.label} fill={c.mohrEnvelope} halo>
          {yl}
        </ChartText>,
      );
    }
    if (sa !== undefined && sm !== undefined) {
      const [px, py] = [sx(sm), sy(sa)];
      if (n !== undefined && Number.isFinite(n)) {
        const [qx, qy] = [sx(sm * n), sy(sa * n)];
        const far = n >= 1 ? [qx, qy] : [px, py];
        out.push(
          <Line
            key="ll"
            x1={sx(0)}
            y1={sy(0)}
            x2={far[0]}
            y2={far[1]}
            stroke={c.mohrLoad}
            strokeWidth={1.6}
            strokeDasharray={chart.dashFine}
          />,
          <Circle
            key="q"
            cx={qx}
            cy={qy}
            r={5}
            fill={c.card}
            stroke={c.mohrLoad}
            strokeWidth={2}
          />,
        );
        place.dot(qx, qy);
        const nl = R.label(spec.n, 'n', n) ?? '';
        const p = place.place(qx, qy, nl, chart.label, [
          [8, -8, 'start'],
          [-8, -8, 'end'],
          [8, 16, 'start'],
        ]);
        out.push(
          <ChartText key="nl" {...p} fontSize={chart.label} fontWeight="700" fill={c.mohrLoad} halo>
            {nl}
          </ChartText>,
        );
      }
      place.dot(px, py);
      out.push(
        <Circle
          key="p"
          cx={px}
          cy={py}
          r={5.5}
          fill={n !== undefined && n < 1 ? c.regionMinus : c.chartHighlight}
        />,
      );
      const pl = `(${sigText(sm, 3)}, ${sigText(sa, 3)})`;
      const p = place.place(px, py, pl, chart.label, [
        [8, 16, 'start'],
        [-8, -8, 'end'],
        [8, -8, 'start'],
        [-8, 16, 'end'],
      ]);
      out.push(
        <ChartText
          key="pl"
          {...p}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartHighlight}
          halo
        >
          {pl}
        </ChartText>,
      );
    }
    return <G>{out}</G>;
  };
}

// ─── S–N and Basquin ─────────────────────────────────────────────────────────

function snCurve(spec: Spec, R: He3hReader, c: Palette, lines: string[]) {
  const { num } = R;
  const basquin = spec.mode === 'basquin';
  const u = R.unit(spec.Sut ?? spec.sigmaF ?? spec.Sf, 'MPa');
  const Sut = num(spec.Sut, 'stress');
  const Se = num(spec.Se, 'stress');
  const f = spec.f === undefined ? 0.9 : num(spec.f);
  const sf = num(spec.sigmaF, 'stress');
  let a: number | undefined;
  let b: number | undefined;
  if (basquin) {
    a = sf;
    b = num(spec.b);
  } else if (Sut !== undefined && Se !== undefined && Se > 0 && f !== undefined && f * Sut > Se) {
    ({ a, b } = snLine(Sut, Se, f));
  }
  const S = num(basquin ? spec.sa : spec.Sf, 'stress');
  // The life the picture reads off the line: cycles N (S–N) or reversals 2N (Basquin).
  const life =
    S !== undefined && a !== undefined && b !== undefined && b < 0 ? lifeAt(S, a, b) : undefined;
  const below = !basquin && S !== undefined && Se !== undefined && S < Se;
  if (basquin) {
    if (life !== undefined && sf !== undefined && b !== undefined && S !== undefined)
      lines.push(
        `σ_a = σ′_f(2N)^b: 2N = (${sigText(S, 4)} ÷ ${sigText(sf, 4)})^(1 ÷ ${sigText(b, 4)}) = ${sigText(basquinReversals(S, sf, b), 3)} reversals, N = ${sigText(life / 2, 3)} cycles.`,
      );
    else lines.push('Type σ′_f, b and σ_a to draw the line and read the life.');
    lines.push('On log–log axes the power law is a straight line, of slope b.');
  } else {
    if (a !== undefined && b !== undefined)
      lines.push(
        `The line runs from fS_ut = ${sigText(f! * Sut!, 4)} ${u} at 10³ cycles to S_e = ${sigText(Se!, 4)} ${u} at 10⁶: a = ${sigText(a, 4)} ${u}, b = ${sigText(b, 4)}.`,
      );
    else if (Sut !== undefined && Se !== undefined)
      lines.push('fS_ut must be above S_e for the line to fall.');
    else lines.push('Type S_ut and S_e to draw the S–N line.');
    if (life !== undefined && !below)
      lines.push(
        `At S_f = ${sigText(S!, 4)} ${u}: N = (S_f ÷ a)^(1 ÷ b) = ${sigText(life, 3)} cycles.`,
      );
    if (below)
      lines.push(`S_f is under S_e: the line is flat there, so the part should last indefinitely.`);
  }

  return function draw(w: number, h: number) {
    const l = 52;
    const r = w - 14;
    const t = 30;
    const bt = h - 44;
    const x0 = basquin ? 0 : Math.min(3, life ? Math.floor(Math.log10(life)) : 3);
    const x1 = Math.max(basquin ? 7 : 7, life ? Math.ceil(Math.log10(life) + 0.3) : 0);
    const top = Math.max(basquin ? (a ?? 0) : (f ?? 0.9) * (Sut ?? 0), S ?? 0, 10);
    const bottom = Math.min(
      basquin
        ? a !== undefined && b !== undefined
          ? a * 10 ** (x1 * b)
          : top / 4
        : (Se ?? top / 4),
      S ?? Infinity,
    );
    const y0 = Math.log10(bottom * 0.75);
    const y1 = Math.log10(top * 1.3);
    const sx = (N: number) => l + ((Math.log10(N) - x0) / (x1 - x0)) * (r - l);
    const sy = (s: number) => bt - ((Math.log10(s) - y0) / (y1 - y0)) * (bt - t);
    const xs = [...Array(x1 - x0 + 1).keys()].map((i) => 10 ** (x0 + i));
    const ys = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000].filter(
      (v) => Math.log10(v) >= y0 && Math.log10(v) <= y1,
    );
    const place = makePlacer(w, h);
    const out: ReactNode[] = [
      <Axes
        key="ax"
        c={c}
        l={l}
        r={r}
        t={t}
        b={bt}
        xs={xs}
        ys={ys}
        sx={sx}
        sy={sy}
        fx={(x) => pow10(Math.round(Math.log10(x)))}
        fy={(y) => sigText(y, 3)}
        xName={basquin ? 'Reversals to failure, 2N (log)' : 'Cycles to failure, N (log)'}
        yName={`${basquin ? 'σ_a' : 'S_f'} (${u}, log)`}
      />,
    ];
    if (a !== undefined && b !== undefined) {
      const pts: [number, number][] = [];
      const from = basquin ? 0 : 3;
      const to = basquin ? x1 : 6;
      for (let i = 0; i <= 40; i++) {
        const e = from + ((to - from) * i) / 40;
        pts.push([sx(10 ** e), sy(a * 10 ** (e * b))]);
      }
      out.push(
        <Path key="line" d={poly(pts)} stroke={c.stressCurve} strokeWidth={2.6} fill="none" />,
      );
      if (!basquin && Se !== undefined) {
        out.push(
          <Line
            key="flat"
            x1={sx(1e6)}
            y1={sy(Se)}
            x2={r}
            y2={sy(Se)}
            stroke={c.stressCurve}
            strokeWidth={2.6}
          />,
          <Line
            key="low"
            x1={sx(10 ** x0)}
            y1={sy(f! * Sut!)}
            x2={sx(1e3)}
            y2={sy(f! * Sut!)}
            stroke={c.stressCurve}
            strokeWidth={1.4}
            strokeDasharray={chart.dashFine}
          />,
        );
        const sel = `${R.sym(spec.Se, 'S_e')} = ${sigText(Se, 4)} ${u}`;
        const p1 = place.place(sx(1e6), sy(Se), sel, chart.label, [
          [6, -8, 'start'],
          [6, 16, 'start'],
        ]);
        const ful = `fS_ut = ${sigText(f! * Sut!, 4)} ${u}`;
        place.dot(sx(1e3), sy(f! * Sut!));
        const p2 = place.place(sx(1e3), sy(f! * Sut!), ful, chart.label, [
          [6, -8, 'start'],
          [6, 16, 'start'],
        ]);
        out.push(
          <Circle key="d3" cx={sx(1e3)} cy={sy(f! * Sut!)} r={3.5} fill={c.stressCurve} />,
          <Circle key="d6" cx={sx(1e6)} cy={sy(Se)} r={3.5} fill={c.stressCurve} />,
          <ChartText
            key="sel"
            {...p1}
            fontSize={chart.label}
            fontWeight="700"
            fill={c.stressCurve}
            halo
          >
            {sel}
          </ChartText>,
          <ChartText
            key="ful"
            {...p2}
            fontSize={chart.label}
            fontWeight="700"
            fill={c.stressCurve}
            halo
          >
            {ful}
          </ChartText>,
        );
      } else if (basquin) {
        const fl = R.label(spec.sigmaF, 'σ′_f', a, u) ?? '';
        place.dot(sx(1), sy(a));
        const p = place.place(sx(1), sy(a), fl, chart.label, [
          [8, -8, 'start'],
          [8, 16, 'start'],
        ]);
        out.push(
          <Circle key="d0" cx={sx(1)} cy={sy(a)} r={3.5} fill={c.stressCurve} />,
          <ChartText
            key="fl"
            {...p}
            fontSize={chart.label}
            fontWeight="700"
            fill={c.stressCurve}
            halo
          >
            {fl}
          </ChartText>,
        );
      }
    }
    if (S !== undefined) {
      const Nx = below ? undefined : life;
      const xEnd = Nx !== undefined ? sx(Nx) : r;
      out.push(
        <Line
          key="sh"
          x1={l}
          y1={sy(S)}
          x2={xEnd}
          y2={sy(S)}
          stroke={c.chartHighlight}
          strokeWidth={1.5}
          strokeDasharray={chart.dash}
        />,
      );
      const sl = R.label(basquin ? spec.sa : spec.Sf, basquin ? 'σ_a' : 'S_f', S, u) ?? '';
      if (Nx !== undefined) {
        out.push(
          <Line
            key="sv"
            x1={xEnd}
            y1={sy(S)}
            x2={xEnd}
            y2={bt}
            stroke={c.chartHighlight}
            strokeWidth={1.5}
            strokeDasharray={chart.dash}
          />,
          <Circle key="pt" cx={xEnd} cy={sy(S)} r={5.5} fill={c.chartHighlight} />,
        );
        place.dot(xEnd, sy(S));
        const lifeId = basquin ? spec.reversals : spec.N;
        const nl =
          R.label(lifeId, basquin ? '2N' : 'N', Nx) ??
          `${basquin ? '2N' : 'N'} = ${sigText(Nx, 3)}`;
        const pn = place.place(xEnd, bt - 6, nl, chart.label, [
          [6, -4, 'start'],
          [-6, -4, 'end'],
          [6, -20, 'start'],
          [-6, -20, 'end'],
        ]);
        out.push(
          <ChartText
            key="nl"
            {...pn}
            fontSize={chart.label}
            fontWeight="700"
            fill={c.chartHighlight}
            halo
          >
            {nl}
          </ChartText>,
        );
      }
      const ps = place.place(l + 4, sy(S), sl, chart.label, [
        [4, -6, 'start'],
        [4, 14, 'start'],
        [60, -6, 'start'],
      ]);
      out.push(
        <ChartText
          key="sl"
          {...ps}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartHighlight}
          halo
        >
          {sl}
        </ChartText>,
      );
    }
    return <G>{out}</G>;
  };
}

// ─── Miner ───────────────────────────────────────────────────────────────────

function miner(spec: Spec, R: He3hReader, c: Palette, lines: string[]) {
  const { num } = R;
  const blocks = (spec.blocks ?? []).map((x, i) => ({
    i,
    n: num(x.n),
    N: num(x.N),
    nId: x.n,
    NId: x.N,
  }));
  const known = blocks.every((x) => x.n !== undefined && x.N !== undefined && x.N > 0);
  const D =
    num(spec.D) ?? (known ? minerDamage(blocks.map((x) => ({ n: x.n!, N: x.N! }))) : undefined);
  const repeats = num(spec.repeats) ?? (D ? 1 / D : undefined);
  if (known && D !== undefined) {
    const parts = blocks.map((x) => `${sigText(x.n!, 4)} ÷ ${sigText(x.N!, 4)}`).join(' + ');
    lines.push(`D = Σnᵢ ÷ Nᵢ = ${parts} = ${sigText(D, 3)}.`);
    lines.push(
      D < 1
        ? `${sigText(D * 100, 3)} % of the life is used; the bar fills at D = 1.`
        : 'D has reached 1: Miner’s rule says the part has failed.',
    );
    if (repeats !== undefined)
      lines.push(`Repeating the whole set: 1 ÷ D = ${sigText(repeats, 3)} times to failure.`);
  } else lines.push('Type each block’s cycles and life to fill the bar.');
  const tones = [c.chartHighlight, c.chartSecond, c.lineSum, c.fnSecond];

  return function draw(w: number, h: number) {
    const l = 16;
    const r = w - 16;
    const top = 44;
    const bh = 34;
    const scale = Math.max(1, D ?? 0);
    const sx = (x: number) => l + (x / scale) * (r - l);
    const out: ReactNode[] = [
      <Rect
        key="bar"
        x={l}
        y={top}
        width={r - l}
        height={bh}
        fill={c.chartSurface}
        stroke={c.chartInk}
        strokeWidth={1.2}
        strokeDasharray={chart.dashFine}
      />,
    ];
    let at = 0;
    blocks.forEach((x, i) => {
      if (x.n === undefined || x.N === undefined || !(x.N > 0)) return;
      const share = x.n / x.N;
      const [a, b2] = [sx(at), sx(at + share)];
      out.push(
        <Rect
          key={`b${i}`}
          x={a}
          y={top}
          width={Math.max(0, b2 - a)}
          height={bh}
          fill={tones[i % tones.length]}
          stroke={c.card}
          strokeWidth={1}
        />,
      );
      const sub = '₁₂₃₄₅₆'[i] ?? '';
      const label = `n${sub} ÷ N${sub} = ${sigText(share, 3)}`;
      // Labels above the bar, alternate blocks a row higher so narrow ones don't collide.
      const y = i % 2 ? top - 22 : top - 6;
      out.push(
        <ChartText
          key={`l${i}`}
          x={Math.min(r, Math.max(l, (a + b2) / 2))}
          y={y}
          textAnchor={(a + b2) / 2 > w * 0.7 ? 'end' : (a + b2) / 2 < w * 0.3 ? 'start' : 'middle'}
          fontSize={chart.label}
          fontWeight="700"
        >
          {label}
        </ChartText>,
      );
      at += share;
    });
    // Failure at D = 1, and D bracketed under the bar.
    out.push(
      <Line
        key="one"
        x1={sx(1)}
        y1={top - 4}
        x2={sx(1)}
        y2={top + bh + 30}
        stroke={c.regionMinus}
        strokeWidth={2}
      />,
      <ChartText
        key="onel"
        x={sx(1) - 4}
        y={top + bh + 44}
        textAnchor="end"
        fontSize={chart.label}
        fontWeight="700"
        fill={c.regionMinus}
      >
        Failure, D = 1
      </ChartText>,
    );
    if (D !== undefined) {
      out.push(
        <Bracket
          key="db"
          x1={sx(0)}
          y1={top + bh + 14}
          x2={sx(D)}
          y2={top + bh + 14}
          color={c.chartInk}
        />,
      );
      const dl = R.label(spec.D, 'D', D) ?? '';
      out.push(
        <ChartText
          key="dl"
          x={Math.max(l + 30, Math.min(sx(D) - 60, (sx(0) + sx(D)) / 2))}
          y={top + bh + 30}
          textAnchor="middle"
          fontSize={chart.label}
          fontWeight="700"
          halo
        >
          {dl}
        </ChartText>,
      );
      // The set repeated until the bar is full: a tick at each D.
      if (D > 0 && D < 1) {
        const y = top + bh + 64;
        out.push(
          <Rect
            key="rep"
            x={l}
            y={y}
            width={r - l}
            height={14}
            fill={c.chartSurface}
            stroke={c.chartGrid}
          />,
        );
        for (let k = 1; k * D < 1 + 1e-9 && k < 60; k++)
          out.push(
            <Line
              key={`r${k}`}
              x1={sx(k * D)}
              y1={y}
              x2={sx(k * D)}
              y2={y + 14}
              stroke={c.chartInk}
              strokeWidth={1.2}
            />,
          );
        for (let k = 0; k * D < 1 - 1e-9 && k < 60; k++)
          out.push(
            <Rect
              key={`rf${k}`}
              x={sx(k * D) + 1}
              y={y + 2}
              width={Math.max(0, sx(Math.min(1, (k + 1) * D)) - sx(k * D) - 2)}
              height={10}
              fill={c.chartHighlight}
              opacity={k % 2 ? 0.35 : 0.6}
            />,
          );
        const rl = R.label(spec.repeats, 'Repeats', repeats) ?? '';
        out.push(
          <ChartText key="rl" x={l} y={y + 32} fontSize={chart.label} fontWeight="700">
            {`${rl} (the set again and again)`}
          </ChartText>,
        );
      }
    }
    return <G>{out}</G>;
  };
}
