/**
 * Round-3 gallery demos (group J; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily. Each demo is its page with the new figure put on, so
 * it shows the page's own parts, scenes, cards and values.
 */
import { getLayout, type LayoutDef } from './layouts';
import type { ModuleDef } from './types';

/** A page's layout with a gallery id and title, and the change the new figure needs. */
function fromPage<K extends LayoutDef['kind']>(
  page: string,
  kind: K,
  id: string,
  title: string,
  change: (l: Extract<LayoutDef, { kind: K }>) => Partial<Extract<LayoutDef, { kind: K }>>,
): LayoutDef {
  const l = getLayout(page);
  if (!l || l.kind !== kind) throw new Error(`gallery ${id}: page ${page} is not a ${kind} page`);
  const own = l as Extract<LayoutDef, { kind: K }>;
  return { ...own, ...change(own), id, title, use: undefined };
}

export const R3J_GALLERY_MODULES: ModuleDef[] = [];

export const R3J_GALLERY_LAYOUTS: LayoutDef[] = [
  // D74: the plant, its parts labeled and the tapped one lit.
  fromPage('s.1.structures-function', 'explore', 'g.r3j-plant', 'Parts of a plant', (l) => ({
    figure: l.figure.kind === 'parts' ? { ...l.figure, drawing: 'plant' } : l.figure,
  })),
  // D75: a bear (eyes, ears, fur, claws) and a turtle (shell).
  fromPage(
    's.1.structures-function~animal',
    'explore',
    'g.r3j-animal',
    'Parts of an animal',
    (l) => ({
      figure: l.figure.kind === 'parts' ? { ...l.figure, drawing: 'animal' } : l.figure,
    }),
  ),
  // D90: a body with its organs, bones and skin (Grade 4).
  fromPage('s.4.internal-structures', 'explore', 'g.r3j-body', 'Parts of the body', (l) => ({
    figure: l.figure.kind === 'parts' ? { ...l.figure, drawing: 'body' } : l.figure,
  })),
  // D89: a deer alone, a herd and a penguin huddle.
  fromPage('s.3.animal-groups', 'explore', 'g.r3j-animal-groups', 'Animals in groups', (l) => ({
    scenes: l.scenes.map((s) => ({ ...s, animal: s.label === 'Huddled' ? 'penguin' : 'deer' })),
  })),
  // D76: the mother cat and her kitten above the cards.
  fromPage('s.1.offspring', 'sort', 'g.r3j-offspring-cat', 'A cat and her kitten', () => ({
    header: {
      kind: 'offspring',
      animals: [
        { animal: 'cat', label: 'Mother', fur: 'orange' },
        { animal: 'cat', label: 'Kitten', young: true, fur: 'gray', nosePatch: true },
      ],
    },
  })),
  // D77: a doe, a buck and their fawn.
  fromPage('s.1.offspring~deer', 'sort', 'g.r3j-offspring-deer', 'A fawn and its parents', () => ({
    header: {
      kind: 'offspring',
      animals: [
        { animal: 'deer', label: 'Doe' },
        { animal: 'deer', label: 'Buck', antlers: true },
        { animal: 'deer', label: 'Fawn', young: true, spots: true },
      ],
    },
  })),
];
