import { type InputColor, type InputSize, type InputSpacing, type InputVariant } from '@ui/Input';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { type ButtonHTMLAttributes, type ForwardedRef, forwardRef, memo } from 'react';
import useForwardedRef from '~/ui/hooks/useForwardedRef';
import './Button.less';

export interface ButtonProps<T extends HTMLElement = HTMLButtonElement> extends ButtonHTMLAttributes<T> {
    variant?: InputVariant;
    color?: InputColor;
    size?: InputSize;
    spacing?: InputSpacing;
    fullWidth?: boolean;
    fullHeight?: boolean;
}

export default memo(
    forwardRef(function Button(
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
                className={classNames(
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
    }),
    isEqual
);
