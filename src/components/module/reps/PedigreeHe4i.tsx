/**
 * HC144 (round 4, group I): `pedigree` as a calculator picture, and the drawing it shares with
 * the pedigree card figure (`layouts/pedigreeCardHe4i.tsx`): one family of `people`, as the
 * explore figure lists them, in the standard symbols. Squares are males, circles females;
 * filled shows the trait, half-filled carries it. A line joins a couple; their children hang
 * from a line below it. The picture numbers the generations (I, II, …) and the people in each,
 * writes the page's chances beside people and draws the couple's next child as a diamond with
 * its chance. Flat.
 */
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect, Circle } from 'react-native-svg';

import type { PedigreePerson } from '@/data/modules/layouts';
import type { PedigreeSpec } from '@/data/modules/typesHe4i';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { toFraction } from './exact';
import { chanceText, pedigreeLayout, type PedigreePlace } from './pedigreeHe4iMath';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

/** One person's symbol: a square or a circle, filled, half-filled or empty. */
export function PedigreeSymbolHe4i({
  x,
  y,
  size,
  person,
  ink,
  paper,
  stroke = chart.stroke,
}: {
  x: number;
  y: number;
  size: number;
  person: Pick<PedigreePerson, 'sex' | 'trait' | 'carrier'>;
  ink: string;
  paper: string;
  stroke?: number;
}) {
  const r = size / 2;
  const male = person.sex === 'male';
  const fill = person.trait ? ink : paper;
  return (
    <G>
      {male ? (
        <Rect x={x - r} y={y - r} width={size} height={size} fill={fill} />
      ) : (
        <Circle cx={x} cy={y} r={r} fill={fill} />
      )}
      {person.carrier && !person.trait ? (
        male ? (
          <Rect x={x} y={y - r} width={r} height={size} fill={ink} />
        ) : (
          <Path d={`M ${x} ${y - r} A ${r} ${r} 0 0 1 ${x} ${y + r} Z`} fill={ink} />
        )
      ) : null}
      {male ? (
        <Rect
          x={x - r}
          y={y - r}
          width={size}
          height={size}
          fill="none"
          stroke={ink}
          strokeWidth={stroke}
        />
      ) : (
        <Circle cx={x} cy={y} r={r} fill="none" stroke={ink} strokeWidth={stroke} />
      )}
    </G>
  );
}

/**
 * The family: couple lines, sibship lines and symbols, laid out by `pedigreeLayout`. Returns
 * the drawing and where each person went (for labels).
 */
export function PedigreeLines({
  people,
  place,
  couples,
  size,
  ink,
  paper,
  carriers,
  stroke = chart.stroke,
}: {
  people: PedigreePerson[];
  place: Map<string, PedigreePlace>;
  couples: { a: string; b: string; kids: string[] }[];
  size: number;
  ink: string;
  paper: string;
  carriers: boolean;
  stroke?: number;
}) {
  return (
    <G>
      {couples.map(({ a, b, kids }) => {
        const pa = place.get(a)!;
        const pb = place.get(b)!;
        const [l, r] = pa.x < pb.x ? [pa, pb] : [pb, pa];
        const mid = (l.x + r.x) / 2;
        const drop = kids.length ? place.get(kids[0]!)!.y - size / 2 : 0;
        const sib = drop - Math.max(4, size * 0.45);
        const xs = kids.map((k) => place.get(k)!.x);
        return (
          <G key={`${a}+${b}`}>
            <Line
              x1={l.x + size / 2}
              y1={l.y}
              x2={r.x - size / 2}
              y2={r.y}
              stroke={ink}
              strokeWidth={stroke}
            />
            {kids.length ? (
              <G>
                <Line x1={mid} y1={l.y} x2={mid} y2={sib} stroke={ink} strokeWidth={stroke} />
                <Line
                  x1={Math.min(mid, ...xs)}
                  y1={sib}
                  x2={Math.max(mid, ...xs)}
                  y2={sib}
                  stroke={ink}
                  strokeWidth={stroke}
                />
                {xs.map((x, i) => (
                  <Line
                    key={i}
                    x1={x}
                    y1={sib}
                    x2={x}
                    y2={drop}
                    stroke={ink}
                    strokeWidth={stroke}
                  />
                ))}
              </G>
            ) : null}
          </G>
        );
      })}
      {people.map((p) => {
        const at = place.get(p.id)!;
        return (
          <PedigreeSymbolHe4i
            key={p.id}
            x={at.x}
            y={at.y}
            size={size}
            person={carriers ? p : { ...p, carrier: false }}
            ink={ink}
            paper={paper}
            stroke={stroke}
          />
        );
      })}
    </G>
  );
}

const TOP = 22;
const ROW = 92;
const LEFT = 30;

