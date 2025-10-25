import React, {
    isValidElement,
    type ButtonHTMLAttributes,
    type JSX,
    type ReactElement,
    type ReactNode,
    type RefAttributes,
} from 'react';

import { Button as Action, ActionIcon } from '@mantine/core';
import cs from 'classnames';

import {
    type ElementColor,
    type ElementSize,
    type ElementSpacing,
    type ElementState,
    type ElementVariant,
} from '@ui/Element';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { type CommonInputProps } from '@ui/Input';

import cx from './Button.pcss';

export type ButtonAlign = 'single' | 'start' | 'center' | 'end';

export interface ButtonProps<T extends HTMLElement = HTMLButtonElement>
    extends ButtonHTMLAttributes<T>,
        RefAttributes<T> {
    variant?: ElementVariant;
    color?: ElementColor;
    size?: ElementSize;
    spacing?: ElementSpacing;
    state?: ElementState;
    align?: ButtonAlign;
    fullWidth?: boolean;
    fullHeight?: boolean;
    startDecoratorSpacing?: ElementSpacing;
    startDecorator?: ReactNode;
    endDecoratorSpacing?: ElementSpacing;
    endDecorator?: ReactNode;
}

// TODO - add support for `button` children
export function Button({
    ref: forwardedRef,
    className,
    color = 'gray',
    variant = 'solid',
    size = 'medium',
    spacing = 'small',
    state = 'default',
    align = 'single',
    disabled,
    fullWidth,
    fullHeight,
    startDecorator,
    startDecoratorSpacing = 'small',
    endDecorator,
    endDecoratorSpacing = 'small',
    children,
    ...props
}: ButtonProps): JSX.Element {
    const ref = useForwardedRef(forwardedRef);
    const isButtonWrapped = isValidElement<HTMLButtonElement>(children) && children.type === 'button';
    if (isButtonWrapped) {
        // eslint-disable-next-line no-console
        console.warn('Button component cannot be used with a button child.');
    }
    return (
        <button
            ref={ref}
            className={cs(
                {
                    [`ui-color-${color}`]: color,
                    [`ui-variant-${variant}`]: variant,
                },
                cx('Button', {
                    [`size-${size}`]: size,
                    [`spacing-${spacing}`]: spacing,
                    [`state-${state}`]: state,
                    [`align-${align}`]: align,
                    'full-width': fullWidth,
                    'full-height': fullHeight,
                }),
                className
            )}
            disabled={disabled}
            aria-disabled={disabled}
            {...props}
        >
            {startDecorator && (
                <div className={cx('start-decorator', { [`spacing-${startDecoratorSpacing}`]: startDecoratorSpacing })}>
                    {startDecorator}
                </div>
            )}
            {isButtonWrapped ? <>{(children as ReactElement<HTMLButtonElement>).props.children}</> : children}
            {endDecorator && (
                <div className={cx('end-decorator', { [`spacing-${endDecoratorSpacing}`]: endDecoratorSpacing })}>
                    {endDecorator}
                </div>
            )}
        </button>
    );
}

export type ButtonGroupAlign = 'full-width' | 'start' | 'center' | 'end';

export interface ButtonGroupProps<T extends HTMLElement = HTMLDivElement> extends CommonInputProps<T> {
    align?: ButtonGroupAlign;
    spacing?: ElementSpacing;
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
            className={cs(
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

export const isButtonElement = (element: ReactNode): element is ReactElement<ButtonProps> =>
    isValidElement(element) &&
    (element.type === Button || element.type === IconButton || element.type === Action || element.type === ActionIcon);
