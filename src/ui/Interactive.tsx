import { isEqual } from 'lodash';
import {
    createElement,
    type ForwardedRef,
    forwardRef,
    type HTMLAttributes,
    type KeyboardEvent,
    memo,
    type MouseEvent,
    type ReactNode,
    useCallback,
} from 'react';

interface InteractiveProps<T extends HTMLElement> extends HTMLAttributes<T> {
    tag?: string;
    children?: ReactNode;
}

export default memo(
    forwardRef(function Interactive(
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
                if (e.key === 'Enter' || e.key === 'Space') {
                    onClick?.(e as unknown as MouseEvent<HTMLElement>);
                } else {
                    onKeyDown?.(e);
                }
            },
            [onClick, onKeyDown]
        );
        return createElement(tag, { ...props, ref, role, tabIndex, onClick, onKeyDown: handleKeyDown }, children);
    }),
    isEqual
);
