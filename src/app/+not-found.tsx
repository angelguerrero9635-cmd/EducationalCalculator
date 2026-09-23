import { Stack, router } from 'expo-router';

import { EmptyState } from '@/components';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <EmptyState
        title="This page doesn’t exist"
        actionLabel="Go to Home"
        onAction={() => router.replace('/')}
      />
    </>
  );
}
