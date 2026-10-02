/**
 * College Electrical (engineering): the calculator modules of every course whose home field is
 * `electrical`, keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>`
 * after it), in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are
 * in `../layouts/collegeElectrical.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { div } from '../helpers';
import type { ModuleDef } from '../types';

export const COLLEGE_ELECTRICAL_MODULES: ModuleDef[] = [
  {
    // Circuit Analysis I → Ohm's and Kirchhoff's laws
    id: 'he.engineering.circuits-1#0',
    assumptions: [
      'Two resistors in series with a DC source form one loop, so the same current I flows through each (Kirchhoff’s current law).',
      'Kirchhoff’s voltage law: the voltage drops around the loop add up to the source voltage.',
      'Ohm’s law holds for each resistor (V = IR, R constant); wires and the source have no resistance.',
    ],
    variables: [
      { id: 'V', symbol: 'V', name: 'Source voltage', unit: 'V', min: 0, max: 1000, step: 0.5 },
      { id: 'I', symbol: 'I', name: 'Current', unit: 'A', min: 0, max: 1000 },
      {
        id: 'R1',
        symbol: 'R₁',
        name: 'Resistor 1',
        unit: 'Ω',
        min: 0.1,
        max: 1000000,
        step: 0.5,
      },
      {
        id: 'R2',
        symbol: 'R₂',
        name: 'Resistor 2',
        unit: 'Ω',
        min: 0.1,
        max: 1000000,
        step: 0.5,
      },
      { id: 'V1', symbol: 'V₁', name: 'Voltage across R₁', unit: 'V', min: 0, max: 1000 },
      { id: 'V2', symbol: 'V₂', name: 'Voltage across R₂', unit: 'V', min: 0, max: 1000 },
      { id: 'Rt', symbol: 'Rₜ', name: 'Total resistance', unit: 'Ω', min: 0.2, max: 2000000 },
      { id: 'P', symbol: 'P', name: 'Power from source', unit: 'W', min: 0, max: 1e9 },
    ],
    relations: [
      {
        id: 'V = V₁ + V₂',
        display: '{V} = {V1} + {V2}',
        vars: ['V', 'V1', 'V2'],
        residual: (x) => x.V! - x.V1! - x.V2!,
        solve: { V: (x) => x.V1! + x.V2!, V1: (x) => x.V! - x.V2!, V2: (x) => x.V! - x.V1! },
      },
      {
        id: 'V₁ = IR₁',
        display: '{V1} = {I} × {R1}',
        vars: ['V1', 'I', 'R1'],
        residual: (x) => x.V1! - x.I! * x.R1!,
        solve: {
          V1: (x) => x.I! * x.R1!,
          I: (x) => div(x.V1!, x.R1!),
          R1: (x) => div(x.V1!, x.I!),
        },
      },
      {
        id: 'V₂ = IR₂',
        display: '{V2} = {I} × {R2}',
        vars: ['V2', 'I', 'R2'],
        residual: (x) => x.V2! - x.I! * x.R2!,
        solve: {
          V2: (x) => x.I! * x.R2!,
          I: (x) => div(x.V2!, x.R2!),
          R2: (x) => div(x.V2!, x.I!),
        },
      },
      {
        id: 'Rₜ = R₁ + R₂',
        display: '{Rt} = {R1} + {R2}',
        vars: ['Rt', 'R1', 'R2'],
        residual: (x) => x.Rt! - x.R1! - x.R2!,
        solve: { Rt: (x) => x.R1! + x.R2!, R1: (x) => x.Rt! - x.R2!, R2: (x) => x.Rt! - x.R1! },
      },
      {
        id: 'V = IRₜ',
        display: '{V} = {I} × {Rt}',
        vars: ['V', 'I', 'Rt'],
        residual: (x) => x.V! - x.I! * x.Rt!,
        solve: { V: (x) => x.I! * x.Rt!, I: (x) => div(x.V!, x.Rt!), Rt: (x) => div(x.V!, x.I!) },
      },
      {
        id: 'P = VI',
        display: '{P} = {V} × {I}',
        vars: ['P', 'V', 'I'],
        residual: (x) => x.P! - x.V! * x.I!,
        solve: { P: (x) => x.V! * x.I!, V: (x) => div(x.P!, x.I!), I: (x) => div(x.P!, x.V!) },
      },
      {
        id: 'P = I²Rₜ',
        display: '{P} = {I}² × {Rt}',
        vars: ['P', 'I', 'Rt'],
        residual: (x) => x.P! - x.I! ** 2 * x.Rt!,
        solve: {
          P: (x) => x.I! ** 2 * x.Rt!,
          I: (x) => (x.Rt! > 0 ? Math.sqrt(x.P! / x.Rt!) : undefined),
          Rt: (x) => div(x.P!, x.I! ** 2),
        },
      },
    ],
    steps: {
      'V = V₁ + V₂': {
        V: {
          expr: '{V1} + {V2}',
          how: 'Kirchhoff’s voltage law: the drops across the resistors add up to the source voltage.',
        },
        V1: { expr: '{V} − {V2}', how: 'Whatever voltage R₂ doesn’t use is dropped across R₁.' },
        V2: { expr: '{V} − {V1}', how: 'Whatever voltage R₁ doesn’t use is dropped across R₂.' },
      },
      'V₁ = IR₁': {
        V1: {
          expr: '{I} × {R1}',
          how: 'Ohm’s law for R₁: voltage drop is current times resistance.',
        },
        I: {
          expr: '{V1} ÷ {R1}',
          how: 'Ohm’s law for R₁, divided by R₁. It is the same current everywhere in the loop.',
        },
        R1: { expr: '{V1} ÷ {I}', how: 'Ohm’s law for R₁, divided by the current.' },
      },
      'V₂ = IR₂': {
        V2: {
          expr: '{I} × {R2}',
          how: 'Ohm’s law for R₂: voltage drop is current times resistance.',
        },
        I: {
          expr: '{V2} ÷ {R2}',
          how: 'Ohm’s law for R₂, divided by R₂. It is the same current everywhere in the loop.',
        },
        R2: { expr: '{V2} ÷ {I}', how: 'Ohm’s law for R₂, divided by the current.' },
      },
      'Rₜ = R₁ + R₂': {
        Rt: {
          expr: '{R1} + {R2}',
          how: 'In series the current passes through both resistors, so their resistances add.',
        },
        R1: { expr: '{Rt} − {R2}', how: 'Subtract R₂ from the total resistance.' },
        R2: { expr: '{Rt} − {R1}', how: 'Subtract R₁ from the total resistance.' },
      },
      'V = IRₜ': {
        V: { expr: '{I} × {Rt}', how: 'Ohm’s law for the whole loop, using the total resistance.' },
        I: {
          expr: '{V} ÷ {Rt}',
          how: 'Ohm’s law for the whole loop: source voltage divided by total resistance.',
        },
        Rt: { expr: '{V} ÷ {I}', how: 'Ohm’s law for the whole loop, divided by the current.' },
      },
      'P = VI': {
        P: {
          expr: '{V} × {I}',
          how: 'Power delivered by the source is its voltage times the current.',
        },
        V: { expr: '{P} ÷ {I}', how: 'Divide the power by the current.' },
        I: { expr: '{P} ÷ {V}', how: 'Divide the power by the voltage.' },
      },
      'P = I²Rₜ': {
        P: { expr: '{I}² × {Rt}', how: 'Substitute V = IRₜ into P = VI.' },
        I: {
          expr: '√({P} ÷ {Rt})',
          how: 'Divide by Rₜ, then take the square root (current is positive here).',
        },
        Rt: { expr: '{P} ÷ {I}²', how: 'Divide the power by the current squared.' },
      },
    },
    example: { V: 12, R1: 2, R2: 4, Rt: 6, I: 2, V1: 4, V2: 8, P: 24 },
    startWith: ['V', 'R1', 'R2'],
    representation: {
      kind: 'seriesCircuit',
      source: 'V',
      current: 'I',
      resistors: [
        { r: 'R1', v: 'V1' },
        { r: 'R2', v: 'V2' },
      ],
    },
  },
];
