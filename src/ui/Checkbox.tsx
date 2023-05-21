import CheckIcon from '@icons/Check.svg';
import CheckIndeterminateIcon from '@icons/CheckIndeterminate.svg';
import useForwardedRef from '@ui/hooks/useForwardedRef';
import { type CommonInputProps, type InputColor, type InputSize, type InputVariant } from '@ui/Input';
import classNames from 'classnames';
import React, {
    type ChangeEvent,
    type ForwardedRef,
    forwardRef,
    type JSX,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import './Checkbox.less';

export interface CheckboxProps extends CommonInputProps<HTMLInputElement> {
    variant?: InputVariant;
    color?: InputColor;
    size?: InputSize;
    indeterminate?: boolean;
}

export default memo(
    forwardRef(function Checkbox(
        {
            id,
            children,
            color = 'neutral',
            variant = 'outlined',
            size = 'small',
            checked,
            disabled,
            indeterminate,
            className,
            onChange,
            ...props
        }: CheckboxProps,
        forwardedRef: ForwardedRef<HTMLInputElement>
    ): JSX.Element {
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
                if (ref.current) {
                    setIndeterminate(ref.current.indeterminate);
                    setChecked(ref.current.checked);
                }
                onChange?.(e);
            },
            [onChange, ref]
        );

        const icon = useMemo(() => {
            return isIndeterminate ? <CheckIndeterminateIcon /> : <CheckIcon />;
        }, [isIndeterminate]);

        return (
            <label
                htmlFor={id}
                className={classNames('Checkbox', `color-${color}`, `variant-${variant}`, `size-${size}`, className)}
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
                <span className="checkbox">{icon}</span>
                <span className="label">{children}</span>
            </label>
        );
    })
);
