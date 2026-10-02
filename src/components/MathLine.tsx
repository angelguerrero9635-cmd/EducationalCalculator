import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';

import { Text } from '@/components/Text';
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
  // What a screen reader says: "Σ from k = 1 to 8 of …" reads "the sum from k = 1 to 8 of …".
  const spoken = spokenMath(`${text}${after ?? ''}`);
  if (tex === undefined)
    return (
      <Text
        style={style}
        {...(spoken !== `${text}${after ?? ''}` ? { accessibilityLabel: spoken } : {})}
      >
        {after ? `${text}${after}` : text}
      </Text>
    );
  const flat = StyleSheet.flatten(style) ?? {};
  const size = flat.fontSize ?? font.body;
  return (
    <View style={styles.line} accessible accessibilityLabel={spoken}>
      {[...splitLine(tex), ...(after ? [{ t: 'text' as const, s: after }] : [])].flatMap(
        (piece, i) =>
          piece.t === 'text'
            ? // Word by word, so a long line wraps like text.
              (piece.s.match(/\S+\s*|\s+/g) ?? []).map((word, k) => (
                <Text key={`${i}-${k}`} style={style}>
                  {word}
                </Text>
              ))
            : [<MathNodes key={i} nodes={piece.nodes} style={style} size={size} />],
      )}
    </View>
  );
}

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
        ) : n.t === 'sum' ? (
          // Σ with its upper limit above and its lower limit below, then its body.
          <View key={i} style={styles.row}>
            <View style={styles.sum}>
              <MathNodes nodes={n.upper} style={style} size={size * 0.65} />
              <Text style={[at(size * 1.5), styles.sigma]}>Σ</Text>
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
