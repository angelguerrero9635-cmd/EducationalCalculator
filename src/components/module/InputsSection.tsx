import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Dropdown, type DropdownOption } from '@/components/Dropdown';
import { Text } from '@/components/Text';
import { gradeBand, isEarlyGrade } from '@/data/modules';
import { formatNumber, parseCents, parseNumber } from '@/engine/format';
import type { VariableDef } from '@/engine/types';
import { linkedUnits, unitChoices, type UnitChoice } from '@/engine/unitContext';
import { getUnit } from '@/engine/units';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from './useCalculator';

type SystemOption = 'metric' | 'us' | 'mixed';

/** Solver messages in words for Kindergarten–Grade 2. */
function kidMessage(message: string): string {
  if (message === 'Enter a number') return 'Type a number';
  if (message.startsWith('Cleared')) return 'Changed to match your new number';
  if (message === 'Must be a whole number') return 'Use a whole number';
  const least = /^Must be at least (.+)$/.exec(message);
  if (least) return `Use ${least[1]} or more`;
  const most = /^Must be at most (.+)$/.exec(message);
  if (most) return `Use ${most[1]} or less`;
  if (/^Must be \d/.test(message)) return message.replace('Must be ', 'Use ');
  if (/^(Makes|No whole numbers|Doesn’t fit)/.test(message)) {
    return 'That doesn’t fit. Try another number.';
  }
  return message;
}

/** Unit menu choices this module offers ("Standard" when US units are the same as metric). */
function systemOptions(calc: Calculator): DropdownOption<SystemOption>[] {
  const { systems, mixed, metricUnits } = calc.unitOptions;
  return [
    ...systems.map((s) =>
      s === 'us'
        ? { value: 'us' as const, label: 'US customary', detail: 'in, ft, yd, mi, lb, …' }
        : {
            value: 'metric' as const,
            label: metricUnits ? 'Metric' : 'Standard',
            detail: metricUnits ? 'mm, cm, m, km, g, kg, …' : undefined,
          },
    ),
    ...(mixed
      ? [{ value: 'mixed' as const, label: 'Mixed', detail: 'Metric and US units together' }]
      : []),
  ];
}

/**
 * Per-value unit menu: the units of that kind in the current system (all units in Mixed).
 * In whole-number lessons, lengths, areas and volumes change together.
 */
function UnitPicker({ variable, calc }: { variable: VariableDef; calc: Calculator }) {
  const { choice, display } = calc.units;
  const options = unitChoices(variable, choice.system, calc.module.variables);
  const current = display[variable.id] ?? variable.unit ?? '';
  return (
    <Dropdown
      compact
      testID={`unit-${variable.id}`}
      title={`${variable.name} in…`}
      value={current}
      options={options.map((id) => ({ value: id, label: id, detail: getUnit(id)?.name }))}
      onChange={(id) =>
        calc.setUnits({
          system: choice.system,
          units: {
            ...choice.units,
            ...(calc.unitOptions.linked
              ? linkedUnits(calc.module.variables, variable.id, id)
              : { [variable.id]: id }),
          },
        })
      }
    />
  );
}

