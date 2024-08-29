import CancelIcon from '@icons/Cancel.svg';
import { IconButton } from '@ui/Button';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { uniqueId } from '@ui/utils/uniqueId';
import React, {
    type ForwardedRef,
    forwardRef,
    type InputHTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type MouseEventHandler,
    useCallback,
} from 'react';
import cx from './Input.less';

export type InputColor = 'neutral' | 'primary' | 'secondary' | 'positive' | 'warning' | 'negative';

export type InputVariant = 'solid' | 'soft' | 'outlined' | 'plain';

export type InputSize = 'small' | 'medium' | 'large';

export type InputSpacing = 'small' | 'medium' | 'large' | 'half' | 'none';

export type InputMode = 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

export type InputState = 'default' | 'active' | 'hover' | 'focus' | 'disabled';

export type CommonInputProps<T extends HTMLElement> = Omit<InputHTMLAttributes<T>, 'type' | 'size'>;

export interface InputProps extends Omit<CommonInputProps<HTMLInputElement>, 'inputMode' | 'children'> {
    variant?: InputVariant;
    color?: InputColor;
    size?: InputSize;
    spacing?: InputSpacing;
    mode?: InputMode;
    state?: InputState;
    fullWidth?: boolean;
    fullHeight?: boolean;
    startDecorator?: React.ReactNode;
    endDecorator?: React.ReactNode;
    label?: string;
    invalid?: boolean;
    error?: string;
    clearable?: boolean;
    onClear?: MouseEventHandler<HTMLButtonElement>;
}

// TODO add readOnly support
// TODO add clearable support
export const Input = forwardRef(function Input(
    {
        id = uniqueId('input'),
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
        color = invalid ? 'negative' : 'neutral',
        value = '',
        clearable,
        onClear,
        startDecorator,
        endDecorator,
        className,
        onInput,
        onKeyDown,
        onKeyUp,
        ...props
    }: InputProps,
    forwardedRef: ForwardedRef<HTMLInputElement>
) {
    const ref = useForwardedRef(forwardedRef);

    function setCaretPosition(element: HTMLInputElement, position: number): void {
        element.focus();
        element.setSelectionRange?.(position, position);
    }

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

    const handleClear = (e: MouseEvent<HTMLButtonElement>) => onClear?.(e);

    return (
        <>
            <div
                className={cx(
                    'Input',
                    'Element',
                    `color-${color}`,
                    `variant-${variant}`,
                    `size-${size}`,
                    `spacing-${spacing}`,
                    `state-${state}`,
                    {
                        'full-width': fullWidth,
                        'full-height': fullHeight,
                        'with-label': !!label,
                        'with-error': invalid,
                    },
                    className
                )}
            >
                {label && (value || placeholder !== label) && <label htmlFor={id}>{label}</label>}
                <div className={cx('content')}>
                    {startDecorator && (
                        <div className={cx('start-decorator', `type-${getDecoratorType(startDecorator)}`)}>
                            {startDecorator}
                        </div>
                    )}
                    <input
                        id={id}
                        type="text"
                        inputMode={mode}
                        ref={ref}
                        placeholder={placeholder}
                        disabled={disabled}
                        aria-disabled={disabled}
                        value={value}
                        onKeyDown={handleKey}
                        onKeyUp={handleKey}
                        onInput={onInput}
                        {...props}
                    />
                    {clearable && (
                        <IconButton
                            className={cx('clear')}
                            variant="plain"
                            color={color}
                            spacing="none"
                            fullHeight
                            onClick={handleClear}
                        >
                            <CancelIcon />
                        </IconButton>
                    )}
                    {endDecorator && (
                        <div className={cx('end-decorator', `type-${getDecoratorType(endDecorator)}`)}>
                            {endDecorator}
                        </div>
                    )}
                </div>
            </div>
            {error && (
                <div role="alert" className={cx('error')}>
                    {error}
                </div>
            )}
        </>
    );
});

function getDecoratorType(decorator: React.ReactNode): 'text' | 'node' {
    const type = typeof decorator;
    if (type === 'string' || type === 'number' || type === 'boolean') {
        return 'text';
    }
    return 'node';
}
