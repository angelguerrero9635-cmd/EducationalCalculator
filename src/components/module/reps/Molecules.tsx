import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Defs } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { MAX_MOLECULES, atomTotal, elementName, parseFormula, subscript } from './chem';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { AtomBall, MoleculeArt, moleculeSize, useAtomPaint } from './MoleculeArt';

type Spec = Extract<Representation, { kind: 'molecules' }>;

const ROW = 26;

/** Rows and columns of molecules, and the bond length that fits them in the canvas. */
function layout(formula: string, n: number, w: number) {
  for (let scale = 40; scale >= 8; scale -= 1) {
    const { w: mw, h: mh } = moleculeSize(formula, scale);
    const cellW = mw + 12;
    const cellH = mh + 12;
    const cols = Math.max(1, Math.min(n, Math.floor((w - 8) / cellW)));
    const rows = Math.ceil(n / cols);
    if (rows * cellH <= Math.min(230, w * 0.55) || scale === 8)
      return { scale, cols, rows, cellW, cellH };
  }
  throw new Error('unreachable');
}

/**
 * Molecules of one substance as ball-and-stick models (Grade 7): `count` of them in rows,
 * then a tally row per element, its ball beside "Hydrogen: 2 × 3 = 6". A single element
 * ("Fe") draws its atoms as balls all of one color. An untyped count draws one faded molecule.
 */
export function Molecules({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const paint = useAtomPaint();
  const count = read(spec.count);
  const n = count.known ? Math.max(0, Math.round(count.value)) : 1;
  const drawn = Math.min(n, MAX_MOLECULES);
  const parts = parseFormula(spec.formula);
  const single = parts.length === 1 && parts[0]!.n === 1;
  const f = subscript(spec.formula);
  const totalText = (el: string, each: number) => {
    const id = spec.atoms?.[el];
    if (id) return rep.known(id) ? rep.value(id, false) : '?';
    return count.known ? formatNumber(each * n) : '?';
  };
  const lines = parts.map(({ el, n: each }) => ({
    el,
    text: `${elementName(el)} atoms: ${each} × ${count.known ? count.text : '?'} = ${totalText(el, each)}`,
  }));

  return (
    <View>
      <Canvas
        aspect={(w) => {
          const g = layout(spec.formula, Math.max(1, drawn), w);
          return (g.rows * g.cellH + 16 + lines.length * ROW + (n > drawn ? 18 : 0)) / w;
        }}
      >
        {({ w, h }) => {
          const g = layout(spec.formula, Math.max(1, drawn), w);
          const x0 = (w - g.cols * g.cellW) / 2;
          const tallyY = g.rows * g.cellH + 8 + (n > drawn ? 18 : 0);
          return (
            <Svg width={w} height={h}>
              <Defs>{paint.defs}</Defs>
              {Array.from({ length: Math.max(1, drawn) }, (_, i) => {
                const row = Math.floor(i / g.cols);
                const inRow = Math.min(g.cols, Math.max(1, drawn) - row * g.cols);
                // A short last row is centered under the others.
                const rx = x0 + ((g.cols - inRow) * g.cellW) / 2;
                return (
                  <MoleculeArt
                    key={i}
                    formula={spec.formula}
                    cx={rx + ((i % g.cols) + 0.5) * g.cellW}
                    cy={(row + 0.5) * g.cellH + 4}
                    scale={g.scale}
                    ids={paint.ids}
                    opacity={count.known && n > 0 ? 1 : 0.3}
                  />
                );
              })}
              {n > drawn ? (
                <ChartText
                  x={w / 2}
                  y={g.rows * g.cellH + 16}
                  fontSize={chart.label}
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  {`${drawn} of the ${formatNumber(n)} drawn`}
                </ChartText>
              ) : null}
              {lines.map((line, k) => {
                const y = tallyY + k * ROW + ROW / 2;
                // The ball, then the text, centered together.
                const tw = line.text.length * chart.value * 0.52;
                const left = Math.max(4, (w - tw - 22) / 2);
                return (
                  <TallyRow key={line.el} el={line.el} bx={left + 8} y={y} ids={paint.ids}>
                    <ChartText x={left + 22} y={y + 4.5} fontSize={chart.value} fontWeight="600">
                      {line.text}
                    </ChartText>
                  </TallyRow>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {count.known
          ? [
              single
                ? `${count.text} ${elementName(spec.formula).toLowerCase()} atom${n === 1 ? '' : 's'}, all ${f}: an element is one kind of atom`
                : `${count.text} ${f} molecule${n === 1 ? '' : 's'}${spec.name ? ` (${spec.name})` : ''}, ${atomTotal(spec.formula)} atoms in each`,
              ...(single ? [] : lines.map((l) => l.text.replace(' atoms:', ' atoms ='))),
            ].join(' · ')
          : `Type how many ${f} ${single ? 'atoms' : 'molecules'}.`}
      </Caption>
    </View>
  );
}

/** A tally row's ball, then its text. */
function TallyRow({
  el,
  bx,
  y,
  ids,
  children,
}: {
  el: string;
  bx: number;
  y: number;
  ids: ReturnType<typeof useAtomPaint>['ids'];
  children: ReactNode;
}) {
  return (
    <>
      <AtomBall el={el} cx={Math.max(10, bx)} cy={y} r={8} ids={ids} symbol={false} />
      {children}
    </>
  );
}
