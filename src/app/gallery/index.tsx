import { Stack } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { DetailHeader, Group, ListRow } from '@/components';
import { GALLERY_MODULES } from '@/data/modules/gallery';
import { space, usePalette } from '@/theme';

/** The picture kinds no lesson uses yet, one page each, for the reviewers and the next build. */
export default function GalleryIndex() {
  const c = usePalette();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.page}
    >
      <Stack.Screen options={{ title: 'Picture gallery' }} />
      <DetailHeader
        title="Picture gallery"
        lines={['Diagram kinds ready for the next sections. Demonstrations, not lessons.']}
      />
      <Group>
        {GALLERY_MODULES.map((m) => (
          <ListRow
            key={m.id}
            testID={`gallery-${m.id}`}
            title={m.title ?? m.id}
            subtitle={m.representation.kind}
            route={{ pathname: '/gallery/[id]', params: { id: m.id } }}
          />
        ))}
      </Group>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { paddingBottom: space.xxl },
});
