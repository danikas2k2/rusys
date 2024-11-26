import {
    createElement,
    type ForwardedRef,
    forwardRef,
    type HTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    useCallback,
} from 'react';

interface InteractiveProps<T extends HTMLElement> extends HTMLAttributes<T> {
    tag?: string;
    children?: ReactNode;
}

export const Interactive = forwardRef(function Interactive<T extends HTMLElement>(
    { tag = 'div', role = 'button', tabIndex = -1, onClick, onKeyDown, children, ...props }: InteractiveProps<T>,
    ref: ForwardedRef<T>
) {
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
    return createElement(tag, { ...props, ref, role, tabIndex, onClick, onKeyDown: handleKeyDown }, children);
});