/** One row: the value's letter (from Grade 3), its name and status, and the box with its unit. */
function VariableInput({ variable, calc }: { variable: VariableDef; calc: Calculator }) {
  const c = usePalette();
  const [draft, setDraft] = useState<string | null>(null);
  const [typo, setTypo] = useState(false);
  const [focused, setFocused] = useState(false);
  const value = calc.values[variable.id];
  const unit = calc.units.display[variable.id];
  // A unit menu whenever this value has more than one unit in the current system.
  const picker = unitChoices(variable, calc.units.choice.system, calc.module.variables).length > 1;
  const status = calc.status(variable.id);
  const early = isEarlyGrade(calc.module.id);
  // Letters stand for numbers from Grade 6: K–5 rows name each value in words alone.
  const letters = gradeBand(calc.module.id) === 'standard';
  const rawError = typo ? 'Enter a number' : calc.errors[variable.id];
  const error = rawError && early ? kidMessage(rawError) : rawError;
  const statusWord = variable.derived
    ? early
      ? 'worked out'
      : 'worked out (not typed)'
    : {
        given: early ? 'you typed' : 'entered',
        example: 'example',
        derived: early ? 'answer' : 'calculated',
        unknown: early ? '?' : 'unknown',
      }[status];
  const formatted =
    value === undefined ? '' : formatNumber(calc.units.toDisplay(variable.id, value), variable);
  // While typing, and after a number the range refused, the box keeps the typed text beside
  // its message, so the student can fix it instead of retyping it.
  const shown = draft !== null && (focused || calc.errors[variable.id]) ? draft : formatted;

  const onChangeText = (text: string) => {
    setDraft(text);
    // Money boxes in cents also take dollars: "$1.25" or "1.25" is 125¢.
    const parsed = unit === '¢' ? parseCents(text) : parseNumber(text);
    setTypo(parsed === 'invalid');
    if (parsed !== 'invalid') calc.setShown(variable.id, parsed);
  };

  return (
    <View style={[styles.row, { borderBottomColor: c.border }]}>
      <View style={styles.label}>
        {letters ? <Text style={[styles.symbol, { color: c.text }]}>{variable.symbol}</Text> : null}
        <View style={styles.names}>
          <Text style={[styles.name, { color: c.text }]}>{variable.name}</Text>
          <Text style={[styles.meta, { color: error ? c.text : c.textMuted }]}>
            {error ?? `${statusWord}${unit && !picker ? ` · ${unit}` : ''}`}
          </Text>
        </View>
      </View>
      <TextInput
        testID={`input-${variable.id}`}
        accessibilityLabel={`${variable.name}${unit ? ` in ${unit}` : ''}`}
        value={shown}
        placeholder="?"
        placeholderTextColor={c.textMuted}
        // On the example, a box empties on focus, so typing the same number still counts as typed.
        onFocus={() => {
          calc.startTyping();
          setFocused(true);
          setDraft(calc.isExample ? '' : shown);
        }}
        onBlur={() => {
          calc.endTyping();
          setFocused(false);
          if (typo) setDraft(null);
          setTypo(false);
        }}
        onChangeText={onChangeText}
        editable={!variable.derived}
        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
        returnKeyType="done"
        selectTextOnFocus
        style={[
          styles.input,
          picker && styles.inputNarrow,
          {
            color: c.text,
            borderColor: error ? c.text : c.border,
            backgroundColor: status === 'given' || status === 'example' ? c.background : c.surface,
            fontWeight: status === 'given' ? '600' : '400',
          },
        ]}
      />
      {picker ? <UnitPicker variable={variable} calc={calc} /> : null}
    </View>
  );
}

/**
 * The numbers of the problem: a units menu when the module offers one, a hint, one row per
 * value, and the Clear / Show example buttons. Shown between the picture and the formulas.
 */
export function InputsSection({ calc }: { calc: Calculator }) {
  const c = usePalette();
  const { module, units } = calc;
  const options = systemOptions(calc);
  const early = isEarlyGrade(module.id);

  const onSystem = (s: SystemOption) => {
    // Mixed starts from the units currently shown. Metric/US keep any per-value choices that
    // belong to the new system; the rest fall back to that system's defaults.
    const next: UnitChoice =
      s === 'mixed'
        ? {
            system: 'mixed',
            units: Object.fromEntries(
              Object.entries(units.display).filter((e): e is [string, string] => !!e[1]),
            ),
          }
        : { system: s, units: units.choice.units };
    calc.setUnits(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={[styles.hint, { color: c.textMuted }]}>
          {calc.isExample
            ? early
              ? 'This is an example. Type the numbers from your problem to start.'
              : 'This is an example. Type your own values to start a new problem.'
            : calc.unknownCount
              ? early
                ? 'Type another number to fill in the rest.'
                : 'Enter another value to fill in the rest.'
              : early
                ? 'Change any number. The others change to match.'
                : 'Change any value: the newest entry wins and the rest recalculate.'}
        </Text>
        {options.length > 1 ? (
          <Dropdown
            testID="units"
            label="Units"
            title="Units"
            value={units.choice.system}
            options={options}
            onChange={onSystem}
          />
        ) : null}
      </View>
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
  container: { gap: space.sm, paddingTop: space.md },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  hint: { flex: 1, fontSize: font.caption + 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: space.sm,
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
  inputNarrow: { width: 96 },
  buttons: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.xs,
  },
});
