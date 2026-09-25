import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { buildSteps } from '@/data/modules/buildSteps';
import { font, radius, space, usePalette } from '@/theme';
import { isEarlyGrade, isElementary } from '@/data/modules';

import type { Calculator } from './useCalculator';

/** A line with brackets or words after "x =": the work lines say it better for K–2. */
const wordy = (line: string) => /[(]|[a-z]{3,}/i.test(line.replace(/^\S+ = /, ''));

/** Live walkthrough of how the current values were found from the entered ones. */
export function StepByStep({ calc }: { calc: Calculator }) {
  const c = usePalette();
  const w = buildSteps(calc.module, calc.result, calc.units);
  const early = isEarlyGrade(calc.module.id);
  // Grades 3–5: names with the letter in brackets, and number sentences rather than letter rules.
  const elementary = isElementary(calc.module.id);
  const sentence = early ? 'number sentence' : 'formula';
  // Conversion steps (when needed) come first and last, numbered with the others.
  const offset = w.convertIn.length ? 1 : 0;
  const card = [styles.card, { backgroundColor: c.surface, borderColor: c.border }];
  // K–2 students read names, never letters: "First group: 3", one per line.
  const list = (qs: typeof w.given) =>
    (early
      ? qs.map((q) => `${q.name}: ${q.value}`).join('\n')
      : elementary
        ? qs.map((q) => `${q.name} (${q.symbol}): ${q.value}`).join('\n')
        : qs.map((q) => `${q.symbol} = ${q.value}`).join(',  ')) || 'nothing yet';
  const byId = new Map(calc.module.variables.map((v) => [v.id, v]));
  /** K–2: "a = 7 − 4" → "7 − 4", "a = 3" → "First group: 3" (the name, not the letter). */
  const plain = (line: string, id: string, keepName: boolean) => {
    const v = byId.get(id);
    if (!early || !v || !line.startsWith(`${v.symbol} = `)) return line;
    const rest = line.slice(v.symbol.length + 3);
    return keepName ? `${v.name}: ${rest}` : rest;
  };
  /** The variable a conversion line is about ("a = 12 in = 30.48 cm …"). */
  const convertedId = (line: string) =>
    calc.module.variables.find((v) => line.startsWith(`${v.symbol} = `))?.id ?? '';
  const lowerFirst = (x: string) => `${x[0]!.toLowerCase()}${x.slice(1)}`;

  return (
    <View style={styles.container} testID="step-by-step">
      <View style={card}>
        <Text style={[styles.label, { color: c.textMuted }]}>WE KNOW</Text>
        <Text style={[styles.math, { color: c.text }]}>{list(w.given)}</Text>
        {w.find.length ? (
          <>
            <Text style={[styles.label, { color: c.textMuted }]}>FIND</Text>
            <Text style={[styles.math, { color: c.text }]}>
              {w.find.map((q) => (early ? q.name : `${q.name} (${q.symbol})`)).join(', ')}
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
                {plain(line, convertedId(line), true)}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {w.steps.map((s, i) => (
        <View key={s.id} style={card}>
          <Text
            style={[styles.stepTitle, { color: c.text }]}
          >{`Step ${i + 1 + offset} · ${early ? `Find ${lowerFirst(byId.get(s.id)?.name ?? '')}` : s.title}`}</Text>
          {early ? (
            // K–2: the number sentence with "?" for the number to find ("3 + ? = 7").
            <Text style={[styles.math, styles.bold, { color: c.text }]}>{s.sentence}</Text>
          ) : elementary ? (
            // Grades 3–5: the number sentence with "?", then the same rule with letters.
            <>
              <Text style={[styles.math, styles.bold, { color: c.text }]}>{s.sentence}</Text>
              <Text style={[styles.body, { color: c.textMuted }]}>{s.formula}</Text>
            </>
          ) : (
            <Text style={[styles.body, { color: c.text }]}>
              Use <Text style={styles.bold}>{s.formula}</Text>
            </Text>
          )}
          <Text style={[styles.body, { color: c.textMuted }]}>{s.how}</Text>
          <View style={[styles.lines, { borderLeftColor: c.border }]}>
            {/* K–5 skip the letter rearrangement ("a = c − b"): the numbers carry the idea. */}
            {s.rearranged && !early && !elementary ? (
              <Text style={[styles.math, { color: c.text }]}>{s.rearranged}</Text>
            ) : null}
            {/* K–2: a line with brackets or words ("h = hundreds digit of 347") is skipped
                when the work lines show the arithmetic. */}
            {s.substituted && !(early && s.work?.length && wordy(s.substituted)) ? (
              <Text style={[styles.math, { color: c.text }]}>
                {plain(s.substituted, s.id, false)}
              </Text>
            ) : null}
            {s.work?.map((line, k) => (
              <Text key={k} style={[styles.math, { color: c.text }]}>
                {line}
              </Text>
            ))}
            <Text style={[styles.math, styles.bold, { color: c.text }]}>
              {plain(s.result, s.id, true)}
            </Text>
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
                {plain(line, convertedId(line), true)}
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

      {w.missing.length ? (
        <View style={card}>
          <Text style={[styles.stepTitle, { color: c.text }]}>Next</Text>
          <Text style={[styles.body, { color: c.textMuted }]}>
            {early
              ? `Type one more number: ${w.missing.map((q) => q.name[0]!.toLowerCase() + q.name.slice(1)).join(', ')}.`
              : `Type one more number (${w.missing.map((q) => q.symbol).join(', ')}) to keep going.`}
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
              {`${k.formula}   ${k.ok ? '✓' : early ? '≠  try another number' : '✗'}`}
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
