/**
 * The `trussJoint` card figure (HC27, `typesHe2i.ts`): one truss joint on a sort card, 96 × 72,
 * its members in the card's text colour, a load pushing on it and a pin under it in the shade.
 * Flat. It never marks which members carry nothing: that is the card's question.
 */
import { Circle, G, Line, Path, Polygon } from 'react-native-svg';

import { TRUSS_CARD_H, TRUSS_CARD_W, type TrussJointCard } from '@/data/modules/typesHe2i';
import { chart } from '@/theme';

/** Where the joint sits: lower when the members only go up, higher with a support under it. */
export function trussCardJoint(f: TrussJointCard): [number, number] {
  const ups = f.members.map((a) => Math.sin((a * Math.PI) / 180));
  const allUp = ups.every((u) => u > -0.2);
  const y = f.support ? 32 : allUp ? 50 : ups.every((u) => u < 0.2) ? 22 : TRUSS_CARD_H / 2;
  return [TRUSS_CARD_W / 2, y];
}

export const TRUSS_CARD_MEMBER = 28;
const LOAD = 22;

export function TrussJointCardView({
  f,
  ink,
  shade,
}: {
  f: TrussJointCard;
  ink: string;
  shade: string;
}) {
  const [x, y] = trussCardJoint(f);
  const at = (deg: number, r: number) => {
    const t = (deg * Math.PI) / 180;
    return [x + r * Math.cos(t), y - r * Math.sin(t)] as const;
  };
  const head = (deg: number) => {
    // The load's arrowhead touches the joint; its tail is out on the side the force comes from.
    const t = (deg * Math.PI) / 180;
    const [ux, uy] = [Math.cos(t), -Math.sin(t)];
    const tip = [x - ux * 8, y - uy * 8];
    const [px, py] = [-uy * 4, ux * 4];
    const b = [tip[0]! - ux * 8, tip[1]! - uy * 8];
    return `M ${tip[0]} ${tip[1]} L ${b[0]! + px} ${b[1]! + py} L ${b[0]! - px} ${b[1]! - py} Z`;
  };
  return (
    <G>
      {f.members.map((deg, i) => {
        const [ex, ey] = at(deg, TRUSS_CARD_MEMBER);
        return (
          <Line
            key={i}
            x1={x}
            y1={y}
            x2={ex}
            y2={ey}
            stroke={ink}
            strokeWidth={chart.strokeHeavy}
            strokeLinecap="round"
          />
        );
      })}
      {f.support ? (
        <G>
          <Polygon
            points={`${x},${y + 4} ${x - 9},${y + 20} ${x + 9},${y + 20}`}
            fill="none"
            stroke={shade}
            strokeWidth={chart.strokeLight}
          />
          {f.support === 'roller' ? (
            <>
              <Circle cx={x - 5} cy={y + 24} r={3} fill="none" stroke={shade} />
              <Circle cx={x + 5} cy={y + 24} r={3} fill="none" stroke={shade} />
            </>
          ) : null}
          <Line
            x1={x - 14}
            x2={x + 14}
            y1={y + (f.support === 'roller' ? 28 : 21)}
            y2={y + (f.support === 'roller' ? 28 : 21)}
            stroke={shade}
            strokeWidth={chart.strokeLight}
          />
        </G>
      ) : null}
      {f.load !== undefined
        ? (() => {
            const [tx, ty] = at(f.load + 180, 8 + LOAD);
            const [bx, by] = at(f.load + 180, 14);
            return (
              <G>
                <Line x1={tx} y1={ty} x2={bx} y2={by} stroke={shade} strokeWidth={2.4} />
                <Path d={head(f.load)} fill={shade} />
              </G>
            );
          })()
        : null}
      <Circle cx={x} cy={y} r={4.5} fill={shade} stroke={ink} strokeWidth={1.4} />
    </G>
  );
}
