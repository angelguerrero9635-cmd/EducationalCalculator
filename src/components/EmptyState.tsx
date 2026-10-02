import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { space, type, usePalette } from '@/theme';

import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** A second, quieter action beside the first. */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** An illustration above the title (src/components/art). */
  art?: ReactNode;
  /** The page's main heading (not-found pages), larger and announced as a header. */
  heading?: boolean;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  art,
  heading,
}: EmptyStateProps) {
  const c = usePalette();
  return (
    <View style={styles.container}>
      {art}
      <Text
        accessibilityRole={heading ? 'header' : undefined}
        style={[heading ? type.title1 : type.title3, styles.center, { color: c.text }]}
      >
        {title}
      </Text>
      {message ? (
        <Text style={[type.callout, styles.center, { color: c.textMuted }]}>{message}</Text>
      ) : null}
      {(actionLabel && onAction) || (secondaryLabel && onSecondary) ? (
        <View style={styles.actions}>
          {actionLabel && onAction ? (
            <Button label={actionLabel} variant="primary" size="small" onPress={onAction} />
          ) : null}
          {secondaryLabel && onSecondary ? (
            <Button label={secondaryLabel} variant="secondary" size="small" onPress={onSecondary} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    gap: space.sm,
  },
  center: { textAlign: 'center' },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.sm,
  },
});
