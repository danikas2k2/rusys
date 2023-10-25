import useForwardedRef from '@ui/hooks/useForwardedRef';
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

export type InputColor = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'failure';

export type InputVariant = 'solid' | 'soft' | 'outlined' | 'plain';

export type InputSize = 'small' | 'medium' | 'large';

export type InputSpacing = 'small' | 'medium' | 'large' | 'half' | 'none';

export type InputMode = 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

export type CommonInputProps<T extends HTMLElement> = Omit<InputHTMLAttributes<T>, 'type' | 'size'>;

export interface InputProps extends CommonInputProps<HTMLInputElement> {
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
            children,
            color = 'neutral',
            variant = 'outlined',
            size = 'medium',
            mode = 'text',
            disabled,
            fullWidth,
            fullHeight,
            placeholder,
            value: initialValue,
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
            (ev: KeyboardEvent<HTMLInputElement>) => {
                if (ev.key === 'Home' || ev.key === 'End' || ev.key === 'PageUp' || ev.key === 'PageDown') {
                    ev.preventDefault();
                    ev.stopPropagation();
                    const el = ev.currentTarget ?? (ev.target as HTMLInputElement);
                    if (ev.key === 'Home' || ev.key === 'PageUp') {
                        setCaretPosition(el, 0);
                        if (el.scrollLeft !== 0) {
                            el.scrollLeft = 0;
                        }
                    } else if (ev.key === 'End' || ev.key === 'PageDown') {
                        setCaretPosition(el, el.value.length);
                        if (el.scrollWidth > el.clientWidth) {
                            el.scrollLeft = el.scrollWidth - el.clientWidth;
                        }
                    }
                }

                if (ev.type === 'keydown') {
                    onKeyDown?.(ev);
                } else if (ev.type === 'keyup') {
                    onKeyUp?.(ev);
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
                >
                    {children}
                </input>
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
