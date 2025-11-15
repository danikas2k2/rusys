import type React from 'react';

export interface PointerEvents<T = HTMLElement> {
    onPointerDown?: React.PointerEventHandler<T>;
    onPointerMove?: React.PointerEventHandler<T>;
    onPointerUp?: React.PointerEventHandler<T>;
    onPointerLeave?: React.PointerEventHandler<T>;
    onPointerOut?: React.PointerEventHandler<T>;
    onPointerCancel?: React.PointerEventHandler<T>;
}

export interface PointEventHandlers<T = HTMLElement, E = PointerEvents<T>> {
    onStart?: (e: E) => void;
    onMove?: (e: E) => void;
    onEnd?: (e: E) => void;
    onCancel?: () => void;
    onLeave?: () => void;
}

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
