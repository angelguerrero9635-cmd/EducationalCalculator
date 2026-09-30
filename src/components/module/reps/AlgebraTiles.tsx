import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { AlgebraTilesSpec, TileCounts } from '@/data/modules/typesHsd';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { MathText } from './hsdText';
import { binomialText, polyText, rectangleCounts, zeroPairs, type Poly } from './tiles';

/** An x tile's length in unit tiles: not a whole number, since x is unknown. */
const X = 3.3;
/** The gap between loose tiles (units). */
const GAP = 0.3;

type Size = 'x2' | 'x' | 'xv' | 'unit';
interface Tile {
  x: number;
  y: number;
  size: Size;
  sign: 1 | -1;
  struck?: boolean;
  missing?: boolean;
}
interface Label {
  x: number;
  y: number;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  /** Pixels to move it after scaling (labels keep their font size). */
  dx?: number;
  dy?: number;
  rotate?: boolean;
  bold?: boolean;
  color?: 'ink' | 'muted' | 'highlight';
}
interface Scene {
  tiles: Tile[];
  labels: Label[];
  /** Lines in unit coordinates (the mat's divider, the rectangle's outline). */
  lines: { x1: number; y1: number; x2: number; y2: number; dash?: boolean }[];
  /** Mats the tiles lie on (unit coordinates). */
  mats?: { x: number; y: number; w: number; h: number }[];
  width: number;
  height: number;
  /** Pixels kept free above and to the left for labels. */
  top: number;
  left: number;
}

const dims = (s: Size): [number, number] =>
  s === 'x2' ? [X, X] : s === 'x' ? [X, 1] : s === 'xv' ? [1, X] : [1, 1];

/** Lays out n tiles of one size from (x0, y0), wrapping at `right`; returns the tiles and the bottom. */
function flow(
  n: number,
  size: Size,
  sign: 1 | -1,
  x0: number,
  y0: number,
  right: number,
  startX = x0,
) {
  const [w, h] = dims(size);
  const tiles: Tile[] = [];
  let [x, y] = [startX, y0];
  for (let i = 0; i < n; i++) {
    if (x + w > right + 1e-9 && x > x0) {
      x = x0;
      y += h + GAP;
    }
    tiles.push({ x, y, size, sign });
    x += w + GAP;
  }
  return { tiles, endX: x, bottom: n ? y + h : y0 };
}

const sgn = (n: number): 1 | -1 => (n < 0 ? -1 : 1);

/** Rows of x², x and unit tiles: the first polynomial's, then the second's, zero pairs struck. */
function collectScene(a: Poly, b: Poly | undefined): Scene {
  const W = 17;
  const L0 = 2.2;
  const tiles: Tile[] = [];
  const labels: Label[] = [];
  let y = 0;
  (['x2', 'x', 'unit'] as const).forEach((k) => {
    const size: Size = k === 'x' ? 'xv' : k;
    const [n1, n2] = [a[k], b ? b[k] : 0];
    if (n1 === 0 && n2 === 0) return;
    const pairs = zeroPairs(n1, n2);
    const first = flow(Math.abs(n1), size, sgn(n1), L0, y, W);
    const second = flow(
      Math.abs(n2),
      size,
      sgn(n2),
      L0,
      first.bottom > y && first.endX + dims(size)[0] + 0.6 > W ? first.bottom + GAP : y,
      W,
      first.bottom > y && first.endX + dims(size)[0] + 0.6 > W ? L0 : first.endX + (n1 ? 0.6 : 0),
    );
    first.tiles.forEach((t, i) => (t.struck = i < pairs));
    second.tiles.forEach((t, i) => (t.struck = i < pairs));
    tiles.push(...first.tiles, ...second.tiles);
    const bottom = Math.max(first.bottom, second.bottom);
    labels.push({
      x: 0,
      y: y + Math.min(dims(size)[1], bottom - y) / 2,
      text: k === 'x2' ? 'x²' : k === 'x' ? 'x' : '1',
      anchor: 'start',
      dy: 4,
      bold: true,
      color: 'muted',
    });
    y = bottom + 1;
  });
  return { tiles, labels, lines: [], width: W, height: Math.max(1, y - 1), top: 4, left: 4 };
}

