import DragHandleIcon from '@assets/drag-handle.svg';

import React, { type HTMLAttributes, type RefAttributes } from 'react';

import cx from './DragHandle.pcss';

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
