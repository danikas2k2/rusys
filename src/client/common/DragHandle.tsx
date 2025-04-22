import React, { type HTMLAttributes, type RefAttributes } from 'react';
import DragHandleIcon from '@assets/drag-handle.svg';
import cx from './DragHandle.less';

export interface DragHandleProps extends HTMLAttributes<HTMLDivElement>, RefAttributes<HTMLDivElement> {
    dragging?: boolean;
}

export function DragHandle({ dragging, ...props }: DragHandleProps) {
    return (
        <div role="button" aria-label="Drag" className={cx('DragHandle', { dragging })} {...props}>
            <DragHandleIcon />
        </div>
    );
}
