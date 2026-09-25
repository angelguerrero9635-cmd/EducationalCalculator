import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Line, Path, Polygon, Rect } from 'react-native-svg';

import { SegmentedControl } from '@/components/SegmentedControl';
import type { Representation } from '@/data/modules';
import { chart, font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep, Caption } from './common';

type Spec = Extract<Representation, { kind: 'solid' }>;

/** The Kindergarten solids by their flat faces and curved surfaces. */
const SOLIDS = [
  { value: 'sphere', label: 'Sphere', flat: 0, curved: 1 },
  { value: 'cone', label: 'Cone', flat: 1, curved: 1 },
  { value: 'cylinder', label: 'Cylinder', flat: 2, curved: 1 },
  { value: 'cube', label: 'Cube', flat: 6, curved: 0 },
] as const;
type SolidName = (typeof SOLIDS)[number]['value'];

/**
 * A solid shape (sphere, cone, cylinder or cube), picked with the buttons above it. Flat faces
 * are shaded; curved surfaces are plain. The caption says whether it rolls and stacks.
 */
export function Solid({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const known = rep.known(spec.flat) && rep.known(spec.curved);
  const f = Math.round(rep.shown(spec.flat));
  const k = Math.round(rep.shown(spec.curved));
  const solid = known ? SOLIDS.find((s) => s.flat === f && s.curved === k) : undefined;
  const ink = { stroke: c.chartInk, strokeWidth: chart.strokeHeavy };

  return (
    <View>
      <View style={styles.toggle}>
        <SegmentedControl<SolidName>
          segments={SOLIDS.map(({ value, label }) => ({ value, label }))}
          value={solid?.value ?? ('' as SolidName)}
          onChange={(v) => {
            const s = SOLIDS.find((x) => x.value === v)!;
            calc.set({ [spec.flat]: s.flat, [spec.curved]: s.curved });
          }}
        />
      </View>
      <Canvas aspect={0.6}>
        {({ w, h }) => {
          const cx = w / 2;
          const cy = h / 2;
          const r = Math.min(w, h) * 0.32;
          const e = r * 0.3;
          return (
            <Svg width={w} height={h} opacity={solid ? 1 : 0.35}>
              {solid?.value === 'sphere' ? (
                <>
                  <Ellipse cx={cx} cy={cy} rx={r} ry={r} fill="transparent" {...ink} />
                  <Ellipse
                    cx={cx}
                    cy={cy}
                    rx={r}
                    ry={e}
                    fill="none"
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dash}
                  />
                </>
              ) : solid?.value === 'cone' ? (
                <>
                  <Path
                    d={`M ${cx - r} ${cy + r * 0.8} L ${cx} ${cy - r} L ${cx + r} ${cy + r * 0.8}`}
                    fill="none"
                    {...ink}
                  />
                  <Ellipse cx={cx} cy={cy + r * 0.8} rx={r} ry={e} fill={c.chartFill} {...ink} />
                </>
              ) : solid?.value === 'cylinder' ? (
                <>
                  <Line x1={cx - r} y1={cy - r * 0.7} x2={cx - r} y2={cy + r * 0.7} {...ink} />
                  <Line x1={cx + r} y1={cy - r * 0.7} x2={cx + r} y2={cy + r * 0.7} {...ink} />
                  <Ellipse cx={cx} cy={cy + r * 0.7} rx={r} ry={e} fill={c.chartFill} {...ink} />
                  <Ellipse cx={cx} cy={cy - r * 0.7} rx={r} ry={e} fill={c.chartFill} {...ink} />
                </>
              ) : solid?.value === 'cube' ? (
                <>
                  <Rect
                    x={cx - r * 0.85}
                    y={cy - r * 0.55}
                    width={r * 1.3}
                    height={r * 1.3}
                    fill={c.chartFill}
                    {...ink}
                  />
                  <Polygon
                    points={`${cx - r * 0.85},${cy - r * 0.55} ${cx - r * 0.45},${cy - r * 0.95} ${cx + r * 0.85},${cy - r * 0.95} ${cx + r * 0.45},${cy - r * 0.55}`}
                    fill={c.chartFill}
                    {...ink}
                  />
                  <Polygon
                    points={`${cx + r * 0.45},${cy - r * 0.55} ${cx + r * 0.85},${cy - r * 0.95} ${cx + r * 0.85},${cy + r * 0.35} ${cx + r * 0.45},${cy + r * 0.75}`}
                    fill={c.chartFill}
                    {...ink}
                  />
                </>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {solid
          ? `A ${solid.label.toLowerCase()}: ${rep.label(spec.flat)} flat, ${rep.label(spec.curved)} curved. ${
              solid.curved ? 'It rolls.' : 'It doesn’t roll.'
            } ${solid.flat ? 'It stacks.' : 'It doesn’t stack.'}`
          : 'Pick a solid shape above.'}
      </Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { paddingHorizontal: space.md, marginBottom: space.sm },
});
