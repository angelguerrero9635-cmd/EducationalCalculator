/**
 * `simpleMachine` lever option `limb` (HC81): a forearm held level at the elbow, or the pelvis
 * balanced on one leg. Bones painted and drawn to scale from the arms, the muscle and its line
 * of pull, each load at its arm and the joint force at the fulcrum, all vertical and on one
 * scale; the arms dimensioned from the joint, and the two moments about the joint as bars.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { SimpleMachineSpec } from '@/data/modules/typesHsk';
import { usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { fmt, HeLabel } from './beamKit';
import { Canvas, Caption } from './common';
import { DimLine, useHe3iReader } from './he3iKit';
import { Vec } from './hskKit';
import { HIP_SHARE, limbBalance } from './limbMath';
import { Ball, TopLight, url, usePaintIds } from './paint';

/** The shortest force arrow drawn (px): a small load stays visible beside a large muscle force. */
const SHORTEST = 16;

interface Load {
  force: number;
  arm: number;
  known: boolean;
  label: string;
  main: boolean;
}

export function SimpleMachineLimb({ spec, calc }: { spec: SimpleMachineSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useHe3iReader(calc);
  const ids = usePaintIds('bone', 'muscle', 'ball', 'light');
  const o = spec.limb!;
  const hip = o.body === 'hip';
  const share = hip ? (o.share ?? HIP_SHARE) : 1;
  const uF = r.unit(spec.load, 'N');
  const uD = r.unit(spec.loadArm, 'cm');
  // Arms in SI for the geometry, so a page may mix cm and m.
  const W = Math.max(0, r.v(spec.load));
  const loads: Load[] = [
    {
      force: share * W,
      arm: Math.max(0, r.si(spec.loadArm, 'cm')),
      known: r.all(spec.load, spec.loadArm),
      label: hip ? `${shareText(share)}${r.symbol(spec.load, 'W')}` : r.tag(spec.load, 'L', W, uF),
      main: true,
    },
    ...(o.loads ?? []).map((l) => ({
      force: Math.max(0, r.v(l.force)),
      arm: Math.max(0, r.si(l.arm, 'cm')),
      known: r.all(l.force, l.arm),
      label: r.tag(l.force, l.name ?? 'W', r.v(l.force), uF),
      main: false,
    })),
  ];
  const dM = Math.max(0, r.si(spec.effortArm, 'cm'));
  const bal = limbBalance(
    o.body,
    loads.map((l) => ({ force: l.force, arm: l.arm })),
    dM,
    spec.effort && r.known(spec.effort) ? r.v(spec.effort) : undefined,
  );
  const FM = bal.muscle;
  const FJ = o.joint && r.known(o.joint) ? r.v(o.joint) : bal.joint;
  const allLoads = loads.every((l) => l.known);
  const muscleOk = spec.effort ? r.known(spec.effort) : allLoads && r.known(spec.effortArm);
  const jointOk = !!o.joint && r.known(o.joint);
  const armOk = r.known(spec.effortArm);
  // Arms back in the page's unit, for the moment bars and the caption.
  const toPage = (x: number) =>
    x / Math.max(1e-12, r.si(spec.loadArm, 'cm') / r.v(spec.loadArm, 1));
  const uM = `${uF}·${uD}`;
  const maxF = Math.max(1e-9, FM, Math.abs(FJ), ...loads.map((l) => l.force));

  const balanceLines = () => {
    const sm = r.symbol(spec.effort, hip ? 'F_ab' : 'F_M');
    const sd = r.symbol(spec.effortArm, hip ? 'd_ab' : 'd_M');
    const terms = loads.map((l, i) =>
      l.main
        ? `${hip ? `${shareText(share)}` : ''}${r.symbol(spec.load, hip ? 'W' : 'L')} ${r.symbol(spec.loadArm, hip ? 'd_W' : 'd_L')}`
        : `${r.symbol(o.loads![i - 1]!.force, 'W')} ${r.symbol(o.loads![i - 1]!.arm, 'd')}`,
    );
    return { muscle: `${sm} ${sd}`, loads: terms.join(' + ') };
  };
  const names = balanceLines();

  const caption = (() => {
    const out: string[] = [];
    out.push(
      hip
        ? `Moments about the hip joint: ${plain(names.muscle)} = ${plain(names.loads)}.`
        : `Moments about the elbow: ${plain(names.muscle)} = ${plain(names.loads)}.`,
    );
    if (allLoads && armOk && muscleOk)
      out.push(
        `${plain(r.symbol(spec.effort, hip ? 'F_ab' : 'F_M'))} = ${fmt(toPage(bal.moment))} ÷ ${fmt(toPage(dM))} = ${fmt(FM)} ${uF}.`,
      );
    const sJ = plain(r.symbol(o.joint, 'F_J'));
    if (jointOk && allLoads && muscleOk) {
      const sum = loads.map((l) => fmt(l.force)).join(hip ? ' + ' : ' − ');
      out.push(
        hip
          ? `${sJ} = ${fmt(FM)} + ${sum} = ${fmt(FJ)} ${uF}.`
          : `${sJ} = ${fmt(FM)} − ${sum} = ${fmt(FJ)} ${uF}.`,
      );
    }
    if (hip && o.ratio && r.known(o.ratio) && jointOk && W > 0)
      out.push(`${sJ} ÷ ${plain(r.symbol(spec.load, 'W'))} = ${fmt(FJ / W)}.`);
    out.push('Arrows to one scale; the shortest are lengthened to be seen.');
    return out.join(' ');
  })();

  return (
    <View>
      <Canvas aspect={hip ? 1.14 : 1.06}>
        {({ w, h }) => {
          const len = (F: number, most: number) => Math.max(SHORTEST, (most * Math.abs(F)) / maxF);
          const bars = (top: number) => {
            if (!(allLoads && armOk && muscleOk)) return null;
            const x0 = 12;
            const full = w - 24;
            const k = full / Math.max(1e-12, bal.moment, FM * dM);
            let x = x0;
            return (
              <G>
                <HeLabel
                  x={x0}
                  y={top}
                  anchor="start"
                  chip={false}
                  text={`${names.muscle} = ${fmt(toPage(FM * dM))} ${uM}`}
                  color={c.forceApplied}
                  w={w}
                />
                <Rect
                  x={x0}
                  y={top + 6}
                  width={FM * dM * k}
                  height={10}
                  rx={2}
                  fill={c.forceApplied}
                />
                <HeLabel
                  x={x0}
                  y={top + 36}
                  anchor="start"
                  chip={false}
                  text={`${names.loads} = ${fmt(toPage(bal.moment))} ${uM}`}
                  color={c.forceWeight}
                  w={w}
                />
                {bal.moments.map((m, i) => {
                  const x1 = x;
                  x += m * k;
                  return (
                    <Rect
                      key={i}
                      x={x1}
                      y={top + 42}
                      width={Math.max(0, m * k - 1)}
                      height={10}
                      rx={2}
                      fill={c.forceWeight}
                      opacity={i === 0 ? 1 : 0.55}
                    />
                  );
                })}
              </G>
            );
          };
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} />
                <Ball id={ids.bone} color={c.bone} />
                <Ball id={ids.muscle} color={c.he3iMuscle} />
                <Ball id={ids.ball} color={c.blockBlue} />
              </Defs>
              {hip ? hipScene(w, h) : forearmScene(w, h)}
              {bars(hip ? h - 52 : h - 52)}
            </Svg>
          );

          function forearmScene(w: number, h: number) {
            const x0 = w * 0.17;
            const y0 = h * 0.36;
            const reach = Math.max(1e-9, dM, ...loads.map((l) => l.arm));
            const s = (w - x0 - 30) / (reach * 1.06);
            const xOf = (d: number) => x0 + d * s;
            const xL = xOf(loads[0]!.arm);
            const xM = xOf(dM);
            const most = Math.min(y0 - 36, 90);
            const handX = xL;
            const wrist = Math.max(xM + 20, handX - 22);
            // Bones: the humerus up from the elbow (cut short), the ulna and radius out to the wrist.
            const humerus = `M ${x0 - 7} ${y0 - 8} C ${x0 - 12} ${y0 - 20} ${x0 - 6} ${y0 - 40} ${x0 - 6} ${y0 - 60} L ${x0 - 6} 16 L ${x0 + 6} 12 L ${x0 + 6} ${y0 - 60} C ${x0 + 6} ${y0 - 40} ${x0 + 12} ${y0 - 20} ${x0 + 8} ${y0 - 8} Z`;
            const bone = (x1: number, x2: number, y: number, t: number) =>
              `M ${x1} ${y - t} Q ${(x1 + x2) / 2} ${y - t * 0.6} ${x2} ${y - t} L ${x2 + 3} ${y} L ${x2} ${y + t} Q ${(x1 + x2) / 2} ${y + t * 0.6} ${x1} ${y + t} Z`;
            const shoulderY = 14;
            return (
              <G>
                {/* The humerus, cut short above (it runs on to the shoulder). */}
                <Path d={humerus} fill={url(ids.bone)} stroke={c.chartMuted} strokeWidth={1} />
                <Path
                  d={`M ${x0 - 9} 18 L ${x0 - 3} 12 L ${x0 + 3} 18 L ${x0 + 9} 12`}
                  stroke={c.chartMuted}
                  strokeWidth={1}
                  fill="none"
                />
                {/* The ulna (with the olecranon behind the elbow) and the radius. */}
                <Path
                  d={bone(x0 - 10, wrist, y0 + 3, 4)}
                  fill={url(ids.bone)}
                  stroke={c.chartMuted}
                />
                <Path
                  d={bone(x0 + 2, wrist, y0 - 5, 3.5)}
                  fill={url(ids.bone)}
                  stroke={c.chartMuted}
                />
                <Circle cx={x0} cy={y0} r={8} fill={url(ids.bone)} stroke={c.chartMuted} />
                {/* The hand, palm up, its fingers curled round the ball it holds. */}
                <Rect
                  x={wrist - 2}
                  y={y0 - 8}
                  width={handX + 14 - wrist}
                  height={13}
                  rx={6}
                  fill={url(ids.bone)}
                  stroke={c.chartMuted}
                />
                <Path
                  d={`M ${handX + 10} ${y0 - 6} Q ${handX + 19} ${y0 - 14} ${handX + 12} ${y0 - 27}`}
                  stroke={c.chartMuted}
                  strokeWidth={6}
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d={`M ${handX + 10} ${y0 - 6} Q ${handX + 19} ${y0 - 14} ${handX + 12} ${y0 - 27}`}
                  stroke={c.bone}
                  strokeWidth={4}
                  strokeLinecap="round"
                  fill="none"
                />
                {loads[0]!.known ? (
                  <Circle
                    cx={handX}
                    cy={y0 - 19}
                    r={11}
                    fill={url(ids.ball)}
                    stroke={c.chartMuted}
                  />
                ) : null}
                {/* The biceps: its belly along the humerus, its tendon to the radius at d_M. */}
                <Path
                  d={`M ${x0 + 7} ${shoulderY + 10} C ${x0 + 30} ${y0 * 0.35} ${xM + 14} ${y0 * 0.62} ${xM + 2} ${y0 - 26} L ${xM - 3} ${y0 - 26} C ${x0 + 14} ${y0 * 0.6} ${x0 + 10} ${y0 * 0.35} ${x0 + 7} ${shoulderY + 10} Z`}
                  fill={url(ids.muscle)}
                  stroke={c.chartMuted}
                  strokeWidth={0.8}
                />
                <Path
                  d={`M ${xM - 2} ${y0 - 27} L ${xM - 1} ${y0 - 8} L ${xM + 2} ${y0 - 8} L ${xM + 2} ${y0 - 27} Z`}
                  fill={c.he3iTendon}
                  stroke={c.chartMuted}
                  strokeWidth={0.6}
                />
                {/* The forearm's centre of mass for each extra load. */}
                {loads.slice(1).map((l, i) =>
                  l.known ? (
                    <G key={`cm${i}`}>
                      <Circle cx={xOf(l.arm)} cy={y0 - 1} r={4} fill={c.card} stroke={c.chartInk} />
                      <Path
                        d={`M ${xOf(l.arm)} ${y0 - 5} A 4 4 0 0 1 ${xOf(l.arm) + 4} ${y0 - 1} L ${xOf(l.arm)} ${y0 - 1} Z M ${xOf(l.arm)} ${y0 + 3} A 4 4 0 0 1 ${xOf(l.arm) - 4} ${y0 - 1} L ${xOf(l.arm)} ${y0 - 1} Z`}
                        fill={c.chartInk}
                      />
                    </G>
                  ) : null,
                )}
                {/* The muscle force, up along its line of pull. */}
                {muscleOk && armOk ? (
                  <G>
                    <Vec
                      x1={xM}
                      y1={y0 - 8}
                      x2={xM}
                      y2={y0 - 8 - len(FM, most)}
                      color={c.forceApplied}
                    />
                    <HeLabel
                      x={xM + 12}
                      y={Math.max(30, y0 - 8 - len(FM, most) + 22)}
                      anchor="start"
                      text={r.tag(spec.effort, 'F_M', FM, uF)}
                      color={c.forceApplied}
                      w={w}
                    />
                  </G>
                ) : null}
                {/* The loads, down at their arms. */}
                {loads.map((l, i) =>
                  l.known ? (
                    <G key={`L${i}`}>
                      <Vec
                        x1={xOf(l.arm)}
                        y1={y0 + 9}
                        x2={xOf(l.arm)}
                        y2={y0 + 9 + len(l.force, most)}
                        color={c.forceWeight}
                      />
                      <HeLabel
                        x={xOf(l.arm) + (l.main ? 0 : 0)}
                        y={y0 + 9 + len(l.force, most) + 15 + (l.main ? 0 : 0)}
                        anchor={l.main ? 'end' : 'middle'}
                        text={l.label}
                        color={c.forceWeight}
                        w={w}
                      />
                    </G>
                  ) : null,
                )}
                {/* The elbow's push on the forearm. */}
                {jointOk ? (
                  <G>
                    <Vec
                      x1={x0}
                      y1={FJ >= 0 ? y0 + 10 : y0 + 10 + len(FJ, most)}
                      x2={x0}
                      y2={FJ >= 0 ? y0 + 10 + len(FJ, most) : y0 + 10}
                      color={c.forceNormal}
                    />
                    <HeLabel
                      x={x0 + 8}
                      y={y0 + 70}
                      anchor="start"
                      text={r.tag(o.joint, 'F_J', FJ, uF)}
                      color={c.forceNormal}
                      w={w}
                    />
                  </G>
                ) : null}
                {/* The arms, measured from the elbow. */}
                {[
                  ...(armOk ? [{ x: xM, t: r.tag(spec.effortArm, 'd_M', toPage(dM), uD) }] : []),
                  ...loads.flatMap((l, i) =>
                    r.known(i === 0 ? spec.loadArm : o.loads![i - 1]!.arm)
                      ? [
                          {
                            x: xOf(l.arm),
                            t: r.tag(
                              i === 0 ? spec.loadArm : o.loads![i - 1]!.arm,
                              i === 0 ? 'd_L' : 'd',
                              toPage(l.arm),
                              uD,
                            ),
                          },
                        ]
                      : [],
                  ),
                ]
                  .sort((a, b) => a.x - b.x)
                  .map((d, i, all) => (
                    <G key={`d${i}`}>
                      <Line
                        x1={d.x}
                        y1={y0 + 78}
                        x2={d.x}
                        y2={dimTop(i) + 5}
                        stroke={c.chartGrid}
                        strokeDasharray="2 3"
                      />
                      {i === all.length - 1 ? (
                        <DimLine x1={x0} x2={d.x} y={dimTop(i)} text={d.t} w={w} below />
                      ) : (
                        <G>
                          <DimLine x1={x0} x2={d.x} y={dimTop(i)} text="" w={w} />
                          <HeLabel
                            x={d.x + 8}
                            y={dimTop(i) + 4}
                            anchor="start"
                            chip={false}
                            text={d.t}
                            w={w}
                          />
                        </G>
                      )}
                    </G>
                  ))}
              </G>
            );
            function dimTop(i: number) {
              return y0 + 112 + i * 22;
            }
          }

          function hipScene(w: number, h: number) {
            const xm = w * 0.46;
            const dW = loads[0]!.arm;
            const reach = Math.max(1e-9, dW + dM);
            const P = Math.min(w * 0.44, (w - xm - 26) / 1.08);
            const s = P / (reach * 1.12);
            const xJ = xm + dW * s;
            const xA = xJ + dM * s;
            const yTop = h * 0.2;
            const yJ = yTop + 0.52 * P;
            const most = Math.min(h * 0.3, 0.62 * P + 40);
            const half = (sgn: number) => {
              const X = (u: number) => xm + sgn * u;
              const j = xJ - xm;
              const a = xA - xm;
              return `M ${X(0.1 * P)} ${yTop + 0.1 * P} C ${X(0.3 * P)} ${yTop - 0.04 * P} ${X(a)} ${yTop - 0.06 * P} ${X(a + 0.1 * P)} ${yTop + 0.1 * P} C ${X(a + 0.14 * P)} ${yTop + 0.2 * P} ${X(a)} ${yTop + 0.3 * P} ${X(j + 0.14 * P)} ${yTop + 0.42 * P} C ${X(j + 0.16 * P)} ${yTop + 0.6 * P} ${X(j + 0.02 * P)} ${yTop + 0.74 * P} ${X(j - 0.08 * P)} ${yTop + 0.84 * P} C ${X(j - 0.2 * P)} ${yTop + 0.88 * P} ${X(0.12 * P)} ${yTop + 0.86 * P} ${X(0.04 * P)} ${yTop + 0.78 * P} L ${X(0.04 * P)} ${yTop + 0.66 * P} C ${X(0.2 * P)} ${yTop + 0.6 * P} ${X(0.24 * P)} ${yTop + 0.4 * P} ${X(0.12 * P)} ${yTop + 0.3 * P} Z`;
            };
            const femur = (sgn: number, faded: boolean) => {
              const X = (u: number) => xm + sgn * u;
              const j = xJ - xm;
              const a = xA - xm;
              const knee = h - 120;
              return (
                <G opacity={faded ? 0.45 : 1}>
                  <Path
                    d={`M ${X(j)} ${yJ - 0.06 * P} L ${X(a - 0.02 * P)} ${yJ + 0.04 * P} C ${X(a + 0.06 * P)} ${yJ + 0.02 * P} ${X(a + 0.06 * P)} ${yJ + 0.16 * P} ${X(a - 0.02 * P)} ${yJ + 0.22 * P} L ${X(a - 0.06 * P)} ${knee} L ${X(a - 0.17 * P)} ${knee + 4} L ${X(a - 0.15 * P)} ${yJ + 0.3 * P} C ${X(a - 0.18 * P)} ${yJ + 0.18 * P} ${X(j + 0.04 * P)} ${yJ + 0.12 * P} ${X(j)} ${yJ + 0.06 * P} Z`}
                    fill={url(ids.bone)}
                    stroke={c.chartMuted}
                  />
                  <Circle
                    cx={X(j)}
                    cy={yJ}
                    r={0.085 * P}
                    fill={url(ids.bone)}
                    stroke={c.chartMuted}
                  />
                  <Path
                    d={`M ${X(a - 0.04 * P)} ${knee - 4} L ${X(a - 0.1 * P)} ${knee + 4} L ${X(a - 0.13 * P)} ${knee - 2} L ${X(a - 0.19 * P)} ${knee + 6}`}
                    stroke={c.chartMuted}
                    fill="none"
                  />
                </G>
              );
            };
            return (
              <G>
                {/* The spine above, on the body's midline. */}
                <Line
                  x1={xm}
                  y1={8}
                  x2={xm}
                  y2={h - 140}
                  stroke={c.chartGrid}
                  strokeDasharray="5 4"
                />
                {[0, 1, 2].map((i) => (
                  <Rect
                    key={i}
                    x={xm - 0.09 * P}
                    y={yTop - 0.06 * P - (i + 1) * 0.15 * P}
                    width={0.18 * P}
                    height={0.12 * P}
                    rx={3}
                    fill={url(ids.bone)}
                    stroke={c.chartMuted}
                  />
                ))}
                {femur(-1, true)}
                {femur(1, false)}
                <Path d={half(-1)} fill={url(ids.bone)} stroke={c.chartMuted} />
                <Path d={half(1)} fill={url(ids.bone)} stroke={c.chartMuted} />
                {/* The sacrum between the two halves. */}
                <Path
                  d={`M ${xm - 0.11 * P} ${yTop + 0.02 * P} L ${xm + 0.11 * P} ${yTop + 0.02 * P} L ${xm + 0.05 * P} ${yTop + 0.5 * P} L ${xm - 0.05 * P} ${yTop + 0.5 * P} Z`}
                  fill={url(ids.bone)}
                  stroke={c.chartMuted}
                />
                {[-1, 1].map((sgn) => (
                  <Ellipse
                    key={sgn}
                    cx={xm + sgn * (xJ - xm - 0.12 * P)}
                    cy={yTop + 0.7 * P}
                    rx={0.07 * P}
                    ry={0.05 * P}
                    fill={c.card}
                    stroke={c.chartMuted}
                  />
                ))}
                {/* The abductors: from the iliac wing down to the greater trochanter. */}
                <Path
                  d={`M ${xA - 0.12 * P} ${yTop + 0.06 * P} L ${xA + 0.06 * P} ${yTop + 0.08 * P} L ${xA + 0.02 * P} ${yJ + 0.06 * P} L ${xA - 0.04 * P} ${yJ + 0.06 * P} Z`}
                  fill={url(ids.muscle)}
                  stroke={c.chartMuted}
                  strokeWidth={0.8}
                  opacity={0.9}
                />
                {/* The body's weight above the stance leg, at the midline. */}
                {loads.map((l, i) =>
                  l.known ? (
                    <G key={`W${i}`}>
                      <Circle
                        cx={xJ - xOfLoad(l.arm, s)}
                        cy={yTop + 0.24 * P}
                        r={4}
                        fill={c.chartInk}
                      />
                      <Vec
                        x1={xJ - xOfLoad(l.arm, s)}
                        y1={yTop + 0.24 * P}
                        x2={xJ - xOfLoad(l.arm, s)}
                        y2={yTop + 0.24 * P + len(l.force, most)}
                        color={c.forceWeight}
                      />
                      <HeLabel
                        x={xm - 8}
                        y={yTop + 0.24 * P + len(l.force, most) + 16}
                        anchor="end"
                        text={
                          l.label + (l.main && r.known(spec.load) ? ` = ${fmt(l.force)} ${uF}` : '')
                        }
                        color={c.forceWeight}
                        w={w}
                      />
                    </G>
                  ) : null,
                )}
                {/* The abductors' pull on the pelvis, down at d_ab. */}
                {muscleOk && armOk ? (
                  <G>
                    <Vec
                      x1={xA}
                      y1={yTop + 0.06 * P}
                      x2={xA}
                      y2={yTop + 0.06 * P + len(FM, most)}
                      color={c.forceApplied}
                    />
                    <HeLabel
                      x={w - 6}
                      y={yTop - 0.12 * P}
                      anchor="end"
                      text={r.tag(spec.effort, 'F_ab', FM, uF)}
                      color={c.forceApplied}
                      w={w}
                    />
                  </G>
                ) : null}
                {/* The joint's push up into the socket. */}
                {jointOk ? (
                  <G>
                    <Vec
                      x1={xJ}
                      y1={FJ >= 0 ? yJ + len(FJ, most) : yJ}
                      x2={xJ}
                      y2={FJ >= 0 ? yJ : yJ + len(FJ, most)}
                      color={c.forceNormal}
                    />
                    <HeLabel
                      x={xJ - 6}
                      y={yJ + len(FJ, most) + 2}
                      anchor="end"
                      text={r.tag(o.joint, 'F_J', FJ, uF)}
                      color={c.forceNormal}
                      w={w}
                    />
                  </G>
                ) : null}
                {/* The arms from the joint: the weight's to the midline, the abductors' outward. */}
                {r.known(spec.loadArm) ? (
                  <DimLine
                    x1={xm}
                    x2={xJ}
                    y={h - 92}
                    text={r.tag(spec.loadArm, 'd_W', toPage(dW), uD)}
                    w={w}
                  />
                ) : null}
                {armOk ? (
                  <DimLine
                    x1={xJ}
                    x2={xA}
                    y={h - 92}
                    below
                    text={r.tag(spec.effortArm, 'd_ab', toPage(dM), uD)}
                    w={w}
                  />
                ) : null}
                {[xm, xJ, xA].map((x, i) => (
                  <Line
                    key={i}
                    x1={x}
                    y1={i === 0 ? h - 140 : i === 1 ? yJ + 0.1 * P : yJ + 0.08 * P}
                    x2={x}
                    y2={h - 86}
                    stroke={c.chartGrid}
                    strokeDasharray="2 3"
                  />
                ))}
              </G>
            );
          }
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}

/** The x offset (px) of a load's arm from the joint toward the midline. */
const xOfLoad = (arm: number, s: number) => arm * s;

/** "5/6 " for the hip's share of body weight, nothing for a whole load. */
function shareText(k: number) {
  if (Math.abs(k - 1) < 1e-9) return '';
  for (let d = 2; d <= 12; d++) {
    const n = Math.round(k * d);
    if (Math.abs(n / d - k) < 1e-9) return `(${n}/${d})`;
  }
  return `${fmt(k)}`;
}

/** A symbol for the caption: the caption's text draws "F_M" with its subscript lowered. */
const plain = (s: string) => s;
