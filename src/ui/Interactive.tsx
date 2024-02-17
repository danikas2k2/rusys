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

export const Interactive = forwardRef(function Interactive(
    {
        tag = 'div',
        role = 'button',
        tabIndex = -1,
        onClick,
        onKeyDown,
        children,
        ...props
    }: InteractiveProps<HTMLElement>,
    ref: ForwardedRef<HTMLDivElement>
) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLElement>) => {
            const key = e.key.toLowerCase();
            if (key === 'enter' || key === 'space' || key === ' ') {
                onClick?.(e as unknown as MouseEvent<HTMLElement>);
            } else {
                onKeyDown?.(e);
            }
        },
        [onClick, onKeyDown]
    );
    return createElement(tag, { ...props, ref, role, tabIndex, onClick, onKeyDown: handleKeyDown }, children);
});
