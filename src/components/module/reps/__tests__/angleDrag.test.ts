import { angleDrag, wrap360 } from '../angleDrag';

describe('an angle dragged round its vertex', () => {
  it('follows the pointer round the vertex at a distance', () => {
    // From (100, 0), 0°, a quarter turn counterclockwise (screen y down) to (0, −100).
    const turn = angleDrag({ x: 100, y: 0 }, 0);
    let a = 0;
    for (let k = 1; k <= 18; k++) {
      const t = (k * 5 * Math.PI) / 180;
      a = turn(100 * Math.cos(t) - 100, -100 * Math.sin(t));
    }
    expect(a).toBeCloseTo(90, 6);
  });

  it('turns a little, not 180°, as the pointer passes over the vertex', () => {
    // From (60, −20) straight left through the vertex's side to (−60, −20), in 10 px steps.
    const turn = angleDrag({ x: 60, y: -20 }, 18);
    let last = 18;
    let most = 0;
    for (let k = 1; k <= 12; k++) {
      const a = turn(-10 * k, 0);
      most = Math.max(most, Math.abs(a - last));
      last = a;
    }
    // Never more than 10 px over the 40 px floor in one step: about 14°.
    expect(most).toBeLessThan(15);
  });

  it('stays within its ends, and turns back at once', () => {
    const turn = angleDrag({ x: 50, y: 0 }, 10, { min: 0, max: 90 });
    expect(turn(0, 60)).toBe(0);
    expect(turn(0, 0)).toBeGreaterThan(0);
  });

  it('wraps to 0°–360°', () => {
    expect(wrap360(-30)).toBe(330);
    expect(wrap360(370)).toBe(10);
  });
});
