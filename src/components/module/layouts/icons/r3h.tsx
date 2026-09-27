/**
 * Round-3 card icons (group H), 48 × 48 like every card icon, drawn in their materials with the
 * helpers in reps/paint.tsx. The names are listed in data/modules/layouts/icons/r3h.ts.
 *
 * Things too small to see are drawn as a microscope shows them: a round lit field inside the
 * dark eyepiece, the thing in the middle (an amoeba, a paramecium, yeast, a sand grain, an air
 * bubble). The rest are drawn as the eye sees them: an Elodea sprig, a salt crystal, a sheet of
 * heart muscle, and a body with its heart and vessels.
 */
import type { ReactNode } from 'react';
import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { usePalette } from '@/theme';

import { FloorShadow, Glass, TopLight, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

export function R3HIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('round', 'field', 'glass', 'light', 'clip');
  const o = (w = 1) => ({
    stroke: ink,
    strokeWidth: w,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  });
  /** A lit ellipse: its color, an outline, then light from the top left. */
  const blob = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, w = 0.9) => (
    <G transform={`rotate(${rot} ${cx} ${cy})`}>
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} {...o(w)} />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={url(ids.round)} />
    </G>
  );
  /** The lit round field of a microscope, inside the dark eyepiece. */
  const field = (art: ReactNode) => (
    <>
      <Circle cx={24} cy={24} r={23} fill={c.rubber} />
      <Circle cx={24} cy={24} r={20.5} fill={c.slideLight} />
      <G clipPath={url(ids.clip)}>{art}</G>
      <Circle cx={24} cy={24} r={20.5} fill={url(ids.field)} />
    </>
  );

  let art: ReactNode = null;
  switch (icon) {
    case 'amoeba': {
      const body =
        'M 14 20 C 9 14 15 9 20 14 C 21 8 28 6 29 13 C 34 11 41 14 36 20 C 42 24 40 31 34 29 C 35 35 28 39 25 33 C 20 38 11 37 15 30 C 8 30 7 22 14 20 Z';
      art = field(
        <>
          <Path d={body} fill={c.glassEdge} fillOpacity={0.4} {...o(1)} />
          <Path d={body} fill={url(ids.round)} />
          <Ellipse cx={26} cy={22} rx={4} ry={3.2} fill={c.rock5} {...o(0.6)} />
          <Circle cx={18} cy={26} r={2} fill={c.rock1} {...o(0.5)} />
          <Circle cx={31} cy={27.5} r={1.5} fill={c.rock1} {...o(0.5)} />
          <Circle cx={20} cy={18} r={2.2} fill={c.slideLight} {...o(0.5)} />
        </>,
      );
      break;
    }
    case 'paramecium': {
      const body =
        'M 8 30 C 5 23 12 14 24 12 C 34 10 42 13 41 19 C 40 24 34 25 30 27 C 26 29 25 35 18 36 C 12 37 9 34 8 30 Z';
      const vacuole = (x: number, y: number) => (
        <G>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI) / 3;
            return (
              <Line
                key={i}
                x1={x}
                y1={y}
                x2={x + 2.6 * Math.cos(a)}
                y2={y + 2.6 * Math.sin(a)}
                stroke={c.glassEdge}
                strokeWidth={0.6}
              />
            );
          })}
          <Circle cx={x} cy={y} r={1.1} fill={c.slideLight} {...o(0.5)} />
        </G>
      );
      art = field(
        <>
          {/* Cilia: a fringe of short hairs all round the body. */}
          <Path
            d={body}
            fill="none"
            stroke={ink}
            strokeWidth={3.6}
            strokeDasharray="0.45 1.3"
            strokeOpacity={0.7}
          />
          <Path d={body} fill={c.rock1} {...o(1)} />
          <Path d={body} fill={url(ids.round)} />
          <Path d="M 30.5 26.8 Q 24 25.5 20.5 30.5" fill="none" {...o(0.7)} />
          <Ellipse cx={20} cy={23} rx={5} ry={3.2} fill={c.rock5} {...o(0.6)} />
          {vacuole(13, 28.5)}
          {vacuole(33, 17.5)}
        </>,
      );
      break;
    }
    case 'budding yeast': {
      const cell = (x: number, y: number, rx: number, ry: number, rot: number) => (
        <G key={`${x}`}>
          {blob(x, y, rx, ry, c.fat, rot)}
          <Circle cx={x + 1.5} cy={y + 1} r={Math.min(rx, ry) * 0.35} fill={c.glass} {...o(0.4)} />
        </G>
      );
      art = field(
        <>
          {cell(15, 17, 6.5, 5, 20)}
          {cell(33, 13, 5, 4, -10)}
          {cell(15.5, 31, 5.5, 4.6, -30)}
          {/* The budding cell: a small daughter cell growing from its side. */}
          {blob(36.5, 24.5, 3.4, 3.1, c.fat, 0)}
          {cell(28, 30, 7.2, 5.8, -20)}
        </>,
      );
      break;
    }
    case 'quartz sand grain':
      art = field(
        <>
          <Polygon
            points="11,24 15,13 26,9 36,13 39,25 33,36 20,38 12,32"
            fill={c.rock1}
            {...o(1)}
          />
          <Polygon
            points="11,24 15,13 26,9 36,13 39,25 33,36 20,38 12,32"
            fill={url(ids.glass)}
            fillOpacity={0.55}
          />
          <Path
            d="M 15 13 L 22 20 L 26 9 M 22 20 L 33 27 L 39 25 M 22 20 L 18 31 L 12 32 M 33 27 L 33 36"
            fill="none"
            stroke={ink}
            strokeWidth={0.5}
            strokeOpacity={0.5}
          />
          <Polygon points="16,15 24,11 20,18" fill={c.shine} fillOpacity={0.7} />
        </>,
      );
      break;
    case 'air bubble on a slide':
      // A bubble on a slide: a thick dark rim round a bright middle.
      art = field(
        <>
          <Circle cx={22} cy={22} r={11} fill={c.slideLight} stroke={c.rubber} strokeWidth={3.6} />
          <Circle cx={22} cy={22} r={8.6} fill="none" stroke={c.glassEdge} strokeWidth={1} />
          <Circle cx={18.5} cy={18.5} r={2.4} fill={c.shine} />
          <Circle cx={35} cy={34} r={4} fill={c.slideLight} stroke={c.rubber} strokeWidth={1.8} />
          <Circle cx={34} cy={33} r={0.9} fill={c.shine} />
        </>,
      );
      break;
    case 'elodea sprig': {
      /** A whorl of three small leaves round the stem, lower ones bigger. */
      const whorl = (y: number, s: number) => (
        <G key={y}>
          {blob(24 - 6 * s, y, 6 * s, 1.8 * s, c.life, 18, 0.6)}
          {blob(24 + 6 * s, y, 6 * s, 1.8 * s, c.life, -18, 0.6)}
          {blob(24.5, y - 1.8 * s, 1.9 * s, 3.8 * s, c.life, 8, 0.6)}
        </G>
      );
      art = (
        <>
          <Rect x={2} y={2} width={44} height={44} rx={6} fill={c.water} fillOpacity={0.18} />
          <Path d="M 24 46 C 23 36 25.5 22 24 5" fill="none" stroke={c.lifeDeep} strokeWidth={2} />
          {[39, 32, 25, 18.5, 12.5].map((y, i) => whorl(y, 1 - i * 0.12))}
          {blob(24, 6.5, 2, 3.2, c.life, 0, 0.6)}
        </>
      );
      break;
    }
    case 'salt crystal':
      // A cube of rock salt: clear faces, the top brightest, with a stepped (hopper) top.
      art = (
        <>
          <FloorShadow cx={24} cy={41} rx={16} ry={2.5} />
          <Polygon points="9,15 24,22 24,40 9,33" fill={c.glass} {...o(1.1)} />
          <Polygon points="9,15 24,22 24,40 9,33" fill={url(ids.glass)} fillOpacity={0.6} />
          <Polygon points="24,22 39,15 39,33 24,40" fill={c.glassEdge} fillOpacity={0.55} />
          <Polygon points="24,22 39,15 39,33 24,40" fill="none" {...o(1.1)} />
          <Polygon points="24,8 39,15 24,22 9,15" fill={c.snow} {...o(1.1)} />
          <Polygon points="24,8 39,15 24,22 9,15" fill={url(ids.light)} />
          <Polygon
            points="24,11 33,15 24,19 15,15"
            fill="none"
            stroke={c.glassEdge}
            strokeWidth={0.7}
          />
          <Line x1={12} y1={20} x2={12} y2={30} stroke={c.shine} strokeWidth={1.2} />
        </>
      );
      break;
    case 'heart muscle tissue': {
      // Long striped cells side by side in rows, joined end to end by dark discs, each with a
      // nucleus in its middle; one cell branches into the row below.
      const rows = [7, 16, 25, 34];
      const h = 9;
      const ends = [
        [16, 31],
        [9, 24, 38],
        [18, 33],
        [11, 27, 40],
      ];
      art = (
        <>
          <Defs>
            <ClipPath id={ids.clip}>
              <Rect x={3} y={7} width={42} height={36} rx={4} />
            </ClipPath>
          </Defs>
          <G clipPath={url(ids.clip)}>
            <Rect x={3} y={7} width={42} height={36} fill={c.rock6} />
            <Rect x={3} y={7} width={42} height={36} fill={c.mercury} fillOpacity={0.3} />
            {Array.from({ length: 21 }, (_, i) => (
              <Line
                key={i}
                x1={4 + i * 2}
                y1={7}
                x2={4 + i * 2}
                y2={43}
                stroke={c.mercury}
                strokeWidth={0.5}
                strokeOpacity={0.55}
              />
            ))}
            {/* Row edges, with a gap where a cell branches into the next row. */}
            <Path
              d="M 3 16 H 22 M 27 16 H 45 M 3 25 H 45 M 3 34 H 30 M 35 34 H 45"
              stroke={ink}
              strokeWidth={0.8}
              strokeOpacity={0.7}
            />
            {rows.map((y, r) => (
              <G key={y}>
                {ends[r]!.map((x) => (
                  <Path
                    key={x}
                    d={`M ${x} ${y} l 1 2 l -1 2 l 1 2 l -1 3`}
                    fill="none"
                    stroke={ink}
                    strokeWidth={1.4}
                  />
                ))}
                {[3, ...ends[r]!].map((x0, i, xs) => {
                  const x1 = xs[i + 1] ?? 45;
                  return (
                    <Ellipse
                      key={i}
                      cx={(x0 + x1) / 2}
                      cy={y + h / 2}
                      rx={2.4}
                      ry={1.3}
                      fill={c.purple}
                      fillOpacity={0.85}
                    />
                  );
                })}
              </G>
            ))}
            <Rect x={3} y={7} width={42} height={36} fill={url(ids.light)} />
          </G>
          <Rect x={3} y={7} width={42} height={36} rx={4} fill="none" {...o(1)} />
        </>
      );
      break;
    }
    case 'circulatory system': {
      const red = c.spectrumRed;
      const blue = c.blockBlue;
      const vessel = (d: string, color: string) => (
        <Path d={d} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      );
      art = (
        <>
          <Circle cx={24} cy={7.5} r={5.2} fill={c.skin} fillOpacity={0.4} {...o(1)} />
          <Path
            d="M 19 13.5 H 29 C 34 14 38 16 38.5 20 L 40 33 L 36.5 33.5 L 35 24 L 34 46 H 14 L 13 24 L 11.5 33.5 L 8 33 L 9.5 20 C 10 16 14 14 19 13.5 Z"
            fill={c.skin}
            fillOpacity={0.4}
            {...o(1)}
          />
          {/* Arteries (red) carry blood out from the heart; veins (blue) bring it back. */}
          {vessel('M 25 19 C 24 16 22.5 15 22.5 11 V 5.5', red)}
          {vessel('M 24 17 C 18 15.5 14 18 12.5 24 L 10.5 32', red)}
          {vessel('M 27 17 C 31 15.5 34 18 35.5 24 L 37.5 32', red)}
          {vessel('M 25 24 L 23.5 34 C 22.5 38 20.5 41 19.5 46', red)}
          {vessel('M 23.5 34 C 24 38 26.5 41 27 46', red)}
          {vessel('M 25.5 5.5 V 12 C 25.5 14 26.5 15.5 27 18', blue)}
          {vessel('M 13.8 32.8 L 15.3 24.5 C 16.5 20 20 18.5 24.5 19.5', blue)}
          {vessel('M 34.2 32.8 L 33 24.5 C 32 20.5 30.5 19 28 19.5', blue)}
          {vessel('M 22 46 C 22.5 42 24.5 39 25.2 35 L 26.5 24.5', blue)}
          {vessel('M 29.5 46 C 29 42 26.5 39 25.2 35', blue)}
          <Path
            d="M 26 26 C 20.5 22.5 20.5 17.5 23.3 17.5 C 24.8 17.5 25.7 18.6 26 19.3 C 26.4 18.5 27.3 17.5 28.8 17.5 C 31.5 17.5 31.5 22.5 26 26 Z"
            fill={red}
            {...o(0.8)}
          />
          <Path
            d="M 26 26 C 20.5 22.5 20.5 17.5 23.3 17.5 C 24.8 17.5 25.7 18.6 26 19.3 C 26.4 18.5 27.3 17.5 28.8 17.5 C 31.5 17.5 31.5 22.5 26 26 Z"
            fill={url(ids.round)}
          />
        </>
      );
      break;
    }
    default:
      return null;
  }
  const microscope = [
    'amoeba',
    'paramecium',
    'budding yeast',
    'quartz sand grain',
    'air bubble on a slide',
  ].includes(icon);
  return (
    <G>
      <Defs>
        <RadialGradient id={ids.round} cx="0.35" cy="0.3" r="0.8" fx="0.3" fy="0.25">
          <Stop offset="0" stopColor={c.shine} stopOpacity={0.45 * c.sheen} />
          <Stop offset="0.5" stopColor={c.shine} stopOpacity={0} />
          <Stop offset="1" stopColor={c.shade} stopOpacity={0.22} />
        </RadialGradient>
        {/* The field darkens toward the edge of the eyepiece. */}
        <RadialGradient id={ids.field} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0.7" stopColor={c.shade} stopOpacity={0} />
          <Stop offset="1" stopColor={c.shade} stopOpacity={0.3} />
        </RadialGradient>
        <Glass id={ids.glass} />
        <TopLight id={ids.light} />
        {microscope ? (
          <ClipPath id={ids.clip}>
            <Circle cx={24} cy={24} r={20.5} />
          </ClipPath>
        ) : null}
      </Defs>
      {art}
    </G>
  );
}
