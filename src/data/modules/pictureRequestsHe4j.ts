/**
 * College pictures, round 4, group J (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

/**
 * `pages` is the page list, or, for a request whose parts go on different pages (and kinds), each
 * page with the text that shows its part is there (`uses`).
 */
const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[] | Record<string, string>,
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  ...(Array.isArray(pages) ? { pages } : { pages: Object.keys(pages), uses: pages }),
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

const B = 'he.biology.';

export const HE4J_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC154',
      'icon',
      'Card icons, tissues: four epithelia, bone, cartilage, blood, fat, three muscles and a neuron with glia, as drawn sections',
      [`${B}anatomy-physiology#0`, `${B}anatomy-physiology#0~epithelia`],
      [
        'From B-P20. Twelve card icons (layouts/icons/he4j.ts names, components/module/layouts/icons/he4j.tsx drawings, a line in each icon index and in docs/LAYOUTS.md), each a section in a round swatch in a slide’s stains: eosin pink cytoplasm, hematoxylin purple nuclei, the basement membrane under every epithelium.',
        "Names: 'simple squamous epithelium', 'simple cuboidal epithelium', 'simple columnar epithelium' (brush border and a goblet cell), 'stratified squamous epithelium' (basal cuboidal cells to flat ones on top), 'compact bone' (an osteon: lamellae, osteocytes, the central canal), 'hyaline cartilage' (chondrocytes in lacunae, some in pairs), 'blood smear' (red cells and a neutrophil), 'adipose tissue' (fat cells, nuclei flat at the edge), 'skeletal muscle tissue' (striated, nuclei at the edge), 'cardiac muscle tissue' (branching, intercalated discs, a central nucleus), 'smooth muscle tissue' (spindles, no striations), 'neuron with glia'.",
        "A card passes { label, bin, figure: { kind: 'icon', icon: 'compact bone' } }. Main: bins epithelial, connective, muscle, nervous; skin’s surface uses 'stratified squamous epithelium'. ~epithelia: the four epithelium icons on cards by place (air sacs, kidney tubules, gut lining, skin). The gallery sorts are both pages, ready to copy.",
        'Check: the layout harness (layoutFigures.test.ts over the two gallery sorts).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-cardIcons-tissues', 'g.he-cardIcons-epithelia'],
  },
];
