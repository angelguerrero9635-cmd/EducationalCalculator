/**
 * College card icons, round 4, group J, 48 × 48 like every card icon. HC154: tissues as drawn
 * sections in a round swatch (not micrographs), in the stains a slide shows them in: eosin pink
 * cytoplasm, hematoxylin purple nuclei, the basement membrane under an epithelium, blue-grey
 * cartilage matrix, bone's rings round a canal, a blood smear, fat cells, three muscles and a
 * neuron among its glia. The names are listed in data/modules/layouts/icons/he4j.ts.
 */
import type { ReactNode } from 'react';
import { Circle, ClipPath, Defs, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { usePalette } from '@/theme';

import { TopLight, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

/** The swatch every tissue is drawn in. */
const SW = { x: 2, y: 2, w: 44, h: 44, r: 7 };

/** A lens (a spindle cell) centred at (x, y), `l` long and `h` thick. */
const lens = (x: number, y: number, l: number, h: number) =>
  `M ${x - l / 2} ${y} Q ${x} ${y - h} ${x + l / 2} ${y} Q ${x} ${y + h} ${x - l / 2} ${y} Z`;

/** A pointy-top hexagon's corners round (x, y). */
const hexagon = (x: number, y: number, r: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k + Math.PI / 6;
    return `${(x + r * Math.cos(a)).toFixed(2)},${(y + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');

export function He4jIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('clip', 'light');

  const nucleus = (x: number, y: number, rx: number, ry: number, key?: string, rot = 0) => (
    <Ellipse
      key={key ?? `n${x},${y}`}
      cx={x}
      cy={y}
      rx={rx}
      ry={ry}
      fill={c.he4jNucleus}
      transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}
    />
  );
  /** A tissue drawn in the round swatch, clipped to it, its edge in the card's ink. */
  const swatch = (ground: string, body: ReactNode) => (
    <G>
      <Defs>
        <ClipPath id={ids.clip}>
          <Rect x={SW.x} y={SW.y} width={SW.w} height={SW.h} rx={SW.r} />
        </ClipPath>
        <TopLight id={ids.light} strength={0.5} />
      </Defs>
      <G clipPath={url(ids.clip)}>
        <Rect x={SW.x} y={SW.y} width={SW.w} height={SW.h} fill={ground} />
        {body}
        <Rect x={SW.x} y={SW.y} width={SW.w} height={SW.h} fill={url(ids.light)} />
      </G>
      <Rect
        x={SW.x}
        y={SW.y}
        width={SW.w}
        height={SW.h}
        rx={SW.r}
        fill="none"
        stroke={ink}
        strokeWidth={1}
      />
    </G>
  );
  /** Under an epithelium: the basement membrane at y = 34 and loose connective tissue. */
  const underlay = (
    <G>
      <Rect x={0} y={34} width={48} height={14} fill={c.he4jEosin} fillOpacity={0.35} />
      <Path
        d="M 4 39 Q 12 36 20 39 T 36 39 T 50 39 M 0 43 Q 9 41 17 43 T 33 43 T 49 43"
        stroke={c.he4jEosin}
        strokeWidth={1}
        fill="none"
      />
      {nucleus(13, 41, 1.8, 0.8, 'f1')}
      {nucleus(33, 37.5, 1.8, 0.8, 'f2')}
      <Line x1={0} y1={34} x2={48} y2={34} stroke={c.he4jMembrane} strokeWidth={1.4} />
    </G>
  );
  /** A row of cells on the membrane: tops at `top`, each `w` wide, borders in membrane colour. */
  const cellRow = (x0: number, n: number, w: number, top: number, bottom = 34) =>
    Array.from({ length: n }, (_, i) => (
      <Rect
        key={`c${i}-${top}`}
        x={x0 + i * w}
        y={top}
        width={w}
        height={bottom - top}
        fill={c.he4jEosin}
        stroke={c.he4jMembrane}
        strokeWidth={0.6}
      />
    ));

  switch (icon) {
    // ── Epithelia: the free surface up, the basement membrane under them ──
    case 'simple squamous epithelium':
      return swatch(
        c.paper,
        <G>
          {underlay}
          <Path
            d="M 0 34 V 31.5 H 6 Q 10 28 14 31.5 H 20 Q 24 28 28 31.5 H 34 Q 38 28 42 31.5 H 48 V 34 Z"
            fill={c.he4jEosin}
            stroke={c.he4jMembrane}
            strokeWidth={0.6}
          />
          {[10, 24, 38].map((x) => nucleus(x, 31.2, 3.6, 1.5))}
          {[17, 31, 45].map((x) => (
            <Line
              key={x}
              x1={x}
              y1={31.5}
              x2={x}
              y2={34}
              stroke={c.he4jMembrane}
              strokeWidth={0.6}
            />
          ))}
        </G>,
      );
    case 'simple cuboidal epithelium':
      return swatch(
        c.paper,
        <G>
          {underlay}
          {cellRow(1.5, 5, 9, 25)}
          {[0, 1, 2, 3, 4].map((i) => (
            <Circle key={i} cx={6 + i * 9} cy={29.5} r={2.3} fill={c.he4jNucleus} />
          ))}
        </G>,
      );
    case 'simple columnar epithelium':
      return swatch(
        c.paper,
        <G>
          {underlay}
          {cellRow(3, 7, 6, 13)}
          {/* The brush border on the free surface. */}
          <Path
            d={Array.from({ length: 21 }, (_, i) => `M ${3.5 + i * 2} 13 V 11.2`).join(' ')}
            stroke={c.he4jMembrane}
            strokeWidth={0.5}
          />
          {/* A goblet cell, its mucus pale. */}
          <Path d="M 21 34 V 24 Q 18.5 15 24 13.5 Q 29.5 15 27 24 V 34 Z" fill={c.he4jEosin} />
          <Path
            d="M 21.4 22 Q 19.5 15 24 14.2 Q 28.5 15 26.6 22 Q 24 24.5 21.4 22 Z"
            fill={c.paper}
            stroke={c.he4jMembrane}
            strokeWidth={0.5}
          />
          {[0, 1, 2, 4, 5, 6].map((i) => nucleus(6 + i * 6, 28.5, 1.7, 3))}
          {nucleus(24, 30.5, 1.8, 1.4, 'goblet')}
        </G>,
      );
    case 'stratified squamous epithelium':
      return swatch(
        c.paper,
        <G>
          {underlay}
          {/* Basal cells, small and cuboidal, then polygonal cells, then flat ones at the top. */}
          {cellRow(0, 8, 6, 29)}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Circle key={`b${i}`} cx={3 + i * 6} cy={31.5} r={1.5} fill={c.he4jNucleus} />
          ))}
          {cellRow(-3.5, 7, 8, 23, 29)}
          {cellRow(0.5, 6, 8, 17.5, 23)}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Circle key={`m${i}`} cx={4.5 + i * 8} cy={20.2} r={1.5} fill={c.he4jNucleus} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Circle key={`p${i}`} cx={0.5 + i * 8} cy={26} r={1.6} fill={c.he4jNucleus} />
          ))}
          {cellRow(-6, 5, 12, 14.5, 17.5)}
          {cellRow(0, 4, 12, 12, 14.5)}
          {[0, 1, 2, 3].map((i) => nucleus(6 + i * 12, 16, 2.6, 0.7, `f${i}`))}
          <Rect x={0} y={9.8} width={48} height={2.2} fill={c.he4jEosin} fillOpacity={0.6} />
        </G>,
      );

    // ── Connective tissues ──
    case 'compact bone':
      return swatch(
        c.bone,
        <G>
          {/* Corners of the neighbouring osteons. */}
          {[
            [2, 2],
            [46, 46],
            [46, 2],
          ].map(([x, y]) =>
            [5, 9].map((r) => (
              <Circle
                key={`${x}${y}${r}`}
                cx={x}
                cy={y}
                r={r}
                fill="none"
                stroke={c.he4jLamella}
                strokeWidth={1}
              />
            )),
          )}
          {/* One osteon: rings of lamellae round the central canal, osteocytes between. */}
          {[17, 13.5, 10, 6.5].map((r) => (
            <Circle
              key={r}
              cx={23}
              cy={25}
              r={r}
              fill="none"
              stroke={c.he4jLamella}
              strokeWidth={1.3}
            />
          ))}
          {[
            [15.2, 0],
            [15.2, 50],
            [15.2, 110],
            [15.2, 170],
            [15.2, 230],
            [15.2, 290],
            [11.8, 25],
            [11.8, 95],
            [11.8, 160],
            [11.8, 220],
            [11.8, 300],
            [8.3, 70],
            [8.3, 190],
            [8.3, 320],
          ].map(([r, deg]) => {
            const a = (deg! * Math.PI) / 180;
            const x = 23 + r! * Math.cos(a);
            const y = 25 + r! * Math.sin(a);
            return nucleus(x, y, 1.6, 0.75, `o${r}-${deg}`, deg! + 90);
          })}
          <Circle
            cx={23}
            cy={25}
            r={3.6}
            fill={c.paper}
            stroke={c.he4jMembrane}
            strokeWidth={0.8}
          />
          <Circle cx={23} cy={25} r={1.3} fill={c.bloodCell} />
        </G>,
      );
    case 'hyaline cartilage':
      return swatch(
        c.he4jMatrix,
        <G>
          {/* Chondrocytes in their lacunae, some in pairs (one cell divided). */}
          {[
            [11, 12],
            [16.5, 12.5],
            [33, 10],
            [26, 22],
            [26, 27.5],
            [11, 31],
            [38, 27],
            [38.5, 32.5],
            [19, 39],
            [34, 41],
          ].map(([x, y]) => (
            <G key={`${x},${y}`}>
              <Ellipse cx={x} cy={y} rx={3.2} ry={2.6} fill={c.paper} />
              <Ellipse cx={x} cy={y} rx={2.2} ry={1.8} fill={c.he4jEosin} />
              <Circle cx={x} cy={y} r={0.9} fill={c.he4jNucleus} />
            </G>
          ))}
        </G>,
      );
    case 'blood smear':
      return swatch(
        c.he4jPlasma,
        <G>
          {[
            [9, 9],
            [22, 7],
            [38, 10],
            [8, 24],
            [15, 37],
            [30, 39],
            [41, 34],
            [40, 22],
          ].map(([x, y]) => (
            <G key={`${x},${y}`}>
              <Circle cx={x} cy={y} r={4.4} fill={c.bloodCell} />
              <Circle cx={x} cy={y} r={1.8} fill={c.organ} />
            </G>
          ))}
          {/* A neutrophil: pale cytoplasm, a nucleus in three lobes. */}
          <Circle cx={24} cy={23} r={6.2} fill={c.he4jEosin} fillOpacity={0.55} />
          <Path
            d="M 20.5 21 Q 22 18.5 24 21 Q 26 18.5 27.5 21.5 Q 28.5 25 25.5 25.5 Q 24 27 22.5 25.5 Q 19.5 24.5 20.5 21 Z"
            fill={c.he4jNucleus}
          />
          {[
            [31, 28],
            [17, 15],
            [26, 32],
          ].map(([x, y]) => (
            <Circle key={`p${x}`} cx={x} cy={y} r={0.9} fill={c.he4jNucleus} />
          ))}
        </G>,
      );
    case 'adipose tissue': {
      const R = 10;
      const dx = Math.sqrt(3) * R;
      const cells: [number, number][] = [];
      for (let row = 0; row < 4; row++)
        for (let col = -1; col < 4; col++)
          cells.push([col * dx + (row % 2 ? dx / 2 : 0) + 4, row * 1.5 * R + 2]);
      return swatch(
        c.he4jEosin,
        <G>
          {cells.map(([x, y]) => (
            <Polygon
              key={`${x},${y}`}
              points={hexagon(x, y, R - 0.9)}
              fill={c.fat}
              stroke={c.he4jEosin}
              strokeWidth={0.6}
            />
          ))}
          {/* Each cell's nucleus pushed flat against its edge by the fat droplet. */}
          {cells.map(([x, y], i) =>
            nucleus(x + (i % 2 ? -5.2 : 5.2), y + 4.5, 2.2, 0.9, `n${i}`, i % 2 ? 60 : -60),
          )}
        </G>,
      );
    }

    // ── Muscles ──
    case 'skeletal muscle tissue':
      return swatch(
        c.paper,
        <G>
          {[5, 18.5, 32].map((y, f) => (
            <G key={y}>
              <Rect x={0} y={y} width={48} height={11} fill={c.he4jMuscle} />
              <Path
                d={Array.from({ length: 24 }, (_, i) => `M ${1 + i * 2} ${y} v 11`).join(' ')}
                stroke={c.he4jStriation}
                strokeWidth={0.7}
                strokeOpacity={0.75}
              />
              {/* Many nuclei, pushed to the fibre's edge. */}
              {[8 + f * 5, 24 + f * 3, 40 - f * 4].map((x, k) =>
                nucleus(x, k % 2 ? y + 10 : y + 1, 2.8, 0.9, `${y}-${x}`),
              )}
            </G>
          ))}
        </G>,
      );
    case 'cardiac muscle tissue':
      return swatch(
        c.paper,
        <G>
          {/* Two fibres joined by a branch. */}
          <Path
            d="M 0 7 H 48 V 18 H 30 L 38 30 H 48 V 41 H 0 V 30 H 26 L 18 18 H 0 Z"
            fill={c.he4jMuscle}
          />
          <Path
            d={[
              ...Array.from({ length: 23 }, (_, i) => `M ${1.5 + i * 2} 7 v 11`),
              ...Array.from({ length: 23 }, (_, i) => `M ${1.5 + i * 2} 30 v 11`),
            ].join(' ')}
            stroke={c.he4jStriation}
            strokeWidth={0.6}
            strokeOpacity={0.55}
          />
          {/* Intercalated discs: dark steps across each fibre. */}
          <Path
            d="M 12 7 V 10.5 H 14 V 14.5 H 12 V 18 M 35 30 V 33.5 H 37 V 37.5 H 35 V 41"
            stroke={c.he4jStriation}
            strokeWidth={1.6}
            fill="none"
          />
          {/* One central nucleus a cell, in a pale halo. */}
          {[
            [27, 12.5],
            [6, 12.5],
            [22, 35.5],
            [44, 35.5],
          ].map(([x, y]) => (
            <G key={`${x},${y}`}>
              <Ellipse cx={x} cy={y} rx={4} ry={2.4} fill={c.he4jEosin} />
              {nucleus(x!, y!, 2.6, 1.5)}
            </G>
          ))}
        </G>,
      );
    case 'smooth muscle tissue':
      return swatch(
        c.paper,
        <G>
          {[
            [3, 0],
            [10, 13],
            [17, 0],
            [24, 13],
            [31, 0],
            [38, 13],
            [45, 0],
          ].flatMap(([y, off]) =>
            [-13, 13, 39].map((x) => (
              <G key={`${y},${x}`}>
                <Path d={lens(x + off!, y!, 26, 4.2)} fill={c.he4jMuscle} fillOpacity={0.85} />
                {nucleus(x + off!, y!, 3.2, 0.9)}
              </G>
            )),
          )}
        </G>,
      );

    // ── Nervous tissue ──
    case 'neuron with glia':
      return swatch(
        c.paper,
        <G>
          <Rect x={0} y={0} width={48} height={48} fill={c.he4jEosin} fillOpacity={0.25} />
          {/* Dendrites (tapered) and the axon, then the cell body. */}
          {[
            'M 20 20 Q 13 15 5 12',
            'M 22 18 Q 23 10 19 3',
            'M 26 20 Q 33 14 43 11',
            'M 18 25 Q 10 28 4 36',
          ].map((d) => (
            <Path
              key={d}
              d={d}
              stroke={c.neuronCell}
              strokeWidth={2.2}
              strokeLinecap="round"
              fill="none"
            />
          ))}
          <Path d="M 26 26 Q 32 33 44 44" stroke={c.neuronCell} strokeWidth={1.3} fill="none" />
          <Path
            d="M 15.5 21 Q 18 14.5 23 15.5 Q 29 16.5 28.5 22.5 Q 28 28 22 28.5 Q 15 28 15.5 21 Z"
            fill={c.neuronCell}
            stroke={ink}
            strokeWidth={0.5}
          />
          <Circle cx={22} cy={22} r={3.1} fill={c.paper} />
          <Circle cx={22.4} cy={21.6} r={1.1} fill={c.he4jNucleus} />
          {/* Glia: satellite cells hugging the body, an astrocyte's star, scattered nuclei. */}
          {[
            [14.2, 23.5],
            [29.5, 20],
            [9, 42],
            [40, 26],
            [33, 6],
            [6, 4.5],
          ].map(([x, y]) => (
            <Circle key={`${x},${y}`} cx={x} cy={y} r={1.7} fill={c.he4jGlia} />
          ))}
          <Path
            d="M 38 37 l -5 -3 M 38 37 l 4 -5 M 38 37 l 5 2 M 38 37 l -2 6 M 38 37 l -6 2"
            stroke={c.he4jGlia}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          <Circle cx={38} cy={37} r={2} fill={c.he4jGlia} />
        </G>,
      );
    default:
      return null;
  }
}
