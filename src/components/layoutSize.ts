import { useWindowDimensions } from 'react-native';

import { layout, useIsClient } from '@/theme';

export type LayoutSize = 'compact' | 'medium' | 'wide';

/**
 * The screen's width class: compact (phones), medium (tablets) or wide (desktop, iPad
 * landscape). On the web it reads `compact` while the pre-rendered page hydrates, so the first
 * render matches the HTML; views that must be right before hydration use `dataSet={{ shell }}`
 * (the CSS rules in `src/app/+html.tsx`) instead.
 */
export function useLayoutSize(): LayoutSize {
  const { width } = useWindowDimensions();
  const client = useIsClient();
  if (!client) return 'compact';
  return width >= layout.wide ? 'wide' : width >= layout.medium ? 'medium' : 'compact';
}

/** The page gutter for the current width class. */
export function useGutter(): number {
  return layout.gutter[useLayoutSize()];
}
