import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';

import { MathLine } from '@/components/MathLine';
import { Text } from '@/components/Text';
import { gradeBand, isEarlyGrade, isElementary, wordRule } from '@/data/modules';

import { agree } from '@/data/modules/buildSteps';
import { renderTemplate } from '@/engine/format';
import type { LatexOptions } from '@/engine/latex';
import type { Values } from '@/engine/types';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from './useCalculator';

const lowerFirst = (t: string) => `${t[0]!.toLowerCase()}${t.slice(1)}`;
/** "24/6 = 4 0/6" reads "24/6 = 4": a mixed number with no fraction part is a whole. */
const noEmptyPart = (t: string) => t.replace(/(\d) 0\/\d+(?![\d/])/g, '$1');

/**
 * The formulas, shown symbolically and with the current values (in the chosen units). The
 * inputs live in InputsSection, above this.
 */
export function FormulaSection({ calc }: { calc: Calculator }) {
  const c = usePalette();
  const { module, values, units } = calc;
  const early = isEarlyGrade(module.id);
  const elementary = isElementary(module.id);
  const band = gradeBand(module.id);
  const middle = band === 'middle';
  // Letters in italic from the Grade 6 letter pages on.
  const symbols = module.variables.map((v) => v.symbol);
  // Formula lines use the chosen units when the formulas hold in them; otherwise the formula's
  // own units (the step-by-step shows the conversions).
  const working: Values = units.coherent
    ? Object.fromEntries(Object.entries(values).map(([id, x]) => [id, units.toDisplay(id, x)]))
    : values;
  const formulaUnits = [
    ...new Set(
      module.variables
        .filter((v) => (units.display[v.id] ?? '') !== (v.unit ?? ''))
        .map((v) => v.unit),
    ),
  ].join(', ');

  return (
    <View style={styles.container} testID="formulas">
      <View style={styles.formulas}>
        {module.relations.map((r) => {
          const letters = renderTemplate(r.display, module.variables);
          const numbers = noEmptyPart(
            agree(
              renderTemplate(
                r.display,
                units.coherent
                  ? module.variables
                  : module.variables.map((v) => ({ ...v, integer: false })),
                working,
              ),
            ),
          );
          // K–2: just the number sentence (what students write), no letters. Grades 3–5: the
          // number sentence first, the rule in words under it (letters start in Grade 6).
          const [first, second] = early
            ? [numbers, null]
            : elementary
              ? [numbers, wordRule(r.display, module.variables, r.words)]
              : // Grade 6 letters: the formula (with what its letters mean), then the numbers.
                [letters, numbers];
          // Typeset as in the step-by-step (fractions stacked, powers raised, letters in
          // italic), except: a limit ("3/4 is at most 1") is a rule about the inputs, kept as
          // text; Grade 6 formulas state rules, so ÷ stays inline; words under a formula get
          // only small number fractions.
          const math = (text: string, style: StyleProp<TextStyle>, extra?: LatexOptions) =>
            r.constraint ? (
              <Text style={style}>{text}</Text>
            ) : (
              <MathLine
                text={text}
                band={band}
                symbols={symbols}
                options={{ solving: false, ...extra }}
                style={style}
              />
            );
          return (
            <View
              key={r.id}
              style={[styles.formula, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              {middle && !r.constraint ? (
                <MathLine
                  text={first}
                  band={band}
                  symbols={symbols}
                  options={{ solving: false }}
                  after={` (${lowerFirst(wordRule(r.display, module.variables, r.words))})`}
                  style={[styles.symbolic, { color: c.text }]}
                />
              ) : (
                math(
                  middle
                    ? `${first} (${lowerFirst(wordRule(r.display, module.variables, r.words))})`
                    : first,
                  [styles.symbolic, { color: c.text }],
                )
              )}
              {second === null
                ? null
                : math(second, [styles.substituted, { color: c.textMuted }], {
                    words: elementary,
                  })}
            </View>
          );
        })}
      </View>
      {!units.coherent && formulaUnits ? (
        <Text style={[styles.hint, { color: c.textMuted }]}>
          {`${early ? 'Number sentences' : 'Formulas'} are worked in ${formulaUnits}. The step-by-step shows the conversions.`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.md, paddingTop: space.md, paddingBottom: space.lg },
  formulas: { gap: space.sm, paddingHorizontal: space.lg },
  formula: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: space.md,
    gap: 2,
  },
  symbolic: { fontSize: font.body + 2, fontWeight: '600' },
  substituted: { fontSize: font.body - 1, fontVariant: ['tabular-nums'] },
  hint: { fontSize: font.caption + 1, paddingHorizontal: space.lg },
});
