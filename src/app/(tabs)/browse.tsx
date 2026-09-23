import { ScrollView } from 'react-native';

import { ListRow, SectionHeader } from '@/components';
import { DIVISIONS, divisionLabel, gradeRoute } from '@/data/selectors';
import { GRADES, gradeLabel, skillsFor } from '@/data/taxonomy';
import { usePalette } from '@/theme';

export default function BrowseScreen() {
  const c = usePalette();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: c.background }}
    >
      <SectionHeader title="K–12" />
      {GRADES.map((g) => (
        <ListRow
          key={g}
          testID={`browse-grade-${g}`}
          title={gradeLabel(g)}
          subtitle={`${skillsFor(g, 'math').length} math · ${skillsFor(g, 'science').length} science skills`}
          route={gradeRoute(g)}
        />
      ))}
      <SectionHeader title="College" />
      <ListRow
        testID="browse-higher-ed"
        title="Higher Education"
        subtitle={DIVISIONS.map(divisionLabel).join(' · ')}
        route={{ pathname: '/he', params: {} }}
      />
    </ScrollView>
  );
}
