import React, { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import CheckIndeterminateIcon from '@assets/check-indeterminate.svg';
import CheckIcon from '@assets/check.svg';
import {
    type ElementColor,
    type ElementSize,
    type ElementSpacing,
    type ElementState,
    type ElementVariant,
} from '@ui/Element';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { type CommonInputProps } from '@ui/Input';
import { uniqueId } from '@ui/utils/uniqueId';
import cs from 'classnames';
import cx from './Checkbox.pcss';

export interface CheckboxProps extends CommonInputProps<HTMLInputElement> {
    variant?: ElementVariant;
    color?: ElementColor;
    size?: ElementSize;
    spacing?: ElementSpacing;
    state?: ElementState;
    indeterminate?: boolean;
}

export function Checkbox({
    ref: forwardedRef,
    id = uniqueId('checkbox'),
    color = 'gray',
    variant = 'outlined',
    size = 'medium',
    state = 'default',
    checked = false,
    disabled = false,
    indeterminate = false,
    className,
    onChange,
    children,
    ...props
}: CheckboxProps) {
    const ref = useForwardedRef(forwardedRef);

    const [isIndeterminate, setIndeterminate] = useState(indeterminate);
    useEffect(() => {
        setIndeterminate(indeterminate);
    }, [indeterminate]);
    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [indeterminate, ref]);

    const [isChecked, setChecked] = useState(checked);
    useEffect(() => {
        setChecked(checked);
    }, [checked]);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>): void => {
            if (!disabled) {
                if (ref.current) {
                    setIndeterminate(ref.current.indeterminate);
                    setChecked(ref.current.checked);
                }
                onChange?.(e);
            }
        },
        [disabled, onChange, ref]
    );

    const icon = useMemo(() => {
        return isIndeterminate ? <CheckIndeterminateIcon /> : <CheckIcon />;
    }, [isIndeterminate]);

    return (
        <label
            htmlFor={id}
            className={cs(
                {
                    [`ui-color-${color}`]: color,
                    [`ui-variant-${variant}`]: variant,
                },
                cx('Checkbox', {
                    [`size-${size}`]: size,
                    [`state-${state}`]: state,
                }),
                className
            )}
        >
            <input
                ref={ref}
                id={id}
                type="checkbox"
                checked={isChecked}
                aria-checked={isChecked}
                disabled={disabled}
                aria-disabled={disabled}
                onChange={handleChange}
                {...props}
            />
            <span className={cx('checkbox')}>{icon}</span>
            <span className={cx('label')}>{children}</span>
        </label>
    );
}
