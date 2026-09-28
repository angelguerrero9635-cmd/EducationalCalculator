/**
 * Round-4 gallery demos (group B; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 */
import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';

export const R4B_GALLERY_MODULES: ModuleDef[] = [];
export const R4B_GALLERY_LAYOUTS: LayoutDef[] = [
  {
    id: 'g.r4b-earth',
    title: 'Earth: down and day',
    kind: 'explore',
    assumptions: ['The arrow is the pull of gravity.', 'The sun lights the left half.'],
    figure: { kind: 'earth' },
    scenes: [
      { label: 'Top', lines: ['At the top.'], earth: { spot: 'top' } },
      { label: 'Side', lines: ['On the side.'], earth: { spot: 'side' } },
      { label: 'Bottom', lines: ['At the bottom.'], earth: { spot: 'bottom' } },
      { label: 'Thrown', lines: ['Thrown up.'], earth: { spot: 'top', thrown: true } },
      ...(['morning', 'noon', 'evening', 'midnight'] as const).map((sunlit) => ({
        label: sunlit,
        lines: ['Lit by the sun.'],
        earth: { spot: 'top' as const, sunlit },
      })),
    ],
  },
  {
    id: 'g.r4b-light-path',
    title: 'Light path',
    kind: 'explore',
    assumptions: ['The lamp is the only light.', 'The yellow arrows are the light.'],
    figure: { kind: 'lightPath' },
    scenes: [
      { label: 'Lamp on', lines: ['Lamp on.'], light: { lamp: true } },
      { label: 'Dark room', lines: ['Lamp off.'], light: { lamp: false } },
      { label: 'Hand', lines: ['Eyes covered.'], light: { lamp: true, blocker: 'hand' } },
      { label: 'Mirror', lines: ['A mirror.'], light: { lamp: true, blocker: 'mirror' } },
      {
        label: 'Block',
        lines: ['A block.'],
        light: { lamp: true, blocker: 'solid', height: 'high' },
      },
      { label: 'Low', lines: ['Low lamp.'], light: { lamp: true, wall: true, height: 'low' } },
      { label: 'Off', lines: ['Lamp off.'], light: { lamp: false, wall: true, height: 'low' } },
    ],
  },
  {
    id: 'g.r4b-flashes',
    title: 'Flash codes',
    kind: 'explore',
    assumptions: ['A dot is a short flash.', 'A dash is a long flash.'],
    figure: { kind: 'flashes' },
    scenes: [
      { label: 'One', lines: ['One flash.'], flashes: '●' },
      { label: 'Two', lines: ['Two flashes.'], flashes: '● ●' },
      { label: 'Three', lines: ['Three flashes.'], flashes: '● ● ●' },
      { label: 'Help', lines: ['Help.'], flashes: '● ● ● — — — ● ● ●' },
      { label: 'Mixed', lines: ['Short and long.'], flashes: '● — ● — ● — ●' },
      { label: 'Long run', lines: ['Five long.'], flashes: '— — — — —' },
    ],
  },
];
