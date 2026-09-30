import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { ImmuneStage } from '@/data/modules/typesHsh';
import { chart, usePalette } from '@/theme';

import { ChartText } from '../reps/common';
import { Ball, url, usePaintIds } from '../reps/paint';
import { Board, CurveArrow, textW } from './earthKit';

type Pt = [number, number];

/** Each stage's box (for its ring), its label and its arrows. */
const STAGES: {
  stage: ImmuneStage;
  box: [number, number, number, number];
  labels: { text: string; at: Pt }[];
  arrows: [Pt, Pt, number][];
}[] = [
  {
    stage: 'antigen',
    box: [4, 26, 188, 92],
    labels: [
      { text: 'virus', at: [28, 110] },
      { text: 'macrophage shows antigen', at: [150, 110] },
    ],
    arrows: [[[58, 60], [96, 60], 0]],
  },
  {
    stage: 'helperT',
    box: [252, 16, 78, 76],
    labels: [{ text: 'helper T cell', at: [291, 28] }],
    arrows: [[[186, 62], [262, 62], 0]],
  },
  {
    stage: 'bCells',
    box: [182, 138, 150, 76],
    labels: [
      { text: 'plasma cell', at: [220, 206] },
      { text: 'B cell', at: [305, 206] },
    ],
    arrows: [
      [[292, 86], [302, 146], 0],
      [[284, 168], [248, 168], 0],
    ],
  },
  {
    stage: 'antibodies',
    box: [4, 138, 176, 76],
    labels: [
      { text: 'clumped viruses', at: [55, 206] },
      { text: 'antibodies', at: [140, 206] },
    ],
    arrows: [
      [[194, 168], [166, 168], 0],
      [[114, 168], [88, 168], 0],
    ],
  },
  {
    stage: 'killerT',
    box: [126, 228, 230, 80],
    labels: [
      { text: 'infected cell dies', at: [190, 300] },
      { text: 'killer T cell', at: [305, 300] },
    ],
    arrows: [
      [[318, 80], [328, 238], -46],
      [[282, 258], [222, 258], 0],
    ],
  },
  {
    stage: 'memory',
    box: [4, 228, 118, 80],
    labels: [{ text: 'memory cells', at: [62, 300] }],
    arrows: [],
  },
];

/**
 * The immune response in stages, left to right and down: a virus and a macrophage that eats it
 * and shows its antigen; a helper T cell that recognizes the antigen; a B cell that divides into
 * plasma cells; antibodies that clump the viruses; a killer T cell that destroys an infected
 * cell; and the memory B and T cells that stay. The cells are painted; the arrows stay flat. A
 * scene lights one stage (ringed, the rest faded); with none, the whole response.
 */
