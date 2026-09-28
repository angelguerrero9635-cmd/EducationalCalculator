import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, space, usePalette, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { Ball, FloorShadow, TopLight, url, usePaintIds } from '../reps/paint';
import { BoldArrow, Chip } from './figuresR4b';

/**
 * An open hand seen from above, fingertips at (x, y) pointing along `angle` degrees (0 is to
 * the right), a sleeve behind it. Curled (`fist`), it holds a string.
 */
function Hand({
  x,
  y,
  angle,
  fist,
  c,
}: {
  x: number;
  y: number;
  angle: number;
  fist?: boolean;
  c: Palette;
}) {
  const reach = fist ? 7 : 16;
  return (
    <G transform={`translate(${x} ${y}) rotate(${angle})`}>
      <Rect x={-66} y={-11} width={24} height={22} rx={5} fill={c.blockBlue} />
      <Path
        d={`M -32 -13 Q -26 -24 -16 -22`}
        stroke={c.skin}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />
      {[-8.5, -2.8, 2.8, 8.5].map((dy, i) => (
        <Rect
          key={dy}
          x={-18}
          y={dy - 2.8}
          width={reach + 2 - (i === 3 ? 3 : 0)}
          height={5.6}
          rx={2.8}
          fill={c.skin}
          stroke={c.skinBrown}
          strokeWidth={0.8}
        />
      ))}
      <Rect
        x={-44}
        y={-13}
        width={30}
        height={26}
        rx={10}
        fill={c.skin}
        stroke={c.skinBrown}
        strokeWidth={0.8}
      />
    </G>
  );
}

/**
 * A rubber ball on a wooden floor, seen from above, and a hand pushing it. From behind, the
 * still ball rolls ahead; from the front, a rolling ball slows and stops (or rolls back when
 * the push is hard); from the side, it turns. A pull is a string from the hand to the ball.
 * The force arrow starts at the hand: a hard push is a longer, thicker arrow and a longer
 * trail. Faded balls along a dotted trail show where the ball goes.
 */
