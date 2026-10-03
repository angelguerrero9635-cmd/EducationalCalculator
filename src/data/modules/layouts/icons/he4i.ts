/**
 * College card icons, round 4, group I: the names; drawn in
 * components/module/layouts/icons/he4i.tsx.
 */
export const HE4I_ICONS = [
  // Evidence for evolution (HC143, principles-2#0): two vestigial parts and two analogous pairs.
  'whale pelvis',
  'human appendix',
  'bird wing and butterfly wing',
  'shark fin and dolphin flipper',
] as const;

/**
 * The kind of evidence each evolution icon shows (and the group HH limbs it sorts beside), for
 * the layout check: a card with the icon goes in a bin whose id or label names it.
 */
export const EVIDENCE_OF: Record<string, 'homologous' | 'analogous' | 'vestigial'> = {
  'whale pelvis': 'vestigial',
  'human appendix': 'vestigial',
  'bird wing and butterfly wing': 'analogous',
  'shark fin and dolphin flipper': 'analogous',
  'human arm bones': 'homologous',
  'bat wing bones': 'homologous',
  'whale flipper bones': 'homologous',
  'cat leg bones': 'homologous',
  'insect wing': 'analogous',
};
