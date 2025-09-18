import React from 'react';

import { Dropdown, type DropdownProps } from '@ui/Dropdown';

import cx from './Menu.pcss';

export function Menu({ className, ...props }: DropdownProps) {
    return <Dropdown role="menu" className={cx('Menu', className)} {...props} />;
}
