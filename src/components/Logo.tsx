import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { SITE_NAME } from '@/config/site';
import { usePalette } from '@/theme';

import { SEAL_MICRO, SEAL_SMALL } from './logoArt';

/**
 * The One Dollar University seal, drawn from the brand artwork (assets/brand): a disc with a
 * gold ring, the gold $ beside the U and an open book; under 20 px the book is left out. Colours
 * come from the palette, so one drawing serves light and dark. The full seal with its ring
 * lettering (from 40 px) and the `lockup` and `stacked` variants join once the lettering is
 * outlined (assets/brand/README.md).
 */
export function Logo({ size = 28 }: { size?: number }) {
  const c = usePalette();
  const shapes = size < 20 ? SEAL_MICRO : SEAL_SMALL;
  return (
    <View testID="logo" accessible accessibilityRole="image" accessibilityLabel={SITE_NAME}>
      <Svg width={size} height={size} viewBox="0 0 256 256">
        {shapes.map((s, i) => {
          const paint = s.stroke
            ? {
                fill: 'none',
                stroke: c[s.role],
                strokeWidth: s.stroke,
                strokeLinecap: 'round' as const,
                strokeLinejoin: 'round' as const,
              }
            : { fill: c[s.role] };
          return s.circle ? (
            <Circle key={i} cx={s.circle[0]} cy={s.circle[1]} r={s.circle[2]} {...paint} />
          ) : (
            <Path key={i} d={s.d} {...paint} />
          );
        })}
      </Svg>
    </View>
  );
}
