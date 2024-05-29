import { useUniqueId } from '@ui/hooks/useUniqueId';
import { Input, type InputProps } from '@ui/Input';
import React, { type ForwardedRef, forwardRef } from 'react';
import cx from './LabeledInput.less';

export interface LabeledInputProps extends InputProps {
    label?: string;
    error?: string;
}

export const LabeledInput = forwardRef(function LabeledInput(
    {
        id = useUniqueId('labeled-input'),
        label,
        placeholder = label,
        error,
        color = error ? 'negative' : undefined,
        value,
        ...props
    }: LabeledInputProps,
    forwardedRef: ForwardedRef<HTMLInputElement>
) {
    return (
        <div className={cx('LabeledInput')}>
            {value && <label htmlFor={id}>{label}</label>}
            <Input
                className={cx('Input')}
                id={id}
                ref={forwardedRef}
                placeholder={placeholder}
                value={value}
                color={color}
                {...props}
            />
            {error && (
                <div role="alert" className={cx('Error')}>
                    {error}
                </div>
            )}
        </div>
    );
});
