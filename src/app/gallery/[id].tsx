import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';

import { DetailHeader, EmptyState, ModuleSections } from '@/components';
import { GALLERY_MODULES } from '@/data/modules/gallery';
import { usePalette } from '@/theme';

/** Pre-render every gallery page (web static rendering; not listed in the sitemap). */
export function generateStaticParams(): { id: string }[] {
  return GALLERY_MODULES.map((m) => ({ id: m.id }));
}

/** One picture kind from the gallery, on the same page layout as a lesson. */
export default function GalleryPage() {
  const c = usePalette();
  const id = String(useLocalSearchParams<{ id: string }>().id);
  const module = GALLERY_MODULES.find((m) => m.id === id);
  if (!module) return <EmptyState title="Not in the gallery" message={id} />;
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: c.background }}
    >
      <Stack.Screen options={{ title: module.title ?? id }} />
      <DetailHeader
        title={module.title ?? id}
        lines={['Picture gallery · a demonstration, not a lesson']}
      />
      <ModuleSections id={module.id} />
    </ScrollView>
  );
}
