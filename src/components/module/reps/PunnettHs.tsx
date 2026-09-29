/**
 * H35 (group HG): the Grade 9 Punnett squares, drawn when a `punnettSquare` sets `inheritance`.
 * - dihybrid: each parent's four gametes (one allele of each gene) across the top and down the
 *   side, the 16 boxes colored by the four phenotypes and counted in a key (9 : 3 : 3 : 1 for two
 *   double heterozygotes);
 * - incomplete dominance: the heterozygote a blend (pink between red and white); codominance:
 *   both shown (red and white patches, roan);
 * - X-linked: the father's X and Y across the top, the mother's X down the side, each box a
 *   daughter or a son; the affected filled, carrier daughters half-shaded as in a pedigree.
 * Allele superscripts (Xᴬ, Cᴿ) are drawn as raised text. Flat, like every table.
 */
import Svg, { Circle, G, Rect, TSpan } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import type { PunnettInheritance } from '@/data/modules/typesHsg';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import {
  allelesFrom,
  classOf,
  dihybridBoxes,
  dihybridCounts,
  gametesOf,
  monoBoxes,
  xBoxes,
} from './punnettMath';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'punnettSquare' }>;
const W = 360;

/** A run of text: plain, or raised (a superscript). */
type Seg = { t: string; sup?: boolean };

/** Text with raised parts; `anchor` works on the whole run. */
function Rich({
  x,
  y,
  segs,
  size,
  fill,
  anchor = 'middle',
  bold = true,
}: {
  x: number;
  y: number;
  segs: Seg[];
  size: number;
  fill: string;
  anchor?: 'start' | 'middle' | 'end';
  bold?: boolean;
}) {
  const rise = size * 0.38;
  // Raise at the start of a superscript, drop back after it.
  const dys = segs.map((sg, i) => {
    const prev = i > 0 && !!segs[i - 1]!.sup;
    return sg.sup && !prev ? -rise : !sg.sup && prev ? rise : 0;
  });
  return (
    <ChartText
      x={x}
      y={y}
      fontSize={size}
      fontWeight={bold ? '800' : '500'}
      textAnchor={anchor}
      fill={fill}
    >
      {segs.map((s, i) => {
        const dy = dys[i];
        return (
          <TSpan key={i} dy={dy} fontSize={s.sup ? size * 0.72 : size}>
            {s.t}
          </TSpan>
        );
      })}
    </ChartText>
  );
}

