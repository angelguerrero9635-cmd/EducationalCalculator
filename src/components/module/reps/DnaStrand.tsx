/**
 * H36 `dnaStrand` (group HG): a DNA ladder from a base sequence. The template strand on top with
 * its sugar–phosphate backbone, the complementary strand under it, two hydrogen bonds per A–T
 * rung and three per G–C; then the mRNA transcribed from the template (U for T), its codons
 * bracketed and numbered, and each codon's amino acid from the standard table. A mutation is
 * lit where it happens and the protein is shown before and after. Chargaff mode draws a ladder
 * of whole pairs with A = T and G = C. Bases in the usual trace colors: A green, T red, G yellow,
 * C blue, U purple. Values are typed: no handles.
 */
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { geneShown } from '@/data/modules/typesHs2e';
import type { DnaStrandSpec } from '@/data/modules/typesHsg';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import {
  chargaffPairs,
  CODON_TABLE,
  complement,
  effectOf,
  mutate,
  readFrom,
  transcribe,
  translate,
  type Mutation,
} from './dnaMath';

const W = 360;
const X0 = 52;

const baseColor = (b: string, c: Palette) =>
  b === 'A' ? c.dnaA : b === 'T' ? c.dnaT : b === 'G' ? c.dnaG : b === 'C' ? c.dnaC : c.dnaU;

