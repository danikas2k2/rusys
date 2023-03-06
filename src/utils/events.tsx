import type { EventHandler, KeyboardEvent, KeyboardEventHandler, SyntheticEvent } from 'react';

export function stopPropagation<T extends Element = Element, E extends SyntheticEvent<T> = SyntheticEvent<T>>(
    handler?: EventHandler<E>
): Exclude<typeof handler, undefined> {
    return (ev: E, ...args: []) => {
        if (ev?.bubbles) {
            ev?.stopPropagation();
        }
        handler?.(ev, ...args);
    };
}

/*export function stopImmediatePropagation<T extends Element = Element, E extends SyntheticEvent<T> = SyntheticEvent<T>>(
    handler?: EventHandler<E>
): Exclude<typeof handler, undefined> {
    return (ev: E, ...args: []) => {
        ev?.nativeEvent?.stopImmediatePropagation();
        handler?.(ev, ...args);
    };
}*/

export function preventDefault<T extends Element = Element, E extends SyntheticEvent<T> = SyntheticEvent<T>>(
    handler?: EventHandler<E>
): Exclude<typeof handler, undefined> {
    return (ev: E, ...args: []) => {
        if (!ev?.defaultPrevented && (typeof ev?.cancelable !== 'boolean' || ev?.cancelable)) {
            ev?.preventDefault();
        }
        handler?.(ev, ...args);
    };
}

export function onEnterKey<T extends Element>(
    actionHandler?: EventHandler<SyntheticEvent<T>>,
    fallbackHandler?: EventHandler<SyntheticEvent<T>>
): KeyboardEventHandler<T> {
    return (e: KeyboardEvent<T>, ...args: []) => {
        if (actionHandler && e.key === 'Enter') {
            actionHandler(e, ...args);
        } else {
            fallbackHandler?.(e, ...args);
        }
    };
}

export function onActionKey<T extends Element>(
    actionHandler?: EventHandler<SyntheticEvent<T>>,
    fallbackHandler?: EventHandler<SyntheticEvent<T>>
): KeyboardEventHandler<T> {
    return (e: KeyboardEvent<T>, ...args: []) => {
        if (actionHandler && (e.key === 'Enter' || e.key === 'Space')) {
            actionHandler(e, ...args);
        } else {
            fallbackHandler?.(e, ...args);
        }
    };
}

export function onEscapeKey<T extends Element>(
    escapeHandler?: EventHandler<SyntheticEvent<T>>,
    fallbackHandler?: EventHandler<SyntheticEvent<T>>
): KeyboardEventHandler<T> {
    return (e: KeyboardEvent<T>, ...args: []) => {
        if (escapeHandler && e.key === 'Escape') {
            escapeHandler(e, ...args);
        } else {
            fallbackHandler?.(e, ...args);
        }
    };
}
