/**
 * A Bohr model of an atom or ion (H44): the protons and neutrons packed in the nucleus, every
 * one drawn, and the electrons on their shells (2, 8, 8, 2 … from the ground-state
 * configuration, so iron reads 2, 8, 14, 2). An isotope changes the neutrons; an ion the
 * electrons. The nuclide symbol (mass number over atomic number, the charge) sits beside it.
 */
import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G } from 'react-native-svg';

import type { AtomModelSpec } from '@/data/modules/typesHsi';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { element } from './chem';
import { Canvas, Caption, ChartText, useRep } from './common';
import { configuration, shells, sup } from './electrons';
import { reader } from './graphKit';
import { Ball, url, usePaintIds } from './paint';

/** A charge written as a superscript: 2+ → ²⁺, −1 → ⁻. */
export const chargeSup = (q: number) =>
  q === 0 ? '' : `${Math.abs(q) === 1 ? '' : sup(Math.abs(q))}${q > 0 ? '⁺' : '⁻'}`;

/** Protons and neutrons mixed evenly through the nucleus: true for a proton. */
const nucleonKinds = (p: number, n: number) =>
  Array.from(
    { length: p + n },
    (_, k) => Math.floor(((k + 1) * p) / (p + n)) > Math.floor((k * p) / (p + n)),
  );

