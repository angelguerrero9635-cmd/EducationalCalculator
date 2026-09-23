import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { font, space, usePalette } from '@/theme';

import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  const c = usePalette();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: c.textMuted }]}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: space.xl, gap: space.sm },
  title: { fontSize: font.body, fontWeight: '600', textAlign: 'center' },
  message: { fontSize: font.caption + 1, textAlign: 'center' },
});
