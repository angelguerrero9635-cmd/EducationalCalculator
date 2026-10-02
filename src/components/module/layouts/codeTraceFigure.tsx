/**
 * HC48 (`typesHe3d.ts`): the `codeTrace` explore figure and the `code` card figure.
 *
 * The figure draws a short program in MATLAB and Python side by side (stacked when a line is too
 * long for half the width), each line numbered, the line running now lit in both on a band with
 * an edge (not by colour alone), and under them the loop's test with this pass's numbers and the
 * variables table so far, its last row lit. The card is a few lines of code on a code panel.
 * Code keeps its straight quotes and spaces. Flat, a code font throughout.
 */
import Svg, { G, Rect } from 'react-native-svg';

import type { CodeCard, CodeTraceFigure, CodeTraceScene } from '@/data/modules/typesHe3d';
import { CODE_LINE_H, codeCardSize } from '@/data/modules/typesHe3d';
import { chart, usePalette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { CodeText, monoW } from '../reps/he3dKit';

const PAD = 8;
const LH = 19;
const HEAD = 20;
const GUTTER = 22;
const ROW = 21;
/** Table rows shown; past it the first rows give way to "…". */
const MAX_ROWS = 7;

/** The panes and where they sit, for a canvas `w` wide. */
export function codeTraceLayout(f: CodeTraceFigure, w: number) {
  const panes = [
    ...(f.matlab ? [{ lang: 'MATLAB', lines: f.matlab }] : []),
    ...(f.python ? [{ lang: 'Python', lines: f.python }] : []),
  ];
  const longest = Math.max(1, ...panes.flatMap((p) => p.lines.map((l) => l.length)));
  const need = GUTTER + monoW(longest) + 10;
  const sideBySide = panes.length === 2 && need <= (w - 3 * PAD) / 2;
  const paneW = sideBySide ? (w - 3 * PAD) / 2 : w - 2 * PAD;
  const paneH = (p: { lines: string[] }) => HEAD + p.lines.length * LH + 6;
  const boxes = panes.map((p, i) => {
    const x = sideBySide ? PAD + i * (paneW + PAD) : PAD;
    const y = sideBySide ? PAD : PAD + panes.slice(0, i).reduce((s, q) => s + paneH(q) + PAD, 0);
    return { ...p, x, y, w: paneW, h: paneH(p) };
  });
  const codeBottom = Math.max(
    ...boxes.map((b) => b.y + (sideBySide ? Math.max(...boxes.map((q) => q.h)) : b.h)),
  );
  return { boxes, sideBySide, need, codeBottom, paneW };
}

/** The figure's height for a scene (the code, the test line and the table). */
export function codeTraceHeight(f: CodeTraceFigure, scene: CodeTraceScene, w: number) {
  const { codeBottom } = codeTraceLayout(f, w);
  const rows = Math.min(scene.rows.length, MAX_ROWS) + (scene.rows.length > MAX_ROWS ? 1 : 0);
  return codeBottom + (scene.test ? 26 : 8) + (rows + 1) * ROW + PAD;
}

export function CodeTraceFigureView({
  figure,
  scene,
}: {
  figure: CodeTraceFigure;
  scene: CodeTraceScene;
}) {
  return (
    <Canvas aspect={(w) => codeTraceHeight(figure, scene, w) / w}>
      {({ w, h }) => (
        <Svg width={w} height={h}>
          <CodeTraceDrawing f={figure} scene={scene} w={w} />
        </Svg>
      )}
    </Canvas>
  );
}

function CodeTraceDrawing({
  f,
  scene,
  w,
}: {
  f: CodeTraceFigure;
  scene: CodeTraceScene;
  w: number;
}) {
  const c = usePalette();
  const { boxes, sideBySide, codeBottom } = codeTraceLayout(f, w);
  const tallest = Math.max(...boxes.map((b) => b.h));
  let y = codeBottom + 8;
  const test = scene.test;
  const testY = y + 12;
  if (test) y += 26;
  // The table: a pass column, then one per variable, centred.
  const cols = ['pass', ...f.vars];
  const colW = Math.min(64, (w - 2 * PAD) / cols.length);
  const tx = (w - colW * cols.length) / 2;
  const shown =
    scene.rows.length > MAX_ROWS
      ? scene.rows.slice(scene.rows.length - (MAX_ROWS - 1)).map((r, i, all) => ({
          r,
          pass: scene.rows.length - all.length + i,
        }))
      : scene.rows.map((r, i) => ({ r, pass: i }));
  const skipped = scene.rows.length > MAX_ROWS;
  return (
    <G>
      {boxes.map((b) => {
        const lit = b.lang === 'Python' ? (scene.pyLine ?? scene.line) : scene.line;
        const h = sideBySide ? tallest : b.h;
        return (
          <G key={b.lang}>
            <Rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={h}
              rx={6}
              fill={c.chartSurface}
              stroke={c.chartGrid}
              strokeWidth={1}
            />
            <ChartText
              x={b.x + 8}
              y={b.y + 14}
              fontSize={chart.label}
              fontWeight="700"
              fill={c.chartMuted}
            >
              {b.lang}
            </ChartText>
            {b.lines.map((line, i) => {
              const ly = b.y + HEAD + i * LH;
              const on = lit === i + 1;
              return (
                <G key={i}>
                  {on ? (
                    <G>
                      <Rect x={b.x + 1} y={ly} width={b.w - 2} height={LH} fill={c.codeLit} />
                      <Rect x={b.x + 1} y={ly} width={3} height={LH} fill={c.codeLitEdge} />
                    </G>
                  ) : null}
                  <ChartText
                    x={b.x + GUTTER - 4}
                    y={ly + 14}
                    textAnchor="end"
                    fontSize={chart.label}
                    fill={c.chartMuted}
                  >
                    {String(i + 1)}
                  </ChartText>
                  <CodeText
                    x={b.x + GUTTER + 2}
                    y={ly + 14}
                    code={line}
                    fill={c.chartInk}
                    bold={on}
                  />
                </G>
              );
            })}
          </G>
        );
      })}
      {test ? (
        <G>
          <ChartText
            x={PAD}
            y={testY + 4}
            fontSize={chart.label}
            fontWeight="700"
            fill={c.chartInk}
          >
            Test:
          </ChartText>
          <CodeText x={PAD + 40} y={testY + 4} code={test.text} fill={c.chartInk} bold />
          <ChartText
            x={PAD + 40 + monoW(test.text.length) + 8}
            y={testY + 4}
            fontSize={chart.label}
            fontWeight="700"
            fill={test.holds ? c.chartInk : c.codeLitEdge}
          >
            {test.holds ? '→ true: the body runs' : '→ false: the loop ends'}
          </ChartText>
        </G>
      ) : null}
      {/* The variables table. */}
      {cols.map((name, j) => (
        <G key={name}>
          <Rect
            x={tx + j * colW}
            y={y}
            width={colW}
            height={ROW}
            fill={c.chartFill}
            stroke={c.chartGrid}
            strokeWidth={1}
          />
          {j === 0 ? (
            <ChartText
              x={tx + colW / 2}
              y={y + 15}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
            >
              {name}
            </ChartText>
          ) : (
            <CodeText
              x={tx + j * colW + colW / 2}
              y={y + 15}
              anchor="middle"
              code={name}
              fill={c.chartInk}
              bold
            />
          )}
        </G>
      ))}
      {skipped ? (
        <ChartText x={tx + 6} y={y + ROW + 15} fontSize={chart.label} fill={c.chartMuted}>
          …
        </ChartText>
      ) : null}
      {shown.map(({ r, pass }, i) => {
        const ry = y + ROW * (i + 1 + (skipped ? 1 : 0));
        const last = i === shown.length - 1;
        return (
          <G key={pass}>
            {[pass === 0 ? 'start' : String(pass), ...r.map(String)].map((cell, j) => (
              <G key={j}>
                <Rect
                  x={tx + j * colW}
                  y={ry}
                  width={colW}
                  height={ROW}
                  fill={last ? c.codeLit : c.chartSurface}
                  stroke={last ? c.codeLitEdge : c.chartGrid}
                  strokeWidth={last ? 1.5 : 1}
                />
                <ChartText
                  x={tx + j * colW + colW / 2}
                  y={ry + 15}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight={last ? '700' : '400'}
                  fill={j === 0 ? c.chartMuted : c.chartInk}
                >
                  {cell}
                </ChartText>
              </G>
            ))}
          </G>
        );
      })}
    </G>
  );
}

/** The code card's size. */
export const codeCardFigureSize = (f: CodeCard) => codeCardSize(f.code);

/** A code card: the lines on a code panel, in the card's ink. */
export function CodeCardView({ f, ink }: { f: CodeCard; ink: string }) {
  const c = usePalette();
  const [w, h] = codeCardSize(f.code);
  const lines = f.code.split('\n');
  return (
    <G>
      <Rect
        x={1}
        y={1}
        width={w - 2}
        height={h - 2}
        rx={5}
        fill={c.chartSurface}
        stroke={c.chartGrid}
        strokeWidth={1}
      />
      {lines.map((l, i) => (
        <CodeText key={i} x={7} y={6 + (i + 1) * CODE_LINE_H - 4} code={l} fill={ink} />
      ))}
    </G>
  );
}
