/**
 * A branched alkane (H101 part 9b), the `branches` option of lewisStructure's hydrocarbon mode:
 * the main chain of `carbons` drawn like the straight chain (every C–H bond a line), and a
 * methyl group, CH₃, hung on a bond below each carbon a `branches` position names (a second on
 * the same carbon goes above). The name gives the lowest positions ("2,2-dimethylpropane"),
 * so isomers of one formula can be set side by side.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { G, Line } from 'react-native-svg';

import type { LewisStructureSpec } from '@/data/modules/typesHsi';
import { usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { subscript } from './chem';
import { branchCounts, branchedHydrogens, branchedName, branchProblem } from './chemHs2d';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';

type Spec = Extract<LewisStructureSpec, { mode: 'hydrocarbon' }>;

export function BranchedAlkane({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const branches = spec.branches ?? [];
  const nr = read(spec.carbons);
  const n = Math.max(3, Math.min(8, Math.round(nr.value)));
  const problem = branchProblem(n, branches);
  const counts = branchCounts(n, branches);
  const hs = branchedHydrogens(n, branches);
  const total = n + branches.length;
  const formula = `C${total}H${2 * total + 2}`;
  const name = branchedName(n, branches);
  const up = counts.some((k) => k > 1);

  const art = (w: number, h: number): ReactNode => {
    const sp = Math.min(64, (w - 40) / (n + 1));
    const x0 = w / 2 - ((n - 1) * sp) / 2;
    const hl = Math.min(34, sp * 0.95);
    const drop = hl + 30;
    const y = up ? drop + 22 : 40;
    const fs = sp < 44 ? 16 : 20;
    const line = (
      xa: number,
      ya: number,
      xb: number,
      yb: number,
      k: string,
      off = 0,
      pad = fs * 0.55,
    ) => {
      const len = Math.hypot(xb - xa, yb - ya);
      const [ux, uy] = [(xb - xa) / len, (yb - ya) / len];
      return (
        <Line
          key={k}
          x1={xa + ux * pad - uy * off}
          y1={ya + uy * pad + ux * off}
          x2={xb - ux * pad - uy * off}
          y2={yb - uy * pad + ux * off}
          stroke={c.chartInk}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      );
    };
    const letter = (x: number, yy: number, t: string, k: string, muted = false) => (
      <ChartText
        key={k}
        x={x}
        y={yy + fs * 0.36}
        fontSize={fs}
        fontWeight={muted ? '600' : '700'}
        textAnchor="middle"
        fill={muted ? c.chartMuted : c.chartInk}
      >
        {t}
      </ChartText>
    );
    const parts: ReactNode[] = [];
    for (let i = 0; i < n; i++) {
      const x = x0 + i * sp;
      parts.push(letter(x, y, 'C', `c${i}`));
      if (i < n - 1) parts.push(line(x, y, x + sp, y, `cc${i}`));
      // Methyl groups: the first below, a second above.
      const k = counts[i]!;
      const methyls = [1, -1].slice(0, k);
      for (const dir of methyls) {
        const my = y + dir * drop;
        parts.push(line(x, y, x, my, `m${i}${dir}`, 0, fs * 0.6));
        parts.push(
          <ChartText
            key={`mt${i}${dir}`}
            x={x}
            y={my + fs * 0.36}
            fontSize={fs}
            fontWeight="700"
            textAnchor="middle"
          >
            CH₃
          </ChartText>,
        );
      }
      // Hydrogens where the methyl groups left room: ends outward, then up, then down.
      const end = i === 0 ? -1 : i === n - 1 ? 1 : 0;
      const free: [number, number][] = [
        ...(end ? ([[end, 0]] as [number, number][]) : []),
        ...(k < 2 ? ([[0, -1]] as [number, number][]) : []),
        ...(k < 1 ? ([[0, 1]] as [number, number][]) : []),
      ];
      free.slice(0, hs[i]).forEach(([dx, dy], j) => {
        const hx = x + dx * hl;
        const hy = y + dy * hl;
        parts.push(line(x, y, hx, hy, `h${i}-${j}`));
        parts.push(letter(hx, hy, 'H', `ht${i}-${j}`, true));
      });
    }
    return (
      <Svg width={w} height={h}>
        <G opacity={nr.known && !problem ? 1 : 0.4}>{parts}</G>
      </Svg>
    );
  };

  const height = (up ? 2 : 1) * 64 + 90;
  return (
    <View>
      <Canvas aspect={(w) => height / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>
        {problem
          ? `No such branched alkane: ${problem}.`
          : nr.known
            ? [
                `${name[0]!.toUpperCase()}${name.slice(1)}, ${subscript(formula)}: a chain of ${n} carbons with ${branches.length} methyl group${branches.length === 1 ? '' : 's'}.`,
                `Carbons = ${n} + ${branches.length} = ${total}; hydrogens = 2 × ${total} + 2 = ${2 * total + 2}.`,
                'Every carbon makes 4 bonds and every hydrogen 1.',
              ].join(' · ')
            : 'Type the number of carbons in the main chain.'}
      </Caption>
    </View>
  );
}
