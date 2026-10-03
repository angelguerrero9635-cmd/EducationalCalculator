/**
 * HC163 `ligandGrid` (LigandGridSpec in typesHe4k.ts): adhesion ligands seen from above on a
 * square grid at spacing d, a cell's edge lying over the upper part, a ring of the threshold's
 * radius around one ligand under the cell, and focal-adhesion plaques under the cell when
 * d ≤ the threshold. A scale bar in nm. No handles.
 */
import { View } from 'react-native';
import { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { LigandGridSpec } from '@/data/modules/typesHe4k';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Caption, ChartText } from './common';
import { Board } from './fluidKit';
import { LIGAND_ASPECT, ligandPlaques, ligandSpacing, ligandWindow } from './he4kMath';
import { n3, useReader } from './he4kKit';
import { url, usePaintIds } from './paint';

const X0 = 10;
const X1 = 330;
const Y0 = 30;
const H = 246;

export function LigandGrid({ spec, calc }: { spec: LigandGridSpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('clip');
  const { get, text, say } = useReader(calc);
  const density = get(spec.density);
  const thr = get(spec.threshold ?? 70) ?? 70;
  const ok = density !== undefined && density > 0;
  const d = ok ? ligandSpacing(density) : undefined;
  const win = ligandWindow(d ?? 100, LIGAND_ASPECT);
  const scale = (X1 - X0) / win.width;
  const cellPx = (win.width / win.cols) * scale;
  const Y1 = Y0 + win.rows * cellPx;
  const cellRows = Math.ceil(win.rows * 0.55);
  const adhere = d !== undefined && d <= thr;
  const plaques = d === undefined ? [] : ligandPlaques(d, thr, win.cols, cellRows);
  const ringRow = Math.floor(cellRows / 2);
  const ringCol = Math.floor(win.cols / 2);
  const dot = (i: number) => X0 + (i + 0.5) * cellPx;
  const row = (j: number) => Y0 + (j + 0.5) * cellPx;
  const R = thr * scale;
  const inRing = (i: number, j: number) =>
    (i !== ringCol || j !== ringRow) && Math.hypot(i - ringCol, j - ringRow) * cellPx <= R + 1e-6;
  const neighbours =
    d === undefined ? 0 : countWithin(win.cols, win.rows, ringCol, ringRow, thr / d);
  // The cell's leading edge: a gentle wave between the cell's last row and the next.
  const edgeY = Y0 + cellRows * cellPx;
  const amp = Math.min(10, cellPx * 0.35);
  let edge = `M ${X0 - 2} ${Y0 - 2} L ${X0 - 2} ${edgeY}`;
  for (let k = 0; k <= 32; k++) {
    const x = X0 - 2 + ((X1 - X0 + 4) * k) / 32;
    edge += ` L ${x.toFixed(1)} ${(edgeY + amp * Math.sin((k / 32) * Math.PI * 3)).toFixed(1)}`;
  }
  edge += ` L ${X1 + 2} ${Y0 - 2} Z`;
  // The scale bar: the largest 1, 2 or 5 × 10ⁿ nm within a fifth of the window.
  const p10 = 10 ** Math.floor(Math.log10(win.width / 5));
  const bar = [5, 2, 1].map((m) => m * p10).find((b) => b <= win.width / 5) ?? p10;
  const barPx = bar * scale;

  const lines: string[] = [];
  if (d === undefined) lines.push('Type the ligand density to lay out the grid.');
  else {
    lines.push(
      `d = 1000 ÷ √density = 1000 ÷ √${text(spec.density, '', false)} = ${say(spec.spacing, d, 'nm')} between ligands on a square grid: ${formatNumber(win.cols * win.rows)} dots on ${n3((win.width * win.height) / 1e6)} μm² is ${n3(density!)} per μm².`,
    );
    lines.push(
      adhere
        ? `d ≤ ${n3(thr)} nm: the ring of radius ${n3(thr)} nm around one ligand takes in ${neighbours} neighbours, so integrins cluster and focal adhesions form (purple).`
        : `d > ${n3(thr)} nm: no other ligand lies within ${n3(thr)} nm of this one, so integrins can’t cluster and no focal adhesions form.`,
    );
  }

  return (
    <View>
      <Board
        height={H}
        draw={() => (
          <G>
            <Defs>
              <ClipPath id={ids.clip}>
                <Rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />
              </ClipPath>
            </Defs>
            <Rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill={c.he4kSubstrate} />
            <G clipPath={url(ids.clip)}>
              {d !== undefined
                ? Array.from({ length: win.rows }, (_, j) =>
                    Array.from({ length: win.cols }, (_, i) => (
                      <Circle
                        key={`l${i}-${j}`}
                        cx={dot(i)}
                        cy={row(j)}
                        r={Math.max(1.6, Math.min(4, cellPx * 0.18))}
                        fill={c.he4kLigand}
                        stroke={adhere && inRing(i, j) ? c.chartInk : 'none'}
                        strokeWidth={1}
                      />
                    )),
                  )
                : null}
              {plaques.map(([j, a, b]) => (
                <Rect
                  key={`q${j}`}
                  x={dot(a) - cellPx * 0.35}
                  y={row(j) - Math.max(3, cellPx * 0.22)}
                  width={dot(b) - dot(a) + cellPx * 0.7}
                  height={Math.max(6, cellPx * 0.44)}
                  rx={Math.max(3, cellPx * 0.22)}
                  fill={c.he4kPlaque}
                  opacity={0.7}
                />
              ))}
              <Path d={edge} fill={c.he4kCell} opacity={0.45} />
              <Path d={edge} fill="none" stroke={c.he4kCellEdge} strokeWidth={chart.stroke} />
              {d !== undefined ? (
                <Circle
                  cx={dot(ringCol)}
                  cy={row(ringRow)}
                  r={R}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                  strokeDasharray={chart.dash}
                />
              ) : null}
            </G>
            <Rect
              x={X0}
              y={Y0}
              width={X1 - X0}
              height={Y1 - Y0}
              fill="none"
              stroke={c.chartInk}
              strokeWidth={1}
            />
            {d !== undefined ? (
              <ChartText
                x={dot(ringCol) + Math.min(R, X1 - dot(ringCol) - 4) * 0.71 + 4}
                y={Math.max(Y0 + 14, row(ringRow) - Math.min(R, row(ringRow) - Y0) * 0.71)}
                fontWeight="700"
                halo
              >
                {`${n3(thr)} nm`}
              </ChartText>
            ) : null}
            <ChartText
              x={X1 - 6}
              y={Y0 + 16}
              textAnchor="end"
              fontWeight="700"
              fill={c.he4kCellEdge}
              halo
            >
              Cell
            </ChartText>
            {/* Header: spacing and density. */}
            {d !== undefined ? (
              <ChartText x={X0} y={18} fontWeight="700">
                {`d = ${say(spec.spacing, d, 'nm')}`}
              </ChartText>
            ) : null}
            {ok ? (
              <ChartText x={X1} y={18} textAnchor="end">
                {`${text(spec.density, '', false)} ligands per μm²`}
              </ChartText>
            ) : null}
            {/* Scale bar and the verdict. */}
            <Line
              x1={X0}
              y1={Y1 + 14}
              x2={X0 + barPx}
              y2={Y1 + 14}
              stroke={c.chartInk}
              strokeWidth={chart.strokeHeavy}
            />
            <ChartText x={X0 + barPx + 6} y={Y1 + 18}>
              {`${formatNumber(bar)} nm`}
            </ChartText>
            {d !== undefined ? (
              <ChartText
                x={X1}
                y={Y1 + 18}
                textAnchor="end"
                fontWeight="700"
                fill={adhere ? c.he4kPlaque : c.chartMuted}
              >
                {adhere ? `Adhesions form: d ≤ ${n3(thr)} nm` : `No adhesions: d > ${n3(thr)} nm`}
              </ChartText>
            ) : null}
          </G>
        )}
      />
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

/** Grid points within `r` squares of (ci, cj) in a cols × rows window, the centre left out. */
function countWithin(cols: number, rows: number, ci: number, cj: number, r: number) {
  let n = 0;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++)
      if ((i !== ci || j !== cj) && Math.hypot(i - ci, j - cj) <= r + 1e-9) n++;
  return n;
}
