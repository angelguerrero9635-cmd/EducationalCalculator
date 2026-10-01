import { Children, type ReactNode } from 'react';
import { Platform, StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { subscriptRuns } from '@/engine/subscripts';
import { font, usePalette } from '@/theme';

// Web: a subscript run sits below the line (native draws it small on the baseline), moved
// down rather than vertical-align: sub, so its line is no taller than the others (μ_d).
const LOWERED =
  Platform.OS === 'web'
    ? ({ position: 'relative', top: '0.3em', lineHeight: 0 } as unknown as TextStyle)
    : null;

/** String children with their "_" subscripts (v_y, T_c) drawn as subscripts. */
function withSubscripts(children: ReactNode, style: TextProps['style']): ReactNode {
  const hasSub = Children.toArray(children).some(
    (ch) => typeof ch === 'string' && ch.includes('_'),
  );
  if (!hasSub) return children;
  const size = StyleSheet.flatten(style)?.fontSize ?? font.body;
  return Children.map(children, (ch) => {
    if (typeof ch !== 'string' || !ch.includes('_')) return ch;
    return subscriptRuns(ch).map((r, i) =>
      r.sub ? (
        <RNText key={i} style={[{ fontSize: Math.round(size * 0.72) }, LOWERED]}>
          {r.s}
        </RNText>
      ) : (
        r.s
      ),
    );
  });
}

/** App text: applies the theme's font family and default text color. */
export function Text({ style, children, ...rest }: TextProps) {
  const c = usePalette();
  return (
    <RNText {...rest} style={[{ color: c.text, fontFamily: font.family }, style]}>
      {withSubscripts(children, style)}
    </RNText>
  );
}
