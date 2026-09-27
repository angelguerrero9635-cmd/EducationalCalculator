import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Dropdown, type DropdownOption } from '@/components/Dropdown';
import { Text } from '@/components/Text';
import { gradeBand, isEarlyGrade, wordRule } from '@/data/modules';
import type { ModuleDef } from '@/data/modules/types';
import { formatNumber, parseCents, parseNumber } from '@/engine/format';
import { outOfCount } from '@/engine/solve';
import type { VariableDef } from '@/engine/types';
import { linkedUnits, unitChoices, type UnitChoice } from '@/engine/unitContext';
import { getUnit } from '@/engine/units';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from './useCalculator';

type SystemOption = 'metric' | 'us' | 'mixed';

/**
 * A broken page limit ("Doesn’t fit p/b ≤ 24") said as a limit of this page, in words. The
 * limits are never shown as formulas: a student would take them for a step of the problem.
 */
function limitMessage(message: string, module: ModuleDef): string {
  const id = /^Doesn’t fit (.+)$/.exec(message)?.[1];
  const r = module.relations.find((x) => x.id === id && x.constraint);
  if (!r) return message;
  const rule = wordRule(r.display, module.variables, r.words);
  return `This page only works when ${rule[0]!.toLowerCase()}${rule.slice(1)}`;
}

