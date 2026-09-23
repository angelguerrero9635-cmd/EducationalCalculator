import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';

import { DetailHeader, EmptyState, LearnPlaceholders, ListRow, LockedState } from '@/components';
import { isLocked } from '@/config/access';
import { courseRoute, getTopic, topicKey } from '@/data/selectors';
import { useTrackRecent } from '@/state';
import { usePalette } from '@/theme';

/** Placeholder topic screen: will host formulas, the calculator and worked examples. */
export default function TopicScreen() {
  const c = usePalette();
  const params = useLocalSearchParams<{ id: string; index: string }>();
  const topic = getTopic(String(params.id), Number(params.index));
  useTrackRecent(topic ? topicKey(topic.course.id, topic.index) : undefined);

  if (!topic) return <EmptyState title="Topic not found" />;
  if (isLocked(topic.course.id)) return <LockedState />;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: c.background }}
    >
      <DetailHeader title={topic.title} lines={[]} />
      <ListRow overline="Course" title={topic.course.title} route={courseRoute(topic.course.id)} />
      <LearnPlaceholders />
    </ScrollView>
  );
}
