/**
 * The math of the `projection` picture and card figure (HC78, EG-P28): map projections of a
 * sphere computed from their formulas (no table, no traced map), their scale factors, and a
 * Tissot ellipse from the local Jacobian. Coordinates are in globe radii; angles in degrees.
 */

import type { ProjectionName } from '@/data/modules/typesHe3m';

export type { ProjectionName };

export const RAD = Math.PI / 180;

/** Which property each keeps (conformal, equal-area, equidistant, or a compromise of all). */
export const PROPERTY: Record<
  ProjectionName,
  'conformal' | 'equalArea' | 'equidistant' | 'compromise'
> = {
  mercator: 'conformal',
  lambertConformalConic: 'conformal',
  stereographic: 'conformal',
  cylindricalEqualArea: 'equalArea',
  gallPeters: 'equalArea',
  mollweide: 'equalArea',
  albersEqualAreaConic: 'equalArea',
  equirectangular: 'equidistant',
  azimuthalEquidistant: 'equidistant',
  winkelTripel: 'compromise',
};

/** Standard parallels of the two conics. */
const P1 = 20 * RAD;
const P2 = 50 * RAD;

const lccN =
  Math.log(Math.cos(P1) / Math.cos(P2)) /
  Math.log(Math.tan(Math.PI / 4 + P2 / 2) / Math.tan(Math.PI / 4 + P1 / 2));
const lccF = (Math.cos(P1) * Math.tan(Math.PI / 4 + P1 / 2) ** lccN) / lccN;
const albN = (Math.sin(P1) + Math.sin(P2)) / 2;
const albC = Math.cos(P1) ** 2 + 2 * albN * Math.sin(P1);

/** Mollweide's auxiliary angle θ: 2θ + sin 2θ = π sin φ (Newton's method). */
function mollweideTheta(phi: number): number {
  if (Math.abs(Math.abs(phi) - Math.PI / 2) < 1e-9) return Math.sign(phi) * (Math.PI / 2);
  let t = phi;
  for (let k = 0; k < 30; k++) {
    const f = 2 * t + Math.sin(2 * t) - Math.PI * Math.sin(phi);
    const d = 2 + 2 * Math.cos(2 * t);
    if (Math.abs(d) < 1e-12) break;
    const step = f / d;
    t -= step;
    if (Math.abs(step) < 1e-12) break;
  }
  return t;
}

const sinc = (a: number) => (Math.abs(a) < 1e-9 ? 1 : Math.sin(a) / a);
const WINKEL_P1 = Math.acos(2 / Math.PI);

/** (x, y) of latitude `lat`, longitude `lon` (degrees) in globe radii, north up. */
export function project(name: ProjectionName, lat: number, lon: number): [number, number] {
  const phi = lat * RAD;
  const lam = lon * RAD;
  switch (name) {
    case 'mercator':
      return [lam, Math.log(Math.tan(Math.PI / 4 + phi / 2))];
    case 'cylindricalEqualArea':
      return [lam, Math.sin(phi)];
    case 'equirectangular':
      return [lam, phi];
    case 'gallPeters':
      return [lam * Math.cos(Math.PI / 4), Math.sin(phi) / Math.cos(Math.PI / 4)];
    case 'mollweide': {
      const t = mollweideTheta(phi);
      return [((2 * Math.SQRT2) / Math.PI) * lam * Math.cos(t), Math.SQRT2 * Math.sin(t)];
    }
    case 'winkelTripel': {
      const a = Math.acos(Math.cos(phi) * Math.cos(lam / 2));
      return [
        0.5 * (lam * Math.cos(WINKEL_P1) + (2 * Math.cos(phi) * Math.sin(lam / 2)) / sinc(a)),
        0.5 * (phi + Math.sin(phi) / sinc(a)),
      ];
    }
    case 'lambertConformalConic': {
      const rho = lccF / Math.tan(Math.PI / 4 + phi / 2) ** lccN;
      const rho0 = lccF;
      return [rho * Math.sin(lccN * lam), rho0 - rho * Math.cos(lccN * lam)];
    }
    case 'albersEqualAreaConic': {
      const rho = Math.sqrt(albC - 2 * albN * Math.sin(phi)) / albN;
      const rho0 = Math.sqrt(albC) / albN;
      return [rho * Math.sin(albN * lam), rho0 - rho * Math.cos(albN * lam)];
    }
    case 'stereographic': {
      const rho = 2 * Math.tan((Math.PI / 2 - phi) / 2);
      return [rho * Math.sin(lam), -rho * Math.cos(lam)];
    }
    case 'azimuthalEquidistant': {
      const rho = Math.PI / 2 - phi;
      return [rho * Math.sin(lam), -rho * Math.cos(lam)];
    }
  }
}

