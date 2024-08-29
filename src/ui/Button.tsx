import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import {
    type CommonInputProps,
    type InputColor,
    type InputSize,
    type InputSpacing,
    type InputState,
    type InputVariant,
} from '@ui/Input';
import classNames from 'classnames';
import React, { type ButtonHTMLAttributes, type ForwardedRef, forwardRef, type ReactNode } from 'react';
import cx from './Button.less';

export type ButtonAlign = 'start' | 'center' | 'end' | 'single';

export interface ButtonProps<T extends HTMLElement = HTMLButtonElement> extends ButtonHTMLAttributes<T> {
    variant?: InputVariant;
    color?: InputColor;
    size?: InputSize;
    spacing?: InputSpacing;
    state?: InputState;
    align?: ButtonAlign;
    fullWidth?: boolean;
    fullHeight?: boolean;
    startDecorator?: ReactNode;
    endDecorator?: ReactNode;
}

export const Button = forwardRef(function Button(
    {
        className,
        color = 'neutral',
        variant = 'solid',
        size = 'medium',
        spacing = 'small',
        state = 'default',
        align = 'single',
        disabled,
        fullWidth,
        fullHeight,
        // autoFocus,
        startDecorator,
        endDecorator,
        children,
        ...props
    }: ButtonProps,
    forwardedRef: ForwardedRef<HTMLButtonElement>
) {
    const ref = useForwardedRef(forwardedRef);
    return (
        <button
            ref={ref}
            className={classNames(
                className,
                cx(
                    'Button',
                    `variant-${variant}`,
                    `color-${color}`,
                    `size-${size}`,
                    `spacing-${spacing}`,
                    `state-${state}`,
                    `align-${align}`,
                    {
                        'full-width': fullWidth,
                        'full-height': fullHeight,
                    }
                )
            )}
            disabled={disabled}
            aria-disabled={disabled}
            {...props}
        >
            {startDecorator && <div className={cx('start-decorator')}>{startDecorator}</div>}
            {children}
            {endDecorator && <div className={cx('end-decorator')}>{endDecorator}</div>}
        </button>
    );
});

export interface ButtonGroupProps<T extends HTMLElement = HTMLDivElement> extends CommonInputProps<T> {
    align?: 'start' | 'center' | 'end' | 'full-width';
    spacing?: InputSpacing;
    combined?: boolean;
    fullHeight?: boolean;
}

export const ButtonGroup = forwardRef(function ButtonGroup(
    { className, align, spacing, combined = true, fullHeight, ...props }: ButtonGroupProps,
    forwardedRef: ForwardedRef<HTMLDivElement>
) {
    const ref = useForwardedRef(forwardedRef);
    return (
        <div
            ref={ref}
            className={classNames(
                cx('ButtonGroup', {
                    [`align-${align}`]: align,
                    [`spacing-${spacing}`]: spacing,
                    'full-height': fullHeight,
                    combined,
                }),
                className
            )}
            {...props}
        />
    );
});

export const IconButton = forwardRef(function IconButton(
    { size = 'large', variant = 'plain', spacing = 'none', ...props }: ButtonProps,
    forwardedRef: ForwardedRef<HTMLButtonElement>
) {
    return <Button ref={useForwardedRef(forwardedRef)} size={size} variant={variant} spacing={spacing} {...props} />;
});
