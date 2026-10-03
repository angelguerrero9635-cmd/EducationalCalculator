import { holds, outOfCount, solve } from '@/engine/solve';
import { initialState, setValues } from '@/engine/state';
import { makeUnitContext } from '@/engine/unitContext';
import { getUnit } from '@/engine/units';
import { resolveItem } from '@/data/selectors';
import { equationIds } from '@/components/module/equationTemplate';

import { getModule, moduleOwner, MODULES, TESTED_MODULES } from '..';
import { buildSteps } from '../buildSteps';
import type { ModuleDef, Representation } from '../types';
import { graphSpecVars } from '../typesGraphs';
import { circleSectorVars, planeGeometryVars, scaleCopyHsfVars } from '../typesHsf';
import { functionGraphVars } from '../typesFunctionGraph';
import { lifeSpecVars } from '../typesLife';
import { chemSpecVars } from '../typesChem';
import { mechanicsSpecVars } from '../typesMechanics';
import { physics8SpecVars } from '../typesPhysics8';
import { hscSpecVars } from '../typesHsc';
import { hsbSpecVars } from '../typesHsb';
import { alleleHe4eVars, driftPathsVars, normalCurveHe4eVars } from '../typesHe4e';
import { complexPlaneHe4mVars, he4mSpecVars } from '../typesHe4m';
import { hs2aSpecVars } from '../typesHs2a';
import { hs2eSpecVars } from '../typesHs2e';
import { hs3dSpecVars } from '../typesHs3d';
import { skeletalVars } from '../typesHe1c';
import { soilProfileVars, surveyVars, trussVars } from '../typesHe2i';
import { hs2gSpecVars } from '../typesHs2g';
import { hs3bSpecVars } from '../typesHs3b';
import { hsdSpecVars } from '../typesHsd';
import { hsgSpecVars, inheritanceVars } from '../typesHsg';
import { hshSpecVars } from '../typesHsh';
import { hsiSpecVars } from '../typesHsi';
import { hsjSpecVars, solutionVars } from '../typesHsj';
import { cuvetteVars } from '../typesHe4d';
import { chemDiagramVars } from '../typesHs2d';
import { phaseEnvelopeVars } from '../typesHe1i';
import { hslSpecVars } from '../typesHsl';
import { hs2fSpecVars } from '../typesHs2f';
import { hs3cSpecVars } from '../typesHs3c';
import { he1gSpecVars } from '../typesHe1g';
import { he1fSpecVars } from '../typesHe1f';
import { he2bSpecVars } from '../typesHe2b';
import { he3iSpecVars } from '../typesHe3i';
import { globeVars } from '../typesHe2k';
import { instrumentTraceVars } from '../typesHe3e';
import { he3mVars, planeGisVars } from '../typesHe3m';
import { he2jSpecVars } from '../typesHe2j';
import { fieldPlotVars } from '../typesHe2g';
import { solidOfRevolutionVars, spaceObjectsVars, surfacePlotVars } from '../typesHe3b';
import { he2cSpecVars } from '../typesHe2c';
import { he3hSpecVars } from '../typesHe3h';
import { he3dSpecVars } from '../typesHe3d';
import { dilutionSeriesVars } from '../typesHe3g';
import { hskOptionVars, hskSpecVars } from '../typesHsk';
import { he2fSpecVars, isHe2fSpec } from '../typesHe2f';
import { he3lSpecVars, isHe3lSpec } from '../typesHe3l';
import { he4cSpecVars, isHe4cOption } from '../typesHe4c';
import { he1hSpecVars } from '../typesHe1h';
import { he2dSpecVars } from '../typesHe2d';
import { hs2cSpecVars } from '../typesHs2c';
import { hs3aSpecVars } from '../typesHs3a';
import { he4bSpecVars } from '../typesHe4b'; // HC96–HC171, group B
import { he1bSpecVars } from '../typesHe1b';
import { he1aSpecVars } from '../typesHe1a';
import { bodeVars, complexPlaneHe2aVars } from '../typesHe2a';
import { he3jSpecVars } from '../typesHe3j';
import { he3kSpecVars, waterfallDecibelsVars } from '../typesHe3k';
import { chainTreeVars, matrixGridHe4aVars, scatterClassesVars } from '../typesHe4a'; // group A, round 4
import { he2hSpecVars } from '../typesHe2h';
import {
  conicGraphHe3cVars,
  curvedSolidHe3cVars,
  polarGridHe3cVars,
  rectangleHe3cVars,
  rightTriangleHe3cVars,
  termsChartHe3cVars,
} from '../typesHe3c';
import { isStandIn, pages } from '../harness/scope';
import { treeChanceVars, twoWayVars, vennChanceVars } from '../harness/picturesHse';

