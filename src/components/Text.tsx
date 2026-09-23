import { Text as RNText, type TextProps } from 'react-native';

import { font, usePalette } from '@/theme';

/** App text: applies the theme's font family and default text color. */
export function Text({ style, ...rest }: TextProps) {
  const c = usePalette();
  return <RNText {...rest} style={[{ color: c.text, fontFamily: font.family }, style]} />;
}
