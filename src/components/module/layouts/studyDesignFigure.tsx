/**
 * The `studyDesign` explore figure (Grades 11–12 statistics): a population of 48 people, the
 * sample a method takes from it, then a survey, an observational study or an experiment with
 * its random assignment to a treatment and a control group. Flat, like every diagram; the
 * people picked are counted exactly (`studyMath.ts`).
 */
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { StudyScene } from '@/data/modules/typesHsb';
import { chart, usePalette } from '@/theme';

import { Canvas, ChartText, fitLabel } from '../reps/common';
import { STUDY_GRID, assignOf, clustersOf, sampleOf, strataOf } from './studyMath';

/** The method in a line under the population (`step`: a systematic sample's gap). */
const methodLine = (method: NonNullable<StudyScene['method']>, step: number) =>
  ({
    'simple random': 'Simple random: picked by chance',
    stratified: 'Stratified: by chance from each band',
    cluster: 'Cluster: whole blocks picked by chance',
    systematic: `Systematic: every ${step}th from a chance start`,
    convenience: 'Convenience: the nearest ones, not by chance',
  })[method];

/** A person: a head and shoulders, centered on (x, y). */
function Person({
  x,
  y,
  s,
  fill,
  ring,
}: {
  x: number;
  y: number;
  s: number;
  fill: string;
  ring?: string;
}) {
  return (
    <G>
      {ring ? (
        <Circle cx={x} cy={y} r={s * 1.25} fill="none" stroke={ring} strokeWidth={1.5} />
      ) : null}
      <Circle cx={x} cy={y - s * 0.42} r={s * 0.3} fill={fill} />
      <Path
        d={`M${x - s * 0.55},${y + s * 0.62} Q${x - s * 0.55},${y - s * 0.02} ${x},${y - s * 0.02} Q${x + s * 0.55},${y - s * 0.02} ${x + s * 0.55},${y + s * 0.62} Z`}
        fill={fill}
      />
    </G>
  );
}

/** An arrow down from (x, y1) to (x, y2), with its label beside it. */
function Down({
  x,
  y1,
  y2,
  text,
  w,
  color,
}: {
  x: number;
  y1: number;
  y2: number;
  text: string;
  w: number;
  color: string;
}) {
  return (
    <G>
      <Line x1={x} y1={y1} x2={x} y2={y2 - 6} stroke={color} strokeWidth={chart.stroke} />
      <Path d={`M${x - 6},${y2 - 8}L${x + 6},${y2 - 8}L${x},${y2}Z`} fill={color} />
      <ChartText
        {...fitLabel(x + 12, text, chart.label, w, 'start', 12)}
        y={(y1 + y2) / 2 + 4}
        fontWeight="600"
        fill={color}
      >
        {text}
      </ChartText>
    </G>
  );
}