export function ImmuneStagesFigure({ stage }: { stage?: ImmuneStage }) {
  const c = usePalette();
  const ids = usePaintIds('virus', 'macro', 'b', 't', 'body', 'plasma');
  const ink = c.chartInk;

  const virus = (x: number, y: number, r = 7): ReactNode => (
    <G key={`v${x}-${y}`}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <Circle
            key={i}
            cx={x + (r + 2.5) * Math.cos(a)}
            cy={y + (r + 2.5) * Math.sin(a)}
            r={1.6}
            fill={c.virusSpike}
          />
        );
      })}
      <Circle cx={x} cy={y} r={r} fill={url(ids.virus)} stroke={ink} strokeWidth={0.8} />
    </G>
  );
  const cell = (x: number, y: number, r: number, fill: string, memory = false): ReactNode => (
    <G key={`c${x}-${y}`}>
      {memory ? (
        <Circle
          cx={x}
          cy={y}
          r={r + 4}
          fill="none"
          stroke={ink}
          strokeWidth={1}
          strokeDasharray="3 2"
        />
      ) : null}
      <Circle cx={x} cy={y} r={r} fill={fill} stroke={ink} strokeWidth={1.1} />
      <Circle cx={x - r * 0.1} cy={y + r * 0.05} r={r * 0.5} fill={c.purple} fillOpacity={0.55} />
    </G>
  );
  const antibody = (x: number, y: number, a = 0, s = 1): ReactNode => (
    <Path
      key={`y${x}-${y}`}
      d={`M ${x} ${y + 6 * s} L ${x} ${y} L ${x - 4.5 * s} ${y - 5 * s} M ${x} ${y} L ${x + 4.5 * s} ${y - 5 * s}`}
      stroke={c.antibody}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      transform={`rotate(${a} ${x} ${y})`}
    />
  );
  const tReceptors = (x: number, y: number, r: number): ReactNode =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      return (
        <Path
          key={`r${x}-${i}`}
          d={`M ${x + r * Math.cos(a)} ${y + r * Math.sin(a)} l ${3 * Math.cos(a)} ${3 * Math.sin(a)}`}
          stroke={ink}
          strokeWidth={1.4}
        />
      );
    });

  const drawings: Record<ImmuneStage, ReactNode> = {
    antigen: (
      <G>
        {virus(24, 44)}
        {virus(46, 70)}
        {virus(20, 86, 6)}
        {/* The macrophage, a pseudopod round a virus, an antigen piece shown on its surface. */}
        <Path
          d="M 100 62 C 100 40 118 30 140 32 C 164 30 184 42 182 62 C 184 84 162 94 140 92 C 124 92 112 86 106 76 C 112 74 116 70 116 62 C 116 54 112 50 106 48 C 102 52 100 56 100 62 Z"
          fill={url(ids.macro)}
          stroke={ink}
          strokeWidth={1.2}
        />
        {virus(106, 62, 6)}
        <Ellipse cx={150} cy={66} rx={10} ry={8} fill={c.purple} fillOpacity={0.5} />
        <Path d="M 164 36 L 168 27" stroke={ink} strokeWidth={1.4} />
        <Rect
          x={164}
          y={21}
          width={8}
          height={6}
          rx={2}
          fill={c.virusSpike}
          stroke={ink}
          strokeWidth={0.6}
        />
      </G>
    ),
    helperT: (
      <G>
        {tReceptors(291, 62, 20)}
        {cell(291, 62, 20, url(ids.t))}
      </G>
    ),
    bCells: (
      <G>
        {[0, 1, 2, 3, 4, 5].map((i) =>
          antibody(
            305 + 21 * Math.cos((i / 6) * Math.PI * 2),
            168 + 21 * Math.sin((i / 6) * Math.PI * 2),
            (i / 6) * 360 + 90,
            0.7,
          ),
        )}
        {cell(305, 168, 18, url(ids.b))}
        <Ellipse
          cx={220}
          cy={168}
          rx={25}
          ry={19}
          fill={url(ids.plasma)}
          stroke={ink}
          strokeWidth={1.1}
        />
        <Path
          d="M 204 160 q 8 -4 16 0 t 14 0 M 204 168 q 8 -4 16 0 t 14 0 M 206 176 q 8 -4 16 0 t 12 0"
          stroke={ink}
          strokeWidth={0.7}
          fill="none"
          opacity={0.6}
        />
        <Circle cx={212} cy={168} r={6} fill={c.purple} fillOpacity={0.55} />
      </G>
    ),
    antibodies: (
      <G>
        {antibody(128, 160, -20)}
        {antibody(150, 174, 15)}
        {antibody(140, 186, -5, 0.8)}
        {virus(40, 158)}
        {virus(66, 162)}
        {virus(50, 182)}
        {antibody(53, 164, 0, 0.8)}
        {antibody(43, 172, 150, 0.8)}
        {antibody(62, 176, 210, 0.8)}
      </G>
    ),
    killerT: (
      <G>
        {tReceptors(305, 258, 20)}
        {cell(305, 258, 20, url(ids.t))}
        <Circle
          cx={190}
          cy={258}
          r={28}
          fill={url(ids.body)}
          stroke={ink}
          strokeWidth={1.2}
          strokeDasharray="8 3"
        />
        <Circle cx={184} cy={260} r={9} fill={c.purple} fillOpacity={0.45} />
        {virus(198, 246, 4.5)}
        {virus(202, 268, 4.5)}
        {virus(176, 242, 4.5)}
      </G>
    ),
    memory: (
      <G>
        {cell(40, 258, 15, url(ids.b), true)}
        {cell(86, 258, 15, url(ids.t), true)}
      </G>
    ),
  };

  return (
    <Board height={312}>
      <Defs>
        <Ball id={ids.virus} color={c.virusCoat} />
        <Ball id={ids.macro} color={c.immuneMacrophage} />
        <Ball id={ids.b} color={c.immuneBCell} />
        <Ball id={ids.t} color={c.immuneTCell} />
        <Ball id={ids.body} color={c.fat} />
        <Ball id={ids.plasma} color={c.immuneBCell} />
      </Defs>
      {STAGES.map((s) => {
        const on = stage === s.stage;
        const faded = stage !== undefined && !on;
        return (
          <G key={s.stage} opacity={faded ? 0.35 : 1}>
            {on ? (
              <Rect
                x={s.box[0]}
                y={s.box[1]}
                width={s.box[2]}
                height={s.box[3]}
                rx={12}
                fill={c.chartHighlight}
                fillOpacity={0.1}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
              />
            ) : null}
            {drawings[s.stage]}
            {s.arrows.map(([a, b, bend], i) => (
              <CurveArrow
                key={i}
                a={a}
                b={b}
                bend={bend}
                on={on}
                c={c}
                color={on ? undefined : c.chartInk}
                width={on ? undefined : chart.strokeLight}
                halo={false}
                faint={1}
              />
            ))}
            {s.labels.map((l) => (
              <ChartText
                key={l.text}
                x={Math.max(textW(l.text, chart.label) / 2 + 2, l.at[0])}
                y={l.at[1]}
                fontSize={chart.label}
                fontWeight={on ? '700' : '500'}
                textAnchor="middle"
                fill={on ? c.chartHighlight : c.chartInk}
              >
                {l.text}
              </ChartText>
            ))}
          </G>
        );
      })}
    </Board>
  );
}
