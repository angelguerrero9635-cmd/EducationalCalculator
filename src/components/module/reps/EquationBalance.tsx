import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Ball, Deepen, FloorShadow, TopLight, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'equationBalance' }>;

/** Balloons in a row above a pan. */
const BALLOONS = 6;

/** "3x", "x", "−x", "−2x". */
const term = (k: number, x: string) =>
  k === 1 ? x : k === -1 ? `−${x}` : `${formatNumber(k)}${x}`;
/** One side as written: "3x + 4", "x − 2", "5", "0". */
export const sideText = (k: number, n: number, x: string) => {
  if (k === 0) return formatNumber(n);
  if (n === 0) return term(k, x);
  return `${term(k, x)} ${n < 0 ? '−' : '+'} ${formatNumber(Math.abs(n))}`;
};

/**
 * An equation with the unknown on both sides as a pan balance (Grade 8): each pan holds its
 * side's x-blocks (wooden blocks marked x) and unit counters; a negative amount is a balloon
 * pulling the pan up (−x, −1). The beam tips toward the heavier side at the current x and is
 * level when both sides are equal. With `cancel`, the x-blocks and units the two pans share
 * are crossed out: taking the same from both sides keeps the balance.
 */
export function EquationBalance({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const paint = usePaintIds('wood', 'light', 'unit', 'balloon', 'metal');
  const num = (v: string | number) =>
    typeof v === 'number' ? v : rep.known(v) ? Math.round(rep.shown(v)) : undefined;
  const has = (v: string | number) => num(v) !== undefined;
  const [a, b] = spec.left.map((v) => num(v) ?? 0) as [number, number];
  const [cc, d] = spec.right.map((v) => num(v) ?? 0) as [number, number];
  const allKnown = [...spec.left, ...spec.right].every(has);
  const xSym = rep.variable(spec.x).symbol;
  const xKnown = rep.known(spec.x);
  const x = xKnown ? rep.shown(spec.x) : undefined;
  const L = x === undefined ? undefined : a * x + b;
  const R = x === undefined ? undefined : cc * x + d;
  // Tip toward the heavier side, at most 14 px at the ends; level while x is "?".
  const tilt =
    L === undefined || R === undefined
      ? 0
      : Math.max(-1, Math.min(1, (R - L) / Math.max(3, 0.25 * (Math.abs(L) + Math.abs(R))))) * 14;
  // What the two pans share, crossed out on both (same sign on both sides only).
  const sameX = spec.cancel && a * cc > 0 ? Math.sign(a) * Math.min(Math.abs(a), Math.abs(cc)) : 0;
  const sameU = spec.cancel && b * d > 0 ? Math.sign(b) * Math.min(Math.abs(b), Math.abs(d)) : 0;

  const blockW = 21;
  const blockH = 26;
  const perX = 5;
  const perU = 7;
  const rows = (n: number, per: number) => Math.ceil(Math.abs(n) / per);
  const stackH = (k: number, n: number) =>
    Math.max(0, k) > 0 || Math.max(0, n) > 0
      ? rows(Math.max(0, k), perX) * (blockH + 2) + rows(Math.max(0, n), perU) * 16 + 6
      : 0;
  // The pans hang low enough for the tallest stack; balloons need room above the beam.
  const hang = Math.max(46, stackH(a, b) + 14, stackH(cc, d) + 14);
  const balloonRows = Math.max(
    0,
    ...[
      [a, b],
      [cc, d],
    ].map(([k, n]) => Math.ceil((Math.max(0, -k!) + Math.max(0, -n!)) / BALLOONS)),
  );
  const pivot = balloonRows > 0 ? 62 + (balloonRows - 1) * 24 : 22;

  const pan = (px: number, py: number, k: number, n: number, key: string): ReactNode[] => {
    const floor = py + hang - 2;
    const out: ReactNode[] = [];
    const crossX = Math.abs(sameX);
    const crossU = Math.abs(sameU);
    const cross = (x0: number, y0: number, w: number, h: number, id: string) => (
      <Path
        key={id}
        d={`M ${x0} ${y0} L ${x0 + w} ${y0 + h} M ${x0 + w} ${y0} L ${x0} ${y0 + h}`}
        stroke={c.chartInk}
        strokeWidth={chart.stroke}
      />
    );
    // x-blocks: wooden blocks in rows of 5 on the pan.
    const xs = Math.max(0, k);
    for (let i = 0; i < xs; i++) {
      const row = Math.floor(i / perX);
      const inRow = Math.min(perX, xs - row * perX);
      const bx = px - (inRow * (blockW + 3) - 3) / 2 + (i % perX) * (blockW + 3);
      const by = floor - (row + 1) * (blockH + 2);
      const out_ = sameX > 0 && i < crossX;
      out.push(
        <G key={`${key}x${i}`} opacity={out_ ? 0.4 : 1}>
          <Rect x={bx} y={by} width={blockW} height={blockH} rx={2} fill={url(paint.wood)} />
          <Rect x={bx} y={by} width={blockW} height={blockH} rx={2} fill={url(paint.light)} />
          <Rect
            x={bx}
            y={by}
            width={blockW}
            height={blockH}
            rx={2}
            fill="none"
            stroke={c.woodDark}
            strokeWidth={1}
          />
          <ChartText
            x={bx + blockW / 2}
            y={by + blockH / 2 + 5}
            fontSize={chart.emphasis}
            fontWeight="700"
            fontStyle="italic"
            textAnchor="middle"
            fill={c.coinInk}
          >
            {xSym}
          </ChartText>
          {out_ ? cross(bx + 1, by + 1, blockW - 2, blockH - 2, `${key}xc${i}`) : null}
        </G>,
      );
    }
    // Unit counters above the blocks, rows of 7.
    const base = floor - rows(xs, perX) * (blockH + 2);
    const us = Math.max(0, n);
    for (let i = 0; i < us; i++) {
      const row = Math.floor(i / perU);
      const inRow = Math.min(perU, us - row * perU);
      const ux = px - ((inRow - 1) * 15.5) / 2 + (i % perU) * 15.5;
      const uy = base - 9 - row * 16;
      const out_ = sameU > 0 && i < crossU;
      out.push(
        <G key={`${key}u${i}`} opacity={out_ ? 0.4 : 1}>
          <Circle
            cx={ux}
            cy={uy}
            r={7}
            fill={url(paint.unit)}
            stroke={c.chartInk}
            strokeWidth={1}
          />
          <ChartText
            x={ux}
            y={uy + 3.5}
            fontSize={chart.tiny}
            fontWeight="700"
            textAnchor="middle"
            fill={c.coinInk}
          >
            1
          </ChartText>
          {out_ ? cross(ux - 6.5, uy - 6.5, 13, 13, `${key}uc${i}`) : null}
        </G>,
      );
    }
    // Negatives: balloons tied to the pan's rim, pulling it up.
    const negs = [
      ...Array.from({ length: Math.max(0, -k) }, (_, i) => ({ big: true, i })),
      ...Array.from({ length: Math.max(0, -n) }, (_, i) => ({ big: false, i })),
    ];
    const top = floor - stackH(k, n) - 26;
    // Rows of up to 6 balloons, each row higher than the last, staggered a little.
    negs.forEach((g, j) => {
      const row = Math.floor(j / BALLOONS);
      const inRow = Math.min(BALLOONS, negs.length - row * BALLOONS);
      const bx = px - ((inRow - 1) * 19) / 2 + (j % BALLOONS) * 19;
      const by = top - row * 24 - (j % 2) * 5;
      const [rx, ry] = g.big ? [11, 13] : [7.5, 9];
      const crossed = g.big ? sameX < 0 && g.i < crossX : sameU < 0 && g.i < crossU;
      out.push(
        <G key={`${key}n${j}`} opacity={crossed ? 0.4 : 1}>
          <Path
            d={`M ${bx} ${by + ry} Q ${bx + 4} ${(by + ry + floor) / 2} ${px + (bx - px) * 0.6} ${floor - 2}`}
            stroke={c.chartMuted}
            strokeWidth={0.8}
            fill="none"
          />
          <Ellipse cx={bx} cy={by} rx={rx} ry={ry} fill={url(paint.balloon)} />
          <ChartText
            x={bx}
            y={by + 3.5}
            fontSize={g.big ? chart.small : chart.tiny - 1}
            fontWeight="700"
            textAnchor="middle"
            fill={c.onBlock}
          >
            {g.big ? `−${xSym}` : '−1'}
          </ChartText>
          {crossed ? cross(bx - rx + 2, by - ry + 2, 2 * rx - 4, 2 * ry - 4, `${key}nc${j}`) : null}
        </G>,
      );
    });
    return [
      <Line key={`${key}s1`} x1={px - 52} y1={py + hang} x2={px} y2={py} stroke={c.metalDark} />,
      <Line key={`${key}s2`} x1={px + 52} y1={py + hang} x2={px} y2={py} stroke={c.metalDark} />,
      <Path
        key={`${key}p`}
        d={`M ${px - 62} ${py + hang - 1} L ${px + 62} ${py + hang - 1} Q ${px + 54} ${py + hang + 10} ${px + 40} ${py + hang + 10} L ${px - 40} ${py + hang + 10} Q ${px - 54} ${py + hang + 10} ${px - 62} ${py + hang - 1} Z`}
        fill={url(paint.metal)}
        stroke={c.metalDark}
        strokeWidth={chart.strokeLight}
      />,
      ...out,
    ];
  };

  return (
    <View>
      <Canvas aspect={(w) => (pivot + 14 + hang + 46) / w}>
        {({ w, h }) => {
          const cx = w / 2;
          const arm = Math.min(w * 0.36, w / 2 - 66);
          const ly = pivot - tilt;
          const ry = pivot + tilt;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Deepen id={paint.wood} from={c.wood} to={c.woodDark} />
                <TopLight id={paint.light} />
                <Ball id={paint.unit} color={c.chartSecond} />
                <Ball id={paint.balloon} color={c.blockRed} />
                <Deepen id={paint.metal} from={c.metal} to={c.metalDark} />
              </Defs>
              <FloorShadow cx={cx} cy={h - 6} rx={46} ry={4} />
              <Polygon
                points={`${cx},${pivot} ${cx - 26},${h - 8} ${cx + 26},${h - 8}`}
                fill={url(paint.metal)}
                stroke={c.metalDark}
                strokeLinejoin="round"
              />
              <Rect x={cx - 40} y={h - 12} width={80} height={6} rx={3} fill={c.metalDark} />
              <Line
                x1={cx - arm}
                y1={ly}
                x2={cx + arm}
                y2={ry}
                stroke={c.metalDark}
                strokeWidth={chart.strokeHeavy + 2}
                strokeLinecap="round"
              />
              <Line
                x1={cx - arm}
                y1={ly - 1}
                x2={cx + arm}
                y2={ry - 1}
                stroke={c.metal}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <Circle cx={cx} cy={pivot} r={6} fill={c.chartInk} stroke={c.metal} strokeWidth={2} />
              <G opacity={allKnown ? 1 : 0.35}>
                {pan(cx - arm, ly, a, b, 'L')}
                {pan(cx + arm, ry, cc, d, 'R')}
              </G>
              {/* Each side's total under its pan when x is known. */}
              {L !== undefined && R !== undefined
                ? [
                    [cx - arm, ly, L],
                    [cx + arm, ry, R],
                  ].map(([px, py, v]) => (
                    <ChartText
                      key={`t${px}`}
                      x={px}
                      y={py! + hang + 28}
                      fontSize={chart.value}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {formatNumber(v!)}
                    </ChartText>
                  ))
                : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
    </View>
  );

  function caption(): string {
    if (!allKnown) return 'Type the numbers on both sides to load the balance.';
    const eq = `${sideText(a, b, xSym)} = ${sideText(cc, d, xSym)}`;
    const lines = [eq];
    if (x !== undefined && L !== undefined && R !== undefined) {
      const xs = x < 0 ? `(${formatNumber(x)})` : formatNumber(x);
      const at = (k: number, n: number, v: number) => {
        const t = k === 0 ? '' : `${formatNumber(k)} × ${xs}`;
        const rest =
          n === 0
            ? t
              ? ''
              : '0'
            : t
              ? ` ${n < 0 ? '−' : '+'} ${formatNumber(Math.abs(n))}`
              : formatNumber(n);
        return `${t}${rest} = ${formatNumber(v)}`;
      };
      lines.push(`On the left: ${at(a, b, L)}`, `On the right: ${at(cc, d, R)}`);
      lines.push(
        Math.abs(L - R) < 1e-9
          ? `Level when ${xSym} = ${formatNumber(x)}: both sides weigh the same.`
          : `Not level when ${xSym} = ${formatNumber(x)}: the ${L > R ? 'left' : 'right'} side is heavier.`,
      );
    }
    if (spec.cancel && (sameX !== 0 || sameU !== 0)) {
      const [a2, c2] = [a - sameX, cc - sameX];
      const [b2, d2] = [b - sameU, d - sameU];
      const took = [
        sameX !== 0 ? term(sameX, xSym) : '',
        sameU !== 0 ? formatNumber(sameU) : '',
      ].filter(Boolean);
      lines.push(
        `Take ${took.join(' and ')} from both sides: ${sideText(a2, b2, xSym)} = ${sideText(c2, d2, xSym)}`,
      );
    }
    if (a === cc)
      lines.push(
        b === d
          ? `Both sides are the same: every ${xSym} balances.`
          : `The ${xSym}-blocks match but ${formatNumber(b)} ≠ ${formatNumber(d)}: no ${xSym} balances.`,
      );
    return lines.join(' · ');
  }
}
