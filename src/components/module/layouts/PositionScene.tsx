import Svg, { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, usePalette } from '@/theme';

import { Canvas } from '../reps/common';
import { Ball, FloorShadow, TopLight, url, usePaintIds } from '../reps/paint';

type Where = NonNullable<Scene['position']>;

/** Canvas height: the room from the floor to just over the ball held above the box. */
const H = 258;

/**
 * A cardboard box on a small wooden table and a red rubber ball placed by the position word,
 * with a child seen from behind at the front left: the viewer, so "in front of" (nearer the
 * child, lower and larger, over the box) and "behind" (farther, smaller, mostly hidden) have a
 * point of view. "Above" leaves a clear gap over the lid, with the ball's shadow dashed on it;
 * "below" puts the ball on the floor under the table, under the box.
 */
export function PositionScene({ where }: { where: Where }) {
  const c = usePalette();
  const ids = usePaintIds('front', 'ball', 'wood');
  return (
    <Canvas aspect={(w) => H / w}>
      {({ w, h }) => {
        const floorY = h - 20;
        // The table: its top's front edge at `tt`, receding up and right by (dx, dy).
        const TW = Math.min(250, w * 0.68);
        const tx = Math.min(w - TW / 2 - 30 - 12, w * 0.6);
        const tl = tx - TW / 2;
        const tt = floorY - 84;
        const [dx, dy] = [30, -26];
        const top = 9;
        // The box: front face from (bx, by) to (bx + BW, by + BH), receding by (ex, ey).
        const [BW, BH] = [94, 64];
        const [ex, ey] = [22, -16];
        const bx = tl + 30;
        const by = tt - 5 - BH;
        const lidY = by + ey / 2;
        const lidX = bx + BW / 2 + ex / 2;

        // Where the ball goes; it rests on the table or the floor except when held above.
        const ball: { x: number; y: number; r: number; rest?: number } =
          where === 'above'
            ? { x: lidX, y: by + ey - 20 - 20, r: 20 }
            : where === 'below'
              ? { x: tx + dx / 2, y: floorY - 8 - 20, r: 20, rest: floorY - 8 }
              : where === 'beside'
                ? { x: bx + BW + ex + 16 + 20, y: tt - 13 - 20, r: 20, rest: tt - 13 }
                : where === 'in front of'
                  ? { x: bx + BW * 0.62, y: tt - 1 - 24, r: 24, rest: tt - 1 }
                  : // Behind: at the back of the table, mostly hidden by the box.
                    { x: bx + BW + ex - 2, y: tt - 23 - 16, r: 16, rest: tt - 23 };

        const ballNode = (
          <G>
            {ball.rest !== undefined ? (
              <FloorShadow cx={ball.x + 3} cy={ball.rest} rx={ball.r * 0.9} ry={ball.r * 0.2} />
            ) : null}
            <Circle
              cx={ball.x}
              cy={ball.y}
              r={ball.r}
              fill={url(ids.ball)}
              stroke={c.chartInk}
              strokeOpacity={0.55}
              strokeWidth={1.2}
            />
            {/* The ball's moulded seam, curving round it. */}
            <Path
              d={`M ${ball.x - ball.r * 0.98} ${ball.y + ball.r * 0.1} Q ${ball.x} ${ball.y + ball.r * 0.62} ${ball.x + ball.r * 0.98} ${ball.y + ball.r * 0.1}`}
              fill="none"
              stroke={c.shade}
              strokeOpacity={0.25}
              strokeWidth={1.2}
            />
          </G>
        );

        const legW = 9;
        const leg = (x: number, y0: number, y1: number, back = false) => (
          <Rect
            x={x}
            y={y0}
            width={legW}
            height={y1 - y0}
            rx={2}
            fill={back ? c.woodDark : c.wood}
            stroke={c.woodDark}
            strokeWidth={1}
          />
        );

        const table = (
          <G>
            <FloorShadow cx={tx + dx / 2} cy={floorY - 6} rx={TW / 2 + 14} ry={9} />
            {/* Back legs, then the top, then the front legs. */}
            {leg(tl + dx + 6, tt + dy + top, floorY - 12, true)}
            {leg(tl + TW + dx - legW - 6, tt + dy + top, floorY - 12, true)}
            <Path
              d={`M ${tl} ${tt} L ${tl + TW} ${tt} L ${tl + TW + dx} ${tt + dy} L ${tl + dx} ${tt + dy} Z`}
              fill={c.wood}
              stroke={c.woodDark}
              strokeWidth={1}
            />
            <Path
              d={`M ${tl} ${tt} L ${tl + TW} ${tt} L ${tl + TW + dx} ${tt + dy} L ${tl + dx} ${tt + dy} Z`}
              fill={c.shine}
              fillOpacity={0.18 * c.sheen}
            />
            <Path
              d={`M ${tl + TW} ${tt} L ${tl + TW + dx} ${tt + dy} v ${top} L ${tl + TW} ${tt + top} Z`}
              fill={c.woodDark}
            />
            <Rect
              x={tl}
              y={tt}
              width={TW}
              height={top}
              fill={c.wood}
              stroke={c.woodDark}
              strokeWidth={1}
            />
            <Rect x={tl} y={tt} width={TW} height={top} fill={url(ids.wood)} />
            {leg(tl + 5, tt + top, floorY)}
            {leg(tl + TW - legW - 5, tt + top, floorY)}
          </G>
        );

        const box = (
          <G>
            <FloorShadow cx={bx + BW / 2 + ex / 2 + 4} cy={tt - 6} rx={BW / 2 + 12} ry={6} />
            {/* The right side, in shade. */}
            <Path
              d={`M ${bx + BW} ${by} l ${ex} ${ey} v ${BH} l ${-ex} ${-ey} Z`}
              fill={c.boxKraftDark}
              stroke={c.boxKraftDark}
              strokeLinejoin="round"
            />
            {/* The lid: two flaps meeting at a taped seam. */}
            <Path
              d={`M ${bx} ${by} l ${ex} ${ey} h ${BW} l ${-ex} ${-ey} Z`}
              fill={c.boxKraft}
              stroke={c.boxKraftDark}
              strokeLinejoin="round"
            />
            <Path
              d={`M ${bx} ${by} l ${ex} ${ey} h ${BW} l ${-ex} ${-ey} Z`}
              fill={c.shine}
              fillOpacity={0.22 * c.sheen}
            />
            <Path
              d={`M ${bx + ex / 2 + 3} ${lidY - 3} h ${BW - 3} l 2 4 h ${-BW + 1} Z`}
              fill={c.boxTape}
              fillOpacity={0.9}
            />
            <Path d={`M ${bx + ex / 2} ${lidY} h ${BW}`} stroke={c.boxKraftDark} strokeWidth={1} />
            {/* The tape runs over the edge and down the side. */}
            <Path
              d={`M ${bx + BW + ex / 2} ${lidY - 3} l 3 0 v 16 l -3 1 Z`}
              fill={c.boxTape}
              fillOpacity={0.9}
            />
            {/* The front, lit from above, with the corrugated edge at the top. */}
            <Rect x={bx} y={by} width={BW} height={BH} fill={c.boxKraft} stroke={c.boxKraftDark} />
            <Rect x={bx} y={by} width={BW} height={BH} fill={url(ids.front)} />
            <Path
              d={`M ${bx + 3} ${by + 3} h ${BW - 6}`}
              stroke={c.boxKraftDark}
              strokeOpacity={0.5}
              strokeDasharray="1.5 2"
            />
            {/* A printed "this way up" arrow pair. */}
            <Path
              d={`M ${bx + 14} ${by + BH - 14} v -14 m -5 6 l 5 -6 l 5 6 M ${bx + 26} ${by + BH - 14} v -14 m -5 6 l 5 -6 l 5 6`}
              fill="none"
              stroke={c.boxKraftDark}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        );

        // The viewer: a child from behind, looking at the table.
        const kx = Math.max(30, tl - 34);
        const kTop = floorY - 118;
        const child = (
          <G>
            <FloorShadow cx={kx + 3} cy={floorY} rx={24} ry={5} />
            {/* Legs and shoes. */}
            <Rect x={kx - 13} y={floorY - 46} width={11} height={42} rx={4} fill={c.blockBlue} />
            <Rect x={kx + 2} y={floorY - 46} width={11} height={42} rx={4} fill={c.blockBlue} />
            <Ellipse cx={kx - 7} cy={floorY - 3} rx={8} ry={4} fill={c.rubber} />
            <Ellipse cx={kx + 8} cy={floorY - 3} rx={8} ry={4} fill={c.rubber} />
            {/* Arms, then the shirt. */}
            <Rect x={kx - 25} y={kTop + 34} width={10} height={40} rx={5} fill={c.orange} />
            <Rect x={kx + 15} y={kTop + 34} width={10} height={40} rx={5} fill={c.orange} />
            <Circle cx={kx - 20} cy={kTop + 76} r={5} fill={c.skin} />
            <Circle cx={kx + 20} cy={kTop + 76} r={5} fill={c.skin} />
            <Path
              d={`M ${kx - 20} ${kTop + 40} Q ${kx - 20} ${kTop + 30} ${kx - 8} ${kTop + 30} H ${kx + 8} Q ${kx + 20} ${kTop + 30} ${kx + 20} ${kTop + 40} V ${floorY - 42} H ${kx - 20} Z`}
              fill={c.orange}
            />
            <Rect
              x={kx - 20}
              y={kTop + 30}
              width={40}
              height={floorY - 42 - kTop - 30}
              fill={url(ids.front)}
            />
            {/* Neck, ears and the back of the head. */}
            <Rect x={kx - 5} y={kTop + 22} width={10} height={10} fill={c.skin} />
            <Circle cx={kx - 15} cy={kTop + 15} r={4} fill={c.skin} />
            <Circle cx={kx + 15} cy={kTop + 15} r={4} fill={c.skin} />
            <Circle cx={kx} cy={kTop + 13} r={15} fill={c.furDark} />
            <Path
              d={`M ${kx - 9} ${kTop + 5} q 6 -6 14 -3`}
              fill="none"
              stroke={c.shine}
              strokeOpacity={0.25 * c.sheen}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </G>
        );

        const behind = where === 'behind';
        const onFloor = where === 'below';
        return (
          <Svg
            width={w}
            height={h}
            accessibilityLabel={`A ball ${where === 'beside' ? 'beside' : where} a box on a table`}
          >
            <Defs>
              <TopLight id={ids.front} />
              <TopLight id={ids.wood} strength={1.4} />
              <Ball id={ids.ball} color={c.ballRed} />
            </Defs>
            {/* The floor. */}
            <Rect x={0} y={floorY - 14} width={w} height={h - floorY + 14} fill={c.chartSurface} />
            <Path d={`M 0 ${floorY - 14} H ${w}`} stroke={c.chartGrid} strokeWidth={chart.stroke} />
            {onFloor ? ballNode : null}
            {table}
            {behind ? ballNode : null}
            {box}
            {where === 'above' ? (
              // The ball's shadow on the lid, dashed: the ball is over the box, not on it.
              <Ellipse
                cx={lidX}
                cy={lidY}
                rx={15}
                ry={5}
                fill={c.shadow}
                stroke={c.chartMuted}
                strokeDasharray={chart.dashFine}
              />
            ) : null}
            {!behind && !onFloor ? ballNode : null}
            {child}
          </Svg>
        );
      }}
    </Canvas>
  );
}
