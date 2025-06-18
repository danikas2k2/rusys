import React, { type JSX } from 'react';
import { FileIcon } from '@ui/FileIcon';
import { formatFileSize } from '~/common/utils/format';
import cx from './FileDisplay.pcss';

export function FileDisplay({ file }: { file: File }): JSX.Element {
    return (
        <div className={cx('FileDisplay')}>
            <div className={cx('icon')}>
                <FileIcon type={file.type} />
            </div>
            <div className={cx('name')}>{file.name}</div>
            <div className={cx('size')}>{formatFileSize(file.size)}</div>
        </div>
    );
}
