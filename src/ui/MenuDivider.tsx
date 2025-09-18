import React, { type HTMLAttributes } from 'react';

import cx from './MenuDivider.pcss';

export function MenuDivider({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div role="separator" className={cx('MenuDivider', className)} {...props} />;
}
