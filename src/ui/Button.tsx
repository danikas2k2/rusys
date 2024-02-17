import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import {
    type CommonInputProps,
    type InputColor,
    type InputSize,
    type InputSpacing,
    type InputVariant,
} from '@ui/Input';
import React, { type ButtonHTMLAttributes, type ForwardedRef, forwardRef } from 'react';
import cx from './Button.less';

export interface ButtonProps<T extends HTMLElement = HTMLButtonElement> extends ButtonHTMLAttributes<T> {
    variant?: InputVariant;
    color?: InputColor;
    size?: InputSize;
    spacing?: InputSpacing;
    fullWidth?: boolean;
    fullHeight?: boolean;
}

export const Button = forwardRef(function Button(
    {
        className,
        color = 'neutral',
        variant = 'solid',
        size = 'medium',
        spacing = 'small',
        disabled,
        fullWidth,
        fullHeight,
        // autoFocus,
        ...props
    }: ButtonProps,
    forwardedRef: ForwardedRef<HTMLButtonElement>
) {
    const ref = useForwardedRef(forwardedRef);
    return (
        <button
            ref={ref}
            className={cx(
                'Button',
                `color-${color}`,
                `variant-${variant}`,
                `size-${size}`,
                `spacing-${spacing}`,
                { 'full-width': fullWidth, 'full-height': fullHeight },
                className
            )}
            disabled={disabled}
            aria-disabled={disabled}
            {...props}
        />
    );
});

export const ButtonGroup = forwardRef(function ButtonGroup(
    { className, ...props }: CommonInputProps<HTMLDivElement>,
    forwardedRef: ForwardedRef<HTMLDivElement>
) {
    const ref = useForwardedRef(forwardedRef);
    return <div ref={ref} className={cx('ButtonGroup', className)} {...props} />;
});
