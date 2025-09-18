import React from 'react';

import cx from './ValueChange.pcss';

interface ValueChangeProps {
    change: number | boolean;
    position?: 'left' | 'right' | 'top';
}

export function ValueChange({ change, position = 'top' }: ValueChangeProps) {
    return change ? (
        <div
            role="status"
            className={cx('ValueChange', `position-${position}`, {
                positive: change !== true && change > 0,
                negative: change !== true && change < 0,
            })}
        >
            {change === true ? '﹡' : Math.abs(change)}
        </div>
    ) : null;
}
