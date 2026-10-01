import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'wave' }>;

/** Tallest crest drawn (px above the middle line); a wave with no amplitude value uses 36. */
const MAX_AMP = 70;
const PLAIN_AMP = 36;
/**
 * The least crest drawn to scale; a smaller amplitude (2 cm on a 1.5 m wave) is drawn on a
 * height scale of its own, STRETCHED px tall, marked "not to scale".
 */
const MIN_AMP = 30;
const STRETCHED = 40;
/** Room above the crests for the wavelength bracket and its label. */
const TOP = 42;
/** Room under the troughs for the handle. */
const BOTTOM = 24;

/** A two-headed vertical arrow from y1 to y2 at x (heads shrink on a short arrow). */
function DoubleArrow({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) {
  const len = Math.abs(y2 - y1);
  const head = Math.min(7, len / 2);
  const dir = y2 > y1 ? 1 : -1;
  return (
    <G>
      <Line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={chart.strokeLight} />
      <Path
        d={`M ${x} ${y1} L ${x - 4} ${y1 + dir * head} L ${x + 4} ${y1 + dir * head} Z`}
        fill={color}
      />
      <Path
        d={`M ${x} ${y2} L ${x - 4} ${y2 - dir * head} L ${x + 4} ${y2 - dir * head} Z`}
        fill={color}
      />
    </G>
  );
}

/**
 * A flat, exact wave along a dashed middle line. Across and up share one scale when the lesson
 * has an amplitude, so a 6 cm amplitude on a 40 cm wave is drawn 6/40 as tall as the wave is
 * long. The wavelength is a bracket above two crests, its ends dropping to their peaks; the
 * amplitude a double arrow from the middle line up to the level of a crest, beside the wave.
 * Drag the handle on the first trough: down for a bigger amplitude, sideways for the wavelength.
 */
export function Wave({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ A: 0, L: 0 });
  const known = (!spec.amplitude || rep.known(spec.amplitude)) && rep.known(spec.wavelength);
  const A = spec.amplitude ? Math.max(0, rep.shown(spec.amplitude)) : 0;
  const L = Math.max(0.001, rep.shown(spec.wavelength));
  // The drawing's scale, held while dragging.
  const scale = useFrozen({ L, A: Math.max(A, 0.001) });
  const cycles =
    typeof spec.extent === 'string'
      ? Math.min(12, Math.max(1, Math.round(rep.known(spec.extent) ? rep.shown(spec.extent) : 1)))
      : spec.extent;
  const ampText = spec.amplitude ? rep.label(spec.amplitude) : 'amplitude';
  // Room to the right of the wave for the amplitude arrow and its label.
  const side = ampText.length * chart.label * 0.58 + 34;

  /**
   * Pixels per shown unit across and up (one scale, unless the amplitude would be a flat strip),
   * the crest height, and the canvas height, for a width.
   */
  const layout = (w: number) => {
    const across = (w - 16 - side) / (cycles * scale.value.L);
    const shared = spec.amplitude ? Math.min(across, MAX_AMP / scale.value.A) : across;
    const stretched = !!spec.amplitude && scale.value.A * shared < MIN_AMP;
    const perUnit = stretched ? across : shared;
    const perY = stretched ? STRETCHED / scale.value.A : shared;
    const amp = spec.amplitude ? A * perY : PLAIN_AMP;
    const tall = spec.amplitude ? Math.max(amp, scale.value.A * perY) : PLAIN_AMP;
    const half = Math.max(tall, 14);
    return { perUnit, perY, stretched, amp, mid: TOP + half, h: TOP + 2 * half + BOTTOM };
  };

  return (
    <View>
      <Canvas aspect={(w) => layout(w).h / w}>
        {({ w, h }) => {
          const { perUnit, perY, stretched, amp, mid } = layout(w);
          const waveW = cycles * L * perUnit;
          const x0 = Math.max(16, (w - side - waveW) / 2);
          const x1 = x0 + waveW;
          const N = Math.max(80, Math.round(cycles * 48));
          const d = Array.from({ length: N + 1 }, (_, i) => {
            const t = (i / N) * cycles;
            return `${i === 0 ? 'M' : 'L'} ${x0 + t * L * perUnit} ${mid - amp * Math.sin(2 * Math.PI * t)}`;
          }).join(' ');
          const crestY = mid - amp;
          const troughY = mid + amp;
          const crest = (k: number) => x0 + (k + 0.25) * L * perUnit;
          // Crest to crest when two crests are drawn; else one whole wave from its start.
          const twoCrests = cycles >= 1.25;
          const bx0 = twoCrests ? crest(0) : x0;
          const bx1 = twoCrests ? crest(1) : x0 + L * perUnit;
          const by = crestY - 16;
          const tickTo = twoCrests ? crestY - 3 : mid;
          const lastCrest = crest(Math.floor(cycles - 0.25));
          const ax = x1 + 14;
          const troughX = x0 + 0.75 * L * perUnit;
          const ink = c.chartInk;
          return (
            <>
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                <Line
                  x1={x0 - 8}
                  y1={mid}
                  x2={ax}
                  y2={mid}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dashFine}
                />
                <Path
                  d={d}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Wavelength: a bracket above, its ends dropping exactly to two crest peaks. */}
                <Line x1={bx0} y1={by} x2={bx1} y2={by} stroke={ink} strokeWidth={chart.stroke} />
                {[bx0, bx1].map((x) => (
                  <G key={x}>
                    <Line
                      x1={x}
                      y1={by - 5}
                      x2={x}
                      y2={by + 5}
                      stroke={ink}
                      strokeWidth={chart.stroke}
                    />
                    <Line
                      x1={x}
                      y1={by + 5}
                      x2={x}
                      y2={tickTo}
                      stroke={ink}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dashFine}
                    />
                  </G>
                ))}
                <ChartText
                  {...fitLabel((bx0 + bx1) / 2, rep.label(spec.wavelength), chart.value, w)}
                  y={by - 8}
                  fontSize={chart.value}
                  fontWeight="700"
                >
                  {rep.label(spec.wavelength)}
                </ChartText>

                {/* Amplitude: middle line up to the crests' level, beside the wave. */}
                {amp >= 1 ? (
                  <>
                    <Line
                      x1={lastCrest}
                      y1={crestY}
                      x2={ax + 5}
                      y2={crestY}
                      stroke={ink}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dashFine}
                    />
                    <DoubleArrow x={ax} y1={mid} y2={crestY} color={ink} />
                  </>
                ) : null}
                <ChartText
                  x={ax + 9}
                  y={(mid + crestY) / 2 + 4.5}
                  fontSize={chart.label}
                  fontWeight="700"
                >
                  {ampText}
                </ChartText>
                {stretched ? (
                  <ChartText
                    x={w - 4}
                    y={h - 4}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                    textAnchor="end"
                  >
                    heights not to scale
                  </ChartText>
                ) : null}
              </Svg>
              {known ? (
                <DragHandle
                  testID={`drag-${spec.amplitude ?? spec.wavelength}`}
                  x={troughX}
                  y={troughY}
                  label={
                    spec.amplitude
                      ? `${rep.variable(spec.amplitude).name} and ${rep.variable(spec.wavelength).name}`
                      : rep.variable(spec.wavelength).name
                  }
                  onStart={() => {
                    start.current = { A, L };
                    scale.freeze();
                  }}
                  onMove={(dx, dy) =>
                    calc.set({
                      // The rope's length (the waves along it) stays as typed while the waves are
                      // stretched or squeezed.
                      ...rep.pin([
                        ...(spec.frequency ? [spec.frequency] : []),
                        ...(typeof spec.extent === 'string' ? [spec.extent] : []),
                      ]),
                      ...(spec.amplitude
                        ? {
                            // The trough moves down as far as the crest moves up.
                            [spec.amplitude]: rep.snapTo(
                              spec.amplitude,
                              Math.max(0, start.current.A + dy / perY) * rep.factor(spec.amplitude),
                            ),
                          }
                        : {}),
                      // The first trough is ¾ of a wavelength along.
                      [spec.wavelength]: rep.snapTo(
                        spec.wavelength,
                        Math.max(0.001, start.current.L + dx / (0.75 * perUnit)) *
                          rep.factor(spec.wavelength),
                      ),
                    })
                  }
                  onEnd={scale.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `Crest to crest is one wavelength, ${rep.value(spec.wavelength)}.${spec.amplitude ? ` The crest rises ${rep.value(spec.amplitude)} above the middle.` : ''}${spec.frequency ? ` ${formatNumber(rep.shown(spec.frequency))} waves pass each second.` : ''}`
          : 'Type the wavelength to draw the wave.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          ...(spec.amplitude
            ? [
                {
                  var: spec.amplitude,
                  steps: [1],
                  pin: [spec.wavelength, ...(spec.frequency ? [spec.frequency] : [])],
                },
              ]
            : []),
          {
            var: spec.wavelength,
            steps: [1],
            pin: [
              ...(spec.amplitude ? [spec.amplitude] : []),
              ...(spec.frequency ? [spec.frequency] : []),
            ],
          },
        ]}
      />
    </View>
  );
}