export function DnaStrand({ spec, calc }: { spec: DnaStrandSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.val(x);
  const known = (x: string | number | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);

  // Chargaff's rule: a ladder of whole pairs.
  if (spec.percentA !== undefined) {
    const pairs = spec.pairs ?? 10;
    const pct = num(spec.percentA) ?? 0;
    const ladder = chargaffPairs(pct, pairs);
    const ok = !!ladder && known(spec.percentA);
    const drawn = ladder ?? chargaffPairs(50, pairs)!;
    const count = (b: string) => drawn.flat().filter((x) => x === b).length;
    const H = 140;
    return (
      <>
        <Canvas aspect={H / W}>
          {({ w, h }) => (
            <Svg width={w} height={h}>
              <G transform={`scale(${w / W})`} opacity={ok ? 1 : 0.35}>
                <Ladder top={drawn.map((p) => p[0]).join('')} y={14} c={c} />
                {ok ? (
                  <ChartText
                    x={W / 2}
                    y={H - 8}
                    fontSize={chart.value}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {`A ${count('A')} · T ${count('T')} · G ${count('G')} · C ${count('C')} of ${2 * pairs} bases`}
                  </ChartText>
                ) : null}
              </G>
            </Svg>
          )}
        </Canvas>
        <Caption>
          {ok
            ? `A pairs with T and G with C, so A = T = ${fmt(pct)}% and G = C = ${fmt((100 - 2 * pct) / 2)}%: ${count('A')} of each of A and T and ${count('G')} of each of G and C in ${2 * pairs} bases.`
            : known(spec.percentA)
              ? `${fmt(pct)}% of ${2 * pairs} bases is not a whole number of bases (or is past 50%), so the ladder can’t show it.`
              : 'Type the percent of A to build the ladder.'}
        </Caption>
      </>
    );
  }

  const full = spec.sequence ?? '';
  // H100 `gene`: a long gene drawn as its first bases, "…" and its stop codon.
  const geneBases = spec.gene ? Math.max(6, Math.round(num(spec.gene.bases) ?? 6)) : undefined;
  const long =
    spec.gene && geneBases !== undefined ? geneShown(full, spec.gene, geneBases) : undefined;
  const gap = long?.gap ?? -1;
  const len = long
    ? long.template.length
    : Math.max(0, Math.min(12, Math.round(num(spec.length) ?? full.length)));
  const template = long ? long.template : full.slice(0, len);
  const m = spec.mutation;
  // The mutation is made only where its place is known (never at the example's place behind a "?").
  const at = m && known(m.at) ? Math.round(num(m.at) ?? 1) : undefined;
  const mut: Mutation | undefined =
    m && at !== undefined ? { type: m.type, at, base: m.base } : undefined;
  const shown = mut ? mutate(template, mut) : template;
  const show = spec.show ?? ['mrna', 'protein'];
  const mrna = transcribe(shown);
  const effect = mut ? effectOf(template, mut) : undefined;
  // H109: no protein when the start codon is lost; read from the moved start after an insertion
  // before base 1.
  const from = readFrom(effect);
  const protein = effect === 'start-lost' ? [] : translate(mrna.slice(from));
  const before = mut ? translate(transcribe(template)) : undefined;
  const bw = Math.min(26, (W - X0 - 8) / Math.max(1, shown.length + (gap >= 0 ? 1 : 0)));
  const x = (i: number) => X0 + (i + (gap >= 0 && i >= gap ? 1 : 0)) * bw;
  /** Where codon k's bases start on the drawing, from the read start. */
  const xr = (i: number) => x(i + from);
  /** The "…" standing for the gene's middle, in a row at y. */
  const dots = (y: number) =>
    gap >= 0 ? (
      <ChartText
        x={x(gap - 1) + 1.5 * bw}
        y={y}
        fontSize={chart.emphasis}
        fontWeight="800"
        textAnchor="middle"
      >
        …
      </ChartText>
    ) : null;
  const litAt = mut ? mut.at - 1 : -1;
  const ladderH = 118;
  const rnaY = ladderH + 20;
  const protY = rnaY + 60;
  const rows = show.includes('protein') ? (before ? 2 : 1) : 0;
  const H = (show.includes('mrna') ? protY : ladderH + 10) + rows * 30 + 6;
  const allKnown = known(spec.length) && (!m || known(m.at)) && known(spec.gene?.bases);
  const changed = (i: number) =>
    !!before &&
    (before[i]?.aa !== protein[i]?.aa || (before[i] === undefined) !== (protein[i] === undefined));

  return (
    <>
      <Canvas aspect={H / W}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <G transform={`scale(${w / W})`} opacity={allKnown ? 1 : 0.4}>
              <Ladder
                top={shown}
                y={14}
                c={c}
                bw={bw}
                lit={mut?.type === 'deletion' ? -1 : litAt}
                gap={gap}
              />
              {mut?.type === 'deletion' ? (
                // Where the base was taken out: a caret between its neighbors.
                <G>
                  <Path d={`M ${x(litAt)} 20 l -5 -8 h 10 Z`} fill={c.chartHighlight} />
                  <ChartText
                    x={x(litAt)}
                    y={10}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="middle"
                    fill={c.chartHighlight}
                  >
                    {`${template[litAt] ?? ''} deleted`}
                  </ChartText>
                </G>
              ) : null}
              {show.includes('mrna') ? (
                <G>
                  <ChartText
                    x={4}
                    y={rnaY - 6}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.chartMuted}
                  >
                    mRNA 5′ (from the template)
                  </ChartText>
                  {dots(rnaY + 15)}
                  {[...mrna].map((b, i) => (
                    <Base
                      key={i}
                      x={x(i)}
                      y={rnaY}
                      w={bw}
                      b={b}
                      lit={i === litAt && mut?.type !== 'deletion'}
                      c={c}
                    />
                  ))}
                  {protein.map((p, k) => {
                    const x1 = xr(3 * k) + 2;
                    const x2 = xr(3 * k + 2) + bw - 2;
                    return (
                      <G key={k}>
                        <Path
                          d={`M ${x1} ${rnaY + 26} v 5 H ${x2} v -5`}
                          stroke={c.chartInk}
                          strokeWidth={1.2}
                          fill="none"
                        />
                        <ChartText
                          x={(x1 + x2) / 2}
                          y={rnaY + 44}
                          fontSize={chart.label}
                          textAnchor="middle"
                          fill={c.chartMuted}
                        >
                          {p.codon}
                        </ChartText>
                      </G>
                    );
                  })}
                </G>
              ) : null}
              {show.includes('protein') ? (
                <G>
                  {dots(protY + 16)}
                  {before ? (
                    <ProteinRow label="Before" chain={before} y={protY} x={x} bw={bw} c={c} />
                  ) : null}
                  <ProteinRow
                    label={before ? 'After' : 'Protein'}
                    chain={protein}
                    y={protY + (before ? 30 : 0)}
                    x={xr}
                    bw={bw}
                    c={c}
                    lit={changed}
                  />
                  {effect === 'start-lost' ? (
                    <ChartText
                      x={X0 + 4}
                      y={protY + 30 + 15.5}
                      fontSize={chart.value}
                      fontWeight="700"
                      fill={c.chartHighlight}
                    >
                      No protein: the start codon is gone
                    </ChartText>
                  ) : null}
                </G>
              ) : null}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>
        {geneBases !== undefined
          ? geneCaption(geneBases, protein, known(spec.gene?.bases), spec, rep)
          : captionOf(template, shown, protein, mut, effect, spec, rep)}
      </Caption>
    </>
  );
}