/** The latitudes and longitudes a projection is drawn over (the poles never fit some). */
export function domain(
  name: ProjectionName,
  mercatorTop = 80,
): { lat: [number, number]; lon: [number, number] } {
  switch (name) {
    case 'mercator':
      return { lat: [-mercatorTop, mercatorTop], lon: [-180, 180] };
    case 'lambertConformalConic':
    case 'albersEqualAreaConic':
      return { lat: [10, 75], lon: [-110, 110] };
    case 'stereographic':
      return { lat: [0, 90], lon: [-180, 180] };
    case 'azimuthalEquidistant':
      return { lat: [-89.5, 90], lon: [-180, 180] };
    default:
      return { lat: [-90, 90], lon: [-180, 180] };
  }
}

/**
 * The local scale: the map's change per unit of ground east (∂P/∂λ ÷ cos φ) and north
 * (∂P/∂φ), by central differences. A Tissot circle of radius ρ maps to P + ρ(e cos t + n sin t).
 */
export function jacobian(name: ProjectionName, lat: number, lon: number) {
  const h = 1e-4;
  const [xe1, ye1] = project(name, lat, lon + h);
  const [xe0, ye0] = project(name, lat, lon - h);
  const [xn1, yn1] = project(name, lat + h, lon);
  const [xn0, yn0] = project(name, lat - h, lon);
  const d = 2 * h * RAD;
  const c = Math.cos(lat * RAD);
  const e: [number, number] = [(xe1 - xe0) / d / c, (ye1 - ye0) / d / c];
  const n: [number, number] = [(xn1 - xn0) / d, (yn1 - yn0) / d];
  return {
    e,
    n,
    kE: Math.hypot(e[0], e[1]),
    kN: Math.hypot(n[0], n[1]),
    area: Math.abs(e[0] * n[1] - e[1] * n[0]),
  };
}

/** The Tissot ellipse of radius ρ (globe radii) at (lat, lon), as points. */
export function tissot(name: ProjectionName, lat: number, lon: number, rho: number, steps = 36) {
  const [x, y] = project(name, lat, lon);
  const { e, n } = jacobian(name, lat, lon);
  return Array.from({ length: steps }, (_, k) => {
    const t = (2 * Math.PI * k) / steps;
    return [
      x + rho * (e[0] * Math.cos(t) + n[0] * Math.sin(t)),
      y + rho * (e[1] * Math.cos(t) + n[1] * Math.sin(t)),
    ] as [number, number];
  });
}

// ─── The main picture's three cylinders, by formula ─────────────────────────

export type CylinderName = 'mercator' | 'cylindricalEqualArea' | 'equirectangular';

/** y of the parallel φ on a map of globe radius R. */
export function parallelY(name: CylinderName, lat: number, R: number): number {
  const phi = lat * RAD;
  switch (name) {
    case 'mercator':
      return R * Math.log(Math.tan(Math.PI / 4 + phi / 2));
    case 'cylindricalEqualArea':
      return R * Math.sin(phi);
    case 'equirectangular':
      return R * phi;
  }
}

/** The latitude whose parallel is drawn at y (map radius R): the inverse of `parallelY`. */
export function latitudeAt(name: CylinderName, y: number, R: number): number {
  const u = y / R;
  switch (name) {
    case 'mercator':
      return (2 * Math.atan(Math.exp(u)) - Math.PI / 2) / RAD;
    case 'cylindricalEqualArea':
      return Math.asin(Math.max(-1, Math.min(1, u))) / RAD;
    case 'equirectangular':
      return u / RAD;
  }
}

/** East–west and north–south scale factors at φ, by formula. */
export function scaleFactors(name: CylinderName, lat: number): { kE: number; kN: number } {
  const c = Math.cos(lat * RAD);
  switch (name) {
    case 'mercator':
      return { kE: 1 / c, kN: 1 / c };
    case 'cylindricalEqualArea':
      return { kE: 1 / c, kN: c };
    case 'equirectangular':
      return { kE: 1 / c, kN: 1 };
  }
}
