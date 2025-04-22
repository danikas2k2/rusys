import {
    createElement,
    useCallback,
    type HTMLAttributes,
    type JSX,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    type RefAttributes,
} from 'react';

interface InteractiveProps<T extends HTMLElement> extends HTMLAttributes<T>, RefAttributes<T> {
    tag?: string;
    children?: ReactNode;
}

export function Interactive<T extends HTMLElement>({
    tag = 'div',
    role = 'button',
    tabIndex = -1,
    onClick,
    onKeyDown,
    children,
    ...props
}: InteractiveProps<T>): JSX.Element {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLElement>) => {
            const key = e.key.toLowerCase();
            if (key === 'enter' || key === 'space' || key === ' ') {
                onClick?.(e as unknown as MouseEvent<T>);
            } else {
                onKeyDown?.(e as unknown as KeyboardEvent<T>);
            }
        },
        [onClick, onKeyDown]
    );
    return createElement(tag, { ...props, role, tabIndex, onClick, onKeyDown: handleKeyDown }, children);
}
