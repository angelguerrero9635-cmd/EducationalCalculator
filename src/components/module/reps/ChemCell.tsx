/**
 * A galvanic cell as a calculator picture (H108 part 5, `chemDiagram` mode `cell`): the metals
 * whose standard reduction potentials the page holds, drawn by the cell figure (the anode on the
 * left, its meter reading the page's E°cell), and under it the potentials on a scale from −3 V
 * to +1 V with every metal of the table ticked, the two in the cell lit and the gap between them
 * bracketed: E°cell = E°cathode − E°anode.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { CellMetal } from '@/data/modules/typesHsj';
import type { ChemDiagramHs3eSpec } from '@/data/modules/typesHs3e';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { CELL_METALS } from '../layouts/galvanic';
import { GalvanicFigure } from '../layouts/galvanicFigure';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { arrowHead, reader } from './graphKit';

type Spec = Extract<ChemDiagramHs3eSpec, { mode: 'cell' }>;

const METALS = Object.keys(CELL_METALS) as CellMetal[];

/** The metal whose standard reduction potential is `e` (V), if the table has one. */
export const metalWithPotential = (e: number) =>
  METALS.find((m) => Math.abs(CELL_METALS[m].potential - e) < 0.005);

/** A potential as printed: 2 decimals, a true minus. */
const volts = (v: number) => v.toFixed(2).replace('-', '−');

export function ChemCell({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ec = read(spec.cathode);
  const ea = read(spec.anode);
  const v = spec.voltage === undefined ? undefined : read(spec.voltage);
  const mc = ec.known ? metalWithPotential(ec.value) : undefined;
  const ma = ea.known ? metalWithPotential(ea.value) : undefined;
  const ok = !!mc && !!ma && ec.value > ea.value;
  // While a potential is "?" (or the cathode is not the higher), zinc and copper draw faded.
  const [anode, cathode]: [CellMetal, CellMetal] = ok ? [ma!, mc!] : ['Zn', 'Cu'];
  const E = v?.known ? v.value : ok ? ec.value - ea.value : undefined;
  const reading = ok && E !== undefined ? `${volts(E)} V` : '?';

  const scale = (w: number, h: number) => {
    // Room on the right for silver's label beside its dot.
    const pl = 20;
    const pr = w - 52;
    const y = h - 30;
    const X = (e: number) => pl + ((e + 3) / 4) * (pr - pl);
    const ticks = [-3, -2, -1, 0, 1];
    const lit = c.chartHighlight;
    const [xa, xc] = [X(CELL_METALS[anode].potential), X(CELL_METALS[cathode].potential)];
    return (
      <Svg width={w} height={h}>
        <Line x1={pl} y1={y} x2={pr} y2={y} stroke={c.chartInk} strokeWidth={1.2} />
        {ticks.map((t) => (
          <G key={t}>
            <Line x1={X(t)} y1={y} x2={X(t)} y2={y + 5} stroke={c.chartInk} strokeWidth={1} />
            <ChartText
              x={X(t)}
              y={y + 18}
              textAnchor="middle"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              {t === 0 ? '0 V' : t > 0 ? `+${t}` : `−${-t}`}
            </ChartText>
          </G>
        ))}
        {METALS.map((m) => (
          <Circle key={m} cx={X(CELL_METALS[m].potential)} cy={y} r={2.5} fill={c.chartMuted} />
        ))}
        <G opacity={ok ? 1 : 0.35}>
          {(
            [
              [anode, xa, 'anode'],
              [cathode, xc, 'cathode'],
            ] as const
          ).map(([m, x, role]) => {
            const text =
              role === 'anode'
                ? `${m} ${ok ? volts(ea.value) : '?'}`
                : `${m} ${ok ? volts(ec.value) : '?'}`;
            const at = fitLabel(x, text, chart.label, w, role === 'anode' ? 'end' : 'start', 4);
            return (
              <G key={role}>
                <Circle cx={x} cy={y} r={5} fill={lit} />
                <ChartText
                  x={at.x}
                  y={y - 10}
                  textAnchor={at.textAnchor}
                  fontSize={chart.label}
                  fontWeight="700"
                >
                  {text}
                </ChartText>
              </G>
            );
          })}
          {/* The gap, anode to cathode: E°cell. */}
          <Line x1={xa} y1={y - 30} x2={xc - 6} y2={y - 30} stroke={lit} strokeWidth={1.6} />
          <Path d={arrowHead(xc, y - 30, 1, 0, 7)} fill={lit} />
          <Line x1={xa} y1={y - 36} x2={xa} y2={y - 24} stroke={lit} strokeWidth={1.2} />
          <ChartText
            x={(xa + xc) / 2}
            y={y - 38}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
            fill={lit}
          >
            {`E°cell = ${E === undefined || !ok ? '?' : `${volts(E)} V`}`}
          </ChartText>
        </G>
      </Svg>
    );
  };

  const caption = ok
    ? [
        `${CELL_METALS[anode].name} (${volts(ea.value)} V) has the lower reduction potential, so it is the anode: it is oxidized and its electrons flow through the wire to ${CELL_METALS[cathode].name.toLowerCase()}, the cathode (${volts(ec.value)} V).`,
        `E°cell = E°cathode − E°anode = ${volts(ec.value)} − (${volts(ea.value)}) = ${E === undefined ? '?' : volts(E)} V.`,
      ].join(' · ')
    : mc && ma
      ? 'The cathode needs the higher reduction potential: swap the two metals. Zinc and copper are drawn faded.'
      : 'Pick two potentials from the table (Mg −2.37, Al −1.66, Zn −0.76, Fe −0.44, Ni −0.25, Pb −0.13, Cu 0.34, Ag 0.80 V) to build the cell.';

  return (
    <View>
      <View style={{ opacity: ok ? 1 : 0.4 }}>
        <GalvanicFigure scene={{ metals: [anode, cathode] }} reading={reading} />
      </View>
      <Canvas aspect={(w) => 92 / w}>{({ w, h }) => scale(w, h)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
