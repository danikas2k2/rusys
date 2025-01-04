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
import React, { type ButtonHTMLAttributes, type JSX, type ReactNode, type RefAttributes } from 'react';
import cx from './Button.less';

export type ButtonAlign = 'start' | 'center' | 'end' | 'single';

export interface ButtonProps<T extends HTMLElement = HTMLButtonElement>
    extends ButtonHTMLAttributes<T>,
        RefAttributes<T> {
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

export function Button({
    ref: forwardedRef,
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
    startDecorator,
    endDecorator,
    children,
    ...props
}: ButtonProps): JSX.Element {
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
}

export interface ButtonGroupProps<T extends HTMLElement = HTMLDivElement> extends CommonInputProps<T> {
    align?: 'start' | 'center' | 'end' | 'full-width';
    spacing?: InputSpacing;
    combined?: boolean;
    fullHeight?: boolean;
}

export function ButtonGroup({
    className,
    align,
    spacing,
    combined = true,
    fullHeight,
    ...props
}: ButtonGroupProps): JSX.Element {
    return (
        <div
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
}

export function IconButton({
    size = 'large',
    variant = 'plain',
    spacing = 'none',
    ...props
}: ButtonProps): JSX.Element {
    return <Button size={size} variant={variant} spacing={spacing} {...props} />;
}
