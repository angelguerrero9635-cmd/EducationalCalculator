/**
 * Hydration (H101 part 10), a `molecules` explore scene: each ion drawn big with its charge,
 * ringed by water molecules turned by that charge (the partly negative O toward a positive ion,
 * a partly positive H toward a negative one), δ− and δ+ marked on one water of each ring. With
 * `crystal`, the salt's lattice sits at the bottom and its corner ions are pulled away: the
 * water is taking the crystal apart. Lit balls in the classroom atom colors.
 */
import type { ReactNode } from 'react';
import Svg, { Defs, G, Line } from 'react-native-svg';

import { ionOf, type HydrationScene } from '@/data/modules/typesHs2d';
import { chart, usePalette } from '@/theme';

import { atomRadius, moleculeOf, turned } from '../reps/chem';
import { chargeSuperscript } from '../reps/chemHs2d';
import { Canvas, ChartText } from '../reps/common';
import { AtomBall, MoleculeArt, useAtomPaint } from '../reps/MoleculeArt';

/** The direction of one O–H bond in the water layout (degrees, y down). */
const H_ANGLE = 37.7;

export function HydrationFigure({ scene }: { scene: HydrationScene }) {
  const c = usePalette();
  const paint = useAtomPaint();
  const ions = scene.ions.map(ionOf).filter((x): x is NonNullable<typeof x> => !!x);
  const waters = Math.max(4, Math.min(8, Math.round(scene.waters ?? 6)));
  const water = moleculeOf('H2O');
  return (
    <Canvas aspect={scene.crystal ? 0.86 : 0.62}>
      {({ w, h }) => {
        const rows = scene.crystal ? h - 84 : h;
        const cellW = w / Math.max(1, ions.length);
        // Bond length: the ring (ion + a water) fits its cell.
        const s = Math.min(22, cellW / 7.2, rows / 7.2);
        const parts: ReactNode[] = [];
        ions.forEach((ion, k) => {
          const cx = cellW * (k + 0.5);
          const cy = rows / 2 + 4;
          const el = ion.formula;
          const r = Math.max(atomRadius(el), ion.charge < 0 ? 0.75 : 0.5) * s * 1.35;
          const R = r + s * 1.35;
          for (let j = 0; j < waters; j++) {
            const phi = (360 / waters) * j - 90 + (k % 2 ? 180 / waters : 0);
            // Positive ion: the H side (the molecule's +y) points away, O in. Negative ion: one
            // H points in.
            const turn = ion.charge > 0 ? phi - 90 : phi + 180 - H_ANGLE;
            const t = (phi * Math.PI) / 180;
            const wx = cx + Math.cos(t) * R;
            const wy = cy + Math.sin(t) * R;
            parts.push(
              <MoleculeArt
                key={`w${k}-${j}`}
                molecule={turned(water, turn)}
                cx={wx}
                cy={wy}
                scale={s}
                ids={paint.ids}
                symbols={s >= 16}
              />,
            );
            if (j === 0) {
              // δ− on the O end, δ+ on the H end of the top water.
              const mark = ion.charge > 0 ? 'δ−' : 'δ+';
              parts.push(
                <ChartText
                  key={`d${k}`}
                  x={wx + s * 1.25}
                  y={wy - s * 0.5}
                  fontSize={chart.label}
                  fontWeight="700"
                  fill={ion.charge > 0 ? c.physMinus : c.physPlus}
                >
                  {mark}
                </ChartText>,
              );
            }
          }
          parts.push(
            <G key={`i${k}`}>
              <AtomBall el={el} cx={cx} cy={cy} r={r} ids={paint.ids} symbol={false} />
              <ChartText
                x={cx}
                y={cy + 5}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
                fill={c.onAtom}
              >
                {`${el}${chargeSuperscript(ion.charge)}`}
              </ChartText>
            </G>,
          );
        });
        if (scene.crystal && ions.length >= 2) {
          // A block of the salt: the two ions alternating, 6 × 2, its top corners pulled up.
          const [a, b] = [ions[0]!, ions[1]!];
          const rr = Math.min(11, w / 30);
          const cols = 6;
          const x0 = w / 2 - (cols - 1) * rr;
          const y0 = h - 50;
          for (let row = 0; row < 2; row++)
            for (let col = 0; col < cols; col++) {
              const ion = (row + col) % 2 ? b : a;
              const lifted = row === 0 && (col === 0 || col === cols - 1);
              parts.push(
                <G key={`x${row}-${col}`} opacity={lifted ? 0.85 : 1}>
                  <AtomBall
                    el={ion.formula}
                    cx={x0 + col * 2 * rr + (lifted ? (col === 0 ? -rr : rr) : 0)}
                    cy={y0 + row * 2 * rr - (lifted ? rr * 1.6 : 0)}
                    r={rr * (ion.charge < 0 ? 1.05 : 0.8)}
                    ids={paint.ids}
                    symbol={false}
                  />
                </G>,
              );
            }
          parts.push(
            <ChartText
              key="xl"
              x={w / 2}
              y={h - 2}
              fontSize={chart.label}
              textAnchor="middle"
              fill={c.chartMuted}
            >
              {`${a.formula}${b.formula} crystal: water pulls the ions at its edges away`}
            </ChartText>,
          );
        }
        return (
          <Svg width={w} height={h}>
            <Defs>{paint.defs}</Defs>
            {ions.length > 1 ? (
              <Line
                x1={w / 2}
                y1={12}
                x2={w / 2}
                y2={rows - 8}
                stroke={c.chartGrid}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
            ) : null}
            {parts}
          </Svg>
        );
      }}
    </Canvas>
  );
}