/** Every variable id a representation refers to. */
function representationVars(r: Representation): string[] {
  if (isHe2fSpec(r)) return he2fSpecVars(r); // HC20, HC25, HC35
  if (isHe4cOption(r)) return he4cSpecVars(r); // HC99, HC101, HC103, HC105, HC118
  switch (r.kind) {
    case 'none':
      return [];
    case 'numberLine':
      return [
        r.start,
        r.end,
        ...[r.jump, r.from, r.every, r.count].filter((v): v is string => !!v),
      ];
    case 'tenFrame':
      return [r.first, r.second, r.total, r.crossOut].filter(
        (v): v is string => typeof v === 'string',
      );
    case 'hundredChart':
      return [
        r.value,
        ...(r.marks ?? []),
        ...(r.tens ? [r.tens.count] : []),
        ...(r.multiplesOf ? [r.multiplesOf] : []),
      ];
    case 'compareRows':
      return [r.a, r.b, ...(r.difference ? [r.difference] : [])];
    case 'polygon':
      return [
        ...(r.sides ? [r.sides] : []),
        ...(r.side ? [r.side] : []),
        ...(r.corners ? [r.corners] : []),
        ...(r.sideValues ?? []),
        ...(r.around ? [r.around] : []),
        ...[r.apothem, r.angle, r.area].filter((x): x is string => !!x), // H106
      ];
    case 'balance':
      return [...r.left, ...r.right, ...(r.takeAway ? [r.takeAway] : [])];
    case 'hanger':
      return [r.unknown, r.left.x, r.left.units, r.right.x, r.right.units].filter(
        (v): v is string => typeof v === 'string',
      );
    case 'baseTen':
      return [
        ...r.groups,
        ...(r.total ? [r.total] : []),
        ...(r.words ? [r.words] : []),
        ...(r.takeAway ? [r.takeAway] : []),
        ...r.controls.map((c) => c.var),
      ];
    case 'unitTiles':
      return [r.count, r.size, r.total].filter((v): v is string => typeof v === 'string');
    case 'clock':
      return [r.hour, r.minute];
    case 'partition':
      return [r.parts, r.shaded, ...(r.control ? [r.control] : [])];
    case 'skipCount':
      return [
        r.step,
        r.count,
        r.total,
        ...(r.start ? [r.start] : []),
        ...(r.second ? [r.second.step] : []),
      ].filter((v): v is string => typeof v === 'string');
    case 'tape':
      if ('equation' in r)
        return [r.equation.times, r.equation.unknown, r.equation.plus, r.equation.total];
      if ('ratio' in r)
        return [
          ...r.ratio,
          r.unit,
          ...(r.amounts ?? []),
          ...[r.total, r.difference].filter((x): x is string => !!x),
        ];
      return 'compare' in r
        ? [...r.compare, r.difference, ...(r.times ? [r.times] : [])]
        : [
            ...r.parts,
            ...(typeof r.total === 'string' ? [r.total] : []),
            ...(r.groups ? [r.groups] : []),
          ];
    case 'linePlot':
      return [
        ...r.points.map((p) => p.var),
        ...(r.start ? [r.start] : []),
        ...(typeof r.marks === 'string' ? [r.marks] : []),
      ];
    case 'pairs':
      return [r.value];
    case 'hops':
      return [
        r.start,
        ...r.hops.flatMap((x) => (typeof x.sign === 'string' ? [x.var, x.sign] : [x.var])),
        r.end,
      ];
    case 'numberBond':
      return [r.whole, ...r.parts].filter((v): v is string => typeof v === 'string');
    case 'patternBlocks':
      return [r.trapezoids, r.rhombuses, r.triangles];
    case 'lineUp':
      return [r.count, r.position, r.before, r.after];
    case 'equalGroups':
      return [r.groups, r.each, r.total];
    case 'prism':
      return [r.sides, r.faces, r.edges, r.corners];
    case 'solid':
      return [r.flat, r.curved];
    case 'dotSet':
      return [r.count];
    case 'tally':
      return [...r.rows, ...(r.total ? [r.total] : [])];
    case 'coinRow':
      return [r.value, r.count, r.total];
    case 'partnerList':
      return [r.total, r.ways];
    case 'array':
      return [
        r.rows,
        r.columns,
        r.total,
        ...(r.split
          ? [r.split.first, r.split.second, r.split.firstTotal, r.split.secondTotal]
          : []),
      ];
    case 'rounding':
      return [
        r.value,
        r.rounded,
        ...[r.lower, r.upper, r.second?.estimate].filter((x): x is string => !!x),
        ...(r.second ? [r.second.value, r.second.rounded] : []),
        ...(typeof r.to === 'string' ? [r.to] : []),
      ];
    case 'fractionLine':
      return [
        r.numerator,
        r.denominator,
        ...(r.parts ?? []),
        ...(r.copies ? [r.copies] : []),
        ...(r.second ? [r.second.numerator, r.second.denominator] : []),
        ...(r.from ? [r.from] : []),
        ...(typeof r.startWhole === 'string' ? [r.startWhole] : []),
      ];
    case 'fractionBars':
      return [...r.rows.flatMap((x) => [x.num, x.den]), ...r.controls];
    case 'timeline':
      return [r.startHour, r.startMinute, r.minutes, r.endHour, r.endMinute];
    case 'scale':
      return [
        ...(r.items ?? []),
        ...(r.count ? [r.count] : []),
        ...(r.each ? [r.each] : []),
        ...(r.before ? [r.before] : []),
        r.total,
      ];
    case 'beaker':
      if ('cuvette' in r) return cuvetteVars(r.cuvette); // HC112
      return 'solution' in r ? solutionVars(r.solution) : [...r.parts, r.total];
    case 'quadrilateral':
      return [r.first, r.second, r.rightAngles];
    case 'rectilinear':
      return [
        ...[r.left, r.right, r.cut].flatMap((p) =>
          p ? [p.width, p.height, ...(p.area ? [p.area] : [])] : [],
        ),
        r.total,
      ];
    case 'areaModel':
      if ('factors' in r) return [...r.factors, r.total];
      if ('divide' in r) {
        const d = r.divide;
        return [d.dividend, d.divisor, d.quotient, ...(d.remainder ? [d.remainder] : [])];
      }
      return [...r.top, ...r.side, ...r.parts.flat(), r.total];
    case 'angles':
      return [
        ...r.parts,
        ...(typeof r.whole === 'string' ? [r.whole] : []),
        ...(r.sliders ?? []),
        ...[r.cross?.first, r.cross?.second, r.triangle?.third].filter((x): x is string => !!x),
      ];
    case 'doubleNumberLine':
      return [r.top, r.bottom, r.per];
    case 'coordinatePlane':
      return [
        r.x,
        r.y,
        ...(r.second ? [r.second.x, r.second.y] : []),
        ...(r.slope ? [r.slope] : []),
        ...[r.rise, r.run].filter((v): v is string => !!v),
        ...(r.distance ? [r.distance] : []),
        ...(r.rect ? [r.rect.left, r.rect.right, r.rect.bottom, r.rect.top] : []),
        ...(r.trail
          ? [r.trail.across, r.trail.up].filter((v): v is string => typeof v === 'string')
          : []),
        ...planeGeometryVars(r),
        ...planeGisVars(r),
      ];
    case 'boxPlot':
      return [
        r.min,
        r.q1,
        r.median,
        r.q3,
        r.max,
        ...[r.brackets?.range, r.brackets?.iqr].filter((x): x is string => !!x),
        ...(r.data ?? []),
        ...(r.count ? [r.count] : []),
        ...[r.fences?.lower, r.fences?.upper].filter((x): x is string => !!x),
        ...(r.second ? Object.values(r.second) : []),
      ];
    case 'pieChart':
      return [...r.parts, ...(r.total ? [r.total] : []), ...(r.group ? [r.group.id] : [])];
    case 'fractionArea':
      return [
        r.first.num,
        r.first.den,
        r.second.num,
        r.second.den,
        ...(r.product ? [r.product.num, r.product.den] : []),
      ];
    case 'unitCubes':
      return [
        r.length,
        r.width,
        r.height,
        r.volume,
        ...(r.second ? [r.second.length, r.second.width, r.second.height, r.second.volume] : []),
        ...(r.total ? [r.total] : []),
      ];
    case 'placeValueChart':
      return [
        r.value,
        ...[r.highlight, r.from, r.compare, r.plus, r.total].filter((v): v is string => !!v),
      ];
    case 'factorPairs':
      return [r.value, ...[r.first, r.second, r.count].filter((v): v is string => !!v)];
    case 'shareWholes':
      return [r.wholes, r.people, ...(r.each ? [r.each] : [])];
    case 'factorTree':
      return [
        r.value,
        ...[r.count, r.second, r.gcf, r.lcm, r.root?.outside, r.root?.inside].filter(
          (x): x is string => !!x,
        ),
      ];
    case 'protractor':
      return [
        r.angle,
        ...(r.other ? [r.other] : []),
        ...(r.arms ? [r.arms.first, r.arms.second] : []),
      ];
    case 'wave':
      if (isHe3lSpec(r)) return he3lSpecVars(r); // HC93
      return [
        ...(r.amplitude ? [r.amplitude] : []),
        ...(typeof r.extent === 'string' ? [r.extent] : []),
        r.wavelength,
        ...(r.frequency ? [r.frequency] : []),
        ...hskOptionVars(r),
      ];
    case 'punnettSquare':
      return [
        r.first,
        r.second,
        r.dominant,
        ...(r.recessive ? [r.recessive] : []),
        ...(r.inheritance ? inheritanceVars(r.inheritance) : []),
      ];
    case 'integerLine':
      return [
        ...hs2aSpecVars(r),
        r.value,
        ...[r.opposite, r.absolute, r.second, r.change, r.jump?.by, r.jump?.result].filter(
          (x): x is string => !!x,
        ),
        ...[r.inequality?.test, r.inequality?.sign].filter(
          (x): x is string => !!x && !['<', '≤', '>', '≥'].includes(x),
        ),
        ...(r.inequality?.twoStep
          ? [r.inequality.twoStep.times, r.inequality.twoStep.plus, r.inequality.twoStep.total]
          : []),
        ...[r.compound?.center, r.compound?.radius, r.compound?.test].filter(
          (x): x is string => !!x,
        ),
      ];
    case 'percentBar':
      return [
        r.percent,
        r.part,
        r.whole,
        ...(r.onePercent ? [r.onePercent] : []),
        ...(r.change ? [r.change.total] : []),
        ...(r.second ? [r.second] : []),
      ];
    case 'ratioTable':
      return [r.first, r.second, r.times, ...r.amounts];
    case 'zeroPairs':
    case 'signTable':
      return [r.first, r.second, r.result];
    case 'fractionFit':
      return [
        r.dividend.num,
        r.dividend.den,
        r.divisor.num,
        r.divisor.den,
        ...(r.quotient ? [r.quotient] : []),
      ];
    case 'venn':
      if ('chances' in r) return [...vennChanceVars(r.chances), ...hs2gSpecVars(r)];
      return [r.first, r.second, ...[r.gcf, r.lcm].filter((x): x is string => !!x)];
    case 'baseHeight':
      return [r.base, r.height, r.area, ...(r.top ? [r.top] : [])];
    case 'net':
      return [r.length, ...[r.width, r.height, r.slant, r.total].filter((x): x is string => !!x)];
    case 'crossSection':
      return [
        r.length,
        r.height,
        ...[r.width, r.at, r.area, r.volume].filter((x): x is string => !!x),
      ];
    case 'treeDiagram':
      if ('chain' in r) return chainTreeVars(r.chain); // HC98
      if ('chances' in r) return [...treeChanceVars(r.chances), ...hs2gSpecVars(r)];
      return [r.first, r.second, ...[r.third, r.total, r.chance].filter((x): x is string => !!x)];
    case 'diceGrid':
      return [r.target, ...[r.count, r.chance].filter((x): x is string => !!x)];
    case 'spinner':
    case 'marbles':
      return [...r.parts, ...[r.chance, r.total].filter((x): x is string => !!x)];
    case 'sample':
      return [
        r.population,
        r.size,
        r.found,
        ...[r.trait, r.estimate].filter((x): x is string => !!x),
      ];
    case 'dotPlot':
      return [
        ...r.data,
        ...[r.mean, r.median, r.range, r.count, r.difference].filter((x): x is string => !!x),
        ...(r.second
          ? [...r.second.data, ...[r.second.mean, r.second.median].filter((x): x is string => !!x)]
          : []),
        ...(r.sd ? [r.sd.id] : []),
      ];
    case 'fieldOfView':
      return [r.field, r.across, ...(r.size ? [r.size] : [])];
    case 'gradCylinder':
      return [r.before, r.after, ...(r.volume ? [r.volume] : [])];
    case 'ruler':
      return [
        ...r.lengths,
        ...[r.difference, r.from, r.to].filter((v): v is string => typeof v === 'string'),
      ];
    case 'coins':
      return [...r.coins.map((c) => c.var), r.total];
    case 'cubeTrains':
      return [...r.rows.flat(2), r.total];
    case 'bars':
      return [
        ...r.bars.map((b) => b.var),
        ...(r.total ? [r.total] : []),
        ...(typeof r.scale === 'string' ? [r.scale] : []),
      ];
    case 'pictureGraph':
      return [
        ...r.columns.map((b) => b.var),
        ...(r.total ? [r.total] : []),
        ...(r.key ? [r.key] : []),
      ];
    case 'waterfall':
      return [
        ...r.items.map((b) => b.var),
        r.total,
        ...(r.caption ?? []),
        ...waterfallDecibelsVars(r.decibels), // HC91
      ];
    case 'rectangle':
      return [
        ...[r.length, r.width, r.inside, r.around],
        ...[r.bounds?.error, r.bounds?.least, r.bounds?.greatest], // H106
        ...rectangleHe3cVars(r), // HC67
      ].filter((x): x is string => !!x);
    case 'grid100':
      return [
        r.percent,
        ...(r.caption ? [r.caption.part, r.caption.whole] : []),
        ...(r.second ? [r.second] : []),
        ...(r.wholes ? [r.wholes] : []),
        ...(r.product ?? []),
      ];
    case 'circle':
      return [
        ...[r.radius, r.diameter, r.circumference, r.area, r.wedges].filter(
          (v): v is string => typeof v === 'string',
        ),
        ...circleSectorVars(r.sector),
        ...[r.population?.people, r.population?.density].filter((x): x is string => !!x), // H106
      ];
    case 'scaleCopy':
      return [
        r.factor,
        r.width,
        r.height,
        r.copyWidth,
        r.copyHeight,
        ...(r.area ?? []),
        ...scaleCopyHsfVars(r),
      ].filter((v): v is string => typeof v === 'string');
    case 'rightTriangle':
      return [r.a, r.b, r.c, ...rightTriangleHe3cVars(r)]; // HC54
    case 'plot':
      return [
        r.x.var,
        r.y.var,
        ...r.params,
        ...[r.tangentSlope, r.slopeTriangle, r.intercept, r.unitRate].filter(
          (v): v is string => !!v,
        ),
      ];
    case 'table':
      return 'twoWay' in r ? twoWayVars(r.twoWay) : [r.sweep, r.output, ...r.params];
    case 'thermometers':
      return [...r.items, ...(r.difference ? [r.difference] : [])];
    case 'rockLayers':
      return 'dating' in r ? hslSpecVars(r) : [...r.fossils, r.difference];
    case 'grassSlope':
      return [r.bare, r.grass, ...(r.difference ? [r.difference] : [])];
    case 'flashlights':
      return [r.near, r.times, ...(r.far ? [r.far] : [])];
    case 'leafCount':
      return [...r.items, ...(r.difference ? [r.difference] : [])];
    case 'scatter':
      if ('classes' in r) return scatterClassesVars(r); // HC139
      return [
        ...[r.slope, r.intercept, r.r, r.residualOf?.residual, r.residualOf?.point].filter(
          (x): x is string => typeof x === 'string',
        ),
        ...(r.at ? [r.at.x, r.at.y] : []),
      ];
    case 'curvedSolid':
      return [
        r.radius,
        ...[r.height, r.volume, r.slant, r.surface].filter((x): x is string => !!x),
        ...curvedSolidHe3cVars(r), // HC54
      ];
    case 'rootSquare':
      return [r.area, r.side, ...(r.between ?? [])];
    case 'factorRows':
      return [r.base, r.first, r.second, r.result];
    case 'powerScale':
      return [
        r.number,
        r.mantissa,
        r.exponent,
        ...[r.second, r.log].filter((x): x is string => !!x),
      ];
    case 'equationBalance':
      return [r.x, ...[...r.left, ...r.right].filter((v): v is string => typeof v === 'string')];
    case 'pushes':
      return [r.right, r.left, r.extra];
    case 'force':
      return [r.force, r.mass, r.acceleration];
    case 'seriesCircuit':
      if ('net' in r) return he1hSpecVars(r); // HC7
      if ('amp' in r || 'device' in r) return he2dSpecVars(r); // HC18, HC39
      return [r.source, r.current, ...r.resistors.flatMap((x) => [x.r, x.v])];
    case 'linearFunction':
    case 'lineSystem':
    case 'functionMachine':
    case 'mapping':
    case 'transformation':
      return [...graphSpecVars(r), ...hs2aSpecVars(r)];
    case 'functionGraph':
      return [...functionGraphVars(r), ...hs2aSpecVars(r), ...hs2gSpecVars(r)];
    case 'energyPyramid':
    case 'generations':
      return lifeSpecVars(r);
    case 'molecules':
    case 'reaction':
    case 'heatingCurve':
    case 'periodicTable':
      return chemSpecVars(r);
    case 'motionGraph':
    case 'skaters':
    case 'energyTrack':
      return [...mechanicsSpecVars(r), ...hskOptionVars(r)];
    case 'spectrum':
    case 'circuit':
    case 'electromagnet':
    case 'orbit':
      if ('net' in r) return he1hSpecVars(r); // HC7
      return [...physics8SpecVars(r), ...hskOptionVars(r)];
    case 'triangleSolver':
    case 'markedFigure':
    case 'circleTheorems':
      return hscSpecVars(r);
    case 'normalCurve':
    case 'histogram':
    case 'pascalTriangle':
    case 'termsChart':
      return [
        ...hsbSpecVars(r),
        ...hs2aSpecVars(r),
        ...hs2gSpecVars(r),
        ...hs3bSpecVars(r),
        ...(r.kind === 'termsChart' ? termsChartHe3cVars(r) : []), // HC66
        ...(r.kind === 'normalCurve' ? normalCurveHe4eVars(r) : []), // HC114, HC152
      ];
    case 'unitCircle':
    case 'algebraTiles':
    case 'vectorDiagram':
    case 'complexPlane':
    case 'polarGrid':
    case 'conicGraph':
    case 'matrixGrid':
      return [
        ...hsdSpecVars(r),
        ...hs2gSpecVars(r),
        ...hs3bSpecVars(r),
        ...(r.kind === 'complexPlane' ? complexPlaneHe2aVars(r) : []), // HC14
        ...(r.kind === 'complexPlane' ? complexPlaneHe4mVars(r) : []), // HC182
        ...(r.kind === 'vectorDiagram' ? spaceObjectsVars(r.space) : []), // HC47
        ...(r.kind === 'polarGrid' ? polarGridHe3cVars(r) : []), // HC53
        ...(r.kind === 'conicGraph' && r.conic === 'circle' ? conicGraphHe3cVars(r) : []), // HC67
        ...he4bSpecVars(r), // HC96, HC100, HC108, HC171
        ...(r.kind === 'matrixGrid' ? matrixGridHe4aVars(r) : []), // HC94, HC190
      ];
    case 'membrane':
    case 'dnaStrand':
      return hsgSpecVars(r);
    case 'macromolecules':
    case 'cellDivision':
      return hs2eSpecVars(r);
    case 'neuron':
      return hs3dSpecVars(r);
    case 'skeletal':
      return skeletalVars(r);
    case 'truss':
      return trussVars(r);
    case 'soilProfile':
      return soilProfileVars(r);
    case 'survey':
      return surveyVars(r);
    case 'gel':
    case 'alleleFrequencies':
    case 'immuneResponse':
      if (r.kind === 'alleleFrequencies') return [...hshSpecVars(r), ...alleleHe4eVars(r)]; // HC151
      return hshSpecVars(r);
    case 'unitChain':
    case 'atomModel':
    case 'orbitalDiagram':
    case 'lewisStructure':
    case 'vsepr':
    case 'moleMap':
      return hsiSpecVars(r);
    case 'gasPiston':
    case 'energyProfile':
    case 'equilibriumChart':
    case 'phScale':
    case 'decayChart':
      return hsjSpecVars(r);
    case 'chemDiagram':
      return chemDiagramVars(r);
    case 'phaseEnvelope':
      return phaseEnvelopeVars(r);
    case 'earthLayers':
    case 'oceanProfile':
    case 'atmosphereLayers':
    case 'hrDiagram':
    case 'expandingUniverse':
      return hslSpecVars(r);
    case 'streamChannel':
    case 'reserve':
      if ('mode' in r) return he3jSpecVars(r); // HC88
      return hs2fSpecVars(r);
    case 'geologicClock':
    case 'coralSection':
    case 'transit':
    case 'habitableZone':
    case 'parallax':
      return hs3cSpecVars(r);
    case 'fluidSystem':
      return he1gSpecVars(r);
    case 'controlVolume':
    case 'velocityProfile':
      return he1fSpecVars(r);
    case 'potentialWell':
    case 'unitCell':
      return he2bSpecVars(r);
    case 'phaseSpace':
      return he3lSpecVars(r); // HC69
    case 'binaryPhase':
    case 'machining':
    case 'linkage':
      return he3iSpecVars(r);
    case 'spacetime':
      return he4cSpecVars(r); // HC104
    case 'globe':
      return globeVars(r);
    case 'instrumentTrace':
      return instrumentTraceVars(r); // HC55
    case 'aquifer':
    case 'refraction':
    case 'projection':
      return he3mVars(r);
    case 'stressStrain':
    case 'stressElement':
      return he2jSpecVars(r);
    case 'fieldPlot':
      return fieldPlotVars(r); // HC21
    case 'surfacePlot':
      return surfacePlotVars(r); // HC46
    case 'solidOfRevolution':
      return solidOfRevolutionVars(r); // HC65
    case 'driftPaths':
      return driftPathsVars(r); // HC153
    case 'soilPhases':
    case 'rfSpectrum':
    case 'oneLine':
    case 'losScale':
      return he4mSpecVars(r); // HC174–HC181, group M
    case 'propertyDiagram':
    case 'thermalWall':
      return he2cSpecVars(r);
    case 'heatExchanger':
    case 'shaft':
    case 'fatigueDiagram':
    case 'elementChain':
      return he3hSpecVars(r); // HC40, HC41, HC52, HC59
    case 'timingDiagram':
    case 'graph':
    case 'scheduleChart':
    case 'bitFields':
      return he3dSpecVars(r);
    case 'dilutionSeries':
      return dilutionSeriesVars(r); // HC80
    case 'projectile':
    case 'induction':
    case 'charges':
    case 'rayDiagram':
    case 'heatEngine':
    case 'simpleMachine':
    case 'collision':
    case 'circularMotion':
    case 'freeBody':
      if (isHe3lSpec(r)) return he3lSpecVars(r); // HC68
      return hskSpecVars(r);
    case 'impulse':
    case 'powerLift':
    case 'photoelectric':
    case 'lightClock':
      return hs2cSpecVars(r);
    case 'torque':
    case 'rotor':
    case 'oscillator':
    case 'pendulum':
    case 'capacitor':
      return [...hs3aSpecVars(r), ...he1hSpecVars(r), ...he4bSpecVars(r)]; // HC102, HC106, HC107
    case 'section':
      return he1bSpecVars(r);
    case 'beam':
      return he1aSpecVars(r);
    case 'bode':
      return bodeVars(r); // HC22
    case 'roadCurve':
    case 'connection':
    case 'hydrograph':
    case 'blockDiagram':
      return he3jSpecVars(r); // HC60, HC61, HC89, HC90
    case 'lamina':
    case 'rocket':
    case 'deviceCurves':
    case 'stemPlot':
      return he3kSpecVars(r); // HC86, HC87, HC62, HC63
    case 'wing':
    case 'duct':
    case 'supersonicFlow':
      return he2hSpecVars(r);
  }
}