/** The calculator picture (genetics#0): the family, the chances on people, the next child. */
export function PedigreeHe4i({ spec, calc }: { spec: PedigreeSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const chance = (id: string) =>
    rep.known(id) ? chanceText(rep.shown(id), toFraction) : undefined;
  const sym = (id: string) => rep.variable(id).symbol;
  const child = spec.child;
  const gens = [...new Set(spec.people.map((p) => p.generation))].length + (child ? 1 : 0);
  const height = TOP + (gens - 1) * ROW + 62;
  // The caption works the child's chance from the parents'.
  const parentIds = child ? child.parents.map((p) => spec.chances?.[p]) : [];
  const known = (xs: (string | undefined)[]): xs is string[] =>
    xs.every((x) => x !== undefined && rep.known(x));
  const caption = [
    ...(child && known(parentIds) && parentIds.length === 2
      ? [
          `${sym(child.chance)} = ${parentIds.map(sym).join(' × ')} × 1/4`,
          `${sym(child.chance)} = ${parentIds.map((id) => chance(id)).join(' × ')} × 1/4${
            rep.known(child.chance)
              ? ` = ${chance(child.chance)}${
                  toFraction(rep.shown(child.chance), 1000)
                    ? ` ≈ ${Number(rep.shown(child.chance).toPrecision(3))}`
                    : ''
                }`
              : ''
          }`,
          'Both parents must be carriers, and then a child is aa one time in 4.',
        ]
      : ['The child’s chance is the parents’ carrier chances × 1/4.']),
  ].join(' · ');
  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w }) => {
          const lay = pedigreeLayout(spec.people, w, {
            top: TOP,
            rowH: ROW,
            left: LEFT,
            right: 10,
          });
          const size = Math.min(30, lay.slot * 0.4);
          const kid = child
            ? (() => {
                const [a, b] = child.parents.map((id) => lay.place.get(id));
                if (!a || !b) return undefined;
                return { x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) + ROW, a, b };
              })()
            : undefined;
          const labelAt = (x: number, y: number, text: string, bold = false) => (
            <ChartText
              key={`${x},${y}`}
              {...fitLabel(x, text, chart.value, w)}
              y={y}
              fontSize={chart.value}
              fontWeight={bold ? '700' : '600'}
              fill={c.chartHighlight}
            >
              {text}
            </ChartText>
          );
          const rows = lay.gens.length + (kid ? 1 : 0);
          return (
            <Svg width={w} height={height}>
              {Array.from({ length: rows }, (_, i) => (
                <ChartText
                  key={i}
                  x={4}
                  y={TOP + i * ROW + 5}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.chartMuted}
                >
                  {ROMAN[i] ?? String(i + 1)}
                </ChartText>
              ))}
              <PedigreeLines
                people={spec.people}
                place={lay.place}
                couples={lay.couples}
                size={size}
                ink={c.chartInk}
                paper={c.card}
                carriers={!!spec.carriers}
              />
              {spec.people.map((p) => {
                const at = lay.place.get(p.id)!;
                const id = spec.chances?.[p.id];
                const t = id ? chance(id) : undefined;
                return (
                  <G key={p.id}>
                    <ChartText
                      x={at.x}
                      y={at.y + size / 2 + 15}
                      fontSize={chart.label}
                      textAnchor="middle"
                      fill={c.chartMuted}
                    >
                      {String(at.n)}
                    </ChartText>
                    {id && t ? labelAt(at.x, at.y + size / 2 + 32, `${sym(id)} = ${t}`) : null}
                  </G>
                );
              })}
              {kid && child ? (
                <G>
                  {/* The couple's line (drawn here too when the family lists no partner). */}
                  <Line
                    x1={Math.min(kid.a.x, kid.b.x) + size / 2}
                    y1={kid.a.y}
                    x2={Math.max(kid.a.x, kid.b.x) - size / 2}
                    y2={kid.b.y}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  <Line
                    x1={kid.x}
                    y1={kid.a.y}
                    x2={kid.x}
                    y2={kid.y - size / 2 - 2}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  <Path
                    d={`M ${kid.x} ${kid.y - size / 2 - 2} l ${size / 2 + 2} ${size / 2 + 2} l ${-size / 2 - 2} ${size / 2 + 2} l ${-size / 2 - 2} ${-size / 2 - 2} z`}
                    fill={c.card}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                  />
                  <ChartText
                    x={kid.x}
                    y={kid.y + 5}
                    fontSize={chart.emphasis}
                    fontWeight="700"
                    textAnchor="middle"
                    fill={c.chartHighlight}
                  >
                    ?
                  </ChartText>
                  {chance(child.chance)
                    ? labelAt(
                        kid.x,
                        kid.y + size / 2 + 22,
                        `${sym(child.chance)} = ${chance(child.chance)}`,
                        true,
                      )
                    : null}
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
