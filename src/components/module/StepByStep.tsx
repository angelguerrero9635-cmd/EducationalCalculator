import { StyleSheet, Text, View } from 'react-native';

import { buildSteps } from '@/data/modules/buildSteps';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from './useCalculator';

/** Live walkthrough of how the current values were found from the entered ones. */
export function StepByStep({ calc }: { calc: Calculator }) {
  const c = usePalette();
  const w = buildSteps(calc.module, calc.result);
  const card = [styles.card, { backgroundColor: c.surface, borderColor: c.border }];
  const list = (qs: typeof w.given) =>
    qs.map((q) => `${q.symbol} = ${q.value}`).join(',  ') || 'nothing yet';

  return (
    <View style={styles.container} testID="step-by-step">
      <View style={card}>
        <Text style={[styles.label, { color: c.textMuted }]}>GIVEN</Text>
        <Text style={[styles.math, { color: c.text }]}>{list(w.given)}</Text>
        {w.find.length ? (
          <>
            <Text style={[styles.label, { color: c.textMuted }]}>FIND</Text>
            <Text style={[styles.math, { color: c.text }]}>
              {w.find.map((q) => `${q.name} (${q.symbol})`).join(', ')}
            </Text>
          </>
        ) : null}
      </View>

      {w.steps.map((s, i) => (
        <View key={s.id} style={card}>
          <Text style={[styles.stepTitle, { color: c.text }]}>{`Step ${i + 1} · ${s.title}`}</Text>
          <Text style={[styles.body, { color: c.text }]}>
            Use <Text style={styles.bold}>{s.formula}</Text>
          </Text>
          <Text style={[styles.body, { color: c.textMuted }]}>{s.how}</Text>
          <View style={[styles.lines, { borderLeftColor: c.border }]}>
            {s.rearranged ? (
              <Text style={[styles.math, { color: c.text }]}>{s.rearranged}</Text>
            ) : null}
            {s.substituted ? (
              <Text style={[styles.math, { color: c.text }]}>{s.substituted}</Text>
            ) : null}
            <Text style={[styles.math, styles.bold, { color: c.text }]}>{s.result}</Text>
          </View>
        </View>
      ))}

      {w.steps.length === 0 && w.missing.length === 0 ? (
        <Text style={[styles.body, styles.pad, { color: c.textMuted }]}>
          Every value was entered, so there is nothing to solve. The check below shows whether they
          fit together.
        </Text>
      ) : null}

      {w.missing.length ? (
        <View style={card}>
          <Text style={[styles.stepTitle, { color: c.text }]}>Next</Text>
          <Text style={[styles.body, { color: c.textMuted }]}>
            {`Not enough information yet. Enter another value (${w.missing
              .map((q) => q.symbol)
              .join(', ')}) to keep solving.`}
          </Text>
        </View>
      ) : null}

      {w.check.length ? (
        <View style={card}>
          <Text style={[styles.stepTitle, { color: c.text }]}>Check</Text>
          <Text style={[styles.body, { color: c.textMuted }]}>
            Put the numbers back into each formula. Both sides should match.
          </Text>
          {w.check.map((k) => (
            <Text key={k.formula} style={[styles.math, { color: c.text }]}>
              {`${k.formula}   ${k.ok ? '✓' : '✗'}`}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, gap: space.md },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs + 2,
  },
  label: { fontSize: font.caption, fontWeight: '600', letterSpacing: 0.5 },
  stepTitle: { fontSize: font.body, fontWeight: '700' },
  body: { fontSize: font.body - 1, lineHeight: 21 },
  bold: { fontWeight: '700' },
  math: { fontSize: font.body, fontVariant: ['tabular-nums'], lineHeight: 22 },
  lines: { borderLeftWidth: 3, paddingLeft: space.md, marginTop: space.xs, gap: 2 },
  pad: { paddingHorizontal: space.xs },
});
