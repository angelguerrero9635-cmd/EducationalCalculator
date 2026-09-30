import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

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

import {
  equationIds,
  equationLines,
  equationParts,
  CHOICES,
  type Choices,
  type EquationPart,
  type Slot,
} from './equationTemplate';
import { Fenced, Radical } from './EquationMarks';
import type { Calculator } from './useCalculator';

/**
 * The keyboard for a value. iOS's numbers-and-punctuation pad has the point and the minus sign;
 * Android's numeric pad has both. On the web (iPhone Safari) the numeric pad has neither, so a
 * value that takes decimals gets the decimal pad and one that can be negative the full keyboard.
 */
function keyboardFor(v: {
  integer?: boolean;
  min?: number;
  fraction?: number;
  pi?: boolean | 'fraction';
  scientific?: boolean;
  repeating?: boolean;
}) {
  if (Platform.OS === 'ios') return 'numbers-and-punctuation' as const;
  if (Platform.OS !== 'web') return 'numeric' as const;
  // A fraction (1/2), π (36π), scientific notation (4.7 × 10^5) or … needs more than a keypad.
  if (v.fraction || v.pi || v.scientific || v.repeating) return 'default' as const;
  if ((v.min ?? 0) < 0) return 'default' as const;
  return v.integer ? ('numeric' as const) : ('decimal-pad' as const);
}

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
  return {
    shown,
    error,
    status,
    statusWord,
    unit,
    picker,
    letters,
    focused,
    onChangeText,
    onFocus,
    onBlur,
  };
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
        keyboardType={keyboardFor(variable)}
        returnKeyType="done"
        selectTextOnFocus
        style={[
          styles.input,
          picker && styles.inputNarrow,
          // Long values (576,000,000,000) get a wider box and smaller digits, so none is cut off.
          (shown ?? '').length > 11 && (picker ? styles.inputLongNarrow : styles.inputLong),
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
  blankOne,
  absolute,
  onFocusChange,
}: {
  variable: VariableDef;
  calc: Calculator;
  small?: boolean;
  compact?: boolean;
  letter?: boolean;
  /** A chemical coefficient ({a:coef}): a worked-out 1 is left blank, as it is written. */
  blankOne?: boolean;
  /** After a flipped sign: the value's size, without its minus (x + 3 for x − (−3)). */
  absolute?: boolean;
  /** Told when the box gains or loses focus (a flipped sign turns back while it is typed in). */
  onFocusChange?: (focused: boolean) => void;
}) {
  const c = usePalette();
  const hook = useVariableBox(variable, calc);
  const { error, status, focused, onChangeText } = hook;
  const shown = absolute && !focused ? hook.shown.replace(/^−/, '') : hook.shown;
  const onFocus = () => {
    hook.onFocus();
    onFocusChange?.(true);
  };
  const onBlur = () => {
    hook.onBlur();
    onFocusChange?.(false);
  };
  const tight = small || compact;
  const worked = status === 'derived' && !focused;
  const blank = !!blankOne && worked && calc.values[variable.id] === 1;
  // A worked-out fraction (2 1/4, 3/4) is drawn stacked, like the fixed fractions beside it.
  const stacked = worked && !blank ? /^(−?[\d,]+ )?(−?\d+)\/(\d+)$/.exec(shown) : null;
  const width = stacked
    ? Math.max(
        56,
        (stacked[1]?.trim().length ?? 0) * 13 +
          Math.max(stacked[2]!.length, stacked[3]!.length) * 10 +
          24,
      )
    : Math.max(tight ? 40 : 56, (shown.length || 1) * (tight ? 11 : 13) + (tight ? 14 : 20));
  const ref = useRef<TextInput>(null);
  const input = (
    <TextInput
      ref={ref}
      testID={`input-${variable.id}`}
      accessibilityLabel={blank ? `${variable.name}: 1` : variable.name}
      value={blank ? '' : shown}
      placeholder={blank ? '' : '?'}
      placeholderTextColor={c.textMuted}
      onFocus={onFocus}
      onBlur={onBlur}
      onChangeText={onChangeText}
      editable={!variable.derived}
      keyboardType={keyboardFor(variable)}
      returnKeyType="done"
      selectTextOnFocus
      style={[
        styles.eqBox,
        (small || compact) && styles.eqBoxSmall,
        stacked && styles.eqBoxStacked,
        {
          width,
          // Stacked, the digits are drawn over the box instead.
          color: stacked ? 'transparent' : c.text,
          borderColor: error ? c.text : c.border,
          borderStyle: variable.derived ? 'dashed' : 'solid',
          backgroundColor: status === 'given' || status === 'example' ? c.background : c.surface,
          fontWeight: status === 'given' ? '600' : '400',
        },
      ]}
    />
  );
  const field = stacked ? (
    <View>
      {input}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.eqStackedValue]}>
        {stacked[1] ? (
          <Text style={[styles.eqStackedWhole, { color: c.text }]}>{stacked[1].trim()}</Text>
        ) : null}
        <View style={styles.eqFraction}>
          <Text style={[styles.eqStackedPart, { color: c.text }]}>{stacked[2]}</Text>
          <View style={[styles.eqBar, { backgroundColor: c.text }]} />
          <Text style={[styles.eqStackedPart, { color: c.text }]}>{stacked[3]}</Text>
        </View>
      </View>
    </View>
  ) : (
    input
  );
  // A small box (an exponent, a script) is 32 px tall: a margin it doesn't take up in the
  // layout makes its tap target 44 px, a tap there focusing the box.
  const box = small ? (
    <Pressable
      accessible={false}
      focusable={false}
      onPress={() => ref.current?.focus()}
      style={styles.eqHit}
    >
      {field}
    </Pressable>
  ) : (
    field
  );
  if (!letter) return box;
  return (
    <View style={styles.eqLettered}>
      {box}
      <Text style={[styles.eqLetter, { color: c.textMuted }]}>{variable.symbol}</Text>
    </View>
  );
}

