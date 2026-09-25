import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'browse'
  | 'search'
  | 'settings'
  | 'chevron'
  | 'check'
  | 'clock'
  | 'book'
  | 'school'
  | 'spark';

/**
 * Line icons drawn with react-native-svg (no icon font needed). 24 × 24 grid, rounded strokes;
 * `filled` fills the shape for the selected tab.
 */
export function Icon({
  name,
  size = 24,
  color,
  filled = false,
}: {
  name: IconName;
  size?: number;
  color: string;
  filled?: boolean;
}) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  const fill = filled ? color : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' ? (
        <Path
          d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"
          {...stroke}
          fill={fill}
        />
      ) : name === 'browse' ? (
        <>
          <Rect x={4} y={4} width={7} height={7} rx={2} {...stroke} fill={fill} />
          <Rect x={13} y={4} width={7} height={7} rx={2} {...stroke} fill={fill} />
          <Rect x={4} y={13} width={7} height={7} rx={2} {...stroke} fill={fill} />
          <Rect x={13} y={13} width={7} height={7} rx={2} {...stroke} fill={fill} />
        </>
      ) : name === 'search' ? (
        <>
          <Circle cx={10.5} cy={10.5} r={6} {...stroke} strokeWidth={filled ? 2.6 : 1.8} />
          <Path d="m15 15 5 5" {...stroke} strokeWidth={filled ? 2.6 : 1.8} />
        </>
      ) : name === 'settings' ? (
        <>
          {/* A gear stays an outline when selected (a filled gear hides its hole); thicker instead. */}
          <Path
            d="M12 3.5l1.6 2.2 2.7-.4.6 2.6 2.4 1.3-1 2.5 1 2.5-2.4 1.3-.6 2.6-2.7-.4L12 20.5l-1.6-2.3-2.7.4-.6-2.6-2.4-1.3 1-2.5-1-2.5 2.4-1.3.6-2.6 2.7.4z"
            {...stroke}
            strokeWidth={filled ? 2.4 : 1.8}
          />
          <Circle cx={12} cy={12} r={2.8} {...stroke} strokeWidth={filled ? 2.4 : 1.8} />
        </>
      ) : name === 'chevron' ? (
        <Path d="m9 5 7 7-7 7" {...stroke} strokeWidth={2} />
      ) : name === 'check' ? (
        <Path d="m5 12.5 4.5 4.5L19 7.5" {...stroke} strokeWidth={2.2} />
      ) : name === 'clock' ? (
        <>
          <Circle cx={12} cy={12} r={8} {...stroke} />
          <Path d="M12 7.5V12l3 2" {...stroke} />
        </>
      ) : name === 'book' ? (
        <Path
          d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v14H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19"
          {...stroke}
        />
      ) : name === 'school' ? (
        <>
          <Path d="m3 9 9-5 9 5-9 5z" {...stroke} />
          <Path d="M7 11.5V16c0 1.4 2.2 3 5 3s5-1.6 5-3v-4.5" {...stroke} />
        </>
      ) : (
        <Path
          d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"
          {...stroke}
        />
      )}
    </Svg>
  );
}
