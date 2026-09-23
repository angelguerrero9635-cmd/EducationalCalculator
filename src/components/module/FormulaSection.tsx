import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/Text';

import { Button } from '@/components/Button';
import { formatNumber, parseNumber, renderTemplate } from '@/engine/format';
import type { VariableDef } from '@/engine/types';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from './useCalculator';

function VariableInput({ variable, calc }: { variable: VariableDef; calc: Calculator }) {
  const c = usePalette();
  const [draft, setDraft] = useState<string | null>(null);
  const [typo, setTypo] = useState(false);
  const value = calc.values[variable.id];
  const status = calc.status(variable.id);
  const error = typo ? 'Enter a number' : calc.errors[variable.id];
  const shown = draft ?? (value === undefined ? '' : formatNumber(value, variable));

  const onChangeText = (text: string) => {
    setDraft(text);
    const parsed = parseNumber(text);
    setTypo(parsed === 'invalid');
    if (parsed !== 'invalid') calc.set({ [variable.id]: parsed });
  };

  return (
    <View style={[styles.row, { borderBottomColor: c.border }]}>
      <View style={styles.label}>
        <Text style={[styles.symbol, { color: c.text }]}>{variable.symbol}</Text>
        <View style={styles.names}>
          <Text style={[styles.name, { color: c.text }]}>{variable.name}</Text>
          <Text style={[styles.meta, { color: error ? c.text : c.textMuted }]}>
            {error ??
              `${status === 'given' ? 'entered' : status === 'derived' ? 'calculated' : 'unknown'}${
                variable.unit ? ` · ${variable.unit}` : ''
              }`}
          </Text>
        </View>
      </View>
      <TextInput
        testID={`input-${variable.id}`}
        accessibilityLabel={`${variable.name}${variable.unit ? ` in ${variable.unit}` : ''}`}
        value={shown}
        placeholder="?"
        placeholderTextColor={c.textMuted}
        onFocus={() => setDraft(shown)}
        onBlur={() => {
          setDraft(null);
          setTypo(false);
        }}
        onChangeText={onChangeText}
        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
        returnKeyType="done"
        selectTextOnFocus
        style={[
          styles.input,
          {
            color: c.text,
            borderColor: error ? c.text : c.border,
            backgroundColor: status === 'given' ? c.background : c.surface,
            fontWeight: status === 'given' ? '600' : '400',
          },
        ]}
      />
    </View>
  );
}

/** Formulas shown symbolically and with current values, plus one input per variable. */
export function FormulaSection({ calc }: { calc: Calculator }) {
  const c = usePalette();
  const { module, values } = calc;
  return (
    <View style={styles.container}>
      <View style={styles.formulas}>
        {module.relations.map((r) => (
          <View
            key={r.id}
            style={[styles.formula, { backgroundColor: c.surface, borderColor: c.border }]}
          >
            <Text style={[styles.symbolic, { color: c.text }]}>
              {renderTemplate(r.display, module.variables)}
            </Text>
            <Text style={[styles.substituted, { color: c.textMuted }]}>
              {renderTemplate(r.display, module.variables, values)}
            </Text>
          </View>
        ))}
      </View>
      <Text style={[styles.hint, { color: c.textMuted }]}>
        {calc.unknownCount
          ? 'Enter another value to fill in the rest.'
          : 'Change any value: the newest entry wins and the rest recalculate.'}
      </Text>
      <View>
        {module.variables.map((v) => (
          <VariableInput key={v.id} variable={v} calc={calc} />
        ))}
      </View>
      <View style={styles.buttons}>
        <Button label="Clear all" variant="secondary" onPress={calc.clear} />
        <Button label="Show example" variant="secondary" onPress={calc.showExample} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.md, paddingBottom: space.lg },
  formulas: { gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.md },
  formula: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: space.md,
    gap: 2,
  },
  symbolic: { fontSize: font.body + 2, fontWeight: '600' },
  substituted: { fontSize: font.body - 1, fontVariant: ['tabular-nums'] },
  hint: { fontSize: font.caption + 1, paddingHorizontal: space.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: space.md,
  },
  label: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md },
  symbol: { fontSize: font.body + 2, fontWeight: '700', minWidth: 36 },
  names: { flex: 1 },
  name: { fontSize: font.body },
  meta: { fontSize: font.caption },
  input: {
    fontFamily: font.family,
    width: 120,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    fontSize: font.body,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  buttons: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg },
});
