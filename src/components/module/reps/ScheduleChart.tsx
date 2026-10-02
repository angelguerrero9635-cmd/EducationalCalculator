/**
 * HC51 `scheduleChart` (ScheduleChartSpec in typesHe3d.ts): a Gantt chart. Periodic tasks under
 * rate-monotonic or EDF priorities, one row each over the hyperperiod, releases as arrows, a
 * miss crossed and named, a response time bracketed; or runs of jobs (FCFS, SJF, round robin)
 * one row each, slices named, with each job's wait as a line under it. Flat; each task has its
 * own row or its name in its slices, so colour only repeats what the labels say.
 */
import Svg, { G, Line, Polygon, Rect } from 'react-native-svg';

import type { ScheduleChartSpec } from '@/data/modules/typesHe3d';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, niceCeil } from './common';
import { fmt4, HBracket, textW, useReader } from './he3dKit';
import { chartSpan, jobOrder, periodic, rmBound, type Slice } from './scheduleMath';

type Reader = ReturnType<typeof useReader>;

const fillOf = (c: Palette, i: number) =>
  [c.schedTask1, c.schedTask2, c.schedTask3, c.schedTask4][i % 4]!;

export function ScheduleChart({ spec, calc }: { spec: ScheduleChartSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useReader(calc);
  const drawn = spec.policy === 'jobs' ? jobs(spec, r, c) : tasks(spec, r, c);
  return (
    <>
      <Canvas aspect={(w) => drawn.h / w}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            {drawn.body(w)}
          </Svg>
        )}
      </Canvas>
      <Caption>{drawn.caption}</Caption>
    </>
  );
}

/** Time ticks along an axis from x0, k px a unit, to `end`, every `step`. */
function Axis({
  x0,
  k,
  end,
  y,
  unit,
  c,
}: {
  x0: number;
  k: number;
  end: number;
  y: number;
  unit: string;
  c: Palette;
}) {
  // A step whose labels stay 28 px apart.
  let step = niceCeil(28 / k);
  if (end / step < 2) step = end / 2;
  const ticks = Array.from({ length: Math.floor(end / step + 1e-9) + 1 }, (_, i) => i * step);
  return (
    <G>
      <Line x1={x0} y1={y} x2={x0 + end * k} y2={y} stroke={c.chartInk} strokeWidth={1} />
      {ticks.map((t) => (
        <G key={t}>
          <Line
            x1={x0 + t * k}
            y1={y}
            x2={x0 + t * k}
            y2={y + 4}
            stroke={c.chartInk}
            strokeWidth={1}
          />
          <ChartText
            x={x0 + t * k}
            y={y + 17}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {fmt4(t)}
          </ChartText>
        </G>
      ))}
      <ChartText
        x={x0 + end * k}
        y={y + 32}
        textAnchor="end"
        fontSize={chart.label}
        fill={c.chartMuted}
      >
        {`time (${unit})`}
      </ChartText>
    </G>
  );
}

// ─── periodic tasks ───────────────────────────────────────────────────────────

const ROW = 46;
const LX = 40;

