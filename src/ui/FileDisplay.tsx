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
import cx from '@ui/FileInput.less';
import React, { type FunctionComponent, JSX, type SVGProps } from 'react';

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

export function FileDisplay({ file }: { file: File }): JSX.Element {
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
