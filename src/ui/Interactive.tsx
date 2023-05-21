import { createElement, type HTMLAttributes, type JSX, type ReactNode } from 'react';
import { onActionKey } from '~/utils/events';

interface InteractiveProps<T extends HTMLElement> extends HTMLAttributes<T> {
    tag?: string;
    children?: ReactNode;
}

export default function Interactive({
    tag = 'div',
    role = 'button',
    tabIndex = -1,
    onClick,
    onKeyDown,
    children,
    ...props
}: InteractiveProps<HTMLElement>): JSX.Element {
    return createElement(
        tag,
        { ...props, role, tabIndex, onClick, onKeyDown: onActionKey(onClick, onKeyDown) },
        children
    );
}