export function StudyDesignFigure({ study }: { study: StudyScene }) {
  const c = usePalette();
  const g = STUDY_GRID;
  const method = study.method ?? 'simple random';
  const size = Math.min(24, Math.max(6, study.sample ?? 12));
  const picked = sampleOf(method, g, size);
  const pickedSet = new Set(picked);
  const [treat, control] = assignOf(picked);
  const groups =
    study.groups ??
    (study.design === 'experiment' ? ['Treatment', 'Control'] : ['Group A', 'Group B']);
  // An observational study doesn't assign: people are sorted by what they already do (here,
  // the first ones in reading order do one thing, the rest the other).
  const [own1, own2] =
    study.design === 'observational'
      ? [picked.filter((_, i) => i % 3 !== 2), picked.filter((_, i) => i % 3 === 2)]
      : [treat, control];
  const lit = study.lit;
  return (
    <Canvas aspect={(w) => 440 / w}>
      {({ w, h }) => {
        const pad = 10;
        const popTop = 22;
        const cell = Math.min(40, (w - 2 * pad - 16) / g.cols);
        const rowH = 24;
        const popW = cell * g.cols;
        const popX = (w - popW) / 2;
        const popH = rowH * g.rows + 8;
        const at = (i: number) => ({
          x: popX + (i % g.cols) * cell + cell / 2,
          y: popTop + 4 + Math.floor(i / g.cols) * rowH + rowH / 2,
        });
        const sampleTop = popTop + popH + 62;
        const sampleRow = 26;
        const perRow = Math.min(size, Math.floor((w - 2 * pad) / 24));
        const sampleRows = Math.ceil(picked.length / perRow);
        const sampleH = sampleRows * sampleRow + 8;
        const groupTop = sampleTop + sampleH + 44;
        const ringStage = (x: number, y: number, ww: number, hh: number, on: boolean) => (
          <Rect
            x={x}
            y={y}
            width={ww}
            height={hh}
            rx={10}
            fill={c.chartSurface}
            stroke={on ? c.chartHighlight : c.chartGrid}
            strokeWidth={on ? chart.strokeHeavy : 1}
          />
        );
        const strata = method === 'stratified' ? strataOf(g) : [];
        const clusters = method === 'cluster' ? clustersOf(g) : [];
        const rowOf = (
          list: number[],
          top: number,
          fill: (i: number) => string,
          x0 = pad,
          x1 = w - pad,
        ) => {
          const per = Math.max(1, Math.min(list.length, Math.floor((x1 - x0) / 22)));
          const step = (x1 - x0) / per;
          return list.map((p, j) => (
            <Person
              key={`s${p}`}
              x={x0 + step * (j % per) + step / 2}
              y={top + 16 + Math.floor(j / per) * sampleRow}
              s={16}
              fill={fill(p)}
            />
          ));
        };
        const inTreat = new Set(own1);
        const fillFor = (p: number) =>
          study.design === 'survey'
            ? c.chartHighlight
            : inTreat.has(p)
              ? c.chartHighlight
              : c.chartSecond;
        const half = (w - 3 * pad) / 2;
        return (
          <Svg width={w} height={h}>
            {/* The population, with the method's bands or blocks. */}
            <ChartText x={pad} y={14} fontWeight="700">
              Population: 48 people
            </ChartText>
            {ringStage(popX - 8, popTop, popW + 16, popH, lit === 'population')}
            {strata.map((s, b) => (
              <Rect
                key={`st${b}`}
                x={popX - 4}
                y={at(s[0]!).y - rowH / 2 + 1}
                width={popW + 8}
                height={(s.length / g.cols) * rowH - 2}
                rx={6}
                fill={b % 2 ? c.chartFill : c.chartSurface}
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
            ))}
            {clusters.map((cl, b) => {
              const a = at(cl[0]!);
              const z = at(cl[cl.length - 1]!);
              const whole = cl.every((p) => pickedSet.has(p));
              return (
                <Rect
                  key={`cl${b}`}
                  x={a.x - cell / 2 + 2}
                  y={a.y - rowH / 2 + 1}
                  width={z.x - a.x + cell - 4}
                  height={z.y - a.y + rowH - 2}
                  rx={6}
                  fill="none"
                  stroke={whole ? c.chartHighlight : c.chartMuted}
                  strokeWidth={whole ? chart.stroke : 1}
                  strokeDasharray={whole ? undefined : chart.dashFine}
                />
              );
            })}
            {Array.from({ length: g.cols * g.rows }, (_, i) => {
              const p = at(i);
              const on = pickedSet.has(i);
              return (
                <Person
                  key={`p${i}`}
                  x={p.x}
                  y={p.y}
                  s={16}
                  fill={on ? c.chartHighlight : c.chartMuted}
                />
              );
            })}
            <Down
              x={w / 2 - 70}
              y1={popTop + popH + 22}
              y2={sampleTop - 4}
              text={`sample of ${picked.length}`}
              w={w}
              color={c.chartInk}
            />
            <ChartText
              {...fitLabel(w / 2, methodLine(method, Math.floor(48 / size)), chart.label, w)}
              y={popTop + popH + 16}
              fontWeight="600"
              fill={c.chartHighlight}
            >
              {methodLine(method, Math.floor(48 / size))}
            </ChartText>
            {/* The sample. */}
            {ringStage(pad, sampleTop, w - 2 * pad, sampleH, lit === 'sample')}
            {rowOf(picked, sampleTop, fillFor)}
            {/* The design. */}
            {study.design === 'survey' ? (
              <G>
                <Down
                  x={w / 2}
                  y1={sampleTop + sampleH + 4}
                  y2={groupTop - 4}
                  text="asked the same questions"
                  w={w}
                  color={c.chartInk}
                />
                {ringStage(w / 2 - 70, groupTop, 140, 70, lit === 'groups')}
                {/* A clipboard of questions. */}
                <Rect
                  x={w / 2 - 22}
                  y={groupTop + 10}
                  width={44}
                  height={52}
                  rx={4}
                  fill={c.card}
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                />
                <Rect
                  x={w / 2 - 9}
                  y={groupTop + 6}
                  width={18}
                  height={8}
                  rx={2}
                  fill={c.chartMuted}
                />
                {[0, 1, 2].map((k) => (
                  <G key={`q${k}`}>
                    <Rect
                      x={w / 2 - 15}
                      y={groupTop + 22 + k * 12}
                      width={7}
                      height={7}
                      fill="none"
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <Line
                      x1={w / 2 - 4}
                      y1={groupTop + 26 + k * 12}
                      x2={w / 2 + 15}
                      y2={groupTop + 26 + k * 12}
                      stroke={c.chartMuted}
                      strokeWidth={1.5}
                    />
                  </G>
                ))}
              </G>
            ) : (
              <G>
                <Down
                  x={w / 2}
                  y1={sampleTop + sampleH + 4}
                  y2={groupTop - 4}
                  text={
                    study.design === 'experiment'
                      ? 'assigned at random'
                      : 'sorted by what they already do'
                  }
                  w={w}
                  color={study.design === 'experiment' ? c.chartHighlight : c.chartInk}
                />
                {[own1, own2].map((grp, k) => {
                  const x0 = pad + k * (half + pad);
                  return (
                    <G key={`g${k}`}>
                      {ringStage(
                        x0,
                        groupTop,
                        half,
                        26 +
                          Math.ceil(grp.length / Math.max(1, Math.floor((half - 8) / 22))) *
                            sampleRow,
                        lit === 'groups',
                      )}
                      <ChartText
                        {...fitLabel(x0 + half / 2, `${groups[k]} (${grp.length})`, chart.label, w)}
                        y={groupTop + 16}
                        fontWeight="700"
                      >
                        {`${groups[k]} (${grp.length})`}
                      </ChartText>
                      {rowOf(grp, groupTop + 16, fillFor, x0 + 4, x0 + half - 4)}
                    </G>
                  );
                })}
              </G>
            )}
          </Svg>
        );
      }}
    </Canvas>
  );
}
