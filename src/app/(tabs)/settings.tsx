import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Group, ListRow, SectionHeader, SegmentedControl } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { Text } from '@/components/Text';
import { parseLevelKey } from '@/data/selectors';
import { gradeLabel } from '@/data/taxonomy';
import {
  clearRecents,
  useAppearancePref,
  useRecents,
  useSelectedLevels,
  useUnitsPref,
} from '@/state';
import type { UnitSystem } from '@/engine/units';
import type { AppearancePref } from '@/state';
import { font, space, usePalette } from '@/theme';

const APPEARANCES: { value: AppearancePref; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const UNITS: { value: UnitSystem; label: string }[] = [
  { value: 'metric', label: 'Metric' },
  { value: 'us', label: 'US customary' },
];

function levelsSummary(levels: readonly string[]): string {
  const names = levels.flatMap((k) => {
    const level = parseLevelKey(k);
    if (!level) return [];
    return [level.kind === 'grade' ? gradeLabel(level.grade) : level.field.title];
  });
  if (names.length === 0) return 'Nothing selected';
  return names.length > 3
    ? `${names.slice(0, 3).join(', ')} +${names.length - 3}`
    : names.join(', ');
}

/** A note under a group, in small muted text. */
function Note({ children }: { children: string }) {
  const c = usePalette();
  return <Text style={[styles.note, { color: c.textMuted }]}>{children}</Text>;
}

export default function SettingsScreen() {
  const c = usePalette();
  const { levels } = useSelectedLevels();
  const [appearance, setAppearance] = useAppearancePref();
  const [units, setUnits] = useUnitsPref();
  const recents = useRecents();
  const version = Constants.expoConfig?.version ?? '—';

  return (
    <>
      <PageMeta
        title={'Settings'}
        description="Choose what you study, units and appearance. No accounts, no tracking: everything stays on your device."
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.page}
      >
        <SectionHeader title="What you study" />
        <Group>
          <ListRow
            title="Grade levels & fields"
            subtitle={levelsSummary(levels)}
            onPress={() => router.push('/levels')}
          />
        </Group>

        <SectionHeader title="Appearance" />
        <Group>
          <View style={styles.control}>
            <SegmentedControl segments={APPEARANCES} value={appearance} onChange={setAppearance} />
          </View>
        </Group>

        <SectionHeader title="Units" />
        <Group>
          <View style={styles.control}>
            <SegmentedControl segments={UNITS} value={units} onChange={setUnits} />
          </View>
        </Group>
        <Note>
          {`${units === 'metric' ? 'cm, m, kg, N, …' : 'in, ft, lb, lbf, …'} The default for every module. Each module can also switch units, or mix units value by value.`}
        </Note>

        <SectionHeader title="Premium" />
        <Group>
          <ListRow
            title="Plans & free trial"
            subtitle="Preview only. No purchases in this build."
            onPress={() => router.push('/paywall')}
          />
        </Group>

        <SectionHeader title="Recently viewed" />
        <Group>
          <ListRow
            title="Clear recently viewed"
            subtitle={recents.length ? `${recents.length} items` : 'Empty'}
            accessory="none"
            onPress={recents.length ? clearRecents : undefined}
          />
        </Group>

        <SectionHeader title="About" />
        <Group>
          <ListRow title="Version" subtitle={version} />
          <ListRow title="No data collected" subtitle="No accounts, analytics, ads or tracking." />
        </Group>
        <Note>
          The app makes no network requests. Your selections, appearance and recently viewed items
          are stored only on this device.
        </Note>
        <Note>
          [Disclaimer placeholder] This app is an independent study aid. It is not affiliated with,
          endorsed by, or sponsored by any school, school district, college, university, testing
          organization, or standards body. Course and skill names are generic descriptions.
        </Note>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: { paddingBottom: space.xxl },
  control: { padding: space.md },
  note: {
    fontSize: font.caption + 1,
    lineHeight: 18,
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
  },
});
