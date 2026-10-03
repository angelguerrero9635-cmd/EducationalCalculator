/**
 * HC146 `codons` card figure (college, round 4 group I), 140 × 74: the mRNA codon strip before
 * (top) and after (bottom) a point mutation, each codon boxed with its amino acid under it (the
 * standard genetic code; nothing after a stop). The changed base is lit: the new base after a
 * substitution or an insertion, the lost one (struck) before a deletion. After an insertion or
 * a deletion the boxes regroup from the start, so the reading frame is seen to move; a base
 * left over at the end is unboxed. Flat.
 */
import { G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { CODONS_CARD_W, type CodonsCard } from '@/data/modules/typesHe4i';
import { chart, usePalette } from '@/theme';

import { mutateMrna, readStrip } from './codonsHe4iMath';

const PITCH = 9;
const GAP = 4;
const FONT = chart.label;

export function CodonsCardHe4i({ f, ink }: { f: CodonsCard; ink: string }) {
  const c = usePalette();
  const after = mutateMrna(f.mrna, f.change);
  const at = f.change.at - 1;
  const strip = (mrna: string, y: number, lit: number | undefined, struck: boolean) => {
    const codons = readStrip(mrna);
    const width = mrna.length * PITCH + Math.floor((mrna.length - 1) / 3) * GAP;
    const x0 = (CODONS_CARD_W - width) / 2;
    const xOf = (i: number) => x0 + i * PITCH + Math.floor(i / 3) * GAP + PITCH / 2;
    return (
      <G>
        {codons.map((cd, k) => (
          <G key={`c${k}`}>
            <Rect
              x={xOf(3 * k) - PITCH / 2 - 1}
              y={y - FONT + 1}
              width={3 * PITCH + 2}
              height={FONT + 4}
              rx={2}
              fill="none"
              stroke={ink}
              strokeWidth={0.8}
            />
            {cd.aa ? (
              <SvgText
                x={xOf(3 * k + 1)}
                y={y + FONT + 2}
                fontSize={FONT}
                textAnchor="middle"
                fill={cd.aa === 'Stop' ? c.chartHighlight : ink}
                fontWeight={cd.aa === 'Stop' ? '700' : '400'}
              >
                {cd.aa}
              </SvgText>
            ) : null}
          </G>
        ))}
        {lit !== undefined ? (
          <Rect
            x={xOf(lit) - PITCH / 2}
            y={y - FONT + 1}
            width={PITCH}
            height={FONT + 4}
            fill={c.chartHighlight}
            opacity={0.3}
          />
        ) : null}
        {[...mrna].map((b, i) => (
          <SvgText
            key={i}
            x={xOf(i)}
            y={y}
            fontSize={FONT}
            fontWeight="700"
            textAnchor="middle"
            fill={i === lit ? c.chartHighlight : ink}
          >
            {b}
          </SvgText>
        ))}
        {struck && lit !== undefined ? (
          <Line
            x1={xOf(lit) - 4}
            y1={y - 4}
            x2={xOf(lit) + 4}
            y2={y - 4}
            stroke={c.chartHighlight}
            strokeWidth={1.5}
          />
        ) : null}
      </G>
    );
  };
  const type = f.change.type;
  return (
    <G>
      {strip(f.mrna, 14, type === 'insertion' ? undefined : at, type === 'deletion')}
      <Line
        x1={6}
        y1={36}
        x2={CODONS_CARD_W - 6}
        y2={36}
        stroke={ink}
        strokeWidth={0.5}
        opacity={0.5}
      />
      {strip(after, 54, type === 'deletion' ? undefined : at, false)}
    </G>
  );
}
