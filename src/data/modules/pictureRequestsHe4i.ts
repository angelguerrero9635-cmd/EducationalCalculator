/**
 * College pictures, round 4, group I (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[],
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  pages,
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

const B = 'he.biology.';

export const HE4I_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC141',
      'curvedSolid',
      'Why cells are small: the cell as a lit sphere of radius r with A = 4πr², V = 4/3 πr³ and A ÷ V = 3 ÷ r under it, and a cell r × k beside it at the same scale with its own three lines',
      [`${B}principles-1#1`],
      [
        'From B-P1. New option on curvedSolid (typesHe4i.ts CurvedSolidHe4i, reps/CellRatioHe4i.tsx); without `ratio` the glass solids are unchanged.',
        "Fields: { kind: 'curvedSolid', shape: 'sphere', radius, extent, ratio: { area?, volume?, ratio?, compare? (a factor or a value, default 2; false draws one cell) } }.",
        'The cells are painted (a lit ball and its membrane), r marked and written over each; under each A, V and A ÷ V to 3 figures (the page’s values for the first cell, worked out for the second). Drag the first cell’s rim to change r; the scale holds while dragging. A "?" r draws no cell; a "?" A, V or ratio leaves its line out.',
        "Example: { kind: 'curvedSolid', shape: 'sphere', radius: 'r', extent: 10, ratio: { area: 'A', volume: 'V', ratio: 'q', compare: 2 } }, with r in μm, A in μm², V in μm³ and A ÷ V in per μm.",
        'Harness (harness/picturesHe4i.ts): a sphere; A = 4πr², V = 4/3 πr³, A ÷ V = 3 ÷ r to 3 significant figures; the factor is positive.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-curvedSolid-ratio', 'g.he-curvedSolid-ratio-bacterium'],
  },
  {
    ...ask(
      'HC142',
      'cellDivision',
      'Chromosomes, chromatids and DNA by stage: four cells (G₁, after S, after meiosis I, a gamete) with their chromosomes, and under them each stage’s chromosomes, chromatids and DNA in c (2c, 4c, 2c, 1c)',
      [`${B}principles-1#3`],
      [
        'From B-P3. New option on the cellDivision calculator picture (typesHe4i.ts CellDivisionHe4i, reps/DivisionContentHe4i.tsx); without `content` the body cell, gamete and zygote picture is unchanged.',
        "Fields: { kind: 'cellDivision', diploid, haploid?, chromatids?, combinations?, content: { chromatids? (after S, 2 × 2n), dna? (G₁ content in c, a value or a number; default 2), gamete? (the gamete's c) } }.",
        'Every chromosome is drawn up to 2n = 6 (maternal red, paternal blue; duplicated after S and after meiosis I); past that one pair, or one chromosome, and “× n”. The caption works each stage and, with `combinations`, 2ⁿ. A "?" 2n draws empty cells and a blank table; a "?" dna leaves the DNA row blank.',
        "Example: { kind: 'cellDivision', diploid: 'D', haploid: 'n', chromatids: 'X', combinations: 'C', content: { chromatids: 'X', dna: 'c1', gamete: 'c4' } }, with the page's G₁ content c1 = 2 and DNA after S c2 = c1 × X ÷ 2n.",
        'Harness (harness/picturesHe4i.ts): chromatids = 2 × chromosomes after S and after meiosis I (to metaphase II), 1 × in G₁ and the gamete; the page’s chromatids after S = 2 × 2n; c doubles in S and halves at each meiotic division (gamete = G₁ ÷ 2).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-cellDivision-content', 'g.he-cellDivision-content-four'],
  },
  {
    ...ask(
      'HC143',
      'icon',
      'Card icons for the evidence of evolution: a whale with its vestigial pelvis ringed, the large intestine with the appendix ringed, a bird’s wing (arm bones) beside a butterfly’s wing (no bones), a shark’s fin (fin rays) beside a dolphin’s flipper (arm bones)',
      [`${B}principles-2#0`],
      [
        'From B-P4. Card icons (data/modules/layouts/icons/he4i.ts, layouts/icons/he4i.tsx), 48 × 48, drawn like group HH’s limbs (the same bone colors).',
        "Fields: { kind: 'icon', icon: 'whale pelvis' | 'human appendix' | 'bird wing and butterfly wing' | 'shark fin and dolphin flipper' } on a sort card.",
        "Example: the main page's sort with bins homologous, analogous, vestigial and cards { label: 'Whale pelvis', bin: 'vestigial', figure: { kind: 'icon', icon: 'whale pelvis' } }, beside group HH's five limbs (gallery g.he-cardIcons-evolution).",
        'Layout check (harness/picturesHe4i.ts he4iLayoutIssues): in a sort whose bins name homologous, analogous or vestigial, each evolution icon (these four and HH’s limbs and insect wing) sits in the bin naming its kind.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-cardIcons-evolution'],
  },
  {
    ...ask(
      'HC144',
      'pedigree',
      'A pedigree as a calculator picture (the family with the carrier chances written on people and the next child as a diamond with its chance) and as a 112 × 76 card figure for sorting modes of inheritance; one drawing of `people`',
      [`${B}genetics#0`, `${B}genetics#0~modes`],
      [
        'From B-P6 and B-P7. New calculator kind `pedigree` (typesHe4i.ts PedigreeSpec, reps/PedigreeHe4i.tsx) and card figure `pedigree` (PedigreeCard, layouts/pedigreeCardHe4i.tsx), both laid out by reps/pedigreeHe4iMath.ts from `people` as the explore figure lists them (PedigreePerson: id, sex, generation, trait?, carrier?, parents?, partner?).',
        'Calculator fields: { kind: \'pedigree\', people, chances?: { [person id]: value id }, child?: { parents: [id, id], chance }, carriers? }. Generations I, II, … and people numbered; each chance written under its person as “p₁ = 2/3” (a fraction when it is one, bottom to 1000); the child a diamond with “?” and “P = 1/150”; the caption works P = p₁ × p₂ × 1/4. A "?" chance writes nothing. No handles.',
        "Example (main): { kind: 'pedigree', people: [I1 ♂, I2 ♀, II1 ♂ trait (parents I1, I2), II2 ♀ (parents I1, I2), II3 ♂ (partner II2)], chances: { II2: 'p1', II3: 'p2' }, child: { parents: ['II2', 'II3'], chance: 'P' } }.",
        "Card fields: { kind: 'pedigree', people, marked? } (marked: the half-filled symbols are all the carriers, so an empty symbol carries nothing). Example (~modes): bins AD, AR, XR (ids or labels naming the mode) with cards such as { label: 'Carrier mother, affected son', bin: 'XR', figure: { kind: 'pedigree', marked: true, people: [...] } }.",
        'Harness (harness/picturesHe4i.ts): the family’s structure (parents in it, one of each sex, a generation up); chances in 0–1; the child’s chance = the product of the parents’ chances × 1/4. Layout check: each pedigree card is possible under its bin’s mode (a genotype search, full penetrance) and impossible under at least one other bin’s mode; the demo’s six cards are each possible under their own mode only.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-pedigree-chance', 'g.he-pedigree-chance-both', 'g.he-pedigree-modes'],
  },
  {
    ...ask(
      'HC145',
      'linkageMap',
      'A genetic map: a chromosome bar with 2 or 3 genes at their distances in cM to scale over a cM ruler, and under it two homologs crossed where the recombinants come from (once between two genes, or twice either side of the middle gene for a double crossover), each strand changing colour so the recombinant alleles read off',
      [`${B}genetics#1`, `${B}genetics#1~three-point`],
      [
        'From B-P8. New kind (typesHe4i.ts LinkageMapSpec, reps/LinkageMap.tsx; crossovers and the ruler step in reps/he4iMath.ts).',
        "Fields: { kind: 'linkageMap', loci: ['A', 'B'] or ['A', 'B', 'C'], distances: [cM ids or numbers, one per neighbouring pair], recombinant? (RF in %, the first pair), offspring? (N), expected?, doubles? (observed double crossovers; draws the double crossover), coincidence?, interference? }.",
        'Alleles are written on the strands, one parent’s capitals in red and the other’s lower case in blue. Distances over 50 cM draw faded with “RF stops at 50%”. A "?" distance draws no genes. No handles; no sliders.',
        "Examples: main { kind: 'linkageMap', loci: ['A', 'B'], distances: ['d'], recombinant: 'rf' } (840 parental + 160 recombinant → 16 cM); ~three-point { kind: 'linkageMap', loci: ['A', 'B', 'C'], distances: ['d1', 'd2'], offspring: 'N', expected: 'E', doubles: 'O', coincidence: 'coc', interference: 'I' } (12 and 20 cM, N = 1000 → 24 expected, 15 observed, c.o.c. 0.625, I = 0.375).",
        'Harness (harness/picturesHe4i.ts): 2 or 3 loci, one distance per pair, each above 0 and at most 50 cM (RF ≤ 50); each crossover drawn inside its interval; RF = the first distance; expected = d₁d₂N ÷ 10⁴, c.o.c. = observed ÷ expected, I = 1 − c.o.c.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-linkageMap-two', 'g.he-linkageMap-loose', 'g.he-linkageMap-three'],
  },
  {
    ...ask(
      'HC146',
      'codons',
      'Card figure: the mRNA codon strip before and after a point mutation, each codon boxed with its amino acid and the changed base lit; after an insertion or a deletion the boxes regroup, so the reading frame is seen to move',
      [`${B}genetics#2~mutations`],
      [
        'From B-P9. New card figure (typesHe4i.ts CodonsCard, layouts/codonsCardHe4i.tsx; the code and the effect in layouts/codonsHe4iMath.ts, reading the `dnaStrand` CODON_TABLE).',
        "Fields: { kind: 'codons', mrna (9–12 bases of A, C, G, U), change: { type: 'substitution' | 'insertion' | 'deletion', at (from 1), base? (a substitution's or an insertion's base) } }, 140 × 74.",
        "Example: { label: 'Base 4: C to U', bin: 'nonsense', figure: { kind: 'codons', mrna: 'AUGCAGUGG', change: { type: 'substitution', at: 4, base: 'U' } } } in a sort with bins silent, missense, nonsense, frameshift (ids or labels naming them). The page can replace its text cards with these.",
        'Layout check (harness/picturesHe4i.ts): whole codons of A, C, G, U, 9 to 12 bases; the change inside the strip with a real base; the card’s effect (same amino acid, a different one, a stop, or a length change not a multiple of 3) is the one its bin names.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-codons-mutations'],
  },
];