function subsets<T>(items: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (items.length < k) return [];
  const [first, ...rest] = items as [T, ...T[]];
  return [...subsets(rest, k - 1).map((s) => [first, ...s]), ...subsets(rest, k)];
}

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * (1 + Math.abs(b));

describe.each(pages(TESTED_MODULES))('module %s', (id, m) => {
  if (isStandIn(id)) return void it.skip('no pages in scope', () => {});
  const ids = m.variables.map((v) => v.id);
  // The values the example holds: all but those past a data set's count.
  const inExample = m.variables.filter((v) => !outOfCount(v, m.example)).map((v) => v.id);

  // The picture gallery's demonstrations (g.*) have no skill and carry their own title.
  const gallery = m.id.startsWith('g.');

  it('belongs to a skill or course topic in the taxonomy', () => {
    if (gallery) return;
    expect(resolveItem(moduleOwner(m.id))).toBeDefined();
    // Extra modules for a skill need a title for the switcher.
    if (m.id.includes('~')) expect(m.title).toBeTruthy();
  });

  it('labels only its own values under the picture', () => {
    const ids = new Set(m.variables.map((v) => v.id));
    for (const id of m.pictureLabels ?? []) expect([id, ids.has(id)]).toEqual([id, true]);
  });

  it('drives a typed value from each worked-out handle it names', () => {
    for (const [handle, typed] of Object.entries(m.drives ?? {})) {
      // The handle's value is worked out; the value it drives is typed.
      expect([handle, m.startWith.includes(handle)]).toEqual([handle, false]);
      expect([handle, !!m.variables.find((v) => v.id === handle)]).toEqual([handle, true]);
      expect([typed, m.startWith.includes(typed)]).toEqual([typed, true]);
    }
  });

  it('says what it is for, when it is a problem type', () => {
    if (m.id.includes('~'))
      expect([m.id, (m.use ?? '').startsWith('Use this')]).toEqual([m.id, true]);
  });

  it('has a title only when it is a problem type (main lessons use the skill title)', () => {
    if (gallery) return;
    expect(m.id.includes('~') ? !!m.title : m.title === undefined).toBe(true);
  });

  it('draws its equation from declared values only', () => {
    if (!m.equation) return;
    // Every box, sign box and script the template draws (equationTemplate.ts).
    const inTemplate = equationIds(m.equation);
    expect(inTemplate.filter((id) => !ids.includes(id!))).toEqual([]);
  });

  it('has assumptions, unique variables and relations over declared variables', () => {
    expect(m.assumptions.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(m.relations.length).toBeGreaterThan(0);
    for (const r of m.relations) {
      expect(r.vars.filter((v) => !ids.includes(v))).toEqual([]);
      const inTemplate = [...r.display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]);
      // A data set's values are named by its count ("the {n} values"), not one by one.
      const listed = r.vars.filter((id) => !m.variables.find((v) => v.id === id)?.countedBy);
      expect([...new Set(inTemplate)].sort()).toEqual([...listed, ...(r.shows ?? [])].sort());
      expect((r.shows ?? []).filter((v) => !ids.includes(v) || r.vars.includes(v))).toEqual([]);
    }
    expect(representationVars(m.representation).filter((v) => !ids.includes(v))).toEqual([]);
    // A coded value names every code it takes (`labels`), so no box shows a bare number.
    for (const v of m.variables.filter((x) => x.labels)) {
      expect((v.allowed ?? []).filter((x) => v.labels![x] === undefined)).toEqual([]);
    }
  });

  it('draws a hundred chart big enough for every mark on it', () => {
    const r = m.representation;
    if (r.kind !== 'hundredChart') return;
    const vmax = (id: string) => m.variables.find((v) => v.id === id)?.max ?? 0;
    for (const id of [r.value, ...(r.marks ?? [])]) {
      expect([id, vmax(id) <= r.max]).toEqual([id, true]);
    }
  });

  it('uses a directional difference for a rise, a loss or how much farther (not "apart")', () => {
    // "apart" has no direction: a rise from 120 to 50 would come out as 70. Use `minus`.
    const directional = /\b(rise|lost|loss|worn|escaped|gain|farther|dropped)\b/i;
    const wrong = m.relations
      .filter((r) => r.id.endsWith(' apart'))
      .map((r) => m.variables.find((v) => v.id === r.vars[0]))
      .filter((v) => v && directional.test(v.name))
      .map((v) => v!.name);
    expect(wrong).toEqual([]);
  });

  it('connects every value through the formulas (else it is two lessons: split it)', () => {
    const free = new Set(m.standalone?.vars ?? []);
    if (m.standalone) expect(m.standalone.why.length).toBeGreaterThan(10);
    const parent = new Map(ids.map((id) => [id, id]));
    const find = (x: string): string => (parent.get(x) === x ? x : find(parent.get(x)!));
    for (const r of m.relations) {
      for (const v of r.vars.slice(1)) parent.set(find(v), find(r.vars[0]!));
    }
    const groups = new Set(ids.filter((id) => !free.has(id)).map(find));
    expect([...groups].map((g) => ids.filter((id) => find(id) === g))).toHaveLength(1);
  });

  it('has a worked example that satisfies every relation and range', () => {
    // Values past a data set's count are left out of the example.
    const inSet = inExample;
    expect(Object.keys(m.example).sort()).toEqual([...inSet].sort());
    for (const r of m.relations) expect(holds(r, m.example, m.variables)).toBe(true);
    const result = solve(
      m,
      inSet.map((id) => ({ id, value: m.example[id]! })),
    );
    expect(result.rejected).toBeUndefined();
    expect(result.dropped.length + result.given.length).toBe(inSet.length);
  });

  it('has no zero example values for variables with units (keeps the unit check meaningful)', () => {
    // The "formulas hold in these units" check uses the example; a 0 would pass any unit.
    for (const v of m.variables) {
      if (getUnit(v.unit)) expect([v.id, m.example[v.id]]).not.toEqual([v.id, 0]);
    }
  });

  it('rearrangements agree with the relation', () => {
    for (const r of m.relations) {
      for (const [id, fn] of Object.entries(r.solve ?? {})) {
        // `() => undefined` marks a value the relation can't determine (e.g. n from its tens).
        if (fn!.length === 0 || !(id in m.example)) continue;
        const others = { ...m.example };
        delete others[id];
        const out = fn!(others);
        const candidates = out === undefined ? [] : Array.isArray(out) ? out : [out];
        expect(candidates.some((x) => close(x, m.example[id]!))).toBe(true);
      }
    }
  });

  it('opens with the example filled in from `startWith`', () => {
    const result = solve(
      m,
      m.startWith.map((id) => ({ id, value: m.example[id]! })),
    );
    expect(result.unknown).toEqual([]);
    for (const id of inExample) expect(close(result.values[id]!, m.example[id]!)).toBe(true);
  });

  it('any combination of inputs gives values consistent with the example', () => {
    const typable = inExample.filter((id) => !m.variables.find((v) => v.id === id)?.derived);
    // The first 20 combinations: enough to catch a rearrangement that disagrees, without the
    // combinatorial cost on pages with many typable values.
    for (const combo of subsets(typable, m.startWith.length).slice(0, 20)) {
      const result = solve(
        m,
        combo.map((id) => ({ id, value: m.example[id]! })),
        m.example,
      );
      expect(result.rejected).toBeUndefined();
      for (const [id, x] of Object.entries(result.values)) {
        expect([id, close(x, m.example[id]!)]).toEqual([id, true]);
      }
    }
  });
});

