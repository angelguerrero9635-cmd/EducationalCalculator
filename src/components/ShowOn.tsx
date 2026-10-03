import type { ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { useLayoutSize } from './layoutSize';
import { webData } from './webData';

/**
 * Shows its children only on wide screens (`wide`) or only below them (`narrow`). On the web
 * the choice is made by CSS (src/app/+html.tsx), so pre-rendered pages are right before they
 * hydrate; on iOS it follows the window width.
 */
export function ShowOn({
  size,
  children,
  style,
}: {
  size: 'wide' | 'narrow';
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const now = useLayoutSize();
  if (Platform.OS !== 'web' && (now === 'wide') !== (size === 'wide')) return null;
  return (
    <View {...webData({ shell: size })} style={style}>
      {children}
    </View>
  );
}
