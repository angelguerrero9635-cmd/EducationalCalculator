import { useEffect, useRef, type RefObject } from 'react';
import { Platform, type View } from 'react-native';

/**
 * A drag on the web through pointer events with pointer capture, not the responder system.
 * The browser's touch → mouse emulation after a lift (a mousedown at the old spot, which
 * the responder system takes as a new press once a touch has moved) can't reach a captured
 * pointer, so a value stays where the finger left it. `start` and `move` get the pointer's
 * client position; `end` fires on lift or cancel. On native the hook does nothing: the
 * responder props on the same view do the work there.
 */
export function useWebPointerDrag(
  ref: RefObject<View | null>,
  handlers: {
    start: (x: number, y: number, el: HTMLElement) => void;
    move: (x: number, y: number, el: HTMLElement) => void;
    end?: () => void;
  },
) {
  // The latest handlers, so the listeners (attached once) never call a stale closure.
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    const el = ref.current as unknown as HTMLElement | null;
    if (!el || typeof el.addEventListener !== 'function') return undefined;
    let active: number | null = null;
    const down = (e: PointerEvent) => {
      if (active !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
      active = e.pointerId;
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
      latest.current.start(e.clientX, e.clientY, el);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== active) return;
      e.preventDefault();
      latest.current.move(e.clientX, e.clientY, el);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== active) return;
      active = null;
      el.releasePointerCapture?.(e.pointerId);
      latest.current.end?.();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [ref]);
}

/** True where the responder props do the drag (native); on the web the pointer listeners do. */
export const RESPONDER = Platform.OS !== 'web';
