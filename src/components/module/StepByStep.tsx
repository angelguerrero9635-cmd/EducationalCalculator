import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { buildSteps } from '@/data/modules/buildSteps';
import { font, radius, space, usePalette } from '@/theme';
import { isEarlyGrade } from '@/data/modules';

import type { Calculator } from './useCalculator';

/** Live walkthrough of how the current values were found from the entered ones. */
export function StepByStep({ calc }: { calc: Calculator }) {
  const c = usePalette();
  const w = buildSteps(calc.module, calc.result, calc.units);
  const sentence = isEarlyGrade(calc.module.id) ? 'number sentence' : 'formula';
  // Conversion steps (when needed) come first and last, numbered with the others.
  const offset = w.convertIn.length ? 1 : 0;
  const card = [styles.card, { backgroundColor: c.surface, borderColor: c.border }];
  const list = (qs: typeof w.given) =>
    qs.map((q) => `${q.symbol} = ${q.value}`).join(',  ') || 'nothing yet';

  return (
    <View style={styles.container} testID="step-by-step">
      <View style={card}>
        <Text style={[styles.label, { color: c.textMuted }]}>WE KNOW</Text>
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

      {w.convertIn.length ? (
        <View style={card}>
          <Text style={[styles.stepTitle, { color: c.text }]}>
            {`Step 1 · Convert to the ${sentence}’s units`}
          </Text>
          <Text style={[styles.body, { color: c.textMuted }]}>
            {`The ${sentence}s don’t work directly in the units you chose, so convert first (to ${w.workingUnits}).`}
          </Text>
          <View style={[styles.lines, { borderLeftColor: c.border }]}>
            {w.convertIn.map((line) => (
              <Text key={line} style={[styles.math, { color: c.text }]}>
                {line}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {w.steps.map((s, i) => (
        <View key={s.id} style={card}>
          <Text
            style={[styles.stepTitle, { color: c.text }]}
          >{`Step ${i + 1 + offset} · ${s.title}`}</Text>
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
            {s.work?.map((line, k) => (
              <Text key={k} style={[styles.math, { color: c.text }]}>
                {line}
              </Text>
            ))}
            <Text style={[styles.math, styles.bold, { color: c.text }]}>{s.result}</Text>
          </View>
        </View>
      ))}

      {w.convertOut.length ? (
        <View style={card}>
          <Text style={[styles.stepTitle, { color: c.text }]}>
            {`Step ${w.steps.length + offset + 1} · Convert the answers`}
          </Text>
          <Text style={[styles.body, { color: c.textMuted }]}>
            Change each answer back to the unit you chose.
          </Text>
          <View style={[styles.lines, { borderLeftColor: c.border }]}>
            {w.convertOut.map((line) => (
              <Text key={line} style={[styles.math, styles.bold, { color: c.text }]}>
                {line}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {w.steps.length === 0 && w.missing.length === 0 ? (
        <Text style={[styles.body, styles.pad, { color: c.textMuted }]}>
          You typed every number, so nothing is left to find. The check shows if they fit.
        </Text>
      ) : null}

      {w.missing.length ? (
        <View style={card}>
          <Text style={[styles.stepTitle, { color: c.text }]}>Next</Text>
          <Text style={[styles.body, { color: c.textMuted }]}>
            {`Type one more number (${w.missing.map((q) => q.symbol).join(', ')}) to keep going.`}
          </Text>
        </View>
      ) : null}

      {w.check.length ? (
        <View style={card}>
          <Text style={[styles.stepTitle, { color: c.text }]}>Check</Text>
          <Text style={[styles.body, { color: c.textMuted }]}>
            Put the numbers back in. Both sides should match.
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
