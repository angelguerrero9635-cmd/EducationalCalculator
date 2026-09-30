/**
 * H33 `organelleEnergy` explore figure (HS group G): a chloroplast (double membrane, stacked
 * thylakoids in grana, the stroma round them) and a mitochondrion (outer membrane, the inner
 * membrane folded into cristae, the matrix inside), drawn in their colors with light from the top
 * left. Glucose and O₂ flow from the chloroplast to the mitochondrion over the top, CO₂ and H₂O
 * flow back under it, sunlight comes in and ATP goes out to the cell's work. A scene lights one
 * process or stage: its part of the organelle, its flows, and its equation under the drawing.
 */
import { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { ENERGY_FLOWS, type EnergyProcess, type EnergyScene } from '@/data/modules/typesHsg';
import { chart, usePalette, type Palette } from '@/theme';

import { ChartText } from '../reps/common';
import { Ball, TopLight, url, usePaintIds } from '../reps/paint';
import { BOARD_W, Board, CurveArrow, HaloText } from './earthKit';

const H = 350;
/** The two organelles: centers and radii. */
const CH = { x: 90, y: 158, rx: 74, ry: 46 };
const MI = { x: 280, y: 158, rx: 72, ry: 40 };

/** The equation (or stage summary) under the drawing, one or two lines. */
const EQUATIONS: Record<EnergyProcess, string[]> = {
  cycle: [
    'Photosynthesis: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂',
    'Respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP',
  ],
  photosynthesis: ['6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂'],
  respiration: ['C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP'],
  lightReactions: ['Thylakoids: light + H₂O → O₂ + ATP + NADPH'],
  calvinCycle: ['Stroma: CO₂ + ATP + NADPH → glucose'],
  glycolysis: ['Cytoplasm: glucose → 2 pyruvate + 2 ATP'],
  krebsCycle: ['Matrix: pyruvate → CO₂ + 2 ATP (and NADH)'],
  electronTransport: ['Inner membrane: electrons + O₂ → H₂O; most ATP'],
};

/** The part each stage lights. */
type Part =
  'thylakoids' | 'stroma' | 'matrix' | 'cristae' | 'chloroplast' | 'mitochondrion' | 'cytoplasm';
const PARTS: Record<EnergyProcess, Part[]> = {
  cycle: [],
  photosynthesis: ['chloroplast'],
  respiration: ['mitochondrion', 'cytoplasm'],
  lightReactions: ['thylakoids'],
  calvinCycle: ['stroma'],
  glycolysis: ['cytoplasm'],
  krebsCycle: ['matrix'],
  electronTransport: ['cristae'],
};

export function OrganelleFigure({ energy }: { energy: EnergyScene }) {
  const c = usePalette();
  const ids = usePaintIds('sun', 'light', 'chloro', 'mito');
  const process = energy.process ?? 'cycle';
  const flows = new Set(ENERGY_FLOWS[process]);
  const parts = new Set(PARTS[process]);
  const on = (s: Parameters<typeof flows.has>[0]) => flows.has(s);
  const ring = (s: string) => energy.lit === s;
  // Inside the chloroplast: the thylakoids pass ATP and NADPH to the Calvin cycle.
  const internal = ['cycle', 'photosynthesis', 'lightReactions', 'calvinCycle'].includes(process);
  const eq = EQUATIONS[process];
  return (
    <Board height={H}>
      <Defs>
        <Ball id={ids.sun} color={c.sunDisk} />
        <TopLight id={ids.light} />
      </Defs>
      {/* The cytoplasm round both: the cell they sit in. */}
      <Rect
        x={4}
        y={84}
        width={BOARD_W - 8}
        height={150}
        rx={24}
        fill={c.life}
        opacity={parts.has('cytoplasm') ? 0.32 : 0.12}
        stroke={parts.has('cytoplasm') ? c.chartHighlight : 'none'}
        strokeWidth={chart.strokeHeavy}
      />
      <Sun c={c} fill={url(ids.sun)} />
      <Chloroplast c={c} light={url(ids.light)} parts={parts} />
      <Mitochondrion c={c} light={url(ids.light)} parts={parts} />
      {/* Sunlight into the chloroplast. */}
      <Flow
        a={[46, 50]}
        b={[62, 112]}
        bend={-4}
        label="light"
        at={[60, 70]}
        lit={on('light')}
        ring={ring('light')}
        color={c.sunRay}
        c={c}
      />
      {/* Chloroplast → mitochondrion, over the top. */}
      <Flow
        a={[140, 122]}
        b={[224, 124]}
        bend={22}
        label="glucose"
        at={[182, 116]}
        lit={on('glucose')}
        ring={ring('glucose')}
        c={c}
      />
      <Flow
        a={[112, 114]}
        b={[252, 120]}
        bend={62}
        label="O₂"
        at={[182, 90]}
        lit={on('O₂')}
        ring={ring('O₂')}
        c={c}
      />
      {/* Mitochondrion → chloroplast, underneath. */}
      <Flow
        a={[226, 192]}
        b={[140, 194]}
        bend={22}
        label="CO₂"
        at={[183, 208]}
        lit={on('CO₂')}
        ring={ring('CO₂')}
        c={c}
      />
      <Flow
        a={[254, 196]}
        b={[112, 202]}
        bend={62}
        label="H₂O"
        at={[183, 234]}
        lit={on('H₂O')}
        ring={ring('H₂O')}
        c={c}
      />
      {/* ATP out to the cell's work. */}
      <Flow
        a={[322, 194]}
        b={[334, 262]}
        bend={-6}
        label="ATP → cell work"
        at={[292, 282]}
        lit={on('ATP')}
        ring={ring('ATP')}
        color={c.bioAtp}
        c={c}
      />
      {internal ? (
        <HaloText
          x={CH.x}
          y={CH.y + 4}
          text="ATP, NADPH"
          c={c}
          size={chart.label}
          bold
          halo={c.bioStroma}
          fill={c.chartInk}
        />
      ) : null}
      <ChartText
        x={CH.x - 20}
        y={226}
        fontSize={chart.value}
        fontWeight="700"
        textAnchor="middle"
        fill={c.chartInk}
      >
        Chloroplast
      </ChartText>
      <ChartText
        x={MI.x + 4}
        y={226}
        fontSize={chart.value}
        fontWeight="700"
        textAnchor="middle"
        fill={c.chartInk}
      >
        Mitochondrion
      </ChartText>
      <PartLabels parts={parts} c={c} />
      {eq.map((line, i) => (
        <ChartText
          key={i}
          x={BOARD_W / 2}
          y={H - 38 + i * 20 + (eq.length === 1 ? 10 : 0)}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          fill={c.chartInk}
        >
          {line}
        </ChartText>
      ))}
    </Board>
  );
}

function Sun({ c, fill }: { c: Palette; fill: string }) {
  return (
    <G>
      {Array.from({ length: 8 }, (_, k) => {
        const a = (k * Math.PI) / 4;
        return (
          <Line
            key={k}
            x1={30 + 19 * Math.cos(a)}
            y1={32 + 19 * Math.sin(a)}
            x2={30 + 26 * Math.cos(a)}
            y2={32 + 26 * Math.sin(a)}
            stroke={c.sunRay}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        );
      })}
      <Circle cx={30} cy={32} r={15} fill={fill} />
    </G>
  );
}

function Chloroplast({ c, light, parts }: { c: Palette; light: string; parts: Set<Part> }) {
  const whole = parts.has('chloroplast');
  const stroma = parts.has('stroma');
  const thyl = parts.has('thylakoids');
  // Four grana, each a stack of thylakoid discs, joined by lamellae.
  const grana = [
    [CH.x - 44, CH.y - 6],
    [CH.x - 16, CH.y + 18],
    [CH.x + 16, CH.y - 20],
    [CH.x + 42, CH.y + 10],
  ];
  return (
    <G>
      <Ellipse
        cx={CH.x}
        cy={CH.y}
        rx={CH.rx}
        ry={CH.ry}
        fill={c.bioStroma}
        stroke={whole ? c.chartHighlight : c.lifeDeep}
        strokeWidth={whole ? chart.strokeHeavy + 1 : chart.stroke}
      />
      <Ellipse
        cx={CH.x}
        cy={CH.y}
        rx={CH.rx - 5}
        ry={CH.ry - 5}
        fill={c.bioStroma}
        stroke={stroma ? c.chartHighlight : c.lifeDeep}
        strokeWidth={stroma ? chart.strokeHeavy : 1.2}
      />
      <Path
        d={`M ${grana[0]![0]} ${grana[0]![1]} L ${grana[1]![0]} ${grana[1]![1]} L ${grana[2]![0]} ${grana[2]![1]} L ${grana[3]![0]} ${grana[3]![1]}`}
        stroke={c.bioThylakoid}
        strokeWidth={2}
        fill="none"
        opacity={0.8}
      />
      {grana.map(([x, y], g) => (
        <G key={g}>
          {[0, 1, 2, 3].map((k) => (
            <Rect
              key={k}
              x={x! - 10}
              y={y! - 10 + k * 5.2}
              width={20}
              height={4.4}
              rx={2.2}
              fill={c.bioThylakoid}
              stroke={thyl ? c.chartHighlight : c.lifeDeep}
              strokeWidth={thyl ? 1.6 : 0.6}
            />
          ))}
        </G>
      ))}
      <Ellipse cx={CH.x} cy={CH.y} rx={CH.rx} ry={CH.ry} fill={light} />
    </G>
  );
}

function Mitochondrion({ c, light, parts }: { c: Palette; light: string; parts: Set<Part> }) {
  const whole = parts.has('mitochondrion');
  const matrix = parts.has('matrix');
  const cristae = parts.has('cristae');
  const inner = { rx: MI.rx - 7, ry: MI.ry - 7 };
  // Cristae: folds of the inner membrane reaching in from the top and bottom in turn.
  const folds = Array.from({ length: 7 }, (_, k) => {
    const x = MI.x - 48 + k * 16;
    const edge = inner.ry * Math.sqrt(Math.max(0, 1 - ((x - MI.x) / inner.rx) ** 2));
    const top = k % 2 === 0;
    const y0 = top ? MI.y - edge : MI.y + edge;
    const y1 = top ? MI.y + 8 : MI.y - 8;
    return { x, y0, y1 };
  });
  const membrane = cristae ? c.chartHighlight : c.bioMito;
  return (
    <G>
      <Ellipse
        cx={MI.x}
        cy={MI.y}
        rx={MI.rx}
        ry={MI.ry}
        fill={c.bioMito}
        stroke={whole ? c.chartHighlight : c.chartInk}
        strokeWidth={whole ? chart.strokeHeavy + 1 : 1.2}
      />
      <Ellipse
        cx={MI.x}
        cy={MI.y}
        rx={inner.rx}
        ry={inner.ry}
        fill={c.bioMitoMatrix}
        stroke={matrix ? c.chartHighlight : membrane}
        strokeWidth={matrix || cristae ? chart.strokeHeavy : 2}
      />
      {folds.map(({ x, y0, y1 }, k) => (
        <G key={k}>
          <Line
            x1={x}
            y1={y0}
            x2={x}
            y2={y1}
            stroke={membrane}
            strokeWidth={6}
            strokeLinecap="round"
          />
          <Line
            x1={x}
            y1={y0}
            x2={x}
            y2={y1}
            stroke={c.bioMitoMatrix}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </G>
      ))}
      <Ellipse cx={MI.x} cy={MI.y} rx={MI.rx} ry={MI.ry} fill={light} />
    </G>
  );
}

/** The lit stage's part named beside it. */
function PartLabels({ parts, c }: { parts: Set<Part>; c: Palette }) {
  const labels: [Part, number, number, string][] = [
    ['thylakoids', CH.x - 44, CH.y - 24, 'thylakoids'],
    ['stroma', CH.x + 20, CH.y + 36, 'stroma'],
    ['matrix', MI.x, MI.y + 4, 'matrix'],
    ['cristae', MI.x, MI.y - 46, 'inner membrane'],
    ['cytoplasm', 186, 160, 'cytoplasm'],
  ];
  return (
    <G>
      {labels
        .filter(([p]) => parts.has(p))
        .map(([p, x, y, text]) => (
          <HaloText
            key={p}
            x={x}
            y={y}
            text={text}
            c={c}
            size={chart.label}
            bold
            fill={c.chartHighlight}
          />
        ))}
    </G>
  );
}

/** A flow arrow with its label: lit (heavy, in the highlight or its own color) or faint. */
function Flow({
  a,
  b,
  bend,
  label,
  at,
  lit,
  ring,
  color,
  c,
}: {
  a: [number, number];
  b: [number, number];
  bend: number;
  label: string;
  at: [number, number];
  lit: boolean;
  ring: boolean;
  color?: string;
  c: Palette;
}) {
  const tw = label.length * chart.value * 0.62;
  return (
    <G>
      <CurveArrow
        a={a}
        b={b}
        bend={bend}
        on={lit}
        c={c}
        color={lit ? (color ?? c.chartHighlight) : undefined}
        faint={0.3}
      />
      <G opacity={lit ? 1 : 0.45}>
        <HaloText x={at[0]} y={at[1]} text={label} c={c} bold={lit} />
      </G>
      {ring ? (
        <Rect
          x={at[0] - tw / 2 - 7}
          y={at[1] - 17}
          width={tw + 14}
          height={24}
          rx={12}
          fill="none"
          stroke={c.chartHighlight}
          strokeWidth={chart.stroke}
        />
      ) : null}
    </G>
  );
}
