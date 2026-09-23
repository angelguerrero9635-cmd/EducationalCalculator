import { StyleSheet, Text, View } from 'react-native';

import { PlaceholderCard } from '@/components/PlaceholderCard';
import { SectionHeader } from '@/components/SectionHeader';
import { getModule, type ModuleDef } from '@/data/modules';
import { font, space, usePalette } from '@/theme';

import { FormulaSection } from './FormulaSection';
import { RepresentationView, representationTitle } from './reps';
import { useCalculator } from './useCalculator';

function ModuleView({ module }: { module: ModuleDef }) {
  const c = usePalette();
  const calc = useCalculator(module);
  return (
    <>
      <SectionHeader title="Assumptions" />
      <View style={styles.bullets}>
        {module.assumptions.map((a) => (
          <View key={a} style={styles.bullet}>
            <Text style={[styles.dot, { color: c.textMuted }]}>•</Text>
            <Text style={[styles.bulletText, { color: c.text }]}>{a}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Formulas" />
      <FormulaSection calc={calc} />

      <SectionHeader title={representationTitle(module.representation)} />
      <View style={styles.representation}>
        <RepresentationView spec={module.representation} calc={calc} />
      </View>
    </>
  );
}

/**
 * Assumptions, formulas (live calculator) and a linked table/chart/diagram for a skill or
 * topic. Modules whose content isn't written yet show labelled placeholders.
 */
export function ModuleSections({ id }: { id: string }) {
  const module = getModule(id);
  return (
    <>
      {module ? (
        // Keyed so moving between modules starts from a fresh calculator.
        <ModuleView key={module.id} module={module} />
      ) : (
        <>
          <SectionHeader title="Learn" />
          <View style={styles.cards}>
            <PlaceholderCard label="Assumptions" />
            <PlaceholderCard label="Formulas" />
            <PlaceholderCard label="Table, chart or diagram" />
          </View>
        </>
      )}
      <View style={styles.cards}>
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
  cards: { padding: space.lg, gap: space.md },
});
