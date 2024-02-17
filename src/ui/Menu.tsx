import { Dropdown, type DropdownProps, type DropdownRef } from '@ui/Dropdown';
import React, { forwardRef, type Ref } from 'react';
import cx from './Menu.less';

export const Menu = forwardRef(function Menu({ className, ...props }: DropdownProps, ref: Ref<DropdownRef>) {
    return <Dropdown ref={ref} role="menu" className={cx('Menu', className)} {...props} />;
});