function tasks(spec: ScheduleChartSpec, r: Reader, c: Palette) {
  const unit = spec.unit ?? 'ms';
  const ts = spec.tasks.slice(0, 4).map((t) => ({ name: t.name, C: r.get(t.C), T: r.get(t.T) }));
  const known = ts.every((t) => t.C !== undefined && t.T !== undefined && t.T > 0 && t.C > 0);
  const set = known ? ts.map((t) => ({ C: t.C!, T: t.T! })) : [];
  const { H, span } = known ? chartSpan(set) : { H: undefined, span: 1 };
  const policy = spec.policy === 'edf' ? 'edf' : 'rm';
  const sim = known ? periodic(set, policy, span) : undefined;
  // A response bracket under its row takes a line of its own above the axis.
  const extra = spec.response ? 22 : 0;
  const height = 22 + ts.length * ROW + 44 + extra;
  const body = (w: number) => {
    const k = (w - LX - 14) / span;
    const x = (t: number) => LX + t * k;
    const rowY = (i: number) => 22 + i * ROW + ROW - 12;
    return (
      <G>
        {ts.map((t, i) => {
          const base = rowY(i);
          const releases = t.T
            ? Array.from({ length: Math.floor(span / t.T + 1e-9) + 1 }, (_, j) => j * t.T!)
            : [];
          return (
            <G key={i}>
              <ChartText x={4} y={base - 6} fontSize={chart.label} fontWeight="700">
                {t.name}
              </ChartText>
              <Line x1={LX} y1={base} x2={x(span)} y2={base} stroke={c.chartGrid} strokeWidth={1} />
              {(sim?.slices ?? [])
                .filter((s) => s.task === i)
                .map((s, j) => (
                  <Rect
                    key={j}
                    x={x(s.start)}
                    y={base - 20}
                    width={Math.max(1, (s.end - s.start) * k)}
                    height={20}
                    fill={fillOf(c, i)}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                ))}
              {releases.map((at) => (
                <G key={at}>
                  <Line
                    x1={x(at)}
                    y1={base}
                    x2={x(at)}
                    y2={base - 30}
                    stroke={c.chartMuted}
                    strokeWidth={1.5}
                  />
                  <Polygon
                    points={`${x(at) - 3.5},${base - 25} ${x(at) + 3.5},${base - 25} ${x(at)},${base - 32}`}
                    fill={c.chartMuted}
                  />
                </G>
              ))}
              {(sim?.misses ?? [])
                .filter((m) => m.task === i)
                .map((m, j) => (
                  <G key={`m${j}`}>
                    <Line
                      x1={x(m.at) - 6}
                      y1={base - 16}
                      x2={x(m.at) + 6}
                      y2={base - 4}
                      stroke={c.schedMiss}
                      strokeWidth={chart.strokeHeavy}
                    />
                    <Line
                      x1={x(m.at) - 6}
                      y1={base - 4}
                      x2={x(m.at) + 6}
                      y2={base - 16}
                      stroke={c.schedMiss}
                      strokeWidth={chart.strokeHeavy}
                    />
                    {j === 0 ? (
                      <ChartText
                        x={Math.min(x(m.at) + 9, w - 4 - textW('missed'))}
                        y={base - 24}
                        fontSize={chart.label}
                        fontWeight="700"
                        fill={c.schedMiss}
                        halo
                      >
                        missed
                      </ChartText>
                    ) : null}
                  </G>
                ))}
            </G>
          );
        })}
        {spec.response && sim
          ? (() => {
              const i = spec.response.task;
              const R = sim.done[i]?.[0];
              if (R === undefined) return null;
              return (
                <HBracket
                  x1={x(0)}
                  x2={x(R)}
                  y={rowY(i) + 6}
                  side="up"
                  w={w}
                  label={r.lab(spec.response.value, `R_${i + 1}`, unit)}
                />
              );
            })()
          : null}
        <Axis x0={LX} k={k} end={span} y={22 + ts.length * ROW + 4 + extra} unit={unit} c={c} />
      </G>
    );
  };
  const parts: string[] = [];
  if (known) {
    const U = set.reduce((s, t) => s + t.C / t.T, 0);
    const terms = set.map((t) => `${fmt4(t.C)}/${fmt4(t.T)}`).join(' + ');
    if (policy === 'rm') {
      const b = rmBound(set.length);
      parts.push(
        `U = ${terms} = ${fmt4(U)} ${U <= b + 1e-12 ? '≤' : '>'} ${b.toFixed(3)}, the bound for ${set.length} tasks${U <= b + 1e-12 ? ': rate-monotonic meets every deadline.' : ': the bound can’t promise it.'}`,
      );
      parts.push('The shorter period runs first and takes the processor whenever it is released.');
    } else {
      parts.push(
        `U = ${terms} = ${fmt4(U)} ${U <= 1 + 1e-12 ? '≤ 1: EDF meets every deadline.' : '> 1: no schedule can.'}`,
      );
      parts.push('The job with the earliest deadline runs first.');
    }
    parts.push('Each arrow is a release and the last job’s deadline.');
    if (sim?.misses.length) {
      const m = sim.misses[0]!;
      parts.push(`${ts[m.task]!.name} misses its deadline at ${fmt4(m.at)} ${unit}.`);
    }
    if (spec.response && sim) {
      const R = sim.done[spec.response.task]?.[0];
      const T = ts[spec.response.task]?.T;
      if (R !== undefined && T !== undefined) {
        parts.push(
          `${ts[spec.response.task]!.name}’s first job, released with all the others, ends at ${fmt4(R)} ${unit} ${R <= T + 1e-12 ? '≤' : '>'} its period ${fmt4(T)} ${unit}.`,
        );
      }
    }
    if (H === undefined || span < H) {
      parts.push(
        H === undefined
          ? `The first ${fmt4(span)} ${unit} are drawn.`
          : `The first ${fmt4(span)} ${unit} of the ${fmt4(H)} ${unit} hyperperiod are drawn.`,
      );
    } else parts.push(`The pattern repeats every hyperperiod, ${fmt4(H)} ${unit}.`);
  } else parts.push('Type every C and T to draw the schedule.');
  return { h: height, body, caption: parts.join(' ') };
}

// ─── jobs ─────────────────────────────────────────────────────────────────────

const NAMES = { fcfs: 'FCFS', sjf: 'SJF', rr: 'Round robin' } as const;

