/**
 * The jumps a student draws on an elapsed-time number line, the way the steps write them:
 * from the start to the next hour, whole hours in one jump, then the minutes left. Counting
 * back from the end (`back`), the jumps go to the hour before, back whole hours, then the rest.
 * Positions are minutes after the start time (0 to `d`). Timeline.tsx draws these; the harness
 * checks they chain from one end to the other.
 */
export type TimeJump = { from: number; to: number; minutes: number };

export function timeJumps(startMinute: number, d: number, endMinute: number, back: boolean) {
  const out: TimeJump[] = [];
  if (!back) {
    let [at, mm, left] = [0, startMinute, d];
    const push = (k: number) => {
      out.push({ from: at, to: at + k, minutes: k });
      [at, mm, left] = [at + k, (mm + k) % 60, left - k];
    };
    if (mm > 0 && left >= 60 - mm) push(60 - mm);
    if (left >= 60) push(60 * Math.floor(left / 60));
    if (left > 0) push(left);
    return out;
  }
  let [at, mm, left] = [d, endMinute, d];
  const push = (k: number) => {
    out.push({ from: at, to: at - k, minutes: k });
    [at, mm, left] = [at - k, (((mm - k) % 60) + 60) % 60, left - k];
  };
  if (mm > 0 && left >= mm) push(mm);
  if (left >= 60) push(60 * Math.floor(left / 60));
  if (left > 0) push(left);
  return out;
}
