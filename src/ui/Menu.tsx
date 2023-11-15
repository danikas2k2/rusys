import Dropdown, { type DropdownProps } from '@ui/Dropdown';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { memo } from 'react';
import './Menu.less';

export default memo(function Menu({ className, ...props }: DropdownProps) {
    return <Dropdown role="menu" className={classNames('Menu', className)} {...props} />;
}, isEqual);
