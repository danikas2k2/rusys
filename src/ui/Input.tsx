import React, {
    useCallback,
    useEffect,
    useId,
    useState,
    type FormEvent,
    type InputHTMLAttributes,
    type JSX,
    type KeyboardEvent,
    type MouseEvent,
    type MouseEventHandler,
    type ReactNode,
    type RefAttributes,
} from 'react';
import CancelIcon from '@assets/cancel.svg';
import { IconButton } from '@ui/Button';
import {
    type ElementColor,
    type ElementSize,
    type ElementSpacing,
    type ElementState,
    type ElementVariant,
} from '@ui/Element';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { getDecoratorType } from '@ui/utils/getDecoratorType';
import { setCaretPosition } from '@ui/utils/setCaretPosition';
import { usePreviousValue } from '~/common/hooks/usePreviousValue';
import cs from 'classnames';
import cx from './Input.pcss';

export type InputMode = 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

export type CommonInputProps<T extends HTMLElement> = Omit<InputHTMLAttributes<T>, 'size'> & RefAttributes<T>;

export interface InputProps extends Omit<CommonInputProps<HTMLInputElement>, 'inputMode' | 'children'> {
    variant?: ElementVariant;
    color?: ElementColor;
    placeholderColor?: ElementColor;
    size?: ElementSize;
    spacing?: ElementSpacing;
    mode?: InputMode;
    state?: ElementState;
    fullWidth?: boolean;
    fullHeight?: boolean;
    startDecorator?: ReactNode;
    endDecorator?: ReactNode;
    inputDecorator?: (children?: ReactNode) => JSX.Element;
    contentDecorator?: (children?: ReactNode) => JSX.Element;
    label?: string;
    invalid?: boolean;
    error?: string;
    clearable?: boolean;
    // TODO call onChange when value is cleared, then deprecate onClear event
    onClear?: MouseEventHandler<HTMLButtonElement>;
}

// TODO add translation context and translate clear button label
export function Input({
    ref: forwardedRef,
    id: initialId,
    variant = 'outlined',
    size = 'medium',
    spacing = 'small',
    mode = 'text',
    state = 'default',
    disabled = false,
    fullWidth,
    fullHeight,
    label,
    placeholder = label,
    error,
    invalid = !!error,
    color = invalid ? 'red' : 'gray',
    placeholderColor,
    value,
    defaultValue,
    clearable = false,
    onClear,
    startDecorator,
    endDecorator,
    inputDecorator,
    contentDecorator,
    className,
    onInput,
    onKeyDown,
    onKeyUp,
    ...props
}: InputProps) {
    const ref = useForwardedRef(forwardedRef);
    const controlled = value != null;

    const handleKey = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Home' || e.key === 'End' || e.key === 'PageUp' || e.key === 'PageDown') {
                e.preventDefault();
                e.stopPropagation();
                const t = e.currentTarget ?? (e.target as HTMLInputElement);
                if (e.key === 'Home' || e.key === 'PageUp') {
                    setCaretPosition(t, 0);
                    if (t.scrollLeft !== 0) {
                        t.scrollLeft = 0;
                    }
                } else if (e.key === 'End' || e.key === 'PageDown') {
                    setCaretPosition(t, t.value.length);
                    if (t.scrollWidth > t.clientWidth) {
                        t.scrollLeft = t.scrollWidth - t.clientWidth;
                    }
                }
            }

            if (e.type === 'keydown') {
                onKeyDown?.(e);
            } else if (e.type === 'keyup') {
                onKeyUp?.(e);
            }
        },
        [onKeyDown, onKeyUp]
    );

    const handleClear = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            if (!controlled && ref.current) {
                ref.current.value = '';
            }
            onClear?.(e);
        },
        [controlled, onClear, ref]
    );

    const hasValue = !!(value || defaultValue);
    const [clear, setClear] = useState<boolean>(clearable && hasValue);
    useEffect(() => {
        setClear(clearable && hasValue);
    }, [clearable, hasValue]);
    const prevValue = usePreviousValue(value) ?? value;
    useEffect(() => {
        if (clearable && value !== prevValue) {
            setClear(!!value);
        }
    }, [clearable, prevValue, value]);

    const handleInput = useCallback(
        (e: FormEvent<HTMLInputElement>) => {
            if (clearable) {
                setClear(!!e.currentTarget.value);
            }
            onInput?.(e);
        },
        [clearable, onInput]
    );

    const id = useId();
    const inputId = initialId ?? id;

    const input = (
        <>
            <input
                id={inputId}
                type="text"
                inputMode={mode}
                ref={ref}
                aria-label={label}
                placeholder={placeholder}
                disabled={disabled}
                aria-disabled={disabled}
                value={value}
                defaultValue={defaultValue}
                onKeyDown={handleKey}
                onKeyUp={handleKey}
                onInput={handleInput}
                {...props}
            />
            {clear && (
                <IconButton
                    className={cx('clear')}
                    variant="plain"
                    color={color}
                    spacing="none"
                    fullHeight
                    onClick={handleClear}
                    aria-label="clear"
                    aria-controls={inputId}
                >
                    <CancelIcon />
                </IconButton>
            )}
        </>
    );

    const content = (
        <div className={cx('content')}>
            {startDecorator && (
                <div className={cx('start-decorator', `type-${getDecoratorType(startDecorator)}`)}>
                    {startDecorator}
                </div>
            )}
            {inputDecorator ? inputDecorator(input) : input}
            {endDecorator && (
                <div className={cx('end-decorator', `type-${getDecoratorType(endDecorator)}`)}>{endDecorator}</div>
            )}
        </div>
    );

    return (
        <>
            <div
                role="figure"
                aria-labelledby={inputId}
                className={cs(
                    {
                        [`ui-color-${color}`]: color,
                        [`ui-variant-${variant}`]: variant,
                    },
                    cx('Input', `size-${size}`, `spacing-${spacing}`, `state-${state}`, {
                        [`placeholder-color-${placeholderColor}`]: placeholderColor,
                        'full-width': fullWidth,
                        'full-height': fullHeight,
                        'with-label': !!label,
                        'with-error': invalid,
                    }),
                    className
                )}
            >
                {label && (value || placeholder !== label) && <label htmlFor={inputId}>{label}</label>}
                {contentDecorator ? contentDecorator(content) : content}
            </div>
            {error && (
                <div role="alert" className={cx('error')}>
                    {error}
                </div>
            )}
        </>
    );
}
