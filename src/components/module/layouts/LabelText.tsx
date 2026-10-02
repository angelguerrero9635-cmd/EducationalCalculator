import { Platform, Text as RNText, type StyleProp, type TextStyle } from 'react-native';

import { Text } from '@/components/Text';
import { usePalette } from '@/theme';

/** The system's code font (HE-E25). */
export const CODE_FONT = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
});

/**
 * A card or stage label. Text as usual (chemistry too: H₂O, Fe³⁺, K_a drawn lowered, ⇌, →,
 * (2R,3S)-…), or, on a code layout, code in a code font exactly as written: straight quotes
 * kept and no subscript drawn from an underscore (`my_list[i]`).
 */
export function LabelText({
  children,
  code,
  style,
}: {
  children: string;
  code?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const c = usePalette();
  if (!code) return <Text style={style}>{children}</Text>;
  return <RNText style={[{ color: c.text }, style, { fontFamily: CODE_FONT }]}>{children}</RNText>;
}
