import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import type { SequenceLayout as Spec } from '@/data/modules/layouts';
import { font, radius, space, usePalette } from '@/theme';

/** The stages in a fixed mixed-up order (never the right one), from the page id. */
function mixed(n: number, seedText: string): number[] {
  let seed = [...seedText].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 100003, 3);
  const order = Array.from({ length: n }, (_, i) => i);
  do {
    for (let i = n - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [order[i], order[j]] = [order[j]!, order[i]!];
    }
  } while (n > 1 && order.every((x, i) => x === i));
  return order;
}

/**
 * Stages to put in order: tap the one that comes first, then the next. A wrong tap says so.
 * Placed stages form a strip with each one's span, and the spans add up under it.
 */
export function SequenceLayout({ spec }: { spec: Spec }) {
  const c = usePalette();
  const order = useMemo(() => mixed(spec.stages.length, spec.id), [spec]);
  const [placed, setPlaced] = useState(0);
  const [hint, setHint] = useState('');
  const done = placed === spec.stages.length;
  const total = spec.stages.slice(0, placed).reduce((sum, s) => sum + (s.span ?? 0), 0);
  const withSpans = spec.stages.some((s) => s.span !== undefined);

  const tap = (i: number) => {
    if (i === placed) {
      setPlaced(placed + 1);
      setHint('');
    } else {
      setHint(
        placed === 0
          ? `Not yet. Which comes first?`
          : `Not yet. What comes after ${spec.stages[placed - 1]!.label.toLowerCase()}?`,
      );
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.question, { color: c.text }]}>{spec.question}</Text>
      {/* The stages still to place, in a mixed-up order. */}
      <View style={styles.pool}>
        {done ? (
          <Text style={[styles.done, { color: c.text }]}>In order!</Text>
        ) : (
          order
            .filter((i) => i >= placed)
            .map((i) => (
              <Pressable
                key={i}
                testID={`stage-${i}`}
                accessibilityRole="button"
                onPress={() => tap(i)}
                style={[styles.chip, { borderColor: c.border, backgroundColor: c.card }]}
              >
                <Text style={[styles.chipText, { color: c.text }]}>{spec.stages[i]!.label}</Text>
              </Pressable>
            ))
        )}
      </View>
      {hint ? <Text style={[styles.hint, { color: c.textMuted }]}>{hint}</Text> : null}
      {/* The strip so far. */}
      <View style={styles.strip}>
        {spec.stages.map((stage, i) => (
          <View
            key={stage.label}
            style={[
              styles.slot,
              {
                borderColor: i < placed ? c.chartInk : c.chartGrid,
                backgroundColor: i < placed ? c.chartFill : c.surface,
                borderStyle: i < placed ? 'solid' : 'dashed',
              },
            ]}
          >
            <Text style={[styles.slotNumber, { color: c.textMuted }]}>{i + 1}</Text>
            <Text style={[styles.slotText, { color: c.text }]}>
              {i < placed ? stage.label : '?'}
            </Text>
            {withSpans && i < placed && stage.span !== undefined ? (
              <Text style={[styles.span, { color: c.text }]}>
                {`${stage.span} ${spec.unit ?? ''}`.trim()}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
      {withSpans && placed > 0 && spec.totalLabel ? (
        <Text style={[styles.total, { color: c.text }]}>
          {`${spec.stages
            .slice(0, placed)
            .map((s) => s.span)
            .join(' + ')} = ${total} ${spec.unit ?? ''}`.trim()}
          {done ? `. ${spec.totalLabel}: ${total} ${spec.unit ?? ''}`.trimEnd() : ''}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Button
          label="Start again"
          variant="link"
          testID="sequence-reset"
          onPress={() => {
            setPlaced(0);
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
  pool: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: 44,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  chipText: { fontSize: font.body },
  done: { fontSize: font.title, fontWeight: '700' },
  hint: { fontSize: font.caption + 1, textAlign: 'center' },
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
  slot: {
    minWidth: 96,
    flexGrow: 1,
    flexBasis: 96,
    maxWidth: 160,
    minHeight: 64,
    padding: space.sm,
    borderWidth: 1.5,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: 2,
  },
  slotNumber: { fontSize: font.caption, fontWeight: '600' },
  slotText: { fontSize: font.body - 1, fontWeight: '600', textAlign: 'center' },
  span: { fontSize: font.caption + 1, fontVariant: ['tabular-nums'] },
  total: { fontSize: font.body + 1, fontWeight: '700', textAlign: 'center' },
  actions: { alignItems: 'center' },
});
