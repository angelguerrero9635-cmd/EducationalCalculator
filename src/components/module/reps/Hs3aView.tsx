/**
 * The Grades 9–12 round 3 physics pictures of group H3A (H107), one component per kind;
 * `index.tsx` sends each of their kinds here.
 */
import type { Hs3aSpec } from '@/data/modules/typesHs3a';

import type { Calculator } from '../useCalculator';
import { Capacitor } from './Capacitor';
import { Oscillator } from './Oscillator';
import { Pendulum } from './Pendulum';
import { Rotor } from './Rotor';
import { Torque } from './Torque';

export function Hs3aView({ spec, calc }: { spec: Hs3aSpec; calc: Calculator }) {
  switch (spec.kind) {
    case 'torque':
      return <Torque spec={spec} calc={calc} />;
    case 'rotor':
      return <Rotor spec={spec} calc={calc} />;
    case 'oscillator':
      return <Oscillator spec={spec} calc={calc} />;
    case 'pendulum':
      return <Pendulum spec={spec} calc={calc} />;
    case 'capacitor':
      return <Capacitor spec={spec} calc={calc} />;
  }
}