const CHOICE_WORDS: Record<string, string> = {
  '<': 'less than',
  '≤': 'less than or equal to',
  '>': 'greater than',
  '≥': 'greater than or equal to',
  '=': 'equal to',
  '+': 'plus',
  '−': 'minus',
};

/**
 * A sign in the equation the student taps to change (< ≤ > ≥, or + −): the value is the sign's
 * place in `CHOICES` (1 is <), as the inequality pages store it. Outlined like a box, dashed
 * when worked out; in a long equation as small as its boxes, the tap target still 44 px.
 */
function ChoiceBox({
  variable,
  calc,
  choices,
  compact,
}: {
  variable: VariableDef;
  calc: Calculator;
  choices: Choices;
  compact?: boolean;
}) {
  const c = usePalette();
  const signs = CHOICES[choices];
  const value = calc.values[variable.id];
  const status = calc.status(variable.id);
  const at = value === undefined ? undefined : Math.round(value) - 1;
  const sign = at !== undefined && at >= 0 && at < signs.length ? signs[at] : undefined;
  const error = calc.errors[variable.id];
  const next = sign === undefined ? 1 : ((at! + 1) % signs.length) + 1;
  return (
    <Pressable
      testID={`input-${variable.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${variable.name}: ${sign ? CHOICE_WORDS[sign] : 'not chosen'}`}
      accessibilityHint={`Tap for ${CHOICE_WORDS[signs[next - 1]!]}`}
      disabled={variable.derived}
      onPress={() => calc.set({ [variable.id]: next })}
      style={compact ? styles.eqHit : undefined}
    >
      <View
        style={[
          styles.eqChoice,
          compact && styles.eqChoiceSmall,
          {
            borderColor: error ? c.text : c.border,
            borderStyle: variable.derived ? 'dashed' : 'solid',
            backgroundColor: status === 'given' || status === 'example' ? c.background : c.surface,
          },
        ]}
      >
        <Text
          style={[
            styles.eqText,
            compact && styles.eqTextSmall,
            { color: sign ? c.text : c.textMuted },
          ]}
        >
          {sign ?? '?'}
        </Text>
      </View>
    </Pressable>
  );
}

