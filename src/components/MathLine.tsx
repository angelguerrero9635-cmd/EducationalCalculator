import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';

import { Text } from '@/components/Text';
import { keepNumbersWhole } from '@/engine/format';
import {
  splitLine,
  spokenMath,
  toLatex,
  withoutOuterBrackets,
  type LatexOptions,
  type MathBand,
  type MathNode,
} from '@/engine/latex';
import { font } from '@/theme';

/**
 * One line of step text, with its math typeset: fractions stacked, powers raised, square roots
 * under a bar (a LaTeX subset drawn here, see `engine/latex.ts`). A line with nothing to
 * typeset is plain text, exactly as before.
 */
export function MathLine({
  text,
  band,
  symbols,
  options,
  after,
  style,
}: {
  text: string;
  band: MathBand;
  /** The module's letters, drawn in italic from the Grade 6 letter pages on. */
  symbols?: string[];
  options?: LatexOptions;
  /** Plain text after the math on the same line (a Grade 6 formula's meaning in words). */
  after?: string;
  style?: StyleProp<TextStyle>;
}) {
  const tex = toLatex(text, band, symbols, options);
  // What a screen reader says: "Σ from k = 1 to 8 of …" reads "the sum from k = 1 to 8 of …",
  // ∫ "the integral from", ṁ "m dot", T_wall "T sub wall" (`spokenMath`).
  const spoken = spokenMath(`${text}${after ?? ''}`);
  if (tex === undefined)
    return (
      <Text
        style={style}
        {...(spoken !== `${text}${after ?? ''}` ? { accessibilityLabel: spoken } : {})}
      >
        {keepNumbersWhole(after ? `${text}${after}` : text)}
      </Text>
    );
  const flat = StyleSheet.flatten(style) ?? {};
  const size = flat.fontSize ?? font.body;
  const pieces = [...splitLine(tex), ...(after ? [{ t: 'text' as const, s: after }] : [])];
  return (
    <View style={styles.line} accessible accessibilityLabel={spoken}>
      {pieces.flatMap((piece, i) => {
        if (piece.t === 'math') {
          // A power of ten is drawn on the same line as its "4.7 ×" (HE-E10): never split.
          const lead = i > 0 && tenPower(piece.nodes) ? leadOf(pieces[i - 1]!) : undefined;
          const math = <MathNodes key={i} nodes={piece.nodes} style={style} size={size} />;
          return lead
            ? [
                <View key={i} style={styles.row}>
                  <Text style={style}>{lead}</Text>
                  {math}
                </View>,
              ]
            : [math];
        }
        // Word by word, so a long line wraps like text (a number and its "× 10" kept whole).
        const next = pieces[i + 1];
        const lead = next?.t === 'math' && tenPower(next.nodes) ? leadOf(piece) : undefined;
        const body = lead ? piece.s.slice(0, piece.s.length - lead.length) : piece.s;
        return (keepNumbersWhole(body).match(WORDS) ?? []).map((word, k) => (
          <Text key={`${i}-${k}`} style={style}>
            {word}
          </Text>
        ));
      })}
    </View>
  );
}

/** Words for wrapping: a no-break space (U+00A0) stays inside its word. */
const WORDS = /[^ \t\n]+[ \t\n]*|[ \t\n]+/g;

/** Math that starts with a power of ten (10⁻⁶ drawn raised). */
const tenPower = (nodes: MathNode[]) => {
  const first = nodes[0];
  return first?.t === 'sup' && first.base.length === 1 && plainText(first.base[0]!) === '10';
};
const plainText = (n: MathNode) => (n.t === 'text' ? n.s : '');

/** The "4.7 × " at the end of a text piece, kept with the power of ten after it. */
const leadOf = (piece: { t: string; s?: string }) =>
  piece.t === 'text' ? /(?:^|\s)(−?\d[\d,]*(?:\.\d+)? × )$/.exec(piece.s ?? '')?.[1] : undefined;

function MathNodes({
  nodes,
  style,
  size,
}: {
  nodes: MathNode[];
  style?: StyleProp<TextStyle>;
  size: number;
}) {
  const at = (s: number) => [style, { fontSize: s, lineHeight: Math.round(s * 1.25) }];
  return (
    <View style={styles.row}>
      {nodes.map((n, i) =>
        n.t === 'text' ? (
          <Text key={i} style={[at(size), n.italic && styles.italic]}>
            {n.s}
          </Text>
        ) : n.t === 'frac' ? (
          <View key={i} style={styles.frac}>
            <MathNodes
              nodes={withoutOuterBrackets(n.num)}
              style={style}
              size={size * (n.small ? 0.7 : 0.85)}
            />
            <View style={[styles.bar, { backgroundColor: StyleSheet.flatten(style)?.color }]} />
            <MathNodes
              nodes={withoutOuterBrackets(n.den)}
              style={style}
              size={size * (n.small ? 0.7 : 0.85)}
            />
          </View>
        ) : n.t === 'rep' ? (
          // A repeating decimal: the block under a bar (0.16̅).
          <View key={i} style={styles.row}>
            <Text style={at(size)}>{n.lead}</Text>
            <View style={[styles.repeat, { borderTopColor: StyleSheet.flatten(style)?.color }]}>
              <Text style={at(size)}>{n.block}</Text>
            </View>
          </View>
        ) : n.t === 'sum' || n.t === 'int' ? (
          // Σ (or ∫) with its upper limit above and its lower limit below, then its body.
          <View key={i} style={styles.row}>
            <View style={styles.sum}>
              <MathNodes nodes={n.upper} style={style} size={size * 0.65} />
              <Text style={[at(size * (n.t === 'int' ? 1.7 : 1.5)), styles.sigma]}>
                {n.t === 'int' ? '∫' : 'Σ'}
              </Text>
              <MathNodes nodes={n.lower} style={style} size={size * 0.65} />
            </View>
            <MathNodes nodes={n.body} style={style} size={size} />
          </View>
        ) : n.t === 'sup' ? (
          <View key={i} style={styles.row}>
            <MathNodes nodes={n.base} style={style} size={size} />
            <View style={{ alignSelf: 'flex-start', marginTop: -size * 0.1 }}>
              <MathNodes nodes={withoutOuterBrackets(n.exp)} style={style} size={size * 0.65} />
            </View>
          </View>
        ) : (
          <View key={i} style={styles.row}>
            <Text style={at(size)}>√</Text>
            <View style={[styles.radicand, { borderTopColor: StyleSheet.flatten(style)?.color }]}>
              <MathNodes nodes={withoutOuterBrackets(n.body)} style={style} size={size} />
            </View>
          </View>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  frac: { alignItems: 'center', marginHorizontal: 2, paddingVertical: 1 },
  bar: { height: 1.5, alignSelf: 'stretch', marginVertical: 1, minWidth: 10 },
  italic: { fontStyle: 'italic' },
  radicand: { borderTopWidth: 1.5, paddingHorizontal: 1, marginTop: 2 },
  repeat: { borderTopWidth: 1.5, marginTop: 2 },
  sum: { alignItems: 'center', marginRight: 3 },
  sigma: { marginVertical: -2 },
});
