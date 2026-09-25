import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { PlaceholderCard } from '@/components/PlaceholderCard';
import { SectionHeader } from '@/components/SectionHeader';
import { getModule, isEarlyGrade, isElementary, type ModuleDef } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { font, space, usePalette } from '@/theme';

import { FormulaSection } from './FormulaSection';
import { RepresentationView, representationTitle } from './reps';
import { StepByStep } from './StepByStep';
import { useCalculator, type Calculator } from './useCalculator';

/** "How much heavier: d = 3 cubes" for values the picture doesn't draw (K–2: "How much heavier: 3 cubes"). */
function PictureLabels({ ids, calc }: { ids: string[]; calc: Calculator }) {
  const c = usePalette();
  const early = isEarlyGrade(calc.module.id);
  const byId = new Map(calc.module.variables.map((v) => [v.id, v]));
  return (
    <View style={styles.labels}>
      {ids.map((id) => {
        const v = byId.get(id)!;
        const x = calc.values[id];
        const unit = calc.units.display[id] ?? v.unit;
        const num = x === undefined ? '?' : formatNumber(calc.units.toDisplay(id, x), v);
        // $ goes before the number; ¢, % and ° go right after it; other units after a space.
        const shown =
          x === undefined || !unit
            ? num
            : unit === '$'
              ? `$${num}`
              : ['¢', '%', '°'].includes(unit)
                ? `${num}${unit}`
                : `${num} ${unit}`;
        return (
          <Text key={id} style={[styles.label, { color: c.text }]}>
            {early
              ? `${v.name}: ${shown}`
              : isElementary(calc.module.id)
                ? `${v.name} (${v.symbol}): ${shown}`
                : `${v.name}: ${v.symbol} = ${shown}`}
          </Text>
        );
      })}
    </View>
  );
}

function ModuleView({ module }: { module: ModuleDef }) {
  const c = usePalette();
  const calc = useCalculator(module);
  // Kindergarten–Grade 2 section names are plain words.
  const early = isEarlyGrade(module.id);
  return (
    <>
      {/* Order: see the picture first, then work with the numbers, then read why. */}
      <SectionHeader title={early ? 'Picture' : representationTitle(module.representation)} />
      <View style={styles.representation}>
        <RepresentationView spec={module.representation} calc={calc} />
        {module.pictureLabels ? <PictureLabels ids={module.pictureLabels} calc={calc} /> : null}
      </View>

      <SectionHeader title={early ? 'Number sentences' : 'Formulas'} />
      <FormulaSection calc={calc} />

      <SectionHeader title={early ? 'Good to know' : 'Assumptions'} />
      <View style={styles.bullets}>
        {module.assumptions.map((a) => (
          <View key={a} style={styles.bullet}>
            <Text style={[styles.dot, { color: c.textMuted }]}>•</Text>
            <Text style={[styles.bulletText, { color: c.text }]}>{a}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Step-by-step" />
      <StepByStep calc={calc} />
    </>
  );
}

/**
 * Assumptions, formulas (live calculator), a linked table/chart/diagram and a live
 * step-by-step walkthrough for a skill or topic. Modules whose content isn't written yet
 * show labelled placeholders.
 */
export function ModuleSections({ id }: { id: string }) {
  // One module per page: a skill's main lesson, or one of its problem types.
  const module = getModule(id);
  return module ? (
    // Keyed so moving between modules starts from a fresh calculator.
    <ModuleView key={module.id} module={module} />
  ) : (
    <>
      <SectionHeader title="Learn" />
      <View style={styles.cards}>
        <PlaceholderCard label="Table, chart or diagram" />
        <PlaceholderCard label="Formulas" />
        <PlaceholderCard label="Assumptions" />
        <PlaceholderCard label="Step-by-step example" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bullets: { padding: space.lg, gap: space.sm },
  bullet: { flexDirection: 'row', gap: space.sm },
  dot: { fontSize: font.body, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: font.body, lineHeight: 22 },
  representation: { paddingVertical: space.lg, paddingHorizontal: space.sm },
  labels: { marginTop: space.sm, gap: space.xs },
  label: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
  cards: { padding: space.lg, gap: space.md },
});