/** The equation with a box for each value, so the numbers go where the problem writes them. */
function EquationInput({ template, calc }: { template: string; calc: Calculator }) {
  const c = usePalette();
  const byId = new Map(calc.module.variables.map((v) => [v.id, v]));
  const early = isEarlyGrade(calc.module.id);
  // Grade 6 letters pages name each box's letter under it (x + 7 = 12); a page that lists the
  // letters it teaches names only those.
  const lettered = (id: string) =>
    calc.module.notation === 'letters' &&
    (!calc.module.letters || calc.module.letters.includes(byId.get(id)!.symbol));
  const lines = equationLines(template).map(equationParts);
  // Long equations use smaller boxes, so a phone fits them on one line: more than 6 values,
  // or more than 4 columns side by side on a line (a box, a fraction or a power is one; a
  // mixed number two; an expression slot its boxes side by side), as in 3(2 + x) = 6 + 12.
  const columns = Math.max(...lines.map((parts) => columnsOf(parts)));
  const compact = equationIds(template).length > 6 || columns > 4;
  // The box being typed in: a sign flipped for its negative value turns back while it is.
  const [editing, setEditing] = useState<string | null>(null);
  const box = (
    id: string,
    key: string,
    small = false,
    letter = lettered(id),
    blankOne = false,
    absolute = false,
  ) => (
    <EquationBox
      key={key}
      variable={byId.get(id)!}
      calc={calc}
      small={small}
      compact={compact}
      letter={letter}
      blankOne={blankOne}
      absolute={absolute}
      onFocusChange={(f) => setEditing((prev) => (f ? id : prev === id ? null : prev))}
    />
  );
  // x − {h} with h = −3 reads x + 3, and {m}x + {b} with b = −3 reads 2x − 3: a written + or −
  // before a box holding a negative value flips, and the box shows the size.
  const signed = (parts: EquationPart[]): EquationPart[] =>
    parts.map((p, i) => {
      const next = parts[i + 1];
      const prev = parts[i - 1];
      const negative = (id: string) =>
        editing !== id && calc.status(id) !== 'unknown' && (calc.values[id] ?? 0) < 0;
      if (p.kind === 'text' && next?.kind === 'box' && negative(next.id) && /[+−]\s*$/.test(p.text))
        return {
          ...p,
          text: p.text.replace(
            /([+−])(\s*)$/,
            (_, s: string, sp: string) => `${s === '+' ? '−' : '+'}${sp}`,
          ),
        };
      if (p.kind === 'box' && prev?.kind === 'text' && negative(p.id) && /[+−]\s*$/.test(prev.text))
        return { ...p, abs: true };
      return p;
    });
  const slotView = (s: Slot, key: string, small = false) =>
    'id' in s ? (
      box(s.id, key, small, false)
    ) : 'parts' in s ? (
      // An expression slot (x − μ over σ, n − 1 up in an exponent): its pieces in one row.
      <View key={key} style={small ? styles.eqSlotSmall : styles.eqSlot}>
        {row(s.parts, key, small)}
      </View>
    ) : (
      <Text
        key={key}
        style={[styles.eqText, small ? styles.eqFixedSmall : styles.eqFixed, { color: c.text }]}
      >
        {s.text}
      </Text>
    );
  // Messages for the boxes, under the equation (the boxes have no room beside them).
  const messages = [...new Set(equationIds(template))].flatMap((id) => {
    const e = calc.errors[id];
    return e
      ? [`${byId.get(id)!.name}: ${early ? kidMessage(e) : limitMessage(e, calc.module)}`]
      : [];
  });
  const piece = (p: EquationPart, i: string, small = false, nested = false) =>
    p.kind === 'text' ? (
      <Text
        key={i}
        style={[
          styles.eqText,
          small && styles.eqTextSmall,
          // Written against a box: closer than the box's padding lets it look (3x, 40°).
          p.tightBefore && styles.eqTightBefore,
          p.tightAfter && styles.eqTightAfter,
          { color: c.text },
        ]}
      >
        {p.text}
      </Text>
    ) : p.kind === 'box' && p.unit ? (
      // {a:unit}: the unit the menu shows for this value (cm, in², V, Ω), written after it.
      <View key={i} style={styles.eqTight}>
        {box(p.id, `b${i}`, small, small ? false : undefined, false, p.abs)}
        <Text
          style={[styles.eqText, small ? styles.eqTextSmall : styles.eqUnit, { color: c.text }]}
        >
          {calc.units.display[p.id] ?? byId.get(p.id)!.unit ?? ''}
        </Text>
      </View>
    ) : p.kind === 'box' ? (
      box(p.id, `b${i}`, small, small ? false : undefined, p.coef, p.abs)
    ) : p.kind === 'power' ? (
      <View key={i} style={[styles.eqPower, nested && styles.eqPowerNested]}>
        {tallBracket(p.base) ? (
          // (1/2)^t: brackets as tall as the fraction inside them.
          <Fenced open="(" close=")">
            {row(tallBracket(p.base)!, `p${i}`, small)}
          </Fenced>
        ) : (
          slotView(p.base, `p${i}`, small)
        )}
        <View style={styles.eqExponent}>{slotView(p.exponent, `e${i}`, true)}</View>
      </View>
    ) : p.kind === 'choice' ? (
      <ChoiceBox
        key={i}
        variable={byId.get(p.id)!}
        calc={calc}
        choices={p.choices}
        compact={compact || small}
      />
    ) : p.kind === 'matrix' ? (
      // A grid in brackets (between bars for a determinant), drawn by columns so each column
      // is as wide as its widest cell; the augmented bar between two columns.
      <Fenced key={i} open={p.det ? '|' : '['} close={p.det ? '|' : ']'}>
        {p.rows[0]!.map((_, j) => (
          <View key={`m${i}-${j}`} style={styles.eqColumnPair}>
            {p.bar === j ? <View style={[styles.eqAugment, { backgroundColor: c.text }]} /> : null}
            <View style={[styles.eqColumn, compact && styles.eqColumnCompact]}>
              {p.rows.map((row, r) => (
                <View key={r} style={compact ? styles.eqCellCompact : styles.eqCell}>
                  {row[j] ? slotView(row[j]!, `m${i}-${r}-${j}`, compact) : null}
                </View>
              ))}
            </View>
          </View>
        ))}
      </Fenced>
    ) : p.kind === 'sub' ? (
      // log_{b}, a_{n}: the subscript small, its top two thirds of the way down the base.
      <View key={i} style={styles.eqSub}>
        {slotView(p.base, `s${i}`, small)}
        <View style={styles.eqSubscript}>{slotView(p.sub, `u${i}`, true)}</View>
      </View>
    ) : p.kind === 'scripts' ? (
      // ^{A}_{Z}X: mass number over atomic number, right-aligned against the symbol after them.
      <View key={i} style={styles.eqScripts}>
        {slotView(p.top, `a${i}`, true)}
        {slotView(p.bottom, `z${i}`, true)}
      </View>
    ) : p.kind === 'root' ? (
      // √{n}, ∛{n}, √({a}x + {b}): the bar over the box or the group.
      <Radical key={i} index={p.index}>
        {'parts' in p.body ? row(p.body.parts, `r${i}`, small) : slotView(p.body, `r${i}`, small)}
      </Radical>
    ) : (
      <View key={i} style={styles.eqMixed}>
        {p.whole && !hideWhole(p) ? box(p.whole, `w${i}`, small, false) : null}
        {hideParts(p) ? null : (
          <View style={styles.eqFraction}>
            {slotView(p.top, `t${i}`, small)}
            <View style={[styles.eqBar, { backgroundColor: c.text }]} />
            {slotView(p.bottom, `d${i}`, small)}
          </View>
        )}
      </View>
    );
  // A worked-out mixed number with a zero part hides it: 3/4, not 0 3/4; 2, not 2 0/4. (A
  // bottom that is typed only here stays, so the student can still type it.)
  const workedZero = (id: string) =>
    calc.status(id) === 'derived' && Math.abs(calc.values[id] ?? NaN) < 1e-12;
  const workedNonzero = (s: Slot) =>
    'id' in s && calc.status(s.id) !== 'unknown' && !workedZero(s.id);
  const hideWhole = (p: EquationPart & { kind: 'fraction' }) =>
    !!p.whole && workedZero(p.whole) && workedNonzero(p.top);
  const hideParts = (p: EquationPart & { kind: 'fraction' }) =>
    !!p.whole &&
    'id' in p.top &&
    workedZero(p.top.id) &&
    !workedZero(p.whole) &&
    calc.status(p.whole) !== 'unknown' &&
    ('text' in p.bottom ||
      ('id' in p.bottom &&
        (calc.status(p.bottom.id) === 'derived' ||
          equationIds(template).filter((x) => x === (p.bottom as { id: string }).id).length > 1)));
  // Pieces in a row, those written against each other touching.
  const row = (parts: EquationPart[], key: string, small = false) =>
    clusters(signed(parts).map((p, i) => ({ p, i }))).map((cluster, k) =>
      cluster.length === 1 ? (
        piece(cluster[0]!.p, `${key}-${cluster[0]!.i}`, small, true)
      ) : (
        <View key={`${key}c${k}`} style={styles.eqTight}>
          {cluster.map(({ p, i }) => piece(p, `${key}-${i}`, small, true))}
        </View>
      ),
    );
  return (
    <View style={styles.equation} testID="equation">
      {lines.map((parts, l) => (
        <View key={l} style={[styles.eqRow, compact && styles.eqRowCompact]}>
          {groups(signed(parts)).map((group, g) => (
            <View key={g} style={[styles.eqGroup, compact && styles.eqRowCompact]}>
              {clusters(group).map((cluster, k) =>
                cluster.length === 1 ? (
                  piece(cluster[0]!.p, `${l}-${cluster[0]!.i}`)
                ) : (
                  <View key={`c${k}`} style={styles.eqTight}>
                    {cluster.map(({ p, i }) => piece(p, `${l}-${i}`))}
                  </View>
                ),
              )}
            </View>
          ))}
        </View>
      ))}
      {messages.map((m) => (
        <Text key={m} style={[styles.meta, { color: c.text, textAlign: 'center' }]}>
          {m}
        </Text>
      ))}
    </View>
  );
}