it('module ids are unique', () => {
  expect(new Set(MODULES.map((m) => m.id)).size).toBe(MODULES.length);
});

describe.each(pages(TESTED_MODULES))('steps for %s', (id, m) => {
  if (isStandIn(id)) return void it.skip('no pages in scope', () => {});
  it('explain every rearrangement, using only that relation’s variables', () => {
    // (a figure-only relation places the drawing: it has no steps)
    const shown = m.relations.filter((r) => !r.hidden);
    expect(Object.keys(m.steps).sort()).toEqual(shown.map((r) => r.id).sort());
    for (const r of shown) {
      const texts = m.steps[r.id]!;
      const solvable = Object.entries(r.solve ?? {}).filter(([, fn]) => fn!.length > 0);
      expect(Object.keys(texts).sort()).toEqual(solvable.map(([id]) => id).sort());
      for (const text of Object.values(texts)) {
        const how = typeof text.how === 'function' ? text.how(m.example) : text.how;
        const expr = typeof text.expr === 'function' ? text.expr(m.example) : text.expr;
        expect(how.length).toBeGreaterThan(10);
        const used = [...expr.matchAll(/\{(\w+)\}/g)].map((x) => x[1]!);
        expect(used.filter((id) => !r.vars.includes(id))).toEqual([]);
      }
    }
  });

  it('walk from the opening values to every other value, and the check balances', () => {
    const result = solve(
      m,
      m.startWith.map((id) => ({ id, value: m.example[id]! })),
    );
    const w = buildSteps(m, result);
    expect(w.given.map((q) => q.id)).toEqual(m.startWith);
    expect([...w.steps.map((s) => s.id), ...m.startWith].sort()).toEqual(
      m.variables
        .filter((v) => !outOfCount(v, m.example) && !v.hidden)
        .map((v) => v.id)
        .sort(),
    );
    for (const s of w.steps) {
      expect(s.rearranged).toBeDefined();
      expect(s.substituted ?? '').not.toContain('?');
    }
    expect(w.missing).toEqual([]);
    // Page limits are never shown as checks.
    expect(w.check.length).toBe(m.relations.filter((r) => !r.constraint && !r.hidden).length);
    expect(w.check.every((c) => c.ok)).toBe(true);
  });
});

