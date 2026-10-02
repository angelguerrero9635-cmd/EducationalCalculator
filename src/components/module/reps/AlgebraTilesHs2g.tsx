/**
 * H95: two `algebraTiles` modes past the tiles. `box`: the area box (generic rectangle) for a
 * product of two polynomials, every cell a row term times a column term, each diagonal of like
 * terms in its own tint and collected in a key under the box. `monomial`: a·xᵐ ÷ b·xⁿ written out
 * as factors over and under a bar, the pairs that cancel struck, the answer c·xᵏ under it. Flat.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';

import type { AlgebraTilesHs2g as Modes } from '@/data/modules/typesHs2g';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { boxCells, boxProduct, monomialModel, polyTextN, termText } from './algebraBox';
import { Canvas, Caption, useRep } from './common';
import { toFraction } from './exact';
import { MathText, textWidth } from './hsdText';

const MINUS = '−';
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) =>
  `${n < 0 ? '⁻' : ''}${[...String(Math.abs(n))].map((d) => SUP[Number(d)]).join('')}`;

/** A coefficient as written: "4", "−2/3", "0.25". */
function coefText(x: number): string {
  if (Number.isInteger(x)) return formatNumber(x).replace('-', MINUS);
  const f = toFraction(Math.abs(x), 100);
  return f ? `${x < 0 ? MINUS : ''}${f[0]}/${f[1]}` : formatNumber(x).replace('-', MINUS);
}

export function AlgebraTilesHs2g({
  spec,
  calc,
}: {
  spec: Modes & { kind: 'algebraTiles' };
  calc: Calculator;
}) {
  return spec.mode === 'box' ? (
    <AreaBox spec={spec} calc={calc} />
  ) : (
    <MonomialFactors spec={spec} calc={calc} />
  );
}

type BoxSpec = Extract<Modes, { mode: 'box' }>;
type MonomialSpec = Extract<Modes, { mode: 'monomial' }>;

