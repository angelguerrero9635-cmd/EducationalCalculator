/**
 * The skeletal reader (HC2, reps/skeletalMath.ts) against known molecules: formulas, rings and
 * π bonds, R or S as written and as drawn, cis and trans, the parent chain, groups.
 */
import {
  configurationOf,
  drawnConfiguration,
  formulaIhd,
  formulaOf,
  groupAtoms,
  layoutMol,
  parentChain,
  parseSmiles,
  unsaturation,
  valenceProblems,
} from '../reps/skeletalMath';

it.each([
  ['O=C1CCCCC1', 'C6H10O', 1, 1],
  ['c1ccccc1', 'C6H6', 1, 3],
  ['c1ccc2ccccc2c1', 'C10H8', 2, 5],
  ['c1cc[nH]c1', 'C4H5N', 1, 2],
  ['c1ccncc1', 'C5H5N', 1, 3],
  ['CCC#N', 'C3H5N', 0, 2],
  ['CC1=CCC(CC1)C(C)=C', 'C10H16', 1, 2],
])('%s is %s with %i rings and %i π bonds', (s, formula, rings, pi) => {
  const m = parseSmiles(s);
  expect(m.error).toBeUndefined();
  expect(valenceProblems(m)).toEqual([]);
  expect(formulaOf(m).text).toBe(formula);
  const u = unsaturation(m);
  expect([u.rings, u.pi]).toEqual([rings, pi]);
  expect(formulaIhd(formulaOf(m))).toBe(rings + pi);
});

it('reads ions in aromatic rings', () => {
  expect(formulaOf(parseSmiles('[cH-]1cccc1')).text).toBe('C5H5');
  expect(unsaturation(parseSmiles('[cH-]1cccc1')).pi).toBe(2);
  expect(unsaturation(parseSmiles('[cH+]1cccccc1')).pi).toBe(3);
});

it.each([
  ['N[C@@H](C)C(=O)O', 1, 'S'], // L-alanine
  ['C[C@@H](C(=O)O)N', 1, 'S'], // L-alanine, written another way
  ['CC[C@@H](C)O', 2, 'R'], // (R)-butan-2-ol
  ['OC[C@@H](O)C=O', 2, 'R'], // D-glyceraldehyde
])('%s: atom %i is %s, as written and as drawn', (s, a, rs) => {
  const m = parseSmiles(s);
  expect(configurationOf(m, a)).toBe(rs);
  expect(drawnConfiguration(layoutMol(m, { center: a }), a)).toBe(rs);
  expect(drawnConfiguration(layoutMol(m), a)).toBe(rs);
});

it('draws cis and trans as written', () => {
  const side = (s: string) => {
    const lay = layoutMol(parseSmiles(s));
    const [a, b, c, d] = lay.pos as [number, number][];
    const cross = (p: number[], q: number[], r: number[]) =>
      Math.sign((q[0]! - p[0]!) * (r[1]! - p[1]!) - (q[1]! - p[1]!) * (r[0]! - p[0]!));
    return cross(b!, c!, a!) === cross(b!, c!, d!) ? 'cis' : 'trans';
  };
  expect(side('C/C=C/C')).toBe('trans');
  expect(side('C/C=C\\C')).toBe('cis');
});

it('finds the parent chain and groups', () => {
  // 3-ethyl-2-methylhexane: C1 is the methyl end nearer the branches.
  expect(parentChain(parseSmiles('CC(C)C(CC)CCC'))).toEqual([0, 1, 3, 6, 7, 8]);
  expect(groupAtoms(parseSmiles('CC(=O)OCC'), 'ester')).toEqual([1, 2, 3]);
  expect(groupAtoms(parseSmiles('CCC#N'), 'nitrile')).toEqual([2, 3]);
  expect(groupAtoms(parseSmiles('OCCC(=O)O'), 'hydroxyl')).toEqual([0]);
});