it('writes the number sentence with ? for the number found (K–2 steps)', () => {
  const m = MODULES.find((x) => x.id === 'm.K.add-sub-10')!;
  const w = buildSteps(
    m,
    solve(m, [
      { id: 'b', value: 4 },
      { id: 'c', value: 7 },
    ]),
  );
  expect(w.steps[0]!.sentence).toMatch(/\?/);
  expect(w.steps[0]!.sentence).toContain('4');
  expect(w.steps[0]!.sentence).toContain('7');
  // K–2: names, never letters, in what the student reads.
  expect(w.band).toBe('early');
  expect(w.steps[0]!.lead).toEqual({ sentence: w.steps[0]!.sentence });
  expect(w.steps[0]!.heading).toBe('Find first group');
  expect(w.steps[0]!.answer).toBe('First group: 3');
  expect(w.given.map((q) => q.label)).toEqual(['Second group: 4', 'In all: 7']);
});

it('builds readable steps (area example)', () => {
  const m = MODULES.find((x) => x.id === 'm.3.area')!;
  const w = buildSteps(
    m,
    solve(m, [
      { id: 'A', value: 12 },
      { id: 'l', value: 4 },
    ]),
  );
  expect(w.given.map((q) => `${q.symbol} = ${q.value}`)).toEqual(['A = 12 cm²', 'l = 4 cm']);
  expect(w.steps).toEqual([
    {
      id: 'w',
      title: 'Find width (w)',
      formula: 'l × w = A',
      sentence: '4 × ? = 12',
      how: 'Each row has as many squares as the length. Divide to find how many rows.',
      rearranged: 'w = A ÷ l',
      substituted: 'w = 12 ÷ 4',
      work: ['Think: 4 × ? = 12', 'Count by 4s to 12: 4, 8, 12 → 3'],
      result: 'w = 3 cm',
      // Grade 3: the number sentence first, then the rule in words; no letters before Grade 6.
      heading: 'Find width',
      lead: { sentence: '4 × ? = 12', formula: 'Length × width = area' },
      lines: ['Width = 12 ÷ 4', 'Think: 4 × ? = 12', 'Count by 4s to 12: 4, 8, 12 → 3'],
      writtenAfter: 1,
      answer: 'Width = 3 cm',
    },
  ]);
  expect(w.given.map((q) => q.label)).toEqual(['Area: 12 cm²', 'Length: 4 cm']);
  expect(w.check).toEqual([{ formula: '4 × 3 = 12', ok: true }]);
});