function AreaBox({ spec, calc }: { spec: BoxSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const known = [...spec.top, ...spec.side].every((v) => typeof v === 'number' || rep.known(v));
  const top = spec.top.map(num);
  const side = spec.side.map(num);
  const [dt, ds] = [top.length - 1, side.length - 1];
  const cells = boxCells(top, side);
  const product = boxProduct(top, side);
  const maxDeg = dt + ds;
  const bands = [
    c.areaBoxBand1,
    c.areaBoxBand2,
    c.areaBoxBand3,
    c.areaBoxBand4,
    c.areaBoxBand5,
    c.areaBoxBand6,
  ];
  const band = (d: number) => bands[(maxDeg - d) % bands.length]!;
  const factor = (cs: number[]) => {
    const t = polyTextN(cs);
    return cs.filter((x) => x !== 0).length > 1 ? `(${t})` : t;
  };
  // A "?" term reads "?x²", and every product it makes reads "?": never the example's
  // numbers behind a "?".
  const isKnown = (v: number | string) => typeof v === 'number' || rep.known(v);
  const unknownTerm = (d: number) => (d === 0 ? '?' : `?${termText(1, d)}`);
  const topText = spec.top.map((v, i) =>
    isKnown(v) ? termText(top[i]!, dt - i) : unknownTerm(dt - i),
  );
  const sideText = spec.side.map((v, i) =>
    isKnown(v) ? termText(side[i]!, ds - i) : unknownTerm(ds - i),
  );
  const cellText = (k: (typeof cells)[number]) =>
    isKnown(spec.side[k.row]!) && isKnown(spec.top[k.col]!)
      ? termText(k.coef, k.degree)
      : unknownTerm(k.degree);
  const factorText = (ts: string[]) => {
    const kept = ts.filter((t) => t !== '0');
    const joined = kept
      .map((t, i) => (i === 0 ? t : t.startsWith(MINUS) ? ` − ${t.slice(1)}` : ` + ${t}`))
      .join('');
    return kept.length > 1 ? `(${joined})` : joined;
  };
  const whole = known
    ? `${factor(side)}${factor(top)}`
    : `${factorText(sideText)}${factorText(topText)}`;
  const answer = known ? polyTextN(product) : '?';
  const degrees = Array.from({ length: maxDeg + 1 }, (_, i) => maxDeg - i);
  const keyText = (d: number) => {
    const parts = cells.filter((k) => k.degree === d).map(cellText);
    const sum = known ? termText(product[maxDeg - d]!, d) : unknownTerm(d);
    const joined = parts
      .map((p, i) => (i === 0 ? p : p.startsWith(MINUS) ? ` − ${p.slice(1)}` : ` + ${p}`))
      .join('');
    return parts.length > 1 ? `${joined} = ${sum}` : joined;
  };
  const lines = [
    `${whole} = ${answer}`,
    'Each cell is its row term times its column term; like terms share a diagonal and a tint',
  ];
  const cols = top.length;
  const rows = side.length;
  const KEY = 24;
  const CH = 46;
  return (
    <View>
      <Canvas aspect={(w) => (30 + rows * CH + 18 + degrees.length * KEY + 6) / w}>
        {({ w, h }) => {
          const LW = 58;
          const cw = Math.min(88, (w - LW - 16) / cols);
          const x0 = (w - LW - cols * cw) / 2 + LW;
          const y0 = 30;
          const keyY = y0 + rows * CH + 18;
          // The key's rows share one left edge, the block centred.
          const keyW = Math.max(...degrees.map((d) => textWidth(keyText(d), chart.value))) + 22;
          const lx = Math.max(8, (w - keyW) / 2);
          return (
            <Svg width={w} height={h}>
              <G opacity={known ? 1 : 0.4}>
                {cells.map((k) => {
                  const [x, y] = [x0 + k.col * cw, y0 + k.row * CH];
                  return (
                    <G key={`${k.row}-${k.col}`}>
                      <Rect
                        x={x}
                        y={y}
                        width={cw}
                        height={CH}
                        fill={band(k.degree)}
                        stroke={c.chartInk}
                        strokeWidth={chart.strokeLight}
                      />
                      <MathText
                        text={cellText(k)}
                        x={x + cw / 2}
                        y={y + CH / 2 + 5}
                        textAnchor="middle"
                        fontSize={chart.emphasis}
                        fontWeight="600"
                        fill={k.coef === 0 ? c.chartMuted : c.chartInk}
                      />
                    </G>
                  );
                })}
                {topText.map((t, i) => (
                  <MathText
                    key={`t${i}`}
                    text={t}
                    x={x0 + (i + 0.5) * cw}
                    y={y0 - 10}
                    textAnchor="middle"
                    fontSize={chart.emphasis}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  />
                ))}
                {sideText.map((t, i) => (
                  <MathText
                    key={`s${i}`}
                    text={t}
                    x={x0 - 8}
                    y={y0 + (i + 0.5) * CH + 5}
                    textAnchor="end"
                    fontSize={chart.emphasis}
                    fontWeight="700"
                    fill={c.chartHighlight}
                  />
                ))}
                {degrees.map((d, i) => {
                  const text = keyText(d);
                  const y = keyY + i * KEY;
                  return (
                    <G key={`k${d}`}>
                      <Rect
                        x={lx}
                        y={y}
                        width={14}
                        height={14}
                        rx={3}
                        fill={band(d)}
                        stroke={c.chartMuted}
                        strokeWidth={1}
                      />
                      <MathText
                        text={text}
                        x={lx + 22}
                        y={y + 12}
                        fontSize={chart.value}
                        fill={c.chartInk}
                      />
                    </G>
                  );
                })}
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}

function MonomialFactors({ spec, calc }: { spec: MonomialSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (v: number | string) => (typeof v === 'number' ? v : rep.val(v));
  const known = [spec.a, spec.m, spec.b, spec.n].every(
    (v) => typeof v === 'number' || rep.known(v),
  );
  const [a, m, b, n] = [spec.a, spec.m, spec.b, spec.n].map(num) as [
    number,
    number,
    number,
    number,
  ];
  const model = monomialModel(a, m, b, n);
  const { over, under, pairs, k } = model;
  const cText = Number.isFinite(model.c) ? coefText(model.c) : '?';
  const power = (e: number) => (e === 0 ? '' : e === 1 ? 'x' : `x${sup(e)}`);
  const lead = (x: string, e: number) =>
    e !== 0 && x === '1' ? '' : e !== 0 && x === MINUS + '1' ? MINUS : x;
  // A fraction before a power is bracketed: (3/2)x⁵.
  const before = (x: string, e: number) => {
    const t = lead(x, e);
    return e !== 0 && t.includes('/') ? `(${t})` : t;
  };
  const answer =
    k >= 0 || cText.includes('/')
      ? `${before(cText, k)}${power(k)}`
      : `${cText}/${power(-k)} = ${before(cText, k)}${power(k)}`;
  const aText = coefText(a);
  const bText = coefText(b);
  // The factors that crossed the bar: a negative exponent's x's (x⁻² on top is 1 ÷ x²).
  const movedOver = Math.max(-n, 0);
  const movedUnder = Math.max(-m, 0);
  const lines = [
    `${aText}${power(m)} ÷ ${bText}${power(n)} = ${answer}`,
    `${aText} ÷ ${bText} = ${cText}; ${pairs} pair${pairs === 1 ? '' : 's'} of x cancel${pairs === 1 ? 's' : ''}, leaving ${Math.abs(over - under)} x${Math.abs(over - under) === 1 ? '' : "'s"} ${over >= under ? 'on top' : 'under the bar'}`,
  ];
  if (movedOver || movedUnder)
    lines.push(
      [
        movedOver
          ? `x${sup(-movedOver)} under the bar is 1 ÷ x${sup(movedOver)}: its x's go on top`
          : '',
        movedUnder
          ? `x${sup(-movedUnder)} on top is 1 ÷ x${sup(movedUnder)}: its x's go under`
          : '',
      ]
        .filter(Boolean)
        .join('; ') + ' (orange)',
    );
  const most = Math.max(over, under, 1);
  return (
    <View>
      <Canvas aspect={(w) => 168 / w}>
        {({ w, h }) => {
          const coefW = Math.max(textWidth(aText, 18), textWidth(bText, 18)) + 16;
          const sw = Math.min(30, (w - 24 - coefW) / most);
          const fs = Math.max(14, Math.min(20, sw * 0.9));
          const rowW = coefW + most * sw;
          const x0 = (w - rowW) / 2;
          const [yTop, yBar, yBottom, yAnswer] = [40, 58, 90, 138];
          const factorRow = (count: number, moved: number, y: number, key: string) =>
            Array.from({ length: count }, (_, i) => {
              const cx = x0 + coefW + (i + 0.5) * sw;
              const struck = i < pairs;
              // The moved factors are drawn last in the row.
              const crossed = i >= count - moved;
              return (
                <G key={`${key}${i}`}>
                  {sw >= 20 && i > 0 ? (
                    <Circle cx={cx - sw / 2} cy={y - fs * 0.3} r={1.6} fill={c.chartMuted} />
                  ) : null}
                  <MathText
                    text="x"
                    x={cx}
                    y={y}
                    textAnchor="middle"
                    fontSize={fs}
                    fill={crossed ? c.fnSecond : c.chartInk}
                    opacity={struck ? 0.45 : 1}
                  />
                  {struck ? (
                    <Line
                      x1={cx - fs * 0.4}
                      y1={y + 3}
                      x2={cx + fs * 0.4}
                      y2={y - fs * 0.75}
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                  ) : null}
                </G>
              );
            });
          return (
            <Svg width={w} height={h}>
              <G opacity={known ? 1 : 0.4}>
                <MathText
                  text={aText}
                  x={x0 + coefW - 12}
                  y={yTop}
                  textAnchor="end"
                  fontSize={18}
                  fontWeight="700"
                />
                <MathText
                  text={bText}
                  x={x0 + coefW - 12}
                  y={yBottom}
                  textAnchor="end"
                  fontSize={18}
                  fontWeight="700"
                />
                {factorRow(over, movedOver, yTop, 'o')}
                {factorRow(under, movedUnder, yBottom, 'u')}
                {over === 0 ? (
                  <MathText
                    text="1"
                    x={x0 + coefW + sw / 2}
                    y={yTop}
                    textAnchor="middle"
                    fontSize={fs}
                    fill={c.chartMuted}
                  />
                ) : null}
                {under === 0 ? (
                  <MathText
                    text="1"
                    x={x0 + coefW + sw / 2}
                    y={yBottom}
                    textAnchor="middle"
                    fontSize={fs}
                    fill={c.chartMuted}
                  />
                ) : null}
                <Line
                  x1={x0}
                  y1={yBar}
                  x2={x0 + rowW}
                  y2={yBar}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <MathText
                  text={`= ${answer}`}
                  x={w / 2}
                  y={yAnswer}
                  textAnchor="middle"
                  fontSize={20}
                  fontWeight="700"
                  fill={c.chartHighlight}
                />
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
