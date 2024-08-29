import DragHandleIcon from '@icons/DragHandle.svg';
import React, { forwardRef, type HTMLAttributes, type Ref } from 'react';
import cx from './DragHandle.less';

interface DragHandleProps extends HTMLAttributes<HTMLDivElement> {
    dragging?: boolean;
}

export const DragHandle = forwardRef(function DragHandle(
    { dragging, ...props }: DragHandleProps,
    ref: Ref<HTMLDivElement>
) {
    return (
        <div ref={ref} className={cx('DragHandle', { dragging })} {...props}>
            <DragHandleIcon />
        </div>
    );
});
