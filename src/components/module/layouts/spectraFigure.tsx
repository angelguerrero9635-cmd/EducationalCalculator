import { Circle, Defs, G, Line, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { SpectraElement, SpectraScene } from '@/data/modules/typesHs2f';
import { chart, usePalette } from '@/theme';

import { ChartText } from '../reps/common';
import { SPECTRAL_LINES } from '../reps/hskMath';
import { url, usePaintIds } from '../reps/paint';
import { nmColor } from '../reps/SpectrumLines';
import { Board, BOARD_W, HaloText } from './earthKit';

const [LO, HI] = [380, 750];
const X0 = 12;
const X1 = BOARD_W - 12;
const X = (nm: number) => X0 + ((nm - LO) / (HI - LO)) * (X1 - X0);
const STAR_Y = 26;
const STAR_H = 36;
const REF_Y = 104;
const REF_H = 26;
const REF_GAP = 58;
const ELEMENTS: SpectraElement[] = ['H', 'He', 'Na'];
/** How close a lab line and a star's line must be to match, nm. */
export const MATCH_NM = 1;
const NAMES: Record<SpectraElement, string> = { H: 'Hydrogen', He: 'Helium', Na: 'Sodium' };
const H = REF_Y + 2 * REF_GAP + REF_H + 44;

/** Lines of an element in the visible, nm. */
const linesOf = (e: SpectraElement) =>
  SPECTRAL_LINES[e].map((q) => q.nm).filter((nm) => nm >= LO && nm <= HI);

/**
 * Spectra side by side (H103 part 7): a star's absorption spectrum over the lab spectra of
 * hydrogen, helium and sodium; the lit element's lines joined up to the star's strip, solid and
 * ringed where the star has the line, dashed where it doesn't.
 */
export function SpectraFigure({ scene }: { scene: SpectraScene }) {
  const c = usePalette();
  const ids = usePaintIds('rainbow');
  const star = scene.star;
  const starLines = star.flatMap(linesOf);
  const lit = scene.lit;
  // A lab line matches when the star has a dark line within 1 nm of it.
  const inStar = (nm: number) => starLines.some((x) => Math.abs(x - nm) <= MATCH_NM);
  const litLines = lit === undefined ? [] : linesOf(lit);
  const matched = litLines.filter(inStar).length;
  const match = lit !== undefined && matched === litLines.length;
  const at = (nm: number) => (nm - LO) / (HI - LO);
  return (
    <Board height={H}>
      <Defs>
        <LinearGradient id={ids.rainbow} x1="0" y1="0" x2="1" y2="0">
          <Stop offset={at(380)} stopColor={c.spectrumViolet} />
          <Stop offset={at(460)} stopColor={c.spectrumBlue} />
          <Stop offset={at(520)} stopColor={c.spectrumGreen} />
          <Stop offset={at(575)} stopColor={c.spectrumYellow} />
          <Stop offset={at(605)} stopColor={c.spectrumOrange} />
          <Stop offset={at(650)} stopColor={c.spectrumRed} />
          <Stop offset={1} stopColor={c.spectrumRed} />
        </LinearGradient>
      </Defs>
      {/* The star: a rainbow with dark absorption lines. */}
      <ChartText x={X0} y={STAR_Y - 8} fontSize={chart.value} fontWeight="700">
        The star (absorption)
      </ChartText>
      <Rect x={X0} y={STAR_Y} width={X1 - X0} height={STAR_H} rx={2} fill={url(ids.rainbow)} />
      {starLines.map((nm, i) => (
        <Rect key={i} x={X(nm) - 1.2} y={STAR_Y} width={2.4} height={STAR_H} fill={c.shade} />
      ))}
      {/* The lab spectra: bright lines on dark. */}
      {ELEMENTS.map((e, i) => {
        const y = REF_Y + i * REF_GAP;
        const on = lit === undefined || lit === e;
        return (
          <G key={e} opacity={on ? 1 : 0.45}>
            <ChartText
              x={X0}
              y={y - 8}
              fontSize={chart.value}
              fontWeight={lit === e ? '700' : '400'}
            >
              {`${NAMES[e]} (lab)`}
            </ChartText>
            <Rect
              x={X0}
              y={y}
              width={X1 - X0}
              height={REF_H}
              rx={2}
              fill={c.shade}
              stroke={c.chartGrid}
              strokeWidth={1}
            />
            {linesOf(e).map((nm) => (
              <Rect key={nm} x={X(nm) - 1.5} y={y} width={3} height={REF_H} fill={nmColor(c, nm)} />
            ))}
            {lit === e ? (
              <Rect
                x={X0 - 3}
                y={y - 3}
                width={X1 - X0 + 6}
                height={REF_H + 6}
                rx={4}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
            ) : null}
          </G>
        );
      })}
      {/* The lit element's lines joined to the star: solid where the star has them. */}
      {lit !== undefined
        ? linesOf(lit).map((nm) => {
            const y = REF_Y + ELEMENTS.indexOf(lit) * REF_GAP;
            const has = inStar(nm);
            return (
              <G key={`j${nm}`}>
                <Line
                  x1={X(nm)}
                  y1={y - 3}
                  x2={X(nm)}
                  y2={STAR_Y + STAR_H + 2}
                  stroke={has ? c.chartHighlight : c.chartMuted}
                  strokeWidth={has ? 1.8 : 1.2}
                  strokeDasharray={has ? undefined : chart.dashFine}
                />
                {has ? (
                  <Circle
                    cx={X(nm)}
                    cy={STAR_Y + STAR_H / 2}
                    r={5}
                    fill="none"
                    stroke={c.card}
                    strokeWidth={1.8}
                  />
                ) : null}
              </G>
            );
          })
        : null}
      {lit !== undefined ? (
        <HaloText
          x={X1}
          y={REF_Y + ELEMENTS.indexOf(lit) * REF_GAP - 8}
          text={
            match
              ? 'every line matches'
              : `${matched} of ${litLines.length} lines match: not in the star`
          }
          c={c}
          size={chart.label}
          bold
          anchor="end"
          fill={match ? c.chartHighlight : c.chartMuted}
        />
      ) : null}
      {/* One wavelength scale for all four. */}
      {[400, 500, 600, 700].map((nm) => {
        const y = REF_Y + 2 * REF_GAP + REF_H;
        return (
          <G key={nm}>
            <Line x1={X(nm)} y1={y} x2={X(nm)} y2={y + 5} stroke={c.chartMuted} />
            <ChartText
              x={X(nm)}
              y={y + 18}
              fontSize={chart.label}
              textAnchor="middle"
              fill={c.chartMuted}
            >
              {`${nm}`}
            </ChartText>
          </G>
        );
      })}
      <ChartText
        x={BOARD_W / 2}
        y={H - 4}
        fontSize={chart.label}
        textAnchor="middle"
        fill={c.chartMuted}
      >
        Wavelength, nm
      </ChartText>
    </Board>
  );
}
