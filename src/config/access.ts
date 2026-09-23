/**
 * Content access gate. Wireframe stub: everything is unlocked and there is no purchase logic.
 *
 * Later phases will decide access here (e.g. a subscription with a 7-day free trial). Screens
 * already call isLocked() and send locked content to the /paywall modal, so only this file
 * needs to change.
 */
export function isLocked(_nodeId: string): boolean {
  return false;
}
