import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Written, WrittenCell } from '@/data/modules/written';
import { font, radius, space, usePalette } from '@/theme';

const CELL = 22;
const ROW = 26;

/**
 * Arithmetic set out the way it is written on paper: digits in columns, carries and regrouped
 * digits small above, crossed-out digits, a line under the last addend or under each product
 * taken away in long division. The data comes from `written.ts`; this only draws the grid.
 */
export function WrittenWork({ work }: { work: Written }) {
  const c = usePalette();
  return (
    <View
      style={[styles.box, { backgroundColor: c.background, borderColor: c.border }]}
      accessibilityLabel={work.says}
      testID="written-work"
    >
      {work.rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {Array.from({ length: work.width }, (_, i) => (
            <Cell key={i} cell={row[i]} />
          ))}
          {row.slice(work.width).map((cell, i) => (
            <Cell key={`n${i}`} cell={cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

function Cell({ cell }: { cell: WrittenCell | undefined }) {
  const c = usePalette();
  if (!cell) return <View style={styles.cell} />;
  return (
    <View
      style={[
        cell.wide ? styles.note : styles.cell,
        cell.underline ? { borderBottomWidth: 1.5, borderBottomColor: c.text } : null,
      ]}
    >
      <Text
        style={[
          styles.digit,
          { color: cell.muted ? c.textMuted : c.text },
          cell.small ? styles.small : null,
          cell.strike ? styles.strike : null,
        ]}
      >
        {cell.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    marginVertical: space.xs,
  },
  row: { flexDirection: 'row', alignItems: 'flex-end', height: ROW },
  cell: { width: CELL, height: ROW, alignItems: 'center', justifyContent: 'flex-end' },
  note: { height: ROW, justifyContent: 'flex-end', paddingLeft: space.md },
  digit: { fontSize: font.body + 2, lineHeight: ROW - 2, fontVariant: ['tabular-nums'] },
  small: { fontSize: font.caption, lineHeight: ROW - 2 },
  strike: { textDecorationLine: 'line-through' },
});
