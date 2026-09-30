/**
 * Grades 9–12 gallery demos (group HL; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 *
 * Earth and space H71–H80: minerals and the Mohs scale, Earth's interior and earthquakes,
 * landforms, dated rock layers, the ocean, the atmosphere, the greenhouse effect, energy
 * sources, the H–R diagram and the expanding universe.
 */
import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';

// ── H71: minerals and the Mohs scale ──

const MINERAL_WHY = [
  'A mineral is a natural, inorganic solid with a definite chemical makeup and an orderly crystal structure.',
  'Minerals are identified by their properties: luster, streak, hardness, cleavage or fracture, and density.',
];

const mineralLayouts: LayoutDef[] = [
  {
    id: 'g.s12-minerals-rocks-luster',
    title: 'Luster: metallic or nonmetallic',
    kind: 'sort',
    use: 'Use this for sorting minerals by how their surfaces reflect light.',
    assumptions: [
      ...MINERAL_WHY,
      'Luster is how a fresh surface reflects light: like polished metal, or glassy, pearly, silky or dull.',
    ],
    question: 'Does it shine like polished metal?',
    bins: [
      {
        id: 'metallic',
        label: 'Metallic luster',
        why: 'Opaque and shiny like metal; the streak is dark (pyrite’s greenish black, hematite’s red-brown).',
      },
      {
        id: 'nonmetallic',
        label: 'Nonmetallic luster',
        why: 'Glassy, pearly or dull: light passes into the crystal instead of bouncing off a metal surface.',
      },
    ],
    cards: [
      { label: 'Pyrite', bin: 'metallic', figure: { kind: 'icon', icon: 'pyrite' } },
      { label: 'Hematite', bin: 'metallic', figure: { kind: 'icon', icon: 'hematite' } },
      { label: 'Quartz', bin: 'nonmetallic', figure: { kind: 'icon', icon: 'quartz' } },
      { label: 'Feldspar', bin: 'nonmetallic', figure: { kind: 'icon', icon: 'feldspar' } },
      { label: 'Mica', bin: 'nonmetallic', figure: { kind: 'icon', icon: 'mica' } },
      { label: 'Calcite', bin: 'nonmetallic', figure: { kind: 'icon', icon: 'calcite' } },
      { label: 'Halite', bin: 'nonmetallic', figure: { kind: 'icon', icon: 'halite' } },
    ],
  },
  {
    id: 'g.s12-minerals-rocks-cleavage',
    title: 'Cleavage or fracture',
    kind: 'sort',
    use: 'Use this for telling minerals that split along flat planes from ones that break unevenly.',
    assumptions: [
      ...MINERAL_WHY,
      'Cleavage is splitting along flat planes where the bonds in the crystal are weakest.',
      'Fracture is breaking along curved or uneven surfaces, where the bonds are equally strong in every direction.',
    ],
    question: 'Does it split along flat planes?',
    bins: [
      {
        id: 'cleavage',
        label: 'Cleavage',
        why: 'Mica splits in one direction into sheets, feldspar in two at right angles, halite in three into cubes and calcite in three into rhombs.',
      },
      {
        id: 'fracture',
        label: 'Fracture',
        why: 'Quartz breaks in smooth curved shells, and pyrite and hematite break unevenly.',
      },
    ],
    cards: [
      { label: 'Mica', bin: 'cleavage', figure: { kind: 'icon', icon: 'mica' } },
      { label: 'Feldspar', bin: 'cleavage', figure: { kind: 'icon', icon: 'feldspar' } },
      { label: 'Halite', bin: 'cleavage', figure: { kind: 'icon', icon: 'halite' } },
      { label: 'Calcite', bin: 'cleavage', figure: { kind: 'icon', icon: 'calcite' } },
      { label: 'Quartz', bin: 'fracture', figure: { kind: 'icon', icon: 'quartz' } },
      { label: 'Pyrite', bin: 'fracture', figure: { kind: 'icon', icon: 'pyrite' } },
      { label: 'Hematite', bin: 'fracture', figure: { kind: 'icon', icon: 'hematite' } },
    ],
  },
  {
    id: 'g.s12-minerals-rocks-mohs',
    title: 'The Mohs hardness scale',
    kind: 'explore',
    use: 'Use this for estimating a mineral’s hardness from what scratches it and what it scratches.',
    assumptions: [
      'Hardness is how well a mineral resists being scratched.',
      'The Mohs scale ranks ten minerals from talc (1) to diamond (10); each scratches every mineral ranked below it.',
      'Everyday tools fit between them: a fingernail is about 2.5, a copper coin 3.5, glass 5.5 and a steel file 6.5.',
    ],
    figure: { kind: 'mohsScale' },
    scenes: [
      {
        label: 'The scale',
        lines: [
          'The ten minerals are ranked by which scratches which.',
          'The dashed lines show where the everyday scratch tools fit.',
        ],
        mohs: {},
      },
      {
        label: 'Quartz scratches glass',
        lines: [
          'Quartz, at 7, is harder than glass at 5.5, so it scratches a glass plate.',
          'Topaz, corundum and diamond scratch quartz.',
        ],
        mohs: { lit: 7 },
      },
      {
        label: 'An unknown mineral',
        lines: [
          'An unknown mineral scratches glass, but a steel file scratches it.',
          'Its hardness is between 5.5 and 6.5: orthoclase feldspar, at 6, fits.',
        ],
        mohs: { between: [5.5, 6.5], lit: 6 },
      },
      {
        label: 'Softer than a fingernail',
        lines: [
          'A fingernail scratches talc and gypsum, so both are softer than 2.5.',
          'Talc, at 1, feels soapy and is the softest mineral on the scale.',
        ],
        mohs: { between: [1, 2.5], lit: 1 },
      },
      {
        label: 'Absolute hardness',
        lines: [
          'The ranks are equal steps, but the hardness is not.',
          'Diamond, at 10, is about 15 times as hard as quartz at 7, and almost 4 times as hard as corundum at 9.',
        ],
        mohs: { absolute: true, lit: 10 },
      },
    ],
  },
];

export const HSL_GALLERY_MODULES: ModuleDef[] = [];
export const HSL_GALLERY_LAYOUTS: LayoutDef[] = [...mineralLayouts];
