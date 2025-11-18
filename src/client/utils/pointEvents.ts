import type React from 'react';

/**
 * Triggers native DOM cancel events based on browser capabilities.
 * Priority: PointerEvent > TouchEvent > MouseEvent
 */
export function dispatchNativeCancelEvents(el: EventTarget | null): void {
    el?.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }));
    el?.dispatchEvent(new PointerEvent('pointerout', { bubbles: true }));
}

export function inBounds<T>(e: PointerEvent | React.PointerEvent<T>): boolean {
    const rect = (e.currentTarget as unknown as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}
