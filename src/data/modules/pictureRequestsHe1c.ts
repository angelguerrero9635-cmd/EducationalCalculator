/**
 * College pictures, round 1, group C (docs/RENDERINGS_HE.md). Spread into
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

const O1 = 'he.chemistry.organic-1';
const O2 = 'he.chemistry.organic-2';

export const HE1C_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC2',
      'skeletal',
      'Line-angle structures from a SMILES-like spec (picture and 112 × 76 card): wedges, CIP ranks and R/S, the chain numbered, a group lit, the chair and its ring flip, rings and π bonds for the IHD',
      [
        `${O1}#0`,
        `${O1}#0~functional-groups`,
        `${O1}#0~acid-order`,
        `${O1}#0~unsaturation`,
        `${O1}#1`,
        `${O1}#1~cip`,
        `${O1}#1~chair`,
        `${O1}#2`,
        `${O1}#2~sn2-order`,
        `${O1}#3`,
        `${O1}#3~stereo`,
        `${O1}#3~hydrogenation`,
        `${O1}#4~ir-bands`,
        `${O2}#0`,
        `${O2}#0~directing`,
        `${O2}#1`,
        `${O2}#1~aldol`,
        `${O2}#2`,
        `${O2}#2~acyl-substitution`,
        `${O2}#3`,
        `${O2}#3~classify`,
        `${O2}#4`,
      ],
      'From HE-chemistry-P14 (C-P14). DRAWN. Structures are written in a small SMILES-like spec read by reps/skeletalMath.ts (no dependency, no eval): atoms B C N O P S F Cl Br I, aromatic c n o s (drawn with alternating double bonds), bracket atoms [nH] [O-] [NH3+] [C@@H] [cH-] [CH+], bonds - = # and / \\ for cis or trans, branches, ring numbers 1–9 and %nn. Atoms are numbered from 0 in written order. ' +
        'Picture `skeletal` (typesHe1c.ts): { kind: "skeletal", smiles, name?, group? (a GroupName: hydroxyl, carbonyl, aldehyde, ketone, carboxyl, ester, amide, amine, nitrile, ether, halide, alkene, alkyne, arene, nitro, thiol, anhydride; or atom numbers), numbered? (true: the parent chain with the lowest numbers; or the atoms, C1 first), center? (an atom: CIP ranks 1–4 and R or S beside it; rs: false hides R or S), ihd? { carbons, hydrogens, nitrogens?, halogens?, value?, pi?, rings?, hydrogen? } with candidates [{ smiles, name }] (the first whose C, H, N, X, and π and rings when typed, fit the values is drawn with each ring and π bond marked; hydrogen: true marks each π bond +H₂), enantiomers? { major } (the mirror image beside it, the shares under each) } or { kind: "skeletal", mode: "chair", chair: { groups: [{ at: 1–6, label, face: "up" | "down" }], energy?, temperature?, k?, percent? } } (the chair before and after a ring flip, 1,3-diaxial H dotted, K and the share bars). ' +
        'Card `skeletal` (layouts/types.ts): { kind: "skeletal", smiles, group?, numbered?, center?, ranks?, rs? } at 112 × 76. ' +
        'Checks (harness/picturesHe1c.ts): every C makes 4 bonds (3 as an ion); rings + π bonds drawn = the formula’s IHD; each wedge gives the written R or S; no two atoms overlap; a lit group exists; a card’s bonds are 12 px or more; the chair’s share = 100K ÷ (1 + K). ' +
        'Examples: organic-1#0~unsaturation: { kind: "skeletal", ihd: { carbons: "C", hydrogens: "H", nitrogens: "N", halogens: "X", value: "IHD" }, candidates: [{ smiles: "O=C1CCCCC1", name: "cyclohexanone" }, …] }; organic-1#3~hydrogenation: the same with ihd { carbons: "C", hydrogens: "H", value: "IHD", pi: "pi", rings: "rings", hydrogen: true } and pictureLabels m, M, n, nH2; organic-1#1~chair: { kind: "skeletal", mode: "chair", chair: { groups: [{ at: 1, label: "CH₃", face: "up" }], energy: "A", temperature: "T", k: "K", percent: "pct" } }; a sort card: { label: "Pyrrole", bin: "aromatic", figure: { kind: "skeletal", smiles: "c1cc[nH]c1" } }; ~functional-groups: figure { kind: "skeletal", smiles: "CCC#N", group: "nitrile" }; ~cip R/S: figure { kind: "skeletal", smiles: "CC[C@@H](C)O", center: 2 }; organic-1#0 naming stages: { kind: "skeletal", smiles: "CC(C)C(CC)CCC", numbered: true }. ' +
        'Also on organic-1#1~optical-rotation (R and S with ee): { kind: "skeletal", smiles: "C[C@H](O)CC", center: 1, enantiomers: { major: "major" } }. Bridged rings (norbornane, pinene) are not laid out well yet; keep cards to chains, single and fused rings.',
    ),
    status: 'drawn',
    gallery: [
      'g.he-skeletal-unsaturation',
      'g.he-skeletal-unsaturation-naphthalene',
      'g.he-skeletal-hydrogenation',
      'g.he-skeletal-hydrogenation-limonene',
      'g.he-skeletal-chair',
      'g.he-skeletal-chair-tert-butyl',
      'g.he-skeletal-enantiomers',
      'g.he-skeletal-card-aromatic',
      'g.he-skeletal-card-groups',
      'g.he-skeletal-card-rs',
      'g.he-skeletal-card-naming',
    ],
  },
];
