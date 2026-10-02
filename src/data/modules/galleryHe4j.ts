/**
 * College gallery demos, round 4, group J (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC154: tissue card icons (he.biology.anatomy-physiology#0, ~epithelia).
 */
import type { LayoutDef } from './layouts';
import type { CardIcon } from './layouts/types';
import type { ModuleDef } from './types';

/** A sort card with its drawn icon. */
const icon = (label: string, bin: string, name: CardIcon) => ({
  label,
  bin,
  figure: { kind: 'icon' as const, icon: name },
});

// ─── HC154: tissues (anatomy-physiology#0, ~epithelia) ──────────────────────────

const sortTissues: LayoutDef = {
  id: 'g.he-cardIcons-tissues',
  title: 'The four tissue types',
  kind: 'sort',
  use: 'Use this for naming the tissue type a section shows: epithelial, connective, muscle or nervous.',
  assumptions: [
    'Epithelium covers surfaces and lines tubes: cells packed side by side on a basement membrane.',
    'Connective tissue is mostly matrix around scattered cells: bone, cartilage, blood and fat.',
    'Muscle cells contract; nervous tissue is neurons and the glia that support them.',
  ],
  question: 'Which tissue type is each section?',
  bins: [
    {
      id: 'epithelial',
      label: 'Epithelial',
      why: 'Cells packed edge to edge on a basement membrane, one free surface.',
    },
    {
      id: 'connective',
      label: 'Connective',
      why: 'Few cells in a lot of matrix: mineral, gel, plasma or stored fat.',
    },
    { id: 'muscle', label: 'Muscle', why: 'Long cells full of contractile filaments.' },
    { id: 'nervous', label: 'Nervous', why: 'Neurons with long processes, glia around them.' },
  ],
  cards: [
    icon('Skin’s surface', 'epithelial', 'stratified squamous epithelium'),
    icon('Bone', 'connective', 'compact bone'),
    icon('Cartilage', 'connective', 'hyaline cartilage'),
    icon('Blood', 'connective', 'blood smear'),
    icon('Adipose (fat)', 'connective', 'adipose tissue'),
    icon('Skeletal muscle', 'muscle', 'skeletal muscle tissue'),
    icon('Cardiac muscle', 'muscle', 'cardiac muscle tissue'),
    icon('Smooth muscle', 'muscle', 'smooth muscle tissue'),
    icon('Neuron with glia', 'nervous', 'neuron with glia'),
  ],
};

const sortEpithelia: LayoutDef = {
  id: 'g.he-cardIcons-epithelia',
  title: 'Epithelia by shape and layers',
  kind: 'sort',
  use: 'Use this for naming an epithelium by its cells’ shape and its layers, from where it lines and what it does.',
  assumptions: [
    'Simple means one layer of cells; stratified means many, named by the shape of the top layer.',
    'Squamous cells are flat, cuboidal as tall as wide, columnar taller than wide.',
    'Thin layers suit diffusion; tall cells absorb and secrete; many layers resist wear.',
  ],
  question: 'Which epithelium lines each place?',
  bins: [
    {
      id: 'squamous',
      label: 'Simple squamous',
      why: 'One layer of flat cells: gases and fluid cross it quickly.',
    },
    {
      id: 'cuboidal',
      label: 'Simple cuboidal',
      why: 'One layer of cube-shaped cells that secrete and absorb.',
    },
    {
      id: 'columnar',
      label: 'Simple columnar',
      why: 'One layer of tall cells with a brush border and mucus-making goblet cells.',
    },
    {
      id: 'stratified',
      label: 'Stratified squamous',
      why: 'Many layers, flat on top: worn cells are shed and replaced from below.',
    },
  ],
  cards: [
    icon('Air sacs of the lung', 'squamous', 'simple squamous epithelium'),
    icon('Capillary walls', 'squamous', 'simple squamous epithelium'),
    icon('Kidney tubules', 'cuboidal', 'simple cuboidal epithelium'),
    icon('Gland ducts', 'cuboidal', 'simple cuboidal epithelium'),
    icon('Small intestine lining', 'columnar', 'simple columnar epithelium'),
    icon('Stomach lining', 'columnar', 'simple columnar epithelium'),
    icon('Skin', 'stratified', 'stratified squamous epithelium'),
    icon('Lining of the mouth', 'stratified', 'stratified squamous epithelium'),
  ],
};

export const HE4J_GALLERY_MODULES: ModuleDef[] = [];

export const HE4J_GALLERY_LAYOUTS: LayoutDef[] = [sortTissues, sortEpithelia];
