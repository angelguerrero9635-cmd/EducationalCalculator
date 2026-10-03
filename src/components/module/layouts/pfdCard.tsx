/**
 * The `pfdSymbol` card figure (HC178, `typesHe4m.ts`): one process-flow-diagram symbol on a sort
 * card, 84 × 68, in the card's ink, its streams arrowed in and out, the moving or packed parts in
 * the card's shade. Flat line art, as a PFD draws them; drawn from scratch to the usual shapes.
 */
import type { ReactElement } from 'react';
import { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { PfdSymbolCard } from '@/data/modules/typesHe4m';
import { chart } from '@/theme';

/** A stream: a line with an arrowhead at its end. */
function stream(key: string, x1: number, y1: number, x2: number, y2: number, ink: string) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = (t: number) => `${x2 - 6 * Math.cos(a + t)},${y2 - 6 * Math.sin(a + t)}`;
  return (
    <G key={key}>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={1.6} />
      <Polygon points={`${x2},${y2} ${h(0.45)} ${h(-0.45)}`} fill={ink} />
    </G>
  );
}

/** A vertical vessel: a rectangle with rounded (dished) heads. */
const vessel = (x: number, y: number, w: number, h: number) =>
  `M ${x} ${y + w / 3} Q ${x} ${y} ${x + w / 2} ${y} Q ${x + w} ${y} ${x + w} ${y + w / 3} L ${x + w} ${y + h - w / 3} Q ${x + w} ${y + h} ${x + w / 2} ${y + h} Q ${x} ${y + h} ${x} ${y + h - w / 3} Z`;

