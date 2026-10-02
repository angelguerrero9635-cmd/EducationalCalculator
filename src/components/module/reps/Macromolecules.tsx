/**
 * H100 `macromolecules` as a calculator picture: the H31 explore figure (`layouts/macroFigure.tsx`)
 * with its monomer count read from a value. 2–4 are drawn; a longer chain draws its first two
 * units and its last with "…" between, and the titles and the water given off carry the count.
 * A count not typed yet draws faded with "?".
 */
import { View } from 'react-native';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';

import { MacroFigure } from '../layouts/macroFigure';
import type { Calculator } from '../useCalculator';
import { Caption, useRep } from './common';
import { reader } from './graphKit';
import { ProteinLevels } from './ProteinLevels';

type Spec = Extract<Representation, { kind: 'macromolecules' }>;

const MONOMERS: Record<Spec['macro'], string> = {
  carbohydrate: 'glucose molecules',
  protein: 'amino acids',
  nucleicAcid: 'nucleotides',
};

export function Macromolecules({ spec, calc }: { spec: Spec; calc: Calculator }) {
  if (spec.level !== undefined) return <ProteinLevels spec={spec} calc={calc} />; // HC115
  return <Chain spec={spec} calc={calc} />;
}

function Chain({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const rep = useRep(calc);
  const n = reader(rep)(spec.count);
  const total = n.known ? Math.max(2, Math.round(n.value)) : 2;
  const split = !!spec.split;
  const many = MONOMERS[spec.macro];
  const b = formatNumber(total - 1);
  const bonds = `${b} ${total === 2 ? 'bond' : 'bonds'}`;
  const waters = `${b} water ${total === 2 ? 'molecule' : 'molecules'}`;
  const caption = n.known
    ? split
      ? `${waters} break ${bonds}: the chain splits into ${formatNumber(total)} ${many}. · ${formatNumber(total)} − 1 = ${b}`
      : `${formatNumber(total)} ${many} join by ${bonds}, and ${waters} given off. · ${formatNumber(total)} − 1 = ${b}`
    : `Type the number of ${many} to join them.`;
  return (
    <View>
      <MacroFigure
        macro={{ kind: spec.macro, count: Math.min(4, total), split }}
        total={total}
        faded={!n.known}
      />
      <Caption>{caption}</Caption>
    </View>
  );
}
