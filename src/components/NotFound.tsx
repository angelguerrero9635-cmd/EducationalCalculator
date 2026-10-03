import { router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PageMeta } from '@/components/PageMeta';
import { space } from '@/theme';

import { NotFoundArt } from './art';
import { EmptyState } from './EmptyState';

/**
 * The one "page not found" screen: unknown addresses and unknown skill, course, grade or field
 * ids. It never shows the raw id, and keeps the page out of search results.
 */
export function NotFound() {
  return (
    <View style={styles.page}>
      <PageMeta
        noindex
        title="Page not found"
        description="This page doesn’t exist. Search, or browse every lesson from Kindergarten to university."
      />
      <Stack.Screen options={{ title: 'Not found' }} />
      <EmptyState
        heading
        art={<NotFoundArt width={260} />}
        title="We couldn’t find that page"
        message="It may have moved. Try Search, or start from Browse."
        actionLabel="Search"
        onAction={() => router.replace('/search')}
        secondaryLabel="Browse"
        onSecondary={() => router.replace('/browse')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', paddingVertical: space.xxxl },
});