function jobs(spec: ScheduleChartSpec, r: Reader, c: Palette) {
  const unit = spec.unit ?? 'ms';
  const bursts = spec.tasks.map((t) => r.get(t.C));
  const q = r.get(spec.quantum);
  const known = bursts.every((b) => b !== undefined && b > 0);
  const runs = (spec.runs ?? [{ policy: 'fcfs' as const }]).map((run) => ({
    ...run,
    out:
      known && (run.policy !== 'rr' || (q !== undefined && q > 0))
        ? jobOrder(bursts as number[], run.policy, q)
        : undefined,
  }));
  const n = spec.tasks.length;
  const runH = 20 + 26 + 18 + n * 14 + 12;
  const height = runs.length * runH + 4;
  const total = known ? (bursts as number[]).reduce((a, b) => a + b, 0) : 1;
  const body = (w: number) => {
    const x0 = 10;
    const k = (w - 70) / total;
    const x = (t: number) => x0 + t * k;
    return (
      <G>
        {runs.map((run, ri) => {
          const top = ri * runH + 4;
          const bar = top + 20;
          const out = run.out;
          const label =
            run.policy === 'rr' && q !== undefined
              ? `${NAMES.rr}, q = ${fmt4(q)} ${unit}`
              : NAMES[run.policy];
          // Tick labels at slice ends, skipping one too close to the last.
          const ends = out ? [0, ...out.slices.map((s) => s.end)] : [];
          let lastX = -100;
          const shownEnds = ends.filter((t) => {
            if (x(t) - lastX < 22) return false;
            lastX = x(t);
            return true;
          });
          return (
            <G key={ri}>
              <ChartText x={x0} y={top + 12} fontSize={chart.label} fontWeight="700">
                {label}
              </ChartText>
              {(out?.slices ?? []).map((s: Slice, j) => (
                <G key={j}>
                  <Rect
                    x={x(s.start)}
                    y={bar}
                    width={(s.end - s.start) * k}
                    height={26}
                    fill={fillOf(c, s.task)}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                  {(s.end - s.start) * k >= 14 ? (
                    <ChartText
                      x={x((s.start + s.end) / 2)}
                      y={bar + 18}
                      textAnchor="middle"
                      fontSize={chart.label}
                      fontWeight="700"
                    >
                      {spec.tasks[s.task]!.name}
                    </ChartText>
                  ) : null}
                </G>
              ))}
              {shownEnds.map((t) => (
                <ChartText
                  key={t}
                  x={x(t)}
                  y={bar + 40}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {fmt4(t)}
                </ChartText>
              ))}
              {out
                ? spec.tasks.map((job, i) => {
                    const y = bar + 52 + i * 14;
                    // The job waits whenever it isn't running, from 0 to its finish.
                    const own = out.slices.filter((s) => s.task === i);
                    const gaps: [number, number][] = [];
                    let t = 0;
                    for (const s of own) {
                      if (s.start > t + 1e-9) gaps.push([t, s.start]);
                      t = s.end;
                    }
                    const end = gaps.length ? gaps[gaps.length - 1]![1] : 0;
                    return (
                      <G key={i}>
                        {gaps.map(([a, b], j) => (
                          <G key={j}>
                            <Line
                              x1={x(a)}
                              y1={y}
                              x2={x(b)}
                              y2={y}
                              stroke={fillOf(c, i)}
                              strokeWidth={4}
                            />
                            <Line
                              x1={x(a)}
                              y1={y}
                              x2={x(b)}
                              y2={y}
                              stroke={c.chartInk}
                              strokeWidth={1}
                              strokeDasharray={chart.dashFine}
                            />
                          </G>
                        ))}
                        <ChartText
                          x={Math.min(
                            x(end) + 5,
                            w - 4 - textW(`${job.name} waits ${fmt4(out.waits[i]!)}`),
                          )}
                          y={y + 4}
                          fontSize={chart.label}
                          halo
                        >
                          {`${job.name} waits ${fmt4(out.waits[i]!)}`}
                        </ChartText>
                      </G>
                    );
                  })
                : null}
            </G>
          );
        })}
      </G>
    );
  };
  const parts: string[] = [];
  if (known) {
    for (const run of runs) {
      if (!run.out) continue;
      const name = run.policy === 'rr' ? 'Round robin' : NAMES[run.policy];
      parts.push(
        `${name}: waits ${run.out.waits.map(fmt4).join(', ')}, average ${fmt4(run.out.avgWait)} ${unit}; average turnaround ${fmt4(run.out.avgTurnaround)} ${unit}.`,
      );
    }
    parts.push(
      'Every job arrives at 0; a job’s wait is the time it spends not running before it ends.',
    );
  } else parts.push('Type every burst to draw the schedule.');
  return { h: height, body, caption: parts.join(' ') };
}
