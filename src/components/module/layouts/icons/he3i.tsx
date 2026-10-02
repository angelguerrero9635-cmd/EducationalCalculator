/**
 * College card icons, round 3, group I (HC85), 48 × 48 like every card icon. Crystal defects as
 * flat atom diagrams (atoms in rows, the defect lit); process families and additive families as
 * small machines in their materials (steel, sand, hot metal, resin, powder) with the paint
 * helpers. The names are listed in data/modules/layouts/icons/he3i.ts.
 */
import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { usePalette } from '@/theme';

import { Metal, Sheen, TopLight, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

type Pt = [number, number];

export function He3iIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('steel', 'sheen', 'light', 'hot');

  /** One atom of a defect diagram. */
  const atom = (x: number, y: number, r = 3.4, fill = c.cellMetal, key?: string) => (
    <Circle
      key={key ?? `${x},${y}`}
      cx={x}
      cy={y}
      r={r}
      fill={fill}
      stroke={ink}
      strokeWidth={0.6}
    />
  );
  /** A square grid of atoms from (x0, y0), `n` × `m`, `s` apart, skipping where `skip` says. */
  const grid = (
    x0: number,
    y0: number,
    n: number,
    m: number,
    s: number,
    skip?: (i: number, j: number) => boolean,
  ) => {
    const out: ReactNode[] = [];
    for (let i = 0; i < n; i++)
      for (let j = 0; j < m; j++)
        if (!skip?.(i, j)) out.push(atom(x0 + i * s, y0 + j * s, 3.4, c.cellMetal, `${i}-${j}`));
    return out;
  };
  /** A block of steel (a flat face lit from above). */
  const steel = (x: number, y: number, w: number, h: number, key?: string) => (
    <G key={key}>
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={c.silver}
        stroke={c.silverDark}
        strokeWidth={0.8}
      />
      <Rect x={x} y={y} width={w} height={h} fill={url(ids.light)} />
    </G>
  );
  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const p = (d: number, s: number): Pt => [
      x2 - 4 * Math.cos(a) + d * Math.cos(a + s),
      y2 - 4 * Math.sin(a) + d * Math.sin(a + s),
    ];
    const [l, r] = [p(3, Math.PI / 2), p(3, -Math.PI / 2)];
    return (
      <G>
        <Line
          x1={x1}
          y1={y1}
          x2={x2 - 3 * Math.cos(a)}
          y2={y2 - 3 * Math.sin(a)}
          stroke={color}
          strokeWidth={1.8}
        />
        <Polygon points={`${x2},${y2} ${l[0]},${l[1]} ${r[0]},${r[1]}`} fill={color} />
      </G>
    );
  };
  const defs = (
    <Defs>
      <Metal id={ids.steel} light={c.silver} dark={c.silverDark} />
      <Sheen id={ids.sheen} vertical />
      <TopLight id={ids.light} />
      <Metal id={ids.hot} light={c.cvFlameCore} dark={c.cvFlame} />
    </Defs>
  );
  const body = (() => {
    switch (icon) {
      // ── Crystal defects ──
      case 'vacancy':
        return (
          <G>
            {grid(8, 8, 5, 5, 8, (i, j) => i === 2 && j === 2)}
            <Circle
              cx={24}
              cy={24}
              r={3.4}
              fill="none"
              stroke={c.he3iTie}
              strokeWidth={1.2}
              strokeDasharray="1.6 1.4"
            />
          </G>
        );
      case 'interstitial atom':
        return (
          <G>
            {grid(9, 9, 4, 4, 10)}
            <Circle cx={24} cy={24} r={2.8} fill={c.cellAnion} stroke={c.he3iTie} strokeWidth={1} />
          </G>
        );
      case 'substitutional impurity':
        return (
          <G>
            {grid(8, 8, 5, 5, 8, (i, j) => i === 2 && j === 2)}
            {atom(24, 24, 4.6, c.cellCation)}
          </G>
        );
      case 'edge dislocation': {
        // Rows of atoms, an extra half-plane pushed in from the top ending at ⊥.
        const out: ReactNode[] = [];
        for (let j = 0; j < 5; j++) {
          const y = 8 + j * 8;
          const top = j < 2;
          const cols = top ? 6 : 5;
          const s = top ? 6.8 : 8.5;
          const x0 = top ? 7 : 7;
          for (let i = 0; i < cols; i++)
            out.push(
              atom(x0 + i * s, y, 2.9, i === 3 && top ? c.he3iTie : c.cellMetal, `${i}-${j}`),
            );
        }
        return (
          <G>
            {out}
            <Line
              x1={27.4}
              y1={3}
              x2={27.4}
              y2={16}
              stroke={c.he3iTie}
              strokeWidth={0.8}
              strokeDasharray="1.5 1.5"
            />
            <Line x1={27.4} y1={22} x2={27.4} y2={27} stroke={ink} strokeWidth={1.4} />
            <Line x1={23} y1={27} x2={32} y2={27} stroke={ink} strokeWidth={1.4} />
          </G>
        );
      }
      case 'screw dislocation':
        // A block slipped by one step over half its depth: the step ramps to the dislocation line.
        return (
          <G>
            <Polygon points="6,20 24,12 42,20 42,40 6,40" fill={c.silver} stroke={c.silverDark} />
            <Polygon
              points="6,20 24,12 32,16 14,24"
              fill={c.silver}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Polygon
              points="14,24 32,16 32,22 14,30"
              fill={c.silverDark}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Polygon
              points="14,30 32,22 42,26 42,40 6,40 6,30"
              fill={c.silver}
              stroke={c.silverDark}
            />
            <Rect x={6} y={20} width={36} height={20} fill={url(ids.light)} />
            <Line
              x1={32}
              y1={16}
              x2={32}
              y2={44}
              stroke={c.he3iTie}
              strokeWidth={1.6}
              strokeDasharray="2 1.5"
            />
          </G>
        );
      case 'grain boundary': {
        const out: ReactNode[] = [];
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 5; j++)
            out.push(atom(5 + i * 6.6, 8 + j * 8, 2.8, c.cellMetal, `a${i}${j}`));
        const t = 0.5;
        for (let i = 0; i < 3; i++)
          for (let j = 0; j < 5; j++) {
            const x = 33 + i * 6.6 * Math.cos(t) - j * 0.5;
            const y = 6 + j * 8 + i * 6.6 * Math.sin(t);
            if (y < 44) out.push(atom(x, y, 2.8, c.cellMetal, `b${i}${j}`));
          }
        return (
          <G>
            {out}
            <Path
              d="M 28.5 4 L 27 24 L 29 44"
              stroke={c.he3iTie}
              strokeWidth={1.4}
              fill="none"
              strokeDasharray="2.5 1.5"
            />
          </G>
        );
      }
      case 'twin boundary': {
        const out: ReactNode[] = [];
        for (let j = 0; j < 5; j++)
          for (let i = 0; i < 5; i++) {
            const y = 8 + j * 8;
            const lean = y < 24 ? (24 - y) * 0.45 : (y - 24) * 0.45;
            out.push(atom(8 + i * 8 + lean, y, 3, j === 2 ? c.he3iTie : c.cellMetal, `${i}${j}`));
          }
        return (
          <G>
            {out}
            <Line
              x1={2}
              y1={24}
              x2={46}
              y2={24}
              stroke={c.he3iTie}
              strokeWidth={1}
              strokeDasharray="2 1.5"
            />
          </G>
        );
      }
      case 'pore in metal':
        return (
          <G>
            {steel(6, 8, 36, 32)}
            <Ellipse
              cx={24}
              cy={24}
              rx={8}
              ry={6.5}
              fill={c.metalDark}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Ellipse cx={22} cy={22} rx={3} ry={2} fill={c.shade} opacity={0.4} />
          </G>
        );
      case 'inclusion in metal':
        return (
          <G>
            {steel(6, 8, 36, 32)}
            <Path
              d="M 18 20 L 24 16 L 31 19 L 30 27 L 23 31 L 17 27 Z"
              fill={c.rock4}
              stroke={ink}
              strokeWidth={0.8}
            />
          </G>
        );
      // ── Process families ──
      case 'sand casting':
        return (
          <G>
            <Rect
              x={4}
              y={14}
              width={40}
              height={30}
              fill={c.rock1}
              stroke={ink}
              strokeWidth={0.8}
            />
            {[...Array(14)].map((_, i) => (
              <Circle
                key={i}
                cx={7 + ((i * 11) % 36)}
                cy={17 + ((i * 7) % 24)}
                r={0.7}
                fill={c.rock4}
              />
            ))}
            <Line
              x1={4}
              y1={29}
              x2={44}
              y2={29}
              stroke={ink}
              strokeWidth={0.8}
              strokeDasharray="2 1.5"
            />
            <Path
              d="M 14 24 L 34 24 L 34 36 L 14 36 Z"
              fill={url(ids.hot)}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Path
              d="M 22 4 L 30 4 L 27 14 L 27 24 L 25 24 L 25 14 Z"
              fill={url(ids.hot)}
              stroke={ink}
              strokeWidth={0.8}
            />
          </G>
        );
      case 'die casting':
        return (
          <G>
            <Rect
              x={6}
              y={8}
              width={17}
              height={32}
              fill={url(ids.steel)}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Rect
              x={25}
              y={8}
              width={17}
              height={32}
              fill={url(ids.steel)}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Path
              d="M 17 16 L 23 16 L 23 30 L 17 30 Z M 25 16 L 31 16 L 31 30 L 25 30 Z"
              fill={url(ids.hot)}
            />
            <Rect
              x={21}
              y={40}
              width={6}
              height={6}
              fill={url(ids.hot)}
              stroke={ink}
              strokeWidth={0.6}
            />
            {arrow(24, 47, 24, 41, c.he3iFeed)}
          </G>
        );
      case 'investment casting':
        return (
          <G>
            <Path
              d="M 18 6 L 30 6 L 26 12 L 26 40 L 22 40 L 22 12 Z"
              fill={c.thermalMortar}
              stroke={ink}
              strokeWidth={0.8}
            />
            {[16, 24, 32].map((y) => (
              <G key={y}>
                <Ellipse
                  cx={13}
                  cy={y}
                  rx={7}
                  ry={3.2}
                  fill={c.thermalMortar}
                  stroke={ink}
                  strokeWidth={0.8}
                />
                <Ellipse
                  cx={35}
                  cy={y}
                  rx={7}
                  ry={3.2}
                  fill={c.thermalMortar}
                  stroke={ink}
                  strokeWidth={0.8}
                />
                <Ellipse cx={13} cy={y} rx={4} ry={1.6} fill={url(ids.hot)} />
                <Ellipse cx={35} cy={y} rx={4} ry={1.6} fill={url(ids.hot)} />
              </G>
            ))}
            <Path d="M 23 12 L 25 12 L 25 39 L 23 39 Z" fill={url(ids.hot)} />
          </G>
        );
      case 'forging':
        return (
          <G>
            <Rect
              x={12}
              y={4}
              width={24}
              height={12}
              fill={url(ids.steel)}
              stroke={ink}
              strokeWidth={0.8}
            />
            {arrow(24, 2, 24, 7, c.he3iFeed)}
            <Rect
              x={13}
              y={22}
              width={22}
              height={10}
              rx={3}
              fill={url(ids.hot)}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Path
              d="M 8 34 L 40 34 L 36 40 L 38 46 L 10 46 L 12 40 Z"
              fill={c.metal}
              stroke={ink}
              strokeWidth={0.8}
            />
          </G>
        );
      case 'rolling mill':
        return (
          <G>
            <Path
              d="M 2 18 L 22 18 L 26 21 L 46 21 L 46 27 L 26 27 L 22 30 L 2 30 Z"
              fill={url(ids.hot)}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Circle cx={24} cy={9} r={10} fill={url(ids.steel)} stroke={ink} strokeWidth={0.8} />
            <Circle cx={24} cy={39} r={10} fill={url(ids.steel)} stroke={ink} strokeWidth={0.8} />
            {arrow(30, 24, 44, 24, c.he3iFeed)}
          </G>
        );
      case 'extrusion':
        return (
          <G>
            <Rect
              x={4}
              y={12}
              width={26}
              height={24}
              fill={c.metal}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Rect
              x={6}
              y={16}
              width={8}
              height={16}
              fill={c.metalDark}
              stroke={ink}
              strokeWidth={0.6}
            />
            <Rect x={14} y={16} width={14} height={16} fill={url(ids.hot)} />
            <Rect x={28} y={12} width={4} height={24} fill={c.metalDark} />
            <Rect
              x={28}
              y={20}
              width={18}
              height={8}
              fill={url(ids.hot)}
              stroke={ink}
              strokeWidth={0.8}
            />
            {arrow(2, 24, 7, 24, c.he3iFeed)}
          </G>
        );
      case 'deep drawing':
        return (
          <G>
            <Rect
              x={16}
              y={4}
              width={16}
              height={18}
              fill={url(ids.steel)}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Path
              d="M 4 26 L 14 26 L 14 40 L 34 40 L 34 26 L 44 26"
              stroke={c.he3iFeed}
              strokeWidth={2.4}
              fill="none"
            />
            <Rect
              x={2}
              y={28}
              width={10}
              height={16}
              fill={c.metal}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Rect
              x={36}
              y={28}
              width={10}
              height={16}
              fill={c.metal}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Path
              d="M 16 22 L 16 38 L 32 38 L 32 22"
              fill={url(ids.steel)}
              stroke={ink}
              strokeWidth={0.8}
            />
          </G>
        );
      case 'press-brake bending':
        return (
          <G>
            <Polygon
              points="18,4 30,4 30,16 24,24 18,16"
              fill={url(ids.steel)}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Path d="M 4 18 L 24 30 L 44 18" stroke={c.he3iFeed} strokeWidth={2.4} fill="none" />
            <Polygon
              points="6,30 18,30 24,38 30,30 42,30 42,44 6,44"
              fill={c.metal}
              stroke={ink}
              strokeWidth={0.8}
            />
          </G>
        );
      case 'lathe turning':
        return (
          <G>
            <Rect
              x={2}
              y={10}
              width={10}
              height={28}
              rx={2}
              fill={url(ids.steel)}
              stroke={ink}
              strokeWidth={0.8}
            />
            <Rect x={12} y={17} width={32} height={14} fill={c.silver} stroke={c.silverDark} />
            <Rect x={30} y={19} width={14} height={10} fill={c.silver} stroke={c.silverDark} />
            <Rect x={12} y={17} width={32} height={14} fill={url(ids.sheen)} />
            <Polygon
              points="30,31 34,40 26,40"
              fill={c.he3iCarbide}
              stroke={ink}
              strokeWidth={0.6}
            />
            <Path
              d="M 31 31 q 4 3 3 7 q -1 3 -4 1"
              stroke={c.he3iChipHot}
              strokeWidth={1.6}
              fill="none"
            />
          </G>
        );
      case 'milling cutter':
        return (
          <G>
            <Rect x={4} y={30} width={40} height={14} fill={c.silver} stroke={c.silverDark} />
            <Rect x={4} y={30} width={40} height={14} fill={url(ids.light)} />
            <Circle cx={24} cy={18} r={12} fill={url(ids.steel)} stroke={ink} strokeWidth={0.8} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i * Math.PI) / 3;
              return (
                <Circle
                  key={i}
                  cx={24 + 12 * Math.cos(a)}
                  cy={18 + 12 * Math.sin(a)}
                  r={2.4}
                  fill={c.he3iCarbide}
                />
              );
            })}
            <Circle cx={24} cy={18} r={3} fill={c.metalDark} />
          </G>
        );
      case 'arc welding':
        return (
          <G>
            <Rect x={2} y={32} width={21} height={10} fill={c.silver} stroke={c.silverDark} />
            <Rect x={25} y={32} width={21} height={10} fill={c.silver} stroke={c.silverDark} />
            <Path d="M 18 32 Q 24 26 30 32 Z" fill={url(ids.hot)} stroke={ink} strokeWidth={0.6} />
            <Rect
              x={22}
              y={4}
              width={4}
              height={18}
              fill={c.metalDark}
              stroke={ink}
              strokeWidth={0.6}
            />
            <Path
              d="M 24 22 L 22 25 L 26 26 L 23 30"
              stroke={c.atomElectron}
              strokeWidth={1.6}
              fill="none"
            />
            {[
              [16, 22],
              [32, 22],
              [14, 28],
              [34, 28],
            ].map(([x, y]) => (
              <Line
                key={`${x}${y}`}
                x1={24}
                y1={27}
                x2={x}
                y2={y}
                stroke={c.cvFlameCore}
                strokeWidth={0.9}
              />
            ))}
          </G>
        );
      case 'brazing':
        return (
          <G>
            <Rect x={4} y={32} width={26} height={6} fill={c.silver} stroke={c.silverDark} />
            <Rect x={18} y={26} width={26} height={6} fill={c.silver} stroke={c.silverDark} />
            <Rect x={18} y={31} width={12} height={2} fill={c.copper} />
            <Path d="M 6 4 L 14 12" stroke={c.metal} strokeWidth={4} />
            <Path d="M 14 12 Q 22 14 24 22 Q 18 22 14 12 Z" fill={c.cvFlame} />
            <Path d="M 16 14 Q 20 16 21 20 Q 18 19 16 14 Z" fill={c.cvFlameCore} />
            <Line x1={40} y1={8} x2={30} y2={26} stroke={c.copper} strokeWidth={2.2} />
          </G>
        );
      // ── Additive families ──
      case 'SLA printing':
      case 'DLP printing': {
        const dlp = icon === 'DLP printing';
        return (
          <G>
            <Rect
              x={10}
              y={4}
              width={28}
              height={4}
              fill={c.metal}
              stroke={ink}
              strokeWidth={0.6}
            />
            <Rect x={22} y={8} width={4} height={6} fill={c.metal} />
            <Path
              d="M 16 14 L 32 14 L 30 24 L 18 24 Z"
              fill={c.fluidOilDeep}
              stroke={ink}
              strokeWidth={0.6}
            />
            <Path
              d="M 6 20 L 42 20 L 42 30 L 6 30 Z"
              fill={c.fluidOil}
              opacity={0.75}
              stroke={ink}
              strokeWidth={0.8}
            />
            {dlp ? (
              <Polygon points="16,30 32,30 28,40 20,40" fill={c.wellPhoton} opacity={0.5} />
            ) : (
              <Line x1={24} y1={44} x2={27} y2={25} stroke={c.wellPhoton} strokeWidth={1.4} />
            )}
            <Rect x={16} y={40} width={16} height={6} fill={c.metalDark} />
          </G>
        );
      }
      case 'FDM printing':
        return (
          <G>
            <Path d="M 30 2 Q 34 6 28 8" stroke={c.blockBlue} strokeWidth={1.6} fill="none" />
            <Rect
              x={20}
              y={6}
              width={12}
              height={10}
              fill={url(ids.steel)}
              stroke={ink}
              strokeWidth={0.6}
            />
            <Polygon points="23,16 29,16 26,21" fill={c.copper} />
            {[0, 1, 2, 3].map((i) => (
              <Rect
                key={i}
                x={10 + i}
                y={38 - i * 4}
                width={24 - 2 * i}
                height={4}
                rx={2}
                fill={c.blockBlue}
                stroke={ink}
                strokeWidth={0.4}
              />
            ))}
            <Rect x={4} y={42} width={40} height={4} fill={c.metal} />
          </G>
        );
      case 'SLS printing':
      case 'laser metal powder fusion':
      case 'electron beam melting': {
        const metal = icon !== 'SLS printing';
        const powder = metal ? c.silver : c.thermalMortar;
        const beam = icon === 'electron beam melting' ? c.atomElectron : c.cellRay;
        return (
          <G>
            <Rect
              x={4}
              y={28}
              width={40}
              height={18}
              fill={powder}
              stroke={ink}
              strokeWidth={0.8}
            />
            {[...Array(18)].map((_, i) => (
              <Circle
                key={i}
                cx={6 + ((i * 7) % 37)}
                cy={30 + ((i * 5) % 14)}
                r={0.7}
                fill={c.silverDark}
              />
            ))}
            <Rect
              x={16}
              y={32}
              width={16}
              height={10}
              fill={metal ? c.metal : c.blockBlue}
              stroke={ink}
              strokeWidth={0.6}
            />
            {icon === 'electron beam melting' ? (
              <Path
                d="M 18 2 L 30 2 L 28 12 L 20 12 Z"
                fill={c.metal}
                stroke={ink}
                strokeWidth={0.6}
              />
            ) : (
              <Rect
                x={4}
                y={4}
                width={10}
                height={7}
                fill={c.metal}
                stroke={ink}
                strokeWidth={0.6}
              />
            )}
            <Line
              x1={icon === 'electron beam melting' ? 24 : 12}
              y1={icon === 'electron beam melting' ? 12 : 9}
              x2={26}
              y2={31}
              stroke={beam}
              strokeWidth={1.6}
            />
            <Circle cx={26} cy={31} r={2} fill={url(ids.hot)} />
            {icon === 'SLS printing' ? (
              <Rect x={36} y={22} width={8} height={5} rx={2.5} fill={c.metal} />
            ) : null}
          </G>
        );
      }
      case 'PolyJet-style jetting':
      case 'binder jet': {
        const binder = icon === 'binder jet';
        return (
          <G>
            <Rect
              x={8}
              y={6}
              width={24}
              height={9}
              fill={url(ids.steel)}
              stroke={ink}
              strokeWidth={0.6}
            />
            {!binder ? (
              <Rect x={32} y={7} width={8} height={7} fill={c.wellPhoton} opacity={0.6} />
            ) : null}
            {[12, 18, 24].map((x) => (
              <Circle
                key={x}
                cx={x}
                cy={20 + (x % 3)}
                r={1.4}
                fill={binder ? c.water : c.blockBlue}
              />
            ))}
            {binder ? (
              <G>
                <Rect
                  x={4}
                  y={28}
                  width={40}
                  height={18}
                  fill={c.thermalMortar}
                  stroke={ink}
                  strokeWidth={0.8}
                />
                <Rect x={10} y={32} width={20} height={8} fill={c.rock2} opacity={0.7} />
              </G>
            ) : (
              <G>
                {[0, 1, 2].map((i) => (
                  <Rect
                    key={i}
                    x={8 + i * 2}
                    y={38 - i * 5}
                    width={24 - 4 * i}
                    height={5}
                    fill={c.blockBlue}
                    stroke={ink}
                    strokeWidth={0.4}
                  />
                ))}
                <Rect x={4} y={43} width={40} height={3} fill={c.metal} />
              </G>
            )}
          </G>
        );
      }
      case 'wire-and-arc DED':
        return (
          <G>
            <Polygon
              points="20,4 30,4 28,20 22,20"
              fill={url(ids.steel)}
              stroke={ink}
              strokeWidth={0.6}
            />
            <Line x1={38} y1={8} x2={27} y2={24} stroke={c.copper} strokeWidth={1.6} />
            {[0, 1, 2, 3].map((i) => (
              <Rect
                key={i}
                x={10}
                y={40 - i * 4}
                width={28}
                height={4}
                rx={2}
                fill={i === 3 ? url(ids.hot) : c.silver}
                stroke={ink}
                strokeWidth={0.4}
              />
            ))}
            <Rect x={4} y={42} width={40} height={4} fill={c.metal} />
            <Path
              d="M 25 21 L 23 24 L 27 25"
              stroke={c.atomElectron}
              strokeWidth={1.4}
              fill="none"
            />
          </G>
        );
      case 'laminated sheets':
        return (
          <G>
            {[0, 1, 2, 3, 4].map((i) => (
              <Polygon
                key={i}
                points={`${6},${38 - i * 5} ${30},${38 - i * 5} ${42},${32 - i * 5} ${18},${32 - i * 5}`}
                fill={i % 2 ? c.paper : c.thermalMortar}
                stroke={ink}
                strokeWidth={0.6}
              />
            ))}
            <Line x1={36} y1={2} x2={26} y2={13} stroke={c.cellRay} strokeWidth={1.6} />
            <Path
              d="M 18 13 Q 26 9 34 13"
              stroke={c.cellRay}
              strokeWidth={1}
              fill="none"
              strokeDasharray="1.5 1"
            />
          </G>
        );
      default:
        return null;
    }
  })();
  return body ? (
    <G>
      {defs}
      {body}
    </G>
  ) : null;
}