const fmt = (x: number) => String(Math.round(x * 100) / 100);

/** A long gene: b bases, b ÷ 3 codons, the last the stop, so b ÷ 3 − 1 amino acids. */
function geneCaption(
  b: number,
  protein: { aa: string }[],
  ok: boolean,
  spec: DnaStrandSpec,
  rep: ReturnType<typeof useRep>,
): string {
  if (!ok) return 'Type the bases in the gene to read it.';
  const c = b / 3;
  const codons = spec.codons && rep.known(spec.codons) ? ` ${rep.named(spec.codons)}.` : '';
  const first = protein.filter((p) => p.aa !== 'Stop').map((p) => p.aa);
  const chain = b > 15 ? `${first.join('–')}, and on to the stop` : first.join('–');
  return `${formatNumber(b)} bases ÷ 3 = ${formatNumber(c)} codons.${codons} The last is the stop codon, so the chain has ${formatNumber(c)} − 1 = ${formatNumber(c - 1)} amino acids: ${chain}.`;
}

function captionOf(
  template: string,
  shown: string,
  protein: { codon: string; aa: string }[],
  mut: Mutation | undefined,
  effect: string | undefined,
  spec: DnaStrandSpec,
  rep: ReturnType<typeof useRep>,
): string {
  const chain = protein.map((p) => p.aa).join('–');
  const codons = spec.codons && rep.known(spec.codons) ? ` ${rep.named(spec.codons)}.` : '';
  if (!mut) {
    return `${shown.length} bases make ${Math.floor(shown.length / 3)} codons.${codons} Template ${template} → mRNA ${transcribe(template)} → ${chain || 'no complete codon yet'}.`;
  }
  const where = `base ${mut.at}, codon ${Math.ceil(mut.at / 3)}`;
  const k = Math.ceil(mut.at / 3) - 1;
  const oldCodon = transcribe(template).slice(3 * k, 3 * k + 3);
  const newCodon = transcribe(shown).slice(3 * k, 3 * k + 3);
  if (effect === 'start-lost')
    return `${mut.type === 'insertion' ? 'An' : 'A'} ${mut.type} at ${where}. Start lost: the start codon AUG becomes ${transcribe(shown).slice(0, 3)}, so the ribosome can’t start here and no protein is made.`;
  if (effect === 'before-start')
    return `An insertion before base 1, ahead of the start codon. The ribosome still starts at AUG, one base later, so the protein is the same: ${chain}.`;
  if (effect === 'stop-lost')
    return `A substitution at ${where}. Stop lost: the stop codon ${oldCodon} becomes ${newCodon} (${CODON_TABLE[newCodon] ?? '?'}), so the ribosome reads on past the gene’s end and the protein comes out too long: ${chain}, and on.`;
  const what =
    effect === 'silent'
      ? 'Silent: the new codon codes for the same amino acid.'
      : effect === 'missense'
        ? 'Missense: one amino acid changes.'
        : effect === 'nonsense'
          ? 'Nonsense: the codon becomes a stop, so the protein is cut short.'
          : effect === 'frameshift'
            ? `Frameshift: every codon from there on is read in a new frame.`
            : 'The change is past the stop codon, so the protein is the same.';
  const article = mut.type === 'insertion' ? 'An' : 'A';
  return `${article} ${mut.type} at ${where}. ${what} Now ${chain}.`;
}

/** One base: a colored block with its letter; lit with a ring. */
function Base({
  x,
  y,
  w,
  b,
  lit,
  c,
}: {
  x: number;
  y: number;
  w: number;
  b: string;
  lit?: boolean;
  c: Palette;
}) {
  return (
    <G>
      <Rect
        x={x + 1}
        y={y}
        width={w - 2}
        height={20}
        rx={3}
        fill={baseColor(b, c)}
        stroke={c.chartInk}
        strokeWidth={0.8}
      />
      <ChartText
        x={x + w / 2}
        y={y + 14.5}
        fontSize={chart.value}
        fontWeight="800"
        textAnchor="middle"
        fill={c.bioInk}
      >
        {b}
      </ChartText>
      {lit ? (
        <Rect
          x={x - 1.5}
          y={y - 3}
          width={w + 3}
          height={26}
          rx={5}
          fill="none"
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeHeavy}
        />
      ) : null}
    </G>
  );
}

