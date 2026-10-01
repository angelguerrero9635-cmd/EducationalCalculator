/**
 * H109: the `parts` figure's `flower` drawing, a flower cut in half from top to bottom (as a
 * textbook draws it): sepals at the base, two petals opening up, a stamen each side (a filament
 * holding up an anther with its pollen) and the pistil in the middle (the sticky stigma on the
 * style, the ovary at the base holding three ovules, each with an egg). Parts: petal, sepal,
 * anther, filament, stigma, style, ovary, ovule. Drawn with the parts kit, light from the top
 * left, in the box `partsDrawings.tsx` scales to the screen (320 wide).
 */
import { Circle, G, Path } from 'react-native-svg';

import { ell } from './drawKit';
import type { PartsDrawingDef } from './partsDrawings';

export const FLOWER: PartsDrawingDef = {
  height: 180,
  top: 76,
  back: ({ line, c }) => (
    // The flower stalk, under everything.
    <G>{line('M 160 212 C 158 226 162 238 160 254', c.lifeDeep, 6)}</G>
  ),
  regions: [
    {
      key: 'sepal',
      art: ({ shape, c }, lit) => (
        <>
          {shape('M 156 206 C 140 214 118 214 104 202 C 122 196 142 198 156 206 Z', c.life, {
            lit,
          })}
          {shape('M 164 206 C 180 214 202 214 216 202 C 198 196 178 198 164 206 Z', c.life, {
            lit,
          })}
        </>
      ),
      anchor: [116, 204],
      label: [80, 222, 'end'],
      hit: [100, 194, 120, 24],
    },
    {
      key: 'petal',
      art: ({ shape, c }, lit) => (
        <>
          {shape('M 150 202 C 118 186 90 150 94 104 C 124 118 146 160 156 200 Z', c.petalPink, {
            lit,
          })}
          {shape('M 170 202 C 202 186 230 150 226 104 C 196 118 174 160 164 200 Z', c.petalPink, {
            lit,
          })}
        </>
      ),
      anchor: [104, 136],
      label: [80, 138, 'end'],
      hit: [90, 100, 50, 90],
    },
    {
      key: 'filament',
      art: ({ line, c }, lit) => (
        <>
          {line('M 148 198 C 140 170 128 142 124 112', c.flowerWhite, 2.2, lit)}
          {line('M 172 198 C 180 170 192 142 196 112', c.flowerWhite, 2.2, lit)}
        </>
      ),
      // On the left filament itself (its curve passes 134.5, 156), not the petal behind it.
      anchor: [134.5, 156],
      label: [80, 176, 'end'],
      hit: [118, 120, 30, 76],
    },
    {
      key: 'anther',
      art: ({ shape, c }, lit) => (
        <>
          {shape(ell(123, 104, 6, 11), c.pollen, { lit })}
          {shape(ell(197, 104, 6, 11), c.pollen, { lit })}
          {/* Pollen grains shed from the anthers. */}
          {[
            [114, 92],
            [110, 100],
            [206, 92],
            [210, 100],
          ].map(([x, y]) => (
            <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill={c.pollen} />
          ))}
        </>
      ),
      anchor: [118, 100],
      label: [80, 92, 'end'],
      hit: [108, 88, 28, 32],
    },
    {
      key: 'ovary',
      art: ({ shape, c }, lit) => shape(ell(160, 184, 20, 19), c.life, { lit }),
      anchor: [179, 180],
      label: [242, 174, 'start'],
      hit: [138, 164, 44, 40],
    },
    {
      key: 'ovule',
      art: ({ shape, c }, lit) => (
        <>
          {[174, 185, 196].map((y) => (
            <G key={y}>
              <Path d={`M 160 ${y} h 4`} stroke={c.lifeDeep} strokeWidth={1.2} />
              {shape(ell(169, y, 5, 4), c.flowerWhite, { lit, w: 1 })}
            </G>
          ))}
        </>
      ),
      anchor: [172, 196],
      label: [242, 206, 'start'],
      hit: [160, 168, 18, 34],
    },
    {
      key: 'style',
      art: ({ line, c }, lit) => line('M 160 166 C 159 142 161 118 160 98', c.life, 4, lit),
      anchor: [160, 130],
      label: [242, 132, 'start'],
      hit: [150, 100, 20, 64],
    },
    {
      key: 'stigma',
      art: ({ shape, c }, lit) =>
        shape('M 148 96 C 150 84 170 84 172 96 C 166 92 154 92 148 96 Z', c.sunDisk, { lit }),
      anchor: [168, 90],
      label: [242, 88, 'start'],
      hit: [144, 80, 32, 20],
    },
  ],
};