/**
 * The inside of a bracketed group holding a fraction, (1/2), without its brackets: the group is
 * then drawn between brackets as tall as the fraction. Undefined for any other slot.
 */
function tallBracket(s: Slot): EquationPart[] | undefined {
  if (!('parts' in s) || !s.parts.some((p) => p.kind === 'fraction')) return undefined;
  const first = s.parts[0];
  const last = s.parts[s.parts.length - 1];
  if (first?.kind !== 'text' || last?.kind !== 'text' || s.parts.length < 3) return undefined;
  if (!first.text.startsWith('(') || !last.text.endsWith(')')) return undefined;
  const trim = (p: EquationPart & { kind: 'text' }, text: string): EquationPart[] =>
    text ? [{ ...p, text }] : [];
  return [
    ...trim(first, first.text.slice(1)),
    ...s.parts.slice(1, -1),
    ...trim(last, last.text.slice(0, -1)),
  ];
}

/**
 * Columns side by side: a box, a fraction, a power or a sign box is one, a mixed number two;
 * an expression slot counts its own (a z-score's top, x − μ, is two).
 */
function columnsOf(parts: EquationPart[]): number {
  const slot = (s: Slot) => ('parts' in s ? Math.max(1, columnsOf(s.parts)) : 1);
  return parts.reduce(
    (n, p) =>
      n +
      (p.kind === 'text'
        ? 0
        : p.kind === 'fraction'
          ? (p.whole ? 1 : 0) + Math.max(slot(p.top), slot(p.bottom))
          : p.kind === 'power'
            ? slot(p.base)
            : p.kind === 'root'
              ? slot(p.body)
              : p.kind === 'matrix'
                ? p.rows[0]!.length
                : 1),
    0,
  );
}

