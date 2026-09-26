import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { isEarlyGrade, isElementary, wordRule } from '@/data/modules';
import { agree } from '@/data/modules/buildSteps';
import { renderTemplate } from '@/engine/format';
import type { Values } from '@/engine/types';
import { font, radius, space, usePalette } from '@/theme';

import type { Calculator } from './useCalculator';

/**
 * The formulas, shown symbolically and with the current values (in the chosen units). The
 * inputs live in InputsSection, above this.
 */
export function FormulaSection({ calc }: { calc: Calculator }) {
  const c = usePalette();
  const { module, values, units } = calc;
  const early = isEarlyGrade(module.id);
  const elementary = isElementary(module.id);
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
    <View style={styles.container}>
      <View style={styles.formulas}>
        {module.relations.map((r) => {
          const letters = renderTemplate(r.display, module.variables);
          const numbers = agree(
            renderTemplate(
              r.display,
              units.coherent
                ? module.variables
                : module.variables.map((v) => ({ ...v, integer: false })),
              working,
            ),
          );
          // K–2: just the number sentence (what students write), no letters. Grades 3–5: the
          // number sentence first, the rule in words under it (letters start in Grade 6).
          const [first, second] = early
            ? [numbers, null]
            : elementary
              ? [numbers, wordRule(r.display, module.variables, r.words)]
              : [letters, numbers];
          return (
            <View
              key={r.id}
              style={[styles.formula, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              <Text style={[styles.symbolic, { color: c.text }]}>{first}</Text>
              {second === null ? null : (
                <Text style={[styles.substituted, { color: c.textMuted }]}>{second}</Text>
              )}
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
