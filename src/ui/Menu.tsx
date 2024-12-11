import { Dropdown, type DropdownProps } from '@ui/Dropdown';
import React from 'react';
import cx from './Menu.less';

export function Menu({ className, ...props }: DropdownProps) {
    return <Dropdown role="menu" className={cx('Menu', className)} {...props} />;
}