export function PunnettHs({
  spec,
  inheritance,
  calc,
}: {
  spec: Spec;
  inheritance: PunnettInheritance;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = [
    spec.first,
    spec.second,
    ...(inheritance.pattern === 'dihybrid' ? [inheritance.firstB, inheritance.secondB] : []),
  ];
  const known = ids.every((id) => rep.known(id));
  const n = (id: string, max = 2) => Math.max(0, Math.min(max, Math.round(rep.shown(id))));
  const steppers = ids.map((id) => ({ var: id, steps: [1], pin: ids.filter((o) => o !== id) }));
  return (
    <>
      {inheritance.pattern === 'dihybrid' ? (
        <Dihybrid
          spec={spec}
          h={inheritance}
          p={n(spec.first)}
          q={n(spec.second)}
          pB={n(inheritance.firstB)}
          qB={n(inheritance.secondB)}
          known={known}
          c={c}
        />
      ) : inheritance.pattern === 'xLinked' ? (
        <XLinked
          spec={spec}
          mother={n(spec.first)}
          father={n(spec.second, 1)}
          known={known}
          c={c}
        />
      ) : (
        <Blend
          spec={spec}
          h={inheritance}
          p={n(spec.first)}
          q={n(spec.second)}
          known={known}
          c={c}
        />
      )}
      <Steppers calc={calc} items={steppers} />
    </>
  );
}

/** Letters for a gene: the dominant allele's capital and the recessive's small letter. */
const up = (l: string) => l.toUpperCase();
const low = (l: string) => l.toLowerCase();

// ─── Dihybrid ────────────────────────────────────────────────────────────────

const DEFAULT_NAMES: [string, string, string, string] = [
  'both dominant',
  'first dominant only',
  'second dominant only',
  'both recessive',
];

function Dihybrid({
  spec,
  h,
  p,
  q,
  pB,
  qB,
  known,
  c,
}: {
  spec: Spec;
  h: Extract<PunnettInheritance, { pattern: 'dihybrid' }>;
  p: number;
  q: number;
  pB: number;
  qB: number;
  known: boolean;
  c: Palette;
}) {
  const [A, B] = [spec.letter, h.letterB];
  const gene = (count: number, l: string) =>
    count >= 2 ? up(l) + up(l) : count === 1 ? up(l) + low(l) : low(l) + low(l);
  const gamete = ([a, b]: [boolean, boolean]) => (a ? up(A) : low(A)) + (b ? up(B) : low(B));
  const top = gametesOf(p, pB);
  const side = gametesOf(q, qB);
  const boxes = dihybridBoxes(p, q, pB, qB);
  const counts = dihybridCounts(boxes);
  const names = h.names ?? DEFAULT_NAMES;
  const fills = [c.chartHighlight, c.chartSecond, c.bioAmino, c.chartSurface];
  const inks = [c.onChartHighlight, c.bioInk, c.bioInk, c.chartInk];
  const box = 70;
  const head = 44;
  const x0 = (W - head - 4 * box) / 2 + head;
  const y0 = 56;
  const keyY = y0 + 4 * box + 22;
  const H = keyY + 4 * 22 + 4;
  const parent1 = gene(p, A) + gene(pB, B);
  const parent2 = gene(q, A) + gene(qB, B);
  return (
    <>
      <Canvas aspect={H / W}>
        {({ w, h: ch }) => (
          <Svg width={w} height={ch}>
            <G transform={`scale(${w / W})`} opacity={known ? 1 : 0.4}>
              <ChartText
                x={W / 2}
                y={18}
                fontSize={chart.emphasis}
                fontWeight="700"
                textAnchor="middle"
              >
                {`${parent1} × ${parent2}`}
              </ChartText>
              {top.map((g, i) => (
                <ChartText
                  key={i}
                  x={x0 + box * (i + 0.5)}
                  y={y0 - 12}
                  fontSize={chart.emphasis + 2}
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {gamete(g)}
                </ChartText>
              ))}
              {side.map((g, j) => (
                <ChartText
                  key={j}
                  x={x0 - 8}
                  y={y0 + box * (j + 0.5) + 5}
                  fontSize={chart.emphasis + 2}
                  fontWeight="800"
                  textAnchor="end"
                >
                  {gamete(g)}
                </ChartText>
              ))}
              {boxes.map((row, j) =>
                row.map((b, i) => {
                  const k = classOf(b);
                  return (
                    <G key={`${j}${i}`}>
                      <Rect
                        x={x0 + i * box + 1.5}
                        y={y0 + j * box + 1.5}
                        width={box - 3}
                        height={box - 3}
                        rx={5}
                        fill={fills[k]}
                        stroke={c.chartInk}
                        strokeWidth={1.2}
                      />
                      <ChartText
                        x={x0 + (i + 0.5) * box}
                        y={y0 + (j + 0.5) * box + 5}
                        fontSize={chart.emphasis + 1}
                        fontWeight="800"
                        textAnchor="middle"
                        fill={inks[k]}
                      >
                        {gene(b.a, A) + gene(b.b, B)}
                      </ChartText>
                    </G>
                  );
                }),
              )}
              {names.map((name, k) => (
                <G key={k}>
                  <Rect
                    x={x0}
                    y={keyY + k * 22 - 11}
                    width={14}
                    height={14}
                    rx={3}
                    fill={fills[k]}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  <ChartText x={x0 + 22} y={keyY + k * 22} fontSize={chart.value}>
                    {`${counts[k]} of 16: ${name}`}
                  </ChartText>
                </G>
              ))}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {known
          ? `${parent1} × ${parent2}: ${counts.join(':')} of 16 boxes (${names[0]}, ${names[1]}, ${names[2]}, ${names[3]}).`
          : 'Set each parent’s alleles for both genes to fill the square.'}
      </Caption>
    </>
  );
}

// ─── Incomplete dominance and codominance ────────────────────────────────────

function Blend({
  spec,
  h,
  p,
  q,
  known,
  c,
}: {
  spec: Spec;
  h: Extract<PunnettInheritance, { pattern: 'incomplete' | 'codominant' }>;
  p: number;
  q: number;
  known: boolean;
  c: Palette;
}) {
  const co = h.pattern === 'codominant';
  const names = h.names ?? ['red', co ? 'roan (red and white)' : 'pink', 'white'];
  const allele = (dom: boolean): Seg[] =>
    h.alleles
      ? [{ t: up(spec.letter) }, { t: h.alleles[dom ? 0 : 1]!, sup: true }]
      : [{ t: dom ? up(spec.letter) : low(spec.letter) }];
  const pair = (count: number): Seg[] => [...allele(count >= 1), ...allele(count >= 2)];
  const top = allelesFrom(p);
  const side = allelesFrom(q);
  const boxes = monoBoxes(p, q);
  const fillOf = (k: number) =>
    k === 2 ? c.flowerRed : k === 1 ? (co ? c.flowerWhite : c.flowerPink) : c.flowerWhite;
  const inkOf = (k: number) => (k === 2 ? c.onChartHighlight : c.bioInk);
  const counts = [2, 1, 0].map((k) => boxes.flat().filter((b) => b === k).length);
  const box = 88;
  const x0 = (W - 2 * box) / 2 + 20;
  const y0 = 64;
  const H = y0 + 2 * box + 16;
  return (
    <>
      <Canvas aspect={H / W}>
        {({ w, h: ch }) => (
          <Svg width={w} height={ch}>
            <G transform={`scale(${w / W})`} opacity={known ? 1 : 0.4}>
              <Rich
                x={W / 2}
                y={20}
                segs={[...pair(p), { t: ' × ' }, ...pair(q)]}
                size={chart.emphasis + 1}
                fill={c.chartInk}
              />
              {top.map((t, i) => (
                <Rich
                  key={i}
                  x={x0 + box * (i + 0.5)}
                  y={y0 - 12}
                  segs={allele(t)}
                  size={chart.emphasis + 4}
                  fill={c.chartInk}
                />
              ))}
              {side.map((s, j) => (
                <Rich
                  key={j}
                  x={x0 - 10}
                  y={y0 + box * (j + 0.5) + 6}
                  segs={allele(s)}
                  size={chart.emphasis + 4}
                  fill={c.chartInk}
                  anchor="end"
                />
              ))}
              {boxes.map((row, j) =>
                row.map((k, i) => {
                  const x = x0 + i * box;
                  const y = y0 + j * box;
                  return (
                    <G key={`${j}${i}`}>
                      <Rect
                        x={x + 2}
                        y={y + 2}
                        width={box - 4}
                        height={box - 4}
                        rx={6}
                        fill={fillOf(k)}
                        stroke={c.chartInk}
                        strokeWidth={1.2}
                      />
                      {co && k === 1
                        ? // Codominance: both colors show, as red patches on white.
                          Array.from({ length: 12 }, (_, s) => (
                            <Circle
                              key={s}
                              cx={x + 14 + (s % 4) * 20}
                              cy={y + 14 + Math.floor(s / 4) * 30 + (s % 2) * 8}
                              r={6}
                              fill={c.flowerRed}
                            />
                          ))
                        : null}
                      <Rect
                        x={x + 10}
                        y={y + 22}
                        width={box - 20}
                        height={46}
                        rx={8}
                        fill={c.card}
                        opacity={co && k === 1 ? 0.85 : 0}
                      />
                      <Rich
                        x={x + box / 2}
                        y={y + box / 2 - 2}
                        segs={pair(k)}
                        size={chart.emphasis + 3}
                        fill={co && k === 1 ? c.chartInk : inkOf(k)}
                      />
                      <ChartText
                        x={x + box / 2}
                        y={y + box / 2 + 16}
                        fontSize={chart.label}
                        fontWeight="600"
                        textAnchor="middle"
                        fill={co && k === 1 ? c.chartInk : inkOf(k)}
                      >
                        {names[2 - k]!.split(' (')[0]}
                      </ChartText>
                    </G>
                  );
                }),
              )}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {known
          ? `${counts[0]} of 4 ${names[0]}, ${counts[1]} of 4 ${names[1]}, ${counts[2]} of 4 ${names[2]}. ${co ? 'Codominance: the heterozygote shows both colors.' : 'Incomplete dominance: the heterozygote is in between.'}`
          : 'Set each parent’s alleles to fill the square.'}
      </Caption>
    </>
  );
}

// ─── X-linked ────────────────────────────────────────────────────────────────

function XLinked({
  spec,
  mother,
  father,
  known,
  c,
}: {
  spec: Spec;
  mother: number;
  father: number;
  known: boolean;
  c: Palette;
}) {
  const L = spec.letter;
  const x = (dom: boolean): Seg[] => [{ t: 'X' }, { t: dom ? up(L) : low(L), sup: true }];
  const Y: Seg[] = [{ t: 'Y' }];
  const m = allelesFrom(mother);
  const fx = father >= 1;
  const boxes = xBoxes(mother, father);
  const box = 92;
  const x0 = (W - 2 * box) / 2 + 22;
  const y0 = 68;
  const H = y0 + 2 * box + 34;
  const affected = boxes.flat().filter((b) => b.affected).length;
  const carriers = boxes.flat().filter((b) => b.carrier).length;
  return (
    <>
      <Canvas aspect={H / W}>
        {({ w, h: ch }) => (
          <Svg width={w} height={ch}>
            <G transform={`scale(${w / W})`} opacity={known ? 1 : 0.4}>
              <Rich
                x={W / 2}
                y={20}
                segs={[
                  { t: 'Mother ' },
                  ...x(m[0]),
                  ...x(m[1]),
                  { t: '  ×  Father ' },
                  ...x(fx),
                  ...Y,
                ]}
                size={chart.emphasis + 1}
                fill={c.chartInk}
              />
              <Rich
                x={x0 + box * 0.5}
                y={y0 - 12}
                segs={x(fx)}
                size={chart.emphasis + 4}
                fill={c.chartInk}
              />
              <Rich
                x={x0 + box * 1.5}
                y={y0 - 12}
                segs={Y}
                size={chart.emphasis + 4}
                fill={c.chartInk}
              />
              {m.map((d, j) => (
                <Rich
                  key={j}
                  x={x0 - 10}
                  y={y0 + box * (j + 0.5) + 6}
                  segs={x(d)}
                  size={chart.emphasis + 4}
                  fill={c.chartInk}
                  anchor="end"
                />
              ))}
              {boxes.map((row, j) =>
                row.map((b, i) => {
                  const bx = x0 + i * box;
                  const by = y0 + j * box;
                  const segs = b.son ? [...x(m[j]!), ...Y] : [...x(fx), ...x(m[j]!)].slice(0, 4);
                  // Dominant allele first in a daughter.
                  const daughter = !b.son && !fx && m[j] ? [...x(true), ...x(false)] : segs;
                  const ink = b.affected ? c.onChartHighlight : c.chartInk;
                  return (
                    <G key={`${j}${i}`}>
                      <Rect
                        x={bx + 2}
                        y={by + 2}
                        width={box - 4}
                        height={box - 4}
                        rx={6}
                        fill={b.affected ? c.chartHighlight : c.chartSurface}
                        stroke={c.chartInk}
                        strokeWidth={1.2}
                      />
                      {b.carrier ? (
                        <Rect
                          x={bx + 2}
                          y={by + 2}
                          width={(box - 4) / 2}
                          height={box - 4}
                          rx={6}
                          fill={c.chartHighlight}
                          opacity={0.45}
                        />
                      ) : null}
                      <Rich
                        x={bx + box / 2}
                        y={by + box / 2 - 4}
                        segs={b.son ? segs : daughter}
                        size={chart.emphasis + 3}
                        fill={ink}
                      />
                      {[
                        b.son ? 'son' : 'daughter',
                        b.affected ? 'affected' : b.carrier ? 'carrier' : '',
                      ]
                        .filter(Boolean)
                        .map((t, k) => (
                          <ChartText
                            key={t}
                            x={bx + box / 2}
                            y={by + box / 2 + 16 + k * 15}
                            fontSize={chart.label}
                            fontWeight="600"
                            textAnchor="middle"
                            fill={ink}
                          >
                            {t}
                          </ChartText>
                        ))}
                    </G>
                  );
                }),
              )}
              <G>
                <Rect x={x0} y={H - 22} width={14} height={14} rx={3} fill={c.chartHighlight} />
                <ChartText x={x0 + 20} y={H - 10} fontSize={chart.label}>
                  affected
                </ChartText>
                <Rect
                  x={x0 + 90}
                  y={H - 22}
                  width={14}
                  height={14}
                  rx={3}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <Rect
                  x={x0 + 90}
                  y={H - 22}
                  width={7}
                  height={14}
                  fill={c.chartHighlight}
                  opacity={0.45}
                />
                <ChartText x={x0 + 110} y={H - 10} fontSize={chart.label}>
                  carrier (half-shaded)
                </ChartText>
              </G>
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {known
          ? `${affected} of 4 boxes show the trait and ${carriers} of 4 are carrier daughters. A son gets his X from his mother, so one recessive allele is enough for him.`
          : 'Set the mother’s and the father’s alleles to fill the square.'}
      </Caption>
    </>
  );
}
