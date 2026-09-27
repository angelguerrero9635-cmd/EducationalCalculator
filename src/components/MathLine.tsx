import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';

import { Text } from '@/components/Text';
import { splitLine, toLatex, type MathBand, type MathNode } from '@/engine/latex';
import { font } from '@/theme';

/**
 * One line of step text, with its math typeset: fractions stacked, powers raised, square roots
 * under a bar (a LaTeX subset drawn here, see `engine/latex.ts`). A line with nothing to
 * typeset is plain text, exactly as before.
 */
export function MathLine({
  text,
  band,
  style,
}: {
  text: string;
  band: MathBand;
  style?: StyleProp<TextStyle>;
}) {
  const tex = toLatex(text, band);
  if (tex === undefined) return <Text style={style}>{text}</Text>;
  const flat = StyleSheet.flatten(style) ?? {};
  const size = flat.fontSize ?? font.body;
  return (
    <View style={styles.line} accessible accessibilityLabel={text}>
      {splitLine(tex).flatMap((piece, i) =>
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
          <Text key={i} style={at(size)}>
            {n.s}
          </Text>
        ) : n.t === 'frac' ? (
          <View key={i} style={styles.frac}>
            <MathNodes nodes={n.num} style={style} size={size * (n.small ? 0.7 : 0.85)} />
            <View style={[styles.bar, { backgroundColor: StyleSheet.flatten(style)?.color }]} />
            <MathNodes nodes={n.den} style={style} size={size * (n.small ? 0.7 : 0.85)} />
          </View>
        ) : n.t === 'sup' ? (
          <View key={i} style={styles.row}>
            <MathNodes nodes={n.base} style={style} size={size} />
            <View style={{ alignSelf: 'flex-start', marginTop: -size * 0.1 }}>
              <MathNodes nodes={n.exp} style={style} size={size * 0.65} />
            </View>
          </View>
        ) : (
          <View key={i} style={styles.row}>
            <Text style={at(size)}>√</Text>
            <View style={[styles.radicand, { borderTopColor: StyleSheet.flatten(style)?.color }]}>
              <MathNodes nodes={n.body} style={style} size={size} />
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
  radicand: { borderTopWidth: 1.5, paddingHorizontal: 1, marginTop: 2 },
});
