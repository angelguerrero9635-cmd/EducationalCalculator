/**
 * The sums of the `simpleMachine` `limb` option (HC81), shared by the picture and its harness
 * check: moments about the joint and the joint force from vertical balance.
 */

export interface LimbLoad {
  force: number;
  arm: number;
}

export interface LimbBalance {
  /** Each load's moment about the joint (force × arm), the main load first. */
  moments: number[];
  /** The loads' total moment, which the muscle's must equal. */
  moment: number;
  /** The muscle force that balances: Σ Fd ÷ d_M. */
  muscle: number;
  /** The joint force: F_M − Σ F on the forearm (down when positive), F_M + Σ F at the hip (up). */
  joint: number;
}

/**
 * Balance about the joint. `loads` are the forces actually acting (the hip's share of the body
 * weight already applied), arms in one unit; `effortArm` the muscle's arm in that unit.
 */
export function limbBalance(
  body: 'forearm' | 'hip',
  loads: LimbLoad[],
  effortArm: number,
  muscle?: number,
): LimbBalance {
  const moments = loads.map((l) => l.force * l.arm);
  const moment = moments.reduce((a, b) => a + b, 0);
  const total = loads.reduce((a, l) => a + l.force, 0);
  const F = muscle ?? (effortArm > 0 ? moment / effortArm : NaN);
  return { moments, moment, muscle: F, joint: body === 'hip' ? F + total : F - total };
}

/** The hip's default share of body weight above the stance leg (the leg is the other sixth). */
export const HIP_SHARE = 5 / 6;
