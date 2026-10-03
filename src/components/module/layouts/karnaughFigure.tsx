/**
 * HC184 (`typesHe4n.ts`): the `karnaugh` explore figure. `map` draws a scene's K-map and its
 * truth table (reps/Karnaugh.tsx), the scene's groups ringed (or, left out, the minimal sum of
 * products), with “f = …” written under the drawing. `table` draws a truth table with a column
 * per expression, the lit columns on a band with an edge (not by colour alone); two lit
 * columns are compared row by row, each row where they differ marked ≠. Flat.
 */
import Svg, { G, Line, Rect } from 'react-native-svg';

import type { KarnaughFigure, KarnaughScene } from '@/data/modules/typesHe4n';
import { chart, usePalette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { textW } from '../reps/he3dKit';
import { KMapDrawing, kmapLayout, sigmaOf } from '../reps/Karnaugh';
import { columnOf, cubeOf, minimalCover, sopOf, type Cube } from '../reps/karnaughMath';

/** The scene's groups as cubes (the minimal cover when it names none; a bad group is left out). */
export function sceneGroups(s: KarnaughScene): Cube[] {
  const n = s.names.length;
  if (!s.groups) return minimalCover(n, s.minterms ?? [], s.dontCares ?? []);
  return s.groups.flatMap((g) => {
    const q = cubeOf(g, n);
    return q ? [q] : [];
  });
}

const SOP_H = 24;

export function KarnaughFigureView({
  figure,
  scene,
}: {
  figure: KarnaughFigure;
  scene: KarnaughScene;
}) {
  if (figure.mode === 'table') return <TableFigure scene={scene} />;
  const n = scene.names.length;
  const groups = sceneGroups(scene);
  return (
    <Canvas aspect={(w) => (kmapLayout(n, w, groups.length).h + SOP_H) / w}>
      {({ w, h }) => (
        <Svg width={w} height={h}>
          <MapFigure scene={scene} groups={groups} w={w} h={h} />
        </Svg>
      )}
    </Canvas>
  );
}

function MapFigure({
  scene,
  groups,
  w,
  h,
}: {
  scene: KarnaughScene;
  groups: Cube[];
  w: number;
  h: number;
}) {
  const c = usePalette();
  const ones = scene.minterms ?? [];
  const dcs = scene.dontCares ?? [];
  return (
    <G>
      <KMapDrawing
        n={scene.names.length}
        names={scene.names}
        ones={ones}
        dcs={dcs}
        groups={groups}
        w={w}
      />
      <ChartText
        x={w / 2}
        y={h - 8}
        textAnchor="middle"
        fontSize={chart.value}
        fontWeight="700"
        fill={c.chartInk}
      >
        {`f = ${sigmaOf(ones, dcs)} = ${sopOf(groups, scene.names)}`}
      </ChartText>
    </G>
  );
}

// ─── Truth-table mode ────────────────────────────────────────────────────────

const ROW = 22;
const HEAD = 26;

/** The table's columns: the variables, then the scene's expressions, each with its width. */
export function truthTableLayout(scene: KarnaughScene, w: number) {
  const heads = [...scene.names, ...(scene.columns ?? [])];
  const widths = heads.map((hd) => Math.max(26, textW(hd, chart.label, true) + 14));
  const compare = (scene.lit ?? []).length === 2;
  const markW = compare ? 26 : 0;
  const total = widths.reduce((a, b) => a + b, 0) + markW;
  const x0 = Math.max(4, (w - total) / 2);
  const xs = widths.map((_, i) => x0 + widths.slice(0, i).reduce((a, b) => a + b, 0));
  const rows = 1 << scene.names.length;
  return {
    heads,
    widths,
    xs,
    x0,
    total,
    markX: x0 + total - markW,
    compare,
    rows,
    h: HEAD + rows * ROW + (compare ? 28 : 8),
  };
}

function TableFigure({ scene }: { scene: KarnaughScene }) {
  return (
    <Canvas aspect={(w) => truthTableLayout(scene, w).h / w}>
      {({ w, h }) => (
        <Svg width={w} height={h}>
          <TableDrawing scene={scene} w={w} />
        </Svg>
      )}
    </Canvas>
  );
}

function TableDrawing({ scene, w }: { scene: KarnaughScene; w: number }) {
  const c = usePalette();
  const L = truthTableLayout(scene, w);
  const n = scene.names.length;
  const cols = [
    ...scene.names.map((_, i) => Array.from({ length: L.rows }, (__, r) => (r >> (n - 1 - i)) & 1)),
    ...(scene.columns ?? []).map((e) => columnOf(e, scene.names)),
  ];
  const litCols = (scene.lit ?? []).map((i) => n + i);
  const [p, q] = litCols;
  const differ =
    L.compare && p !== undefined && q !== undefined
      ? cols[p]!.map((v, r) => v !== cols[q]![r])
      : [];
  const nDiff = differ.filter(Boolean).length;
  const bottom = HEAD + L.rows * ROW;
  return (
    <G>
      {litCols.map((k) => (
        <G key={`lit${k}`}>
          <Rect
            x={L.xs[k]! + 1}
            y={2}
            width={L.widths[k]! - 2}
            height={bottom - 2}
            fill={c.codeLit}
            stroke={c.codeLitEdge}
            strokeWidth={1.5}
            rx={4}
          />
        </G>
      ))}
      {L.heads.map((hd, k) => (
        <ChartText
          key={`h${k}`}
          x={L.xs[k]! + L.widths[k]! / 2}
          y={HEAD - 9}
          textAnchor="middle"
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartInk}
        >
          {hd}
        </ChartText>
      ))}
      <Line x1={L.x0} y1={HEAD} x2={L.x0 + L.total} y2={HEAD} stroke={c.chartInk} strokeWidth={1} />
      <Line
        x1={L.xs[n]! - 0.5}
        y1={4}
        x2={L.xs[n]! - 0.5}
        y2={bottom}
        stroke={c.chartGrid}
        strokeWidth={1}
      />
      {/* T T first: display row d is minterm rows − 1 − d. */}
      {Array.from({ length: L.rows }, (_, d) => L.rows - 1 - d).map((r, d) => (
        <G key={r}>
          {cols.map((col, k) => (
            <ChartText
              key={k}
              x={L.xs[k]! + L.widths[k]! / 2}
              y={HEAD + d * ROW + 16}
              textAnchor="middle"
              fontSize={chart.value}
              fontWeight={litCols.includes(k) ? '700' : '400'}
              fill={k < n ? c.chartMuted : c.chartInk}
            >
              {col[r] ? 'T' : 'F'}
            </ChartText>
          ))}
          {differ[r] ? (
            <ChartText
              x={L.markX + 13}
              y={HEAD + d * ROW + 16}
              textAnchor="middle"
              fontSize={chart.value}
              fontWeight="700"
              fill={c.codeLitEdge}
            >
              ≠
            </ChartText>
          ) : null}
        </G>
      ))}
      {L.compare ? (
        <ChartText
          x={w / 2}
          y={bottom + 20}
          textAnchor="middle"
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartInk}
        >
          {nDiff === 0
            ? 'The lit columns agree in every row: equivalent.'
            : `The lit columns differ in ${nDiff} of ${L.rows} rows (≠).`}
        </ChartText>
      ) : null}
    </G>
  );
}
