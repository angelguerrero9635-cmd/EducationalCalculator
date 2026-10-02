import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  DetailHeader,
  NotFound,
  ListRow,
  LockedState,
  ModuleSections,
  SectionHeader,
  Tile,
  TileGrid,
} from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { isLocked } from '@/config/access';
import { topicLessonIcons } from '@/data/icons';
import { problemTypeMeta, topicMeta } from '@/data/meta';
import {
  courseRoute,
  getProblemType,
  pageRoute,
  problemTypes,
  TOPIC_TYPE_IDS,
  topicOf,
  topicKey,
  topicPageId,
} from '@/data/selectors';
import { prerenderIds } from '@/data/prerender';
import { COURSES } from '@/data/taxonomy';
import { useTrackRecent } from '@/state';
import { space, usePalette } from '@/theme';

/**
 * Pre-render every course topic page and every topic problem type (web static rendering): the
 * type's `index` segment is "<i>~<slug>". A review build's PRERENDER_PREFIX ("he.geography.")
 * limits them as it limits skill pages.
 */
export function generateStaticParams(): { id: string; index: string }[] {
  const keys = [
    ...COURSES.flatMap((c) => c.topics.map((_, i) => topicKey(c.id, i))),
    ...TOPIC_TYPE_IDS,
  ];
  return prerenderIds(keys).map((key) => {
    const [id = '', index = ''] = key.split('#');
    return { id, index };
  });
}

/** A course topic's lesson, or one of its problem types, laid out like a skill page. */
export default function TopicScreen() {
  const c = usePalette();
  const params = useLocalSearchParams<{ id: string; index: string }>();
  const id = topicPageId(String(params.id), String(params.index));
  const type = getProblemType(id);
  const topic = topicOf(id) ?? type?.topic;
  useTrackRecent(topic ? id : undefined);

  if (!topic) return <NotFound />;
  if (isLocked(topic.course.id)) return <LockedState />;

  const title = type?.title ?? topic.title;
  // The topic's problem types (and its main lesson, from a type), as on a skill page.
  const types = problemTypes(topic.key);
  const icons = topicLessonIcons(
    topic.course,
    topic.index,
    types.map((t) => t.title),
  );
  const iconOf = (lessonId: string) =>
    icons[lessonId === topic.key ? 0 : types.findIndex((t) => t.id === lessonId) + 1];
  const related = [
    ...(type ? [{ id: topic.key, title: topic.title, subtitle: 'Main lesson' }] : []),
    ...types
      .filter((t) => t.id !== id)
      .map((t) => ({ id: t.id, title: t.title, subtitle: t.use ?? 'Problem type' })),
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      style={{ backgroundColor: c.background }}
    >
      <Stack.Screen options={{ title }} />
      <PageMeta {...(type ? problemTypeMeta(type) : topicMeta(topic.course.id, topic.index)!)} />
      <DetailHeader
        title={title}
        lines={type ? [`Problem type · ${topic.title}`, ...(type.use ? [type.use] : [])] : []}
      />
      <ListRow overline="Course" title={topic.course.title} route={courseRoute(topic.course.id)} />
      <ModuleSections id={id} />
      {related.length ? (
        <>
          <SectionHeader title={type ? 'Related lessons' : 'More problem types'} />
          <TileGrid>
            {related.map((r, i) => (
              <Tile
                key={r.id}
                testID={`related-${r.id}`}
                icon={iconOf(r.id)}
                tone={i}
                title={r.title}
                subtitle={r.subtitle}
                route={pageRoute(r.id)!}
              />
            ))}
          </TileGrid>
        </>
      ) : null}
      <View style={styles.end} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  end: { height: space.xxl },
});
