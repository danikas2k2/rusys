import React, { useCallback, useEffect, useId, useState, type FormEvent } from 'react';

import cs from 'classnames';

import { FileDisplay } from '@ui/FileDisplay';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { Input, type InputProps } from '@ui/Input';

import cx from './FileInput.pcss';

export type FileInputProps = Omit<InputProps, 'mode' | 'value'>;

// TODO add translation context and translate clear button label
export function FileInput({
    ref: forwardedRef,
    id: initialId,
    label,
    placeholder = label,
    className,
    onInput,
    ...props
}: FileInputProps) {
    const ref = useForwardedRef(forwardedRef);

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

    const id = useId();
    return (
        <Input
            ref={ref}
            id={initialId ?? id}
            label={label}
            placeholder={placeholder}
            onInput={handleInput}
            inputDecorator={(children) => (
                <>
                    {!files.length ? (
                        <div className={cx('placeholder')}>{placeholder}</div>
                    ) : (
                        <div className={cx('files')}>
                            {files.map((file, i) => (
                                <FileDisplay key={i} file={file} />
                            ))}
                        </div>
                    )}
                    {children}
                </>
            )}
            contentDecorator={(children) => (
                <>
                    {children}
                    {/*{!!files.length && (
                        <div className={cx('files')}>
                            {files.map((file, i) => (
                                <FileDisplay key={i} file={file} />
                            ))}
                        </div>
                    )}*/}
                </>
            )}
            className={cs(cx('File'), className)}
            {...props}
            type="file"
        />
    );
}
