import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, nowrap, useRep } from './common';
import { Leaf, SunDisk } from './nature';
import { Ball, FloorShadow, Sheen, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'leafCount' }>;

/**
 * Two potted plants, one in the sun and one under a shade board, each with as many green
 * leaves as its count, in pairs up the stem. Drag the top of a stem to add or take away leaves.
 */
export function LeafCount({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef({ value: 0, step: 1 });
  const places = spec.places ?? ['sun', 'shade'];
  const ids = usePaintIds('sun', 'pot');
  const counts = spec.items.map((id) =>
    rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0,
  );
  return (
    <View>
      <Canvas aspect={0.82}>
        {({ w, h }) => {
          const slot = w / 2;
          const potTop = h - 58;
          const stemTop = 62;
          // Leaves grow in pairs: one step up the stem per pair, the same for both plants.
          const pairs = Math.max(4, ...counts.map((n) => Math.ceil(n / 2)));
          const step = Math.min(18, (potTop - 10 - stemTop) / pairs);
          const size = Math.max(13, Math.min(24, step * 2.2));
          const tipY = (n: number) => potTop - 10 - Math.max(1, Math.ceil(n / 2)) * step - 6;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={ids.sun} color={c.sunDisk} />
                  <Sheen id={ids.pot} />
                </Defs>
                {spec.items.map((id, i) => {
                  const cx = slot * i + slot / 2;
                  const n = counts[i]!;
                  const known = rep.known(id);
                  const shade = places[i] === 'shade';
                  const top = known ? tipY(n) : tipY(8);
                  return (
                    <G key={id}>
                      <FloorShadow cx={cx + 3} cy={h - 30} rx={30} />
                      {/* The stem and its leaves, in pairs from the bottom up. */}
                      <Path
                        d={`M ${cx} ${potTop} Q ${cx - 3} ${(potTop + top) / 2} ${cx} ${top}`}
                        stroke={c.lifeDeep}
                        strokeWidth={3}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={known ? undefined : chart.dashFine}
                      />
                      {Array.from({ length: n }, (_, k) => {
                        const pair = Math.floor(k / 2);
                        const right = k % 2 === 0;
                        const y = potTop - 12 - pair * step;
                        return (
                          <Leaf
                            key={k}
                            x={cx + (right ? 1.5 : -1.5)}
                            y={y}
                            angle={right ? -28 : -152}
                            size={size}
                            c={c}
                          />
                        );
                      })}
                      {/* The clay pot. */}
                      <Path
                        d={`M ${cx - 26} ${potTop} L ${cx + 26} ${potTop} L ${cx + 20} ${h - 30} L ${cx - 20} ${h - 30} Z`}
                        fill={c.copper}
                        stroke={c.copperDark}
                      />
                      <Path
                        d={`M ${cx - 26} ${potTop} L ${cx + 26} ${potTop} L ${cx + 20} ${h - 30} L ${cx - 20} ${h - 30} Z`}
                        fill={url(ids.pot)}
                      />
                      <Rect
                        x={cx - 29}
                        y={potTop - 3}
                        width={58}
                        height={9}
                        rx={2}
                        fill={c.copper}
                        stroke={c.copperDark}
                      />
                      <Ellipse cx={cx} cy={potTop - 3} rx={26} ry={3} fill={c.soil} />
                      {shade ? (
                        <G>
                          {/* A shade board on two posts, and the shade it throws. */}
                          <Path
                            d={`M ${cx - slot * 0.42} ${44} L ${cx + slot * 0.42} ${44} L ${cx + slot * 0.36} ${h - 30} L ${cx - slot * 0.36} ${h - 30} Z`}
                            fill={c.shadow}
                          />
                          <Rect
                            x={cx - slot * 0.44}
                            y={34}
                            width={slot * 0.88}
                            height={10}
                            rx={2}
                            fill={c.wood}
                            stroke={c.woodDark}
                          />
                          {[-1, 1].map((s) => (
                            <Line
                              key={s}
                              x1={cx + s * slot * 0.4}
                              y1={44}
                              x2={cx + s * slot * 0.4}
                              y2={h - 30}
                              stroke={c.woodDark}
                              strokeWidth={3}
                            />
                          ))}
                        </G>
                      ) : (
                        <SunDisk x={cx - slot * 0.3} y={28} r={11} ball={ids.sun} c={c} />
                      )}
                      <ChartText
                        {...fitLabel(cx + 12, rep.value(id), chart.small, w, 'start', 6)}
                        y={top - 4}
                        fontSize={chart.small}
                        fontWeight="700"
                      >
                        {rep.value(id)}
                      </ChartText>
                      <ChartText
                        {...fitLabel(cx, rep.tag(id), chart.tiny, w)}
                        y={h - 8}
                        fontSize={chart.tiny}
                        fill={c.chartMuted}
                      >
                        {rep.tag(id)}
                      </ChartText>
                    </G>
                  );
                })}
              </Svg>
              {spec.items.map((id, i) => {
                const from = rep.known(id) ? counts[i]! : 8;
                return (
                  <DragHandle
                    key={id}
                    testID={`drag-${id}`}
                    x={slot * i + slot / 2}
                    y={tipY(from)}
                    label={rep.variable(id).name}
                    onStart={() => (start.current = { value: from, step })}
                    onMove={(_, dy) =>
                      calc.set(
                        {
                          ...rep.pin(spec.items.filter((x) => x !== id)),
                          // One pair of leaves per step up the stem.
                          [id]: rep.snapTo(
                            id,
                            (start.current.value - (dy / start.current.step) * 2) * rep.factor(id),
                          ),
                        },
                        rep.slide(id),
                      )
                    }
                  />
                );
              })}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {(() => {
          const listed = spec.items.map((id) => rep.named(id)).join(' · ');
          const names = listed.endsWith('?') ? listed : `${listed}.`;
          const [a, b] = spec.items.map((id) => rep.known(id));
          if (!spec.difference || !a || !b) return names;
          const [x, y] = counts as [number, number];
          if (x === y) return `${names} Both have the same number of leaves.`;
          const more = rep.variable(spec.items[x > y ? 0 : 1]).name;
          const unit = rep.unit(spec.difference) ?? 'leaves';
          return `${names} ${more}: ${nowrap(`${rep.value(spec.difference, false)} more ${unit}`)}.`;
        })()}
      </Caption>
    </View>
  );
}