export function AtomModel({ spec, calc }: { spec: AtomModelSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ids = usePaintIds('proton', 'neutron', 'electron');
  const pr = read(spec.protons);
  const nr = spec.neutrons === undefined ? undefined : read(spec.neutrons);
  const er = spec.electrons === undefined ? pr : read(spec.electrons);
  const p = Math.max(1, Math.round(pr.value));
  const n = nr ? Math.max(0, Math.round(nr.value)) : 0;
  const e = Math.max(0, Math.round(er.value));
  const el = element(p);
  const cfg = configuration(p, e);
  const sh = shells(cfg);
  const q = p - e;
  const massKnown = nr?.known && pr.known;
  const lit = spec.valence !== undefined;

  const art = (w: number, h: number) => {
    const size = Math.min(w, h - 34);
    const cx = w / 2 + (w > size + 90 ? 30 : 0);
    const cy = size / 2 + 4;
    const outer = size / 2 - 10;
    const N = p + n;
    const rn = Math.min(outer * 0.36, 8 + 4 * Math.sqrt(N));
    const rb = Math.min(9, (rn * 0.9) / Math.sqrt(Math.max(1, N)));
    const spiral = (rn - rb) / Math.sqrt(Math.max(1, N));
    const kinds = nucleonKinds(p, n);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const k = Math.max(1, sh.length);
    const shellR = (i: number) => rn + 8 + ((i + 1) * (outer - rn - 8)) / k;
    return (
      <Svg width={w} height={h}>
        <Defs>
          <Ball id={ids.proton} color={c.atomProton} />
          <Ball id={ids.neutron} color={c.atomNeutron} />
          <Ball id={ids.electron} color={c.atomElectron} />
        </Defs>
        {sh.map((_, i) => (
          <Circle
            key={`s${i}`}
            cx={cx}
            cy={cy}
            r={shellR(i)}
            fill="none"
            stroke={lit && i === sh.length - 1 ? c.chartHighlight : c.chartGrid}
            strokeWidth={lit && i === sh.length - 1 ? chart.stroke : 1.2}
          />
        ))}
        {/* The nucleus: outermost first, so the middle ones sit on top. */}
        <G opacity={pr.known ? 1 : 0.35}>
          {kinds
            .map((proton, j) => ({ proton, j }))
            .reverse()
            .map(({ proton, j }) => {
              const r = spiral * Math.sqrt(j + 0.5);
              const a = j * golden;
              const faded = !proton && nr !== undefined && !nr.known;
              return (
                <Circle
                  key={`n${j}`}
                  cx={cx + r * Math.cos(a)}
                  cy={cy + r * Math.sin(a)}
                  r={rb}
                  fill={url(proton ? ids.proton : ids.neutron)}
                  stroke={c.shade}
                  strokeOpacity={0.35}
                  strokeWidth={0.6}
                  opacity={faded ? 0.3 : 1}
                />
              );
            })}
        </G>
        {/* Electrons, evenly around each shell from the top. */}
        <G opacity={er.known ? 1 : 0.35}>
          {sh.flatMap((count, i) =>
            Array.from({ length: count }, (_, j) => {
              const a = -Math.PI / 2 + (j * 2 * Math.PI) / count + i * 0.3;
              const on = lit && i === sh.length - 1;
              return (
                <Fragment key={`e${i}-${j}`}>
                  {on ? (
                    <Circle
                      cx={cx + shellR(i) * Math.cos(a)}
                      cy={cy + shellR(i) * Math.sin(a)}
                      r={7}
                      fill="none"
                      stroke={c.chartHighlight}
                      strokeWidth={1.5}
                    />
                  ) : null}
                  <Circle
                    cx={cx + shellR(i) * Math.cos(a)}
                    cy={cy + shellR(i) * Math.sin(a)}
                    r={4.2}
                    fill={url(ids.electron)}
                    stroke={c.shade}
                    strokeOpacity={0.3}
                    strokeWidth={0.5}
                  />
                </Fragment>
              );
            }),
          )}
        </G>
        {/* The nuclide symbol: mass number over atomic number on the left, the charge after. */}
        {(() => {
          const massText = massKnown ? String(p + n) : nr ? '?' : '';
          const scriptW = Math.max(massText.length, String(p).length) * 8.5;
          const sx = 10 + scriptW + 5;
          const symbol = el?.symbol ?? '?';
          const chargeText =
            q === 0 ? '' : `${Math.abs(q) === 1 ? '' : Math.abs(q)}${q > 0 ? '+' : '−'}`;
          return (
            <G>
              <ChartText
                x={10 + scriptW}
                y={22}
                fontSize={chart.value}
                fontWeight="700"
                fill={c.chartMuted}
                textAnchor="end"
              >
                {massText}
              </ChartText>
              <ChartText
                x={10 + scriptW}
                y={46}
                fontSize={chart.value}
                fontWeight="700"
                fill={c.chartMuted}
                textAnchor="end"
              >
                {pr.known ? String(p) : '?'}
              </ChartText>
              <ChartText x={sx} y={42} fontSize={28} fontWeight="700">
                {symbol}
              </ChartText>
              {er.known && chargeText ? (
                <ChartText
                  x={sx + 17 * symbol.length + 2}
                  y={22}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  fill={c.chartHighlight}
                >
                  {chargeText}
                </ChartText>
              ) : null}
            </G>
          );
        })()}
        {/* Key: what each ball is, and how many. */}
        {[
          { id: ids.proton, text: `${pr.known ? p : '?'} protons`, r: 6 },
          { id: ids.neutron, text: `${nr ? (nr.known ? n : '?') : '–'} neutrons`, r: 6 },
          { id: ids.electron, text: `${er.known ? e : '?'} electrons`, r: 4.2 },
        ].map((item, i) => {
          const x = 10 + (i * (w - 20)) / 3;
          return (
            <G key={item.id}>
              <Circle
                cx={x + 6}
                cy={h - 12}
                r={item.r}
                fill={url(item.id)}
                stroke={c.shade}
                strokeOpacity={0.3}
                strokeWidth={0.6}
              />
              <ChartText x={x + 16} y={h - 7.5} fontSize={chart.label}>
                {item.text}
              </ChartText>
            </G>
          );
        })}
      </Svg>
    );
  };

  const name = el ? `${el.name}${massKnown ? `-${p + n}` : ''}` : '';
  return (
    <View>
      <Canvas aspect={(w) => (Math.min(w, 340) + 34) / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>
        {[
          pr.known
            ? `${name}: ${p} protons, so atomic number Z = ${p}.`
            : 'Type the number of protons.',
          nr && massKnown ? `Mass number A = ${p} + ${n} = ${p + n}.` : undefined,
          er.known && pr.known
            ? q === 0
              ? `${e} electrons: charge ${p} − ${e} = 0, a neutral atom.`
              : `${e} electrons: charge ${p} − ${e} = ${q > 0 ? '+' : '−'}${Math.abs(q)}, a ${q > 0 ? 'positive ion (cation)' : 'negative ion (anion)'} ${el?.symbol ?? ''}${chargeSup(q)}.`
            : undefined,
          er.known && sh.length ? `Shells: ${sh.join(', ')}.` : undefined,
          lit && er.known
            ? `Valence electrons (outer shell): ${sh[sh.length - 1] ?? 0}.`
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}