/** The factors along two edges and their product filling the rectangle. */
function rectangleScene(p: number, q: number, r: number, s: number, missingCorner = false): Scene {
  // Columns across the top: |p| of width x, then |q| of width 1; rows down the side likewise.
  const cols = [
    ...Array.from({ length: Math.abs(p) }, () => ({ w: X, sign: sgn(p), x: true })),
    ...Array.from({ length: Math.abs(q) }, () => ({ w: 1, sign: sgn(q), x: false })),
  ];
  const rows = [
    ...Array.from({ length: Math.abs(r) }, () => ({ h: X, sign: sgn(r), x: true })),
    ...Array.from({ length: Math.abs(s) }, () => ({ h: 1, sign: sgn(s), x: false })),
  ];
  const E = 1 + 0.5; // the edge strip and its gap
  const tiles: Tile[] = [];
  const width = cols.reduce((a, c) => a + c.w, 0);
  const height = rows.reduce((a, c) => a + c.h, 0);
  // The x tiles of the product, positive and negative: equal numbers cancel as zero pairs.
  const xPlus = rows.flatMap((rw) =>
    cols.filter((c) => c.x !== rw.x && c.sign * rw.sign > 0).map(() => 1),
  ).length;
  const xMinus = rows.flatMap((rw) =>
    cols.filter((c) => c.x !== rw.x && c.sign * rw.sign < 0).map(() => 1),
  ).length;
  let struckPlus = Math.min(xPlus, xMinus);
  let struckMinus = struckPlus;
  let cx = E;
  cols.forEach((c) => {
    tiles.push({ x: cx, y: 0, size: c.x ? 'x' : 'unit', sign: c.sign });
    cx += c.w;
  });
  let ry = E;
  rows.forEach((rw) => {
    tiles.push({ x: 0, y: ry, size: rw.x ? 'xv' : 'unit', sign: rw.sign });
    let x = E;
    cols.forEach((c) => {
      const size: Size = c.x && rw.x ? 'x2' : c.x ? 'x' : rw.x ? 'xv' : 'unit';
      const sign = (c.sign * rw.sign) as 1 | -1;
      const t: Tile = { x, y: ry, size, sign };
      if (size === 'x' || size === 'xv') {
        if (sign > 0 && struckPlus > 0) {
          t.struck = true;
          struckPlus--;
        } else if (sign < 0 && struckMinus > 0) {
          t.struck = true;
          struckMinus--;
        }
      }
      if (missingCorner && !c.x && !rw.x) t.missing = true;
      tiles.push(t);
      x += c.w;
    });
    ry += rw.h;
  });
  const lines = [
    { x1: E, y1: E, x2: E + width, y2: E },
    { x1: E + width, y1: E, x2: E + width, y2: E + height },
    { x1: E + width, y1: E + height, x2: E, y2: E + height },
    { x1: E, y1: E + height, x2: E, y2: E },
  ];
  return {
    tiles,
    labels: [],
    lines: width > 0 && height > 0 ? lines : [],
    width: E + width,
    height: E + height,
    top: 22,
    left: 20,
  };
}

/** ax + b on the left of a mat and cx + d on the right. */
function equationScene(a: number, b: number, c: number, d: number): Scene {
  const half = 7.4;
  const pad = 0.5;
  const mid = half + 2 * pad + 0.9;
  const side = (nx: number, nu: number, x0: number) => {
    const xs = flow(Math.abs(nx), 'xv', sgn(nx), x0, 0, x0 + half);
    const us = flow(Math.abs(nu), 'unit', sgn(nu), x0, xs.bottom + (nx ? GAP * 2 : 0), x0 + half);
    return { tiles: [...xs.tiles, ...us.tiles], bottom: us.bottom };
  };
  const l = side(a, b, pad);
  const r = side(c, d, mid + 0.9 + pad);
  const height = Math.max(l.bottom, r.bottom, X) + pad;
  return {
    tiles: [...l.tiles, ...r.tiles],
    labels: [{ x: mid, y: height / 2, text: '=', dy: 7, bold: true }],
    lines: [],
    mats: [
      { x: 0, y: -pad, w: half + 2 * pad, h: height + pad },
      { x: mid + 0.9, y: -pad, w: half + 2 * pad, h: height + pad },
    ],
    width: 2 * (half + 2 * pad) + 1.8,
    height,
    top: 12,
    left: 4,
  };
}

