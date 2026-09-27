/**
 * Round-3 gallery demos (group A; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 *
 * Each demo is its page's own sort or sequence with the card icons on its cards (cards whose
 * drawing another group owns are left out).
 */
import type { CardIcon, LayoutDef } from './layouts';
import type { ModuleDef } from './types';

/** A sort with the page's own bins and cards: [label, bin, icon]. */
function cardSort(
  id: string,
  title: string,
  question: string,
  bins: [string, string, string][],
  cards: [string, string, CardIcon][],
): LayoutDef {
  return {
    id,
    title,
    kind: 'sort',
    question,
    assumptions: ['Tap a card, then a group.', 'The drawings are what matter here.'],
    bins: bins.map(([bin, label, why]) => ({ id: bin, label, why })),
    cards: cards.map(([label, bin, icon]) => ({ label, bin, figure: { kind: 'icon', icon } })),
  };
}

export const R3A_GALLERY_MODULES: ModuleDef[] = [];
export const R3A_GALLERY_LAYOUTS: LayoutDef[] = [
  // D05: s.K.sunlight-warms~shade (Tree → 'leafy tree' is group E's).
  cardSort(
    'g.r3a-shade',
    'What makes shade',
    'Does it block the sun?',
    [
      ['shade', 'Makes shade', 'It blocks the sunlight. The spot under it stays cooler.'],
      ['through', 'Lets sun through', 'Sunlight shines through. The spot under it gets warm.'],
    ],
    [
      ['Umbrella', 'shade', 'open umbrella'],
      ['Tent', 'shade', 'tent'],
      ['Sun hat', 'shade', 'sun hat'],
      ['Roof', 'shade', 'house roof'],
      ['Clear plastic', 'through', 'clear plastic cup'],
      ['Window glass', 'through', 'window'],
      ['Glass door', 'through', 'glass door'],
    ],
  ),
  // D17: s.1.light-shadows~materials.
  cardSort(
    'g.r3a-light-materials',
    'What light does with each material',
    'What does light do when it hits it?',
    [
      ['through', 'Goes through', 'Clear things let the light through.'],
      ['some', 'Some goes through', 'You see a glow, not a clear picture.'],
      ['blocked', 'Blocked', 'No light gets through. It makes a shadow.'],
      ['bounces', 'Bounces back', 'Shiny things bounce the light back.'],
    ],
    [
      ['Window glass', 'through', 'window'],
      ['Clear plastic', 'through', 'clear plastic cup'],
      ['Wax paper', 'some', 'wax paper'],
      ['Tissue paper', 'some', 'tissue paper'],
      ['Wood', 'blocked', 'wooden block'],
      ['A book', 'blocked', 'closed book'],
      ['A mirror', 'bounces', 'hand mirror'],
      ['A shiny spoon', 'bounces', 'metal spoon'],
    ],
  ),
  // D18: s.2.material-properties~sort.
  cardSort(
    'g.r3a-bend',
    'Sort materials by a property',
    'Does it bend?',
    [
      ['easy', 'Bends easily', 'Soft and stretchy things bend easily.'],
      ['little', 'Bends a little', 'Thin, stiff things bend a little.'],
      ['no', 'Does not bend', 'Hard, thick things do not bend.'],
    ],
    [
      ['Rubber band', 'easy', 'rubber band'],
      ['String', 'easy', 'piece of string'],
      ['Cloth', 'easy', 'folded cloth'],
      ['Craft stick', 'little', 'craft stick'],
      ['Plastic ruler', 'little', 'plastic ruler'],
      ['Cardboard', 'little', 'cardboard piece'],
      ['Rock', 'no', 'gray rock'],
      ['Metal spoon', 'no', 'metal spoon'],
      ['Glass', 'no', 'drinking glass'],
    ],
  ),
  // D39: s.4.energy-conversion~conductors.
  cardSort(
    'g.r3a-conductors',
    'Does electric current flow through it?',
    'Does the bulb light when it is in the circuit?',
    [
      ['conductor', 'Conductor', 'Current flows through it: the bulb lights.'],
      ['insulator', 'Insulator', 'Current cannot get through: the bulb stays dark.'],
    ],
    [
      ['Copper wire', 'conductor', 'copper wire coil'],
      ['Paper clip', 'conductor', 'paper clip'],
      ['Aluminum foil', 'conductor', 'aluminum foil'],
      ['Coin', 'conductor', 'copper coin'],
      ['Steel nail', 'conductor', 'steel nail'],
      ['Plastic spoon', 'insulator', 'plastic spoon'],
      ['Rubber band', 'insulator', 'rubber band'],
      ['Wood stick', 'insulator', 'craft stick'],
      ['Glass marble', 'insulator', 'glass marble'],
    ],
  ),
  // D40: s.3.magnets~magnetic.
  cardSort(
    'g.r3a-magnetic',
    'What a magnet pulls',
    'Does a magnet pull it?',
    [
      ['pulled', 'Pulled', 'It has iron or steel in it.'],
      ['not', 'Not pulled', 'Magnets do not pull on these.'],
    ],
    [
      ['Paper clip', 'pulled', 'paper clip'],
      ['Iron nail', 'pulled', 'steel nail'],
      ['Soup can (steel)', 'pulled', 'soup can'],
      ['Fridge door', 'pulled', 'fridge'],
      ['Aluminum can', 'not', 'soda can'],
      ['Penny', 'not', 'copper coin'],
      ['Wooden block', 'not', 'wooden block'],
      ['Rubber band', 'not', 'rubber band'],
    ],
  ),
  // D48: s.5.particles-matter~properties (Salt, Sugar and Baking soda have no picture).
  cardSort(
    'g.r3a-dissolve',
    'Does it dissolve in water?',
    'Does it dissolve in water?',
    [
      ['dissolves', 'Dissolves', 'It spreads through the water and seems to disappear.'],
      ['not', 'Does not dissolve', 'You can still see it, floating or sitting on the bottom.'],
    ],
    [
      ['Sand', 'not', 'sand pile'],
      ['Gravel', 'not', 'gravel'],
      ['Pepper', 'not', 'pepper shaker'],
      ['Cooking oil', 'not', 'cooking oil bottle'],
    ],
  ),
  // D49: s.5.particles-matter~magnet.
  cardSort(
    'g.r3a-magnet-pull',
    'Does a magnet pull it?',
    'Does a magnet pull it?',
    [
      ['pulled', 'Pulled', 'It has iron or steel in it.'],
      ['not', 'Not pulled', 'No iron or steel: the magnet does nothing.'],
    ],
    [
      ['Iron nail', 'pulled', 'steel nail'],
      ['Steel paper clip', 'pulled', 'paper clip'],
      ['Aluminum can', 'not', 'soda can'],
      ['Copper coin', 'not', 'copper coin'],
      ['Plastic spoon', 'not', 'plastic spoon'],
      ['Wood block', 'not', 'wooden block'],
    ],
  ),
];
