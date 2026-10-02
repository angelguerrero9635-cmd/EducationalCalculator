import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { SITE_NAME, SITE_SLOGAN } from '@/config/site';
import { usePalette } from '@/theme';

import {
  LOCKUP,
  type LogoShape,
  SEAL,
  SEAL_MICRO,
  SEAL_SMALL,
  SLOGAN,
  STACKED,
  WORDMARK,
} from './logoArt';

export type LogoVariant = 'mark' | 'lockup' | 'stacked';

/** The seal for a drawn diameter: lettering from 40 px, the book from 20 px, the bare $U below. */
function sealFor(px: number): LogoShape[] {
  return px < 20 ? SEAL_MICRO : px < 40 ? SEAL_SMALL : SEAL;
}

function Seal({ px, x = 0, y = 0, scale }: { px: number; x?: number; y?: number; scale: number }) {
  const c = usePalette();
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      {sealFor(px).map((s, i) => {
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
    </G>
  );
}

/**
 * The One Dollar University seal and its lockups, drawn from the brand artwork
 * (assets/brand). `size` is the seal's diameter in every variant: `mark` is the seal alone,
 * `lockup` adds the wordmark beside it, `stacked` the wordmark and the slogan beneath it.
 * Colours come from the palette, so one drawing serves light and dark.
 */
export function Logo({ size = 28, variant = 'mark' }: { size?: number; variant?: LogoVariant }) {
  const c = usePalette();
  const label = variant === 'stacked' ? `${SITE_NAME}. ${SITE_SLOGAN}` : SITE_NAME;
  let art;
  if (variant === 'lockup') {
    const k = size / LOCKUP.mark;
    art = (
      <Svg width={LOCKUP.width * k} height={size} viewBox={`0 0 ${LOCKUP.width} ${LOCKUP.height}`}>
        <Seal px={size} scale={LOCKUP.mark / 256} />
        <G
          transform={`translate(${LOCKUP.wordmarkX} ${LOCKUP.wordmarkY}) scale(${LOCKUP.wordmarkScale})`}
        >
          <Path d={WORDMARK.d} fill={c.text} />
        </G>
      </Svg>
    );
  } else if (variant === 'stacked') {
    const k = size / STACKED.mark;
    art = (
      <Svg
        width={STACKED.width * k}
        height={STACKED.height * k}
        viewBox={`0 0 ${STACKED.width} ${STACKED.height}`}
      >
        <Seal px={size} x={STACKED.markX} scale={STACKED.mark / 256} />
        <G
          transform={`translate(${STACKED.wordmarkX} ${STACKED.wordmarkY}) scale(${STACKED.wordmarkScale})`}
        >
          <Path d={WORDMARK.d} fill={c.text} />
        </G>
        <G transform={`translate(${STACKED.sloganX} ${STACKED.sloganY})`}>
          <Path d={SLOGAN.d} fill={c.textMuted} />
        </G>
      </Svg>
    );
  } else {
    art = (
      <Svg width={size} height={size} viewBox="0 0 256 256">
        <Seal px={size} scale={1} />
      </Svg>
    );
  }
  return (
    <View testID="logo" accessible accessibilityRole="image" accessibilityLabel={label}>
      {art}
    </View>
  );
}
