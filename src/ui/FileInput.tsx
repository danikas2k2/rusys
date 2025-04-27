import React, { useCallback, useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { FileDisplay } from '@ui/FileDisplay';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { type InputProps } from '@ui/Input';
import { getDecoratorType } from '@ui/utils/getDecoratorType';
import { setCaretPosition } from '@ui/utils/setCaretPosition';
import { uniqueId } from '@ui/utils/uniqueId';
import cx from './FileInput.less';

export type FileInputProps = Omit<InputProps, 'mode' | 'value'>;

// TODO add translation context and translate clear button label
export function FileInput({
    ref: forwardedRef,
    id = uniqueId('file'),
    variant = 'outlined',
    size = 'medium',
    spacing = 'small',
    state = 'default',
    disabled = false,
    fullWidth,
    fullHeight,
    label,
    placeholder = label,
    error,
    invalid = !!error,
    color = invalid ? 'negative' : 'neutral',
    placeholderColor,
    defaultValue,
    startDecorator,
    endDecorator,
    className,
    onInput,
    onKeyDown,
    onKeyUp,
    ...props
}: FileInputProps) {
    const ref = useForwardedRef(forwardedRef);

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

    const [files, setFiles] = useState<File[]>([]);
    useEffect(() => {
        setFiles([...(ref.current?.files ?? [])]);
    }, [ref]);

    const handleInput = useCallback(
        (e: FormEvent<HTMLInputElement>) => {
            setFiles([...(e.currentTarget.files ?? [])]);
            onInput?.(e);
        },
        [onInput]
    );

    useEffect(() => {
        console.info(files);
    }, [files]);

    return (
        <>
            <div
                role="figure"
                aria-labelledby={id}
                className={cx(
                    'File',
                    'Element',
                    `color-${color}`,
                    `variant-${variant}`,
                    `size-${size}`,
                    `spacing-${spacing}`,
                    `state-${state}`,
                    {
                        [`placeholder-color-${placeholderColor}`]: placeholderColor,
                        'full-width': fullWidth,
                        'full-height': fullHeight,
                        'with-label': !!label,
                        'with-error': invalid,
                    },
                    className
                )}
            >
                {label && placeholder !== label && <label htmlFor={id}>{label}</label>}
                <div className={cx('content')}>
                    {startDecorator && (
                        <div className={cx('start-decorator', `type-${getDecoratorType(startDecorator)}`)}>
                            {startDecorator}
                        </div>
                    )}
                    <div className={cx('display')}>
                        {files.length === 1 ? (
                            <FileDisplay file={files[0]} />
                        ) : (
                            <div className={cx('placeholder')}>{placeholder}</div>
                        )}
                    </div>
                    <input
                        id={id}
                        type="file"
                        ref={ref}
                        aria-label={label}
                        disabled={disabled}
                        aria-disabled={disabled}
                        defaultValue={defaultValue}
                        onKeyDown={handleKey}
                        onKeyUp={handleKey}
                        onInput={handleInput}
                        {...props}
                    />
                    {endDecorator && (
                        <div className={cx('end-decorator', `type-${getDecoratorType(endDecorator)}`)}>
                            {endDecorator}
                        </div>
                    )}
                </div>
                {files.length > 1 && files.map((f) => <FileDisplay key={f.name} file={f} />)}
            </div>
            {error && (
                <div role="alert" className={cx('error')}>
                    {error}
                </div>
            )}
        </>
    );
}
