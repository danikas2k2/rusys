import type React from 'react';

export type PointEvent<T = HTMLElement> = React.PointerEvent<T> | React.TouchEvent<T> | React.MouseEvent<T>;

export interface PointerEvents<T = HTMLElement> {
    onPointerDown?: React.PointerEventHandler<T>;
    onPointerMove?: React.PointerEventHandler<T>;
    onPointerUp?: React.PointerEventHandler<T>;
    onPointerLeave?: React.PointerEventHandler<T>;
    onPointerOut?: React.PointerEventHandler<T>;
    onPointerCancel?: React.PointerEventHandler<T>;
}

export interface TouchEvents<T = HTMLElement> {
    onTouchStart?: React.TouchEventHandler<T>;
    onTouchEnd?: React.TouchEventHandler<T>;
    onTouchMove?: React.TouchEventHandler<T>;
    onTouchCancel?: React.TouchEventHandler<T>;
}

export interface MouseEvents<T = HTMLElement> {
    onMouseDown?: React.MouseEventHandler<T>;
    onMouseUp?: React.MouseEventHandler<T>;
    onMouseMove?: React.MouseEventHandler<T>;
    onMouseLeave?: React.MouseEventHandler<T>;
    onMouseOut?: React.MouseEventHandler<T>;
}

export type PointEvents<T = HTMLElement> = PointerEvents<T> | TouchEvents<T> | MouseEvents<T>;

export interface PointEventHandlers<T = HTMLElement, E = PointEvent<T>> {
    onStart?: (e: E) => void;
    onMove?: (e: E) => void;
    onEnd?: (e: E) => void;
    onCancel?: () => void;
    onLeave?: () => void;
}

export type NativePointEventHandlers = PointEventHandlers<unknown, Event>;

export type NativeEventHandlers = Record<string, EventListener | (() => void) | undefined>;

/**
 * Selects appropriate pointer event handlers based on browser capabilities.
 * Priority: PointerEvent > TouchEvent > MouseEvent
 *
 * This ensures that only one type of pointer event is used at a time,
 * preventing conflicts when multiple event types are available.
 */
export function getPointEvents<T = HTMLElement>({
    onStart,
    onMove,
    onEnd,
    onCancel,
    onLeave = onCancel,
}: PointEventHandlers<T>): PointEvents<T> {
    // Prefer PointerEvent API (modern, unified API for all pointer types)
    if (hasPointerEvents()) {
        return {
            onPointerDown: onStart,
            onPointerMove: onMove,
            onPointerUp: onEnd,
            onPointerCancel: onCancel,
            onPointerLeave: onLeave,
            onPointerOut: onLeave,
        };
    }

    // Fallback to TouchEvent for touch-capable devices
    if (hasTouchEvents()) {
        return {
            onTouchStart: onStart,
            onTouchMove: onMove,
            onTouchEnd: onEnd,
            onTouchCancel: onCancel,
        };
    }

    // Final fallback to MouseEvent
    return {
        onMouseDown: onStart,
        onMouseMove: onMove,
        onMouseUp: onEnd,
        onMouseLeave: onLeave,
        onMouseOut: onLeave,
    };
}

/**
 * Returns native DOM event names and handlers based on browser capabilities.
 * Use with addEventListener/removeEventListener for direct DOM manipulation.
 * Priority: PointerEvent > TouchEvent > MouseEvent
 */
export function getNativePointEvents({
    onStart,
    onMove,
    onEnd,
    onCancel,
    onLeave = onCancel,
}: NativePointEventHandlers): NativeEventHandlers {
    // Prefer PointerEvent API (modern, unified API for all pointer types)
    if (hasPointerEvents()) {
        return {
            pointerdown: onStart,
            pointermove: onMove,
            pointerup: onEnd,
            pointercancel: onCancel,
            pointerleave: onLeave,
            pointerout: onLeave,
        };
    }

    // Fallback to TouchEvent for touch-capable devices
    if (hasTouchEvents()) {
        return {
            touchstart: onStart,
            touchend: onEnd,
            touchmove: onMove,
            touchcancel: onCancel,
        };
    }

    // Final fallback to MouseEvent
    return {
        mousedown: onStart,
        mouseup: onEnd,
        mousemove: onMove,
        mouseleave: onLeave,
        mouseout: onLeave,
    };
}

/**
 * Triggers native DOM cancel events based on browser capabilities.
 * Priority: PointerEvent > TouchEvent > MouseEvent
 */
export function dispatchNativeCancelEvents(el: EventTarget | null): void {
    // Prefer PointerEvent API (modern, unified API for all pointer types)
    if (hasPointerEvents()) {
        el?.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }));
        el?.dispatchEvent(new PointerEvent('pointerout', { bubbles: true }));
        return;
    }

    // Fallback to TouchEvent for touch-capable devices
    if (hasTouchEvents()) {
        el?.dispatchEvent(new TouchEvent('touchcancel', { bubbles: true }));
        return;
    }

    // Final fallback to MouseEvent
    el?.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
}

export function hasPointerEvents(): boolean {
    return !!window.PointerEvent;
}

export function hasTouchEvents(): boolean {
    return !!window.TouchEvent && navigator.maxTouchPoints > 0;
}

function getPointSource<T>(e: Event | PointEvent<T>): Partial<Pick<MouseEvent, 'clientX' | 'clientY'>> {
    return (
        (e as unknown as TouchEvent).touches?.[0] ??
        (e as unknown as TouchEvent).changedTouches?.[0] ??
        (e as unknown as MouseEvent)
    );
}

export function getPointX<T>(e: Event | PointEvent<T>): number {
    return getPointSource(e).clientX ?? 0;
}

export function getPointY<T>(e: Event | PointEvent<T>): number {
    return getPointSource(e).clientY ?? 0;
}

export function getPoint<T>(e: Event | PointEvent<T>): [number, number] {
    const src = getPointSource(e);
    return [src.clientX ?? 0, src.clientY ?? 0];
}

export function inBounds<T>(e: Event | PointEvent<T>): boolean {
    const rect = (e.currentTarget as unknown as HTMLElement).getBoundingClientRect();
    const [x, y] = getPoint(e);
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