export function Push({ push }: { push: NonNullable<Scene['push']> }) {
  const c = usePalette();
  const ids = usePaintIds('floor', 'ball');
  return (
    <Canvas aspect={0.64}>
      {({ w, h }) => {
        const r = 22;
        const hard = push.strength === 'hard';
        const top = space.sm;
        const bottom = h - 42;
        const ball = { x: push.pull ? w * 0.26 : w * 0.4, y: (top + bottom) / 2 - 6 };
        const reach = hard ? w * 0.44 : w * 0.26;
        // Faded balls a ball's width apart along the trail: more for a hard push.
        const count = hard ? 3 : 2;
        const force = hard ? 78 : 44;
        const thick = hard ? 8 : 4;
        // A ball pushed from the front or side was already rolling ahead (to the right).
        const rolling = !push.pull && push.from !== 'behind';
        let ghosts: { x: number; y: number }[] = [];
        let path: string | undefined;
        let hand: { x: number; y: number; angle: number };
        let arrow: [number, number, number, number];
        let word: { x: number; y: number; anchor: 'start' | 'middle' | 'end' };
        let note: string | undefined;
        if (push.pull) {
          hand = { x: ball.x + r + 96, y: ball.y, angle: 180 };
          arrow = [hand.x + 50, ball.y - r - 18, hand.x + 50 + force, ball.y - r - 18];
          word = { x: hand.x + 50, y: ball.y - r - 30, anchor: 'start' };
        } else if (push.from === 'behind') {
          hand = { x: ball.x - r, y: ball.y, angle: 0 };
          arrow = [ball.x - r - 62, ball.y - r - 18, ball.x - r - 62 + force, ball.y - r - 18];
          word = { x: ball.x - r - 62, y: ball.y - r - 30, anchor: 'start' };
          ghosts = Array.from({ length: count }, (_, k) => ({
            x: ball.x + (reach * (k + 1)) / count,
            y: ball.y,
          }));
          path = `M ${ball.x + r + 2} ${ball.y} L ${ball.x + reach} ${ball.y}`;
        } else if (push.from === 'front') {
          hand = { x: ball.x + r, y: ball.y, angle: 180 };
          arrow = [ball.x + r + 62, ball.y - r - 18, ball.x + r + 62 - force, ball.y - r - 18];
          word = { x: ball.x + r + 62, y: ball.y - r - 30, anchor: 'end' };
          if (hard) {
            // It rolls back the way it came, on a lower line.
            const back = { x: ball.x - w * 0.28, y: ball.y + 46 };
            ghosts = [0.45, 1].map((k) => ({
              x: ball.x + (back.x - ball.x) * k,
              y: ball.y + (back.y - ball.y) * Math.sqrt(k),
            }));
            path = `M ${ball.x - 4} ${ball.y + r} Q ${ball.x - 20} ${back.y} ${back.x} ${back.y}`;
          } else {
            note = 'stops';
          }
        } else {
          hand = { x: ball.x, y: ball.y + r, angle: -90 };
          arrow = [ball.x - r - 16, ball.y + r + 58, ball.x - r - 16, ball.y + r + 58 - force];
          word = { x: ball.x - r - 24, y: ball.y + r + 56, anchor: 'end' };
          // Pushed from the side while rolling ahead: the path bends away from the push.
          const turn = hard ? 76 : 52;
          const end = { x: ball.x + reach, y: ball.y - turn };
          const at = (t: number) => ({
            x: (1 - t) ** 2 * ball.x + 2 * (1 - t) * t * (ball.x + reach * 0.55) + t * t * end.x,
            y: (1 - t) ** 2 * ball.y + 2 * (1 - t) * t * ball.y + t * t * end.y,
          });
          ghosts = (hard ? [0.45, 0.75, 1] : [0.55, 1]).map(at);
          path = `M ${ball.x + r} ${ball.y} Q ${ball.x + reach * 0.55} ${ball.y} ${end.x} ${end.y}`;
        }
        const drawBall = (x: number, y: number, opacity = 1) => (
          <G opacity={opacity}>
            <FloorShadow cx={x + 4} cy={y + r - 2} rx={r * 0.9} ry={5} />
            <Circle cx={x} cy={y} r={r} fill={url(ids.ball)} />
            {/* the rubber seam */}
            <Path
              d={`M ${x - r * 0.7} ${y - r * 0.7} Q ${x + r * 0.25} ${y - r * 0.1} ${x - r * 0.1} ${y + r * 0.98}`}
              stroke={c.shade}
              strokeOpacity={0.3}
              strokeWidth={1.5}
              fill="none"
            />
          </G>
        );
        return (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={ids.floor} strength={0.8} />
              <Ball id={ids.ball} color={c.blockRed} />
            </Defs>
            {/* a wooden floor, inset from the card's edges */}
            <Rect
              x={space.lg}
              y={top}
              width={w - 2 * space.lg}
              height={bottom - top}
              rx={12}
              fill={c.wood}
            />
            {Array.from({ length: Math.floor((bottom - top) / 24) }, (_, i) => {
              const y = top + (i + 1) * 24;
              const joint = space.lg + ((i * 97) % (w - 2 * space.lg - 40)) + 20;
              return (
                <G key={i}>
                  <Line
                    x1={space.lg}
                    y1={y}
                    x2={w - space.lg}
                    y2={y}
                    stroke={c.woodDark}
                    strokeOpacity={0.35}
                  />
                  <Line
                    x1={joint}
                    y1={y - 24}
                    x2={joint}
                    y2={y}
                    stroke={c.woodDark}
                    strokeOpacity={0.3}
                  />
                </G>
              );
            })}
            <Rect
              x={space.lg}
              y={top}
              width={w - 2 * space.lg}
              height={bottom - top}
              rx={12}
              fill={url(ids.floor)}
            />
            {rolling ? (
              <G>
                <Path
                  d={`M ${ball.x - w * 0.3} ${ball.y} L ${ball.x - r - 6} ${ball.y}`}
                  stroke={c.paper}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray="1 8"
                />
                {drawBall(ball.x - w * 0.2, ball.y, 0.25)}
                <Chip x={space.lg + 84} y={top + 22} text="was rolling this way" c={c} />
              </G>
            ) : null}
            {path ? (
              <Path
                d={path}
                stroke={c.paper}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="1 8"
                fill="none"
              />
            ) : null}
            {ghosts.map((g, i) => (
              <G key={i}>{drawBall(g.x, g.y, 0.5 - (i * 0.3) / Math.max(1, ghosts.length - 1))}</G>
            ))}
            {push.pull ? (
              <G>
                {/* speed marks: the ball starts toward the hand */}
                {[-8, 0, 8].map((dy) => (
                  <Line
                    key={dy}
                    x1={ball.x - r - 22}
                    y1={ball.y + dy}
                    x2={ball.x - r - 8}
                    y2={ball.y + dy}
                    stroke={c.paper}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                ))}
                <Line
                  x1={ball.x + r - 1}
                  y1={ball.y}
                  x2={hand.x - 4}
                  y2={ball.y}
                  stroke={c.furDark}
                  strokeWidth={2.2}
                />
              </G>
            ) : null}
            {drawBall(ball.x, ball.y)}
            <Hand x={hand.x} y={hand.y} angle={hand.angle} fist={push.pull} c={c} />
            <BoldArrow
              x1={arrow[0]}
              y1={arrow[1]}
              x2={arrow[2]}
              y2={arrow[3]}
              color={c.chartHighlight}
              width={thick}
            />
            <Chip
              x={word.x + (word.anchor === 'start' ? 18 : word.anchor === 'end' ? -18 : 0)}
              y={word.y}
              text={push.pull ? 'pull' : 'push'}
              c={c}
            />
            {note ? <Chip x={ball.x} y={ball.y - r - 12} text={note} c={c} /> : null}
            <ChartText
              x={w / 2}
              y={h - 12}
              fontSize={chart.value}
              fontWeight="600"
              textAnchor="middle"
            >
              {`${hard ? 'hard' : 'gentle'} ${push.pull ? 'pull' : 'push'}`}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}
