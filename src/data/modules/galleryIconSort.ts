import type { CardIcon, LayoutDef } from './layouts';

/** A sort whose cards are card icons: [bin id, label, why, icons]. */
export function iconSort(
  id: string,
  title: string,
  question: string,
  bins: [string, string, string, CardIcon[]][],
): LayoutDef {
  const names: Partial<Record<CardIcon, string>> = {
    door: 'classroom door',
    bus: 'school bus',
    'water bottle': 'big water bottle',
  };
  return {
    id,
    title,
    kind: 'sort',
    question,
    assumptions: ['Tap a card, then a group.', 'The drawings are what matter here.'],
    bins: bins.map(([bin, label, why]) => ({ id: bin, label, why })),
    cards: bins.flatMap(([bin, , , icons]) =>
      icons.map((icon) => {
        const label = names[icon] ?? icon;
        return {
          label: label[0]!.toUpperCase() + label.slice(1),
          bin,
          figure: { kind: 'icon' as const, icon },
        };
      }),
    ),
  };
}