/** Two strands: backbones, bases facing each other, and 2 or 3 hydrogen bonds per rung. */
function Ladder({
  top,
  y,
  c,
  bw = Math.min(26, (W - X0 - 8) / Math.max(1, top.length)),
  lit = -1,
  gap = -1,
}: {
  top: string;
  y: number;
  c: Palette;
  bw?: number;
  lit?: number;
  /** H100: a gap before base `gap` with "…" (a long gene's middle). */
  gap?: number;
}) {
  const bottom = complement(top);
  const x = (i: number) => X0 + (i + (gap >= 0 && i >= gap ? 1 : 0)) * bw;
  const end = x(top.length - 1) + bw;
  const rail = (yy: number) => (
    <G>
      <Line
        x1={X0}
        y1={yy}
        x2={end}
        y2={yy}
        stroke={c.dnaBackbone}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {[...top].map((_, i) => (
        <Circle key={i} cx={x(i) + bw / 2} cy={yy} r={2.6} fill={c.bioPhosphate} />
      ))}
    </G>
  );
  const topY = y + 14;
  const botY = topY + 20 + 24;
  return (
    <G>
      {gap >= 0
        ? [topY + 15, botY + 15].map((yy) => (
            <ChartText
              key={yy}
              x={x(gap - 1) + 1.5 * bw}
              y={yy}
              fontSize={chart.emphasis}
              fontWeight="800"
              textAnchor="middle"
            >
              …
            </ChartText>
          ))
        : null}
      <ChartText x={4} y={y} fontSize={chart.label} fontWeight="700" fill={c.chartMuted}>
        {'3′'}
      </ChartText>
      <ChartText x={4} y={botY + 38} fontSize={chart.label} fontWeight="700" fill={c.chartMuted}>
        {'5′'}
      </ChartText>
      <ChartText
        x={end}
        y={y}
        fontSize={chart.label}
        fontWeight="700"
        textAnchor="end"
        fill={c.chartMuted}
      >
        template strand
      </ChartText>
      <ChartText
        x={end}
        y={botY + 38}
        fontSize={chart.label}
        fontWeight="700"
        textAnchor="end"
        fill={c.chartMuted}
      >
        complementary strand
      </ChartText>
      {rail(topY - 5)}
      {rail(botY + 25)}
      {[...top].map((b, i) => {
        const bonds = b === 'G' || b === 'C' ? 3 : 2;
        return (
          <G key={i}>
            {Array.from({ length: bonds }, (_, k) => {
              const xx = x(i) + bw / 2 + (k - (bonds - 1) / 2) * 4;
              return (
                <Line
                  key={k}
                  x1={xx}
                  y1={topY + 21}
                  x2={xx}
                  y2={botY - 1}
                  stroke={c.chartMuted}
                  strokeWidth={1.2}
                  strokeDasharray="2 2"
                />
              );
            })}
            <Base x={x(i)} y={topY} w={bw} b={b} lit={i === lit} c={c} />
            <Base x={x(i)} y={botY} w={bw} b={bottom[i]!} c={c} />
          </G>
        );
      })}
    </G>
  );
}

/** Amino acids as chips, one under each codon; Stop in outline. */
function ProteinRow({
  label,
  chain,
  y,
  x,
  bw,
  c,
  lit,
}: {
  label: string;
  chain: { aa: string }[];
  y: number;
  x: (i: number) => number;
  bw: number;
  c: Palette;
  lit?: (i: number) => boolean;
}) {
  return (
    <G>
      <ChartText x={4} y={y + 15} fontSize={chart.label} fontWeight="700" fill={c.chartMuted}>
        {label}
      </ChartText>
      {chain.map((p, k) => {
        const x1 = x(3 * k) + 3;
        const wd = 3 * bw - 6;
        const stop = p.aa === 'Stop';
        const on = lit?.(k);
        return (
          <G key={k}>
            <Rect
              x={x1}
              y={y}
              width={wd}
              height={22}
              rx={11}
              fill={stop ? c.card : on ? c.chartHighlight : c.bioAmino}
              stroke={on ? c.chartHighlight : c.chartInk}
              strokeWidth={on ? chart.strokeHeavy : 1}
            />
            <ChartText
              x={x1 + wd / 2}
              y={y + 15.5}
              fontSize={chart.value}
              fontWeight="700"
              textAnchor="middle"
              fill={stop ? c.chartInk : on ? c.onChartHighlight : c.bioInk}
            >
              {p.aa}
            </ChartText>
          </G>
        );
      })}
    </G>
  );
}
