import { Stack, router } from 'expo-router';

import { EmptyState } from '@/components';
import { PageMeta } from '@/components/PageMeta';

export default function NotFoundScreen() {
  return (
    <>
      <PageMeta
        title={'Page not found'}
        description="This page doesn’t exist. Browse all lessons from Kindergarten to university."
      />
      <>
        <Stack.Screen options={{ title: 'Not found' }} />
        <EmptyState
          title="This page doesn’t exist"
          actionLabel="Go to Home"
          onAction={() => router.replace('/')}
        />
      </>
    </>
  );
}
