import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from '@/components/Text';

import { ListRow, SectionHeader } from '@/components';
import { parseLevelKey } from '@/data/selectors';
import { gradeLabel } from '@/data/taxonomy';
import {
  clearRecents,
  useAppearancePref,
  useRecents,
  useSelectedLevels,
  useUnitsPref,
} from '@/state';
import type { AppearancePref } from '@/state';
import { font, space, usePalette } from '@/theme';

const APPEARANCES: { value: AppearancePref; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
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

export default function SettingsScreen() {
  const c = usePalette();
  const { levels } = useSelectedLevels();
  const [appearance, setAppearance] = useAppearancePref();
  const [units, setUnits] = useUnitsPref();
  const recents = useRecents();
  const version = Constants.expoConfig?.version ?? '—';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: c.background }}
    >
      <SectionHeader title="What you study" />
      <ListRow
        title="Grade levels & fields"
        subtitle={levelsSummary(levels)}
        onPress={() => router.push('/levels')}
      />

      <SectionHeader title="Appearance" />
      {APPEARANCES.map((a) => (
        <ListRow
          key={a.value}
          title={a.label}
          selected={appearance === a.value}
          onPress={() => setAppearance(a.value)}
        />
      ))}

      <SectionHeader title="Units" />
      {(
        [
          { value: 'metric', label: 'Metric', detail: 'cm, m, kg, N, …' },
          { value: 'us', label: 'US customary', detail: 'in, ft, lb, lbf, …' },
        ] as const
      ).map((u) => (
        <ListRow
          key={u.value}
          title={u.label}
          subtitle={u.detail}
          selected={units === u.value}
          onPress={() => setUnits(u.value)}
        />
      ))}
      <Text style={[styles.paragraph, { color: c.textMuted }]}>
        The default for every module. Each module can also switch units, or mix units value by
        value.
      </Text>

      <SectionHeader title="Premium" />
      <ListRow
        title="Plans & free trial"
        subtitle="Preview only. No purchases in this build."
        onPress={() => router.push('/paywall')}
      />

      <SectionHeader title="Recently viewed" />
      <ListRow
        title="Clear recently viewed"
        subtitle={recents.length ? `${recents.length} items` : 'Empty'}
        accessory="none"
        onPress={recents.length ? clearRecents : undefined}
      />

      <SectionHeader title="About" />
      <ListRow title="Version" subtitle={version} />
      <Text style={[styles.paragraph, { color: c.textMuted }]}>
        [Disclaimer placeholder] This app is an independent study aid. It is not affiliated with,
        endorsed by, or sponsored by any school, school district, college, university, testing
        organization, or standards body. Course and skill names are generic descriptions.
      </Text>

      <SectionHeader title="Privacy" />
      <ListRow title="No data collected" />
      <Text style={[styles.paragraph, { color: c.textMuted }]}>
        There are no accounts, analytics, ads, or tracking, and the app makes no network requests.
        Your selections, appearance, and recently viewed items are stored only on this device.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  paragraph: { fontSize: font.caption + 1, lineHeight: 18, padding: space.lg },
});
