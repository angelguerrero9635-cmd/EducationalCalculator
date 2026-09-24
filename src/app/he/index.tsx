import { ScrollView } from 'react-native';

import { ListRow } from '@/components';
import {
  DIVISIONS,
  countLabel,
  divisionLabel,
  divisionRoute,
  divisionView,
} from '@/data/selectors';
import { usePalette } from '@/theme';
import { PageMeta } from '@/components/PageMeta';

export default function HigherEdScreen() {
  const c = usePalette();
  return (
    <>
      <PageMeta
        title={'Higher Education'}
        description="University math, science and engineering courses, by division and field, with topics and worked examples."
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: c.background }}
      >
        {DIVISIONS.map((d) => {
          const view = divisionView(d);
          const subtitle =
            view.kind === 'courses'
              ? countLabel(view.courses.length, 'course')
              : countLabel(view.fields.length, 'field');
          return (
            <ListRow
              key={d}
              testID={`division-${d}`}
              title={divisionLabel(d)}
              subtitle={subtitle}
              route={divisionRoute(d)}
            />
          );
        })}
      </ScrollView>
    </>
  );
}