/** Pieces written against each other ("3x", "40°", "f(2)") drawn touching, with no gap. */
function clusters(group: { p: EquationPart; i: number }[]) {
  const out: { p: EquationPart; i: number }[][] = [];
  group.forEach((item, k) => {
    const prev = group[k - 1]?.p;
    const touches =
      prev &&
      (('tightBefore' in item.p && item.p.tightBefore) ||
        (prev.kind === 'text' && prev.tightAfter));
    if (touches) out[out.length - 1]!.push(item);
    else out.push([item]);
  });
  return out;
}

/**
 * Pieces that wrap together. A line breaks only before a sign ("= 8 7/24" moves down whole),
 * never after one, never inside brackets, and never between a number and its "× 10ⁿ".
 */
/** Signs a line may break before. */
const SIGNS = new Set(['=', '+', '−', '×', '÷', '→', '<', '>', '≤', '≥', '±']);

function groups(parts: EquationPart[]) {
  const out: { p: EquationPart; i: number }[][] = [];
  let depth = 0;
  parts.forEach((p, i) => {
    const prev = out[out.length - 1];
    const next = parts[i + 1];
    let breakable = false;
    if (p.kind === 'text') {
      const opens = (p.text.match(/\(/g) ?? []).length;
      const closes = (p.text.match(/\)/g) ?? []).length;
      const timesTen =
        p.text === '×' && next?.kind === 'power' && 'text' in next.base && next.base.text === '10';
      breakable = depth === 0 && SIGNS.has(p.text) && !p.tightBefore && !timesTen;
      depth = Math.max(0, depth + opens - closes);
    } else if (p.kind === 'choice') {
      // A sign box is a sign: the line may break before it.
      breakable = depth === 0;
    }
    if (!prev || breakable) out.push([{ p, i }]);
    else prev.push({ p, i });
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
  inputLong: { width: 156, fontSize: font.body - 3 },
  inputLongNarrow: { width: 124, fontSize: font.body - 3 },
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
  // Inside a fraction or a group, room above for the exponent so it clears the bar.
  eqPowerNested: { paddingTop: 12 },
  eqExponent: { marginTop: -14, marginLeft: 2 },
  eqLettered: { alignItems: 'center', gap: 2 },
  eqLetter: { fontSize: font.caption, fontStyle: 'italic' },
  eqFixed: { minHeight: 44, textAlignVertical: 'center', lineHeight: 44 },
  eqFixedSmall: { fontSize: font.body, lineHeight: 24 },
  eqTight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  eqTightBefore: { marginLeft: -3 },
  eqTightAfter: { marginRight: -3 },
  eqBoxSmall: { minHeight: 32, fontSize: font.caption + 2 },
  eqHit: { padding: 6, margin: -6 },
  eqChoiceSmall: { minWidth: 32, minHeight: 32 },
  eqBoxStacked: { minHeight: 48 },
  eqStackedValue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  eqStackedWhole: { fontSize: font.body + 2, fontVariant: ['tabular-nums'] },
  eqStackedPart: { fontSize: font.caption + 3, lineHeight: 18, fontVariant: ['tabular-nums'] },
  eqUnit: { fontSize: font.body + 2, marginLeft: 2 },
  eqColumnPair: { flexDirection: 'row', alignItems: 'stretch', gap: 6 },
  eqColumn: { gap: 6, alignItems: 'center' },
  eqColumnCompact: { gap: 12 },
  eqCell: { minHeight: 44, justifyContent: 'center' },
  eqCellCompact: { minHeight: 32, justifyContent: 'center' },
  eqAugment: { width: 2, borderRadius: 1 },
  // The base stays centred on the line: 8 above it balances the 8 the subscript hangs below.
  eqSub: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 8 },
  eqSubscript: { marginTop: 20, marginLeft: 1 },
  eqScripts: { alignItems: 'flex-end', gap: 2 },
  eqChoice: {
    minWidth: 44,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  eqTextSmall: { fontSize: font.body, lineHeight: 24 },
  eqSlot: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eqSlotSmall: { flexDirection: 'row', alignItems: 'center', gap: 2 },
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
