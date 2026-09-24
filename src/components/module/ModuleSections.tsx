import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { PlaceholderCard } from '@/components/PlaceholderCard';
import { SectionHeader } from '@/components/SectionHeader';
import { Dropdown } from '@/components/Dropdown';
import { SegmentedControl } from '@/components/SegmentedControl';
import { getModules, isEarlyGrade, type ModuleDef } from '@/data/modules';
import { font, space, usePalette } from '@/theme';

import { FormulaSection } from './FormulaSection';
import { RepresentationView, representationTitle } from './reps';
import { StepByStep } from './StepByStep';
import { useCalculator } from './useCalculator';

function ModuleView({ module }: { module: ModuleDef }) {
  const c = usePalette();
  const calc = useCalculator(module);
  return (
    <>
      {/* Order: see the picture first, then work with the numbers, then read why. */}
      <SectionHeader title={representationTitle(module.representation)} />
      <View style={styles.representation}>
        <RepresentationView spec={module.representation} calc={calc} />
      </View>

      <SectionHeader title={isEarlyGrade(module.id) ? 'Number sentences' : 'Formulas'} />
      <FormulaSection calc={calc} />

      <SectionHeader title="Assumptions" />
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
  const modules = getModules(id);
  const [chosen, setChosen] = useState(id);
  const module = modules.find((m) => m.id === chosen) ?? modules[0];
  // A skill with several modules (different question types) gets a switcher.
  const options = modules.map((m) => ({ value: m.id, label: m.title ?? 'Lesson' }));
  // Segments for a few short names; a menu otherwise.
  const segmented = options.length <= 3 && options.every((o) => o.label.length <= 16);
  return (
    <>
      {modules.length > 1 && module ? (
        <View style={styles.switcher}>
          {segmented ? (
            <SegmentedControl segments={options} value={module.id} onChange={setChosen} />
          ) : (
            <Dropdown
              testID="module"
              label="Problem type"
              title="Problem type"
              value={module.id}
              options={options}
              onChange={setChosen}
            />
          )}
        </View>
      ) : null}
      {module ? (
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
      )}
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
  switcher: { paddingHorizontal: space.lg, paddingTop: space.md },
});
