import BinaryFileIcon from '@assets/files/binary.svg';
import CodeFileIcon from '@assets/files/code.svg';
import CssFileIcon from '@assets/files/css.svg';
import CsvFileIcon from '@assets/files/csv.svg';
import DocumentFileIcon from '@assets/files/document.svg';
import ExcelFileIcon from '@assets/files/excel.svg';
import FileIcon from '@assets/files/file.svg';
import ImageFileIcon from '@assets/files/image.svg';
import LicenseFileIcon from '@assets/files/license.svg';
import AudioFileIcon from '@assets/files/music.svg';
import PdfFileIcon from '@assets/files/pdf.svg';
import PowerpointFileIcon from '@assets/files/powerpoint.svg';
import VideoFileIcon from '@assets/files/video.svg';
import WordFileIcon from '@assets/files/word.svg';
import ZipperFileIcon from '@assets/files/zipper.svg';

import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { type InputProps } from '@ui/Input';
import { uniqueId } from '@ui/utils/uniqueId';
import React, {
    type FormEvent,
    type FunctionComponent,
    type JSX,
    type KeyboardEvent,
    type SVGProps,
    useCallback,
    useEffect,
    useState,
} from 'react';
import cx from './FileInput.less';

const FileTypes: Record<string, FunctionComponent<SVGProps<SVGSVGElement>>> = {
    '': FileIcon,
    'application/gzip': ZipperFileIcon,
    'application/java-archive': ZipperFileIcon,
    'application/json': CodeFileIcon,
    'application/msword': WordFileIcon,
    'application/pdf': PdfFileIcon,
    'application/pkcs7-mime': LicenseFileIcon,
    'application/pkcs8': LicenseFileIcon,
    'application/pkcs10': LicenseFileIcon,
    'application/pkix-cert': LicenseFileIcon,
    'application/pkix-crl': LicenseFileIcon,
    'application/rar': ZipperFileIcon,
    'application/rtf': DocumentFileIcon,
    'application/vnd.ms-excel': ExcelFileIcon,
    'application/vnd.ms-powerpoint': PowerpointFileIcon,
    'application/vnd.ms-word': WordFileIcon,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': PowerpointFileIcon,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ExcelFileIcon,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': WordFileIcon,
    'application/vnd.rar': ZipperFileIcon,
    'application/x-7z-compressed': ZipperFileIcon,
    'application/x-bzip': ZipperFileIcon,
    'application/x-bzip2': ZipperFileIcon,
    'application/x-freearc': ZipperFileIcon,
    'application/x-gzip': ZipperFileIcon,
    'application/x-pem-file': LicenseFileIcon,
    'application/x-pkcs7-certificates': LicenseFileIcon,
    'application/x-pkcs7-certreqresp': LicenseFileIcon,
    'application/x-pkcs7-crl': LicenseFileIcon,
    'application/x-pkcs12': LicenseFileIcon,
    'application/x-tar': ZipperFileIcon,
    'application/x-x509-ca-cert': LicenseFileIcon,
    'application/x-x509-user-cert': LicenseFileIcon,
    'application/xhtml+xml': CodeFileIcon,
    'application/xml': CodeFileIcon,
    'application/zip': ZipperFileIcon,
    'text/css': CssFileIcon,
    'text/csv': CsvFileIcon,
    'text/html': CodeFileIcon,
    'text/xhtml': CodeFileIcon,
    'text/xml': CodeFileIcon,
    application: BinaryFileIcon,
    audio: AudioFileIcon,
    image: ImageFileIcon,
    text: DocumentFileIcon,
    video: VideoFileIcon,
};

function FileDisplay({ file }: { file: File }): JSX.Element {
    const Icon = FileTypes[file.type] ?? FileTypes[file.type.split('/')[0]] ?? FileTypes[''];
    return (
        <div className={cx('file')}>
            <div className={cx('icon')}>
                <Icon />
            </div>
            <div className={cx('name')}>{file.name}</div>
            <div className={cx('size')}>{file.size}</div>
        </div>
    );
}

export interface FileInputProps extends Omit<InputProps, 'mode' | 'value'> {
    // export interface FileInputProps extends InputProps {
}

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
                    {files.length === 1 ? (
                        <FileDisplay file={files[0]} />
                    ) : (
                        <div className={cx('placeholder')}>{placeholder}</div>
                    )}
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

function getDecoratorType(decorator: React.ReactNode): 'text' | 'node' {
    const type = typeof decorator;
    if (type === 'string' || type === 'number' || type === 'boolean') {
        return 'text';
    }
    return 'node';
}