/**
 * Algebra tiles: x², x and unit tiles, positive and negative in two colors. Collect like terms
 * (zero pairs struck out), multiply or factor as a rectangle, complete the square (the missing
 * corner dashed), or lay out an equation on a mat. Counts come from the values, −10 to 10.
 */
export function AlgebraTiles({ spec, calc }: { spec: AlgebraTilesSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (v: number | string | undefined) =>
    v === undefined ? 0 : typeof v === 'number' ? v : rep.val(v);
  const known = (...vs: (number | string | undefined)[]) =>
    vs.every((v) => v === undefined || typeof v === 'number' || rep.known(v));
  const poly = (t?: TileCounts): Poly => ({ x2: num(t?.x2), x: num(t?.x), unit: num(t?.unit) });
  const whole = (...xs: number[]) =>
    xs.every((x) => Number.isInteger(Math.round(x * 1e9) / 1e9) && Math.abs(x) <= 10);

  let scene: Scene | undefined;
  let faded = false;
  const lines: string[] = [];
  switch (spec.mode) {
    case 'collect': {
      const a = poly(spec.tiles);
      const b = spec.plus ? poly(spec.plus) : undefined;
      faded = !known(
        spec.tiles.x2,
        spec.tiles.x,
        spec.tiles.unit,
        spec.plus?.x2,
        spec.plus?.x,
        spec.plus?.unit,
      );
      if (!whole(a.x2, a.x, a.unit, ...(b ? [b.x2, b.x, b.unit] : []))) break;
      scene = collectScene(a, b);
      const sum = b ? { x2: a.x2 + b.x2, x: a.x + b.x, unit: a.unit + b.unit } : a;
      const pairs = b ? zeroPairs(a.x2, b.x2) + zeroPairs(a.x, b.x) + zeroPairs(a.unit, b.unit) : 0;
      lines.push(
        b
          ? `(${polyText(a)}) + (${polyText(b)}) = ${polyText(sum)}.`
          : `The tiles show ${polyText(a)}.`,
      );
      if (pairs)
        lines.push(`${pairs} zero ${pairs === 1 ? 'pair cancels' : 'pairs cancel'}: struck out.`);
      break;
    }
    case 'rectangle': {
      const f = spec.factors;
      const [p, q, r, s] = [num(f.p), num(f.q), num(f.r), num(f.s)];
      faded = !known(f.p, f.q, f.r, f.s);
      const prod = rectangleCounts(p, q, r, s);
      if (!whole(p, q, r, s)) {
        lines.push('Each edge takes a whole number of tiles, from −10 to 10.');
        break;
      }
      scene = rectangleScene(p, q, r, s);
      scene.labels.push(
        {
          x: 1.5 + (Math.abs(p) * X + Math.abs(q)) / 2,
          y: 0,
          text: binomialText(p, q).replace(/^\(|\)$/g, ''),
          dy: -8,
          bold: true,
        },
        {
          x: 0,
          y: 1.5 + (Math.abs(r) * X + Math.abs(s)) / 2,
          text: binomialText(r, s).replace(/^\(|\)$/g, ''),
          dx: -8,
          rotate: true,
          bold: true,
        },
      );
      const eq = `${binomialText(p, q)}${binomialText(r, s)} = ${polyText(prod)}`;
      if (spec.given === 'product')
        lines.push(
          `The tiles of ${polyText(prod)} make a rectangle ${binomialText(p, q)} by ${binomialText(r, s)}: ${eq}.`,
        );
      else lines.push(`The rectangle’s area is the product: ${eq}.`);
      const xs = [p * s, q * r];
      if (xs[0]! * xs[1]! < 0)
        lines.push(
          `${Math.min(Math.abs(xs[0]!), Math.abs(xs[1]!))} positive and negative x tiles cancel as zero pairs.`,
        );
      break;
    }
    case 'square': {
      const b = num(spec.b);
      const cc = num(spec.c);
      faded = !known(spec.b, spec.c);
      const k = b / 2;
      if (!whole(k, cc) || Math.abs(k) > 8) {
        lines.push(
          `b = ${formatNumber(b)}: half of it, ${formatNumber(k)}, is not a whole number of x tiles.`,
        );
        break;
      }
      scene = rectangleScene(1, k, 1, k, true);
      scene.labels.push(
        {
          x: 1.5 + (X + Math.abs(k)) / 2,
          y: 0,
          text: binomialText(1, k).replace(/^\(|\)$/g, ''),
          dy: -8,
          bold: true,
        },
        {
          x: 0,
          y: 1.5 + (X + Math.abs(k)) / 2,
          text: binomialText(1, k).replace(/^\(|\)$/g, ''),
          dx: -8,
          rotate: true,
          bold: true,
        },
      );
      // c's own tiles, beside the square.
      if (cc !== 0) {
        const x0 = scene.width + 1.6;
        const extra = flow(Math.abs(cc), 'unit', sgn(cc), x0, 1.5, x0 + 4.2);
        scene.tiles.push(...extra.tiles);
        scene.labels.push({
          x: x0,
          y: 1.5,
          text: `${cc < 0 ? '−' : '+'} ${formatNumber(Math.abs(cc))}`,
          dy: -6,
          anchor: 'start',
          bold: true,
          color: 'muted',
        });
        scene.width = x0 + 4.2;
        scene.height = Math.max(scene.height, extra.bottom);
      }
      const k2 = k * k;
      lines.push(
        `x² + ${formatNumber(b)}x needs ${formatNumber(k2)} more unit ${k2 === 1 ? 'tile' : 'tiles'} (dashed) to make a square: x² + ${formatNumber(b)}x + ${formatNumber(k2)} = ${binomialText(1, k)}².`.replace(
          /\+ −/g,
          '− ',
        ),
      );
      if (spec.c !== undefined)
        lines.push(
          `${polyText({ x2: 1, x: b, unit: cc })} = ${binomialText(1, k)}² ${cc - k2 < 0 ? '−' : '+'} ${formatNumber(Math.abs(cc - k2))}.`,
        );
      break;
    }
    case 'equation': {
      const [a, b, cx, d] = [
        num(spec.left.x),
        num(spec.left.unit),
        num(spec.right.x),
        num(spec.right.unit),
      ];
      faded = !known(spec.left.x, spec.left.unit, spec.right.x, spec.right.unit);
      if (!whole(a, b, cx, d)) break;
      scene = equationScene(a, b, cx, d);
      lines.push(`${polyText({ x: a, unit: b })} = ${polyText({ x: cx, unit: d })}.`);
      if (spec.solution && rep.known(spec.solution)) {
        const x = rep.val(spec.solution);
        lines.push(`x = ${formatNumber(x)}: each side is ${formatNumber(a * x + b)}.`);
      }
      break;
    }
  }

  // Pixels per unit tile: fill the width, at most 34 px.
  const scaleFor = (w: number) =>
    scene ? Math.min(34, (w - scene.left - 16) / Math.max(1, scene.width)) : 1;
  const heightFor = (w: number) => (scene ? scene.top + scene.height * scaleFor(w) + 46 : 60);

  return (
    <View>
      <Canvas aspect={(w) => heightFor(w) / w}>
        {({ w, h }) => {
          if (!scene) return <Svg width={w} height={h} />;
          const u = scaleFor(w);
          const ox = scene.left + (w - scene.left - 8 - scene.width * u) / 2;
          const oy = scene.top + 4;
          const px = (x: number) => ox + x * u;
          const py = (y: number) => oy + y * u;
          const inset = Math.min(1.2, u * 0.06);
          const legendY = h - 10;
          return (
            <Svg width={w} height={h}>
              <G opacity={faded ? 0.4 : 1}>
                {scene.tiles.map((t, i) => {
                  const [tw, th] = dims(t.size);
                  const [x, y, ww, hh] = [
                    px(t.x) + inset,
                    py(t.y) + inset,
                    tw * u - 2 * inset,
                    th * u - 2 * inset,
                  ];
                  const fill = t.sign > 0 ? c.tilePositive : c.tileNegative;
                  const edge = t.sign > 0 ? c.tilePositiveEdge : c.tileNegativeEdge;
                  const text = t.size === 'x2' ? 'x²' : t.size === 'unit' ? '1' : 'x';
                  const signed = t.sign < 0 ? `−${text}` : text;
                  const fits = Math.min(ww, hh) >= 13 && signed.length * 7 < ww;
                  return (
                    <G key={i} opacity={t.struck ? 0.45 : 1}>
                      <Rect
                        x={x}
                        y={y}
                        width={ww}
                        height={hh}
                        rx={Math.min(3, u * 0.12)}
                        fill={t.missing ? 'none' : fill}
                        stroke={t.missing ? c.chartHighlight : edge}
                        strokeWidth={t.missing ? 1.5 : 1.2}
                        strokeDasharray={t.missing ? chart.dashFine : undefined}
                      />
                      {fits && !t.missing ? (
                        <MathText
                          text={signed}
                          x={x + ww / 2}
                          y={y + hh / 2 + 4}
                          textAnchor="middle"
                          fontSize={chart.label}
                          fill={c.chartInk}
                        />
                      ) : null}
                      {t.struck ? (
                        <Line
                          x1={x}
                          y1={y + hh}
                          x2={x + ww}
                          y2={y}
                          stroke={c.chartInk}
                          strokeWidth={chart.stroke}
                        />
                      ) : null}
                    </G>
                  );
                })}
                {(scene.mats ?? []).map((m, i) => (
                  <Rect
                    key={`m${i}`}
                    x={px(m.x)}
                    y={py(m.y)}
                    width={m.w * u}
                    height={m.h * u}
                    rx={6}
                    fill={c.chartSurface}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                {scene.lines.map((l, i) => (
                  <Line
                    key={`l${i}`}
                    x1={px(l.x1)}
                    y1={py(l.y1)}
                    x2={px(l.x2)}
                    y2={py(l.y2)}
                    stroke={l.dash ? c.chartMuted : c.chartInk}
                    strokeWidth={l.dash ? chart.strokeLight : chart.stroke}
                    strokeDasharray={l.dash ? chart.dash : undefined}
                  />
                ))}
                {scene.labels.map((l, i) => {
                  const x = px(l.x) + (l.dx ?? 0);
                  const y = py(l.y) + (l.dy ?? 0);
                  const fill =
                    l.color === 'muted'
                      ? c.chartMuted
                      : l.color === 'highlight'
                        ? c.chartHighlight
                        : c.chartInk;
                  return (
                    <MathText
                      key={`t${i}`}
                      text={l.text}
                      x={x}
                      y={y}
                      textAnchor={l.rotate ? 'middle' : (l.anchor ?? 'middle')}
                      fontSize={l.text === '=' ? 22 : chart.value}
                      fontWeight={l.bold ? '700' : '400'}
                      fill={fill}
                      transform={l.rotate ? `rotate(-90 ${x} ${y})` : undefined}
                    />
                  );
                })}
              </G>
              {/* Key: the two colors. */}
              {[
                { sign: 1, text: 'positive' },
                { sign: -1, text: 'negative' },
              ].map((k, i) => {
                const x = w / 2 - 88 + i * 96;
                return (
                  <G key={k.text}>
                    <Rect
                      x={x}
                      y={legendY - 10}
                      width={12}
                      height={12}
                      rx={2}
                      fill={k.sign > 0 ? c.tilePositive : c.tileNegative}
                      stroke={k.sign > 0 ? c.tilePositiveEdge : c.tileNegativeEdge}
                    />
                    <MathText
                      text={k.text}
                      x={x + 17}
                      y={legendY}
                      fontSize={chart.label}
                      fill={c.chartMuted}
                    />
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
