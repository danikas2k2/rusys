import React, { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import CheckIndeterminateIcon from '@assets/check-indeterminate.svg';
import CheckIcon from '@assets/check.svg';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { type CommonInputProps, type InputColor, type InputSize, type InputVariant } from '@ui/Input';
import { uniqueId } from '@ui/utils/uniqueId';
import cx from './Checkbox.less';

export interface CheckboxProps extends CommonInputProps<HTMLInputElement> {
    variant?: InputVariant;
    color?: InputColor;
    size?: InputSize;
    indeterminate?: boolean;
}

export function Checkbox({
    ref: forwardedRef,
    id = uniqueId('checkbox'),
    color = 'neutral',
    variant = 'outlined',
    size = 'medium',
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
            ref.current.indeterminate = !!indeterminate;
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
            className={cx('Checkbox', `color-${color}`, `variant-${variant}`, `size-${size}`, className)}
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
