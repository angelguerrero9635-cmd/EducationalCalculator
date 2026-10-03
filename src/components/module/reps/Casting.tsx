/**
 * HC172 `casting` (CastingSpec in typesHe4l.ts): a sand mould cut open, cope over drag in a
 * wooden flask, the casting in its cavity to scale from V, the sprue and runner, and a side
 * riser (H = D) on a neck; V, A and M = V ÷ A named; Chvorinov's times t = BM² as bars, the
 * riser's beside the casting's. The mould, sand and metal are painted; the bars are flat.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Rect } from 'react-native-svg';

import type { CastingSpec } from '@/data/modules/typesHe4l';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { HeLabel } from './beamKit';
import { Canvas, Caption, ChartText } from './common';
import { useHe3iReader } from './he3iKit';
import { chvorinov, si4l } from './he4lMath';
import { Metal, TopLight, url, usePaintIds } from './paint';

type X = CastingSpec['volume'];
const f3 = (x: number) => formatNumber(Number(x.toPrecision(3)));

export function Casting({ spec, calc }: { spec: CastingSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useHe3iReader(calc);
  const ids = usePaintIds('metal', 'light');
  const k = (x: X) => x !== undefined && r.known(x);
  /** A length in cm (and its powers), whatever unit its variable is in. */
  const cm = (x: X, power = 1) =>
    x === undefined
      ? 0
      : r.v(x) * (si4l(r.unitOf(x, ['', 'cm', 'cm²', 'cm³'][power]!)) / 0.01 ** power);
  const tag = (x: X, f: string) => (x === undefined || !k(x) ? '' : r.tag(x, f, r.v(x)));
  const sym = (x: X, f: string) => r.symbol(x, f);
  const shape = spec.shape ?? 'cube';
  // The casting's volume: V, or a cube's from its modulus (s = 6M).
  const V = k(spec.volume)
    ? cm(spec.volume, 3)
    : k(spec.modulus) && !spec.volume
      ? (6 * cm(spec.modulus)) ** 3
      : undefined;
  const Mc = k(spec.modulus)
    ? cm(spec.modulus)
    : k(spec.volume) && k(spec.area)
      ? cm(spec.volume, 3) / cm(spec.area, 2)
      : undefined;
  // The casting's section, cm: a cube's side, a sphere's diameter, a plate 8 × as wide as thick.
  const dims =
    V === undefined
      ? undefined
      : shape === 'sphere'
        ? { w: Math.cbrt((6 * V) / Math.PI), h: Math.cbrt((6 * V) / Math.PI) }
        : shape === 'plate'
          ? { w: 8 * Math.cbrt(V / 64), h: Math.cbrt(V / 64) }
          : { w: Math.cbrt(V), h: Math.cbrt(V) };
  const R = spec.riser;
  const D = R && k(R.diameter) ? cm(R.diameter) : undefined;
  const ratio = R?.ratio ?? 1.25;
  const B =
    spec.moldConstant !== undefined && k(spec.moldConstant) ? r.v(spec.moldConstant) : undefined;
  const tC = k(spec.time)
    ? r.v(spec.time)
    : B !== undefined && Mc !== undefined
      ? chvorinov(B, Mc)
      : undefined;
  const tR = R && k(R.time) ? r.v(R.time) : tC !== undefined && R ? ratio * tC : undefined;

  const lines: string[] = [];
  if (V === undefined) lines.push('Type the casting’s size to draw it in the mould.');
  if (k(spec.volume) && k(spec.area))
    lines.push(
      `${sym(spec.modulus, 'M')} = ${sym(spec.volume, 'V')} ÷ ${sym(spec.area, 'A')} = ${r.text(spec.volume, r.v(spec.volume))} ÷ ${r.text(spec.area, r.v(spec.area))}${k(spec.modulus) ? ` = ${r.text(spec.modulus, r.v(spec.modulus))}` : ''}.`,
    );
  if (spec.time !== undefined && k(spec.time) && k(spec.moldConstant) && Mc !== undefined)
    lines.push(
      `Chvorinov: ${sym(spec.time, 't')} = ${sym(spec.moldConstant, 'B')}${sym(spec.modulus, 'M')}² = ${r.text(spec.moldConstant, r.v(spec.moldConstant))} × (${f3(Mc)} cm)² = ${r.text(spec.time, r.v(spec.time))}.`,
    );
  if (R && k(R.modulus) && Mc !== undefined)
    lines.push(
      `The riser must freeze last, ${formatNumber(ratio)} × as long: ${sym(R.modulus, 'M_r')} = √${formatNumber(ratio)} × ${f3(Mc)} cm = ${r.text(R.modulus, r.v(R.modulus))}${D !== undefined ? `; with H = D its M is D ÷ 6, so ${sym(R.diameter, 'D')} = ${r.text(R.diameter, r.v(R.diameter))}` : ''}.`,
    );
  lines.push('Mould cut open; casting and riser to one scale.');

  const moldH = 186;
  const bars = tC !== undefined || (R !== undefined && Mc !== undefined);
  return (
    <View>
      <Canvas aspect={(w) => (moldH + 20 + (bars ? (R ? 66 : 40) : 0)) / w}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Metal id={ids.metal} light={c.silver} dark={c.silverDark} />
              <TopLight id={ids.light} />
            </Defs>
            {mould(w)}
            {bars ? timeBars(w, moldH + 24) : null}
          </Svg>
        )}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );

  function mould(w: number): ReactNode {
    const x0 = 10;
    const x1 = w - 10;
    const y0 = 8;
    const y1 = moldH;
    const part = (y0 + y1) / 2;
    const cw = dims?.w ?? 0;
    const ch = dims?.h ?? 0;
    const rd = D ?? 0;
    const k2 = Math.min(
      (x1 - x0 - 90) / Math.max(1, cw + rd + (D !== undefined ? 3 : 0)),
      120 / Math.max(1, ch, rd),
    );
    const sw = cw * k2;
    const sh = ch * k2;
    const rs = rd * k2;
    const gap = D !== undefined ? 3 * k2 : 0;
    const cx0 = x0 + 54 + (x1 - x0 - 64 - sw - gap - rs) / 2;
    const bottom = part + sh / 2;
    // Riser: H = D, its bottom level with the casting's, open at the mould's top.
    const rx = cx0 + sw + gap;
    const sprueX = cx0 - 30;
    const grains: ReactNode[] = [];
    for (let gy = y0 + 6; gy < y1 - 3; gy += 7)
      for (let gx = x0 + 6; gx < x1 - 4; gx += 8) {
        const jx = ((gx * 5 + gy * 11) % 5) - 2;
        grains.push(
          <Circle key={`${gx},${gy}`} cx={gx + jx} cy={gy} r={1.2} fill={c.he4lSandGrain} />,
        );
      }
    const metal = (x: number, y: number, ww: number, hh: number, key: string, round = false) =>
      round ? (
        <Circle
          key={key}
          cx={x + ww / 2}
          cy={y + hh / 2}
          r={ww / 2}
          fill={url(ids.metal)}
          stroke={c.silverDark}
        />
      ) : (
        <G key={key}>
          <Rect x={x} y={y} width={ww} height={hh} fill={c.silver} stroke={c.silverDark} />
          <Rect x={x} y={y} width={ww} height={hh} fill={url(ids.light)} />
        </G>
      );
    return (
      <G>
        {/* The flask (wood) and its sand, the parting line between cope and drag. */}
        <Rect
          x={x0 - 4}
          y={y0 - 4}
          width={x1 - x0 + 8}
          height={y1 - y0 + 8}
          rx={3}
          fill={c.wood}
          stroke={c.woodDark}
          strokeWidth={1.5}
        />
        <Rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={c.he4lSand} />
        {grains}
        <Line
          x1={x0 - 4}
          y1={part}
          x2={x1 + 4}
          y2={part}
          stroke={c.woodDark}
          strokeWidth={1.5}
          strokeDasharray={chart.dash}
        />
        <ChartText x={x0 + 4} y={part - 6} fill={c.woodDark} fontWeight="700">
          cope
        </ChartText>
        <ChartText x={x0 + 4} y={part + 16} fill={c.woodDark} fontWeight="700">
          drag
        </ChartText>
        {dims ? (
          <G>
            {/* Sprue down to the parting line, the runner into the cavity, all filled. */}
            {metal(sprueX - 4, y0, 8, part - y0, 'sp')}
            {metal(sprueX - 4, part - 3, cx0 - sprueX + 4, 6, 'rn')}
            {metal(cx0, bottom - sh, sw, sh, 'cast', shape === 'sphere')}
            {D !== undefined ? (
              <G>
                {metal(
                  cx0 + sw - 1,
                  bottom - Math.min(sh, rs) * 0.35,
                  gap + 2,
                  Math.min(sh, rs) * 0.3,
                  'neck',
                )}
                {metal(rx, bottom - rs, rs, rs, 'riser')}
                {bottom - rs > y0
                  ? metal(rx + rs * 0.2, y0, rs * 0.6, bottom - rs - y0 + 1, 'open')
                  : null}
              </G>
            ) : null}
            <HeLabel
              x={cx0 + sw / 2}
              y={sh < 44 ? bottom - sh - 26 : bottom - sh / 2 - 2}
              text={tag(spec.volume, 'V') || tag(spec.modulus, 'M')}
              w={w}
            />
            {spec.area !== undefined && k(spec.area) ? (
              <HeLabel
                x={cx0 + sw / 2}
                y={sh < 44 ? bottom - sh - 8 : bottom - sh / 2 + 16}
                text={tag(spec.area, 'A')}
                w={w}
              />
            ) : null}
            {D !== undefined && R ? (
              <HeLabel x={rx + rs / 2} y={bottom + 18} text={tag(R.diameter, 'D')} w={w} />
            ) : null}
            {D !== undefined ? (
              <ChartText
                x={rx + rs / 2}
                y={Math.max(y0 + 14, bottom - rs - 6)}
                textAnchor="middle"
                fontWeight="700"
                halo
              >
                riser
              </ChartText>
            ) : null}
          </G>
        ) : null}
      </G>
    );
  }

  function timeBars(w: number, y: number): ReactNode {
    // With B, the times; without, the riser's against the casting's (M² ratios).
    const a = tC ?? 1;
    const b = tR ?? (R ? ratio : 0);
    const max = Math.max(a, b);
    const len = (t: number) => (t / max) * (w - 150);
    const row = (yy: number, t: number, text: string, fill: string, key: string) => (
      <G key={key}>
        <Rect
          x={12}
          y={yy}
          width={len(t)}
          height={14}
          fill={fill}
          stroke={c.chartInk}
          strokeWidth={1}
        />
        <ChartText x={16 + len(t)} y={yy + 11} fontWeight="700">
          {text}
        </ChartText>
      </G>
    );
    const casting =
      tC !== undefined
        ? `casting: ${tag(spec.time, 't') ? r.text(spec.time, tC) : `${f3(tC)} min`}`
        : 'casting: t';
    const riser =
      tR !== undefined
        ? `riser: ${R && k(R.time) ? r.text(R.time, tR) : `${f3(tR)} min`}`
        : `riser: ${formatNumber(ratio)} t`;
    return (
      <G>
        {row(y, a, casting, c.he4lMoodyPoint, 'c')}
        {R ? row(y + 24, b, riser, c.he4lRecoat, 'r') : null}
      </G>
    );
  }
}
