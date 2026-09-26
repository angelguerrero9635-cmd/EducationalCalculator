import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'wave' }>;

/**
 * A wave along a line: the amplitude is the height of a crest above the middle, the
 * wavelength the distance from one crest to the next. Drag the crest up or down for the
 * amplitude, or sideways for the wavelength.
 */
export function Wave({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ A: 0, L: 0 });
  const known = (!spec.amplitude || rep.known(spec.amplitude)) && rep.known(spec.wavelength);
  // With no amplitude value the crest is drawn at a fixed height.
  const A = spec.amplitude ? Math.max(0, rep.shown(spec.amplitude)) : 1;
  const L = Math.max(0.001, rep.shown(spec.wavelength));
  // The drawing's scale: `extent` wavelengths across, held while dragging.
  const scale = useFrozen({ L, A: Math.max(A, 0.001) });
  const cycles =
    typeof spec.extent === 'string'
      ? Math.min(12, Math.max(1, Math.round(rep.known(spec.extent) ? rep.shown(spec.extent) : 1)))
      : spec.extent;

  return (
    <View>
      <Canvas aspect={0.5}>
        {({ w, h }) => {
          const pad = 20;
          const mid = h / 2;
          const pxPerUnit = (w - 2 * pad) / (cycles * scale.value.L);
          // Room above the crest for the wavelength bracket and its label.
          const ampPx = Math.min(h / 2 - 40, (A / scale.value.A) * (h / 2 - 40));
          const N = 160;
          const d = Array.from({ length: N + 1 }, (_, i) => {
            const x = (i / N) * cycles * scale.value.L;
            const y = mid - ampPx * Math.sin((2 * Math.PI * x) / L);
            return `${i === 0 ? 'M' : 'L'} ${pad + x * pxPerUnit} ${y}`;
          }).join(' ');
          const crestX = pad + (L / 4) * pxPerUnit;
          const nextCrestX = pad + 1.25 * L * pxPerUnit;
          const crestY = mid - ampPx;
          return (
            <>
              <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
                <Line
                  x1={pad - 6}
                  y1={mid}
                  x2={w - pad + 6}
                  y2={mid}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dashFine}
                />
                <Path d={d} fill="none" stroke={c.chartHighlight} strokeWidth={chart.stroke} />
                {/* Amplitude: from the middle line up to the crest. */}
                <Line
                  x1={crestX}
                  y1={mid}
                  x2={crestX}
                  y2={crestY}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <ChartText
                  x={crestX + 6}
                  y={(mid + crestY) / 2 + 4}
                  fontSize={chart.label}
                  fontWeight="700"
                >
                  {spec.amplitude ? rep.label(spec.amplitude) : 'amplitude'}
                </ChartText>
                {/* Wavelength: crest to crest. */}
                {nextCrestX < w - pad ? (
                  <>
                    <Line
                      x1={crestX}
                      y1={crestY - 12}
                      x2={nextCrestX}
                      y2={crestY - 12}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <Line
                      x1={crestX}
                      y1={crestY - 17}
                      x2={crestX}
                      y2={crestY - 7}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <Line
                      x1={nextCrestX}
                      y1={crestY - 17}
                      x2={nextCrestX}
                      y2={crestY - 7}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <ChartText
                      x={(crestX + nextCrestX) / 2}
                      y={crestY - 18}
                      fontSize={chart.label}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {rep.label(spec.wavelength)}
                    </ChartText>
                  </>
                ) : null}
              </Svg>
              {known ? (
                <DragHandle
                  testID={`drag-${spec.amplitude ?? spec.wavelength}`}
                  x={crestX}
                  y={crestY}
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
                      ...rep.pin(spec.frequency ? [spec.frequency] : []),
                      ...(spec.amplitude
                        ? {
                            [spec.amplitude]: rep.snapTo(
                              spec.amplitude,
                              Math.max(0, start.current.A - (dy / (h / 2 - 40)) * scale.value.A) *
                                rep.factor(spec.amplitude),
                            ),
                          }
                        : {}),
                      [spec.wavelength]: rep.snapTo(
                        spec.wavelength,
                        Math.max(0.001, start.current.L + (dx / pxPerUnit) * 4) *
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
