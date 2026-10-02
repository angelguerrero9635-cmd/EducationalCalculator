import { Stack } from 'expo-router';

import { DetailHeader, Group, ListRow, Page } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { GALLERY_LAYOUTS, GALLERY_MODULES } from '@/data/modules/gallery';

/** The picture kinds no lesson uses yet, one page each, for the reviewers and the next build. */
export default function GalleryIndex() {
  return (
    <Page width="read">
      <Stack.Screen options={{ title: 'Picture gallery' }} />
      <PageMeta noindex title="Picture gallery" description="Demonstrations of picture kinds." />
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
        {GALLERY_LAYOUTS.map((l) => (
          <ListRow
            key={l.id}
            testID={`gallery-${l.id}`}
            title={l.title ?? l.id}
            subtitle={l.kind === 'explore' ? l.figure.kind : l.kind}
            route={{ pathname: '/gallery/[id]', params: { id: l.id } }}
          />
        ))}
      </Group>
    </Page>
  );
}