export function PfdCardView({ f, ink, shade }: { f: PfdSymbolCard; ink: string; shade: string }) {
  const line = {
    stroke: ink,
    strokeWidth: chart.stroke,
    fill: 'none',
    strokeLinejoin: 'round' as const,
  };
  const parts: ReactElement[] = [];
  switch (f.symbol) {
    case 'pump':
      // A centrifugal pump: the casing, the discharge leaving tangent at the top, the feet.
      parts.push(
        <Polygon
          key="feet"
          points="30,52 54,52 58,60 26,60"
          fill={shade}
          stroke={ink}
          strokeWidth={1.4}
        />,
        <Circle
          key="casing"
          cx={42}
          cy={38}
          r={14}
          fill="none"
          stroke={ink}
          strokeWidth={chart.stroke}
        />,
        <Path key="nozzle" d="M 42 24 L 60 24 L 60 31 L 52 31" {...line} />,
        stream('in', 8, 38, 28, 38, ink),
        stream('out', 60, 27.5, 78, 27.5, ink),
      );
      break;
    case 'compressor':
      // The trapezoid narrowing in the flow direction.
      parts.push(
        <Polygon
          key="body"
          points="26,14 58,24 58,44 26,54"
          fill={shade}
          stroke={ink}
          strokeWidth={chart.stroke}
        />,
        stream('in', 6, 34, 26, 34, ink),
        stream('out', 58, 34, 78, 34, ink),
      );
      break;
    case 'exchanger':
      // A shell with the tube bundle zigzagging through it; shell-side nozzles top and bottom.
      parts.push(
        <Rect
          key="shell"
          x={14}
          y={22}
          width={56}
          height={24}
          rx={12}
          fill="none"
          stroke={ink}
          strokeWidth={chart.stroke}
        />,
        <Path
          key="tubes"
          d="M 4 34 L 20 34 L 28 26 L 36 42 L 44 26 L 52 42 L 60 26 L 64 34 L 70 34"
          fill="none"
          stroke={ink}
          strokeWidth={1.4}
        />,
        stream('tubesOut', 70, 34, 82, 34, ink),
        stream('shellIn', 26, 6, 26, 22, ink),
        stream('shellOut', 58, 46, 58, 62, ink),
      );
      break;
    case 'heater':
      // A fired heater: the firebox with its coil, the flame under it, the stack on top.
      parts.push(
        <Polygon
          key="stack"
          points="36,4 48,4 46,18 38,18"
          fill={shade}
          stroke={ink}
          strokeWidth={1.4}
        />,
        <Rect
          key="box"
          x={24}
          y={18}
          width={36}
          height={38}
          fill="none"
          stroke={ink}
          strokeWidth={chart.stroke}
        />,
        <Path
          key="coil"
          d="M 8 26 L 30 26 L 30 32 L 54 32 L 54 38 L 30 38 L 30 44 L 54 44"
          fill="none"
          stroke={ink}
          strokeWidth={1.4}
        />,
        <Path
          key="flame"
          d="M 36 56 Q 38 47 42 44 Q 46 47 48 56 Z"
          fill={shade}
          stroke={ink}
          strokeWidth={1.2}
        />,
        stream('out', 54, 44, 80, 44, ink),
        stream('in', 4, 26, 24, 26, ink),
      );
      break;
    case 'column': {
      // A tray column: feed at the side, vapour off the top, bottoms off the bottom.
      parts.push(
        <Path
          key="shell"
          d={vessel(30, 2, 22, 64)}
          fill="none"
          stroke={ink}
          strokeWidth={chart.stroke}
        />,
      );
      for (let k = 0; k < 7; k++) {
        const y = 14 + k * 7;
        const left = k % 2 === 0;
        parts.push(
          <Line
            key={`t${k}`}
            x1={left ? 30 : 36}
            x2={left ? 46 : 52}
            y1={y}
            y2={y}
            stroke={ink}
            strokeWidth={1.2}
          />,
        );
      }
      parts.push(
        stream('feed', 8, 34, 30, 34, ink),
        stream('top', 52, 8, 76, 8, ink),
        stream('bottom', 52, 60, 76, 60, ink),
      );
      break;
    }
    case 'flash':
      // A flash drum: feed in the middle, vapour out the top, liquid (shaded) out the bottom.
      parts.push(
        <Path
          key="liquid"
          d="M 30 44 L 54 44 L 54 52 Q 54 62 42 62 Q 30 62 30 52 Z"
          fill={shade}
        />,
        <Path
          key="shell"
          d={vessel(30, 8, 24, 54)}
          fill="none"
          stroke={ink}
          strokeWidth={chart.stroke}
        />,
        <Line
          key="level"
          x1={30}
          x2={54}
          y1={44}
          y2={44}
          stroke={ink}
          strokeWidth={1}
          strokeDasharray="3 2"
        />,
        stream('feed', 6, 34, 30, 34, ink),
        <Path key="v" d="M 42 8 L 42 3 L 64 3" {...line} />,
        stream('vapour', 64, 3, 80, 3, ink),
        stream('liquid', 42, 62, 42, 67, ink),
      );
      break;
    case 'absorber':
      // A packed absorber: two packed beds (crossed), liquid in at the top, gas in at the bottom.
      parts.push(
        <Path
          key="shell"
          d={vessel(32, 2, 20, 64)}
          fill="none"
          stroke={ink}
          strokeWidth={chart.stroke}
        />,
        ...[14, 38].map((y) => (
          <G key={`bed${y}`}>
            <Rect x={32} y={y} width={20} height={18} fill={shade} stroke={ink} strokeWidth={1} />
            <Line x1={32} y1={y} x2={52} y2={y + 18} stroke={ink} strokeWidth={1} />
            <Line x1={52} y1={y} x2={32} y2={y + 18} stroke={ink} strokeWidth={1} />
          </G>
        )),
        stream('liquidIn', 8, 10, 32, 10, ink),
        stream('gasIn', 76, 60, 52, 60, ink),
        stream('gasOut', 52, 6, 78, 6, ink),
        stream('liquidOut', 32, 62, 10, 62, ink),
      );
      break;
    case 'cstr':
      // A stirred tank: the motor on top, the shaft and impeller in the liquid.
      parts.push(
        <Path
          key="liquid"
          d="M 24 30 L 60 30 L 60 50 Q 60 62 42 62 Q 24 62 24 50 Z"
          fill={shade}
        />,
        <Path
          key="tank"
          d="M 24 16 L 24 50 Q 24 62 42 62 Q 60 62 60 50 L 60 16 Z"
          fill="none"
          stroke={ink}
          strokeWidth={chart.stroke}
        />,
        <Rect
          key="motor"
          x={36}
          y={2}
          width={12}
          height={10}
          fill={shade}
          stroke={ink}
          strokeWidth={1.4}
        />,
        <Line key="shaft" x1={42} x2={42} y1={12} y2={50} stroke={ink} strokeWidth={1.6} />,
        <Path key="blades" d="M 32 47 L 52 53 M 32 53 L 52 47" stroke={ink} strokeWidth={2.2} />,
        stream('in', 4, 22, 24, 22, ink),
        stream('out', 60, 54, 80, 54, ink),
      );
      break;
    case 'packedBed': {
      // A packed-bed reactor: a tube full of catalyst pellets, feed in at the top.
      parts.push(
        <Path
          key="shell"
          d={vessel(30, 6, 24, 56)}
          fill="none"
          stroke={ink}
          strokeWidth={chart.stroke}
        />,
      );
      for (let r = 0; r < 6; r++)
        for (let k = 0; k < 3; k++)
          parts.push(
            <Circle
              key={`p${r}${k}`}
              cx={36 + k * 6 + (r % 2) * 3}
              cy={20 + r * 6}
              r={2.2}
              fill={shade}
              stroke={ink}
              strokeWidth={0.8}
            />,
          );
      parts.push(stream('in', 42, 0, 42, 8, ink), stream('out', 42, 60, 42, 68, ink));
      break;
    }
  }
  return <G>{parts}</G>;
}