describe('written work and simplifying, by grade', () => {
  const byId = (id: string) => MODULES.find((m) => m.id === id)!;
  const steps = (id: string, given: Record<string, number>) => {
    const m = byId(id);
    return buildSteps(
      m,
      solve(
        m,
        Object.entries(given).map(([k, value]) => ({ id: k, value })),
      ),
    ).steps;
  };

  it('Grade 2: the column sum sits under the question, the jumps stay', () => {
    const [s] = steps('m.2.add-sub-100-fluency', { a: 38, b: 25 });
    expect(s!.written?.says).toBe('38 + 25 = 63');
    // "38 + 25" under "38 + 25 = ?" only echoed the question.
    expect(s!.lines).toEqual(['38 + 20 = 58', '58 + 2 = 60', '60 + 3 = 63']);
    expect(s!.writtenAfter).toBe(0);
  });

  it('Grade 4: partial quotients, partial products, and no running totals', () => {
    const [q, m, r] = steps('m.4.long-division', { n: 743, d: 6 });
    expect(q!.written?.says).toBe('743 ÷ 6 = 123 remainder 5');
    // Groups taken away by place, each partial quotient beside it.
    expect(q!.written?.rows[1]!.map((c) => c.text).slice(-1)).toEqual(['100 × 6']);
    expect(m!.written?.says).toBe('123 × 6 = 738');
    // A difference under 10 is counted up, not set out in columns.
    expect(r!.written).toBeUndefined();
    const [n] = steps('m.4.multi-digit-multiply', { a: 234, b: 6 });
    expect(n!.written?.says).toBe('234 × 6 = 1,404');
    expect(n!.lines).toEqual(['234 = 200 + 30 + 4']);
  });

  it('Grade 8 (middle band): the numbers in with the unknown kept, then one stage per line, no grids', () => {
    const [c] = steps('m.8.pythagorean', { a: 3, b: 4 });
    expect(c!.written).toBeUndefined();
    expect(c!.lines).toEqual(['3² + 4² = c²', 'c = √(3² + 4²)', 'c = √(9 + 16)', 'c = √25']);
  });

  it('a step with its own work lines is left alone; a module can refuse a grid', () => {
    const [L] = steps('m.2.money~change', { T: 100, P: 65 });
    expect(L!.written).toBeUndefined();
    const [w] = steps('m.3.area', { A: 12, l: 4 });
    expect(w!.lines.some((l) => l.startsWith('w = 3'))).toBe(false);
  });
});