/** Solver messages in words for Kindergarten–Grade 2. */
function kidMessage(message: string): string {
  if (message === 'Enter a number') return 'Type a number';
  if (message.startsWith('Cleared')) return 'Didn’t fit with your new number. Type it again.';
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

/**
 * One value's box: the text shown (the draft while typing, the value otherwise), its error
 * and status, and the handlers. Shared by the rows and the equation.
 */
function useVariableBox(variable: VariableDef, calc: Calculator) {
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
  const band = gradeBand(calc.module.id);
  const letters = band === 'standard' || band === 'middle';
  const rawError = typo ? 'Enter a number' : calc.errors[variable.id];
  const error = rawError && (early ? kidMessage(rawError) : limitMessage(rawError, calc.module));
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
  // A value cleared because it no longer fits shows "?" (the picture and sentences drop it too),
  // not the old number beside a message.
  const cleared = calc.errors[variable.id]?.startsWith('Cleared') ?? false;
  const shown =
    draft !== null && (focused || (calc.errors[variable.id] && !cleared)) ? draft : formatted;

  const onChangeText = (text: string) => {
    setDraft(text);
    // Money boxes in cents also take dollars: "$1.25" or "1.25" is 125¢.
    const parsed = unit === '¢' ? parseCents(text) : parseNumber(text);
    setTypo(parsed === 'invalid');
    if (parsed !== 'invalid') calc.setShown(variable.id, parsed);
  };
  // On the example, a box empties on focus, so typing the same number still counts as typed.
  const onFocus = () => {
    calc.startTyping();
    setFocused(true);
    setDraft(calc.isExample ? '' : shown);
  };
  const onBlur = () => {
    calc.endTyping();
    setFocused(false);
    if (typo) setDraft(null);
    setTypo(false);
  };
  return { shown, error, status, statusWord, unit, picker, letters, onChangeText, onFocus, onBlur };
}

/** One row: the value's letter (from Grade 3), its name and status, and the box with its unit. */
function VariableInput({ variable, calc }: { variable: VariableDef; calc: Calculator }) {
  const c = usePalette();
  const { shown, error, status, statusWord, unit, picker, letters, onChangeText, onFocus, onBlur } =
    useVariableBox(variable, calc);

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
        onFocus={onFocus}
        onBlur={onBlur}
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
 * One box inside the equation: the value's number, typed in place. It widens for a longer
 * answer (8 7/24); on a Grade 6 letters page the value's letter sits under it.
 */
function EquationBox({
  variable,
  calc,
  small,
  compact,
  letter,
}: {
  variable: VariableDef;
  calc: Calculator;
  small?: boolean;
  compact?: boolean;
  letter?: boolean;
}) {
  const c = usePalette();
  const { shown, error, status, onChangeText, onFocus, onBlur } = useVariableBox(variable, calc);
  const tight = small || compact;
  const width = Math.max(
    tight ? 40 : 56,
    (shown.length || 1) * (tight ? 11 : 13) + (tight ? 14 : 20),
  );
  const box = (
    <TextInput
      testID={`input-${variable.id}`}
      accessibilityLabel={variable.name}
      value={shown}
      placeholder="?"
      placeholderTextColor={c.textMuted}
      onFocus={onFocus}
      onBlur={onBlur}
      onChangeText={onChangeText}
      editable={!variable.derived}
      keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
      returnKeyType="done"
      selectTextOnFocus
      style={[
        styles.eqBox,
        (small || compact) && styles.eqBoxSmall,
        {
          width,
          color: c.text,
          borderColor: error ? c.text : c.border,
          borderStyle: variable.derived ? 'dashed' : 'solid',
          backgroundColor: status === 'given' || status === 'example' ? c.background : c.surface,
          fontWeight: status === 'given' ? '600' : '400',
        },
      ]}
    />
  );
  if (!letter) return box;
  return (
    <View style={styles.eqLettered}>
      {box}
      <Text style={[styles.eqLetter, { color: c.textMuted }]}>{variable.symbol}</Text>
    </View>
  );
}

/** A box ({a}) or a fixed number (the 1 of 1/{b}) in the equation. */
type Slot = { id: string } | { text: string };

/** A template split into its pieces: boxes, fractions, mixed numbers, powers and the text between. */
type EquationPart =
  | { kind: 'box'; id: string }
  | { kind: 'fraction'; top: Slot; bottom: Slot; whole?: string }
  | { kind: 'power'; base: string; exponent: string }
  | { kind: 'text'; text: string };

const SLOT = String.raw`\{(\w+)\}|(\d+)`;
const slot = (id: string | undefined, text: string | undefined): Slot =>
  id !== undefined ? { id } : { text: text! };

/**
 * `{a}/{b}` and `1/{b}` are stacked fractions, `{w} {a}/{b}` a mixed number, `{b}^{n}` a power;
 * any other `{id}` is a box, and the rest is text (÷, =, %, :).
 */
export function equationParts(template: string): EquationPart[] {
  const re = new RegExp(
    String.raw`(?:\{(\w+)\} )?(?:${SLOT})\/(?:${SLOT})|\{(\w+)\}\^\{(\w+)\}|\{(\w+)\}`,
    'g',
  );
  const parts: EquationPart[] = [];
  let last = 0;
  for (const m of template.matchAll(re)) {
    const text = template.slice(last, m.index).trim();
    if (text) parts.push({ kind: 'text', text });
    const [, whole, topId, topText, bottomId, bottomText, base, exponent, box] = m;
    if (box) parts.push({ kind: 'box', id: box });
    else if (base) parts.push({ kind: 'power', base, exponent: exponent! });
    else
      parts.push({
        kind: 'fraction',
        top: slot(topId, topText),
        bottom: slot(bottomId, bottomText),
        ...(whole ? { whole } : {}),
      });
    last = m.index! + m[0].length;
  }
  const rest = template.slice(last).trim();
  if (rest) parts.push({ kind: 'text', text: rest });
  return parts;
}

/** Every value's id in the template, in order. */
export const equationIds = (template: string): string[] =>
  equationParts(template).flatMap((p) =>
    p.kind === 'box'
      ? [p.id]
      : p.kind === 'power'
        ? [p.base, p.exponent]
        : p.kind === 'fraction'
          ? [
              p.whole,
              'id' in p.top ? p.top.id : undefined,
              'id' in p.bottom ? p.bottom.id : undefined,
            ].filter((x): x is string => !!x)
          : [],
  );

/** The equation with a box for each value, so the numbers go where the problem writes them. */
function EquationInput({ template, calc }: { template: string; calc: Calculator }) {
  const c = usePalette();
  const byId = new Map(calc.module.variables.map((v) => [v.id, v]));
  const early = isEarlyGrade(calc.module.id);
  // Grade 6 letters pages name each box's letter under it (x + 7 = 12).
  const letters = calc.module.notation === 'letters';
  // Long equations use smaller boxes, so a phone fits them on one line: more than 6 values,
  // or more than 4 columns side by side (a box, a fraction or a power is one; a mixed number
  // two), as in 3(2 + x) = 6 + 12.
  const columns = equationParts(template).reduce(
    (n, p) => n + (p.kind === 'text' ? 0 : p.kind === 'fraction' && p.whole ? 2 : 1),
    0,
  );
  const compact = equationIds(template).length > 6 || columns > 4;
  const box = (id: string, key: string, small = false, letter = letters) => (
    <EquationBox
      key={key}
      variable={byId.get(id)!}
      calc={calc}
      small={small}
      compact={compact}
      letter={letter}
    />
  );
  const slotView = (s: Slot, key: string) =>
    'id' in s ? (
      box(s.id, key, false, false)
    ) : (
      <Text key={key} style={[styles.eqText, styles.eqFixed, { color: c.text }]}>
        {s.text}
      </Text>
    );
  const parts = equationParts(template);
  // Messages for the boxes, under the equation (the boxes have no room beside them).
  const messages = [...new Set(equationIds(template))].flatMap((id) => {
    const e = calc.errors[id];
    return e
      ? [`${byId.get(id)!.name}: ${early ? kidMessage(e) : limitMessage(e, calc.module)}`]
      : [];
  });
  const piece = (p: EquationPart, i: number) =>
    p.kind === 'text' ? (
      <Text key={i} style={[styles.eqText, { color: c.text }]}>
        {p.text}
      </Text>
    ) : p.kind === 'box' ? (
      box(p.id, `b${i}`)
    ) : p.kind === 'power' ? (
      <View key={i} style={styles.eqPower}>
        {box(p.base, `p${i}`)}
        <View style={styles.eqExponent}>{box(p.exponent, `e${i}`, true)}</View>
      </View>
    ) : (
      <View key={i} style={styles.eqMixed}>
        {p.whole ? box(p.whole, `w${i}`, false, false) : null}
        <View style={styles.eqFraction}>
          {slotView(p.top, `t${i}`)}
          <View style={[styles.eqBar, { backgroundColor: c.text }]} />
          {slotView(p.bottom, `d${i}`)}
        </View>
      </View>
    );
  return (
    <View style={styles.equation} testID="equation">
      <View style={[styles.eqRow, compact && styles.eqRowCompact]}>
        {groups(parts).map((group, g) => (
          <View key={g} style={[styles.eqGroup, compact && styles.eqRowCompact]}>
            {group.map(({ p, i }) => piece(p, i))}
          </View>
        ))}
      </View>
      {messages.map((m) => (
        <Text key={m} style={[styles.meta, { color: c.text, textAlign: 'center' }]}>
          {m}
        </Text>
      ))}
    </View>
  );
}

/**
 * Pieces that wrap together: a sign and what follows it ("= 8 7/24", "+ 1 5/6"), so a line
 * never ends with "=".
 */
function groups(parts: EquationPart[]) {
  const out: { p: EquationPart; i: number }[][] = [];
  parts.forEach((p, i) => {
    const prev = out[out.length - 1];
    const after = prev?.[prev.length - 1]?.p;
    if (prev && after?.kind === 'text') prev.push({ p, i });
    else out.push([{ p, i }]);
  });
  return out;
}

/**
 * The numbers of the problem: a units menu when the module offers one, a hint, one row per
 * value (or the equation with its boxes, when the module draws one), and the Clear / Show
 * example buttons. Shown between the picture and the formulas.
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
      {module.equation ? <EquationInput template={module.equation} calc={calc} /> : null}
      <View>
        {module.variables
          // A data set of 5 hides the boxes for a 6th value and on.
          .filter((v) => !outOfCount(v, calc.result.values))
          // Values in the equation are typed there.
          .filter((v) => !module.equation || !equationIds(module.equation).includes(v.id))
          .map((v) => (
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
  equation: { paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.xs },
  eqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  eqText: { fontSize: font.body + 6, fontWeight: '600' },
  eqFraction: { alignItems: 'center', gap: 4 },
  eqBar: { height: 2, alignSelf: 'stretch', borderRadius: 1 },
  eqRowCompact: { gap: 4 },
  eqGroup: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  eqMixed: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eqPower: { flexDirection: 'row', alignItems: 'flex-start' },
  eqExponent: { marginTop: -14, marginLeft: 2 },
  eqLettered: { alignItems: 'center', gap: 2 },
  eqLetter: { fontSize: font.caption, fontStyle: 'italic' },
  eqFixed: { minHeight: 44, textAlignVertical: 'center', lineHeight: 44 },
  eqBoxSmall: { minHeight: 32, fontSize: font.caption + 2 },
  eqBox: {
    fontFamily: font.family,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: space.xs,
    fontSize: font.body + 2,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  buttons: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.xs,
  },
});
