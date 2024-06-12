import DragHandleIcon from '@icons/DragHandle.svg';
import React, { forwardRef, type Ref } from 'react';
import cx from './DragHandle.less';

export const DragHandle = forwardRef(function DragHandle({}, ref: Ref<HTMLDivElement>) {
    return (
        <div ref={ref} className={cx('DragHandle')}>
            <DragHandleIcon />
        </div>
    );
});