it('lists what is still missing', () => {
  const m = MODULES.find((x) => x.id === 'm.3.area')!;
  const w = buildSteps(m, solve(m, [{ id: 'l', value: 4 }]));
  expect(w.steps).toEqual([]);
  expect(w.missing.map((q) => q.symbol)).toEqual(['w', 'A']);
});

describe('regressions found in review', () => {
  const byId = (id: string) => MODULES.find((m) => m.id === id)!;
  const open = (m: ModuleDef) =>
    initialState(
      m,
      m.startWith.map((id) => ({ id, value: m.example[id]! })),
    );

  it('population: typing RNI recalculates the population instead of clearing it', () => {
    const m = byId('he.geography.human-geography#0');
    const s = setValues(m, open(m), { RNI: 1 });
    expect(s.errors).toEqual({});
    expect(s.result.values.Pop).toBeCloseTo(200000);
    // On the rates page the births move (CDR stays 8, so CBR = 18 and B = 9,000).
    const r = byId('he.geography.human-geography#0~rates');
    const t = setValues(r, open(r), { RNI: 1 });
    expect(t.errors).toEqual({});
    expect(t.result.values.CBR).toBeCloseTo(18);
    expect(t.result.values.B).toBeCloseTo(9000);
  });

  it('population: a tiny growth rate gives a long doubling time without clearing inputs', () => {
    const m = byId('he.geography.human-geography#0~rates');
    const s = setValues(m, open(m), { D: 4000, B: 4001 });
    expect(s.result.cleared).toEqual([]);
    expect(s.result.values.Td).toBeCloseTo(350000);
  });

  it('derivatives: impossible slopes and values are reported, not silently accepted', () => {
    const m = byId('he.math.calc-1#1');
    // n = 1 makes f′ = c everywhere, so typing f′ = 5 must change c.
    let s = setValues(m, open(m), { n: 1 });
    s = setValues(m, s, { m: 5 });
    expect(s.result.values.c).toBeCloseTo(5);
    // n = 0 makes f = c everywhere, so typing f(x) = 4 must change c.
    s = setValues(m, open(m), { n: 0 });
    s = setValues(m, s, { y: 4 });
    expect(s.result.values.c).toBeCloseTo(4);
  });
});

