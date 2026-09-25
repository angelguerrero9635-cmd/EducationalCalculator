import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { buildSteps } from '@/data/modules/buildSteps';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from './useCalculator';

/**
 * Live walkthrough of how the current values were found from the entered ones. The wording
 * for the grade (names or letters, which lines to show) comes from `buildSteps`, so the text
 * here is exactly what the reviewer's dump shows.
 */
export function StepByStep({ calc }: { calc: Calculator }) {
  const c = usePalette();
  const w = buildSteps(calc.module, calc.result, calc.units);
  const early = w.band === 'early';
  const sentence = early ? 'number sentence' : 'formula';
  // Conversion steps (when needed) come first and last, numbered with the others.
  const offset = w.convertIn.length ? 1 : 0;
  const card = [styles.card, { backgroundColor: c.surface, borderColor: c.border }];
  // Letters go on one line; names (K–5) one per line.
  const list = (qs: typeof w.given) =>
    (w.band === 'standard'
      ? qs.map((q) => q.label).join(',  ')
      : qs.map((q) => q.label).join('\n')) || 'nothing yet';

  return (
    <View style={styles.container} testID="step-by-step">
      <View style={card}>
        <Text style={[styles.label, { color: c.textMuted }]}>WE KNOW</Text>
        <Text style={[styles.math, { color: c.text }]}>{list(w.given)}</Text>
        {w.find.length ? (
          <>
            <Text style={[styles.label, { color: c.textMuted }]}>FIND</Text>
            <Text style={[styles.math, { color: c.text }]}>
              {w.find.map((q) => q.ask).join(', ')}
            </Text>
          </>
        ) : null}
      </View>

      {w.convertIn.length ? (
        <View style={card}>
          <Text style={[styles.stepTitle, { color: c.text }]}>
            {early
              ? 'Step 1 · Change the units first'
              : `Step 1 · Convert to the ${sentence}’s units`}
          </Text>
          <Text style={[styles.body, { color: c.textMuted }]}>
            {early
              ? `Change to ${w.workingUnits} first.`
              : `The ${sentence}s don’t work directly in the units you chose, so convert first (to ${w.workingUnits}).`}
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
          <Text style={[styles.stepTitle, { color: c.text }]}>
            {`Step ${i + 1 + offset} · ${s.heading}`}
          </Text>
          {s.lead.sentence ? (
            <Text style={[styles.math, styles.bold, { color: c.text }]}>{s.lead.sentence}</Text>
          ) : null}
          {s.lead.formula ? (
            s.lead.sentence ? (
              <Text style={[styles.body, { color: c.textMuted }]}>{s.lead.formula}</Text>
            ) : (
              <Text style={[styles.body, { color: c.text }]}>
                Use <Text style={styles.bold}>{s.lead.formula}</Text>
              </Text>
            )
          ) : null}
          <Text style={[styles.body, { color: c.textMuted }]}>{s.how}</Text>
          <View style={[styles.lines, { borderLeftColor: c.border }]}>
            {s.lines.map((line, k) => (
              <Text key={k} style={[styles.math, { color: c.text }]}>
                {line}
              </Text>
            ))}
            <Text style={[styles.math, styles.bold, { color: c.text }]}>{s.answer}</Text>
          </View>
        </View>
      ))}

      {w.convertOut.length ? (
        <View style={card}>
          <Text style={[styles.stepTitle, { color: c.text }]}>
            {`Step ${w.steps.length + offset + 1} · ${early ? 'Change back to your units' : 'Convert the answers'}`}
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
          You typed every number. The check shows if they match.
        </Text>
      ) : null}

      {w.nextHint ? (
        <View style={card}>
          <Text style={[styles.stepTitle, { color: c.text }]}>Next</Text>
          <Text style={[styles.body, { color: c.textMuted }]}>{w.nextHint}</Text>
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
              {`${k.formula}   ${k.ok ? '✓' : w.checkFail}`}
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
