import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { type HTMLAttributes, memo } from 'react';
import './MenuDivider.less';

export default memo(function MenuDivider({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div role="separator" className={classNames('MenuDivider', className)} {...props} />;
}, isEqual);
