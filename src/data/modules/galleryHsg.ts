/**
 * Grades 9–12 gallery demos (group HG; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 */
import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';

// ─── H31 macromolecules ──────────────────────────────────────────────────────

const MACRO_LAYOUT: LayoutDef = {
  id: 'g.s9-biomolecules-polymers',
  title: 'Monomers into polymers',
  kind: 'explore',
  assumptions: [
    'Large biological molecules are built from small units joined by covalent bonds.',
    'Each new bond gives off one water molecule: dehydration synthesis. Adding water back splits the bond: hydrolysis.',
  ],
  figure: { kind: 'macromolecules' },
  scenes: [
    {
      label: 'Carbohydrates',
      lines: [
        'Glucose rings join into chains; starch is thousands of glucose units long.',
        'Three glucose molecules join by 2 bonds and give off 2 water molecules.',
      ],
      macro: { kind: 'carbohydrate', count: 3 },
    },
    {
      label: 'Proteins',
      lines: [
        'Amino acids join end to end by peptide bonds: the carboxyl group of one to the amine group of the next.',
        'Each has its own side chain R, and the chain folds into the protein’s shape.',
      ],
      macro: { kind: 'protein', count: 4 },
    },
    {
      label: 'Nucleic acids',
      lines: [
        'Nucleotides join sugar to phosphate, so the bases hang off a sugar–phosphate backbone.',
        'The strand runs from a free phosphate (the 5′ end) to a free OH (the 3′ end).',
      ],
      macro: { kind: 'nucleicAcid', count: 3 },
    },
    {
      label: 'Lipids',
      lines: [
        'Glycerol takes three fatty acids by ester bonds, giving off 3 water molecules.',
        'A fat is not a polymer: it is not a chain of repeating units.',
      ],
      macro: { kind: 'lipid' },
    },
    {
      label: 'Hydrolysis',
      lines: [
        'Digestion runs the reaction backward: 3 water molecules break a starch chain of 4 glucose units.',
      ],
      macro: { kind: 'carbohydrate', count: 4, split: true },
    },
    {
      label: 'Two units',
      lines: ['The smallest chain: two glucose units make maltose, a disaccharide, and 1 water.'],
      macro: { kind: 'carbohydrate', count: 2 },
    },
  ],
};

export const HSG_GALLERY_MODULES: ModuleDef[] = [];
export const HSG_GALLERY_LAYOUTS: LayoutDef[] = [MACRO_LAYOUT];