describe('Math K–2', () => {
  it('a difference is never negative, and the steps subtract the smaller from the larger', () => {
    const m = getModule('m.K.compare-10')!;
    const result = solve(m, [
      { id: 'a', value: 4 },
      { id: 'b', value: 7 },
    ]);
    expect(result.values.d).toBe(3);
    const step = buildSteps(m, result).steps.find((s) => s.id === 'd')!;
    expect(step.substituted).toBe('d = 7 − 4');
  });

  it('a digit alone leaves the number unknown instead of guessing', () => {
    const m = getModule('m.1.tens-ones')!;
    const result = solve(m, [{ id: 't', value: 6 }]);
    expect(result.values.n).toBeUndefined();
  });
});

it('the check uses the same units and numbers as the steps (lengths in inches)', () => {
  const m = getModule('m.2.standard-length')!;
  const ctx = makeUnitContext(m, { system: 'us' });
  const result = solve(
    ctx.system,
    m.startWith.map((id) => ({ id, value: ctx.fromDisplay(id, m.example[id]!) })),
  );
  const w = buildSteps(m, result, ctx);
  expect(w.steps.map((s) => s.result)).toEqual(['d = 4 in']);
  expect(w.check.map((c) => c.formula)).toEqual(['12 − 8 = 4']);
});
