import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import type { SortLayout as Spec } from '@/data/modules/layouts';
import { CardFigureView } from './CardFigure';
import { font, radius, space, usePalette } from '@/theme';

/** A stable shuffle from the card labels, so the page opens the same way every time. */
function shuffled<T>(items: T[], seedText: string): T[] {
  let seed = [...seedText].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 100003, 7);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Cards to sort into groups: tap a card, then tap the group it belongs in. A card in the
 * wrong group is sent back with a hint; each group shows its count, and its sentence about
 * the property once it is full.
 */
export function SortLayout({ spec }: { spec: Spec }) {
  const c = usePalette();
  const cards = useMemo(
    () =>
      shuffled(
        spec.cards.map((card, i) => ({ ...card, i })),
        spec.id,
      ),
    [spec],
  );
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [picked, setPicked] = useState<number | undefined>(undefined);
  const [hint, setHint] = useState('');
  const left = cards.filter((card) => placed[card.i] === undefined);
  const inBin = (binId: string) => cards.filter((card) => placed[card.i] === binId);
  const done = left.length === 0;

  const drop = (binId: string) => {
    if (picked === undefined) {
      setHint('Tap a card first.');
      return;
    }
    const card = cards.find((x) => x.i === picked)!;
    if (card.bin === binId) {
      setPlaced({ ...placed, [picked]: binId });
      setHint('');
    } else {
      setHint(`Look again at “${card.label}”. ${spec.question}`);
    }
    setPicked(undefined);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.question, { color: c.text }]}>{spec.question}</Text>
      {/* The cards still to sort. */}
      <View style={styles.cards}>
        {done ? (
          <Text style={[styles.done, { color: c.text }]}>All sorted!</Text>
        ) : (
          left.map((card) => (
            <Pressable
              key={card.i}
              testID={`card-${card.i}`}
              accessibilityRole="button"
              accessibilityState={{ selected: picked === card.i }}
              onPress={() => {
                setPicked(picked === card.i ? undefined : card.i);
                setHint('');
              }}
              style={[
                styles.card,
                {
                  borderColor: picked === card.i ? c.accent : c.border,
                  backgroundColor: picked === card.i ? c.accentSoft : c.card,
                },
              ]}
            >
              {card.figure ? (
                <CardFigureView figure={card.figure} ink={c.text} shade={c.chartHighlight} />
              ) : null}
              <Text style={[styles.cardText, { color: c.text }]}>{card.label}</Text>
            </Pressable>
          ))
        )}
      </View>
      {hint ? <Text style={[styles.hint, { color: c.textMuted }]}>{hint}</Text> : null}
      {/* The groups. */}
      <View style={styles.bins}>
        {spec.bins.map((bin) => {
          const here = inBin(bin.id);
          const full = here.length === spec.cards.filter((x) => x.bin === bin.id).length;
          return (
            <Pressable
              key={bin.id}
              testID={`bin-${bin.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${bin.label}: ${here.length}`}
              onPress={() => drop(bin.id)}
              style={[
                styles.bin,
                {
                  borderColor: picked !== undefined ? c.accent : c.border,
                  backgroundColor: c.surface,
                  borderStyle: picked !== undefined ? 'solid' : 'dashed',
                },
              ]}
            >
              <View style={styles.binHead}>
                <Text style={[styles.binLabel, { color: c.text }]}>{bin.label}</Text>
                <Text style={[styles.count, { color: c.accent }]}>{here.length}</Text>
              </View>
              {here.map((card) => (
                <Text key={card.i} style={[styles.inBin, { color: c.text }]}>
                  {card.label}
                </Text>
              ))}
              {full && here.length ? (
                <Text style={[styles.why, { color: c.textMuted }]}>{bin.why}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.actions}>
        <Button
          label="Start again"
          variant="link"
          testID="sort-reset"
          onPress={() => {
            setPlaced({});
            setPicked(undefined);
            setHint('');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: space.lg, gap: space.md },
  question: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: 44,
  },
  card: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  cardText: { fontSize: font.body },
  done: { fontSize: font.title, fontWeight: '700' },
  hint: { fontSize: font.caption + 1, textAlign: 'center' },
  bins: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  bin: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 96,
    padding: space.md,
    gap: space.xs,
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  binHead: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  binLabel: { fontSize: font.body, fontWeight: '700', flexShrink: 1 },
  count: { fontSize: font.body, fontWeight: '700', fontVariant: ['tabular-nums'] },
  inBin: { fontSize: font.body - 1 },
  why: { fontSize: font.caption + 1, marginTop: space.xs },
  actions: { alignItems: 'center' },
});
