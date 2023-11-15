import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, {
    type FormEvent,
    type ForwardedRef,
    forwardRef,
    type InputHTMLAttributes,
    type KeyboardEvent,
    memo,
    useCallback,
    useEffect,
    useState,
} from 'react';
import './Input.less';

export type InputColor = 'neutral' | 'primary' | 'secondary' | 'positive' | 'warning' | 'negative';

export type InputVariant = 'solid' | 'soft' | 'outlined' | 'plain';

export type InputSize = 'small' | 'medium' | 'large';

export type InputSpacing = 'small' | 'medium' | 'large' | 'half' | 'none';

export type InputMode = 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

export type CommonInputProps<T extends HTMLElement> = Omit<InputHTMLAttributes<T>, 'type' | 'size'>;

export interface InputProps extends Omit<CommonInputProps<HTMLInputElement>, 'inputMode' | 'children'> {
    variant?: InputVariant;
    color?: InputColor;
    size?: InputSize;
    mode?: InputMode;
    fullWidth?: boolean;
    fullHeight?: boolean;
    startDecorator?: React.ReactNode;
    endDecorator?: React.ReactNode;
}

export default memo(
    forwardRef(function Input(
        {
            color = 'neutral',
            variant = 'outlined',
            size = 'medium',
            mode = 'text',
            disabled = false,
            fullWidth,
            fullHeight,
            placeholder,
            value: initialValue = '',
            startDecorator,
            endDecorator,
            className,
            onKeyDown,
            onKeyUp,
            ...props
        }: InputProps,
        forwardedRef: ForwardedRef<HTMLInputElement>
    ) {
        const ref = useForwardedRef(forwardedRef);

        function setCaretPosition(element: HTMLInputElement, position: number): void {
            if (element.setSelectionRange) {
                // TODO cleanup
                // if (document.activeElement !== element) {
                element.focus();
                // }
                element.setSelectionRange(position, position);
                // element.scrollIntoView();
            } /*else if (element.createTextRange) { // IE
                const range = element.createTextRange();
                range.collapse(true);
                range.moveEnd('character', position);
                range.moveStart('character', position);
                range.select();
            }*/
        }

        const onKey = useCallback(
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

        const [value, setValue] = useState(initialValue);
        useEffect(() => {
            setValue(initialValue);
        }, [initialValue]);

        const onInput = useCallback((e: FormEvent<HTMLInputElement>) => {
            e.stopPropagation();
            setValue(e.currentTarget.value);
        }, []);

        return (
            <div
                className={classNames(
                    'Input',
                    `color-${color}`,
                    `variant-${variant}`,
                    `size-${size}`,
                    { 'full-width': fullWidth, 'full-height': fullHeight },
                    className
                )}
            >
                {startDecorator && (
                    <div className={classNames('start-decorator', `type-${getDecoratorType(startDecorator)}`)}>
                        {startDecorator}
                    </div>
                )}
                <input
                    type="text"
                    inputMode={mode}
                    ref={ref}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-disabled={disabled}
                    value={value}
                    onInput={onInput}
                    onKeyDown={onKey}
                    onKeyUp={onKey}
                    {...props}
                />
                {endDecorator && (
                    <div className={classNames('end-decorator', `type-${getDecoratorType(endDecorator)}`)}>
                        {endDecorator}
                    </div>
                )}
            </div>
        );
    }),
    isEqual
);

function getDecoratorType(decorator: React.ReactNode): 'simple' | 'composite' {
    const type = typeof decorator;
    if (type === 'string' || type === 'number' || type === 'boolean') {
        return 'simple';
    }
    return 'composite';
}
