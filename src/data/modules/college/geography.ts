/**
 * College Geography: the calculator modules of every course whose home field is
 * `geography`, keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>`
 * after it), in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are
 * in `../layouts/collegeGeography.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { div } from '../helpers';
import type { ModuleDef } from '../types';

export const COLLEGE_GEOGRAPHY_MODULES: ModuleDef[] = [
  {
    // Human Geography → Population and migration
    id: 'he.geography.human-geography#0',
    use: 'Use this for “A city of 500,000 had 6,000 births, 4,000 deaths, 3,000 arrivals and 1,000 departures. How much did it grow?”',
    assumptions: [
      'Counts are for one place over one year; P₀ is the mid-year population.',
      'Population changes only through births, deaths, and people moving in or out.',
      'RNI is the natural increase as a percent of P₀; it leaves out migration.',
    ],
    variables: [
      { id: 'Pop', symbol: 'P₀', name: 'Population', min: 1, max: 1e10 },
      { id: 'B', symbol: 'B', name: 'Births', min: 0, max: 1e9, step: 100, integer: true },
      { id: 'D', symbol: 'D', name: 'Deaths', min: 0, max: 1e9, step: 100, integer: true },
      { id: 'I', symbol: 'I', name: 'Immigrants', min: 0, max: 1e9, step: 100, integer: true },
      { id: 'E', symbol: 'E', name: 'Emigrants', min: 0, max: 1e9, step: 100, integer: true },
      { id: 'N', symbol: 'N', name: 'Natural increase', min: -1e9, max: 1e9, integer: true },
      { id: 'M', symbol: 'M', name: 'Net migration', min: -1e9, max: 1e9, integer: true },
      { id: 'P', symbol: 'ΔP', name: 'Population change', min: -2e9, max: 2e9, integer: true },
      { id: 'RNI', symbol: 'RNI', name: 'Rate of natural increase', unit: '%', min: -10, max: 10 },
    ],
    relations: [
      {
        id: 'N = B − D',
        display: '{N} = {B} − {D}',
        vars: ['N', 'B', 'D'],
        residual: (v) => v.N! - (v.B! - v.D!),
        solve: { N: (v) => v.B! - v.D!, B: (v) => v.N! + v.D!, D: (v) => v.B! - v.N! },
      },
      {
        id: 'M = I − E',
        display: '{M} = {I} − {E}',
        vars: ['M', 'I', 'E'],
        residual: (v) => v.M! - (v.I! - v.E!),
        solve: { M: (v) => v.I! - v.E!, I: (v) => v.M! + v.E!, E: (v) => v.I! - v.M! },
      },
      {
        id: 'ΔP = N + M',
        display: '{P} = {N} + {M}',
        vars: ['P', 'N', 'M'],
        residual: (v) => v.P! - (v.N! + v.M!),
        solve: { P: (v) => v.N! + v.M!, N: (v) => v.P! - v.M!, M: (v) => v.P! - v.N! },
      },
      {
        id: 'RNI = N ÷ P₀ × 100',
        display: '{RNI} = {N} ÷ {Pop} × 100',
        vars: ['RNI', 'N', 'Pop'],
        residual: (v) => v.RNI! - (100 * v.N!) / v.Pop!,
        solve: {
          RNI: (v) => div(100 * v.N!, v.Pop!),
          N: (v) => (v.RNI! * v.Pop!) / 100,
          Pop: (v) => (v.RNI === 0 ? undefined : div(100 * v.N!, v.RNI!)),
        },
      },
    ],
    steps: {
      'N = B − D': {
        N: { expr: '{B} − {D}', how: 'Natural increase is births minus deaths.' },
        B: { expr: '{N} + {D}', how: 'Add the deaths back to the natural increase.' },
        D: { expr: '{B} − {N}', how: 'Subtract the natural increase from the births.' },
      },
      'M = I − E': {
        M: { expr: '{I} − {E}', how: 'Net migration is people moving in minus people moving out.' },
        I: { expr: '{M} + {E}', how: 'Add the emigrants back to the net migration.' },
        E: { expr: '{I} − {M}', how: 'Subtract the net migration from the immigrants.' },
      },
      'ΔP = N + M': {
        P: { expr: '{N} + {M}', how: 'Population change is natural increase plus net migration.' },
        N: { expr: '{P} − {M}', how: 'Subtract the net migration from the population change.' },
        M: { expr: '{P} − {N}', how: 'Subtract the natural increase from the population change.' },
      },
      'RNI = N ÷ P₀ × 100': {
        RNI: { expr: '{N} ÷ {Pop} × 100', how: 'Natural increase as a percent of the population.' },
        N: { expr: '{RNI} × {Pop} ÷ 100', how: 'Take RNI percent of the population.' },
        Pop: {
          expr: '{N} ÷ {RNI} × 100',
          how: 'N is RNI percent of the population, so divide by RNI and multiply by 100.',
        },
      },
    },
    example: {
      Pop: 500000,
      B: 6000,
      D: 4000,
      I: 3000,
      E: 1000,
      N: 2000,
      M: 2000,
      P: 4000,
      RNI: 0.4,
    },
    startWith: ['Pop', 'B', 'D', 'I', 'E'],
    representation: {
      kind: 'waterfall',
      items: [
        { var: 'B', sign: 1, editable: true },
        { var: 'D', sign: -1, editable: true },
        { var: 'I', sign: 1, editable: true },
        { var: 'E', sign: -1, editable: true },
      ],
      total: 'P',
      caption: ['N', 'M', 'P'],
    },
  },
  {
    // Human Geography → Population and migration: the rates per 1,000 and the rule of 70
    id: 'he.geography.human-geography#0~rates',
    title: 'Birth, death and growth rates',
    use: 'Use this for “A country of 500,000 had 6,000 births and 4,000 deaths. Find CBR, CDR and RNI, and its doubling time.”',
    assumptions: [
      'Rates are per 1,000 people a year, so places of different sizes compare; P₀ is the mid-year population.',
      'RNI is the birth rate minus the death rate, as a percent; it leaves out migration.',
      'Rule of 70: if RNI stays the same, the population doubles in about 70 ÷ RNI years.',
    ],
    variables: [
      { id: 'Pop', symbol: 'P₀', name: 'Population', min: 1, max: 1e10 },
      { id: 'B', symbol: 'B', name: 'Births', min: 0, max: 1e9, step: 100, integer: true },
      { id: 'D', symbol: 'D', name: 'Deaths', min: 0, max: 1e9, step: 100, integer: true },
      { id: 'CBR', symbol: 'CBR', name: 'Crude birth rate', unit: 'per 1,000', min: 0, max: 100 },
      { id: 'CDR', symbol: 'CDR', name: 'Crude death rate', unit: 'per 1,000', min: 0, max: 100 },
      { id: 'RNI', symbol: 'RNI', name: 'Rate of natural increase', unit: '%', min: -10, max: 10 },
      { id: 'Td', symbol: 'T₂', name: 'Doubling time', unit: 'years', min: 0, max: 1e9 },
    ],
    relations: [
      {
        id: 'CBR = B ÷ P₀ × 1,000',
        display: '{CBR} = {B} ÷ {Pop} × 1,000',
        vars: ['CBR', 'B', 'Pop'],
        residual: (v) => v.CBR! - (1000 * v.B!) / v.Pop!,
        solve: {
          CBR: (v) => div(1000 * v.B!, v.Pop!),
          B: (v) => (v.CBR! * v.Pop!) / 1000,
          Pop: (v) => div(1000 * v.B!, v.CBR!),
        },
      },
      {
        id: 'CDR = D ÷ P₀ × 1,000',
        display: '{CDR} = {D} ÷ {Pop} × 1,000',
        vars: ['CDR', 'D', 'Pop'],
        residual: (v) => v.CDR! - (1000 * v.D!) / v.Pop!,
        solve: {
          CDR: (v) => div(1000 * v.D!, v.Pop!),
          D: (v) => (v.CDR! * v.Pop!) / 1000,
          Pop: (v) => div(1000 * v.D!, v.CDR!),
        },
      },
      {
        id: 'RNI = (CBR − CDR) ÷ 10',
        display: '{RNI} = ({CBR} − {CDR}) ÷ 10',
        vars: ['RNI', 'CBR', 'CDR'],
        residual: (v) => v.RNI! - (v.CBR! - v.CDR!) / 10,
        solve: {
          RNI: (v) => (v.CBR! - v.CDR!) / 10,
          CBR: (v) => 10 * v.RNI! + v.CDR!,
          CDR: (v) => v.CBR! - 10 * v.RNI!,
        },
      },
      {
        id: 'T₂ ≈ 70 ÷ RNI',
        display: '{Td} ≈ 70 ÷ {RNI}',
        vars: ['Td', 'RNI'],
        residual: (v) => v.Td! * v.RNI! - 70,
        // Doubling only makes sense for growth, so no doubling time when RNI ≤ 0.
        solve: {
          Td: (v) => (v.RNI! > 0 ? 70 / v.RNI! : undefined),
          RNI: (v) => (v.Td! > 0 ? 70 / v.Td! : undefined),
        },
      },
    ],
    steps: {
      'CBR = B ÷ P₀ × 1,000': {
        CBR: {
          expr: '{B} ÷ {Pop} × 1,000',
          how: 'Births per person, scaled to births per 1,000 people.',
        },
        B: {
          expr: '{CBR} × {Pop} ÷ 1,000',
          how: 'CBR births for every 1,000 people: multiply by the number of thousands.',
        },
        Pop: {
          expr: '{B} ÷ {CBR} × 1,000',
          how: 'Each 1,000 people had CBR births, so divide births by CBR and multiply by 1,000.',
        },
      },
      'CDR = D ÷ P₀ × 1,000': {
        CDR: {
          expr: '{D} ÷ {Pop} × 1,000',
          how: 'Deaths per person, scaled to deaths per 1,000 people.',
        },
        D: {
          expr: '{CDR} × {Pop} ÷ 1,000',
          how: 'CDR deaths for every 1,000 people: multiply by the number of thousands.',
        },
        Pop: {
          expr: '{D} ÷ {CDR} × 1,000',
          how: 'Each 1,000 people had CDR deaths, so divide deaths by CDR and multiply by 1,000.',
        },
      },
      'RNI = (CBR − CDR) ÷ 10': {
        RNI: {
          expr: '({CBR} − {CDR}) ÷ 10',
          how: 'Subtract the death rate from the birth rate; dividing by 10 turns “per 1,000” into a percent.',
        },
        CBR: {
          expr: '10 × {RNI} + {CDR}',
          how: 'Multiply RNI by 10 to get “per 1,000”, then add the death rate.',
        },
        CDR: {
          expr: '{CBR} − 10 × {RNI}',
          how: 'Multiply RNI by 10 to get “per 1,000”, then subtract it from the birth rate.',
        },
      },
      'T₂ ≈ 70 ÷ RNI': {
        Td: {
          expr: '70 ÷ {RNI}',
          how: 'Rule of 70: steady growth of RNI% a year doubles a population in about 70 ÷ RNI years.',
        },
        RNI: { expr: '70 ÷ {Td}', how: 'Rule of 70 in reverse: divide 70 by the doubling time.' },
      },
    },
    example: { Pop: 500000, B: 6000, D: 4000, CBR: 12, CDR: 8, RNI: 0.4, Td: 175 },
    // Births first: typing RNI or CBR then recalculates the births, never the population.
    startWith: ['B', 'D', 'Pop'],
    // The two rates side by side: the gap between them is the natural increase per 1,000.
    representation: {
      kind: 'bars',
      bars: [
        { var: 'CBR', editable: true },
        { var: 'CDR', editable: true },
      ],
      min: 0,
      max: 20,
    },
  },
];
